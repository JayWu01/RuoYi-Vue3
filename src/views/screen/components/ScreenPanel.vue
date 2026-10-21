<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <section
    class="relative box-border flex h-full min-h-0 overflow-hidden rounded-lg bg-surface-border p-px shadow-panel"
  >
    <div class="relative z-panel-content flex min-h-0 flex-1 flex-col overflow-hidden rounded-[0.4375rem] bg-surface">
      <header class="relative z-panel-content flex min-h-12 shrink-0 items-center justify-between gap-x-3 gap-y-2 px-4 pb-2 pt-4">
        <div class="flex min-w-0 max-w-full items-center">
          <span class="mr-2 h-5 w-1 shrink-0 rounded-full bg-accent shadow-[0_0_0.5rem_rgba(32,181,241,0.7)]" />
          <h2 class="m-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold tracking-wide text-white">
            {{ title }}
          </h2>
          <span v-if="unit" class="ml-2 shrink-0 whitespace-nowrap text-[0.6875rem] font-normal text-slate-400">
            {{ unit }}
          </span>
        </div>

        <slot v-if="$slots.actions" name="actions" />
      </header>

      <div class="relative z-panel-content flex min-h-0 min-w-0 flex-1 flex-col">
        <slot />
      </div>
    </div>
  </section>
</template>
