<script setup>
import { computed, onMounted, useTemplateRef, watch } from 'vue'
import { createDashboardTooltip, createEmptyGraphic } from '../charts/shared'
import AnimatedStatistic from '../components/AnimatedStatistic.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import TrendValue from '../components/TrendValue.vue'
import { useECharts } from '../composables/useECharts'
import { MINOR_LEVELS } from '../constant'
import { isTrendUp } from '../utils/trend'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartRef = useTemplateRef('chartRef')
const { setOption } = useECharts(chartRef)

const pieData = computed(() => props.data.dataList || [])
const total = computed(() => props.data.total ?? pieData.value.reduce((sum, item) => sum + (item.value || 0), 0))
const hasData = computed(() => total.value > 0)
const unwarnedCount = computed(() => props.data.unwarnedMinorCount ?? '-')
const unwarnedRatio = computed(() => props.data.unwarnedMinorRatio ?? '-')
const compareRatio = computed(() => props.data.ratioCompareYesterday ?? '-')
const unwarnedUp = computed(() => isTrendUp(unwarnedRatio.value))
const compareUp = computed(() => isTrendUp(compareRatio.value))

const percentage = value => (total.value ? `${((value / total.value) * 100).toFixed(1)}%` : '0%')

const pieColors = computed(() => pieData.value.map((item, index) => {
  const level = MINOR_LEVELS.find(entry => entry.label === item.name)
  return level?.color ?? MINOR_LEVELS[index]?.color ?? '#37424c'
}))

const renderChart = () => {
  setOption({
    color: pieColors.value,
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'middle',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 10,
      textStyle: { color: '#cbd7df', fontSize: 12 },
      formatter: (name) => {
        const item = pieData.value.find(({ name: itemName }) => itemName === name)
        const value = item?.value || 0
        return `${name}  ${value} (${percentage(value)})`
      }
    },
    tooltip: createDashboardTooltip('item'),
    ...(hasData.value ? {} : { graphic: createEmptyGraphic() }),
    series: [
      {
        type: 'pie',
        radius: ['44%', '70%'],
        center: ['30%', '48%'],
        startAngle: 90,
        avoidLabelOverlap: true,
        label: {
          show: hasData.value,
          color: '#dce7ef',
          formatter: ({ value }) => (value ? `${value}\n${percentage(value)}` : ''),
          fontSize: 12
        },
        labelLine: {
          show: hasData.value,
          length: 8,
          length2: 10,
          lineStyle: { color: '#607080' }
        },
        itemStyle: { borderColor: '#041a31', borderWidth: 2 },
        data: pieData.value
      }
    ]
  })
}

watch(() => props.data, renderChart)
onMounted(renderChart)
</script>

<template>
  <ScreenPanel title="罪错未成年 (红橙黄蓝黑) 分布">
    <div class="relative flex-1 w-full h-full">
      <div ref="chartRef" class="absolute inset-0 z-panel-content" />

      <div
        class="absolute top-[6px] right-2 z-panel-overlay pointer-events-auto rounded-md border border-[#2f80d1]/50 bg-gradient-to-b from-[#124072]/85 to-[#0a2a52]/85 px-2 py-1 shadow-[0_0_10px_rgba(47,128,209,.25)]"
      >
        <div class="flex flex-col items-start gap-0.5">
          <div class="flex items-center gap-2">
            <span class="text-[12px] text-[#8fb8e6] whitespace-nowrap">非预警未成年人数</span>
            <AnimatedStatistic
              :value="unwarnedCount"
              class="font-bold"
              :value-style="{ color: '#ff4d4f', fontSize: '1.25rem', lineHeight: '1.2', fontWeight: 700 }"
            />
          </div>
          <div class="flex items-center gap-1 text-[12px] text-[#a9c6e4]">
            <span>环比</span>
            <TrendValue
              :value="unwarnedRatio"
              :up="unwarnedUp"
              show-direction
              :class="unwarnedUp ? 'font-bold text-chart-red' : 'font-bold text-success'"
            />
          </div>
        </div>
      </div>

      <div class="pointer-events-none absolute left-[30%] top-[48%] z-panel-overlay -translate-x-1/2 -translate-y-1/2 text-center">
        <AnimatedStatistic :value="total" class="font-bold" :value-style="{ color: '#dfe9f0', fontSize: '1.75rem', lineHeight: '1' }" />
        <span class="block text-xs text-muted">总人数</span>
      </div>
    </div>

    <div class="flex h-9 shrink-0 items-center justify-center gap-2 border-t border-line-muted/60 bg-black/10 text-sm text-muted">
      <span>环比</span>
      <TrendValue
        :value="compareRatio"
        :up="compareUp"
        show-direction
        :class="compareUp ? 'font-bold text-chart-red' : 'font-bold text-success'"
      />
    </div>
  </ScreenPanel>
</template>
