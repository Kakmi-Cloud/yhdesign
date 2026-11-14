/**
 * 访客留言 —— 数据层（双通道分发 + 超时保护）。
 *
 * 同一份构建包会部署到多个入口，留言走哪个后端由运行域名决定：
 *   - *.app.workbuddy.host → WorkBuddy 云 SDK（静态发布，没有边缘函数）
 *   - 其它域名（自定义域名 / EdgeOne）→ 同源 /api/guestbook 边缘函数
 *
 * 两条通道写的是同一张 guestbook_messages 表：任何入口提交的留言，
 * 在任何入口的收件箱里都能读回，不会出现「主站看得到、域名看不到」。
 * 云端实现按需动态加载（import('./guestbookCloud')），非主站访客不必
 * 为首屏背 SDK 体积。任何失败都返回结构化 { ok:false, error, fallback? }，
 * 界面据此给出明确、可操作的提示。
 */
const API = '/api/guestbook'
const MAX_MESSAGE = 500
const MAX_NAME = 40
const MAX_CONTACT = 120
const SUBMIT_TIMEOUT = 12000
const READ_TIMEOUT = 10000

const NET_ERROR = '网络异常，留言没有送达，请稍后重试'

/** 备用入口：留言服务完全不可用时仍可抵达的站内地址。 */
export const PRIMARY_SITE_URL =
  'https://wbapp-fqn8vurenmzjnkpqwdz5i0.app.workbuddy.host/?sharecode=C4MZTHEGVI'

const isWorkBuddyHost = () => {
  try {
    return /(^|\.)app\.workbuddy\.host$/i.test(window.location.hostname)
  } catch {
    return false
  }
}

const TIMEOUT = Symbol('timeout')
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((resolve) => window.setTimeout(() => resolve(TIMEOUT), ms)),
  ])

let cloudMod = null
const cloudChannel = async () => {
  if (!cloudMod) cloudMod = await import('./guestbookCloud')
  return cloudMod
}

/** 边缘函数通道：提交。 */
async function postViaApi({ name, contact, message }) {
  const payload = {
    name: String(name || '').trim().slice(0, MAX_NAME),
    contact: String(contact || '').trim().slice(0, MAX_CONTACT),
    message: String(message || '').trim().slice(0, MAX_MESSAGE),
  }
  if (!payload.message) return { ok: false, error: '留言内容不能为空' }

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.ok) {
    return {
      ok: false,
      error: data?.error || NET_ERROR,
      fallback: PRIMARY_SITE_URL,
    }
  }
  return { ok: true, id: data.id ?? null }
}

/** 边缘函数通道：读取收件箱。 */
async function readViaApi(limit) {
  const res = await fetch(`${API}?limit=${limit}`)
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.ok) {
    return {
      ok: false,
      error: data?.error || '网络异常，暂时读不到留言',
      messages: [],
      fallback: PRIMARY_SITE_URL,
    }
  }
  return { ok: true, messages: Array.isArray(data.messages) ? data.messages : [] }
}

/** 提交一条留言。成功时返回写回的 id（或 null）。 */
export async function submitMessage(payload) {
  try {
    const task = isWorkBuddyHost()
      ? cloudChannel().then((mod) => mod.submitMessage(payload))
      : postViaApi(payload)

    const res = await withTimeout(task, SUBMIT_TIMEOUT)
    if (res === TIMEOUT) {
      return {
        ok: false,
        error: '发送超时，没能确认送达。请检查网络重试',
        fallback: PRIMARY_SITE_URL,
      }
    }
    if (res && typeof res === 'object') return res
    return { ok: false, error: NET_ERROR, fallback: PRIMARY_SITE_URL }
  } catch {
    return { ok: false, error: NET_ERROR, fallback: PRIMARY_SITE_URL }
  }
}

/** 作者收件箱：按时间倒序读取留言。 */
export async function fetchMessages(limit = 100) {
  try {
    const task = isWorkBuddyHost()
      ? cloudChannel().then((mod) => mod.fetchMessages(limit))
      : readViaApi(limit)

    const res = await withTimeout(task, READ_TIMEOUT)
    if (res === TIMEOUT) {
      return {
        ok: false,
        error: '读取超时，请稍后点「刷新留言」重试',
        messages: [],
        fallback: PRIMARY_SITE_URL,
      }
    }
    if (res && typeof res === 'object') return res
    return { ok: false, error: '网络异常，暂时读不到留言', messages: [], fallback: PRIMARY_SITE_URL }
  } catch {
    return { ok: false, error: '网络异常，暂时读不到留言', messages: [], fallback: PRIMARY_SITE_URL }
  }
}
