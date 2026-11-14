import { cloud } from '../cloudClient'

/**
 * 访客留言 —— 云端数据层。
 *
 * 与之前的本地版不同：留言写进云数据库 guestbook_messages，所有访客共享同一份数据，
 * 作者在收件箱（?inbox=1）里能看到全部留言。表上开了 RLS，只允许匿名/登录用户
 * SELECT + INSERT，不开放 UPDATE / DELETE，访客改不了别人留下的内容。
 *
 * 所有调用都返回 { ok, ... }，绝不把原始 error / 行数据抛到界面或日志里。
 */
const TABLE = 'guestbook_messages'
const MAX_MESSAGE = 500
const MAX_NAME = 40
const MAX_CONTACT = 120

function friendlyError(error) {
  const code = error?.code
  if (code === '42P01') return '留言服务还没准备好，请稍后再试'
  if (code === '42501') return '提交被拒绝，请稍后再试'
  if (code === '23505') return '这条留言已经提交过了'
  // 网关层拒绝（Origin 不匹配 / 环境未就绪）与网络断开都归到这一类
  return '网络异常，留言没有送达，请稍后重试'
}

/** 提交一条留言。成功时返回写回的 id。 */
export async function submitMessage({ name, contact, message }) {
  const row = {
    visitor_name: String(name || '').trim().slice(0, MAX_NAME) || null,
    contact: String(contact || '').trim().slice(0, MAX_CONTACT) || null,
    message: String(message || '').trim().slice(0, MAX_MESSAGE),
  }
  if (!row.message) return { ok: false, error: '留言内容不能为空' }

  try {
    const { data, error } = await cloud.database
      .from(TABLE)
      .insert(row)
      .select('id')
    if (error) return { ok: false, error: friendlyError(error) }
    // 写回空数组 = RLS 拦下了写入，不能当成成功
    if (!Array.isArray(data) || data.length === 0) {
      return { ok: false, error: '留言没有被保存，请稍后重试' }
    }
    return { ok: true, id: data[0]?.id ?? null }
  } catch {
    return { ok: false, error: '网络异常，留言没有送达，请稍后重试' }
  }
}

/** 作者收件箱：按时间倒序读取留言。 */
export async function fetchMessages(limit = 100) {
  try {
    const { data, error } = await cloud.database
      .from(TABLE)
      .select('id, visitor_name, contact, message, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return { ok: false, error: friendlyError(error), messages: [] }
    return { ok: true, messages: Array.isArray(data) ? data : [] }
  } catch {
    return { ok: false, error: '网络异常，暂时读不到留言', messages: [] }
  }
}
