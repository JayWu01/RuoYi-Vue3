<script setup>
import { ChartSpline, LoaderCircle } from '@lucide/vue'
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from 'vccs'
import { computed, ref, useId, useTemplateRef, watch } from 'vue'
import { createChartTheme, formatCategoryLabel, toChartRows } from '../charts/theme'
import ChartTypeToggle from '../components/ChartTypeToggle.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import { useChartTooltipCarousel } from '../composables/useChartTooltipCarousel'
import { useScreenPalette } from '../composables/useScreenPalette'

const props = defineProps({
  title: { type: String, required: true },
  unit: { type: String, default: '' },
  data: {
    type: Object,
    default: () => ({ xAxis: [], seriesList: [] })
  },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
  showChartToggle: { type: Boolean, default: true },
  showFilters: { type: Boolean, default: false },
  showUnitFilter: { type: Boolean, default: true },
  monthRange: { type: Array, default: null },
  unitOptions: { type: Array, default: () => [] },
  deptId: { type: [String, Number], default: null },
  sliderThreshold: { type: Number, default: 12 },
  sliderWindow: { type: Number, default: 12 },
  gridLeft: { type: Number, default: 40 },
  gridRight: { type: Number, default: 18 },
  gridBottom: { type: Number, default: 38 },
  xAxisRotate: { type: Number, default: 0 },
  legendLeft: { type: [String, Number], default: 'center' },
  barWidth: { type: Number, default: 10 },
  carouselDelay: { type: Number, default: 0 },
  carousel: { type: Boolean, default: true }
})

const emit = defineEmits(['changeMonthRange', 'updateUnit', 'retry'])
const chartType = defineModel('chartType', { type: String, default: 'line' })

const palette = useScreenPalette()
const chartTheme = computed(() => createChartTheme(palette.value))
const chartRef = useTemplateRef('chartRef')
const gradientId = useId()

const xAxis = computed(() => props.data?.xAxis ?? [])
const seriesList = computed(() => props.data?.seriesList ?? [])
const rows = computed(() => toChartRows(xAxis.value, seriesList.value))
const hasData = computed(() => Boolean(xAxis.value.length && seriesList.value.length))
const showSkeleton = computed(() => props.loading && !hasData.value)
const chartAriaLabel = computed(() => {
  const names = seriesList.value.map(item => item.name).filter(Boolean).join('、')
  return `${props.title}，${names || '无序列'}，共 ${xAxis.value.length} 个数据点`
})
const isBar = computed(() => chartType.value === 'bar')
const seriesColors = computed(() => seriesList.value.map(
  (_, index) => palette.value.series[index % palette.value.series.length]
))
const showLegend = computed(() => seriesList.value.length > 1)
const hiddenSeries = ref([])

const legendAlign = computed(() => (props.legendLeft === 'center' ? 'center' : 'left'))
const legendStyle = computed(() => (
  typeof props.legendLeft === 'number' ? { paddingLeft: `${props.legendLeft}px` } : {}
))

const chartMargin = computed(() => ({
  top: 6,
  right: props.gridRight,
  bottom: 0,
  left: 0
}))

const showBrush = computed(() => (
  xAxis.value.length > props.sliderThreshold
  && props.sliderWindow / xAxis.value.length < 0.95
))

const brushRange = ref({ startIndex: 0, endIndex: 0 })
watch([xAxis, () => props.sliderWindow], () => {
  const endIndex = Math.max(0, Math.min(props.sliderWindow, xAxis.value.length) - 1)
  brushRange.value = { startIndex: 0, endIndex }
}, { immediate: true })

const visibleCount = computed(() => (
  showBrush.value ? Math.min(xAxis.value.length, props.sliderWindow) : xAxis.value.length
))

const { activeIndex } = useChartTooltipCarousel({
  count: visibleCount,
  chartRef,
  delay: props.carouselDelay,
  enabled: computed(() => props.carousel)
})

/* 序列变化时清空隐藏状态，避免旧图例项残留 */
watch(() => seriesList.value.map(item => item.name).join('|'), () => {
  hiddenSeries.value = []
})

const isHidden = index => hiddenSeries.value.includes(`s${index}`)

const toggleSeries = (index) => {
  const key = `s${index}`
  hiddenSeries.value = isHidden(index)
    ? hiddenSeries.value.filter(item => item !== key)
    : [...hiddenSeries.value, key]
}

const tooltipColor = (entry, index) => {
  const seriesIndex = Number(String(entry.dataKey ?? '').slice(1))
  return seriesColors.value[Number.isInteger(seriesIndex) ? seriesIndex : index] ?? entry.color
}

const handleUnitChange = (value) => {
  const deptId = value === '' ? null : value
  const unit = props.unitOptions.find(item => item.deptId === deptId)
  emit('updateUnit', { deptId, deptName: unit?.deptName })
}
</script>

<template>
  <ScreenPanel class="chart-panel" :title="title" :unit="unit" :loading="loading" :error="error" :reveal-index="revealIndex" @retry="emit('retry')">
    <template v-if="showChartToggle" #actions>
      <ChartTypeToggle v-model="chartType" />
    </template>

    <div v-if="showFilters" class="flex min-w-0 shrink-0 flex-wrap items-center gap-2 px-4 pb-2 max-md:flex-col max-md:items-stretch">
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
        class="dashboard-date-picker min-w-[10.5rem] max-w-[15rem] flex-1 max-md:w-full"
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
      <div ref="chartRef" class="chart-stage absolute inset-0" :style="chartTheme" role="group" :aria-label="chartAriaLabel">
        <ComposedChart
          v-if="hasData"
          :data="rows"
          :margin="chartMargin"
        >
          <defs>
            <linearGradient
              v-for="(color, index) in seriesColors"
              :id="`${gradientId}-area-${index}`"
              :key="`area-${index}`"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" :stop-color="color" :stop-opacity="palette.areaAlpha" />
              <stop offset="100%" :stop-color="color" stop-opacity="0" />
            </linearGradient>
            <linearGradient
              v-for="(color, index) in seriesColors"
              :id="`${gradientId}-bar-${index}`"
              :key="`bar-${index}`"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" :stop-color="color" />
              <stop offset="100%" :stop-color="color" :stop-opacity="palette.barAlpha" />
            </linearGradient>
          </defs>

          <CartesianGrid :vertical="false" />

          <XAxis
            data-key="label"
            :tick-formatter="formatCategoryLabel"
            :tick-line="false"
            :axis-line="{ stroke: palette.axisLine }"
            :height="gridBottom"
            :angle="xAxisRotate"
            :min-tick-gap="18"
            interval="preserveStartEnd"
          />
          <YAxis
            :domain="[0, 'auto']"
            :allow-decimals="false"
            :axis-line="false"
            :tick-line="false"
            :width="gridLeft"
          />

          <Legend
            v-if="showLegend"
            :align="legendAlign"
            vertical-align="top"
            :wrapper-style="legendStyle"
          >
            <template #content="{ payload }">
              <ul class="chart-legend">
                <li v-for="(entry, index) in payload" :key="entry.dataKey ?? index">
                  <button
                    type="button"
                    class="legend-item"
                    :class="{ 'is-off': isHidden(index) }"
                    :aria-pressed="!isHidden(index)"
                    @click="toggleSeries(index)"
                  >
                    <span class="dot" :style="{ background: seriesColors[index] }" />
                    <span>{{ entry.value }}</span>
                  </button>
                </li>
              </ul>
            </template>
          </Legend>

          <Tooltip
            v-model:active-index="activeIndex"
            :cursor="{ stroke: palette.axisPointer, strokeWidth: 1 }"
            :offset="12"
          >
            <template #content="{ label, payload }">
              <div class="chart-tooltip">
                <div class="ct-label">
                  {{ formatCategoryLabel(label) }}
                </div>
                <div v-for="(item, index) in payload" :key="item.dataKey ?? index" class="ct-row">
                  <span class="ct-dot" :style="{ background: tooltipColor(item, index) }" />
                  <span class="ct-name">{{ item.name }}</span>
                  <span class="ct-value">{{ item.value }}</span>
                </div>
              </div>
            </template>
          </Tooltip>

          <template v-if="isBar">
            <Bar
              v-for="(series, index) in seriesList"
              :key="`bar-${series.name}`"
              :data-key="`s${index}`"
              :name="series.name"
              :fill="seriesColors[index]"
              :hide="isHidden(index)"
              :radius="[5, 5, 0, 0]"
              :max-bar-size="barWidth"
            >
              <Cell
                v-for="(row, rowIndex) in rows"
                :key="rowIndex"
                :fill="`url(#${gradientId}-bar-${index})`"
              />
            </Bar>
          </template>

          <template v-else-if="seriesList.length === 1">
            <Area
              data-key="s0"
              :name="seriesList[0].name"
              type="monotone"
              :stroke="seriesColors[0]"
              :stroke-width="2.2"
              :fill="`url(#${gradientId}-area-0)`"
              :fill-opacity="1"
              :dot="false"
              :active-dot="{ r: 3, strokeWidth: 0 }"
            />
          </template>

          <template v-else>
            <Line
              v-for="(series, index) in seriesList"
              :key="`line-${series.name}`"
              :data-key="`s${index}`"
              :name="series.name"
              type="monotone"
              :stroke="seriesColors[index]"
              :stroke-width="2.2"
              :hide="isHidden(index)"
              :dot="false"
              :active-dot="{ r: 3, strokeWidth: 0 }"
            />
          </template>

          <Brush
            v-if="showBrush"
            v-model:range="brushRange"
            data-key="label"
            :height="26"
            :traveller-width="7"
            :fill="palette.brushFill"
            :stroke="palette.brushStroke"
          />
        </ComposedChart>
      </div>

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
