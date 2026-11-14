import { useEffect, useMemo, useRef, useState } from 'react'
import './mobileLanding.css'

/**
 * MobileLandingMenu —— 手机端专属「概念播放器」入口
 *
 * 视觉与几何来自参考包「YH-一体式卡片交互」的 hero 区，按像素复刻：
 *   · 纯白底 + 底部橙色地面光（.ml-floor）
 *   · 左对齐巨型标题 YANG HONG. + 右侧两行简介
 *   · 中间一副 8 张白卡的牌堆，上下/左右拖拽像轮盘一样换张，带惯性吸附
 *   · 牌堆下方一行「滑动，发现下一个」+ ‹ 01 / 08 ›
 *   · 底部实习区：半透明毛玻璃圆角按钮（底下橙色地面光透出来）
 *
 * 卡的样式与卡脚结构按原稿 1:1 还原：封面 +（左上编号 / 右上级品类）+
 * 标题 +「{品类} · 查看完整项目」+ 右上角一枚 29px 黑圆箭头。
 *
 * 详情入口（第 7 轮决策 6 收敛后）：
 *   · 正中那张卡的**整张卡**点一下 = 直接进项目详情页（一次点击直达）；
 *   · 卡脚那枚圆箭头在正中卡上是同一件事（视觉上仍保留原稿的样子）；
 *   · 后排 7 张卡的箭头不可点（CSS 里 visibility:hidden），点后排卡只把它转到最前面。
 *   曾经这里是三岔路（卡本体弹胶片、箭头开原稿 iframe 浮层），
 *   同一个手势能掉进三个不同的层，手机上必然互相矛盾。
 *
 * 为什么几何用一帧一帧写 DOM，而不是给每张卡算 6 个 motion value：
 *   牌堆的 depth 是**取模**的（每张卡的 depth 在 0..7 之间循环），
 *   从 depth=6 绕到 depth=0 时 x/scale 是**跳变**的 —— 靠插值驱动的库
 *   会把这个跳变补成一段可见的"飞过去"。参考包用的是显式的弹簧积分
 *   （velocity += ((target-angle)*180 - velocity*25)*dt），
 *   忠实照搬这一套，手感才一致：干脆、不拖尾、松手即吸附。
 */

// 轮盘 8 格的固定顺序（与 App.jsx 里 projects 的 id 一一对应）。
// 只存 id，封面/标题/品类都从 props.projects 现取 ——
// 以后换封面图或改标题，入口页会自动跟着变，不会留下写死的死链。
//
// ⚠️ 这份名单和 App.jsx 的 DETAIL_PAGE_IDS 必须对齐：
// 曾经漏掉 08（猫冰 IP），入口页上就少了一整个项目 —— 08 有独立详情页，
// 却压根没上轮盘。加新项目时两处一起改。
// 04 之后插 08：它是内容最完整的一套，排在轮盘前段更容易被转到。
const WHEEL_IDS = ['01', '02', '03', '04', '08', '06', '05', '07']

// 底部实习行。第三项按参考包的做法用短名 + 「· 设计竞赛」标记。
const EXPERIENCES = [
  { company: '东莞宝辉灯饰有限公司', meta: '产品外观设计师', date: '2025.10 – 2026.03', contest: false },
  { company: '东莞新力威丝印有限公司', meta: '设计部实习生', date: '2025.07 – 2025.09', contest: false },
  { company: '中财上智研究院', meta: '设计组长', date: '2024.11 – 2025.01', contest: true },
]

const NAV_ITEMS = ['主视觉', '项目', '简历']

// 参考包里全站共用的一枚箭头：右上斜指，表示"进入 / 打开"
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 18 18 6M6 6h12v12" />
  </svg>
)

export default function MobileLandingMenu({
  onChooseResume,
  onChooseProjects,
  onOpenProject,
  onOpenReel,
  projects = [],
  // 从详情页退回这一层时，直接停在刚才看的那一张 —— 退回来"还是这个界面"，
  // 而不是被重置回第 1 张（App.jsx 记着这个下标）
  initialIndex = 0,
}) {
  const [nav, setNav] = useState(0)
  const [selected, setSelected] = useState(initialIndex)

  // 牌堆里真正存在的项目（按 WHEEL_IDS 的顺序），拿不到对象的会被剔除
  const deck = useMemo(
    () => WHEEL_IDS.map((id) => projects.find((p) => p.id === id)).filter(Boolean),
    [projects],
  )

  // 原生监听器里读 props 会读到旧闭包，统一走 ref
  const deckRef = useRef(deck)
  deckRef.current = deck
  const onOpenProjectRef = useRef(onOpenProject)
  onOpenProjectRef.current = onOpenProject
  // 胶片入口同样走 ref：原生 click 监听器里读 props 会拿到旧闭包
  const onOpenReelRef = useRef(onOpenReel)
  onOpenReelRef.current = onOpenReel

  const shellRef = useRef(null)
  const wheelRef = useRef(null)
  const layerRef = useRef(null)
  // ‹ › 按钮住在 effect 外面，拿不到里面的 stepBy —— 用 ref 把最新的翻页函数递出去
  const stepRef = useRef(() => {})

  // 选完就整层退场，重复点击不该触发第二次跳转
  const leaving = useRef(false)
  const go = (index, run) => {
    if (leaving.current) return
    leaving.current = true
    setNav(index)
    // 等药丸滑到位（.38s 的 CSS 过渡）再收起这一层，动作才读得连贯
    window.setTimeout(() => run?.(), 320)
  }
  const goProjects = () => go(1, onChooseProjects)
  const goResume = () => go(2, onChooseResume)
  const goHome = () => {
    setNav(0)
    shellRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const wheel = wheelRef.current
    const layer = layerRef.current
    if (!wheel || !layer) return undefined

    const devices = Array.from(layer.querySelectorAll('[data-device]'))
    const count = devices.length
    if (!count) return undefined

    const modn = (x) => ((x % count) + count) % count
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    // 弹簧状态机：angle 是当前角度，target 是目标角度，velocity 是角速度
    // 起始格取 initialIndex：整层重挂时直接落在那一张上，不做回卷动画
    const start = Math.min(Math.max(0, initialIndex), count - 1)
    let angle = start
    let target = start
    let velocity = 0
    let raf = 0
    let previousTime = 0
    let current = start
    let drag = null
    let suppressClick = false
    let geometry = { width: 180, height: 330, deviceWidth: 93, deviceHeight: 173 }

    function draw() {
      const { width, deviceWidth: w } = geometry
      for (let i = 0; i < count; i += 1) {
        const node = devices[i]
        // depth = 这张卡离"最前面"还有几层。取模把它圈在 0..count-1，
        // 越过一圈后减去 count 就变成负数 —— 负数即"正在离场"，
        // 于是同一套公式里就同时表达出"进场"和"退场"两个方向。
        let depth = modn(i - angle)
        if (depth > count - 1) depth -= count
        const leaving = depth < 0

        const scale = leaving ? 1 + depth * 0.025 : 1 - depth * 0.047
        // 横向只散开一点点，整副牌堆锁在舞台中部偏左的一竖条里
        const x = width * 0.48 - w / 2 + (leaving ? depth * w * 1.18 : depth * 7)
        const y = 14 + (leaving ? -depth * 19 : -depth * 8)
        // -4° 是整副牌堆的基准倾角；越靠后越正，离场时向另一侧甩开
        const tilt = leaving ? -4 + depth * 15 : -4 + depth * 2.5

        node.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${tilt.toFixed(
          2,
        )}deg) scale(${scale.toFixed(3)})`

        // 最后一张额外压暗一档，让"还有更多"读得出来；离场时线性淡出
        const opacity = leaving
          ? Math.max(0, 1 + depth)
          : depth > count - 2.5
            ? ((count - 1 - depth) / 1.5) * 0.7525
            : 1 - depth * 0.055
        const alpha = Math.max(0, opacity)
        node.style.opacity = alpha.toFixed(3)
        // 淡到看不见的卡不该还能点，也不该被读屏念出来
        node.style.pointerEvents = alpha < 0.05 ? 'none' : 'auto'
        node.setAttribute('aria-hidden', String(alpha < 0.05))
        node.style.zIndex = String(leaving ? 110 : Math.round(100 - depth * 10))
      }

      const next = modn(Math.round(angle))
      if (next !== current) {
        current = next
        setSelected(next)
      }
    }

    function resize() {
      const rect = wheel.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      // 卡宽跟着舞台宽度走（窄屏不会溢出），卡高留 24px 给下方的操作行
      const deviceWidth = Math.min(310, rect.width * 0.72)
      geometry = {
        width: rect.width,
        height: rect.height,
        deviceWidth,
        deviceHeight: Math.min(370, rect.height - 24),
      }
      wheel.style.setProperty('--ml-device-w', `${deviceWidth}px`)
      wheel.style.setProperty('--ml-device-h', `${geometry.deviceHeight}px`)
      draw()
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      previousTime = 0
    }

    function tick(now) {
      const dt = Math.min((now - (previousTime || now - 16)) / 1000, 0.032)
      previousTime = now
      // 阻尼弹簧：朝 target 加速，同时按 25/s 的速度衰减
      velocity += ((target - angle) * 180 - velocity * 25) * dt
      angle += velocity * dt
      if (Math.abs(target - angle) < 0.001 && Math.abs(velocity) < 0.01) {
        angle = modn(target)
        target = angle
        velocity = 0
        stop()
        draw()
        return
      }
      draw()
      raf = requestAnimationFrame(tick)
    }

    // settle 只接受"要停在哪个整数格"，过渡由 tick 负责
    function settle(next) {
      target = Math.round(next)
      if (reduced.matches) {
        stop()
        angle = modn(target)
        target = angle
        velocity = 0
        draw()
        return
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const stepBy = (delta) => settle(Math.round(target) + delta)
    stepRef.current = stepBy

    function onPointerDown(event) {
      if (event.button !== 0 || !event.isPrimary) return
      stop()
      velocity = 0
      // 每一次按下都清掉上一次的"抑制点击"标记，否则拖过一次后
      // 卡片会一直点不开（这个标记只该管它自己那一次手势）
      suppressClick = false
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        angle,
        axis: null,
        lastPosition: 0,
        lastTime: event.timeStamp,
        speed: 0,
        moved: false,
      }
    }

    function onPointerMove(event) {
      if (!drag || drag.id !== event.pointerId) return
      const dx = event.clientX - drag.x
      const dy = event.clientY - drag.y
      // 6px 的容差：手指微抖不算拖，松手时还是"点一下"
      if (!drag.moved && Math.max(Math.abs(dx), Math.abs(dy)) < 6) return
      if (!drag.moved) {
        drag.moved = true
        // 第一个明确的方向决定这一手是横拖还是竖拖，之后不再改
        drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        try {
          wheel.setPointerCapture(event.pointerId)
        } catch (err) {
          /* 指针已释放，忽略 */
        }
        wheel.classList.add('ml-dragging')
      }
      const delta = drag.axis === 'x' ? dx : dy
      const dt = Math.max(1, event.timeStamp - drag.lastTime)
      // 拖多长等于转一格：跟着卡宽走，小屏不用拖半天
      const distance = Math.max(160, geometry.deviceWidth * 0.76)
      drag.speed = -(delta - drag.lastPosition) / dt / distance
      drag.lastPosition = delta
      drag.lastTime = event.timeStamp
      angle = drag.angle - delta / distance
      target = angle
      draw()
    }

    function release(event) {
      if (!drag || drag.id !== event.pointerId) return
      const moved = drag.moved
      // 超过 100ms 没动就当没速度，避免"拖一半停住"被甩出去
      const speed = event.timeStamp - drag.lastTime < 100 ? drag.speed : 0
      drag = null
      wheel.classList.remove('ml-dragging')
      if (wheel.hasPointerCapture?.(event.pointerId)) wheel.releasePointerCapture(event.pointerId)
      const cancelled = event.type === 'pointercancel'
      if (moved) suppressClick = !cancelled
      // 甩一下最多多走 1.4 格 —— 再快也只用一格一格地翻
      settle(cancelled ? angle : moved ? angle + Math.max(-1.4, Math.min(1.4, speed * 140)) : target)
    }

    function onPointerCancel(event) {
      if (drag) drag.speed = 0
      release(event)
    }

    function onClick(event) {
      if (suppressClick) {
        suppressClick = false
        return
      }
      const device = event.target.closest?.('[data-device]')
      if (!device) return
      const index = Number(device.dataset.device)

      // 只有卡脚那枚圆箭头去原稿详情页。判在卡本体之前：
      // 箭头就长在卡里，不先拦下来就会被当成"点了整张卡"。
      if (event.target.closest?.('[data-open]')) {
        const project = deckRef.current[index]
        // 把"第几格"一并交出去：万一入口页之后重挂，还能停在同一张
        if (project) onOpenProjectRef.current?.(project, index)
        return
      }

      // 正中那张卡：整卡点击 = 直接进项目详情页（一次点击直达）。
      // 第 7 轮决策 6：不再"点卡先弹胶片、再点第二下才进详情"。
      // 后排的卡仍然是转正，不做任何跳转。
      const front = modn(Math.round(angle))
      if (index !== front) {
        settle(Math.round(angle) + (modn(index - front + 3) - 3))
      } else {
        const project = deckRef.current[index]
        if (project) onOpenProjectRef.current?.(project, index)
      }
    }

    function onKeyDown(event) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') stepBy(1)
      if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') stepBy(-1)
      if (event.key === 'Home') settle(angle + ((count - modn(Math.round(angle))) % count))
      if (event.key === 'Enter' || event.key === ' ') {
        const front = modn(Math.round(angle))
        const project = deckRef.current[front]
        if (project) onOpenProjectRef.current?.(project, front)
      }
    }

    let lastWheelTime = -Infinity
    function onWheelEvent(event) {
      event.preventDefault()
      // 触控板一次滑动会连发几十个 wheel，250ms 节流后才是"翻一格"
      if (Math.abs(event.deltaY) > 5 && event.timeStamp - lastWheelTime > 250) {
        lastWheelTime = event.timeStamp
        stepBy(event.deltaY > 0 ? 1 : -1)
      }
    }

    function onVisibility() {
      // 切到后台就停在最近一格，回来时不会是半张歪着的卡
      if (!document.hidden) return
      stop()
      angle = modn(Math.round(target))
      target = angle
      velocity = 0
      draw()
    }

    function onMotionPreference() {
      if (reduced.matches) settle(target)
    }

    wheel.addEventListener('pointerdown', onPointerDown)
    wheel.addEventListener('pointermove', onPointerMove)
    wheel.addEventListener('pointerup', release)
    wheel.addEventListener('pointercancel', onPointerCancel)
    wheel.addEventListener('click', onClick)
    wheel.addEventListener('keydown', onKeyDown)
    wheel.addEventListener('wheel', onWheelEvent, { passive: false })
    document.addEventListener('visibilitychange', onVisibility)
    reduced.addEventListener?.('change', onMotionPreference)

    let observer = null
    if ('ResizeObserver' in window) {
      observer = new ResizeObserver(resize)
      observer.observe(wheel)
    } else {
      window.addEventListener('resize', resize)
    }

    resize()
    draw()

    return () => {
      stop()
      wheel.removeEventListener('pointerdown', onPointerDown)
      wheel.removeEventListener('pointermove', onPointerMove)
      wheel.removeEventListener('pointerup', release)
      wheel.removeEventListener('pointercancel', onPointerCancel)
      wheel.removeEventListener('click', onClick)
      wheel.removeEventListener('keydown', onKeyDown)
      wheel.removeEventListener('wheel', onWheelEvent)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener?.('change', onMotionPreference)
      if (observer) observer.disconnect()
      else window.removeEventListener('resize', resize)
    }
    // deck 里的 id 顺序是固定的，长度不变就不需要重建这套几何
  }, [deck.length])

  const front = deck[selected] || deck[0]
  const total = String(deck.length).padStart(2, '0')

  return (
    <section className="ml-overlay" role="dialog" aria-modal="true" aria-label="杨鸿的作品集入口">
      <div className="ml-player">
        <header className="ml-header">
          <button type="button" className="ml-brand" onClick={goHome} aria-label="杨鸿，回到主视觉顶部">
            YH<span>.</span>
          </button>
          <nav className="ml-pillnav" aria-label="主要导航" style={{ '--ml-nav': nav }}>
            {NAV_ITEMS.map((label, index) => (
              <button
                key={label}
                type="button"
                aria-current={nav === index ? 'page' : undefined}
                onClick={index === 0 ? goHome : index === 1 ? goProjects : goResume}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        <div className="ml-viewport">
          <div className="ml-home" ref={shellRef}>
            <div className="ml-scene">
              <div className="ml-floor" aria-hidden="true" />

              <header className="ml-title ml-rise">
                <h1>
                  YANG
                  <br />
                  HONG<span>.</span>
                </h1>
                <div className="ml-intro">
                  <p>杨鸿 · 产品设计师</p>
                  <p>
                    把想法
                    <br />
                    做成日常。
                  </p>
                </div>
              </header>

              <div
                className="ml-wheel ml-rise"
                ref={wheelRef}
                role="group"
                tabIndex={0}
                aria-label={`精选项目，当前 ${selected + 1}/${deck.length}：${
                  front ? `${front.title}，${front.category}` : ''
                }。左右或上下滑动换一张，回车查看完整项目。`}
              >
                <div className="ml-layer" ref={layerRef}>
                  {deck.map((project, index) => (
                    // 卡本体是个 div 而不是 button：卡脚那枚圆箭头才是唯一的
                    // 详情入口，button 里套 button 是非法结构（点哪个都可能
                    // 触发外层）。翻牌手势、指针事件、aria-hidden 都由上面
                    // 那套几何逐帧写在这层节点上，跟元素标签无关。
                    <div
                      key={project.id}
                      className={`ml-device${index === selected ? ' is-front' : ''}`}
                      data-device={index}
                    >
                      <span className="ml-screen">
                        <span className="ml-image">
                          <img
                            src={project.image}
                            alt=""
                            draggable="false"
                            style={{ objectPosition: project.imagePosition }}
                          />
                          <span className="ml-top" aria-hidden="true">
                            {/* 角标用**项目编号**，不是"第几张"：轮盘顺序是策展排的
                                （08 插在 04 之后、05 排在 06 之后），
                                拿位置当编号，会指着猫冰念「05」。 */}
                            <strong>{project.id}</strong>
                            <span>{project.category}</span>
                          </span>
                        </span>
                        <span className="ml-copy">
                          <strong>{project.title}</strong>
                          {/* 原稿卡脚的第二行，一字不改 */}
                          <small>{project.category} · 查看完整项目</small>
                          {/* 正中卡上它和"整卡点击"是同一个动作（都进 React 详情页）；
                              后排卡的箭头由 CSS 隐藏且不可点，免得留下 7 个 <44px
                              的假目标（第 7 轮决策 6）。
                              点击由轮盘那支原生 onClick 统一接管（认 data-open）——
                              拖完牌的手势刚结束时会抑制一次点击，放在 React 的
                              onClick 里就绕过了那道闸，拖完松手会误开详情。
                              tabIndex=-1：键盘路径统一交给轮盘（回车），
                              否则焦点进到这枚按钮，一次回车会开两遍。 */}
                          <button
                            type="button"
                            className="ml-open"
                            data-open={index}
                            tabIndex={-1}
                            aria-label={`查看${project.title}的完整项目`}
                          >
                            <ArrowIcon />
                          </button>
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ml-navrow">
                <span className="ml-swipe">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12h16M8 8l-4 4 4 4m8-8 4 4-4 4" />
                  </svg>
                  滑动，发现下一个
                </span>
                <div className="ml-controls">
                  <button type="button" aria-label="上一个项目" onClick={() => stepRef.current(-1)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m14 6-6 6 6 6" />
                    </svg>
                  </button>
                  <span className="ml-number">
                    <span>{String(selected + 1).padStart(2, '0')}</span>
                    <i>/ {total}</i>
                  </span>
                  <button type="button" aria-label="下一个项目" onClick={() => stepRef.current(1)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m10 6 6 6-6 6" />
                    </svg>
                  </button>
                </div>

                {/* 胶片入口：卡本体也能唤起（点正中那张直接弹规格），
                    但这枚 44×44 的键让"有这回事"在首屏一眼能看见。 */}
                <button
                  type="button"
                  className="ml-reel-btn"
                  data-action="open-mobile-reel"
                  onClick={() => onOpenReelRef.current?.(selected, false)}
                  title="30 秒速览：自动过一遍 8 个项目"
                  aria-label="打开 30 秒速览，自动过一遍 8 个项目"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5.5v13l10-6.5z" />
                  </svg>
                  30s
                </button>
              </div>

              <div className="ml-sr" aria-live="polite" aria-atomic="true">
                <span>{front?.title}</span>
                <span>{front?.category}</span>
              </div>
            </div>

            <footer className="ml-dock ml-rise ml-rise-2">
              <div className="ml-dockhead">
                <h2>实习与实践</h2>
                <button type="button" onClick={goResume}>
                  查看经历
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14m-5-5 5 5-5 5" />
                  </svg>
                </button>
              </div>

              <div className="ml-links">
                {/* 三条实习经历以前是三枚按钮，全部 onClick={goResume} —— 和上面那枚
                    「查看经历」完全同一个去处，等于在同一屏给了四个入口。
                    第 7 轮决策 6：不再重复，这里只留**静态文字**（内容一字不减），
                    要跳转走「查看经历」那一条路。顺带少 3 个触控目标。 */}
                {EXPERIENCES.map((exp) => (
                  <div key={exp.company} className="ml-company">
                    <span className="ml-companycopy">
                      <strong>{exp.company}</strong>
                      <span className="ml-companymeta">
                        <span>
                          {exp.meta}
                          {exp.contest ? ' · 设计竞赛' : ''}
                        </span>
                        <span className="ml-companydate">{exp.date}</span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="ml-foot">
                <span>YANG HONG · SELECTED WORKS</span>
                <span>© 2026</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </section>
  )
}
