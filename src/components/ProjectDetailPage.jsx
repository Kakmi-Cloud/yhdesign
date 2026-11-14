import { useCallback, useEffect } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import ConceptArchive from './ConceptArchive'
import GenericProjectDetail from './GenericProjectDetail'
import { asset } from '../assetPath'

// —— Bento Detail 视觉常量（跨项目统一，参考 XinJing - Bento Detail） ——
const INK = '#111111'
const WHITE = '#FFFFFF'
const DARK = '#1C1C1E'
const GRAY = '#D9D9D9'
const ACCENT = '#E67E33'
const LIGHT = '#F4F4F4'
const BG = '#EAEAEA'
const FONT = "'Inter','Noto Sans SC',sans-serif"

// 心景论文图 / 慢行者素材 / 模块化座椅素材 简写
const XJ = (n) => asset(`/xinjing/fig${String(n).padStart(2, '0')}.webp`)
const SL = (f) => asset(`/snail/${f}`)
const CH = (f) => asset(`/chair/${f}`)

/**
 * 页面内容配置（Bento 数据驱动模板：每个项目补一段配置即可复用同款布局）
 * Hero 区：heroLines / welcomeLabel / welcomeDesc / badgeText / dataTiles / actionPills / actionTitle / actionDesc
 * 主视觉带：hero / title1 / titleSub
 * 深度章节：highlights / process / inspiration / sketches
 *           system / tech / cmfImg / cmf / audience / audienceImg / scenarios / stats
 *           iterationL / iterationR / bullets / bottomLabels / closing
 */
const CONFIG = {
  '01': {
    navName: 'XINJING / HEALING LIGHT',
    heroLines: [
      ['HEALING EMOTIONS'],
      [{ p: 'WITH' }, 'MODULAR'],
      ['LIGHTING EXPERIENCE'],
    ],
    welcomeLabel: 'PROJECT 01 / HEALING LIGHT',
    welcomeDesc: '提取城市天际线的「秩序感」与自然木石的「松弛感」。通过光、形、材质与交互的结合，帮助大城市独居青年改善情绪、重建内心秩序。',
    badgeText: 'PHYSICAL INTERACTION ✦ TACTILE HEALING ✦ MODULAR ✦ ',
    dataTiles: [
      { num: '73%', label: 'Prefers Warm Light', dark: false },
      { num: '209', label: 'Survey Samples', dark: true },
    ],
    actionPills: ['PHYSICAL INTERACTION', 'MODULAR', 'NO-APP'],
    actionTitle: 'Flexible',
    actionDesc: '摒弃复杂 APP 控制，采用无触点无线供电底座与磁吸结构。将情绪宣泄转化为每一次物理插拔与漫反射光影的平滑变化。',
    title1: '《心景》疗愈灯具',
    titleSub: 'MODULAR HEALING LIGHT',
    hero: asset('/xinjing/_fig20-backup-prototype.webp'),
    heroCap: 'WARM LIGHT · TACTILE INTERACTION · MODULAR SYSTEM',
    bullets: [
      '2000K-3000K WARM LIGHT',
      'MODULAR WALNUT WOOD',
      'FROSTED ACRYLIC DIFFUSER',
      'WIRELESS MAGNETIC BASE',
      'PROXIMITY SENSOR SYNC',
      'ZERO SCREEN FATIGUE',
    ],
    bottomLabels: ['DESIGNED FOR 23-35 YOUTH', 'A KIND OF TACTILE HEALING', 'DEVICE / HOME ACCENT'],
    closing: ['把被忽略的日常瞬间，设计成有温度的陪伴。', '让光线成为触手可及的疗愈。'],
    highlights: [
      { n: '01', t: '缓解情绪压力', d: '通过光、形、材质与交互的组合，帮助用户放松身心、改善情绪。' },
      { n: '02', t: '年轻城市人群', d: '关注心理健康、追求生活品质的 23-35 岁都市独居青年。' },
      { n: '03', t: '情绪可视化', d: '将情绪宣泄转化为物理插拔与光影变化，让疗愈过程看得见、感受得到。' },
      { n: '04', t: '温暖×科技×陪伴', d: '少即是多的造型语言，摒弃复杂 APP，带来安静的实体陪伴感。' },
    ],
    process: [
      { n: '01', t: '概念草图', e: 'Sketch', img: XJ(13), tag: 'FIG.13' },
      { n: '02', t: '3D 建模', e: 'Modeling', img: XJ(20), tag: 'FIG.20' },
      { n: '03', t: '原型制作', e: 'Prototype', img: XJ(23), tag: 'FIG.23' },
      { n: '04', t: '材料测试', e: 'Material', img: XJ(24), tag: 'FIG.24' },
      { n: '05', t: '最终成品', e: 'Final', img: XJ(30), tag: 'FIG.30' },
    ],
    processExtra: [
      {
        kicker: 'DIEMU · WALL LIGHT',
        cn: '叠木 / 磁吸轨道壁灯专项',
        en: 'PRODUCT DEEP-DIVE',
        items: [
          { n: '01', t: '概念草图', e: 'Sketch', img: asset('/diemu/diemu-01.webp'), tag: 'DIEMU-01' },
          { n: '02', t: '3D 建模', e: 'Modeling', img: asset('/diemu/diemu-02.webp'), tag: 'DIEMU-02' },
          { n: '03', t: '原型制作', e: 'Prototype', img: asset('/diemu/diemu-03.jpg'), tag: 'DIEMU-03' },
          { n: '04', t: '材料测试', e: 'Material', img: asset('/diemu/diemu-04.webp'), tag: 'DIEMU-04' },
          { n: '05', t: '最终成品', e: 'Final', img: asset('/diemu/diemu-05.webp'), tag: 'DIEMU-05' },
        ],
      },
      {
        kicker: 'QIMU · FLOOR LIGHT',
        cn: '栖木 / 磁吸滑轨落地灯专项',
        en: 'PRODUCT DEEP-DIVE',
        items: [
          { n: '01', t: '概念草图', e: 'Sketch', img: asset('/qimu/qimu-01.webp'), tag: 'QIMU-01' },
          { n: '02', t: '3D 建模', e: 'Modeling', img: asset('/qimu/qimu-02.jpg'), tag: 'QIMU-02' },
          { n: '03', t: '原型制作', e: 'Prototype', img: asset('/qimu/qimu-03.jpg'), tag: 'QIMU-03' },
          { n: '04', t: '材料测试', e: 'Material', img: asset('/qimu/qimu-04.webp'), tag: 'QIMU-04' },
          { n: '05', t: '最终成品', e: 'Final', img: asset('/qimu/qimu-05.webp'), tag: 'QIMU-05' },
        ],
      },
    ],
    inspiration: {
      img: XJ(9),
      tag: 'FIG.09 / 意象',
      body: '将城市灯火与自然木石并置：高楼矩阵代表秩序与奋斗，原木缝隙透出的暖光代表松弛与归属。把天际线压缩进桌面、把暖光藏进木缝。',
      keywords: ['微行为干预', '光生物学', '模块化', '治愈'],
    },
    sketches: [
      { src: XJ(10), tag: 'FIG.10 / 方阵', sub: '高低错落矩阵 · 插拔结构推演' },
      { src: XJ(12), tag: 'FIG.12 / 叠木', sub: '错位堆叠 · 光晕缝隙推敲' },
      { src: XJ(11), tag: 'FIG.11 / 栖木', sub: '细长骨架 · 木块停靠平衡' },
    ],
    system: [
      { img: XJ(26), tag: 'FIG.26', name: '《方阵》桌面灯', desc: '20×20cm 哑光白底座内嵌电磁发射线圈；亚克力方柱底部封装接收端，实现放入即亮、提起即灭的无触点插拔交互。' },
      { img: XJ(27), tag: 'FIG.27', name: '《栖木》落地灯', desc: '1500mm 高哑光黑金属主杆（底座直径 25cm），发光木质模块可沿主杆磁吸滑动，宛如栖鸟停靠。' },
      { img: XJ(28), tag: 'FIG.28', name: '《叠木》壁灯', desc: '黑胡桃木块错位堆叠，暖光在木质缝隙间多次漫反射后溢出，避免直射眩光，营造无压力氛围。' },
    ],
    tech: [
      { ic: '⌁', t: '无线电磁供电', d: '底座阵列排布电磁发射线圈，发光模块底部封装接收端，实现「无阻尼」拿起即亮、放下即灭。' },
      { ic: '◉', t: '2000K-3000K 暖光', d: '依据光生物学设定低色温暖光源，降低交感神经兴奋度、刺激褪黑素分泌，辅助进入松弛状态。' },
      { ic: '↨', t: '磁吸滑轨系统', d: '《栖木》模块沿金属主杆滑动 + 磁吸固定，《叠木》以机械滑轨实现线性位移，提供确定感反馈。' },
      { ic: '↯', t: '人体感应辅助', d: '进门自动开灯减少黑暗孤独感；夜间起夜提供低亮度指引；睡前灯光缓慢变暗顺应节律。' },
    ],
    cmfImg: null, // 材质方案横幅图已删除，材质与工艺区直接展示 CMF 色卡
    cmf: [
      { name: '黑胡桃木', hex: '#6b4a2f', desc: '《叠木》《栖木》主体。手工打磨 + 环保木蜡油，保留天然年轮纹理与温润触感。' },
      { name: '磨砂亚克力', hex: '#cfd2d6', desc: '发光组件外层。过滤直射光，暖光均匀扩散，呈现朦胧治愈渐变。' },
      { name: '金属 · 哑光黑', hex: '#2a2a2a', desc: '《栖木》主杆与支撑结构，高强金属 + 哑光黑工艺，与原木形成材质反差。' },
    ],
    audience: [
      { role: '都市白领 / 28 岁', d: '工作压力大、需要心理放松的 23-35 岁大城市独居青年。' },
      { role: '空巢青年 / 25 岁', d: '独居缺乏陪伴，渴望建立空间情感锚点。' },
    ],
    audienceImg: null,
    audienceImgs: [
      { src: asset('/xinjing/scene-01.jpg'), alt: '深夜睡前刷屏触点', tag: '触点 · 深夜睡前' },
      { src: asset('/xinjing/scene-02.webp'), alt: '昏暗房间电脑前独处', tag: '触点 · 昏暗房间' },
    ],
    scenarios: [
      { t: '01 下班归家', k: '空间情感锚点', d: '进门亮灯，驱散从外界喧嚣切换至黑暗私密空间的冷清与孤独。' },
      { t: '02 晚间独处', k: '注意力转移', d: '插拔阻尼与磁吸滑动的微行为干预，打破数字焦虑循环。' },
      { t: '03 睡前准备', k: '节律顺应', d: '2000K-3000K 低色温暖光顺应褪黑素分泌，被动陪伴。' },
      { t: '04 夜间起夜', k: '低照度指引', d: '人体感应低亮度指引光线，不打断再次入睡。' },
    ],
    stats: [
      { v: '209份', l: '有效样本' },
      { v: '72.25%', l: '感到孤独' },
      { v: '73.68%', l: '偏好暖光' },
      { v: '61.72%', l: '人体感应' },
    ],
    iterationL: [
      { k: '触觉反馈 → 注意力转移', d: '持续插拔 + 物理阻尼感打断焦虑回路，微行为干预有效。' },
      { k: '视觉光效 → 情绪松弛感', d: '低色温暖光经亚克力漫反射后不刺眼，显著提升温馨感与安全感。' },
    ],
    iterationR: [
      { k: '插槽公差过小', d: '倒装打磨 + 测试微动开关、无线充电、重力感应方案，最终锁定无线电磁。' },
      { k: '概念与实体视觉错觉', d: '低成本体积模型验证比例，确认透光材料与木蜡油涂装样块。' },
      { k: '外包代工沟通障碍', d: '细化爆炸图参数，核心组件先打单件小样、确认后再批量加工。' },
    ],
  },

  '02': {
    navName: 'SLOW WALKER / DECELERATOR',
    heroLines: [
      ['DECELERATE THE'],
      [{ p: 'DIGITAL WAIT' }],
      ['INTO A ZEN RITUAL'],
    ],
    welcomeLabel: 'PROJECT 02 / SLOW WALKER',
    welcomeDesc: '把「等待」还给身体：机械蜗牛在轨道上的每一次挪动，都是对快节奏数字生活的一次温和解构，让冰冷的进度拥有看得见的温度。',
    badgeText: 'ZEN DESKTOP RITUAL ✦ REAL-TIME PROGRESS ✦ ',
    dataTiles: [
      { num: '1:1', label: 'Progress Sync', dark: false },
      { num: '90%', label: 'Build Complete', dark: true },
    ],
    actionPills: ['PROGRESS SYNC', 'MECHANICAL PET', 'NO-APP'],
    actionTitle: 'Ritual',
    actionDesc: '蜗牛沿轨道爬行映射真实下载与渲染进度，进度条不再只是冷冰冰的数字。等待被重构成一场有温度的仪式，完成时还有胜利巡游与随机彩蛋。',
    title1: '《慢行者》',
    titleSub: 'DIGITAL DECELERATOR',
    hero: SL('snail-60.webp'),
    heroCap: 'SNAIL SYMBOL · REAL-TIME SYNC · ZEN RITUAL',
    bullets: [
      'SNAIL SYMBOL DESIGN',
      'REAL-TIME PROGRESS SYNC',
      'STEPPER + LEAD SCREW',
      'MAGNETIC TOP-FOLLOW',
      'VICTORY PARADE MODE',
      'RANDOM EGG SURPRISE',
    ],
    bottomLabels: ['FOR 23-35 DIGITAL WORKERS', 'A ZEN DESKTOP RITUAL', 'PETS / TOOL / DECOR'],
    closing: ['把「等不起」的时刻，变成看得见的仪式。', '让数据拥有性格，让等待成为陪伴。'],
    highlights: [
      { n: '01', t: '数字等待焦虑', d: '下载、渲染等「等不起的等待」常伴随无聊与烦躁，冰冷的进度条缺乏情绪出口。' },
      { n: '02', t: '极客从业人群', d: '长期面对电脑、常处理大文件的设计师、剪辑师与程序员。' },
      { n: '03', t: '慢的禅意', d: '以蜗牛代表极致的「慢与禅意」，与数字世界的光速传输形成幽默冲突。' },
      { n: '04', t: '机械宠物', d: '进度物理化的同时具备拟人化性格：胜利巡游、随机彩蛋、情绪光效。' },
    ],
    process: [
      { n: '01', t: '痛点洞察', e: 'Pain Points', img: SL('concept.webp'), tag: 'FIG.01' },
      { n: '02', t: '方案草图', e: 'Sketch', img: SL('sketch-01.webp'), tag: 'FIG.02' },
      { n: '03', t: '机械实现', e: 'Mechanism', img: SL('mechanism.webp'), tag: 'FIG.03' },
      { n: '04', t: '原型组装', e: 'Prototype', img: SL('snail-62.webp'), tag: 'FIG.04' },
      { n: '05', t: '实拍成片', e: 'Final Shot', img: SL('snail-61.webp'), tag: 'FIG.05' },
    ],
    inspiration: {
      img: SL('snail-65.webp'),
      tag: 'FIG.06 / 场景',
      body: '痛点观察：快节奏数字生活中，「等待」无处不在——下载、渲染的屏幕上只有冰冷的数字，带来烦躁与无聊。设计灵感：让蜗牛替数字世界的「光速」慢下来，把等待变成一场有温度的微型仪式。',
      keywords: ['机械宠物', '信息可视化', '赛跑仪式', '禅意'],
    },
    sketches: [
      { src: SL('sketch-01.webp'), tag: '灵感来源', sub: '蜗牛符号 · 造型草图', folderName: '灵感来源',
        steps: [
          { n: '01', t: '蜗牛符号 · 造型草图', e: 'Symbol Sketch', img: SL('sketch-01.webp'), tag: 'INSP 01' },
          { n: '02', t: 'AI 渲染造型 01', e: 'AI Render', img: SL('insp-01.webp'), tag: 'INSP 02' },
          { n: '03', t: 'AI 渲染造型 02', e: 'AI Render', img: SL('insp-02.webp'), tag: 'INSP 03' },
          { n: '04', t: '草图收集', e: 'Sketch Study', img: SL('insp-03.png'), tag: 'INSP 04' },
        ] },
      { src: SL('sketch-02.webp'), tag: '模型制作', sub: '三视图建模 · 结构推敲', folderName: '模型制作',
        steps: [
          { n: '01', t: '左侧视图', e: 'Left View', img: SL('snail-62.webp'), tag: 'MODEL 01' },
          { n: '02', t: '右侧视图', e: 'Right View', img: SL('snail-63.webp'), tag: 'MODEL 02' },
          { n: '03', t: '后视图', e: 'Rear View', img: SL('snail-64.webp'), tag: 'MODEL 03' },
          { n: '04', t: '上方视图', e: 'Top View', img: SL('snail-65.webp'), tag: 'MODEL 04' },
        ] },
      { src: SL('sketch-03.webp'), tag: '渲染展示', sub: '使用演示', folderName: '渲染展示' },
    ],
    system: [
      { img: SL('snail-62.webp'), tag: 'REAL 01', name: '磁吸联动蜗牛', desc: '滑台滑块通过面板磁吸带动上方蜗牛，蜗牛本体无需内置动力，数据与处理集中在底座完成。' },
      { img: SL('snail-63.webp'), tag: 'REAL 02', name: '丝杆滑台底座', desc: '步进电机驱动丝杆滑台，实现高精度线性位移；光效与进度同步由底座统一控制。' },
      { img: SL('snail-64.webp'), tag: 'REAL 03', name: '产品实拍细节', desc: '一体化跑道造型，简洁圆润，可作为桌面摆件融入工作台环境。' },
    ],
    tech: [
      { ic: '↻', t: '进度实时同步', d: '读取电脑任务进度，驱动蜗牛沿轨道按比例爬行，将数字进度转化为可触摸的物理位置。' },
      { ic: '⚙', t: '步进电机 + 丝杆', d: '底座内步进电机带动丝杆滑台；滑台滑块移动，隔面板磁吸带动蜗牛，无外露传动件。' },
      { ic: '◉', t: '情绪化光效', d: '下载小文件默认只触发底座光效；夜间呼吸灯与进度氛围色共同塑造「机械宠物」性格。' },
      { ic: '✦', t: '胜利巡游模式', d: '速度过快时不强行同步，触发「胜利巡游」优雅走完全程；累计小文件随机触发彩蛋跑动 + 全屏烟花。' },
    ],
    cmfImg: null,
    cmf: [
      { name: '蜗牛壳 · 陶瓷质感', hex: '#e8e4dd', desc: '哑光陶瓷质感表面，温润亲肤，消除电子产品的冰冷感。' },
      { name: '轨道 · 半透磨砂', hex: '#c9cdd2', desc: '半透磨砂玻璃 / 亚克力，透出底座底部微光，营造「科技禅意」。' },
      { name: '金属五金', hex: '#3b352b', desc: '内部精密五金件保证丝杆滑台的稳定与磁吸联动精度。' },
    ],
    audience: [
      { role: '设计师 / 剪辑师', d: '长时间渲染导出，等待高频发生，最需要「等得有意思」。' },
      { role: '程序员 / 极客', d: '下载大文件、跑批任务的日常场景，喜欢有仪式感的桌面装备。' },
    ],
    audienceImg: null,
    scenarios: [
      { t: '01 大文件渲染', k: '进度可视化', d: '渲染任务开始，蜗牛从起点启动，按真实进度爬行，把等待变成观看。' },
      { t: '02 日常下载', k: '轻反馈', d: '小文件不强制机械运动，仅底座光效呼吸示意，避免「机械式」重复疲惫。' },
      { t: '03 随机惊喜', k: '宠物感', d: '累计 10-20 次小文件后触发彩蛋跑动与烟花，带来不可预测的陪伴感。' },
      { t: '04 完成时刻', k: '仪式感', d: '100% 完成，蜗牛到站触发庆祝反馈——数字任务有了「到站」的实体仪式。' },
    ],
    stats: [
      { v: '1:1', l: '进度物理映射' },
      { v: '90%', l: '综合完成度' },
      { v: '×2', l: '反馈通道（动+光）' },
      { v: '10-20', l: '彩蛋触发次数' },
    ],
    iterationL: [
      { k: '蜗牛怎么「动」起来', d: '主要硬件集中在跑道底座：步进电机 + 丝杆滑台负责移动，蜗牛本体仅作表情情绪变化，降低结构复杂度。' },
      { k: '小文件秒下怎么办', d: '下载过快不强行同步，触发「胜利巡游模式」，蜗牛以安全速度优雅走完全程，把进度指示转为完成仪式。' },
    ],
    iterationR: [
      { k: '每次跑会无聊', d: '小文件默认只触发底座光效；累计随机 10-20 次后触发华丽机械跑动 + 全屏烟花彩蛋，形成惊喜感。' },
      { k: '结构实现难点', d: '丝杆滑台与磁吸方案反复验证：滑块隔面板吸附蜗牛移动，保障精度同时避免电机丢步、蜗牛惯性飞出。' },
    ],
  },
  // 06 模块化木质座椅：结构本身即接口的项目 —— 框架内侧面直接当导轨面，
  // 所以「模块化」这一节的落点不是"能换"，而是"不靠额外零件也能换"。
  // 尺寸章节没有做，用户明确说尺寸标注图不好看，站内不采用。
  '06': {
    navName: 'MODULAR WOODEN CHAIR / FURNITURE',
    heroLines: [
      ['ONE WOODEN FRAME'],
      [{ p: 'TWO' }, 'MODULES'],
      ['A CHAIR THAT CHANGES'],
    ],
    welcomeLabel: 'PROJECT 06 / MODULAR WOODEN CHAIR',
    welcomeDesc: '一体式木质框架把座架、腿部与背支撑收成一个整体，框架两侧板与立柱的内侧面直接兼作导轨面——不增加任何滑轨零件。坐垫与椅背都是「木板 + 软垫」一体化模块，像抽屉一样推插到位，单人、无工具即可换装。',
    badgeText: 'MODULAR FRAME ✦ SLIDE-IN MODULES ✦ NO TOOLS NEEDED ✦ ',
    dataTiles: [
      { num: '780', label: 'Overall Height / mm', dark: false },
      { num: '≤12', label: 'Total Weight / kg', dark: true },
    ],
    actionPills: ['MODULAR', 'SLIDE-IN', 'NO TOOLS'],
    actionTitle: 'Modular',
    actionDesc: '框架内侧面即导轨面，不设额外滑轨：坐垫沿两侧板从前向后推入，椅背自立柱上方落入，到位后由限位与缓冲垫定位。坐垫取出后可单独当作蒲团使用。',
    title1: '模块化木质座椅',
    titleSub: 'MODULAR WOODEN CHAIR',
    hero: CH('hero.webp'),
    heroCap: 'SOLID WOOD FRAME · SLIDE-IN MODULES · ONE CHAIR, MANY USES',
    highlights: [
      { n: '01', t: '结构即导轨', d: '框架两侧板与背支撑立柱的内侧面本身就是导轨面，不增加任何滑轨零件，靠木面间隙配合完成导向。' },
      { n: '02', t: '模块化换装', d: '坐垫与椅背均为「木板 + 软垫」一体化模块，沿导轨推插到位即可整体取出替换，软包套可拆洗。' },
      { n: '03', t: '一椅多用', d: '坐垫模块可单独取出作为蒲团使用，座椅的形态与坐感随使用场景切换。' },
      { n: '04', t: '坐姿基准', d: '按 GB/T 10000 成人坐姿尺寸取值：座高 420、座深 500、靠背 102°，久坐仍有肩胛下缘支撑。' },
    ],
    process: [
      { n: '01', t: '结构研究', e: 'Structure', img: CH('structure.webp'), tag: 'FIG.01' },
      { n: '02', t: '手绘推敲', e: 'Sketch', img: CH('sketch.webp'), tag: 'FIG.02' },
      { n: '03', t: '爆炸拆解', e: 'Exploded', img: CH('explosion.webp'), tag: 'FIG.03' },
      { n: '04', t: '场景验证', e: 'Scene', img: CH('scene.webp'), tag: 'FIG.04' },
      { n: '05', t: '成品呈现', e: 'Final', img: CH('hero.webp'), tag: 'FIG.05' },
    ],
    inspiration: {
      img: CH('scene2.webp'),
      tag: 'FIG.06 / 材质对照',
      body: '造型语言取自中世纪现代的斜置板式腿与有机雕塑感轮廓：浅色白蜡木 / 白橡木框架配高饱和软包，藏蓝、正红、燕麦灰三色模块可互换；木销定位点与圆润倒角把结构痕迹收进细节里。',
      keywords: ['中世纪现代', '有机雕塑感', '实木框架', '可换软包'],
    },
    // 三个文件夹即设计过程全貌（无专项深挖，所以不配 processExtra）
    sketches: [
      { src: CH('sketch.webp'), tag: '灵感来源', sub: '手绘推敲 · 从概念到结构', folderName: '灵感来源',
        steps: [
          { n: '01', t: '概念演化', e: 'Concept', img: CH('sketch.webp'), tag: 'INSP 01' },
          { n: '02', t: '细节推敲', e: 'Detail', img: CH('structure.webp'), tag: 'INSP 02' },
          { n: '03', t: '形态收敛', e: 'Form', img: CH('hero.webp'), tag: 'INSP 03' },
          { n: '04', t: '场景代入', e: 'Scene', img: CH('scene.webp'), tag: 'INSP 04' },
        ] },
      { src: CH('structure.webp'), tag: '结构拆解', sub: '框架内侧面即导轨面', folderName: '结构拆解',
        steps: [
          { n: '01', t: '一体式框架', e: 'Frame', img: CH('structure.webp'), tag: 'STR 01' },
          { n: '02', t: '坐垫模块', e: 'Seat Module', img: CH('explosion.webp'), tag: 'STR 02' },
          { n: '03', t: '椅背模块', e: 'Back Module', img: CH('explosion.webp'), tag: 'STR 03' },
          { n: '04', t: '实拍细节', e: 'Detail', img: CH('hero.webp'), tag: 'STR 04' },
        ] },
      { src: CH('scene.webp'), tag: '场景验证', sub: '落地效果与配色模块', folderName: '场景验证',
        steps: [
          { n: '01', t: '家居场景', e: 'Living', img: CH('scene.webp'), tag: 'SCN 01' },
          { n: '02', t: '材质对照', e: 'Material', img: CH('scene2.webp'), tag: 'SCN 02' },
          { n: '03', t: '配色模块', e: 'Color', img: CH('hero.webp'), tag: 'SCN 03' },
        ] },
    ],
    system: [
      { img: CH('hero.webp'), tag: 'REAL 01', name: '一体式木质框架', desc: '座架、腿部与背支撑立柱为一个整体，宽大的斜置板式腿形成 Z / V 形侧影。' },
      { img: CH('structure.webp'), tag: 'REAL 02', name: '坐垫推入式模块', desc: '480 × 500，木板 25 + 软垫 90，沿两侧板内导轨面从前向后推入，前端限位防窜动。' },
      { img: CH('explosion.webp'), tag: 'REAL 03', name: '椅背落入式模块', desc: '460 × 380，木板 30 + 软垫 140，沿立柱内侧导轨面自上落入，底端缓冲垫 + 限位。' },
    ],
    tech: [
      { ic: '▤', t: '内侧面即导轨', d: '框架内侧面铣削平整并细砂光，模块板边倒圆，靠 0.5–1.0 的木面间隙配合导向，不需要任何额外五金滑轨。' },
      { ic: '↧', t: '推插式换装', d: '坐垫从前向后推入、椅背自上落入，单模块 ≤ 6 kg，单人无工具 30 秒完成更换。' },
      { ic: '◉', t: '坐姿取值', d: '座高 420 / 座宽 480 / 座深 500 / 靠背 380 × 460，座面 4° 后倾、靠背 102°，取坐姿人体工学的中位偏保守值。' },
      { ic: '✦', t: '一椅多用', d: '坐垫取出即蒲团；软包按同规格 3–4 色系配置、拉链套可拆洗，换的是椅子也是空间气质。' },
    ],
    cmfImg: null,
    cmf: [
      { name: '浅色实木框架', hex: '#b98e5f', desc: '白蜡木 / 白橡木，含水率控制在 8%–12%，木销定位配合圆润倒角收结构痕。' },
      { name: '皮革软包', hex: '#a8a29e', desc: '藏蓝 / 正红 / 燕麦灰三色模块可互换，拉链套结构，可单独拆洗。' },
      { name: '软垫填充', hex: '#e4dfd6', desc: 'HR 高回弹泡棉 ≥ 40 kg/m³，下沉量控制在 15–25，久坐仍有支撑。' },
    ],
    audience: [
      { role: '都市小户型住户', d: '空间有限，一件家具要顶几种用法，换装比换家具更实际。' },
      { role: '注重生活品质的年轻人', d: '在意木质触感与坐感，也愿意为配色模块与可拆洗软包买单。' },
    ],
    audienceImgs: [{ src: CH('scene2.webp'), alt: '材质与场景对照', tag: 'SCENE 01' }],
    scenarios: [
      { t: '01 落座阅读', k: '低背支撑', d: '靠背 102°、座深 500，膝窝留 30–50 空隙，久读不前滑。' },
      { t: '02 换装软包', k: '模块化', d: '坐垫与椅背模块整体取出替换，软包配色随季节或空间更换。' },
      { t: '03 席地而坐', k: '一椅多用', d: '坐垫单独取出作蒲团，座椅变低座，客厅与地面场景切换。' },
      { t: '04 挪动收纳', k: '轻量', d: '整机 ≤ 12 kg、单模块 ≤ 6 kg，单人可搬动；腿部外斜落地轮廓 580 × 680。' },
    ],
    stats: [
      { v: '780', l: '总高 / mm' },
      { v: '420', l: '座高 / mm' },
      { v: '30s', l: '无工具换装' },
      { v: '≤6kg', l: '单模块自重' },
    ],
    iterationL: [
      { k: '导轨怎么做才不晃', d: '原本打算另加金属滑轨，最后取消：把框架内侧面铣平砂光直接当导轨面，模块板边倒圆，靠 0.5–1.0 的木面间隙配合导向，少一层零件也少一处异响。' },
      { k: '坐垫怎么取才顺手', d: '坐垫模块沿两侧板从前向后推入，板端做 2 × 45° 倒角当导入口；到位后由前挡片与弹压锁扣定位，防止前后窜动。' },
    ],
    iterationR: [
      { k: '椅背怎么落位', d: '椅背模块改为自上落入：立柱内面间距 300、导向深度 ≥ 60，底端加缓冲垫与限位，立柱顶端刻对位线，盲操作也能对准。' },
      { k: '久坐怎么不塌', d: '坐垫内芯用 HR 高回弹泡棉 ≥ 40 kg/m³，下沉量控在 15–25；框架按 ≥ 120 kg 静载校核，轨道连接处局部加厚。' },
    ],
    closing: [
      '把结构收进木头里，把选择权交回使用者。',
      '一件家具，跟着生活换装。',
    ],
  },
}

// —— 通用小组件 ——

/** Bento 色块底：默认白底描边；通过 className 传背景/文字色 */
function Tile({ children, className = '', as = 'div' }) {
  const Tag = as
  return <Tag className={`relative overflow-hidden rounded-[26px] ${className}`}>{children}</Tag>
}

/** 图片块：圆角容器 + 底部暗色角标 */
function Figure({ src, alt, tag, className = '', contain = true }) {
  return (
    <div className={`relative overflow-hidden rounded-[22px] bg-white ${className}`} style={{ border: '1px solid rgba(17,17,17,0.07)' }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className={`h-full w-full ${contain ? 'object-contain' : 'object-cover'}`} />
      {tag && (
        <span className="absolute bottom-2 left-2 rounded-full px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-widest" style={{ backgroundColor: DARK, color: ACCENT }}>
          {tag}
        </span>
      )}
    </div>
  )
}

/** 章节标签行：EN + CN + 序号，底部细线分隔 */
function SectionLabel({ num, en, cn, className = '', line = true }) {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] font-black tracking-widest" style={{ color: INK }}>{num}</span>
        <span className="text-sm font-black uppercase tracking-[0.12em] md:text-base" style={{ color: INK, fontFamily: FONT }}>{en}</span>
        <span className="text-xs font-bold text-black/45 md:text-[13px]">/ {cn}</span>
      </div>
      {line && <span className="mb-1 h-px flex-1" style={{ background: 'rgba(17,17,17,0.12)' }} />}
      <span className="text-lg leading-none text-black/15">✳</span>
    </div>
  )
}

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const NAV_ITEMS = [
  { id: 'b-features', en: 'HIGHLIGHTS' },
  { id: 'b-users', en: 'USERS' },
  { id: 'b-process', en: 'PROCESS' },
  { id: 'b-system', en: 'SYSTEM' },
  { id: 'b-material', en: 'MATERIAL' },
  { id: 'b-iter', en: 'ITERATION' },
]

/**
 * Bento 风格作品详情页（数据驱动模板，01《心景》/ 02《慢行者》共用）
 * 布局语言：灰底 + 白色圆角大画布；画布内 12 列 Bento 网格，
 * 以 白 / 灰 / 黑 / 橙 四色卡片拼贴，巨型 Inter 英文标题排版。
 */
export default function ProjectDetailPage({ project, onClose }) {
  // 手机上「工程推导」四节 + 「验证与迭代」默认折起来（详情页 10.2 屏 → 3.8 屏）。
  // 用 1023px 而不是 useIsMobile 的 768px：平板竖屏同样吃不消 10 屏。
  const isNarrow = useMediaQuery('(max-width: 1023px)')

  // 2026-xx 改判（用户：「以内容为主，不要把内容藏起来」）：手机端折叠段落也默认展开。
  // 只在挂载时置一次 open —— 之后用户的手动收起 / 展开不会被 React 复位。
  const openFoldOnMount = useCallback((el) => {
    if (el) el.open = true
  }, [])
  // ⚠️ 这里**不能**再 `|| CONFIG['01']`：CONFIG 里没有 05，静默回退的结果是
  // 点开《UI界面流程设计》看到《心景》疗愈灯具的标题、文案与图片（内容错位）。
  // 缺配置时 cfg 为 null，改由文件末尾的早返回走 GenericProjectDetail，
  // 只渲染该项目自己的真实字段。
  const cfg = CONFIG[project?.id] || null
  const radar = project?.chartData?.radar
  const donut = project?.chartData?.donut || []
  // 是否有专项深挖：有 → 设计过程按「主流程 + 专项」拆分到各文件夹；无 → 三个文件夹即设计过程全貌
  const hasProcessFolder = !!cfg?.processExtra?.length
  // PROCESS 导航锚点：设计过程统一收纳在 04 档案区（文件夹交互）
  const processNavId = 'b-notes'
  // 章节编号：04 档案区即设计过程 → 产品系统从 05 起
  const numSystem = '05'
  const numTech = '06'
  const numMaterial = '07'
  const numIter = '08'

  // 概念档案夹：有专项深挖时，将主流程 / 专项分别挂到对应草图面板上（原位展示 5 步过程）
  const archiveItems = !cfg
    ? []
    : hasProcessFolder
    ? [
        {
          image: cfg.sketches?.[0]?.src,
          label: (cfg.sketches?.[0]?.tag || 'FIG').replace(' / ', ' // '),
          text: cfg.sketches?.[0]?.sub,
          kicker: 'CORE FLOW',
          title: '设计过程 · 主流程',
          en: 'MAIN PROCESS',
          steps: cfg.process,
        },
        ...cfg.processExtra.map((g, gi) => ({
          image: cfg.sketches?.[gi + 1]?.src,
          label: (cfg.sketches?.[gi + 1]?.tag || g.kicker).replace(' / ', ' // '),
          text: cfg.sketches?.[gi + 1]?.sub,
          kicker: g.kicker,
          title: g.cn,
          en: g.en,
          steps: g.items,
        })),
      ]
    : (cfg.sketches || []).map((s) => ({
        image: s.src,
        label: s.tag.replace(' / ', ' // '),
        text: s.sub,
        folderName: s.folderName,
        steps: s.steps,
      }))

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 没有 Bento 版配置的项目（目前是 05 UI 界面流程设计）：走通用详情页。
  // 这个早返回必须放在所有 hook 之后 —— 否则同一组件实例换项目时会改变 hook 数量。
  if (!cfg) return <GenericProjectDetail project={project} onClose={onClose} />

  return (
    // data-lenis-prevent 不能删：详情页打开时 SmoothScroll 会 lenis.stop() 锁住背景，
    // 而 Lenis 的 stop 不只是"停住动画" —— 它会对滚轮事件直接 preventDefault。
    // Lenis 内部的判断顺序是：先看事件路径上有没有 data-lenis-prevent，
    // 再看 isStopped/isLocked。没有这个属性，滚轮会在 Lenis 那一层被吃掉，
    // 详情页自己的原生滚动永远收不到事件 —— 表现为"整个详情页划不动"。
    // 加上之后 Lenis 提前 return，滚动交还给这个容器。
    // overscroll-contain 是配套的：详情页滚到底时不要把手势链给背后的主页。
    // z-[200] 由 App.jsx 的详情浮层外壳（motion.div）提供，这里重复挂一次会让
    // 「同屏浮层」选择器 .ms-overlay,[class*="z-[200]"] 在详情页数出 3 个节点（虚增）。
    <div
      data-lenis-prevent
      className="bento-detail-root fixed inset-0 overflow-y-auto overscroll-contain"
      style={{ backgroundColor: BG, fontFamily: FONT }}
    >
      <style>{`
        .bento-spin { animation: bento-spin 10s linear infinite; }
        @keyframes bento-spin { to { transform: rotate(360deg); } }
        .bento-hover { transition: transform .4s cubic-bezier(.25,1,.5,1), box-shadow .4s; }
        .bento-hover:hover { transform: translateY(-4px); }
        .halftone-bg {
          position:absolute; inset:0; z-index:0;
          background-image: radial-gradient(circle, rgba(17,17,17,.9) 2px, transparent 2.6px);
          background-size: 13px 13px;
          -webkit-mask-image: radial-gradient(circle at 100% 100%, #000 8%, transparent 72%);
                  mask-image: radial-gradient(circle at 100% 100%, #000 8%, transparent 72%);
        }

        /* ===== 手机端工业设计展板（제품판넬 × 瑞士标尺）—— 仅 ≤1023px，桌面端零影响 ===== */
        @media (max-width: 1023px) {
          .bento-detail-root {
            --board-paper: #fcfcfc;
            --board-sub: #f4f2ed;
            --board-dark: #151515;
            --board-ink-body: #262421;
            --board-ink-muted: #5a5751;
            --board-accent: #e67e33;
            --board-hairline: #d8d4cc;
            --board-radius: 2px;
            --board-border: 1px solid #151515;
            --board-shadow: 2px 2px 0 #151515;
            background-color: var(--board-paper) !important;
          }
          .bento-detail-root .bento-canvas {
            border-radius: 0 !important;
            box-shadow: none !important;
            background-color: var(--board-paper) !important;
            padding: 12px 16px 28px !important;
          }
          .bento-detail-root .bento-tile-card {
            border-radius: var(--board-radius) !important;
            border: var(--board-border) !important;
          }
          .bento-detail-root p, .bento-detail-root li {
            font-size: 15px !important;
            line-height: 1.55 !important;
          }
          /* 展台满幅：抵消 .bento-canvas 的 16px 页边，让产品主图左
             右到边（Pinterest 展板特征：主图占面 ≥55%）。正文仍留页边。 */
          .mob-hero-stage {
            position: relative;
            overflow: hidden;
            margin-left: -16px;
            margin-right: -16px;
            border: 1px solid #151515;
            background-color: #f4f2ed;
            box-shadow: 2px 2px 0 #151515;
          }
          /* BG-01 心景：青瓷冰裂与暖光漫射 */
          .mob-hero-stage--01 {
            background-color: #f6f5f0;
            background-image:
              linear-gradient(180deg, rgba(252, 252, 252, 0.50) 0%, rgba(244, 242, 237, 0.86) 100%),
              radial-gradient(circle at 78% 24%, rgba(230, 126, 51, 0.14) 0%, transparent 58%),
              radial-gradient(circle at 22% 78%, rgba(163, 184, 176, 0.20) 0%, transparent 62%),
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cpath d='M0 16L24 0M24 0L64 28M64 28L40 64M0 48L40 64M24 0L16 40L64 28' fill='none' stroke='%23d8d4cc' stroke-width='0.75' stroke-opacity='0.6'/%3E%3Cpath d='M30 32h4M32 30v4' stroke='%23e67e33' stroke-width='0.75' stroke-opacity='0.5'/%3E%3C/svg%3E");
            background-size: 100% 100%, 100% 100%, 100% 100%, 64px 64px;
            background-repeat: no-repeat, no-repeat, no-repeat, repeat;
          }
          /* BG-03 精密机构同心轨与工程标尺 */
          .mob-hero-stage--02 {
            background-color: #f4f2ed;
            background-image:
              radial-gradient(circle at 50% 50%, rgba(252, 252, 252, 0.32) 0%, rgba(244, 242, 237, 0.80) 100%),
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Ccircle cx='110' cy='110' r='48' fill='none' stroke='%23151515' stroke-width='0.75' stroke-opacity='0.18'/%3E%3Ccircle cx='110' cy='110' r='76' fill='none' stroke='%23151515' stroke-width='0.75' stroke-dasharray='3 3' stroke-opacity='0.22'/%3E%3Ccircle cx='110' cy='110' r='102' fill='none' stroke='%23e67e33' stroke-width='0.75' stroke-opacity='0.38'/%3E%3Cpath d='M0 110h220M110 0v220' stroke='%23151515' stroke-width='0.5' stroke-opacity='0.12'/%3E%3C/svg%3E"),
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M20 0H0v20' fill='none' stroke='%23d8d4cc' stroke-width='0.6' stroke-opacity='0.65'/%3E%3C/svg%3E");
            background-size: 100% 100%, 220px 220px, 20px 20px;
            background-position: center, center, top left;
            background-repeat: no-repeat, no-repeat, repeat;
          }
          /* BG-04 曲木等高线与亚麻经纬编织 */
          .mob-hero-stage--06 {
            background-color: #f5f1ea;
            background-image:
              linear-gradient(180deg, rgba(245, 241, 234, 0.70) 0%, rgba(252, 252, 252, 0.90) 100%),
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M2 4h5M9 12h5M4 9v5M12 2v5' stroke='%23d5cbbd' stroke-width='0.8' stroke-linecap='round' stroke-opacity='0.65'/%3E%3C/svg%3E");
            background-size: 100% 100%, 16px 16px;
            background-repeat: no-repeat, repeat;
          }
        }
      `}</style>

      {/* ===== 顶部导航（桌面端显示；手机端已有全局顶栏，本栏隐藏以消除顶部双重按钮残影） ===== */}
      <div className="sticky top-0 z-40 max-lg:hidden" style={{ backgroundColor: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(17,17,17,0.08)' }}>
        <div className="mx-auto flex max-w-[1340px] items-center justify-between gap-4 px-4 py-3.5 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="truncate text-lg font-black leading-none tracking-tight" style={{ color: INK }}>YANG.</div>
            <span className="hidden rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-[0.16em] sm:inline" style={{ borderColor: 'rgba(17,17,17,0.2)', color: 'rgba(17,17,17,0.55)' }}>{cfg.navName}</span>
          </div>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV_ITEMS.map((n) => (
              <button key={n.id} onClick={() => scrollToId(n.id === 'b-process' ? processNavId : n.id)} className="text-[13px] font-semibold text-[#666666] transition-colors hover:text-black">
                {n.en}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-full px-6 py-2.5 text-[12px] font-bold text-white transition-transform hover:-translate-y-0.5 max-lg:min-h-[44px]"
            style={{ backgroundColor: INK }}
          >
            Return
          </button>
        </div>
      </div>

      {/* ===== 白色 Bento 大画布 ===== */}
      <div className="mx-auto max-w-[1340px] px-3 pb-16 pt-4 md:px-5 max-lg:px-0 max-lg:pb-8 max-lg:pt-0">
        <div className="bento-canvas rounded-[36px] px-4 py-8 sm:px-7 md:px-10 md:py-12 max-lg:py-4" style={{ backgroundColor: WHITE, boxShadow: '0 24px 70px rgba(0,0,0,0.06)' }}>
          {/* ===== S1 顶部 Bento 网格（参考页版式） ===== */}
          <div className="grid grid-cols-12 gap-4 md:gap-5 max-lg:gap-3.5">
            {/* 主标题（巨型排版，参考页无上方小字行） */}
            <div className="col-span-12 flex min-h-[260px] flex-col justify-center lg:col-span-8 max-lg:order-2 max-lg:min-h-0 max-lg:pt-2">
              <h1 className="select-none" style={{ fontSize: 'clamp(2.2rem, 5vw, 4.4rem)', lineHeight: 0.96, letterSpacing: '-0.05em', fontWeight: 900, color: INK }}>
                {cfg.heroLines.map((line, li) => (
                  <span key={li} className="block whitespace-nowrap max-lg:whitespace-normal">
                    {line.map((seg, si) =>
                      seg && seg.p ? (
                        <span key={si} className="mx-[0.05em] inline-block border-[0.1em] border-black px-[0.38em] align-middle" style={{ lineHeight: 1.12, borderRadius: 999, letterSpacing: '-0.02em' }}>
                          {seg.p}
                        </span>
                      ) : (
                        <span key={si} className="mr-[0.16em]">{seg}</span>
                      ),
                    )}
                  </span>
                ))}
              </h1>
            </div>

            {/* 手机端专属首屏：展板眉头 + BG 底纹产品主图展台 (Hero Stage) + 连体工程铭牌条（桌面端 lg:hidden） */}
            <div className="col-span-12 max-lg:order-1 lg:hidden" id="b-hero-mobile">
              <div className="mb-2.5 flex items-center justify-between border-b-2 border-[#151515] pb-2">
                <div>
                  <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a5751]">
                    {cfg.welcomeLabel}
                  </span>
                  <h1 className="mt-0.5 text-[24px] font-black leading-[1.15] tracking-tight text-[#151515]">
                    {cfg.title1}
                  </h1>
                </div>
                <span className="border border-[#151515] bg-[#e67e33] px-2 py-1 font-mono text-[11px] font-extrabold uppercase tracking-wider text-[#151515]">
                  {cfg.titleSub.split(' ')[0]}
                </span>
              </div>
              <div className={`mob-hero-stage mob-hero-stage--${project?.id || '01'}`}>
                <div className="relative z-10 flex items-center justify-center p-2.5 max-lg:p-0">
                  <img src={cfg.hero} alt={cfg.title1} loading="eager" decoding="async" className="block w-full h-auto object-contain max-h-[340px] py-1" />
                </div>
                <div className="relative z-10 flex items-stretch border-t border-[#151515] bg-[#fcfcfc]">
                  <div className="flex w-[64px] shrink-0 flex-col justify-center border-r border-[#151515] bg-[#f4f2ed] px-2 py-2 text-center">
                    <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-[#e67e33]">
                      FIG.01
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#5a5751]">
                      HERO
                    </span>
                  </div>
                  <p className="m-0 flex-1 px-3 py-2 text-[15px] font-medium leading-[1.45] text-[#262421]">
                    {cfg.welcomeDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* 项目引言深色卡（2026-xx 改判：手机端恢复，它是版面里最重的黑色块） */}
            <Tile className="bento-tile-card col-span-12 flex min-h-[260px] flex-col justify-between p-6 md:p-7 lg:col-span-4 max-lg:order-3 max-lg:min-h-0 max-lg:p-0" as="aside" >
              <div style={{ backgroundColor: DARK }} className="flex flex-1 flex-col justify-between p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.14em]" style={{ borderColor: 'rgba(255,255,255,0.35)', color: LIGHT }}>{cfg.welcomeLabel.split('/')[0].trim()}</span>
                  <span className="text-5xl leading-[0.6]" style={{ color: LIGHT }}>✳</span>
                </div>
                <p className="mt-6 text-[13px] font-medium leading-[1.75] md:text-sm" style={{ color: '#A0A0A0' }}>{cfg.welcomeDesc}</p>
              </div>
            </Tile>

            {/* 动态图形（半调网点 + 旋转文字徽章：2026-xx 改判手机端恢复，它提供版面里唯一的动态纹理） */}
            <Tile className="col-span-12 flex min-h-[220px] items-center justify-center p-6 sm:col-span-6 lg:col-span-3 max-lg:order-4 max-lg:min-h-[176px]" as="div">
              <div className="halftone-bg" />
              <svg className="bento-spin relative z-10 h-[150px] w-[150px] md:h-[170px] md:w-[170px] max-lg:h-[112px] max-lg:w-[112px]" viewBox="0 0 100 100">
                <defs>
                  <path id="bento-circle-path" fill="none" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                </defs>
                <path d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" stroke="rgba(17,17,17,0.12)" strokeWidth="0.5" />
                <text fontSize="9.6" fontWeight="800" fill={INK} letterSpacing="0.8">
                  <textPath href="#bento-circle-path">{cfg.badgeText}</textPath>
                </text>
                <polygon points="50,40 54,47 62,50 54,53 50,60 46,53 38,50 46,47" fill={INK} />
              </svg>
            </Tile>

            {/* 数据支撑卡（参考版上下堆叠双格，手机端改为直角墨框展板数据格） */}
            <div className="col-span-12 grid grid-cols-2 gap-4 sm:col-span-6 lg:col-span-3 lg:min-h-[260px] lg:grid-cols-1 max-lg:order-5 max-lg:gap-2.5">
              {cfg.dataTiles.map((t, i) => (
                <div key={i} className="bento-tile-card bento-hover flex flex-col items-center justify-center rounded-[26px] px-4 py-3 text-center" style={{ backgroundColor: t.dark ? DARK : '#F4F2ED', color: t.dark ? LIGHT : INK }}>
                  <div className="text-4xl font-black leading-none md:text-5xl max-lg:text-[28px]" style={{ letterSpacing: '-0.03em' }}>{t.num}</div>
                  <div className="mt-2 text-[12px] font-medium md:text-[13px] max-lg:mt-1" style={{ color: t.dark ? '#D0D0D0' : '#5A5751' }}>{t.label}</div>
                </div>
              ))}
            </div>

            {/* 核心交互（橙大卡：为内层色块补齐 max-lg:p-4 内边距，彻底修复文字贴死左右边框） */}
            <Tile className="bento-tile-card group col-span-12 flex min-h-[260px] flex-col justify-between p-6 md:p-7 lg:col-span-6 max-lg:order-6 max-lg:min-h-0 max-lg:p-0" as="article">
              <div className="flex h-full w-full flex-col justify-between max-lg:p-4" style={{ backgroundColor: ACCENT }}>
                <div className="flex flex-wrap gap-2">
                  {cfg.actionPills.map((p, i) => (
                    <span key={p} className="rounded-full px-3 py-1 text-[11px] font-bold tracking-wide max-lg:rounded-none" style={i === 0 ? { backgroundColor: INK, color: WHITE } : { border: `1.5px solid ${INK}`, color: INK }}>
                      {p}
                    </span>
                  ))}
                </div>
                <div className="mt-3">
                  <h2 className="inline-block pb-1 text-5xl font-black leading-none md:text-6xl max-lg:text-[32px]" style={{ letterSpacing: '-0.04em', color: INK, borderBottom: '3px solid #111111' }}>{cfg.actionTitle}</h2>
                  <p className="mt-2.5 max-w-[46ch] text-[15px] font-medium leading-[1.55] md:text-sm" style={{ color: INK }}>{cfg.actionDesc}</p>
                </div>
                <span className="mt-3 block text-4xl font-black leading-none transition-transform duration-500 group-hover:rotate-45 md:self-end md:text-5xl" style={{ color: INK, transformOrigin: 'center' }}>↗</span>
              </div>
            </Tile>
          </div>

          {/* ===== S2 主视觉宽幅带（桌面端显示；手机端已提至首屏 Hero Stage，避免同一张图重复渲染两次） ===== */}
          <section className="mt-8 md:mt-10 max-lg:hidden" id="b-hero">
            <div className="relative h-[300px] overflow-hidden rounded-[30px] sm:h-[400px] lg:h-[440px]" style={{ border: '1px solid rgba(17,17,17,0.06)' }}>
              <img src={cfg.hero} alt={cfg.title1} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 45%, transparent 70%)' }} />
              <span className="absolute right-4 top-4 rounded-full px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-widest sm:right-6 sm:top-6" style={{ backgroundColor: WHITE, color: INK }}>
                Featured / Detail
              </span>
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
                <div className="flex items-center gap-2">
                  <span className="h-[3px] w-7" style={{ backgroundColor: ACCENT }} />
                  <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>{cfg.titleSub}</span>
                </div>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl lg:text-[44px]" style={{ letterSpacing: '-0.02em', textShadow: '0 2px 18px rgba(0,0,0,0.35)' }}>{cfg.title1}</h2>
                <p className="mt-2 hidden font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 sm:block">{cfg.heroCap}</p>
              </div>
            </div>
          </section>

          {/* ===== S3 核心亮点 ===== */}
          <section className="mt-12 scroll-mt-24 md:mt-16 max-lg:mt-6" id="b-features">
            <SectionLabel num="02" en="Core Highlights" cn="核心亮点" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:mt-6 max-lg:gap-2.5">
              {cfg.highlights.map((h, i) => {
                const skin = [
                  { bg: ACCENT, fg: INK, num: INK },
                  { bg: DARK, fg: WHITE, num: ACCENT },
                  { bg: '#F4F2ED', fg: INK, num: INK },
                  { bg: WHITE, fg: INK, num: INK, border: true },
                ][i % 4]
                return (
                  <div key={h.n} className="bento-tile-card bento-hover flex min-h-[200px] flex-col justify-between rounded-[26px] p-6 max-lg:min-h-0 max-lg:justify-start max-lg:p-3.5" style={{ backgroundColor: skin.bg, color: skin.fg, ...(skin.border ? { border: '1px solid rgba(17,17,17,0.08)' } : {}) }}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-black leading-none" style={{ color: skin.num }}>{h.n}</span>
                      <span className="text-sm leading-none opacity-30">✳</span>
                    </div>
                    <h3 className="mt-2 text-xl font-black leading-snug md:text-2xl max-lg:text-[16px]" style={{ letterSpacing: '-0.01em' }}>{h.t}</h3>
                    <p className="mt-2 text-[15px] font-medium leading-[1.45] md:text-xs" style={{ color: skin.bg === DARK ? '#D4D4D4' : '#3A3732' }}>{h.d}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 2026-xx 改判：内容默认全展开（用户「不要把内容藏起来」），仍可手动收起。
              summary 条在桌面被 CSS 隐藏，桌面端呈现与原版一致。 */}
          <details className="detail-fold" ref={openFoldOnMount}>
            <summary className="detail-fold-summary">
              工程推导全流程（4 章节 · 调研 / 结构 / 系统 / 原理）· 点按可收起
              <span aria-hidden="true">＋</span>
            </summary>

          {/* ===== S4 目标用户 + 场景 ===== */}
          <section className="mt-12 scroll-mt-24 md:mt-16 max-lg:mt-8" id="b-users">
            <SectionLabel num="03" en="Users & Scenes" cn="目标用户与场景" />
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="col-span-1 rounded-[26px] p-6 md:p-7 lg:col-span-5" style={{ backgroundColor: GRAY }}>
                <div className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-black/45">Persona</div>
                <div className="mt-4 space-y-3">
                  {cfg.audience.map((u) => (
                    <div key={u.role} className="flex items-center gap-3 rounded-[20px] bg-white p-4" style={{ border: '1px solid rgba(17,17,17,0.06)' }}>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black" style={{ backgroundColor: INK, color: ACCENT }}>✳</div>
                      <div>
                        <div className="text-sm font-black" style={{ color: INK }}>{u.role}</div>
                        <p className="mt-0.5 text-xs font-medium leading-relaxed text-black/55">{u.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {cfg.audienceImgs?.map((im, ai) => (
                  <Figure key={ai} src={im.src} alt={im.alt} tag={im.tag} contain={false} className="mt-4 h-[118px] w-full" />
                ))}
              </div>

              <div className="col-span-1 lg:col-span-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {cfg.scenarios.map((s) => (
                    <div key={s.t} className="flex min-h-[112px] flex-col justify-between rounded-[24px] p-5" style={{ backgroundColor: WHITE, border: '1px solid rgba(17,17,17,0.08)' }}>
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-sm font-black" style={{ color: INK }}>{s.t}</h5>
                        <span className="rounded-full px-2.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-widest" style={{ backgroundColor: ACCENT, color: INK }}>{s.k}</span>
                      </div>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-black/55">{s.d}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {cfg.stats.map((d) => (
                    <div key={d.l} className="rounded-[20px] p-4 text-center" style={{ backgroundColor: DARK }}>
                      <div className="font-mono text-lg font-black md:text-xl" style={{ color: ACCENT }}>{d.v}</div>
                      <div className="mt-1 text-[10px] font-bold text-white/55">{d.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ===== S5 灵感与草图（文件夹 + 图纸带） ===== */}
          <section className="mt-12 scroll-mt-24 md:mt-16 max-lg:mt-8" id="b-notes">
            <SectionLabel num="04" en="Inspiration & Sketches" cn="灵感与草图" />
            <div className="mt-6 rounded-[28px] px-4 py-8 md:px-8 md:py-10" style={{ backgroundColor: '#FFFFFF', border: '2px solid #111111', borderTop: '6px solid #E67E33', boxShadow: '10px 10px 0 rgba(17,17,17,0.12)' }}>
              <ConceptArchive
                archiveNo={`ARCHIVE-${project?.id || '01'}`}
                enTitle="Design Process"
                cnTitle={hasProcessFolder ? '物理形态推演 · 过程档案' : '设计过程'}
                leadCopy={
                  hasProcessFolder
                    ? '三个文件夹对应三种形态：点击文件夹盖片，下方图纸带随之切换为该系列的过程图纸；点击图纸可放大细看。'
                    : '三个文件夹对应设计过程的三个阶段：点击文件夹打开，下方图纸带呈现该阶段图纸，点击图纸可放大细看。'
                }
                moodImage={cfg.inspiration?.img}
                moodTag={cfg.inspiration?.tag}
                keywords={cfg.inspiration?.keywords || []}
                items={archiveItems}
              />
            </div>
          </section>

          {/* ===== 产品系统 ===== */}
          <section className="mt-12 scroll-mt-24 md:mt-16 max-lg:mt-8" id="b-system">
            <SectionLabel num={numSystem} en="Product System" cn="产品系统" />
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {cfg.system.map((m) => (
                <div key={m.name} className="bento-hover overflow-hidden rounded-[26px]" style={{ backgroundColor: WHITE, border: '1px solid rgba(17,17,17,0.08)' }}>
                  <Figure src={m.img} alt={m.name} tag={m.tag} className="h-[230px] w-full rounded-none border-0" />
                  <div className="p-6">
                    <h3 className="text-base font-black" style={{ color: INK }}>{m.name}</h3>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-black/55">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== S8 技术原理（深色条带） ===== */}
          <section className="mt-12 scroll-mt-24 md:mt-16 max-lg:mt-8" id="b-tech">
            <SectionLabel num={numTech} en="Tech Principle" cn="技术原理" />
            <Tile className="mt-6 flex flex-col" as="div">
              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2" style={{ backgroundColor: DARK }}>
                {cfg.tech.map((x, i) => (
                  <div key={x.t} className="p-6 md:p-8" style={{ borderRight: i % 2 === 0 ? 'none' : undefined }}>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-base font-black" style={{ backgroundColor: ACCENT, color: INK }}>{x.ic}</div>
                    <h3 className="font-mono text-sm font-extrabold uppercase tracking-[0.08em]" style={{ color: WHITE }}>{x.t}</h3>
                    <p className="mt-2 text-xs font-medium leading-relaxed md:text-[13px]" style={{ color: '#A6A6A6' }}>{x.d}</p>
                  </div>
                ))}
              </div>
            </Tile>
          </section>
          </details>

          {/* ===== S9 材质工艺 =====
              2026-xx 改判：默认展开（内容为主）。CMF 色板是"看配料表"，
              需要的人可以自己收起来，而不是默认看不到。 */}
          <details className="detail-fold" ref={openFoldOnMount}>
            <summary className="detail-fold-summary">
              材料与工艺（CMF 色板 · 材质配比）· 点按可收起
              <span aria-hidden="true">＋</span>
            </summary>
          <section className="mt-12 scroll-mt-24 md:mt-16 max-lg:mt-8" id="b-material">
            <SectionLabel num={numMaterial} en="Material & Craft" cn="材料与工艺" />
            {cfg.cmfImg && <Figure src={cfg.cmfImg.src} alt="材质方案" tag={cfg.cmfImg.tag} className="mb-4 mt-6 h-[150px] w-full max-lg:h-[108px]" />}
            <div className={`grid grid-cols-2 gap-3 md:grid-cols-3 ${cfg.cmfImg ? '' : 'mt-6'}`}>
              {cfg.cmf.map((m) => (
                <div key={m.name} className="bento-hover rounded-[26px] p-6 max-lg:p-4" style={{ backgroundColor: WHITE, border: '1px solid rgba(17,17,17,0.08)' }}>
                  <div className="h-[90px] w-full rounded-2xl" style={{ backgroundColor: m.hex, border: '1px solid rgba(17,17,17,0.08)' }} />
                  <div className="mb-1 mt-4 flex items-center justify-between gap-2">
                    <span className="text-sm font-black" style={{ color: INK }}>{m.name}</span>
                    <span className="font-mono text-[10px] font-bold uppercase text-black/35">{m.hex}</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-black/55">{m.desc}</p>
                </div>
              ))}
            </div>
            {donut.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[26px] px-6 py-4" style={{ backgroundColor: GRAY }}>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: INK }}>Material Ratio</span>
                {donut.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold" style={{ color: INK }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color, border: '1px solid rgba(17,17,17,0.15)' }} />
                    {d.label} <b>{d.value}%</b>
                  </span>
                ))}
              </div>
            )}
          </section>
          </details>

          {/* 2026-xx 改判：默认展开（内容为主），需要的人可以自己收起来。 */}
          <details className="detail-fold" ref={openFoldOnMount}>
            <summary className="detail-fold-summary">
              验证与迭代（定性反馈 · 工程问题 · 设计维度雷达）· 点按可收起
              <span aria-hidden="true">＋</span>
            </summary>

          {/* ===== S10 验证与迭代 ===== */}
          <section className="mt-12 scroll-mt-24 md:mt-16 max-lg:mt-8" id="b-iter">
            <SectionLabel num={numIter} en="Test & Iteration" cn="验证与迭代" />
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-[26px] p-6 md:p-7" style={{ backgroundColor: ACCENT }}>
                <h3 className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: INK }}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px]" style={{ backgroundColor: INK, color: ACCENT }}>✓</span>
                  交互验证 / 定性反馈
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {cfg.iterationL.map((x) => (
                    <li key={x.k} className="rounded-[20px] bg-white/60 p-4" style={{ border: '1px solid rgba(17,17,17,0.1)' }}>
                      <div className="mb-1 text-xs font-black" style={{ color: INK }}>{x.k}</div>
                      <p className="text-xs font-medium leading-relaxed text-black/60">{x.d}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[26px] p-6 md:p-7" style={{ backgroundColor: WHITE, border: '1px solid rgba(17,17,17,0.08)' }}>
                <h3 className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: INK }}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px]" style={{ backgroundColor: INK, color: ACCENT }}>✱</span>
                  问题与解决 / 工程迭代
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {cfg.iterationR.map((x) => (
                    <li key={x.k} className="rounded-[20px] p-4" style={{ backgroundColor: GRAY }}>
                      <div className="mb-1 text-xs font-black" style={{ color: INK }}>{x.k}</div>
                      <p className="text-xs font-medium leading-relaxed text-black/60">{x.d}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {radar && (
              <div className="mt-4 rounded-[26px] px-6 py-5" style={{ backgroundColor: GRAY }}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: INK }}>Design Dimension</span>
                  <span style={{ color: INK }}>◎</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {radar.labels.map((label, i) => (
                    <span key={label} className="rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold" style={{ color: INK, border: '1px solid rgba(17,17,17,0.08)' }}>
                      {label} <b>{radar.values[i]}</b>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
          </details>

          {/* ===== 底部返回 ===== */}
          <footer className="mt-14 md:mt-20">
            <Tile className="relative" as="div">
              <div className="flex flex-col items-center px-6 py-14 text-center md:py-16" style={{ backgroundColor: DARK }}>
                <div className="halftone-bg opacity-60" style={{ backgroundImage: 'radial-gradient(circle, rgba(230, 126, 51,0.5) 2px, transparent 2.6px)' }} />
                <span className="relative z-10 text-2xl" style={{ color: ACCENT }}>✳</span>
                {cfg.closing.map((c, i) => (
                  <p key={i} className={`relative z-10 mt-3 font-black ${i === 0 ? 'text-xl md:text-2xl' : 'text-sm md:text-base'}`} style={{ color: i === 0 ? WHITE : ACCENT, letterSpacing: '0.02em' }}>
                    {c}
                  </p>
                ))}
                <button
                  onClick={onClose}
                  className="relative z-10 mt-8 rounded-full px-10 py-3.5 font-mono text-sm font-black uppercase tracking-[0.08em] text-black transition-transform hover:-translate-y-1"
                  style={{ backgroundColor: ACCENT }}
                >
                  ← Return to Wheel
                </button>
                <span className="relative z-10 mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{cfg.navName}</span>
              </div>
            </Tile>
          </footer>
        </div>
      </div>
    </div>
  )
}
