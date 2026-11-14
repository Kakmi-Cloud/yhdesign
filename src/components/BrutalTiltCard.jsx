import ProfileCard from './ProfileCard'

/**
 * BrutalTiltCard —— 通用“机能风 3D 卡片”装配件
 *
 * 把 ProfileCard 的 Tilt/Glow 能力复用到任意内容卡：
 * - 外层 div 承接 grid 槽位 / 交互语义（role / onClick / span 等）；
 * - 底层垫片承载物理硬影（与 3D 动画解耦）；
 * - ProfileCard 提供指针倾斜 + 卡面反光 + 背后辉光；
 * - 内容包裹层负责裁剪（巨型索引/水印不外泄）。
 *
 * 约束：任何祖级容器不可 overflow-hidden，否则辉光会被切断。
 *
 * Props：
 * - className:      外层 div 类（栅格跨列、布局、光标、focus 等）
 * - cardClassName:  ProfileCard 卡面类（边框、圆角、文字色）
 * - innerGradient:  卡面背景渐变
 * - contentClassName: 内容裁剪层的内边距
 * - spacerClass:    垫片偏移（默认向右下 12px）
 * - spacerColor:    垫片底色（默认实体黑；浅色卡可传同色系的浅色，避免黑硬影抢戏）
 * - glow / glowColor / glowOpacity / tiltMax: 辉光与倾斜参数
 */
export default function BrutalTiltCard({
  children,
  className = '',
  cardClassName = '',
  innerGradient = 'linear-gradient(145deg, #151515 0%, #1c1d20 100%)',
  contentClassName = 'p-6 md:p-8',
  spacerClass = 'translate-x-3 translate-y-3',
  spacerColor = '#111111',
  glow = true,
  glowColor = '#E67E33',
  glowOpacity = 0.5,
  tiltMax = 6,
  ...rest
}) {
  return (
    <div className={`relative ${className}`} {...rest}>
      {/* 底层垫片：实体色块负责物理厚度（颜色可配，浅色卡不该配纯黑硬影） */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 ${spacerClass}`}
        style={{ backgroundColor: spacerColor }}
      />

      {/* 3D 卡面 */}
      <ProfileCard
        className={`relative z-10 block w-full rounded-none ${cardClassName}`}
        innerGradient={innerGradient}
        behindGlowEnabled={glow}
        glowColor={glowColor}
        glowOpacity={glowOpacity}
        tiltMax={tiltMax}
      >
        {/* 内容裁剪层：复刻原卡片 overflow-hidden 的收边行为 */}
        <div className={`relative flex h-full w-full flex-col overflow-hidden ${contentClassName}`}>
          {children}
        </div>
      </ProfileCard>
    </div>
  )
}
