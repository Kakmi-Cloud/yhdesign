// 访客留言 API —— EdgeOne 边缘函数（统一云端 REST 代理）
//
// 路由：GET /api/guestbook  → 收件箱读取（按时间倒序）
//       POST /api/guestbook → 提交一条留言
//
// 为什么改：原实现只认 KV 绑定 guestbook_kv，而本项目未绑定（该绑定只能在
// 控制台完成）。自定义域名 / 预览域名下一律返回 503 KV_NOT_BOUND，提交、
// 保存、展示全部断开，失败提示还把访客赶去主站。
// 现在统一代理到 guestbook_messages 表：主站走 SDK、自定义域名走本函数，
// 两端写同一张表，任何入口的收件箱都能读到全部留言。
//
// 服务端到服务端调用，不携带浏览器 Origin；使用公开 publishableKey +
// RLS（anon 仅 SELECT / INSERT），不涉及任何管理员凭据。
// V8 运行时：只用 Web 标准 API，无 Node 内置模块。

const REST_URL =
  'https://wbapp-fqn8vurenmzjnkpqwdz5i0.app.workbuddy.host/.cloud/database/rest/guestbook_messages'
// 与 src/cloudPublicConfig.js 的 publishableKey 保持一致（公开值，可放前端）
const ACCESS_KEY =
  'wbpk_fQN8VuRENMzJnKPqWdZ5I0_y6gTz6GDbfq4RBSr7kGcr36hHVZtIN2R'
const SELECT_FIELDS = 'id,visitor_name,contact,message,created_at'
const MAX_MESSAGE = 500
const MAX_NAME = 40
const MAX_CONTACT = 120
const MAX_STORE = 500
const LIMIT_DEFAULT = 100
const DUPE_WINDOW_MS = 60 * 1000
const UPSTREAM_TIMEOUT = 8000

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=UTF-8' },
  })

/** 去掉控制字符、收敛空白、限长。 */
const clean = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

const upstreamError = () =>
  json({ ok: false, code: 'UPSTREAM_ERROR', error: '留言服务暂时不可用，请稍后重试' }, 502)

/** 带超时的上游请求。网络/解析异常收敛成 null，由调用方给出明确提示。 */
async function callRest(path, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT)
  try {
    const res = await fetch(`${REST_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'x-wb-webapp-access-key': ACCESS_KEY,
        'content-type': 'application/json',
        ...(init.headers || {}),
      },
    })
    if (!res.ok) {
      return { ok: false, status: res.status, body: await res.text().catch(() => '') }
    }
    const text = await res.text()
    return { ok: true, status: res.status, data: text ? JSON.parse(text) : null }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

const friendlyWriteError = (r) => {
  const raw = String(r?.body || '')
  if (raw.includes('23505')) return '这条留言已经提交过了'
  if (raw.includes('42501') || r?.status === 401 || r?.status === 403) {
    return '提交被拒绝，请稍后再试'
  }
  return '留言没有被保存，请稍后重试'
}

export async function onRequestGet({ request }) {
  let limit = LIMIT_DEFAULT
  try {
    const asked = Number(new URL(request.url).searchParams.get('limit'))
    if (asked > 0) limit = Math.min(asked, MAX_STORE)
  } catch {
    // 查询串异常时用默认值，不影响读取
  }

  const r = await callRest(`?select=${SELECT_FIELDS}&order=created_at.desc&limit=${limit}`)
  if (!r || !r.ok) {
    return json({ ok: false, code: 'UPSTREAM_ERROR', error: '暂时读不到留言，请稍后点「刷新留言」重试', messages: [] }, 502)
  }
  return json({ ok: true, messages: Array.isArray(r.data) ? r.data : [] })
}

export async function onRequestPost({ request }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: '请求格式错误' }, 400)
  }

  const message = clean(body?.message, MAX_MESSAGE)
  if (!message) return json({ ok: false, error: '留言内容不能为空' }, 400)

  // 轻量防刷：60 秒内提交相同内容直接拒绝（沿用原 KV 版规则）
  const recent = await callRest('?select=message,created_at&order=created_at.desc&limit=1')
  if (recent?.ok && Array.isArray(recent.data) && recent.data[0]) {
    const last = recent.data[0]
    if (
      last.message === message &&
      Date.now() - new Date(last.created_at).getTime() < DUPE_WINDOW_MS
    ) {
      return json({ ok: false, error: '这条留言已经提交过了' }, 409)
    }
  }

  const row = {
    visitor_name: clean(body?.name, MAX_NAME) || null,
    contact: clean(body?.contact, MAX_CONTACT) || null,
    message,
  }
  const r = await callRest('', {
    method: 'POST',
    body: JSON.stringify(row),
    headers: { Prefer: 'return=minimal' },
  })
  if (!r) return upstreamError()
  if (!r.ok) return json({ ok: false, error: friendlyWriteError(r) }, 502)
  return json({ ok: true, id: null })
}
