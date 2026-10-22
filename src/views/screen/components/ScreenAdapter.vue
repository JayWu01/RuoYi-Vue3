<script setup>
import { useElementSize } from '@vueuse/core'
import { computed, provide, useTemplateRef } from 'vue'
import { screenScaleKey } from '../composables/useScreenScale'

const props = defineProps({
  width: {
    type: Number,
    default: 1920
  },
  height: {
    type: Number,
    default: 1080
  },
  // 视口窄于该宽度时不做缩放，回退到原有的流式布局
  minWidth: {
    type: Number,
    default: 1280
  }
})

const hostRef = useTemplateRef('hostRef')
const { width: hostWidth, height: hostHeight } = useElementSize(hostRef)

// 首帧还没测量到尺寸时按视口宽度估算，避免先渲染流式布局再跳变
const availableWidth = computed(() => hostWidth.value || window.innerWidth)
const availableHeight = computed(() => hostHeight.value || window.innerHeight)

const enabled = computed(() => availableWidth.value >= props.minWidth)

const scale = computed(() => {
  if (!enabled.value) {
    return 1
  }
  return Math.min(availableWidth.value / props.width, availableHeight.value / props.height)
})

provide(screenScaleKey, scale)

const canvasStyle = computed(() => (enabled.value
  ? {
      width: `${props.width}px`,
      height: `${props.height}px`,
      transform: `translate(-50%, -50%) scale(${scale.value})`
    }
  : { width: '100%' }))

// 网格装饰铺满整个视口，留黑边时也能延续到画布外，且间距跟随内容一起缩放
const gridSize = computed(() => `calc(1.75rem * ${scale.value})`)
const hostStyle = computed(() => ({
  backgroundSize: `${gridSize.value} ${gridSize.value}, ${gridSize.value} ${gridSize.value}, 100% 100%`
}))
</script>

<template>
  <div
    ref="hostRef"
    class="relative h-full w-full bg-canvas bg-grid"
    :class="enabled ? 'overflow-hidden' : 'overflow-y-auto'"
    :style="hostStyle"
  >
    <div
      :class="enabled ? 'absolute left-1/2 top-1/2 origin-center' : 'min-h-full w-full'"
      :style="canvasStyle"
    >
      <slot />
    </div>
  </div>
</template>
