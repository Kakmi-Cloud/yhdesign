import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * MobileProjectDeck —— 手机端的「精选项目」滑动卡组
 *
 * 桌面端那块 3D 悬浮轮盘（PortfolioCardStack）依赖鼠标视差与滚轮逐格推进，
 * 手指上没有对应输入，所以手机端换成本组件：一张卡占一屏，左右滑动切换。
 *
 * ── 为什么用 scroll-snap 而不是自研手势 ──
 * 横向 scroll-snap 是浏览器原生的：动量、边界回弹、可访问性（键盘/读屏）
 * 全都是免费的，而且在低端机上也不掉帧。自研 touch 手势要自己补惯性与
 * 边界处理，收益为负。
 *
 * 与 Lenis 的关系：Lenis 的 gestureOrientation 默认是 vertical，
 * 纯横向手势（deltaY === 0）会被它判为 unknown gesture 直接放行；
 * 触摸端 Lenis 默认 smoothWheel 只管滚轮、不管 touch。所以这里的横向
 * 滑动不需要 data-lenis-prevent，加了反而会把纵向滚动也一起交还给原生。
 *
 * overscroll-x-contain 是必须的：否则在 iOS 上从第一张往右滑会触发
 * 浏览器的「后退」手势，整页被带走。
 *
 * ── 引导性：为什么必须"露出下一张的一角" ──
 * 上一版是「一张卡占满整屏 + 角落一行 10px 小字」。实测下来几乎没人知道
 * 能滑 —— 屏幕被一张卡占满时，画面上没有任何"旁边还有东西"的证据，
 * 用户只会上下滚，然后离开。一行小字解决不了这个问题：它要求用户先读到
 * 字，再相信字，最后才尝试动作。
 *
 * 这一版给三个不同层级的信号，从强到弱，任意一个被触发，其余也会立刻
 * 变得可理解：
 *
 *   1. **露出下一张卡的一角**（卡宽 88%）。这是横向卡组最通用的语言：
 *      相邻卡片的边缘是"旁边还有内容"的物理证据，不需要读任何文字，
 *      也不需要用户相信什么 —— 它就在那里。
 *   2. **作品图顶部的橙色提示带**（仅第一张，首次滑动后自动收起）：
 *      "← 左右滑动切换 · 共 07 件作品 →"，把动作和总量一次说清。
 *      做成整条带而不是角落小字，因为它必须抢到第一眼；
 *      带子的配色跟随卡面反相，在纸白/墨黑/橙三种卡上都不会糊。
 *   3. **底部翻页按钮 + 全宽分段刻度**：不愿意滑的人可以直接点按钮；
 *      刻度条同时是"当前第几件 / 一共几件"的进度指示。
 *
 * 三种信号分别覆盖"看出来的""读出来的""点出来的"三类用户。
 *
 * 步进宽度用实测的卡宽而不是轨道宽：卡只占轨道 88%，用轨道宽当步进
 * 会让索引算偏、最后一张永远对不上（这是上一版踩过的坑，注释保留在下面）。
 */

const MONO = "'Oswald','Inter',sans-serif"
const SANS = "'Noto Sans SC','Inter',sans-serif"

// 与原手机端卡片一致的分色规则：03 用黑（实习灯具）、05 用橙（UI界面流程），其余白纸黑字。
const themeOf = (id) => {
  if (id === '03')
    return {
      bg: '#151515',
      text: '#FFFFFF',
      muted: 'rgba(255,255,255,0.72)',
      line: 'rgba(255,255,255,0.28)',
      dim: 'rgba(255,255,255,0.3)',
      border: '#151515',
    }
  if (id === '05')
    return {
      bg: '#E67E33',
      text: '#151515',
      muted: 'rgba(21,21,21,0.72)',
      line: 'rgba(21,21,21,0.28)',
      dim: 'rgba(21,21,21,0.26)',
      border: '#151515',
    }
  return {
    bg: '#FFFFFF',
    text: '#151515',
    muted: '#55544E',
    line: 'rgba(21,21,21,0.16)',
    dim: 'rgba(21,21,21,0.2)',
    border: '#151515',
  }
}

// 橙色卡面上的荧光橙会糊在一起，所以点缀色要按卡面反相取。
const accentOf = (t) => (t.bg === '#E67E33' ? '#151515' : '#E67E33')

export default function MobileProjectDeck({ projects = [], onSelectProject, meta = {} }) {
  const railRef = useRef(null)
  // 当前居中的卡片下标（驱动底部翻页按钮与刻度的可用状态）
  const [active, setActive] = useState(0)
  // 首次滑动后收起顶部提示带，避免一直占着版面
  const [hinted, setHinted] = useState(false)
  // 一张卡的步进宽度（缓存）。每帧 scroll 都去 getBoundingClientRect
  // 会强制同步布局，滚动时反而变卡；宽度只在 resize / 转屏时变，
  // 所以量在 resize 上，滚动路径里只读缓存。
  const stepRef = useRef(0)

  const measure = useCallback(() => {
    const el = railRef.current
    if (!el || !el.firstElementChild) return
    stepRef.current = el.firstElementChild.getBoundingClientRect().width || 0
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    // 字体加载完卡宽会变（标题换行高度、字号回退），量晚了索引会偏
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {})
    return () => window.removeEventListener('resize', measure)
  }, [measure, projects.length])

  const onScroll = useCallback(() => {
    const el = railRef.current
    if (!el) return
    // 兜底：首帧还没量到（或量完是 0）时补量一次
    if (!stepRef.current && el.firstElementChild) {
      stepRef.current = el.firstElementChild.getBoundingClientRect().width || 0
    }
    const step = stepRef.current
    if (step > 0) {
      const idx = Math.min(projects.length - 1, Math.max(0, Math.round(el.scrollLeft / step)))
      setActive((prev) => (prev === idx ? prev : idx))
    }
    if (!hinted && el.scrollLeft > 8) setHinted(true)
  }, [hinted, projects.length])

  const jump = (i) => {
    const el = railRef.current
    if (!el) return
    const total = projects.length
    const next = Math.min(total - 1, Math.max(0, i))
    setHinted(true)
    // 最后一张的 snap-start 落点会超出可滚范围，浏览器会夹到滚动末端 ——
    // 这里照常传理论落点，交回给 snap 处理，索引仍按实测宽度反推，不会偏。
    el.scrollTo({ left: next * (stepRef.current || el.clientWidth), behavior: 'smooth' })
  }

  if (!projects.length) return null

  const total = projects.length
  const pad = (n) => String(n).padStart(2, '0')

  return (
    // -mx-5 把卡组从 page-shell 的左右内边距里放出来，做真正的满屏；
    // 桌面端不渲染（md:hidden，另外 App.jsx 里按视口做了渲染层把关）。
    <div className="-mx-5 md:hidden">
      {/* 滑动轨道 */}
      <div
        ref={railRef}
        onScroll={onScroll}
        role="region"
        aria-roledescription="精选项目滑动卡组"
        aria-label={`精选项目，共 ${total} 件，左右滑动切换`}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {projects.map((p, i) => {
          const t = themeOf(p.id)
          const m = meta[p.id] || {}
          const tags = m.tags || []
          const accent = accentOf(t)
          // 橙色卡上提示带是墨底，字就得用橙；其余卡是橙底墨字
          const bandText = t.bg === '#E67E33' ? '#E67E33' : '#151515'
          const atFirst = active === 0
          const atLast = active === total - 1
          return (
            // 卡宽 86%：留出的 14% 减去左侧内边距，正好让下一张卡露出
            // 约 23–33px 的边缘（窄屏 320 上也有 23px，不会细到看不出）。
            // 宽度用百分比而不是 w-screen（100vw）—— 100vw 把经典滚动条的宽度
            // 也算进去，一旦两者不等，每张卡就比容器宽出十几像素，snap 落点
            // 会逐张偏移、最后一张永远对不齐。百分比天然自洽。
            <div key={p.id} className="w-[86%] shrink-0 snap-start pl-5">
              <article
                className="flex flex-col overflow-hidden border-2"
                style={{
                  height: '100svh',
                  minHeight: '520px',
                  backgroundColor: t.bg,
                  borderColor: t.border,
                  borderRadius: '24px',
                  boxShadow: t.bg === '#151515' ? '7px 7px 0 0 #E67E33' : '7px 7px 0 0 #151515',
                }}
              >
                {/* 顶部行：编号块 + 分类 + 外链方框 */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className=" px-2.5 py-1 text-[13px] font-black"
                      style={{
                        fontFamily: MONO,
                        backgroundColor: t.bg === '#151515' ? '#E67E33' : '#151515',
                        color: t.bg === '#151515' ? '#151515' : '#FFFFFF',
                        boxShadow: t.bg === '#151515' ? '2px 2px 0 0 #151515' : '2px 2px 0 0 #E67E33',
                      }}
                    >
                      {pad(i + 1)}
                    </div>
                    <span
                      className="border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
                      style={{ borderColor: t.line, color: t.muted, fontFamily: MONO }}
                    >
                      {p.category}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-black tabular-nums"
                    style={{ color: t.muted, fontFamily: MONO }}
                  >
                    {pad(i + 1)} / {pad(total)}
                  </span>
                </div>

                {/* 主图：吃掉剩余高度，文字块高度自适应 */}
                <div
                  className="relative mx-5 min-h-0 flex-1 overflow-hidden border-2"
                  style={{ borderColor: t.border }}
                >
                  <img
                    src={p.imagePortrait || p.image}
                    alt={p.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: p.imagePosition || '50% 50%',
                      // 带竖版专属图的卡（目前只有 08 猫冰）要在竖卡里整幅呈现：
                      // 它的横版主视觉是左右双状态，用 cover 塞进竖卡会被拦腰裁掉一半。
                      // 竖版图自带白底留白，卡面本身也是白纸，contain 留出的边与卡面同色，看不出接缝。
                      objectFit: p.imagePortrait ? 'contain' : undefined,
                    }}
                  />

                  {/* 提示带：整条压在图片顶部，抢第一眼。
                      只在第一张卡、且还没滑过时出现，滑过一次就收起。
                      文案刻意短（320 窄屏也不能换行，两行就变成一条胖带子）；
                      总数已经由右上「01 / 07」和底部「共 07 件作品」两处交代，
                      所以这里只说动作，把语气集中在"能滑"这一件事上。 */}
                  {!hinted && (
                    <span
                      className="absolute top-0 left-0 flex w-full items-center justify-center gap-2 py-2 text-[11px] font-black tracking-[0.14em] whitespace-nowrap"
                      style={{ backgroundColor: accent, color: bandText, fontFamily: MONO }}
                    >
                      <span className="animate-pulse">←</span>
                      左右滑动切换作品
                      <span className="animate-pulse">→</span>
                    </span>
                  )}

                  <span
                    className="absolute right-0 bottom-0 bg-[#E67E33] px-2.5 py-1 text-[10px] font-black tracking-widest text-[#151515]"
                    style={{ fontFamily: MONO }}
                  >
                    SYS_REF // {pad(i + 1)}
                  </span>
                </div>

                {/* 文本块 */}
                <div className="flex flex-col px-5 pt-4 pb-5">
                  <span className="mb-1.5 text-[11px] font-bold tracking-[0.16em]" style={{ color: t.muted, fontFamily: MONO }}>
                    {m.sub || p.category}
                  </span>
                  <h3 className="mb-2 text-[26px] leading-[1.15] font-black" style={{ color: t.text, fontFamily: SANS }}>
                    {p.title}
                  </h3>
                  <p className="mb-3 text-[13px] leading-[1.75] line-clamp-2" style={{ color: t.muted }}>
                    {p.desc}
                  </p>

                  {tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="border px-2.5 py-1 text-[10px] font-semibold"
                          style={{ borderColor: t.line, color: t.muted }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectProject?.(p)}
                    className="mt-auto inline-flex w-full cursor-pointer items-center justify-center gap-2 py-3.5 text-[13px] font-black transition-transform duration-150 active:translate-y-0.5"
                    style={{
                      backgroundColor: t.bg === '#E67E33' ? '#151515' : '#E67E33',
                      color: t.bg === '#E67E33' ? '#E67E33' : '#151515',
                      borderRadius: '999px',
                      boxShadow: '3px 3px 0 0 rgba(21,21,21,0.9)',
                    }}
                  >
                    查看完整项目详情
                    <span aria-hidden="true">→</span>
                  </button>

                  {/* 底部控制条：翻页按钮 + 总数 + 全宽分段刻度。
                      按钮给不想滑的人一条明路；刻度条同时是
                      "当前第几件 / 一共几件"的进度指示。 */}
                  <div className="mt-4 border-t pt-3.5" style={{ borderColor: t.line }}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="上一件作品"
                          disabled={atFirst}
                          onClick={() => jump(active - 1)}
                          className="flex h-9 w-9 items-center justify-center border-2 text-[14px] font-black transition-transform duration-150 active:translate-y-0.5"
                          style={{
                            fontFamily: MONO,
                            cursor: atFirst ? 'default' : 'pointer',
                            borderColor: atFirst ? t.line : '#151515',
                            color: atFirst ? t.dim : bandText,
                            backgroundColor: atFirst ? 'transparent' : accent,
                            boxShadow: atFirst ? 'none' : '2px 2px 0 0 #151515',
                          }}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          aria-label="下一件作品"
                          disabled={atLast}
                          onClick={() => jump(active + 1)}
                          className="flex h-9 w-9 items-center justify-center border-2 text-[14px] font-black transition-transform duration-150 active:translate-y-0.5"
                          style={{
                            fontFamily: MONO,
                            cursor: atLast ? 'default' : 'pointer',
                            borderColor: atLast ? t.line : '#151515',
                            color: atLast ? t.dim : bandText,
                            backgroundColor: atLast ? 'transparent' : accent,
                            boxShadow: atLast ? 'none' : '2px 2px 0 0 #151515',
                          }}
                        >
                          →
                        </button>
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.16em]"
                        style={{ fontFamily: MONO, color: t.muted }}
                      >
                        共 {pad(total)} 件作品
                      </span>
                    </div>

                    {/* 全宽分段刻度：7 段铺满整行，当前段点亮，每段可点直达 */}
                    <div className="flex items-center gap-1.5">
                      {projects.map((pp, j) => {
                        const on = j === i
                        return (
                          <button
                            key={pp.id}
                            type="button"
                            aria-label={`跳到第 ${j + 1} 件：${pp.title}`}
                            aria-current={on ? 'true' : undefined}
                            onClick={() => jump(j)}
                            className="flex h-5 flex-1 cursor-pointer items-center"
                          >
                            <span
                              className="block h-1.5 w-full transition-colors duration-200"
                              style={{ backgroundColor: on ? accent : t.dim }}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          )
        })}
        {/* 尾部占位：宽度正好等于"露出的一角"。没有它，最后一张卡的
            snap-start 落点会超出可滚范围，浏览器只好夹到滚动末端 ——
            末卡就会被推到右边、左侧凭空多出一块空白。补上这段之后，
            末卡的落点和其余卡完全一致（左侧 20px 内边距），右侧留白
            正好也是"下一张该出现的位置"，读起来是"到底了"而不是"卡住了"。
            它没有 scroll-snap-align，所以不会变成一个额外的吸附点。 */}
        <div aria-hidden="true" className="w-[14%] shrink-0" />
      </div>
    </div>
  )
}
