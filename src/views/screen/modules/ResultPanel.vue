<script setup>
import { computed } from 'vue'
import ResultCard from '../components/ResultCard.vue'
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

const formatAmount = (value) => {
  const number = Number.parseFloat(String(value).replaceAll(',', '').replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(number)) {
    return String(value)
  }
  return number.toLocaleString('en-US')
}

const doorPullText = computed(() => {
  const value = props.data.doorPullAmount
  if (value === null || value === undefined || value === '' || value === '-') {
    return '-'
  }
  const amount = formatAmount(value)
  return amount ? `￥${amount}` : '-'
})
</script>

<template>
  <ScreenPanel title="战果类数据" :loading="loading">
    <div class="panel-stack">
      <Transition name="scr-swap">
        <div v-if="showSkeleton" key="skeleton" class="stat-grid" aria-hidden="true">
          <div v-for="index in 6" :key="index" class="stat-tile">
            <span class="scr-skeleton" style="width: 54px; height: 10px" />
            <span class="scr-skeleton" style="width: 58%; height: 19px; margin-top: 7px" />
          </div>
        </div>

        <div v-else key="content" class="stat-grid">
          <ResultCard label="抓获网逃数" tone="cyan" :value="props.data.netFugitiveCount" :loading="loading" />
          <ResultCard label="抓获团伙数" tone="green" :value="props.data.gangCount" :loading="loading" />
          <ResultCard label="抓获现行" tone="amber" :value="props.data.currentArrestMinor" :loading="loading" />
          <ResultCard label="检查车辆" tone="blue" :value="props.data.checkCarCount ?? '-'" :loading="loading" />
          <ResultCard label="打开车门数" tone="purple" :value="props.data.openDoorCount ?? '-'" :loading="loading" />
          <ResultCard label="发现贵重物品" tone="yellow" :value="doorPullText" :loading="loading" />
        </div>
      </Transition>
    </div>
  </ScreenPanel>
</template>
