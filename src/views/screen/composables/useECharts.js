import { usePreferredReducedMotion, useResizeObserver } from '@vueuse/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useScreenScale } from './useScreenScale'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  DataZoomComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer
])

const dashboardChartAnimation = {
  animation: true,
  animationDuration: 900,
  animationDurationUpdate: 650,
  animationEasing: 'cubicOut',
  animationEasingUpdate: 'cubicInOut'
}

export function useECharts(elementRef) {
  const chart = shallowRef(null)
  const reducedMotion = usePreferredReducedMotion()
  const screenScale = useScreenScale()
  const animation = computed(() => (reducedMotion.value === 'reduce'
    ? { animation: false }
    : dashboardChartAnimation))
  // 画布被放大时提高 canvas 分辨率，避免大屏下图表发虚
  const devicePixelRatio = computed(() => {
    const ratio = window.devicePixelRatio * Math.max(1, screenScale.value)
    return Math.min(2, Math.round(ratio * 4) / 4)
  })
  let lastOption = null

  const ensureChart = () => {
    const element = elementRef.value
    if (!element || !element.clientWidth || !element.clientHeight) {
      return null
    }

    if (!chart.value) {
      chart.value = echarts.init(element, null, { devicePixelRatio: devicePixelRatio.value })
      if (lastOption) {
        chart.value.setOption(lastOption, true)
      }
    }

    return chart.value
  }

  const setOption = (option) => {
    lastOption = { ...animation.value, ...option }
    ensureChart()?.setOption(lastOption, true)
  }

  const resize = () => {
    ensureChart()?.resize()
  }

  useResizeObserver(elementRef, resize)

  // 缩放比例变化后 canvas 的分辨率需要重新按新比例创建
  watch(devicePixelRatio, () => {
    if (!chart.value) {
      return
    }
    chart.value.dispose()
    chart.value = null
    ensureChart()
  })

  onMounted(resize)

  onBeforeUnmount(() => {
    chart.value?.dispose()
    chart.value = null
  })

  return {
    setOption,
    resize
  }
}
