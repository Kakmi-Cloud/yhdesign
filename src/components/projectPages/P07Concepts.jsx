/**
 * P07 产品概念设计 —— 六个方向，各自能被追问「怎么用」
 *
 * 素材依据：
 *  · aigc/01..06 是六个概念各自独立的效果图（多为白底或真实场景），
 *    aigc-board.webp 是原六格总览板，只作资料索引。
 *  · 六个概念的名称、lead、说明与规格沿用最初 AigcDetailPage 的 CONCEPTS 常量，
 *    在地文化三条与五步流程沿用 YUNNAN / STEPS，不改写、不臆测。
 * 结构是「概念网格 → 在地文化分组 → 流程手风琴」，深色底只作背景，产品图保持原亮度。
 */
import { useState } from 'react'
import { A, SectionHead, Zoomable, pad } from './shared'

const CONCEPTS = [
  {
    n: '01', en: 'CARBONATION SHAKE LAMP', title: '碳酸摇晃趣味灯', tag: '趣味家居',
    lead: '摇得越猛，亮得越久。', img: '01-shake.webp',
    body: '把碳酸饮料摇晃之后那一下「爆气」收进一盏圆柱台灯里 —— 灯不再由开关控制，而是由手里那点力气控制。',
    specs: [
      ['交互原理', '三轴加速度计感知摇晃力度与时长，蓄能式发光'],
      ['光效', '摇得越猛亮度越高、余亮越久，松手后缓慢衰减'],
      ['造型', '圆柱灯身、半透明灯罩，桌面尺度，可单手握住'],
      ['材质', '磨砂半透树脂灯罩 + 阳极氧化铝底座'],
    ],
  },
  {
    n: '02', en: 'TOASTER TIMER LAMP', title: '面包机定时灯具', tag: '趣味家居',
    lead: '前面转亮度，后面定时间。', img: '02-toaster.webp',
    body: '把面包机的操作逻辑搬到灯上：前方旋钮调节亮度，后方拨杆设定时间，拨下去开始倒计时，时间一到灯自己熄灭。',
    specs: [
      ['操作', '前方旋钮控亮度，后方拨杆控时间，到点自动熄灭'],
      ['光效', '自上而下渐变，亮度随时间推进缓缓下沉'],
      ['造型', '方体机身、圆角收边，顶面出光，桌面尺度'],
      ['材质', '喷涂金属外壳 + 磨砂扩散面罩，旋钮与拨杆为实心铝'],
    ],
  },
  {
    n: '03', en: 'WEIGHT LIGHT SCALE', title: '光渐变重量探测器', tag: '厨房器物',
    lead: '不用读数，看光圈就知道还差多少。', img: '03-scale.webp',
    body: '在一台咖啡秤的底座里藏了一圈灯带，把电子秤的数字换成光的进度：手上正忙着的时候，余光扫一眼就知道离目标还有多远。',
    specs: [
      ['设定', '先定一个目标重量，作为整圈光环的终点'],
      ['反馈', '隐藏灯带逐段点亮、颜色渐进，指示当前阶段与重量'],
      ['精度', '配合高精度称重模块，分段亮灯对应分量区间'],
      ['造型', '圆角方盘，灯带收在台面之下，不亮时不留痕迹'],
    ],
  },
  {
    n: '04', en: 'YI EMBROIDERY BACKPACK', title: '彝族服饰元素时尚背包', tag: '在地文化 · 云南',
    lead: '把彝族的针脚，缝进每天的肩上。', img: '04-backpack.webp',
    body: '把彝族服饰里的刺绣、挑花、镶边工艺，连同羊角纹、火镰纹这些传统纹样，从衣袖上请下来，重新排布成背包的织带、拼接与压线。',
    specs: [
      ['纹样', '羊角纹、火镰纹等彝族传统纹样，按现代比例重组'],
      ['工艺', '刺绣、挑花、镶边，落位于织带、拼接与压线'],
      ['材质', '耐磨防水的织造布与涂层，局部织带加固'],
      ['款式', '现代通勤廓形，五金内敛，日常与出行两用'],
    ],
  },
  {
    n: '05', en: "CANG'ER LEAF-VEIN BOOKMARK", title: '苍山洱海叶脉书签', tag: '在地文化 · 云南',
    lead: '一片叶子的脉络，也是一座山的记忆。', img: '05-bookmark.webp',
    body: '采集苍山植物叶片，经特殊工艺保留完整叶脉，做成可以夹进书里的薄片；叶面烫印白族扎染纹样与洱海轮廓。',
    specs: [
      ['设计语言', '保留叶脉；表面烫印白族扎染纹样与洱海轮廓'],
      ['文化载体', '内置 NFC 芯片，轻触手机可查看叶片植物学信息'],
      ['使用场景', '书籍配套、城市伴手礼，把自然标本变成可携带的记忆'],
    ],
  },
  {
    n: '06', en: 'BIOMIMETIC MUSHROOM LAMP', title: '野生菌仿生灯', tag: '在地文化 · 云南',
    lead: '把雨后森林，搬回桌上。', img: '06-mushroom.webp',
    body: '模仿牛肝菌、鸡枞等云南特色菌菇的造型，做成一组 LED 仿生灯具：菌柄立住，菌盖出光，高低错落地摆在桌面上。',
    specs: [
      ['造型', '仿牛肝菌、鸡枞等云南特色菌菇，可成组错落摆放'],
      ['菌盖', '半透明树脂 + 温感变色材料，随环境温度由白渐变为橙黄'],
      ['菌柄', '内置蓝牙音箱，可播放雨林音效，灯与声同源'],
      ['材质', '半透明树脂菌盖、哑光树脂菌柄，LED 光源内置'],
    ],
  },
]

const YUNNAN = [
  { t: '彝族服饰', d: '刺绣 / 挑花 / 镶边 · 羊角纹 / 火镰纹', img: '04-backpack.webp' },
  { t: '白族扎染', d: '扎染纹样 · 洱海轮廓', img: '05-bookmark.webp' },
  { t: '苍山与林', d: '植物叶脉 · 牛肝菌 / 鸡枞', img: '06-mushroom.webp' },
]

const STEPS = [
  { t: '关键词梳理', v: 15, d: '把模糊的念头拆成主体、材质、光效与场景四组关键词，先让需求变得可以被描述。' },
  { t: '批量生成', v: 35, d: '同一组提示词批量出图，先在数量里找方向，不急着挑好看的。' },
  { t: '风格筛选', v: 25, d: '按造型可信度、材质表现与场景贴合度排序，一轮砍掉大部分方案。' },
  { t: '精修迭代', v: 15, d: '对留下的方向补材质、改比例、调光线，把概念往可落地的方向推。' },
  { t: '场景合成', v: 10, d: '放进真实使用场景里复核尺寸与氛围，最后交付六组完整概念。' },
]

export default function P07Concepts({ project, dossier }) {
  const [open, setOpen] = useState(0)
  const [step, setStep] = useState(1)

  return (
    <div className="ac-page">
      <section className="ac-hero">
        <div className="ac-hero-copy">
          <span className="ac-kicker">07 / PRODUCT CONCEPT DESIGN · 06 CONCEPTS</span>
          <h1>六个方向，<br /><em>都经得起追问</em></h1>
          <p className="ac-lead">{dossier?.oneLiner}</p>
          <p className="ac-desc">{project?.details?.concept}</p>
        </div>
        <div className="ac-hero-collage" aria-hidden="true">
          {CONCEPTS.map((c, i) => (
            <img key={c.n} src={A(`/aigc/${c.img}`)} alt="" loading="eager" className={`ac-hc-${i + 1}`} />
          ))}
        </div>
      </section>

      {/* 六概念网格：点卡片展开该概念的用法与规格 */}
      <section className="ac-concepts" id="concepts">
        <SectionHead n="01" cn="六个概念" en="SIX CONCEPTS, ONE WORKFLOW" note="前半程从生活细节里找交互，后半程从云南的针脚、叶脉与林子里找题材。点任一张卡展开完整说明。" />
        <div className="ac-grid">
          {CONCEPTS.map((c, i) => (
            <article key={c.n} className={`ac-card${open === i ? ' is-open' : ''}`} data-reveal>
              <button type="button" className="ac-card-btn" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <div className="ac-card-img"><img src={A(`/aigc/${c.img}`)} alt={c.title} loading="lazy" /></div>
                <div className="ac-card-meta">
                  <span>{c.n} / 06</span><i>{c.tag}</i>
                  <h3>{c.title}</h3><em>{c.en}</em><b>{c.lead}</b>
                </div>
                <span className="ac-card-toggle">{open === i ? '收起 −' : '展开 +'}</span>
              </button>
              {open === i && (
                <div className="ac-card-detail">
                  <p>{c.body}</p>
                  <dl>{c.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
                  <Zoomable src={A(`/aigc/${c.img}`)} alt={c.title} className="ac-card-zoom">放大概念图 ↗</Zoomable>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 在地文化：三条题材线索，保留原 YUNNAN 分组 */}
      <section className="ac-yunnan" id="yunnan">
        <SectionHead n="02" cn="在地文化" en="YUNNAN / THREE THREADS" note="后半程的三个题材来源，各自对应一个概念，不做摆设式的「民族风」。" />
        <div className="ac-yunnan-row">
          {YUNNAN.map((y, i) => (
            <article key={y.t} data-reveal>
              <div className="ac-yunnan-img"><img src={A(`/aigc/${y.img}`)} alt={y.t} loading="lazy" /></div>
              <span>{pad(i + 1)} / SOURCE</span><h3>{y.t}</h3><p>{y.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 设计流程：五步手风琴 + 百分比条 */}
      <section className="ac-process" id="process">
        <SectionHead n="03" cn="设计流程" en="FIVE STEPS / 100%" note="点任一步展开说明；百分比为原流程记录中的阶段占比。" />
        <div className="ac-process-row">
          <div className="ac-step-list">
            {STEPS.map((s, i) => (
              <div key={s.t} className={`ac-step${step === i ? ' is-on' : ''}`}>
                <button type="button" onClick={() => setStep(step === i ? -1 : i)} aria-expanded={step === i}>
                  <i>{pad(i + 1)}</i><b>{s.t}</b><span>{s.v}%</span>
                </button>
                <div className="ac-step-bar"><i style={{ width: `${s.v * 2.4}%` }} /></div>
                {step === i && <p>{s.d}</p>}
              </div>
            ))}
          </div>
          <aside className="ac-process-note" data-reveal>
            <span>METHOD NOTE</span>
            <p>用 AIGC 把一句概念描述批量展开成多种形态、材质与场景，快速比对后再回到手工推敲，最终留下六个能被追问「怎么用」的产品概念。</p>
            <div className="ac-board">
              <Zoomable src={A('/aigc/aigc-board.webp')} alt="六个产品概念原六格总览板">
                <img src={A('/aigc/aigc-board.webp')} alt="六个产品概念原六格总览板" loading="lazy" />
              </Zoomable>
              <p>原六格总览板 · 资料索引</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
