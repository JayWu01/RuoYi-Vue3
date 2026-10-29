<script setup>
import { ListOrdered } from '@lucide/vue'
import { motion } from 'motion-v'
import { computed } from 'vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import { useScreenMotion } from '../motion'

const props = defineProps({
  data: { type: Object, default: () => ({ yAxis: [], series: [] }) },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
  unitOptions: { type: Array, default: () => [] },
  showUnitFilter: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无数据' }
})

const emit = defineEmits(['retry'])
const { rowInitial, rowTransition } = useScreenMotion()

const rankType = defineModel('rankType', { type: String, default: 'callPolice' })
const unitId = defineModel('unitId', { type: [String, Number], default: null })

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

const handleUnitChange = (value) => {
  unitId.value = value === '' ? null : value
}

const rows = computed(() => {
  const names = props.data?.yAxis || []
  const values = (props.data?.series || []).map(value => Number(value) || 0)
  return names.map((name, index) => ({ name, value: values[index] ?? 0 }))
})

const showSkeleton = computed(() => props.loading && !rows.value.length)

const totalValue = computed(() => rows.value.reduce((sum, row) => sum + row.value, 0))
const maxValue = computed(() => Math.max(0, ...rows.value.map(row => row.value)))
const totalText = computed(() => totalValue.value.toLocaleString('en-US'))

const barWidthStyle = (value) => {
  if (!maxValue.value || !value) return '0%'
  return `${Math.max((value / maxValue.value) * 100, 4)}%`
}
</script>

<template>
  <ScreenPanel title="警务站排名" :loading="loading" :error="error" :reveal-index="revealIndex" @retry="emit('retry')">
    <template #meta>
      <span class="chip plain">合计 {{ rows.length ? totalText : '—' }}</span>
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

      <div v-if="showUnitFilter" class="flex shrink-0 items-center gap-2 px-4 pb-3">
        <span class="field-label">分县局</span>
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

      <div class="rank-head" aria-hidden="true">
        <span class="idx">#</span>
        <span class="name">单位</span>
        <span class="val">数值</span>
      </div>

      <div class="panel-stack">
        <Transition name="scr-swap">
          <div v-if="showSkeleton" key="skeleton" class="rank-list" aria-hidden="true">
            <div v-for="index in 8" :key="index" class="rank-item">
              <div class="r-top">
                <span class="scr-skeleton is-square" style="width: 18px; height: 18px" />
                <span class="scr-skeleton" style="width: 42%; height: 10px" />
                <span class="scr-skeleton ml-auto" style="width: 34px; height: 10px" />
              </div>
              <span class="scr-skeleton block" style="width: 100%; height: 5px; border-radius: 999px" />
            </div>
          </div>

          <div v-else-if="rows.length" key="content" class="rank-list">
            <motion.div
              v-for="(row, index) in rows"
              :key="`${row.name}-${index}`"
              class="rank-item -mx-2 rounded-lg px-2 py-1 transition-colors hover:bg-[var(--scr-surface-2)]"
              :initial="rowInitial"
              :animate="{ opacity: 1, x: 0 }"
              :transition="rowTransition(index)"
            >
              <div class="r-top">
                <span class="idx" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                <span class="r-name" :title="row.name">{{ row.name }}</span>
                <span class="r-val">{{ row.value }}</span>
              </div>
              <div class="bar">
                <i :style="{ '--bar-width': barWidthStyle(row.value) }" />
              </div>
            </motion.div>
          </div>

          <div v-else key="empty" class="empty-state pb-4">
            <span class="empty-ico">
              <ListOrdered :size="16" :stroke-width="1.8" aria-hidden="true" />
            </span>
            <span>{{ emptyText }}</span>
          </div>
        </Transition>
      </div>
    </div>
  </ScreenPanel>
</template>
