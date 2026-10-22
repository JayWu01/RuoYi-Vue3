<script setup>
import { computed } from 'vue'
import { isTrendUp } from '../utils/trend'
import AnimatedStatistic from './AnimatedStatistic.vue'
import TrendValue from './TrendValue.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: '-'
  },
  note: {
    type: String,
    default: '环比'
  },
  rate: {
    type: [String, Number],
    default: '-'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const isUp = computed(() => isTrendUp(props.rate))
const hasRate = computed(() => {
  const text = String(props.rate ?? '').trim()
  return text !== '' && text !== '-'
})
// 无有效环比数据时只展示占位符，不显示涨跌箭头
const rateText = computed(() => (hasRate.value ? props.rate : '—'))
const rateTone = computed(() => {
  if (!hasRate.value) {
    return ''
  }
  return isUp.value ? 'trend-up-bad' : 'trend-down-good'
})
</script>

<template>
  <article class="kpi" :aria-busy="loading || undefined">
    <span class="kpi-label">{{ title }}</span>

    <AnimatedStatistic class="kpi-value" :value="value" :loading="loading" />

    <div class="kpi-delta">
      <span>{{ note }}</span>
      <TrendValue :value="rateText" :up="isUp" :show-direction="hasRate" :class="rateTone" />
    </div>
  </article>
</template>
