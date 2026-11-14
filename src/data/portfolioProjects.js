/**
 * portfolioProjects.js —— 项目与经历数据层（从 App.jsx 原样抽出）
 *
 * 为什么单独成模块：手机端已经分离成独立入口（src/mobile），
 * 桌面入口与手机入口必须读同一份项目数据，否则两边会漂移。
 * 这里的内容与原 App.jsx 内联版本完全一致，只加了 export。
 */
import { asset } from '../assetPath'
import { statusLabel } from './projectDossiers'

/** 项目副标题与标签：桌面轮盘与手机项目牌堆共用同一份 */
export const PROJECT_META = {
'01': { sub: '产品设计 / UI UX', tags: ['情绪疗愈', '灯具设计', 'CMF'] },
'02': { sub: '产品设计 / 数字化', tags: ['交互装置', '数字化', '机械结构'] },
'03': { sub: '产品设计 / 实习灯具', tags: ['灯具设计', '材质探索', 'AI 形态'] },
'04': { sub: '产品设计 / 交互灯具', tags: ['交互设计', '情绪疗愈', '灯具'] },
'05': { sub: '用户研究 / 界面体验', tags: ['交互设计', '界面流程', '服务设计'] },
'06': { sub: '产品设计 / 家具', tags: ['家具设计', '模块化', 'CMF 研究', '榫卯结构'] },
'07': { sub: '产品设计 / 产品可视化', tags: ['概念设计', '产品可视化', '3D建模'] },
'08': { sub: 'IP 设计 / 潮玩', tags: ['IP设计', '潮玩挂卡', '相变交互'] },
}

/** 经历 → 作品转接口：projectId 指向产出该项目的经历（目前只有宝辉挂着 03） */
export const experiences = [
    {
      company: '东莞宝辉灯饰有限公司',
      title: '产品外观设计师',
      date: '2025.10 – 2026.03',
      projectId: '03',
      items: [
        '外观设计与 AI 赋能：对接业务端需求完成 3D 建模，引入 AI 工具进行快速形态探索，将概念验证周期从 7 天缩短至 3 天，独立制作 3 套可直接落地的产品外观方案。',
        '跨界材质项目主导：独立负责孔雀石与金属材质跨界创意产品设计，完成概念设计与多尺寸 CAD 图纸输出，累计产出 5 套兼顾视觉美观度与生产可行性的完整方案。',
        '落地与成本管控：全程跟进打样试产环节，协同工程师调整结构与工艺细节，将外观落地偏差率控制到最小；严格管控材料成本用量，平衡视觉呈现与成本控制。',
      ],
    },
    {
      company: '东莞新力威丝印有限公司',
      title: '设计部实习生',
      date: '2025.07 - 2025.09',
      items: [
        '协助完成平面图案设计与迭代优化，累计交付 30+ 款符合印刷标准的设计方案。',
        '配合生产部门完成打样测试，针对性调整色彩参数与图案精度，辅助解决多批次色彩偏差、工艺适配问题，有效降低生产损耗。',
        '运用 AI 图像生成技术拓展图案创意变体，单项目创意产出效率提升 40%，为客户提供更多元的设计选择。',
      ],
    },
    {
      company: '中财上智研究院品牌视觉体系升级设计比赛',
      title: '设计组长',
      date: '2024.11 – 2025.01',
      items: [
        '参与品牌升级需求梳理，负责 IP 形象创意设计与落地执行，累计输出 30+ 概念草图并多轮迭代优化，最终方案获比赛奖项通过。',
        '搭建完整品牌视觉落地规范文档，覆盖包装、宣传物料、线上场景等 12 类核心应用场景，为后续品牌延伸应用减少沟通成本。',
      ],
    },
]

/**
 * 项目清单。数组顺序 = 展示顺序；id = 身份键（指向 PROJECT_META、详情页主题与深链）。
 * 当前顺序：01 心景 → 02 慢行者 → 03 实习灯具 → 04 情绪疗愈灯具
 *           → 08 猫冰 → 06 模块化座椅 → 05 UI 界面 → 07 产品概念设计
 */
export const projects = [
    {
      id: '01',
      category: '产品设计',
      title: '《心景》疗愈灯具',
      subtitle: '基于独居青年情绪疗愈场景的灯具设计',
      image: asset('/xinjing/user-01.webp'),
      imagePosition: '50% 50%',
      gallery: [
        { src: asset('/xinjing/user-01.webp'), alt: '三款灯具聚焦特写场景（封面）' },
        { src: asset('/xinjing/user-02.webp'), alt: '方案C：分层展台式摆放' },
        { src: asset('/xinjing/user-04.webp'), alt: '夜晚发光效果' },
        { src: asset('/xinjing/user-05.webp'), alt: '整体效果展示' },
        { src: asset('/xinjing/user-03.webp'), alt: '三款灯具场景组合' },
      ],
      desc: '通过深入调研独居青年的生活习惯与照明需求，设计一款能够感知、理解并回应情绪的灯具，营造温暖的情感港湾。',
      details: {
        overview: '针对 23-35 岁独居青年群体的情感疗愈灯具系列。调研显示 72.25% 的受访者偶尔感到孤独，73.68% 的用户偏好柔和暖光改善睡眠，超过半数用户愿意购买能够理解情绪的灯具。',
        targetUsers: '23-35 岁独居青年，尤其是在大城市奋斗、面临孤独感与职场焦虑的“空巢青年”。',
        concept: '以黑胡桃木、磨砂亚克力与金属的反差结合，通过模块化拼搭、错位堆叠等实体交互方式，将灯具从单一照明工具转化为具有心理干预功能的疗愈媒介，帮助用户释放焦虑、重建内心秩序。',
        interaction: '人体感应自动开灯减少黑暗孤独感；睡前灯光缓慢变暗顺应褪黑素分泌；夜间起夜提供低亮度指引光线；发光模块可沿金属主杆磁吸移动，错位堆叠让光线在木质缝隙间温和漫反射。',
        cmf: '主体采用黑胡桃木营造温度感，磨砂亚克力实现柔和漫反射，金属配件提供结构支撑与磁吸轨道。系列包含桌面氛围灯、墙面壁灯与空间落地灯，形成由局部到整体的疗愈空间。',
      },
      specs: [
        { label: '设计原理 / 目的', value: '以光为媒介，为独居青年提供情绪疗愈与情感陪伴' },
        { label: '目标人群', value: '23-35 岁独居青年、租房居住者、需要情感慰藉的都市人群' },
        { label: '造型设计', value: '系列化壁灯 / 客厅灯 / 台灯，模块化木质底座与柔光亚克力' },
      ],
      chartData: {
        radar: { labels: ['氛围感', '功能性', '情感化', '工艺性', '创新性'], values: [95, 82, 94, 86, 88] },
        donut: [
          { label: '黑胡桃木', value: 40, color: '#5d4037' },
          { label: '磨砂亚克力', value: 30, color: '#e8e4dd' },
          { label: '金属配件', value: 20, color: '#a8a29e' },
          { label: '光源系统', value: 10, color: '#fde68a' },
        ],
        bars: [
          { label: '用户调研', value: 20 },
          { label: '概念发散', value: 25 },
          { label: '结构验证', value: 20 },
          { label: '样机制作', value: 20 },
          { label: '迭代优化', value: 15 },
        ],
        progress: 88,
      },
      color: 'bg-white',
    },
    {
      id: '02',
      category: '产品设计',
      title: '《慢行者》',
      subtitle: '数字化等待的物理疗愈装置',
      image: asset('/slowwalker-render.jpeg'),
      imagePosition: 'center',
      gallery: [
        { src: asset('/slowwalker-render.jpeg'), alt: '产品渲染图' },
        { src: asset('/slowwalker-journey.webp'), alt: '用户旅程分镜' },
        { src: asset('/slowwalker-scene-1.webp'), alt: '使用场景 1' },
        { src: asset('/slowwalker-scene-2.png'), alt: '使用场景 2' },
        { src: asset('/slowwalker-hero.webp'), alt: '桌面摆放效果' },
      ],
      desc: '以“蜗牛”为符号的桌面交互装置，利用机械蜗牛在轨道上的爬行实时模拟电脑文件下载进度，将冰冷数字进度转化为充满禅意的微型动作。',
      details: {
        overview: '本项目是一款桌面交互装置，利用机械蜗牛在轨道上的爬行来实时模拟电脑文件的下载进度，旨在通过“慢”与“快”的冲突美学，为数字游民提供情绪价值。',
        targetUsers: '长时间面对电脑的都市白领、自由职业者、数字游民，以及在高强度工作中需要情绪缓冲的独居青年。',
        concept: '将原本令人焦虑的“等待时间”转化为一场充满仪式感的物理旅程。蜗牛不仅是进度的物理显示器，更是快节奏工作中具备拟人化性格的“机械宠物”。',
        interaction: '触发：用户点击“渲染”或“下载大文件”，屏幕显示进度条 0%。同步：底座灯光以呼吸灯效亮起，机械蜗牛开始缓慢启动。过程：电脑显示 80%，蜗牛爬行到轨道 80% 位置。完成：电脑显示 100%，蜗牛到达终点，触发完成特效。',
        cmf: '蜗牛壳采用哑光陶瓷质感，温润亲肤，消除电子产品冰冷感；轨道与底座使用半透磨砂玻璃/亚克力，透出底部微光，营造科技禅意。审美定位为“科技禅意（Techno-Zen）”，关键词：治愈、静谧、微光、秩序感。',
      },
      specs: [
        { label: '设计原理 / 目的', value: '将数字等待转化为物理仪式，缓解焦虑并提供情绪疗愈' },
        { label: '目标人群', value: '数字游民、独居青年、长时间面对电脑的人群' },
        { label: '造型设计', value: '极简几何蜗牛 + 履带式底座，哑光陶瓷与半透磨砂材质' },
      ],
      chartData: {
        radar: { labels: ['情感化', '创新性', '交互性', '工艺性', '视觉性'], values: [94, 92, 90, 82, 88] },
        donut: [
          { label: '哑光陶瓷', value: 45, color: '#e8e4dd' },
          { label: '半透磨砂玻璃', value: 25, color: '#a8a29e' },
          { label: '亚克力', value: 20, color: '#d6d3d1' },
          { label: '金属五金', value: 10, color: '#3b352b' },
        ],
        bars: [
          { label: '用户调研', value: 15 },
          { label: '概念发散', value: 25 },
          { label: '草图深化', value: 20 },
          { label: '结构验证', value: 20 },
          { label: '渲染展示', value: 20 },
        ],
        progress: 90,
      },
      color: 'bg-[#e6e6e6]',
    },
    {
      id: '03',
      category: '产品设计',
      // 这一项原先叫「AI 灯具形态探索」，名字只覆盖了 SERIES 02，
      // 把 SERIES 01 孔雀石那七盏挡在了标题之外。两组都是实习期间做的，
      // 所以改成「实习灯具设计」——两条线（材质 / AI 形态）都装得下。
      title: '实习灯具设计',
      subtitle: '实习期间完成的灯具设计：材质探索与 AI 形态',
      // 首页展示照片换成 AI LAB 的主角「棱纹玻璃水滴」：md 里它是整组的视觉爆点
      // （蓝/粉/琥珀撞色），比原来那张通用灯图更能代表这一版的 AI 探索气质。
      image: asset('/lamps/ai/01-glass-drops.webp'),
      imagePosition: '50% 42%',
      gallery: [
        { src: asset('/lamps/ai/01-glass-drops.webp'), alt: '棱纹玻璃水滴吊灯' },
        { src: asset('/lamps/01-ring-livingroom.webp'), alt: '孔雀石光环吊灯 · 客厅场景' },
        { src: asset('/lamps/ai/03-wave-layers.webp'), alt: '音浪波浪灯' },
      ],
      desc: '实习期间完成的灯具外观设计，两条线并行：天然孔雀石与拉丝黄铜的材质探索，以及 AIGC 辅助下的系列化形态推演。',
      details: {
        overview: '通过 AI 快速迭代灯具形态，探索系列化吊灯、壁灯与客厅灯方案，平衡艺术感与生产可行性。',
        targetUsers: '中高端家居用户、空间设计师。',
        concept: '以线条、层次与光影效果为核心，生成多种材质组合的灯具方案，形成具有统一设计语言的产品系列。',
        interaction: '从形态发散到材质测试，再到系列统一、场景渲染与落地评估，形成完整的 AI 辅助设计流程。',
        cmf: '金属、玻璃、亚克力与织物的组合，强调材质反光、透光与柔光效果，营造层次丰富的光影氛围。',
      },
      specs: [
        { label: '设计原理 / 目的', value: '材质探索与 AI 形态推演两条线并行，兼顾艺术感与生产可行性' },
        { label: '目标人群', value: '中高端家居用户、空间设计师' },
        { label: '造型设计', value: '系列化吊灯与壁灯，强调线条、层次与光影效果' },
      ],
      chartData: {
        radar: { labels: ['形态创新', '光影效果', '系列化', '材质组合', '生产可行'], values: [94, 90, 88, 86, 76] },
        donut: [
          { label: '金属', value: 35, color: '#a8a29e' },
          { label: '玻璃', value: 25, color: '#e8e4dd' },
          { label: '亚克力', value: 25, color: '#fde68a' },
          { label: '织物', value: 15, color: '#d6d3d1' },
        ],
        bars: [
          { label: '形态发散', value: 25 },
          { label: '材质测试', value: 25 },
          { label: '系列统一', value: 20 },
          { label: '场景渲染', value: 20 },
          { label: '落地评估', value: 10 },
        ],
        progress: 86,
      },
      color: 'bg-[#e6e6e6]',
    },
    {
      id: '04',
      category: '产品设计',
      title: '情绪疗愈灯具',
      subtitle: '以「手的动作」为开关的交互灯具系列',
      image: asset('/lamps/grad/02-campfire.webp'),
      imagePosition: '50% 42%',
      gallery: [
        { src: asset('/lamps/grad/02-campfire.webp'), alt: '篝火灯 · 电子火焰与木柴' },
        { src: asset('/lamps/grad/01-fill-hand.webp'), alt: '填补心空 · 手部交互' },
        { src: asset('/lamps/grad/07-stacked-logs.webp'), alt: '胡桃木圆柱层叠灯 · 错层发光' },
      ],
      desc: '七盏以「手的动作」为开关的交互灯具。开关被藏进材质的缝隙里——推入木块、握住卵石、放上木柴，照明不再是按按钮，而是完成一个仪式。',
      details: {
        overview: '把「开灯」重新定义为一次动作：白色方盒的缺口等着一块橡木楔，篝火等着添柴，卵石需要被握在手心。七件灯具各自对应一个「完成动作」，用材质的缝隙替代实体开关。',
        targetUsers: '需要夜间情绪缓冲的独居青年与长期伏案人群。',
        concept: '以「和物握手」替代「按按钮」：把开关藏进木块与缺口、木柴与火、掌心与卵石之间，让照明动作本身成为一种可被感知的情绪出口。',
        interaction: '推入木块灯亮、抽出灯灭；木柴逐根添加，电子火焰随之增亮；卵石握持变色、放回底座转为夜灯；切割立方灯在暗红、橙、全亮三态之间推进。',
        cmf: '白瓷漆面方盒配橡木楔、胡桃木圆柱、哑光白圆环、暖白卵石与一圈 RGB 底座光；以木材的温润中和光源的冷感。',
      },
      specs: [
        { label: '设计原理 / 目的', value: '把照明开关转化为可被感知的物理动作，用交互本身承载情绪疗愈' },
        { label: '目标人群', value: '独居青年、有夜间情绪缓冲需求的人群' },
        { label: '交互方式', value: '推入 / 握持 / 添柴 / 插槽投影，七盏灯各对应一个完成动作' },
      ],
      chartData: {
        radar: { labels: ['交互叙事', '材质触感', '情绪疗愈', '形态简约', '可实现性'], values: [94, 90, 88, 82, 78] },
        donut: [
          { label: '橡木 / 胡桃木', value: 35, color: '#a9744f' },
          { label: '白瓷漆面', value: 25, color: '#f0ece4' },
          { label: '哑光白', value: 22, color: '#e8e4dd' },
          { label: '金属 / RGB 光', value: 18, color: '#d6b46a' },
        ],
        bars: [
          { label: '调研', value: 15 },
          { label: '概念草图', value: 25 },
          { label: '交互验证', value: 25 },
          { label: '打样迭代', value: 25 },
          { label: '展板定稿', value: 10 },
        ],
        progress: 90,
      },
      color: 'bg-white',
    },
    {
      id: '08',
      category: 'IP 设计',
      title: '猫冰 CAT-ICE : THERMAL LAB',
      subtitle: '用温度决定软硬的 IP 形象',
      image: asset('/cat-ice/hero.webp'),
      // 手机端竖卡专用主视觉：把冻结态与软化态上下重排成竖幅，整只猫都在画面里。
      // 桌面卡（16:10 横切）与详情页仍走 image / hero.webp，互不影响。
      imagePortrait: asset('/cat-ice/card-portrait.webp'),
      imagePosition: '50% 50%',
      // 预览位三个槽位：角色设定稿 / 表情系统 / 周边应用
      gallery: [
        { src: asset('/cat-ice/scheme1/character-design.webp'), alt: '角色设定稿：双层冻猫三视图与造型提取' },
        { src: asset('/cat-ice/scheme1/expression-system.webp'), alt: '表情系统：8 组情绪与动作拆解' },
        { src: asset('/cat-ice/scheme1/merchandise.webp'), alt: '周边应用：6 件商品延展与色彩规范' },
      ],
      desc: '冻成冰棍，化成小猫。设计灵感源于猫的流体物理学与冷热相变，以橘猫憨态为内核、透明冰晶为外壳，让温度成为它唯一的情绪。这一版把它落成了可交互的 IP 官网：温度轴一拖，冰壳就跟着变软变硬。',
      details: {
        overview: '一只被浇铸进透明冰晶外壳的橘猫。温度决定它今天是硬的还是软的——0°C 以下冰壳紧固、身体紧绷，0°C 以上开始溶解、摊平贴地。',
        targetUsers: '潮玩收藏者与设计师人群，以及需要在情绪起伏里找一个"可以变软"的出口的年轻人。',
        concept: '猫的流体物理学 × 冷热相变。圆水滴猫尾贯穿底部化为冰棍手柄，冰壳随温度在「冻结态」与「软化态」之间双向转换。',
        interaction: '以 -18°C 到 +38°C 的温度轴为核心：拖动即切换冻结态与软化态主视觉，冰壳收紧或摊平、尾巴形态与地面水滴同步变化；配「一键速冻 / 慢慢融化」两个快捷档、冻结与软化两套正规三视图、14 款情绪表情与随机测温按钮，把"情绪冷暖"变成可拖、可读的量。',
        cmf: '暖橘（#FB923C）猫体与极光冷蓝（#00F0FF）冰壳形成强烈冷热反差，熔岩热橙（#FF4500）作为热端强调；外壳为半透明亚克力质感，冻结时呈晶体棱面，融化后转为圆润流挂。',
      },
      specs: [
        { label: '设计原理 / 目的', value: '以冷热相变作为 IP 的核心机制，把"情绪的软硬"变成一层能看见的透明外壳' },
        { label: '目标人群', value: '潮玩收藏者、设计从业者与年轻消费者' },
        { label: '核心交互', value: '-18°C — +38°C 温度轴驱动冻结态 / 软化态双相转换，并联动两套三视图与 14 款情绪表情' },
      ],
      chartData: {
        radar: { labels: ['亲和力', '辨识度', '延展性', '概念性', '商业性'], values: [94, 93, 86, 95, 82] },
        donut: [
          { label: '角色造型', value: 42, color: '#FF4500' },
          { label: '相变机制', value: 28, color: '#00F0FF' },
          { label: '挂卡包装', value: 20, color: '#FB923C' },
          { label: '周边延展', value: 10, color: '#D8D3C9' },
        ],
        bars: [
          { label: '调研', value: 14 },
          { label: '草图', value: 26 },
          { label: '造型', value: 24 },
          { label: '相变', value: 22 },
          { label: '落地', value: 14 },
        ],
        progress: 94,
      },
      color: 'bg-white',
    },
    {
      id: '06',
      category: '产品设计',
      title: '模块化木质座椅',
      subtitle: '榫卯实木框架 × 可拆卸软包的一椅多用探索',
      image: asset('/chair/hero.webp'),
      imagePosition: '50% 50%',
      // 预览位三个槽位：整体效果 / 结构标注 / 家居场景
      // （轮盘的扇形预览按 slice(0,3) 取前三张，正好铺满左中右三个位置，
      //  所以这三张必须是全项目最有代表性的三张，顺序不要动）
      // 只放"能放大看"的整图：四张色卡原本也塞在这里，但它们是 400×450 的裁切图，
      // 在主图区按 object-contain 铺到近千像素宽会明显发虚 —— 色卡归到右栏的配色章节，
      // 这里留五张大图，缩略图条也不再被小色块打断。
      gallery: [
        { src: asset('/chair/hero.webp'), alt: '整体效果 · 白橡框架配浅暖灰软包' },
        { src: asset('/chair/structure.webp'), alt: '结构解析 · 坐垫与靠背模块沿框架内导轨推入' },
        { src: asset('/chair/scene-warm.webp'), alt: '家居场景 · 暖光下的矮椅、小圆几与花瓶' },
        { src: asset('/chair/scene-dark.webp'), alt: '场景 · 深色软包与藤编木柜' },
        { src: asset('/chair/render.webp'), alt: '效果图 · 方案整体空间关系' },
      ],
      desc: '白橡实木框架以榫卯为主连接，坐垫与靠背各自成为可抽出的软包模块，沿框架内侧导轨推入定位；软包可分季换色，坐垫单独取出即是一块蒲团。',
      details: {
        overview:
          '以一副榫卯实木框架为主体，把坐垫与靠背做成可独立取出的模块，沿框架内侧导轨推入固定。框架负责结构与造型，软包负责坐感与表情，两件事解耦之后，同一副木架可以靠换软包改变颜色与软硬。',
        targetUsers:
          '小户型与租房人群，以及在客厅、书房需要一张低矮休闲椅、又不希望被单一配色长期绑住的都市居住者。',
        concept:
          '把"换椅子"拆成"换软包"。家具的大件成本在框架，易损耗、易过时的部分在软包；模块化让低成本的软包承担颜色与坐感的变化，框架则可以长期沿用，延长产品的实际使用寿命。',
        interaction:
          '坐垫模块可整块抽出当作蒲团单独使用；靠背沿滑槽上下插拔，改变腰背支撑的高度与角度；全椅无外露五金，以榫卯为主、连接件为辅，可反复拆装与搬运。',
        cmf: '白橡实木框架（原木清漆，可选深胡桃）＋ 棉麻混纺软包 ＋ 高回弹棉花填充。木纹保留自然走向，软包为粗织肌理，一硬一软的触感在同一张椅子上形成对比。',
      },
      specs: [
        {
          label: '设计原理 / 目的',
          value: '榫卯实木框架 + 可拆软包模块，坐垫沿框架内导轨推入固定，实现一椅多用',
        },
        {
          label: '目标人群',
          value: '小户型与租房人群、需要低矮休闲椅的都市居住者',
        },
        {
          label: '造型设计',
          value: '一体化木框架承托坐垫与靠背，软包可换色、坐垫可取出单用',
        },
      ],
      chartData: {
        radar: { labels: ['结构稳定', '模块化', '舒适度', '材料感', '美观度'], values: [86, 92, 80, 88, 84] },
        donut: [
          { label: '实木框架', value: 45, color: '#8c7b66' },
          { label: '软包面料', value: 25, color: '#a8a29e' },
          { label: '棉花填充', value: 20, color: '#e8e4dd' },
          { label: '连接件', value: 10, color: '#d6d3d1' },
        ],
        bars: [
          { label: '结构研究', value: 20 },
          { label: '草图建模', value: 25 },
          { label: '材料实验', value: 20 },
          { label: '榫卯验证', value: 20 },
          { label: '组装测试', value: 15 },
        ],
        progress: 85,
      },
      // 弹层左栏底色：从冷灰换成纸色，跟这把椅子的木色/棉麻调子对齐
      color: 'bg-[#EAE3D6]',
    },
    {
      id: '05',
      category: '用户研究',
      title: 'UI界面流程设计',
      subtitle: '漫展与社区服务流程化界面设计',
      image: asset('/ui-cos-2.webp'),
      imagePosition: 'center',
      gallery: [
        { src: asset('/ui-cos-1.webp'), alt: '妆娘服务首页' },
        { src: asset('/ui-cos-2.webp'), alt: '展会信息页' },
        { src: asset('/ui-cos-3.webp'), alt: '服装租赁与服务分类' },
        { src: asset('/ui-cos-4.webp'), alt: '展会日程与数据' },
        { src: asset('/ui-gallery-1.webp'), alt: '租借流程' },
        { src: asset('/ui-gallery-2.webp'), alt: '分类导航' },
      ],
      desc: '覆盖妆娘服务、服装租赁、展会预约、社区互助等核心场景，以效率为导向降低共享服务与展会参与的认知门槛。',
      details: {
        overview: '面向社区共享与动漫展会场景的服务界面设计，整合妆娘预约、服装租赁、展会信息、日程管理与紧急求助等功能模块。',
        targetUsers: '漫展 / cosplay 参与者、妆娘、摄影爱好者、社区居民以及临时需要工具租借或拼房住宿的用户。',
        concept: '以卡片化信息架构与清晰的分类导航为核心，通过数据可视化（展会总数、今日参展人数）与一键预约降低决策成本，建立信任与便捷感。',
        interaction: '首页聚合搜索、热门展会、服务分类与推荐妆娘；详情页展示评分、接单次数与价格；支持购票、导航、分享与预约等快捷操作。',
        cmf: '采用轻量明亮的白底界面，蓝紫色作为功能强调色，圆角卡片与充足留白降低信息密度，符合年轻用户审美与快速扫读习惯。',
      },
      specs: [
        { label: '设计原理 / 目的', value: '建立信任与便捷感，让闲置物品流转与展会服务触手可及' },
        { label: '目标人群', value: '社区居民、cosplay / 漫展参与者、临时工具租借者' },
        { label: '造型设计', value: '卡片化信息架构、清晰的分类导航、直观的预约流程' },
      ],
      chartData: {
        radar: { labels: ['易用性', '信息层级', '视觉一致', '交互效率', '品牌感'], values: [90, 86, 88, 92, 80] },
        donut: [
          { label: '展会服务', value: 35, color: '#E67E33' },
          { label: '妆娘预约', value: 25, color: '#E6B639' },
          { label: '服装租赁', value: 25, color: '#fde68a' },
          { label: '个人中心', value: 15, color: '#d6d3d1' },
        ],
        bars: [
          { label: '需求分析', value: 20 },
          { label: '信息架构', value: 25 },
          { label: '交互设计', value: 25 },
          { label: '视觉设计', value: 20 },
          { label: '走查迭代', value: 10 },
        ],
        progress: 90,
      },
      color: 'bg-white',
    },
    {
      id: '07',
      category: '产品设计',
      title: '产品概念设计',
      subtitle: '运用 AI 工具快速发散多元产品概念',
      image: asset('/aigc/aigc-board.webp'),
      imagePosition: '50% 50%',
      gallery: [
        { src: asset('/aigc/01-shake.webp'), alt: '碳酸摇晃趣味灯 · 摇得越猛亮得越久' },
        { src: asset('/aigc/02-toaster.webp'), alt: '面包机定时灯具 · 旋钮控亮度、拨杆控时间' },
        { src: asset('/aigc/03-scale.webp'), alt: '光渐变重量探测器 · 用光环圈指示重量阶段' },
        { src: asset('/aigc/04-backpack.webp'), alt: '彝族服饰元素时尚背包 · 刺绣与羊角纹、火镰纹' },
        { src: asset('/aigc/05-bookmark.webp'), alt: '苍山洱海叶脉书签 · 叶脉烫印白族扎染纹样' },
        { src: asset('/aigc/06-mushroom.webp'), alt: '野生菌仿生灯 · 温感变色菌盖与蓝牙音箱' },
      ],
      desc: '六个产品概念：碳酸摇晃趣味灯、面包机定时灯具、光渐变重量探测器，以及长在云南土地上的彝族纹样背包、苍山洱海叶脉书签与野生菌仿生灯。',
      details: {
        overview: '用 AIGC 工具把一句概念描述批量展开成多种形态、材质与场景，快速比对后再回到手工推敲，最终留下六个能被追问「怎么用」的产品概念。',
        targetUsers: '概念设计评审、创意灵感库、作品集展示。',
        concept: '前半程从生活细节里找交互 —— 摇晃、定时、称重；后半程从云南的针脚、叶脉与林子里找题材，把在地手艺与物种翻译成今天还在用的器物。',
        interaction: '碳酸摇晃趣味灯用摇晃力度蓄光，面包机定时灯具用旋钮与拨杆分控亮度与时间，光渐变重量探测器用隐藏灯带把重量变成一圈看得见的进度。',
        cmf: '磨砂半透树脂与阳极氧化铝、喷涂金属与实心铝旋钮、耐磨防水织造布与涂层、半透明树脂（菌盖内置温感变色材料），强调材质感与真实使用场景。',
      },
      specs: [
        { label: '设计原理 / 目的', value: '用 AIGC 快速发散多元产品概念，为后续深入设计提供方向与灵感' },
        { label: '目标人群', value: '概念设计评审、创意灵感库、作品集展示' },
        { label: '造型设计', value: '六个概念横跨趣味家居、厨房器物与云南在地文化，均落在真实使用场景' },
      ],
      chartData: {
        radar: { labels: ['创意发散', '视觉冲击', '概念完整', '材质表现', '落地可能'], values: [96, 90, 82, 88, 70] },
        donut: [
          { label: '趣味家居', value: 34, color: '#E67E33' },
          { label: '厨房器物', value: 16, color: '#E6B639' },
          { label: '在地文化', value: 50, color: '#fde68a' },
        ],
        bars: [
          { label: '关键词梳理', value: 15 },
          { label: '批量生成', value: 35 },
          { label: '风格筛选', value: 25 },
          { label: '精修迭代', value: 15 },
          { label: '场景合成', value: 10 },
        ],
        progress: 82,
      },
      color: 'bg-white',
    },
].map((p) => ({ ...p, statusLabel: statusLabel(p.id) }))

/** 别名：与手机端独立入口的命名对齐 */
export { experiences as EXPERIENCES }
export { projects as PROJECTS }
