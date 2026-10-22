<script setup>
import { useFullscreen } from '@vueuse/core'
import { ref, shallowRef } from 'vue'
import ScreenHeader from './components/ScreenHeader.vue'
import SWAT from './unit/SWAT.vue'

const { isFullscreen, toggle } = useFullscreen(undefined, { autoExit: true })

const swatRef = ref(null)
const loading = ref(false)
const updateTime = shallowRef('-')

const exportData = () => {
  swatRef.value?.exportData()
}
</script>

<template>
  <div class="dashboard">
    <div class="flex h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-canvas bg-grid bg-grid-size font-ui text-content">
      <ScreenHeader
        :update-time="updateTime"
        :loading="loading"
        :fullscreen="isFullscreen"
        @fullscreen="toggle"
        @export="exportData"
      />

      <SWAT
        ref="swatRef"
        @loading-change="loading = $event"
        @update-time-change="updateTime = $event"
      />
    </div>
  </div>
</template>
