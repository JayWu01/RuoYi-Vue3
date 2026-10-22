<script setup>
import { useFullscreen } from '@vueuse/core'
import { onBeforeUnmount, ref, shallowRef, watch, watchEffect } from 'vue'
import ScreenAdapter from './components/ScreenAdapter.vue'
import ScreenHeader from './components/ScreenHeader.vue'
import { toggleScreenTheme, useScreenTheme } from './composables/useScreenTheme'
import SubBureau from './unit/SubBureau.vue'
import SWAT from './unit/SWAT.vue'

const { isFullscreen, toggle } = useFullscreen(undefined, { autoExit: true })
const { theme } = useScreenTheme()

const activePanel = shallowRef('swat')
const swatRef = ref(null)
const subBureauRef = ref(null)
const loading = ref(false)
const updateTime = shallowRef('-')
const filterOpen = ref(false)
const filterSummary = ref('')

// 切换面板时先清空上一个面板回传的状态，避免页头显示其他单位的数据
watch(activePanel, () => {
  loading.value = false
  updateTime.value = '-'
  filterOpen.value = false
  filterSummary.value = ''
})

watchEffect(() => {
  document.documentElement.dataset.screenTheme = theme.value
})

onBeforeUnmount(() => {
  delete document.documentElement.dataset.screenTheme
})

const handleFilterChange = ({ open, summary }) => {
  filterOpen.value = open
  filterSummary.value = summary
}

const toggleFilter = () => {
  if (activePanel.value === 'swat') {
    swatRef.value?.toggleFilter()
    return
  }

  subBureauRef.value?.toggleFilter()
}

const reloadActive = () => {
  if (activePanel.value === 'swat') {
    swatRef.value?.reloadAll()
    return
  }

  subBureauRef.value?.reloadAll()
}

const exportData = () => {
  if (activePanel.value === 'swat') {
    swatRef.value?.exportData()
  }
}
</script>

<template>
  <div class="dashboard h-screen w-full" :data-theme="theme">
    <ScreenAdapter v-slot="{ enabled }" :width="1920" :height="1080">
      <div
        class="flex w-full flex-col overflow-x-hidden font-ui text-scr-fg"
        :class="enabled ? 'h-full' : 'min-h-screen lg:h-screen lg:overflow-y-auto'"
      >
        <ScreenHeader
          v-model:panel="activePanel"
          :update-time="updateTime"
          :loading="loading"
          :fullscreen="isFullscreen"
          :theme="theme"
          :filter-open="filterOpen"
          :filter-summary="filterSummary"
          :exportable="activePanel === 'swat'"
          @fullscreen="toggle"
          @refresh="reloadActive"
          @toggle-theme="toggleScreenTheme"
          @toggle-filter="toggleFilter"
          @export="exportData"
        />

        <SWAT
          v-if="activePanel === 'swat'"
          ref="swatRef"
          @loading-change="loading = $event"
          @update-time-change="updateTime = $event"
          @filter-change="handleFilterChange"
        />
        <SubBureau
          v-else
          ref="subBureauRef"
          @loading-change="loading = $event"
          @filter-change="handleFilterChange"
        />
      </div>
    </ScreenAdapter>
  </div>
</template>
