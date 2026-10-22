/**
 * 大屏图表色板 —— 与 screen/styles/tokens.css 的语义令牌一一对应。
 * ECharts 画在 canvas 上读不到 CSS 变量，因此 JS 侧维护同一套双主题镜像。
 */

const dark = {
  /* 主色：青 + 紫 */
  accent: '#22d3ee',
  accent2: '#a78bfa',
  /* 语义色 */
  green: '#34d399',
  amber: '#fbbf24',
  red: '#fb7185',
  blue: '#60a5fa',
  purple: '#c084fc',
  orange: '#fb923c',
  yellow: '#fde047',
  gray: '#64748b',
  /* 多系列默认顺序 */
  series: ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#60a5fa'],
  areaAlpha: 0.28,
  barAlpha: 0.22,
  /* 文字 3 级 */
  text1: '#f1f5f9',
  text2: '#aab4c5',
  text3: '#67748a',
  /* 坐标轴 / 网格 / 轨道 */
  axisLine: 'rgba(255, 255, 255, 0.08)',
  splitLine: 'rgba(255, 255, 255, 0.06)',
  axisPointer: 'rgba(34, 211, 238, 0.45)',
  track: 'rgba(255, 255, 255, 0.06)',
  legendInactive: 'rgba(255, 255, 255, 0.25)',
  /* 玻璃 tooltip */
  tooltipBg: 'rgba(14, 20, 38, 0.92)',
  tooltipBorder: 'rgba(255, 255, 255, 0.12)',
  tooltipText: '#f1f5f9',
  tooltipShadow: '0 12px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
  /* dataZoom 滑杆 */
  sliderTrack: 'rgba(255, 255, 255, 0.04)',
  sliderFiller: 'rgba(34, 211, 238, 0.16)',
  sliderBorder: 'rgba(255, 255, 255, 0.10)',
  sliderLine: 'rgba(255, 255, 255, 0.12)',
  sliderArea: 'rgba(34, 211, 238, 0.08)',
  /* 罪错未成年五色等级 */
  levels: {
    red: '#fb7185',
    orange: '#fb923c',
    yellow: '#fbbf24',
    blue: '#60a5fa',
    gray: '#64748b'
  }
}

const light = {
  accent: '#0891b2',
  accent2: '#7c3aed',
  green: '#059669',
  amber: '#d97706',
  red: '#e11d48',
  blue: '#2563eb',
  purple: '#9333ea',
  orange: '#ea580c',
  yellow: '#d97706',
  gray: '#64748b',
  series: ['#0891b2', '#7c3aed', '#059669', '#d97706', '#2563eb'],
  areaAlpha: 0.16,
  barAlpha: 0.18,
  text1: '#0f172a',
  text2: '#475569',
  text3: '#64748b',
  axisLine: 'rgba(15, 23, 42, 0.10)',
  splitLine: 'rgba(15, 23, 42, 0.07)',
  axisPointer: 'rgba(8, 145, 178, 0.45)',
  track: 'rgba(15, 23, 42, 0.06)',
  legendInactive: 'rgba(15, 23, 42, 0.28)',
  tooltipBg: 'rgba(255, 255, 255, 0.96)',
  tooltipBorder: 'rgba(15, 23, 42, 0.10)',
  tooltipText: '#0f172a',
  tooltipShadow: '0 12px 32px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  sliderTrack: 'rgba(15, 23, 42, 0.05)',
  sliderFiller: 'rgba(8, 145, 178, 0.14)',
  sliderBorder: 'rgba(15, 23, 42, 0.10)',
  sliderLine: 'rgba(15, 23, 42, 0.16)',
  sliderArea: 'rgba(8, 145, 178, 0.10)',
  levels: {
    red: '#e11d48',
    orange: '#ea580c',
    yellow: '#d97706',
    blue: '#2563eb',
    gray: '#64748b'
  }
}

export const SCREEN_PALETTES = { dark, light }

export const getScreenPalette = mode => SCREEN_PALETTES[mode] ?? SCREEN_PALETTES.dark
