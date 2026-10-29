<script setup>
import { TriangleAlert } from '@lucide/vue'
import { motion } from 'motion-v'
import { computed } from 'vue'
import { useScreenMotion } from '../motion'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  reveal: {
    type: Boolean,
    default: true
  },
  revealIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['retry'])
const { panelInitial, revealTransition } = useScreenMotion()

const initial = computed(() => (props.reveal ? panelInitial.value : { opacity: 1, y: 0 }))
const transition = computed(() => (props.reveal ? revealTransition(props.revealIndex) : { duration: 0 }))
</script>

<template>
  <motion.section
    class="screen-panel h-full min-h-0 min-w-0"
    :aria-busy="loading || undefined"
    :initial="initial"
    :animate="{ opacity: 1, y: 0 }"
    :transition="transition"
  >
    <span v-if="loading" class="panel-progress" aria-hidden="true" />

    <header class="card-head">
      <h2>{{ title }}</h2>
      <span v-if="unit" class="unit">{{ unit }}</span>
      <div v-if="$slots.meta || $slots.actions" class="meta">
        <slot name="meta" />
        <slot name="actions" />
      </div>
    </header>

    <div v-if="error" class="panel-error" role="status">
      <TriangleAlert :size="13" :stroke-width="2" aria-hidden="true" />
      <span>数据未更新</span>
      <button type="button" class="panel-retry" @click="emit('retry')">
        重试
      </button>
    </div>

    <div class="card-body">
      <slot />
    </div>
  </motion.section>
</template>
