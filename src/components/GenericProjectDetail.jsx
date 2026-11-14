import { useEffect } from 'react'
import DetailFold from './DetailFold'
import './GenericProjectDetail.css'

const FONT = "'Inter','Noto Sans SC',sans-serif"

/**
 * 通用项目详情页 —— 给「没有写 Bento 版 CONFIG」的项目用（目前是 05 UI 界面流程设计）。
 *
 * 为什么需要它：ProjectDetailPage 原本对未知 id 是 `CONFIG[project.id] || CONFIG['01']`，
 * 静默回退到 01 的配置 —— 于是点开 05《UI界面流程设计》看到的是《心景》疗愈灯具的
 * 标题、文案与图片（内容错位，用户可见）。
 *
 * 这里只渲染项目自己的真实字段（gallery / details / specs / chartData）：
 * 字段缺失就整块不渲染，绝不拿别的项目的内容顶上。
 * 段落走 DetailFold —— 手机端（≤1023px）默认折起，桌面端展开，与其它详情页同一套规则。
 */
const DETAIL_KEYS = [
  ['overview', '项目概览'],
  ['targetUsers', '目标人群'],
  ['concept', '设计概念'],
  ['interaction', '交互设计'],
  ['cmf', 'CMF 与视觉'],
]

export default function GenericProjectDetail({ project, onClose }) {
  const gallery = project?.gallery || []
  const details = project?.details || {}
  const specs = project?.specs || []
  const chart = project?.chartData || {}
  const bars = chart.bars || []
  const donut = chart.donut || []
  const radar = chart.radar

  // 与其它详情页一致：锁住背景页滚动。Lenis 的 data-lenis-prevent 由外层容器给出。
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const hasChart = bars.length > 0 || donut.length > 0 || !!radar || specs.length > 0

  return (
    <div
      data-lenis-prevent
      className="gp-root"
      style={{ fontFamily: FONT }}
      aria-label={`${project?.title || '项目'} 详情`}
    >
      <div className="gp-wrap">
        <header className="gp-hero">
          <p className="gp-kicker">
            PROJECT {project?.id}
            {project?.category ? ` / ${project.category}` : ''}
          </p>
          <h1 className="gp-title">{project?.title}</h1>
          {project?.subtitle ? <p className="gp-sub">{project.subtitle}</p> : null}
          {project?.desc ? <p className="gp-lead">{project.desc}</p> : null}
        </header>

        {gallery.length > 0 && (
          <section id="b-features" className="gp-sec">
            <h2 className="gp-h2">
              界面成品<i className="gp-count">{gallery.length}</i>
            </h2>
            <div className="gp-gallery">
              {gallery.map((g, i) => (
                <figure key={g.src || i} className="gp-shot">
                  <img
                    src={g.src}
                    alt={g.alt || ''}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  {g.alt ? <figcaption>{g.alt}</figcaption> : null}
                </figure>
              ))}
            </div>
          </section>
        )}

        <section id="b-users" className="gp-sec">
          <h2 className="gp-h2">项目推导</h2>
          {DETAIL_KEYS.filter(([k]) => details[k]).map(([k, label]) => (
            <DetailFold key={k} title={label}>
              <p className="gp-body">{details[k]}</p>
            </DetailFold>
          ))}
          {DETAIL_KEYS.every(([k]) => !details[k]) ? (
            <p className="gp-body">该项目暂无分节推导文案。</p>
          ) : null}
        </section>

        {hasChart && (
          <section id="b-material" className="gp-sec">
            <h2 className="gp-h2">设计与评估</h2>

            {radar?.labels?.length ? (
              <ul className="gp-bars">
                {radar.labels.map((l, i) => {
                  const v = radar.values?.[i] ?? 0
                  return (
                    <li key={l}>
                      <span className="gp-bl">{l}</span>
                      <span className="gp-bt">
                        <i style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                      </span>
                      <span className="gp-bv">{v}</span>
                    </li>
                  )
                })}
              </ul>
            ) : null}

            {bars.length > 0 ? (
              <ul className="gp-bars gp-bars--sub">
                {bars.map((b) => (
                  <li key={b.label}>
                    <span className="gp-bl">{b.label}</span>
                    <span className="gp-bt">
                      <i style={{ width: `${Math.max(0, Math.min(100, b.value))}%` }} />
                    </span>
                    <span className="gp-bv">{b.value}%</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {donut.length > 0 ? (
              <ul className="gp-legend">
                {donut.map((d) => (
                  <li key={d.label}>
                    <i style={{ backgroundColor: d.color }} />
                    <span>{d.label}</span>
                    <b>{d.value}%</b>
                  </li>
                ))}
              </ul>
            ) : null}

            {specs.length > 0 ? (
              <dl className="gp-specs">
                {specs.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        )}

        <footer className="gp-foot">
          <button type="button" className="gp-back" onClick={onClose}>
            返回作品集 →
          </button>
        </footer>
      </div>
    </div>
  )
}
