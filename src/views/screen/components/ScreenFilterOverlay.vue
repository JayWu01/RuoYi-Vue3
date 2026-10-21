<script setup>
import { X } from '@lucide/vue'
import { useEventListener, usePreferredReducedMotion } from '@vueuse/core'
import { AnimatePresence, motion } from 'motion-v'
import { computed, nextTick, useTemplateRef, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const reducedMotion = usePreferredReducedMotion()
const panelRef = useTemplateRef('panelRef')
let lastFocused = null

const fadeTransition = computed(() => ({
  duration: reducedMotion.value === 'reduce' ? 0 : 0.22
}))

const panelTransition = computed(() => (reducedMotion.value === 'reduce'
  ? { duration: 0 }
  : { type: 'spring', stiffness: 460, damping: 38, mass: 0.7 }))

watch(() => props.open, async (open) => {
  if (open) {
    lastFocused = document.activeElement
    await nextTick()
    panelRef.value?.focus()
    return
  }

  lastFocused?.focus?.()
  lastFocused = null
})

useEventListener(window, 'keydown', (event) => {
  if (props.open && event.key === 'Escape') {
    emit('close')
  }
})
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="open"
      key="scrim"
      class="filter-scrim"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="fadeTransition"
      @click="emit('close')"
    />

    <motion.div
      v-if="open"
      key="panel"
      class="filter-panel"
      :initial="{ opacity: 0, y: -12, scale: 0.985 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :exit="{ opacity: 0, y: -8, scale: 0.99 }"
      :transition="panelTransition"
    >
      <div
        ref="panelRef"
        class="filter-panel-inner"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="screen-filter-title"
      >
        <header class="filter-panel-head">
          <div>
            <h2 id="screen-filter-title">
              筛选条件
            </h2>
            <p>调整日期范围、基层单位与统计周期</p>
          </div>
          <button
            type="button"
            class="icon-btn"
            aria-label="关闭筛选"
            @click="emit('close')"
          >
            <X :size="15" :stroke-width="2" aria-hidden="true" />
          </button>
        </header>

        <slot />
      </div>
    </motion.div>
  </AnimatePresence>
</template>
