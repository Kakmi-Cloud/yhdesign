import { useCallback, useEffect, useRef, useState } from 'react'
import '../styles/catIceOfficial.css'
import { asset } from '../assetPath'
import DetailFold from './DetailFold'

/**
 * CatIceDetailPage —— 项目 08「猫冰 CAT-ICE」IP 互动官网详情页
 *
 * 这一版是把已经做好的**静态站整站**（index.html + styles.css + script.js）
 * 原样搬进作品集的详情浮层里，不再用作品集自己的 Tailwind 语言重画一遍。
 * 理由：这个 IP 的核心卖点是"温度滑杆 → 相变"的那一下手感 —— 滑杆一动，
 * 主视觉、水印、冷凝水、导航上的色点全部连着变；三视图切换的淡出→换图→淡入、
 * 卡片滚入、包装盒的 3D 倾斜、鼠标拖出的冰晶粒子，这些是它的设计主体。
 * 用 Tailwind 重写只会得到一个"看起来像"的壳子，手感全丢，所以选择一比一移植：
 * 视觉全部交给 src/styles/catIceOfficial.css（原 styles.css 加了作用域前缀的版本），
 * 这个文件只负责三件事：DOM 结构、类名、状态。
 *
 * 移植时的几条关键约定（改之前先读）：
 *  1. 根节点必须带 data-lenis-prevent。浮层打开时外层的 Lenis 会 stop()，
 *     而 Lenis 的 stop 实现是直接对 wheel 事件 preventDefault —— 没有这个属性，
 *     浮层里滚轮完全没反应，整页划不动。
 *  2. 锚点不用 href。外层作品集用 `#p=08` 这类 hash 做深链，详情页里再往地址栏写
 *     `#concept` 会把深链冲掉，而且浮层里的滚动目标是容器内的元素、不是文档锚点。
 *     所以原站的 `<a href="#concept">` 一律换成 `<button>` + 容器内 scrollIntoView；
 *     用 button 而不是 `<a href="#">`，是为了不产生任何 hash 变更、同时保住键盘可达。
 *  3. 粒子挂在容器内，不挂 document.body。原站把冰晶粒子 append 到 body 上、靠 850ms
 *     的定时器自行消散；浮层里如果照做，关掉详情页后那些还没消散的粒子会留痕在
 *     外层作品集页面上。改为挂进容器内一个 position:fixed 的空层，卸载时整层消失。
 *  4. 三段交互（三视图换图、粒子定时器、滚动 observer）都必须有清理：浮层是可反复
 *     开关的懒加载路由，任何一次没清干净的定时器都会在卸载后 setState。
 *
 * 与原站的**有意差异**（其余全部逐条照搬）：
 *  · header 由 fixed 改 sticky（+ margin-bottom:-70px 补偿占位）—— 见 CSS 内注释
 *  · 锚点 / 页脚返回改为 button + 容器内滚动 —— 见上第 2 条
 *  · 新增「返回作品集」入口（header 右侧 + 页脚），沿用原站 .action-btn 的视觉语言
 *  · 原站那批纯 JS 钩子用的 id（navTemp / temperature / stateWatermark / viewFront…）
 *    不再保留：这些节点现在由 React 状态驱动，留着只会平白多出一堆可能与外层重名的 id；
 *    CSS 真正引用的 #tempRange 和四个锚点 id 全部保留
 *  · 图片全部换成 public 下的 .webp，并走 asset() 解析（子目录部署也不 404）
 */

// —— 资源路径：原站是站点相对的 assets/xxx.png，这里映射到作品集 public/cat-ice/ 下的 webp ——
const CHARACTER_FROZEN = asset('/cat-ice/character/frozen.webp')
const CHARACTER_MELTED = asset('/cat-ice/character/melted.webp')
const CHARACTER_DUAL_STATE = asset('/cat-ice/character/dual-state.webp')

const VIEW_SRC = (set, position) => asset(`/cat-ice/views/${set}-${position}.webp`)

// —— 温度区间与相变公式（照抄 script.js，别改系数）——
const TEMP_MIN = -18
const TEMP_MAX = 38
const MELT_BASE = 2
const MELT_SPAN = 22

// 两个预设按钮：data-temp 值与原站 index.html 一致
const TEMP_PRESETS = [
  { temp: -18, icon: '✳', label: '一键速冻' },
  { temp: 28, icon: '◌', label: '慢慢融化' },
]

// 三视图切换：编号、图注、图组与 alt 文案全部照抄 script.js 的 viewSets
const VIEW_FRAMES = [
  { no: '01 / FRONT', caption: '正面', position: 'front' },
  { no: '02 / SIDE', caption: '右侧面', position: 'side' },
  { no: '03 / BACK', caption: '背面', position: 'back' },
]
const VIEW_SETS = {
  frozen: {
    tab: '冻结态',
    labels: ['猫冰冻结态正面', '猫冰冻结态右侧面', '猫冰冻结态背面'],
  },
  melted: {
    tab: '软化态',
    labels: ['猫冰软化态正面', '猫冰软化态右侧面', '猫冰软化态背面'],
  },
}

// 14 张表情卡：feature / wide 的分布、M-0x 编号与温度标注、顺序都照抄原站 index.html。
// 顺序不能重排 —— .feature 跨 2×2、.wide 跨 2 列，栅格靠这个顺序拼图。
// name 对应原站的 data-name（M-09 之后原站就没有这个属性了）。
const EMOTIONS = [
  { code: 'M-01 / +28°C', src: asset('/cat-ice/emotions/01.webp'), alt: '终于解放', name: '终于解放', title: '终于解放！', desc: '冰壳半融，快乐溢出来。', layout: 'feature' },
  { code: 'M-02 / −12°C', src: asset('/cat-ice/emotions/02.webp'), alt: '伤心结冰', name: '伤心结冰', title: '伤心结冰' },
  { code: 'M-03 / −18°C', src: asset('/cat-ice/emotions/03.webp'), alt: '自闭中', name: '自闭中', title: '自闭中' },
  { code: 'M-04 / −06°C', src: asset('/cat-ice/emotions/04.webp'), alt: '气鼓鼓', name: '气鼓鼓', title: '气鼓鼓' },
  { code: 'M-05 / −08°C', src: asset('/cat-ice/emotions/05.webp'), alt: '暗中观察', name: '暗中观察', title: '暗中观察' },
  { code: 'M-06 / +06°C', src: asset('/cat-ice/emotions/06.webp'), alt: '在做了', name: '在做了', title: '在做了…', desc: '电脑开了，猫先软了。', layout: 'wide' },
  { code: 'M-07 / +22°C', src: asset('/cat-ice/emotions/07.webp'), alt: '今天躺平', name: '今天躺平', title: '今天躺平', layout: 'wide' },
  { code: 'M-08 / −10°C', src: asset('/cat-ice/emotions/08.webp'), alt: '委屈巴巴', name: '委屈巴巴', title: '委屈巴巴' },
  { code: 'M-09', src: asset('/cat-ice/emotions/09.webp'), alt: '有点害羞', title: '有点害羞' },
  { code: 'M-10', src: asset('/cat-ice/emotions/10.webp'), alt: '突然愣住', title: '突然愣住' },
  { code: 'M-11', src: asset('/cat-ice/emotions/11.webp'), alt: '给你加油', title: '给你加油' },
  { code: 'M-12', src: asset('/cat-ice/emotions/12.webp'), alt: '心动融化', title: '心动融化' },
  { code: 'M-13', src: asset('/cat-ice/emotions/13.webp'), alt: '嗨见面啦', title: '嗨，见面啦' },
  { code: 'M-14', src: asset('/cat-ice/emotions/14.webp'), alt: '喝口冰的', title: '喝口冰的' },
]

const MERCH = [
  { no: 'OBJECT 01', src: asset('/cat-ice/merch/01.webp'), alt: '双层透明挂件', title: '双层透明挂件', desc: '把透明冰壳与橘猫内芯真正拆成两层，让结构成为产品体验。' },
  { no: 'OBJECT 02', src: asset('/cat-ice/merch/02.webp'), alt: '双状态冰箱贴', title: '双状态冰箱贴', desc: '冷藏空间成为角色最自然的舞台，冻结与软化并置展示。' },
  { no: 'OBJECT 03', src: asset('/cat-ice/merch/03.webp'), alt: '冰品与饮品包装', title: '冰品与饮品包装', desc: '冰棍轮廓直接进入冷饮、雪糕与杯套系统，强化品类识别。' },
  { no: 'OBJECT 04', src: asset('/cat-ice/merch/04.webp'), alt: '情绪贴纸', title: '情绪贴纸', desc: '十四种温度，十四种日常回应，适合社交传播和系列收集。' },
]

// 项目一方案板：猫冰立项后的第一版完整展板，三张 1500×1000 原图。
// 与作品集卡片预览位的三个槽位同源（App.jsx 里 project 08 的 gallery），
// 顺序 = 板 01 / 02 / 03，不重排。tagline 是板面上原生的那句副标，逐字照抄。
const SCHEME_BOARDS = [
  {
    no: 'CHARACTER DESIGN / 01',
    src: asset('/cat-ice/scheme1/character-design.webp'),
    alt: '项目一方案板 01：双层冻猫角色设定稿，含双状态三视图、造型提取、情绪温度与色彩设定',
    title: '角色设定稿',
    tagline: '把心情，冻进一层软软的壳里',
    desc: '双层结构拆到底：透明冻壳、橘猫内核与环纹卷尾逐处标注，右侧铺开冻结态与软化态的正面 / 侧面 / 背面三视图，底部再收造型提取、情绪温度与五色色彩设定。',
  },
  {
    no: 'EXPRESSION SYSTEM / 02',
    src: asset('/cat-ice/scheme1/expression-system.webp'),
    alt: '项目一方案板 02：双层冻猫表情系统，八组情绪与动作拆解',
    title: '表情系统',
    tagline: '心情变了，冻壳也跟着变。',
    desc: '八格情绪动作库 —— 终于解放、伤心结冰、自闭中、气鼓鼓、暗中观察、在做了…、今天躺平、委屈巴巴，每一格都对应一次冻壳的软硬与形态变化。',
  },
  {
    no: 'MERCHANDISE CONCEPT / 03',
    src: asset('/cat-ice/scheme1/merchandise.webp'),
    alt: '项目一方案板 03：双层冻猫周边应用，六件商品延展与色彩规范',
    title: '周边应用',
    tagline: '把双层造型，带进日常。',
    desc: '六件落地物件 —— 帆布手提袋、饮品杯与杯套、手机壳、双层透明挂件、情绪贴纸与软胶杯垫，把双层结构直接翻成可以拿在手上的产品。',
  },
]

// 随机测温的八句话：文案与温度一字不改（含 U+2212 负号）
const MOODS = [
  ['终于解放！', '+28°C，冰壳融开，今天适合轻松一点。'],
  ['伤心结冰', '−12°C，把难过冻住，等它慢慢变小。'],
  ['自闭中', '−18°C，暂时不营业，先让自己安静一下。'],
  ['气鼓鼓', '−06°C，脸鼓起来了，但还是很可爱。'],
  ['暗中观察', '−08°C，不急着加入，先看看发生了什么。'],
  ['今天躺平', '+22°C，身体先软下来，事情明天再说。'],
  ['心动融化', '+32°C，温度超标，猫冰正在变成一滩喜欢。'],
  ['给你加油', '+16°C，保持刚刚好的温度，慢慢来也可以。'],
]

const TICKER_TEXT = 'FROZEN AS A POPSICLE\u00A0 \u2733 \u00A0MELTED INTO A CAT\u00A0 \u2733 \u00A0冻成冰棍\u00A0 \u25CC \u00A0化成小猫\u00A0 \u2733 \u00A0'

// 与原站 formatTemp 逐字符一致：负数用 U+2212 减号、0 不带符号、正数带 +
function formatTemp(value) {
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}°C`
}

export default function CatIceDetailPage({ project, onClose }) {
  const containerRef = useRef(null)
  const cursorRef = useRef(null)
  const particleLayerRef = useRef(null)
  const moodButtonRef = useRef(null)
  // 放大查看：关闭后把焦点还给触发它的那张板；打开时把焦点送到关闭按钮
  const zoomReturnRef = useRef(null)
  const zoomCloseRef = useRef(null)

  // 温度：唯一的真源，--temp / --melt 与水印、主视觉都从它派生
  const [temp, setTemp] = useState(TEMP_MIN)
  const [viewSet, setViewSet] = useState('frozen')   // 决定三张图的 src 与 alt（换图后才有值）
  const [viewTab, setViewTab] = useState('frozen')   // 决定分段按钮高亮（点击瞬间就生效）
  const [viewFading, setViewFading] = useState(false) // 换图时的淡出阶段
  const [moodResult, setMoodResult] = useState('点击按钮，让猫冰替你回答。')
  const [zoomBoard, setZoomBoard] = useState(null)   // 非空 = 放大层打开，值是那张方案板

  const viewTimerRef = useRef(null)

  const melt = Math.max(0, Math.min(1, (temp + MELT_BASE) / MELT_SPAN))
  const isMelted = temp > 0
  const tempText = formatTemp(temp)

  // 浮层打开时锁住外层页面滚动（Esc 关闭由 App.jsx 统一处理，这里不重复监听）
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // 容器内平滑滚动。按 prefers-reduced-motion 降级为瞬间跳转 —— 原站 CSS 里
  // 本来就有一整段 prefers-reduced-motion 关掉所有动效，这里只是把同样的意图
  // 延伸到 JS 触发的滚动上，避免"CSS 说别动、JS 还是滑"的矛盾。
  const scrollToSection = useCallback((id) => {
    const root = containerRef.current
    if (!root) return
    const target = root.querySelector(`#${id}`)
    if (!target) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [])

  // 滚动出现：原站是 IntersectionObserver + .reveal → .is-visible。
  // 必须从容器根节点里查，不能查 document —— 外层作品集自己也有一批 .reveal。
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    root.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  // 包装盒 3D 倾斜：只在精确指针设备上绑（触屏没有 hover，照搬原站的 pointer:fine 判断）
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return undefined
    const tilt = containerRef.current?.querySelector('[data-tilt]')
    if (!tilt) return undefined
    const handleMove = (event) => {
      const rect = tilt.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      tilt.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`
    }
    const handleLeave = () => { tilt.style.transform = '' }
    tilt.addEventListener('pointermove', handleMove)
    tilt.addEventListener('pointerleave', handleLeave)
    return () => {
      tilt.removeEventListener('pointermove', handleMove)
      tilt.removeEventListener('pointerleave', handleLeave)
      tilt.style.transform = ''
    }
  }, [])

  // 冰晶鼠标轨迹：监听挂容器（原站挂 window），粒子插进容器内的固定层。
  // 节流与概率条件、粒子尺寸与初速、850ms 生命期全部照抄原站。
  useEffect(() => {
    const root = containerRef.current
    if (!root) return undefined
    const cursor = cursorRef.current
    const timers = new Set()
    let lastParticle = 0

    const handlePointerMove = (event) => {
      if (cursor) {
        cursor.style.left = `${event.clientX}px`
        cursor.style.top = `${event.clientY}px`
      }
      if (event.timeStamp - lastParticle > 75 && Math.random() > 0.42) {
        lastParticle = event.timeStamp
        const layer = particleLayerRef.current
        if (!layer) return
        const particle = document.createElement('i')
        particle.className = 'ice-particle'
        particle.style.left = `${event.clientX}px`
        particle.style.top = `${event.clientY}px`
        particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 30}px`)
        particle.style.setProperty('--dy', `${20 + Math.random() * 35}px`)
        layer.appendChild(particle)
        const timer = window.setTimeout(() => {
          timers.delete(timer)
          particle.remove()
        }, 850)
        timers.add(timer)
      }
    }

    root.addEventListener('pointermove', handlePointerMove)
    return () => {
      root.removeEventListener('pointermove', handlePointerMove)
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
      // 卸载前清场：残留的粒子节点不会跨页面留在外层浮层上
      if (particleLayerRef.current) particleLayerRef.current.replaceChildren()
    }
  }, [])

  // 换图定时器：卸载时清掉，避免 180ms 后对已卸载组件 setState
  useEffect(() => () => window.clearTimeout(viewTimerRef.current), [])

  // 放大查看一张方案板：记下触发它的那个按钮，关闭时把焦点还回去（键盘用户不会丢位置）。
  // 用 event.currentTarget 而不是 document.activeElement —— Safari 点按钮不给焦点，
  // 那时 activeElement 还停在 body 上，关闭后就回不到原来那张板了。
  const openZoom = (board, trigger) => {
    zoomReturnRef.current = trigger || document.activeElement
    setZoomBoard(board)
  }

  const closeZoom = useCallback(() => {
    setZoomBoard(null)
    const back = zoomReturnRef.current
    zoomReturnRef.current = null
    if (back && typeof back.focus === 'function') back.focus()
  }, [])

  // 放大层的键盘处理。必须挂在 capture 阶段并把事件吃掉：
  // 外层 App.jsx 有一个 window 上的 Escape → 关闭整个详情页，
  // 若在这里不用 stopImmediatePropagation，一次 Esc 会把详情页和放大层一起关掉。
  useEffect(() => {
    if (!zoomBoard) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation()
        event.preventDefault()
        closeZoom()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [zoomBoard, closeZoom])

  // 打开后把焦点送到关闭按钮：Tab 不会跑到背后的详情页里
  useEffect(() => {
    if (zoomBoard) zoomCloseRef.current?.focus()
  }, [zoomBoard])

  // 三视图切换：原站是「先把 opacity 设 0 / translateY(10px)，180ms 后换 src 再恢复」。
  // 这里保留同一节奏 —— 淡出立刻开始（CSS 里 .view-stage img 有 .25s/.4s 的过渡），
  // 180ms 后一次性换 src + 结束淡出，观感与原站一致。
  const switchView = (next) => {
    if (next === viewTab) return
    setViewTab(next)
    setViewFading(true)
    window.clearTimeout(viewTimerRef.current)
    viewTimerRef.current = window.setTimeout(() => {
      setViewSet(next)
      setViewFading(false)
    }, 180)
  }

  // 随机测温：文案照抄原站 moods，按钮上跑一次原站的抖动关键帧
  const pickRandomMood = () => {
    const mood = MOODS[Math.floor(Math.random() * MOODS.length)]
    setMoodResult(`${mood[0]}｜${mood[1]}`)
    moodButtonRef.current?.animate?.([
      { transform: 'rotate(0) scale(1)' },
      { transform: 'rotate(-3deg) scale(.96)' },
      { transform: 'rotate(2deg) scale(1.02)' },
      { transform: 'rotate(0) scale(1)' },
    ], { duration: 420, easing: 'ease-out' })
  }

  const viewFadeStyle = viewFading ? { opacity: 0, transform: 'translateY(10px)' } : undefined

  return (
    // data-lenis-prevent 不能删：浮层打开时外层 SmoothScroll 会 lenis.stop()，
    // 而 Lenis 的 stop 会对滚轮事件直接 preventDefault —— 少了这个属性浮层划不动。
    // z-[200] 由 App.jsx 的详情浮层外壳提供，重复挂会让浮层 DOM 计数虚增。
    <div
      ref={containerRef}
      data-lenis-prevent
      className={`catice-official fixed inset-0 overflow-y-auto overscroll-contain${zoomBoard ? ' is-zoomed' : ''}`}
      style={{
        // fontFamily 不能在行内写：行内声明会压过 catIceOfficial.css 里
        // `.catice-official{font-family:var(--body)}`，让 --body / --display 令牌失效。
        // 这里曾经挂着 'Microsoft YaHei',... 的一层硬编码，字体统一到作品集后就废了。
        '--temp': String(temp),
        '--melt': melt.toFixed(2),
      }}
    >
      {/* 原站的两层全局覆盖物：颗粒噪点与冰晶光标。保持 fixed / pointer-events:none / 原 z-index */}
      <div className="grain" aria-hidden="true" />
      <div className="cursor-ice" ref={cursorRef} aria-hidden="true" />
      {/* 冰晶粒子的宿主层：粒子由 pointermove 命令式插入，卸载时随这层一起消失（见顶部注释 3） */}
      <div className="ice-layer" ref={particleLayerRef} aria-hidden="true" />

      {/* ===== 吸顶导航：原站是 fixed，这里改 sticky（原因见 CSS 内 .site-header 注释） ===== */}
      <header className="site-header">
        <button type="button" className="brand" onClick={() => scrollToSection('top')} aria-label="返回首页">
          <span className="brand-mark">冰</span>
          <span>猫冰 <b>CAT-ICE</b></span>
        </button>
        {/* 四个锚点改成容器内滚动：不写 href 是为了不污染外层用于深链的地址栏 hash */}
        <nav aria-label="主导航">
          <button type="button" onClick={() => scrollToSection('concept')}>设定</button>
          <button type="button" onClick={() => scrollToSection('views')}>三视图</button>
          <button type="button" onClick={() => scrollToSection('moods')}>表情</button>
          <button type="button" onClick={() => scrollToSection('merch')}>周边</button>
        </nav>
        <div className="header-right">
          <span className="header-temp"><i /><b>{tempText}</b></span>
          <button
            type="button"
            className="header-close"
            onClick={onClose}
            aria-label="关闭详情页，返回作品集"
          >
            返回作品集
          </button>
        </div>
      </header>

      <main id="top">
        {/* ===== 01 HERO：主视觉 + 温度滑杆 ===== */}
        <section className="hero section-pad">
          <div className="hero-serial mono">EMOTIONAL PHASE OBJECT / NO. 2026–0917</div>

          <div className="hero-copy reveal">
            <p className="eyebrow"><span>CAT × ICE</span> 双相情绪实验体</p>
            <h1><span className="cn">猫冰</span><span className="en">CAT—ICE</span></h1>
            <p className="hero-slogan">冻成冰棍，<br /><em>化成小猫。</em></p>
          </div>

          <div className="blister-shell reveal" data-tilt>
            <div className="euro-slot" aria-hidden="true"><i /></div>
            <div className="edition-sticker"><b>01</b><span>SPECIAL<br />EDITION</span></div>
            <div className="cold-ruler mono"><span>−18</span><i /><span>00</span><i /><span>+38</span></div>

            <div className="chamber">
              <div className="grid-lines" aria-hidden="true" />
              <div className="ice-glint glint-a" />
              <div className="ice-glint glint-b" />
              {/* 两套主视觉靠 is-active 互斥显示，透明度完全由 CSS 承担，不额外接 state */}
              <img
                className={`hero-cat hero-frozen${isMelted ? '' : ' is-active'}`}
                src={CHARACTER_FROZEN}
                alt="猫冰冻结态"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
              <img
                className={`hero-cat hero-melted${isMelted ? ' is-active' : ''}`}
                src={CHARACTER_MELTED}
                alt="猫冰软化态"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
              <div className="condensation" aria-hidden="true"><i /><i /><i /><i /></div>
              <span className="state-watermark">{isMelted ? 'SOFTENED' : 'FROZEN'}</span>
            </div>

            <div className="thermal-panel">
              <div className="thermal-label">
                <span className="mono">THERMAL SLIDER</span>
                <strong>{tempText}</strong>
              </div>
              <input
                id="tempRange"
                type="range"
                min={TEMP_MIN}
                max={TEMP_MAX}
                value={temp}
                onChange={(event) => setTemp(Number(event.target.value))}
                aria-label="调节猫冰温度"
              />
              <div className="thermal-scale mono"><span>FREEZE</span><span>PHASE 0°</span><span>MELT</span></div>
              <div className="state-actions">
                {TEMP_PRESETS.map((preset) => (
                  <button
                    key={preset.temp}
                    type="button"
                    className={`action-btn${temp === preset.temp ? ' active' : ''}`}
                    data-temp={preset.temp}
                    onClick={() => setTemp(preset.temp)}
                  >
                    <span>{preset.icon}</span>{preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-note reveal">
            <span className="note-no mono">01 / IDEA</span>
            <p>把猫的“液态感”与冰的相变做成一个能被看见、被操控的情绪开关。</p>
          </div>
          <div className="scroll-cue mono"><span />SCROLL TO THAW</div>
        </section>

        {/* ===== 跑马灯 ===== */}
        <div className="ticker" aria-hidden="true">
          <div>{TICKER_TEXT}</div>
          <div>{TICKER_TEXT}</div>
        </div>

        {/* ===== 02 双状态设定 ===== */}
        <DetailFold title="展开完整设定与图集" meta="PHASE LOGIC · VIEWS · MOODS · MERCH · SCHEME">
        <section className="concept section-pad" id="concept">
          <div className="section-index mono">02 / PHASE LOGIC</div>
          <div className="section-heading reveal">
            <p className="eyebrow">ONE CAT · TWO PHASES</p>
            <h2>同一只猫，<br /><em>两种温度。</em></h2>
            <p className="section-intro">橘猫是温暖的内芯，透明猫耳冰壳是情绪边界。温度改变时，冰壳、表情和姿态一起变化。</p>
          </div>

          <div className="phase-board">
            <article className="phase-card phase-cold reveal">
              <div className="phase-meta mono"><span>A / FROZEN</span><span>−18°C</span></div>
              <div className="phase-visual">
                <img src={CHARACTER_FROZEN} alt="冻结态猫冰" loading="lazy" decoding="async" />
              </div>
              <h3>冻 结 态</h3>
              <p>坚硬猫耳冰壳收紧，猫咪蜷成冰棍，胡须与身体一起颤抖；水滴尾巴变成短圆握柄。</p>
              <ul><li>高硬度冰壳</li><li>紧绷闭眼</li><li>短圆尾柄</li></ul>
            </article>
            <div className="phase-divider" aria-hidden="true"><span>0°</span><i /><b>PHASE<br />CHANGE</b></div>
            <article className="phase-card phase-warm reveal">
              <div className="phase-meta mono"><span>B / SOFTENED</span><span>+28°C</span></div>
              <div className="phase-visual">
                <img src={CHARACTER_MELTED} alt="软化态猫冰" loading="lazy" decoding="async" />
              </div>
              <h3>软 化 态</h3>
              <p>冰壳随身体低趴流动，猫咪半眯眼放松；尾巴从侧后方自然伸展，地面留下圆润水滴。</p>
              <ul><li>随形软壳</li><li>松弛半阖眼</li><li>伸展水滴尾</li></ul>
            </article>
          </div>
        </section>

        {/* ===== 03 设计说明（移植新增，原站没有这一节）=====
            位置选在 02 双状态设定之后：前面两张 phase-card 讲的是"两种形态长什么样"，
            这一节接着讲"为什么做成两种形态"——从造型说明过渡到动机说明，是同一话题的
            自然延伸；再往后就是三视图 / 表情 / 周边这些视觉密集区，中间夹一段纯文字，
            把阅读节奏从"看图"切到"读文字"再切回去。
            文案一字未改：主标题拆成两行（中文实心 + 拉丁描边）是排版行为，"——"与
            括号的语义由换行和字体差承担，三个信息成分（情绪冷冻体 / 猫冰 / CAT-ICE）都在。 */}
        <section className="note section-pad" id="note">
          <div className="section-index mono">03 / DESIGN NOTE</div>

          <div className="note-head reveal">
            <p className="eyebrow"><span>RATIONALE</span> 情绪冷冻体 / CAT-ICE</p>
            <div className="note-head-grid">
              <h2>情绪冷冻体<em className="en">猫冰 CAT—ICE</em></h2>
              <p className="note-quote"><em>“</em>冻成冰棍，化成小猫。<em>”</em></p>
            </div>
          </div>

          <div className="note-body reveal">
            <p className="note-lead">猫冰的设计灵感，源自当代人日复一日的“情绪相变”：</p>

            {/* 两条论述沿用 concept 的冷/暖二元：底色与 .phase-card 的两个色值同源，
                让"设定"（图）与"说明"（文）在同一个视觉隐喻下前后呼应 */}
            <div className="note-clauses">
              <article className="note-clause is-freeze">
                <div className="note-clause-head mono"><span>§ A / FROZEN</span><span>−18°C</span></div>
                <h3>冻结态：社交防御的透明铠甲</h3>
                <p>出门在外，我们习惯将自己冻进一层壳里。猫耳冰壳、颤抖的胡须与笔挺的水滴尾手柄，是应对外部世界的防御机制。像一根标准的冰棍，外表透明却带着拒人千里的坚硬与冰冷。我们将真实的自我冰封，紧缩五官，维持着社交距离所需的体面与高冷。</p>
              </article>
              <article className="note-clause is-thaw">
                <div className="note-clause-head mono"><span>§ B / SOFTENED</span><span>+28°C</span></div>
                <h3>软化态：独处时分的流体回归</h3>
                <p>当回到安全的私密空间，环境降下防备，冰壳随之溶解。这里的“融化”并非溃败，而是自我治愈的释放。充当手柄的尾巴恢复自由，紧绷的神经化作一摊柔软低趴的流体。此时不需要维持任何既定形状，只需要像流体猫一样软烂地贴着地面，长长地舒一口气。</p>
              </article>
            </div>

            <div className="note-close">
              <span className="mono">CLOSING NOTE</span>
              <p>猫冰不只是一只嵌在冰块里的橘猫，它是当代人精神状态的微缩切片。它在向外界传达一个温和的真理：在坚硬与柔软之间自由切换是生存的本能。我们既要保有结冰对抗世界的锐度，也要拥有随时融化拥抱自己的自由。</p>
            </div>
          </div>
        </section>

        {/* ===== 04 三视图 ===== */}
        <section className="views section-pad" id="views">
          <div className="section-index mono">04 / ORTHOGRAPHIC</div>
          <div className="views-head reveal">
            <div><p className="eyebrow">STRUCTURE SYSTEM</p><h2>正规三视图</h2></div>
            <div className="segmented" role="group" aria-label="切换三视图状态">
              <button
                type="button"
                className={`view-switch${viewTab === 'frozen' ? ' active' : ''}`}
                onClick={() => switchView('frozen')}
              >
                {VIEW_SETS.frozen.tab}
              </button>
              <button
                type="button"
                className={`view-switch${viewTab === 'melted' ? ' active' : ''}`}
                onClick={() => switchView('melted')}
              >
                {VIEW_SETS.melted.tab}
              </button>
            </div>
          </div>

          <div className="view-stage reveal">
            <div className="measure measure-top mono">01 — SAME SCALE — 03</div>
            <div className="baseline" />
            {VIEW_FRAMES.map((frame, index) => (
              <figure key={frame.no}>
                <span className="view-number mono">{frame.no}</span>
                <img
                  src={VIEW_SRC(viewSet, frame.position)}
                  alt={VIEW_SETS[viewSet].labels[index]}
                  style={viewFadeStyle}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{frame.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="spec-strip mono reveal">
            <span><b>FORM</b> CAT-EAR ICE SHELL</span>
            <span><b>TAIL</b> ONE CONTROLLED STRIPE</span>
            <span><b>PAW</b> RIGHT FRONT</span>
            <span><b>CORE</b> WARM ORANGE CAT</span>
          </div>
        </section>

        {/* ===== 05 十四款情绪 ===== */}
        <section className="moods" id="moods">
          <div className="mood-intro section-pad reveal">
            <div className="section-index mono">05 / EMOTION INDEX</div>
            <p className="eyebrow">ICE REACTS TO FEELINGS</p>
            <h2>心情变了，<br /><em>冰也跟着变。</em></h2>
            <p>开心时冰壳融开，难过时重新结硬，尴尬时原地冻住。每一种情绪都有一套可识别的相变动作。</p>
          </div>

          <div className="emotion-grid">
            {EMOTIONS.map((emotion) => (
              <article
                key={emotion.code}
                className={`emotion-card${emotion.layout ? ` ${emotion.layout}` : ''} reveal`}
                data-name={emotion.name}
              >
                <span className="mood-code mono">{emotion.code}</span>
                <img src={emotion.src} alt={emotion.alt} loading="lazy" decoding="async" />
                <h3>{emotion.title}</h3>
                {emotion.desc ? <p>{emotion.desc}</p> : null}
              </article>
            ))}
          </div>
        </section>

        {/* ===== 06 周边 ===== */}
        <section className="merch section-pad" id="merch">
          <div className="section-index mono">06 / OBJECTS</div>
          <div className="merch-heading reveal"><p className="eyebrow">TAKE THE PHASE HOME</p><h2>把相变，<br /><em>带进日常。</em></h2></div>
          <div className="merch-track">
            {MERCH.map((item) => (
              <article key={item.no} className="merch-card reveal">
                <div className="merch-no mono">{item.no}</div>
                <div className="merch-image">
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ===== 07 项目一方案板（移植新增，原站没有这一节）=====
            位置：接在 06/OBJECTS 之后、finale 之前，编号顺接为 07，前面各节编号不动。
            理由：前面 02~06 是把设定拆开逐条讲，这一节把源头那三张展板原样铺一次收口，
            放在展开之后、收尾之前，读者是"看完细节再回看全貌"。
            图不裁剪、不做圆角：1500×1000 的板面自带分栏与标注，任何裁切都会切掉板上的信息。 */}
        <section className="scheme section-pad" id="scheme">
          <div className="section-index mono">07 / SCHEME BOARD</div>
          <div className="section-heading reveal">
            <p className="eyebrow">PROJECT 01 · SCHEME BOARD</p>
            <h2>项目一，<br /><em>原方案。</em></h2>
            <p className="section-intro">猫冰立项后的第一版完整方案，三张按序铺开：角色设定、表情系统、周边应用，从造型源头到落地物件，一张板推一层。</p>
          </div>

          <div className="scheme-track">
            {SCHEME_BOARDS.map((board) => (
              <article key={board.no} className="scheme-card reveal">
                <div className="scheme-card-head mono"><span>{board.no}</span><span>1500 × 1000</span></div>
                {/* 板面本身就是"原件"，用 button 包一层：键盘能 Tab 到、回车能开，
                    鼠标指针有 zoom-in 的形状提示。用 button 而不是给 <img> 挂 onClick，
                    是因为只有 button 自带焦点与键盘语义；这里不能用 <a href="#">，
                    浮层里改 hash 会连带外层详情页的深链一起动。 */}
                <button
                  type="button"
                  className="scheme-zoom-trigger"
                  onClick={(event) => openZoom(board, event.currentTarget)}
                  aria-label={`放大查看方案板：${board.title}`}
                >
                  <img src={board.src} alt={board.alt} loading="lazy" decoding="async" />
                </button>
                <div className="scheme-card-body">
                  <div className="scheme-card-title">
                    <h3>{board.title}</h3>
                    <p className="scheme-card-tagline">{board.tagline}</p>
                  </div>
                  <p className="scheme-card-desc">{board.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        </DetailFold>

        {/* ===== 随机测温 ===== */}
        <section className="finale section-pad">
          <div className="finale-cat reveal">
            <img src={CHARACTER_DUAL_STATE} alt="猫冰双状态" loading="lazy" decoding="async" />
          </div>
          <div className="finale-copy reveal">
            <span className="mono">CAT-ICE / EMOTIONAL PHASE OBJECT</span>
            <h2>你的心情，<br />今天几度？</h2>
            <button type="button" className="big-button" ref={moodButtonRef} onClick={pickRandomMood}>
              随机测温 <b>↗</b>
            </button>
            <p aria-live="polite">{moodResult}</p>
          </div>
          <div className="finale-ring" aria-hidden="true" />
        </section>
      </main>

      <footer>
        <div className="footer-title">CAT—ICE</div>
        <div className="footer-row mono">
          <span>猫冰 IP DESIGN / 2026</span>
          <span>FROZEN AS A POPSICLE, MELTED INTO A CAT.</span>
          <div className="footer-actions">
            <button type="button" onClick={() => scrollToSection('top')}>BACK TO TOP ↑</button>
            <button type="button" onClick={onClose}>返回作品集 →</button>
          </div>
        </div>
      </footer>

      {/* ===== 07 方案板放大层（移植新增）=====
          三张板共用一层。放在 footer 之后、根节点之内：它是这一页自己的东西，
          就该留在这个 z-[200] 的浮层里，不去外层作品集页面上另开一层。
          关闭路径有三条 —— 点遮罩、点右上角关闭、按 Esc（Esc 的实现在上面的
          capture 监听里，必须走 capture，否则外层的 Esc 会连详情页一起关掉）。 */}
      {zoomBoard ? (
        <div
          className="scheme-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`方案板放大：${zoomBoard.no}`}
          onClick={closeZoom}
        >
          <div className="scheme-lightbox-bar mono">
            <span>{zoomBoard.no}</span>
            <button type="button" className="scheme-lightbox-close" ref={zoomCloseRef} onClick={closeZoom}>
              关闭 ESC ✕
            </button>
          </div>
          {/* 板面自己带 2px 墨框与硬阴影，这里不再套白卡 —— 套了会在图外多出一圈
              与板面边框不对齐的白边。
              拦截只加在 <img> 上，不加在舞台上：舞台铺满整行，连图两侧的深色空档
              都在它里面，若在舞台上 stopPropagation，"点深色处关闭"这条最顺手的路径
              就整个失效了。图片本身仍然点不关 —— 放大就是为了看清楚，误触一次
              得把图重新点开一遍。 */}
          <div className="scheme-lightbox-stage">
            <img
              src={zoomBoard.src}
              alt={zoomBoard.alt}
              onClick={(event) => event.stopPropagation()}
            />
            <p className="scheme-lightbox-caption mono">{zoomBoard.title} / 1500 × 1000</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
