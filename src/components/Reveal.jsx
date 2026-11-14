import { motion } from 'framer-motion'

export const EASE = [0.22, 1, 0.36, 1]

export const Reveal = ({ children, delay = 0, y = 36, x = 0, blur = 6, duration = 0.9, once = true, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y, x, filter: `blur(${blur}px)` }}
    whileInView={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
    viewport={{ once, margin: '-8% 0px -8% 0px' }}
    transition={{ duration, delay, ease: EASE }}
  >
    {children}
  </motion.div>
)

export const RevealStagger = ({ children, step = 0.12, delay = 0, y = 32, once = true, className = '' }) => {
  const container = { hidden: {}, show: { transition: { staggerChildren: step, delayChildren: delay } } }
  const item = {
    hidden: { opacity: 0, y, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } },
  }
  return (
    <motion.div className={className} variants={container} initial="hidden" whileInView="show" viewport={{ once, margin: '-8% 0px -8% 0px' }}>
      {Array.isArray(children)
        ? children.map((c, i) => <motion.div key={i} variants={item}>{c}</motion.div>)
        : <motion.div variants={item}>{children}</motion.div>}
    </motion.div>
  )
}
