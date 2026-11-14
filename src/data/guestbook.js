/**
 * 访客留言 —— 数据层（双通道分发）。
 *
 * 同一份构建包会部署到两个平台，留言走哪个后端由运行域名决定：
 *   - *.app.workbuddy.host → WorkBuddy 云数据库（guestbook_messages 表，RLS）
 *   - 其他域名（EdgeOne Pages 等）→ 同源 /api/guestbook 边缘函数（KV 存储）
 *
 * 云端实现按需动态加载（import('./guestbookCloud')），EdgeOne 访客
 * 不需要为 WorkBuddy SDK 付出首屏体积。
 *
 * 所有调用都返回 { ok, ... }，绝不把原始 error / 行数据抛到界面或日志里。
 */
const API = '/api/guestbook'
const MAX_MESSAGE = 500
const MAX_NAME = 40
const MAX_CONTACT = 120

const NET_ERROR = '网络异常，留言没有送达，请稍后重试'

/** 是否运行在 WorkBuddy 发布域名上（只有那里才允许访问 WorkBuddy 云端）。 */
const isWorkBuddyHost = () => {
  try {
    return /(^|\.)app\.workbuddy\.host$/i.test(window.location.hostname)
  } catch {
    return false
  }
}

let cloudMod = null
const cloudChannel = async () => {
  if (!cloudMod) cloudMod = await import('./guestbookCloud')
  return cloudMod
}

/** 提交一条留言。成功时返回写回的 id。 */
export async function submitMessage({ name, contact, message }) {
  if (isWorkBuddyHost()) {
    try {
      const mod = await cloudChannel()
      return await mod.submitMessage({ name, contact, message })
    } catch {
      return { ok: false, error: NET_ERROR }
    }
  }

  const payload = {
    name: String(name || '').trim().slice(0, MAX_NAME),
    contact: String(contact || '').trim().slice(0, MAX_CONTACT),
    message: String(message || '').trim().slice(0, MAX_MESSAGE),
  }
  if (!payload.message) return { ok: false, error: '留言内容不能为空' }

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.ok) {
      return { ok: false, error: data?.error || NET_ERROR }
    }
    return { ok: true, id: data.id ?? null }
  } catch {
    return { ok: false, error: NET_ERROR }
  }
}

/** 作者收件箱：按时间倒序读取留言。 */
export async function fetchMessages(limit = 100) {
  if (isWorkBuddyHost()) {
    try {
      const mod = await cloudChannel()
      return await mod.fetchMessages(limit)
    } catch {
      return { ok: false, error: '网络异常，暂时读不到留言', messages: [] }
    }
  }

  try {
    const res = await fetch(`${API}?limit=${limit}`)
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.ok) {
      return { ok: false, error: data?.error || '网络异常，暂时读不到留言', messages: [] }
    }
    return { ok: true, messages: Array.isArray(data.messages) ? data.messages : [] }
  } catch {
    return { ok: false, error: '网络异常，暂时读不到留言', messages: [] }
  }
}
