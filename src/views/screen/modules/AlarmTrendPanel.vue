<script setup>
import { onMounted, ref, watch } from 'vue'
import ChartTypeToggle from '../components/ChartTypeToggle.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import { createDashboardTooltip, useECharts } from '../composables/useECharts'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  chartType: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['change-chart'])

const chartRef = ref(null)

const { setOption } = useECharts(chartRef)

const renderChart = () => {
  const colors = ['#6b96e8', '#86c75b', '#f2b841']
  const seriesList = props.data.seriesList || []
  const xAxis = props.data.xAxis?.length
      ? props.data.xAxis
      : Array.from({ length: Math.max(...seriesList.map(item => item.data?.length || 0), 0) }, (_, index) => index + 1)
  const lineChartData = seriesList.map((item, index) => ({
    name: item.name,
    type: 'line',
    symbolSize: 12,
    smooth: true,
    data: item.data || [],
    lineStyle: { color: colors[index] || colors[0], width: 5 }
  }))
  const barChartData = seriesList.map((item, index) => ({
    name: item.name,
    type: 'bar',
    barWidth: 10,
    data: item.data || [],
    itemStyle: { color: colors[index] || colors[0] }
  }))

  setOption({
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
      bottom: 56, // 加大bottom，留出dataZoom高度，原来34不够
      containLabel: true
    },
    xAxis: {
      data: xAxis,
      axisLine: {
        lineStyle: { color: '#38536a' }
      },
      axisLabel: {
        color: '#a8b4c1',
        // interval: 4 删掉！不能固定间隔，滑动会失效
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      min: 0,
      splitLine: {
        lineStyle: {
          color: 'rgba(72,108,132,.28)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#a8b4c1'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: props.chartType === 'line' ? lineChartData : barChartData,
    // =========新增：横向滑动滑块=========
    dataZoom: [
      {
        type: 'slider',
        bottom: 10,
        height: 16,
        startValue: 0,
        endValue: 29, // 默认一页展示30个日期，可按需调整
        textStyle: {
          color: '#a8b4c1'
        },
        handleStyle: {
          color: '#6b96e8'
        },
        showDataShadow: false,
        // 数据总数小于等于30条时，自动隐藏滑块
        show: xAxis.length > 30
      },
      {
        type: 'inside' // 鼠标滚轮也可以左右平移缩放，大屏鼠标可选保留
      }
    ]
  })
}

watch(() => [props.data, props.chartType], renderChart, { deep: true })

onMounted(renderChart)
</script>

<template>
  <ScreenPanel title="接处警趋势变化" unit="(单位：起)">
    <template #actions>
      <ChartTypeToggle :model-value="chartType" @update:model-value="emit('change-chart', $event)" />
    </template>

    <div ref="chartRef" class="min-h-0 flex-1 w-full" />
  </ScreenPanel>
</template>
