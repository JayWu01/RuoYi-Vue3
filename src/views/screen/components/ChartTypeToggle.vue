<script setup>
import { ChartColumn, ChartLine } from '@lucide/vue'
import { computed } from 'vue'

const chartType = defineModel({
  type: String,
  required: true
})

const chartOptions = [
  { value: 'line', label: '折线图', icon: ChartLine },
  { value: 'bar', label: '柱状图', icon: ChartColumn }
]

const activeIndex = computed(() => Math.max(
  0,
  chartOptions.findIndex(option => option.value === chartType.value)
))
</script>

<template>
  <div class="chart-toggle" role="group" aria-label="图表类型" :data-active="activeIndex">
    <span class="chart-toggle-thumb" aria-hidden="true" />
    <button
      v-for="option in chartOptions"
      :key="option.value"
      type="button"
      class="chart-toggle-btn"
      :class="{ 'is-active': chartType === option.value }"
      :aria-label="option.label"
      :aria-pressed="chartType === option.value"
      :title="option.label"
      @click="chartType = option.value"
    >
      <component :is="option.icon" :size="14" :stroke-width="2" aria-hidden="true" />
    </button>
  </div>
</template>
