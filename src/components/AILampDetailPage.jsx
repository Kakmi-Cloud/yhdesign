import { useEffect } from 'react'
import MalachiteLamps from './MalachiteLamps'
import AiLampLab from './AiLampLab'
import { Reveal } from './Reveal'
import { ACCENT, LAMP_THEME as T, ON_ACCENT } from './aiLampTheme'
import { asset } from '../assetPath'
import DetailFold from './DetailFold'

/**
 * AILampDetailPage —— 「实习灯具设计」全屏详情页（PROJECT 03）
 *
 * ── 这一页包含什么 ──
 * 实习期间做的两组灯具，同页顺序往下铺：
 *   SERIES 01  孔雀石 × 黄铜  天然矿石 × 拉丝黄铜的材质探索（六盏 + 主视觉）
 *   SERIES 02  AI 生成 × 形态探索  孟菲斯海报风的形态样本（五盏）
 * 毕设「情绪疗愈灯具」不走这一页 —— 它是交互灯具，已独立成项目 08。
 *
 * ── 外壳 ──
 * 走墨黑 #151515 + 3px 硬边框，与首页 06 卡片同色；令牌见 aiLampTheme.js。
 * 选黑是为了让"底"只有一个：孔雀石的暗、孟菲斯的白，都是黑底上的两段内容，
 * 而不是三种互相打断的底色。节奏是 墨黑外壳 → 深色材质章 → 纯白海报章 → 更深页脚。
 * 于是那一整段孟菲斯海报墙成了全页唯一的亮部，也就是视觉爆点。
 *
 * 结构：封面 → 系列索引 → SERIES 01 孔雀石 → SERIES 02 AI LAB → 页脚
 */

const FONT = "'Inter','Noto Sans SC',sans-serif"
const DISPLAY = "'Oswald','Noto Sans SC',sans-serif"

// 两个系列的索引（同页顺序往下铺）。
// 注意：毕设「情绪疗愈灯具」已独立成项目 08，不再属于本页系列，所以这里不含它。
const SERIES = [
  { no: '01', cn: '孔雀石 × 黄铜', en: 'MALACHITE × BRASS', note: '实习 · 天然矿石材质探索', anchor: 'l-malachite' },
  { no: '02', cn: 'AI 生成 × 形态探索', en: 'AI LAB · FORM STUDY', note: '实习 · 孟菲斯海报风，五盏样本', anchor: 'l-ailab' },
]

// 导航：中文引导。这一页的内容分组（材质探索 / AI 形态）对中文读者更直接，
// 英文缩写 MALACHITE / AI LAB 反而是要翻译一遍才知道去哪。
const NAV = [
  { id: 'l-cover', label: '概览' },
  { id: 'l-series', label: '系列' },
  { id: 'l-malachite', label: '孔雀石' },
  { id: 'l-ailab', label: 'AI 形态' },
]

// 封面右侧的计数块：两张底各自的数量先亮出来，再往下看细节
const STATS = [
  { value: '07', label: 'SERIES 01 LAMPS', accent: true },
  { value: '05', label: 'SERIES 02 LAMPS', accent: false },
  { value: 'AIGC', label: 'FORM WORKFLOW', accent: false },
]

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function AILampDetailPage({ project, onClose }) {
  // 浮层打开时锁住页面滚动（与 ProjectDetailPage 一致；Esc 关闭由 App.jsx 统一处理）
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
      style={{ backgroundColor: T.bg, fontFamily: FONT }}
    >
      {/* ===== 吸顶导航 ===== */}
      <div
        className="sticky top-0 z-40"
        style={{ backgroundColor: T.navBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${T.navLine}` }}
      >
        <div className="mx-auto flex max-w-[1340px] items-center justify-between gap-4 px-4 py-3.5 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="truncate text-lg font-black leading-none tracking-tight" style={{ color: T.ink }}>YANG.</div>
            <span
              className="hidden rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-[0.16em] sm:inline"
              style={{ borderColor: T.navLine, color: T.ink3 }}
            >
              灯具设计 / 实习项目
            </span>
          </div>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollToId(n.id)}
                className="text-[13px] font-semibold transition-colors"
                style={{ color: T.ink2 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT }}
                onMouseLeave={(e) => { e.currentTarget.style.color = T.ink2 }}
              >
                {n.label}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-full px-6 py-2.5 text-[12px] font-bold transition-transform hover:-translate-y-0.5 max-lg:min-h-[44px]"
            style={{ backgroundColor: T.btnBg, color: T.btnInk }}
          >
            Return
          </button>
        </div>
      </div>

      {/* ===== 封面：项目标题 + 现有项目数据 ===== */}
      <section id="l-cover" className="relative scroll-mt-20 overflow-hidden">
        <div className="mx-auto max-w-[1340px] px-6 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16 lg:px-12">
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)] lg:items-end lg:gap-x-10 lg:gap-y-0">
            <Reveal className="max-lg:order-1 lg:col-start-1 lg:row-start-1">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-block  px-3 py-0.5 text-[10px] font-black tracking-[0.2em]" style={{ backgroundColor: ACCENT, color: ON_ACCENT }}>
                  PROJECT 03 · 产品设计
                </span>
                <span className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: T.ink3 }}>INTERNSHIP ARCHIVE</span>
              </div>

              <h1
                className="leading-[0.94]"
                style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(2.4rem, 5.6vw, 5rem)', letterSpacing: '-0.02em', color: T.ink }}
              >
                实习灯具设计
              </h1>
              <div className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
                INTERNSHIP LAMP DESIGN
              </div>
            </Reveal>

            <Reveal className="max-lg:order-3 lg:col-start-1 lg:row-start-2">
              <p className="mt-5 max-w-[54ch] text-sm leading-relaxed" style={{ color: T.ink2 }}>
                {project?.desc || '实习期间完成的灯具外观设计：天然矿石与金属的材质探索，以及 AI 辅助下的形态推演。'}
              </p>

              {/* 两张底各自的数量 */}
              <div
                className="mt-8 flex flex-wrap gap-x-12 gap-y-5 pt-6"
                style={{ borderTop: `3px solid ${T.rule}` }}
              >
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div
                      className="font-mono text-2xl font-black md:text-3xl"
                      style={{ color: s.accent ? ACCENT : T.ink }}
                    >
                      {s.value}
                    </div>
                    <div className="mt-1 text-[10px] font-bold tracking-[0.2em]" style={{ color: T.ink3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* 项目原有规格：直接沿用项目数据，不另外编 */}
              {Array.isArray(project?.specs) && project.specs.length > 0 && (
                <dl className="mt-8 flex flex-col" style={{ borderTop: `3px solid ${T.rule}` }}>
                  {project.specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-6"
                      style={{ borderBottom: `1px dashed ${T.hair}` }}
                    >
                      <dt className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.18em] sm:w-[140px]" style={{ color: T.ink3 }}>{s.label}</dt>
                      <dd className="text-[13px] leading-relaxed" style={{ color: T.ink2 }}>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Reveal>

            <Reveal delay={0.08} className="max-lg:order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-end">
              {/* 手机端加 max-lg:w-full：显式 width:100% + height:300px 会让 inline
                  aspect-ratio 失效；否则 16/10 会把宽度撑到 480px 造成横向溢出 */}
              <div
                className="relative overflow-hidden border-[3px] bg-black max-lg:h-[330px] max-lg:w-full"
                style={{ aspectRatio: '16 / 10', borderColor: T.frame }}
              >
                <img
                  src={project?.image || asset('/lamps/ai/01-glass-drops.webp')}
                  alt={project?.title || '实习灯具设计'}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain bg-[#f4f2ed]"
                  style={{ objectPosition: project?.imagePosition || '50% 50%' }}
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em]" style={{ backgroundColor: ACCENT, color: ON_ACCENT }}>
                  PROJECT COVER
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== 系列索引 ===== */}
      <section id="l-series" className="relative scroll-mt-20">
        <div className="mx-auto max-w-[1340px] px-6 py-10 md:px-8 lg:px-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: T.ink3 }}>SERIES INDEX / 02</span>
            <span className="text-[11px] font-medium" style={{ color: T.ink3 }}>
              两个系列同页顺序排列，从上到下
            </span>
          </div>

          {/* 3px 硬边框 + 3px 内缝：沿用 08 计数块的做法，边框色透过缝隙形成分格 */}
          <div
            className="grid grid-cols-1 gap-[3px] border-[3px] md:grid-cols-2"
            style={{ borderColor: T.rule, background: T.rule }}
          >
            {SERIES.map((s) => (
              <button
                key={s.no}
                type="button"
                onClick={() => scrollToId(s.anchor)}
                className="flex items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.04]"
                style={{ backgroundColor: T.cell }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-black" style={{ color: ACCENT }}>{s.no}</span>
                    <span className="text-sm font-black" style={{ color: T.ink }}>{s.cn}</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.16em]" style={{ color: T.ink3 }}>{s.en}</div>
                  <div className="mt-2 text-[11px] leading-relaxed" style={{ color: T.ink2 }}>{s.note}</div>
                </div>
                <span
                  className="mt-0.5 shrink-0 whitespace-nowrap px-2 py-0.5 font-mono text-[9px] font-black tracking-[0.16em]"
                  style={{ backgroundColor: ACCENT, color: ON_ACCENT }}
                >
                  查看
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <DetailFold title="展开两个系列的完整图集" meta="SERIES 01 MALACHITE × BRASS · SERIES 02 AI LAB">
        {/* ===== SERIES 01：孔雀石 × 黄铜（页内深色章节） ===== */}
        <div id="l-malachite" className="scroll-mt-20">
          <MalachiteLamps bg={T.malachiteBg} />
        </div>

        {/* ===== SERIES 02：AI 生成 × 形态探索（纯白孟菲斯） ===== */}
        <div id="l-ailab" className="scroll-mt-20">
          <AiLampLab />
        </div>
      </DetailFold>

      {/* ===== 页脚 ===== */}
      <footer style={{ backgroundColor: T.footerBg }}>
        <div className="h-[3px] w-full" style={{ backgroundColor: ACCENT }} />
        <div className="mx-auto flex max-w-[1340px] flex-wrap items-center justify-between gap-5 px-6 py-10 md:px-8 lg:px-12">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: T.footerInk2 }}>
              MALACHITE × BRASS · AI LAB
            </div>
            <div className="mt-2 text-[13px]" style={{ color: T.footerInk }}>
              两个系列：天然矿石的材质探索，与生成模型跑出的形态样本。
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full px-6 py-3 text-[12px] font-bold transition-transform hover:-translate-y-0.5 max-lg:min-h-[44px]"
            style={{ backgroundColor: ACCENT, color: ON_ACCENT }}
          >
            返回作品集 →
          </button>
        </div>
      </footer>
    </div>
  )
}
