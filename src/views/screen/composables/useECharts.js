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
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'

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
  const animation = computed(() => (reducedMotion.value === 'reduce'
    ? { animation: false }
    : dashboardChartAnimation))
  let lastOption = null

  const ensureChart = () => {
    const element = elementRef.value
    if (!element || !element.clientWidth || !element.clientHeight) {
      return null
    }

    if (!chart.value) {
      chart.value = echarts.init(element)
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
