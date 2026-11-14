/**
 * 桌面 OS 的图标 / 窗口数据清单。
 *
 * 设计原则：**真实数据优先**。
 * App.jsx 会把原本喂给 3D 轮盘的那份 `projects` 数组原样传进 DesktopOSGate，
 * normalizeDesktopProjects() 只做「补字段」，并且把原始对象挂在 rawProject 上 ——
 * 这样窗口里的「查看完整项目详情」能把它原封不动交回 openProject()。
 * （详情页分流靠 id：03 走墨黑材料页、04 走暖纸展板页、08 走工业挂卡页、06 走家具页、
 *   07 走深色概念页，01/02/05 共用 Bento 白底模板。所以 id 绝不能被改写。）
 *
 * 下面的 CANONICAL_DESKTOP_PROJECTS 只在没有 projects 传入时兜底（独立演示用），
 * 封面路径与站点内现有写法保持一致（都是站内绝对路径）。
 */

export const CANONICAL_DESKTOP_PROJECTS = [
  { id: '01', title: '《心景》疗愈灯具', category: '产品设计', cover: '/xinjing/user-01.webp', fit: 'cover' },
  { id: '02', title: '《慢行者》', category: '产品设计', cover: '/slowwalker-render.jpeg', fit: 'cover' },
  { id: '03', title: '实习灯具设计', category: '产品设计', cover: '/lamps/ai/01-glass-drops.webp', fit: 'cover' },
  { id: '04', title: '情绪疗愈灯具', category: '产品设计', cover: '/lamps/grad/02-campfire.webp', fit: 'cover' },
  { id: '08', title: '猫冰 CAT-ICE : THERMAL LAB', category: 'IP 设计', cover: '/cat-ice/card-portrait.webp', fit: 'contain' },
  { id: '06', title: '模块化木质座椅', category: '产品设计', cover: '/chair/hero.webp', fit: 'cover' },
  { id: '05', title: 'UI界面流程设计', category: '用户研究', cover: '/ui-cos-2.webp', fit: 'cover' },
  { id: '07', title: '产品概念设计', category: '产品设计', cover: '/aigc/aigc-board.webp', fit: 'cover' },
]

/** 从任意来源挑一个能当封面的字段（真实数据里 image 可能是函数调用产生的结果对象） */
function pickCover(p) {
  const raw = p.imagePortrait || p.image
  if (typeof raw === 'string' && raw) return { cover: raw, fit: 'contain' }
  if (raw && typeof raw === 'object' && typeof raw.src === 'string') return { cover: raw.src, fit: 'contain' }
  if (typeof p.cover === 'string' && p.cover) return { cover: p.cover, fit: p.fit || 'cover' }
  // image 可能是被 asset() 包过的对象；再退一步看 gallery 第一张
  const g = Array.isArray(p.gallery) ? p.gallery[0] : null
  if (g && typeof g.src === 'string') return { cover: g.src, fit: 'cover' }
  return { cover: '', fit: 'cover' }
}

function pickDesc(p) {
  const t = p.desc || p.subtitle || (p.details && p.details.overview) || ''
  return typeof t === 'string' ? t.trim() : ''
}

/**
 * 把传入的 projects（或兜底清单）统一成桌面 OS 需要的最小形状。
 * 返回数组顺序 = 图标顺序 = 传入顺序，保证「第 N 个图标」和轮盘里的第 N 个项目一致。
 */
export function normalizeDesktopProjects(input) {
  const list = Array.isArray(input) && input.length ? input : CANONICAL_DESKTOP_PROJECTS
  return list.map((p, i) => {
    const fallback = CANONICAL_DESKTOP_PROJECTS.find((c) => c.id === String(p.id)) || {}
    const { cover, fit } = pickCover(p)
    return {
      id: String(p.id ?? i + 1).padStart(2, '0'),
      title: p.title || fallback.title || `项目 ${i + 1}`,
      category: p.category || fallback.category || '',
      desc: pickDesc(p),
      cover: cover || fallback.cover || '',
      fit: cover ? fit : fallback.fit || 'cover',
      objectPosition: p.imagePosition || '50% 50%',
      rawProject: p, // 原样带回 openProject()
    }
  })
}

export default normalizeDesktopProjects
