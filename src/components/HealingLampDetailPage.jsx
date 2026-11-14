import { useEffect } from 'react'
import HealingLamps from './HealingLamps'
import { Reveal } from './Reveal'
import { asset } from '../assetPath'
import DetailFold from './DetailFold'

/**
 * HealingLampDetailPage —— 「情绪疗愈灯具」毕设全屏详情页
 *
 * 为什么单独一个项目页（而不是塞进「实习灯具设计」）：
 *  06 的定位是实习期间的材质与形态探索，而这一批是交互灯具——开关就是手的动作，
 *  重点在「怎么动、怎么亮」，不是形态发散。两套语言放一页会互相稀释；
 *  而且毕设通常是作品集里分量最重的一个，值得有独立入口。
 *
 * 版式逻辑（改动前先读）：
 *  1. 封面从「左文右图」改为「标题区 + 通栏主图 + 规格带」——
 *     之前左栏堆了标题、描述、三个计数、四条规格，把主图挤成一张小图；
 *     现在主图拿到整幅宽度，规格独立成一条三栏带。
 *  2. 主体（HealingLamps）自带索引条，页面层不再重复列表。
 *  3. 页脚用深色收口，与暖纸正文形成一次明确的结束。
 *
 * 外壳沿用 01/02 详情页：吸顶导航 / Return / 独立滚动容器 / 进出场转场（由 App.jsx 负责）。
 */

const PAPER = '#F5F0E8'
const INK = '#151515'
const ACCENT = '#E67E33'
const FONT = "'Inter','Noto Sans SC',sans-serif"
const DISPLAY = "'Oswald','Noto Sans SC',sans-serif"

const NAV = [
  { id: 'g-cover', en: 'OVERVIEW' },
  { id: 'g-board', en: 'OBJECTS' },
]

// 封面右侧的计数块
const STATS = [
  { value: '07', label: 'LAMP OBJECTS', accent: true },
  { value: '07', label: 'HAND VERBS', accent: false },
  { value: '2024', label: 'GRADUATION', accent: false },
]

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function HealingLampDetailPage({ project, onClose }) {
  // 浮层打开时锁住页面滚动（Esc 关闭由 App.jsx 统一处理）
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    // data-lenis-prevent 不能删：浮层打开时 SmoothScroll 会 lenis.stop()，
    // 而 Lenis 的 stop 会对滚轮事件直接 preventDefault —— 没有这个属性整页划不动。
    // z-[200] 由 App.jsx 的详情浮层外壳提供，重复挂会让浮层 DOM 计数虚增。
    <div
      data-lenis-prevent
      className="fixed inset-0 overflow-y-auto overscroll-contain"
      style={{ backgroundColor: PAPER, fontFamily: FONT }}
    >
      {/* ===== 吸顶导航（纸张色） ===== */}
      <div
        className="sticky top-0 z-40"
        style={{ backgroundColor: 'rgba(245,240,232,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(21,21,21,0.12)' }}
      >
        <div className="mx-auto flex max-w-[1340px] items-center justify-between gap-4 px-4 py-3.5 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="truncate text-lg font-black leading-none tracking-tight" style={{ color: INK }}>YANG.</div>
            <span className="hidden rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-[0.16em] sm:inline" style={{ borderColor: 'rgba(21,21,21,0.2)', color: 'rgba(21,21,21,0.55)' }}>
              HEALING LIGHTS / GRADUATION
            </span>
          </div>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollToId(n.id)}
                className="text-[13px] font-semibold transition-colors"
                style={{ color: 'rgba(21,21,21,0.6)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = INK }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(21,21,21,0.6)' }}
              >
                {n.en}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-full px-6 py-2.5 text-[12px] font-bold text-white transition-transform hover:-translate-y-0.5 max-lg:min-h-[44px]"
            style={{ backgroundColor: INK }}
          >
            Return
          </button>
        </div>
      </div>

      {/* ===== 封面 ===== */}
      <section id="g-cover" className="relative scroll-mt-20">
        <div className="mx-auto max-w-[1340px] px-6 pb-14 pt-12 md:px-8 md:pb-16 md:pt-16 lg:px-12">
          {/* 标题区：左标题 / 右计数 */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-end">
            <Reveal>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-block  px-3 py-0.5 text-[10px] font-black tracking-[0.2em]" style={{ backgroundColor: INK, color: PAPER }}>
                  PROJECT 04 · 毕业设计
                </span>
                <span className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: 'rgba(21,21,21,0.45)' }}>2024</span>
              </div>

              <h1
                className="leading-[0.92]"
                style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(2.6rem, 6vw, 5.2rem)', letterSpacing: '-0.02em', color: INK }}
              >
                情绪疗愈灯具
              </h1>
              <div className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
                INTERACTION × EMOTIONAL HEALING
              </div>

              <p className="mt-5 max-w-[58ch] text-sm leading-relaxed" style={{ color: 'rgba(21,21,21,0.62)' }}>
                {project?.desc || '七盏以「手的动作」为开关的交互灯具，把照明开关藏进材质的缝隙里。'}
              </p>
            </Reveal>

            {/* 计数块：桌面竖排、手机横排，用 3px 黑缝连成一块 */}
            <Reveal delay={0.08}>
              <div className="grid grid-cols-3 gap-[3px] border-[3px] lg:grid-cols-1" style={{ borderColor: INK, background: INK }}>
                {STATS.map((s) => (
                  <div key={s.label} className="p-4 lg:px-5 lg:py-4" style={{ background: PAPER }}>
                    <div className="font-mono text-2xl font-black leading-none md:text-3xl" style={{ color: s.accent ? ACCENT : INK }}>
                      {s.value}
                    </div>
                    <div className="mt-1.5 text-[10px] font-bold tracking-[0.2em]" style={{ color: 'rgba(21,21,21,0.5)' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* 通栏主图：整幅，不再被左栏文字挤窄 */}
          <Reveal delay={0.12}>
            <div className="relative mt-3 overflow-hidden border-[3px] md:mt-12" style={{ borderColor: INK, backgroundColor: '#000' }}>
              <img
                src={project?.image || asset('/lamps/grad/02-campfire.webp')}
                alt={project?.title || '情绪疗愈灯具'}
                loading="eager"
                decoding="async"
                className="block h-[290px] w-full object-contain md:h-[430px] lg:h-[520px]"
                style={{ objectPosition: project?.imagePosition || '50% 45%' }}
              />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em]" style={{ backgroundColor: ACCENT, color: INK }}>
                N°02 · CAMPFIRE
              </span>
              <span className="absolute bottom-3 right-3 hidden px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] sm:block" style={{ backgroundColor: PAPER, color: INK }}>
                07 OBJECTS · 07 VERBS
              </span>
            </div>
          </Reveal>

          {/* 规格带：三条并排，替代原来堆在左栏的四行描述列表 */}
          {Array.isArray(project?.specs) && project.specs.length > 0 && (
            <Reveal delay={0.16}>
              <dl className="mt-10 grid grid-cols-1 gap-6 border-t-[3px] pt-6 md:grid-cols-3 md:gap-10" style={{ borderColor: INK }}>
                {project.specs.map((s) => (
                  <div key={s.label} className="border-b border-dashed pb-4 md:border-b-0 md:pb-0" style={{ borderColor: 'rgba(21,21,21,0.2)' }}>
                    <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(21,21,21,0.4)' }}>
                      {s.label}
                    </dt>
                    <dd className="mt-2 text-[13px] leading-relaxed" style={{ color: 'rgba(21,21,21,0.78)' }}>
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </section>

      <DetailFold title="展开七盏灯的完整展板" meta="SEVEN OBJECTS · SEVEN HAND VERBS">
        <div id="g-board" className="scroll-mt-20">
          <HealingLamps />
        </div>
      </DetailFold>

      {/* ===== 页脚：深色收口 ===== */}
      <footer style={{ backgroundColor: INK }}>
        <div className="h-[3px] w-full" style={{ backgroundColor: ACCENT }} />
        <div className="mx-auto flex max-w-[1340px] flex-wrap items-center justify-between gap-6 px-6 py-12 md:px-8 lg:px-12">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: 'rgba(245,240,232,0.45)' }}>
              SEVEN OBJECTS · SEVEN HAND VERBS
            </div>
            <div className="mt-3 max-w-[46ch] text-[15px] leading-relaxed" style={{ color: 'rgba(245,240,232,0.78)' }}>
              开关被藏进材质的缝隙里——不是按按钮，而是和物握手。
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full px-6 py-3 text-[12px] font-black transition-transform hover:-translate-y-0.5 max-lg:min-h-[44px]"
            style={{ backgroundColor: ACCENT, color: INK }}
          >
            返回作品集 →
          </button>
        </div>
      </footer>
    </div>
  )
}
