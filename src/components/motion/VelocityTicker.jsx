import { useCallback, useEffect, useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
} from 'framer-motion'
import { subscribeIdle } from '../../hooks/usePageIdle'

/** 取模回卷 —— 逐字照搬 ReactBits ScrollVelocity 的 wrap() */
const wrap = (min, max, v) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

/**
 * VelocityTicker —— 滚动速度驱动的无限跑马灯
 *
 * 这是全页"最活的"那一层，因为它是**双驱动**的：
 *
 *   · 没人操作时它照常走 —— 基础速度 baseVelocity（px/s），
 *     所以页面上永远有东西在动，不是一张静止的图（呼吸感）。
 *   · 一滚动，速度就被叠加放大 —— 滚得越快跑得越快，
 *     而且速度是**带符号**的：往回滚，方向会翻（动态感）。
 *
 * 机制逐条来自 ReactBits 的 <ScrollVelocity/>：
 *   · `useScroll()` 拿 scrollY，`useVelocity(scrollY)` 求它的导数；
 *   · 导数过一层 `useSpring({damping:50, stiffness:400})` 平滑；
 *   · 再 `useTransform(smoothVelocity, [0,1000], [0,5])` 映射成速度因子
 *     （注意 `clamp:false` —— 翻方向时它要能取到负值）；
 *   · 每帧：`moveBy = dir·base·(delta/1000)`，再 `moveBy += dir·moveBy·factor`；
 *   · 位移对"一份拷贝的宽度"取模回卷 → 无缝无限；
 *   · 拷贝多份（numCopies=6）保证永远填满视口。
 *
 * 与原版的差异：
 *   1. 原版是 `motion/react`，这里用项目里已有的 `framer-motion`
 *      （同一套 API，同名导出）。
 *   2. 原版类名 `.parallax` / `.scroller` 是全局的，很容易撞名 ——
 *      这里全部带 `mo-` 前缀（见 index.css）。
 *   3. 减少动效时**整段停住**并把位移钉回 0，而不是只慢下来。
 *   4. 方向取基础速度的符号，不靠拷贝下标奇偶 ——
 *      调用方传负的 baseVelocity 就能让这一行反向，更好控制。
 */
export default function VelocityTicker({
  children,
  baseVelocity = 60,
  numCopies = 6,
  damping = 50,
  stiffness = 400,
  velocityRange = [0, 5],
  maxFactor,
  className = '',
  itemClassName = '',
}) {
  const scrollerRef = useRef(null)
  const firstRef = useRef(null)
  const rootRef = useRef(null)
  const [copyWidth, setCopyWidth] = useState(0)
  const reduced = useRef(false)
  // 离屏暂停。全页有 4 条这样的循环带，但同一时刻视口里最多只看得到 1 条 ——
  // 剩下 3 条原先照样每帧算速度、写 transform，等于白烧 CPU。
  // 用 IntersectionObserver 判断这条带子是否还在视口附近，不在就直接停表。
  const visible = useRef(true)
  // —— 自管帧循环 ——
  // rafRef 是"表还在走"的凭据（0 = 已停表）；lastTsRef 记上一帧时间戳，
  // 停表时归零，睡醒后第一帧按 1/60 起步，避免一个巨大的 delta 把带子甩飞。
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  // 循环跑在 rAF 回调里，读不到最新的 state 闭包，宽度用 ref 镜像一份
  const widthRef = useRef(0)
  const idleRef = useRef(false)
  // 速度因子的绝对上限。原版是 clamp:false —— 这是**必须的**，
  // 因为往回滚时因子要能取到负值，钳到 0 就没法翻方向了。
  // 但不封顶有真问题：`scroll-behavior: smooth` 的锚点跳转
  // （点导航"项目"→ 平滑滚 3000px）会产生一个极高的瞬时速度，
  // 因子被无限放大，跑马灯会短暂甩飞。真实滚轮每帧 deltaY 在
  // 100–600，对应因子 0.5–3；这里封到 5（也就是设计里那一档最大值），
  // 既保住了方向翻转，也不让跳转把它甩出去。
  const cap = maxFactor ?? velocityRange[1]

  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], velocityRange, {
    clamp: false,
  })

  // 位移本体。用 motionValue 而不是 state —— 每帧都要写，走 state 会每帧重渲。
  const baseX = useMotionValue(0)
  const direction = useRef(baseVelocity >= 0 ? 1 : -1)
  const speed = Math.abs(baseVelocity)

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return '0px'
    return `${wrap(-copyWidth, 0, v).toFixed(2)}px`
  })

  // ── 帧循环本体（自管 rAF）──
  // 为什么不用 framer-motion 的 useAnimationFrame：它内部写死 `frame.update(cb, true)`
  // （见 framer-motion 的 useAnimationFrame 实现），keepAlive 恒为 true。
  // keepAlive 的语义是"这一帧跑完自动把自己排回队列，并让批处理器继续 schedule 下一帧"，
  // 于是只要组件还挂着，全局帧循环就**永不停止** —— 页面完全静止也照样按刷新率出帧。
  // 本页有 4 条这样的带子，等于 4 个永久订阅者，这才是静止时仍 165fps 的真正来源。
  //
  // 换成自管循环后，"要不要继续出帧"的决定权回到我们手里：下面任一条件不满足
  // 就直接不排下一帧 —— 停表是彻底的，渲染管线可以真的空闲。
  const tick = useCallback(
    (now) => {
      rafRef.current = 0
      if (
        !visible.current || // 离屏（4 条里通常只有 1 条在视野内）
        reduced.current || // 用户要求减少动效
        idleRef.current || // 长时间无人操作（见 usePageIdle）
        document.hidden || // 标签页在后台
        !widthRef.current // 还没量到宽度，回卷算不出来
      ) {
        lastTsRef.current = 0
        return
      }

      const delta = lastTsRef.current ? now - lastTsRef.current : 1000 / 60
      lastTsRef.current = now

      const raw = velocityFactor.get()
      const factor = raw > cap ? cap : raw < -cap ? -cap : raw
      // 速度因子带符号 → 往回滚时方向翻转
      if (factor < 0) direction.current = -1
      else if (factor > 0) direction.current = 1
      else direction.current = baseVelocity >= 0 ? 1 : -1

      // delta 要先夹住：切后台再切回来时 delta 可能是好几秒，
      // 不夹的话这一帧会直接把位移推过好几个拷贝宽度
      const dt = Math.min(delta, 50) / 1000
      let moveBy = direction.current * speed * dt
      moveBy += direction.current * moveBy * factor
      baseX.set(baseX.get() + moveBy)

      rafRef.current = requestAnimationFrame(tick)
    },
    [baseVelocity, baseX, cap, speed, velocityFactor]
  )

  const start = useCallback(() => {
    if (rafRef.current || !widthRef.current) return
    // 睡醒第一帧按 1/60 起步，不让一个巨大的 delta 把带子甩出去
    lastTsRef.current = 0
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    lastTsRef.current = 0
  }, [])

  useEffect(() => {
    reduced.current = matchMedia('(prefers-reduced-motion: reduce)').matches
    const q = matchMedia('(prefers-reduced-motion: reduce)')
    const onPref = () => {
      reduced.current = q.matches
      if (q.matches) {
        baseX.set(0)
        stop()
      } else {
        start()
      }
    }
    q.addEventListener('change', onPref)

    const measure = () => {
      const w = firstRef.current?.offsetWidth ?? 0
      // 宽度同时存 ref：帧循环读不到 state 闭包，只有 ref 是实时值
      widthRef.current = w
      setCopyWidth(w)
      if (w) start()
    }
    measure()
    window.addEventListener('resize', measure)
    // 字体加载完宽度会变，量晚了就会在回卷点露一条缝
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {})

    return () => {
      q.removeEventListener('change', onPref)
      window.removeEventListener('resize', measure)
      stop()
    }
  }, [baseX, start, stop])

  // 离屏暂停：进出视口时翻转标记并起停表。rootMargin 给 200px，
  // 这样带子在滚进来的前一屏就开始走，不会出现"滑到眼前才突然启动"。
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting
        if (entry.isIntersecting) start()
        else stop()
      },
      { rootMargin: '200px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [start, stop])

  // 长时间无人操作 → 停表；任何一次输入 → 立刻接上。
  // 45s 的阈值见 usePageIdle：正常浏览不会触发，走开才会。
  useEffect(
    () =>
      subscribeIdle((v) => {
        idleRef.current = v
        if (v) stop()
        else start()
      }),
    [start, stop]
  )

  // 标签页切后台 → 停；切回前台 → 接上。浏览器本来也会节流后台 rAF，
  // 但明确停表可以省掉"切回来先空跑一堆失去意义的帧"。
  useEffect(() => {
    const onVisible = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [start, stop])

  return (
    <div ref={rootRef} className={`mo-ticker ${className}`}>
      <motion.div ref={scrollerRef} className="mo-ticker-scroller" style={{ x }}>
        {Array.from({ length: numCopies }).map((_, i) => (
          <span
            key={i}
            ref={i === 0 ? firstRef : undefined}
            className={itemClassName}
            aria-hidden={i > 0 ? 'true' : undefined}
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
