<script setup>
import { Bell, ClipboardList, Percent, Phone, Share2 } from '@lucide/vue'
import KpiCard from '../components/KpiCard.vue'
import ScreenPanel from '../components/ScreenPanel.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <ScreenPanel title="接处警数据">
    <div class="grid h-full min-h-0 grid-cols-6 grid-rows-2 gap-2 p-2 max-sm:grid-cols-1 max-sm:grid-rows-5">
      <KpiCard
        class="col-span-3 max-sm:col-span-1"
        :icon="ClipboardList"
        title="总数"
        tone="cyan"
        :value="props.data.totalAlarm"
      />
      <KpiCard
        class="col-span-3 max-sm:col-span-1"
        :icon="Percent"
        title="自处率"
        tone="cyan"
        value="null"
      />
      <KpiCard
        class="col-span-2 max-sm:col-span-1"
        :icon="Bell"
        title="自接警数据"
        tone="violet"
        :value="props.data.selfAlarm"
      />
      <KpiCard
        class="col-span-2 max-sm:col-span-1"
        :icon="Share2"
        title="转警数据"
        tone="green"
        :value="props.data.transferAlarm"
      />
      <KpiCard
        class="col-span-2 max-sm:col-span-1"
        :icon="Phone"
        title="110派警"
        tone="cyan"
        :value="props.data.policeDispatch"
      />
    </div>
  </ScreenPanel>
</template>
