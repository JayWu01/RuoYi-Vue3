<script setup>
import { Bell, ClipboardList, Phone, Share2 } from '@lucide/vue'
import { computed } from 'vue'
import KpiCard from '../components/KpiCard.vue'
import ScreenPanel from '../components/ScreenPanel.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const hasData = computed(() => Object.keys(props.data ?? {}).length > 0)
const showSkeleton = computed(() => props.loading && !hasData.value)

/**
 * 格式化环比百分比，0.000000% 转为 0%，其他原样输出
 * @param {string} rateStr 后端传入的带%字符串，如 "0.000000%"、"12.3456%"
 * @returns {string}
 */
function formatRate(rateStr) {
  if (rateStr === null || rateStr === undefined || rateStr === '') return rateStr

  const num = Number.parseFloat(String(rateStr).replace('%', '').replace(/^[↑↓+-]\s*/, ''))

  if (Number.isNaN(num)) return rateStr

  if (Math.abs(num) < 1e-6) {
    return '0%'
  }

  const sign = num > 0 ? '+' : '-'
  return `${sign}${Math.abs(num).toFixed(1)}%`
}
</script>

<template>
  <ScreenPanel title="接处警数据" unit="(单位：起)" :loading="loading">
    <div class="panel-stack">
      <Transition name="scr-swap">
        <div v-if="showSkeleton" key="skeleton" class="kpi-grid" aria-hidden="true">
          <div v-for="index in 4" :key="index" class="kpi">
            <div class="kpi-top">
              <span class="scr-skeleton" style="width: 58px; height: 10px" />
              <span class="scr-skeleton is-square" style="width: 16px; height: 16px" />
            </div>
            <span class="scr-skeleton" style="width: 72%; height: 25px; margin-top: 3px" />
            <span class="scr-skeleton" style="width: 84px; height: 9px; margin-top: 10px" />
          </div>
        </div>

        <div v-else key="content" class="kpi-grid">
          <KpiCard
            :icon="ClipboardList"
            title="总数"
            tone="cyan"
            :value="props.data.totalAlarm"
            :rate="formatRate(props.data.totalAlarmRatio)"
            :loading="loading"
          />
          <KpiCard
            :icon="Bell"
            title="自接警数据"
            tone="violet"
            :value="props.data.selfAlarm"
            :rate="formatRate(props.data.selfAlarmRatio)"
            :loading="loading"
          />
          <KpiCard
            :icon="Share2"
            title="转警数据"
            tone="green"
            :value="props.data.transferAlarm"
            :rate="formatRate(props.data.transferAlarmRatio)"
            :loading="loading"
          />
          <KpiCard
            :icon="Phone"
            title="110派警"
            tone="blue"
            :value="props.data.policeDispatch"
            :rate="formatRate(props.data.policeDispatchRatio)"
            :loading="loading"
          />
        </div>
      </Transition>
    </div>
  </ScreenPanel>
</template>
