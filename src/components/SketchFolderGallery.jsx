import { useEffect, useState } from 'react'
import './SketchFolderGallery.css'

const ACCENT = '#E67E33'

/**
 * V2：文件夹 + 图纸带
 * folders: [{ tag, sub }]            —— 文件夹系列（tag 支持 "FIG.10 / 方阵"）
 * papers:  [{ src, tag, sub, num, folder }]  —— 图纸带卡片；folder 可选，
 *           存在时表示该卡属于第 folder 个文件夹（0 起），点击文件夹即切换。
 */
const SketchFolderGallery = ({ folders = [], papers = [], wide = null, accent = ACCENT }) => {
  // 默认不打开任何文件夹：点击文件夹才会放大提示并展开其图纸带
  const [active, setActive] = useState(-1)
  const [zoom, setZoom] = useState(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setZoom(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!folders.length) return null

  // 如果 papers 每项带 folder 字段（0/1/2），则按当前文件夹过滤；否则全显
  const hasMapping = papers.some((p) => typeof p.folder === 'number')
  const visiblePapers =
    active >= 0 && hasMapping ? papers.filter((p) => p.folder === active) : hasMapping ? [] : papers

  const splitTag = (t) => {
    const parts = String(t || '').split(' / ')
    return { fig: parts.length > 1 ? parts[0] : '', name: parts[parts.length - 1] }
  }

  return (
    <div className="sfg" style={{ '--accent': accent }}>
      {/* 文件夹行 */}
      <div className="sfg-folders" role="tablist" aria-label="草图系列文件夹">
        {folders.map((f, i) => {
          const isActive = i === active
          const { fig } = splitTag(f.tag)
          const name = f.name || splitTag(f.tag).name
          return (
            <button
              key={f.tag}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="sfg-strip"
              className={`sfg-folder${isActive ? ' is-active' : ''}`}
              onClick={() => setActive((prev) => (prev === i ? -1 : i))}
            >
              <span className="sfg-folder__inner">
                <span className="sfg-folder__tab" />
                <span className="sfg-folder__back" />
                <span className="sfg-folder__papers">
                  <span className="sfg-folder__paper p1" />
                  <span className="sfg-folder__paper p2" />
                  <span className="sfg-folder__paper p3" />
                </span>
                <span className="sfg-folder__front" />
              </span>
              <span className="sfg-folder__label">
                <span className="sfg-folder__name">{name}</span>
                <span className="sfg-folder__fig">{fig}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* 图纸带 */}
      <div id="sfg-strip" role="tabpanel" className="sfg-strip">
        {active < 0 ? (
          <p className="sfg-hint sfg-hint--guide">点击上方文件夹 · 打开对应系列的设计图纸</p>
        ) : visiblePapers.length ? (
          <div className={`sfg-papers${visiblePapers.length === 1 ? ' sfg-papers--single' : ''}`}>
            {visiblePapers.map((p, i) => (
              <button
                key={`${p.tag}-${p.num ?? i}`}
                type="button"
                className="sfg-paper"
                style={{ animationDelay: `${i * 55}ms` }}
                onClick={() => setZoom(p)}
                aria-label={`放大查看 ${p.tag}`}
              >
                <span className="sfg-paper__card">
                  <span className="sfg-paper__imgwrap">
                    {p.src ? (
                      <img src={p.src} alt={p.sub || p.tag} loading="lazy" decoding="async" />
                    ) : (
                      <span className="sfg-paper__empty">NO IMAGE</span>
                    )}
                    <span className="sfg-paper__zoomtag">↗ 查看大图</span>
                  </span>
                  <span className="sfg-paper__body">
                    <span className="sfg-paper__num">
                      {String(p.num ?? i + 1).padStart(2, '0')}
                    </span>
                    <span className="sfg-paper__text">
                      <span className="sfg-paper__title">{p.sub || p.tag}</span>
                      <span className="sfg-paper__tag">{p.tag}</span>
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="sfg-hint">此文件夹暂无图纸</p>
        )}
        <p className="sfg-hint">点击文件夹切换系列 · 点击图纸放大查看 · Esc 关闭</p>
      </div>

      {/* 放大查看 */}
      {zoom && (
        <div className="sfg-zoom" role="dialog" aria-modal="true" onClick={() => setZoom(null)}>
          <div className="sfg-zoom__box" onClick={(e) => e.stopPropagation()}>
            {zoom.src ? <img src={zoom.src} alt={zoom.tag} /> : <span className="sfg-zoom__empty">NO IMAGE</span>}
            <div className="sfg-zoom__cap">
              <span className="sfg-zoom__num">{String(zoom.num ?? '').padStart(2, '0')}</span>
              <span className="sfg-zoom__title">{zoom.sub || zoom.tag}</span>
              <span className="sfg-zoom__tag">{zoom.tag}</span>
            </div>
            <button type="button" className="sfg-zoom__close" onClick={() => setZoom(null)} aria-label="关闭">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SketchFolderGallery
