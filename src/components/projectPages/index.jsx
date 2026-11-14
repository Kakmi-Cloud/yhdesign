/**
 * index.jsx —— 八个独立项目页面的分发器与最小外壳
 *
 * 外壳只负责：返回、项目索引、分区锚点、阅读进度、资料口径页脚、下一项目。
 * 从这里往下，每个项目是一个结构上毫无复用关系的页面组件。
 */
import { useEffect, useRef, useState } from 'react'
import { getDossier } from '../../data/projectDossiers'
import { PAGE_META, nextProjectId } from './meta'
import { LightboxProvider, StatusFooter, useReveal, pad } from './shared'
import P01Xinjing from './P01Xinjing'
import P02Slowwalker from './P02Slowwalker'
import P03InternLamps from './P03InternLamps'
import P04HealingLamps from './P04HealingLamps'
import P05UiFlow from './P05UiFlow'
import P06Chair from './P06Chair'
import P07Concepts from './P07Concepts'
import P08CatIce from './P08CatIce'
import './projectPages.css'
import './pages.css'
import './pages-b.css'

const PAGES = {
  '01': P01Xinjing,
  '02': P02Slowwalker,
  '03': P03InternLamps,
  '04': P04HealingLamps,
  '05': P05UiFlow,
  '06': P06Chair,
  '07': P07Concepts,
  '08': P08CatIce,
}

export default function ProjectPages({ project, allProjects = [], onClose, onSelect }) {
  const id = String(project?.id || '01')
  const meta = PAGE_META[id] || PAGE_META['01']
  const dossier = getDossier(id)
  const Page = PAGES[id] || PAGES['01']
  const rootRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [indexOpen, setIndexOpen] = useState(false)

  useReveal(rootRef, [id])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [id])

  const nextId = nextProjectId(id)
  const next = allProjects.find((p) => String(p.id) === nextId)
  const jump = (anchor) => {
    const el = rootRef.current?.querySelector(`#${anchor}`)
    if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    setIndexOpen(false)
  }

  const t = meta.theme
  const style = {
    '--pp-paper': t.paper,
    '--pp-ink': t.ink,
    '--pp-accent': t.accent,
    '--pp-accent2': t.accent2,
  }

  return (
    <LightboxProvider>
      {/* data-lenis-prevent 不能删：详情页打开时 useLenisLock 会 lenis.stop()，
          而 Lenis 的 stop 会对命中路径上不带此属性的滚轮事件直接 preventDefault
          （lenis.mjs: isStopped → preventDefault）。少了它整页滚轮划不动，
          只剩拖动滚动条和键盘可用。 */}
      <div ref={rootRef} className={`pp-root pp-id-${id}${t.dark ? ' is-dark' : ''}`} style={style} data-lenis-prevent>
        <div className="pp-progress" style={{ transform: `scaleX(${progress})` }} />

        <header className="pp-bar">
          <button type="button" className="pp-back" onClick={onClose} aria-label="返回作品集">
            <span aria-hidden="true">←</span> 返回作品集
          </button>
          <div className="pp-bar-id">
            <b>{id}</b>
            <span>{project?.title}</span>
          </div>
          <nav className="pp-bar-nav" aria-label="本页分区">
            {meta.nav.map(([a, label]) => (
              <button type="button" key={a} onClick={() => jump(a)}>{label}</button>
            ))}
          </nav>
          <button type="button" className={`pp-bar-index${indexOpen ? ' is-open' : ''}`} onClick={() => setIndexOpen((v) => !v)} aria-expanded={indexOpen}>
            项目索引 <i aria-hidden="true">{pad(allProjects.length || 8)}</i>
          </button>
        </header>

        {indexOpen && (
          <div className="pp-index" role="dialog" aria-label="项目索引">
            {allProjects.map((p) => (
              <button
                type="button"
                key={p.id}
                className={String(p.id) === id ? 'is-current' : ''}
                onClick={() => { setIndexOpen(false); onSelect?.(p) }}
              >
                <b>{p.id}</b>
                <span>{p.title}</span>
                <i>{p.category}</i>
              </button>
            ))}
          </div>
        )}

        <main className="pp-body">
          <Page project={project} dossier={dossier} meta={meta} />
        </main>

        <StatusFooter dossier={dossier} id={id} theme={t} />

        {next && (
          <button type="button" className="pp-next" onClick={() => onSelect?.(next)}>
            <span className="pp-next-k">NEXT PROJECT / {next.id}</span>
            <b>{next.title}</b>
            <span className="pp-next-s">{next.subtitle}</span>
            <i aria-hidden="true">↗</i>
          </button>
        )}
      </div>
    </LightboxProvider>
  )
}
