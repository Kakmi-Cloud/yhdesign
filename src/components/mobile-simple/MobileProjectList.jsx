/**
 * 手机端首访层（极简·实用版）：一屏白底项目列表。
 *
 * 换掉了原来的「概念播放器」卡片轮盘：手机上不做物理动画、不做多层入口，
 * 一个可点目标只对应一个动作 —— 点项目行 = 进这个项目的详情页；
 * 底部一个按钮 = 简历与能力长页。
 * 桌面端不渲染（由 App.jsx 的 isMobile 控制），所以这里不写任何桌面端规则。
 */
export default function MobileProjectList({ projects = [], onOpenProject, onOpenResume, onOpenContact }) {
  return (
    <div className="ms-overlay" aria-label="项目列表">
      <header className="ms-head">
        <span className="ms-brand">YH.</span>
        <span className="ms-who">
          <strong>杨鸿</strong>
          <span>产品设计师 · 26 届</span>
        </span>
      </header>

      <p className="ms-lede">8 份项目文件 · 产品 / 功能 / 调研 / 进展</p>

      <ul className="ms-list">
        {projects.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className="ms-row"
              data-action="open-project"
              onClick={() => onOpenProject?.(p, i)}
            >
              <img className="ms-thumb" src={p.image} alt="" loading="lazy" decoding="async" />
              <span className="ms-body">
                <span className="ms-id">{p.id}</span>
                <span className="ms-title">{p.title}</span>
                <span className="ms-meta">{p.category}</span>
                <span className="ms-status">{p.statusLabel || '设计资料'}</span>
              </span>
              <svg className="ms-chev" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <div className="ms-foot">
        <p className="ms-note">所有项目所述功能均可实现 · 进展以现有资料为准</p>
        <button type="button" className="ms-msg" data-action="open-contact" onClick={() => onOpenContact?.()}>
          给我留言 ✎
        </button>
        <button type="button" className="ms-cta" data-action="open-resume" onClick={() => onOpenResume?.()}>
          简历与能力 ↓
        </button>
      </div>
    </div>
  )
}
