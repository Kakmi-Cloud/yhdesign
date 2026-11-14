import { useEffect, useRef } from 'react'

/**
 * ClickSpark —— 点击迸发，画成"错版套印"
 *
 * 机制逐条来自 ReactBits 的 <ClickSpark/>：
 *   · canvas 2D，粒子不是 DOM，每帧 clearRect 后重画；
 *   · 每次点击在落点生成一圈**径向均匀分布**的短线，角度
 *     `(2π·i)/count`，不随机；
 *   · `eased = t·(2−t)`（ease-out），`distance = eased·radius`，
 *     `lineLength = size·(1−eased)` —— 往外扩的同时变短；
 *   · 没有重力、没有阻力、没有 velocity 数组；
 *   · 存活 400ms 后从数组里 filter 掉。
 *
 * 本页改了两处，都是为了让它在这张纸上真的看得见：
 *
 *   1. **双色套印。** 原版 `sparkColor:'#fff'`，在纸白页面上等同隐形。
 *      这里把同一圈粒子画两遍：先黑版偏 (−1.6, +1.6)，再橙版归位。
 *      印刷里这叫套印不准（misregistration）—— 白底上有黑橙错位的
 *      迸发，黑底上有橙黑错位的迸发，两种底色都成立，而且它本来
 *      就是这一版（酸纸）的语言。
 *   2. **只在有粒子时跑 rAF。** 原版是常开循环（空转也每帧 clearRect
 *      一次全屏）。这里没粒子就停机，有粒子才启动 ——
 *      空闲时这一层的成本是 0。
 *
 * 与浏览器原生点击不冲突：canvas 自己 pointer-events:none，
 * 监听挂在 window 上（capture 关闭），不 preventDefault、不 stopPropagation。
 */
const SPARK = {
  count: 12,        // 每次点击的粒子数（原版 8，这里加密一点更"画面感"）
  radius: 24,       // 最大径向距离
  size: 11,         // 线段初始长度
  duration: 420,    // 存活时长 ms
  lineWidth: 2,
  offset: 1.6,      // 两块版的错位量
}

const easeOut = (t) => t * (2 - t)   // 原版默认缓动，逐字照搬

export default function ClickSpark({
  ink = '#151515',
  accent = '#E67E33',
  ...opts
}) {
  const canvasRef = useRef(null)
  const cfg = useRef({ ...SPARK, ...opts })
  cfg.current = { ...SPARK, ...opts }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)')
    const coarseQuery = matchMedia('(pointer: coarse)')   // 触屏点按没有"光标落点"的意义，省掉
    if (reduceQuery.matches || coarseQuery.matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = 1
    let raf = 0
    let sparks = []

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)   // 之后全部用 CSS 像素坐标作画
    }

    function draw(now) {
      const { size, radius, lineWidth } = cfg.current
      const life = cfg.current.duration
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      sparks = sparks.filter((s) => now - s.t0 < life)
      if (!sparks.length) {
        raf = 0
        return
      }

      for (const s of sparks) {
        const eased = easeOut((now - s.t0) / life)
        const dist = eased * radius
        const len = size * (1 - eased)
        const cos = Math.cos(s.a)
        const sin = Math.sin(s.a)

        // 两套版：黑在左上、橙在右下，错开 offset
        for (const [color, dx, dy] of [
          [ink, -SPARK.offset, SPARK.offset],
          [accent, 0, 0],
        ]) {
          const ox = s.x + dx
          const oy = s.y + dy
          ctx.strokeStyle = color
          ctx.lineWidth = lineWidth
          ctx.beginPath()
          ctx.moveTo(ox + dist * cos, oy + dist * sin)
          ctx.lineTo(ox + (dist + len) * cos, oy + (dist + len) * sin)
          ctx.stroke()
        }
      }

      raf = requestAnimationFrame(draw)
    }

    const onClick = (e) => {
      // 只对主键、且不是拖拽结束产生的点击冒烟，避免拖选文字时乱喷
      if (e.button !== 0) return
      const c = cfg.current
      const now = performance.now()
      for (let i = 0; i < c.count; i++) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          a: (2 * Math.PI * i) / c.count,
          t0: now,
        })
      }
      if (!raf) raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('click', onClick)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      sparks = []
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="mo-spark-canvas" />
}
