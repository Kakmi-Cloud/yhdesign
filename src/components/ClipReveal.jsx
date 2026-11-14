import { useRef, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * ClipReveal —— 章节大标题的"擦入"揭幕
 *
 * 比淡入更有决断力：文字从下往上从裁切框里推出来，而不是渐渐显影。
 *
 * ── 为什么位移是 128% 而不是 110% ──
 * 调用处会给外层加一点上下内边距（见下面的 padding 说明）。
 * translateY 的百分比是按**元素自身高度**解析的，外层多了 padding 之后，
 * 110% 就不足以把内容完全推出可视区了，会露出一条边。
 * 128% 留出余量，任何一档字号下都能藏干净。
 *
 * ── 为什么调用处要传 py ──
 * 这几个 h2 都是 `leading-[0.92]`，行盒比字身矮，中文的字身会溢出到行盒之外。
 * 如果裁切框正好等于行盒高度，字顶和字底会被切掉几像素。
 * 所以外层必须留出内边距（调用处传 py-2 md:py-3），裁切框比字略高一点就不切字了。
 * 注意这里不能用 em 做内边距：em 取的是外层自己的 font-size（约 16px），
 * 不是 h2 的 clamp 字号，起不到作用。
 *
 * 兜底：IntersectionObserver 不可用时直接显示，避免内容永久隐藏。
 */
export const ClipReveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setShow(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduce])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        style={{
          transform: show ? 'translateY(0%)' : 'translateY(128%)',
          transition: reduce ? 'none' : `transform 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default ClipReveal
