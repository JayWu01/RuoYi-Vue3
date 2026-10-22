<script setup>
import { computed, ref, watch } from 'vue'
import RollingNumber from './RollingNumber.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  value: {
    type: [String, Number],
    default: '-'
  },
  precision: {
    type: Number,
    default: null
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  valueStyle: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const rawValue = computed(() => (typeof props.value === 'number' ? props.value.toString() : props.value))
const normalizedValue = computed(() => (typeof rawValue.value === 'string'
  ? rawValue.value.replace(/^[↑↓]\s*/, '')
  : rawValue.value))

const numericValue = computed(() => {
  const value = Number.parseFloat(normalizedValue.value?.replaceAll(',', '') ?? '')
  return Number.isFinite(value) ? value : null
})

const decimalLength = computed(() => {
  const match = String(normalizedValue.value ?? '').replaceAll(',', '').match(/\.(\d+)/)
  return match?.[1]?.length ?? 0
})

const precision = computed(() => props.precision ?? decimalLength.value)
const suffix = computed(() => props.suffix || (rawValue.value?.includes('%') ? '%' : ''))

const numberFormatter = computed(() => new Intl.NumberFormat('en-US', {
  minimumFractionDigits: precision.value,
  maximumFractionDigits: precision.value
}))

const displayText = computed(() => {
  if (numericValue.value === null) {
    return String(rawValue.value ?? '')
  }
  return `${props.prefix}${numberFormatter.value.format(numericValue.value)}${suffix.value}`
})

const rollSeed = ref(0)
watch(() => props.loading, (loading, previous) => {
  if (previous && !loading) {
    rollSeed.value += 1
  }
})
</script>

<template>
  <span
    v-bind="$attrs"
    class="font-numeric tabular-nums"
    :class="{ 'animate-pulse': loading }"
    :style="valueStyle"
  >
    <span class="sr-only">{{ displayText }}</span>
    <RollingNumber :value="displayText" :roll-seed="rollSeed" />
  </span>
</template>
