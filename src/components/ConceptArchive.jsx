import SketchFolderGallery from './SketchFolderGallery'

/**
 * ConceptArchive —— 概念草图档案系统（酸性机能 / 重工业风）
 *
 * 12 栏 CSS Grid 布局：
 *  - 左（lg:col-span-4）：黑底概念卡（荧光橙硬切阴影），说明档案内容
 *  - 右（lg:col-span-8）：SketchFolderGallery V2（文件夹 + 图纸带）
 *
 * 数据源：
 *  - items: [{ image|src, label|tag, text|sub, steps?: [] }]
 *    每个 item 对应一个文件夹；有 steps 时步骤打平成该文件夹下的图纸卡
 *  - moodImage / moodTag / keywords —— 可选灵感意象，渲染在概念卡内
 */
export default function ConceptArchive({
  items = [],
  archiveNo = 'ARCHIVE-01',
  enTitle = 'Design Process',
  cnTitle = '物理形态推演',
  leadCopy = '展开右侧的档案夹，查看方阵、叠木、栖木三种形态的初始物理结构推演。',
  moodImage = null,
  moodTag = '',
  keywords = [],
  hint = '点击文件夹切换系列 · 点击图纸放大查看 · Esc 关闭',
  className = '',
}) {
  // V2 数据：folders 为系列标签，papers 为图纸卡（带 folder 索引；无 steps 时主图为一张卡）
  const folders = items.map((it) => ({
    tag: it.tag || it.label,
    name: it.folderName,
    sub: it.sub || it.text,
  }))

  const papers = items.flatMap((it, fi) => {
    const tag = it.tag || it.label
    const sub = it.sub || it.text
    if (Array.isArray(it.steps) && it.steps.length) {
      return it.steps.map((st) => ({
        src: st.img,
        tag: st.tag || st.e,
        sub: st.t,
        num: st.n || String(st.e || ''),
        folder: fi,
      }))
    }
    return [{ src: it.image || it.src, tag, sub, num: '01', folder: fi }]
  })

  return (
    <div className={`relative grid grid-cols-12 gap-6 md:gap-8 ${className}`}>
      {/* ===== 左侧：概念说明卡（占 4 列） ===== */}
      <div className="col-span-12 lg:col-span-4">
        <div className="hidden flex-col justify-center border-r-[4px] border-dashed border-[#111] pr-8 lg:flex">
          <div
            className="bg-[#111] p-6 text-white"
            style={{ border: '3px solid #E67E33', boxShadow: '7px 7px 0 #E67E33' }}
          >
            {/* 档案编号 */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="inline-block px-2 py-1 font-mono text-[10px] font-black uppercase tracking-widest text-[#111]" style={{ backgroundColor: '#E67E33' }}>
                {archiveNo}
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                Sketch Folder
              </span>
            </div>

            <h3 className="text-2xl font-black leading-[1.15] tracking-tight md:text-[26px]" style={{ color: '#FFFFFF' }}>
              <span style={{ color: '#E67E33' }}>{enTitle}</span>
              <br />
              {cnTitle}
            </h3>

            {/* 灵感意象（可选） */}
            {moodImage && (
              <div
                className="relative mt-4 h-[104px] overflow-hidden"
                style={{ border: '2px solid rgba(255,255,255,0.85)' }}
              >
                <img
                  src={moodImage}
                  alt={moodTag || 'mood reference'}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                {moodTag && (
                  <span
                    className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 font-mono text-[8px] font-black tracking-[0.14em]"
                    style={{ backgroundColor: '#111111', color: '#E67E33' }}
                  >
                    {moodTag}
                  </span>
                )}
              </div>
            )}

            <p className="mt-4 text-[13px] font-medium leading-relaxed" style={{ color: '#B9B9B9' }}>
              {leadCopy}
            </p>

            {keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {keywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-sm px-2 py-0.5 text-[10px] font-bold"
                    style={{ color: '#E67E33', border: '1px solid rgba(230, 126, 51,0.45)' }}
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 图例清单（桌面端） */}
          <div className="mt-6 space-y-1.5 pl-1">
            {items.map((it, i) => (
              <div key={it.label || it.tag || i} className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.1em] text-black/55">
                <span className="text-black/30">{String(i + 1).padStart(2, '0')}</span>
                <span className="truncate">{it.label || it.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 右侧：文件夹 + 图纸带（占 8 列，浅底展示参考视觉） ===== */}
      <div className="col-span-12 lg:col-span-8">
        <div className="relative">
          {/* 背景工业装饰 */}
          <div className="pointer-events-none absolute -right-2 -top-8 select-none font-mono text-5xl font-black uppercase tracking-tight text-black/[0.05] md:text-6xl">
            Sketch_Files
          </div>

          {/* 移动端标题（桌面概念卡在 lg 隐藏时兜底） */}
          <div className="mb-4 lg:hidden">
            <span className="inline-block px-2 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-[#111]" style={{ backgroundColor: '#E67E33' }}>
              {archiveNo}
            </span>
            <h3 className="mt-2 text-xl font-black leading-tight" style={{ color: '#111111' }}>
              <span style={{ color: '#111111' }}>{enTitle}</span> / {cnTitle}
            </h3>
          </div>

          <SketchFolderGallery folders={folders} papers={papers} />

          {/* 底部操作提示与档案清单（移动端左卡折叠时兜底展示） */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 lg:hidden">
            {items.map((it, i) => (
              <span key={it.label || it.tag || i} className="font-mono text-[9px] font-black tracking-[0.1em] text-black/60">
                {String(i + 1).padStart(2, '0')} / {it.label || it.tag}
              </span>
            ))}
          </div>
          <p className="mt-3 hidden font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-black/35 lg:block">
            {hint}
          </p>
        </div>
      </div>
    </div>
  )
}
