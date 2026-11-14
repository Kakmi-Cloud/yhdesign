// 访客留言 API —— EdgeOne 边缘函数 + KV 存储
//
// 路由：GET /api/guestbook  → 收件箱读取（最近 LIMIT 条，新→旧）
//       POST /api/guestbook → 访客提交一条留言
//
// KV 绑定（在 EdgeOne Pages 控制台完成）：
//   1. KV 存储 → 开通 → 创建命名空间（如 guestbook）
//   2. 项目 yhdesign → 绑定该命名空间，变量名必须是 guestbook_kv
//
// 存储结构：单键 messages 存 JSON 数组（新→旧），最多保留 500 条。
// V8 运行时：没有 Node 内置模块，只能用 Web 标准 API。

const KEY = 'messages'
const MAX_STORE = 500 // KV 里最多保留多少条
const LIMIT_DEFAULT = 100 // GET 默认返回多少条
const MAX_MESSAGE = 500
const MAX_NAME = 40
const MAX_CONTACT = 120
const DUPE_WINDOW_MS = 60 * 1000 // 60 秒内同内容视为重复提交

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

// KV 没绑定时全局变量不存在。不要吞进笼统的 500，明确回一个
// 「服务未开通」状态码，前端才能给出可操作的提示（去主站留言）。
const hasKV = () => typeof guestbook_kv !== 'undefined'
const KV_MISSING = () =>
  json({ ok: false, code: 'KV_NOT_BOUND', error: '这个入口的留言存储还没开通' }, 503)

const readList = async () => {
  const raw = await guestbook_kv.get(KEY)
  if (!raw) return []
  const list = JSON.parse(raw)
  return Array.isArray(list) ? list : []
}

export async function onRequestGet({ request }) {
  if (!hasKV()) return KV_MISSING()
  try {
    const limit = Math.min(Number(new URL(request.url).searchParams.get('limit')) || LIMIT_DEFAULT, MAX_STORE)
    const list = await readList()
    return json({ ok: true, messages: list.slice(0, limit) })
  } catch {
    return json({ ok: false, error: '留言服务暂时不可用，请稍后再试' }, 500)
  }
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
  if (!hasKV()) return KV_MISSING()

  try {
    const list = await readList()

    // 轻量防刷：60 秒内提交相同内容直接拒绝
    const last = list[0]
    if (
      last &&
      last.message === message &&
      Date.now() - new Date(last.created_at).getTime() < DUPE_WINDOW_MS
    ) {
      return json({ ok: false, error: '这条留言已经提交过了' }, 409)
    }

    const row = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      visitor_name: clean(body?.name, MAX_NAME) || null,
      contact: clean(body?.contact, MAX_CONTACT) || null,
      message,
      created_at: new Date().toISOString(),
    }
    list.unshift(row)
    await guestbook_kv.put(KEY, JSON.stringify(list.slice(0, MAX_STORE)))
    return json({ ok: true, id: row.id })
  } catch {
    return json({ ok: false, error: '留言没有被保存，请稍后重试' }, 500)
  }
}
