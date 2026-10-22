/**
 * 大屏 ECharts 配置规范（skill: dashboard-bigscreen-design / charts.md）
 *
 * 统一约束：
 * - 画布透明，字体与页面一致
 * - tooltip 玻璃化（颜色跟随暗/亮主题）
 * - 坐标轴 / 网格线弱化，标签使用三级文字色
 * - 面积图垂直线性渐变淡出；柱状图圆角 + 垂直渐变
 * - 环形图圆角端点；仪表盘青→紫渐变 + 剩余轨道弱化
 */
import { graphic } from 'echarts/core'

export const TEXT_FONT_FAMILY = '"PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif'
export const NUMERIC_FONT_FAMILY = '"DIN Alternate", "Bahnschrift", "SF Mono", "Roboto Mono", Menlo, Consolas, monospace'

/** #rrggbb / #rgb / rgba() 统一转成带 alpha 的 rgba() */
function withAlpha(color, alpha) {
  const hex = String(color ?? '').trim()
  const shortMatch = hex.match(/^#([\da-f])([\da-f])([\da-f])$/i)
  const longMatch = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
  const rgbMatch = hex.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)

  let channels = null
  if (shortMatch) {
    channels = shortMatch.slice(1).map(value => Number.parseInt(value + value, 16))
  } else if (longMatch) {
    channels = longMatch.slice(1).map(value => Number.parseInt(value, 16))
  } else if (rgbMatch) {
    channels = rgbMatch.slice(1, 4).map(value => Math.round(Number(value)))
  }

  if (!channels) {
    return color
  }

  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`
}

/** 图表基础 option：透明画布 + 页面字体 */
export function createChartBase() {
  return {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: TEXT_FONT_FAMILY }
  }
}

/** 面积图：从顶部带透明度淡出到透明 */
export function createAreaGradient(color, alpha = 0.28) {
  return new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: withAlpha(color, alpha) },
    { offset: 1, color: withAlpha(color, 0) }
  ])
}

/** 柱状图：顶部实色 → 底部同色系低透明度（配合 borderRadius 圆角） */
export function createBarGradient(color, bottomAlpha = 0.22) {
  return new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color },
    { offset: 1, color: withAlpha(color, bottomAlpha) }
  ])
}

/** 玻璃 tooltip：亮/暗主题色由 palette 提供 */
export function createChartTooltip(palette, trigger = 'axis') {
  return {
    show: true,
    trigger,
    backgroundColor: palette.tooltipBg,
    borderColor: palette.tooltipBorder,
    borderWidth: 1,
    padding: [8, 12],
    confine: true,
    textStyle: {
      color: palette.tooltipText,
      fontSize: 11,
      fontFamily: TEXT_FONT_FAMILY
    },
    axisPointer: trigger === 'axis'
      ? {
          type: 'line',
          lineStyle: { color: palette.axisPointer, width: 1 }
        }
      : undefined,
    extraCssText: 'font-variant-numeric:tabular-nums;'
      + 'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:10px;'
      + `box-shadow:${palette.tooltipShadow};`
  }
}

export function createChartGrid({ left = 48, right = 22, top = 34, bottom = 56 } = {}) {
  return {
    left,
    right,
    top,
    bottom,
    containLabel: true
  }
}

export function createChartLegend({ palette, left = 'center', top = 4 } = {}) {
  return {
    show: true,
    top,
    left,
    icon: 'circle',
    itemWidth: 7,
    itemHeight: 7,
    itemGap: 14,
    textStyle: { color: palette.text3, fontSize: 10.5, fontFamily: TEXT_FONT_FAMILY },
    inactiveColor: palette.legendInactive
  }
}

export function createCategoryAxis({ palette, data, boundaryGap = false, rotate = 0, fontSize = 10 } = {}) {
  return {
    show: true,
    type: 'category',
    data,
    boundaryGap,
    axisLine: { lineStyle: { color: palette.axisLine } },
    axisTick: { show: false },
    axisLabel: {
      color: palette.text3,
      fontSize,
      fontFamily: NUMERIC_FONT_FAMILY,
      rotate,
      hideOverlap: true
    }
  }
}

export function createValueAxis({ palette, max, interval, splitNumber = 4, fontSize = 10 } = {}) {
  return {
    show: true,
    type: 'value',
    min: 0,
    ...(typeof max === 'number' ? { max, interval } : {}),
    splitNumber,
    splitLine: { lineStyle: { color: palette.splitLine } },
    axisLabel: { color: palette.text3, fontSize, fontFamily: NUMERIC_FONT_FAMILY },
    axisLine: { show: false },
    axisTick: { show: false }
  }
}

/** 折线：smooth + 无数据点；单系列时叠加垂直渐变面积 */
export function createLineSeries({ name, data, color, palette, showArea = false, index = 0 }) {
  const series = {
    name,
    type: 'line',
    smooth: true,
    symbol: 'none',
    sampling: 'lttb',
    data,
    lineStyle: { width: 2.5, color },
    itemStyle: { color },
    emphasis: { focus: 'series' },
    animationDelay: index * 70
  }

  if (showArea) {
    series.areaStyle = { color: createAreaGradient(color, palette.areaAlpha) }
  }

  return series
}

/** 柱状：圆角 + 垂直渐变；barMaxWidth 随分类数量自动收窄 */
export function createBarSeries({
  name,
  data,
  color,
  palette,
  barWidth = 10,
  index = 0,
  borderRadius = [5, 5, 0, 0]
}) {
  return {
    name,
    type: 'bar',
    barMaxWidth: barWidth,
    data,
    itemStyle: {
      color: createBarGradient(color, palette.barAlpha),
      borderRadius
    },
    emphasis: { focus: 'series' },
    animationDelay: index * 50
  }
}

/** 环形图：圆角端点 + 悬停高亮；中心文案由 HTML 覆盖层负责 */
export function createDonutSeries({
  data,
  palette,
  radius = ['70%', '88%'],
  center = ['50%', '50%'],
  borderRadius = 7
}) {
  return {
    type: 'pie',
    radius,
    center,
    minAngle: 2,
    padAngle: 2,
    avoidLabelOverlap: true,
    label: { show: false },
    labelLine: { show: false },
    itemStyle: { borderRadius },
    emphasis: {
      scale: true,
      scaleSize: 4,
      itemStyle: {
        shadowBlur: 12,
        shadowColor: palette.axisPointer
      }
    },
    data
  }
}

/** 环形仪表：进度段青→紫渐变 + 圆角，剩余段用弱化轨道色 */
export function createRingGaugeSeries({
  value,
  palette,
  radius = ['66%', '82%'],
  center = ['50%', '50%']
}) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0))

  return {
    type: 'pie',
    radius,
    center,
    silent: true,
    label: {
      show: true,
      position: 'center',
      formatter: `${safeValue}%`,
      fontSize: 19,
      fontWeight: 'bold',
      color: palette.accent,
      fontFamily: NUMERIC_FONT_FAMILY
    },
    data: [
      {
        value: safeValue,
        itemStyle: {
          color: new graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: palette.accent },
            { offset: 1, color: palette.accent2 }
          ]),
          borderRadius: 8
        }
      },
      {
        value: 100 - safeValue,
        itemStyle: { color: palette.track },
        label: { show: false }
      }
    ]
  }
}

export function calcAxisMaxAndInterval(values) {
  const validValues = values.filter(value => typeof value === 'number' && Number.isFinite(value))
  if (!validValues.length) {
    return { max: 5, interval: 1 }
  }

  const maxValue = Math.max(...validValues)
  if (maxValue === 0) {
    return { max: 5, interval: 1 }
  }

  const pow10 = 10 ** Math.floor(Math.log10(maxValue))
  let interval = pow10
  if (maxValue / pow10 > 5) {
    interval = pow10 * 2
  } else if (maxValue / pow10 > 2) {
    interval = pow10
  } else {
    interval = pow10 / 5
  }

  return {
    max: Math.ceil(maxValue / interval) * interval,
    interval
  }
}

/** 细线玻璃 dataZoom 滑杆（颜色跟随主题） */
export function createSliderZoom(palette, { show, endPercent, showDataShadow = true }) {
  return [
    {
      type: 'slider',
      show,
      bottom: 6,
      height: 14,
      start: 0,
      end: endPercent,
      showDataShadow,
      showDetail: false,
      brushSelect: false,
      borderColor: palette.sliderBorder,
      backgroundColor: palette.sliderTrack,
      fillerColor: palette.sliderFiller,
      dataBackground: {
        lineStyle: { color: palette.sliderLine, width: 1 },
        areaStyle: { color: palette.sliderArea }
      },
      selectedDataBackground: {
        lineStyle: { color: palette.accent, opacity: 0.5, width: 1 },
        areaStyle: { color: withAlpha(palette.accent, 0.16) }
      },
      handleStyle: {
        color: palette.accent,
        borderColor: palette.accent,
        shadowBlur: 8,
        shadowColor: withAlpha(palette.accent, 0.45)
      },
      moveHandleStyle: {
        color: palette.accent,
        opacity: 0.35
      },
      textStyle: {
        color: palette.text3,
        fontSize: 10,
        fontFamily: NUMERIC_FONT_FAMILY
      }
    },
    {
      type: 'inside',
      zoomLock: false
    }
  ]
}
