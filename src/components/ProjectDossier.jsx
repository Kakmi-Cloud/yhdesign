/**
 * ProjectDossier —— 统一的「项目文件」排版
 *
 * 所有 8 个项目共用这一套版式与呈现顺序，避免此前 6 套详情页各自为政：
 *   档案头 → 产品主视觉 → 可实现功能 → 调研依据 → 设计推导 →
 *   规格与材料 → 进展与落地 → 图像档案 → 资料来源与说明 → 项目索引
 *
 * 与旧详情页的差别（对应评审报告的修改意见）：
 *   · 删掉没有真实来源的雷达图 / 进度条 / 环形占比 / 贴纸 / 粒子等装饰元素；
 *     换成有出处的调研数据、图纸参数、功能清单与落地记录。
 *   · 首屏就能看到产品大图（旧版桌面详情首屏 808px 内无产品图）。
 *   · 顶栏不透明且跟随项目主题，只有一处返回入口；不再叠第二层吸顶条。
 *   · 正文统一字号层级，只有一个 h1，章节用 h2 / h3，不再出现多个 H1。
 *   · 提供项目索引，可在档案之间直接切换，不用退回首页。
 *
 * 数据：App.jsx 原有 title / subtitle / desc / details / specs / gallery 原样保留，
 *       projectDossiers.js 只补充进展、功能、调研、来源与主题色。
 */
import { useEffect, useMemo, useRef } from 'react'
import { DETAIL_SECTIONS, GLOBAL_NOTE, getDossier } from '../data/projectDossiers'
import './projectDossier.css'

export default function ProjectDossier({ project, allProjects = [], onClose, onSelect }) {
  const dossier = getDossier(project?.id)
  const rootRef = useRef(null)

  // 切换项目时把档案滚回顶部。onSelect 只换内容、不新增历史栈。
  useEffect(() => {
    if (rootRef.current) rootRef.current.scrollTop = 0
  }, [project?.id])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const gallery = useMemo(() => {
    const seen = new Set()
    return [...(project?.gallery || []), ...(dossier?.extraGallery || [])]
      .filter((g) => {
        if (!g || !g.src || seen.has(g.src)) return false
        seen.add(g.src)
        return true
      })
      .slice(0, 9)
  }, [project, dossier])

  // 没有资料就不渲染内容，绝不静默拿别的项目顶上。
  if (!project || !dossier) return null

  const t = dossier.theme
  const details = project.details || {}
  const specs = project.specs || []
  const hasDetails = DETAIL_SECTIONS.some(([k]) => details[k])
  const vars = {
    '--pf-paper': t.paper,
    '--pf-ink': t.ink,
    '--pf-accent': t.accent,
    '--pf-line': t.dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)',
    '--pf-soft': t.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.045)',
    '--pf-dim': t.dark ? 'rgba(255,255,255,0.68)' : 'rgba(0,0,0,0.62)',
  }

  const jump = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      ref={rootRef}
      className={`pf-root${t.dark ? ' pf-root--dark' : ''}`}
      style={vars}
      data-lenis-prevent
      role="region"
      aria-label={`${project.title} · 项目文件`}
    >
      <header className="pf-bar">
        <button type="button" className="pf-back" onClick={onClose} aria-label="返回作品集">
          <span aria-hidden="true">←</span> 返回作品集
        </button>
        <span className="pf-bar-id">
          YH. <i>/</i> PROJECT FILE {project.id}
        </span>
        <nav className="pf-jumps" aria-label="章节导航">
          <button type="button" onClick={() => jump('pf-functions')}>功能</button>
          <button type="button" onClick={() => jump('pf-research')}>调研</button>
          <button type="button" onClick={() => jump('pf-build')}>进展</button>
          <button type="button" onClick={() => jump('pf-gallery')}>图集</button>
        </nav>
      </header>

      <main className="pf-main">
        {/* 01 · 档案头 + 产品主视觉（首屏必须有产品） */}
        <section className="pf-cover" id="pf-top">
          <div className="pf-cover-head">
            <p className="pf-kicker">
              PROJECT FILE <i>/</i> {project.id} <i>/</i> {project.category}
            </p>
            <h1 className="pf-title">{project.title}</h1>
            {project.subtitle ? <p className="pf-sub">{project.subtitle}</p> : null}
            <div className="pf-badges">
              <span className={`pf-badge pf-badge--${dossier.tone}`}>{dossier.badge}</span>
              <span className="pf-origin">{dossier.origin}</span>
            </div>
            <p className="pf-oneliner">{dossier.oneLiner}</p>
          </div>

          <div className="pf-cover-visual">
            <span className="pf-ghost-no" aria-hidden="true">{project.id}</span>
            <figure className="pf-hero-figure">
              <img src={dossier.hero.src} alt={dossier.hero.alt} style={{ objectFit: dossier.hero.fit }} />
              <figcaption>FIG. 01 <i>/</i> 产品主视觉</figcaption>
            </figure>
            {gallery[1] ? (
              <figure className="pf-mini-figure">
                <img src={gallery[1].src} alt={gallery[1].alt || ''} loading="lazy" />
              </figure>
            ) : null}
            <span className="pf-hero-stamp" aria-hidden="true">PRODUCT FIRST</span>
          </div>

          {/* 说明与进展：桌面排在左栏下方，手机排在主图下方 —— 让产品先出现。 */}
          <div className="pf-cover-meta">
            {project.desc ? <p className="pf-desc">{project.desc}</p> : null}
            <p className="pf-status-note">
              <b>进展</b>
              {dossier.status.note}
            </p>
          </div>
        </section>

        {/* 02 · 可实现功能 */}
        {dossier.functions?.length ? (
          <section className="pf-sec" id="pf-functions">
            <div className="pf-sec-head">
              <span className="pf-sec-no">01</span>
              <h2>可实现功能</h2>
              <p>功能描述以现有设计资料为准；作品集内所有项目所述功能均可实现。</p>
            </div>
            <ol className="pf-fn-list">
              {dossier.functions.map((f) => (
                <li className="pf-fn" key={f.n}>
                  <span className="pf-fn-no">{f.n}</span>
                  <div className="pf-fn-body">
                    <h3>{f.t}</h3>
                    <p>{f.b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* 03 · 调研依据 */}
        <section className="pf-sec" id="pf-research">
          <div className="pf-sec-head">
            <span className="pf-sec-no">02</span>
            <h2>调研依据</h2>
            <p>{dossier.research.metrics.length ? '数据按原始资料转录，未重新计算或推断。' : '本项目未附独立调研数据，此处只说明资料范围。'}</p>
          </div>
          {dossier.research.metrics.length ? (
            <div className="pf-metrics">
              {dossier.research.metrics.map((m, i) => (
                <div className={`pf-metric${i === 0 ? ' pf-metric--lead' : ''}`} key={m.l}>
                  <b>{m.v}</b>
                  <span>{m.l}</span>
                  {m.n ? <small>{m.n}</small> : null}
                </div>
              ))}
            </div>
          ) : null}
          <ul className="pf-findings">
            {dossier.research.findings.map((text, i) => (
              <li key={i}>
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <p>{text}</p>
              </li>
            ))}
          </ul>
          <p className="pf-source">资料来源：{dossier.research.source}</p>
          <p className="pf-caveat">口径说明：{dossier.research.caveat}</p>
        </section>

        {/* 04 · 设计推导（统一文案层级与顺序） */}
        {hasDetails ? (
          <section className="pf-sec" id="pf-design">
            <div className="pf-sec-head">
              <span className="pf-sec-no">03</span>
              <h2>设计推导</h2>
              <p>五个项目沿用同一套层级：概览 → 人群 → 概念 → 交互 → CMF。</p>
            </div>
            <div className="pf-derive">
              {DETAIL_SECTIONS.filter(([k]) => details[k]).map(([k, label, no]) => (
                <article className="pf-derive-row" key={k}>
                  <span className="pf-derive-no">{no}</span>
                  <h3>{label}</h3>
                  <p>{details[k]}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {/* 05 · 规格与材料 */}
        {specs.length ? (
          <section className="pf-sec pf-sec--tight" id="pf-spec">
            <div className="pf-sec-head">
              <span className="pf-sec-no">04</span>
              <h2>规格与材料</h2>
              <p>沿用项目原有参数表述，不补写未确认的数值。</p>
            </div>
            <dl className="pf-specs">
              {specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* 06 · 进展与落地 */}
        <section className="pf-sec" id="pf-build">
          <div className="pf-sec-head">
            <span className="pf-sec-no">05</span>
            <h2>进展与落地</h2>
            <p>只写已确认的成果；未获资料确认的形态、参数与结果不作推断。</p>
          </div>
          <p className="pf-build-headline">{dossier.build.headline}</p>
          <ol className="pf-stages">
            {dossier.build.stages.map((s, i) => (
              <li key={s} className={i === dossier.build.stages.length - 1 ? 'is-last' : ''}>
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {s}
              </li>
            ))}
          </ol>
          <div className="pf-build-copy">
            <p>{dossier.build.note}</p>
            <p className="pf-confirmed">
              <b>已确认成果</b>
              {dossier.build.confirmed}
            </p>
          </div>
        </section>

        {/* 07 · 图像档案（杂志式拼贴，不做等距网格） */}
        {gallery.length ? (
          <section className="pf-sec pf-sec--wide" id="pf-gallery">
            <div className="pf-sec-head">
              <span className="pf-sec-no">06</span>
              <h2>图像档案</h2>
              <p>产品、细节、场景与过程图；按项目原有素材排布。</p>
            </div>
            <div className="pf-collage">
              {gallery.map((g, i) => (
                <figure className={`pf-shot pf-shot--${i % 5}`} key={g.src}>
                  <img src={g.src} alt={g.alt || `${project.title} 图 ${i + 1}`} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
                  {g.alt ? <figcaption>{String(i + 1).padStart(2, '0')} <i>/</i> {g.alt}</figcaption> : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {/* 08 · 资料来源与说明 */}
        <section className="pf-sec" id="pf-notes">
          <div className="pf-sec-head">
            <span className="pf-sec-no">07</span>
            <h2>资料来源与说明</h2>
            <p>用于核对本档案中哪些内容有出处、哪些属于稳妥表述。</p>
          </div>
          <ol className="pf-evidence">
            {dossier.evidence.map((e, i) => (
              <li key={i}>
                <span>{e.label}</span>
                <p>{e.text}</p>
              </li>
            ))}
          </ol>
          <div className="pf-global">
            <p><b>功能可行性</b>{GLOBAL_NOTE.feasibility}</p>
            <p><b>表述口径</b>{GLOBAL_NOTE.caveat}</p>
            <p><b>本项目说明</b>{dossier.caveat}</p>
          </div>
        </section>

        {/* 项目索引 */}
        {allProjects.length ? (
          <nav className="pf-index" aria-label="项目索引">
            <p className="pf-index-title">PROJECT INDEX <i>/</i> 8 份项目文件</p>
            <ul>
              {allProjects.map((p) => {
                const d = getDossier(p.id)
                const active = p.id === project.id
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={active ? 'is-active' : ''}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => (active ? jump('pf-top') : onSelect?.(p))}
                    >
                      <span className="pf-index-no">{p.id}</span>
                      <span className="pf-index-name">{p.title}</span>
                      <span className="pf-index-status">{d ? d.badge : '设计资料'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : null}

        <footer className="pf-foot">
          <span>YANG HONG <i>/</i> PRODUCT DESIGN PORTFOLIO</span>
          <button type="button" onClick={onClose}>返回作品集 <span aria-hidden="true">→</span></button>
        </footer>
      </main>
    </div>
  )
}
