/**
 * P03 实习灯具 —— 两本对开的图录
 *
 * 素材依据：
 *  · lamps/01..06 是「孔雀石 × 黄铜」同一系列的六张室内场景，按空间类型区分。
 *  · lamps/ai/01..05 是 AIGC 形态发散的五张独立方案，多数为白底单品。
 *  · ailamp-gallery-1《AI 灯具设计》是原六格方案板，只在末尾作资料索引。
 *  · 评审表参数来自两张 VELUCE《新灯外观造型评审表》的文字转录（扫描件不在站点素材内）。
 * 两条线各有独立的主图切换状态，不共用模板、不用压暗区分。
 */
import { useState } from 'react'
import { A, SectionHead, Zoomable, pad } from './shared'

const SERIES_A = [
  ['/lamps/01-ring-livingroom.webp', '孔雀石光环吊灯', '客厅 · 双层光环'],
  ['/lamps/02-petal-bedroom.webp', '花瓣吊灯', '卧室 · 柔和扩散'],
  ['/lamps/03-linear-dining.webp', '线性吊灯', '餐厅 · 一字排布'],
  ['/lamps/04-alabaster-stair.webp', '云石环吊灯', '楼梯间 · 高低错落'],
  ['/lamps/05-cone-bar.webp', '锥形吊灯', '吧台 · 垂向阵列'],
  ['/lamps/06-ring-livingroom-2.webp', '组合吊灯', '客厅 · 系列并置'],
]
const SERIES_B = [
  ['/lamps/ai/01-glass-drops.webp', '棱纹玻璃水滴', '蓝 / 粉 / 琥珀撞色'],
  ['/lamps/ai/02-color-block.webp', '撞色块柱灯', '圆柱体块叠加'],
  ['/lamps/ai/03-wave-layers.webp', '音浪波浪灯', '层叠曲面'],
  ['/lamps/ai/04-alabaster-sculpt.webp', '云石雕塑灯', '不规则薄片'],
  ['/lamps/ai/05-marble-columns.webp', '石材柱列灯', '垂向管柱'],
]

const REVIEW = [
  { k: '评审表', v: '2 张', n: '台灯 / 吊灯（客厅）' },
  { k: '评审结果', v: '打样', n: '图纸评级勾选「B.良好」' },
  { k: '孔雀石贴边', v: '2.5 mm', n: '图纸引线标注' },
  { k: '光源色温', v: '3000 K', n: 'LED 灯板 3.5W / 24V' },
]
const DRAW_A = [['总高', '450'], ['灯体', 'Ø80 / Ø60'], ['底座', 'Ø150'], ['发光段', '240 / 150']]
const DRAW_B = [['总跨', 'Ø1000'], ['总高', '590'], ['灯体', '273'], ['吊杆', 'Ø22 · A 处 Ø60']]

export default function P03InternLamps({ project, dossier }) {
  const [ia, setIa] = useState(0)
  const [ib, setIb] = useState(0)

  return (
    <div className="il-page">
      <section className="il-hero">
        <img src={A('/lamps/hero-malachite-ring.webp')} alt="孔雀石环形吊灯主视觉" loading="eager" />
        <div className="il-hero-shade" />
        <div className="il-hero-copy">
          <span className="il-kicker">03 / INTERNSHIP · VELUCE</span>
          <h1>一条线往材质里走，<br /><em>一条线往形态里跑</em></h1>
          <p>{project?.subtitle}</p>
        </div>
        <div className="il-hero-lines">
          <span><i>01</i> 孔雀石 × 拉丝香槟金 · 工程图纸</span>
          <span><i>02</i> AIGC 形态发散 · 系列化推演</span>
        </div>
      </section>

      {/* 对开图录：左右各一套独立主图与缩略条 */}
      <section className="il-split">
        <div className="il-half il-half-a" id="series-a">
          <header>
            <span>SERIES 01</span>
            <h2>孔雀石材质线</h2>
            <p>同一套材料语言落进六种空间：孔雀石贴边作视觉焦点，玻璃筒负责透光与扩散。</p>
          </header>
          <div className="il-stage">
            <Zoomable src={A(SERIES_A[ia][0])} alt={SERIES_A[ia][1]} eager>
              <img src={A(SERIES_A[ia][0])} alt={SERIES_A[ia][1]} loading="eager" />
            </Zoomable>
            <div className="il-stage-cap"><b>{pad(ia + 1)} / {pad(SERIES_A.length)}</b><span>{SERIES_A[ia][1]} · {SERIES_A[ia][2]}</span></div>
          </div>
          <div className="il-thumbs" role="group" aria-label="孔雀石线场景">
            {SERIES_A.map((s, i) => (
              <button type="button" key={s[0]} className={ia === i ? 'is-on' : ''} onClick={() => setIa(i)} aria-label={s[1]}>
                <img src={A(s[0])} alt="" loading="lazy" /><span>{pad(i + 1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="il-divider"><i /><span>02 SERIES / ONE PROJECT</span><i /></div>

        <div className="il-half il-half-b" id="series-b">
          <header>
            <span>SERIES 02</span>
            <h2>AI 形态线</h2>
            <p>用 AIGC 把形态快速铺开，再按材质与光影逻辑收成一组能彼此呼应的方案。</p>
          </header>
          <div className="il-stage il-stage-light">
            <Zoomable src={A(SERIES_B[ib][0])} alt={SERIES_B[ib][1]} eager>
              <img src={A(SERIES_B[ib][0])} alt={SERIES_B[ib][1]} loading="eager" />
            </Zoomable>
            <div className="il-stage-cap"><b>{pad(ib + 1)} / {pad(SERIES_B.length)}</b><span>{SERIES_B[ib][1]} · {SERIES_B[ib][2]}</span></div>
          </div>
          <div className="il-thumbs" role="group" aria-label="AI 形态线方案">
            {SERIES_B.map((s, i) => (
              <button type="button" key={s[0]} className={ib === i ? 'is-on' : ''} onClick={() => setIb(i)} aria-label={s[1]}>
                <img src={A(s[0])} alt="" loading="lazy" /><span>{pad(i + 1)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 评审表参数：把转录的图纸数值排成引线卡，不虚构扫描图 */}
      <section className="il-review" id="review">
        <SectionHead n="01" cn="评审表与参数" en="DRAWING RECORD" note="以下均为两张《新灯外观造型评审表》的图纸记录值，单位 mm；手写型号与完成日期字迹不确定，未转录为确定参数。" />
        <div className="il-metrics">
          {REVIEW.map((m) => (
            <div key={m.k} data-reveal><b>{m.v}</b><span>{m.k}</span><i>{m.n}</i></div>
          ))}
        </div>
        <div className="il-drawings">
          <article data-reveal>
            <h3>台灯 <i>TABLE LAMP</i></h3>
            <ul>{DRAW_A.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}</ul>
            <p>表面处理：优质不锈钢（DD-136D 拉丝香槟金）＋玻璃＋孔雀石；光源驱动 LED 灯板。</p>
          </article>
          <article data-reveal>
            <h3>客厅吊灯 <i>CHANDELIER</i></h3>
            <ul>{DRAW_B.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}</ul>
            <p>外贴 2.5 mm 孔雀石与（白云彩＋金箔）玻璃筒；吊灯另设 3000K LED 侧发光灯带。</p>
          </article>
          <article className="il-board" data-reveal>
            <Zoomable src={A('/ailamp-gallery-1.webp')} alt="《AI 灯具设计》原六格方案板">
              <img src={A('/ailamp-gallery-1.webp')} alt="《AI 灯具设计》原六格方案板" loading="lazy" />
            </Zoomable>
            <p>原方案板 · 六格分区索引（点击放大）</p>
          </article>
        </div>
      </section>

      {/* 落地进展：四条指定口径集中在这里，措辞以资料层为准 */}
      <section className="il-progress" id="progress">
        <SectionHead n="02" cn="落地进展" en="FROM REVIEW TO SAMPLING" />
        <div className="il-progress-grid">
          <ol className="il-steps">
            {(dossier?.build?.stages || []).map((s, i) => (
              <li key={s}><i>{pad(i + 1)}</i><b>{s}</b></li>
            ))}
          </ol>
          <div className="il-progress-note">
            <b>{dossier?.status?.label}</b>
            <p>{dossier?.build?.note}</p>
            <p className="il-caveat">{dossier?.research?.caveat}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
