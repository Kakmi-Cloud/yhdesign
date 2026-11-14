import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

const decimalsOf = (n) => {
  const s = String(n)
  const i = s.indexOf('.')
  return i === -1 ? 0 : s.length - i - 1
}

/**
 * CountUp —— 数字滚到终值
 *
 * 机制来自 ReactBits 的 <CountUp/>：
 *   · **不是自己写 rAF 缓动**，而是 `useSpring(useMotionValue(...))`，
 *     再订阅 `springValue.on('change')` 把值写进 `ref.current.textContent`；
 *   · 弹簧参数由 duration 反推：`damping = 20 + 40/duration`、
 *     `stiffness = 100/duration`；所以 duration 只是**手感旋钮**，
 *     不是精确时长（原版注释里也这么写，照搬）；
 *   · 触发是 `useInView(ref, { once: true, margin: '0px' })`；
 *   · 格式化走 `Intl.NumberFormat('en-US', { useGrouping, minimumFractionDigits,
 *     maximumFractionDigits })`，小数位取 from / to 里较多的那个。
 *
 * 本页的两处处理：
 *   1. **初始就渲染终值**（作为 children），动画开始时才改 textContent ——
 *      JS 挂了、插件没跑、或者用户开了减少动效，看到的都是**正确的数字**，
 *      只是没滚。原版渲染空 span，任何一步失败就是一片空白。
 *   2. 减少动效时直接不启动，终值留在原地。
 */
export default function CountUp({
  to,
  from = 0,
  suffix = '',
  prefix = '',
  duration = 2,
  separator = '',
  className = '',
  title,
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px' })
  const started = useRef(false)

  const maxDecimals = Math.max(decimalsOf(from), decimalsOf(to))
  const format = (v) => {
    const n = new Intl.NumberFormat('en-US', {
      useGrouping: Boolean(separator),
      minimumFractionDigits: maxDecimals,
      maximumFractionDigits: maxDecimals,
    }).format(v)
    return prefix + (separator ? n.replace(/,/g, separator) : n) + suffix
  }

  const value = useMotionValue(from)
  const damping = 20 + 40 * (1 / duration)
  const stiffness = 100 * (1 / duration)
  const spring = useSpring(value, { damping, stiffness })

  useEffect(() => {
    if (ref.current) ref.current.textContent = format(to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, suffix, prefix, separator, maxDecimals])

  useEffect(() => {
    if (!inView || started.current) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    started.current = true

    const unsub = spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = format(v)
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, spring])

  return (
    <span ref={ref} className={className} title={title}>
      {format(to)}
    </span>
  )
}
