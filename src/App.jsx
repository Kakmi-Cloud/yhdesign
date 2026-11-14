import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Phone,
  Mail,
  PenTool,
  Sparkles,
  Users,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Lightbulb,
  Target,
  Workflow,
  Gem,
  Layers,
  GraduationCap,
  Hand,
} from 'lucide-react'
import PortfolioCardStack from './components/PortfolioCardStack'
// 进展状态的短标签由统一资料层提供，首页 / 列表 / 档案页共用一份口径。
import { statusLabel } from './data/projectDossiers'
// 项目展示板块：影像优先版。8 个项目共用同一套「整幅产品影像 → 一句定位 →
// 八个项目各自独立的页面（见 components/projectPages/）：不再共用一套段落模板。
// 旧版 ProjectShowcase / ProjectDossier 保留在 src/components/ 下便于回退对比。
const ProjectPages = lazy(() => import('./components/projectPages'))
import HeroProfileWrapper from './components/HeroProfileWrapper'
// 手机端「查看完整项目」的落点：原稿（YH 概念播放器）自己的项目详情页。
// 它不是 React 组件，而是完全自包含的离线单文件，所以用 iframe 整体承载，
// 详见 OriginalDetailOverlay.jsx 顶部的说明。
import OriginalDetailOverlay from './components/OriginalDetailOverlay'
import BrutalTiltCard from './components/BrutalTiltCard'
import { Reveal, RevealStagger, EASE } from './components/Reveal'
// 动效层 v1 —— 手法取自 ReactBits，按本页的酸纸印刷语言改写（见 index.css 末段）。
// 每一个都是"内容在动"，不是装饰贴上去的：SplitHeading 拆的就是原有的标题文本，
// VelocityTicker 转的就是原有的跑马灯文案，CountUp 数出来的就是原有的那个数字。
import ClickSpark from './components/motion/ClickSpark'
import SplitHeading from './components/motion/SplitHeading'
import VelocityTicker from './components/motion/VelocityTicker'
import CountUp from './components/motion/CountUp'
import StarBorder from './components/motion/StarBorder'
import Sticker from './components/motion/Sticker'
import Spotlight from './components/motion/Spotlight'
import PageWipe from './components/motion/PageWipe'
import InkBloom from './components/motion/InkBloom'
import PixelReveal from './components/motion/PixelReveal'
import SmoothScroll, { useLenisLock } from './components/SmoothScroll'
import ScrollCue from './components/ScrollCue'
import SectionRail from './components/SectionRail'
import OffscreenPause from './components/OffscreenPause'
import ClipReveal from './components/ClipReveal'
import { ScrollProgress } from './components/ScrollProgress'
import { Magnetic } from './components/Magnetic'
import { useHeroCinematic } from './components/HeroCinematic'
import MobileProjectDeck from './components/MobileProjectDeck'
import './mobile/long-page.css'
// 手机端首访层（2026-11-14 改）：回到最初「概念播放器」的卡片牌堆语言，
// 但换成整站暖纸/深可可/雾紫/蜜橙色票，保留硬描边硬影与等宽编号。
// 旧的一屏极简列表 mobile-simple/MobileProjectList.jsx 仍在仓库里，便于回退。
import MobileCardLanding from './mobile/cards/MobileCardLanding'
import Guestbook from './components/Guestbook'
import './components/mobile-simple/mobile-simple.css'
// 旧首访层（轮盘/胶片）的样式表：组件本身已不渲染，但长页返程胶囊 .ml-return-capsule
// 的样式仍在这里，必须显式引入 —— 之前它只被 MobileLandingMenu.jsx import，
// 组件下线后 Vite 连 CSS 一起 tree-shake 掉，胶囊退化成 position:static、跑到视口上方
// （y=-229，真实手指点不到，等于长页没有回程路）。
import './components/mobileLanding.css'
import { useIsMobile } from './hooks/useMediaQuery'
import { PROJECT_META, EXPERIENCES as experiences, PROJECTS as projects } from './data/portfolioProjects'
import { asset } from './assetPath'
// 复古桌面 OS 模式（宽屏默认入口）：门控 + 窗口管理器，与长页互斥。
// 长页仍然挂载在它下面，详情页浮层 z-[200] 高于桌面层 z-150，可正常压在上面弹出。
import { DesktopOSGate } from './components/desktop-os/RetroDesktopOS'

// 作者收件箱直达模式：?inbox=1 时跳过手机首访层与桌面 OS，
// 直接把长页（含留言收件箱）显示出来，并由 Guestbook 自动滚到收件箱。
const INBOX_MODE = typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('inbox') === '1'

// 项目副标题与标签：桌面轮盘与手机全屏卡组共用同一份，
// 原先它写死在手机端卡片的渲染里，抽出来才能两边一致、只改一处。

function AnimatedNumber({ value, duration = 1200, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    let start = null
    let raf
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <span ref={ref}>{display}{suffix}</span>
}

function RadarChart({ data, color = '#E67E33' }) {
  const size = 200
  const center = size / 2
  const radius = 72
  const levels = 4
  const angleStep = (Math.PI * 2) / data.labels.length
  const max = 100

  const getPoint = (i, r) => {
    const angle = i * angleStep - Math.PI / 2
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const points = data.values.map((v, i) => getPoint(i, (v / max) * radius).join(',')).join(' ')
  const gridPolygons = Array.from({ length: levels }, (_, lvl) => {
    const r = (radius * (lvl + 1)) / levels
    return data.labels.map((_, i) => getPoint(i, r).join(',')).join(' ')
  })

  return (
    <div className="relative w-full aspect-square max-w-[220px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full radar-chart">
        {gridPolygons.map((poly, i) => (
          <polygon
            key={i}
            points={poly}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />
        ))}
        {data.labels.map((label, i) => {
          const [x1, y1] = getPoint(i, radius)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x1}
              y2={y1}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
            />
          )
        })}
        <polygon
          points={points}
          fill={color}
          fillOpacity="0.18"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          className="radar-polygon"
        />
        {data.values.map((v, i) => {
          const [x, y] = getPoint(i, (v / max) * radius)
          return <circle key={i} cx={x} cy={y} r="3" fill={color} className="radar-dot" />
        })}
      </svg>
      <div className="absolute inset-0 pointer-events-none">
        {data.labels.map((label, i) => {
          const [x, y] = getPoint(i, radius + 18)
          return (
            <span
              key={i}
              className="absolute text-[10px] font-medium text-muted-foreground -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(x / size) * 100}%`, top: `${(y / size) * 100}%` }}
            >
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function DonutChart({ data }) {
  const size = 180
  const stroke = 22
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  let accumulated = 0
  // 中心读数由数据驱动：展示占比最高的一项，而非写死的「100%」
  const top = data.reduce(
    (max, item) => ((item.value ?? 0) > (max.value ?? 0) ? item : max),
    data[0] || { label: '', value: 0 }
  )

  return (
    <div className="relative w-full aspect-square max-w-[180px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90 donut-chart">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/40"
        />
        {data.map((item, i) => {
          const offset = circumference - (item.value / 100) * circumference
          const dashOffset = -accumulated * (circumference / 100)
          accumulated += item.value
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ '--donut-offset': offset }}
              className="donut-segment"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-semibold text-foreground">
          <AnimatedNumber value={top.value} suffix="%" />
        </span>
        <span className="mt-0.5 max-w-[86px] truncate text-center text-[10px] font-medium text-muted-foreground">
          {top.label || '占比最高'}
        </span>
      </div>
    </div>
  )
}

function BarChart({ data, color = '#E67E33' }) {
  return (
    <div className="space-y-3 w-full">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{item.label}</span>
            <span>{item.value}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bar-fill"
              style={{
                backgroundColor: color,
                '--target-width': `${item.value}%`,
                animationDelay: `${i * 120}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProgressRing({ value, label, color = '#E67E33' }) {
  const size = 140
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[140px] h-[140px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/40"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ '--progress-offset': offset }}
            className="progress-ring"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-display font-semibold text-foreground">
            <AnimatedNumber value={value} suffix="%" />
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

function DetailBlock({ icon: Icon, title, children, color = '#E67E33' }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 md:p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      </div>
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  )
}

function App() {
  const [activeExp, setActiveExp] = useState(null)
  const [activeStrength, setActiveStrength] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [detailPageProject, setDetailPageProject] = useState(null)
  // 手机端专用：装的还是「哪个项目」，但落点是**原稿自己的详情页**（离线单文件浮层），
  // 不是上面那套 React 详情页。两个 state 分开，是因为它们的退场方式不一样：
  // 详情页是 0.62s 的推入反演 + 橙色擦除带，浮层是瞬时挂载/卸载。
  // 桌面端永远为 null（入口页只在窄屏渲染）。
  const [originalDetailProject, setOriginalDetailProject] = useState(null)
  const [cardAspects, setCardAspects] = useState({})
  const [modalKey, setModalKey] = useState(0)
  const [activeImage, setActiveImage] = useState(0)
  const [projectFilter, setProjectFilter] = useState('全部')
  const [projectQuery, setProjectQuery] = useState('')
  // 窄屏才挂载手机端全屏卡组。它是 md:hidden 的，但 display:none 挡不住
  // 图片下载 —— 桌面端原先白拉了 7 张项目封面。这里直接在渲染层把关。
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileLandingOpen, setMobileLandingOpen] = useState(() => !INBOX_MODE)
  // 入口页开着的时候，站点自己的页头也得让位。header 不在 <main> 里，
  // 只把 main 设成 hidden 藏不住它 —— 顶部会残留一条 "YANGHONG + 汉堡"，
  // 白底入口页上还压着一条 2px 黑线，一眼就看出是两层页面叠在一起。
  const landingCoverActive = isMobile && mobileLandingOpen
  const [mainVisibleOnMobile, setMainVisibleOnMobile] = useState(() => INBOX_MODE)
  // 手机端「30 秒胶片」状态：null = 没开；{ index, sheet } = 从第几个项目开始、
  // 是否直接弹规格抽屉（点正中主卡时为 true）。
  const [mobileReel, setMobileReel] = useState(null)
  const [profileCardOpen, setProfileCardOpen] = useState(false)
  const [bloomToken, setBloomToken] = useState(0)
  // 「完整经历 ↗」：收起详情卡，并把这次跳转交给"墨点放大"转场 ——
  // hero 那块橙圆自己长大盖满整屏，在满版那一拍换页。
  // preventDefault 之后 SmoothScroll 的锚点接管会因为 defaultPrevented 让路，
  // 滚动只剩 InkBloom 一个写手，不再有两个驱动抢同一个 scrollTop。
  const handleFullExperience = (e) => {
    e.preventDefault()
    setProfileCardOpen(false)
    setBloomToken((v) => v + 1)
  }
  // 转场令牌：每次打开/关闭详情页自增一次，PageWipe 以 key 重挂来重放擦除带。
  // 用令牌而不是布尔量，是因为"连开关两次"也必须各播一次。
  const [wipeToken, setWipeToken] = useState(0)
  const reduceMotion = useReducedMotion()

  // 浮层打开时锁住 Lenis：详情页与弹窗都有各自的滚动容器，
  // 不锁的话 Lenis 会继续驱动 window，底下的主页会跟着一起滚。
  // 手机端 30 秒胶片同样是整屏浮层，一并锁住。
  useLenisLock(!!detailPageProject || !!selectedProject || !!originalDetailProject || !!mobileReel)

  // 详情页 chunk 预热：等首屏彻底稳定、浏览器有空的时候再拉。
  // 与 lazy() 是同一份动态 import，Vite/浏览器的模块缓存会去重，
  // 所以这里拉过之后，用户点卡片时是同步拿到组件，不会闪加载态。
  // requestIdleCallback 在 Safari 上还没有，退回 1.5s 延时 —— 那时
  // 首屏动画（入场那一段）也早就跑完了，不会和它抢主线程。
  useEffect(() => {
    const warm = () => {
      import('./components/projectPages')
    }
    const ric = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback.bind(window)
      : null
    if (ric) {
      const id = ric(warm, { timeout: 3000 })
      return () => window.cancelIdleCallback?.(id)
    }
    const timer = setTimeout(warm, 1500)
    return () => clearTimeout(timer)
  }, [])

  // —— 手机端「返回键」：先关浮层，而不是直接退出站点 ——
  //
  // 详情页和项目弹窗都是 fixed 全屏浮层，但浏览器的历史栈里**根本没有它们的位置**，
  // 所以安卓返回键 / iOS 侧滑返回一律被浏览器理解成「离开这个网站」——
  // 表现就是用户明明还在项目页里，一按返回直接退出去了。
  //
  // 这里在打开浮层时补压一条历史记录，把浮层钉在历史栈上：
  // 返回键 → popstate → 关浮层。关闭按钮走同一条路（自己回收那条记录），
  // 这样历史栈和界面状态始终同步，不会留下「已关掉的浮层」记录让用户白按一次。
  //
  // 只 push state、不带 URL，原因有二：
  // ① 作者有意让 hash 只读、不参与回写（见下方深链注释），不跟锚点导航抢 hash；
  // ② 交付包是双击打开的单文件形态，跑在 file:// 下时带 URL 的 pushState 会被浏览器拦掉。
  // 万一仍被拦（老内核 / 特殊环境），catch 里退回原行为，不影响站点可用。
  // —— 视图栈：整份栈写在 history.state.yhStack 里，最大深度 2 ——
  //
  //   []                       首屏轮盘
  //   ['longpage']             长页（从轮盘点「项目 / 简历」进来）
  //   ['reel']                 30s 胶片（从轮盘点「▶ 30s 速览」进来）
  //   ['longpage','detail']    长页里点「查看完整项目详情 →」
  //   ['reel','detail']        胶片里点「查看完整项目」
  //
  // 老实现只用一条布尔记录管详情页/弹窗，手机端另外两个"整屏状态"
  // （切到长页、开 30s 胶片）**什么都没压**，于是安卓返回键 / iOS 侧滑
  // 一律被浏览器理解成「离开这个网站」—— 实测账本里第 3/5/9/16 步都是这么把人踢出去的。
  const overlayStackRef = useRef([])
  const pushedEntriesRef = useRef(0) // 我们真正压进浏览器历史的记录条数
  const pendingRecycleRef = useRef(0) // 正在等 popstate 落地的 back() 次数
  const queuedOpenRef = useRef(null) // 「点关闭后 <50ms 又立刻重开」的挂起操作
  const stackTopRef = useRef(null)
  const lastReelRef = useRef(null) // 胶片停在第几张：退回来时复位到同一张

  // 栈 → UI：轮盘 / 长页 / 胶片这三个整屏状态，和详情页、弹窗、原稿浮层三层浮层，
  // 全部由这一处统一落地 —— 从此界面状态与历史栈不可能再各说各话。
  const applyStackToUI = useCallback((stack) => {
    const hasLongPage = stack.includes('longpage') || INBOX_MODE
    // 详情页 / 弹窗 / 原稿浮层都挂在 <main> 里面（z-200）。手机端 <main> 平时是
    // display:none（让首访轮盘占屏），只要这三种浮层还开着，<main> 就必须可见 ——
    // 否则点开详情页时它跟着 <main> 一起被隐藏，用户看到的还是轮盘，
    // 界面看上去"点了没反应"（这个坑在批次 A 实测里踩到过一次）。
    const hasOverlay =
      stack.includes('detail') || stack.includes('modal') || stack.includes('original')
    const top = stack.length > 0 ? stack[stack.length - 1] : null
    const hadDetail = stackTopRef.current === 'detail'
    stackTopRef.current = top
    setMobileLandingOpen(!hasLongPage)
    setMainVisibleOnMobile(hasLongPage || hasOverlay)
    setMobileReel(top === 'reel' ? (lastReelRef.current || { index: 0, sheet: false }) : null)
    if (top !== 'detail') {
      // 详情页退场重放一次橙色擦除带（弹窗本来不过擦除带，不跟着响）
      if (hadDetail) setWipeToken((t) => t + 1)
      setDetailPageProject(null)
    }
    if (top !== 'modal') setSelectedProject(null)
    if (top !== 'original') setOriginalDetailProject(null)
  }, [])

  // 基准状态：给当前这条历史记录补一个空的 yhStack（原地替换，别人的字段一律保留）。
  // 刷新时如果当前记录里已经有栈（用户刷新前正停在某层），把界面也一起还原 ——
  // 否则会出现"历史里记着 ['reel']、界面上却没有胶片"的错位。
  // pushedEntriesRef 也要按栈深度补上：刷新后计数器归零，会让"点关闭"误以为
  // 我们没压过历史而不去 back()，于是那条记录永远留在栈里（多按一次返回键才干净）。
  useEffect(() => {
    const cur = window.history.state || {}
    if (Array.isArray(cur.yhStack)) {
      overlayStackRef.current = cur.yhStack
      pushedEntriesRef.current = cur.yhStack.length
      stackTopRef.current = cur.yhStack.length > 0 ? cur.yhStack[cur.yhStack.length - 1] : null
      if (cur.yhStack.length > 0) applyStackToUI(cur.yhStack)
      return
    }
    try {
      window.history.replaceState({ ...cur, yhStack: [] }, '')
    } catch {
      /* file:// 等环境拦掉 replaceState：只影响返回键体验，不影响站点可用 */
    }
  }, [applyStackToUI])

  // —— 手机端「入口页是主视觉，详情页是它上面的一层」 ——
  //
  // 入口页（概念播放器）只给封面 + 标题，卡脚那枚圆箭头写着「查看完整项目」，
  // 把用户送到原版面的项目详情页。用户从详情页退回来时，
  // 预期是"回到刚才那一屏、还是那张卡"，而不是掉进站点首页。
  // 所以开详情页时记两件事：① 这次是从入口页进来的；② 停在第几格。
  // 详情页关闭后按 ② 把入口页原地复位。
  //
  // ⚠️ 现状：入口页卡脚那枚圆箭头已经改走原稿浮层（OriginalDetailOverlay），
  // 而那条路**不卸载入口页** —— 关掉浮层时用户看到的本来就是原来那张卡，
  // 不需要任何"复位"。所以 ① 这个标记眼下没有任何地方会置 true，
  // restoreLanding 成了空转。留着它，是为了给"将来某条真的要换页的入口"兜底：
  // 谁把入口页摘下去，谁就负责把 fromLandingRef 置 true，退场时序不用再重新想。
  const fromLandingRef = useRef(false)
  const [landingIndex, setLandingIndex] = useState(0)
  const landingTimerRef = useRef(0)

  // 为什么不和 setDetailPageProject(null) 同一拍复位：
  // 详情页退场是 0.62s 的推入反演，橙色擦除带（PageWipe）要 0.72s 才走完，
  // 而这两个都在 <main> 里 —— 入口页一挂上就给 main 打 hidden（display:none），
  // 同一拍复位等于把正在播的退场和橙带一起掐黑。
  //
  // 取 0.66s 是两头兼顾的点：
  //   · 早于 0.72s —— 复位时橙带还挂在 z-320（比入口页的 z-150 高），
  //     所以最后一小段是被"带着扫过去"的，转场更完整；而此时带子已升出画外
  //     （y≈-108%），被 main 的 display:none 掐掉也看不见。
  //   · 晚于详情页 0.62s 的退场 —— 退场走完的下一拍入口页就盖上来，
  //     中间不会露出底下站点的首页（那会像闪了一下）。
  // 05 没有独立详情页，走的是数据面板弹窗（退场 0.48s、且不过橙带），
  // 所以两种退场的等待时间不一样，按 kind 分开。
  const LANDING_RETURN_DELAY = 660
  const LANDING_MODAL_RETURN_DELAY = 520
  const restoreLanding = (kind = 'detail') => {
    if (!fromLandingRef.current) return
    // 立刻清标记：同一次退场里 closeDetailPage 与 popstate 可能都被触发，
    // 第二个进来必须是无操作，否则会排两个定时器。
    fromLandingRef.current = false
    if (landingTimerRef.current) window.clearTimeout(landingTimerRef.current)
    const delay = reduceMotion
      ? 240
      : kind === 'modal'
        ? LANDING_MODAL_RETURN_DELAY
        : LANDING_RETURN_DELAY
    landingTimerRef.current = window.setTimeout(() => {
      landingTimerRef.current = 0
      setMobileLandingOpen(true)
    }, delay)
  }
  useEffect(
    () => () => {
      if (landingTimerRef.current) window.clearTimeout(landingTimerRef.current)
    },
    [],
  )

  // 压入（或同级替换）一层视图记录。只改 history.state，**URL 一个字都不动**
  // （?plain=1 / ?desk=… 全保留）；第三参省略 —— file:// 下带 URL 的 pushState 会被拦掉。
  const pushOverlayEntry = (kind, options) => {
    const replaceTop = !!options?.replaceTop
    // 边界：上一次「点关闭」触发的 history.back() 还没收到 popstate，
    // 用户又点开了新层。先记账，等那条 popstate 落地时再补一条真实记录。
    if (pendingRecycleRef.current > 0) {
      queuedOpenRef.current = { kind, replaceTop }
      const queuedNext = replaceTop
        ? [...overlayStackRef.current.slice(0, -1), kind]
        : [...overlayStackRef.current, kind]
      overlayStackRef.current = queuedNext
      applyStackToUI(queuedNext)
      return
    }
    const prev = overlayStackRef.current
    const prevTop = prev.length > 0 ? prev[prev.length - 1] : null
    if (prevTop === kind) return // 连点同一个入口不重复压栈
    const next = replaceTop && prev.length > 0
      ? [...prev.slice(0, -1), kind]
      : [...prev, kind]
    overlayStackRef.current = next
    const prevState = window.history.state || {}
    try {
      if (replaceTop && prev.length > 0) {
        window.history.replaceState({ ...prevState, yhStack: next }, '')
      } else {
        window.history.pushState({ ...prevState, yhStack: next }, '')
        pushedEntriesRef.current += 1
      }
    } catch {
      // 极端环境压不进去：界面照常切，只是返回键退化成"直接离站"的老行为
    }
    applyStackToUI(next)
  }

  // 页面内关闭按钮：先即时收掉 UI，再异步回收那条历史记录。
  // 用计数标记「这次 back() 是自己发的」：那个 popstate 只负责把记录弹掉，
  // 不能再关一次 —— 否则「点关闭 → 立刻重开」时，迟到的 popstate 会把新层一起关掉。
  const recycleOverlayEntry = () => {
    if (overlayStackRef.current.length === 0) return
    const next = overlayStackRef.current.slice(0, -1)
    overlayStackRef.current = next
    applyStackToUI(next)
    if (pushedEntriesRef.current <= 0) return // 没压进过历史：只收 UI，别把用户 back 出站
    pushedEntriesRef.current -= 1
    pendingRecycleRef.current += 1
    window.history.back()
  }

  const openDetailPage = (p) => {
    setWipeToken((t) => t + 1)
    setDetailPageProject(p)
    pushOverlayEntry('detail')
  }
  const closeDetailPage = () => {
    // 出栈 + 擦除带重放都交给 applyStackToUI 的统一逻辑，这里不重复做
    recycleOverlayEntry()
  }
  const closeProjectModal = () => {
    recycleOverlayEntry()
  }

  // 手机端详情页顶栏那三枚章节胶囊（成品 / 材质 / 推导+）的落点。
  // Bento 模板（01/02/05）有真正的 section id 可跳；03/04/06/07/08 是各自独立的
  // 版式，没有这些 id，就按比例落到容器对应位置 —— 至少让"想找某一段"
  // 不必从第 1 屏一路划到第 10 屏。
  const jumpDetailSection = (anchorId, ratio) => {
    const root = document.querySelector('[class*="z-[200]"]')
    if (!root) return
    const scroller = [root, ...root.querySelectorAll('*')].find(
      (el) => el.scrollHeight - el.clientHeight > 200,
    )
    const anchor = anchorId ? root.querySelector(`#${anchorId}`) : null
    if (anchor) {
      anchor.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' })
      return
    }
    if (scroller) {
      scroller.scrollTo({
        top: Math.round((scroller.scrollHeight - scroller.clientHeight) * ratio),
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    }
  }

  // 手机端「▶ 30s 速览」：开胶片 = 压一层 'reel'。
  // 停在几张记进 lastReelRef，从详情页退回来时能复位到同一张。
  const openReel = (index, sheet) => {
    lastReelRef.current = { index: Number(index) || 0, sheet: !!sheet }
    setMobileReel(lastReelRef.current)
    pushOverlayEntry('reel')
  }

  // —— 手机端卡脚圆箭头「查看完整项目」：原稿详情页浮层 ——
  //
  // 和上面那两套浮层的关键区别：**入口页不卸载**。
  // 详情页/弹窗是"换页"，所以要先 setMobileLandingOpen(false) 把入口页摘掉，
  // 等退场动画（0.62s / 0.48s）走完再由 restoreLanding 把它盖回来 —— 那是为了让
  // 底下的站点首页不露出来。浮层是瞬时挂载/卸载、又从第一帧就整屏不透明白底，
  // 所以入口页留在原地反而是最优解：关掉浮层的那一拍，用户看到的就是刚才那张卡，
  // 天然满足"退回去还是这个界面"，也没有任何定时器/时序可以去出错。
  //
  // 代价只是入口页的轮盘在浮层底下继续挂着 —— 它没有全局键盘/指针监听
  // （事件都绑在轮盘自己身上，见 MobileLandingMenu），浮层整屏把它盖住之后
  // 收不到任何输入，谈不上互相干扰。
  const openOriginalDetail = (p) => {
    setOriginalDetailProject(p)
    pushOverlayEntry('original')
  }
  const closeOriginalDetail = () => {
    recycleOverlayEntry()
    setOriginalDetailProject(null)
  }

  // 返回键 / 前进键落点：谁在栈顶谁退场，一层一层退，退到栈空才回轮盘。
  // 只认「我们自己压的记录」：用户一路退到站点之外时栈为空，不做任何拦截。
  useEffect(() => {
    const onPop = (e) => {
      // 1. 自己发起的 back()（点关闭按钮）：只弹记录，不再重复收层
      if (pendingRecycleRef.current > 0) {
        pendingRecycleRef.current -= 1
        // back() 飞行途中用户又点开了新层：这时补一条真实的历史记录
        if (pendingRecycleRef.current === 0 && queuedOpenRef.current) {
          queuedOpenRef.current = null
          try {
            const prevState = window.history.state || {}
            window.history.pushState({ ...prevState, yhStack: overlayStackRef.current }, '')
            pushedEntriesRef.current += 1
          } catch {
            /* 压不进去就只保留界面状态 */
          }
        }
        return
      }
      // 2. 用户按了安卓物理返回键 / iOS 左缘侧滑：按目标记录里的栈还原界面
      const incoming = Array.isArray(e.state?.yhStack) ? e.state.yhStack : []
      if (pushedEntriesRef.current > 0) pushedEntriesRef.current -= 1
      overlayStackRef.current = incoming
      applyStackToUI(incoming)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [applyStackToUI])

  // 统一项目详情入口：01/02 走 Bento 详情页，03 走灯具系列详情页、04 走毕设灯具详情页、
  // 06 走模块化座椅详情页、07 走产品概念设计详情页、08 走猫冰 IP 官网详情页（内容最完整）；
  // 其余走数据面板弹窗。
  // 网格 / 移动端卡与轮盘共用此入口，保证同一项目从任意视图进入呈现一致。
  //
  // ⚠️ 这份名单必须和下面「详情页分流」里的分支保持一致。曾经漏掉过 08 ——
  // 猫冰详情页写好了却没人调用，点卡片仍然落到老弹窗（一层深色蒙版 + 数据面板），
  // 表现就是「页面换了但看起来没换」。加新详情页时两处一起改。
  const DETAIL_PAGE_IDS = ['01', '02', '03', '04', '05', '06', '07', '08']
  const openProject = (p) => {
    if (DETAIL_PAGE_IDS.includes(p.id)) openDetailPage(p)
    else {
      // 弹窗同样是全屏浮层：一样要在历史栈上占一格，否则返回键直接退出站点。
      pushOverlayEntry('modal')
      setSelectedProject(p)
    }
  }
  const [gridKey, setGridKey] = useState(0)
  const [emailCopied, setEmailCopied] = useState(false)
  const emailTimerRef = useRef(null)
  const copyEmail = () => {
    // 先即时反馈，再执行复制（不阻塞 UI 状态）
    setEmailCopied(true)
    if (emailTimerRef.current) clearTimeout(emailTimerRef.current)
    emailTimerRef.current = setTimeout(() => setEmailCopied(false), 2200)
    const addr = '1833749790@qq.com'
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(addr).catch(() => fallbackCopy(addr))
    } else {
      fallbackCopy(addr)
    }
  }
  const fallbackCopy = (text) => {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    } catch {
      /* noop */
    }
  }
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const cardRadius = [
    'rounded-lg',
    'rounded-lg',
    'rounded-lg',
    'rounded-lg',
    'rounded-lg',
    'rounded-lg',
    'rounded-lg',
  ]

  // 经历 → 作品的"转接口"，是给**某一条经历确实产出了某个项目**用的：
  // projectId 指向下面 projects 里那一项的 id，展开经历卡后会出现一枚
  // 「查看相关项目」按钮，点它直接进对应作品的详情页 —— 和点作品卡片
  // 走的是同一个 openProject()，所以两处的呈现完全一致。
  //
  // 只给宝辉挂着（03 那批实习灯具就是这段经历的产出）。
  // 整节的"总的出口"不在这里，在下方小节头部那枚「查看全部精选项目」——
  // 看完经历想直接看作品时，不必再滚回顶部找导航。
  // 以后要再补，加一行 projectId: '0N' 即可；不加就不显示按钮。

  // ⚠️ 两条规则要分清，改顺序时别搞混：
  //   · 数组顺序 = 展示顺序。轮盘、手机卡组、筛选网格都按这份顺序排，
  //     卡片上 / 底部刻度上的编号也由位置（idx + 1）算出来。
  //   · id = 身份键。它指向 PROJECT_META、ProjectDoodle、详情页主题与
  //     深链（#p=08），所以搬动某一项时**只搬对象、不改 id**，
  //     否则符号、配色和已有分享链接会一起错位。
  //   当前顺序：01 心景 → 02 慢行者 → 03 实习灯具 → 04 情绪疗愈灯具
  //             → 08 猫冰 → 06 模块化座椅 → 05 UI 界面 → 07 产品概念设计

  // 深链：带 #p=03 打开页面时直接进对应项目详情页，让单个项目可以被直接分享。
  // 只读 hash、不回写 —— 关闭详情页时不必改写地址栏，避免和锚点导航抢 hash。
  //
  // ⚠️ 「只打开一次」必须由 ref 把住，不能只靠 effect 依赖来控频。
  // 原因：projects 是组件内定义的数组，每次渲染都是新的引用，把它写进依赖
  // 等于让这个 effect **每渲染一次都跑一遍**。那么一旦从深链进来，
  // closeDetailPage() 刚把状态置空、组件重渲染，effect 又立刻从地址栏里
  // 还留着的 #p=03 把详情页原样打开了 —— 表现就是页脚「返回作品集 →」、
  // 吸顶导航「Return」、以及 Esc 全部点了没反应，人被困在详情页里出不去。
  // 现在：首次挂载时按 hash 打开一次，之后只响应真正的 hashchange。
  const deepLinkOpenedRef = useRef(false)
  useEffect(() => {
    const openFromHash = () => {
      const m = /^#p=(.+)$/.exec(window.location.hash || '')
      if (!m) return
      const target = projects.find((p) => p.id === m[1])
      if (target) {
        setDetailPageProject(target)
        // 深链是直接落地的，历史栈里同样没有浮层的位置：
        // 补一条记录，返回键第一下是关浮层、第二下才离开站点。
        pushOverlayEntry('detail')
      }
    }
    if (!deepLinkOpenedRef.current) {
      deepLinkOpenedRef.current = true
      openFromHash()
    }
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [projects])

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    if (reveals.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    reveals.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [projectFilter, projectQuery])

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden'
      setActiveImage(0)
      setModalKey((k) => k + 1)
    } else {
      document.body.style.overflow = ''
    }
    // 只有弹窗真的开着才监听 Escape。这段 effect 在 selectedProject 为 null 时也会跑，
    // 之前无条件挂监听：抽屉/胶片状态下按一下 Esc 会把栈顶那一层也一起弹掉。
    if (!selectedProject) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') closeProjectModal()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [selectedProject])

  // 图一详情页支持 Esc 关闭
  useEffect(() => {
    if (!detailPageProject) return
    const handleKey = (e) => {
      if (e.key === 'Escape') closeDetailPage()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [detailPageProject])

  // 吸顶导航滚动监听：随页面滚动高亮当前所在分区
  useEffect(() => {
    const ids = ['hero', 'about', 'projects', 'strengths', 'contact']
    const onScroll = () => {
      const probe = window.scrollY + 150
      let current = 'hero'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= probe) current = id
      }
      setActiveSection((prev) => (prev === current ? prev : current))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const heroRef = useRef(null)
  const fx = useHeroCinematic(heroRef)

  return (
    <SmoothScroll>
      {/* ── 复古桌面 OS 模式门控 ──────────────────────────────────
          宽屏 + 未选长页 + 未开减少动效时，桌面层盖住下面这张长页。
          长页照常挂载（详情浮层 z-[200] 要压在桌面 z-150 之上），
          但 Lenis 被 useLenisLock 锁死、html.yh-os-mode 关掉原生滚动，
          所以两层不会抢滚轮与方向键。三条降级出口：
          ?plain=1 / localStorage yh_portfolio_plain_mode=1 / prefers-reduced-motion。 */}
      <DesktopOSGate projects={projects} onOpenProject={openProject}>
      {/* 顶部 3px 橙色滚动进度条。入口页整屏接管时，主文档没有可滚动内容，
          进度值取不到，这条线会退化成一条满宽静态橙线浮在最上缘 —— 既没有
          在表达"读到哪里"，又和下方胶囊导航抢开口。接管期间先收起来。 */}
      {!landingCoverActive && <ScrollProgress />}
      {/* 章节进度轨：右侧五个圆点，滚到哪节哪节变橙 */}
      <SectionRail />
      {/* 原「页边竖井小人」（ScrollDiver）已删除：它的功能是楼层/进度读数，
          与右侧章节轨重复，且在页边与正文左缘 44px 反复争夺空间。
          组件与样式已归档到 E:\deepseek\tmp\archive\（ScrollDiver.jsx / scrolldiver.css）。 */}
      {/* 点击迸发：同一圈粒子画两遍，黑版偏 (-1.6,+1.6)、橙版归位 ——
          印刷里的套印不准。无粒子时 rAF 立即停机，空闲零开销。 */}
      <ClickSpark />
      {/* 离屏 / 空闲停表：所有"无限循环"的装饰动画（呼吸橙圆、扫描光带、
          星芒边框、blob 漂浮、wobble…）在滚出视野或长时间无人操作时
          停掉动画时钟，别让合成器躺着也一直产帧。
          组件自己用 document.getAnimations() 扫出无限动画，不需要维护类名清单，
          也能覆盖延后挂载的详情页子树。 */}
      <OffscreenPause />
      <div className="bg-background text-foreground font-sans antialiased">
      {/* 全局 Acid 导航：纸面感底 + 底缘黑线，印刷硬边按钮。
          这里**故意不用 backdrop-blur**：毛玻璃要在每一帧重新采样并模糊
          背后整条横带（底下就是大幅作品图与网点层），滚动时是持续的
          合成开销，而这层底色本身已经是 95% 不透明的白 ——
          模糊几乎看不见，纯属白花钱。去掉之后观感几乎无差，
          硬边不透明反而更贴合全站"印刷硬边、不要柔光"的语言。 */}
      <header className={`sticky top-0 z-50 w-full bg-white/95 text-[#151515] ${landingCoverActive ? 'hidden' : ''}`} style={{ borderBottom: '2px solid #151515' }}>
        <div className="page-shell flex items-center justify-between gap-4 py-3 md:py-3.5">
          <a href="#hero" className="flex shrink-0 items-center gap-2 text-xl font-black leading-none tracking-tighter max-lg:min-h-[44px] md:text-2xl">
            YANGHONG<span className="inline-block h-2.5 w-2.5 bg-[#E67E33]" style={{ boxShadow: '1px 1px 0 0 #151515' }} />
          </a>
          <nav className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-[0.22em] lg:flex" aria-label="主导航">
            {[
              { id: 'hero', label: '首页' },
              { id: 'about', label: '经历' },
              { id: 'projects', label: '项目' },
              { id: 'strengths', label: '优势' },
              { id: 'contact', label: '联系' },
            ].map(({ id, label }) => {
              const on = activeSection === id
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={on ? 'true' : undefined}
                  className={`cursor-pointer transition-colors duration-150 ${
                    on
                      ? 'border-b-2 border-[#151515] text-[#151515]'
                      : 'text-[#4d4d4d] hover:text-[#151515]'
                  }`}
                >
                  {label}
                </a>
              )
            })}
          </nav>
          <div className="flex items-center gap-3">
            {/* 桌面模式：宽屏下最显眼的入口。
                用户反馈原来只有右下角一个 96×33 的白底小胶囊，他根本没看见、
                以为功能坏了 —— 所以这里在顶栏常驻一个橙底硬边的切换键。
                本组件不持有模式状态，只派发自定义事件，由 DesktopOSGate 处理
                （见 src/components/desktop-os/RetroDesktopOS.jsx 的 ENTER_EVENT）；
                <1024px 与 prefers-reduced-motion 时由 .os-entry-header 隐藏。 */}
            <button
              type="button"
              className="os-entry-header hidden h-10 shrink-0 items-center gap-2 border-2 border-[#151515] bg-[#E67E33] px-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#151515] transition-colors hover:bg-[#151515] hover:text-[#E67E33] lg:inline-flex"
              style={{ boxShadow: '3px 3px 0 0 #151515' }}
              data-action="enter-desktop-header"
              onClick={() => window.dispatchEvent(new CustomEvent('yh:enter-desktop-mode'))}
              title="把 8 个项目变成桌面上的图标"
              aria-label="进入桌面模式：8 个项目变成桌面上的图标"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                <rect x="2.5" y="4" width="19" height="12.5" />
                <path d="M8.5 20h7M12 16.5V20" />
              </svg>
              桌面模式
            </button>
            <label className="relative hidden cursor-text lg:block">
              <span className="sr-only">搜索精选项目</span>
              <input
                type="search"
                value={projectQuery}
                onChange={(e) => setProjectQuery(e.target.value)}
                placeholder="SEARCH"
                aria-label="搜索精选项目"
                className="w-36 cursor-text border-2 border-[#151515] bg-transparent px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#151515] outline-none transition-[width] duration-200 placeholder:text-[#151515]/40 focus:w-52 focus:bg-[#E67E33]/15"
              />
            </label>
            {/* 响应式显隐交给这层外包装，不要放在 <Magnetic> 上。
                Magnetic 内部写死了 `inline-block`，和传进去的 `hidden` 是
                两个 display 工具类，谁赢取决于 Tailwind 的生成顺序 ——
                实测 320px 下 `inline-block` 赢，`hidden md:block` 从来没生效过。
                原来之所以没露出来，是因为里面那个 <a> 自己也带 `hidden`，
                等于被第二道锁挡住了；现在锚点要常显，这道假锁就暴露了。
                独立一层只带 `hidden md:block`，不存在同类冲突。 */}
            <div className="hidden md:block">
              <Magnetic>
                {/* StarBorder：上下两条橙光带反向游走（纯 CSS，radial-gradient +
                    平移淡出）。挂在这个常驻视口的主 CTA 上 ——
                    全页任何时候都至少有一个东西在动。 */}
                <StarBorder speed="7s">
                  <a
                    href="#contact"
                    className="block bg-[#151515] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#E67E33] transition-colors hover:bg-[#E67E33] hover:text-[#151515]"
                  >
                    Get Started
                  </a>
                </StarBorder>
              </Magnetic>
            </div>
            <button
              type="button"
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex h-11 w-11 items-center justify-center border-2 border-[#151515] text-[#151515] lg:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 移动端下拉 */}
        <div
          className={`absolute left-0 right-0 top-full z-30 overflow-hidden border-b-2 border-[#151515] bg-white transition-all duration-200 lg:hidden ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 border-b-0 opacity-0'
          }`}
        >
          <div className="mx-auto flex w-full max-w-[1320px] flex-col px-6 py-3">
            {[
              ['首页', '#hero'],
              ['经历', '#about'],
              ['项目', '#projects'],
              ['优势', '#strengths'],
              ['联系', '#contact'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-bold text-[#151515] hover:bg-[#F5F6F8]"
              >
                {label}
              </a>
            ))}
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="mt-1 rounded-full bg-[#151515] px-5 py-3 text-center text-sm font-bold text-white">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* 手机端把项目区提到自我介绍之前（order-2），来访者第一眼就看到作品。
          做法是在手机端把 main 变成 flex 列 + 给各 section 排 order —— order 只对
          flex/grid 子项生效，而 md 以上恢复成普通 block，order 被忽略，
          所以桌面端的先后顺序与布局完全不受影响。
          各 section 的 order 值：hero 1 / projects 2 / about 3 / strengths 4 / contact 5。 */}

      {/* 手机端首访层（卡片牌堆版）：8 张项目卡可滑动切换，点最前那张 = 进详情。
          仍保持「一个可点目标只对应一个动作」：卡片=详情，底部两个按钮=简历/留言。
          initialIndex 让从详情页退回来时还停在刚才看的那一张。 */}
      {isMobile && mobileLandingOpen && (
        <MobileCardLanding
          projects={projects}
          initialIndex={landingIndex}
          onOpenProject={(p, index) => {
            // 一个项目只有一套详情：手机上不再有原稿 iframe 浮层这条路。
            if (typeof index === 'number') setLandingIndex(index)
            openProject(p)
          }}
          onOpenResume={() => {
            // 「简历与能力」→ 长页：压一层 'longpage'，返回键就能退回列表
            pushOverlayEntry('longpage')
            setTimeout(() => {
              const el = document.getElementById('about')
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 50)
          }}
          onOpenContact={() => {
            // 「给我留言」→ 长页联系区里的云端留言表单
            pushOverlayEntry('longpage')
            setTimeout(() => {
              const el = document.getElementById('contact')
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 50)
          }}
        />
      )}

      {/* 长页返程胶囊：长页上唯一一条"回到入口"的路（原先只能刷新页面）。
          48px 高、左下角、z-95；任何浮层打开时直接不渲染。 */}
      {isMobile &&
        !mobileLandingOpen &&
        !mobileReel &&
        !originalDetailProject &&
        !selectedProject &&
        !detailPageProject && (
          <button
            type="button"
            className="ml-return-capsule"
            data-action="reopen-mobile-player"
            onClick={() => {
              if (overlayStackRef.current.includes('longpage')) recycleOverlayEntry()
              else setMobileLandingOpen(true)
            }}
            title="回到项目列表"
            aria-label="回到项目列表"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            列表
          </button>
        )}

      <main id="main" className={`acid-frame relative overflow-clip flex flex-col md:block ${isMobile && !mainVisibleOnMobile ? 'hidden' : ''}`}>
        {/* ===== Hero — 12栏刚性网格 + 图文咬合 ===== */}
        {/* 手机端长页的「铭牌」：桌面端那块 90vh 的大开场（巨型标题 + 两个呼吸光斑
            + 微标签行）在 414px 上单独占掉一整屏，换来的信息量只有一行字。
            手机上换成 96px 的铭牌，长页从第二屏就开始给内容。
            桌面端完全不渲染，原开场分毫不动。 */}
        {isMobile && (
          <div className="hero-mobile-plate">
            <span className="hero-mobile-name">YANG HONG</span>
            <span className="hero-mobile-meta">26届设计作品集 · 8 个项目</span>
          </div>
        )}

        <section id="hero" ref={heroRef} className="relative order-1 min-h-[90vh]" style={{ backgroundColor: '#FFFFFF' }}>
          {/* 全局噪点 / 印刷网点材质 */}
          {/* 印刷肌理：**只留一层不规则的纸纹**。
              原先这里有 .acid-noise（SVG 噪点 0.5）+ .acid-dots（网点 0.09），
              再叠上全站的 body::after 噪点和一层会动的 canvas 颗粒 ——
              四层里有两层是"不规则噪点"、而且颗粒尺度不同
              （canvas 是 1/5 分辨率的粗颗粒，SVG 是细颗粒）。
              两种尺度打架，眼睛读到的就是"乱"，而不是"有质感"。
              所以那两个不规则噪点全部撤掉，全站只留 body::after 一层细纸纹；
              这里只保留网点 —— 它是规则网格，是印刷语言，不是噪点。 */}
          <div aria-hidden="true" className="acid-dots pointer-events-none absolute inset-0 z-[2] opacity-[0.05]" />

          {/* 顶部微缩标注行 */}
          <div className="acid-microlabel relative z-[6] flex items-center justify-between gap-6 px-4 pt-6 text-[#151515]/70 md:px-8 lg:px-12 lg:pt-8">
            <span>PRODUCT DESIGN · 2026</span>
            <span className="hidden md:inline">YH / 26届 · ISSUE EDITION</span>
            <span className="rounded-full bg-[#151515] px-3 py-1 text-[#E67E33]">26届 · 2026</span>
          </div>

          {/* 核心 12 栏网格容器 */}
          <div className="relative z-[5] mx-auto grid min-h-[78vh] max-w-[1440px] grid-cols-12 px-6">
            {/* 呼吸光晕：**自主时钟**，不依赖任何输入。
                周期 7.2s，缓慢的缩放 + 透明度起伏 —— 这是"呼吸感"里
                唯一不能由指针产生的那一半：访客静止不动时，画面仍在呼吸。
                单独一层而不是给橙圆加动画：橙圆已经绑了滚动视差
                （fx.circle 写内联 transform），CSS 动画的优先级高于内联样式，
                挂同一元素上会把视差整个吃掉。 */}
            <div
              aria-hidden="true"
              className="mo-breath pointer-events-none absolute -left-[14%] top-[16%] z-0 h-[40vw] max-h-[540px] min-h-[280px] w-[40vw] min-w-[280px] max-w-[540px] rounded-full"
              style={{
                // 浓度压在 0.20：右侧已经有一块硬边橙圆，
                // 这一块再浓就会把画面的"硬边"糊掉 —— 它是呼吸，不是第二个色块。
                background:
                  'radial-gradient(circle, rgba(230,126,51,0.20) 0%, rgba(230,126,51,0.06) 46%, rgba(230,126,51,0) 74%)',
              }}
            />

            {/* 背景荧光橙色块：偏中右侧，作为底层被文字覆盖。
                data-bloom-origin 给「完整经历 ↗」的墨点放大转场做圆心 ——
                转场就是让这一块自己长大盖住整屏，所以圆心必须是它的实时中心
                （getBoundingClientRect 会把视差位移一起算进去）。纯标记属性，
                不参与样式，也不改任何视觉。 */}
            <motion.div
              aria-hidden="true"
              data-bloom-origin
              className="pointer-events-none absolute left-[40%] top-[10%] z-0 h-[46vw] max-h-[620px] min-h-[320px] w-[46vw] min-w-[320px] max-w-[620px] rounded-full"
              style={{ backgroundColor: '#E67E33', ...fx.circle }}
            />

            {/* 左侧巨型文字区：向右延伸覆盖色块 */}
            <motion.div className="relative z-10 col-span-12 flex flex-col justify-center py-12 lg:col-span-8 lg:py-0" style={fx.headline}>
              <h1 className="select-none" style={{ fontFamily: "'Oswald','Inter',sans-serif" }}>
                {/* 逐字揭示：GSAP SplitText 把这两个词拆成单字，
                    每字延迟 40ms、位移 56px、时长 1.15s、power3.out。
                    文案一个字没改 —— 拆的就是这两个词本身；
                    拿不到插件或开了减少动效时，它就是原样的两个 div。 */}
                <SplitHeading
                  as="div"
                  type="chars"
                  delay={40}
                  y={56}
                  duration={1.15}
                  className="font-black uppercase leading-[0.85] text-[#151515]"
                  style={{ fontSize: 'clamp(4rem, 9vw, 8.6rem)', letterSpacing: '-0.02em' }}
                >
                  Crafting
                </SplitHeading>
                <SplitHeading
                  as="div"
                  type="chars"
                  delay={34}
                  y={64}
                  duration={1.25}
                  className="font-instrument italic leading-[0.86] text-[#151515]"
                  style={{ fontSize: 'clamp(4.6rem, 13.5vw, 13rem)', letterSpacing: '-0.03em', marginLeft: '6vw' }}
                >
                  Experiences
                </SplitHeading>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 lg:mt-7">
                  <span
                    className="inline-flex items-center border-[3px] border-[#151515] bg-[#E67E33] px-5 py-1.5 text-[#151515]"
                    style={{ fontSize: 'clamp(1.6rem, 3.4vw, 3rem)', fontWeight: 800, lineHeight: 1.1 }}
                  >
                    WITH
                  </span>
                  <span
                    className="font-black uppercase leading-none text-[#151515]"
                    style={{ fontSize: 'clamp(2.4rem, 6vw, 6rem)', letterSpacing: '-0.015em' }}
                  >
                    Product&nbsp;&amp;&nbsp;UI
                  </span>
                </div>
              </h1>

              <Magnetic className="w-fit flex">
                <a
                  href="#projects"
                  className="mt-8 inline-flex w-fit  items-center gap-2 bg-[#151515] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#E67E33] transition-transform hover:-translate-y-0.5"
                >
                  查看项目
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </Magnetic>
            </motion.div>

            {/* 右侧 Profile 卡片：HeroProfileWrapper —— 12栏锚点 + 3D透视 + 垫片硬影 + 酸质辉光 */}
            {/* 外层 motion.div 必须继承栅格占位（col-span-12 lg:col-span-4），
                否则它会取代 HeroProfileWrapper 成为栅格直接子元素却无列占位，卡片会被压成 1 列 */}
            <motion.div className="col-span-12 lg:col-span-4" style={fx.card}>
            <HeroProfileWrapper>
              {/* 压线贴纸：Profile 标签。悬停时上沿掀开，露出底下的
                  黑橙警戒斜纹 + 一条折痕 —— 印刷厂贴纸被抠起来的样子。
                  外层 span 负责定位与旋转（Tailwind 的 absolute 是分层样式，
                  而 .mo-sticker 的无分层 position:relative 会压过它，
                  所以定位必须留给外层）。 */}
              <span className="absolute -top-3 left-5 z-10 inline-block ">
                <Sticker>
                  <span className="bg-[#E67E33] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#151515]">
                    Profile
                  </span>
                </Sticker>
              </span>
              <div className="pointer-events-none absolute -right-3 -top-3 z-10 text-3xl leading-none text-[#E67E33]">✳</div>

              {/* 头像 + 姓名 */}
              <div className="mt-2 flex items-center gap-4">
                <span className="block h-16 w-16 shrink-0 overflow-hidden border-2 border-white md:h-[72px] md:w-[72px]">
                  <img src={asset("/avatar.webp")} alt="杨鸿头像" decoding="async" className="h-full w-full object-cover" />
                </span>
                <h2 className="font-black leading-tight" style={{ fontFamily: "'Noto Sans SC','Inter',sans-serif", fontSize: 'clamp(1.15rem, 1.6vw, 1.45rem)' }}>
                  杨鸿 / 产品设计师。
                </h2>
              </div>

              {/* 状态互斥：格言 ↔ 详细资料 */}
              <div className="relative mt-5 min-h-[190px] flex-1 md:min-h-[150px]">
                <AnimatePresence mode="wait">
                  {!profileCardOpen && (
                    <motion.div
                      key="quote"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex flex-col"
                    >
                      <p className="font-medium leading-[1.9] text-white/85" style={{ fontFamily: "'Noto Sans SC','Inter',sans-serif", fontSize: 'clamp(0.9rem, 1.05vw, 1rem)' }}>
                        用形态、材质与界面语言，把概念变成可被感知、可被使用的产品体验。致力于探索数字与实体的边界。
                      </p>
                      <button
                        type="button"
                        onClick={() => setProfileCardOpen(true)}
                        className="mt-auto inline-flex w-fit items-center gap-2 border-2 border-[#E67E33] bg-[#E67E33] px-5 py-2.5 text-sm font-black text-[#151515] transition-colors hover:bg-transparent hover:text-[#E67E33]"
                      >
                        查看资料 →
                      </button>
                    </motion.div>
                  )}

                  {profileCardOpen && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex flex-col"
                    >
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-y border-white/15 py-3 text-[12.5px] font-semibold">
                        <div className="flex items-center justify-between"><span className="text-white/50">年龄</span><span>23 岁</span></div>
                        <div className="flex items-center justify-between"><span className="text-white/50">学历</span><span>本科</span></div>
                        <div className="flex items-center justify-between"><span className="text-white/50">专业</span><span>产品设计</span></div>
                        <div className="flex items-center justify-between"><span className="text-white/50">院校</span><span>广州商学院</span></div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {['UI/UX', '3D Modeling', 'Figma', 'Rhino'].map((skill) => (
                          <span key={skill} className="bg-[#E67E33] px-2.5 py-1 text-[10px] font-black text-[#151515]">{skill}</span>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <a
                          href="#about"
                          onClick={handleFullExperience}
                          className="inline-flex cursor-pointer items-center gap-1 text-sm font-black text-[#E67E33] hover:underline"
                        >
                          完整经历 ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => setProfileCardOpen(false)}
                          className="border border-white/40 px-4 py-2 text-xs font-black text-white transition-colors hover:border-[#E67E33] hover:text-[#E67E33]"
                        >
                          收起
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </HeroProfileWrapper>
            </motion.div>
          </div>

          {/* 底部收尾层：黑带为斜切长带（左低右高），DESIGN 与之同角度、字底恒定嵌入带内，
              黑带盖住字底，带顶在整条上保持干净的斜直线 */}
          <div className="relative">
            {/* 黑带：超宽 + 左移，斜切后角部收在视口外；origin-bottom 保证底边不动 */}
            <div className="relative z-[1]">
              <div
                aria-hidden="true"
                className="relative flex h-[clamp(104px,13vw,168px)] w-[112%] origin-bottom -translate-x-[6%] select-none items-center overflow-hidden whitespace-nowrap bg-[#151515]"
              >
                {/* 从「CSS 定时器无限循环」换成「滚动速度驱动的跑马灯」：
                    没人操作时按 58px/s 自走（呼吸），一滚动速度被叠加放大、
                    往回滚还会翻转方向（动态）。位移对一份拷贝宽度取模回卷，
                    所以是真正无缝的。原 acid-ticker 的 32s linear 常量已不再需要。 */}
                <VelocityTicker
                  className="min-w-0 flex-1"
                  baseVelocity={-58}
                  numCopies={3}
                  itemClassName="flex shrink-0 items-center"
                >
                  <span
                    className="text-[#E67E33]"
                    style={{ fontFamily: "'Oswald','Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(2.6rem, 6.2vw, 5.6rem)', lineHeight: 1.02, letterSpacing: '-0.01em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}
                  >
                    Look deep into your own heart, all miracles live in yourself
                  </span>
                  <span aria-hidden="true" className="mx-[2.6vw] text-[#E67E33]" style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.6rem)', lineHeight: 1 }}>✦</span>
                  <span
                    className="hidden shrink-0 items-center text-white/45 md:flex"
                    style={{ fontFamily: "'JetBrains Mono','Inter',monospace", fontSize: '10px', letterSpacing: '0.38em', fontWeight: 700 }}
                  >
                    YH / 26TH ISSUE · SYS_REF: 2026
                  </span>
                  <span aria-hidden="true" className="mx-[2.6vw] text-[#E67E33]" style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.6rem)', lineHeight: 1 }}>✦</span>
                </VelocityTicker>
              </div>
            </div>

            {/* DESIGN：与斜带同角度；整字下移，字形底缘恰好压住斜带顶边（黑带盖住字底一小截），
                斜带形态不变 */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full select-none text-center">
              <h1 className="whitespace-nowrap" style={{ fontFamily: "'Oswald','Inter',sans-serif" }}>
                <span
                  className="acid-outline inline-block font-black uppercase text-[#151515]"
                  style={{ fontSize: 'clamp(8rem, 20vw, 24rem)', letterSpacing: '-0.03em', transform: 'translateY(0.31em)', transformOrigin: 'center bottom' }}
                >
                  DESIGN
                </span>
              </h1>
            </div>
          </div>
          {/* 往下滚引导：鼠标图标上下浮动，滚过首屏后淡出下沉.
             放在 section 直属位置，absolute 的包含块才是 #hero 本身。 */}
          <ScrollCue />
        </section>
        {/* About — 经历：垂直时间轴 + 水平卡片 ===== */}
        <section id="about" className="relative order-3 overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          {/* 手机端长页重做（≤767px）· 风格方向 A「瑞士工程档案表」。
              同一批 CSS（components/mobile-longpage.css）只在 ≤767px 把桌面骨架
              （page-shell 正文 / 跑马灯带 / 巨型水印）隐藏，所以两边不会同时出现；
              ≥768px 一个字都不变。断点必须与本组件的 isMobile 一致，否则平板会
              渲染桌面 DOM 却被隐藏，整段塌陷。数据与状态全部复用：experiences / activeExp / openProject。 */}
          {isMobile && (
            <div className="mob-about">
              <div className="mob-sechead">
                <span className="mob-kicker">SEC. 03 · PERSONAL FILE</span>
                <h2 className="mob-h1">个人经历</h2>
                <div className="mob-stats">
                  <span><b>3+</b><i>经历 / 项目</i></span>
                  <span><b>N2</b><i>日语能力</i></span>
                </div>
              </div>

              <div className="mob-exp-list">
                {experiences.map((exp, idx) => {
                  const isActive = idx === activeExp
                  const related = exp.projectId ? projects.find((p) => p.id === exp.projectId) : null
                  return (
                    <div key={exp.company + exp.date} className={`mob-exp ${isActive ? 'is-open' : ''}`}>
                      <button
                        type="button"
                        className="mob-exp-row"
                        aria-expanded={isActive}
                        onClick={() => setActiveExp(isActive ? null : idx)}
                      >
                        <span className="mob-mono">{exp.date}</span>
                        <span className="mob-exp-name">{exp.company}</span>
                        <span className="mob-chip">{exp.title}</span>
                        <span className="mob-caret" aria-hidden="true">{isActive ? '−' : '+'}</span>
                      </button>
                      {isActive && (
                        <div className="mob-exp-body">
                          {exp.items.map((item, i) => (
                            <p key={i} className="mob-li">{item}</p>
                          ))}
                          {related && (
                            <button type="button" className="mob-cta" onClick={() => openProject(related)}>
                              <span>{related.id} · {related.title}</span>
                              <span aria-hidden="true">↗</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 自研轮 D6：删掉这里的全宽橙色「查看全部精选项目 ↓」。
                  它夹在经历手风琴与规格表之间，与本节结尾的规格表功能重复，
                  且是全页唯一无边框的橙色块，视觉上像残留。长页出口交给
                  顶部导航的「项目」和 SEC. 02 作品区本身。 */}

              <dl className="mob-specgrid">
                {[
                  { k: '教育', v: '广州商学院', s: '产品设计 · 本科' },
                  { k: '在读时间', v: '2022.9', s: '– 2026.6' },
                  { k: '设计工具', v: 'PS / AI / Rhino', s: 'Keyshot / SD / AI 绘画' },
                  { k: '语言', v: '日语 N2', s: '粤语 · 普通话' },
                ].map((row) => (
                  <div key={row.k} className="mob-spec">
                    <dt>{row.k}</dt>
                    <dd>{row.v}</dd>
                    <dd>{row.s}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* 章节滚动条：EXPERIENCE 循环带（黑底酸黄） */}
          <div aria-hidden="true" className="relative z-[1] select-none overflow-hidden border-y-[3px] border-[#151515] bg-[#151515] py-3">
            {/* 自主时钟：一条橙光带缓缓横扫整条黑带 —— 不看不看输入。
                放在跑马灯之前（DOM 在前 → 绘在下层），只提亮、不压字。 */}
            <span aria-hidden="true" className="mo-sweep" />
            <VelocityTicker
              baseVelocity={-44}
              numCopies={4}
              itemClassName="flex shrink-0 items-center text-[#E67E33]"
            >
              <span
                style={{ fontFamily: "'Oswald','Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', lineHeight: 1, letterSpacing: '0.02em' }}
              >
                <i className="not-italic px-6 text-[#E67E33]">✦</i>
                EXPERIENCE
                <i className="not-italic px-6 text-[#E67E33]">✦</i>
                SEC. 03 · PERSONAL FILE
                <i className="not-italic px-6 text-[#E67E33]">✦</i>
                YH / 26届 ISSUE
                <i className="not-italic px-6 text-[#E67E33]">✦</i>
                TIMELINE · 2026
                <i className="not-italic px-6 text-[#E67E33]">✦</i>
              </span>
            </VelocityTicker>
          </div>

          {/* Background ghost text */}
          <span className="section-watermark text-[18vw] md:text-[16vw] lg:text-[15vw]">
            EXPERIENCE
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute right-[-5%] bottom-6 z-0 hidden select-none text-[12vw] font-black leading-none tracking-tighter text-[#151515]/[0.04] lg:block">
            TIMELINE
          </span>

          <div className="relative z-10 page-shell py-14 md:py-24">
            {/* Section header */}
            <Reveal>
            <div className="mb-14 flex flex-col gap-10 border-b-2 border-[#151515] pb-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="relative">
                <span className="absolute -top-7 -left-3 z-10  bg-[#E67E33] px-4 py-1 text-xs font-black md:-left-5">
                  SEC. 03
                </span>
                {/* 擦入式揭幕：py 是必须的 —— h2 的 leading 小于 1，
                    行盒比字身矮，中文会溢出行盒；没有这点内边距，裁切框会把字顶字底切掉。 */}
                <ClipReveal delay={0.1} className="py-2 md:py-3">
                <h2
                  className="leading-[0.92] tracking-[-0.02em] text-[#151515]"
                  style={{ fontFamily: "'Oswald','Noto Sans SC','Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(3.4rem, 7.5vw, 7rem)' }}
                >
                  个人经历
                </h2>
                </ClipReveal>
              </div>

              <div className="flex flex-col items-start gap-4 md:items-end">
                <div className="border-4 border-[#151515] bg-[#151515] p-4 text-white">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black leading-none text-[#E67E33]">
                        <CountUp to={3} suffix="+" duration={1.6} />
                      </span>
                      <span className="mt-1 text-[10px] font-black tracking-widest">经历/项目</span>
                    </div>
                    <div className="flex flex-col border-l-2 border-white/20 pl-6">
                      <span className="text-3xl font-black leading-none">N2</span>
                      <span className="mt-1 text-[10px] font-black tracking-widest">日语能力</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-baseline justify-start gap-x-4 gap-y-1.5 md:justify-end">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#151515]">Product Design</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#151515]">User Research</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#151515]" style={{ textDecoration: 'underline', textDecorationColor: '#E67E33', textDecorationThickness: '3px', textUnderlineOffset: '4px' }}>3D Modeling</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#151515]">UI / UX</span>
                </div>

                {/* 「总的转接」：个人经历 → 精选作品 的整节出口。
                    经历卡里那枚按钮只服务于"这一条经历确实产出了某个项目"；
                    整节的出口放在这里 —— 看完经历想直接看作品时，
                    不必再滚回顶部找导航。
                    用 <a href="#projects"> 而不是 onClick + scrollTo：
                    锚点点击已被 SmoothScroll 统一接管（含吸顶高度补偿），
                    走它才有和顶部导航完全一致的手感。
                    配色沿用本页语言：橙底黑字 + 黑色偏移硬影，
                    hover 反色成黑底橙字，硬影同步换成橙色才不会糊在一起。 */}
                <a
                  href="#projects"
                  className="group/all flex w-full items-center justify-between gap-4 border-[3px] border-[#151515] bg-[#E67E33] px-5 py-3.5 text-[#151515] shadow-[4px_4px_0_0_#151515] outline-none transition-[background-color,color,box-shadow] duration-300 hover:bg-[#151515] hover:text-[#E67E33] hover:shadow-[4px_4px_0_0_#E67E33] focus-visible:ring-2 focus-visible:ring-[#E67E33] focus-visible:ring-offset-2"
                >
                  <span className="flex flex-col items-start gap-0.5 text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] opacity-70">
                      View All Projects
                    </span>
                    <span
                      className="text-sm font-black leading-tight md:text-[15px]"
                      style={{ fontFamily: "'Noto Sans SC','Inter',sans-serif" }}
                    >
                      查看全部精选项目
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/all:translate-x-1" />
                </a>
              </div>
            </div>
            </Reveal>

            {/* 垂直时间轴：单列 flex 布局 */}
            <div className="relative mx-auto flex max-w-4xl flex-col gap-12">
              {/* 中央轴线（桌面端） */}
              <div aria-hidden="true" className="pointer-events-none absolute left-8 top-0 bottom-0 hidden w-px bg-[#151515]/15 lg:left-1/2 lg:-translate-x-1/2 lg:block" />

              {experiences.map((exp, idx) => {
                const isActive = idx === activeExp
                const isLeft = idx % 2 === 0
                // 这张经历对应的作品（没有折进 projectId 就是 null）
                const related = exp.projectId ? projects.find((p) => p.id === exp.projectId) : null
                // 卡片整体是个"展开/收起"按钮，而里面那枚「查看相关项目」
                // 自己也是个按钮。点它的时候事件会冒泡到卡片上，把卡片收了 ——
                // 所以卡片先用 data-project-cta 认一下来源，来自转接口的直接让路。
                const isFromCta = (e) => !!(e.target instanceof Element && e.target.closest('[data-project-cta]'))
                return (
                  <article
                    key={exp.company + exp.date}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isActive}
                    onClick={(e) => { if (isFromCta(e)) return; setActiveExp(isActive ? null : idx) }}
                    onKeyDown={(e) => {
                      if (isFromCta(e)) return
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveExp(isActive ? null : idx) }
                    }}
                    className={`brutal-card group relative w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#151515] lg:w-[calc(50%-44px)] ${isLeft ? 'lg:mr-auto' : 'lg:ml-auto'}`}
                  >
                    {/* 日期贴纸：荧光橙，微旋转，压左上角 */}
                    <span className="absolute -top-4 -left-3 z-20  border-2 border-[#151515] bg-[#E67E33] px-3 py-1.5 text-xs font-black text-[#151515] md:-left-5">
                      {exp.date}
                    </span>

                    {/* 时间轴节点 */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute top-5 z-10 hidden h-5 w-5 rounded-full border-4 border-white bg-[#151515] shadow-[0_0_0_2px_#151515] lg:block ${isLeft ? 'left-[calc(100%+34px)]' : 'right-[calc(100%+34px)]'}`}
                    />

                    {/* 经历卡主体：3D 倾斜 + 辉光 + 白底微透明粗边框 */}
                    <BrutalTiltCard
                      contentClassName="p-6 md:p-8"
                      cardClassName="border-[3px] border-[#151515]/[0.1]"
                      innerGradient="linear-gradient(145deg, #ffffff 0%, #f6f6f3 100%)"
                      spacerClass="translate-x-2 translate-y-2"
                      glowColor="#E67E33"
                      glowOpacity={0.35}
                      tiltMax={5}
                    >
                      {/* 激活：左侧酸黄指示条 */}
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute bottom-5 left-0 top-5 w-[6px] bg-[#E67E33] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                      />
                      {/* hover 引导：同位置再叠一条"自顶向下长出"的橙条。
                          用 scaleY 而不是透明度，是为了和上面那条"已展开"的实心条
                          在手感上区分开 —— 一个是一次性点亮，一个是跟随指针的生长。 */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-5 left-0 top-5 w-[6px] origin-top scale-y-0 bg-[#E67E33] transition-transform duration-300 group-hover:scale-y-100"
                      />
                      {/* 压角大编号 */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-3 right-3 select-none font-black leading-none text-[#151515]/[0.06]"
                        style={{ fontFamily: "'Oswald','Inter',sans-serif", fontSize: 'clamp(3.6rem, 5vw, 6rem)' }}
                      >
                        0{idx + 1}
                      </span>

                      {/* 头行 */}
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 pr-10">
                        <h3 className="font-black leading-tight text-[#151515]" style={{ fontFamily: "'Noto Sans SC','Inter',sans-serif", fontSize: 'clamp(1.4rem, 2vw, 2rem)' }}>
                          {exp.company}
                        </h3>
                        <div className="flex shrink-0 items-center gap-2.5">
                          <span className="border-2 border-[#151515] bg-[#E67E33] px-3 py-1 text-[10px] font-black uppercase text-[#151515]">
                            {exp.title}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`flex h-8 w-8 items-center justify-center border-2 transition-colors duration-300 md:h-9 md:w-9 ${isActive ? 'border-[#151515] bg-[#151515] text-[#E67E33]' : 'border-[#151515] bg-white text-[#151515]'}`}
                          >
                            <ArrowRight className={`h-3.5 w-3.5 transition-transform duration-500 ${isActive ? '-rotate-90' : 'rotate-90'}`} />
                          </span>
                        </div>
                      </div>

                      {/* 明细 */}
                      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <div className="space-y-4 border-t-2 border-[#151515] pt-5">
                            {exp.items.map((item, i) => (
                              <p
                                key={i}
                                className={`pl-4 text-[13px] font-bold leading-[1.9] text-[#3f3f3f] md:text-sm ${i % 2 === 0 ? 'border-l-[3px] border-[#E67E33]' : 'border-l-[3px] border-[#151515]'}`}
                              >
                                {item}
                              </p>
                            ))}

                            {/* 经历 → 作品 的转接口。
                                只在这张经历确实有对应作品时出现（见 experiences 里的 projectId）。
                                走的是和作品卡片同一个 openProject()：03 直接进墨黑详情页，
                                其余进数据面板 —— 两处入口的呈现完全一致。
                                样式沿用本页的印刷语言：硬边框 + 橙色偏移硬影 + hover 反色。
                                type="button" 是必须的：它虽然不在 form 里，但显式声明
                                省得日后被包进表单时变成 submit。 */}
                            {related && (
                              <button
                                type="button"
                                data-project-cta
                                onClick={(e) => { e.stopPropagation(); openProject(related) }}
                                aria-label={`查看相关项目：${related.title}`}
                                className="group/cta mt-2 flex w-full items-center justify-between gap-3 border-2 border-[#151515] bg-[#151515] px-4 py-3 text-left outline-none transition-colors duration-300 hover:bg-[#E67E33] focus-visible:ring-2 focus-visible:ring-[#E67E33] focus-visible:ring-offset-2"
                                style={{ boxShadow: '3px 3px 0 0 #E67E33' }}
                              >
                                <span className="flex min-w-0 flex-col gap-1">
                                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#E67E33] transition-colors duration-300 group-hover/cta:text-[#151515]">
                                    View Project ↗
                                  </span>
                                  <span
                                    className="truncate text-[13px] font-black leading-tight text-white transition-colors duration-300 group-hover/cta:text-[#151515] md:text-sm"
                                    style={{ fontFamily: "'Noto Sans SC','Inter',sans-serif" }}
                                  >
                                    {related.id} · {related.title}
                                  </span>
                                </span>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[#E67E33] text-[#E67E33] transition-colors duration-300 group-hover/cta:border-[#151515] group-hover/cta:text-[#151515]">
                                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </BrutalTiltCard>
                  </article>
                )
              })}
            </div>

            {/* Education & skills — 水平砖墙 */}
            <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-20">
              <BrutalTiltCard
                contentClassName="p-5"
                cardClassName="border-2 border-[#151515]/[0.1]"
                innerGradient="linear-gradient(145deg, #ffffff 0%, #f2f2ef 100%)"
                spacerClass="translate-x-1.5 translate-y-1.5"
                glow={false}
                tiltMax={4}
              >
                <span className="pointer-events-none absolute right-2 top-2 text-[3.4rem] font-black leading-none text-[#151515]/10" style={{ fontFamily: "'Oswald','Inter',sans-serif" }}>01</span>
                <h3 className="relative mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#4d4d4d]">教育</h3>
                <p className="relative text-[15px] font-black leading-snug text-[#151515]">广州商学院</p>
                <p className="relative mt-1.5 text-[11px] font-bold text-[#4d4d4d]">产品设计 · 本科</p>
              </BrutalTiltCard>
              <BrutalTiltCard
                contentClassName="p-5"
                cardClassName="border-2 border-[#151515]/[0.1]"
                innerGradient="linear-gradient(145deg, #E67E33 0%, #D46D1A 100%)"
                spacerClass="translate-x-1.5 translate-y-1.5"
                glow={false}
                tiltMax={4}
              >
                <span className="pointer-events-none absolute right-2 top-2 text-[3.4rem] font-black leading-none text-[#151515]/15" style={{ fontFamily: "'Oswald','Inter',sans-serif" }}>02</span>
                <h3 className="relative mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#151515]">在读时间</h3>
                <p className="relative text-[15px] font-black leading-snug text-[#151515]">2022.9</p>
                <p className="relative mt-1.5 text-[11px] font-bold text-[#151515]/80">– 2026.6</p>
              </BrutalTiltCard>
              <BrutalTiltCard
                contentClassName="p-5"
                cardClassName="border-2 border-[#151515]"
                innerGradient="linear-gradient(145deg, #151515 0%, #1f2024 100%)"
                spacerClass="translate-x-1.5 translate-y-1.5"
                glow={false}
                tiltMax={4}
              >
                <span className="pointer-events-none absolute right-2 top-2 text-[3.4rem] font-black leading-none text-white/15" style={{ fontFamily: "'Oswald','Inter',sans-serif" }}>03</span>
                <h3 className="relative mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/75">设计工具</h3>
                <p className="relative text-[15px] font-black leading-snug text-[#E67E33]">PS / AI / Rhino</p>
                <p className="relative mt-1.5 text-[11px] font-bold text-white/75">Keyshot / SD / AI 绘画</p>
              </BrutalTiltCard>
              <BrutalTiltCard
                contentClassName="p-5"
                cardClassName="border-2 border-[#151515]/[0.1]"
                innerGradient="linear-gradient(145deg, #F5F5F5 0%, #e9e9e6 100%)"
                spacerClass="translate-x-1.5 translate-y-1.5"
                glow={false}
                tiltMax={4}
              >
                <span className="pointer-events-none absolute right-2 top-2 text-[3.4rem] font-black leading-none text-[#151515]/10" style={{ fontFamily: "'Oswald','Inter',sans-serif" }}>04</span>
                <h3 className="relative mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#4d4d4d]">语言</h3>
                <p className="relative text-[15px] font-black leading-snug text-[#151515]">日语 N2</p>
                <p className="relative mt-1.5 text-[11px] font-bold text-[#4d4d4d]">粤语 · 普通话</p>
              </BrutalTiltCard>
            </div>
          </div>
        </section>
        {/* Projects — Selected Works Acid 章节 */}
        {/* 这一节裁掉轮盘向两侧溢出的卡（overflow-hidden）。
            曾经为了让它内部的 sticky 章节舞台能吸附，改成过 overflow-clip；
            滚动章节撤掉后恢复原样。 */}
        <section id="projects"
          className="relative order-2 overflow-hidden"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {/* 手机端：精选项目索引已由首访层列表承担（同 8 个项目、同样一跳进详情），
              长页里再铺一遍等于两套入口 + 951px（1.06 屏）的重复展示。
              这里只留一行指路 + 一个 48px 热区按钮，把长页还给「简历与能力」本身。
              按钮逻辑与左下角返程胶囊同源：栈里有 longpage 就弹掉，否则直接开列表。 */}
          {isMobile && (
            <div className="mob-projects-note">
              <div className="mob-sechead">
                <span className="mob-kicker">SEC. 02 · SELECTED WORKS</span>
                <h2 className="mob-h1">精选项目</h2>
              </div>
              <p className="mob-lede">{projects.length} 个项目的完整推导过程在项目列表里 —— 点左下角「列表」随时回去。</p>
            </div>
          )}

          {/* 工业点阵背景 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{ backgroundImage: 'radial-gradient(#151515 1px, transparent 1px)', backgroundSize: '36px 36px', opacity: 0.07 }}
          />

          {/* 章节滚动条：SELECTED WORKS 循环带（酸黄底黑字，反色呼应 About） */}
          <div aria-hidden="true" className="relative z-[1] select-none overflow-hidden border-y-[3px] border-[#151515] bg-[#E67E33] py-3">
            <VelocityTicker
              baseVelocity={-44}
              numCopies={4}
              itemClassName="flex shrink-0 items-center text-[#151515]"
            >
              <span
                style={{ fontFamily: "'Oswald','Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', lineHeight: 1, letterSpacing: '0.02em' }}
              >
                <i className="not-italic px-6 text-[#151515]">✦</i>
                SELECTED WORKS
                <i className="not-italic px-6 text-[#151515]">✦</i>
                SEC. 02 · PORTFOLIO
                <i className="not-italic px-6 text-[#151515]">✦</i>
                PRODUCT · RESEARCH · IP
                <i className="not-italic px-6 text-[#151515]">✦</i>
                YH · 2026 ISSUE
                <i className="not-italic px-6 text-[#151515]">✦</i>
              </span>
            </VelocityTicker>
          </div>

          {/* 左贴边竖排酸黄条（Selected Works 工业标签带） */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 left-0 z-20 hidden w-10 flex-col items-center justify-center border-r-[3px] border-[#151515] bg-[#E67E33] md:flex"
          >
            <span
              className="text-[#151515] uppercase select-none"
              style={{ writingMode: 'vertical-rl', fontFamily: "'Oswald','Inter',sans-serif", fontWeight: 900, fontSize: '10px', letterSpacing: '0.5em' }}
            >
              Selected Works // 03
            </span>
          </div>

          {/* 背景 ghost 标题 */}
          <span className="section-watermark text-[16vw] md:text-[14vw] lg:text-[13vw]">
            SELECTED WORKS
          </span>

          {/* 克制几何点缀 */}
          <div className="absolute top-20 left-[4%] hidden h-10 w-10 border border-[#151515]/[0.08] md:block" />
          <div className="absolute top-[30%] right-[3%] hidden h-6 w-6 rounded-full border border-[#151515]/[0.1] md:block" />
          <div className="absolute bottom-[16%] left-[6%] hidden h-3 w-3 rounded-full bg-[#E67E33]/70 md:block" />
          <div className="absolute bottom-[24%] right-[6%] hidden h-5 w-5  rounded-[3px] bg-[#151515]/10 md:block" />

          <div className="relative z-10 page-shell py-14 md:py-24">
            {/* Header — 工业编辑头（6px 酸黄分隔线） */}
            <Reveal>
            <div className="mb-10 flex flex-col gap-8 border-b-[6px] border-[#E67E33] pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="acid-microlabel mb-4 flex items-center gap-3 text-[#151515]/60">
                  <span className="inline-block h-2.5 w-2.5 bg-[#E67E33]" style={{ boxShadow: '1px 1px 0 0 #151515' }} />
                  <span>03</span>
                  <span className="inline-block h-px w-10 bg-[#151515]/40" />
                  <span>Selected Works</span>
                </div>
                <ClipReveal delay={0.1} className="py-2 md:py-3">
                <h2
                  className="leading-[0.92] tracking-[-0.02em] text-[#151515]"
                  style={{ fontFamily: "'Oswald','Noto Sans SC','Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(3rem, 7vw, 6.2rem)' }}
                >
                  精选项目
                </h2>
                </ClipReveal>
                <p className="mt-5 max-w-md text-[14px] font-medium leading-[1.9] text-[#55544E]">
                  {projects.length} 组贯穿产品设计、用户研究与 IP 形态的实践。不拘一格的布局，只为让好作品更出彩。
                </p>
              </div>

              {/* 项目总数 stat（硬边印刷数字） */}
              <div className="flex items-end gap-5">
                <div className="text-right">
                  <span className="block font-black leading-none text-[#151515]" style={{ fontFamily: "'Oswald','Inter',sans-serif", fontSize: 'clamp(4rem, 7vw, 6.4rem)' }}>
                    {projects.length}+
                  </span>
                  <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#151515]/70">精选项目 · 多元领域</span>
                </div>
                <div className="mb-2 flex h-14 w-14 items-center justify-center bg-[#151515]">
                  <span className="text-[#E67E33]" style={{ fontSize: '1.4rem' }}>✦</span>
                </div>
              </div>
            </div>
            </Reveal>

            {/* Category filter（方形机能筛选） */}
            <div className="mb-10 md:mb-14">
              <div className="flex flex-wrap items-center gap-2">
                <span className="acid-microlabel mr-1 text-[#151515]/60">Filter /</span>
                {[
                  { label: '全部', value: '全部', en: 'ALL' },
                  { label: '产品设计', value: '产品设计', en: 'PRODUCT' },
                  { label: '用户研究', value: '用户研究', en: 'RESEARCH' },
                  { label: 'IP 设计', value: 'IP 设计', en: 'IP' },
                ].map((f) => {
                  const active = projectFilter === f.value
                  return (
                    <button
                      key={f.value}
                      onClick={() => setProjectFilter(f.value)}
                      className={`stamp-border px-4 py-2 text-[12px] font-black uppercase transition-all duration-150 ${
                        active
                          ? 'bg-[#E67E33] text-[#151515]'
                          : 'bg-transparent text-[#151515] hover:bg-[#E67E33]'
                      }`}
                    >
                      {f.label}
                      <span className={`ml-1.5 text-[9px] uppercase tracking-wider ${active ? 'text-[#151515]/60' : 'text-[#151515]/60'}`}>{f.en}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Project cards */}
            {(() => {
              // 直接用模块级那份 PROJECT_META，不再在渲染里抄一遍 ——
              // 原来这里有 8 条一模一样的副本（连 sub/tags 都逐字相同），
              // 改编号时两处都得手改，漏一处就出现"卡片写 03、标签写实习灯具"的错位。
              const meta = PROJECT_META

              const Card = ({ p, className = '', variant = 'split', index = 0 }) => {
                const m = meta[p.id] || { sub: p.category, tags: [] }
                const isDark = p.id === '03'
                const isAccent = p.id === '05'
                const textColor = isDark ? 'text-white' : 'text-[#151515]'
                const mutedColor = isDark ? 'text-white/80' : 'text-[#4d4d4d]'
                const tagCls = isDark
                  ? 'border-white/25 text-white'
                  : 'border-[#151515]/15 text-[#555555]'
                const cardBg = isAccent ? 'bg-[#E67E33]' : isDark ? 'bg-[#151515]' : 'bg-white'

                const ContentBlock = ({ compact = false }) => (
                  <div className={`flex flex-col justify-center ${compact ? 'p-4 pt-6' : 'p-5 md:p-6'}`}>
                    <div className={`mb-1 text-[11px] font-bold uppercase tracking-[0.18em] ${mutedColor}`}>
                      {m.sub}
                    </div>
                    {/* 标题 hover 变橙：橙色卡（03）本身就橙底，再变橙会看不见，所以排除掉 */}
                    <h3 className={`mb-1 text-xl font-black leading-tight transition-colors duration-300 md:text-2xl ${textColor} ${isAccent ? '' : 'group-hover:text-[#E67E33]'}`} style={{ fontFamily: "'Noto Sans SC','Inter',sans-serif" }}>
                      {p.title}
                    </h3>
                    <p className={`mb-2 text-[13px] leading-relaxed line-clamp-2 ${mutedColor}`}>{p.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${tagCls}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )

                const ImageBlock = ({ tall = false }) => (
                  <div className={variant === 'split' ? 'w-full md:w-[46%] md:pl-0 p-3 md:p-4' : 'w-full p-3 md:p-4 pb-0'}>
                    <div className={`relative h-full overflow-hidden rounded-2xl bg-[#F0F0F0] ${tall ? 'min-h-[120px]' : 'aspect-[16/10]'}`}>
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* 像素揭示层：指针进入这张图时，品牌两色的网点由中心向外扩散。
                          它自己 pointer-events:none，所以卡片的点击与键盘完全不受影响。 */}
                      <PixelReveal />
                    </div>
                  </div>
                )

                return (
                  // 卡片进场：换分类时整组重挂，按 index 依次落位（延时封顶 0.36s，
                  // 否则最后一张要等太久）。位移与透明度都是合成器属性。
                  <motion.div
                    className={`${className} relative`}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.52, delay: reduceMotion ? 0 : Math.min(index * 0.06, 0.36), ease: EASE }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`查看 ${p.title} 详情`}
                      onClick={(e) => {
                        e.stopPropagation()
                        openProject(p)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openProject(p)
                        }
                      }}
                      className={`group relative h-full cursor-pointer overflow-hidden rounded-[24px] transition-all duration-500 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#151515] ${cardBg} ${
                        isDark ? '' : 'border-2 border-[#151515]'
                      }`}
                    >
                      {/* Top-left index badge */}
                      <div className={`absolute left-4 top-4 z-20 flex h-7 w-7  items-center justify-center text-[11px] font-black ${
                        isDark ? 'bg-[#E67E33] text-[#151515]' : 'bg-[#151515] text-white'
                      }`} style={{ fontFamily: "'Oswald','Inter',sans-serif", boxShadow: isDark ? '2px 2px 0 0 #151515' : '2px 2px 0 0 #E67E33' }}>
                        {p.id}
                      </div>
                      {/* Top-right arrow affordance */}
                      <span className={`absolute right-4 top-4 z-20 flex h-7 w-7  items-center justify-center border text-sm transition-transform duration-300  ${
                        isDark ? 'border-white/40 text-white' : 'border-[#151515] text-[#151515]'
                      }`}>↗</span>

                      {variant === 'stack' ? (
                        <div className="flex h-full flex-col">
                          <ImageBlock />
                          <ContentBlock compact />
                        </div>
                      ) : (
                        <div className="flex h-full flex-col md:flex-row md:items-stretch">
                          <ContentBlock />
                          <ImageBlock tall />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              }

              const query = projectQuery.trim().toLowerCase()
              const searching = query !== ''
              const filtering = projectFilter !== '全部' || searching
              const matchesSearch = (p) => {
                if (!searching) return true
                const hay = [
                  p.title,
                  p.subtitle,
                  p.desc,
                  p.category,
                  meta[p.id]?.sub,
                  ...(meta[p.id]?.tags ?? []),
                ]
                  .join(' ')
                  .toLowerCase()
                return hay.includes(query)
              }
              const visible = projects.filter(
                (p) => (projectFilter === '全部' || p.category === projectFilter) && matchesSearch(p)
              )

              // 转场容器：filtering 决定呈现"可筛选网格"还是"项目转盘"，两者切换时整块重挂，
              // 做一次淡入上浮。注意 .reveal 是本页既有的 CSS 过渡，和 framer 写的是同一批属性，
              // 所以帧动画留在外层、.reveal 留在内层它自己的元素上，两层各管一个元素不打架。
              return (
                <motion.div
                  key={filtering ? 'grid' : 'stack'}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: reduceMotion ? 0 : 0.08, ease: EASE }}
                >
                  {filtering ? (
                    <>
                    {searching && (
                      <div className="mb-5 flex flex-wrap items-center gap-3 border-2 border-[#151515] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#151515]">
                        <span className="text-[#151515]/70">Search /</span>
                        <span className="text-[#151515]">“{projectQuery.trim()}”</span>
                        <span className="ml-auto font-mono normal-case tracking-normal text-[#55544E]">
                          {visible.length} 项结果
                        </span>
                        <button
                          type="button"
                          onClick={() => setProjectQuery('')}
                          className="border-2 border-[#151515] bg-[#E67E33] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#151515] transition-colors hover:bg-[#151515] hover:text-[#E67E33]"
                        >
                          清除
                        </button>
                      </div>
                    )}
                    {visible.length > 0 ? (
                      // key 挂当前分类：换分类时整组重挂，卡片按 index 依次落位。
                      // 这里不再用 .reveal —— 进场已交给每张卡自己的帧动画。
                      <div key={projectFilter} className="grid grid-cols-1 gap-5 pb-12 md:grid-cols-2 md:gap-6 lg:gap-7">
                        {visible.map((p, i) => {
                          const variants = ['split', 'stack', 'split', 'split', 'stack', 'split', 'stack']
                          return (
                            <Card
                              key={p.id}
                              p={p}
                              variant={variants[i % variants.length]}
                              index={i}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <div className="mb-12 border-2 border-dashed border-[#151515]/30 px-6 py-16 text-center">
                        <p className="mb-2 text-xl font-black text-[#151515]">未找到匹配项目</p>
                        <p className="mb-6 text-[13px] font-medium text-[#55544E]">
                          换个关键词，或清空搜索后浏览全部作品。
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setProjectQuery('')
                            setProjectFilter('全部')
                          }}
                          className="border-2 border-[#151515] bg-[#E67E33] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#151515] transition-colors hover:bg-[#151515] hover:text-[#E67E33]"
                        >
                          清除搜索
                        </button>
                      </div>
                    )}
                    </>
                  ) : !isMobile ? (
                    <div className="reveal reveal-delay-2">
                      {/* 回到最初的滑动办法：滚轮只在轮盘居中视口中段时接管，
                          一次输入推进一张卡；到首/末张仍向外滚时交还页面。
                          （曾经套过一层 8×78vh 的"滚动章节"舞台，滚轮必须放行
                          才能滚出项目区，手感发闷，已整段撤掉。） */}
                      <PortfolioCardStack
                        projects={projects}
                        onSelectProject={openProject}
                      />
                    </div>
                  ) : null}
                </motion.div>
              )
            })()}

            {/* 手机端：全屏滑动卡组。
                桌面端仍是上面的 3D 轮盘，这里换成一张卡占满一屏、左右滑动切换。
                两者读同一份 projects 与筛选状态，切分类时两边一起变。
                原先的纵向堆叠卡由它取代，已整段移除，不留死代码。 */}
            {isMobile && projectFilter === '全部' && projectQuery.trim() === '' && (
              <MobileProjectDeck
                projects={projects}
                meta={PROJECT_META}
                onSelectProject={openProject}
              />
            )}

            {/* Middle quote — Acid 巨幅收尾 */}
            <div className="relative my-20 text-center md:my-28">
              <span aria-hidden="true" className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-y-1/2  select-none text-[6rem] leading-none text-[#151515] md:block" style={{ fontFamily: "'Oswald','Inter',sans-serif", fontWeight: 900 }}>✦</span>
              <span aria-hidden="true" className="pointer-events-none absolute -right-1 top-1/2 hidden -translate-y-1/2  select-none text-[6rem] leading-none text-[#E67E33] md:block" style={{ fontFamily: "'Oswald','Inter',sans-serif", fontWeight: 900 }}>✦</span>
              <p
                className="relative inline-block leading-[1.12] text-[#151515]"
                style={{ fontFamily: "'Noto Sans SC','Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(2.2rem, 5.6vw, 5rem)', letterSpacing: '-0.01em' }}
              >
                每个项目，<br className="md:hidden" />都是一次思考的冒险！
              </p>
            </div>

          </div>
        </section>

        {/* Project detail — full-screen data page
            转场分三层：遮罩淡入 + 面板自下而上推入并轻微放大。
            三者各自退场，所以关掉时是"面板先收、遮罩后散"，不会整块一起消失。 */}
        <AnimatePresence>
        {selectedProject && (
          <motion.div
            key="project-modal"
            className="fixed inset-0 z-[100] p-3 md:p-4 lg:p-5"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedProject.title} 项目详情`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <motion.div
              className="absolute inset-0 bg-[#151515]/55 backdrop-blur-md"
              onClick={closeProjectModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
            <motion.div
              key={modalKey}
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-full w-full max-h-full flex-col overflow-hidden rounded-[28px] border border-[#151515]/10 bg-[#FCFCFC] shadow-[0_32px_90px_-24px_rgba(21,21,21,0.4)]"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.992 }}
              transition={reduceMotion ? { duration: 0.16, ease: 'linear' } : { duration: 0.48, ease: EASE }}
            >
              {/* Close */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeProjectModal()
                }}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-30 w-10 h-10 md:w-11 md:h-11 rounded-full bg-background/90 border border-border flex items-center justify-center text-foreground hover:bg-muted hover:border-primary/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 h-full overflow-hidden">
                {/* Left: split image gallery */}
                <div className={`relative h-[38vh] lg:h-full overflow-hidden ${selectedProject.color} shrink-0`}>
                  <div className="absolute inset-0 flex flex-col">
                    {/* Main swipe gallery */}
                    <div className="flex-1 min-h-0 relative p-3 md:p-5 pb-2">
                      <div
                        className="relative w-full h-full rounded-[1.5rem] overflow-hidden border border-border/50 bg-background/40 shadow-sm"
                        onTouchStart={(e) => {
                          touchStartX.current = e.touches[0].clientX
                          touchStartY.current = e.touches[0].clientY
                        }}
                        onTouchEnd={(e) => {
                          if (touchStartX.current === null) return
                          const dx = e.changedTouches[0].clientX - touchStartX.current
                          const dy = e.changedTouches[0].clientY - touchStartY.current
                          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                            if (dx < 0) {
                              setActiveImage((i) => (i + 1) % selectedProject.gallery.length)
                            } else {
                              setActiveImage(
                                (i) =>
                                  (i - 1 + selectedProject.gallery.length) %
                                  selectedProject.gallery.length
                              )
                            }
                          }
                          touchStartX.current = null
                          touchStartY.current = null
                        }}
                      >
                        <div
                          className="flex h-full transition-transform duration-500 ease-out"
                          style={{ transform: `translateX(-${activeImage * 100}%)` }}
                        >
                          {selectedProject.gallery.map((img, i) => (
                            <div
                              key={i}
                              className="w-full h-full shrink-0 bg-background/60"
                            >
                              <img
                                src={img.src}
                                alt={img.alt}
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                className="w-full h-full object-contain select-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prev / Next arrows */}
                      {selectedProject.gallery.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveImage(
                                (i) =>
                                  (i - 1 + selectedProject.gallery.length) %
                                  selectedProject.gallery.length
                              )
                            }}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 border border-border flex items-center justify-center text-foreground hover:bg-muted hover:border-primary/30 transition-colors"
                            aria-label="上一张"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveImage(
                                (i) => (i + 1) % selectedProject.gallery.length
                              )
                            }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 border border-border flex items-center justify-center text-foreground hover:bg-muted hover:border-primary/30 transition-colors"
                            aria-label="下一张"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    <div className="shrink-0 px-3 md:px-5 pb-3 md:pb-5">
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        {selectedProject.gallery.map((img, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveImage(i)
                            }}
                            className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border transition-all ${
                              i === activeImage
                                ? 'border-foreground ring-2 ring-foreground/20'
                                : 'border-border/60 hover:border-foreground/40 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img.src}
                              alt={img.alt}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-5 left-5 z-20">
                    <span className="text-[10px] font-medium px-3 py-1.5 rounded-full bg-background/90 border border-border text-foreground backdrop-blur-sm">
                      {selectedProject.category}
                    </span>
                  </div>
                  <span className="absolute bottom-24 right-5 z-10 text-6xl md:text-8xl font-display font-semibold text-foreground/10">
                    {selectedProject.id}
                  </span>
                </div>

                {/* Right: content dashboard。data-lenis-prevent 与详情页同理：
                    浮层打开时 Lenis 被 stop，它会 preventDefault 掉滚轮事件，
                    没有这个属性这一栏就完全划不动。overscroll-contain 防止链到背后主页。 */}
                <div
                  data-lenis-prevent
                  className="h-[62vh] lg:h-full overflow-y-auto overscroll-contain no-scrollbar p-5 md:p-8 lg:p-10 bg-background"
                >
                <div className="max-w-3xl mx-auto">
                  {/* Header */}
                  <div className="mb-6 md:mb-8">
                    <span className="text-xs font-mono text-muted-foreground block mb-2">
                      Project {selectedProject.id}
                    </span>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium leading-tight mb-2">
                      {selectedProject.title}
                    </h3>
                    <p className="text-base md:text-lg text-muted-foreground">
                      {selectedProject.subtitle}
                    </p>
                  </div>

                  {/* Content blocks */}
                  <div className="space-y-4 mb-6 md:mb-8">
                    {selectedProject.details.overview && (
                      <DetailBlock icon={Lightbulb} title="项目概述" color={selectedProject.chartData.donut[0].color}>
                        {selectedProject.details.overview}
                      </DetailBlock>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedProject.details.targetUsers && (
                        <DetailBlock icon={Target} title="目标人群" color={selectedProject.chartData.donut[0].color}>
                          {selectedProject.details.targetUsers}
                        </DetailBlock>
                      )}
                      {selectedProject.details.concept && (
                        <DetailBlock icon={Layers} title="设计理念" color={selectedProject.chartData.donut[0].color}>
                          {selectedProject.details.concept}
                        </DetailBlock>
                      )}
                    </div>

                    {selectedProject.details.interaction && (
                      <DetailBlock icon={Workflow} title="交互流程" color={selectedProject.chartData.donut[0].color}>
                        {selectedProject.details.interaction}
                      </DetailBlock>
                    )}

                    {selectedProject.details.cmf && (
                      <DetailBlock icon={Gem} title="材质与工艺" color={selectedProject.chartData.donut[0].color}>
                        {selectedProject.details.cmf}
                      </DetailBlock>
                    )}
                  </div>

                  {/* Charts grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-6 md:mb-8">
                    {/* Radar */}
                    <div className="p-4 md:p-5 rounded-2xl bg-muted/40 border border-border chart-card">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        设计维度评估
                      </h4>
                      <RadarChart
                        data={selectedProject.chartData.radar}
                        color={selectedProject.chartData.donut[0].color}
                      />
                    </div>

                    {/* Donut */}
                    <div className="p-4 md:p-5 rounded-2xl bg-muted/40 border border-border chart-card">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        构成占比
                      </h4>
                      <DonutChart data={selectedProject.chartData.donut} />
                      <div className="flex flex-wrap justify-center gap-3 mt-3">
                        {selectedProject.chartData.donut.map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {item.label} {item.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bars */}
                    <div className="p-4 md:p-5 rounded-2xl bg-muted/40 border border-border chart-card">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        设计流程投入
                      </h4>
                      <BarChart
                        data={selectedProject.chartData.bars}
                        color={selectedProject.chartData.donut[0].color}
                      />
                    </div>

                    {/* Progress */}
                    <div className="p-4 md:p-5 rounded-2xl bg-muted/40 border border-border chart-card flex flex-col items-center justify-center">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        项目完成度
                      </h4>
                      <ProgressRing
                        value={selectedProject.chartData.progress}
                        label="综合完成度"
                        color={selectedProject.chartData.donut[0].color}
                      />
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {selectedProject.specs.map((s, i) => (
                      <div
                        key={i}
                        className="p-3 md:p-4 rounded-2xl bg-card border border-border"
                      >
                        <div className="spec-label mb-1.5">{s.label}</div>
                        <div className="text-xs md:text-sm text-foreground leading-relaxed">
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeProjectModal()
                    }}
                    className="inline-flex items-center justify-center h-11 px-6 text-sm font-medium rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors"
                  >
                    关闭详情
                  </button>
                </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* 图一：心景疗愈灯具 —— 工业粗野主义独立详情页（代替原弹窗）
            转场：详情页自身自下而上推入 + 极轻的缩放，橙带（PageWipe）在其前掠过整屏；
            退场反着走一遍。位移与透明度都是合成器属性，不触发布局。
            reduce-motion 下降级成一次短淡入淡出，不做位移。 */}
        <AnimatePresence>
          {detailPageProject && (
            <motion.div
              key="detail-page"
              className="fixed inset-0 z-[200]"
              initial={reduceMotion ? { opacity: 0 } : { y: '9%', opacity: 0, scale: 0.99 }}
              animate={reduceMotion ? { opacity: 1 } : { y: '0%', opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: '7%', opacity: 0, scale: 0.995 }}
              transition={reduceMotion ? { duration: 0.18, ease: 'linear' } : { duration: 0.62, ease: EASE }}
            >
              {/* 项目展示板块（影像优先）：自带顶栏与唯一返回入口，
                  不叠第二层手机吸顶条。fallback 给 null：chunk 已在空闲时预热，
                  点开时同步命中；万一没到，外层主页仍可见，不会闪白。 */}
              <Suspense fallback={null}>
                <ProjectPages
                  key={detailPageProject.id}
                  project={detailPageProject}
                  allProjects={projects}
                  onClose={closeDetailPage}
                  onSelect={(p) => setDetailPageProject(p)}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 原稿自己的项目详情页（离线单文件，全屏 iframe 浮层）。
            手机端已经**彻底不走这条路**（一个项目一套详情 = React 详情页），
            只在桌面端保留：既有的桌面入口与将来的 ?legacy=1 深链还能用到它。 */}
        {!isMobile && originalDetailProject && (
          <OriginalDetailOverlay
            project={originalDetailProject}
            onClose={closeOriginalDetail}
          />
        )}

        {/* 转场擦除带：key 跟随 wipeToken，每次开关详情页重放一次 */}
        {wipeToken > 0 && <PageWipe key={wipeToken} />}

        {/* Strengths — 优势：12 栏不对称栅格 ===== */}
        {/* 2026-11-14 配色重做：原来纯黑跑马灯 + 黑/荧光橙/白三张高反差渐变卡，
            与相邻章节的暖纸底割裂。统一到「暖纸 #FBF6EC / 深可可 #42332C /
            雾紫 #6E6B9B / 蜜橙 #D97842」——和猫冰 IP 页同一套色票，
            只降饱和与明度反差，编号/细墨框/硬偏移等工程档案骨架全部保留。 */}
        <section id="strengths" className="relative order-4 overflow-hidden" style={{ backgroundColor: '#FBF6EC' }}>
          {/* 手机端：2×2 规格矩阵（方向 A），替代桌面那份 12 栏倾斜卡墙。 */}
          {isMobile && (
            <div className="mob-strengths">
              <div className="mob-sechead">
                <span className="mob-kicker">SEC. 04 · CAPABILITY</span>
                <h2 className="mob-h1">个人优势</h2>
              </div>
              <div className="mob-matrix">
                {[
                  { n: '01', t: '产品概念可视化', d: '草图到 3D 渲染的全流程外观表达' },
                  { n: '02', t: 'AI 工具驱动设计', d: '用 AI 绘画与生成工具加速视觉探索' },
                  { n: '03', t: '跨学科协作', d: '设计 + 日语 + 用户研究，多视角推进落地' },
                  { n: '04', t: '全流程跟进', d: '需求调研、原型输出到打样落地' },
                ].map((c) => (
                  <div key={c.n} className="mob-cell">
                    <b>{c.n}</b>
                    <h3>{c.t}</h3>
                    <p>{c.d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 章节滚动条：SKILLS 循环带（暖米底 + 雾紫字 + 蜜橙星） */}
          <div aria-hidden="true" className="relative z-[1] select-none overflow-hidden border-y border-[#D9CDBA] bg-[#F3EBDD] py-3">
            <span aria-hidden="true" className="mo-sweep" />
            <VelocityTicker
              baseVelocity={-34}
              numCopies={4}
              itemClassName="flex shrink-0 items-center text-[#6E6B9B]"
            >
              <span
                style={{ fontFamily: "'Oswald','Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', lineHeight: 1, letterSpacing: '0.02em' }}
              >
                <i className="not-italic px-6 text-[#D97842]">✦</i>
                SKILLS
                <i className="not-italic px-6 text-[#D97842]">✦</i>
                CAPABILITY · 4 AREAS
                <i className="not-italic px-6 text-[#D97842]">✦</i>
                PRODUCT · AI · COLLAB
                <i className="not-italic px-6 text-[#D97842]">✦</i>
                YH · DESIGN
                <i className="not-italic px-6 text-[#D97842]">✦</i>
              </span>
            </VelocityTicker>
          </div>

          {/* Background ghost text */}
          <span className="section-watermark text-[32vw] md:text-[28vw] lg:text-[26vw]">
            SKILLS
          </span>

          <div className="relative z-10 page-shell py-14 md:py-24">
            <Reveal>
            <div className="mb-14 flex flex-col gap-8 border-b border-[#D9CDBA] pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="acid-microlabel mb-4 flex items-center gap-3 text-[#42332C]/55">
                  <span className="inline-block h-2.5 w-2.5 bg-[#D97842]" />
                  <span>04</span>
                  <span className="inline-block h-px w-10 bg-[#42332C]/25" />
                  <span>Strengths</span>
                </div>
                <ClipReveal delay={0.1} className="py-2 md:py-3">
                <h2
                  className="leading-[0.92] tracking-[-0.02em] text-[#42332C]"
                  style={{ fontFamily: "'Oswald','Noto Sans SC','Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(3rem, 7vw, 6.2rem)' }}
                >
                  个人优势
                </h2>
                </ClipReveal>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#42332C]">
                <span>4 项能力</span>
                <span className="text-[#42332C]/55">产品 / AI / 协作</span>
              </div>
            </div>
            </Reveal>

            {/* 能力导航 Dock */}
            <div className="mb-12 flex justify-center">
              {/* 光标聚光：::before 一条 radial-gradient 跟着指针走。
                  暖纸底配雾紫聚光，键盘走 :focus-within 也会点亮。 */}
              <Spotlight
                as="div"
                color="rgba(110, 107, 155, 0.20)"
                className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 border border-[#D9CDBA] bg-[#FFFDF8] p-1.5"
                role="tablist"
                aria-label="能力导航"
              >
                {[
                  { label: '可视化', icon: PenTool },
                  { label: 'AI 驱动', icon: Sparkles },
                  { label: '跨学科', icon: Users },
                  { label: '全流程', icon: CheckCircle },
                ].map(({ label, icon: DockIcon }, i) => {
                  const on = activeStrength === i
                  return (
                    <button
                      key={label}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setActiveStrength(on ? null : i)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold transition-colors duration-200 ${on ? 'bg-[#6E6B9B] text-[#FFF6E8]' : 'text-[#6E5C51] hover:bg-[#F3EBDD] hover:text-[#42332C]'}`}
                    >
                      <DockIcon className="h-4 w-4" strokeWidth={2} />
                      {label}
                    </button>
                  )
                })}
              </Spotlight>
            </div>

            {/* 12 栏不对称栅格：7/5 + 5/7 */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              {[
                {
                  icon: PenTool,
                  title: '产品概念可视化',
                  desc: '独立完成从草图到 3D 渲染的全流程外观表达',
                  tag: '#可视化',
                },
                {
                  icon: Sparkles,
                  title: 'AI 工具驱动设计',
                  desc: '熟练运用 AI 绘画与生成工具加速视觉探索',
                  tag: '#AIGC',
                },
                {
                  icon: Users,
                  title: '跨学科协作',
                  desc: '设计 + 日语 + 用户研究，能从多元视角推进方案落地',
                  tag: '#协作',
                },
                {
                  icon: CheckCircle,
                  title: '全流程跟进',
                  desc: '从需求调研、原型输出到打样落地，保障设计一致性',
                  tag: '#落地',
                },
              ].map(({ icon: Icon, title, desc, tag }, idx) => {
                // 四张卡改成同一明度带的四段邻近色：奶白 / 浅雾紫 / 暖米 / 浅蜜橙。
                // 不再有纯黑卡和荧光橙卡，深色只留给小面积图标方块做锚点。
                const gradients = [
                  'linear-gradient(145deg, #FFFDF8 0%, #F3EBDD 100%)',
                  'linear-gradient(145deg, #EDEAF6 0%, #DCD8EC 100%)',
                  'linear-gradient(145deg, #F8F1E6 0%, #F0E5D3 100%)',
                  'linear-gradient(145deg, #F9E7D6 0%, #F1D3B8 100%)',
                ]
                const gradient = gradients[idx]
                const spanCls =
                  idx === 0 ? 'md:col-span-7'
                  : idx === 1 ? 'md:col-span-5'
                  : idx === 2 ? 'md:col-span-5'
                  : 'md:col-span-7'
                const isActive = activeStrength === idx
                return (
                  <BrutalTiltCard
                    key={title}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    onClick={() => setActiveStrength(isActive ? null : idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setActiveStrength(isActive ? null : idx)
                      }
                    }}
                    className={`group relative cursor-pointer outline-none ${spanCls} ${isActive ? 'ring-2 ring-[#6E6B9B] ring-offset-2 ring-offset-[#FBF6EC]' : ''}`}
                    cardClassName="border-2 border-[#D9CDBA] text-[#42332C]"
                    innerGradient={gradient}
                    contentClassName="p-6 md:p-7"
                    spacerClass="translate-x-2 translate-y-2"
                    spacerColor="#DDD0BC"
                    glowColor={idx === 1 ? '#6E6B9B' : '#D97842'}
                    glowOpacity={0.2}
                    tiltMax={6}
                  >
                    {/* Card index */}
                    <span
                      className="pointer-events-none absolute right-3 top-1 select-none text-[4.6rem] leading-none opacity-[0.13]"
                      style={{ fontFamily: "'Oswald','Inter',sans-serif", fontWeight: 900 }}
                    >
                      0{idx + 1}
                    </span>

                    <div className="relative mb-5 flex h-12 w-12 items-center justify-center bg-[#42332C] text-[#FBF6EC]">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <h3 className="relative mb-2 text-xl font-black leading-snug md:text-2xl" style={{ fontFamily: "'Noto Sans SC','Inter',sans-serif", fontWeight: 900 }}>
                      {title}
                    </h3>
                    <p className="relative mb-5 text-[13px] leading-[1.8] text-[#6E5C51]">
                      {desc}
                    </p>
                    <span className="relative inline-block border border-[#C9BDA9] px-3 py-1 text-[11px] font-black text-[#42332C] transition-colors duration-200 group-hover:border-[#6E6B9B] group-hover:bg-[#6E6B9B] group-hover:text-[#FFF6E8]">
                      {tag}
                    </span>
                  </BrutalTiltCard>
                )
              })}
            </div>
          </div>
        </section>
        {/* Contact — 压轴深墨尾版（柔和圆角收尾，极净底色） */}
        <section
          id="contact"
          className="relative order-5 flex min-h-screen flex-col items-center justify-center overflow-hidden py-24 md:py-36"
          style={{ backgroundColor: '#1B1C22' }}
        >
          {/* 手机端：紧凑联系块（方向 A），3 个 48px 按钮 + 一行版权。 */}
          {isMobile && (
            <div className="mob-contact">
              <div className="mob-sechead">
                <span className="mob-kicker mob-kicker--light">GET IN TOUCH · SEC. 05</span>
                <h2 className="mob-h1 mob-h1--light">开始合作</h2>
                <p className="mob-lede mob-lede--light">
                  如果你正在寻找一位注重细节、能把概念落到实处的交互设计师，欢迎联系我。
                </p>
              </div>
              <div className="mob-actions">
                <button type="button" className="mob-act" onClick={copyEmail}>
                  {emailCopied ? '已复制 ✓' : '复制邮箱 1833749790@qq.com'}
                </button>
                <a className="mob-act mob-act--ghost" href={asset('/resume.wps')} download="个人简历.wps">下载简历</a>
                <a className="mob-act mob-act--ghost" href="tel:19830780231">打电话 19830780231</a>
              </div>
              {/* 云端留言：手机长页也留一个提交入口 */}
              <div className="mob-guestbook">
                <Guestbook compact />
              </div>
              <div className="mob-meta">
                <span>© 2026 杨鸿</span>
                <span>广州商学院 · 产品设计本科</span>
              </div>
            </div>
          )}

          {/* 浅色下垂软过渡（大圆角弧，替代硬切斜块） */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-[#F7F8FA] rounded-b-[3rem] md:h-20" />
          {/* Giant background word silhouette */}
          <span
            className="section-watermark text-[26vw] md:text-[22vw] lg:text-[20vw]"
            style={{ color: 'rgba(255,255,255,0.03)', WebkitTextStroke: '1px rgba(255,255,255,0.05)' }}
          >
            CONTACT
          </span>

          {/* 克制几何点缀（柔和细线圆环） */}
          <div className="absolute left-10 top-32 hidden h-20 w-20 rounded-full border border-white/[0.08] lg:block" />
          <div className="absolute bottom-24 left-[18%] hidden h-5 w-5 rounded-full bg-[#E67E33]/80 lg:block" />
          <div className="absolute right-14 top-40 hidden h-12 w-12 rounded-full border border-white/[0.08] lg:block" />
          <div className="absolute bottom-40 right-[8%] hidden h-14 w-14 rounded-2xl border border-white/[0.08] lg:block" />

          <div className="relative z-10 page-shell pt-20 pb-8 text-center md:pt-24">
            <div className="relative mb-6 inline-block">
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#E67E33]" />
                <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/75">Get in Touch</p>
              </div>
              <h2
                className="leading-[0.95] tracking-[-0.01em] text-white"
                style={{ fontFamily: "'Oswald','Noto Sans SC','Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(3.4rem, 9vw, 8rem)' }}
              >
                开始合作
              </h2>
              {/* 荧光橙硬下划线 */}
              <span className="mx-auto mt-5 block h-1.5 w-24 bg-[#E67E33]" />
            </div>

            <p className="mx-auto mb-10 max-w-xl leading-[1.9] text-white/80" style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)' }}>
              如果你正在寻找一位注重细节、能把概念落到实处的交互设计师，欢迎联系我。
            </p>

            <div className="mb-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-black uppercase tracking-[0.18em]">
              <span className="text-[#E67E33]">产品设计师</span>
              <span className="text-white/85">UI / UX</span>
              <span className="text-white/85">3D 建模</span>
              <span className="text-white">交互设计</span>
            </div>

            <div className="mb-12 flex flex-col items-center justify-center gap-x-10 gap-y-4 sm:flex-row">
              <button
                type="button"
                onClick={copyEmail}
                className="group inline-flex cursor-pointer items-center gap-3 text-white/80 transition-colors hover:text-[#E67E33]"
                aria-label="复制邮箱地址"
              >
                <span className="flex h-11 w-11 items-center justify-center border-2 border-white/30 text-white transition-colors group-hover:border-[#E67E33] group-hover:text-[#E67E33]">
                  {emailCopied ? <CheckCircle className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </span>
                <span className="text-[15px] font-medium">{emailCopied ? '已复制 ✓' : '1833749790@qq.com'}</span>
              </button>
              <a href="tel:19830780231" className="group inline-flex items-center gap-3 text-white/80 transition-colors hover:text-[#E67E33]">
                <span className="flex h-11 w-11 items-center justify-center border-2 border-white/30 text-white transition-colors group-hover:border-[#E67E33] group-hover:text-[#E67E33]">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="text-[15px] font-medium">19830780231</span>
              </a>
            </div>

            <div className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex cursor-pointer items-center justify-center border-2 border-[#E67E33] bg-[#E67E33] px-9 py-4 text-[15px] font-black text-[#151515] transition-all duration-150 hover:bg-[#151515] hover:text-[#E67E33]"
              >
                {emailCopied ? '已复制 ✓' : '复制邮箱'}
                {emailCopied ? <CheckCircle className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
              <a
                href={asset("/resume.wps")}
                download="个人简历.wps"
                className="inline-flex items-center justify-center border-2 border-white/40 px-9 py-4 text-[15px] font-black text-white transition-colors duration-150 hover:bg-white hover:text-[#151515]"
              >
                下载简历
              </a>
            </div>

            {/* 2026-11-14 云端版：留言写进云数据库，作者在 ?inbox=1 收件箱可见。
                此前那版只存在访客浏览器里、作者看不到，已彻底移除。 */}
            <div className="mb-14 w-full">
              <Guestbook />
            </div>

            {/* Dense metadata footer */}
            <footer className="w-full border-t border-white/20 pt-8">
              <div className="flex flex-col items-center justify-between gap-6 text-xs text-white/70 md:flex-row md:items-end">
                <div className="flex flex-col items-center gap-0.5 text-center md:items-start md:text-left">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/75">Index</span>
                  <span className="text-base font-bold text-white" style={{ fontFamily: "'Oswald','Inter',sans-serif" }}>05</span>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/75">/ Contact</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black leading-none text-white" style={{ fontFamily: "'Oswald','Inter',sans-serif", fontSize: 'clamp(1.6rem, 2.5vw, 2rem)' }}>2026</span>
                  <span className="hidden text-white/80 sm:block">// YANGHONG</span>
                </div>
                <div className="flex flex-col items-center gap-2 md:items-end">
                  <span className="text-white/70">广州商学院 · 产品设计本科</span>
                  <span className="inline-flex items-center gap-1.5 bg-[#E67E33] px-2.5 py-1 text-[11px] font-black text-[#151515]">
                    <Sparkles className="h-3 w-3" />
                    交互 · 产品
                  </span>
                </div>
              </div>
              <p className="mt-8 text-sm font-medium text-white/75">
                © 2026 杨鸿 · 保留所有权利
              </p>
            </footer>
          </div>
        </section>
      </main>

      {/* 「完整经历 ↗」的转场层：挂在 body 顶层，不占布局、不改内容 */}
      <InkBloom bloomToken={bloomToken} onSettled={() => setBloomToken(0)} />
      </div>
      </DesktopOSGate>
    </SmoothScroll>
  )
}

export default App
