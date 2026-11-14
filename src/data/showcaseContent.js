/**
 * showcaseContent —— 项目展示板块的「可见内容层」
 *
 * 设计原则（对应本轮反馈）：
 *  1. 不新增任何事实。所有数值、材料、尺寸、工艺、进展均摘自
 *     projectDossiers.js 与 App.jsx 的 project.details / specs / gallery alt，
 *     只做摘录、压缩语序与去除重复，不推断、不补写、不量化未确认项。
 *  2. 不再有字数硬截断。fullSubtitle 是完整句子；此前 22 字 / 24 字截断
 *     造成的「…与 AI 形」「…外观设计与 AI」残句在此彻底移除。
 *  3. 无独立调研数据的项目（02/04/05/06）不再把数字栏留空，
 *     改由组件从 project.specs 渲染真实规格摘录。
 *  4. 每个项目有自己的品类版式变体、英文标签与专属互动装置，
 *     破除「8 个项目 100% 套同一模板」。
 */

/** 品类 → 段落编排顺序。首屏与收尾固定，中间段落按项目语境换序。 */
export const SEQUENCES = {
  light: ['hero', 'statement', 'signature', 'spread', 'invert', 'specimen', 'film', 'outro', 'next'],
  mechanism: ['hero', 'statement', 'signature', 'spread', 'specimen', 'invert', 'film', 'outro', 'next'],
  engineering: ['hero', 'specimen', 'statement', 'signature', 'spread', 'invert', 'film', 'outro', 'next'],
  interface: ['hero', 'statement', 'spread', 'signature', 'invert', 'specimen', 'film', 'outro', 'next'],
  furniture: ['hero', 'statement', 'spread', 'specimen', 'signature', 'invert', 'film', 'outro', 'next'],
  concept: ['hero', 'statement', 'signature', 'specimen', 'spread', 'invert', 'film', 'outro', 'next'],
  character: ['hero', 'signature', 'statement', 'specimen', 'spread', 'invert', 'film', 'outro', 'next'],
}

/** 每个品类专属的可玩装置。全部只用项目自身已有的真实信息做参数。 */
const SIG = {
  dimmer: { type: 'dimmer', title: '睡前渐暗', hint: '拖动推杆，看光线如何退场' },
  rail: { type: 'rail', title: '进度同步', hint: '拖动轨道，蜗牛走到哪，进度就到哪' },
  ruler: { type: 'ruler', title: '图纸尺寸', hint: '拖动游标，读评审表上的图纸值' },
  action: { type: 'action', title: '不开按钮，开一个动作', hint: '把木楔推回去，灯才亮' },
  flow: { type: 'flow', title: '不绕路的流程', hint: '点节点，看界面翻到哪一步' },
  module: { type: 'module', title: '换椅子 → 换软包', hint: '拖动，把软包从木架里抽出来' },
  compass: { type: 'compass', title: '六个方向', hint: '点方向，看它长成什么' },
  thermal: { type: 'thermal', title: '温度决定软硬', hint: '拖动温度轴，看它今天硬不硬' },
}

export const SHOWCASE = {
  '01': {
    variant: 'light',
    signature: SIG.dimmer,
    labels: { fig: '器物', object: 'LIGHT', detail: 'MATERIAL / MODULE / CRAFT', archive: 'IMAGE ARCHIVE' },
    fullSubtitle: '基于独居青年情绪疗愈场景的灯具设计 · 本科毕业设计',
    sourceLine: '毕业论文（调研 / 制作）· 毕业设计展板与实物',
    facts: [
      { v: '209', l: '份问卷发放 / 回收', n: '受访者年龄主要在 23–35 岁' },
      { v: '72.25%', l: '偶尔感到孤独', n: '论文问题五 · 情绪状态' },
    ],
    specimenTitle: '把情绪做成可拆的光',
    specimenNote:
      '系列以黑胡桃木、磨砂亚克力与金属形成温度与结构的反差；发光模块沿金属主杆磁吸移动、错位堆叠，让光在木质缝隙间漫反射，而不是直射。',
    specimen: [
      { k: '材质', v: '黑胡桃木 · 磨砂亚克力 · 金属配件与磁吸轨道' },
      { k: '结构', v: '发光模块可沿主杆移动、错位堆叠；系列含桌面灯、壁灯与落地灯' },
      { k: '工艺', v: '矩阵底座 3D 打印打样与插拔孔位公差测试；木圆柱人工打磨、木蜡油处理' },
      { k: '依据', v: '论文第 2 章问卷分析、第 3 章设计说明、第 4 章制作与问题复盘' },
      { k: '进展', v: '实物已制作完成，并在 2026 届毕业设计作品展以展板与实物展出' },
    ],
  },

  '02': {
    variant: 'mechanism',
    signature: SIG.rail,
    labels: { fig: '装置', object: 'MECHANISM', detail: 'STRUCTURE / FEEDBACK / FLOW', archive: 'IMAGE ARCHIVE' },
    fullSubtitle: '数字化等待的物理疗愈装置 · 桌面交互装置设计',
    sourceLine: '产品渲染 · 用户旅程分镜 · 场景与交互说明',
    facts: null, // 无独立问卷数据 → 组件渲染 project.specs 规格摘录
    specimenTitle: '把等待交给一只蜗牛',
    specimenNote:
      '蜗牛壳用哑光陶瓷，轨道与底座用半透磨砂玻璃 / 亚克力透出底部微光；屏幕上的进度与轨道上的实体位置一一对应，把数字等待变成看得见的物理旅程。',
    specimen: [
      { k: '材质', v: '哑光陶瓷蜗牛壳 · 半透磨砂玻璃 / 亚克力轨道与底座' },
      { k: '结构', v: '机械蜗牛沿履带式底座轨道爬行，位置与下载 / 渲染进度同步' },
      { k: '反馈', v: '任务启动触发底座呼吸灯；进度到 100% 抵达终点并触发完成特效' },
      { k: '资料', v: '交互流程定义、用户旅程分镜与场景效果图' },
      { k: '边界', v: '机械传动与电路实现细节未在现有资料中给出' },
    ],
  },

  '03': {
    variant: 'engineering',
    signature: SIG.ruler,
    labels: { fig: '灯具', object: 'ENGINEERING', detail: 'DRAWING / MATERIAL / PROCESS', archive: 'IMAGE ARCHIVE' },
    fullSubtitle: '实习期间完成的灯具设计：材质探索与 AI 形态推演',
    sourceLine: '外观评审表（台灯 / 客厅吊灯）· AI 形态方案',
    facts: [
      { v: '2', l: '张外观造型评审表', n: '台灯 / 客厅吊灯' },
      { v: '3000K', l: 'LED 灯板色温', n: '3.5W / 24V · 图纸记录值' },
    ],
    specimenTitle: '从图纸开始落地',
    specimenNote:
      '两条线并行：孔雀石材质线已进入打样落地阶段，台灯与客厅吊灯两款完成外观造型评审表，结论「打样」、图纸评级「B.良好」；AI 辅助形态线完成系列化形态推演与场景呈现。',
    specimen: [
      { k: '材质', v: '优质不锈钢 DD-136D 拉丝香槟金 · 玻璃 · 孔雀石' },
      { k: '尺寸', v: '台灯总高 450 / 底座 Ø150；吊灯总跨 Ø1000（均为图纸记录值，单位 mm）' },
      { k: '光源', v: 'LED 圆形灯板 3.5W / 24V / 3000K；吊灯另设 3000K 侧发光灯带' },
      { k: '工艺', v: '外贴 2.5mm 孔雀石与白云彩＋金箔玻璃筒；外环上下各刻一圈「V」槽' },
      { k: '边界', v: '其余形态或细节尚未确认，不作展开；不推断批量结果与上市状态' },
    ],
  },

  '04': {
    variant: 'light',
    signature: SIG.action,
    labels: { fig: '灯具', object: 'GESTURE', detail: 'ACTION / MATERIAL / STATE', archive: 'IMAGE ARCHIVE' },
    fullSubtitle: '把开灯变成一次动作 · 交互灯具系列设计',
    sourceLine: '七盏灯具成果图 · 交互说明 · 展板',
    facts: null,
    specimenTitle: '动作就是开关',
    specimenNote:
      '白色方盒的缺口等着一块橡木楔，篝火等着添柴，卵石需要被握在手心。七盏灯各对应一个「完成动作」，用材质的缝隙替代实体开关，让照明动作本身成为可感知的情绪出口。',
    specimen: [
      { k: '材质', v: '白瓷漆面方盒 · 橡木楔 · 胡桃木圆柱 · 哑光白卵石 · RGB 底座光' },
      { k: '交互', v: '推入 / 抽出、添柴增亮、握持变色、三态推进' },
      { k: '结构', v: '开关藏在木块与缺口、木柴与火、掌心与卵石之间' },
      { k: '资料', v: '交互定义、材质说明、打样迭代记录与成果图' },
      { k: '边界', v: '具体电气参数未在现有资料中给出' },
    ],
  },

  '05': {
    variant: 'interface',
    signature: SIG.flow,
    labels: { fig: '界面', object: 'INTERFACE', detail: 'FLOW / SYSTEM / INTERACTION', archive: 'SCREEN ARCHIVE' },
    fullSubtitle: '妆娘预约 / 服装租借 / 展会日程的界面流程设计',
    sourceLine: '界面成品稿 · 流程稿 · 信息架构',
    facts: null,
    specimenTitle: '一条不绕路的路',
    specimenNote:
      '以卡片化信息架构与分类导航收拢服务：首页聚合搜索、热门展会与推荐妆娘；详情页给出评分、接单次数与价格；购票、导航、分享、预约在同一条路径上完成。',
    specimen: [
      { k: '架构', v: '卡片化信息架构 · 清晰分类导航 · 圆角卡片' },
      { k: '流程', v: '首页 → 详情 → 预约 / 购票 / 导航 / 分享' },
      { k: '数据', v: '详情页展示评分、接单次数、价格；展会总数与今日参展人数' },
      { k: '视觉', v: '轻量白底 · 蓝紫功能强调色 · 充足留白便于快速扫读' },
      { k: '边界', v: '未附用户测试数据或开发实现说明；不写上线状态与运营数据' },
    ],
  },

  '06': {
    variant: 'furniture',
    signature: SIG.module,
    labels: { fig: '结构', object: 'FRAME', detail: 'JOINERY / MODULE / CMF', archive: 'IMAGE ARCHIVE' },
    fullSubtitle: '榫卯实木框架 + 可拆软包模块 · 产品与家具设计',
    sourceLine: '结构解析 · 材料样块 · 家居场景渲染',
    facts: null,
    specimenTitle: '一硬一软，各管一件事',
    specimenNote:
      '框架负责结构与造型，软包负责坐感与表情，两件事解耦：同一副木架靠换软包改变颜色与软硬，坐垫整块抽出即是一块蒲团，靠背沿滑槽上下插拔调整支撑。',
    specimen: [
      { k: '材质', v: '白橡实木框架（原木清漆，可选深胡桃）· 棉麻混纺软包 · 高回弹棉花' },
      { k: '结构', v: '坐垫与靠背各自成模块，沿框架内侧导轨推入定位' },
      { k: '交互', v: '坐垫抽出可作蒲团；靠背沿滑槽上下插拔' },
      { k: '工艺', v: '以榫卯为主、连接件为辅，无外露五金，可反复拆装与搬运' },
      { k: '边界', v: '未附实物打样或量产确认资料' },
    ],
  },

  '07': {
    variant: 'concept',
    signature: SIG.compass,
    labels: { fig: '概念', object: 'CONCEPTS', detail: 'SUBJECT / MATERIAL / SCENE', archive: 'IMAGE ARCHIVE' },
    fullSubtitle: 'AIGC 辅助产品概念发散 · 六个方向',
    sourceLine: '六个概念效果图 · 交互与材质说明',
    facts: [
      { v: '6', l: '个产品概念方向', n: '每个概念均配使用方式说明' },
      { v: '2', l: '条发散路径', n: '生活细节 / 云南在地题材' },
    ],
    specimenTitle: '从动作，走到在地',
    specimenNote:
      '前半程从生活细节里找交互 —— 摇晃、定时、称重；后半程从云南的针脚、叶脉与林子里找题材，把在地手艺与物种翻译成今天还在用的器物。',
    specimen: [
      { k: '题材', v: '生活细节（摇晃 / 定时 / 称重）· 云南在地（针脚 / 叶脉 / 林子）' },
      { k: '材质', v: '磨砂半透树脂 · 阳极氧化铝 · 耐磨防水织造布 · 温感变色树脂' },
      { k: '交互', v: '摇晃蓄光；旋钮与拨杆分控亮度 / 时间；隐藏灯带把重量变成进度' },
      { k: '资料', v: '六个概念的定义、材质说明与场景合成图' },
      { k: '边界', v: '概念提案不等于已完成产品；未附工程实现资料，不推断量产可行性' },
    ],
  },

  '08': {
    variant: 'character',
    signature: SIG.thermal,
    labels: { fig: '角色', object: 'CHARACTER', detail: 'STATE / EXPRESSION / MERCH', archive: 'IMAGE ARCHIVE' },
    fullSubtitle: '温度驱动的猫冰 IP 形象系统 · 潮玩挂卡',
    sourceLine: '双态主视觉 · 三视图 · 表情系统与周边延展',
    facts: [
      { v: '14', l: '款情绪表情', n: '另有周边应用与挂卡包装' },
      { v: '2', l: '种形态设定', n: '冻结态 / 软化态' },
    ],
    specimenTitle: '今天硬，还是软',
    specimenNote:
      '温度决定它今天是硬的还是软的：-18°C 到 +38°C 的温度轴一拖，冰壳在冻结态与软化态之间双向转换，尾巴形态与地面水滴同步变化，两套三视图各自对应。',
    specimen: [
      { k: '机制', v: '-18°C — +38°C 温度轴驱动冻结态 / 软化态双相转换' },
      { k: '造型', v: '圆水滴猫尾贯穿底部化为冰棍手柄；冰壳收紧或摊平' },
      { k: '色彩', v: '暖橘 #FB923C 猫体 · 极光冷蓝 #00F0FF 冰壳 · 熔岩热橙 #FF4500 热端' },
      { k: '系统', v: '两套三视图、14 款情绪表情、周边应用与挂卡包装' },
      { k: '边界', v: '温度轴为界面演示机制，不表述为实体材料的真实相变性能' },
    ],
  },
}

export function getShowcase(id) {
  return Object.prototype.hasOwnProperty.call(SHOWCASE, String(id)) ? SHOWCASE[String(id)] : null
}

export function getSequence(variant) {
  return SEQUENCES[variant] || SEQUENCES.light
}

export default SHOWCASE
