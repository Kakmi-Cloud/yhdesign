import { useEffect } from 'react'
import { subscribeIdle } from '../hooks/usePageIdle'

/**
 * OffscreenPause —— 让"永远在呼吸"的无限动画该停的时候停下来
 *
 * 这批动画是产品语言的一部分（页面在没人操作时仍然活着），不能删；
 * 但它们原先一挂上就永远在跑，等于合成器躺着也一直产帧。这里管两件事：
 *
 *   1. **离屏**：滚出视口 → animation-play-state: paused，滚回来接着呼吸
 *      （停的是动画时钟本身，不动任何静态样式，所以不会跳帧）。
 *   2. **长时间无人操作**：见 usePageIdle。可见但人走开了，也没必要继续呼吸。
 *
 * ── 为什么不再用类名清单 ──
 * 上一版是 `selector=".mo-breath, .mo-sweep, .mo-starborder-band"`。清单式
 * 有两个问题：新加一条无限动画（`.mo-lift` / `.animate-wobble` / `.acid-blob`…）
 * 很容易忘了补；而且详情页、AI 灯组这些**延后挂载**的子树在首次 querySelectorAll
 * 时还不存在，永远拿不到观察。
 *
 * 现在改成问浏览器要真相：`document.getAnimations()` 会把当前所有动画列出来，
 * 逐条看 timing.iterations 是不是 Infinity —— 是就说明"这条不会自己结束"，
 * 把它的宿主元素纳入观察。彻底不用维护清单，也不受挂载时机影响。
 *
 * 配套用一个 debounce 过的 MutationObserver 做补扫，覆盖后挂载的子树
 * （项目详情页 / 光箱）。只观察 childList+subtree，不看属性 —— React 改
 * class / style 会触发 attribute mutation，那些跟"有没有新动画"无关。
 *
 * 注意：它只管 **CSS 动画**。framer-motion 驱动的无限动画（如 ScrollCue 的
 * 浮动）是 JS 帧循环，不受 animation-play-state 影响，要在各自组件里判可见性。
 */
export default function OffscreenPause({ rootMargin = '200px 0px' } = {}) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    // 每个被观察元素的"在不在视口里"。undefined 视为在（保守：先让它跑，
    // IO 首次回调马上会给出真实值）。
    const inView = new Map()
    let idle = false

    const apply = (el) => {
      const on = inView.get(el) !== false && !idle
      el.style.animationPlayState = on ? 'running' : 'paused'
      // 顺带把常驻合成层交还：这些元素多半带 `will-change: transform`
      // （见 index.css 的 .mo-breath / .mo-lift）。停表了还占着层是纯浪费。
      // 用 '' 而不是某个具体值，恢复时交回 CSS 决定。
      el.style.willChange = on ? '' : 'auto'
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView.set(entry.target, entry.isIntersecting)
          apply(entry.target)
        }
      },
      { rootMargin }
    )

    const seen = new WeakSet()
    const scan = () => {
      if (typeof document.getAnimations !== 'function') return
      for (const anim of document.getAnimations()) {
        let timing
        try {
          timing = anim.effect?.getTiming?.()
        } catch {
          continue
        }
        // 只看不会自己结束的。有限动画（入场、进度条）跑完就没了，不用管。
        if (!timing || timing.iterations !== Infinity) continue
        const el = anim.effect?.target
        if (!el || el.nodeType !== 1 || seen.has(el)) continue
        seen.add(el)
        io.observe(el)
        apply(el)
      }
    }
    scan()

    // 补扫：覆盖延后挂载的子树。debounce 到 300ms —— 一次路由/展开只会扫一次。
    let scanTimer = 0
    const mo = new MutationObserver(() => {
      clearTimeout(scanTimer)
      scanTimer = setTimeout(scan, 300)
    })
    mo.observe(document.documentElement, { childList: true, subtree: true })

    const unsubscribe = subscribeIdle((v) => {
      idle = v
      for (const el of inView.keys()) apply(el)
    })

    return () => {
      clearTimeout(scanTimer)
      mo.disconnect()
      unsubscribe()
      io.disconnect()
      // 卸载时把行内状态清掉，别留下 paused 把动画永久冻住
      for (const el of inView.keys()) {
        el.style.animationPlayState = ''
        el.style.willChange = ''
      }
      inView.clear()
    }
  }, [rootMargin])

  return null
}
