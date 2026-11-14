import { useEffect, useMemo, useRef, useState } from 'react'
import './mobile-pocket-reel.css'

/* 手机端「30 秒工程胶片 + 规格抽屉」。
 *
 * 为什么不是又一层桌面 OS：竖屏 414px 装不下并排窗口，把工业渲染图缩成
 * 手机小图标也把作品的细节优势丢了。这个组件只做一件事 —— 用 8 张封面
 * 连成一个 3.5s/张的自动胶片，任何一张都能就地拉出规格抽屉看参数，
 * 不必去瞄卡脚那枚圆箭头。
 *
 * 与既有层的关系（z 序，见 App.jsx）：
 *   .ml-overlay 首访轮盘 150  <  .mr-overlay 胶片 160
 *   <  .mr-sheet 规格抽屉 180  <  原稿详情浮层 200
 *
 * 不做的事（有意）：
 *   - 不写任何 localStorage：手机端一旦写"看过/进过"这类记忆，下次进来
 *     就默认跳过某一层，等于又造一扇单向门（桌面模式刚修过同一个坑）。
 *   - 不用 navigator.vibrate：iOS Safari 全系不支持，Firefox 129+ 已移除，
 *     手感不能靠它，按压反馈一律走视觉。
 *   - 不请求 DeviceOrientation：权限弹窗会在首屏打断第一次访问。
 */

const REEL_MS = 3500
const SHEET_CLOSE_DRAG = 90

export default function MobilePocketReelHUD({
  projects = [],
  startIndex = 0,
  startWithSheet = false,
  // 上层压着详情页时挂起自动推进：胶片留在栈里（返回要回到它），但不该在背后偷偷翻页。
  suspended = false,
  onIndexChange,
  onClose,
  onOpenDetail,
  onGoLongPage,
}) {
  const deck = useMemo(() => projects.filter(Boolean), [projects])
  const count = deck.length

  const [index, setIndex] = useState(() => {
    const i = Number(startIndex)
    return Number.isFinite(i) && i >= 0 && i < deck.length ? i : 0
  })
  const [sheet, setSheet] = useState(!!startWithSheet)
  // 按住画面 = 暂停。松开后回到自动推进。
  const [paused, setPaused] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  const press = useRef(null)
  const grab = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const indexCbRef = useRef(onIndexChange)
  indexCbRef.current = onIndexChange

  // 把当前张数回写给父组件（父组件只记 ref、不 setState）：
  // 这样「胶片里进详情 → 返回」回到的是刚才那张卡，而不是又跳回 01。
  useEffect(() => {
    indexCbRef.current?.(index)
  }, [index])

  // 减少动效：胶片不再自动走，只能手动点/滑，避免无请求的运动。
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return undefined
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])

  // 自动推进：长按、抽屉打开、切走页面时不推进。
  useEffect(() => {
    if (paused || sheet || reduceMotion || suspended || count < 2) return undefined
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), REEL_MS)
    // 切走暂停、切回来要恢复（原来只在 hidden 时置 true，回到前台永远停住）
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [index, paused, sheet, reduceMotion, suspended, count])

  // Escape：先收抽屉，再退胶片。
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      if (sheet) setSheet(false)
      else closeRef.current?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet])

  const item = deck[index]
  if (!item) return null

  const step = (dir) => setIndex((i) => (i + dir + count) % count)

  // 点画面 = 开规格抽屉；长按 = 暂停（松手若超过 250ms 或拖过 10px 就只恢复，不弹抽屉）。
  const onStageDown = (event) => {
    press.current = { t: Date.now(), y: event.clientY }
    setPaused(true)
  }
  const onStageUp = (event) => {
    const start = press.current
    press.current = null
    setPaused(false)
    if (!start) return
    const held = Date.now() - start.t
    const moved = Math.abs((event.clientY ?? start.y) - start.y) > 10
    if (held < 250 && !moved) setSheet(true)
  }

  const onGrabDown = (event) => {
    grab.current = event.clientY
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const onGrabMove = (event) => {
    if (grab.current == null) return
    setDragY(Math.max(0, event.clientY - grab.current))
  }
  const onGrabUp = (event) => {
    if (grab.current == null) return
    const dy = Math.max(0, (event.clientY ?? grab.current) - grab.current)
    grab.current = null
    setDragY(0)
    if (dy > SHEET_CLOSE_DRAG) setSheet(false)
  }

  return (
    <section
      className="mr-overlay"
      data-mobile-reel="open"
      role="dialog"
      aria-modal="true"
      aria-label={`30 秒速览，第 ${index + 1} / ${count} 个：${item.title}`}
    >
      <div className="mr-progress" aria-hidden="true">
        {deck.map((project, i) => (
          <span
            key={project.id}
            className={`mr-seg${i < index ? ' is-done' : ''}${i === index ? ' is-active' : ''}`}
          >
            {i === index && (
              <i
                style={{
                  animationDuration: `${REEL_MS}ms`,
                  animationPlayState:
                    paused || sheet || reduceMotion || suspended ? 'paused' : 'running',
                }}
              />
            )}
          </span>
        ))}
      </div>

      <button
        type="button"
        className="mr-close"
        data-action="close-mobile-reel"
        onClick={() => closeRef.current?.()}
        aria-label="关闭 30 秒速览，回到轮盘"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div
        className="mr-stage"
        onPointerDown={onStageDown}
        onPointerUp={onStageUp}
        onPointerCancel={onStageUp}
      >
        <div className="mr-slide" key={item.id}>
          <img
            src={item.image}
            alt=""
            draggable="false"
            style={{ objectPosition: item.imagePosition }}
          />
          <div className="mr-scrim" aria-hidden="true" />
          <div className="mr-copy">
            <span className="mr-badge">
              <strong>{item.id}</strong>
              <em>{item.category}</em>
            </span>
            <h2>{item.title}</h2>
            {item.subtitle && <p>{item.subtitle}</p>}
            <span className="mr-hint">
              {paused ? '松手继续' : `长按暂停 · 点画面看规格 · ${index + 1}/${count}`}
            </span>
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              className="mr-step is-prev"
              data-action="reel-prev"
              onClick={() => step(-1)}
              aria-label="上一个项目"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14 6-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              className="mr-step is-next"
              data-action="reel-next"
              onClick={() => step(1)}
              aria-label="下一个项目"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m10 6 6 6-6 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="mr-foot">
        <button
          type="button"
          className="mr-cta"
          data-action="reel-open-sheet"
          onClick={() => setSheet(true)}
        >
          规格速览
        </button>
        <button
          type="button"
          className="mr-cta is-primary"
          data-action="reel-open-detail"
          onClick={() => onOpenDetail?.(item, index)}
        >
          完整项目 ↗
        </button>
        <button
          type="button"
          className="mr-cta is-ghost"
          data-action="reel-go-longpage"
          onClick={() => onGoLongPage?.(index)}
        >
          长页列表 ↓
        </button>
      </div>

      {sheet && (
        <div className="mr-sheet-wrap">
          <button
            type="button"
            className="mr-sheet-scrim"
            data-action="reel-close-sheet"
            aria-label="收起规格面板"
            onClick={() => setSheet(false)}
          />
          <div
            className="mr-sheet"
            data-mobile-reel-sheet="open"
            style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title}的规格`}
          >
            <span
              className="mr-sheet-grab"
              data-action="reel-sheet-grab"
              role="separator"
              aria-label="下拉收起规格面板"
              onPointerDown={onGrabDown}
              onPointerMove={onGrabMove}
              onPointerUp={onGrabUp}
              onPointerCancel={onGrabUp}
            />
            <header className="mr-sheet-head">
              <div>
                <span className="mr-badge">
                  <strong>{item.id}</strong>
                  <em>{item.category}</em>
                </span>
                <h3>{item.title}</h3>
                {item.subtitle && <p>{item.subtitle}</p>}
              </div>
              <button
                type="button"
                className="mr-sheet-close"
                data-action="reel-close-sheet"
                onClick={() => setSheet(false)}
                aria-label="收起规格面板"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <dl className="mr-specs">
              {(item.specs || []).map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mr-sheet-actions">
              <button
                type="button"
                className="mr-cta is-primary"
                data-action="reel-open-detail"
                onClick={() => onOpenDetail?.(item, index)}
              >
                查看完整项目 ↗
              </button>
              <button
                type="button"
                className="mr-cta is-ghost"
                data-action="reel-go-longpage"
                onClick={() => onGoLongPage?.(index)}
              >
                切到长页列表 ↓
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
