<script setup>
import { ArrowDown, ArrowUp } from '@lucide/vue'
import { computed } from 'vue'
import AnimatedStatistic from './AnimatedStatistic.vue'

const props = defineProps({
  value: {
    type: [String, Number],
    default: '-'
  },
  up: {
    type: Boolean,
    default: true
  },
  showDirection: {
    type: Boolean,
    default: false
  }
})

const rawValue = computed(() => typeof props.value === 'number' ? props.value.toString() : props.value)
const hasDirection = computed(() => /^[↑↓]/.test(rawValue.value))
const shouldShowDirection = computed(() => hasDirection.value || (props.showDirection && rawValue.value !== '-'))
const isUp = computed(() => rawValue.value.startsWith('↓') ? false : rawValue.value.startsWith('↑') ? true : props.up)
// const displayValue = computed(() => typeof rawValue.value === 'string' ? rawValue.value.replace(/^[↑↓]\s*/, '') : rawValue.value)
// 替换原有的 displayValue
const displayValue = computed(() => {
  // 1. 处理非字符串和数字的异常情况
  if (typeof rawValue.value !== 'string' && typeof rawValue.value !== 'number') {
    return rawValue.value
  }

  // 2. 去掉可能存在的方向符号（↑↓）、空格和千分位逗号
  let str = String(rawValue.value).replace(/^[↑↓\s]+/, '').replace(/,/g, '')

  // 3. 判断是否包含百分号，并提取纯数字
  const hasPercent = str.includes('%')
  const num = parseFloat(str.replace('%', ''))

  // 4. 如果解析失败（比如传了 '-'），原样返回
  if (isNaN(num)) return rawValue.value

  // 5. 统一保留 1 位小数（消除 100.00% 和 44.400000% 这种多余位数）
  let formatted = num.toFixed(1)

  // 6. 补全百分号
  if (hasPercent) formatted += '%'

  return formatted
})
</script>

<template>
  <div class="inline-flex items-center gap-1 whitespace-nowrap">
    <component
      :is="isUp ? ArrowUp : ArrowDown"
      v-if="shouldShowDirection"
      :size="18"
      :stroke-width="3"
    />
    <AnimatedStatistic :value="displayValue" />
  </div>
</template>
