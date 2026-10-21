<script setup>
import { ArrowDown, ArrowUp } from '@lucide/vue'
import { computed } from 'vue'
import { isTrendUp } from '../utils/trend'
import AnimatedStatistic from './AnimatedStatistic.vue'

const props = defineProps({
  value: {
    type: [String, Number],
    default: '-'
  },
  up: {
    type: Boolean,
    default: true
  },
  showDirection: {
    type: Boolean,
    default: false
  }
})

const rawValue = computed(() => (typeof props.value === 'number' ? props.value.toString() : props.value))
const hasDirection = computed(() => /^[↑↓]/.test(String(rawValue.value ?? '')))
const shouldShowDirection = computed(() => hasDirection.value || (props.showDirection && rawValue.value !== '-'))
const isUp = computed(() => isTrendUp(rawValue.value, props.up))

const displayValue = computed(() => {
  const value = rawValue.value
  if (typeof value !== 'string' && typeof value !== 'number') {
    return value
  }

  const str = String(value).replace(/^[↑↓\s]+/, '').replaceAll(',', '')
  const hasPercent = str.includes('%')
  const number = Number.parseFloat(str.replace('%', ''))

  if (Number.isNaN(number)) {
    return value
  }

  return `${number.toFixed(1)}${hasPercent ? '%' : ''}`
})
</script>

<template>
  <span class="inline-flex items-center gap-1 whitespace-nowrap">
    <component
      :is="isUp ? ArrowUp : ArrowDown"
      v-if="shouldShowDirection"
      :size="12"
      :stroke-width="2.5"
      aria-hidden="true"
      class="shrink-0"
    />
    <AnimatedStatistic :value="displayValue" />
  </span>
</template>
