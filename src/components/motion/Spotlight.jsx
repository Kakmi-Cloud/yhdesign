import { useRef } from 'react'

/**
 * Spotlight —— 光标聚光
 *
 * 机制来自 ReactBits 的 <SpotlightCard/>，它几乎是纯 CSS：
 *   · `::before` 铺满整块，背景是一条
 *     `radial-gradient(circle at var(--mouse-x) var(--mouse-y), color, transparent 80%)`；
 *   · 默认 `opacity: 0`，`:hover` / `:focus-within` 时 `opacity: 0.6`，
 *     `transition: opacity 0.5s ease`；
 *   · JS 只做一件事 —— 在 mousemove 里把坐标写成 CSS 变量。
 *
 * 两处适配：
 *   1. 颜色。原版假设暗底（默认白 0.25、容器 #111）。本页是纸白底，
 *      光斑换成橙色。颜色只在挂载时写一次 —— 原版在每个 mousemove 里
 *      重复写同一个颜色值，是每帧一次无意义的样式失效。
 *   2. `:focus-within` 也点亮 —— 键盘用户 tab 进来时应该有同样的反馈，
 *      这是原版就有、但很容易被抄漏的一条。
 */
export default function Spotlight({
  children,
  className = '',
  color = 'rgba(230, 126, 51, 0.22)',
  as: Tag = 'div',
  style,
  ...rest
}) {
  const ref = useRef(null)

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mo-mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--mo-my', `${e.clientY - rect.top}px`)
  }

  return (
    <Tag
      ref={ref}
      onMouseMove={onMouseMove}
      className={`mo-spot ${className}`}
      style={{ '--mo-spot-color': color, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
