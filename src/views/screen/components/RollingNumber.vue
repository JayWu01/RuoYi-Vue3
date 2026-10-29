<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  rollSeed: {
    type: Number,
    default: 0
  }
})

const chars = computed(() => props.value.split(''))
const isDigit = char => /^\d$/.test(char)
</script>

<template>
  <span class="rolling-number inline-flex items-center whitespace-nowrap font-numeric leading-none tabular-nums" aria-hidden="true">
    <template v-for="(char, index) in chars" :key="index">
      <span
        v-if="isDigit(char)"
        class="digit-cell relative inline-grid h-[1.12em] w-[1ch] place-items-center overflow-hidden"
      >
        <Transition
          enter-active-class="transition duration-scr-base ease-scr-out"
          enter-from-class="opacity-0 translate-y-[0.7em] blur-[2px]"
          leave-active-class="transition duration-scr-base ease-scr-out"
          leave-to-class="opacity-0 -translate-y-[0.7em] blur-[2px]"
        >
          <span :key="`${char}-${rollSeed}`" class="digit-char [grid-area:1/1] leading-none">{{ char }}</span>
        </Transition>
      </span>
      <span v-else class="digit-static inline-block leading-none">{{ char === ' ' ? '\u00A0' : char }}</span>
    </template>
  </span>
</template>
