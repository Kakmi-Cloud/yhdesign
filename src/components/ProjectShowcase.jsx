/**
 * ProjectShowcase —— 项目展示板块 · 反套路改版
 *
 * 本轮对应反馈的结构性改动：
 *  · 9 个段落按品类换序（SEQUENCES），8 个项目不再 100% 套同一模板。
 *  · 05 段「88vh 空描边字」换成可旋转的四面 3D 标本盒，四面承载真实材质 /
 *    结构 / 工艺 / 边界信息，左栏补 60–100 字设计推导。
 *  · 03 段改成成品 / 细节解剖滑杆，图像 alt 以可见图注渲染。
 *  · 04 段功能胶囊改为带 SVG 引线的指向性热区，hover 展开真实机制说明。
 *  · 06 段胶片每帧可翻面，背面就是该图的中文说明；帧数按实际渲染数显示。
 *  · 02 段无数据项目用 project.specs 真实规格摘录填栏，不再空置。
 *  · 全站移除字数硬截断；统一资料行只留一次「功能均可实现」。
 *  · 字阶重排：正文 14–16px、标签 12–13px、透明次级文字提升到 .78；
 *    装饰巨字上限从 40rem / 26rem / 16rem 收到 22rem / 14rem / 10rem。
 *
 * 动画只在与语境对应的位置出现一次：转场幕布 / 取样放大镜 / 光圈揭示 /
 * 品类专属装置 / 解剖滑杆 / 引线生长 / 3D 标本盒 / 翻牌胶片 / 卷帘预告。
 * 不做全局装饰性动效堆积，全部支持 prefers-reduced-motion 降级。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { asset } from '../assetPath'
import { getDossier, statusLabel, GLOBAL_NOTE } from '../data/projectDossiers'
import { getShowcase, getSequence } from '../data/showcaseContent'
import './projectShowcase.css'

const pad = (n) => String(n).padStart(2, '0')
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/* ── 品类专属装置：每个项目只出现一次，参数全部来自自身资料 ─────────── */
function Signature({ type, cfg, dossier, project, images, value, setValue, active, setActive }) {
  const pct = value
  const light = images[0] || {}
  const second = images[1] || images[0] || {}
  const third = images[2] || images[0] || {}

  if (type === 'thermal') {
    const temp = Math.round(-18 + (pct / 100) * 56)
    const soft = temp > 0
    const frozen = images.find((g) => /冻结|frozen|dual/i.test(g.alt)) || second
    const softImg = images.find((g) => /软化|双态|hero|主视觉/i.test(g.alt)) || third
    return (
      <div className="sw-sig sw-sig--thermal">
        <div className="sw-sig-stage">
          <img src={(soft ? softImg : frozen).src} alt={(soft ? softImg : frozen).alt} draggable="false" />
          <span className={`sw-sig-state${soft ? ' is-soft' : ''}`}>{soft ? '软化态' : '冻结态'}</span>
          <b className="sw-sig-temp">{temp > 0 ? '+' : ''}{temp}<i>°C</i></b>
        </div>
        <div className="sw-sig-panel">
          <span className="sw-sig-scale"><i>−18°C</i><i>+38°C</i></span>
          <input type="range" min="0" max="100" value={pct} onChange={(e) => setValue(+e.target.value)} aria-label="温度轴" />
          <p className="sw-sig-read">拖动温度轴，冰壳在冻结态与软化态之间双向转换；尾巴形态与地面水滴同步变化。</p>
        </div>
      </div>
    )
  }

  if (type === 'compass') {
    const dirs = [
      { t: '摇晃蓄光', k: 'shake' }, { t: '双控件定时', k: 'toaster' }, { t: '重量可视化', k: 'scale' },
      { t: '彝族纹样', k: 'backpack' }, { t: '叶脉书签', k: 'bookmark' }, { t: '野生菌灯', k: 'mushroom' },
    ]
    const pickImg = (k) => images.find((g) => new RegExp(k, 'i').test(g.src)) || images[0]
    return (
      <div className="sw-sig sw-sig--compass">
        <div className="sw-compass-ring">
          {dirs.map((d, i) => (
            <button
              type="button"
              key={d.k}
              className={`sw-compass-node${active === i ? ' is-on' : ''}`}
              style={{ '--i': i, '--x': `${(Math.cos((i / dirs.length) * Math.PI * 2 - Math.PI / 2) * 40).toFixed(2)}%`, '--y': `${(Math.sin((i / dirs.length) * Math.PI * 2 - Math.PI / 2) * 42).toFixed(2)}%` }}
              onClick={() => setActive(i)}
            >
              <span>{pad(i + 1)}</span><b>{d.t}</b>
            </button>
          ))}
          <div className="sw-compass-core">
            <img src={pickImg(dirs[active]?.k).src} alt={dirs[active]?.t} draggable="false" />
          </div>
        </div>
        <p className="sw-sig-read">六个方向不是六格网格：点外圈任一概念，中央器物就换一个。前半程找动作，后半程找在地题材。</p>
      </div>
    )
  }

  if (type === 'flow') {
    const nodes = ['首页聚合', '详情决策', '预约闭环']
    const imgs = [images[1], images[2], images[3]].map((g) => g || images[0])
    return (
      <div className="sw-sig sw-sig--flow">
        <div className="sw-flow-line">
          {nodes.map((n, i) => (
            <button type="button" key={n} className={active === i ? 'is-on' : ''} onClick={() => setActive(i)}>
              <span>{pad(i + 1)}</span>{n}
            </button>
          ))}
        </div>
        <div className="sw-flow-screen">
          <img src={imgs[active]?.src} alt={imgs[active]?.alt || nodes[active]} draggable="false" />
          <span className="sw-flow-step">STEP {pad(active + 1)} / 03</span>
        </div>
        <p className="sw-sig-read">从查看到下单走一条不绕路的路：首页聚合 → 详情给评分与价格 → 预约 / 购票 / 导航收口。</p>
      </div>
    )
  }

  if (type === 'ruler') {
    const dims = [
      { v: '450', t: '台灯总高', u: 'mm' },
      { v: 'Ø150', t: '台灯底座', u: 'mm' },
      { v: 'Ø1000', t: '吊灯总跨', u: 'mm' },
      { v: '2.5', t: '孔雀石贴边', u: 'mm' },
    ]
    const d = dims[active]
    return (
      <div className="sw-sig sw-sig--ruler">
        <div className="sw-ruler-paper">
          <img src={light.src} alt={light.alt} draggable="false" />
          <span className="sw-ruler-line" style={{ left: `${12 + pct * 0.72}%` }}><i /></span>
          <span className="sw-ruler-box" style={{ left: `${clamp(12 + pct * 0.72 - 8, 0, 74)}%` }}>
            <b>{d.v}</b><em>{d.u}</em><small>{d.t} · 图纸记录值</small>
          </span>
          <span className="sw-ruler-grid" aria-hidden="true" />
        </div>
        <div className="sw-sig-panel">
          <input type="range" min="0" max="100" value={pct} onChange={(e) => setValue(+e.target.value)} aria-label="图纸游标" />
          <div className="sw-ruler-keys">
            {dims.map((x, i) => (
              <button type="button" key={x.t} className={active === i ? 'is-on' : ''} onClick={() => setActive(i)}>
                {x.t} <b>{x.v}{x.u}</b>
              </button>
            ))}
          </div>
          <p className="sw-sig-read">尺寸全部取自两张外观评审表的图纸记录值；手写型号与日期不作确定参数引用。</p>
        </div>
      </div>
    )
  }

  if (type === 'module') {
    return (
      <div className="sw-sig sw-sig--module">
        <div className="sw-module-stage">
          <img className="sw-module-base" src={light.src} alt={light.alt} draggable="false" />
          <div className="sw-module-pack" style={{ transform: `translateX(${-pct * 0.42}%) rotate(${-pct * 0.012}deg)` }}>
            <img src={light.src} alt="" aria-hidden="true" draggable="false" />
          </div>
          <span className="sw-module-note" style={{ opacity: 0.25 + pct / 140 }}>软包沿框架内导轨推入 / 抽出</span>
        </div>
        <div className="sw-sig-panel">
          <input type="range" min="0" max="100" value={pct} onChange={(e) => setValue(+e.target.value)} aria-label="软包拆解" />
          <p className="sw-sig-read">坐垫整块抽出即是一块蒲团；靠背沿滑槽上下插拔。木架长期用，软包承担变化。</p>
        </div>
      </div>
    )
  }

  if (type === 'dimmer') {
    return (
      <div className="sw-sig sw-sig--dimmer">
        <div className="sw-dimmer-stage" style={{ filter: `brightness(${0.28 + pct / 125}) saturate(${0.8 + pct / 400})` }}>
          <img src={second.src || light.src} alt={second.alt || light.alt} draggable="false" />
        </div>
        <div className="sw-sig-panel">
          <span className="sw-dimmer-val"><b>{pad(pct)}</b><i>% 亮度</i></span>
          <input type="range" min="0" max="100" value={pct} onChange={(e) => setValue(+e.target.value)} aria-label="睡前渐暗" />
          <p className="sw-sig-read">论文问卷中 73.68% 的受访者偏好柔和暖光助眠、53.59% 期待模拟日落渐暗；睡前让光慢慢退场，而不是一键熄灭。</p>
        </div>
      </div>
    )
  }

  if (type === 'rail') {
    return (
      <div className="sw-sig sw-sig--rail">
        <div className="sw-rail-track">
          <img className="sw-rail-visual" src={second.src || light.src} alt={second.alt || light.alt} draggable="false" />
          <span className="sw-rail-fill" style={{ width: `${pct}%` }} />
          <span className="sw-rail-dot" style={{ left: `${pct}%` }}><i />{pad(pct)}%</span>
          <span className="sw-rail-ticks" aria-hidden="true" />
        </div>
        <div className="sw-sig-panel">
          <input type="range" min="0" max="100" value={pct} onChange={(e) => setValue(+e.target.value)} aria-label="下载进度" />
          <p className="sw-sig-read">屏幕显示 80%，蜗牛就爬到轨道 80% 的位置；到 100% 抵达终点并触发完成特效。把等待变成看得见的旅程。</p>
        </div>
      </div>
    )
  }

  if (type === 'action') {
    const on = pct > 50
    return (
      <div className="sw-sig sw-sig--action">
        <div className={`sw-action-stage${on ? ' is-on' : ''}`}>
          <img src={second.src || light.src} alt={second.alt || light.alt} draggable="false" />
          <span className="sw-action-state">{on ? '灯 · 亮' : '灯 · 灭'}</span>
        </div>
        <div className="sw-sig-panel">
          <button type="button" className="sw-action-btn" onClick={() => setValue(on ? 0 : 100)}>
            {on ? '抽出木楔' : '推入木楔'} <b>↔</b>
          </button>
          <p className="sw-sig-read">白色方盒的缺口等着一块橡木楔：推入灯亮、抽出灯灭，用完成动作替代实体开关。</p>
        </div>
      </div>
    )
  }

  return null
}

export default function ProjectShowcase({ project, allProjects = [], onClose, onSelect }) {
  /* ── 所有 hook 先声明完，后面才允许早退 ─────────────────────── */
  const dossier = getDossier(project?.id)
  const content = getShowcase(project?.id)
  const rootRef = useRef(null)
  const heroImgRef = useRef(null)
  const filmRef = useRef(null)
  const lensRef = useRef(null)
  const compareRef = useRef(null)
  const cubeRef = useRef(null)
  const filmDrag = useRef({ down: false, x: 0, left: 0, moved: false })
  const cubeDrag = useRef({ down: false, x: 0, base: 0 })
  const compareDrag = useRef(false)
  const [indexOpen, setIndexOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [curtain, setCurtain] = useState(true)
  const [slide, setSlide] = useState(52)
  const [flipped, setFlipped] = useState({})
  const [cubeAngle, setCubeAngle] = useState(-16)
  const [sigValue, setSigValue] = useState(62)
  const [sigActive, setSigActive] = useState(0)
  const [fnActive, setFnActive] = useState(-1)

  const reduce = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  // 图像序列：主视觉 → 精选补图 → 原有图集；成品 / 细节前置，过程图留胶片。
  const images = useMemo(() => {
    if (!project || !dossier) return []
    const seen = new Set()
    const list = [
      { src: dossier.hero?.src, alt: dossier.hero?.alt || project.title, fit: dossier.hero?.fit },
      ...(dossier.extraGallery || []),
      ...(project.gallery || []),
    ]
    const all = list.reduce((acc, g) => {
      if (!g?.src) return acc
      const url = asset(g.src)
      if (seen.has(url)) return acc
      seen.add(url)
      acc.push({ src: url, alt: g.alt || project.title, fit: g.fit })
      return acc
    }, [])
    if (!all.length) return []
    const score = (g) => {
      const a = g.alt || ''
      if (/场景|人物|使用|展板|过程|调研|分镜|旅程|灵感|概念板|空间|包装|示意|草图/.test(a)) return -1
      if (/细节|特写|产品|发光|主视觉|结构|三视图|设定|效果|造型|渲染|成品/.test(a)) return 1
      return 0
    }
    return [all[0], ...all.slice(1).sort((a, b) => score(b) - score(a))].slice(0, 12)
  }, [project, dossier])

  // 浮层自己滚，锁定底层页面。
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // 项目切换：回到顶部、收起索引、复位所有可玩状态，并放一次转场幕布。
  useEffect(() => {
    if (rootRef.current) rootRef.current.scrollTop = 0
    setIndexOpen(false)
    setProgress(0)
    setSlide(52)
    setFlipped({})
    setCubeAngle(-16)
    setSigValue(62)
    setSigActive(0)
    setFnActive(-1)
    setCurtain(true)
    const t = setTimeout(() => setCurtain(false), reduce ? 0 : 980)
    return () => clearTimeout(t)
  }, [project?.id, reduce])

  // 进度条 + 首屏视差 + 卡尺刻度。
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const uiOnly = project?.id === '05'
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const max = root.scrollHeight - root.clientHeight
        const p = max > 0 ? Math.min(1, root.scrollTop / max) : 0
        setProgress(p)
        root.style.setProperty('--sw-read', p.toFixed(3))
        if (!reduce && !uiOnly && window.innerWidth > 900 && heroImgRef.current) {
          const y = Math.min(root.scrollTop * 0.12, 110)
          heroImgRef.current.style.transform = `translate3d(0, ${y}px, 0) scale(1.06)`
        }
        ticking = false
      })
    }
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [project?.id, images.length, reduce])

  // 入场揭示 + 逐字重组。
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = root.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
      }),
      { root, rootMargin: '0px 0px -5% 0px', threshold: 0.04 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [project?.id, images.length, reduce])

  // 取样放大镜：只在精确指针设备出现，显示主视觉的局部放大与十字线。
  useEffect(() => {
    const root = rootRef.current
    const lens = lensRef.current
    if (!root || !lens || window.matchMedia('(pointer: coarse)').matches || reduce) return
    const onMove = (e) => {
      // 取样器只属于产品首屏：滚出首屏就收起，避免在功能说明上遮挡文字。
      if (root.scrollTop > window.innerHeight * 0.7) {
        lens.classList.remove('is-visible')
        return
      }
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      lens.style.left = `${e.clientX}px`
      lens.style.top = `${e.clientY}px`
      lens.style.backgroundPosition = `${x}% ${y}%`
      lens.classList.add('is-visible')
    }
    const onLeave = () => lens.classList.remove('is-visible')
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    return () => {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [project?.id, reduce])

  const onFilmDown = (e) => {
    const el = filmRef.current
    if (!el || e.pointerType === 'touch') return
    filmDrag.current = { down: true, x: e.clientX, left: el.scrollLeft, moved: false }
    el.setPointerCapture?.(e.pointerId)
  }
  const onFilmMove = (e) => {
    if (!filmDrag.current.down || !filmRef.current) return
    const dx = e.clientX - filmDrag.current.x
    if (Math.abs(dx) > 5) filmDrag.current.moved = true
    filmRef.current.scrollLeft = filmDrag.current.left - dx
  }
  const onFilmUp = () => { filmDrag.current.down = false }
  const onFilmFlip = (i) => {
    if (filmDrag.current.moved) return
    setFlipped((f) => ({ ...f, [i]: !f[i] }))
  }

  const onCompareDown = (e) => {
    compareDrag.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    updateCompare(e)
  }
  const updateCompare = (e) => {
    if (!compareDrag.current || !compareRef.current) return
    const r = compareRef.current.getBoundingClientRect()
    setSlide(clamp(((e.clientX - r.left) / r.width) * 100, 8, 92))
  }
  const onCompareUp = () => { compareDrag.current = false }

  const onCubeDown = (e) => {
    cubeDrag.current = { down: true, x: e.clientX, base: cubeAngle }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onCubeMove = (e) => {
    if (!cubeDrag.current.down) return
    setCubeAngle(cubeDrag.current.base + (e.clientX - cubeDrag.current.x) * 0.42)
  }
  const onCubeUp = () => { cubeDrag.current.down = false }

  if (!project || !dossier || !content) return null

  const t = dossier.theme
  const vars = {
    '--sw-paper': t.paper,
    '--sw-ink': t.ink,
    '--sw-accent': t.accent,
    '--sw-hair': t.dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)',
    '--sw-dim': t.dark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.78)',
    '--sw-soft': t.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    '--sw-shadow': t.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)',
    '--sw-bar-bg': t.dark ? 'rgba(16,18,22,0.88)' : 'rgba(248,245,238,0.90)',
    '--sw-invert-bg': t.dark ? '#F2EFE7' : '#17181B',
    '--sw-invert-ink': t.dark ? '#17181B' : '#F5F2EB',
  }

  const pick = (i) => images[i] || images[0] || { src: '', alt: '' }
  // 文件名兜底：qimu-01 / diemu-01 经素材核查是手绘线稿，alt 写的是「细节」而非草图，
  // 只按 alt 过滤会漏进主视觉段；fig20 是制作过程图。三者一律退到 06 段图像档案。
  const isProcess = (g) =>
    /草图|线稿|手绘|推演|过程|分镜|旅程|灵感|概念板|示意|三视图/.test(g?.alt || '') ||
    /qimu-01|diemu-01|fig20|sketch|process|journey/i.test(g?.src || '')
  // 场景 / 人物 / 展板 / 过程图只留在 06 段胶片档案；01–05 段一律用成品与细节图。
  // 主视觉（images[0]）无论 alt 怎么写都保留，避免把项目封面误判成场景。
  const isScene = (g) => /场景|人物|使用|展板|调研|包装|空间|旅程|示意/.test(g?.alt || '')
  const product = images.filter((g, i) => i === 0 || (!isProcess(g) && !isScene(g)))
  const main = (i) => product[i] || product[i % product.length] || images[0] || { src: '', alt: '' }
  const uiOnly = project.id === '05'
  const fitOf = (g) => (uiOnly || g?.fit === 'contain' ? 'contain' : 'cover')
  const fns = (dossier.functions || []).slice(0, 4)
  const facts = content.facts || null
  const specs = (project.specs || []).slice(0, 2)
  const pool = images.length > 1 ? images.slice(1) : images
  const film = Array.from({ length: 5 }, (_, i) => pool[i % pool.length] || images[0])
  const idx = allProjects.findIndex((p) => p.id === project.id)
  const next = allProjects.length ? allProjects[(idx + 1 + allProjects.length) % allProjects.length] : null
  const nextDossier = next ? getDossier(next.id) : null
  const seq = getSequence(content.variant)
  const secNo = (k) => pad(seq.indexOf(k) + 1)
  const L = content.labels
  const faceIdx = ((Math.round(-cubeAngle / 90) % 4) + 4) % 4

  const shot = (g, i) => (
    <img
      src={g?.src}
      alt={g?.alt || project.title}
      style={{ objectFit: fitOf(g) }}
      loading={i === 0 ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
    />
  )

  const SecMark = ({ k, name }) => (
    <span className="sw-secmark">SEC. {secNo(k)} <i>/</i> {pad(seq.length)} <b>{name}</b></span>
  )

  /* ── 段落字典：按品类序列渲染 ──────────────────────────────── */
  const sections = {
    hero: (
      <section className={`sw-hero${uiOnly ? ' sw-hero--ui' : ''}`} key="hero" aria-label="产品主视觉">
        <div className="sw-hero-media">
          <img className="sw-hero-bg" src={pick(0).src} alt="" aria-hidden="true" draggable="false" />
          <div className="sw-hero-stage">
            <img ref={heroImgRef} className="sw-hero-fg" src={pick(0).src} alt={pick(0).alt} decoding="async" draggable="false" />
          </div>
        </div>
        <span className="sw-hero-scrim" aria-hidden="true" />
        <span className="sw-hero-ghost" aria-hidden="true">{project.id}</span>
        <div className="sw-hero-copy">
          <p className="sw-kicker">PROJECT {project.id} <i>/</i> {project.category}</p>
          <h1 className="sw-hero-title">{project.title}</h1>
          <p className="sw-hero-sub">{content.fullSubtitle}</p>
          <div className="sw-hero-badges">
            <span className="sw-badge">{dossier.badge}</span>
            <span className="sw-hero-fig">{pick(0).alt}</span>
          </div>
          <div className="sw-hero-facts">
            {(facts || specs.map((s) => ({ v: '', l: s.label, n: s.value }))).slice(0, 2).map((f, i) => (
              <span key={i}>
                <b>{f.v || pad(i + 1)}</b>
                <em>{f.l}</em>
                <small>{f.n}</small>
              </span>
            ))}
          </div>
        </div>
        <span className="sw-hero-scroll" aria-hidden="true">SCROLL <b>↓</b></span>
        <span className="sw-aperture" aria-hidden="true" />
      </section>
    ),

    statement: (
      <section className="sw-statement sw-sec" key="statement" data-reveal>
        <SecMark k="statement" name="POSITION" />
        <p className="sw-line" data-split>
          {[...content.specimenTitle].map((c, i) => <span key={`${c}-${i}`} style={{ '--c': i }}>{c}</span>)}
        </p>
        <div className="sw-statement-body">
          <p className="sw-statement-long">{dossier.oneLiner}</p>
          {facts ? (
            <div className="sw-facts">
              {facts.map((m, i) => (
                <div className="sw-fact" key={m.l}>
                  <b className={i === 1 ? 'is-accent' : ''}>{m.v}</b>
                  <span>{m.l}</span>
                  {m.n ? <small>{m.n}</small> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="sw-speclist">
              <span className="sw-speclist-head">SPEC / 规格摘录 <i>· 现有设计资料</i></span>
              {specs.map((s) => (
                <div className="sw-specrow" key={s.label}><b>{s.label}</b><span>{s.value}</span></div>
              ))}
              <small className="sw-specrow-note">本项目未附独立问卷数据，此处不补写未经确认的量化结论。</small>
            </div>
          )}
        </div>
      </section>
    ),

    signature: (
      <section className="sw-signature sw-sec" key="signature" data-reveal aria-label="品类专属互动">
        <SecMark k="signature" name="PLAY" />
        <header className="sw-sig-head">
          <h2>{content.signature.title}</h2>
          <span>{content.signature.hint}</span>
        </header>
        <Signature
          type={content.signature.type}
          cfg={content.signature}
          dossier={dossier}
          project={project}
          images={images}
          value={sigValue}
          setValue={setSigValue}
          active={sigActive}
          setActive={setSigActive}
        />
      </section>
    ),

    spread: (
      <section className="sw-spread sw-sec" key="spread" data-reveal aria-label="产品与细节">
        <SecMark k="spread" name="COMPARE" />
        <header className="sw-spread-head">
          <h2>成品 <i>/</i> 细节</h2>
          <span>左右拖动分割线，看同一件产品的整体与局部</span>
        </header>
        <div
          className="sw-compare"
          ref={compareRef}
          onPointerDown={onCompareDown}
          onPointerMove={updateCompare}
          onPointerUp={onCompareUp}
          onPointerCancel={onCompareUp}
        >
          <img className="sw-compare-a" src={main(2).src} alt={main(2).alt} draggable="false" />
          <div className="sw-compare-b" style={{ clipPath: `inset(0 ${100 - slide}% 0 0)` }}>
            <img src={main(1).src} alt={main(1).alt} draggable="false" />
          </div>
          <span className="sw-compare-handle" style={{ left: `${slide}%` }} aria-hidden="true"><i>↔</i></span>
          <span className="sw-compare-cap sw-compare-cap--l">FIG. 01 <i>/</i> {L.fig} · {main(1).alt}</span>
          <span className="sw-compare-cap sw-compare-cap--r">FIG. 02 <i>/</i> {main(2).alt}</span>
        </div>
        <figure className="sw-spread-extra">
          {shot(main(3), 3)}
          <figcaption>FIG. 03 <i>/</i> {main(3).alt}</figcaption>
        </figure>
      </section>
    ),

    invert: (
      <section className="sw-invert" key="invert" data-reveal aria-label="可实现功能">
        <div className="sw-invert-head">
          <SecMark k="invert" name="FUNCTIONS" />
          <span>可由现有结构实现</span>
        </div>
        <div className="sw-invert-media">
          <img src={main(4).src} alt={main(4).alt} style={{ objectFit: fitOf(main(4)) }} loading="lazy" decoding="async" draggable="false" />
          <svg className="sw-callout-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {fns.map((f, i) => {
              const pts = [[26, 24], [74, 32], [30, 76], [72, 70]]
              const [px, py] = pts[i] || [50, 50]
              const anchors = [[8, 12], [92, 16], [10, 88], [90, 84]]
              const [ax, ay] = anchors[i] || [10, 10]
              return (
                <path
                  key={f.n}
                  className={fnActive === i ? 'is-on' : ''}
                  d={`M ${ax} ${ay} L ${(ax + px) / 2} ${ay} L ${px} ${py}`}
                />
              )
            })}
          </svg>
          {fns.map((f, i) => (
            <button
              type="button"
              key={f.n}
              className={`sw-fn sw-fn--${i}${fnActive === i ? ' is-on' : ''}`}
              onMouseEnter={() => setFnActive(i)}
              onFocus={() => setFnActive(i)}
              onMouseLeave={() => setFnActive(-1)}
              onBlur={() => setFnActive(-1)}
              onClick={() => setFnActive(fnActive === i ? -1 : i)}
            >
              <b>{f.n}</b><span>{f.t}</span>
              {fnActive === i ? <em>{f.b}</em> : null}
            </button>
          ))}
          <span className="sw-invert-word" aria-hidden="true">{L.object}</span>
        </div>
        <p className="sw-invert-foot">引线指向产品上的对应位置；悬停或点按任一功能，展开它的实现说明。</p>
      </section>
    ),

    specimen: (
      <section className="sw-specimen sw-sec" key="specimen" data-reveal aria-label="结构与材质标本盒">
        <SecMark k="specimen" name="SPECIMEN" />
        <div className="sw-spe-copy">
          <span className="sw-spe-kicker">{L.detail}</span>
          <h2>{content.specimenTitle}</h2>
          <p>{content.specimenNote}</p>
          <div className="sw-spe-extra">
            <b>{content.specimen[4]?.k}</b>
            <span>{content.specimen[4]?.v}</span>
          </div>
          <div className="sw-spe-facekeys">
            {content.specimen.slice(0, 4).map((s, i) => (
              <button type="button" key={s.k} className={faceIdx === i ? 'is-on' : ''} onClick={() => setCubeAngle(-i * 90 - 16)}>
                {pad(i + 1)} {s.k}
              </button>
            ))}
          </div>
          <small className="sw-spe-hint">拖动右侧标本盒旋转，或点上方标签跳转面</small>
        </div>
        <div className="sw-spe-stage" onPointerDown={onCubeDown} onPointerMove={onCubeMove} onPointerUp={onCubeUp} onPointerCancel={onCubeUp} ref={cubeRef}>
          <div className="sw-cube" style={{ transform: `rotateX(-6deg) rotateY(${cubeAngle}deg)` }}>
            {content.specimen.slice(0, 4).map((s, i) => (
              <div className={`sw-cube-face sw-cube-face--${i}`} key={s.k}>
                <span className="sw-cube-no">FACE {pad(i + 1)} <i>/</i> 04</span>
                <b>{s.k}</b>
                <p>{s.v}</p>
                <span className="sw-cube-img"><img src={main(i + 1).src} alt={main(i + 1).alt} loading="lazy" draggable="false" /></span>
                <span className="sw-cube-id">YH — {project.id}</span>
              </div>
            ))}
            <div className="sw-cube-top" aria-hidden="true">{project.id}</div>
            <div className="sw-cube-bottom" aria-hidden="true" />
          </div>
          <span className="sw-spe-axis" aria-hidden="true">DRAG <b>↔</b> ROTATE</span>
        </div>
      </section>
    ),

    film: (
      <section className="sw-film-wrap" key="film" data-reveal aria-label="图像档案">
        <div className="sw-film-head">
          <SecMark k="film" name={L.archive} />
          <span>{pad(film.length)} FRAMES <i>/</i> 点画面翻到背面读图注</span>
        </div>
        <div
          className="sw-film"
          ref={filmRef}
          onPointerDown={onFilmDown}
          onPointerMove={onFilmMove}
          onPointerUp={onFilmUp}
          onPointerCancel={onFilmUp}
        >
          {film.map((g, i) => (
            <button
              type="button"
              className={`sw-frame sw-frame--${i}${fitOf(g) === 'contain' ? ' is-contain' : ''}${flipped[i] ? ' is-flipped' : ''}`}
              key={`${g?.src}-${i}`}
              onClick={() => onFilmFlip(i)}
              aria-label={`第 ${i + 1} 帧：${g?.alt || project.title}${flipped[i] ? '，收起图注' : '，查看图注'}`}
            >
              <span className="sw-frame-inner">
                <span className="sw-frame-front">{shot(g, 5 + i)}<i>FIG. {pad(i + 1)}</i></span>
                <span className="sw-frame-back">
                  <b>FIG. {pad(i + 1)} <i>/</i> {L.fig}</b>
                  <em>{g?.alt || project.title}</em>
                  <small>点击翻回画面 ↺</small>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    ),

    outro: (
      <section className="sw-outro" key="outro" data-reveal>
        <SecMark k="outro" name="RECORD" />
        <p className="sw-outro-line"><b>进展</b><span>{dossier.status.label}</span></p>
        {project.id === '03' ? (
          <p className="sw-outro-note">孔雀石系列已开始落地 · 其余形态或细节尚未确认</p>
        ) : null}
        <div className="sw-outro-fine">
          <span>{content.sourceLine}</span>
          <span>{GLOBAL_NOTE.feasibility}</span>
        </div>
        <button type="button" className="sw-outro-back" onClick={onClose}>← 返回作品集</button>
      </section>
    ),

    next: next && nextDossier ? (
      <button type="button" className="sw-next" key="next" onClick={() => onSelect?.(next)} aria-label={`下一个项目：${next.title}`}>
        <img className="sw-next-back" src={asset(nextDossier.hero.src)} alt="" loading="lazy" decoding="async" draggable="false" />
        <span className="sw-next-veil" aria-hidden="true" />
        <img className="sw-next-front" src={asset(nextDossier.hero.src)} alt="" loading="lazy" decoding="async" draggable="false" />
        <span className="sw-next-copy">
          <span className="sw-next-kicker">NEXT PROJECT <i>/</i> {next.id} <b>— 掀开下一页 ↑</b></span>
          <strong>{next.title}</strong>
          <em aria-hidden="true">→</em>
        </span>
      </button>
    ) : null,
  }

  return (
    <div
      ref={rootRef}
      className={`sw-root${t.dark ? ' sw-root--dark' : ''} sw-v--${content.variant}`}
      style={vars}
      data-lenis-prevent
      role="region"
      aria-label={`${project.title} · 项目展示`}
    >
      {/* 转场：蓝图幕布 + 三片快门，切项目时揭膜 */}
      {curtain ? (
        <div className="sw-curtain" aria-hidden="true">
          <span className="sw-curtain-grid" />
          <span className="sw-curtain-no">{project.id}</span>
          <span className="sw-curtain-label">YH <i>/</i> {project.category} <i>/</i> OPENING</span>
          <span className="sw-curtain-blade sw-curtain-blade--1" />
          <span className="sw-curtain-blade sw-curtain-blade--2" />
          <span className="sw-curtain-blade sw-curtain-blade--3" />
        </div>
      ) : null}

      {/* 取样放大镜：产品局部放大 + 十字线，替代此前的通用圆形光标 */}
      <div className="sw-lens" ref={lensRef} aria-hidden="true" style={{ backgroundImage: `url("${pick(0).src}")` }}>
        <span className="sw-lens-cross" /><span className="sw-lens-tag">SAMPLE / {project.id}</span>
      </div>

      <header className="sw-bar">
        <button type="button" className="sw-back" onClick={onClose} aria-label="返回作品集"><span aria-hidden="true">←</span> 返回</button>
        <span className="sw-bar-id">YH <i>/</i> {project.id} — 08</span>
        <div className="sw-bar-right">
          <span className="sw-progress" aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /><b /></span>
          <button type="button" className="sw-index-toggle" onClick={() => setIndexOpen((v) => !v)} aria-expanded={indexOpen} aria-label="打开项目索引">
            INDEX <b>{project.id}</b>
          </button>
        </div>
      </header>

      {indexOpen ? (
        <nav className="sw-index" aria-label="项目索引">
          <p className="sw-index-head">SELECTED WORKS <i>/</i> 08 <b>· 抽屉拉开</b></p>
          {allProjects.map((p, i) => (
            <button
              type="button"
              key={p.id}
              className={p.id === project.id ? 'is-active' : ''}
              style={{ '--i': i }}
              onClick={() => { setIndexOpen(false); onSelect?.(p) }}
            >
              <span>{p.id}</span><strong>{p.title}</strong><em>{statusLabel(p.id)}</em>
            </button>
          ))}
        </nav>
      ) : null}

      <main>{seq.map((k) => sections[k])}</main>
    </div>
  )
}
