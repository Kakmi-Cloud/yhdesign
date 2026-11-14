import { useCallback, useEffect, useState } from 'react'
import { fetchMessages, submitMessage } from '../data/guestbook'
import './guestbook.css'

/**
 * 访客留言（云端版）
 *
 * 两种形态，由 URL 参数决定，DOM 里只渲染其中一种：
 *   · 默认        —— 访客提交表单。只显示「已送达」，不展示别人的留言。
 *   · ?inbox=1    —— 作者收件箱，列出云端全部留言（时间 / 昵称 / 联系方式 / 内容）。
 *
 * 所有入口共用同一张留言表：主站走云 SDK，自定义域名走同源边缘函数代理。
 * 失败时一定给出明确提示 + 可点的备用入口，不会静默失败、也不会假装成功。
 */
const isInboxMode = () => {
  try {
    return new URLSearchParams(window.location.search).get('inbox') === '1'
  } catch {
    return false
  }
}

const formatTime = (value) => {
  try {
    return new Date(value).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return String(value || '')
  }
}

function InboxView({ rows, loading, error, onReload, fallback }) {
  // 去掉 inbox 参数回到作品集，保留 sharecode 等其它查询串
  const backHref = (() => {
    try {
      const u = new URL(window.location.href)
      u.searchParams.delete('inbox')
      u.hash = ''
      return u.pathname + u.search
    } catch {
      return '/'
    }
  })()

  return (
    <section className="gb-card gb-card--inbox" aria-label="访客留言收件箱">
      <a className="gb-back" href={backHref}>← 回到作品集</a>
      <header className="gb-head">
        <span className="gb-kicker">INBOX · 作者视图</span>
        <h3 className="gb-title">访客留言收件箱</h3>
        <p className="gb-lede">这里是云端留言，只有打开收件箱链接才会列出。共 {rows.length} 条。</p>
      </header>

      <div className="gb-inbox-bar">
        <button type="button" className="gb-btn gb-btn--ghost" onClick={onReload} disabled={loading}>
          {loading ? '读取中…' : '刷新留言'}
        </button>
      </div>

      {error ? (
        <p className="gb-notice gb-notice--err" role="status">
          {error}
          {fallback ? <a className="gb-fallback" href={fallback}>备用入口：主站 ↗</a> : null}
        </p>
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <p className="gb-empty">还没有收到留言。有新留言时刷新这里就能看到。</p>
      ) : null}

      <ul className="gb-list">
        {rows.map((row) => (
          <li key={row.id} className="gb-item">
            <div className="gb-item-top">
              <b className="gb-item-name">{row.visitor_name || '匿名访客'}</b>
              <time className="gb-item-time">{formatTime(row.created_at)}</time>
            </div>
            {row.contact ? <p className="gb-item-contact">联系方式：{row.contact}</p> : null}
            <p className="gb-item-text">{row.message}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Guestbook({ compact = false }) {
  const [inbox] = useState(isInboxMode)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [inboxFallback, setInboxFallback] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    setInboxFallback('')
    const res = await fetchMessages(100)
    if (res.ok) setRows(res.messages)
    else {
      setLoadError(res.error)
      setInboxFallback(res.fallback || '')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (inbox) reload()
  }, [inbox, reload])

  // 收件箱在长页最底部（约 6000px）。打开 ?inbox=1 时自动滚过去，
  // 否则作者只会看到首屏、以为没有留言。长页里可能挂了两个实例
  // （桌面 page-shell / 手机 mob-contact），只滚动当前真正可见的那个。
  // 上方图片懒加载会不断撑高页面，一次定位会被挤偏：320ms 先滚一次，
  // 1500ms 再滚一次，window.load 后兜底一次。
  useEffect(() => {
    if (!inbox) return
    const scrollNow = () => {
      const cards = [...document.querySelectorAll('.gb-card--inbox')]
      const visible = cards.find((el) => el.offsetParent !== null)
      if (visible) visible.scrollIntoView({ block: 'start', behavior: 'auto' })
    }
    const t1 = window.setTimeout(scrollNow, 320)
    const t2 = window.setTimeout(scrollNow, 1500)
    const onLoad = () => window.setTimeout(scrollNow, 200)
    window.addEventListener('load', onLoad)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('load', onLoad)
    }
  }, [inbox])

  if (inbox) {
    return (
      <div className="gb-wrap">
        <InboxView rows={rows} loading={loading} error={loadError} onReload={reload} fallback={inboxFallback} />
      </div>
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!message.trim()) {
      setNotice({ type: 'err', text: '留言内容不能为空' })
      return
    }
    setNotice(null)
    setBusy(true)
    const res = await submitMessage({ name, contact, message })
    setBusy(false)
    if (res.ok) {
      setNotice({ type: 'ok', text: '已送达，谢谢你！我能看到这条留言。' })
      setName('')
      setContact('')
      setMessage('')
    } else {
      setNotice({ type: 'err', text: res.error, fallback: res.fallback || '' })
    }
  }

  return (
    <div className="gb-wrap">
      <section className={`gb-card${compact ? ' gb-card--compact' : ''}`} aria-label="给我留言">
        <header className="gb-head">
          <span className="gb-kicker">MESSAGE · 云端直达</span>
          <h3 className="gb-title">给我留言</h3>
          <p className="gb-lede">
            看过作品想说点什么？留句话吧。留言会直接发到云端，我能看到，不会只留在你自己的浏览器里。
          </p>
        </header>

        <form className="gb-form" onSubmit={onSubmit}>
          <div className="gb-row">
            <label className="gb-field">
              <span>怎么称呼你 <i>（选填）</i></span>
              <input
                type="text"
                value={name}
                maxLength={40}
                placeholder="匿名访客"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="gb-field">
              <span>联系方式 <i>（选填，方便我回复）</i></span>
              <input
                type="text"
                value={contact}
                maxLength={120}
                placeholder="邮箱 / 微信 / 其它"
                onChange={(e) => setContact(e.target.value)}
              />
            </label>
          </div>
          <label className="gb-field">
            <span>想说的话</span>
            <textarea
              value={message}
              maxLength={500}
              rows={4}
              placeholder="写点什么都可以，建议、合作、或者只是一句招呼～"
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          <div className="gb-foot">
            <span className="gb-count">{message.length} / 500</span>
            <button type="submit" className="gb-btn" disabled={busy}>
              {busy ? '发送中…' : '发送留言 ↗'}
            </button>
          </div>

          {notice ? (
            <p className={`gb-notice ${notice.type === 'ok' ? 'gb-notice--ok' : 'gb-notice--err'}`} role="status">
              {notice.text}
              {notice.fallback ? (
                <a className="gb-fallback" href={notice.fallback}>备用入口：主站 ↗</a>
              ) : null}
            </p>
          ) : null}
        </form>
      </section>
    </div>
  )
}
