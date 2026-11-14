import { useEffect, useRef, useState } from 'react'
import './mobile-card-landing.css'

/**
 * 手机端「项目档案牌堆」首访层
 *
 * 回到最初「概念播放器」的卡片语言，但按现在整站的色票重做：
 *   · 8 张项目卡叠成一副牌，depth 取模决定层次（位移 / 缩放 / 微旋 / 透明度）；
 *   · 左右拖拽或点 ‹ › 换张，当前卡先飞出、后面几张同时上浮，不是整页刷新；
 *   · 切换时编号、标题、进度点、背景光晕一起变 —— 这就是「同类型的变化」；
 *   · 点最前面那张卡 = 直接进项目详情，保留「一个目标一个动作」的清晰契约；
 *   · 保留「简历与能力」「给我留言」两个底部入口。
 *
 * 为什么不用 framer-motion：depth 是取模的，从 0 跳到 7 时插值会把卡片
 * 「补一段飞过去」。这里让远处卡（depth>3）直接无动画隐藏，配合 200ms 的
 * 飞出动画，视觉上就是干脆的吸附，不会拖尾。
 */

// 每张卡一个低饱和光晕色，切换时平滑过渡；与「个人优势」四张卡同色系
const TONES = [
  '#E9E5F3', // 01 雾紫
  '#F8E6D5', // 02 蜜橙
  '#EFE9DC', // 03 暖米
  '#E3E8E5', // 04 灰绿
  '#F1E2D8', // 08 浅陶
  '#E7E4EF', // 06 淡紫
  '#E4E9F0', // 05 雾蓝
  '#EEE9DF', // 07 纸灰
]

const SWIPE_THRESHOLD = 54

export default function MobileCardLanding({
  projects = [],
  onOpenProject,
  onOpenResume,
  onOpenContact,
  initialIndex = 0,
}) {
  const n = projects.length
  const clampIndex = (v) => Math.min(Math.max(Number(v) || 0, 0), Math.max(n - 1, 0))
  const [index, setIndex] = useState(() => clampIndex(initialIndex))
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState(null)
  const startX = useRef(null)
  const moved = useRef(false)
  const busy = useRef(false)

  useEffect(() => {
    return () => { busy.current = false }
  }, [])

  // 从详情页退回时，App 记着刚才看的是第几张
  useEffect(() => {
    if (n > 0) setIndex(clampIndex(initialIndex))
  }, [initialIndex, n]) // eslint-disable-line react-hooks/exhaustive-deps

  const animateTo = (nextIndex, direction = 'left') => {
    if (busy.current || n < 2 || nextIndex === index) return
    busy.current = true
    setLeaving(direction)
    window.setTimeout(() => {
      setIndex(nextIndex)
      setLeaving(null)
      window.setTimeout(() => { busy.current = false }, 260)
    }, 190)
  }

  const step = (dir) => {
    const next = (index + dir + n) % n
    animateTo(next, dir > 0 ? 'left' : 'right')
  }

  const onPointerDown = (e) => {
    if (busy.current) return
    startX.current = e.clientX
    moved.current = false
    setDragging(true)
    // 不要在 deck 上 setPointerCapture：捕获会把后续 click 的 target 改写成 deck，
    // 卡片自己的 onClick 就收不到了（点卡进详情会失灵）。移出边界时交给
    // onPointerLeave 收尾即可，卡片区域足够大，正常点击不会越界。
  }
  const onPointerMove = (e) => {
    if (startX.current === null) return
    const dx = Math.max(-180, Math.min(180, e.clientX - startX.current))
    if (Math.abs(dx) > 8) moved.current = true
    setDragX(dx)
  }
  const onPointerUp = () => {
    if (startX.current === null) return
    const dx = dragX
    startX.current = null
    setDragging(false)
    setDragX(0)
    if (Math.abs(dx) > SWIPE_THRESHOLD) step(dx < 0 ? 1 : -1)
  }

  const onCardClick = (p, i, depth) => {
    // 拖拽结束会跟一次 click，别把它当成「打开项目」
    if (moved.current) { moved.current = false; return }
    if (depth === 0) onOpenProject?.(p, i)
    else animateTo(i, 'left')
  }

  if (n === 0) return null

  const current = projects[index]

  return (
    <div className="mcl-overlay" role="region" aria-label="项目档案牌堆">
      <div
        className="mcl-glow"
        style={{ backgroundColor: TONES[index % TONES.length] }}
        aria-hidden="true"
      />

      <header className="mcl-head">
        <span className="mcl-brand">YH.</span>
        <span className="mcl-who">
          <strong>杨鸿</strong>
          <span>产品设计师 · 26 届</span>
        </span>
      </header>

      <p className="mcl-lede">
        <b>{String(n).padStart(2, '0')}</b> 份项目文件 · 左右滑动翻牌，点开看完整推导
      </p>

      <div className="mcl-stage">
        <div
          className="mcl-deck"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {projects.map((p, i) => {
            const depth = (i - index + n) % n
            const isTop = depth === 0
            const far = depth > 3
            const style = { '--d': depth }
            if (isTop && dragging) {
              style.transform = `translate3d(${dragX}px, 0, 0) rotate(${dragX / 26}deg)`
            }
            return (
              <article
                key={p.id}
                className="mcl-card"
                data-id={p.id}
                data-depth={depth}
                data-far={far ? 'true' : 'false'}
                data-leaving={isTop && leaving ? leaving : undefined}
                data-action={isTop ? 'open-project' : undefined}
                style={style}
                role={isTop ? 'button' : undefined}
                tabIndex={isTop ? 0 : -1}
                aria-label={isTop ? `打开项目 ${p.title}` : undefined}
                onClick={() => onCardClick(p, i, depth)}
                onKeyDown={(e) => {
                  if (isTop && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onOpenProject?.(p, i)
                  }
                }}
              >
                <div className="mcl-media">
                  <img src={p.image} alt="" draggable="false" />
                  <span className="mcl-media-shade" aria-hidden="true" />
                </div>
                <div className="mcl-card-top">
                  <b>{p.id}</b>
                  <span>{p.category}</span>
                </div>
                <div className="mcl-card-body">
                  <h3>{p.title}</h3>
                  <p>{p.category} · 查看完整项目</p>
                </div>
                <span className="mcl-arrow" aria-hidden="true">↗</span>
              </article>
            )
          })}
        </div>
      </div>

      <div className="mcl-controls">
        <button type="button" className="mcl-nav" data-action="prev-card" onClick={() => step(-1)} aria-label="上一张">‹</button>
        <div className="mcl-dots" role="tablist" aria-label="项目切换">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`mcl-dot${i === index ? ' is-on' : ''}`}
              role="tab"
              aria-selected={i === index}
              aria-label={`第 ${i + 1} 张：${p.title}`}
              onClick={() => animateTo(i, i > index ? 'left' : 'right')}
            />
          ))}
        </div>
        <span className="mcl-counter">
          {String(index + 1).padStart(2, '0')} <i>/</i> {String(n).padStart(2, '0')}
        </span>
        <button type="button" className="mcl-nav" data-action="next-card" onClick={() => step(1)} aria-label="下一张">›</button>
      </div>

      <p className="mcl-hint">当前：{current?.title} · 滑动发现下一个</p>

      {/* 档案参数：随卡片一起换，补足牌堆与底部按钮之间的留白 */}
      <div className="mcl-facts" key={index}>
        <span><i>SYS_REF</i><b>{current?.id} / {String(n).padStart(2, '0')}</b></span>
        <span><i>FIELD</i><b>{current?.category}</b></span>
        <span><i>STATUS</i><b>{current?.statusLabel || '设计资料'}</b></span>
      </div>

      <div className="mcl-foot">
        <button type="button" className="mcl-msg" data-action="open-contact" onClick={() => onOpenContact?.()}>
          给我留言 ✎
        </button>
        <button type="button" className="mcl-cta" data-action="open-resume" onClick={() => onOpenResume?.()}>
          简历与能力 ↓
        </button>
      </div>
    </div>
  )
}
