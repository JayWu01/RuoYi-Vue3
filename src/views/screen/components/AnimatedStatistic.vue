<script setup>
import { TransitionPresets, usePreferredReducedMotion, useTransition } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'

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
const normalizedValue = computed(() => (typeof rawValue.value === 'string' ? rawValue.value?.replace(/^[↑↓]\s*/, '') : rawValue.value))

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

// 数字滚动：系统开启"减少动态效果"时直接跳过补间（duration 0）
const reducedMotion = usePreferredReducedMotion()
const duration = computed(() => (reducedMotion.value === 'reduce' ? 0 : 820))
const sourceValue = shallowRef(numericValue.value ?? 0)
const animatedValue = useTransition(sourceValue, {
  duration,
  easing: TransitionPresets.easeOutExpo
})

watch(numericValue, (value) => {
  sourceValue.value = value ?? 0
})

// 千分位 + 固定小数位（等价 el-statistic 的 group-separator + precision，但零组件实例化）
const numberFormatter = computed(() => new Intl.NumberFormat('en-US', {
  minimumFractionDigits: precision.value,
  maximumFractionDigits: precision.value
}))
const formattedValue = computed(() => {
  const value = animatedValue.value
  return numberFormatter.value.format(value === 0 ? 0 : value)
})
</script>

<template>
  <span
    v-if="numericValue !== null"
    v-bind="$attrs"
    class="tabular-nums"
    :class="{ 'is-refreshing': loading }"
    :aria-busy="loading || undefined"
    :style="valueStyle"
  >
    <span v-if="prefix">{{ prefix }}</span>{{ formattedValue }}<span v-if="suffix">{{ suffix }}</span>
  </span>
  <span
    v-else
    v-bind="$attrs"
    class="tabular-nums"
    :class="{ 'is-refreshing': loading }"
    :aria-busy="loading || undefined"
    :style="valueStyle"
  >{{ rawValue }}</span>
</template>
