<script setup>
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import ScreenFilterOverlay from '../components/ScreenFilterOverlay.vue'
import ScreenToolbar from '../components/ScreenToolbar.vue'
import TrendChartPanel from '../components/TrendChartPanel.vue'
import { createInitialQuery, PERIOD_OPTIONS } from '../constant'
import MinorDistributionPanel from '../modules/MinorDistributionPanel.vue'
import ResultPanel from '../modules/ResultPanel.vue'
import UnitRankPanel from '../modules/UnitRankPanel.vue'

const emit = defineEmits(['filterChange', 'loadingChange'])

// 分县局面板暂未接入数据，先持有独立的查询条件与单位列表，不与 SWAT 面板共享状态
const query = shallowRef(createInitialQuery())
const unitOptions = shallowRef([])
const loading = shallowRef(false)
const filterOpen = ref(false)
const bodyScrollLocked = useScrollLock(document.body)

// 左栏两个区域先以空数据渲染，后续替换为分县局自己的接口结果
const resultData = shallowRef({})
const minorDistributionData = shallowRef({})

// 中栏两个趋势模块各自维护时间选择与图表类型，同样不复用 SWAT 的状态
const rankTrendData = shallowRef({ xAxis: [], seriesList: [] })
const juvenileTrendData = shallowRef({ xAxis: [], seriesList: [] })
const rankTrendFilter = shallowRef({ monthRange: null })
const juvenileTrendFilter = shallowRef({ monthRange: null })
const rankChartType = shallowRef('line')
const juvenileChartType = shallowRef('line')

// 右侧排名：全部单位时统计分县局，选中具体分县局时统计其下辖派出所
const rankData = shallowRef({ yAxis: [], series: [] })
const rankType = shallowRef('callPolice')
const rankUnitId = shallowRef(null)
// 示例分县局占位，后续替换为分县局单位接口
const rankUnitOptions = [
  { deptId: 301, deptName: '红谷滩分局' },
  { deptId: 302, deptName: '东湖区分局' },
  { deptId: 303, deptName: '南昌县局' },
  { deptId: 304, deptName: '安义县局' }
]

const rankEmptyText = computed(() => {
  const unit = rankUnitOptions.find(item => item.deptId === rankUnitId.value)
  return unit ? `${unit.deptName}下辖派出所暂无排名数据` : '暂无分县局排名数据'
})

const isQueryValid = computed(() => Boolean(query.value.startDate && query.value.endDate))

const filterSummary = computed(() => {
  const { startDate, endDate, deptName, statType } = query.value
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const range = start.isValid() && end.isValid()
    ? `${start.format('YYYY-MM-DD')} ~ ${end.format(start.year() === end.year() ? 'MM-DD' : 'YYYY-MM-DD')}`
    : '未选择日期'
  const unit = deptName || '全部单位'
  const period = PERIOD_OPTIONS.find(option => option.value === statType)?.label ?? '日'
  return `${range} · ${unit} · 按${period}`
})

const toggleFilter = () => {
  filterOpen.value = !filterOpen.value
}

const closeFilter = () => {
  filterOpen.value = false
}

onKeyStroke('Escape', () => {
  if (filterOpen.value) {
    closeFilter()
  }
})

watch(filterOpen, (open) => {
  bodyScrollLocked.value = open
})

onBeforeUnmount(() => {
  bodyScrollLocked.value = false
})

const updateRankMonthRange = (monthRange) => {
  rankTrendFilter.value = { ...rankTrendFilter.value, monthRange: monthRange ?? null }
}

const updateJuvenileMonthRange = (monthRange) => {
  juvenileTrendFilter.value = { ...juvenileTrendFilter.value, monthRange: monthRange ?? null }
}

// 分县局数据接口接入前，查询仅做条件校验，暂不发起请求
const loadData = () => {
  if (!isQueryValid.value) {
    ElMessage.warning('请选择完整的日期范围')
    return false
  }
  return true
}

const handleSubmit = () => {
  if (loadData()) {
    closeFilter()
  }
}

const reloadAll = () => {
  loadData()
}

const resetQuery = () => {
  query.value = createInitialQuery()
  rankTrendFilter.value = { monthRange: null }
  juvenileTrendFilter.value = { monthRange: null }
  rankType.value = 'callPolice'
  rankUnitId.value = null
  closeFilter()
}

watch(loading, value => emit('loadingChange', value), { immediate: true })
watch([filterOpen, filterSummary], () => {
  emit('filterChange', { open: filterOpen.value, summary: filterSummary.value })
}, { immediate: true })

defineExpose({
  reloadAll,
  toggleFilter
})
</script>

<template>
  <main
    class="screen-main grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 max-lg:grid-rows-[56.5rem_auto_48.75rem] lg:min-h-[84rem] lg:grid-cols-2 xl:grid-cols-layout-desktop 2xl:grid-cols-layout-wide max-sm:gap-3 max-sm:p-3"
    :aria-busy="loading || undefined"
  >
    <div class="grid min-h-0 grid-rows-[18rem_22rem] gap-4 lg:row-span-2 lg:grid-rows-[1fr_1.32fr] xl:row-span-1">
      <ResultPanel :data="resultData" :loading="loading" />
      <MinorDistributionPanel :data="minorDistributionData" :loading="loading" />
    </div>

    <section class="grid min-h-0 grid-rows-layout-mobile-stack gap-4 lg:grid-rows-layout-stack max-sm:grid-rows-[20rem_40rem]">
      <TrendChartPanel
        v-model:chart-type="rankChartType"
        title="抢盗窃数据趋势"
        unit="(单位：起)"
        :data="rankTrendData"
        :loading="loading"
        show-filters
        :show-unit-filter="false"
        :month-range="rankTrendFilter.monthRange"
        :carousel-delay="0"
        @change-month-range="updateRankMonthRange"
      />

      <TrendChartPanel
        v-model:chart-type="juvenileChartType"
        title="未成年人数趋势"
        unit="(单位：人)"
        :data="juvenileTrendData"
        :loading="loading"
        show-filters
        :show-unit-filter="false"
        :month-range="juvenileTrendFilter.monthRange"
        :carousel-delay="1600"
        @change-month-range="updateJuvenileMonthRange"
      />
    </section>

    <div class="grid min-h-0">
      <UnitRankPanel
        v-model:rank-type="rankType"
        v-model:unit-id="rankUnitId"
        :data="rankData"
        :loading="loading"
        :unit-options="rankUnitOptions"
        :empty-text="rankEmptyText"
        show-unit-filter
      />
    </div>
  </main>

  <ScreenFilterOverlay :open="filterOpen" @close="closeFilter">
    <ScreenToolbar
      v-model="query"
      :unit-options="unitOptions"
      :loading="loading"
      @submit="handleSubmit"
      @reset="resetQuery"
    />
  </ScreenFilterOverlay>
</template>
