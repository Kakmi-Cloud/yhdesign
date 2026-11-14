import { useCallback, useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ProjectDoodle from './ProjectDoodle'
import ShuffleLabel from './motion/ShuffleLabel'
import { useLenisLock } from './SmoothScroll'

// 条形码竖条宽度序列（Brutalist data tag 装饰）
const barcodeBars = [2, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 3, 1]

// 纯色块封面主题（Acid 印刷色板：黑白纸板 + 荧光橙，循环分配）
const cardThemes = [
  { bg: '#ffffff', accent: '#E67E33', text: '#151515' },
  { bg: '#151515', accent: '#E67E33', text: '#ffffff' },
  { bg: '#F0F1F3', accent: '#E67E33', text: '#151515' },
  { bg: '#E67E33', accent: '#151515', text: '#151515' },
  { bg: '#ffffff', accent: '#E67E33', text: '#151515' },
  { bg: '#1B1C22', accent: '#E67E33', text: '#ffffff' },
  { bg: '#DDE0E4', accent: '#E67E33', text: '#151515' },
]

// 滚轮翻卡模型：每次有效滚轮输入只推进一张（方向取符号），
// 通过短冷却窗口抑制高速扫轮造成的「一次连跳多张」
const WHEEL_STEP_COOLDOWN = 110
// 3D 舞台透视：数值越小透视越强（卡片近大远小越明显）
const STAGE_PERSPECTIVE = 1500

/**
 * - 3D 悬浮扇形轮盘（单一半屏 peek 状态）
 * - 每张卡带 rotateY 侧转 + translateZ 景深 + 舞台跟随鼠标轻微俯仰，
 *   焦点卡像悬浮在视口中央的 3D 封面；hover 时再轻抬一下
 * - 滚轮仅在轮盘居中视口中段时接管，每次有效输入推进一张（方向取符号），
 *   快速切换走底部直达刻度 / 翻卡按钮；到首/末张仍向边界滚时交还页面
 * - 卡片为中等尺寸纯色封面卡；点击卡片 → 扇形抽出三张真实场景预览
 */
export default function PortfolioCardStack({
  projects,
  onSelectProject,
}) {
  const containerRef = useRef(null)

  // —— 目标进度：idxFloat 保存目标卡 index（整数，滚轮 / 按钮都整格移动） ——
  const progress = useMotionValue(0)
  const idxFloatRef = useRef(0) // 目标 index（始终为整数）
  const settleTimerRef = useRef(null) // 兼容历史吸附定时器（当前翻卡不依赖吸附）
  const lastWheelTsRef = useRef(0) // 上一次滚轮时间戳（单次输入冷却窗口）
  // 低刚度 + 低阻尼：轮盘移动带轻微拖尾惯性，观感更顺滑
  const springProgress = useSpring(progress, { stiffness: 160, damping: 24, mass: 0.9 })

  // —— 3D 舞台视差：鼠标在画廊内移动时，整个轮盘轻微俯仰（悬浮感） ——
  const tiltX = useMotionValue(0) // 水平 → rotateY
  const tiltY = useMotionValue(0) // 垂直 → rotateX
  const tiltXSpring = useSpring(tiltX, { stiffness: 80, damping: 16, mass: 0.5 })
  const tiltYSpring = useSpring(tiltY, { stiffness: 80, damping: 16, mass: 0.5 })

  // 单一半屏状态：仅记录被提起的卡片 index
  const [peekIndex, setPeekIndex] = useState(null)
  // 光箱：被点击放大查看的场景大图（src + alt）
  const [lightboxImage, setLightboxImage] = useState(null)
  const total = projects.length

  // —— 是否在视口内 ——
  // 两个用处：① 离屏时把 8 张卡的 willChange 收回 'auto'，释放常驻合成层；
  // ② 离屏时不再响应舞台视差（页面滚走了，鼠标还在动，没必要算）。
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // —— 舞台视差的写入节流 ——
  // 原实现在 onMouseMove 里直接写两个 motion value。指针每秒能触发
  // 100+ 次 mousemove，每次都要过一遍 spring 并重算 8 张卡 × 6 个变换。
  // 改成"只记最新落点 + 每帧最多写一次"：视觉完全一致，写入量降到帧率上限。
  const tiltRafRef = useRef(0)
  const tiltPointRef = useRef({ x: 0, y: 0 })
  const flushTilt = useCallback(() => {
    tiltRafRef.current = 0
    tiltX.set(tiltPointRef.current.x)
    tiltY.set(tiltPointRef.current.y)
  }, [tiltX, tiltY])
  useEffect(() => () => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current)
  }, [])

  // 当前居中的卡片序号（驱动底部轨道高亮）
  const [activeIdx, setActiveIdx] = useState(0)
  useEffect(() => {
    const unsub = springProgress.on('change', (v) => {
      setActiveIdx((prev) => {
        const next = Math.min(total - 1, Math.max(0, Math.round(v * (total - 1))))
        return prev === next ? prev : next
      })
    })
    return () => unsub()
  }, [springProgress, total])

  const cancelSettle = useCallback(() => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
  }, [])

  // 直接跳转某张卡：清掉吸附定时器、把目标写成整数；同时收起半屏预览，
  // 避免残留的 peek 状态锁住背景滚动或错误地挂到新焦点卡上
  const goTo = useCallback(
    (idx) => {
      const next = Math.min(total - 1, Math.max(0, idx))
      cancelSettle()
      idxFloatRef.current = next
      progress.set(next / Math.max(1, total - 1))
      setPeekIndex(null)
    },
    [cancelSettle, progress, total]
  )

  // 相邻翻一张（以当前显示位置取整为基准，按钮 / 方向键共用）
  const stepTo = useCallback(
    (dir) => {
      const cur = Math.round(idxFloatRef.current)
      const next = cur + dir
      if (next < 0 || next > total - 1) return false
      goTo(next)
      return true
    },
    [goTo, total]
  )

  // 视口感知：决定卡片整体尺度与横向散布（左右贯穿视口并切出屏幕）
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440))
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const resetPeek = () => {
    setPeekIndex(null)
    setLightboxImage(null)
  }

  // 半屏或光箱时锁定背景滚动
  useEffect(() => {
    if (peekIndex !== null || lightboxImage) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [peekIndex, lightboxImage])

  // 同时锁住 Lenis。光箱/半屏有自己的滚动区域，
  // 若不锁，指针一旦移出轮盘范围，Lenis 就会继续把底下的页面滚走。
  useLenisLock(peekIndex !== null || !!lightboxImage)

  // Esc：优先关闭光箱，再收回半屏卡片
  useEffect(() => {
    if (peekIndex === null && !lightboxImage) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (lightboxImage) setLightboxImage(null)
        else resetPeek()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [peekIndex, lightboxImage])

  const resetTilt = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  // 滚轮：仅在轮盘居中视口中段时接管翻卡（单次输入最多推进 1 张）；
  // 未居中 / 到边界仍向外滚 → 不拦截，滚轮照常滚动页面
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handler = (e) => {
      if (peekIndex !== null) {
        // 半屏展开中：拦截滚轮，避免把正在观看的卡片划走
        e.preventDefault()
        // 必须一并阻止冒泡：Lenis 的滚轮监听挂在 window 上（且是冒泡阶段、
        // 不检查 defaultPrevented）。只 preventDefault 的话浏览器不动了，
        // 但事件仍会传到 window，Lenis 照样把页面滚走 —— 这就是"翻卡时页面跟着跑"的原因。
        // stopPropagation 让这次手势只属于轮盘。
        e.stopPropagation()
        return
      }
      // 视口感知：轮盘垂直中心不在视口中段警戒带内（中心位于 18%–82% 之外）时，
      // 判定用户正在浏览页面其它部分，不吞滚轮
      const rect = el.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const vh = window.innerHeight || 1
      if (centerY < vh * 0.18 || centerY > vh * 0.82) return

      const cur = Math.round(idxFloatRef.current)
      const dir = e.deltaY > 0 ? 1 : -1
      const next = cur + dir
      if (next < 0 || next > total - 1) {
        // 已到边界仍向外滚：定死在边界，把滚动交还给页面
        goTo(cur)
        return
      }
      // 冷却窗口：抑制一次高速扫轮里连续事件导致的「连跳多张」
      const now = Date.now()
      if (now - lastWheelTsRef.current < WHEEL_STEP_COOLDOWN) return
      lastWheelTsRef.current = now
      e.preventDefault()
      // 同上：让 Lenis 完全收不到这次滚轮，页面才不会在翻卡时一起滚。
      // 注意另外两条分支（未居中 / 已到边界）**故意不**阻止冒泡 ——
      // 那时要把滚动原样交还给页面，Lenis 继续接管，用户才滚得出项目区。
      e.stopPropagation()
      goTo(next)
    }

    el.addEventListener('wheel', handler, { passive: false })
    return () => {
      el.removeEventListener('wheel', handler)
      cancelSettle()
    }
  }, [peekIndex, total, goTo, cancelSettle, progress])

  // 方向键翻卡（画廊聚焦时）
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onKey = (e) => {
      const isNext = e.key === 'ArrowRight' || e.key === 'ArrowDown'
      const isPrev = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
      if (!isNext && !isPrev) return
      const dir = isNext ? 1 : -1
      e.preventDefault()
      stepTo(dir)
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [stepTo])

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-roledescription="Selected works carousel"
      className="relative w-full outline-none"
      style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        // 画廊本体高度固定：浏览翻卡时页面不滚动、不位移，
        // 内容始终稳定停留在视口内可读。
        // 2026-10 实测：默认态卡片纵向只占 360px（y 192→552），旧值
        // min(92vh,860px)=743px 让上下各留 192px 纯空 —— 现收到
        // min(78vh,640px)，提起态（卡片上移 60px）仍留有 40px 净空。
        height: 'min(78vh, 640px)',
      }}
    >
      {/* 全局交互层：滚轮 / 按钮 / 方向键翻卡，不拖动页面滚动 */}
      <motion.div
        className="relative flex h-full w-full items-center justify-center overflow-hidden pt-12 will-change-transform select-none"
        style={{ rotateX: tiltYSpring, rotateY: tiltXSpring, transformPerspective: STAGE_PERSPECTIVE }}
        onMouseMove={(e) => {
          // 舞台视差：半屏/光箱时不干扰，只做 ±2~3° 的轻俯仰；离屏时整段跳过
          if (peekIndex !== null || lightboxImage || !inView) return
          tiltPointRef.current.x = 0
          tiltPointRef.current.y = 0
          if (!tiltRafRef.current) tiltRafRef.current = requestAnimationFrame(flushTilt)
        }}
        onMouseLeave={resetTilt}
        onClick={resetPeek}
      >
        {/* 引导行：把"一共几件"写在明面上。
            原来这里只有一行 12px 浅灰说明字（"滚动或点击切换卡片"），
            没交代总量，观众容易以为只有眼前这一张。现在左侧挂一个酸黄
            计数牌（与章节头的方形机能记号同语言），右侧留操作说明。 */}
        <div className="pointer-events-none absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap">
          <span
            className="border-2 border-[#151515] bg-[#E67E33] px-2 py-1 text-[10px] font-black tabular-nums uppercase tracking-[0.14em] text-[#151515]"
            style={{ fontFamily: "'Oswald','Inter',sans-serif", boxShadow: '2px 2px 0 0 #151515' }}
          >
            共 {String(total).padStart(2, '0')} 件作品
          </span>
          <span className="acid-microlabel text-[#151515]/55">
            滚动 / 点击切换 · 点居中卡片看详情
          </span>
        </div>

        {/* —— Soft 数据标签装饰层（低对比灰阶，呼应便当风格） —— */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none" aria-hidden="true">
          {/* 网格线 */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #151515 1px, transparent 1px), linear-gradient(to bottom, #151515 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          {/* 左上：坐标标注 */}
          <div className="absolute top-7 left-6 md:top-8 md:left-8 flex flex-col gap-1.5">
            <div className="font-mono text-[9px] md:text-[10px] leading-[1.35] text-[#a5a5ad] tracking-widest">
              <div>31.2304°N</div>
              <div>121.4737°E</div>
            </div>
          </div>

          {/* 右上：条形码 */}
          <div className="absolute top-7 right-6 md:top-8 md:right-8 opacity-60">
            <div className="flex h-9 items-end gap-[2px]">
              {barcodeBars.map((w, idx) => (
                <span
                  key={idx}
                  className="bg-[#151515]/[0.35]"
                  style={{ width: `${w}px`, height: idx % 2 ? '100%' : '68%' }}
                />
              ))}
            </div>
            <div className="font-mono text-[9px] text-[#a5a5ad] tracking-[0.3em] mt-1.5">YH-2026</div>
          </div>

          {/* 左下：颜色面板 swatch */}
          <div className="absolute bottom-9 left-6 md:left-8">
            <div className="flex gap-1 mb-1.5">
              {cardThemes.map((t, idx) => (
                <span
                  key={idx}
                  className="w-4 h-4 md:w-5 md:h-5 rounded-full ring-1 ring-[#151515]/[0.06]"
                  style={{ backgroundColor: t.bg }}
                />
              ))}
            </div>
            <div className="font-mono text-[9px] text-[#a5a5ad] tracking-widest">COLOR PALETTE / 07</div>
          </div>

          {/* 右下：柔和铭牌 */}
          <div className="absolute bottom-9 right-6 md:right-8 flex flex-col items-end gap-1.5">
            <div className="rounded-full bg-[#f0f1f4] px-3 py-1 text-[10px] font-bold text-[#5a5f6b] tracking-widest">
              STATUS: ACTIVE
            </div>
            <div className="font-mono text-[9px] text-[#a5a5ad] tracking-widest">REF / YH-2026-07</div>
          </div>

          {/* 巨型横向水印字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono font-bold text-[#151515]/[0.025] tracking-[0.08em] text-[9vw] md:text-[7.5vw] whitespace-nowrap leading-none select-none">
              SELECTED WORKS
            </span>
          </div>

          {/* 中心同心圆 + 十字（轻柔细环） */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.5]">
            <svg
              width="760"
              height="480"
              viewBox="0 0 760 480"
              fill="none"
              className="w-[94vw] max-w-[760px] h-auto text-[#151515]/20"
            >
              <circle cx="380" cy="240" r="205" stroke="currentColor" strokeWidth="1" />
              <circle cx="380" cy="240" r="250" stroke="currentColor" strokeWidth="1" strokeDasharray="5 7" />
              <line x1="380" y1="0" x2="380" y2="64" stroke="currentColor" strokeWidth="1" />
              <line x1="380" y1="416" x2="380" y2="480" stroke="currentColor" strokeWidth="1" />
              <line x1="60" y1="240" x2="124" y2="240" stroke="currentColor" strokeWidth="1" />
              <line x1="636" y1="240" x2="700" y2="240" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          {/* 左右竖向刻度尺（ruler） */}
          <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex flex-col gap-[7px]">
            {Array.from({ length: 16 }).map((_, idx) => (
              <span
                key={idx}
                className="bg-[#151515]/[0.12]"
                style={{ width: idx % 5 === 0 ? '16px' : '8px', height: '1px' }}
              />
            ))}
          </div>
          <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-[7px]">
            {Array.from({ length: 16 }).map((_, idx) => (
              <span
                key={idx}
                className="bg-[#151515]/[0.12]"
                style={{ width: idx % 5 === 0 ? '16px' : '8px', height: '1px' }}
              />
            ))}
          </div>

          {/* 底部传送带虚线轨道（纯装饰基线） */}
          <div className="absolute bottom-[92px] left-1/2 -translate-x-1/2 w-[82vw] max-w-[900px]">
            <div className="w-full border-t border-dashed border-[#151515]/20" style={{ borderTopWidth: '2px' }} />
            <span className="absolute -left-1 -top-[5px] w-[2px] h-[10px] bg-[#151515]/[0.15]" />
            <span className="absolute -right-1 -top-[5px] w-[2px] h-[10px] bg-[#151515]/[0.15]" />
          </div>
        </div>

        {/* 画廊控制层：独立于装饰层，可点击 / 可聚焦（滚动翻卡之外的手动入口） */}
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-[60] flex flex-col items-center gap-3 md:bottom-20">
          {/* 01–08 直达刻度 */}
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#151515]/10 bg-white/85 px-3 py-2 backdrop-blur-sm">
            {projects.map((p, idx) => {
              const on = idx === activeIdx
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Go to project ${idx + 1}`}
                  aria-current={on ? 'true' : undefined}
                  onClick={(e) => {
                    e.stopPropagation()
                    goTo(idx)
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition-colors duration-200"
                >
                  <span
                    className={`font-mono text-[10px] font-bold tracking-widest transition-all duration-200 ${
                      on ? 'bg-[#151515] px-2 py-1 text-[#E67E33]' : 'text-[#151515]/55 hover:text-[#151515]'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 左右翻卡按钮 */}
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous project"
              onClick={(e) => {
                e.stopPropagation()
                stepTo(-1)
              }}
              className="flex h-11 w-11 cursor-pointer items-center justify-center border-2 border-[#151515] bg-[#151515] text-base text-[#E67E33] shadow-[3px_3px_0_0_rgba(21,21,21,0.9)] transition-transform duration-150 hover:-translate-x-0.5 hover:shadow-[5px_5px_0_0_rgba(21,21,21,0.9)]"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next project"
              onClick={(e) => {
                e.stopPropagation()
                stepTo(1)
              }}
              className="flex h-11 w-11 cursor-pointer items-center justify-center border-2 border-[#151515] bg-[#151515] text-base text-[#E67E33] shadow-[3px_3px_0_0_rgba(21,21,21,0.9)] transition-transform duration-150 hover:translate-x-0.5 hover:shadow-[5px_5px_0_0_rgba(21,21,21,0.9)]"
            >
              →
            </button>
          </div>
        </div>

        {projects.map((project, i) => {
          const theme = cardThemes[i % cardThemes.length]
          // 卡面编号 = 位置序号，不是 project.id。
          // id 是身份键（管 PROJECT_META 标签、doodle 符号、详情页路由），
          // 一旦有人调整 projects 的顺序，两者就会分叉；编号统一按位置算，
          // 才能和底部 01–08 刻度始终对齐。深链仍走 id，见 App.jsx。
          const seq = String(i + 1).padStart(2, '0')

          // 核心计算：卡片距离中心点的距离（0 为正中心）
          const dist = useTransform(springProgress, (p) => i - p * (total - 1))

          // —— 视口自适应尺度：卡片整体收敛为中号，四周留白给邻卡与预览 ——
          // 卡基础宽 540px、高 360px；baseScale 让整列卡随视口等比缩放，
          // 大屏放大、小屏收窄。焦点卡宽度 ≈ 540 × baseScale（约 1/3 视口宽），
          // 不再出现“单卡霸屏”导致邻卡与预览图完全看不进的情况。
          const baseScale = Math.min(0.98, Math.max(0.62, vw / 1500))
          // 各档位卡的「视觉半宽」（基础半宽 × 该档视觉比例）
          const focusHalf = 270 * baseScale // dist=0 焦点档
          const neighHalf = 270 * baseScale * 0.9 // dist=±1 邻卡档
          const nextHalf = 270 * baseScale * 0.78 // dist=±2 过渡档
          const farHalf = 270 * baseScale * 0.68 // dist=±3 最远档
          // —— 光学中心法则：激活卡绝对居中，侧卡向外大幅推开 ——
          // 侧卡中心不再与焦点卡边缘交叠：留出明确的“呼吸带”，
          // 一次只让视觉处理一张高亮卡（降低认知负荷）。
          const X1 = focusHalf + neighHalf + 40 // dist=±1：与焦点卡明显分离
          const X2 = X1 + (neighHalf + nextHalf) * 0.95 // dist=±2：继续外推
          const X3 = X2 + (nextHalf + farHalf) * 1.15 // dist=±3：抵达视口边缘被裁
          const x = useTransform(dist, [-3, -2, -1, 0, 1, 2, 3], [-X3, -X2, -X1, 0, X1, X2, X3])
          const y = useTransform(dist, [-3, -2, -1, 0, 1, 2, 3], [64, 30, 12, 0, 12, 30, 64])
          // 平面扭角降一档，把视觉重心让给 3D 侧转
          // 全站统一正向：平面扭角归零（保留参数位，方便以后回退）
          const rotateZ = useTransform(dist, [-3, -2, -1, 0, 1, 2, 3], [0, 0, 0, 0, 0, 0, 0])
          // 3D 侧转：左右两侧的卡向中心转（像立起的封面书脊），焦点卡正对观众
          const rotateY = useTransform(dist, [-3, -2, -1, 0, 1, 2, 3], [0, 0, 0, 0, 0, 0, 0])
          // 景深对比拉满：焦点卡沿 Z 轴明显拉近，侧卡逐级后退到更深的“后场”
          const z = useTransform(dist, [-3, -2, -1, 0, 1, 2, 3], [-320, -220, -120, 120, -120, -220, -320])
          // 尺寸阶梯拉大：焦点卡 100%，每退一格明显缩小 → 主次一目了然
          const scale = useTransform(
            dist,
            [-3, -2, -1, 0, 1, 2, 3],
            [0.5, 0.66, 0.86, 1, 0.86, 0.66, 0.5].map((v) => v * baseScale)
          )
          // 亮度阶梯：仅激活卡全亮；侧卡 50%/32%/0 —— 一次只让大脑处理一张
          const opacity = useTransform(dist, [-3, -2, -1, 0, 1, 2, 3], [0, 0.32, 0.5, 1, 0.5, 0.32, 0])
          const dynamicZIndex = useTransform(dist, (d) => 50 - Math.round(Math.abs(d) * 10))

          const isPeek = peekIndex === i
          // 卡片封面：竖版卡图优先（MobileProjectDeck 同源字段），退回落主图
          const cover = project.imagePortrait || project.image

          return (
            // 锚点层：把卡片中心钉在屏幕中心，位移语义 = 中心距屏幕中心
            <div
              key={project.id}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                data-card={project.id}
                style={{
                  x,
                  y,
                  rotateZ,
                  rotateY,
                  z,
                  scale,
                  opacity,
                  zIndex: isPeek ? 90 : dynamicZIndex,
                  // 局部透视：让 rotateY / z 呈现近大远小的立体纵深感
                  transformPerspective: 1300,
                  // 常驻 will-change 会让 8 张卡各自占着一个合成层，即使整个
                  // 轮盘已经滚出屏幕。改成只在轮盘可见时提层，离屏交还。
                  willChange: inView ? 'transform' : 'auto',
                }}
                className="flex flex-col items-center justify-center origin-center pointer-events-none"
              >
                {/* 档案袋动效：扇形抽出的场景预览图（点击放大光箱）
                    取画廊前三张，按手风琴式在卡片上方展开。 */}
                <AnimatePresence>
                </AnimatePresence>

                {/* 内层：纯色封面卡外观 + hover 悬浮 + 点击事件 */}
                <motion.div
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isPeek) {
                      // 已居中并提起：再点收回
                      resetPeek()
                      return
                    }
                    // 别的卡正处于提起预览：先收起
                    if (peekIndex !== null) resetPeek()
                    // 点击侧卡 → 平滑切到中间成为焦点卡；
                    // 点击已居中的卡 → 提起预览看场景大图
                    const focusedIdx = Math.round(progress.get() * Math.max(1, total - 1))
                    if (i === focusedIdx) setPeekIndex(i)
                    else goTo(i)
                  }}
                  // 仅动画 scale / y / boxShadow，避开宽高重排
                  animate={
                    isPeek
                      // 2026-10 阴影语言统一：全站卡片只用“硬偏移阴影”
                      // （Npx Npx 0 0 rgba(21,21,21,0.9)），不再在卡片上叠柔和投影；
                      // 柔和阴影只保留给弹层/灯箱这类真正悬浮的层。
                      ? { scale: 1.03, y: -60, boxShadow: '8px 8px 0 0 rgba(21,21,21,0.9)' }
                      : { scale: 1, y: 0, boxShadow: '6px 6px 0 0 rgba(21,21,21,0.9)' }
                  }
                  // hover 轻抬：像把封面从展台上拿起一点（peek 时不叠加）
                  whileHover={
                    isPeek
                      ? undefined
                      : { scale: 1.035, y: -14, boxShadow: '0 50px 90px -30px rgba(21,21,21,0.42), 8px 8px 0 0 rgba(21,21,21,0.95)' }
                  }
                  transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                  className="pointer-events-auto relative cursor-pointer rounded-[4px] w-[540px] h-[360px] overflow-hidden"
                  style={{ backgroundColor: theme.bg }}
                >
                  {/* 卡片内容：纯色纸板封面的 acid 排印（分类 / 大标题 / doodle / 元数据） */}
                <div className="relative flex flex-col justify-between w-full h-full p-6 md:p-7">
                  {/* 头部：分类标签 + SYS_REF + 编号圆 */}
                  <div className="relative flex justify-between items-center w-full z-10 pointer-events-none">
                    <span
                      className="text-xs font-black px-3.5 py-1.5 tracking-wider"
                      style={{ backgroundColor: theme.accent, color: theme.accent === '#151515' ? '#E67E33' : '#151515' }}
                    >
                      {project.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* 技术标注洗牌：指针落到这行小字上时，字母数字
                          一列一列地滚过（老虎机），静止与结束都是同一串
                          正确文本。英文保留、中文不受影响。 */}
                      <ShuffleLabel
                        className="font-mono text-[9px] md:text-[10px] tracking-widest"
                        style={{ color: theme.text, opacity: 0.45 }}
                      >
                        {`SYS_REF // ${seq}`}
                      </ShuffleLabel>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold font-mono"
                        style={{ backgroundColor: '#20242c', color: '#ffffff' }}
                      >
                        {seq}
                      </div>
                    </div>
                  </div>

                  {/* 主体：默认态 = 标题 + 作品封面图版；提起态 = 画廊前三张卡内并排 */}
                  {isPeek ? (
                    <div className="relative flex-1 grid grid-cols-3 gap-2.5 min-h-0 z-10 pointer-events-auto">
                      {(project.gallery?.slice(0, 3) ?? []).map((img, gi) => (
                        <button
                          key={`peek-${project.id}-${gi}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setLightboxImage({
                              src: img.src,
                              alt: img.alt || `${project.title} 场景预览`,
                              title: project.title,
                            })
                          }}
                          className="group relative h-full w-full overflow-hidden rounded-[4px] border-2 border-[#151515] bg-white shadow-[4px_4px_0_0_rgba(21,21,21,0.9)] cursor-zoom-in"
                        >
                          <img
                            src={img.src}
                            alt={img.alt || `${project.title} 场景预览`}
                            loading="lazy"
                            draggable={false}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                          />
                          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-[#151515]/0 p-1.5 text-[10px] font-bold text-white opacity-0 transition-all duration-300 group-hover:bg-[#151515]/45 group-hover:opacity-100">
                            查看大图
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative flex-1 grid grid-cols-[1fr_auto] items-center gap-4 min-h-0 z-10 pointer-events-none">
                      <div className="flex flex-col items-start justify-center min-w-0">
                        <h3
                          className="text-[30px] md:text-[40px] font-black tracking-tight leading-[0.92] text-left"
                          style={{ color: theme.text, fontFamily: "'Oswald','Noto Sans SC','Inter',sans-serif" }}
                        >
                          {project.title}
                        </h3>
                        <p
                          className="text-[13px] md:text-sm font-medium mt-3 line-clamp-2 leading-relaxed max-w-[34ch] text-left"
                          style={{ color: theme.text, opacity: 0.72 }}
                        >
                          {project.subtitle}
                        </p>
                      </div>
                      {cover ? (
                        <div className="relative h-[150px] w-[168px] md:h-[178px] md:w-[212px] shrink-0 overflow-hidden rounded-[4px] border-2 border-[#151515] bg-white shadow-[5px_5px_0_0_rgba(21,21,21,0.9)]">
                          <img
                            src={cover}
                            alt={`${project.title} 作品封面`}
                            loading="lazy"
                            draggable={false}
                            className={`absolute inset-0 h-full w-full ${project.imagePortrait ? 'object-contain' : 'object-cover'}`}
                            style={{ objectPosition: project.imagePosition || '50% 50%' }}
                          />
                        </div>
                      ) : (
                        <div className="w-[92px] md:w-[120px] shrink-0 opacity-[0.3] md:opacity-[0.38]" style={{ color: theme.text }}>
                          <ProjectDoodle id={project.id} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* 底部元数据（peek 时淡出让位给详情按钮） */}
                  <div
                    className={`relative flex justify-between items-center w-full mt-3 z-10 pointer-events-none transition-opacity duration-300 ${
                      isPeek ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    {/* 原来是 STATUS: READY_TO_VIEW —— 没有信息量的装饰文字。
                        换成资料层里的真实进展状态，桌面卡片也能一眼看出项目走到哪一步。 */}
                    <span
                      className="font-mono text-[10px] md:text-[11px] font-bold tracking-wider"
                      style={{ color: theme.text, opacity: 0.85 }}
                    >
                      STATUS / {project.statusLabel || '设计资料'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        resetPeek()
                        onSelectProject?.(project)
                      }}
                      className="pointer-events-auto font-mono text-[9px] md:text-[10px] font-bold tracking-widest underline underline-offset-2 cursor-pointer"
                      style={{ color: theme.text, opacity: 0.75 }}
                    >
                      查看项目详情 ↗
                    </button>
                  </div>
                </div>

                  {/* 半屏后浮现：查看完整项目详情 */}
                  {isPeek && (
                    <motion.button
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      onClick={(e) => {
                        e.stopPropagation() // 防止触发卡片的收起
                        resetPeek()
                        onSelectProject?.(project)
                      }}
                      className="absolute bottom-5 left-7 right-7 z-20 inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all cursor-pointer hover:-translate-y-0.5 bg-[#E67E33] text-[#151515] shadow-[3px_3px_0_0_rgba(21,21,21,0.9)]"
                    >
                      查看完整项目详情
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            </div>
          )
        })}
      </motion.div>

      {/* ===== 光箱：点击场景图后全屏查看大图 ===== */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setLightboxImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${lightboxImage.title} 大图预览`}
            className="fixed inset-0 z-[90] flex cursor-zoom-out items-center justify-center bg-[#151515]/90 p-4 backdrop-blur-md md:p-10"
          >
            {/* 图片主体 */}
            <motion.div
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#FCFCFC] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#151515]">{lightboxImage.title}</p>
                  <p className="truncate text-[11px] font-medium text-[#666666]">{lightboxImage.alt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  aria-label="关闭大图"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#151515] text-white transition-colors hover:bg-[#151515]/80"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#F0F0F0] p-3 md:p-5">
                <img
                  src={lightboxImage.src}
                  alt={lightboxImage.alt}
                  loading="lazy"
                  className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_18px_44px_-18px_rgba(21,21,21,0.35)]"
                />
              </div>
              <div className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666]">
                ESC 或点击空白关闭
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
