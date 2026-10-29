<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: '当前时间'
  }
})

const chars = computed(() => props.value.split(''))
</script>

<template>
  <span
    class="ticking-clock inline-flex items-center whitespace-nowrap font-numeric leading-none tabular-nums"
    role="timer"
    :aria-label="`${label} ${value}`"
  >
    <template v-for="(char, index) in chars" :key="index">
      <span v-if="char === ':'" class="tick-colon inline-block w-[0.52ch] text-center opacity-[0.55]" aria-hidden="true">:</span>
      <span v-else class="tick-cell relative inline-grid h-[1.12em] w-[1ch] place-items-center overflow-hidden" aria-hidden="true">
        <Transition
          enter-active-class="transition duration-scr-base ease-scr-out"
          enter-from-class="opacity-0 translate-y-[0.8em] blur-[2.5px]"
          leave-active-class="transition duration-scr-base ease-scr-out"
          leave-to-class="opacity-0 -translate-y-[0.8em] blur-[2.5px]"
        >
          <span :key="char" class="tick-char [grid-area:1/1] leading-none">{{ char }}</span>
        </Transition>
      </span>
    </template>
  </span>
</template>
