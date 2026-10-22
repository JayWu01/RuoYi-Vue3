<script setup>
import { ChartSpline, LoaderCircle } from '@lucide/vue'
import { computed, onMounted, useTemplateRef, watch } from 'vue'
import { getScreenPalette } from '../charts/palette'
import {
  calcAxisMaxAndInterval,
  createAreaGradient,
  createBarGradient,
  createDashboardTooltip,
  createSliderZoom,
  NUMERIC_FONT_FAMILY,
  TEXT_FONT_FAMILY
} from '../charts/shared'
import ChartTypeToggle from '../components/ChartTypeToggle.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import { useChartTooltipCarousel } from '../composables/useChartTooltipCarousel'
import { useECharts } from '../composables/useECharts'
import { useScreenTheme } from '../composables/useScreenTheme'

const props = defineProps({
  title: { type: String, required: true },
  unit: { type: String, default: '' },
  data: {
    type: Object,
    default: () => ({ xAxis: [], seriesList: [] })
  },
  loading: { type: Boolean, default: false },
  showChartToggle: { type: Boolean, default: true },
  showFilters: { type: Boolean, default: false },
  showUnitFilter: { type: Boolean, default: true },
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
  barWidth: { type: Number, default: 10 },
  carouselDelay: { type: Number, default: 0 }
})

const emit = defineEmits(['changeMonthRange', 'updateUnit'])
const chartType = defineModel('chartType', { type: String, default: 'line' })

const { theme } = useScreenTheme()
const palette = computed(() => getScreenPalette(theme.value))

const chartRef = useTemplateRef('chartRef')
const { chart, setOption } = useECharts(chartRef)

const isBar = computed(() => chartType.value === 'bar')
const hasData = computed(() => Boolean(props.data?.xAxis?.length && props.data?.seriesList?.length))
const showSkeleton = computed(() => props.loading && !hasData.value)

const handleUnitChange = (value) => {
  const deptId = value === '' ? null : value
  const unit = props.unitOptions.find(item => item.deptId === deptId)
  emit('updateUnit', { deptId, deptName: unit?.deptName })
}

/* 折线：symbol 无点 + smooth + lttb 采样；单系列才加垂直渐变面积，多系列避免糊 */
const buildLineSeries = seriesList => seriesList.map((item, index) => {
  const color = palette.value.series[index % palette.value.series.length]
  const series = {
    name: item.name,
    type: 'line',
    smooth: true,
    symbol: 'none',
    sampling: 'lttb',
    data: item.data,
    lineStyle: { width: 2.5, color },
    itemStyle: { color },
    emphasis: { focus: 'series' },
    animationDelay: index * 70
  }

  if (seriesList.length === 1) {
    series.areaStyle = { color: createAreaGradient(color, palette.value.areaAlpha) }
  }

  return series
})

/* 柱状：圆角 + 垂直渐变；barWidth prop 作为最大柱宽，点位多时自动收窄避免相邻分类重叠 */
const buildBarSeries = seriesList => seriesList.map((item, index) => {
  const color = palette.value.series[index % palette.value.series.length]
  return {
    name: item.name,
    type: 'bar',
    barMaxWidth: props.barWidth,
    data: item.data,
    itemStyle: {
      color: createBarGradient(color, palette.value.barAlpha),
      borderRadius: [5, 5, 0, 0]
    },
    emphasis: { focus: 'series' },
    animationDelay: index * 50
  }
})

const renderChart = () => {
  const xAxis = props.data?.xAxis ?? []
  const seriesList = props.data?.seriesList ?? []

  /* 空态：清空画布，空态文案由 HTML 覆盖层负责 */
  if (!xAxis.length || !seriesList.length) {
    setOption({
      legend: { show: false },
      tooltip: { show: false },
      xAxis: { show: false, type: 'category', data: [] },
      yAxis: { show: false, type: 'value' },
      series: [],
      dataZoom: []
    })
    return
  }

  const colors = palette.value
  const count = xAxis.length
  const showSlider = count > props.sliderThreshold
  const endPercent = count > props.sliderWindow ? (props.sliderWindow / count) * 100 : 100
  const axisScale = props.scaleAxis
    ? calcAxisMaxAndInterval(seriesList.flatMap(item => item.data))
    : null
  const barMode = isBar.value

  setOption({
    animationDuration: 700,
    animationDurationUpdate: 320,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut',
    textStyle: { fontFamily: TEXT_FONT_FAMILY },
    legend: {
      show: true,
      top: 4,
      left: props.legendLeft,
      icon: 'circle',
      itemWidth: 7,
      itemHeight: 7,
      itemGap: 14,
      textStyle: { color: colors.text3, fontSize: 10.5, fontFamily: TEXT_FONT_FAMILY },
      inactiveColor: colors.legendInactive
    },
    tooltip: createDashboardTooltip('axis', colors),
    grid: {
      left: props.gridLeft,
      right: props.gridRight,
      top: 34,
      bottom: props.gridBottom,
      containLabel: true
    },
    xAxis: {
      show: true,
      type: 'category',
      data: xAxis,
      boundaryGap: barMode,
      axisLine: { lineStyle: { color: colors.axisLine } },
      axisTick: { show: false },
      axisLabel: {
        color: colors.text3,
        fontSize: 10,
        fontFamily: NUMERIC_FONT_FAMILY,
        rotate: props.xAxisRotate,
        hideOverlap: true
      }
    },
    yAxis: {
      show: true,
      type: 'value',
      min: 0,
      ...(axisScale ? { max: axisScale.max, interval: axisScale.interval } : {}),
      splitNumber: 4,
      splitLine: { lineStyle: { color: colors.splitLine } },
      axisLabel: { color: colors.text3, fontSize: 10, fontFamily: NUMERIC_FONT_FAMILY },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: barMode ? buildBarSeries(seriesList) : buildLineSeries(seriesList),
    dataZoom: createSliderZoom({
      show: showSlider,
      endPercent,
      showDataShadow: props.showDataShadow
    }, colors)
  })
}

watch([() => props.data, chartType, palette], renderChart)
onMounted(renderChart)

useChartTooltipCarousel({
  chart,
  count: computed(() => props.data?.xAxis?.length ?? 0),
  chartRef,
  delay: props.carouselDelay
})
</script>

<template>
  <ScreenPanel :title="title" :unit="unit" :loading="loading">
    <template v-if="showChartToggle" #actions>
      <ChartTypeToggle v-model="chartType" />
    </template>

    <div v-if="showFilters" class="flex min-w-0 shrink-0 flex-wrap items-center gap-2 px-4 pb-1 max-md:flex-col max-md:items-stretch">
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
        class="dashboard-date-picker min-w-[10.5rem] flex-1 max-md:w-full"
        @update:model-value="emit('changeMonthRange', $event)"
      />
      <el-select
        v-if="showUnitFilter"
        popper-class="dashboard-popper"
        class="dashboard-select min-w-[7.5rem] flex-1 max-md:w-full"
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

    <div class="relative min-h-0 flex-1" :aria-busy="loading || undefined">
      <div ref="chartRef" class="absolute inset-0" />

      <Transition name="scr-fade">
        <div v-if="showSkeleton" class="chart-skeleton absolute inset-0 z-panel-overlay" aria-hidden="true">
          <span class="cs-line" />
          <div class="cs-wave" />
          <span class="cs-line" />
          <span class="cs-status">
            <LoaderCircle class="cs-spinner" :size="14" :stroke-width="2" />
            数据加载中
          </span>
        </div>
      </Transition>

      <div v-if="!hasData && !loading" class="empty-state absolute inset-0 z-panel-overlay">
        <div class="empty-ico">
          <ChartSpline :size="16" :stroke-width="1.8" />
        </div>
        <span>暂无趋势数据</span>
      </div>
    </div>
  </ScreenPanel>
</template>
