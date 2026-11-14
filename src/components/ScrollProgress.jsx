import { motion, useScroll, useSpring } from 'framer-motion'

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 })
  return (
    <motion.div aria-hidden="true" style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[100] h-[3px] origin-left bg-[#E67E33]" />
  )
}
