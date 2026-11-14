import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * ScrollCue —— hero 底部的"往下滚"引导
 *
 * 补的是"不知道往下滚哪"这一条：hero 底部原先是空的，
 * 没有滚动提示时访客容易以为这页就到此为止了。
 *
 * 鼠标形状 + 滚轮小圆点上下浮动，整块随滚动进度淡出并下沉
 * （用 scrollYProgress 而不是自己算，这样和 Lenis 驱动的滚动天然同步）。
 *
 * 性能：那个上下浮动**是纯 CSS 动画**（`.mo-cue-float`，见 index.css），
 * 不是 framer-motion 的 JS 动画。这一点很关键 —— framer 的
 * `useAnimationFrame` / JS 动画都会启动写死 keepAlive 的内部帧循环，
 * 只要有一条无限 JS 动画在跑，整个页面就每帧都在出帧（实测首屏静止时
 * 每帧 2 次 rAF）。换成 CSS 后交给合成器，主线程完全不参与。
 *
 * 于是本组件自己没有任何 effect、没有订阅、没有帧回调：
 * 整块只靠两个 motion value 随滚动变化，静止时零开销。
 * 离屏 / 长时间无人操作时，那条 CSS 动画由 <OffscreenPause/> 统一停表。
 */
export const ScrollCue = () => {
  const { scrollYProgress } = useScroll()
  // 前 6% 就把整块淡掉：它不是常驻装饰，只是开场的一次邀请
  const opacity = useTransform(scrollYProgress, [0, 0.06], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.1], [0, 40])

  return (
    <motion.div
      style={{ opacity, y }}
      className="mo-cue pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      aria-hidden="true"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#151515]/60">Scroll</span>
      <svg width="18" height="28" viewBox="0 0 18 28" fill="none" className="mo-cue-float">
        <rect x="1" y="1" width="16" height="26" rx="8" stroke="#151515" strokeWidth="2" />
        <circle cx="9" cy="8" r="2.5" fill="#E67E33" />
      </svg>
    </motion.div>
  )
}

export default ScrollCue
