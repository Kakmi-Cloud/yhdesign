/**
 * P08 猫冰 —— 以核心 IP 元素为页面主角
 *
 * 素材依据（逐张核对后使用）：
 *  · cat-ice/character/{frozen,melted}.webp、views/*、emotions/*、merch/*
 *    全部是 RGBA 透明底的独立角色资产 —— 本页直接把它们当作可自由排布的「IP 元素」，
 *    不再把 cat-ice/hero.webp（网页截图）或 scheme1 三张整版展板当作主视觉。
 *  · scheme1/character-design.webp 的分区语义（造型提取 / 情绪温度 / 色彩设定 /
 *    双状态三视图）用网页原生区块重建；五个色票值从该展板像素采样得到。
 *  · scheme1/expression-system.webp 的 8 个情绪名与 merchandise.webp 的 6 类周边
 *    按原文转录；三张原方案板只在末尾以小索引保留，不铺满版面。
 *
 * 双态切换用两套真实角色图互斥，不用统一降低亮度的滤镜。
 */
import { useState } from 'react'
import { A, SectionHead, Zoomable, pad } from './shared'

/* 取色自 character-design.webp「色彩设定」五个色票的像素均值 */
const PALETTE = [
  { n: '杏橘', hex: '#FEC37F' },
  { n: '蜜橙', hex: '#ED965F' },
  { n: '奶白', hex: '#FFF0DE' },
  { n: '雾紫', hex: '#8D8CAF' },
  { n: '深棕', hex: '#5B3C3E' },
]

const VIEWS = {
  frozen: [
    ['/cat-ice/views/frozen-front.webp', '正面', '冰壳收紧，身体蜷成方形，尾巴竖直作冰棍手柄'],
    ['/cat-ice/views/frozen-side.webp', '侧面', '侧面可见冰壳厚度与内层橘猫的前后关系'],
    ['/cat-ice/views/frozen-back.webp', '背面', '背部虎斑透过半透明壳体仍可辨认'],
  ],
  melted: [
    ['/cat-ice/views/melted-front.webp', '正面', '冰壳摊平贴地，轮廓变宽、重心下沉'],
    ['/cat-ice/views/melted-side.webp', '侧面', '侧面呈流挂状，尾巴与地面水滴连成一体'],
    ['/cat-ice/views/melted-back.webp', '背面', '背面弧线变缓，整体更像一滩融化的猫'],
  ],
}

/* 前 8 条出自 expression-system.webp 的中文标签；其余按编号稳妥标注，不臆测情绪名 */
const EMOTION_NAMES = [
  '终于解放！', '伤心结冰', '自闭中', '气鼓鼓', '暗中观察', '在做了…', '今天躺平', '委屈巴巴',
]

const MERCH_TYPES = ['帆布手提袋', '饮品杯与杯套', '手机壳', '双层透明挂件', '情绪贴纸', '软胶杯垫']
const MERCH_IMGS = [
  ['/cat-ice/merch/01.webp', '双层透明挂件', '外层冻壳与内层橘猫分件，是挂卡包装的核心件'],
  ['/cat-ice/merch/02.webp', '帆布手提袋', '米白 / 雾紫两色，正反面分别用完整脸与线稿'],
  ['/cat-ice/merch/03.webp', '饮品杯与杯套', '把一张表情放进日常通勤'],
  ['/cat-ice/merch/04.webp', '情绪贴纸与手机壳', '表情系统按组复用，保持同一套轮廓语言'],
]

const BOARDS = [
  ['/cat-ice/scheme1/character-design.webp', '01 角色设定稿'],
  ['/cat-ice/scheme1/expression-system.webp', '02 表情与动作'],
  ['/cat-ice/scheme1/merchandise.webp', '03 周边应用'],
]

export default function P08CatIce({ project, dossier }) {
  const [temp, setTemp] = useState(-18)
  const [viewSet, setViewSet] = useState('frozen')
  const [mood, setMood] = useState(null)
  const soft = temp > 0
  const pct = ((temp + 18) / 56) * 100

  return (
    <div className="ci-page">
      {/* 首屏：角色是绝对主角，不是整张图 */}
      <section className="ci-hero">
        <div className="ci-hero-copy">
          <span className="ci-kicker">08 / IP DESIGN · THERMAL LAB</span>
          <h1>双层<br /><em>冻猫</em></h1>
          <p className="ci-lead">{dossier?.oneLiner}</p>
          <p className="ci-desc">以橘猫为内核，以透明冻壳为外层。情绪改变姿态，也改变外壳的软硬与透明度。</p>
          <div className="ci-hero-tags">
            <span>大头像</span><i>×</i><span>卷尾巴</span><i>×</i><span>双层包裹</span>
          </div>
        </div>

        <div className="ci-stage" data-reveal>
          <div className="ci-stage-halo" />
          <div className="ci-stage-ring" />
          <img
            key={soft ? 'melted' : 'frozen'}
            className="ci-cat"
            src={A(soft ? '/cat-ice/character/melted.webp' : '/cat-ice/character/frozen.webp')}
            alt={soft ? '猫冰软化态：冰壳摊平贴地的橘猫' : '猫冰冻结态：冰壳收紧、尾巴作冰棍手柄的橘猫'}
            loading="eager"
          />
          <span className="ci-callout ci-callout-1"><i />透明冻壳</span>
          <span className="ci-callout ci-callout-2"><i />橘猫内核</span>
          <span className="ci-callout ci-callout-3"><i />环纹卷尾</span>
        </div>

        <aside className="ci-hero-side">
          <span className="ci-side-k">CURRENT STATE</span>
          <b className={`ci-side-state${soft ? ' is-soft' : ''}`}>{soft ? '软化态' : '冻结态'}</b>
          <p>{soft ? '更放松 · 更柔软 · 更朦胧' : '更紧凑 · 更坚硬 · 更透明'}</p>
          <div className="ci-side-rule" />
          <span className="ci-side-k">CORE MECHANISM</span>
          <p>冷热相变 / 双层结构 / 圆水滴猫尾化为冰棍手柄</p>
          <div className="ci-side-rule" />
          <span className="ci-side-k">ASSET FAMILY</span>
          <p>双态主视觉 · 6 张三视图 · 14 款情绪 · 4 组周边</p>
        </aside>
      </section>

      {/* 温度控制台：两套真实角色图互斥切换 */}
      <section className="ci-console" id="character">
        <div className="ci-temp-read">
          <b>{temp > 0 ? '+' : ''}{temp}</b><i>°C</i>
          <span>{soft ? '冰壳正在摊平' : '冰壳保持收紧'}</span>
        </div>
        <div className="ci-slider-wrap">
          <div className="ci-scale"><i>−18°C</i><i>0°C · 相变点</i><i>+38°C</i></div>
          <input
            type="range" min="-18" max="38" step="1" value={temp}
            style={{ '--pct': `${pct}%` }}
            onChange={(e) => setTemp(Number(e.target.value))}
            aria-label="温度轴：拖动切换冻结态与软化态"
          />
          <p>拖动温度轴，冰壳在冻结态与软化态之间双向转换；尾巴形态与地面水滴同步变化。</p>
        </div>
        <div className="ci-presets">
          <button type="button" onClick={() => setTemp(-18)}>一键速冻</button>
          <button type="button" onClick={() => setTemp(38)}>慢慢融化</button>
        </div>
      </section>

      {/* 机制四条：只出现一次「功能可实现」声明在共享页脚 */}
      <div className="ci-func-strip">
        {(dossier?.functions || []).map((f) => (
          <div key={f.n}><i>{f.n}</i><b>{f.t}</b><span>{f.b}</span></div>
        ))}
      </div>

      {/* 造型提取：用角色透明底素材做局部放大，不贴整张设定稿 */}
      <section className="ci-elements" id="elements">
        <SectionHead n="01" cn="造型提取" en="DESIGN ELEMENTS" note="从角色本身放大三处：虎斑、眉眼与包裹轮廓。展板里的三个圆在这里变成可对照的局部。" />
        <div className="ci-crops">
          {[
            ['简化虎斑', '额头三道纹样保留最高辨识度的一笔'],
            ['慵懒眉眼', '半闭的眼与短眉承担主要情绪'],
            ['柔软包裹', '冰壳轮廓像一颗水滴，把整个身体收进去'],
          ].map(([t, d], i) => (
            <article key={t} data-reveal>
              <div className={`ci-crop ci-crop-${i + 1}`}>
                <img src={A('/cat-ice/character/frozen.webp')} alt={`${t}局部放大`} loading="lazy" />
              </div>
              <b>{pad(i + 1)} {t}</b><p>{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 双态三视图：保留展板「冻结态 / 软化态 × 正 / 侧 / 背」的分区 */}
      <section className="ci-views" id="views">
        <SectionHead
          n="02" cn="双态三视图" en="THREE VIEWS / TWO STATES"
          note="切换状态，对照同一套正 / 侧 / 背三视图里的轮廓变化。"
          aside={
            <div className="ci-tabs" role="group" aria-label="三视图状态">
              <button type="button" className={viewSet === 'frozen' ? 'is-on' : ''} onClick={() => setViewSet('frozen')}>冻结态</button>
              <button type="button" className={viewSet === 'melted' ? 'is-on' : ''} onClick={() => setViewSet('melted')}>软化态</button>
            </div>
          }
        />
        <div className="ci-views-grid" key={viewSet}>
          {VIEWS[viewSet].map(([s, name, note], i) => (
            <figure key={s} data-reveal>
              <div className="ci-view-frame">
                <Zoomable src={A(s)} alt={`${viewSet === 'frozen' ? '冻结态' : '软化态'}${name}视图`}>
                  <img src={A(s)} alt={`${name}视图`} loading="lazy" />
                </Zoomable>
                <span>{pad(i + 1)} / {name}</span>
              </div>
              <figcaption>{note}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 情绪系统：14 张独立表情按跨格节奏排布，不铺成等宽表格 */}
      <section className="ci-emotions" id="emotions">
        <SectionHead n="03" cn="情绪系统" en="EXPRESSION SYSTEM / 14 MOODS" note="心情变了，冻壳也跟着变。前 8 个名称出自原表情展板，其余按素材编号标注。" />
        <div className="ci-mood-grid">
          {Array.from({ length: 14 }, (_, i) => (
            <button
              type="button" key={i}
              className={`ci-mood${i === 0 || i === 5 || i === 9 ? ' is-wide' : ''}${mood === i ? ' is-on' : ''}`}
              onClick={() => setMood(i)}
              aria-pressed={mood === i}
            >
              <img src={A(`/cat-ice/emotions/${pad(i + 1)}.webp`)} alt={`猫冰情绪 ${pad(i + 1)}${EMOTION_NAMES[i] ? `：${EMOTION_NAMES[i]}` : ''}`} loading="lazy" />
              <span>{EMOTION_NAMES[i] || `情绪 ${pad(i + 1)}`}</span>
            </button>
          ))}
        </div>
        {mood !== null && (
          <div className="ci-mood-detail" role="status">
            <b>{EMOTION_NAMES[mood] || `情绪 ${pad(mood + 1)}`}</b>
            <span>素材编号 {pad(mood + 1)} / 14 · 点击其他表情可继续对照</span>
          </div>
        )}
      </section>

      {/* 色彩设定：真实采样值 */}
      <section className="ci-palette" id="palette">
        <SectionHead n="04" cn="色彩设定" en="COLOR PALETTE" note="五个色值从《角色设定稿》右下角色票逐点采样，非目测近似。" />
        <div className="ci-swatches">
          {PALETTE.map((p, i) => (
            <div className="ci-swatch" key={p.hex} data-reveal>
              <i style={{ background: p.hex }} />
              <b>{pad(i + 1)} {p.n}</b><span>{p.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 周边应用：4 组真实商品图 + 展板确认的 6 类延展 */}
      <section className="ci-merch" id="merch">
        <SectionHead n="05" cn="周边应用" en="MERCHANDISE CONCEPT" note="把双层造型带进日常。六类延展按原周边展板的分区转录。" />
        <ol className="ci-merch-types">
          {MERCH_TYPES.map((t, i) => <li key={t}><i>{pad(i + 1)}</i>{t}</li>)}
        </ol>
        <div className="ci-merch-grid">
          {MERCH_IMGS.map(([s, n, note], i) => (
            <figure key={s} data-reveal>
              <Zoomable src={A(s)} alt={n} className="ci-merch-img">
                <img src={A(s)} alt={n} loading="lazy" />
              </Zoomable>
              <figcaption><b>{pad(i + 1)} {n}</b><span>{note}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 原方案板只作小索引，可放大，不占据主体版面 */}
      <section className="ci-boards">
        <div className="ci-boards-head"><span>附 / 原始方案板</span><p>以下三张是原始整版设定稿，仅作资料索引；本页主体已按区块重新拆解。</p></div>
        <div className="ci-boards-row">
          {BOARDS.map(([s, n]) => (
            <Zoomable key={s} src={A(s)} alt={n} className="ci-board">
              <img src={A(s)} alt={n} loading="lazy" /><span>{n}</span>
            </Zoomable>
          ))}
        </div>
      </section>
    </div>
  )
}
