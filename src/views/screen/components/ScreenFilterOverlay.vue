<script setup>
import { X } from '@lucide/vue'
import { useEventListener } from '@vueuse/core'
import { AnimatePresence, motion } from 'motion-v'
import { nextTick, useTemplateRef, watch } from 'vue'
import { useScreenMotion } from '../motion'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const { modalTransition, fadeTransition } = useScreenMotion()
const panelRef = useTemplateRef('panelRef')
let lastFocused = null

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

const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const trapTab = (event) => {
  const panel = panelRef.value
  if (!panel) {
    return
  }

  const nodes = [...panel.querySelectorAll(focusableSelector)].filter(el => el.offsetParent !== null)
  if (!nodes.length) {
    return
  }

  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  const active = document.activeElement

  if (event.shiftKey && (active === first || active === panel)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

useEventListener(window, 'keydown', (event) => {
  if (!props.open) {
    return
  }

  if (event.key === 'Escape') {
    emit('close')
    return
  }

  if (event.key === 'Tab') {
    trapTab(event)
  }
}, { capture: true })
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
      :transition="modalTransition"
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
