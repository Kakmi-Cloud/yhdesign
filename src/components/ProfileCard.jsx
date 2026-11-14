import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'

/**
 * ProfileCard —— 自带 3D Tilt 与 Glow 的通用卡片壳
 *
 * 设计契约（使用方必须遵守）：
 * 1. 所有祖先容器不得设置 overflow-hidden / overflow-clip，
 *    否则 behindGlow（背后辉光）与 Z 轴破框会被直接切断。
 * 2. 最近的非裁剪父级必须提供 perspective（3D 透视），
 *    例如 style={{ perspective: '1200px' }} 或 Tailwind perspective-[1200px]，
 *    否则 rotateX/rotateY 只是平面形变，3D 景深不成立。
 * 3. 本组件不承载硬切阴影；物理厚度请由外层“底层垫片”承担（见 HeroProfileWrapper）。
 *
 * Props:
 * - innerGradient: 卡面背景（机能风传纯黑高反差渐变）
 * - behindGlowEnabled: 是否渲染背后辉光（需祖先无裁剪）
 * - glowColor: 辉光主色
 * - tiltMax: 最大倾斜角度（deg）
 * - className: 追加到卡面的样式（可注入 border-[4px] border-[#111] rounded-none）
 * - children: 卡面内容（建议自行包裹一层带 padding 的相对容器）
 */
export default function ProfileCard({
  children,
  className = '',
  style = {},
  innerGradient = 'linear-gradient(145deg, #111111 0%, #222222 100%)',
  behindGlowEnabled = true,
  glowColor = '#E67E33',
  glowOpacity = 0.7,
  tiltMax = 7,
}) {
  const ref = useRef(null)

  // 指针归一化坐标：-1..1（横向/纵向），0 为卡片中心
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  // 倾斜角：鼠标在哪边，卡面向哪边仰起；低刚度弹簧平滑追位
  // 全站统一正向：不再随指针倾斜，tiltMax 仅保留参数位以兼容调用方
  const rotateX = useSpring(useTransform(py, () => 0), { stiffness: 160, damping: 18, mass: 0.6 })
  const rotateY = useSpring(useTransform(px, () => 0), { stiffness: 160, damping: 18, mass: 0.6 })

  // 辉光锚点（百分比坐标，跟随指针；背面辉光层与卡面反光共用）
  const gxPct = useTransform(px, (v) => `${(v + 1) * 50}%`)
  const gyPct = useTransform(py, (v) => `${(v + 1) * 50}%`)

  // 背后辉光：从指针位置向外扩散的荧光色雾（mix-blend-screen 叠在卡面外缘）
  const behindGlowBg = useMotionTemplate`radial-gradient(58% 58% at ${gxPct} ${gyPct}, ${glowColor} 0%, transparent 72%)`

  // 卡面金属反光：只在卡内跟着指针走的微光层
  const sheenBg = useMotionTemplate`radial-gradient(42% 42% at ${gxPct} ${gyPct}, rgba(255,255,255,0.15) 0%, transparent 68%)`

  function handleMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    px.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    py.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }

  function handleLeave() {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        background: innerGradient,
        transformOrigin: 'center center',
        ...style,
      }}
    >
      {children}

      {/* 卡面反光：跟随指针，叠加在内容之上但不可交互 */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] mix-blend-screen"
        style={{ background: sheenBg }}
      />

      {/* 背后辉光：压到卡片平面后方（translateZ 负值 + preserve-3d），
          卡面不透明背景自动遮住内部光晕，只让边缘外扩的荧光晕透出；
          因此祖级容器禁止 overflow-hidden，否则光晕会被裁掉 */}
      {behindGlowEnabled && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 z-0"
          style={{ background: behindGlowBg, filter: 'blur(18px)', opacity: glowOpacity, translateZ: -80 }}
        />
      )}
    </motion.div>
  )
}
