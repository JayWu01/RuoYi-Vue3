<script setup>
import AnimatedStatistic from './AnimatedStatistic.vue'

defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: '-'
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <article class="stat-tile" :aria-busy="loading || undefined">
    <span class="s-label" :title="label">{{ label }}</span>
    <AnimatedStatistic class="s-value" :value="value" :loading="loading" />
  </article>
</template>
