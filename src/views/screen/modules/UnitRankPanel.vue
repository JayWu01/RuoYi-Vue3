<script setup>
import { graphic } from 'echarts/core'
import { onMounted, useTemplateRef, watch } from 'vue'
import { calcAxisMaxAndInterval, createDashboardTooltip, createEmptyGraphic } from '../charts/shared'
import ScreenPanel from '../components/ScreenPanel.vue'
import { useECharts } from '../composables/useECharts'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ yAxis: [], series: [] })
  }
})

const rankType = defineModel('rankType', { type: String, default: 'callPolice' })

const rankTabList = [
  { label: '接处警', value: 'callPolice' },
  { label: '追网逃', value: 'netFugitive' },
  { label: '敲打未成年', value: 'minorBeat' },
  { label: '拉车门', value: 'pullCarDoor' }
]

const chartRef = useTemplateRef('chartRef')
const { setOption } = useECharts(chartRef)

const handleTabChange = (value) => {
  if (value !== rankType.value) {
    rankType.value = value
  }
}

const renderChart = () => {
  const yAxisData = props.data?.yAxis || []
  const seriesData = (props.data?.series || []).map(value => Number(value) || 0)

  if (!yAxisData.length || !seriesData.length) {
    setOption({
      yAxis: { type: 'category', data: [] },
      xAxis: { type: 'value' },
      series: [],
      graphic: createEmptyGraphic()
    })
    return
  }

  const { max, interval } = calcAxisMaxAndInterval(seriesData)

  const barColorList = seriesData.map((_, index) => {
    if (index === 0) {
      return new graphic.LinearGradient(1, 0, 0, 0, [
        { offset: 0, color: '#ff4c3b' },
        { offset: 1, color: '#ff9547' }
      ])
    }
    if (index === 1) {
      return new graphic.LinearGradient(1, 0, 0, 0, [
        { offset: 0, color: '#ff7b26' },
        { offset: 1, color: '#ffc048' }
      ])
    }
    if (index === 2) {
      return new graphic.LinearGradient(1, 0, 0, 0, [
        { offset: 0, color: '#f8c220' },
        { offset: 1, color: '#ffe470' }
      ])
    }
    return new graphic.LinearGradient(1, 0, 0, 0, [
      { offset: 0, color: '#318bff' },
      { offset: 1, color: '#64c7ff' }
    ])
  })

  const barWidth = yAxisData.length <= 3 ? 30 : yAxisData.length <= 6 ? 24 : 16

  setOption({
    backgroundColor: 'transparent',
    tooltip: createDashboardTooltip(),
    grid: {
      left: 140,
      right: 30,
      top: 14,
      bottom: 8,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      min: 0,
      max,
      interval,
      splitLine: {
        lineStyle: { color: 'rgba(72,108,132,.28)', type: 'dashed' }
      },
      axisLabel: { color: '#a8b4c1' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: yAxisData.map((name, index) => `${index + 1}\u3000${name}`),
      inverse: true,
      axisLine: { lineStyle: { color: '#38536a' } },
      axisLabel: {
        color: '#a8b4c1',
        align: 'right',
        fontSize: 15,
        lineHeight: 22
      },
      axisTick: { show: false }
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        barWidth,
        data: seriesData,
        itemStyle: {
          color: params => barColorList[params.dataIndex]
        },
        label: {
          show: true,
          position: 'right',
          color: '#ffffff',
          fontSize: 12
        }
      }
    ]
  })
}

watch(() => props.data, renderChart)
onMounted(renderChart)
</script>

<template>
  <ScreenPanel title="警务站排名" unit="(单位：起)">
    <div class="flex flex-col min-h-0 h-full">
      <div class="mb-4 flex shrink-0 gap-1.5" role="tablist" aria-label="排名维度">
        <button
          v-for="tab in rankTabList"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="rankType === tab.value"
          class="relative z-panel-content cursor-pointer whitespace-nowrap rounded border text-sm px-3 py-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
          :class="rankType === tab.value
            ? 'border-[#3498ff] bg-gradient-to-r from-[#185299] to-[#2470cc] text-white shadow-[0_0_8px_rgba(52,152,255,0.35)]'
            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-800'"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
      <div ref="chartRef" class="flex-1 w-full min-h-0" />
    </div>
  </ScreenPanel>
</template>
