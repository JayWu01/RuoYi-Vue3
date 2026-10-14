<script setup>
import AnimatedStatistic from './AnimatedStatistic.vue'
import TrendValue from './TrendValue.vue'

defineProps({
  icon: {
    type: Object,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  sub: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number],
    default: '-'
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
    class="flex h-full min-h-0 min-w-0 flex-col items-center justify-center overflow-hidden rounded-md border border-line-muted bg-surface-kpi px-2 py-3 text-center shadow-[inset_0_0_1rem_rgba(39,137,211,0.08)]"
  >
    <div
      :class="{
        'text-accent': tone === 'cyan',
        'text-chart-orange': tone === 'orange',
        'text-chart-yellow': tone === 'yellow',
      }"
      class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[radial-gradient(circle,_#174b69,_#103246)] text-2xl shadow-[0_0_1rem_rgba(31,172,235,0.18)]"
    >
      <component :is="icon" class="h-6 w-6" />
    </div>
    <div class="mt-3 min-h-10 text-sm leading-5 text-slate-300">
      {{ label }}
      <small v-if="sub" class="block text-xs text-muted">{{ sub }}</small>
    </div>
    <AnimatedStatistic class="mt-2 block text-3xl leading-9 text-white" :value="value" />
    <div class="mt-1 whitespace-nowrap text-xs text-muted">
      环比
      <TrendValue
        :value="rate"
        :up="up"
        show-direction
        :class="up ? 'font-bold text-chart-red' : 'font-bold text-success'"
      />
    </div>
  </article>
</template>
