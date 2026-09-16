<script setup>
import { onMounted, ref, watch } from 'vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import { createDashboardTooltip, useECharts } from '../composables/useECharts'

const props = defineProps({
  data: { type: Object, required: true }
})

const chartRef = ref(null)
const { setOption } = useECharts(chartRef)

/**
 * 动态计算坐标轴最大值和分割间隔，和另外两个图表保持一致
 * @param {number[]} values 数据数组
 * @returns { {max:number, interval:number} }
 */
function calcAxisMaxAndInterval(values) {
  const validValues = values.filter(v => typeof v === 'number')
  if (!validValues.length) {
    return { max: 5, interval: 1 }
  }
  const maxVal = Math.max(...validValues)
  if (maxVal === 0) {
    return { max: 5, interval: 1 }
  }
  const pow10 = Math.pow(10, Math.floor(Math.log10(maxVal)))
  let interval = pow10
  if (maxVal / pow10 > 5) interval = pow10 * 2
  else if (maxVal / pow10 > 2) interval = pow10
  else interval = pow10 / 5

  const max = Math.ceil(maxVal / interval) * interval
  return { max, interval }
}

const renderChart = () => {
  const colors = ['#6b96e8', '#86c75b', '#f2a62b']
  const seriesList = props.data.seriesList || []
  const xAxis = props.data.xAxis?.length
      ? props.data.xAxis
      : Array.from({ length: Math.max(...seriesList.map(item => item.data?.length || 0), 0) }, (_, index) => index + 1)

  // 空数据保护
  if (!xAxis.length) {
    setOption({
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [],
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无数据',
          fill: '#a8b4c1',
          fontSize: 16,
          fontWeight: 'normal'
        },
        z: 100
      }
    })
    return
  }

  // 收集所有系列全部数值，用来动态计算Y轴
  const allValues = []
  seriesList.forEach(ser => {
    if (Array.isArray(ser.data)) {
      allValues.push(...ser.data)
    }
  })
  const { max, interval } = calcAxisMaxAndInterval(allValues)

  const dataCount = xAxis.length
  // 大于12条默认展示前12个，换算百分比；少于等于12条全部展示
  const endPercent = dataCount > 12 ? (12 / dataCount) * 100 : 100

  setOption({
    backgroundColor: 'transparent',
    legend: {
      top: 8,
      left: 'center',
      itemWidth: 18,
      itemHeight: 4,
      itemGap: 18,
      icon: 'roundRect',
      textStyle: { color: '#a8b4c1', fontSize: 12 }
    },
    tooltip: createDashboardTooltip(),
    grid: {
      left: 48,
      right: 22,
      top: 46,
      bottom: 70,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxis,
      axisLine: { lineStyle: { color: '#38536a' } },
      axisLabel: {
        color: '#a8b4c1',
        rotate: 0,
        margin: 8,
        showMinLabel: true,
        showMaxLabel: true
      },
      axisTick: { show: false }
    },
    yAxis: {
      min: 0,
      max: max,
      interval: interval,
      splitLine: {
        lineStyle: { color: 'rgba(72,108,132,.28)', type: 'dashed' }
      },
      axisLabel: { color: '#a8b4c1' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: seriesList.map((item, index) => ({
      name: item.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 12,
      data: item.data || [],
      lineStyle: { width: 5, color: colors[index] || colors[0] },
      itemStyle: { color: colors[index] || colors[0] }
    })),
    dataZoom: [
      {
        type: 'slider',
        bottom: 10,
        height: 16,
        start: 0,
        end: endPercent, // 使用百分比！！双滑块
        textStyle: {
          color: '#a8b4c1'
        },
        handleStyle: {
          color: '#6b96e8'
        },
        showDataShadow: true, // ✅开启底部预览小图，截图里的淡蓝色线条
        show: xAxis.length > 12 // 大于12条数据才显示滑块
      },
      {
        type: 'inside'
      }
    ]
  })
}

watch(() => props.data, renderChart, { deep: true })
onMounted(renderChart)
</script>

<template>
  <ScreenPanel title="网逃数据趋势变化" unit="(单位：人)">
    <div ref="chartRef" class="min-h-0 flex-1 w-full" />
  </ScreenPanel>
</template>
