<script setup>
import { Medal, Target, Users } from '@lucide/vue'
import { computed } from 'vue'
import ResultCard from '../components/ResultCard.vue'
import ScreenPanel from '../components/ScreenPanel.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const doorPullText = computed(() => {
  const value = props.data.doorPullAmount
  return value == null || value === '' ? '-' : `￥${value}`
})
</script>

<template>
  <ScreenPanel title="战果类数据">
    <div class="grid h-full min-h-0 grid-cols-3 grid-rows-2 gap-2 p-2 max-sm:grid-cols-2">
      <ResultCard
        :icon="Target"
        label="抓获网逃数"
        tone="cyan"
        :value="props.data.netFugitiveCount"
      />
      <ResultCard
        :icon="Users"
        label="抓获团伙数"
        tone="orange"
        :value="props.data.gangCount"
      />
      <ResultCard
        :icon="Medal"
        label="抓获现行"
        tone="yellow"
        :value="props.data.currentArrestMinor"
      />
      <ResultCard
        :icon="Medal"
        label="检查车辆"
        tone="green"
        :value="props.data.checkCarCount ?? '-'"
      />
      <ResultCard
        :icon="Target"
        label="打开车门数"
        tone="yellow"
        :value="props.data.openDoorCount ?? '-'"
      />
      <ResultCard
        :icon="Target"
        label="发现贵重物品"
        tone="yellow"
        :value="doorPullText"
      />
    </div>
  </ScreenPanel>
</template>
