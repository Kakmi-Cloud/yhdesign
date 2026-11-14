import { Reveal, RevealStagger } from './Reveal'
import { asset } from '../assetPath'

/**
 * AiLampLab —— 实习期间「AI 生成 · 形态探索」区块（孟菲斯海报风）
 *
 * 它在 PROJECT 03「实习灯具设计」里是 SERIES 02，接在孔雀石 × 黄铜（暗色）下面。
 * 三段底色各管一种气质：01 暗色（材料特写）→ 02 纯白（海报墙）。
 * 所以这里的白不是"默认白"，是设计的一环 —— 不要改成米色或深色。
 * 它也不跟着页面皮肤变：皮肤换的是外壳，这一段的底色是它的版式逻辑。
 *
 * 版式逻辑（改动前先读）：
 *  1. 头是孟菲斯拼贴：橙圆 + 蓝三角 + 粉星芒 + 大斜体标题，边框 3px 墨黑。
 *  2. 主角（棱纹玻璃水滴）通栏，四角压白底标签，是整个区块的视觉爆点。
 *  3. 剩下四盏 2×2，每张图背后垫一个半透明孟菲斯形状（圆 / blob / 三角 / 星）。
 *  4. 形状颜色全部取自灯图本身，是静态装饰 —— 不加动画、不改色。
 *
 * 素材：md 点名的 5 张已全部到位（其余 11 张通用轻奢款按 md 要求淘汰）。
 * 原图 18.4MB 已转 WebP 压到 0.22MB，长边上限 1600（主角）/ 1200（卡片）。
 */

const INK = '#151515'
const ACCENT = '#E67E33'
const DISPLAY = "'Oswald','Noto Sans SC',sans-serif"

const MINI_LAMPS = [
  {
    n: '02',
    img: asset('/lamps/ai/02-color-block.webp'),
    name: '拼接圆柱灯',
    en: 'BLOCK COLUMN',
    shape: 'circle',
    shapeColor: '#C1704A',
    desc: '陶土红 × 鼠尾草绿 × 黄铜带。几何体的撞色实验。',
    pos: '50% 50%',
  },
  {
    n: '03',
    img: asset('/lamps/ai/03-wave-layers.webp'),
    name: '音浪波浪灯',
    en: 'WAVE LAYERS',
    shape: 'blob',
    shapeColor: '#9CB0C9',
    desc: '白色亚克力层叠成浪，光沿着等高线走。',
    pos: '50% 45%',
  },
  {
    n: '04',
    img: asset('/lamps/ai/04-alabaster-sculpt.webp'),
    name: '云石曲线装置',
    en: 'ALABASTER RIBBON',
    shape: 'triangle',
    shapeColor: '#D9B98A',
    desc: '云石薄片与黄铜曲线交织，白盒展厅里的雕塑。',
    pos: '50% 45%',
  },
  {
    n: '05',
    img: asset('/lamps/ai/05-marble-columns.webp'),
    name: '大理石光柱',
    en: 'MARBLE LIGHT COLUMN',
    shape: 'star',
    shapeColor: '#B8B8B8',
    desc: '卡拉拉白大理石劈开，光从缝里成柱。',
    pos: '50% 50%',
  },
]

// 孟菲斯几何形状：绝对定位在灯图后面当背景
function MemphisShape({ type, color }) {
  if (type === 'circle') {
    return <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full" style={{ background: color, opacity: 0.25 }} />
  }
  if (type === 'triangle') {
    return (
      <div
        className="absolute -bottom-4 -right-4 h-0 w-0"
        style={{
          borderLeft: '50px solid transparent',
          borderRight: '50px solid transparent',
          borderBottom: '90px solid ' + color,
          opacity: 0.25,
        }}
      />
    )
  }
  if (type === 'star') {
    return (
      <div
        className="absolute -right-4 -top-4 h-12 w-12"
        style={{ background: color, opacity: 0.3, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
      />
    )
  }
  // blob
  return (
    <div
      className="absolute -bottom-6 -left-6 h-28 w-28"
      style={{ background: color, opacity: 0.25, borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%' }}
    />
  )
}

export default function AiLampLab() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="h-[3px] w-full" style={{ background: ACCENT }} />

      <div className="mx-auto max-w-[1340px] px-6 py-16 md:px-8 md:py-24 lg:px-12">
        {/* ===== 区块头：孟菲斯拼贴 ===== */}
        <Reveal>
          <div className="relative mb-12 border-[3px] p-6 md:p-10" style={{ borderColor: INK }}>
            {/* 装饰几何：手机宽度下只留橙圆，三角与星芒在窄屏会压到大标题 */}
            <div className="absolute -left-3 -top-3 h-16 w-16 rounded-full" style={{ background: ACCENT }} />
            <div
              className="absolute -top-3 right-24 hidden h-0 w-0 sm:block"
              style={{ borderLeft: '24px solid transparent', borderRight: '24px solid transparent', borderBottom: '42px solid #4A6FA5' }}
            />
            <div
              className="absolute bottom-4 right-6 hidden h-10 w-10 sm:block"
              style={{ background: '#D48BA8', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
            />

            <div className="relative">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {/* 印章倾角统一为 -2°：与封面印记、SERIES 01 的印章同一角度，
                    原先这里是 +2°，两个系列并排看会像两个方向。 */}
                <span className="inline-block -rotate-2 px-3 py-0.5 text-[10px] font-black tracking-[0.2em] text-white" style={{ background: INK }}>
                  SERIES 02 · AI LAB
                </span>
                <span className="text-[10px] font-bold tracking-[0.3em]" style={{ color: 'rgba(21,21,21,0.5)' }}>
                  INTERNSHIP · 2024
                </span>
              </div>
              <h2
                className="leading-[0.9]"
                style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(2.8rem, 7vw, 6rem)', letterSpacing: '-0.01em', color: INK }}
              >
                AI 生成 <span style={{ color: ACCENT }}>×</span> <br />
                形态探索
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed" style={{ color: 'rgba(21,21,21,0.65)' }}>
                用生成模型跑出来的灯具草稿。不是最终方案，是把「材质 × 形态 × 配色」扔进概率空间后，
                捞出来的五个有趣样本。
              </p>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t-[3px] pt-4 font-mono text-[10px] font-black tracking-[0.22em]" style={{ borderColor: INK, color: 'rgba(21,21,21,0.45)' }}>
                <span>16 DRAFTS</span>
                <span style={{ color: ACCENT }}>→ 05 KEPT</span>
                <span>AIGC · 2024</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ===== 主角：彩色玻璃水滴 ===== */}
        <Reveal>
          <div className="relative mb-10 border-[3px]" style={{ borderColor: INK }}>
            <img
              src={asset("/lamps/ai/01-glass-drops.webp")}
              alt="彩色棱纹玻璃水滴吊灯"
              loading="lazy"
              decoding="async"
              className="block h-[300px] w-full object-cover sm:h-[420px] md:h-[540px] lg:h-[600px]"
              style={{ objectPosition: '50% 42%' }}
            />
            {/* 压角标签 */}
            <div className="absolute left-0 top-0 border-b-[3px] border-r-[3px] bg-white px-4 py-2" style={{ borderColor: INK }}>
              <div className="font-mono text-[10px] font-black tracking-[0.28em]" style={{ color: ACCENT }}>N°01 · GLASS DROPS</div>
              <div className="mt-0.5 text-base font-black md:text-lg" style={{ color: INK }}>棱纹玻璃水滴</div>
            </div>
            <div className="absolute bottom-0 right-0 border-l-[3px] border-t-[3px] bg-white px-4 py-2 text-right" style={{ borderColor: INK }}>
              <div className="text-[11px] leading-snug" style={{ color: 'rgba(21,21,21,0.7)' }}>
                蓝 / 粉 / 琥珀 × 黄铜吊线
              </div>
            </div>
          </div>
        </Reveal>

        {/* ===== 4 盏小灯：每张卡后垫一个孟菲斯色块 ===== */}
        <RevealStagger step={0.1} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {MINI_LAMPS.map((lamp) => (
            <div key={lamp.n} className="group relative p-6">
              <MemphisShape type={lamp.shape} color={lamp.shapeColor} />
              <div
                className="relative border-[3px] bg-white transition-transform duration-300 group-hover:-translate-y-1"
                style={{ borderColor: INK }}
              >
                <img
                  src={lamp.img}
                  alt={lamp.name}
                  loading="lazy"
                  decoding="async"
                  className="block h-[240px] w-full object-cover md:h-[330px]"
                  style={{ objectPosition: lamp.pos }}
                />
                <div className="flex items-start justify-between gap-3 border-t-[3px] p-4" style={{ borderColor: INK }}>
                  <div>
                    <div className="font-mono text-[10px] font-black tracking-[0.28em]" style={{ color: ACCENT }}>
                      {lamp.n} · {lamp.en}
                    </div>
                    <div className="mt-1 text-base font-black" style={{ color: INK }}>{lamp.name}</div>
                  </div>
                  <div className="max-w-[55%] text-right text-[11px] leading-snug" style={{ color: 'rgba(21,21,21,0.6)' }}>
                    {lamp.desc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </RevealStagger>

        {/* ===== 底部说明 ===== */}
        <Reveal>
          <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t-[3px] border-dashed pt-6 md:flex-row md:items-center" style={{ borderColor: 'rgba(21,21,21,0.3)' }}>
            <div className="font-mono text-[11px] font-bold tracking-[0.25em]" style={{ color: 'rgba(21,21,21,0.5)' }}>
              AI PROMPT · MATERIAL × FORM × COLOR
            </div>
            <div className="text-sm" style={{ color: 'rgba(21,21,21,0.7)' }}>
              五条探索方向：<span className="font-black" style={{ color: INK }}>撞色 / 流体 / 雕塑 / 材料 / 几何</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
