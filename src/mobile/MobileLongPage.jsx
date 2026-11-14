/**
 * MobileLongPage.jsx —— 手机端长页（独立入口版）
 *
 * 完全是 App.jsx 里 .mob-* 四个区块的**搬移**，类名、层级、文案与数值都不变：
 *   SEC.02 项目指路 → SEC.03 个人经历（手风琴 + 规格格）→ SEC.04 个人优势 → SEC.05 联系
 * 唯一的差别：项目入口不再指向首访层列表，而是调 onOpenDeck 回到牌堆；
 * 原站里那套「滚回页面顶部找 #projects」的锚点行为在这里没有意义。
 */
import { useState } from 'react'
import { asset } from '../assetPath'
import {
  HERO_PLATE,
  EXPERIENCES,
  ABOUT_STATS,
  SPEC_GRID,
  STRENGTHS,
  CONTACT,
  PROJECTS_NOTE,
} from './mobileContent'

export default function MobileLongPage({ projects = [], onOpenProject, onOpenDeck }) {
  const [activeExp, setActiveExp] = useState(0)
  const [emailCopied, setEmailCopied] = useState(false)

  const findProject = (id) => projects.find((p) => String(p.id) === String(id)) || null

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email)
      setEmailCopied(true)
      window.setTimeout(() => setEmailCopied(false), 2000)
    } catch {
      setEmailCopied(false)
    }
  }

  return (
    <div className="mob-longpage">
      <div className="hero-mobile-plate">
        <span className="hero-mobile-name">{HERO_PLATE.en}</span>
        <span className="hero-mobile-meta">{HERO_PLATE.meta}</span>
      </div>

      {/* SEC.02 项目指路：原站这里是「一行指路 + 48px 跳转」，点它回牌堆 */}
      <section className="mob-projects" id="projects">
        <div className="mob-sechead">
          <span className="mob-kicker">{PROJECTS_NOTE.kicker}</span>
          <h2 className="mob-h1">{PROJECTS_NOTE.title}</h2>
          <p className="mob-lede">{PROJECTS_NOTE.lede}</p>
        </div>
        <button type="button" className="mob-jump" onClick={onOpenDeck}>
          {PROJECTS_NOTE.jump}
        </button>
      </section>

      {/* SEC.03 个人经历 */}
      <section className="mob-about" id="about">
        <div className="mob-sechead">
          <span className="mob-kicker">SEC. 03 · PERSONAL FILE</span>
          <h2 className="mob-h1">个人经历</h2>
          <div className="mob-stats">
            {ABOUT_STATS.map((s) => (
              <span key={s.l}><b>{s.v}</b><i>{s.l}</i></span>
            ))}
          </div>
        </div>

        <div className="mob-exp-list">
          {EXPERIENCES.map((exp, idx) => {
            const isActive = idx === activeExp
            const related = exp.projectId ? findProject(exp.projectId) : null
            return (
              <div key={exp.company + exp.date} className={`mob-exp ${isActive ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="mob-exp-row"
                  aria-expanded={isActive}
                  onClick={() => setActiveExp(isActive ? null : idx)}
                >
                  <span className="mob-mono">{exp.date}</span>
                  <span className="mob-exp-name">{exp.company}</span>
                  <span className="mob-chip">{exp.title}</span>
                  <span className="mob-caret" aria-hidden="true">{isActive ? '−' : '+'}</span>
                </button>
                {isActive && (
                  <div className="mob-exp-body">
                    {exp.items.map((item, i) => (
                      <p key={i} className="mob-li">{item}</p>
                    ))}
                    {related && (
                      <button type="button" className="mob-cta" onClick={() => onOpenProject?.(related)}>
                        <span>{related.id} · {related.title}</span>
                        <span aria-hidden="true">↗</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <dl className="mob-specgrid">
          {SPEC_GRID.map((row) => (
            <div key={row.k} className="mob-spec">
              <dt>{row.k}</dt>
              <dd>{row.v}</dd>
              <dd>{row.s}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* SEC.04 个人优势 */}
      <section className="mob-strengths" id="strengths">
        <div className="mob-sechead">
          <span className="mob-kicker">SEC. 04 · CAPABILITY</span>
          <h2 className="mob-h1">个人优势</h2>
        </div>
        <div className="mob-matrix">
          {STRENGTHS.map((c) => (
            <div key={c.n} className="mob-cell">
              <b>{c.n}</b>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEC.05 联系 */}
      <section className="mob-contact" id="contact">
        <div className="mob-sechead">
          <span className="mob-kicker mob-kicker--light">{CONTACT.kicker}</span>
          <h2 className="mob-h1 mob-h1--light">{CONTACT.title}</h2>
          <p className="mob-lede mob-lede--light">{CONTACT.lede}</p>
        </div>
        <div className="mob-actions">
          <button type="button" className="mob-act" onClick={copyEmail}>
            {emailCopied ? '已复制 ✓' : `复制邮箱 ${CONTACT.email}`}
          </button>
          <a className="mob-act mob-act--ghost" href={asset(CONTACT.resume)} download="个人简历.wps">下载简历</a>
          <a className="mob-act mob-act--ghost" href={`tel:${CONTACT.phone}`}>打电话 {CONTACT.phone}</a>
        </div>
        <div className="mob-meta">
          {CONTACT.meta.map((m) => <span key={m}>{m}</span>)}
        </div>
      </section>
    </div>
  )
}
