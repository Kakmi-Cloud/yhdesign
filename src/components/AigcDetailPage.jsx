import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowLeft, X, Plus, Minus } from 'lucide-react'
import { asset } from '../assetPath'
import './AigcDetailPage.css'
import DetailFold from './DetailFold'

const aigcAsset = (file) => asset(`/aigc/${file}`)

// 六个概念。图片是 AI 生成稿，文案按每一件「怎么用」来写，
// 不复述工具流程 —— 工具流程统一放在页面下半部分的「设计流程」里。
const CONCEPTS = [
  {
    no: '01',
    key: 'shake',
    en: 'CARBONATION SHAKE LAMP',
    title: '碳酸摇晃趣味灯',
    tag: '趣味家居',
    lead: '摇得越猛，亮得越久。',
    body: [
      '把碳酸饮料摇晃之后那一下“爆气”收进一盏圆柱台灯里 —— 灯不再由开关控制，而是由手里那点力气控制。',
      '灯身内置三轴加速度计，感知摇晃的力度与时长：摇得越猛，蓄下的光越亮，松手后的余亮也越久。光像气泡一样在磨砂灯罩里慢慢散掉，等到下一次摇晃。',
    ],
    specs: [
      { k: '交互原理', v: '三轴加速度计感知摇晃力度与时长，蓄能式发光' },
      { k: '光效', v: '摇得越猛亮度越高、余亮越久，松手后缓慢衰减' },
      { k: '造型', v: '圆柱灯身、半透明灯罩，桌面尺度，可单手握住' },
      { k: '材质', v: '磨砂半透树脂灯罩 + 阳极氧化铝底座' },
    ],
    note: '摇一摇，光就多一点。',
    image: '01-shake.webp',
    thumb: '01-shake-thumb.webp',
    ratio: '610 / 343',
    w: 610,
    h: 343,
    tw: 320,
    th: 180,
    alt: '暗色卧室床头，圆柱形台灯透出柔和白光',
  },
  {
    no: '02',
    key: 'toaster',
    en: 'TOASTER TIMER LAMP',
    title: '面包机定时灯具',
    tag: '趣味家居',
    lead: '前面转亮度，后面定时间。',
    body: [
      '把面包机的操作逻辑搬到灯上：前方旋钮调节亮度，后方拨杆设定时间，拨下去开始倒计时，时间一到灯自己熄灭 —— 不必再为“忘了关灯”起身。',
      '光源从顶部往底部渐变，让“时间在走”这件事变得可见：越接近设定的时刻，底部的光沉得越低，像刚出炉的热度一点点降下来。',
    ],
    specs: [
      { k: '操作', v: '前方旋钮控亮度，后方拨杆控时间，到点自动熄灭' },
      { k: '光效', v: '自上而下渐变，亮度随时间推进缓缓下沉' },
      { k: '造型', v: '方体机身、圆角收边，顶面出光，桌面尺度' },
      { k: '材质', v: '喷涂金属外壳 + 磨砂扩散面罩，旋钮与拨杆为实心铝' },
    ],
    note: '旋钮和拨杆，一只手就记得住。',
    image: '02-toaster.webp',
    thumb: '02-toaster-thumb.webp',
    ratio: '1 / 1',
    w: 395,
    h: 395,
    tw: 320,
    th: 320,
    alt: '灰白色方形灯具，正面旋钮与后方拨杆，顶面透出渐变光',
  },
  {
    no: '03',
    key: 'scale',
    en: 'WEIGHT LIGHT SCALE',
    title: '光渐变重量探测器',
    tag: '厨房器物',
    lead: '不用读数，看光圈就知道还差多少。',
    body: [
      '在一台咖啡秤的底座里藏了一圈灯带。先设定一个目标重量，之后每加入一份，光环就亮起一段、颜色随之推进，用光的圆圈告诉你现在到了哪个阶段。',
      '它把电子秤的数字换成光的进度：手上正忙着的时候，余光扫一眼就知道离目标还有多远。不亮的时候，它就是一块干净的秤。',
    ],
    specs: [
      { k: '设定', v: '先定一个目标重量，作为整圈光环的终点' },
      { k: '反馈', v: '隐藏灯带逐段点亮、颜色渐进，指示当前阶段与重量' },
      { k: '精度', v: '配合高精度称重模块，分段亮灯对应分量区间' },
      { k: '造型', v: '圆角方盘，灯带收在台面之下，不亮时不留痕迹' },
    ],
    note: '目标重量，做成一圈看得见的进度。',
    image: '03-scale.webp',
    thumb: '03-scale-thumb.webp',
    ratio: '400 / 450',
    w: 400,
    h: 450,
    tw: 320,
    th: 360,
    alt: '白色咖啡秤托盘上放着一杯手冲咖啡，盘下透出一圈环形光',
  },
  {
    no: '04',
    key: 'backpack',
    en: 'YI EMBROIDERY BACKPACK',
    title: '彝族服饰元素时尚背包',
    tag: '在地文化 · 云南',
    lead: '把彝族的针脚，缝进每天的肩上。',
    body: [
      '把彝族服饰里的刺绣、挑花、镶边工艺，连同羊角纹、火镰纹这些传统纹样，从衣袖上请下来，重新排布成背包的织带、拼接与压线。',
      '纹样按现代剪裁的比例重新组合，不做摆设式的“民族风”，而是一只日常能背的通勤包：面料选耐磨、防水的织造布与涂层，五金收进结构里，正面只留一组纹样作为识别。',
    ],
    specs: [
      { k: '纹样', v: '羊角纹、火镰纹等彝族传统纹样，按现代比例重组' },
      { k: '工艺', v: '刺绣、挑花、镶边，落位于织带、拼接与压线' },
      { k: '材质', v: '耐磨防水的织造布与涂层，局部织带加固' },
      { k: '款式', v: '现代通勤廓形，五金内敛，日常与出行两用' },
    ],
    note: '民族的不是装饰，是能被用起来的东西。',
    image: '04-backpack.webp',
    thumb: '04-backpack-thumb.webp',
    ratio: '553 / 450',
    w: 553,
    h: 450,
    tw: 320,
    th: 260,
    alt: '织有彝族羊角纹与火镰纹的背包，刺绣与镶边工艺清晰可见',
  },
  {
    no: '05',
    key: 'bookmark',
    en: "CANG'ER LEAF-VEIN BOOKMARK",
    title: '苍山洱海叶脉书签',
    tag: '在地文化 · 云南',
    lead: '一片叶子的脉络，也是一座山的记忆。',
    body: [
      '采集苍山植物叶片，经特殊工艺保留完整叶脉，做成可以夹进书里的薄片。叶面烫印白族扎染纹样与洱海轮廓，把山的肌理和水的形状压在同一片叶子上。',
      '书签附带 NFC 芯片：手机轻触即可查看这枚叶片的植物学信息，以及白族「靠山吃山」的生态智慧。它既是书籍配套，也是带走一段云南的伴手礼。',
    ],
    specs: [
      { k: '设计语言', v: '采集苍山植物叶片，特殊工艺保留叶脉；表面烫印白族扎染纹样与洱海轮廓' },
      { k: '文化载体', v: '内置 NFC 芯片，轻触手机可查看叶片植物学信息与白族生态智慧' },
      { k: '使用场景', v: '书籍配套、城市伴手礼，把自然标本变成可携带的文化记忆' },
    ],
    note: '自然标本，也是一种文化记忆。',
    image: '05-bookmark.webp',
    thumb: '05-bookmark-thumb.webp',
    ratio: '1 / 1',
    w: 900,
    h: 900,
    tw: 320,
    th: 320,
    alt: '保留了叶脉的透明书签，叶面烫印白族扎染纹样与洱海轮廓',
  },
  {
    no: '06',
    key: 'mushroom',
    en: 'BIOMIMETIC MUSHROOM LAMP',
    title: '野生菌仿生灯',
    tag: '在地文化 · 云南',
    lead: '把雨后森林，搬回桌上。',
    body: [
      '模仿牛肝菌、鸡枞等云南特色菌菇的造型，做成一组 LED 仿生灯具：菌柄立住，菌盖出光，高低错落地摆在桌面上，像雨后的林子。',
      '菌盖用半透明树脂，内置温感变色材料 —— 环境温度变化时，菌盖会从白色渐变为橙黄。菌柄里藏了一只蓝牙音箱，可以播放雨林音效：灯亮着，声音也在。',
    ],
    specs: [
      { k: '造型', v: '仿牛肝菌、鸡枞等云南特色菌菇，可成组错落摆放' },
      { k: '菌盖', v: '半透明树脂 + 温感变色材料，随环境温度由白渐变为橙黄' },
      { k: '菌柄', v: '内置蓝牙音箱，可播放雨林音效，灯与声同源' },
      { k: '材质', v: '半透明树脂菌盖、哑光树脂菌柄，LED 光源内置' },
    ],
    note: '一盏灯，也是一段雨林的声音。',
    image: '06-mushroom.webp',
    thumb: '06-mushroom-thumb.webp',
    ratio: '1 / 1',
    w: 1000,
    h: 1000,
    tw: 320,
    th: 320,
    alt: '外形模仿牛肝菌与鸡枞的仿生灯具，菌盖透出暖色光',
  },
]

const YUNNAN = [
  { title: '彝族服饰', text: '刺绣 / 挑花 / 镶边 · 羊角纹 / 火镰纹' },
  { title: '白族扎染', text: '扎染纹样 · 洱海轮廓' },
  { title: '苍山与林', text: '植物叶脉 · 牛肝菌 / 鸡枞' },
]

const STEPS = [
  { label: '关键词梳理', value: 15, text: '把模糊的念头拆成主体、材质、光效与场景四组关键词，先让需求变得可以被描述。' },
  { label: '批量生成', value: 35, text: '同一组提示词批量出图，先在数量里找方向，不急着挑好看的。' },
  { label: '风格筛选', value: 25, text: '按造型可信度、材质表现与场景贴合度排序，一轮砍掉大部分方案。' },
  { label: '精修迭代', value: 15, text: '对留下的方向补材质、改比例、调光线，把概念往可落地的方向推。' },
  { label: '场景合成', value: 10, text: '放进真实使用场景里复核尺寸与氛围，最后交付六组完整概念。' },
]

const HERO_INTERVAL = 5200

export default function AigcDetailPage({ onClose }) {
  const [zoom, setZoom] = useState(null)
  const [openStep, setOpenStep] = useState(0)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const rootRef = useRef(null)
  const dialogRef = useRef(null)
  const lastZoomTrigger = useRef(null)
  const sections = useRef({})

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
    const oldTitle = document.title
    const oldOverflow = document.body.style.overflow
    document.title = '产品概念设计 | 杨鸿作品集'
    document.body.style.overflow = 'hidden'
    return () => { document.title = oldTitle; document.body.style.overflow = oldOverflow }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (zoom && dialog && !dialog.open) dialog.showModal()
  }, [zoom])

  // hero 轮盘：自动播放，鼠标悬停 / 大图打开 / 减弱动效时暂停
  useEffect(() => {
    if (heroPaused || zoom) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => setHeroIndex(i => (i + 1) % CONCEPTS.length), HERO_INTERVAL)
    return () => window.clearTimeout(timer)
  }, [heroIndex, heroPaused, zoom])

  const heroStep = (delta) => setHeroIndex(i => (i + delta + CONCEPTS.length) % CONCEPTS.length)

  const go = (key) => {
    const target = sections.current[key]
    if (!target || !rootRef.current) return
    if (target.tagName === 'DETAILS') target.open = true
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rootRef.current.scrollTo({ top: target.offsetTop - 24, behavior: reduce ? 'instant' : 'smooth' })
  }
  const goTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rootRef.current?.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })
  }
  const showImage = (image, caption, event) => {
    lastZoomTrigger.current = event.currentTarget
    setZoom({ image: aigcAsset(image), caption })
  }
  const closeImage = () => {
    dialogRef.current?.close()
    setZoom(null)
    lastZoomTrigger.current?.focus({ preventScroll: true })
  }

  const concept = (item, index) => {
    const flip = index % 2 === 1
    return (
      <DetailFold
        key={item.key}
        title={`${item.no} · ${item.title}`}
        meta={item.en}
        anchorRef={el => { sections.current[item.key] = el }}
      >
      <section
        className={`aigc-concept aigc-shell${flip ? ' is-flip' : ''}`}
        aria-labelledby={`aigc-${item.key}-title`}
      >
        <div className="aigc-concept-grid">
          <div className="aigc-concept-copy">
            <div className="aigc-concept-meta">
              <span className="aigc-concept-no">{item.no}</span>
              <span className="aigc-concept-en">{item.en}</span>
            </div>
            <h2 id={`aigc-${item.key}-title`}>{item.title}</h2>
            <p className="aigc-concept-lead">{item.lead}</p>
            <div className="aigc-concept-body">
              {item.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            </div>
            <dl className="aigc-specs">
              {item.specs.map(spec => (
                <div key={spec.k}><dt>{spec.k}</dt><dd>{spec.v}</dd></div>
              ))}
            </dl>
            <p className="aigc-note">{item.note}</p>
          </div>

          <figure className="aigc-concept-figure">
            <span className="aigc-tag">{item.tag}</span>
            <button
              className="aigc-figure-zoom"
              onClick={e => showImage(item.image, `${item.no} · ${item.title}`, e)}
              aria-label={`放大查看${item.title}概念图`}
            >
              <img
                src={aigcAsset(item.image)}
                alt={item.alt}
                width={item.w}
                height={item.h}
                loading="lazy"
                style={{ aspectRatio: item.ratio }}
              />
              <span className="aigc-expand"><Plus size={18} /></span>
            </button>
            <figcaption>{item.no} / 06 · {item.title}</figcaption>
          </figure>
        </div>
      </section>
      </DetailFold>
    )
  }

  return (
    <div className="aigc-page" ref={rootRef} tabIndex={-1} data-lenis-prevent aria-label="产品概念设计介绍">
      <section className="aigc-hero">
        <header className="aigc-nav aigc-shell">
          <button className="aigc-monogram" onClick={onClose} aria-label="返回杨鸿作品集">ai<span>.</span></button>
          <nav aria-label="概念页导航">
            <button onClick={() => go('index')}>概念索引</button>
            <button onClick={() => go('yunnan')}>在地文化</button>
            <button onClick={() => go('workflow')}>设计流程</button>
          </nav>
          <button className="aigc-return" onClick={onClose}><ArrowLeft size={16} /><span>返回作品集</span></button>
        </header>

        <div className="aigc-hero-stage aigc-shell">
          <span className="aigc-hero-edition">PRODUCT CONCEPT DESIGN · 06 CONCEPTS</span>
          <p className="aigc-hero-cn">产品概念设计</p>
          <div className="aigc-hero-word"><h1>concept<span>.</span></h1></div>
          <div
            className="aigc-hero-figure"
            role="group"
            aria-roledescription="轮播"
            aria-label="六个产品概念图，自动轮播，可用下方圆点或左右按钮切换"
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            onFocusCapture={() => setHeroPaused(true)}
            onBlurCapture={() => setHeroPaused(false)}
          >
            <div className="aigc-hero-slides">
              {CONCEPTS.map((item, index) => (
                <figure className={`aigc-hero-slide${index === heroIndex ? ' is-active' : ''}`} key={item.key} aria-hidden={index !== heroIndex}>
                  <img className="aigc-hero-blur" src={aigcAsset(item.thumb)} alt="" aria-hidden="true" />
                  <img
                    className="aigc-hero-shot"
                    src={aigcAsset(item.image)}
                    alt={index === heroIndex ? item.alt : ''}
                    width={item.w}
                    height={item.h}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                  />
                </figure>
              ))}
            </div>

            <button className="aigc-hero-arrow is-prev" onClick={() => heroStep(-1)} aria-label="上一张概念图">
              <ArrowLeft size={18} />
            </button>
            <button className="aigc-hero-arrow is-next" onClick={() => heroStep(1)} aria-label="下一张概念图">
              <ArrowLeft size={18} />
            </button>

            <div className="aigc-hero-hud">
              <p className="aigc-hero-caption">
                <span className="aigc-hero-count">{CONCEPTS[heroIndex].no} / 06</span>
                <strong>{CONCEPTS[heroIndex].title}</strong>
                <span className="aigc-hero-en">{CONCEPTS[heroIndex].en}</span>
              </p>
              <div className="aigc-hero-dots">
                {CONCEPTS.map((item, index) => (
                  <button
                    key={item.key}
                    className={index === heroIndex ? 'is-active' : ''}
                    onClick={() => setHeroIndex(index)}
                    aria-label={`查看概念 ${item.no} ${item.title}`}
                    aria-current={index === heroIndex}
                  />
                ))}
              </div>
              <button
                className="aigc-hero-zoom"
                onClick={e => showImage(CONCEPTS[heroIndex].image, `${CONCEPTS[heroIndex].no} · ${CONCEPTS[heroIndex].title}`, e)}
                aria-label={`放大查看${CONCEPTS[heroIndex].title}概念图`}
              >
                <Plus size={18} /><span>看大图</span>
              </button>
            </div>
          </div>
          <div className="aigc-hero-bottom">
            <p>从一个念头开始，<br />到一件能被追问“怎么用”的器物。</p>
            <button className="aigc-pill" onClick={() => go('index')}>看六个概念 <ArrowUpRight size={17} /></button>
          </div>
        </div>
      </section>

      <main>
        <DetailFold title="六个概念，从生活细节到在地文化。" meta="00 / 概念索引 · SIX CONCEPTS, ONE WORKFLOW." anchorRef={el => { sections.current.index = el }}>
        <section className="aigc-index aigc-shell" aria-labelledby="aigc-index-title">
          <div className="aigc-heading-row">
            <div>
              <p className="aigc-kicker">SIX CONCEPTS, ONE WORKFLOW.</p>
              <h2 id="aigc-index-title">六个概念，从生活细节到在地文化。</h2>
            </div>
            <span className="aigc-section-no">00 / 概念索引</span>
          </div>
          <div className="aigc-index-grid">
            {CONCEPTS.map((item, index) => (
              <button
                className="aigc-index-card"
                key={item.key}
                onClick={() => go(item.key)}
                aria-label={`查看概念 ${item.no} ${item.title}`}
              >
                <span className="aigc-index-thumb">
                  <img src={aigcAsset(item.thumb)} alt={item.alt} width={item.tw} height={item.th} loading="lazy" />
                </span>
                <span className="aigc-index-caption">
                  <strong>{item.no}</strong>
                  <span className="aigc-index-name">{item.title}</span>
                  <span className="aigc-index-en">{item.en}</span>
                </span>
                <span className="aigc-index-go" aria-hidden="true"><ArrowUpRight size={15} /></span>
                {index < 3
                  ? <span className="aigc-index-badge">趣味家居</span>
                  : <span className="aigc-index-badge is-culture">在地文化</span>}
              </button>
            ))}
          </div>
        </section>
        </DetailFold>

        <DetailFold title="一次生成很多，挑出最值得做的那个。" meta="设计理念 · MANY DIRECTIONS, ONE DECISION.">
        <section className="aigc-idea aigc-shell" aria-labelledby="aigc-idea-title">
          <div className="aigc-idea-top">
            <span className="aigc-kicker">MANY DIRECTIONS, ONE DECISION.</span>
            <span className="aigc-section-no">设计理念</span>
          </div>
          <div className="aigc-idea-grid">
            <h2 id="aigc-idea-title">一次生成很多，<br />挑出最值得做的那<span>一个。</span></h2>
            <div>
              <p className="aigc-idea-lead">AIGC 不是替我画完，<br />是替我把可能性铺开。</p>
              <p>用 AI 生成工具把同一句概念描述批量展开成多种形态、材质与场景，快速比对之后再回到手工推敲：哪些方向站得住，哪些只是好看。留下的六个，都走到了能被追问“怎么用”的程度。</p>
            </div>
          </div>
        </section>
        </DetailFold>

        {CONCEPTS.slice(0, 3).map(concept)}

        <DetailFold title="从云南的针脚、叶脉与林子出发。" meta="在地文化 · YUNNAN" anchorRef={el => { sections.current.yunnan = el }}>
        <section className="aigc-yunnan" aria-labelledby="aigc-yunnan-title">
          <div className="aigc-shell aigc-yunnan-grid">
            <div>
              <span className="aigc-kicker">YUNNAN / 在地文化</span>
              <h2 id="aigc-yunnan-title">从云南的针脚、<br />叶脉与林子出发。</h2>
            </div>
            <div>
              <p>后三个概念长在同一片土地上：彝族的纹样、苍山的叶脉、雨后的野生菌。把在地的手艺与物种，翻译成今天还在用的器物 —— 不是把符号搬过来，是重新做一遍设计。</p>
              <ul>
                {YUNNAN.map(item => (
                  <li key={item.title}><strong>{item.title}</strong><span>{item.text}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        </DetailFold>

        {CONCEPTS.slice(3).map((item, i) => concept(item, i + 3))}

        <DetailFold title="从一句提示词，到一个提案。" meta="07 / 设计流程 · FROM PROMPT TO PROPOSAL." anchorRef={el => { sections.current.workflow = el }}>
        <section className="aigc-workflow aigc-shell" aria-labelledby="aigc-workflow-title">
          <div className="aigc-heading-row">
            <div>
              <p className="aigc-kicker">FROM PROMPT TO PROPOSAL.</p>
              <h2 id="aigc-workflow-title">从一句提示词，到一个提案。</h2>
            </div>
            <span className="aigc-section-no">07 / 设计流程</span>
          </div>
          <div className="aigc-steps">
            {STEPS.map((step, index) => (
              <div className={`aigc-step${openStep === index ? ' is-open' : ''}`} key={step.label}>
                <button
                  onClick={() => setOpenStep(openStep === index ? null : index)}
                  aria-expanded={openStep === index}
                  aria-controls={`aigc-step-${index}`}
                >
                  <span className="aigc-step-no">0{index + 1}</span>
                  <span className="aigc-step-label">{step.label}</span>
                  <span className="aigc-step-bar" aria-hidden="true">
                    <span style={{ width: `${step.value * 2.4}%` }} />
                  </span>
                  <span className="aigc-step-value">{step.value}%</span>
                  {openStep === index ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                <p id={`aigc-step-${index}`} hidden={openStep !== index}>{step.text}</p>
              </div>
            ))}
          </div>
          <p className="aigc-steps-end">六个概念，只是这一轮里被留下的部分。</p>
        </section>
        </DetailFold>
      </main>

      <footer className="aigc-footer">
        <div className="aigc-shell">
          <div className="aigc-footer-top">
            <p>make it real<span>.</span></p>
            <div>
              <span>概念走完，才是设计真正开始的地方。</span>
              <button className="aigc-pill aigc-pill-solid" onClick={onClose}><ArrowLeft size={16} /> 返回作品集</button>
            </div>
          </div>
          <div className="aigc-footer-bottom">
            <span>PRODUCT CONCEPT DESIGN</span>
            <span>产品概念设计 · 六个概念</span>
            <button onClick={goTop}>回到顶部 ↑</button>
          </div>
        </div>
      </footer>

      <dialog
        ref={dialogRef}
        className="aigc-lightbox"
        onCancel={event => { event.preventDefault(); closeImage() }}
        onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); event.preventDefault(); closeImage() } }}
        onClick={event => {
          if (event.target === dialogRef.current) {
            const b = event.currentTarget.getBoundingClientRect()
            if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) closeImage()
          }
        }}
      >
        <div className="aigc-lightbox-bar">
          <p>{zoom?.caption}</p>
          <button onClick={closeImage} aria-label="关闭大图"><X size={22} /></button>
        </div>
        {zoom && <img src={zoom.image} alt={zoom.caption} />}
      </dialog>
    </div>
  )
}
