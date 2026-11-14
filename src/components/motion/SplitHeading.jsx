import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

/**
 * SplitHeading —— 逐字揭示（动态层 · 输入驱动）
 *
 * 机制取自 ReactBits 的 <SplitText/>：把文本拆成单字，每个字
 * `opacity 0 → 1`、`y 40 → 0`，每字错时 delay/1000 秒，时长约 1.2s，
 * `power3.out`（≈ cubic-bezier(0.215, 0.61, 0.355, 1)），进视野触发一次。
 *
 * **为什么不用 GSAP。** ReactBits 当前版本用 GSAP 的 SplitText 插件，
 * 我先照做了，量出来包体 424kB → 513kB（+88kB / gzip +35kB）——
 * 为了给两个词拆字付一个动画引擎的钱，和"没必要浪费算力"是反的。
 * 而且它要改写 DOM 再 revert（StrictMode 下双跑、卸载残留、
 * 父组件重渲染把 span 冲掉，三个坑都得自己兜）。
 * 这里改用项目里**已经装了**的 framer-motion 实现同一机制：
 *
 *   · 拆字：一次 `text.split(/(\s+)/)`，React 自己渲染 span，
 *     没有 DOM 改写，也就没有需要 revert 的东西；
 *   · 错时：每个字显式拿自己的 `delay = i · stagger`，
 *     不用 variants 逐层透传，所以中文/英文混排、断行都不受影响；
 *   · 触发：`useInView(once)`，进视野动画一次。
 *
 * 两个必须处理的排版细节（不处理就是真 bug）：
 *   1. 逐字拆开后浏览器能在任意两字间断行 —— 英文单词会被从中间劈开。
 *      所以每个词外面套一层 `.mo-split-word`，用 `white-space: nowrap`
 *      把断行约束回空格处。
 *   2. 空格不能丢。空格单独渲染成 `&nbsp;`，
 *      否则 "Product & UI" 会粘成 "Product&UI"。
 *
 * 降级：减少动效、或文本里没有可拆的字符 —— 一律直接渲染原文，
 * 不拆、不动。动效是增强，不是内容的前提。
 */
export default function SplitHeading({
  as: Tag = 'h2',
  children,
  className = '',
  style,
  delay = 45,          // 每个字之间的间隔，毫秒
  duration = 1.15,
  y = 44,
  rotate = 0,
  ease = [0.215, 0.61, 0.355, 1],   // power3.out 的等价贝塞尔
  once = true,
  amount = 0.25,
  id,
  ...rest
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, amount })
  const text = typeof children === 'string' ? children : ''
  const canSplit = text.trim().length > 1
  // 用 framer-motion 自己的 useReducedMotion（响应式，且对 SSR 安全），
  // 而不是自己读一次 matchMedia —— 后者只在首次渲染取值，
  // 用户中途打开"减少动效"不会生效。
  const reduce = useReducedMotion()

  if (!canSplit || reduce) {
    return (
      <Tag id={id} className={`mo-split ${className}`} style={style} {...rest}>
        {children}
      </Tag>
    )
  }

  const stagger = delay / 1000
  let charIndex = -1

  return (
    <Tag
      ref={ref}
      id={id}
      className={`mo-split ${className}`}
      style={style}
      // 拆出来的是一堆单字 span，读屏器会把它们当零散字符念。
      // 原文挂 aria-label，视觉层整体对辅助技术隐藏。
      aria-label={text}
      {...rest}
    >
      {text.split(/(\s+)/).map((token, ti) => {
        if (token === '') return null
        if (/^\s+$/.test(token)) {
          return (
            <span key={`s${ti}`} aria-hidden="true">
              {'\u00a0'}
            </span>
          )
        }
        return (
          <span key={`w${ti}`} className="mo-split-word" aria-hidden="true">
            {Array.from(token).map((ch, ci) => {
              charIndex += 1
              return (
                <motion.span
                  key={`c${ti}-${ci}`}
                  className="mo-split-char"
                  initial={{ opacity: 0, y, rotate }}
                  animate={inView ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y, rotate }}
                  transition={{ duration, ease, delay: charIndex * stagger }}
                >
                  {ch}
                </motion.span>
              )
            })}
          </span>
        )
      })}
    </Tag>
  )
}
