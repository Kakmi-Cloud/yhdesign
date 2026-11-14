import { Reveal, RevealStagger } from './Reveal'
import { asset } from '../assetPath'

/**
 * MalachiteLamps —— 「孔雀石 × 黄铜」灯具系列（实习灯具设计 · SERIES 01）
 *
 * 构图语言参考 SRN_LIGHT MODULE：暗背景、产品主视觉压右、左侧虚线材料标记、克制不花哨。
 * 三条硬规则（改动前先读）：
 *  1. 整段底色是暗色 —— 让"材料特写"有画廊射灯感。具体取值由页面通过 bg prop 传入：
 *     「实习灯具设计」页给 #151515，与外壳同色，于是两段深色连成一片，
 *     靠顶部的橙线标记系列起点。默认 #0B1512（深墨绿），单独引用时行为不变。
 *  2. UI 强调色只用橙 #E67E33；孔雀石绿 / 黄铜金 / 云石白只出现在灯图本身与色板点上，
 *     绝不能染到标题、标签、按钮上。
 *  3. 不做动效（hero 不做 parallax、灯卡不做 3D 翻转）。这一段是材料特写，静比动高级；
 *     灯卡只在 hover 时图片微放大 4% + 顶边橙线长出，平时完全静止。
 *
 * 移动端：三处材料标记用 hidden md:block 关掉（窄屏会挤成一团），灯卡降为单列。
 */

// 系列内 6 款灯型
const LAMPS = [
  {
    img: asset('/lamps/01-ring-livingroom.webp'),
    name: '光环吊灯',
    en: 'RING HALO',
    room: '挑高客厅',
    mat: '孔雀石 · 黄铜 · 云石',
  },
  {
    img: asset('/lamps/02-petal-bedroom.webp'),
    name: '镂空花瓣吊灯',
    en: 'PETAL LACE',
    room: '卧室',
    mat: '孔雀石 · 云石 · 黄铜',
  },
  {
    img: asset('/lamps/03-linear-dining.webp'),
    name: '三头线性餐吊灯',
    en: 'LINEAR TRIO',
    room: '餐厅',
    mat: '孔雀石 · 拉丝黄铜',
  },
  {
    img: asset('/lamps/04-alabaster-stair.webp'),
    name: '云石圆盘吊灯',
    en: 'DISK STACK',
    room: '楼梯空间',
    mat: '云石 · 孔雀石 · 黄铜',
  },
  {
    img: asset('/lamps/05-cone-bar.webp'),
    name: '锥形光缝吊灯',
    en: 'CONE SLIT',
    room: '吧台',
    mat: '孔雀石 · 拉丝黄铜',
  },
  {
    img: asset('/lamps/06-ring-livingroom-2.webp'),
    name: '环形云石吊灯',
    en: 'RING × ALABASTER',
    room: '客厅',
    mat: '孔雀石 · 云石 · 黄铜',
  },
]

// 材料标记：色点 + 虚线垂线 + 名称，仅在桌面端显示
const MaterialCallout = ({ x, y, label, en, desc, color }) => (
  <div className="pointer-events-none absolute hidden md:block" style={{ left: x, top: y }}>
    <div className="flex items-start gap-3">
      <div className="mt-1 flex flex-col items-center">
        <span className="block h-2 w-2 rounded-full" style={{ background: color }} />
        <span
          className="mt-1 block w-px flex-1 border-l border-dashed"
          style={{ borderColor: 'rgba(255,255,255,0.35)', minHeight: 40 }}
        />
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color }}>{en}</div>
        <div className="mt-0.5 text-sm font-bold text-white">{label}</div>
        <div className="mt-0.5 max-w-[160px] text-[11px] leading-relaxed text-white/50">{desc}</div>
      </div>
    </div>
  </div>
)

export default function MalachiteLamps({ bg = '#0B1512' }) {
  return (
    <section className="relative overflow-hidden" style={{ background: bg }}>
      {/* 顶部细分割：橙色 3px，标记一个系列的起点 */}
      <div className="h-[3px] w-full bg-[#E67E33]" />

      <div className="mx-auto max-w-[1340px] px-6 py-16 md:px-8 md:py-24 lg:px-12">
        {/* 区块头 */}
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="inline-block -rotate-2 bg-[#E67E33] px-3 py-0.5 text-[10px] font-black tracking-[0.2em] text-[#151515]">
                  SERIES 01 · INTERNSHIP
                </span>
                <span className="text-[10px] font-bold tracking-[0.3em] text-white/40">2024</span>
              </div>
              <h2
                className="leading-[0.95] text-white"
                style={{ fontFamily: "'Oswald','Noto Sans SC',sans-serif", fontWeight: 900, fontSize: 'clamp(2.6rem, 6vw, 5.5rem)', letterSpacing: '-0.01em' }}
              >
                孔雀石 <span className="text-white/30">×</span> 黄铜
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
                以天然孔雀石的层叠纹理为视觉母题，搭配拉丝黄铜与云石透光。
                七种灯型，同一种材质语言，在客厅、餐厅、卧室、吧台之间复用。
              </p>
            </div>
            <div className="hidden text-right md:block">
              <div className="text-[10px] font-bold tracking-[0.3em] text-white/40">MATERIAL STUDY</div>
              <div className="mt-1 text-lg font-black text-white">07 LAMPS</div>
            </div>
          </div>
        </Reveal>

        {/* Hero：主视觉 + 材料标记 */}
        <Reveal>
          <div className="relative mb-14 overflow-hidden border-[3px] border-white/12 bg-black">
            <img
              src={asset("/lamps/hero-malachite-ring.webp")}
              alt="多层环形孔雀石吊灯"
              loading="lazy"
              decoding="async"
              className="block h-[420px] w-full object-cover object-center md:h-[560px]"
            />
            {/* 暗色渐变压暗左侧，给文字留底 */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(100deg, rgba(11,21,18,0.92) 0%, rgba(11,21,18,0.55) 38%, rgba(11,21,18,0) 65%)' }}
            />

            {/* 左侧标题 */}
            <div className="absolute left-6 top-6 md:left-12 md:top-12">
              <div className="text-[10px] font-black tracking-[0.3em] text-[#E67E33]">SIGNATURE PIECE</div>
              <div
                className="mt-2 leading-[0.9] text-white"
                style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem, 4.5vw, 4rem)' }}
              >
                RING<br />OBERVE
              </div>
              <div className="mt-3 max-w-[260px] text-[12px] leading-relaxed text-white/65">
                三层环体：外黄铜、中孔雀石、内云石。环形光带分层点亮，像行星轨道。
              </div>
            </div>

            {/* 三处材料标记（桌面端） */}
            <MaterialCallout
              x="62%" y="18%"
              label="孔雀石" en="MALACHITE"
              desc="天然矿石，深绿层叠纹"
              color="#2F9E6E"
            />
            <MaterialCallout
              x="78%" y="38%"
              label="拉丝黄铜" en="BRUSHED BRASS"
              desc="暖金金属骨架"
              color="#D4A85A"
            />
            <MaterialCallout
              x="58%" y="62%"
              label="云石" en="ALABASTER"
              desc="半透温白，柔光扩散"
              color="#F0E6D2"
            />
          </div>
        </Reveal>

        {/* 6 灯网格：卡片直接作为 children 传入，RevealStagger 才会逐张错峰进场 */}
        <RevealStagger step={0.08} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LAMPS.map((lamp) => (
            <div
              key={lamp.name}
              className="group relative overflow-hidden border-[3px] border-white/12 bg-black"
            >
              <div className="overflow-hidden">
                <img
                  src={lamp.img}
                  alt={lamp.name}
                  loading="lazy"
                  decoding="async"
                  className="block h-[260px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div>
                  <div className="text-[9px] font-black tracking-[0.28em] text-[#E67E33]">{lamp.en}</div>
                  <div className="mt-1 text-lg font-black text-white">{lamp.name}</div>
                  <div className="mt-0.5 text-[11px] text-white/45">{lamp.room} · {lamp.mat}</div>
                </div>
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-[#2F9E6E]" />
              </div>
              {/* hover 顶边橙线 */}
              <span className="absolute left-0 top-0 h-[3px] w-0 bg-[#E67E33] transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </RevealStagger>

        {/* 材料色板条 */}
        <Reveal>
          <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
            <span className="text-[10px] font-black tracking-[0.3em] text-white/40">MATERIAL PALETTE —</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2">
                <span className="block h-6 w-6 rounded-sm border border-white/20" style={{ background: 'linear-gradient(135deg,#1a5c3e,#2F9E6E,#0d3d27)' }} />
                <span className="text-[11px] text-white/70">孔雀石</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="block h-6 w-6 rounded-sm border border-white/20" style={{ background: 'linear-gradient(135deg,#b8863e,#D4A85A,#8a6428)' }} />
                <span className="text-[11px] text-white/70">拉丝黄铜</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="block h-6 w-6 rounded-sm border border-white/20" style={{ background: 'linear-gradient(135deg,#e8d9bd,#F0E6D2,#c9b48d)' }} />
                <span className="text-[11px] text-white/70">云石</span>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
