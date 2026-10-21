<script setup>
import AnimatedStatistic from './AnimatedStatistic.vue'

defineProps({
  icon: {
    type: [Object, Function],
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
  tone: {
    type: String,
    default: 'cyan'
  }
})
</script>

<template>
  <article
    class="flex h-full min-h-0 min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-md border border-line-muted bg-surface-kpi px-2 py-1.5 text-center shadow-[inset_0_0_1rem_rgba(39,137,211,0.08)]"
  >
    <div
      :class="{
        'text-accent': tone === 'cyan',
        'text-chart-orange': tone === 'orange',
        'text-chart-yellow': tone === 'yellow',
      }"
      class="mx-auto grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle,_#174b69,_#103246)] text-base shadow-[0_0_1rem_rgba(31,172,235,0.18)]"
    >
      <component :is="icon" class="h-4 w-4" />
    </div>
    <div class="min-h-0 text-xs leading-4 text-slate-300">
      {{ label }}
      <small v-if="sub" class="block text-base text-muted">{{ sub }}</small>
    </div>
    <AnimatedStatistic class="block text-lg leading-6 text-white" :value="value" />
  </article>
</template>
