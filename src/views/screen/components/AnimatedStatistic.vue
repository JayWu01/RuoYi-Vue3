<script setup>
import { TransitionPresets, useTransition } from '@vueuse/core'
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
  }
})

const rawValue = computed(() => typeof props.value === 'number' ? props.value.toString() : props.value)
const normalizedValue = computed(() => typeof rawValue.value === 'string' ? rawValue.value?.replace(/^[↑↓]\s*/, '') : rawValue.value)

const numericValue = computed(() => {
  const value = Number.parseFloat(normalizedValue.value?.replaceAll(',', '') ?? '')
  return Number.isFinite(value) ? value : null
})
const decimalLength = computed(() => {
  const match = String(normalizedValue.value ?? '').replaceAll(',', '').match(/\.(\d+)/)
  return match?.[1]?.length ?? 0
})
const statisticPrecision = computed(() => props.precision ?? decimalLength.value)
const statisticSuffix = computed(() => props.suffix || (rawValue.value?.includes('%') ? '%' : ''))
const statisticRootStyle = {
  '--el-statistic-content-color': 'inherit',
  '--el-statistic-content-font-size': 'inherit',
  '--el-statistic-content-font-weight': 'inherit'
}
const statisticNumberStyle = computed(() => ({
  color: 'inherit',
  lineHeight: 'inherit',
  ...props.valueStyle
}))

const sourceValue = shallowRef(numericValue.value ?? 0)
const animatedValue = useTransition(sourceValue, {
  duration: 700,
  easing: TransitionPresets.easeOutCubic
})

watch(numericValue, (value) => {
  sourceValue.value = value ?? 0
})
</script>

<template>
  <el-statistic
    v-if="numericValue !== null"
    v-bind="$attrs"
    class="tabular-nums"
    :style="statisticRootStyle"
    :value="animatedValue"
    :precision="statisticPrecision"
    :prefix="prefix"
    :suffix="statisticSuffix"
    :value-style="statisticNumberStyle"
  />
  <span v-else v-bind="$attrs" class="tabular-nums">{{ rawValue }}</span>
</template>
