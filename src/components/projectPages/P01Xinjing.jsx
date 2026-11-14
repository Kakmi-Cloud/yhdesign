/**
 * P01 心景 —— 围绕「插拔」重建的页面
 *
 * 素材依据（逐张核对后使用）：
 *  · lamp-gallery-1《模块化设计》展板把内容排成 4 区：产品组成 / 安装步骤 /
 *    灯柱类型 / 组合示例 —— 本页保留这四个区域语义，但用原生 SVG 重建，不贴整张展板。
 *  · xinjing/fig18《尺寸说明》：短柱 60 / 中柱 90 / 长柱 120mm，截面 20×20mm，
 *    底座 200×200×45mm，6×6 阵列共 36 孔，孔 20×20mm，材质亚克力。
 *  · xinjing/fig30、user-01..05 为成品与场景；fig13/fig20/fig23 为推导、打样与手持过程。
 *  · project-lamp-3 / -7（选题意义 / 设计意义）保留其「左文右图 + 数据」的语义。
 *
 * 核心装置：6×6 等距孔板，可点按 / 拖过插入三种真实规格的发光柱，再点拔出。
 * 视觉层次靠建模与暖光渐变，不靠统一降低亮度。
 */
import { useMemo, useState } from 'react'
import { A, Figure, Metric, SectionHead, Zoomable, pad } from './shared'

const POSTS = [
  { k: 'short', label: '短柱', mm: 60, px: 52 },
  { k: 'mid', label: '中柱', mm: 90, px: 78 },
  { k: 'long', label: '长柱', mm: 120, px: 104 },
]
const POST_MAP = Object.fromEntries(POSTS.map((p) => [p.k, p]))
const CELLS = 36
const DX = 51
const DY = 28
const OX = 372
const OY = 132

const cellPos = (i) => {
  const r = Math.floor(i / 6)
  const c = i % 6
  return { x: OX + (c - r) * DX, y: OY + (c + r) * DY, r, c }
}
const diamond = (x, y, w = 25, h = 14) =>
  `${x},${y - h} ${x + w},${y} ${x},${y + h} ${x - w},${y}`

function makePreset(kind) {
  const g = Array(CELLS).fill(null)
  const set = (r, c, v) => { if (r >= 0 && r < 6 && c >= 0 && c < 6) g[r * 6 + c] = v }
  if (kind === 'dense') {
    for (let r = 1; r <= 4; r++) for (let c = 1; c <= 4; c++) {
      const d = Math.max(Math.abs(r - 2.5), Math.abs(c - 2.5))
      set(r, c, d < 1.1 ? 'long' : d < 1.8 ? 'mid' : 'short')
    }
  } else if (kind === 'wave') {
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
      const v = (r + c) % 6
      if (v === 0 || v === 1) set(r, c, 'short')
      if (v === 2 || v === 5) set(r, c, 'mid')
      if (v === 3) set(r, c, 'long')
    }
  } else {
    [[0, 0, 'short'], [0, 3, 'long'], [1, 5, 'mid'], [2, 1, 'mid'], [3, 3, 'long'],
      [4, 0, 'short'], [4, 4, 'mid'], [5, 2, 'long'], [5, 5, 'short']].forEach(([r, c, v]) => set(r, c, v))
  }
  return g
}

function Column({ x, y, post, i }) {
  const h = post.px
  const w = 17
  const d = 9
  const top = `${x},${y - h - d} ${x + w},${y - h} ${x},${y - h + d} ${x - w},${y - h}`
  const left = `${x - w},${y - h} ${x},${y - h + d} ${x},${y + d} ${x - w},${y}`
  const right = `${x},${y - h + d} ${x + w},${y - h} ${x + w},${y} ${x},${y + d}`
  return (
    <g className="xj-post" style={{ '--pi': i }}>
      <circle cx={x} cy={y - h} r="46" fill="url(#xj-glow)" className="xj-post-glow" />
      <polygon points={left} fill="url(#xj-faceL)" />
      <polygon points={right} fill="url(#xj-faceR)" />
      <polygon points={top} fill="#FFF6DF" stroke="#F3D9A6" strokeWidth="0.8" />
      <line x1={x - w} y1={y - h} x2={x - w} y2={y} stroke="#FFE1A8" strokeWidth="1.2" opacity=".9" />
      <line x1={x} y1={y - h + d} x2={x} y2={y + d} stroke="#FFD58C" strokeWidth="1.2" opacity=".8" />
    </g>
  )
}

function PlugBoard({ grid, onCell, onEnter, tool }) {
  const order = Array.from({ length: CELLS }, (_, i) => i).sort((a, b) => {
    const pa = cellPos(a); const pb = cellPos(b)
    return (pa.r + pa.c) - (pb.r + pb.c)
  })
  return (
    <svg className="xj-svg" viewBox="0 0 744 660" role="img" aria-label="6×6 孔板插拔实验台，当前可点按插入或拔出灯柱">
      <defs>
        <radialGradient id="xj-glow">
          <stop offset="0%" stopColor="#FFD489" stopOpacity=".85" />
          <stop offset="45%" stopColor="#FFA94E" stopOpacity=".32" />
          <stop offset="100%" stopColor="#FF8A2B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="xj-faceL" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#F59A3C" /><stop offset="55%" stopColor="#FFD387" /><stop offset="100%" stopColor="#FFF1C9" />
        </linearGradient>
        <linearGradient id="xj-faceR" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#D97B2B" /><stop offset="55%" stopColor="#FDBB69" /><stop offset="100%" stopColor="#FFE9B8" />
        </linearGradient>
        <linearGradient id="xj-plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E6E1D6" /><stop offset="100%" stopColor="#CFC7B8" />
        </linearGradient>
      </defs>
      {/* 底板 */}
      <polygon points={`${OX},${OY - DY} ${OX + 6 * DX},${OY + 5 * DY} ${OX},${OY + 11 * DY} ${OX - 6 * DX},${OY + 5 * DY}`} fill="url(#xj-plate)" />
      <polygon points={`${OX - 6 * DX},${OY + 5 * DY} ${OX},${OY + 11 * DY} ${OX},${OY + 11 * DY + 24} ${OX - 6 * DX},${OY + 5 * DY + 24}`} fill="#AEA697" />
      <polygon points={`${OX},${OY + 11 * DY} ${OX + 6 * DX},${OY + 5 * DY} ${OX + 6 * DX},${OY + 5 * DY + 24} ${OX},${OY + 11 * DY + 24}`} fill="#C3BBA9" />
      {/* 孔与柱，按等距深度排序 */}
      {order.map((i) => {
        const { x, y } = cellPos(i)
        const post = grid[i] ? POST_MAP[grid[i]] : null
        return (
          <g key={i} className={`xj-cell${grid[i] ? ' is-filled' : ''}`} onClick={() => onCell(i)} onPointerEnter={() => onEnter(i)}>
            <polygon points={diamond(x, y)} fill="#D8D1C3" stroke="#9A9384" strokeWidth="1" />
            <polygon points={diamond(x, y + 2, 15, 8)} fill={grid[i] ? '#8C7A5E' : '#6E685D'} />
            {post && <Column x={x} y={y} post={post} i={i} />}
            <polygon className="xj-hit" points={diamond(x, y, 26, 15)} fill="transparent" />
          </g>
        )
      })}
      <text x="16" y="638" className="xj-svg-note">6 × 6 = 36 HOLES / 20 × 20 mm / TOOL: {POST_MAP[tool].label}</text>
    </svg>
  )
}

export default function P01Xinjing({ project, dossier }) {
  const [grid, setGrid] = useState(() => makePreset('dense'))
  const [tool, setTool] = useState('mid')
  const [painting, setPainting] = useState(false)

  const stats = useMemo(() => {
    const used = grid.filter(Boolean)
    return {
      count: used.length,
      mm: used.reduce((s, k) => s + POST_MAP[k].mm, 0),
      dist: POSTS.map((p) => ({ ...p, n: used.filter((k) => k === p.k).length })),
    }
  }, [grid])

  const put = (i, force = false) => {
    setGrid((g) => {
      if (g[i] && !force) { const n = [...g]; n[i] = null; return n }
      if (!g[i] || force) { const n = [...g]; n[i] = tool; return n }
      return g
    })
  }
  const onCell = (i) => put(i)
  const onEnter = (i) => { if (painting && !grid[i]) setGrid((g) => { const n = [...g]; n[i] = tool; return n }) }

  return (
    <div className="xj-page" onPointerUp={() => setPainting(false)} onPointerCancel={() => setPainting(false)}>
      {/* 首屏：不对称两栏，成品图保持原有暖光，不做压暗 */}
      <section className="xj-hero">
        <div className="xj-hero-text">
          <span className="xj-kicker">01 / GRADUATION PROJECT · 2026</span>
          <h1>插进去，<br /><em>光就长出来</em></h1>
          <p className="xj-lead">{dossier?.oneLiner}</p>
          <p className="xj-desc">{project?.desc}</p>
          <div className="xj-hero-metrics">
            <Metric value="6 × 6" label="孔位阵列" note="共 36 孔" />
            <Metric value="3" label="灯柱规格" note="60 / 90 / 120 mm" />
            <Metric value="20²" label="模块截面" note="单位 mm" />
          </div>
        </div>
        <div className="xj-hero-visual">
          <img src={A('/xinjing/fig30.webp')} alt="《心景·方阵》孔板底座与发光柱阵列成品特写" loading="eager" />
          <span className="xj-hero-tag">MODULAR LIGHT / 方阵</span>
          <span className="xj-hero-corner">实物拍摄 · 亚克力发光柱</span>
        </div>
      </section>

      {/* 核心装置：插拔实验台 —— 对应原展板「产品组成 / 安装步骤 / 灯柱类型 / 组合示例」四区 */}
      <section className="xj-lab" id="lab">
        <SectionHead
          n="01" cn="插拔实验台" en="PLUG & PLAY / MODULAR SYSTEM"
          note="孔位、柱高、阵列数都按《尺寸说明》的真实参数建模。点一下插入，再点一下拔出；按住鼠标划过可连续布置。"
        />
        <div className="xj-lab-grid">
          <div className="xj-lab-panel" data-reveal>
            <span className="xj-panel-k">STEP 1 · 选灯柱</span>
            <div className="xj-tools" role="group" aria-label="选择灯柱规格">
              {POSTS.map((p) => (
                <button
                  type="button" key={p.k}
                  className={`xj-tool${tool === p.k ? ' is-on' : ''}`}
                  onClick={() => setTool(p.k)}
                  aria-pressed={tool === p.k}
                >
                  <i style={{ height: `${18 + p.px * 0.22}px` }} />
                  <b>{p.label}</b><span>{p.mm} mm</span>
                </button>
              ))}
            </div>
            <span className="xj-panel-k">STEP 2 · 组合示例</span>
            <div className="xj-presets" role="group" aria-label="组合预设">
              {[['dense', '聚拢'], ['wave', '起伏'], ['scatter', '疏落']].map(([k, n]) => (
                <button type="button" key={k} onClick={() => setGrid(makePreset(k))}>{n}</button>
              ))}
              <button type="button" className="is-clear" onClick={() => setGrid(Array(CELLS).fill(null))}>清空</button>
            </div>
            <div className="xj-readout">
              <div><b>{pad(stats.count)}</b><span>已插灯柱 / 36</span></div>
              <div><b>{stats.mm}</b><span>柱高合计 / mm</span></div>
              <ul>{stats.dist.map((d) => <li key={d.k}><i>{d.label}</i><span>{d.n} 根</span></li>)}</ul>
            </div>
            <p className="xj-hint" onPointerDown={(e) => { e.preventDefault(); setPainting(true) }}>
              ↓ 按住这里开始在孔板上拖过，可连续插柱
            </p>
          </div>
          <div className="xj-lab-stage" data-reveal>
            <PlugBoard grid={grid} onCell={onCell} onEnter={onEnter} tool={tool} />
          </div>
        </div>
      </section>

      {/* 规格：把 fig18 的两栏分区用网页原生重排 */}
      <section className="xj-spec" id="spec">
        <SectionHead n="02" cn="规格与尺寸" en="DIMENSIONS" note="数值全部来自《尺寸说明》图纸，未作换算或推断。" />
        <div className="xj-spec-grid">
          <div className="xj-spec-card" data-reveal>
            <h3>灯柱尺寸 <i>COLUMN</i></h3>
            <div className="xj-bars">
              {POSTS.map((p) => (
                <div className="xj-bar" key={p.k}>
                  <i style={{ height: `${p.px * 0.86}px` }} />
                  <b>{p.mm}<small>mm</small></b><span>{p.label}</span>
                </div>
              ))}
            </div>
            <dl>
              <div><dt>截面</dt><dd>20 × 20 mm</dd></div>
              <div><dt>材质</dt><dd>亚克力</dd></div>
              <div><dt>档位</dt><dd>短 / 中 / 长 三档</dd></div>
            </dl>
          </div>
          <div className="xj-spec-card" data-reveal>
            <h3>底座尺寸 <i>BASE</i></h3>
            <div className="xj-mini-grid" aria-hidden="true">
              {Array.from({ length: 36 }, (_, i) => <i key={i} />)}
            </div>
            <dl>
              <div><dt>外形</dt><dd>200 × 200 mm</dd></div>
              <div><dt>高度</dt><dd>45 mm</dd></div>
              <div><dt>孔位</dt><dd>6 × 6 阵列（36 孔）</dd></div>
              <div><dt>孔径</dt><dd>20 × 20 mm</dd></div>
            </dl>
          </div>
          <div className="xj-spec-evi" data-reveal>
            <Zoomable src={A('/xinjing/fig18.webp')} alt="《心景》尺寸说明原图：灯柱尺寸与底座尺寸">
              <img src={A('/xinjing/fig18.webp')} alt="《心景》尺寸说明原图" loading="lazy" />
            </Zoomable>
            <p>原始图纸 · 《尺寸说明》（点击放大）</p>
          </div>
        </div>
      </section>

      {/* 安装步骤：保留展板「取柱 → 插入 → 发光」的三段语义，用过程照片而非贴整张展板 */}
      <section className="xj-steps" id="steps">
        <SectionHead n="03" cn="安装步骤" en="INSERT / ONE MOTION" note="插拔公差与亚克力透光率在论文第 4 章有打样记录。" />
        <div className="xj-step-row">
          {[
            { im: '/xinjing/fig23.webp', t: '取柱', d: '握住一根亚克力灯柱，柱脚与孔位同为 20 × 20 mm。', cap: '手持发光模块 · 打样过程' },
            { im: '/xinjing/fig13.webp', t: '插入', d: '对准孔位垂直下压，柱体靠公差配合立在底座上，不需要工具。', cap: '孔板与模块阵列推导图' },
            { im: '/xinjing/fig20.webp', t: '发光', d: '插入即通电，光从柱体漫射出来；组合方式决定光的疏密与高低。', cap: '《心景·方阵》成品' },
          ].map((s, i) => (
            <Figure key={s.t} src={A(s.im)} alt={s.cap} cap={`0${i + 1} ${s.t} — ${s.d}`} index={`0${i + 1}`} className="xj-step-fig" fit="cover" />
          ))}
        </div>
      </section>

      {/* 四项功能：来自资料层，不再重复「功能均可实现」 */}
      <section className="xj-func">
        <div className="xj-func-head"><span>04 / 可实现功能</span><b>光如何回应人</b></div>
        <div className="xj-func-row">
          {(dossier?.functions || []).map((f) => (
            <article key={f.n} data-reveal>
              <i>{f.n}</i><h3>{f.t}</h3><p>{f.b}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 两种形态：孔板桌面灯 / 主杆壁灯，错位双图 */}
      <section className="xj-forms" id="forms">
        <SectionHead n="05" cn="两种形态" en="TWO TYPOLOGIES" note="同一套发光模块，落到底座孔板与金属主杆上，形成由局部到整体的光。" />
        <div className="xj-forms-wrap">
          <div className="xj-form-a" data-reveal>
            <Zoomable src={A('/xinjing/user-04.webp')} alt="《心景·方阵》孔板桌面灯夜间发光效果">
              <img src={A('/xinjing/user-04.webp')} alt="《心景·方阵》孔板桌面灯夜间发光效果" loading="lazy" />
            </Zoomable>
            <div><b>方阵 · 桌面灯</b><span>模块插在 6×6 孔板上，自由排布高低与疏密。</span></div>
          </div>
          <div className="xj-form-b" data-reveal>
            <Zoomable src={A('/xinjing/fig28.webp')} alt="《心景·叠木》发光模块沿金属主杆错位堆叠">
              <img src={A('/xinjing/fig28.webp')} alt="《心景·叠木》发光模块沿金属主杆错位堆叠" loading="lazy" />
            </Zoomable>
            <div><b>叠木 · 主杆灯</b><span>方形木块沿主杆磁吸移动、错位堆叠，光从缝隙漫反射。</span></div>
          </div>
        </div>
      </section>

      {/* 设计意义：保留展板左文右图 + 数据带的分区语义 */}
      <section className="xj-meaning" id="meaning">
        <SectionHead n="06" cn="设计意义" en="WHY IT MATTERS" note="调研数据引自论文第 2 章问卷分析，按原文转录。" />
        <div className="xj-data-row">
          {(dossier?.research?.metrics || []).map((m) => <Metric key={m.l} value={m.v} label={m.l} note={m.n} />)}
        </div>
        <div className="xj-meaning-grid">
          <div className="xj-meaning-text" data-reveal>
            <h3>房子或许是租来的，<br />情绪需要一个安放的角落</h3>
            <p>{project?.details?.overview}</p>
            <p>{dossier?.research?.findings?.[1]}</p>
            <p>{dossier?.research?.findings?.[2]}</p>
          </div>
          <div data-reveal>
            <Zoomable src={A('/xinjing/scene-01.jpg')} alt="独居青年夜间使用场景">
              <img src={A('/xinjing/scene-01.jpg')} alt="独居青年夜间使用场景" loading="lazy" />
            </Zoomable>
            <p className="xj-cap">夜间使用场景 · 低亮度指引光线</p>
          </div>
        </div>
      </section>

      {/* 场景序列：原图不压暗，靠排序与间距形成由近到远的节奏 */}
      <section className="xj-scenes" id="scenes">
        <SectionHead n="07" cn="场景" en="FROM OBJECT TO ROOM" note="由单件产品到整间屋子，五张原始场景照按空间尺度排列。" />
        <div className="xj-scene-strip">
          {[
            ['/xinjing/user-04.webp', '单件 · 夜间发光'],
            ['/xinjing/user-02.webp', '分层展台摆放'],
            ['/xinjing/user-01.webp', '客厅 · 系列组合'],
            ['/xinjing/user-03.webp', '起居室 · 多灯并置'],
            ['/xinjing/user-05.webp', '卧室 · 睡前氛围'],
          ].map(([s, cap], i) => (
            <Zoomable key={s} src={A(s)} alt={cap} className="xj-scene-item">
              <img src={A(s)} alt={cap} loading="lazy" />
              <span>{pad(i + 1)} {cap}</span>
            </Zoomable>
          ))}
        </div>
      </section>
    </div>
  )
}
