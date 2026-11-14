// 手绘装饰符号组件 —— 每个项目一个专属的线稿草图符号
// 全部用粗笔触 + 圆角端点 + 轻微不对称，营造手绘草图质感，颜色跟随卡片文字色

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// 01 疗愈灯具：台灯 + 暖光光晕
const Lamp = () => (
  <svg viewBox="0 0 120 120" {...strokeProps}>
    <path d="M60 22 C58 34 56 42 52 50 L68 50 C64 42 62 34 60 22 Z" fill="currentColor" stroke="none" opacity="0.9" />
    <path d="M48 54 H72 L76 70 H44 Z" />
    <path d="M60 70 V96" />
    <path d="M44 96 H76" />
    <path d="M52 102 H68" />
    {/* 光晕 */}
    <path d="M36 56 A30 30 0 0 1 84 56" opacity="0.5" strokeWidth="2" strokeDasharray="3 5" />
    <path d="M30 70 A40 40 0 0 1 90 70" opacity="0.35" strokeWidth="2" strokeDasharray="2 6" />
    <path d="M20 44 L28 50 M100 44 L92 50" opacity="0.5" strokeWidth="2" />
  </svg>
)

// 02 慢行者：蜗牛 + 爬行轨迹
const Snail = () => (
  <svg viewBox="0 0 120 120" {...strokeProps}>
    {/* 轨迹 */}
    <path d="M18 92 H88" opacity="0.4" strokeWidth="2" strokeDasharray="4 6" />
    {/* 身体 */}
    <path d="M40 86 C56 86 78 82 90 70 L96 66 L90 62 C74 62 52 68 40 74 Z" />
    {/* 触角 */}
    <path d="M92 64 L100 54 M88 62 L94 50" strokeWidth="2.5" />
    <circle cx="101" cy="53" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="95" cy="49" r="2.5" fill="currentColor" stroke="none" />
    {/* 壳螺旋 */}
    <path d="M50 78 C38 76 32 66 36 56 C40 46 52 42 60 48 C68 54 66 66 58 68 C52 70 48 66 50 62" strokeWidth="3" />
  </svg>
)

// 03 UI界面：窗口 + 光标
const Window = () => (
  <svg viewBox="0 0 120 120" {...strokeProps}>
    <rect x="24" y="30" width="72" height="56" rx="4" />
    <path d="M24 42 H96" />
    <circle cx="33" cy="36" r="2" fill="currentColor" stroke="none" />
    <circle cx="42" cy="36" r="2" fill="currentColor" stroke="none" />
    <circle cx="51" cy="36" r="2" fill="currentColor" stroke="none" />
    {/* 内容块 */}
    <path d="M32 52 H66 M32 60 H80 M32 68 H56" strokeWidth="2" opacity="0.55" />
    {/* 光标 */}
    <path d="M74 62 L88 78 L82 80 L72 68 Z" fill="currentColor" stroke="none" />
  </svg>
)

// 04 模块化座椅：椅子 + 榫卯节点
const Chair = () => (
  <svg viewBox="0 0 120 120" {...strokeProps}>
    <path d="M38 34 H82 V50 H38 Z" />
    <path d="M42 50 V86" />
    <path d="M78 50 V86" />
    <path d="M36 86 H84" />
    <path d="M36 96 H84" />
    {/* 靠背 */}
    <path d="M38 34 V24 M62 34 V22 M82 34 V24" />
    <path d="M38 26 H82" />
    {/* 榫卯节点 */}
    <circle cx="42" cy="50" r="3" fill="currentColor" stroke="none" />
    <circle cx="78" cy="50" r="3" fill="currentColor" stroke="none" />
    <circle cx="42" cy="86" r="3" fill="currentColor" stroke="none" />
    <circle cx="78" cy="86" r="3" fill="currentColor" stroke="none" />
  </svg>
)

// 05 AIGC：星芒发散
const Spark = () => (
  <svg viewBox="0 0 120 120" {...strokeProps}>
    {/* 放射线 */}
    <path d="M60 60 L60 20 M60 60 L98 44 M60 60 L96 82 M60 60 L60 100 M60 60 L22 82 M60 60 L22 44" strokeWidth="2.5" opacity="0.7" />
    {/* 中心 */}
    <circle cx="60" cy="60" r="10" />
    <circle cx="60" cy="60" r="4" fill="currentColor" stroke="none" />
    {/* 散点 */}
    <circle cx="60" cy="16" r="3" fill="currentColor" stroke="none" />
    <circle cx="100" cy="60" r="3" fill="currentColor" stroke="none" />
    <circle cx="86" cy="92" r="3" fill="currentColor" stroke="none" />
    <circle cx="34" cy="92" r="3" fill="currentColor" stroke="none" />
    <circle cx="20" cy="60" r="3" fill="currentColor" stroke="none" />
    <circle cx="34" cy="28" r="3" fill="currentColor" stroke="none" />
  </svg>
)

// 06 AI 灯具：悬挂吊灯
const Pendant = () => (
  <svg viewBox="0 0 120 120" {...strokeProps}>
    <path d="M60 16 V40" />
    <circle cx="60" cy="14" r="3" fill="currentColor" stroke="none" />
    {/* 灯罩 */}
    <path d="M46 44 H74 L66 74 H54 Z" />
    <path d="M54 74 H66" />
    <path d="M56 78 H64" />
    {/* 光 */}
    <path d="M60 84 V96" strokeWidth="2" opacity="0.5" strokeDasharray="2 5" />
    <path d="M40 52 A28 28 0 0 1 80 52" opacity="0.4" strokeWidth="2" strokeDasharray="3 5" />
    <path d="M38 40 L46 46 M82 40 L74 46" opacity="0.5" strokeWidth="2" />
  </svg>
)

// 08 猫冰 CAT-ICE：猫脸 + 冰块
const Cat = () => (
  <svg viewBox="0 0 120 120" {...strokeProps}>
    {/* 耳朵 */}
    <path d="M36 44 L34 24 L52 36" />
    <path d="M84 44 L86 24 L68 36" />
    {/* 脸 */}
    <path d="M30 52 C30 78 42 92 60 92 C78 92 90 78 90 52 Z" />
    {/* 左耳冰块 */}
    <rect x="30" y="22" width="12" height="12" rx="2" transform="rotate(-8 36 28)" />
    <path d="M32 26 L40 30 M32 32 L40 36" strokeWidth="1.5" opacity="0.5" />
    {/* 眼睛 */}
    <path d="M44 62 C46 58 50 58 52 62 M68 62 C70 58 74 58 76 62" strokeWidth="3" />
    {/* 鼻子嘴 */}
    <path d="M60 70 L60 74 M60 74 C56 78 52 76 52 76 M60 74 C64 78 68 76 68 76" strokeWidth="2.5" />
    {/* 身体条纹 */}
    <path d="M38 78 C44 82 50 82 54 78 M66 78 C70 82 76 82 82 78" strokeWidth="2" opacity="0.5" />
  </svg>
)

// 键 = 项目编号。编号在 2026-09 重排过一次（三个灯具项目并到一起），
// 所以这里的对应关系跟着挪了位置，但每个项目配的符号没变。
const doodles = {
  '01': Lamp, // 《心景》疗愈灯具
  '02': Snail, // 《慢行者》
  '03': Pendant, // 实习灯具设计
  // '04'（情绪疗愈灯具）沿用默认的 Spark —— 它原先就没有专属符号，
  // 这里保持原样不变动观感；要单独画一个再说。
  '05': Window, // UI界面流程设计
  '06': Chair, // 模块化木质座椅
  '07': Spark, // 产品概念设计
  '08': Cat, // 猫冰 CAT-ICE : THERMAL LAB
}

/**
 * 手绘装饰符号，按项目 id 渲染对应线稿草图
 * @param {string} id 项目 id，如 '01'
 */
export default function ProjectDoodle({ id, className = '' }) {
  const Doodle = doodles[id] || Spark
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <Doodle />
    </div>
  )
}
