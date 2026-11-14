import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useLenisLock } from '../SmoothScroll'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { normalizeDesktopProjects } from './desktopProjectsManifest'
import './retro-desktop.css'

/* 2026-11-14：移除「访客留言簿」应用与图标。
   本地留言墙只存在访客自己的浏览器里，作者看不到；云端版需开启数据库服务，
   用户此前已拒绝。桌面 OS 恢复成纯项目工作台。 */

/**
 * 复古桌面 OS 入口门控。
 *
 * 为什么做成「门控」而不是「长页顶部加一屏桌面」：
 * 桌面模式里有窗口拖拽、方向键移动窗口、底部固定任务栏，而底下那张长页有
 * Lenis 惯性滚动 + 8×78vh 的 sticky 轮盘舞台 —— 两者同屏纵向拼接时，
 * 滚轮、方向键与焦点会互相抢。所以这里让它们**互斥**：
 * 宽屏默认进桌面模式，长页仍然照常挂载（详情页浮层 z-[200] 在桌面 z-150 之上，
 * 所以从窗口里点「查看完整项目详情」能直接压在上面弹出），只是被桌面盖住并锁死滚动。
 *
 * 降级出口（任何一条命中都不进桌面）：
 *   · 视口 < 1024px（移动端有自己的一套全屏卡组）
 *   · URL 带 ?plain=1（想强制看长页；?plain=0 可强制回桌面并清掉记忆）
 *   · prefers-reduced-motion: reduce
 *   · localStorage['yh_portfolio_plain_mode'] === '1'（用户点过「退出桌面模式」）
 */
const PLAIN_KEY = 'yh_portfolio_plain_mode'
/** 旧版「永久记住」键：现在只用来把老访客平滑迁移到 30 天记忆 */
const INTRO_KEY = 'yh_desktop_intro_seen'
/**
 * 首访引导条的记忆键（Gemini 第 5 轮：不要永久关闭，静默 30 天）。
 * 永久关闭的坏处是「关一次 = 以后再也见不到这个功能」；
 * 30 天足够长到不烦人，又短到回头客还会再看见一次。
 */
const RIBBON_KEY = 'yh_os_ribbon_dismissed_until'
const RIBBON_MS = 30 * 24 * 60 * 60 * 1000
/** 顶栏常驻键与长页里的任何入口都派发这个事件，由门控统一处理（避免把状态提到 App 里） */
const ENTER_EVENT = 'yh:enter-desktop-mode'
/**
 * 引导条是否该出现：没关过 → 出现；关过 → 看 30 天是否到期。
 * 老键（INTRO_KEY='1'）迁移成「从现在起 30 天」，避免老访客因为旧记忆永远看不到新引导条。
 */
function readRibbonVisible() {
  if (typeof window === 'undefined') return false
  try {
    const ls = window.localStorage
    const raw = ls.getItem(RIBBON_KEY)
    if (raw) return Number(raw) <= Date.now()
    if (ls.getItem(INTRO_KEY) === '1') {
      ls.setItem(RIBBON_KEY, String(Date.now() + RIBBON_MS))
      return false
    }
    return true
  } catch {
    return false
  }
}

function readPlainPreference() {
  if (typeof window === 'undefined') return true
  try {
    const q = new URLSearchParams(window.location.search).get('plain')
    if (q === '1') return true
    if (q === '0') {
      window.localStorage.removeItem(PLAIN_KEY)
      return false
    }
    return window.localStorage.getItem(PLAIN_KEY) === '1'
  } catch {
    return false
  }
}

export function DesktopOSGate({ projects, onOpenProject, children }) {
  const isWide = useMediaQuery('(min-width: 1024px)')
  const reduceMotion = useReducedMotion()
  const [plain, setPlain] = useState(readPlainPreference)
  const [ribbonVisible, setRibbonVisible] = useState(readRibbonVisible)
  // 引导条紧贴 sticky header 的下沿：高度实测，不写死 72px
  const [ribbonTop, setRibbonTop] = useState(72)
  // 左下角胶囊的「方向感知」状态：向下滚收起、向上滚浮现、页脚附近隐藏
  const [pillHidden, setPillHidden] = useState(false)
  // 桌面模式只在宽屏存在（第 7 轮决策 1：手机端不再有第二个「表面」）。
  // 2026-xx 修复：这里曾漏掉 isWide，导致 414px 手机上 .os-desktop-root（z-150、
  // position:fixed、不透明底、pointer-events:auto）整屏盖住手机端首访层 .ms-overlay，
  // 真实手指点击全部被桌面 OS 吃掉（JS .click() 不走命中测试，所以此前自动化没抓到）。
  // 收件箱（?inbox=1）是作者看留言的直达页：不能再让桌面 OS 全屏盖住长页，
  // 否则打开链接只看到桌面、找不到留言列表。
  const inboxMode = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('inbox') === '1'
  const active = !plain && !reduceMotion && isWide && !inboxMode

  // 锁定背景惯性滚动（同时窗口内部靠 data-lenis-prevent 放行，见 retro-desktop.css 的说明）
  useLenisLock(active)

  useEffect(() => {
    const root = document.documentElement
    if (active) root.classList.add('yh-os-mode')
    else root.classList.remove('yh-os-mode')
    return () => root.classList.remove('yh-os-mode')
  }, [active])

  const exitToPlain = useCallback(() => {
    try {
      window.localStorage.setItem(PLAIN_KEY, '1')
    } catch {
      /* 隐私模式下写不进去也不影响本次会话 */
    }
    setPlain(true)
  }, [])

  // —— 回到桌面模式的入口 ——
  // 之前退出桌面模式是"单向门"：写进 localStorage 后长页里没有任何 UI 能回来，
  // 只能手改 ?plain=0 或清 localStorage。
  //
  // 用户后来反馈「桌面模式太过不显眼」（原来只有右下角一个 96×33 的白底胶囊，
  // 他没注意到、以为功能坏了），所以现在做三层曝光（Gemini 第 5 轮定稿）：
  //   ① 顶栏常驻键（App.jsx 的 header 里，派发 ENTER_EVENT 到这里；sticky，滚到哪都在）
  //   ② Header 下沿的首访引导条（top = header 高度、z-48；暖酸纸 + 黑橙斜纹，
  //      刻意不贴 bottom，避免被当成 Cookie 同意条而无脑关掉）
  //   ③ 左下浮动胶囊（引导条静默后的常驻兜底，方向感知）
  const dismissRibbon = useCallback(() => {
    try {
      window.localStorage.setItem(RIBBON_KEY, String(Date.now() + RIBBON_MS))
    } catch {
      /* 隐私模式写不进去也不影响本次会话 */
    }
    setRibbonVisible(false)
  }, [])

  // 引导条位置 = sticky header 的实测高度
  useEffect(() => {
    if (!ribbonVisible) return
    const measure = () => {
      const h = document.querySelector('header')
      setRibbonTop(h ? Math.round(h.getBoundingClientRect().height) : 72)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ribbonVisible])

  // 胶囊方向感知：首屏常驻 → 向下滚收起 → 向上滚立刻回来 → 页脚附近让位
  useEffect(() => {
    if (active || !isWide || reduceMotion || ribbonVisible) return
    let last = window.scrollY
    const nearBottom = () =>
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 140
    const onScroll = () => {
      const y = window.scrollY
      const dy = y - last
      last = y
      if (nearBottom()) setPillHidden(true)
      else if (y <= 220) setPillHidden(false)
      else if (dy > 12) setPillHidden(true)
      else if (dy < -8) setPillHidden(false)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [active, isWide, reduceMotion, ribbonVisible])

  const enterDesktop = useCallback(() => {
    try {
      window.localStorage.removeItem(PLAIN_KEY)
    } catch {
      /* 同上 */
    }
    // 网址上如果还挂着 ?plain=1，一并清掉，否则刷新又被打回长页
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.has('plain')) {
        url.searchParams.delete('plain')
        window.history.replaceState({}, '', url.pathname + url.search + url.hash)
      }
    } catch {
      /* 老浏览器/沙箱里 URL 不可用时忽略 */
    }
    dismissRibbon()
    setPlain(false)
  }, [dismissRibbon])

  // 顶栏那个键不在门控的 DOM 子树里（它在 header 里），用自定义事件接回状态
  useEffect(() => {
    const onEnter = () => enterDesktop()
    window.addEventListener(ENTER_EVENT, onEnter)
    return () => window.removeEventListener(ENTER_EVENT, onEnter)
  }, [enterDesktop])

  return (
    <>
      {children}
      {active && (
        <RetroDesktopOS
          projects={projects}
          onOpenProject={onOpenProject}
          onExit={exitToPlain}
        />
      )}
      {/* 只有"宽屏 + 没开减少动效 + 当前不在桌面模式 + 不是收件箱"时才给入口 */}
      {!active && isWide && !reduceMotion && !inboxMode && (
        <>
          {ribbonVisible && (
            <aside
              className="os-intro"
              style={{ top: ribbonTop }}
              role="region"
              aria-label="桌面模式介绍"
              data-desktop-intro="true"
              data-os-ribbon="true"
            >
              <span className="os-intro-mark" aria-hidden="true" />
              <div className="os-intro-body">
                <span className="os-intro-kicker">ISSUE.OS // 交互工作台</span>
                <p className="os-intro-text">
                  本站提供「复古桌面<b>OS</b>」工作台，可多窗口检视项目
                </p>
              </div>
              <div className="os-intro-actions">
                <button
                  type="button"
                  className="os-intro-go"
                  data-action="enter-desktop-intro"
                  onClick={enterDesktop}
                >
                  进入桌面模式
                </button>
                <button
                  type="button"
                  className="os-intro-later"
                  data-action="dismiss-desktop-intro"
                  onClick={dismissRibbon}
                >
                  留在本页
                </button>
              </div>
              <button
                type="button"
                className="os-intro-close"
                data-action="close-desktop-intro"
                aria-label="关闭桌面模式提示"
                onClick={dismissRibbon}
              >
                ×
              </button>
            </aside>
          )}
          {!ribbonVisible && (
            <button
              type="button"
              className={`os-relaunch${pillHidden ? ' is-pill-hidden' : ''}`}
              data-action="enter-desktop-mode"
              onClick={enterDesktop}
              title="进入桌面模式"
              aria-label="进入桌面模式：8 个项目变成桌面上的图标"
            >
              <span className="os-relaunch-mark" aria-hidden="true" />
              桌面模式
            </button>
          )}
        </>
      )}
    </>
  )
}

/* ── 图标：8 个项目各一个内联 SVG 字形（不用任何位图/图标字体） ────────── */
const GLYPHS = {
  '01': (
    <>
      <path d="M8 4h12v7a6 6 0 0 1-12 0z" />
      <path d="M10 21h8M14 17v4" />
    </>
  ),
  '02': (
    <>
      <path d="M3 15c4-6 10-6 14 0" />
      <path d="M3 19c4-6 10-6 14 0" />
      <circle cx="18" cy="8" r="2.4" />
    </>
  ),
  '03': (
    <>
      <path d="M12 3v5M12 16v5M4.5 12h15" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  '04': (
    <>
      <path d="M12 21c0-6 2-8 5-9-3-1-4-3-4-6-2 2-5 3-6 6-1.6 4 1 9 5 9z" />
    </>
  ),
  '08': (
    <>
      <path d="M6 8l1.6-3h8.8L18 8v8l-1.6 3H7.6L6 16z" />
      <path d="M9.5 12h.01M14.5 12h.01M10 15c1.2.9 2.8.9 4 0" />
    </>
  ),
  '06': (
    <>
      <path d="M6 20v-6a6 6 0 0 1 12 0v6" />
      <path d="M4 20h16M9 10v10M15 10v10" />
    </>
  ),
  '05': (
    <>
      <rect x="4" y="4" width="16" height="16" />
      <path d="M4 10h16M10 10v10" />
    </>
  ),
  '07': (
    <>
      <path d="M4 7h16v10H4z" />
      <path d="M8 21l2-4M16 21l-2-4M9 11h6" />
    </>
  ),
}

const SECTION_JUMPS = [
  { hash: '#hero', label: '首页', ref: 'HERO' },
  { hash: '#projects', label: '精选项目 · 滚动章节', ref: 'WORK' },
  { hash: '#about', label: '个人经历', ref: 'EXP' },
  { hash: '#strengths', label: '个人优势', ref: 'EDGE' },
  { hash: '#contact', label: '开始合作', ref: 'END' },
]

const TASKBAR_H = 52
const TOP_MIN = 40
const ARROW_STEP = 20
const GAP = 24

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

export function RetroDesktopOS({ projects, onOpenProject, onExit, variant = 'desk' }) {
  const items = useMemo(() => normalizeDesktopProjects(projects), [projects])
  /** 口袋版（<1024px）：图标是 2×4 大格子，窗口改从底部升起的 sheet，拖拽留给「下滑收起」 */
  const pocket = variant === 'pocket'
  // 窗口状态：{ [id]: { id, x, y, z, minimized } }；最小化的窗口**不渲染**（任务栏仍列着它）
  const [wins, setWins] = useState({})
  const [focusedId, setFocusedId] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [clock, setClock] = useState(() => new Date())
  const zRef = useRef(100)
  const dragRef = useRef(null)
  const frameRefs = useRef({})

  useEffect(() => {
    const t = window.setInterval(() => setClock(new Date()), 30000)
    return () => window.clearInterval(t)
  }, [])

  const viewport = () => ({
    w: Math.max(320, window.innerWidth),
    h: Math.max(480, window.innerHeight),
  })

  const winSize = useCallback(() => {
    const { w, h } = viewport()
    return {
      w: clamp(560, 320, w - 2 * GAP),
      h: clamp(430, 300, h - TASKBAR_H - TOP_MIN - GAP),
    }
  }, [])

  const focusWin = useCallback((id) => {
    const z = ++zRef.current
    setWins((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], z, minimized: false } } : prev))
    setFocusedId(id)
  }, [])

  const openWin = useCallback(
    (item) => {
      setWins((prev) => {
        if (prev[item.id]) {
          return { ...prev, [item.id]: { ...prev[item.id], minimized: false, z: ++zRef.current } }
        }
        const { w, h } = viewport()
        const { w: ww, h: wh } = winSize()
        const n = Object.keys(prev).length
        return {
          ...prev,
          [item.id]: {
            id: item.id,
            x: clamp(Math.round((w - ww) / 2) + (n % 5) * 28 - 56, 0, Math.max(0, w - ww)),
            y: clamp(96 + (n % 5) * 26, TOP_MIN, Math.max(TOP_MIN, h - TASKBAR_H - wh)),
            z: ++zRef.current,
            minimized: false,
          },
        }
      })
      setFocusedId(item.id)
    },
    [winSize],
  )

  const closeWin = useCallback((id) => {
    setWins((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setFocusedId((cur) => (cur === id ? null : cur))
  }, [])

  const minimizeWin = useCallback((id) => {
    setWins((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], minimized: true } } : prev))
    setFocusedId((cur) => (cur === id ? null : cur))
  }, [])

  const nudge = useCallback(
    (id, dx, dy) => {
      const { w, h } = viewport()
      const el = frameRefs.current[id]
      const rect = el ? el.getBoundingClientRect() : { width: winSize().w, height: winSize().h }
      setWins((prev) => {
        const cur = prev[id]
        if (!cur) return prev
        return {
          ...prev,
          [id]: {
            ...cur,
            x: clamp(cur.x + dx, 0, Math.max(0, w - rect.width)),
            y: clamp(cur.y + dy, TOP_MIN, Math.max(TOP_MIN, h - TASKBAR_H - rect.height)),
          },
        }
      })
    },
    [winSize],
  )

  /* ── 拖拽：pointerdown 记起点，pointermove 直接写 transform，松手即停 ──
     监听挂在 window 上（不是靠 setPointerCapture），这样「真实拖动」和
     「测试里手动 dispatch 的 PointerEvent」走的是同一条路径。 */
  const startDrag = useCallback(
    (e, id) => {
      if (e.button !== undefined && e.button !== 0) return
      const el = frameRefs.current[id]
      if (!el) return
      const rect = el.getBoundingClientRect()
      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        originX: rect.left,
        originY: rect.top,
        w: rect.width,
        h: rect.height,
      }
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId)
      } catch {
        /* 合成事件没有活动指针，capture 会抛 NotFoundError —— 不影响后续 move 处理 */
      }
      focusWin(id)
    },
    [focusWin],
  )

  /* ── 口袋版：条头部下滑 = 收起 sheet ──
     不做自由拖拽（手机上窗口没有"桌面坐标"这个概念），只认竖直位移：
     松手位移 > 90px 就最小化到任务栏，否则回弹。横向位移完全不理会，
     免得和系统的"从左边缘返回"手势打架。 */
  const sheetDragRef = useRef(null)

  const startSheetDrag = useCallback(
    (e, id) => {
      if (e.button !== undefined && e.button !== 0) return
      sheetDragRef.current = { id, startY: e.clientY, dy: 0 }
      focusWin(id)
    },
    [focusWin],
  )

  const moveSheetDrag = useCallback((e) => {
    const d = sheetDragRef.current
    if (!d) return
    d.dy = Math.max(0, e.clientY - d.startY)
    const el = frameRefs.current[d.id]
    if (el) el.style.translate = `0 ${d.dy}px`
  }, [])

  const endSheetDrag = useCallback(() => {
    const d = sheetDragRef.current
    if (!d) return
    const el = frameRefs.current[d.id]
    if (el) el.style.translate = ''
    if (d.dy > 90) minimizeWin(d.id)
    sheetDragRef.current = null
  }, [minimizeWin])

  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current
      if (!d) return
      const { w, h } = viewport()
      const nx = clamp(d.originX + (e.clientX - d.startX), 0, Math.max(0, w - d.w))
      const ny = clamp(d.originY + (e.clientY - d.startY), TOP_MIN, Math.max(TOP_MIN, h - TASKBAR_H - d.h))
      setWins((prev) => (prev[d.id] ? { ...prev, [d.id]: { ...prev[d.id], x: nx, y: ny } } : prev))
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  /* ── 开始菜单里跳长页：先退出桌面模式，再滚到对应章节 ── */
  const jumpTo = useCallback(
    (hash) => {
      setMenuOpen(false)
      onExit?.()
      window.setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ block: 'start', behavior: 'auto' })
        if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
      }, 80)
    },
    [onExit],
  )

  const visible = items.filter((it) => wins[it.id] && !wins[it.id].minimized)
  const taskItems = items.filter((it) => wins[it.id])
  const focusOrder = Object.keys(wins).length ? focusedId : null

  return (
    <div className="os-desktop-root" data-desktop-os="active" data-pocket-mode={pocket ? 'true' : 'false'}>
      <div className="os-acid-wallpaper" aria-hidden="true" />

      <div className="os-plate">
        <b>YANGHONG <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px' }}>OS</span></b>
        <span>portfolio / build 2026.10</span>
      </div>

      <button type="button" className="os-exit" data-action="exit-desktop-mode" onClick={onExit}>
        {pocket ? '← 长页模式' : '← 退出桌面模式（看长页）'}
      </button>

      {/* 桌面图标区 */}
      <div className="os-desk" role="group" aria-label="项目快捷方式">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className="os-icon-tile"
            data-desktop-icon={it.id}
            data-open={wins[it.id] && !wins[it.id].minimized ? 'true' : 'false'}
            title={`单击打开：${it.title}`}
            onClick={() => openWin(it)}
          >
            <span className="os-icon-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#151515" strokeWidth="1.8" strokeLinecap="square">
                {GLYPHS[it.id] || GLYPHS['07']}
              </svg>
            </span>
            <span className="os-icon-index">SYS_REF // {it.id}</span>
            <span className="os-icon-label">{it.title}</span>
          </button>
        ))}
      </div>

      {/* 窗口 */}
      {visible.map((it) => {
        const w = wins[it.id]
        const { w: ww, h: wh } = winSize()
        const isFocused = focusOrder === it.id
        return (
          <section
            key={it.id}
            ref={(el) => {
              frameRefs.current[it.id] = el
            }}
            className="os-window-frame"
            data-window={it.id}
            data-focused={isFocused ? 'true' : 'false'}
            tabIndex={0}
            aria-label={`${it.title} 窗口`}
            style={
              pocket
                ? { zIndex: w.z }
                : {
                    width: ww,
                    height: wh,
                    transform: `translate3d(${w.x}px, ${w.y}px, 0)`,
                    zIndex: w.z,
                  }
            }
            onMouseDown={() => focusWin(it.id)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation()
                closeWin(it.id)
                return
              }
              const map = { ArrowLeft: [-ARROW_STEP, 0], ArrowRight: [ARROW_STEP, 0], ArrowUp: [0, -ARROW_STEP], ArrowDown: [0, ARROW_STEP] }
              const d = map[e.key]
              if (d) {
                e.preventDefault()
                nudge(it.id, d[0], d[1])
              }
            }}
          >
            <header
              className="os-window-bar"
              data-window-handle={it.id}
              onPointerDown={(e) => (pocket ? startSheetDrag(e, it.id) : startDrag(e, it.id))}
              onPointerMove={pocket ? moveSheetDrag : undefined}
              onPointerUp={pocket ? endSheetDrag : undefined}
              onPointerCancel={pocket ? endSheetDrag : undefined}
            >
              {pocket ? <span className="os-window-grab" aria-hidden="true" /> : null}
              <span className="os-window-ref">{it.id}</span>
              <span className="os-window-title">{it.title}</span>
              <button
                type="button"
                className="os-win-btn"
                data-window-minimize={it.id}
                title="最小化到任务栏"
                aria-label="最小化"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  minimizeWin(it.id)
                }}
              >
                _
              </button>
              <button
                type="button"
                className="os-win-btn"
                data-window-close={it.id}
                title="关闭窗口"
                aria-label="关闭"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  closeWin(it.id)
                }}
              >
                ×
              </button>
            </header>

            <div className="os-window-body" data-lenis-prevent>
              {it.cover ? (
                <div className="os-window-cover">
                  <img
                    src={it.cover}
                    alt={it.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      objectFit: it.fit === 'contain' ? 'contain' : 'cover',
                      objectPosition: it.objectPosition,
                    }}
                  />
                </div>
              ) : null}
              <div className="os-window-meta">
                <div className="os-window-kicker">
                  <i aria-hidden="true" />
                  {it.category || 'PROJECT'} / SYS_REF // {it.id}
                </div>
                <h3 className="os-window-h">{it.title}</h3>
                {it.desc ? <p className="os-window-desc">{it.desc}</p> : null}
                <button
                  type="button"
                  className="os-window-cta"
                  data-action="open-detail"
                  onClick={() => onOpenProject?.(it.rawProject || it)}
                >
                  查看完整项目详情 ↗
                </button>
                <div className="os-window-hint">拖标题栏移动 · 方向键微调 · Esc 关闭</div>
              </div>
            </div>
          </section>
        )
      })}

      {/* 开始菜单 */}
      {menuOpen && (
        <div className="os-startmenu" role="menu" aria-label="开始菜单">
          <div className="os-startmenu-title">跳转到长页章节</div>
          {SECTION_JUMPS.map((s) => (
            <button key={s.hash} type="button" className="os-startmenu-item" role="menuitem" onClick={() => jumpTo(s.hash)}>
              {s.label}
              <span>{s.ref}</span>
            </button>
          ))}
          <div className="os-startmenu-title" style={{ paddingTop: 12 }}>
            模式
          </div>
          <button type="button" className="os-startmenu-item" role="menuitem" data-action="exit-desktop-mode" onClick={onExit}>
            {pocket ? '回到长页模式' : '退出桌面模式（看长页）'}
            <span>PLAIN</span>
          </button>
        </div>
      )}

      {/* 任务栏 */}
      <div className="os-taskbar" role="toolbar" aria-label="任务栏">
        <button
          type="button"
          className="os-start-btn"
          data-action="start-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          ▤ 开始
        </button>
        <div className="os-task-items">
          {taskItems.map((it) => {
            const w = wins[it.id]
            const isFocused = focusOrder === it.id
            return (
              <button
                key={it.id}
                type="button"
                className="os-taskbar-item"
                data-taskbar-item={it.id}
                data-minimized={w.minimized ? 'true' : 'false'}
                data-focused={isFocused ? 'true' : 'false'}
                title={w.minimized ? '还原窗口' : isFocused ? '点击最小化' : '切换到该窗口'}
                onClick={() => {
                  if (w.minimized) focusWin(it.id)
                  else if (isFocused) minimizeWin(it.id)
                  else focusWin(it.id)
                }}
              >
                {it.id} · {it.title}
              </button>
            )
          })}
          {taskItems.length === 0 ? (
            <span className="os-window-hint">{pocket ? '点一个图标，窗口从底部弹出' : '单击桌面图标打开项目窗口'}</span>
          ) : null}
        </div>
        {pocket ? (
          <button
            type="button"
            className="os-taskbar-exit"
            data-action="exit-desktop-mode"
            onClick={onExit}
            aria-label="退出桌面模式，回到长页"
          >
            长页模式
          </button>
        ) : null}
        <span className="os-taskbar-clock">
          {String(clock.getHours()).padStart(2, '0')}:{String(clock.getMinutes()).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

export default DesktopOSGate
