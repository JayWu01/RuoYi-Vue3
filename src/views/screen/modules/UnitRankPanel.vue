<script setup>
import { ListOrdered } from '@lucide/vue'
import { computed } from 'vue'
import ScreenPanel from '../components/ScreenPanel.vue'

const props = defineProps({
  data: { type: Object, default: () => ({ yAxis: [], series: [] }) },
  loading: { type: Boolean, default: false }
})

const rankType = defineModel('rankType', { type: String, default: 'callPolice' })
const dateRange = defineModel('dateRange', { type: Array, default: () => [] })

const dateRangeModel = computed({
  get: () => dateRange.value ?? [],
  set: (value) => {
    dateRange.value = value ?? []
  }
})

const rankTabList = [
  { label: '接处警', value: 'callPolice' },
  { label: '追网逃', value: 'netFugitive' },
  { label: '敲打未成年', value: 'minorBeat' },
  { label: '拉车门', value: 'pullCarDoor' },
  { label: '抓现行', value: 'strikeCurrent' }
]

const handleTabChange = (value) => {
  if (value !== rankType.value) {
    rankType.value = value
  }
}

const rows = computed(() => {
  const names = props.data?.yAxis || []
  const values = (props.data?.series || []).map(value => Number(value) || 0)
  return names.map((name, index) => ({ name, value: values[index] ?? 0 }))
})

const showSkeleton = computed(() => props.loading && !rows.value.length)

const maxValue = computed(() => Math.max(0, ...rows.value.map(row => row.value)))
const totalValue = computed(() => rows.value.reduce((sum, row) => sum + row.value, 0))
const totalText = computed(() => totalValue.value.toLocaleString('en-US'))

const barWidthStyle = (value) => {
  if (!maxValue.value || !value) return '0%'
  return `${Math.max((value / maxValue.value) * 100, 4)}%`
}

const percentText = (value) => {
  if (!totalValue.value) return '0%'
  return `${((value / totalValue.value) * 100).toFixed(1)}%`
}
</script>

<template>
  <ScreenPanel title="警务站排名" unit="(单位：起)" :loading="loading">
    <template #meta>
      <span class="chip plain">合计 {{ rows.length ? totalText : '—' }} 起</span>
    </template>

    <div class="flex min-h-0 flex-1 flex-col">
      <div class="pill-tabs shrink-0 px-4 pb-2" role="tablist" aria-label="排名维度">
        <button
          v-for="tab in rankTabList"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="rankType === tab.value"
          class="pill-tab"
          :class="{ 'is-active': rankType === tab.value }"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="flex shrink-0 items-center gap-2 px-4 pb-3">
        <span class="field-label">日期范围</span>
        <el-date-picker
          v-model="dateRangeModel"
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
        />
      </div>

      <div class="panel-stack">
        <Transition name="scr-swap">
          <div v-if="showSkeleton" key="skeleton" class="rank-list" aria-hidden="true">
            <div v-for="index in 9" :key="index" class="rank-item">
              <div class="r-top">
                <span class="scr-skeleton is-square" style="width: 18px; height: 18px" />
                <span class="scr-skeleton" style="width: 42%; height: 10px" />
                <span class="scr-skeleton ml-auto" style="width: 34px; height: 10px" />
                <span class="scr-skeleton" style="width: 40px; height: 10px" />
              </div>
              <span class="scr-skeleton block" style="width: 100%; height: 5px; border-radius: 5px" />
            </div>
          </div>

          <div v-else-if="rows.length" key="content" class="rank-list justify-between">
            <div
              v-for="(row, index) in rows"
              :key="`${row.name}-${index}`"
              class="rank-item -mx-2 rounded-lg px-2 py-1 transition-colors hover:bg-[var(--scr-surface-2)]"
              :style="{ '--row-index': index }"
            >
              <div class="r-top">
                <span class="idx" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                <span class="r-name" :title="row.name">{{ row.name }}</span>
                <span class="r-val">{{ row.value }}</span>
                <span class="r-pct">{{ percentText(row.value) }}</span>
              </div>
              <div class="bar">
                <i :style="{ '--bar-width': barWidthStyle(row.value) }" />
              </div>
            </div>
          </div>

          <div v-else key="empty" class="empty-state pb-4">
            <span class="empty-ico">
              <ListOrdered :size="16" :stroke-width="1.8" aria-hidden="true" />
            </span>
            <span>暂无数据</span>
          </div>
        </Transition>
      </div>
    </div>
  </ScreenPanel>
</template>
