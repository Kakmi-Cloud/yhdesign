import { useEffect, useRef } from 'react'

/**
 * DetailFold —— 手机端（≤1023px）把详情页「完整图集 / 推演 / 方案」段落折成一张可展开的卡片。
 *
 * - 桌面端（>1023px）：summary 条被 CSS 隐藏，全展开。
 * - 手机端：2026-xx 改判 —— 默认展开（用户：「以内容为主，不要把内容藏起来」），
 *   仍可手动收起；`open` 只在挂载时置一次，用户之后的切换不会被 React 复位。
 */
export default function DetailFold({ title, meta, children, id, anchorRef }) {
  const localRef = useRef(null)

  useEffect(() => {
    if (localRef.current) localRef.current.open = true
  }, [])

  const attach = (el) => {
    localRef.current = el
    if (typeof anchorRef === 'function') anchorRef(el)
    else if (anchorRef && typeof anchorRef === 'object') anchorRef.current = el
  }

  return (
    <details className="detail-fold" id={id} ref={attach}>
      <summary className="detail-fold-summary">
        <div className="detail-fold-copy">
          <b>{title}</b>
          {meta ? <em>{meta}</em> : null}
        </div>
        <span aria-hidden="true">＋</span>
      </summary>
      {children}
    </details>
  )
}
