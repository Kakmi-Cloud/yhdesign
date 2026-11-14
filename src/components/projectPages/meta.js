/**
 * meta.js —— 八个项目各自独立的页面身份
 *
 * 这里只放「外壳」需要的元信息：导航分区、配色令牌、一句话定位。
 * 页面主体结构与数据都在各自的 Pxx 组件里，彼此不共享段落字典，
 * 也不存在统一的 SEC.01–09 顺序表 —— 这是本轮与上一版最根本的区别。
 */
export const PAGE_META = {
  '01': {
    kicker: 'GRADUATION PROJECT / MODULAR LIGHT',
    label: '插拔式模块化照明',
    theme: { paper: '#F4EFE6', ink: '#1B1916', accent: '#E2621F', accent2: '#F6C177', dark: false },
    nav: [
      ['lab', '插拔实验台'], ['spec', '规格与尺寸'], ['steps', '安装步骤'],
      ['forms', '两种形态'], ['meaning', '设计意义'], ['scenes', '场景'],
    ],
  },
  '02': {
    kicker: 'DESKTOP DEVICE / PROGRESS AS JOURNEY',
    label: '把进度变成一段路',
    theme: { paper: '#EDF1EE', ink: '#16201E', accent: '#2F7D6B', accent2: '#8FB8AE', dark: false },
    nav: [['track', '进度轨道'], ['stages', '四阶段'], ['views', '机构与三视图'], ['sketch', '草图时间轴']],
  },
  '03': {
    kicker: 'INTERNSHIP / MATERIAL & AIGC FORM',
    label: '两条并行的灯具线',
    theme: { paper: '#15171A', ink: '#F3F0E9', accent: '#D9A44C', accent2: '#2E8B74', dark: true },
    nav: [['series-a', '孔雀石线'], ['series-b', 'AI 形态线'], ['review', '评审表与参数'], ['progress', '落地进展']],
  },
  '04': {
    kicker: 'INTERACTIVE LIGHTING / SEVEN GESTURES',
    label: '七个动作，七盏灯',
    theme: { paper: '#F7F3EC', ink: '#24201C', accent: '#C4632E', accent2: '#E9A444', dark: false },
    nav: [['gesture', '动作索引'], ['board', '动作展板'], ['material', '材质与状态']],
  },
  '05': {
    kicker: 'UI FLOW / SERVICE BLUEPRINT',
    label: '一条不绕路的服务流程',
    theme: { paper: '#F4F7FB', ink: '#172033', accent: '#4C5BD4', accent2: '#7FA8E8', dark: false },
    nav: [['flow', '主流程'], ['screens', '页面档案'], ['structure', '信息架构']],
  },
  '06': {
    kicker: 'FURNITURE / FRAME & UPHOLSTERY',
    label: '换椅子，改成换软包',
    theme: { paper: '#F1EBE0', ink: '#2A231B', accent: '#B4804F', accent2: '#A9A296', dark: false },
    nav: [['colour', '软包配色'], ['module', '模块结构'], ['material', '材质与场景']],
  },
  '07': {
    kicker: 'CONCEPT DESIGN / SIX DIRECTIONS',
    label: '六个能追问「怎么用」的概念',
    theme: { paper: '#14161C', ink: '#F2F1EE', accent: '#FF5B2E', accent2: '#F5B23C', dark: true },
    nav: [['concepts', '六个概念'], ['yunnan', '在地文化'], ['process', '设计流程']],
  },
  '08': {
    kicker: 'IP DESIGN / DUAL-LAYER FROZEN CAT',
    label: '温度决定它今天是硬的还是软的',
    // 配色取自角色设定稿采样色系：奶白 → 纸底，深棕 → 墨色，
    // 雾紫（冷端）→ accent，蜜橙（暖端 / 橘猫内核）→ accent2。与周边「米白/雾紫」一致。
    theme: { paper: '#F8F1E6', ink: '#42332C', accent: '#6E6B9B', accent2: '#D97842', dark: false },
    nav: [
      ['character', '角色与相变'], ['elements', '造型提取'], ['views', '双态三视图'],
      ['emotions', '情绪系统'], ['palette', '色彩设定'], ['merch', '周边应用'],
    ],
  },
}

export const PROJECT_ORDER = ['01', '02', '03', '04', '08', '06', '05', '07']

export function nextProjectId(id) {
  const i = PROJECT_ORDER.indexOf(String(id))
  return PROJECT_ORDER[(i + 1 + PROJECT_ORDER.length) % PROJECT_ORDER.length]
}
