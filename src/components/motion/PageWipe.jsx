import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// 擦除带的节奏：起步缓、中段极快、收尾再缓。
// 这条曲线决定"掠过"的手感 —— 少了它，橙带会显得像匀速平移的色块。
const WIPE_EASE = [0.76, 0, 0.24, 1]

/**
 * 转场擦除带 PageWipe
 *
 * 一条橙带自下而上掠过整屏，作为页面切换的引子：带子先走，新页面紧随其后升起。
 * 带内沿用全站的警示斜纹（墨黑 × 橙），所以它读起来是印刷语言的一部分，
 * 而不是凭空插进来的一个特效条。
 *
 * 位移用百分比而非 vh：百分比按元素自身高度解析（这里 38vh），
 * 280% = 106vh 落在视口下方，-120% = -45.6vh 完全升出视口上方，
 * 两端都在画外，所以起止位置在任何视口高度下都成立。
 *
 * 只负责"进入"这一半。离开由页面容器自身的 exit 负责，
 * 因此它不参与 AnimatePresence 的等待，也就不会拖长退场时间。
 * reduced-motion 下直接不渲染 —— 页面照常切换，只是不做擦除。
 */
export default function PageWipe({ delay = 0, duration = 0.72 }) {
  const reduce = useReducedMotion()
  // 播完即卸载：带子是 fixed 元素，留在 DOM 里会一直占着一个合成层。
  const [done, setDone] = useState(false)

  if (reduce || done) return null

  return (
    <motion.div
      aria-hidden="true"
      className="mo-wipe"
      style={{ willChange: 'transform' }}
      initial={{ y: '280%' }}
      animate={{ y: '-120%' }}
      transition={{ duration, delay, ease: WIPE_EASE }}
      onAnimationComplete={() => setDone(true)}
    />
  )
}
