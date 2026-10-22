import { useIntervalFn } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

/**
 * ECharts tooltip 轮播
 * - 按固定间隔 showTip 到下一个数据点，不隐藏 tooltip
 * - 鼠标进入暂停，离开恢复
 * - 数据点不足 2 个、页面不可见或图表未初始化时不轮播
 */
export function useChartTooltipCarousel({
  chart,
  count,
  chartRef,
  interval = 3200,
  delay = 0,
  seriesIndex = 0
}) {
  const index = ref(0)
  const isHovering = ref(false)
  let startTimer = 0
  let chartElement = null

  const total = () => Number(toValue(count)) || 0
  const instance = () => toValue(chart)

  const showNext = () => {
    const current = instance()
    const points = total()
    if (!current || points < 2 || document.visibilityState !== 'visible') {
      return
    }

    const nextIndex = index.value % points
    current.dispatchAction({ type: 'showTip', seriesIndex, dataIndex: nextIndex })
    index.value = (nextIndex + 1) % points
  }

  const { pause, resume } = useIntervalFn(showNext, interval, { immediate: false })

  const clearStartTimer = () => {
    if (startTimer) {
      window.clearTimeout(startTimer)
      startTimer = 0
    }
  }

  const start = () => {
    clearStartTimer()
    pause()
    index.value = 0
    if (!instance() || total() < 2) {
      return
    }

    startTimer = window.setTimeout(() => {
      startTimer = 0
      if (isHovering.value) {
        return
      }
      showNext()
      resume()
    }, delay)
  }

  const pauseCarousel = () => {
    isHovering.value = true
    pause()
  }

  const resumeCarousel = () => {
    isHovering.value = false
    if (instance() && total() > 1) {
      resume()
    }
  }

  watch([() => toValue(chart), total], start, { immediate: true })

  onMounted(() => {
    chartElement = chartRef.value
    chartElement?.addEventListener('mouseenter', pauseCarousel)
    chartElement?.addEventListener('mouseleave', resumeCarousel)
  })

  onBeforeUnmount(() => {
    clearStartTimer()
    pause()
    chartElement?.removeEventListener('mouseenter', pauseCarousel)
    chartElement?.removeEventListener('mouseleave', resumeCarousel)
    chartElement = null
  })

  return {
    index,
    isHovering,
    start,
    pause: pauseCarousel,
    resume: resumeCarousel
  }
}
