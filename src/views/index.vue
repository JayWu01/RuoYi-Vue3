<script setup>
import { Monitor, Warehouse } from '@lucide/vue'

function openPoliceScreen() {
  window.open('/screen', '_blank')
}

function openEquipWarehouse() {
  window.open('/warehouse', '_blank')
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
        <el-col :span="8">
          <el-button
            type="success"
            size="large"
            :icon="Warehouse"
            class="w-full h-[90px] text-lg"
            @click="openEquipWarehouse"
          >
            警用装备仓库管理
          </el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
