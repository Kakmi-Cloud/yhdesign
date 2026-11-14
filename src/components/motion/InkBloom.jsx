import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useReducedMotion } from 'framer-motion'
import { getLenis } from '../SmoothScroll'

/**
 * 墨洗 InkBloom —— 「完整经历 ↗」的页面转场
 *
 * 机制取自页面自己的图形：hero 里那块 46vw 的荧光橙圆球（偏中右）。
 * 它本身就是画面里最大的一个"点"，所以让它自己涨开、盖住整屏，
 * 在满版那一拍换页，再把半径收回去。
 *
 * ── 为什么第二版"太突兀"，以及这一版怎么改（别再退回去）──
 *
 * 判据先定下来：**逐帧"视口被覆盖比例"的最大跳变**。眼睛读的是"屏幕被吃掉多少"，
 * 不是半径 —— 所以这是"突兀"唯一有意义的口径。目标 ≤5%/帧（≈ 一次 340ms 的整屏淡入）。
 * 旧版离线实测：涨开 29.9%/帧、收回 27.2%/帧 —— 等于 33ms 内整屏换完，这就是"闪"。
 *
 * 三个根因，逐条对应处方：
 *
 *  1. 涨开用 ease-in-expo（0.7,0,0.84,0）。这条曲线起手几乎不动、结尾疯狂加速 ——
 *     半径压在最后几帧冲完。处方：不再用"好看的曲线"，改成**按覆盖率反解出的
 *     分段关键帧表**。原因见下"为什么必须分段"。
 *  2. 满版只停 130ms。刚盖住就松手，读起来像掉帧而不是节拍。处方：220ms。
 *  3. 换页是瞬移 → 目的地"凭空出现"，这是"突兀"的第二层来源。
 *     处方：改成用 Lenis 平滑走位（820ms）。收回擦开时看到的是一张还在滑行、
 *     正要停稳的页面 —— 到达感，而不是弹出感。
 *
 * ── 为什么必须分段，单条曲线做不到 ──
 *
 * 圆的覆盖率对半径极度非线性。实测（视口 1723×1198，圆心 1020/529）：
 *   覆盖 0    → 12.5%  半径要长 287px
 *   覆盖 37.5% → 50%   半径只长  81px   ← 最敏感
 *   覆盖 87.5% → 100%  半径要长 331px
 * 中段每动 81px 就改 12.5% 覆盖，两端要 300px 才改同样的量。
 * 单条 cubic-bezier 的斜率是"匀"的，必然在中段超速 —— 离线扫遍候选曲线，
 * 最好的单条也只到 12.6%/帧。要压到 5% 以内，必须让曲线在中段**主动变平**，
 * 而 cubic-bezier 表达不了"两端陡、中间平"，只有分段关键帧能。
 *
 * 于是直接反解：让**覆盖率随时间线性**变化，再算出每个时刻该有的半径。
 * 8 等分（每段 12.5% 覆盖）实测涨开 5.0%/帧、收回 4.7%/帧 —— 比旧版柔和 6 倍。
 * 关键帧表是几何推导的结果，不是调出来的审美参数；表在 index.css 里，
 * 重算方法是把 coverage(r) = area(circle(r) ∩ 视口)/视口面积 反函数取 8 等分。
 *
 * ── 无缝的前提（不能动）──
 *
 * 橙圆是纯色 #E67E33，覆盖层也是纯色 #E67E33。半径小于球半径（约 310px）时
 * 整个藏在球里 —— 橙盖橙，看不见；半径越过球边那一刻两者边缘重合，所以没有接缝。
 * 正因如此覆盖层**必须是纯色**，不能加渐变或描边，否则接缝立刻现形。
 * 也正因如此涨开的起手段慢一点是白送的：那一段本来就看不见。
 *
 * 半径必须是 px、不能是百分比：circle() 的百分比按参考框 sqrt(w²+h²)/√2 解析，
 * 一旦浏览器按别的参考解析（或参考框不是视口），四角就永远盖不满 —— 而且这是静默的。
 * 所以这里直接把"圆心到四角的最远距离"算成 px 传下去（--r），覆盖是算术保证。
 *
 * 只动 clip-path，不触发布局；无粒子、无彩带、无闪光。
 * reduced-motion 下整个不渲染，直接落位。
 */

// 三段时基（毫秒）。中间那段是"满版"的节拍，也是走位的时候。
// 相位比例（40% / 55.7%）由这三个数决定，改完要同步 index.css 的关键帧位置。
const COVER_MS = 560
const HOLD_MS = 220
const CLEAR_MS = 620
const TOTAL_MS = COVER_MS + HOLD_MS + CLEAR_MS

// 盖满的余量。注意别开大：收回开头从 --r 收到"刚好盖满"的半径之间，
// 覆盖率是**恒为 1** 的纯浪费（旧版 6% 余量 = 开头 73px 空转），会白白吃掉收缩时间。
const COVER_SLACK = 1.02

// 页面走位：满版之后起步，比墨洗收干净晚一点停下 ——
// 这样最后一段"停稳"是看得见的，到达是滑进来的，不是弹出来的。
const TRAVEL_AT_MS = COVER_MS + HOLD_MS / 2
const TRAVEL_MS = 820

// 落点让开吸顶导航的高度（与 SmoothScroll 的锚点 offset 保持一致）
const TRAVEL_OFFSET = 80

export default function InkBloom({ bloomToken = 0, onSettled }) {
  const reduce = useReducedMotion()
  const [running, setRunning] = useState(false)
  // 圆心：取 hero 橙圆的实时中心（含视差位移），拿不到就退回视口中心
  const [origin, setOrigin] = useState(null)

  // onSettled 是父组件里的内联箭头函数，每次渲染身份都变。
  // 放进依赖数组会让转场被父组件的任意重渲染打断、从头重播，
  // 所以用 ref 拿最新值，依赖里只留真正决定"要不要播"的两项。
  const settledRef = useRef(onSettled)
  useEffect(() => {
    settledRef.current = onSettled
  })

  useEffect(() => {
    if (!bloomToken) return

    const about = document.getElementById('about')
    const targetTop = () =>
      about
        ? Math.max(0, about.getBoundingClientRect().top + window.scrollY - TRAVEL_OFFSET)
        : 0

    // 平滑走位，而不是瞬移：瞬移会让目的地凭空出现，那正是"突兀"的一半。
    // 必须走 Lenis 的接口 —— 直接 window.scrollTo 会被它下一帧的 raf 覆写回去。
    const travel = () => {
      if (!about) return
      const top = targetTop()
      const lenis = getLenis()
      if (lenis) {
        lenis.scrollTo(top, {
          duration: TRAVEL_MS / 1000,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        })
      } else {
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }

    if (reduce) {
      // 降级：不做墨洗、不做走位，直接落位
      const top = targetTop()
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(top, { immediate: true })
      else window.scrollTo(0, top)
      settledRef.current?.()
      return
    }

    const el = document.querySelector('[data-bloom-origin]')
    const r = el?.getBoundingClientRect()
    const sized = r && r.width > 0
    const w = window.innerWidth
    const h = window.innerHeight
    const x = sized ? r.left + r.width / 2 : w / 2
    const y = sized ? r.top + r.height / 2 : h / 2
    // 盖满所需的最小半径 = 圆心到四个视口角的最远距离
    const far = Math.max(
      Math.hypot(x, y),
      Math.hypot(w - x, y),
      Math.hypot(x, h - y),
      Math.hypot(w - x, h - y)
    )
    setOrigin({ x, y, r: Math.ceil(far * COVER_SLACK) })
    setRunning(true)

    const tTravel = window.setTimeout(travel, TRAVEL_AT_MS)
    const tDone = window.setTimeout(() => {
      setRunning(false)
      settledRef.current?.()
    }, TOTAL_MS + 40)

    return () => {
      window.clearTimeout(tTravel)
      window.clearTimeout(tDone)
    }
  }, [bloomToken, reduce])

  if (reduce || !running) return null

  return createPortal(
    <div
      // 令牌做 key：连点两次也要各播一遍，而不是接着上一遍的进度走
      key={bloomToken}
      aria-hidden="true"
      className="ink-bloom"
      style={{
        '--bx': `${origin?.x ?? window.innerWidth / 2}px`,
        '--by': `${origin?.y ?? window.innerHeight / 2}px`,
        '--r': `${origin?.r ?? Math.hypot(window.innerWidth, window.innerHeight)}px`,
        '--bloom-dur': `${TOTAL_MS}ms`,
      }}
    />,
    document.body
  )
}
