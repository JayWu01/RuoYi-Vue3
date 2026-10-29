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
  },
  // 缩放比过低时同样回退流式，避免字被缩到近距也读不清
  minScale: {
    type: Number,
    default: 0.85
  }
})

const hostRef = useTemplateRef('hostRef')
const { width: hostWidth, height: hostHeight } = useElementSize(hostRef)

// 首帧还没测量到尺寸时按视口宽度估算，避免先渲染流式布局再跳变
const availableWidth = computed(() => hostWidth.value || window.innerWidth)
const availableHeight = computed(() => hostHeight.value || window.innerHeight)

const rawScale = computed(() => Math.min(availableWidth.value / props.width, availableHeight.value / props.height))
const enabled = computed(() => availableWidth.value >= props.minWidth && rawScale.value >= props.minScale)

const scale = computed(() => {
  if (!enabled.value) {
    return 1
  }
  return rawScale.value
})

provide(screenScaleKey, scale)

const canvasStyle = computed(() => (enabled.value
  ? {
      width: `${props.width}px`,
      height: `${props.height}px`,
      transform: `translate(-50%, -50%) scale(${scale.value})`
    }
  : { width: '100%' }))
</script>

<template>
  <div
    ref="hostRef"
    class="screen-adapter relative h-full w-full"
    :data-adapted="enabled ? 'true' : 'false'"
    :class="enabled ? 'overflow-hidden' : 'overflow-y-auto'"
  >
    <div
      :class="enabled ? 'screen-adapter-canvas absolute left-1/2 top-1/2 origin-center' : 'screen-adapter-canvas min-h-full w-full'"
      :style="canvasStyle"
    >
      <slot :enabled="enabled" />
    </div>
  </div>
</template>
