<script setup>
import AnimatedStatistic from './AnimatedStatistic.vue'
import TrendValue from './TrendValue.vue'

defineProps({
  icon: {
    type: String,
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
  up: {
    type: Boolean,
    default: true
  },
  tone: {
    type: String,
    default: 'cyan'
  }
})
</script>

<template>
  <article
    class="relative grid h-full min-h-0 min-w-0 grid-cols-[auto_1fr] items-center gap-3 overflow-hidden rounded-md border border-line-muted bg-surface-kpi px-3 py-2 shadow-[inset_0_0_1rem_rgba(39,137,211,0.08)]"
  >
    <div
      :class="{
        'text-accent': tone === 'cyan',
        'text-violet-300': tone === 'violet',
        'text-chart-green': tone === 'green',
      }"
      class="grid size-11 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle,_#174b69,_#103246)] text-xl shadow-[0_0_1rem_rgba(31,172,235,0.18)]"
    >
      <component :is="icon" class="h-6 w-6" :stroke-width="2.5" />
    </div>
    <div class="min-w-0">
      <div class="text-sm leading-5 text-slate-300">
        {{ title }}
      </div>
      <AnimatedStatistic class="block text-3xl leading-8 tracking-wider text-white" :value="value" />
      <div class="mt-1 flex items-center gap-1 whitespace-nowrap text-xs leading-4 text-muted">
        {{ note }}
        <TrendValue
          :value="rate"
          :up="up"
          show-direction
          :class="up ? 'font-bold text-chart-red' : 'font-bold text-success'"
        />
      </div>
    </div>
  </article>
</template>
