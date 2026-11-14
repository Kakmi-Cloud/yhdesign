import { useEffect, useState } from 'react'

/**
 * useMediaQuery —— 订阅一条媒体查询
 *
 * 为什么需要它：手机端那套全屏项目卡组（MobileProjectDeck）是用
 * `md:hidden` 藏起来的，但**藏起来不等于不加载** ——
 * `display:none` 里的 `<img>` 浏览器照样会去下载。
 * 桌面端因此白拉了 7 张项目封面图（优化前约 7.7MB），
 * 而且这些图在桌面端从头到尾一次都不会显示。
 *
 * 所以在"渲染"这一层就按视口把关：窄屏才挂载卡组，
 * 宽屏根本不进 DOM，图片请求自然也就不存在。
 *
 * 首帧取同步值（而不是先 false 再异步翻），避免窄屏上出现
 * 「卡组晚一拍才出现」的闪烁。resize / 转屏时用监听器跟上。
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    // 同步一次：初始化与 effect 之间视口可能已经变了
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

// 与 Tailwind 的 md 断点对齐（md = min-width 768px），
// 所以这里「手机」= max-width 767px，和 MobileProjectDeck 内部的 md:hidden 完全一致。
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')

export default useMediaQuery
