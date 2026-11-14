import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// id 必须和页面里真实的 section id 一致，否则 IntersectionObserver 观察不到、圆点永远不动。
const SECTIONS = [
  { id: 'hero', label: 'TOP' },
  { id: 'about', label: 'EXP' },
  { id: 'projects', label: 'WORK' },
  { id: 'strengths', label: 'EDGE' },
  { id: 'contact', label: 'END' },
]

/**
 * SectionRail —— 右侧章节进度轨
 *
 * 补的是"不知道还有几屏"这一条：五个圆点对应五个章节，
 * 当前章节的圆点变橙并放大，鼠标移上去才显出缩写标签（平时不抢视线）。
 *
 * 只在 lg 以上显示 —— 窄屏右侧空间要留给内容，且这里本来就窄。
 * z-40 低于 sticky header(z-50)，也低于详情页(z-200)与弹窗(z-100)，
 * 所以浮层打开时它会被自然盖住，不需要额外隐藏逻辑。
 */
export const SectionRail = () => {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const idx = SECTIONS.findIndex((s) => s.id === entry.target.id)
          if (idx >= 0) setActive(idx)
        })
      },
      // 上下各收 45%：只有章节真正占据视口中段时才算"当前"，
      // 否则相邻两节会在边界处来回跳。
      { rootMargin: '-45% 0px -45% 0px' }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label="章节导航"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex"
    >
      {SECTIONS.map((s, i) => {
        const on = i === active
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? 'true' : undefined}
            className="group flex items-center gap-2"
          >
            <span
              className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                on ? 'text-[#E67E33] opacity-100' : 'text-[#151515]/40 opacity-0 group-hover:opacity-100'
              }`}
            >
              {s.label}
            </span>
            <motion.span
              // reduce-motion 下不做缩放，只保留颜色区分
              animate={reduce ? { backgroundColor: on ? '#E67E33' : '#151515' } : { scale: on ? 1.4 : 1, backgroundColor: on ? '#E67E33' : '#151515' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="block h-2 w-2 rounded-full"
              style={{ opacity: on ? 1 : 0.35 }}
            />
          </a>
        )
      })}
    </nav>
  )
}

export default SectionRail
