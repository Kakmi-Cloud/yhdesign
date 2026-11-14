import { useEffect } from 'react'

// 模块级单例：Lenis 只应该有一个实例。
// 暴露 getLenis() 是为了让别处（详情页、光箱）能在需要时锁住滚动，
// 而不是各自再 new 一个 —— 两个实例会互相抢 window 的 scrollTop。
let lenisInstance = null

// 期望的锁定状态。Lenis 是异步加载的，锁定请求可能先于实例到达，
// 所以这里先记住意图，实例建好后立刻套用。
let wantLocked = false

// 唤醒钩子：循环空闲停表后，任何滚动输入/程序化滚动都靠它把表重新走起来。
// 模块级持有，是因为除了本组件，InkBloom 也会发起程序化滚动。
let wakeFn = null

export const getLenis = () => lenisInstance

/** 立刻恢复惯性滚动的帧循环（发起程序化滚动前调用） */
export const wakeScroll = () => { wakeFn?.() }

const applyLock = () => {
  if (!lenisInstance) return
  if (wantLocked) lenisInstance.stop()
  else lenisInstance.start()
}

/**
 * 锁定 / 解锁惯性滚动。
 *
 * 用于打开浮层（项目详情页、弹窗、卡片光箱）时锁住背景：
 * 这些浮层自己有独立的滚动容器，如果 Lenis 仍在驱动 window，
 * 底下的主页会跟着一起滚。
 *
 * 注意 Lenis 的 stop() 不只是"停住动画" —— 它会 preventDefault 掉滚轮事件
 * （见 lenis.mjs: `if (this.isStopped || this.isLocked) { event.preventDefault(); return }`），
 * 所以锁定期间背景是真的一点都滚不动。
 */
export const useLenisLock = (locked) => {
  useEffect(() => {
    wantLocked = !!locked
    applyLock()
  }, [locked])

  // 组件卸载时一定要解锁，否则一旦某个浮层异常卸载，整页就永久滚不动了
  useEffect(() => () => {
    wantLocked = false
    applyLock()
  }, [])
}

/**
 * SmoothScroll —— Lenis 惯性滚动
 *
 * 这一步是"PPT 感"的主要来源：原生滚轮是一格一格跳的，接上 Lenis 之后
 * 推一下会滑一段再停，有重量和回弹。
 *
 * 它本身不产生任何 DOM（直接返回 children），所以不会影响既有布局。
 *
 * 两处必须做的配合：
 * 1. index.css 里有一条 `html { scroll-behavior: smooth }`。Lenis 在内部
 *    直接改 scrollTop，浏览器的 smooth 会把每一次赋值都变成一段动画，
 *    两者叠加会明显发涩。所以补了 `html.lenis { scroll-behavior: auto }`
 *    （只在 Lenis 运行时生效，不影响别处）。
 * 2. 锚点点击交给 lenis.scrollTo 处理，保证和惯性滚动是同一套缓动；
 *    导航吸顶高度用 offset 补偿。
 *
 * ── 空闲停表（性能）──
 * 原来那个 rAF 循环是**永不退出**的：只要页面开着，就每帧调一次 lenis.raf()。
 * 一帧的调用本身不贵，贵的是"注册了 rAF"这件事本身 —— 浏览器为了按时回调，
 * 必须持续产帧。实测本页在完全静止（不滚、不 hover）时仍然是 165fps 连续出帧，
 * 风扇与耗电就来自这里。
 *
 * 所以改成：`isScrolling === false` 连续 40 帧（60Hz 约 0.65s）后就把循环停掉，
 * 渲染管线可以彻底空闲；任何滚动输入（滚轮 / 触摸 / 键盘 / 拖滚动条）或
 * 程序化滚动再把它唤醒。
 *
 * 恢复时必须把 `lenis.time` 归零：lenis.raf 里算的是
 * `deltaTime = time - (this.time || time)`，time 置 0 会让睡醒后的第一帧
 * deltaTime 恰好为 0，动画从暂停处继续 —— 否则一个几百毫秒的 delta 会
 * 让缓动动画一帧走完，滚动变成"瞬移"。
 */
export const SmoothScroll = ({ children }) => {
  useEffect(() => {
    let lenis = null
    let raf = 0
    let idleFrames = 0
    let cancelled = false

    // 空闲多久停表。40 帧在 60Hz 上约 0.65s、在 165Hz 上约 0.24s ——
    // 都比"一次惯性滑行的收尾"长，不会在动画中途把表停掉。
    const IDLE_LIMIT = 40

    const loop = (time) => {
      raf = 0
      lenis.raf(time)
      if (lenis.isScrolling) {
        idleFrames = 0
      } else if (++idleFrames >= IDLE_LIMIT) {
        // 不排下一帧 —— 这是"停表"本身，渲染管线从此可以空闲
        return
      }
      raf = requestAnimationFrame(loop)
    }

    const wake = () => {
      if (raf || !lenis || cancelled) return
      // time 归零 → 睡醒第一帧 deltaTime 恰为 0，动画从暂停处接着走
      lenis.time = 0
      idleFrames = 0
      raf = requestAnimationFrame(loop)
    }

    ;(async () => {
      try {
        const { default: Lenis } = await import('lenis')
        if (cancelled) return
        lenis = new Lenis({
          duration: 1.15,
          // 指数衰减：起步快、收尾长，就是"滑一段才停"的手感来源
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        })
        lenisInstance = lenis
        // 任何程序化滚动（锚点、InkBloom 过版）都先把表唤醒，
        // 否则 scrollTo 设了 isScrolling='smooth' 却没有帧去推进它。
        const rawScrollTo = lenis.scrollTo.bind(lenis)
        lenis.scrollTo = (...args) => {
          wake()
          return rawScrollTo(...args)
        }
        wakeFn = wake
        applyLock()
        wake()
      } catch (e) {
        // 不再静默吞掉：Lenis 没挂上时页面仍可用（原生滚动），
        // 但必须让人知道惯性滚动为什么没生效。
        console.warn('[SmoothScroll] Lenis 初始化失败，已回退到原生滚动：', e)
      }
    })()

    // 唤醒源：滚轮 / 触摸 / 键盘 / 指针按下（拖滚动条）/ 原生滚动
    // 全部 passive —— 这里只负责叫醒，不碰默认行为。
    const onWake = () => wake()
    window.addEventListener('wheel', onWake, { passive: true })
    window.addEventListener('touchstart', onWake, { passive: true })
    window.addEventListener('pointerdown', onWake, { passive: true })
    window.addEventListener('keydown', onWake)
    window.addEventListener('scroll', onWake, { passive: true })

    const onClick = (e) => {
      // 已被组件自己接管的锚点（如「完整经历 ↗」的过版转场）要让路：
      // 否则 Lenis 的平滑滚动会和那个转场同时写 scrollTop，落点发飘。
      if (e.defaultPrevented) return
      if (!(e.target instanceof Element)) return
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 })
      else target.scrollIntoView({ behavior: 'smooth' })
    }
    document.addEventListener('click', onClick)

    return () => {
      cancelled = true
      document.removeEventListener('click', onClick)
      window.removeEventListener('wheel', onWake)
      window.removeEventListener('touchstart', onWake)
      window.removeEventListener('pointerdown', onWake)
      window.removeEventListener('keydown', onWake)
      window.removeEventListener('scroll', onWake)
      if (raf) cancelAnimationFrame(raf)
      if (lenis) lenis.destroy()
      if (lenisInstance === lenis) lenisInstance = null
      if (wakeFn === wake) wakeFn = null
    }
  }, [])

  return children
}

export default SmoothScroll
