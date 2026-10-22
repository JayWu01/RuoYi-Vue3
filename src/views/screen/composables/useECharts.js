/**
 * 大屏 ECharts 轻量封装（按需注册 + 性能调优）
 * - 仅注册 line/bar/pie/grid/legend/tooltip/dataZoom + CanvasRenderer
 * - init 限制 devicePixelRatio ≤ 2、开启 useDirtyRect
 * - setOption 合并更新（replaceMerge 系列类），避免整图重绘闪烁
 * - resize 用 requestAnimationFrame 节流；页面重新可见时补一次 resize
 * - 默认动画收短（480/320ms），系统「减少动态效果」时关闭动画
 */
import { usePreferredReducedMotion, useResizeObserver } from '@vueuse/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  DataZoomComponent,
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
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer
])

const REPLACE_MERGE_KEYS = ['series', 'dataZoom', 'legend']

const CHART_ANIMATION = {
  animation: true,
  animationDuration: 480,
  animationDurationUpdate: 320,
  animationEasing: 'cubicOut',
  animationEasingUpdate: 'cubicOut'
}

const MAX_DEVICE_PIXEL_RATIO = 2

export function useECharts(elementRef) {
  const chart = shallowRef(null)
  const reducedMotion = usePreferredReducedMotion()
  const screenScale = useScreenScale()
  const animation = computed(() => (reducedMotion.value === 'reduce'
    ? { animation: false }
    : CHART_ANIMATION))
  // 画布被放大时提高 canvas 分辨率，避免大屏下图表发虚
  const devicePixelRatio = computed(() => {
    const ratio = (window.devicePixelRatio || 1) * Math.max(1, screenScale.value)
    return Math.min(MAX_DEVICE_PIXEL_RATIO, Math.round(ratio * 4) / 4)
  })
  let lastOption = null
  let resizeFrame = 0

  const ensureChart = () => {
    const element = elementRef.value
    if (!element || !element.clientWidth || !element.clientHeight) {
      return null
    }

    if (!chart.value) {
      chart.value = echarts.init(element, null, {
        renderer: 'canvas',
        devicePixelRatio: devicePixelRatio.value,
        useDirtyRect: true
      })
      /* 元素晚于首次 setOption 获得尺寸时，补一次完整初始化 */
      if (lastOption) {
        chart.value.setOption(lastOption, { notMerge: true })
      }
    }

    return chart.value
  }

  const setOption = (option) => {
    const nextOption = { ...animation.value, ...option }
    const isFirstApply = !chart.value
    lastOption = nextOption

    const instance = ensureChart()
    if (!instance || isFirstApply) {
      return
    }

    instance.setOption(nextOption, {
      lazyUpdate: true,
      replaceMerge: REPLACE_MERGE_KEYS
    })
  }

  const resizeNow = () => {
    const element = elementRef.value
    if (!element || !element.clientWidth || !element.clientHeight) {
      return
    }
    ensureChart()?.resize()
  }

  const resize = () => {
    if (resizeFrame) {
      return
    }
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0
      resizeNow()
    })
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      resize()
    }
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

  onMounted(() => {
    resize()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (resizeFrame) {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = 0
    }
    chart.value?.dispose()
    chart.value = null
    lastOption = null
  })

  return {
    chart,
    setOption,
    resize
  }
}
