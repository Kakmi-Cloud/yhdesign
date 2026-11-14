/**
 * P06 模块化木质座椅 —— 杂志式「配色台 + 拆解台」
 *
 * 素材依据：
 *  · chair/chair-cutout.webp 是 RGBA 透明底单品，可作页面主角自由叠放。
 *  · chair/swatch-* 四张是同一副框架换四种软包的真实渲染，换色用真图切换，不用滤镜。
 *  · chair/structure.webp 是已标注「坐垫模块 / 靠背模块 / 一体化实木框架 / 插入方向」的结构图。
 *  · chair/process.webp 为线稿过程图；furniture-gallery-1 为原图文展板，仅作索引。
 * 四色名称、色值与三模块文案沿用最初 ChairDetailPage 的 COLOURS / MODULES 常量。
 */
import { useState } from 'react'
import { A, SectionHead, Zoomable, pad } from './shared'

const COLOURS = [
  { name: '燕麦灰', en: 'Oat grey', hex: '#b8b5aa', image: 'swatch-warmgray.webp', note: '把安静，留在日常里。' },
  { name: '深海蓝', en: 'Deep blue', hex: '#34455b', image: 'swatch-navy.webp', note: '给阅读的片刻，一点深邃。' },
  { name: '苔原绿', en: 'Moss green', hex: '#809b71', image: 'swatch-green.webp', note: '让家，多一分自然。' },
  { name: '朱砂红', en: 'Vermilion red', hex: '#bb3a34', image: 'swatch-red.webp', note: '灰色靠背，搭一抹明亮的红。' },
]
const MODULES = [
  { t: '抽出坐垫，换一种坐法。', d: '坐垫模块可整块抽出，当作蒲团单独使用。从椅上到地面，让休息的方式随心而变。' },
  { t: '插拔靠背，找到你的支撑。', d: '靠背沿滑槽上下插拔，改变腰背支撑的高度与角度。读一本书，或只是发会儿呆，都有适合自己的倚靠。' },
  { t: '拆装搬运，熟悉的陪伴继续。', d: '全椅无外露五金，以榫卯为主、连接件为辅，可反复拆装与搬运。换一个住处，也能带走熟悉的一隅。' },
]

export default function P06Chair({ project, dossier }) {
  const [sel, setSel] = useState(0)
  const [open, setOpen] = useState(0)
  const colour = COLOURS[sel]

  return (
    <div className="ch-page">
      <section className="ch-hero">
        <div className="ch-hero-copy">
          <span className="ch-kicker">06 / FURNITURE · 间坐 JIANZUO</span>
          <h1>换椅子，<br /><em>改成换软包</em></h1>
          <p className="ch-lead">{dossier?.oneLiner}</p>
          <p className="ch-desc">{project?.details?.concept}</p>
        </div>
        <div className="ch-hero-visual" data-reveal>
          <span className="ch-hero-word">sit easy.</span>
          <img src={A('/chair/chair-cutout.webp')} alt="白橡实木框架配浅暖灰软包的模块化休闲椅" loading="eager" />
          <span className="ch-hero-tag">FRAME × UPHOLSTERY</span>
        </div>
        <div className="ch-hero-dots" role="group" aria-label="软包配色">
          {COLOURS.map((c, i) => (
            <button type="button" key={c.name} style={{ '--sw': c.hex }} className={sel === i ? 'is-on' : ''} onClick={() => setSel(i)} aria-label={c.name} aria-pressed={sel === i}>
              <i /><span>{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 配色台：四张真实换色图，不放大到失真的尺寸 */}
      <section className="ch-colour" id="colour">
        <SectionHead n="01" cn="软包配色" en="FOUR UPHOLSTERIES" note="同一副白橡框架，四种软包。点色卡换的是真实渲染图，不是给同一张图套色相滤镜。" />
        <div className="ch-colour-grid">
          <div className="ch-colour-stage" key={colour.name} data-reveal>
            <Zoomable src={A(`/chair/${colour.image}`)} alt={`${colour.name}软包 · 模块化休闲椅`} eager>
              <img src={A(`/chair/${colour.image}`)} alt={`${colour.name}软包 · 模块化休闲椅`} loading="eager" />
            </Zoomable>
            <span className="ch-colour-idx">{pad(sel + 1)} / {pad(COLOURS.length)}</span>
          </div>
          <div className="ch-colour-copy" data-reveal>
            <span className="ch-colour-en">{colour.en}</span>
            <h3>{colour.name}</h3>
            <p className="ch-colour-note">{colour.note}</p>
            <div className="ch-colour-hex"><i style={{ background: colour.hex }} /><b>{colour.hex}</b></div>
            <p className="ch-colour-desc">框架负责结构与造型，软包负责坐感与表情。两件事解耦之后，同一副木架可以靠换软包改变颜色与软硬。</p>
            <div className="ch-colour-btns" role="group" aria-label="切换软包配色">
              {COLOURS.map((c, i) => (
                <button type="button" key={c.name} className={sel === i ? 'is-on' : ''} onClick={() => setSel(i)}>
                  <i style={{ background: c.hex }} />{c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 拆解台：结构图 + 三条手风琴 + 线稿过程 */}
      <section className="ch-module" id="module">
        <SectionHead n="02" cn="模块结构" en="FRAME, CUSHION, BACKREST" note="结构图的三个标注与三条规定动作一一对应；点标题展开该动作的说明。" />
        <div className="ch-module-grid">
          <div className="ch-structure" data-reveal>
            <Zoomable src={A('/chair/structure.webp')} alt="结构解析：坐垫模块、靠背模块与一体化实木框架的插入方向">
              <img src={A('/chair/structure.webp')} alt="结构解析：坐垫模块、靠背模块与一体化实木框架的插入方向" loading="lazy" />
            </Zoomable>
            <p>结构解析原图 · 坐垫 / 靠背 / 框架 / 插入方向（点击放大）</p>
          </div>
          <div className="ch-accordions" data-reveal>
            {MODULES.map((m, i) => (
              <div key={m.t} className={`ch-acc${open === i ? ' is-open' : ''}`}>
                <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                  <i>{pad(i + 1)}</i><b>{m.t}</b><span>{open === i ? '−' : '+'}</span>
                </button>
                {open === i && <p>{m.d}</p>}
              </div>
            ))}
            <div className="ch-process">
              <Zoomable src={A('/chair/process.webp')} alt="结构与工艺线稿过程图">
                <img src={A('/chair/process.webp')} alt="结构与工艺线稿过程图" loading="lazy" />
              </Zoomable>
              <span>线稿与结构推敲过程</span>
            </div>
          </div>
        </div>
      </section>

      {/* 材质与场景 */}
      <section className="ch-material" id="material">
        <SectionHead n="03" cn="材质与场景" en="CMF & IN CONTEXT" note="一硬一软的触感对比，落进小户型与租房的日常空间。" />
        <div className="ch-material-grid">
          <div className="ch-cmf" data-reveal>
            <h3>材料与工艺</h3>
            <p>{project?.details?.cmf}</p>
            <dl>
              <div><dt>框架</dt><dd>白橡实木 · 原木清漆 / 可选深胡桃</dd></div>
              <div><dt>软包</dt><dd>棉麻混纺 · 粗织肌理 · 四种配色</dd></div>
              <div><dt>填充</dt><dd>高回弹棉</dd></div>
              <div><dt>连接</dt><dd>榫卯为主、连接件为辅，无外露五金</dd></div>
            </dl>
          </div>
          <div className="ch-scenes">
            {[
              ['/chair/scene-warm.webp', '暖光下的矮椅、小圆几与花瓶'],
              ['/chair/scene-dark.webp', '深色软包与藤编木柜'],
              ['/chair/render.webp', '整体空间关系'],
            ].map(([s, cap]) => (
              <Zoomable key={s} src={A(s)} alt={cap} className="ch-scene">
                <img src={A(s)} alt={cap} loading="lazy" /><span>{cap}</span>
              </Zoomable>
            ))}
          </div>
          <div className="ch-origin" data-reveal>
            <Zoomable src={A('/furniture-gallery-1.webp')} alt="原家具设计图文展板">
              <img src={A('/furniture-gallery-1.webp')} alt="原家具设计图文展板" loading="lazy" />
            </Zoomable>
            <p>原图文展板 · 资料索引</p>
          </div>
        </div>
      </section>
    </div>
  )
}
