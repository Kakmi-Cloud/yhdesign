/**
 * StarBorder —— 沿边缘游走的光带
 *
 * 机制来自 ReactBits 的 <StarBorder/>，它是**纯 CSS**，没有 canvas、
 * 也没有 filter:blur —— 柔光是靠三个东西凑出来的：
 *   · `radial-gradient(circle, color, transparent 10%)` 的窄停点；
 *   · 光带自身 `height: 55%` + `border-radius: 50%`；
 *   · `opacity: 0.7` 叠在实底上。
 *
 * 结构是一层夹心：外层 `overflow:hidden` + 上下各一条光带（z-index 0），
 * 内层是实底内容（z-index 1）。间距由外层 `padding: 2px 0` 给，
 * 不是 gap —— 所以光带只从上下两条缝里透出来。
 *
 * 与原版的差异：
 *   1. 颜色从 `white` 换成橙（本页强调色），底色仍是黑 ——
 *      原版默认就是黑底白光的暗色按钮。
 *   2. 两条光带反向平移（一条 -100%、一条 +100%），
 *      所以看起来像一条光在绕着边框跑，而不是两块光各自闪。
 */
export default function StarBorder({
  children,
  speed = '6s',
  className = '',
  style,
  as: Tag = 'span',
  ...rest
}) {
  return (
    <Tag
      className={`mo-starborder ${className}`}
      style={{ '--mo-star-speed': speed, ...style }}
      {...rest}
    >
      <span aria-hidden="true" className="mo-starborder-band is-bottom" />
      <span aria-hidden="true" className="mo-starborder-band is-top" />
      {children}
    </Tag>
  )
}
