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

/** 提交一条留言。成功时返回 { ok: true }。 */
export async function submitMessage({ name, contact, message }) {
  const row = {
    visitor_name: String(name || '').trim().slice(0, MAX_NAME) || null,
    contact: String(contact || '').trim().slice(0, MAX_CONTACT) || null,
    message: String(message || '').trim().slice(0, MAX_MESSAGE),
  }
  if (!row.message) return { ok: false, error: '留言内容不能为空' }

  try {
    // 只做 INSERT，不挂 .select('id')：
    // RLS 下 INSERT ... RETURNING 需要额外的 SELECT 策略配合，部分环境会
    // 「行已写入但返回空数组」，旧实现把这种情况误判成失败，访客会看到
    // 「留言没有被保存」但其实留言已经存进去了。写入是否成功以 error 为准。
    const { error } = await cloud.database.from(TABLE).insert(row)
    if (error) return { ok: false, error: friendlyError(error) }
    return { ok: true, id: null }
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
