<script setup>
import { computed, ref, useTemplateRef } from 'vue'

const props = defineProps({
  actions: {
    type: Array,
    required: true
  },
  defaultKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select'])

const hoveredAction = ref(null)
const focusedAction = ref(null)
const toolbarRef = useTemplateRef('toolbarRef')

const defaultAction = computed(() => props.defaultKey || props.actions[0]?.key || '')
const activeAction = computed(() => focusedAction.value ?? hoveredAction.value ?? defaultAction.value)

const widthClass = computed(() => {
  if (props.actions.length >= 4) {
    return 'w-[172px]'
  }
  if (props.actions.length === 3) {
    return 'w-[140px]'
  }
  return 'w-[108px]'
})

const handleFocusOut = (event) => {
  if (!toolbarRef.value?.contains(event.relatedTarget)) {
    focusedAction.value = null
  }
}

const handleFocus = (event, key) => {
  if (event.target.matches(':focus-visible')) {
    focusedAction.value = key
  }
}
</script>

<template>
  <div
    ref="toolbarRef"
    class="expanding-actions box-border inline-flex h-[34px] shrink-0 items-center justify-between gap-0.5 whitespace-nowrap rounded-full border border-scr-line bg-scr-surface p-[3px] max-[1023px]:h-[34px] max-[768px]:w-auto max-[768px]:justify-center max-[640px]:h-8 max-[640px]:p-0.5"
    :class="widthClass"
    role="group"
    aria-label="页面操作"
    @mouseleave="hoveredAction = null"
    @focusout="handleFocusOut"
  >
    <button
      v-for="action in actions"
      :key="action.key"
      type="button"
      class="expanding-action inline-flex h-[28px] shrink-0 cursor-pointer items-center justify-center gap-0 rounded-full border-0 bg-transparent px-[7px] text-scr-faint transition-all duration-scr-base ease-scr-out hover:text-scr-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--scr-focus)] disabled:cursor-not-allowed disabled:opacity-[0.45] max-[1023px]:h-[26px] max-[768px]:px-1.5 max-[640px]:h-[24px] max-[640px]:px-1"
      :class="activeAction === action.key
        ? 'is-expanded gap-1.5 bg-scr-surface-3 px-2.5 text-scr-fg max-[768px]:gap-0 max-[768px]:bg-transparent max-[768px]:px-1.5 max-[640px]:px-1'
        : ''"
      :aria-label="action.aria"
      :title="action.aria"
      :disabled="action.disabled"
      @mouseenter="hoveredAction = action.key"
      @focus="handleFocus($event, action.key)"
      @click="emit('select', action.key)"
    >
      <Transition
        enter-active-class="transition duration-scr-base ease-scr-out"
        enter-from-class="opacity-0 -rotate-45 scale-75"
        leave-active-class="transition duration-scr-fast ease-in"
        leave-to-class="opacity-0 rotate-45 scale-75"
        mode="out-in"
      >
        <component
          :is="action.icon"
          :key="`${action.key}-${action.label}`"
          :size="15"
          :stroke-width="2"
          class="shrink-0"
          :class="{ 'animate-spin': action.spinning }"
          aria-hidden="true"
        />
      </Transition>

      <span
        class="expanding-action-label inline-block max-w-0 overflow-hidden whitespace-nowrap text-scr-status font-semibold leading-none opacity-0 blur-[2px] transition-all duration-scr-base max-[768px]:hidden"
        :class="activeAction === action.key
          ? 'max-w-10 translate-y-0 opacity-100 blur-none'
          : 'translate-y-[3px]'"
      >
        <Transition
          enter-active-class="transition duration-scr-fast ease-scr-out"
          enter-from-class="opacity-0 translate-y-0.5 blur-[2px]"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="opacity-0 -translate-y-0.5 blur-[2px]"
          mode="out-in"
        >
          <span :key="action.label">{{ action.label }}</span>
        </Transition>
      </span>
    </button>
  </div>
</template>
