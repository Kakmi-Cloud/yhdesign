import { useEffect, useRef } from 'react'

const INK = '#151515'
const ACCENT = '#E67E33'

// shimmer 的帧预算：约 1s 后落定，避免指针停在卡片上时永远占着一帧 rAF。
const SHIMMER_TICKS = 60

/**
 * 单个像素块。延时按"到网格中心的距离"算出来，
 * 所以点亮顺序天然是从中心向外扩散，而不是随机撒点。
 * 到顶后进入 shimmer（在 min~max 之间来回呼吸），预算走完即落定。
 */
class Pixel {
  constructor(canvas, ctx, x, y, color, speed, delay) {
    this.width = canvas.width
    this.height = canvas.height
    this.ctx = ctx
    this.x = x
    this.y = y
    this.color = color
    this.speed = (Math.random() * 0.8 + 0.1) * speed
    this.size = 0
    this.sizeStep = Math.random() * 0.4
    this.minSize = 0.5
    this.maxSize = Math.random() * 1.5 + 0.5
    this.delay = delay
    this.counter = 0
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01
    this.isIdle = false
    this.isReverse = false
    this.isShimmer = false
    this.shimmerTicks = 0
  }

  draw() {
    // 让像素围绕自己的坐标中心生长，而不是从左上角撑开
    const centerOffset = 1 - this.size * 0.5
    this.ctx.fillStyle = this.color
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size)
  }

  appear() {
    this.isIdle = false
    // 还没轮到自己：只推进计数器，不落笔
    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }
    if (this.size >= this.maxSize) this.isShimmer = true
    if (this.isShimmer) this.shimmerStep()
    else this.size += this.sizeStep
    this.draw()
  }

  disappear() {
    this.isShimmer = false
    this.counter = 0
    if (this.size <= 0) {
      this.size = 0
      this.isIdle = true
      return
    }
    this.size -= 0.1
    if (this.size < 0) this.size = 0
    this.draw()
  }

  shimmerStep() {
    if (this.shimmerTicks >= SHIMMER_TICKS) {
      this.size = this.maxSize
      this.isIdle = true
      return
    }
    this.shimmerTicks += 1
    this.size += this.isReverse ? -0.2 : 0.2
    if (this.size >= this.maxSize) this.isReverse = true
    else if (this.size <= this.minSize) {
      this.isReverse = false
      this.size = this.minSize
    }
  }
}

/**
 * 像素揭示层 PixelReveal
 *
 * 移植自 ReactBits 的 PixelCard，机制原样保留（像素网格 / 按中心距离排延时 /
 * 逐格点亮 / 反向收回 / 全部 idle 即停帧），去掉它的变体配色与尺寸预设。
 * 没有任何第三方依赖 —— 全部是 Canvas 2D + 自己管的 rAF，不需要 GSAP。
 *
 * 配色收进品牌两色（橙为主、墨黑点缀），所以它读起来像丝网印的网点扩散，
 * 和这个页面本身的印刷语言是同一套，而不是贴上去的 8-bit 特效。
 *
 * 事件绑在父容器上，本层自己 pointer-events:none ——
 * 否则这一层会盖住卡片的点击区，也会因为自己不收事件而永远触发不了。
 * reduced-motion 下不建网格、不绑事件，整层保持空白。
 */
export default function PixelReveal({ gap = 10, speed = 26, className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const pixelsRef = useRef([])
  const modeRef = useRef(null) // 'appear' | 'disappear' | null
  const lastTickRef = useRef(0)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 指针事件挂在父容器（图片框）上，本层只负责画。
    const host = wrap.parentElement || wrap

    // —— 网格重建：尺寸变了就重排，像素坐标全部用 CSS 像素 ——
    const build = () => {
      const rect = wrap.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width))
      const h = Math.max(1, Math.round(rect.height))
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      const cols = Math.floor(w / gap)
      const rows = Math.floor(h / gap)
      if (cols < 1 || rows < 1) {
        pixelsRef.current = []
        return
      }
      const cx = cols / 2
      const cy = rows / 2
      const maxDist = Math.hypot(cx, cy) || 1

      const px = []
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const color = Math.random() < 0.28 ? INK : ACCENT
          const dist = Math.hypot(i + 0.5 - cx, j + 0.5 - cy) / maxDist
          const delay = dist * 110 + Math.random() * 55
          px.push(new Pixel(canvas, ctx, i * gap + gap / 2, j * gap + gap / 2, color, speed, delay))
        }
      }
      pixelsRef.current = px
    }

    // —— 帧循环：60fps 节流；没有动画意图或已全部落定时立刻停帧 ——
    const tick = () => {
      const now = performance.now()
      if (now - lastTickRef.current >= 1000 / 60) {
        lastTickRef.current = now
        const fn = modeRef.current
        if (!fn) {
          rafRef.current = 0
          return
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const px = pixelsRef.current
        let allIdle = true
        for (let i = 0; i < px.length; i++) {
          px[i][fn]()
          if (!px[i].isIdle) allIdle = false
        }
        if (allIdle) {
          rafRef.current = 0
          // 只有 disappear 走完才算真的结束：清屏并复位。
          // appear 落定只是停帧 —— 像素必须留在画布上，
          // 否则指针还停在卡片上，网点就自己消失了（这正是第一版踩的坑）。
          if (fn === 'disappear') {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            modeRef.current = null
          }
          return
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const start = (mode) => {
      // 重新进入时把 shimmer 预算清零，让第二次悬停同样会呼吸
      if (mode === 'appear') {
        const px = pixelsRef.current
        for (let i = 0; i < px.length; i++) px[i].shimmerTicks = 0
      }
      modeRef.current = mode
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
    }

    const onEnter = () => {
      if (!pixelsRef.current.length) build()
      start('appear')
    }
    const onLeave = () => start('disappear')

    build()
    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)

    let ro = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        const wasMode = modeRef.current
        build()
        if (wasMode) start(wasMode)
      })
      ro.observe(host)
    }

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      if (ro) ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      modeRef.current = null
      pixelsRef.current = []
      const c = canvasRef.current
      if (c) ctx.clearRect(0, 0, c.width, c.height)
    }
  }, [gap, speed])

  return (
    <div ref={wrapRef} aria-hidden="true" className={`mo-pixel ${className}`}>
      <canvas ref={canvasRef} className="mo-pixel-canvas" />
    </div>
  )
}
