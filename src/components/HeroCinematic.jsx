import { useScroll, useTransform, useSpring } from 'framer-motion'

/**
 * useHeroCinematic —— hero 区滚动驱动电影镜头
 *
 * 用法（在 App.jsx 里）：
 *   const heroRef = useRef(null)
 *   const fx = useHeroCinematic(heroRef)
 *
 *   <section ref={heroRef} ...>
 *     <motion.div style={fx.circle} ...黄色圆 />
 *     <motion.div style={fx.headline} ...左侧大字区 />
 *     <motion.div style={fx.card} ...profile 卡片外层 />
 *   </section>
 *
 * 滚动 hero 时：
 *   - 黄圆上漂 + 放大
 *   - 左侧 CRAFTING Experiences 大字抬升离场、变透
 *   - profile 卡缓慢上浮
 *
 * 说明：offset 用 'end start'（非 'end end'）。本机实测 hero 高约 1078-1157px、
 * 视口 1198px，hero 比视口矮，'start start'→'end end' 会得到反向区间，
 * 进度被钳在 1，首屏直接呈现终态（大字与卡片一进页面就是结束状态）。
 * 'end start' 让区间等于 hero 自身高度，滚动时镜头效果完整播放。
 */
export function useHeroCinematic(ref) {
  const { scrollYProgress } = useScroll({
    target: ref,
    // 见上方说明：hero 比视口矮，必须用 'end start' 才能得到完整区间
    offset: ['start start', 'end start'],
  })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 })

  const circleY = useTransform(p, [0, 1], [0, -140])
  const circleScale = useTransform(p, [0, 1], [1, 1.25])

  const headlineY = useTransform(p, [0, 0.8, 1], [0, -160, -220])
  const headlineOpacity = useTransform(p, [0, 0.7, 1], [1, 0.6, 0])

  const designY = useTransform(p, [0, 1], [0, -180])
  const designOpacity = useTransform(p, [0, 0.6, 1], [1, 0.5, 0])

  const cardY = useTransform(p, [0, 1], [0, -60])

  return {
    circle: { y: circleY, scale: circleScale },
    headline: { y: headlineY, opacity: headlineOpacity },
    design: { y: designY, opacity: designOpacity },
    card: { y: cardY },
  }
}
