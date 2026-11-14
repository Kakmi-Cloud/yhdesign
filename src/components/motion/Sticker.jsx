/**
 * Sticker —— 贴纸角掀起
 *
 * 机制来自 ReactBits 的 <StickerPeel/>，并且**照搬它的实现层选择**：
 * 掀角不是 3D transform、没有 perspective、没有 rotateX ——
 * 它是 `clip-path: polygon()` 把上沿往下裁，再露出底下一层"纸背"。
 * 原版用一个 `scaleY(-1)` 的镜像 flap 补掀起来的背面，但那一层要把
 * `--peel-hover` 这个百分比同时用在 `height` 和 `translateY` 上 ——
 * translateY 的百分比按**自身**高度解析（不是容器），
 * 所以 flap 会位移错位。这里改成在撕开边缘画一条折痕线，
 * 用 1/5 的代码量拿到同样的"掀起来了"的读感。
 *
 * 交互上把原版的"拖拽"换成"悬停 / 按下"：原版依赖 gsap Draggable，
 * 而这里贴纸都是页面上的小标注，"拖"它们没有语义，
 * "掀一下看看底下"才是。省掉一个插件和一整套拖拽边界计算。
 *
 * 降级：prefers-reduced-motion 下 clip-path 与纸背全部取消，贴纸就是贴纸。
 */
export default function Sticker({
  children,
  className = '',
  style,
  peelHover = '34%',
  peelActive = '46%',
  as: Tag = 'span',
  ...rest
}) {
  return (
    <Tag
      className={`mo-sticker ${className}`}
      style={{ '--mo-peel-hover': peelHover, '--mo-peel-active': peelActive, ...style }}
      {...rest}
    >
      <span aria-hidden="true" className="mo-sticker-back" />
      <span className="mo-sticker-face">{children}</span>
    </Tag>
  )
}
