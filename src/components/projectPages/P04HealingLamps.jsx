/**
 * P04 情绪疗愈灯具 —— 以「七个动作」为索引的展板
 *
 * 素材依据：
 *  · lamps/grad/* 是七盏灯各自独立的成果图与状态图（含 03-cube-states 三态、
 *    04-pebble-a/b 握持与场景、01-fill-hand / 01-fill-livingroom 手部与客厅）。
 *  · ailamp-gallery-2《创意灯具设计》是原六格展板，只作资料索引。
 *  · 七盏灯名称与动作动词沿用最初 HealingLamps.jsx 的 OBJECTS 常量，不改写。
 * 结构沿用最初版本「动作索引条 → 主舞台 → 3/3 + 2/2/2 非等宽展板」的分区逻辑，
 * 但每一格都是原生图文块，不贴整张展板；切换动作靠真实图，不靠统一压暗。
 */
import { useState } from 'react'
import { A, SectionHead, Zoomable, pad } from './shared'

const LAMPS = [
  {
    n: '01', name: '填补心空', verb: '推入木块', img: '/lamps/grad/01-fill-hand.webp',
    desc: '白色方盒的缺口等着一块橡木楔。推入灯亮、抽出灯灭，用完成一个动作替代按按钮。',
    extra: '/lamps/grad/01-fill-livingroom.webp',
  },
  {
    n: '02', name: '篝火灯', verb: '添上木柴', img: '/lamps/grad/02-campfire.webp',
    desc: '木柴逐根放入，电子火焰随之增亮；照明强度随动作连续变化，而不是开关式的两档。',
  },
  {
    n: '03', name: '切割立方灯', verb: '推入楔木', img: '/lamps/grad/03-cube-states.webp',
    desc: 'Standby 暗红 → Ignition 橙 → Full Power 全亮。两瓣立方被橡木楔切开，亮度调节变成可触摸的档位。',
  },
  {
    n: '04', name: '鹅卵石智能灯', verb: '握持变色', img: '/lamps/grad/04-pebble-a.webp',
    desc: '可掬在手心的暖白卵石，底座一圈 RGB 光。床头柜上是夜灯，握在手里是氛围。',
    extra: '/lamps/grad/04-pebble-b.webp',
  },
  {
    n: '05', name: '负空间圆环灯', verb: '环内透光', img: '/lamps/grad/05-ring-negative.webp',
    desc: '白色圆环抱住一块橡木，光从木与环的缝隙溢出，负空间本身成了发光体。',
  },
  {
    n: '06', name: '体素插槽灯', verb: '插槽投影', img: '/lamps/grad/06-voxel.webp',
    desc: '网格灯罩把光切成方格投在墙上，像雨夜里的一扇小窗。',
  },
  {
    n: '07', name: '胡桃木圆柱层叠灯', verb: '错层发光', img: '/lamps/grad/07-stacked-logs.webp',
    desc: '四节胡桃木圆盘错落堆叠，光从每一道缝里漏出。',
  },
]

export default function P04HealingLamps({ project, dossier }) {
  const [active, setActive] = useState(1)
  const lamp = LAMPS[active]

  return (
    <div className="hl-page">
      <section className="hl-hero">
        <div className="hl-hero-copy">
          <span className="hl-kicker">04 / INTERACTIVE LIGHTING SERIES</span>
          <h1>开灯，<br /><em>先完成一个动作</em></h1>
          <p className="hl-lead">{dossier?.oneLiner}</p>
          <p className="hl-desc">{project?.details?.concept}</p>
          <div className="hl-count"><b>07</b><span>盏灯 / 07 个动作</span></div>
        </div>
        <div className="hl-hero-visual" data-reveal>
          <img src={A('/lamps/grad/02-campfire.webp')} alt="篝火灯：手部添柴与电子火焰" loading="eager" />
          <span className="hl-hero-tag">N°02 CAMPFIRE / 添上木柴</span>
        </div>
      </section>

      {/* 动作索引 + 主舞台：点动词切换真实图 */}
      <section className="hl-gesture" id="gesture">
        <SectionHead n="01" cn="动作索引" en="SEVEN GESTURES" note="七盏灯各自对应一个「完成动作」。点任一动词，舞台换成那一盏的真实成果图。" />
        <div className="hl-verb-bar" role="group" aria-label="七盏灯的动作">
          {LAMPS.map((l, i) => (
            <button type="button" key={l.n} className={active === i ? 'is-on' : ''} onClick={() => setActive(i)} aria-pressed={active === i}>
              <i>{l.n}</i><b>{l.verb}</b><span>{l.name}</span>
            </button>
          ))}
        </div>
        <div className="hl-stage" key={lamp.n} data-reveal>
          <div className="hl-stage-img">
            <Zoomable src={A(lamp.img)} alt={`${lamp.name} · ${lamp.verb}`} eager>
              <img src={A(lamp.img)} alt={`${lamp.name} · ${lamp.verb}`} loading="eager" />
            </Zoomable>
            {lamp.extra && (
              <div className="hl-stage-extra">
                <img src={A(lamp.extra)} alt={`${lamp.name} · 补充场景`} loading="lazy" />
              </div>
            )}
          </div>
          <div className="hl-stage-text">
            <span className="hl-stage-n">{lamp.n} / 07</span>
            <h3>{lamp.name}</h3>
            <b className="hl-stage-verb">动作 · {lamp.verb}</b>
            <p>{lamp.desc}</p>
            <div className="hl-stage-nav">
              <button type="button" onClick={() => setActive((active + 6) % 7)}>← 上一盏</button>
              <button type="button" onClick={() => setActive((active + 1) % 7)}>下一盏 →</button>
            </div>
          </div>
        </div>
      </section>

      {/* 非等宽展板：保留最初 3/3 + 2/2/2 的分区比例 */}
      <section className="hl-board" id="board">
        <SectionHead n="02" cn="动作展板" en="OBJECT BOARD / 3·3 + 2·2·2" note="沿用原展板非等宽切分：两张三图占半幅，三张小图各占三分之一。" />
        <div className="hl-board-grid">
          {LAMPS.slice(2).map((l, i) => (
            <figure key={l.n} className={`hl-b${i + 1}`} data-reveal>
              <Zoomable src={A(l.img)} alt={`${l.name} · ${l.verb}`}>
                <img src={A(l.img)} alt={`${l.name} · ${l.verb}`} loading="lazy" />
              </Zoomable>
              <figcaption><i>{l.n}</i><b>{l.verb}</b><span>{l.name}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 材质与状态：三态图、材质说明与原方案板索引 */}
      <section className="hl-material" id="material">
        <SectionHead n="03" cn="材质与状态" en="CMF & STATES" note="以木材的温润中和光源的冷感；三态推进用真实状态图呈现。" />
        <div className="hl-material-grid">
          <div className="hl-cmf" data-reveal>
            <h3>材料与触感</h3>
            <p>{project?.details?.cmf}</p>
            <ul>
              {(dossier?.functions || []).map((f) => <li key={f.n}><i>{f.n}</i><b>{f.t}</b><span>{f.b}</span></li>)}
            </ul>
          </div>
          <div className="hl-states" data-reveal>
            <Zoomable src={A('/lamps/grad/03-cube-states.webp')} alt="切割立方灯：Standby / Ignition / Full Power 三态">
              <img src={A('/lamps/grad/03-cube-states.webp')} alt="切割立方灯三态" loading="lazy" />
            </Zoomable>
            <p>三态推进 · Standby / Ignition / Full Power（点击放大）</p>
          </div>
          <div className="hl-origin" data-reveal>
            <Zoomable src={A('/ailamp-gallery-2.webp')} alt="《创意灯具设计》原六格方案板">
              <img src={A('/ailamp-gallery-2.webp')} alt="《创意灯具设计》原六格方案板" loading="lazy" />
            </Zoomable>
            <p>原六格方案板 · 资料索引</p>
          </div>
        </div>
      </section>
    </div>
  )
}
