<script setup>
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { getScreenPalette } from '../charts/palette'
import { useECharts } from '../composables/useECharts'
import { useScreenTheme } from '../composables/useScreenTheme'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  /** 画布边长（px） */
  size: {
    type: Number,
    default: 158
  },
  /** 受外部（图例）控制的高亮分段，兼容内部 hover */
  activeIndex: {
    type: Number,
    default: null
  },
  ariaLabel: {
    type: String,
    default: '环形图'
  }
})

const emit = defineEmits(['hover'])

const chartRef = useTemplateRef('chartRef')
const { chart, setOption } = useECharts(chartRef)
const { theme } = useScreenTheme()
const palette = computed(() => getScreenPalette(theme.value))

const items = computed(() => props.data.map((item, index) => ({
  name: String(item?.name ?? ''),
  value: Number(item?.value) || 0,
  color: item?.color || palette.value.series[index % palette.value.series.length]
})))

const total = computed(() => items.value.reduce((sum, item) => sum + item.value, 0))

const activeSegment = computed(() => (
  items.value.find((_, index) => index === props.activeIndex) ?? null
))

const syncHighlight = (index) => {
  const instance = chart.value
  if (!instance) {
    return
  }

  instance.dispatchAction({ type: 'downplay', seriesIndex: 0 })
  if (typeof index === 'number' && index >= 0) {
    instance.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: index })
  }
}

const renderChart = () => {
  if (!items.value.length) {
    setOption({ series: [] })
    return
  }

  const colors = palette.value
  setOption({
    animationDuration: 700,
    animationDurationUpdate: 320,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut',
    series: [
      {
        type: 'pie',
        radius: ['70%', '88%'],
        center: ['50%', '50%'],
        minAngle: 2,
        padAngle: 2,
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderRadius: 7 },
        emphasis: {
          scale: true,
          scaleSize: 4,
          itemStyle: {
            shadowBlur: 12,
            shadowColor: colors.axisPointer
          }
        },
        data: items.value.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ]
  })

  syncHighlight(props.activeIndex)
}

const bindEvents = (instance) => {
  if (!instance) {
    return
  }

  instance.off('mouseover')
  instance.off('mouseout')
  instance.off('globalout')
  instance.on('mouseover', (params) => {
    if (params.componentType === 'series') {
      emit('hover', params.dataIndex)
    }
  })
  instance.on('mouseout', () => emit('hover', null))
  instance.on('globalout', () => emit('hover', null))
}

watch([items, palette], renderChart)
watch(() => props.activeIndex, syncHighlight)
watch(chart, instance => bindEvents(instance))
onMounted(renderChart)

onBeforeUnmount(() => {
  chart.value?.off('mouseover')
  chart.value?.off('mouseout')
  chart.value?.off('globalout')
})
</script>

<template>
  <div
    class="donut-wrap"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="ariaLabel"
  >
    <div ref="chartRef" class="donut-canvas" />

    <div class="donut-center">
      <slot :total="total" :active="activeSegment">
        <span class="donut-total">{{ total }}</span>
        <span class="donut-label">总人数</span>
      </slot>
    </div>
  </div>
</template>
