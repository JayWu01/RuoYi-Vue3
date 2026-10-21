<script setup>
import { setLucideProps } from '@lucide/vue'
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'

setLucideProps({
  size: '1em',
  strokeWidth: 2
})

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>

<template>
  <router-view />
</template>
