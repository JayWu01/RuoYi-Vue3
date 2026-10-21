<script setup>
import { computed } from 'vue'
import { isTrendUp } from '../utils/trend'
import AnimatedStatistic from './AnimatedStatistic.vue'
import TrendValue from './TrendValue.vue'

const props = defineProps({
  icon: {
    type: [Object, Function],
    required: true
  },
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
  tone: {
    type: String,
    default: 'cyan'
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
  <article class="kpi" :class="`tone-${tone}`">
    <div class="kpi-top">
      <span class="kpi-label">{{ title }}</span>
      <component :is="icon" class="kpi-ico" :size="14" :stroke-width="2" aria-hidden="true" />
    </div>

    <AnimatedStatistic class="kpi-value" :value="value" :loading="loading" />

    <div class="kpi-delta">
      <span>{{ note }}</span>
      <TrendValue :value="rateText" :up="isUp" :show-direction="hasRate" :class="rateTone" />
    </div>
  </article>
</template>
