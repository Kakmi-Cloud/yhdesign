/**
 * 访客留言 —— 数据层（EdgeOne 边缘函数版）。
 *
 * 页面部署在 EdgeOne Pages 上，留言通过同源的 /api/guestbook 边缘函数
 * 读写（KV 存储）。所有访客共享同一份数据，作者在收件箱（?inbox=1）
 * 里能看到全部留言。
 *
 * 所有调用都返回 { ok, ... }，绝不把原始 error / 行数据抛到界面或日志里。
 */
const API = '/api/guestbook'
const MAX_MESSAGE = 500
const MAX_NAME = 40
const MAX_CONTACT = 120

const NET_ERROR = '网络异常，留言没有送达，请稍后重试'

/** 提交一条留言。成功时返回写回的 id。 */
export async function submitMessage({ name, contact, message }) {
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
