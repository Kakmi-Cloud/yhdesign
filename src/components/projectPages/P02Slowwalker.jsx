/**
 * P02 慢行者 —— 页面结构本身就是一条「进度轨道」
 *
 * 素材依据：
 *  · snail/snail-62..65 为同一只蜗牛的白底多角度渲染；view-01..03 为三视图小稿。
 *  · snail/mechanism.webp 是已排版的「年轮 / 机构」说明图，只作可放大资料卡。
 *  · snail/sketch-* 与 insp-* 是线稿与灵感图，按推导时间排成不等宽时间轴。
 *  · slowwalker-* 与 snail/snail-60、61 是桌面场景照，保持原有亮度。
 * 核心装置：拖动进度，蜗牛沿轨道爬到对应位置，屏幕进度与四阶段状态同步。
 */
import { useState } from 'react'
import { A, Figure, SectionHead, Zoomable, pad } from './shared'

const STAGES = [
  { p: 0, t: '触发', d: '用户点击「渲染」或「下载大文件」，屏幕显示进度条 0%。' },
  { p: 15, t: '同步', d: '底座灯光以呼吸灯效亮起，机械蜗牛开始缓慢启动。' },
  { p: 80, t: '过程', d: '电脑显示 80%，蜗牛爬行到轨道 80% 位置。' },
  { p: 100, t: '完成', d: '电脑显示 100%，蜗牛到达终点，触发完成特效。' },
]

const VIEWS = [
  ['/snail/view-01.png', '正面', '壳上的螺纹是最主要的识别符号'],
  ['/snail/view-02.png', '侧面', '履带式底座贴着轨道行进'],
  ['/snail/view-03.png', '顶面', '触角与壳体比例在俯视下最清楚'],
]

const SKETCH = [
  ['/snail/sketch-01.webp', '壳的螺纹', '从年轮里找「慢」的视觉符号'],
  ['/snail/sketch-wide.webp', '桌面关系', '显示器、轨道与人手的距离'],
  ['/snail/sketch-02.webp', '形态收敛', '把拟物收成极简几何'],
  ['/snail/sketch-03.webp', '轨道细节', '履带与轨道的接触方式'],
]

export default function P02Slowwalker({ project, dossier }) {
  const [pct, setPct] = useState(42)
  const active = STAGES.reduce((acc, s, i) => (pct >= s.p ? i : acc), 0)

  return (
    <div className="sw-page">
      <section className="sw-hero">
        <div className="sw-hero-copy">
          <span className="sw-kicker">02 / DESKTOP DEVICE · TECHNO-ZEN</span>
          <h1>等待，<br /><em>也可以被看见</em></h1>
          <p className="sw-lead">{dossier?.oneLiner}</p>
          <p className="sw-desc">{project?.details?.concept}</p>
          <div className="sw-hero-meta">
            <span>哑光陶瓷</span><span>半透磨砂玻璃</span><span>科技禅意</span>
          </div>
        </div>
        <div className="sw-hero-visual" data-reveal>
          <img src={A('/slowwalker-render.jpeg')} alt="《慢行者》机械蜗牛产品渲染图" loading="eager" />
          <span className="sw-hero-tag">FIGURE 01 / 主体</span>
        </div>
      </section>

      {/* 核心装置：进度轨道 */}
      <section className="sw-track-sec" id="track">
        <SectionHead n="01" cn="进度轨道" en="PROGRESS AS A JOURNEY" note="拖动滑块，屏幕里的数字进度与桌面上蜗牛的位置始终一一对应。" />
        <div className="sw-console" data-reveal>
          <div className="sw-screen">
            <div className="sw-screen-bar"><i /><i /><i /></div>
            <span className="sw-screen-k">RENDERING / DOWNLOAD</span>
            <b>{pad(pct)}<small>%</small></b>
            <div className="sw-screen-progress"><i style={{ width: `${pct}%` }} /></div>
            <span className="sw-screen-foot">{pct === 100 ? 'COMPLETE · 蜗牛已抵达终点' : 'IN PROGRESS · 同步中'}</span>
          </div>
          <div className="sw-rail-zone">
            <span className="sw-rail-k">DESKTOP RAIL / 0 → 100</span>
            <div className="sw-rail">
              <div className="sw-rail-line" />
              <div className="sw-rail-fill" style={{ width: `${pct}%` }} />
              <div className="sw-snail" style={{ left: `${pct}%` }}>
                <img src={A('/snail/snail-62-white.webp')} alt="沿轨道爬行的机械蜗牛" loading="lazy" />
              </div>
              <i className="sw-rail-start">0</i><i className="sw-rail-end">100</i>
            </div>
            <input
              type="range" min="0" max="100" value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
              aria-label="下载进度"
              style={{ '--pct': `${pct}%` }}
            />
            <p className="sw-rail-note">进度读取 → 位置同步 → 灯光反馈，三步都由同一份进度值驱动。</p>
          </div>
        </div>
      </section>

      {/* 四阶段：点击阶段直接把装置推到对应进度 */}
      <section className="sw-stages" id="stages">
        <SectionHead n="02" cn="四阶段" en="ONE TASK, FOUR MOMENTS" note="四段文案取自交互流程说明；点任一阶段可把上方装置跳到该状态。" />
        <div className="sw-stage-row">
          {STAGES.map((s, i) => (
            <button
              type="button" key={s.t}
              className={`sw-stage${active === i ? ' is-on' : ''}`}
              onClick={() => setPct(s.p)}
              data-reveal
            >
              <span className="sw-stage-p">{pad(s.p)}<i>%</i></span>
              <b>{pad(i + 1)} {s.t}</b>
              <p>{s.d}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 机构与三视图：保留「实物多角度 / 机构说明」的分区 */}
      <section className="sw-views" id="views">
        <SectionHead n="03" cn="机构与三视图" en="FORM & MECHANISM" note="三视图为同一造型的正 / 侧 / 顶角度；年轮机构图保留为可放大的原始资料。" />
        <div className="sw-views-grid">
          {VIEWS.map(([s, n, cap], i) => (
            <Figure key={s} src={A(s)} alt={`《慢行者》${n}视图`} cap={`${pad(i + 1)} ${n} — ${cap}`} fit="contain" className="sw-view-fig" />
          ))}
          <div className="sw-mech" data-reveal>
            <Zoomable src={A('/snail/mechanism.webp')} alt="《慢行者》机构说明原图：年轮与进度机制">
              <img src={A('/snail/mechanism.webp')} alt="《慢行者》机构说明原图" loading="lazy" />
            </Zoomable>
            <p>原始机构说明图 · 点击放大</p>
            <span>年轮的「一圈一圈」被借用来表达缓慢而可计量的推进。</span>
          </div>
        </div>
        <div className="sw-scenes">
          {[
            ['/slowwalker-hero.webp', '显示器前的轨道与蜗牛'],
            ['/snail/snail-60.webp', '桌面全景'],
            ['/snail/snail-61.webp', '轨道局部'],
            ['/slowwalker-scene-2.png', '工作场景'],
          ].map(([s, cap], i) => (
            <Zoomable key={s} src={A(s)} alt={cap} className="sw-scene">
              <img src={A(s)} alt={cap} loading="lazy" /><span>{pad(i + 1)} {cap}</span>
            </Zoomable>
          ))}
        </div>
      </section>

      {/* 草图时间轴：不等宽，按推导顺序而非等格 */}
      <section className="sw-sketch" id="sketch">
        <SectionHead n="04" cn="草图时间轴" en="FROM SPIRAL TO OBJECT" note="从灵感里的螺旋线，到壳、轨道与桌面关系，四组过程稿按推导顺序排开。" />
        <div className="sw-sketch-row">
          {SKETCH.map(([s, t, cap], i) => (
            <figure key={s} className={`sw-sk-${i + 1}`} data-reveal>
              <Zoomable src={A(s)} alt={t}><img src={A(s)} alt={t} loading="lazy" /></Zoomable>
              <figcaption><b>{pad(i + 1)} {t}</b><span>{cap}</span></figcaption>
            </figure>
          ))}
        </div>
        <div className="sw-insp">
          <div data-reveal>
            <Zoomable src={A('/slowwalker-inspiration.webp')} alt="灵感来源：金属蜗牛壳雕刻的螺旋纹理">
              <img src={A('/slowwalker-inspiration.webp')} alt="灵感来源：金属蜗牛壳雕刻的螺旋纹理" loading="lazy" />
            </Zoomable>
            <p>灵感来源 · 螺旋纹理</p>
          </div>
          <div data-reveal>
            <Zoomable src={A('/snail/insp-03.png')} alt="灵感线稿：蜗牛轮廓的螺旋线">
              <img src={A('/snail/insp-03.png')} alt="灵感线稿：蜗牛轮廓的螺旋线" loading="lazy" />
            </Zoomable>
            <p>灵感线稿 · 轮廓提取</p>
          </div>
          <blockquote data-reveal>
            「慢」不是效率的对立面，<br />而是把等待变成一段看得见的路。
          </blockquote>
        </div>
      </section>
    </div>
  )
}
