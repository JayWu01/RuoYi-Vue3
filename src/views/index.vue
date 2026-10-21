<script setup>
import { Monitor } from '@lucide/vue'

function openPoliceScreen() {
  window.open('/screen', '_blank')
}
</script>

<template>
  <div class="app-container home">
    <div class="mt-10">
      <el-row :gutter="30">
        <el-col :span="8">
          <el-button
            type="primary"
            size="large"
            :icon="Monitor"
            class="w-full h-[90px] text-lg"
            @click="openPoliceScreen"
          >
            街面警务站大数据屏
          </el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
