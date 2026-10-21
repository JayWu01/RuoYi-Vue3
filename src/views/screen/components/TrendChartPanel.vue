<script setup>
import { onMounted, useTemplateRef, watch } from 'vue'
import { calcAxisMaxAndInterval, createDashboardTooltip, createEmptyGraphic, createSliderZoom } from '../charts/shared'
import ChartTypeToggle from '../components/ChartTypeToggle.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import { useECharts } from '../composables/useECharts'

const props = defineProps({
  title: { type: String, required: true },
  unit: { type: String, default: '' },
  data: {
    type: Object,
    default: () => ({ xAxis: [], seriesList: [] })
  },
  showChartToggle: { type: Boolean, default: true },
  showFilters: { type: Boolean, default: false },
  monthRange: { type: Array, default: null },
  unitOptions: { type: Array, default: () => [] },
  deptId: { type: [String, Number], default: null },
  sliderThreshold: { type: Number, default: 12 },
  sliderWindow: { type: Number, default: 12 },
  showDataShadow: { type: Boolean, default: true },
  scaleAxis: { type: Boolean, default: false },
  gridLeft: { type: Number, default: 48 },
  gridRight: { type: Number, default: 22 },
  gridBottom: { type: Number, default: 56 },
  xAxisRotate: { type: Number, default: 0 },
  legendLeft: { type: [String, Number], default: 'center' },
  barWidth: { type: Number, default: 10 }
})

const emit = defineEmits(['change-month-range', 'update-unit'])
const chartType = defineModel('chartType', { type: String, default: 'line' })

const chartRef = useTemplateRef('chartRef')
const { setOption } = useECharts(chartRef)

const handleUnitChange = (value) => {
  const deptId = value === '' ? null : value
  const unit = props.unitOptions.find(item => item.deptId === deptId)
  emit('update-unit', { deptId, deptName: unit?.deptName })
}

const renderChart = () => {
  const colors = ['#6b96e8', '#86c75b', '#f2b841']
  const xAxis = props.data?.xAxis ?? []
  const seriesList = props.data?.seriesList ?? []

  if (!xAxis.length || !seriesList.length) {
    setOption({
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [],
      graphic: createEmptyGraphic()
    })
    return
  }

  const lineSeries = seriesList.map((item, index) => ({
    name: item.name,
    type: 'line',
    symbolSize: 12,
    smooth: true,
    data: item.data,
    lineStyle: { color: colors[index] || colors[0], width: 5 },
    itemStyle: { color: colors[index] || colors[0] }
  }))
  const barSeries = seriesList.map((item, index) => ({
    name: item.name,
    type: 'bar',
    barWidth: props.barWidth,
    data: item.data,
    itemStyle: { color: colors[index] || colors[0] }
  }))

  const count = xAxis.length
  const showSlider = count > props.sliderThreshold
  const endPercent = count > props.sliderWindow ? (props.sliderWindow / count) * 100 : 100
  const axisScale = props.scaleAxis
    ? calcAxisMaxAndInterval(seriesList.flatMap(item => item.data))
    : null

  setOption({
    legend: {
      top: 8,
      left: props.legendLeft,
      itemWidth: 18,
      itemHeight: 4,
      itemGap: 18,
      icon: 'roundRect',
      textStyle: { color: '#a8b4c1', fontSize: 12 }
    },
    tooltip: createDashboardTooltip(),
    grid: {
      left: props.gridLeft,
      right: props.gridRight,
      top: 46,
      bottom: props.gridBottom,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxis,
      axisLine: { lineStyle: { color: '#38536a' } },
      axisLabel: { color: '#a8b4c1', rotate: props.xAxisRotate },
      axisTick: { show: false }
    },
    yAxis: {
      min: 0,
      ...(axisScale ? { max: axisScale.max, interval: axisScale.interval } : {}),
      splitLine: {
        lineStyle: { color: 'rgba(72,108,132,.28)', type: 'dashed' }
      },
      axisLabel: { color: '#a8b4c1' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: chartType.value === 'line' ? lineSeries : barSeries,
    dataZoom: createSliderZoom({
      show: showSlider,
      endPercent,
      showDataShadow: props.showDataShadow
    })
  })
}

watch(() => [props.data, chartType.value], renderChart)
onMounted(renderChart)
</script>

<template>
  <ScreenPanel :title="title" :unit="unit">
    <template v-if="showChartToggle" #actions>
      <ChartTypeToggle v-model="chartType" />
    </template>

    <div v-if="showFilters" class="flex min-w-0 items-center justify-end gap-2 px-4">
      <el-date-picker
        :model-value="monthRange"
        type="monthrange"
        format="YYYY-MM"
        value-format="YYYY-MM"
        range-separator="~"
        start-placeholder="开始月份"
        end-placeholder="结束月份"
        clearable
        size="small"
        popper-class="dashboard-popper"
        class="dashboard-date-picker min-w-0 flex-1"
        @update:model-value="emit('change-month-range', $event)"
      />
      <el-select
        popper-class="dashboard-popper"
        class="dashboard-select min-w-0 flex-1"
        :model-value="deptId ?? ''"
        clearable
        size="small"
        placeholder="全部单位"
        @update:model-value="handleUnitChange"
      >
        <el-option label="全部单位" value="" />
        <el-option
          v-for="option in unitOptions"
          :key="option.deptId"
          :label="option.deptName"
          :value="option.deptId"
        />
      </el-select>
    </div>

    <div ref="chartRef" class="min-h-0 flex-1 w-full" />
  </ScreenPanel>
</template>
