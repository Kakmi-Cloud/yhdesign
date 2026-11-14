import ProfileCard from './ProfileCard'

/**
 * HeroProfileWrapper —— 首屏 Profile 卡的“机能风装配层”
 *
 * 职责（三项核心修复）：
 * 1. 3D 上下文：为 <ProfileCard /> 提供 perspective 透视；
 *    自身与所有上层容器禁止 overflow-hidden / overflow-clip。
 * 2. 物理厚度分离：硬切阴影由独立“底层垫片”承载（translate 纯黑色块），
 *    与 ProfileCard 的 Transform 动画解耦，两不相扰。
 * 3. 机能风参数注入：innerGradient 压成纯黑高反差渐变，
 *    卡面追加 4px 粗黑边 + 直角，辉光切成荧光橙酸质。
 *
 * 用法：
 *   <HeroProfileWrapper>
 *     {/* 贴纸与内容 ... *\/}
 *   </HeroProfileWrapper>
 *
 * 若无需辉光（behindGlowEnabled）或想换阴影偏移，直接改下面 props / 类即可。
 */
export default function HeroProfileWrapper({
  children,
  className = '',
  // —— 12 栏栅格定位：占满整行（移动端），桌面右 4 栏（用户提示词约束） ——
  glowColor = '#E67E33',
  shadowClassName = 'translate-x-3 translate-y-3',
  perspective = '1200px',
}) {
  return (
    // 栅格插槽：col-span-12 lg:col-span-4，垂直居中；不设任何裁剪
    <div
      className={`relative z-10 col-span-12 flex items-center justify-center pb-14 lg:col-span-4 lg:pb-0 ${className}`}
    >
      {/* 3D 舞台：perspective 只作用于 ProfileCard 的 rotateX/rotateY */}
      <div data-profile-stage className="relative w-full max-w-[420px]" style={{ perspective }}>
        {/* 底层垫片（Decoupled Brutalist Shadow）：实体黑块负责“物理厚度” */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 bg-[#111] ${shadowClassName}`}
        />

        {/* 机能风 ProfileCard：z-10 浮在垫片之上，4px 黑边 + 直角 + 纯黑高反差渐变 */}
        <ProfileCard
          className="relative z-10 border-[4px] border-[#111] rounded-none"
          innerGradient="linear-gradient(145deg, #111111 0%, #1d1d1f 55%, #26282e 100%)"
          behindGlowEnabled
          glowColor={glowColor}
          tiltMax={7}
        >
          {/* 内容包裹层：白字 + 内边距；贴纸类装饰通过 absolute 溢出到卡外 */}
          <div className="relative flex h-full flex-col p-6 text-white md:p-8">{children}</div>
        </ProfileCard>
      </div>
    </div>
  )
}
