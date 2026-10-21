<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <section class="glass-card h-full min-h-0 min-w-0" :aria-busy="loading || undefined">
    <span v-if="loading" class="panel-progress" aria-hidden="true" />

    <header class="card-head">
      <h3>{{ title }}</h3>
      <span v-if="unit" class="unit">{{ unit }}</span>
      <div v-if="$slots.meta || $slots.actions" class="meta">
        <slot name="meta" />
        <slot name="actions" />
      </div>
    </header>

    <div class="card-body">
      <slot />
    </div>
  </section>
</template>
