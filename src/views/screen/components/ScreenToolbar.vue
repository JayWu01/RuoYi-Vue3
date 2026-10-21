<script setup>
import { LoaderCircle, RefreshCw, Search } from '@lucide/vue'
import { computed } from 'vue'
import { PERIOD_OPTIONS } from '../constant'

const props = defineProps({
  unitOptions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'reset'])

const model = defineModel({
  type: Object,
  required: true
})

const defaultTime = [
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 1, 1, 23, 59, 59)
]

const dateRange = computed({
  get: () => (model.value.startDate && model.value.endDate
    ? [model.value.startDate, model.value.endDate]
    : null),
  set: (value) => {
    model.value = {
      ...model.value,
      startDate: value?.[0] ?? '',
      endDate: value?.[1] ?? ''
    }
  }
})

const setField = (key, value) => {
  model.value = {
    ...model.value,
    [key]: value
  }
}

const setUnit = (deptId) => {
  const nextDeptId = deptId === '' ? null : deptId
  const unit = props.unitOptions.find(item => item.deptId === nextDeptId)
  model.value = {
    ...model.value,
    deptId: nextDeptId,
    deptName: unit?.deptName
  }
}
</script>

<template>
  <div class="filter-form" role="group" aria-label="筛选条件">
    <div class="filter-grid">
      <div class="filter-field filter-field-range">
        <span class="field-label">日期范围</span>
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="defaultTime"
          clearable
          range-separator="~"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          popper-class="dashboard-popper"
          class="dashboard-date-picker w-full"
        />
      </div>

      <div class="filter-field">
        <span class="field-label">基层单位</span>
        <el-select
          :model-value="model.deptId"
          popper-class="dashboard-popper"
          class="dashboard-select w-full"
          placeholder="全部单位"
          @update:model-value="setUnit"
        >
          <el-option label="全部单位" value="" />
          <el-option
            v-for="unit in unitOptions"
            :key="unit.deptId"
            :label="unit.deptName"
            :value="unit.deptId"
          />
        </el-select>
      </div>

      <div class="filter-field">
        <span class="field-label">统计周期</span>
        <el-segmented
          :model-value="model.statType"
          :options="PERIOD_OPTIONS"
          aria-label="统计周期"
          class="dashboard-period w-full"
          @change="setField('statType', $event)"
        />
      </div>
    </div>

    <div class="filter-actions">
      <span class="filter-hint">应用后将同步刷新全部数据面板</span>

      <el-button
        class="dashboard-action-button"
        :disabled="loading"
        @click="emit('reset')"
      >
        <RefreshCw class="mr-1.5" :size="14" :stroke-width="2" />
        重置
      </el-button>

      <el-button
        class="dashboard-action-button dashboard-action-button-primary"
        :loading="loading"
        :disabled="loading"
        @click="emit('submit')"
      >
        <template #loading>
          <LoaderCircle class="animate-spin" :size="14" :stroke-width="2" />
        </template>
        <Search v-if="!loading" class="mr-1.5" :size="14" :stroke-width="2" />
        {{ loading ? '查询中' : '应用筛选' }}
      </el-button>
    </div>
  </div>
</template>
