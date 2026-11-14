/**
 * shared.jsx —— 八个独立页面共用的「最小外壳零件」
 *
 * 只共享：资源路径、入场揭示、灯箱、章节标题、资料口径页脚。
 * 页面主体（分区、结构、装置、栅格）一律不共享，全在各自 Pxx 组件里。
 */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { asset } from '../../assetPath'
import { GLOBAL_NOTE } from '../../data/projectDossiers'

export const A = (p) => asset(p)
export const pad = (n) => String(n).padStart(2, '0')

/* ── 灯箱：任意页面的图片都可放大，焦点归还由原生 button 保证 ─────── */
const LightboxCtx = createContext(null)

export function LightboxProvider({ children }) {
  const [item, setItem] = useState(null)
  const lastFocus = useRef(null)

  useEffect(() => {
    if (!item) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setItem(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item])

  const open = (v) => { lastFocus.current = document.activeElement; setItem(v) }
  const close = () => { setItem(null); lastFocus.current?.focus?.() }

  return (
    <LightboxCtx.Provider value={open}>
      {children}
      {item && (
        <div className="pp-lightbox" role="dialog" aria-modal="true" aria-label="图片放大" onClick={close}>
          <div className="pp-lightbox-in" onClick={(e) => e.stopPropagation()}>
            <img src={item.src} alt={item.alt} />
            <div className="pp-lightbox-cap">
              <span>{item.alt}</span>
              <button type="button" onClick={close} aria-label="关闭放大图">关闭 ✕</button>
            </div>
          </div>
        </div>
      )}
    </LightboxCtx.Provider>
  )
}

export function Zoomable({ src, alt, className = '', children, eager = false }) {
  const open = useContext(LightboxCtx)
  return (
    <button
      type="button"
      className={`pp-zoom ${className}`}
      onClick={() => open({ src, alt })}
      aria-label={`放大查看：${alt}`}
    >
      {children || <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} draggable="false" />}
    </button>
  )
}

/* ── 入场揭示：reduce 下全部直接可见 ───────────────────────────────
   实现要点：标记用 data-revealed「属性」而不是 .is-in「class」。
   原因：React 重渲染时会把整个 class 属性重写（如 sw-stage → sw-stage is-on），
   观察器加进去的 .is-in 会被一并抹掉，元素随即回到 opacity:0 —— 表现为
   「点击后按钮消失」。data-* 属性 React 不管理，重写 class 不会碰它。
   MutationObserver 兜底登记后挂载的节点（key 切换重挂载的场景）。 */
export function useReveal(rootRef, deps = []) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const pending = () => Array.from(root.querySelectorAll('[data-reveal]:not([data-revealed])'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pending().forEach((e) => e.setAttribute('data-revealed', ''))
      return undefined
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.setAttribute('data-revealed', ''); io.unobserve(en.target) }
      })
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 })
    const scan = () => pending().forEach((e) => io.observe(e))
    scan()
    const mo = new MutationObserver(() => scan())
    mo.observe(root, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* ── 章节头：每个页面自己决定编号与排版，这里只是最小骨架 ───────── */
export function SectionHead({ n, cn, en, note, aside, tone = '' }) {
  return (
    <header className={`pp-sec-head ${tone}`} data-reveal>
      <div className="pp-sec-head-l">
        <span className="pp-sec-n">{n}</span>
        <h2>{cn}</h2>
        {en && <span className="pp-sec-en">{en}</span>}
      </div>
      <div className="pp-sec-head-r">
        {note && <p>{note}</p>}
        {aside}
      </div>
    </header>
  )
}

/* ── 带图注的图：图注必须显性渲染，不藏在 alt 里 ─────────────────── */
export function Figure({ src, alt, cap, index, className = '', fit = 'cover', eager = false, zoom = true }) {
  const img = <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} draggable="false" style={{ objectFit: fit }} />
  return (
    <figure className={`pp-fig ${className}`} data-reveal>
      <div className="pp-fig-frame">
        {zoom ? <Zoomable src={src} alt={alt} eager={eager}>{img}</Zoomable> : img}
        {index && <span className="pp-fig-idx">{index}</span>}
      </div>
      <figcaption>{cap || alt}</figcaption>
    </figure>
  )
}

/* ── 资料口径页脚：状态 / 已确认成果 / 证据 / 边界 / 全局说明 ─────── */
export function StatusFooter({ dossier, id, theme }) {
  if (!dossier) return null
  return (
    <footer className="pp-status" id="pp-status" data-reveal>
      <div className="pp-status-top">
        <span className="pp-status-tag">PROJECT {id} / 资料与进展</span>
        <b>{dossier.status.label}</b>
      </div>
      <div className="pp-status-grid">
        <div>
          <h4>进展说明</h4>
          <p>{dossier.status.note}</p>
          {dossier.build?.confirmed && <p className="pp-status-confirm">{dossier.build.confirmed}</p>}
          <h4>阶段记录</h4>
          <ol className="pp-status-stages">
            {(dossier.build?.stages || []).map((s, i) => <li key={s}><i>{pad(i + 1)}</i>{s}</li>)}
          </ol>
        </div>
        <div>
          <h4>资料来源与证据</h4>
          <ul className="pp-status-ev">
            {(dossier.evidence || []).map((e) => (
              <li key={e.label}><b>{e.label}</b><span>{e.text}</span></li>
            ))}
            <li><b>课题归属</b><span>{dossier.origin}</span></li>
          </ul>
        </div>
        <div>
          <h4>表述边界</h4>
          <p className="pp-status-caveat">{dossier.caveat}</p>
          <p className="pp-status-caveat">{GLOBAL_NOTE.caveat}</p>
          <p className="pp-status-feas">{GLOBAL_NOTE.feasibility}</p>
        </div>
      </div>
    </footer>
  )
}

/* ── 小型数值牌：只用于真实存在的数字 ───────────────────────────── */
export function Metric({ value, label, note }) {
  return (
    <div className="pp-metric">
      <b>{value}</b>
      <span>{label}</span>
      {note && <i>{note}</i>}
    </div>
  )
}
