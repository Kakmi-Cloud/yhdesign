/**
 * MobileApp.jsx —— 手机端独立入口（独立于 App.jsx 的桌面骨架）
 *
 * 只组装三块既有实现，不新增任何视觉：
 *   1. 首访层：src/mobile/cards/MobileCardLanding（项目档案牌堆，原有实现）
 *   2. 长页：  ./MobileLongPage（原 App.jsx 里 .mob-* 四段的搬移）
 *   3. 详情页： src/components/projectPages（八个项目各自的独立页面，原有实现）
 *
 * 与主站的区别只有「谁来管状态」：这里没有桌面轮盘、没有 Lenis、没有滤镜筛选，
 * 所以用一个极小的 view 状态机 + History API 就够了，返回键行为与主站一致
 * （详情 → 回到来的那一层，长页 → 回到牌堆）。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import MobileCardLanding from './cards/MobileCardLanding'
import MobileLongPage from './MobileLongPage'
import ProjectPages from '../components/projectPages'
import { PROJECTS } from '../data/portfolioProjects'

const VIEW = { DECK: 'deck', LONG: 'long', DETAIL: 'detail' }

/**
 * 深链：?view=long 直接进长页，?p=03 直接进某个项目的详情页。
 * 与主站的 #p=03 同义，只是独立入口没有 hash 路由，用查询参数更直观，
 * 也方便把单个项目或长页当作一条独立链接发出去。
 */
function readInitialState() {
  if (typeof window === 'undefined') return { view: VIEW.DECK, project: null }
  const qs = new URLSearchParams(window.location.search)
  const id = qs.get('p')
  if (id) {
    const p = PROJECTS.find((x) => String(x.id) === String(id))
    if (p) return { view: VIEW.DETAIL, project: p }
  }
  if (qs.get('view') === 'long') return { view: VIEW.LONG, project: null }
  return { view: VIEW.DECK, project: null }
}

export default function MobileApp() {
  const initial = useRef(readInitialState())
  const [view, setView] = useState(initial.current.view)
  const [detailProject, setDetailProject] = useState(initial.current.project)
  const [landingIndex, setLandingIndex] = useState(0)
  const returnTo = useRef(initial.current.view === VIEW.DETAIL ? VIEW.DECK : VIEW.DECK)

  // 返回键 / 手势返回：把浏览器历史当栈用，不引入路由库
  useEffect(() => {
    const onPop = (e) => {
      const next = e.state && e.state.view
      if (next === VIEW.DETAIL) {
        const id = e.state.id
        const p = PROJECTS.find((x) => String(x.id) === String(id)) || null
        setDetailProject(p)
        setView(p ? VIEW.DETAIL : VIEW.DECK)
        return
      }
      setDetailProject(null)
      setView(next === VIEW.LONG ? VIEW.LONG : VIEW.DECK)
      if (typeof e.state?.index === 'number') setLandingIndex(e.state.index)
    }
    window.addEventListener('popstate', onPop)
    if (!window.history.state) window.history.replaceState({ view: VIEW.DECK }, '')
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const go = useCallback((nextView, state = {}) => {
    window.history.pushState({ view: nextView, ...state }, '')
    setView(nextView)
  }, [])

  const openProject = useCallback((project, index) => {
    if (!project) return
    if (typeof index === 'number') setLandingIndex(index)
    returnTo.current = view
    window.history.pushState({ view: VIEW.DETAIL, id: project.id }, '')
    setDetailProject(project)
    setView(VIEW.DETAIL)
  }, [view])

  const closeDetail = useCallback(() => {
    setDetailProject(null)
    setView(returnTo.current === VIEW.LONG ? VIEW.LONG : VIEW.DECK)
  }, [])

  // 详情页打开时锁住 body 滚动（与原站 useLenisLock 的目的一致）
  useEffect(() => {
    document.body.style.overflow = view === VIEW.DETAIL ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [view])

  return (
    <div className={`mobile-app-shell${view === VIEW.DETAIL ? ' is-detail' : ''}`}>
      {view === VIEW.DECK && (
        <MobileCardLanding
          projects={PROJECTS}
          initialIndex={landingIndex}
          onOpenProject={(p, index) => openProject(p, index)}
          onOpenResume={() => go(VIEW.LONG)}
          onOpenContact={() => go(VIEW.LONG)}
        />
      )}

      {view === VIEW.LONG && (
        <div className="mobile-long-page">
          <MobileLongPage
            projects={PROJECTS}
            onOpenProject={(p) => openProject(p)}
            onOpenDeck={() => go(VIEW.DECK)}
          />
          <div className="mobile-long-back">
            <button type="button" onClick={() => go(VIEW.DECK)}>← 回到项目牌堆</button>
          </div>
        </div>
      )}

      {view === VIEW.DETAIL && detailProject && (
        <ProjectPages
          key={detailProject.id}
          project={detailProject}
          allProjects={PROJECTS}
          onClose={closeDetail}
          onSelect={(p) => setDetailProject(p)}
        />
      )}
    </div>
  )
}
