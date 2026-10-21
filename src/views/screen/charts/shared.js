/**
 * 大屏 ECharts 共享配置（skill: references/charts.md）
 * - tooltip 玻璃化（颜色跟随主题）
 * - 垂直渐变（面积淡出 / 柱状圆角渐变）
 * - 弱化坐标轴 / 网格线 / dataZoom 滑杆
 */
import { graphic } from 'echarts/core'

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
export const createDashboardTooltip = (trigger = 'axis', palette) => ({
  show: true,
  trigger,
  backgroundColor: palette.tooltipBg,
  borderColor: palette.tooltipBorder,
  borderWidth: 1,
  padding: [8, 12],
  textStyle: {
    color: palette.tooltipText,
    fontSize: 11
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
})

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
export function createSliderZoom({ show, endPercent, showDataShadow = true }, palette) {
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
        fontSize: 10
      }
    },
    {
      type: 'inside',
      zoomLock: false
    }
  ]
}
