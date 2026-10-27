<script setup>
import { computed } from 'vue'
import ScreenPanel from '../components/ScreenPanel.vue'

const props = defineProps({
  data: { type: Object, default: () => ({ items: [] }) },
  unitOptions: { type: Array, default: () => [] },
  showUnitFilter: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无数据' }
})

const rankType = defineModel('rankType', { type: String, default: 'callPolice' })
// station=警务站（默认） dept=区块大队
const rankDimension = defineModel('rankDimension', { type: String, default: 'station' })
const unitId = defineModel('unitId', { type: [String, Number], default: null })

// 一级选项卡：排名维度
const dimensionTabList = [
  { label: '警务站', value: 'station' },
  { label: '区块大队', value: 'dept' }
]

// 二级选项卡：六项指标
const rankTabList = [
  { label: '接处警', value: 'callPolice' },
  { label: '抓网逃', value: 'netFugitive' },
  { label: '敲打未成年', value: 'minorBeat' },
  { label: '拉开车门', value: 'pullCarDoor' },
  { label: '抓团伙', value: 'arrestGroup' },
  { label: '抓现行', value: 'strikeCurrent' }
]

const isDeptDimension = computed(() => rankDimension.value === 'dept')

const metricUnitText = computed(() => {
  // 接处警、拉车门按"起"，抓团伙数按"个"，其余按"人"
  if (rankType.value === 'callPolice' || rankType.value === 'pullCarDoor') {
    return '(单位：起)'
  }
  if (rankType.value === 'arrestGroup') {
    return '(单位：个)'
  }
  return '(单位：人)'
})

const dimensionHint = computed(() => (
  isDeptDimension.value ? '排名按单站平均' : '排名按总量'
))

const handleDimensionChange = (value) => {
  if (value !== rankDimension.value) {
    rankDimension.value = value
  }
}

const handleTabChange = (value) => {
  if (value !== rankType.value) {
    rankType.value = value
  }
}

const handleUnitChange = (value) => {
  unitId.value = value === '' ? null : value
}

const panelTitle = computed(() => (isDeptDimension.value ? '区块大队排名' : '警务站排名'))

const rows = computed(() => {
  const items = Array.isArray(props.data?.items) ? props.data.items : []
  return items.map(item => ({
    deptId: item?.deptId ?? null,
    name: item?.unitName ?? '',
    value: Number(item?.countNum) || 0,
    // 「其他单位」汇总行：无名次、大队维度无平均/站数，null 原样保留
    avg: item?.avgNum ?? null,
    stationCount: item?.stationCount ?? null,
    rank: item?.rank ?? null,
    ratioText: item?.ratioText ?? '-',
    increase: Number(item?.increaseNum) || 0
  }))
})

// 大队维度按单站平均排名，所以条形也按平均画，列和排名保持一致；
// 「其他单位」行没有平均，退回用总量画
const displayValue = row => (isDeptDimension.value && row.avg != null ? row.avg : row.value)

const maxValue = computed(() => Math.max(0, ...rows.value.map(row => displayValue(row))))

const barWidthStyle = (row) => {
  const value = displayValue(row)
  if (!maxValue.value || !value) return '0%'
  return `${Math.max((value / maxValue.value) * 100, 4)}%`
}

const barColor = (rank) => {
  if (rank === 1) return 'linear-gradient(90deg, #ff9547, #ff4c3b)'
  if (rank === 2) return 'linear-gradient(90deg, #ffc048, #ff7b26)'
  if (rank === 3) return 'linear-gradient(90deg, #ffe470, #f8c220)'
  return 'linear-gradient(90deg, #64c7ff, #318bff)'
}

const valueText = (row) => {
  if (!isDeptDimension.value || row.avg == null) {
    return String(row.value)
  }
  // 一位小数就够了，但整数不要显示 .0
  const avg = Number.isInteger(row.avg) ? String(row.avg) : row.avg.toFixed(1)
  return avg
}

const ratioClass = (row) => {
  if (!row.ratioText || row.ratioText === '-') return 'text-slate-400'
  if (row.increase > 0) return 'text-[#ff7b72]'
  if (row.increase < 0) return 'text-[#4ad991]'
  return 'text-slate-300'
}
</script>

<template>
  <ScreenPanel :title="panelTitle" :unit="metricUnitText">
    <div class="flex h-full min-h-0 flex-col">
      <div v-if="showUnitFilter" class="mb-2 flex shrink-0 items-center gap-2 px-3">
        <span class="whitespace-nowrap text-xs text-muted">分县局</span>
        <el-select
          :model-value="unitId ?? ''"
          popper-class="dashboard-popper"
          class="dashboard-select min-w-0 flex-1"
          size="small"
          placeholder="全部单位"
          @update:model-value="handleUnitChange"
        >
          <el-option label="全部单位" value="" />
          <el-option
            v-for="option in unitOptions"
            :key="option.deptId"
            :label="option.deptName"
            :value="option.deptId"
          />
        </el-select>
      </div>

      <!-- 一级：警务站 / 区块大队 -->
      <div class="mb-1.5 flex shrink-0 gap-1.5 px-3" role="tablist" aria-label="排名范围">
        <button
          v-for="tab in dimensionTabList"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="rankDimension === tab.value"
          class="relative z-10 flex-1 cursor-pointer whitespace-nowrap rounded border text-xs px-2.5 py-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
          :class="rankDimension === tab.value
            ? 'border-[#ffb648] bg-gradient-to-r from-[#a9631a] to-[#d98a1f] font-bold text-white shadow-[0_0_8px_rgba(255,182,72,0.35)]'
            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white'"
          @click="handleDimensionChange(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 二级：五项指标 -->
      <div class="mb-2 flex shrink-0 gap-1.5 px-3" role="tablist" aria-label="排名指标">
        <button
          v-for="tab in rankTabList"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="rankType === tab.value"
          class="relative z-10 cursor-pointer whitespace-nowrap rounded border text-xs px-2 py-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
          :class="rankType === tab.value
            ? 'border-[#3498ff] bg-gradient-to-r from-[#185299] to-[#2470cc] text-white shadow-[0_0_8px_rgba(52,152,255,0.35)]'
            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white'"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        <table class="w-full table-fixed border-collapse text-[17px]">
          <thead class="sticky top-0 z-10">
            <tr class="bg-[#0e3a61]">
              <th class="w-11 whitespace-nowrap border border-[#1e4a73] px-1 py-1.5 font-bold text-slate-100">
                序号
              </th>
              <th class="w-11 border border-[#1e4a73] px-1 py-1.5 font-bold text-slate-100">
                排名
              </th>
              <th class="w-[30%] border border-[#1e4a73] px-2 py-1.5 font-bold text-slate-100">
                名称
              </th>
              <th class="w-[28%] border border-[#1e4a73] px-2 py-1.5 font-bold text-slate-100">
                数据
                <span class="ml-1 text-[0.625rem] font-normal text-slate-400">{{ dimensionHint }}</span>
              </th>
              <th class="w-[112px] border border-[#1e4a73] px-1 py-1.5 font-bold text-slate-100">
                环比
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!rows.length">
              <td colspan="5" class="border border-[#1e4a73] px-2 py-6 text-center text-slate-400">
                {{ emptyText }}
              </td>
            </tr>
            <tr
              v-for="(row, index) in rows"
              :key="row.deptId ?? row.name"
              class="transition-colors hover:bg-[#123a60]/60"
              :class="row.name === '合计' ? 'bg-[#0e3a61]/70' : ''"
            >
              <td class="border border-[#1e4a73] px-1 py-1.5 text-center text-slate-300">
                {{ row.name === '合计' ? '-' : index + 1 }}
              </td>
              <td class="border border-[#1e4a73] px-1 py-1.5 text-center font-bold">
                <span :class="row.rank != null && row.rank <= 3 ? 'text-[#ffc048]' : 'text-slate-300'">{{ row.rank ?? '-' }}</span>
              </td>
              <td class="border border-[#1e4a73] px-2 py-1.5 text-center text-slate-200">
                <span
                  class="block truncate"
                  :class="row.name === '合计' ? 'font-bold text-white' : ''"
                  :title="row.name"
                >{{ row.name }}</span>
                <span
                  v-if="isDeptDimension && row.stationCount != null"
                  class="block truncate text-[0.625rem] leading-3 text-slate-400"
                  :title="`${row.stationCount} 个警务站，合计 ${row.value}`"
                >
                  {{ row.stationCount }}站 · 共{{ row.value }}
                </span>
              </td>
              <td class="border border-[#1e4a73] px-2 py-1.5">
                <div class="flex items-center gap-2">
                  <!-- 合计行不放条形，只突出数值 -->
                  <div v-if="row.name !== '合计'" class="h-3.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-[#0b2440]/70">
                    <div
                      class="h-full rounded-sm"
                      :style="{ width: barWidthStyle(row), background: barColor(row.rank) }"
                    />
                  </div>
                  <div v-else class="min-w-0 flex-1" />
                  <span class="w-9 shrink-0 text-right font-bold text-white">{{ valueText(row) }}</span>
                </div>
              </td>
              <td class="border border-[#1e4a73] px-1 py-1.5 text-center">
                <span
                  class="block truncate text-[0.6875rem]"
                  :class="ratioClass(row)"
                  :title="row.ratioText"
                >
                  {{ row.ratioText }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </ScreenPanel>
</template>
