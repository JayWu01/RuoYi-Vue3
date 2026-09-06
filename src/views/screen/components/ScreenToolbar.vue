<script setup>
import { RefreshCw, Search } from '@lucide/vue'
import { computed } from 'vue'
import { PERIOD_OPTIONS } from '../constant'

const props = defineProps({
  deptId: { type: [String, Number, null], default: null },
  modelValue: {
    type: Object,
    required: true
  },
  unitOptions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'reset'])

const dateRange = computed({
  get: () => [props.modelValue.startDate, props.modelValue.endDate],
  set: (value) => {
    emit('update:modelValue', {
      ...props.modelValue,
      startDate: value?.[0] ?? '',
      endDate: value?.[1] ?? ''
    })
  }
})

const setField = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

const setUnit = (deptId) => {
  const unit = props.unitOptions.find(item => item.deptId === deptId)
  emit('update:modelValue', {
    ...props.modelValue,
    // deptId: deptId || '全部单位',
    // deptName: unit?.deptName || '全部单位'
    deptId,
    deptName: unit?.deptName
  })
}
</script>

<template>
  <section class="mt-3 flex items-center px-4 max-lg:flex-wrap max-md:h-auto">
    <div class="flex min-w-0 flex-1 flex-wrap items-center gap-5 max-md:w-full">
      <span class="whitespace-nowrap text-sm text-muted">日期范围</span>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        clearable
        range-separator="~"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        popper-class="dashboard-popper"
        class="dashboard-date-picker w-64 flex-none max-lg:w-72 max-md:w-full"
      />
      <span class="whitespace-nowrap text-sm text-muted">基层单位</span>
      <el-select
        :model-value="modelValue.deptId"
        popper-class="dashboard-popper"
        class="dashboard-select w-40 max-md:w-full"
        placeholder="全部单位"
        @update:model-value="setUnit"
      >
        <el-option label="全部单位" :value="null" />
        <el-option
          v-for="unit in unitOptions"
          :key="unit.deptId"
          :label="unit.deptName"
          :value="unit.deptId"
        />
      </el-select>
      <el-segmented
        :model-value="modelValue.statType"
        :options="PERIOD_OPTIONS"
        aria-label="统计周期"
        class="dashboard-period w-40"
        size="default"
        @change="setField('statType', $event)"
      />
    </div>
    <div class="ml-auto flex shrink-0 max-md:ml-0 max-md:w-full">
      <el-button
        class="dashboard-action-button dashboard-action-button-primary"
        :loading="loading"
        :disabled="loading"
        @click="emit('submit')"
      >
        <Search
          v-if="!loading"
          class="mr-1 inline-block align-middle"
          :size="16"
          :stroke-width="1.8"
        />
        {{ loading ? "加载中" : "查询" }}
      </el-button>
      <el-button
        class="dashboard-action-button"
        :disabled="loading"
        @click="emit('reset')"
      >
        <RefreshCw class="mr-1 inline-block align-middle" :size="16" :stroke-width="1.8" />
        重置
      </el-button>
    </div>
  </section>
</template>
