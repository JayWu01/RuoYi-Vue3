<script setup>
import { ChartColumn, ChartLine } from '@lucide/vue'

const chartType = defineModel({
  type: String,
  required: true
})

const chartOptions = [
  { value: 'line', label: '折线图', icon: ChartLine },
  { value: 'bar', label: '柱状图', icon: ChartColumn }
]
</script>

<template>
  <div class="inline-flex shrink-0 items-center gap-1 p-0.5" role="group" aria-label="图表类型">
    <button
      v-for="option in chartOptions"
      :key="option.value"
      type="button"
      :aria-label="option.label"
      :aria-pressed="chartType === option.value"
      :title="option.label"
      class="!m-0 !grid !h-6 !w-6 !place-items-center !rounded !border-0 !bg-transparent !p-0 !text-[#b7cfdd] transition-colors hover:!bg-field hover:!text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
      :class="{ '!bg-field !text-accent': chartType === option.value }"
      @click="chartType = option.value"
    >
      <component :is="option.icon" :size="15" :stroke-width="1.8" aria-hidden="true" />
    </button>
  </div>
</template>
