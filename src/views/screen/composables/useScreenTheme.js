import { useStorage } from '@vueuse/core'
import { computed, nextTick } from 'vue'

const STORAGE_KEY = 'police-screen-theme'

/** 大屏主题：独立于后台的 html.dark，默认深色并持久化 */
export const screenTheme = useStorage(STORAGE_KEY, 'dark')

const isDark = computed(() => screenTheme.value !== 'light')

export function useScreenTheme() {
  const setTheme = (value) => {
    screenTheme.value = value === 'light' ? 'light' : 'dark'
  }

  return {
    theme: screenTheme,
    isDark,
    setTheme
  }
}

/**
 * 切换主题。浏览器支持 View Transitions 时做整页交叉淡入，
 * 让 CSS 令牌与 ECharts canvas 一起过渡，而不是生硬闪切。
 */
export async function toggleScreenTheme() {
  const next = isDark.value ? 'light' : 'dark'
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const canTransition = typeof document !== 'undefined' && document.startViewTransition && !reduced

  if (!canTransition) {
    screenTheme.value = next
    return
  }

  try {
    const transition = document.startViewTransition(async () => {
      screenTheme.value = next
      await nextTick()
    })
    await transition.finished
  } catch {
    screenTheme.value = next
  }
}
