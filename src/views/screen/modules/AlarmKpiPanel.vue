<script setup>
import { Bell, ClipboardList, Phone, Share2 } from '@lucide/vue'
import KpiCard from '../components/KpiCard.vue'
import ScreenPanel from '../components/ScreenPanel.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

/**
 * 格式化环比百分比，0.000000% 转为 0%，其他原样输出
 * @param {string} rateStr 后端传入的带%字符串，如 "0.000000%"、"12.3456%"
 * @returns {string}
 */
function formatRate(rateStr) {
  if (rateStr === null || rateStr === undefined || rateStr === '') return rateStr

  // 去掉百分号、正负号、方向符号，解析成数字
  const num = parseFloat(String(rateStr).replace('%', '').replace(/^[↑↓+-]\s*/, ''))

  // 解析失败（比如传了 '-'），原样返回
  if (isNaN(num)) return rateStr

  // 近似等于 0（解决浮点精度问题）
  if (Math.abs(num) < 1e-6) {
    return '0%'
  }

  // 统一保留 1 位小数，正数补 + 号
  const sign = num > 0 ? '+' : '-'
  return `${sign}${Math.abs(num).toFixed(1)}%`
}
</script>

<template>
  <ScreenPanel title="接处警数据">
    <div class="grid h-full min-h-0 grid-cols-2 grid-rows-2 gap-2 p-2 max-sm:grid-cols-1 max-sm:grid-rows-4">
      <KpiCard
        :icon="ClipboardList"
        title="总数"
        tone="cyan"
        :value="props.data.totalAlarm"
        :rate="formatRate(props.data.totalAlarmRatio)"
      />
      <KpiCard
        :icon="Bell"
        title="自接警数据"
        tone="violet"
        :value="props.data.selfAlarm"
        :rate="formatRate(props.data.selfAlarmRatio)"
      />
      <KpiCard
        :icon="Share2"
        title="转警数据"
        tone="green"
        :value="props.data.transferAlarm"
        :rate="formatRate(props.data.transferAlarmRatio)"
      />
      <KpiCard
        :icon="Phone"
        title="110派警"
        tone="cyan"
        :value="props.data.policeDispatch"
        :rate="formatRate(props.data.policeDispatchRatio)"
      />
    </div>
  </ScreenPanel>
</template>
