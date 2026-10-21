import fileSaver from 'file-saver'

const { saveAs } = fileSaver

const escapeCsvValue = (value) => {
  let text = String(value ?? '')

  const startsWithFormula = text.startsWith('=') || text.startsWith('+') || text.startsWith('@')
  const startsWithNonNumericMinus = text.startsWith('-') && !/^-?\d+(?:\.\d+)?%?$/.test(text)
  if (startsWithFormula || startsWithNonNumericMinus) {
    text = `'${text}`
  }

  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const pushKpiSection = (rows, title, metrics) => {
  rows.push([title])
  rows.push(['指标', '数值', '环比'])
  metrics.forEach(({ label, value, ratio }) => {
    rows.push([label, value ?? '-', ratio ?? '-'])
  })
  rows.push([])
}

const pushTrendSection = (rows, title, data) => {
  const seriesList = Array.isArray(data?.seriesList) ? data.seriesList : []
  const xAxis = Array.isArray(data?.xAxis) ? data.xAxis : []

  rows.push([title])
  rows.push(['日期', ...seriesList.map(item => item.name)])
  xAxis.forEach((label, index) => {
    rows.push([label, ...seriesList.map(item => item.data?.[index] ?? '')])
  })
  rows.push([])
}

export function buildScreenCsv(dashboard) {
  const rows = []

  pushKpiSection(rows, '接处警数据', [
    { label: '总数', value: dashboard.alarmKpi?.totalAlarm, ratio: dashboard.alarmKpi?.totalAlarmRatio },
    { label: '自接警数据', value: dashboard.alarmKpi?.selfAlarm, ratio: dashboard.alarmKpi?.selfAlarmRatio },
    { label: '转警数据', value: dashboard.alarmKpi?.transferAlarm, ratio: dashboard.alarmKpi?.transferAlarmRatio },
    { label: '110派警', value: dashboard.alarmKpi?.policeDispatch, ratio: dashboard.alarmKpi?.policeDispatchRatio }
  ])

  pushKpiSection(rows, '战果类数据', [
    { label: '抓获网逃数', value: dashboard.result?.netFugitiveCount, ratio: dashboard.result?.netFugitiveRatio },
    { label: '抓获团伙数', value: dashboard.result?.gangCount, ratio: dashboard.result?.gangRatio },
    { label: '抓获现行', value: dashboard.result?.currentArrestMinor, ratio: dashboard.result?.currentArrestMinorRatio },
    { label: '检查车辆', value: dashboard.result?.checkCarCount, ratio: dashboard.result?.checkCarCountRatio },
    { label: '打开车门数', value: dashboard.result?.openDoorCount, ratio: dashboard.result?.openDoorCountRatio },
    { label: '发现贵重物品', value: dashboard.result?.doorPullAmount, ratio: dashboard.result?.doorPullAmountRatio }
  ])

  rows.push(['罪错未成年分布'])
  rows.push(['等级', '人数', '占比'])
  ;(dashboard.pie?.dataList || []).forEach((item) => {
    rows.push([item.name, item.value, item.percent || '-'])
  })
  rows.push(['合计', dashboard.pie?.total ?? '-', dashboard.pie?.ratioCompareYesterday ?? '-'])
  rows.push(['非预警未成年人数', dashboard.pie?.unwarnedMinorCount ?? '-', dashboard.pie?.unwarnedMinorRatio ?? '-'])
  rows.push([])

  pushTrendSection(rows, '接处警趋势', dashboard.lineAlarm)
  pushTrendSection(rows, '抢盗窃数据趋势', dashboard.rank)
  pushTrendSection(rows, '未成年人数据趋势', dashboard.juvenile)

  rows.push(['警务站排名'])
  rows.push(['排名', '警务站', '数值'])
  ;(dashboard.rankData?.yAxis || []).forEach((name, index) => {
    rows.push([index + 1, name, dashboard.rankData?.series?.[index] ?? ''])
  })

  return `\uFEFF${rows.map(row => row.map(escapeCsvValue).join(',')).join('\n')}`
}

export function exportScreenCsv(dashboard) {
  saveAs(new Blob([buildScreenCsv(dashboard)], { type: 'text/csv;charset=utf-8' }), '警务站大屏数据.csv')
}
