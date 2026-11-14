import { Reveal } from './Reveal'
import { asset } from '../assetPath'

/**
 * HealingLamps —— 「情绪疗愈灯具」毕设系列（暖纸展板风）
 *
 * 这是独立项目「情绪疗愈灯具」的主体区块，不挂在《心景》或「实习灯具设计」下面。
 * 原因：毕设这批是交互灯具（手的动作即开关），既不是 AIGC 形态探索，也不属于心景的
 * 模块化木作体系；单独成页才不会让题材互相稀释。
 *
 * 版式逻辑（改动前先读）：
 *  1. 开场是「七盏灯索引条」——七件等权重，先给全貌再往下看细节，同时充当跳转导航。
 *  2. 01 / 02 是主推对象，各占一条通栏；03–07 收进一块 6 栏展板，用 3/3 + 2/2/2 的
 *     非等宽切分制造节奏，而不是五张一模一样的卡片。
 *  3. 结尾用一条虚线说明带同时收束「七个动作」，不再让说明卡去和灯具抢格子。
 *
 * 三条硬规则：
 *  1. 底色是暖米纸色 #F5F0E8，与「实习灯具设计」的暗色章节形成「冷→暖」的呼吸。
 *     不要改成深色 —— 这一段故意是设计展板，静比动高级。
 *  2. 强调色只用橙 #E67E33，配 #151515 墨黑描边与 3px 硬分隔。
 *  3. 不加 parallax / 3D / 粒子。图片只在 hover 时放大 3%。
 *
 * 素材说明（经两轮人工复核定稿，改图前务必先看这里）：
 *  01 填补心空 —— 手部交互 / 客厅氛围 2 张
 *  02 篝火灯 —— 暗底电子火焰（不是暖棕木色那张）
 *  03 切割立方灯 / 05 负空间圆环灯 —— 各 1 张
 *  04 鹅卵石智能灯 —— 2 个视角（床头夜灯 + 另一视角），卡片 hover 换图
 *  06 体素插槽灯 —— 竖构图单张
 *  07 胡桃木圆柱层叠灯 —— 白底木质那张
 *  注意：md 里列的「04-pebble-bedside」与「01-fill-lit 点燃」并未单独提供，
 *  所以 01 只有两格；鹅卵石的第二个视角改用 04-pebble-b。
 */

const PAPER = '#F5F0E8'
const INK = '#151515'
const ACCENT = '#E67E33'
const DISPLAY = "'Oswald','Noto Sans SC',sans-serif"

// 七盏灯一览：索引条与结尾的「七个动作」共用同一份数据
const OBJECTS = [
  { n: '01', name: '填补心空', verb: '推入木块' },
  { n: '02', name: '篝火灯', verb: '添上木柴' },
  { n: '03', name: '切割立方灯', verb: '推入楔木' },
  { n: '04', name: '鹅卵石智能灯', verb: '握持变色' },
  { n: '05', name: '负空间圆环灯', verb: '环内透光' },
  { n: '06', name: '体素插槽灯', verb: '插槽投影' },
  { n: '07', name: '胡桃木圆柱层叠灯', verb: '错层发光' },
]

// 03–07：span 决定在 6 栏展板里的宽度（3/3 一行 + 2/2/2 一行），h 决定图高
const SMALL_LAMPS = [
  {
    n: '03',
    img: asset('/lamps/grad/03-cube-states.webp'),
    name: '切割立方灯',
    en: 'CUT CUBE',
    verb: '推入楔木',
    desc: 'Standby 暗红 → Ignition 橙 → Full Power 全亮。两瓣立方被橡木楔切开。',
    span: 'sm:col-span-2 lg:col-span-3',
    h: 'h-[250px] lg:h-[380px]',
  },
  {
    n: '04',
    img: asset('/lamps/grad/04-pebble-a.webp'),
    img2: asset('/lamps/grad/04-pebble-b.webp'),
    name: '鹅卵石智能灯',
    en: 'PEBBLE',
    verb: '握持变色',
    desc: '可掬在手心的暖白卵石，底座一圈 RGB 光。床头柜上是夜灯，握在手里是氛围。',
    span: 'lg:col-span-3',
    h: 'h-[250px] lg:h-[380px]',
    pos: '50% 50%',
  },
  {
    n: '05',
    img: asset('/lamps/grad/05-ring-negative.webp'),
    name: '负空间圆环灯',
    en: 'NEGATIVE RING',
    verb: '环内透光',
    desc: '白色圆环抱住一块橡木，光从木与环的缝隙溢出。',
    span: 'lg:col-span-2',
    h: 'h-[230px] lg:h-[290px]',
  },
  {
    n: '06',
    img: asset('/lamps/grad/06-voxel.webp'),
    name: '体素插槽灯',
    en: 'VOXEL SLOT',
    verb: '插槽投影',
    desc: '网格灯罩把光切成方格投在墙上，雨夜里的小窗。',
    span: 'lg:col-span-2',
    h: 'h-[230px] lg:h-[290px]',
    pos: '50% 42%',
  },
  {
    n: '07',
    img: asset('/lamps/grad/07-stacked-logs.webp'),
    name: '胡桃木圆柱层叠灯',
    en: 'STACKED LOGS',
    verb: '错层发光',
    desc: '四节胡桃木圆盘错落，光从每道缝里漏出。',
    span: 'lg:col-span-2',
    h: 'h-[230px] lg:h-[290px]',
  },
]

// 填补心空的两张：手部动作 → 客厅场景（md 里的「点燃」那张未单独提供）
const FILL_SEQ = [
  { src: asset('/lamps/grad/01-fill-hand.webp'), alt: '手部交互 · 把橡木楔推入缺口' },
  { src: asset('/lamps/grad/01-fill-livingroom.webp'), alt: '客厅氛围场景' },
]

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function HealingLamps() {
  return (
    <section className="relative overflow-hidden" style={{ background: PAPER }}>
      {/* 顶部细分割：橙色 3px */}
      <div className="h-[3px] w-full" style={{ background: ACCENT }} />

      <div className="mx-auto max-w-[1340px] px-6 py-16 md:px-8 md:py-20 lg:px-12">
        {/* ===== 段落头 ===== */}
        <Reveal>
          <div
            className="mb-8 flex flex-col gap-6 border-b-[3px] pb-6 md:flex-row md:items-end md:justify-between"
            style={{ borderColor: INK }}
          >
            <div>
              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  className="inline-block  px-3 py-0.5 text-[10px] font-black tracking-[0.2em]"
                  style={{ background: INK, color: PAPER }}
                >
                  INTERACTION STUDY
                </span>
                <span className="text-sm font-black uppercase tracking-[0.12em] md:text-base" style={{ color: INK }}>
                  Hand Verbs
                </span>
                <span className="text-xs font-bold md:text-[13px]" style={{ color: 'rgba(21,21,21,0.45)' }}>
                  / 交互语言
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed md:text-[15px]" style={{ color: 'rgba(21,21,21,0.65)' }}>
                七盏以「手的动作」为开关的小灯。不是开灯，是完成一个仪式——推入木块、握住卵石、放上木柴。
                开关被藏进材质的缝隙里，你不再是按按钮，而是在和物握手。
              </p>
            </div>
            <div className="shrink-0 md:text-right">
              <div className="font-mono text-3xl font-black leading-none md:text-4xl" style={{ color: ACCENT }}>
                07
              </div>
              <div className="mt-1.5 text-[10px] font-bold tracking-[0.2em]" style={{ color: 'rgba(21,21,21,0.45)' }}>
                LIGHT OBJECTS
              </div>
            </div>
          </div>
        </Reveal>

        {/* ===== 索引条：先给全貌，再做跳转 ===== */}
        <Reveal>
          <div className="mb-12">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-black tracking-[0.3em]" style={{ color: 'rgba(21,21,21,0.4)' }}>
                INDEX / 07
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'rgba(21,21,21,0.4)' }}>
                点按跳到该盏 ↓
              </span>
            </div>
            <div
              className="grid grid-cols-2 gap-[3px] border-[3px] sm:grid-cols-4 lg:grid-cols-7"
              style={{ borderColor: INK, background: INK }}
            >
              {OBJECTS.map((o) => (
                <button
                  key={o.n}
                  type="button"
                  onClick={() => scrollToId('g-obj-' + o.n)}
                  className="flex flex-col items-start gap-1 p-3.5 text-left transition-colors hover:bg-white"
                  style={{ background: PAPER }}
                >
                  <span className="font-mono text-[11px] font-black" style={{ color: ACCENT }}>
                    N°{o.n}
                  </span>
                  <span className="text-[13px] font-black leading-tight" style={{ color: INK }}>
                    {o.name}
                  </span>
                  <span className="text-[10px] font-bold leading-tight" style={{ color: 'rgba(21,21,21,0.45)' }}>
                    {o.verb}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ===== N°01 填补心空：左文 + 右三图序列 ===== */}
        <Reveal>
          <div id="g-obj-01" className="mb-12 scroll-mt-24">
            <div
              className="grid grid-cols-1 gap-[3px] border-[3px] lg:grid-cols-12"
              style={{ borderColor: INK, background: INK }}
            >
              <div className="flex flex-col justify-between gap-8 p-6 lg:col-span-4 lg:p-8" style={{ background: PAPER }}>
                <div>
                  <div className="font-mono text-[10px] font-black tracking-[0.28em]" style={{ color: ACCENT }}>
                    N°01 · FILL THE EMPTY
                  </div>
                  <h3
                    className="mt-2 leading-[0.95]"
                    style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(1.9rem, 3.4vw, 3.2rem)', color: INK }}
                  >
                    填补心空
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(21,21,21,0.65)' }}>
                    白色方盒有一道缺口，橡木木块正好嵌入。把木块推入——灯亮；抽出——灯灭。
                    开关不是按钮，是一次「把心填上」的动作。
                  </p>
                </div>

                <div className="space-y-3 border-t-2 border-dashed pt-4 text-[12px]" style={{ borderColor: 'rgba(21,21,21,0.2)' }}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center border-2 text-[10px] font-black" style={{ borderColor: INK, color: INK }}>1</span>
                    <span style={{ color: 'rgba(21,21,21,0.7)' }}>木块抽出 → 灯暗</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center border-2 text-[10px] font-black" style={{ borderColor: INK, color: INK }}>2</span>
                    <span style={{ color: 'rgba(21,21,21,0.7)' }}>推入缺口 → 灯亮</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center border-2 text-[10px] font-black" style={{ borderColor: INK, color: INK }}>3</span>
                    <span style={{ color: 'rgba(21,21,21,0.7)' }}>留在案头，是陪伴</span>
                  </div>
                </div>
              </div>

              {/* 3px 的 gap 落在黑底容器上，形成展板的硬分隔线。
                  现在只有两格 —— 原「点燃」那张已确认为 07 层叠灯，不在这盏灯里。 */}
              <div className="grid grid-cols-2 gap-[3px] lg:col-span-8" style={{ background: INK }}>
                {FILL_SEQ.map((im) => (
                  <img
                    key={im.src}
                    src={im.src}
                    alt={im.alt}
                    loading="lazy"
                    decoding="async"
                    className="block h-[190px] w-full object-cover sm:h-72 lg:h-[420px]"
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-[11px]" style={{ color: 'rgba(21,21,21,0.4)' }}>
              左起：手部动作 → 客厅场景，同一盏灯的两个状态。
            </p>
          </div>
        </Reveal>

        {/* ===== N°02 篝火灯：与 01 镜像，形成之字形节奏 ===== */}
        <Reveal>
          <div
            id="g-obj-02"
            className="mb-12 grid scroll-mt-24 grid-cols-1 border-[3px] lg:grid-cols-12"
            style={{ borderColor: INK }}
          >
            <div className="relative order-1 lg:order-2 lg:col-span-7">
              <img
                src={asset("/lamps/grad/02-campfire.webp")}
                alt="篝火灯 · 电子火焰与木柴"
                loading="lazy"
                decoding="async"
                className="block h-[280px] w-full object-cover md:h-[400px] lg:h-[460px]"
                style={{ objectPosition: '50% 42%' }}
              />
              <span
                className="absolute bottom-4 left-4 px-3 py-1 text-[10px] font-black tracking-[0.2em]"
                style={{ background: ACCENT, color: INK }}
              >
                N°02 · CAMPFIRE
              </span>
            </div>

            <div
              className="order-2 flex flex-col justify-center gap-4 p-6 lg:order-1 lg:col-span-5 lg:p-9"
              style={{ background: INK }}
            >
              <div className="font-mono text-[10px] font-black tracking-[0.28em]" style={{ color: ACCENT }}>
                PLACE FIREWOOD
              </div>
              <h3
                className="leading-[0.95] text-white"
                style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(1.9rem, 3vw, 2.9rem)' }}
              >
                篝火灯
              </h3>
              <p className="text-sm leading-relaxed text-white/70">
                电子火焰不灭。把木柴一根根放上去——像真正的篝火那样添柴。
                深夜案头的一点温度。
              </p>
              <div className="flex flex-wrap items-center gap-2 border-t border-white/15 pt-4 text-[11px] text-white/55">
                <span>木柴逐根添加</span>
                <span style={{ color: ACCENT }}>→</span>
                <span>电子火焰随之增亮</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ===== N°03–07：6 栏展板，3/3 + 2/2/2 非等宽 ===== */}
        <div
          className="grid grid-cols-1 gap-[3px] border-[3px] sm:grid-cols-2 lg:grid-cols-6"
          style={{ borderColor: INK, background: INK }}
        >
          {SMALL_LAMPS.map((lamp, i) => (
            <Reveal key={lamp.n} delay={i * 0.07} className={lamp.span}>
              <div id={'g-obj-' + lamp.n} className="group flex h-full scroll-mt-24 flex-col bg-white">
                <div className="relative overflow-hidden">
                  <img
                    src={lamp.img}
                    alt={lamp.name}
                    loading="lazy"
                    decoding="async"
                    className={'block w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ' + lamp.h}
                    style={{ objectPosition: lamp.pos || '50% 50%' }}
                  />
                  {/* 04 鹅卵石有第二个视角：hover 淡入换图，其余灯没有这一层 */}
                  {lamp.img2 && (
                    <img
                      src={lamp.img2}
                      alt={lamp.name + ' · 另一视角'}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="font-mono text-[10px] font-black tracking-[0.28em]" style={{ color: ACCENT }}>
                    {lamp.n} · {lamp.en}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-black" style={{ color: INK }}>{lamp.name}</h4>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold" style={{ background: INK, color: PAPER }}>
                      {lamp.verb}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed" style={{ color: 'rgba(21,21,21,0.6)' }}>
                    {lamp.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ===== 结尾：用一条说明带收束「七个动作」 ===== */}
        <Reveal>
          <div className="mt-12 border-[3px] border-dashed p-6 md:p-9" style={{ borderColor: 'rgba(21,21,21,0.35)' }}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <div className="font-mono text-[10px] font-black tracking-[0.3em]" style={{ color: 'rgba(21,21,21,0.4)' }}>
                  NOTE
                </div>
                <p className="mt-3 text-sm leading-relaxed md:text-[15px]" style={{ color: 'rgba(21,21,21,0.7)' }}>
                  七盏灯，七个「完成动作」。开关被藏进了材质的缝隙里——你不再是按按钮，而是在和物握手。
                </p>
              </div>
              <div className="lg:col-span-6">
                <div className="font-mono text-[10px] font-black tracking-[0.3em]" style={{ color: 'rgba(21,21,21,0.4)' }}>
                  SEVEN VERBS
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OBJECTS.map((o) => (
                    <span
                      key={o.n}
                      className="inline-flex items-center gap-2 border-2 px-2.5 py-1 text-[11px] font-bold"
                      style={{ borderColor: INK, color: INK }}
                    >
                      <b className="font-mono text-[10px]" style={{ color: ACCENT }}>{o.n}</b>
                      {o.verb}
                    </span>
                  ))}
                </div>
                <div className="mt-6 font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: 'rgba(21,21,21,0.4)' }}>
                  GRADUATION PROJECT · 2024
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
