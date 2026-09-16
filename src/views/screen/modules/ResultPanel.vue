<script setup>
import { Medal, Target, Users } from '@lucide/vue'
import ResultCard from '../components/ResultCard.vue'
import ScreenPanel from '../components/ScreenPanel.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const isUp = value => !value?.startsWith('-')
</script>

<template>
  <ScreenPanel title="战果类数据">
    <div class="grid h-full min-h-0 grid-cols-3 gap-2 p-2 max-sm:grid-cols-1">
      <ResultCard
        :icon="Target"
        label="抓获网逃数"
        tone="cyan"
        :value="props.data.netFugitiveCount"
        :rate="props.data.netFugitiveRatio"
        :up="isUp(props.data.netFugitiveRatio)"
      />
      <ResultCard
        :icon="Users"
        label="抓获团伙数"
        tone="orange"
        :value="props.data.gangCount"
        :rate="props.data.gangRatio"
        :up="isUp(props.data.gangRatio)"
      />
      <ResultCard
        :icon="Medal"
        label="抓获现行"
        tone="yellow"
        :value="props.data.currentArrestMinor"
        :rate="props.data.currentArrestMinorRatio"
        :up="isUp(props.data.currentArrestMinorRatio)"
      />
    </div>
  </ScreenPanel>
</template>
