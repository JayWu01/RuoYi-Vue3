/**
 * 大屏图表主题 —— vccs 组件从 CSS 变量读取配色，
 * 这里把 useScreenPalette 解析出的主题令牌镜像映射成 --v-charts-* 令牌。
 */

export function createChartTheme(palette) {
  return {
    '--v-charts-focus': palette.accent,
    '--v-charts-text': palette.text3,
    '--v-charts-axis': palette.axisLine,
    '--v-charts-grid': palette.splitLine,
    '--v-charts-cursor': palette.axisPointer,
    '--v-charts-inactive': palette.legendInactive,
    ...Object.fromEntries(
      palette.series.map((color, index) => [`--v-charts-series-${index + 1}`, color])
    )
  }
}

/** 月份轴显示“3月”，日期轴去掉年份只留 MM-DD，避免标签浪费宽度 */
export function formatCategoryLabel(value) {
  const text = String(value ?? '')
  if (/^\d{4}-\d{2}$/.test(text)) {
    return `${Number(text.slice(5))}月`
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(5, 10)
  }
  return text
}

/** xAxis + seriesList 转成 vccs 需要的行数据，序列键固定为 s0、s1… */
export function toChartRows(xAxis, seriesList) {
  return xAxis.map((label, rowIndex) => {
    const row = { label }
    seriesList.forEach((series, seriesIndex) => {
      row[`s${seriesIndex}`] = Number(series.data?.[rowIndex]) || 0
    })
    return row
  })
}
