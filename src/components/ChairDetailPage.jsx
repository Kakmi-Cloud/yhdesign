import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowLeft, ArrowRight, X, Plus, Minus } from 'lucide-react'
import { asset } from '../assetPath'
import './ChairDetailPage.css'
import DetailFold from './DetailFold'

const chairAsset = (file) => asset(`/chair/${file}`)
const COLOURS = [
  { name: '燕麦灰', en: 'Oat grey', hex: '#b8b5aa', image: 'swatch-warmgray.webp', note: '把安静，留在日常里。', alt: '燕麦灰坐垫和靠背，搭配浅色实木框架' },
  { name: '深海蓝', en: 'Deep blue', hex: '#34455b', image: 'swatch-navy.webp', note: '给阅读的片刻，一点深邃。', alt: '深海蓝坐垫和靠背，搭配浅色实木框架' },
  { name: '苔原绿', en: 'Moss green', hex: '#809b71', image: 'swatch-green.webp', note: '让家，多一分自然。', alt: '苔原绿坐垫和靠背，搭配浅色实木框架' },
  { name: '朱砂红', en: 'Vermilion red', hex: '#bb3a34', image: 'swatch-red.webp', note: '灰色靠背，搭一抹明亮的红。', alt: '朱砂红坐垫与灰色靠背，搭配浅色实木框架' },
]
const MODULES = [
  { title: '抽出坐垫，换一种坐法。', text: '坐垫模块可整块抽出，当作蒲团单独使用。从椅上到地面，让休息的方式随心而变。' },
  { title: '插拔靠背，找到你的支撑。', text: '靠背沿滑槽上下插拔，改变腰背支撑的高度与角度。读一本书，或只是发会儿呆，都有适合自己的倚靠。' },
  { title: '拆装搬运，熟悉的陪伴继续。', text: '全椅无外露五金，以榫卯为主、连接件为辅，可反复拆装与搬运。换一个住处，也能带走熟悉的一隅。' },
]

export default function ChairDetailPage({ onClose }) {
  const [selected, setSelected] = useState(0)
  const [openModule, setOpenModule] = useState(0)
  const [zoom, setZoom] = useState(null)
  const rootRef = useRef(null)
  const dialogRef = useRef(null)
  const lastZoomTrigger = useRef(null)
  const sections = useRef({})
  const colour = COLOURS[selected]

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
    const oldTitle = document.title
    const oldOverflow = document.body.style.overflow
    document.title = '间坐 · 模块化休闲椅 | 杨鸿作品集'
    document.body.style.overflow = 'hidden'
    return () => { document.title = oldTitle; document.body.style.overflow = oldOverflow }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (zoom && dialog && !dialog.open) dialog.showModal()
  }, [zoom])

  const go = (key) => {
    const target = sections.current[key]
    if (!target || !rootRef.current) return
    if (target.tagName === 'DETAILS') target.open = true
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rootRef.current.scrollTo({ top: target.offsetTop - 28, behavior: reduce ? 'instant' : 'smooth' })
  }
  const showImage = (image, caption, event) => {
    lastZoomTrigger.current = event.currentTarget
    setZoom({ image: chairAsset(image), caption })
  }
  const closeImage = () => {
    dialogRef.current?.close()
    setZoom(null)
    lastZoomTrigger.current?.focus({ preventScroll: true })
  }
  const selectFromCard = (index) => { setSelected(index); go('colours') }

  return (
    <div className="chair-page" ref={rootRef} tabIndex={-1} data-lenis-prevent aria-label="模块化休闲椅产品介绍">
      <section className="chair-hero pt-14 lg:pt-0">
        <header className="chair-nav chair-shell">
          <button className="chair-monogram" onClick={onClose} aria-label="返回杨鸿作品集">j<span>.</span></button>
          <nav aria-label="座椅页面导航">
            <button onClick={() => go('idea')}>设计理念</button>
            <button onClick={() => go('colours')}>软包配色</button>
            <button onClick={() => go('modules')}>模块结构</button>
            <button onClick={() => go('materials')}>材质工艺</button>
          </nav>
          <button className="chair-return" onClick={onClose}><ArrowLeft size={16} /><span>返回作品集</span></button>
        </header>
        <div className="chair-hero-stage chair-shell">
          <span className="chair-hero-edition">JIANZUO / MODULAR LOUNGE CHAIR</span>
          <div className="chair-product-shadow" aria-hidden="true" />
          <img className="chair-hero-product" src={chairAsset('chair-cutout.webp')} alt="灰色软包与浅色实木框架的模块化休闲椅" width="1000" height="1125" fetchPriority="high" />
          <div className="chair-hero-word"><h1>sit easy<span>.</span></h1><p>间坐 · 模块化休闲椅</p></div>
          <div className="chair-hero-bottom"><p>让框架留下。<br />让生活常新。</p><button className="chair-pill" onClick={() => go('idea')}>认识这把椅子 <ArrowUpRight size={17} /></button></div>
        </div>
      </section>

      <main>
        <DetailFold title="一点新颜色，一点新心情。" meta="软包配色 · SAME CHAIR. DIFFERENT MOODS.">
        <section className="chair-collection chair-shell" aria-labelledby="chair-collection-title">
          <div className="chair-heading-row"><div><p className="chair-kicker">SAME CHAIR. DIFFERENT MOODS.</p><h2 id="chair-collection-title">一点新颜色，一点新心情。</h2></div><span className="chair-small-note">同一框架，自由换装。</span></div>
          <div className="chair-collection-grid">
            {COLOURS.slice(0, 3).map((item, index) => (
              <article className="chair-collection-card" key={item.name}>
                <button className="chair-collection-photo" onClick={() => selectFromCard(index)} aria-label={`查看${item.name}配色`}><img src={chairAsset(item.image)} alt={item.alt} width="400" height="450" loading="lazy" /><span>{`0${index + 1}`}</span></button>
                <div className="chair-card-caption"><h3>{item.name}<span>{item.en}</span></h3><button onClick={() => selectFromCard(index)} aria-label={`选择${item.name}`}>看看配色 <ArrowUpRight size={14} /></button></div>
              </article>
            ))}
          </div>
        </section>
        </DetailFold>

        <DetailFold title="把“换椅子”，拆成“换软包”。" meta="01 / 设计理念 · A LITTLE CHANGE, A LONGER STORY." anchorRef={el => { sections.current.idea = el }}>
        <section className="chair-idea chair-shell" aria-labelledby="chair-idea-title">
          <div className="chair-idea-top"><span className="chair-kicker">A LITTLE CHANGE, A LONGER STORY.</span><span className="chair-section-no">01 / 设计理念</span></div>
          <div className="chair-idea-grid"><h2 id="chair-idea-title">把“换椅子”，<br />拆成<span>“换软包”。</span></h2><div><p className="chair-idea-lead">喜欢可以变。<br />一张好椅子，可以一直在。</p><p>家具的大件成本在框架，易损耗、易过时的部分在软包。模块化让低成本的软包承担颜色与坐感的变化，框架则可以长期沿用，延长产品的实际使用寿命。</p></div></div>
        </section>
        </DetailFold>

        <section className="chair-config chair-shell" ref={el => { sections.current.colours = el }} aria-labelledby="chair-config-title">
          <div className="chair-heading-row"><div><p className="chair-kicker">MAKE IT YOURS</p><h2 id="chair-config-title">今天，想坐哪一种心情？</h2></div><span className="chair-section-no">02 / 软包配色</span></div>
          <div className="chair-config-panel">
            <div className="chair-config-copy"><span className="chair-config-brand">Jianzuo lounge</span><h3>间坐<span>可替换软包休闲椅</span></h3><div className="chair-swatches" role="group" aria-label="选择软包配色">{COLOURS.map((item, index) => <button key={item.name} style={{ '--swatch': item.hex }} className={selected === index ? 'is-selected' : ''} aria-label={item.name} aria-pressed={selected === index} onClick={() => setSelected(index)}><span /></button>)}</div><div className="chair-selected-text" aria-live="polite" aria-atomic="true"><h4>{colour.name}<span>{colour.en}</span></h4><p>{colour.note}</p></div><div className="chair-config-caption"><p>白橡实木框架<br />棉麻混纺软包 · 自由替换</p><button className="chair-pill chair-pill-outline" onClick={() => go('modules')}>看看怎么拆 <ArrowUpRight size={16} /></button></div></div>
            <div className="chair-config-visual"><span className="chair-config-number" aria-hidden="true">0{selected + 1}</span><img key={colour.image} src={chairAsset(colour.image)} alt={colour.alt} width="400" height="450" loading="lazy" /><div className="chair-config-controls"><span>0{selected + 1} / 04</span><div><button aria-label="上一种配色" onClick={() => setSelected((selected + 3) % 4)}><ArrowLeft size={17} /></button><button aria-label="下一种配色" onClick={() => setSelected((selected + 1) % 4)}><ArrowRight size={17} /></button></div></div></div>
            <div className="chair-config-detail"><img src={chairAsset('scene-shadow.webp')} alt="实木椅架与软包的触感细节" loading="lazy" /><p>一硬一软，<br />刚好相衬。</p></div>
          </div>
        </section>

        <DetailFold title="拆得开，才有更多可能。" meta="03 / 模块结构 · LESS TO REPLACE. MORE TO KEEP." anchorRef={el => { sections.current.modules = el }}>
        <section className="chair-modules chair-shell" aria-labelledby="chair-modules-title">
          <div className="chair-heading-row"><div><p className="chair-kicker">LESS TO REPLACE. MORE TO KEEP.</p><h2 id="chair-modules-title">拆得开，才有更多可能。</h2></div><span className="chair-section-no">03 / 模块结构</span></div>
          <div className="chair-module-panel"><button className="chair-structure" onClick={e => showImage('structure.webp', '模块拆解 · 结构示意', e)} aria-label="放大模块拆解图"><img src={chairAsset('structure.webp')} alt="独立靠背、坐垫模块与实木框架的结构拆解示意" loading="lazy" /><span className="chair-expand"><Plus size={20} /></span><span className="chair-figure-label">一副框架，两块软包。</span></button><div className="chair-accordions">{MODULES.map((item, index) => <div className="chair-accordion" key={item.title}><h3><button onClick={() => setOpenModule(openModule === index ? null : index)} aria-expanded={openModule === index} aria-controls={`chair-module-${index}`}><span>0{index + 1}</span>{item.title}{openModule === index ? <Minus size={17} /> : <Plus size={17} />}</button></h3><div id={`chair-module-${index}`} hidden={openModule !== index}><p>{item.text}</p></div></div>)}<p className="chair-module-end">换颜色，也换一种生活的节奏。</p></div></div>
        </section>
        </DetailFold>

        <DetailFold title="触感，也是一种语言。" meta="材质工艺 · NATURALLY, COMFORTABLE." anchorRef={el => { sections.current.materials = el }}>
        <section className="chair-materials" aria-labelledby="chair-materials-title">
          <div className="chair-material-grid chair-shell"><div className="chair-material-photo"><img src={chairAsset('scene-warm.webp')} alt="温暖日光下的白橡木座椅和边桌" loading="lazy" /><span>Made for slow moments.</span></div><div className="chair-material-copy"><p className="chair-kicker">NATURALLY, COMFORTABLE.</p><h2 id="chair-materials-title">触感，<br />也是一种<span>语言。</span></h2><dl><div><dt>白橡实木</dt><dd>原木清漆，可选深胡桃色。保留木纹的自然走向，让每一副框架有自己的表情。</dd></div><div><dt>棉麻混纺</dt><dd>粗织肌理与实木形成触感对比，柔软的日常，也有细节可循。</dd></div><div><dt>高回弹棉花填充</dt><dd>以柔软的包裹感承接身体，让每一次落座，都松弛一点。</dd></div></dl></div></div>
        </section>
        </DetailFold>

        <DetailFold title="不必很大，自成一隅。" meta="小户型 / 租住的家 · A LITTLE CORNER, ALL YOURS.">
        <section className="chair-living chair-shell" aria-labelledby="chair-living-title"><div className="chair-heading-row"><div><p className="chair-kicker">A LITTLE CORNER, ALL YOURS.</p><h2 id="chair-living-title">不必很大，自成一隅。</h2></div><p className="chair-living-intro">给小户型、租住的家，<br />也给客厅与书房里，想慢下来的人。</p></div><div className="chair-living-photo"><img src={chairAsset('scene-dark.webp')} alt="深色休闲椅安放在木柜前，光影划过房间" loading="lazy" /><div><span>YOUR EVERYDAY RETREAT</span><p>日子慢下来。<br />就从坐下开始。</p></div></div></section>
        </DetailFold>

        <DetailFold title="从一条线，到生活的一部分。" meta="设计手记 · BEHIND THE CHAIR">
        <section className="chair-process chair-shell"><div><p className="chair-kicker">BEHIND THE CHAIR</p><h2>从一条线，<br />到生活的一部分。</h2><p>自然的有机轮廓、传统木作的连接方式，以及可以替换的软包。在一次次推敲里，让造型、结构与日常使用慢慢靠近。</p><button className="chair-pill chair-pill-outline" onClick={e => showImage('process.webp', '设计手记 · 从灵感到最终方案', e)}>展开设计草图 <ArrowUpRight size={16} /></button></div><button className="chair-process-image" onClick={e => showImage('process.webp', '设计手记 · 从灵感到最终方案', e)} aria-label="放大设计过程草图"><img src={chairAsset('process.webp')} alt="设计过程草图：灵感、造型探索、模块结构与配色方案" loading="lazy" /><span className="chair-expand"><Plus size={20} /></span></button></section>
        </DetailFold>
      </main>

      <footer className="chair-footer"><div className="chair-shell"><div className="chair-footer-top"><p>good things<span>stay.</span></p><div><span>让框架留下，让生活常新。</span><button className="chair-pill" onClick={onClose}><ArrowLeft size={16} /> 返回作品集</button></div></div><div className="chair-footer-bottom"><span>间坐 / JIANZUO</span><span>模块化休闲椅 · 产品设计</span><button onClick={() => rootRef.current?.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>回到顶部 ↑</button></div></div></footer>

      <dialog ref={dialogRef} className="chair-lightbox" onCancel={event => { event.preventDefault(); closeImage() }} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); event.preventDefault(); closeImage() } }} onClick={event => { if (event.target === dialogRef.current) { const b = event.currentTarget.getBoundingClientRect(); if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) closeImage() } }}><div className="chair-lightbox-bar"><p>{zoom?.caption}</p><button onClick={closeImage} aria-label="关闭大图"><X size={23} /></button></div>{zoom && <img src={zoom.image} alt={zoom.caption} />}</dialog>
    </div>
  )
}
