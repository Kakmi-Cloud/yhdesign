/**
 * P05 UI 界面流程 —— 页面结构是一条「服务路径」
 *
 * 素材依据：
 *  · ui-cos-1..4 / ui-gallery-1..4 均为 375×812 竖屏成品图，本页全部 contain 不裁切。
 *  · ui-gallery-5 为 320×1500 的租借流程长图，单独作为流程终点。
 *  · project-ui-3《UI 界面设计》是原多屏排版展板，只作资料索引，不铺满版面。
 * 核心装置：五个流程节点用连线串起，点节点切换对应竖屏与说明，路径本身即信息架构。
 */
import { useState } from 'react'
import { A, SectionHead, Zoomable, pad } from './shared'

const FLOW = [
  { n: '01', t: '首页聚合', img: '/ui-cos-3.webp', d: '搜索、热门展会、服务分类与推荐妆娘放在一屏内，减少跨页寻找。', tag: 'ENTRY' },
  { n: '02', t: '展会信息', img: '/ui-cos-2.webp', d: '详情页展示评分、接单次数与价格，配合展会数据降低决策成本。', tag: 'DETAIL' },
  { n: '03', t: '服务分类', img: '/ui-cos-1.webp', d: '妆娘服务、服装租赁等按分类收拢，卡片化信息便于快速扫读。', tag: 'CATEGORY' },
  { n: '04', t: '日程与数据', img: '/ui-cos-4.webp', d: '展会总数、今日参展人数与日程并列，快速判断参与时机。', tag: 'SCHEDULE' },
  { n: '05', t: '租借与预约', img: '/ui-gallery-5.webp', d: '购票、导航、分享与预约的闭环操作，覆盖从查看到下单。', tag: 'CHECKOUT' },
]

const HERO_SCREENS = [
  '/ui-cos-3.webp', '/ui-cos-2.webp', '/ui-cos-1.webp', '/ui-cos-4.webp', '/ui-gallery-2.webp',
]

export default function P05UiFlow({ project, dossier }) {
  const [active, setActive] = useState(0)
  const step = FLOW[active]

  return (
    <div className="ui-page">
      <section className="ui-hero">
        <div className="ui-hero-copy">
          <span className="ui-kicker">05 / USER RESEARCH · SERVICE BLUEPRINT</span>
          <h1>不绕路的<br /><em>五步流程</em></h1>
          <p className="ui-lead">{dossier?.oneLiner}</p>
          <p className="ui-desc">{project?.details?.overview}</p>
          <div className="ui-hero-chips"><span>卡片化架构</span><span>分类导航</span><span>一键预约</span></div>
        </div>
        <div className="ui-hero-screens" aria-hidden="true">
          {HERO_SCREENS.map((s, i) => (
            <img key={s} src={A(s)} alt="" loading="eager" style={{ '--i': i }} />
          ))}
        </div>
      </section>

      {/* 核心装置：流程路径 */}
      <section className="ui-flow-sec" id="flow">
        <SectionHead n="01" cn="主流程" en="ONE PATH, FIVE STEPS" note="从查看到下单的五个节点。点任一节点，右侧竖屏与说明同步切换到该步骤。" />
        <div className="ui-flow-grid">
          <div className="ui-path" data-reveal>
            <svg className="ui-path-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M8,18 C35,18 30,50 50,50 C70,50 65,82 92,82" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 1.6" />
            </svg>
            {FLOW.map((f, i) => (
              <button
                type="button" key={f.n}
                className={`ui-node ui-node-${i + 1}${active === i ? ' is-on' : ''}`}
                onClick={() => setActive(i)}
                aria-pressed={active === i}
              >
                <i>{f.n}</i><b>{f.t}</b><span>{f.tag}</span>
              </button>
            ))}
          </div>
          <div className="ui-flow-detail" key={step.n} data-reveal>
            <div className="ui-phone">
              <img src={A(step.img)} alt={`${step.t}界面`} loading="eager" />
            </div>
            <div className="ui-flow-text">
              <span>{step.n} / 05 · {step.tag}</span>
              <h3>{step.t}</h3>
              <p>{step.d}</p>
              <div className="ui-flow-nav">
                <button type="button" onClick={() => setActive((active + 4) % 5)}>← 上一步</button>
                <button type="button" onClick={() => setActive((active + 1) % 5)}>下一步 →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 页面档案：五张竖屏完整陈列，contain 保证不被裁切 */}
      <section className="ui-screens" id="screens">
        <SectionHead n="02" cn="页面档案" en="SCREEN ARCHIVE / 05" note="竖屏图按原始比例完整陈列，点击可放大查看界面细节。" />
        <div className="ui-screen-row">
          {FLOW.map((f, i) => (
            <figure key={f.n} data-reveal>
              <div className="ui-screen-frame">
                <Zoomable src={A(f.img)} alt={`${f.t}界面成品图`}>
                  <img src={A(f.img)} alt={`${f.t}界面成品图`} loading="lazy" />
                </Zoomable>
                <span>{pad(i + 1)}</span>
              </div>
              <figcaption><b>{f.t}</b><span>{f.d}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 信息架构：三列 + 原展板索引 */}
      <section className="ui-structure" id="structure">
        <SectionHead n="03" cn="信息架构" en="INFORMATION ARCHITECTURE" note="界面背后的三条组织原则，均来自项目原有的交互说明。" />
        <div className="ui-structure-row">
          {(dossier?.functions || []).map((f) => (
            <article key={f.n} data-reveal><i>{f.n}</i><h3>{f.t}</h3><p>{f.b}</p></article>
          ))}
        </div>
        <div className="ui-origin" data-reveal>
          <div>
            <h3>视觉与材质语言</h3>
            <p>{project?.details?.cmf}</p>
          </div>
          <Zoomable src={A('/project-ui-3.webp')} alt="《UI 界面设计》原多屏排版展板" className="ui-origin-img">
            <img src={A('/project-ui-3.webp')} alt="《UI 界面设计》原多屏排版展板" loading="lazy" />
            <span>原多屏排版展板 · 资料索引</span>
          </Zoomable>
        </div>
      </section>
    </div>
  )
}
