<script setup>
import { computed } from 'vue'
import ScreenPanel from '../components/ScreenPanel.vue'

const props = defineProps({
  data: { type: Object, required: true, default: () => ({}) },
  rankType: { type: String, default: 'callPolice' },
  // 面板自己的时间范围（yyyy-MM-dd 数组），与顶部工具栏筛选互不影响
  dateRange: { type: Array, default: () => [] },
  unitOptions: { type: Array },
  deptId: { type: [String, Number] }
})

const emit = defineEmits([
  'change-date-range',
  'update-unit',
  'change-rank-type'
])

const rankTabList = [
  { label: '接处警', value: 'callPolice' },
  { label: '追网逃', value: 'netFugitive' },
  { label: '敲打未成年', value: 'minorBeat' },
  { label: '拉车门', value: 'pullCarDoor' },
  { label: '抓现行', value: 'strikeCurrent' }
]

function handleTabChange(val) {
  emit('change-rank-type', val)
}

// 表格行：yAxis/series 拼成 { name, value }，series 可能是数字字符串统一转 Number
const rows = computed(() => {
  const names = props.data?.yAxis || []
  const values = (props.data?.series || []).map(v => Number(v) || 0)
  return names.map((name, index) => ({ name, value: values[index] ?? 0 }))
})

// 条状图宽度按当前最大值归一化，保底 4% 让非 0 值可见
const maxValue = computed(() => Math.max(0, ...rows.value.map(row => row.value)))
const barWidthStyle = (value) => {
  if (!maxValue.value || !value) return '0%'
  return `${Math.max((value / maxValue.value) * 100, 4)}%`
}
// 延续原柱状图的排名配色：前三名橙黄系，其余蓝色系
const barColor = (index) => {
  if (index === 0) return 'linear-gradient(90deg, #ff9547, #ff4c3b)'
  if (index === 1) return 'linear-gradient(90deg, #ffc048, #ff7b26)'
  if (index === 2) return 'linear-gradient(90deg, #ffe470, #f8c220)'
  return 'linear-gradient(90deg, #64c7ff, #318bff)'
}
</script>

<template>
  <ScreenPanel title="警务站排名" unit="(单位：起)">
    <div class="flex min-h-0 h-full flex-col">
      <!-- 统计类型选项卡 -->
      <div class="mb-2 flex shrink-0 gap-1.5 px-3">
        <div
            v-for="tab in rankTabList"
            :key="tab.value"
            @click="handleTabChange(tab.value)"
            class="relative z-10 cursor-pointer whitespace-nowrap rounded border text-xs px-2.5 py-1 transition-all duration-200"
            :class="rankType === tab.value
      ? 'border-[#3498ff] bg-gradient-to-r from-[#185299] to-[#2470cc] text-white shadow-[0_0_8px_rgba(52,152,255,0.35)]'
      : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-800'"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 面板内筛选：时间范围 + 单位，独立于顶部工具栏 -->
      <div class="mb-2 flex shrink-0 items-center gap-2 px-3">
        <span class="whitespace-nowrap text-sm text-muted">日期范围</span>
        <el-date-picker
            :model-value="dateRange"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            size="small"
            popper-class="dashboard-popper"
            class="dashboard-date-picker min-w-0 flex-1"
            @update:model-value="emit('change-date-range', $event)"
        />
<!--        <el-select-->
<!--            popper-class="dashboard-popper"-->
<!--            class="dashboard-select min-w-0 flex-1"-->
<!--            :model-value="deptId"-->
<!--            clearable-->
<!--            size="small"-->
<!--            placeholder="全部单位"-->
<!--            @update:model-value="emit('update-unit', $event)"-->
<!--        >-->
<!--          <el-option label="全部单位" :value="null"/>-->
<!--          <el-option v-for="unit in unitOptions" :key="unit.deptId" :label="unit.deptName" :value="unit.deptId" />-->
<!--        </el-select>-->
      </div>

      <!-- 排名表格：排名 | 名称 | 数据(条状图+数值) -->
      <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        <table class="w-full table-fixed border-collapse text-[0.8125rem]">
          <thead class="sticky top-0 z-10">
            <tr class="bg-[#0e3a61]">
              <th class="w-14 border border-[#1e4a73] px-2 py-1.5 font-bold text-slate-100">排名</th>
              <th class="border border-[#1e4a73] px-2 py-1.5 font-bold text-slate-100">名称</th>
              <th class="w-[46%] border border-[#1e4a73] px-2 py-1.5 font-bold text-slate-100">数据</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!rows.length">
              <td colspan="3" class="border border-[#1e4a73] px-2 py-6 text-center text-slate-400">暂无数据</td>
            </tr>
            <tr
                v-for="(row, index) in rows"
                :key="row.name"
                class="transition-colors hover:bg-[#123a60]/60"
            >
              <td class="border border-[#1e4a73] px-2 py-1.5 text-center text-slate-300">{{ index + 1 }}</td>
              <td class="border border-[#1e4a73] px-2 py-1.5 text-center text-slate-200">
                <span class="block truncate" :title="row.name">{{ row.name }}</span>
              </td>
              <td class="border border-[#1e4a73] px-2 py-1.5">
                <div class="flex items-center gap-2">
                  <div class="h-3.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-[#0b2440]/70">
                    <div
                        class="h-full rounded-sm"
                        :style="{ width: barWidthStyle(row.value), background: barColor(index) }"
                    ></div>
                  </div>
                  <span class="w-9 shrink-0 text-right font-bold text-white">{{ row.value }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </ScreenPanel>
</template>
