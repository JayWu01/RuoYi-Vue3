export const createDashboardTooltip = (trigger = 'axis') => ({
  trigger,
  backgroundColor: 'rgba(3, 18, 38, 0.96)',
  borderColor: '#1478ba',
  borderWidth: 1,
  padding: [8, 12],
  textStyle: {
    color: '#d8e9f6',
    fontSize: 12
  },
  axisPointer: trigger === 'axis'
    ? {
        type: 'line',
        lineStyle: { color: 'rgba(32, 181, 241, 0.6)', width: 1 }
      }
    : undefined,
  extraCssText: 'box-shadow: 0 0 12px rgba(0, 100, 190, 0.28);'
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

export const createEmptyGraphic = (text = '暂无数据') => ({
  type: 'text',
  left: 'center',
  top: 'middle',
  style: {
    text,
    fill: '#a8b4c1',
    fontSize: 16,
    fontWeight: 'normal'
  },
  z: 100
})

export function createSliderZoom({ show, endPercent, showDataShadow = true }) {
  return [
    {
      type: 'slider',
      bottom: 10,
      height: 16,
      start: 0,
      end: endPercent,
      show,
      showDataShadow,
      textStyle: { color: '#a8b4c1' },
      handleStyle: { color: '#6b96e8' }
    },
    {
      type: 'inside'
    }
  ]
}
