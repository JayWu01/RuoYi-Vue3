import { useEventListener, useIntervalFn, usePreferredReducedMotion } from '@vueuse/core'
import { onBeforeUnmount, ref, toValue, watch } from 'vue'

/**
 * tooltip 轮播
 * - 定时把 activeIndex 推到下一个数据点，tooltip 常显
 * - 鼠标进入图表暂停，离开后从当前点继续
 * - 数据点不足 2 个、页面不可见时不轮播
 */
export function useChartTooltipCarousel({
  count,
  chartRef,
  interval = 3200,
  delay = 0,
  enabled = true
}) {
  const activeIndex = ref(null)
  const isHovering = ref(false)
  const reducedMotion = usePreferredReducedMotion()
  let nextIndex = 0
  let startTimer = 0

  const total = () => Number(toValue(count)) || 0
  const isEnabled = () => Boolean(toValue(enabled))

  const showNext = () => {
    if (!isEnabled() || reducedMotion.value === 'reduce' || total() < 2 || document.visibilityState !== 'visible') {
      return
    }
    activeIndex.value = nextIndex % total()
    nextIndex = (activeIndex.value + 1) % total()
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
    nextIndex = 0
    activeIndex.value = null
    if (!isEnabled() || total() < 2 || reducedMotion.value === 'reduce') {
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

  // tooltip 也会把鼠标悬停的位置写回 activeIndex，轮播从该点继续
  watch(activeIndex, (value) => {
    if (typeof value === 'number') {
      nextIndex = (value + 1) % total()
    }
  })

  const handleEnter = () => {
    isHovering.value = true
    pause()
  }

  const handleLeave = () => {
    isHovering.value = false
    if (total() > 1 && reducedMotion.value !== 'reduce') {
      resume()
    }
  }

  watch([total, reducedMotion, () => isEnabled()], start, { immediate: true })
  useEventListener(chartRef, 'mouseenter', handleEnter)
  useEventListener(chartRef, 'mouseleave', handleLeave)

  onBeforeUnmount(() => {
    clearStartTimer()
    pause()
  })

  return {
    activeIndex
  }
}
