<script setup>
import { computed } from 'vue'
import { statusLabel, statusType } from '../constants'

const props = defineProps({
  value: { type: [String, Number], default: '' },
  map: { type: Object, required: true }
})

const label = computed(() => statusLabel(props.map, props.value))
const type = computed(() => statusType(props.map, props.value))
</script>

<template>
  <span class="equip-tag" :class="`equip-tag--${type}`">{{ label }}</span>
</template>
