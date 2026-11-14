import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * ShuffleLabel —— 技术标注的洗牌揭示
 *
 * 机制来自 ReactBits 的 <Shuffle/>：每个字符外面套一个 overflow:hidden
 * 的窗口，窗口里是一条竖直条带，条带滚动时字符就一个接一个地过 ——
 * 原版是 GSAP 逐字建 DOM + ScrollTrigger 触发 + 收尾 cleanupToStill()
 * 把条带还原成真实字符。
 *
 * 这里改成**声明式的同一机制**，原因有三个，都是工程上的：
 *   1. 它只服务 9-11px 的 mono 标注，而原版是为 4rem 的大字调的参数
 *      （Press Start 2P、上下都留 padding、还要用 canvas.measureText
 *      量字体上下缘）。这套度量在小字号上是纯负担。
 *   2. 原版要改写 DOM 再还原，在 React 里是持续的隐患
 *      （StrictMode 双跑、卸载残留、父组件重渲染把 span 冲掉）。
 *      声明式版本没有这些状态。
 *   3. 两端各放一个真实字符 —— 静止时和动画结束时都是**正确的文本**，
 *      中间才是乱码滚过。原版需要显式 cleanup 才能保证这一点，
 *      这里由结构直接保证。
 *
 * 细节：只有 ASCII 字母数字参与洗牌。中文（"点击提起卡片"这类）
 * 保持原样 —— 用拉丁字母去"洗"汉字不仅不好看，还会读不出来。
 *
 * 随机是**确定性**的（由字符码位与下标推导），所以 React 每次重渲染
 * 都是同一串字形，不会闪。
 *
 * ── 懒构建（性能）──
 * 每个字符要 1 个裁切窗口 + 1 条 (rolls+2) 格的条带，一个 "SYS_REF // 06"
 * 就是 12 字符 × 5 格 ≈ 60 个 span。而它在卡面上是**成对出现**的，
 * 8 张卡就是 16 处 —— 首屏实测整页有整整 1000 个 .mo-shuffle-cell，
 * 占全页 DOM 的 41%，其中绝大多数永远等不到那次 hover（侧卡 opacity 为 0，
 * 根本碰不到）。这些节点不参与动画，但每次样式重算与命中测试都要扫过它们。
 *
 * 所以改成"首次悬停才构建"：未悬停时每个字符只渲染 1 格真字（结构和动画态
 * 完全同宽同高，布局不跳），指针进入本标签的那一刻才挂上条带并起播。
 *
 * 挂上条带后必须**让出一帧**再翻转位移：同一帧内"新增元素 + 改样式"浏览器
 * 不会补间（没有上一帧的样式可比），直接翻会静默跳过动画。
 * 所以用两层 rAF 保证中间至少绘制过一帧静止态。
 */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/·*'

const scrambleable = (ch) => /[A-Za-z0-9]/.test(ch)

const glyphFor = (ch, i, k) =>
  GLYPHS[(ch.codePointAt(0) * 7 + i * 13 + k * 29) % GLYPHS.length]

export default function ShuffleLabel({
  children,
  rolls = 3,
  stagger = 0.028,
  duration = 0.44,
  backDuration = 0.24,
  className = '',
  as: Tag = 'span',
  ...rest
}) {
  // armed：是否已经构建过条带（一旦构建就长期保留，第二次悬停不再重建）
  const [armed, setArmed] = useState(false)
  const [on, setOn] = useState(false)
  const rafRef = useRef(0)

  // 卸载时清掉未执行的两层 rAF，避免在已卸载组件上 setState
  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const enter = useCallback(() => {
    if (armed) {
      setOn(true)
      return
    }
    setArmed(true)
    // 两层 rAF：第一层等条带挂上，第二层等它被绘制过一次，再翻位移
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setOn(true))
    })
  }, [armed])

  const leave = useCallback(() => setOn(false), [])

  const text = String(children ?? '')
  if (!text) return null

  return (
    <Tag
      className={`mo-shuffle ${className}`}
      onPointerEnter={enter}
      onPointerLeave={leave}
      // 键盘/读屏器用户不该因为看不到动画就读到乱码：
      // 洗牌层整体对辅助技术隐藏，原件由 aria-label 承担
      aria-label={text}
      {...rest}
    >
      {Array.from(text).map((ch, i) => {
        if (!scrambleable(ch)) {
          // 空格必须换成不换行空格：这里的每一段都是一个 flex item，
          // 而"只含空白的 flex item"会被折叠成 0 宽 ——
          // 直接用 ' ' 会让 "SYS_REF // 01" 变成 "SYS_REF//01"。
          return (
            <span key={`p${i}`} aria-hidden="true">
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          )
        }
        // 未 armed：单格真字。与动画态同宽同高，不会引起卡面文字跳动。
        if (!armed) {
          return (
            <span key={`c${i}`} className="mo-shuffle-char" aria-hidden="true">
              <span className="mo-shuffle-cell">{ch}</span>
            </span>
          )
        }
        const cells = Array.from({ length: rolls }, (_, k) => glyphFor(ch, i, k))
        return (
          <span key={`c${i}`} className="mo-shuffle-char" aria-hidden="true">
            {/* 这里**不写** will-change。
                这条标注是 9–11px 的微型字，全页散布着十几处、每处几个字，
                一个 "SYS_REF // 01" 就是 12 个窗口 —— 实测下来整页有 175 个
                逐字 span 挂着常驻 will-change: transform，等于给每一个小字
                都单独申请了一块合成层，而它们只在指针悬停时才动一次。
                合成的代价（显存 + 每帧层管理）远大于它换来的那点收益；
                而 translateY 过渡本身就是合成器属性，浏览器会在过渡
                真正进行的那 0.44s 里自己提层，结束自动回收。 */}
            <span
              style={{
                display: 'block',
                transform: `translateY(${on ? -(rolls + 1) : 0}em)`,
                transition: `transform ${on ? duration : backDuration}s cubic-bezier(0.22, 1, 0.36, 1)`,
                transitionDelay: `${(i % 24) * stagger}s`,
              }}
            >
              {/* 首格与末格都是真实字符 —— 静止与结束都是正确文本 */}
              <span className="mo-shuffle-cell">{ch}</span>
              {cells.map((g, k) => (
                <span key={k} className="mo-shuffle-cell">
                  {g}
                </span>
              ))}
              <span className="mo-shuffle-cell">{ch}</span>
            </span>
          </span>
        )
      })}
    </Tag>
  )
}
