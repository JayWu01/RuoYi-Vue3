---
name: 数智巡防管理系统 · 街面巡防质效大屏
description: 面向指挥大厅与办公电脑的巡防业务数据仪器，远距读数优先，状态诚实，单一冷青主色。
colors:
  canvas: "#070b16"
  header: "#070b16"
  panel: "#0d1424"
  popover: "rgba(14, 20, 38, 0.97)"
  surface-1: "rgba(255, 255, 255, 0.03)"
  surface-2: "rgba(255, 255, 255, 0.055)"
  surface-3: "rgba(255, 255, 255, 0.085)"
  field: "rgba(255, 255, 255, 0.04)"
  field-hover: "rgba(255, 255, 255, 0.07)"
  line: "rgba(255, 255, 255, 0.085)"
  line-strong: "rgba(255, 255, 255, 0.16)"
  text-1: "#f2f5fa"
  text-2: "#b3bdcd"
  text-3: "#8b98ab"
  accent: "#38bdf8"
  accent-2: "#60a5fa"
  accent-soft: "rgba(56, 189, 248, 0.12)"
  accent-line: "rgba(56, 189, 248, 0.26)"
  success: "#34d399"
  warning: "#fbbf24"
  danger: "#fb7185"
  chart-1: "#38bdf8"
  chart-2: "#fbbf24"
  chart-3: "#2dd4bf"
  chart-4: "#fb7185"
  chart-5: "#818cf8"
  level-red: "#fb7185"
  level-orange: "#fb923c"
  level-yellow: "#fbbf24"
  level-blue: "#60a5fa"
  level-gray: "#7b879b"
typography:
  display:
    fontFamily: '"DIN Alternate", "Bahnschrift", "SF Mono", "Roboto Mono", "Menlo", Consolas, monospace'
    fontSize: "clamp(56px, 4.2vw, 80px)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-1.5px"
  headline:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.4px"
  title:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "clamp(18px, 1.15vw, 22px)"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "0.2px"
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.3
  meta:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.3
  numeric:
    fontFamily: '"DIN Alternate", "Bahnschrift", "SF Mono", "Roboto Mono", "Menlo", Consolas, monospace'
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1
  clock:
    fontFamily: '"DIN Alternate", "Bahnschrift", "SF Mono", "Roboto Mono", "Menlo", Consolas, monospace'
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1
rounded:
  card: "14px"
  tile: "10px"
  control: "8px"
  pill: "999px"
spacing:
  '2xs': "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  screen-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.card}"
    padding: "0"
  kpi-featured:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.tile}"
    padding: "16px 18px 18px"
  stat-tile:
    backgroundColor: "transparent"
    textColor: "{colors.text-1}"
    rounded: "{rounded.tile}"
    padding: "10px 14px"
  rank-row:
    backgroundColor: "transparent"
    textColor: "{colors.text-1}"
    rounded: "{rounded.control}"
    padding: "10px 8px"
  filter-panel:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.card}"
    padding: "20px"
  status-capsule:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
---

# Design System: 数智巡防管理系统 · 街面巡防质效大屏

## Overview

**Creative North Star: "校准过的指挥台"**

这不是一块展示屏，而是一台长期值守、按期校准的指挥设备。它假设观看者站在 3–5 米外，只看三件事：当期总量、变化方向、哪个单位落后。所有层级都从这三件事倒推，而不是从“看板应该长什么样”倒推。

材质上采用近实色仪表盘：卡片不靠玻璃和渐变制造漂浮感，而用 1px 线、柔和阴影和留白分组；玻璃与投影只留给筛选浮层和图表 tooltip，因为它们确实浮在内容之上。颜色收敛为单一冷青主色，中性色承担结构，琥珀、青绿、玫红只在图表序列里做区分。

动效只标记状态变化：一次面板错峰入场、排名行落位、浮层开合、数字滚动。没有持续闪烁、没有无限呼吸、没有装饰性粒子。状态必须诚实：数据正常、同步中、数据未更新、数据接入中，四种状态各有明确颜色与文案。

**Key Characteristics:**
- 单一冷青主色（#38bdf8），其余交给中性色与语义色。
- 近实色面板、1px 线、柔和阴影；卡片不使用 backdrop blur。
- 远距先读数字，近距再读标签；关键数字 56–80px。
- 动效一次编排，尊重 `prefers-reduced-motion`。
- 空白与旧数据都要说真话：接入中、未更新、上次成功时间。

## Colors

调色盘性格：**天青蓝 · 冷光刻度**。深藏蓝画布上只有一支冷青色的“刻度笔”，它标记当前状态和关键数据；琥珀、青绿、玫红只在图表里承担序列区分。

### Primary
- **天青蓝** (#38bdf8): 当前选中的 tab、关键 KPI 底纹、主图表序列、焦点环。它是状态色，不是装饰色。
- **冷光蓝** (#60a5fa): 主色渐变端点与少量次级强调，只与天青蓝同屏出现。

### Neutral
- **深藏蓝画布** (#070b16): 页面底色，叠加三层极弱冷色 mesh。
- **指挥台面板** (#0d1424): 卡片与页头的近实色底。
- **浮层底** (rgba(14, 20, 38, 0.97)): 筛选浮层、下拉、tooltip；只有这一层允许模糊。
- **主文本** (#f2f5fa)、**次文本** (#b3bdcd)、**辅助文本** (#8b98ab): 三级文字，辅助文本在深底上仍保持 AA。
- **线** (rgba(255, 255, 255, 0.085)) 与 **强线** (rgba(255, 255, 255, 0.16)): 1px 分组线、输入框边界、当前态边界。

### Semantic
- **成功** (#34d399): 数据正常、下降为好。
- **警告** (#fbbf24): 同步中、数据未更新。
- **危险** (#fb7185): 上升为坏的环比、错误强调。
- **图表序列** (#38bdf8 / #fbbf24 / #2dd4bf / #fb7185 / #818cf8): 只出现在图表内部，不进入按钮、tab、卡片边框。
- **罪错未成年等级** (#fb7185 / #fb923c / #fbbf24 / #60a5fa / #7b879b): 红、橙、黄、蓝、黑五级，始终与文字标签同时出现。

亮色主题不是第二套调色盘：同一组语义键在 `styles/tokens.css` 中替换为浅底版本，图表色相保持不变、明度调整到白底可读；黄标在亮色下提高对比，满足图形 3:1。

### Named Rules

**The One Accent Rule.** 天青蓝只用于当前状态和关键数据，单个面板内出现面积不超过可视面积的 10%。它越少，出现时越可信。

**The Color Is Status Rule.** 颜色表达状态，不表达装饰。不要用主色画装饰线、发光或渐变标题；强调交给字号、字重和空间。

**The Chart Series Rule.** 序列色只活在图表里。图例圆点、折线、柱、环图分段可以使用；按钮、tab、卡片边框、页面装饰不得借用。

**The Level Rule.** 五色等级必须带文字标签（红标/橙标/黄标/蓝标/黑标），不允许只靠颜色传达风险等级。

## Typography

**Display Font:** 数字用 DIN Alternate / Bahnschrift / SF Mono / Roboto Mono / Menlo 等系统等宽栈；中文用 PingFang SC / HarmonyOS Sans SC / Source Han Sans SC / Noto Sans CJK SC / Microsoft YaHei 系统栈。不加载网络字体，指挥中心可能离线。
**Body Font:** 同上中文系统栈。
**Label/Mono Font:** 数字栈，所有数值启用 `tabular-nums`。

**Character:** 中文标签克制、无装饰；数字是主角，字重和字号拉开明显层级。没有斜体、没有全大写英文副标题、没有字距夸张的“科技感”标题。

### Hierarchy
- **Display / Hero KPI** (700, clamp 56–80px, line-height 0.95): 接处警总数。它是全屏唯一允许超过 30px 的数字。
- **Page title** (700, 26px, line-height 1): 页头「街面巡防质效」。
- **Panel title** (650, clamp 18–22px, line-height 1.25): 七块面板标题，使用 h2。
- **Rank name / value** (600 / 700, 17px / 24px): 警务站名与排名数值。
- **Body** (400, 14px, line-height 1.5): 图例、正文、空态说明。
- **Label** (400, 13px): 面板单位、字段标签、轴标签、tooltip 行。
- **Meta** (400, 12px): 合计、更新时间、次要说明。
- **Clock** (700, 22px, tabular): 页头当前时间。

### Named Rules

**The Readout First Rule.** 关键数字必须在 3–5 米可读：主 KPI 56–80px，排名数值 24px，环图中心 44px。标签可以小，但关键标签不低于 13px，次要说明不低于 12px。

**The Tabular Rule.** 所有会变化的数字使用等宽数字与 `font-variant-numeric: tabular-nums`，避免刷新时宽度跳动。

## Layout

设计画布固定 1920×1080，页头高 72px，主区 16px 间距。≥1536px 使用三栏：左栏 380px、中栏自适应、右栏 400px；左栏三块面板高度比 1.05 / 1.1 / 1.2，中栏上方大趋势图、下方两张小趋势图；右栏排名占满高度。

缩放只在比例 ≥0.85 时启用；低于该比例回退到全尺寸流式布局并允许滚动，保证办公电脑上文字不被缩到 8px。窄于 1280px 使用两栏/单栏断点，排名面板内部滚动，页面整体可滚动。

面板内边距 16–18px；分组用间距与 1px 分隔线，不嵌套卡片。页头、面板、图表各自有固定的最小内容高度，任何尺寸下都不允许内容被不可达裁切。

### Named Rules

**The Fit-or-Scroll Rule.** 适配画布内必须完整可见；缩放比低于 0.85 时宁可流式滚动，也不把整块面板裁进 1080 画布。

## Elevation & Depth

深度来自“层级”，不来自玻璃。卡片与页头是近实色表面，只用 1px 边框和柔和阴影表达浮起；筛选浮层、下拉和 tooltip 是唯一使用半透明、backdrop blur 与更强投影的层级，因为它们确实覆盖内容。

### Shadow Vocabulary
- **Card** (`0 1px 0 rgba(255,255,255,0.04) inset, 0 14px 32px rgba(0,0,0,0.28)`): 常驻面板。
- **Card hover** (`0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 40px rgba(0,0,0,0.34)`): 面板 hover，仅桌面指针可见。
- **Popover** (`0 20px 48px rgba(0,0,0,0.5)`): 筛选浮层、下拉、tooltip。

### Named Rules

**The Solid Instrument Rule.** 卡片默认不透明、不模糊；玻璃与强投影只属于浮层。禁止给卡片叠加渐变玻璃、彩色光晕或零偏移彩色阴影。

## Shapes

圆角按角色分级：卡片 14px、磁贴 10px、控件 8px、胶囊 999px。边框统一 1px；不使用 2px 以上的彩色左边线。分组的首选是留白与 1px 分隔线，其次才是圆角磁贴；任何情况下都不做卡片套卡片。

图表使用直线折线、圆角柱和细环图；不使用 3D、发光描边或装饰性网格。

### Named Rules

**The Separator Rule.** 同一面板内的并列数据用 1px 线与间距分组，不重复套卡片；卡片只出现在面板这一层。

## Components

### Buttons
- **Shape:** 控件圆角 8px；页头图标按钮 30×30px；筛选操作按钮高 38px。
- **Primary:** 天青蓝底 + `--scr-on-accent` 文字，仅用于“应用筛选”。
- **Hover / Focus:** hover 提升表面亮度；focus-visible 统一 2px 天青蓝焦点环，偏移 2px。
- **Secondary / Ghost:** 透明或 surface-1 底，1px 线；不使用彩色边框。

### Chips
- **Style:** 胶囊形，surface-1 底，1px 线，12px 文字；`chip.plain` 透明底用于合计、非预警。
- **State:** 只承载静态摘要，不做可点击筛选项。

### Panels
- **Corner Style:** 14px。
- **Background:** 近实色 `--scr-card`；不使用 backdrop blur。
- **Shadow Strategy:** Card / Card hover。
- **Border:** 1px `--scr-line`，hover 提升为 `--scr-line-strong`。
- **Internal Padding:** 标题 16px 18px 12px；内容 0 18px 18px。
- **Error:** 标题下显示一行“数据未更新 + 重试”，不遮挡旧数据。

### KPI
- **Featured:** 浅主色底、10px 圆角、56–80px 数字；不使用彩色左边条。
- **Secondary:** 透明底，30px 数字，三列等分，1px 竖线分隔；环比 13px。
- **Delta label:** “环比”只在面板标题出现一次；每个数值只显示箭头与百分比，避免窄列换行与重复。

### Stat Tiles
- **Style:** 2×3 或 3×2 网格，透明底，1px 分隔线；数值 22–28px，标签 13px；金额等长字符串必须在单元格内完整显示。

### Rank Rows
- **Style:** 序号方块 24px、站名 17px/600、数值 24px/700、相对条 8px。
- **Bar:** 按当前列表最大值归一，表达相对强弱；不显示百分比列，避免条长与百分比不一致。
- **State:** 内部滚动；前三名序号使用主色浅底；行 hover 仅提升表面。

### Chart Tooltip
- **Style:** 浮层圆角 10px，popover 底 + blur，13px 文字，序列圆点 7px。
- **Behavior:** 只有主趋势图自动轮播；两张小图不自动轮播，仅 hover 显示。减动效时全部停止自动轮播。

### Filter Overlay
- **Style:** 880px 宽、14px 圆角、popover 底 + blur、20px 内边距；标题 20px。
- **Behavior:** `aria-modal` + 焦点陷阱（Tab/Shift+Tab 循环），Escape 关闭并归还焦点；遮罩点击关闭。

### Status Capsule
- **Style:** 胶囊形 38px 高，surface-1 底；状态点 6px，文字 12.5px/600。
- **States:** 数据正常（成功色）/ 同步中（警告色）/ 数据未更新（警告色 + 上次成功时间）/ 数据接入中（辅助色，静态）。

### Motion
- **System:** motion-v 负责面板入场、排名错峰、筛选浮层；CSS 过渡只负责数字滚动、加载进度、骨架 shimmer、柱条宽度与主题切换。
- **Timing:** 面板 520ms、错峰 55ms/项；排名行 220ms、错峰 35ms/行；浮层 220ms；数字滚动 220ms；缓动 `cubic-bezier(0.22, 1, 0.36, 1)`。
- **Reduced motion:** 所有入场时长归零，tooltip 轮播停止，浮层即时开合；不保留任何无限装饰动画。

## Do's and Don'ts

### Do:
- **Do** 用语义令牌（`--scr-*`）取色、取字号、取时长；组件层不写死十六进制。
- **Do** 让关键数字在 3–5 米可读：主 KPI 56–80px，排名数值 24px，环图中心 44px。
- **Do** 用留白、1px 线与字号建立层级；卡片只出现在面板这一层。
- **Do** 让状态说真话：数据正常、同步中、数据未更新、数据接入中，各自有明确颜色与文案。
- **Do** 单位只出现一次：标题给单位，数值不再重复“起/人”。
- **Do** 尊重 `prefers-reduced-motion`：无入场、无轮播、无无限动画。
- **Do** 保持数字等宽与 tabular-nums，避免刷新时宽度跳动。
- **Do** 在缩放比低于 0.85 时回退流式滚动，保证办公电脑可读。

### Don't:
- **Don't** 在卡片上使用 backdrop blur、渐变玻璃或彩色光晕；玻璃只属于浮层。
- **Don't** 用天青蓝做装饰线、发光、渐变标题或大面积底色；主色只标记状态与关键数据。
- **Don't** 给卡片、列表项或提示条加 2px 以上的彩色左边线。
- **Don't** 卡片套卡片；并列数据用分隔线与间距。
- **Don't** 用百分比列配最大值归一的排行条；二者只能选一个语义。
- **Don't** 用无限闪烁、呼吸、粒子或装饰性动画表达“在线”。
- **Don't** 用硬编码示例分局、示例警情或旧数据冒充真实状态。
- **Don't** 把接入中、空数据或失败态显示成绿色“实时”。
- **Don't** 把关键标签压到 12px 以下来换信息量；先删重复单位与多余刻度。
