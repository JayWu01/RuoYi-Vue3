<script setup>
import { useFullscreen } from '@vueuse/core'
import { ref, shallowRef, watch } from 'vue'
import ScreenAdapter from './components/ScreenAdapter.vue'
import ScreenHeader from './components/ScreenHeader.vue'
import SubBureau from './unit/SubBureau.vue'
import SWAT from './unit/SWAT.vue'

const { isFullscreen, toggle } = useFullscreen(undefined, { autoExit: true })

const activePanel = shallowRef('swat')
const swatRef = ref(null)
const loading = ref(false)
const updateTime = shallowRef('-')

// 切换面板时先清空上一个面板回传的状态，避免页头显示其他单位的数据
watch(activePanel, () => {
  loading.value = false
  updateTime.value = '-'
})

const exportData = () => {
  swatRef.value?.exportData()
}
</script>

<template>
  <div class="dashboard h-screen w-full bg-canvas font-ui text-content">
    <ScreenAdapter :width="1920" :height="1080">
      <div class="flex h-full w-full flex-col">
        <ScreenHeader
          v-model:panel="activePanel"
          :update-time="updateTime"
          :loading="loading"
          :fullscreen="isFullscreen"
          :exportable="activePanel === 'swat'"
          @fullscreen="toggle"
          @export="exportData"
        />

        <SWAT
          v-if="activePanel === 'swat'"
          ref="swatRef"
          @loading-change="loading = $event"
          @update-time-change="updateTime = $event"
        />
        <SubBureau v-else />
      </div>
    </ScreenAdapter>
  </div>
</template>
