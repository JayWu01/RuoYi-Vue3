import { nextTick, ref, watch } from 'vue'
import { screenTheme } from './useScreenTheme'

/**
 * 图表调色板 —— 唯一源是 styles/tokens.css。
 * vccs 需要具体色值画 SVG，这里在主题切换后从 html 上读取语义令牌，
 * 不再在 JS 里维护第二份十六进制色表。
 */

const createEmptyPalette = () => ({
  accent: '',
  series: [],
  areaAlpha: 0,
  barAlpha: 0,
  text3: '',
  axisLine: '',
  splitLine: '',
  axisPointer: '',
  legendInactive: '',
  brushFill: '',
  brushStroke: '',
  levels: { red: '', orange: '', yellow: '', blue: '', gray: '' }
})

const palette = ref(createEmptyPalette())

const readToken = (styles, name) => styles.getPropertyValue(name).trim()
const readNumber = (styles, name) => Number(readToken(styles, name)) || 0

function readPalette() {
  if (typeof document === 'undefined') {
    return createEmptyPalette()
  }

  const styles = getComputedStyle(document.documentElement)

  return {
    accent: readToken(styles, '--scr-accent'),
    series: [1, 2, 3, 4, 5].map(index => readToken(styles, `--scr-chart-${index}`)),
    areaAlpha: readNumber(styles, '--scr-chart-area-alpha'),
    barAlpha: readNumber(styles, '--scr-chart-bar-alpha'),
    text3: readToken(styles, '--scr-text-3'),
    axisLine: readToken(styles, '--scr-chart-axis'),
    splitLine: readToken(styles, '--scr-chart-grid'),
    axisPointer: readToken(styles, '--scr-chart-cursor'),
    legendInactive: readToken(styles, '--scr-chart-inactive'),
    brushFill: readToken(styles, '--scr-chart-brush-fill'),
    brushStroke: readToken(styles, '--scr-chart-brush-stroke'),
    levels: {
      red: readToken(styles, '--scr-level-red'),
      orange: readToken(styles, '--scr-level-orange'),
      yellow: readToken(styles, '--scr-level-yellow'),
      blue: readToken(styles, '--scr-level-blue'),
      gray: readToken(styles, '--scr-level-gray')
    }
  }
}

palette.value = readPalette()

const refresh = () => {
  palette.value = readPalette()
}

let hydrated = false

watch(screenTheme, async () => {
  await nextTick()
  refresh()
}, { flush: 'post' })

export function useScreenPalette() {
  // 模块可能早于路由样式注入执行，首次使用时再读一次，并在下一帧兜底
  if (!hydrated) {
    hydrated = true
    refresh()
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(refresh)
    }
  }

  return palette
}
