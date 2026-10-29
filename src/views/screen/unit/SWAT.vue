<script setup>
import { onKeyStroke, useDocumentVisibility, useIntervalFn, useScrollLock, watchDebounced } from '@vueuse/core'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ScreenFilterOverlay from '../components/ScreenFilterOverlay.vue'
import ScreenToolbar from '../components/ScreenToolbar.vue'
import TrendChartPanel from '../components/TrendChartPanel.vue'
import { useDashboardData } from '../composables/useDashboardData'
import { useScreenFilters } from '../composables/useScreenFilters'
import { AUTO_REFRESH_INTERVAL, PERIOD_OPTIONS } from '../constant'
import AlarmKpiPanel from '../modules/AlarmKpiPanel.vue'
import MinorDistributionPanel from '../modules/MinorDistributionPanel.vue'
import ResultPanel from '../modules/ResultPanel.vue'
import UnitRankPanel from '../modules/UnitRankPanel.vue'
import { exportScreenCsv } from '../utils/exportScreenData'

const emit = defineEmits(['loadingChange', 'updateTimeChange', 'filterChange', 'statusChange'])

const {
  dashboard,
  errors,
  errorMessage,
  hasError,
  updateTime,
  isLoading: loading,
  loading: moduleLoading,
  loaded,
  reload,
  reloadMetrics,
  reloadRank,
  reloadRankData,
  reloadJuvenile
} = useDashboardData()
const {
  query,
  rankFilter,
  juvenileFilter,
  rankType,
  alarmChartType,
  rankChartType,
  juvenileChartType,
  isQueryValid,
  createPanelQuery,
  updateRankMonthRange,
  updateJuvenileMonthRange,
  updateRankUnit,
  updateJuvenileUnit,
  resetFilters
} = useScreenFilters()

const filterOpen = ref(false)
const bodyScrollLocked = useScrollLock(document.body)
const visibility = useDocumentVisibility()
const specialPoliceUnitOptions = computed(() => dashboard.value.specialPoliceUnits)
const cityBranchUnitOptions = computed(() => dashboard.value.cityBranchUnits)

const panelLoading = key => moduleLoading[key] || !loaded[key]

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

const createRankDataQuery = () => ({
  ...query.value,
  rankType: rankType.value
})

const getRankTrendParams = () => ({
  ...createPanelQuery(rankFilter.value),
  rankType: rankType.value
})
const getRankDataParams = () => createRankDataQuery()
const getJuvenileParams = () => createPanelQuery(juvenileFilter.value)

const getPanelParams = () => ({
  rank: getRankTrendParams(),
  rankData: getRankDataParams(),
  juvenile: getJuvenileParams()
})

const reloadRankTrendPanel = () => {
  void reloadRank(getRankTrendParams())
}

const reloadRankDataPanel = () => {
  void reloadRankData(getRankDataParams())
}

const reloadJuvenilePanel = () => {
  void reloadJuvenile(getJuvenileParams())
}

const retrySummary = () => {
  void reloadMetrics(query.value, getPanelParams())
}

watchDebounced(rankFilter, reloadRankTrendPanel, { deep: true, debounce: 120 })
watchDebounced(rankType, reloadRankDataPanel, { deep: true, debounce: 120 })
watchDebounced(juvenileFilter, reloadJuvenilePanel, { deep: true, debounce: 120 })

const loadData = () => {
  if (!isQueryValid.value) {
    ElMessage.warning('请选择完整的日期范围')
    return false
  }

  void reloadMetrics(query.value, getPanelParams())
  return true
}

const handleSubmit = () => {
  if (loadData()) {
    closeFilter()
  }
}

const reloadAll = () => {
  void reload(query.value, getPanelParams())
}

const handleRankMonthRange = monthRange => updateRankMonthRange(monthRange)
const handleJuvenileMonthRange = monthRange => updateJuvenileMonthRange(monthRange)
const handleRankUnit = payload => updateRankUnit(payload)
const handleJuvenileUnit = payload => updateJuvenileUnit(payload)

const resetQuery = () => {
  resetFilters()
  void reloadMetrics(query.value, getPanelParams())
  closeFilter()
}

const exportData = () => {
  if (loading.value) {
    return
  }

  exportScreenCsv(dashboard.value)
}

watch(errorMessage, (message) => {
  if (message) {
    ElMessage.warning(message)
  }
})

watch(loading, value => emit('loadingChange', value), { immediate: true })
watch(updateTime, value => emit('updateTimeChange', value), { immediate: true })
watch([hasError, loading], () => {
  emit('statusChange', hasError.value ? 'stale' : 'live')
}, { immediate: true })
watch([filterOpen, filterSummary], () => {
  emit('filterChange', { open: filterOpen.value, summary: filterSummary.value })
}, { immediate: true })

useIntervalFn(() => {
  if (loading.value || visibility.value !== 'visible') {
    return
  }

  void reloadMetrics(query.value, getPanelParams())
}, AUTO_REFRESH_INTERVAL)

onMounted(reloadAll)

defineExpose({
  exportData,
  reloadAll,
  toggleFilter
})
</script>

<template>
  <main
    class="screen-main grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 max-lg:grid-rows-[56.5rem_auto_48.75rem] lg:min-h-[84rem] lg:grid-cols-2 lg:max-xl:grid-rows-[50rem_32rem] xl:grid-cols-layout-desktop 2xl:grid-cols-layout-wide max-sm:gap-3 max-sm:p-3"
    :aria-busy="loading || undefined"
  >
    <div class="grid min-h-0 grid-rows-layout-mobile-left gap-4 lg:row-span-2 lg:grid-rows-layout-left xl:row-span-1">
      <AlarmKpiPanel
        :reveal-index="0"
        :data="dashboard.alarmKpi"
        :loading="panelLoading('alarmKpi')"
        :error="errors.alarmKpi"
        @retry="retrySummary"
      />
      <ResultPanel
        :reveal-index="1"
        :data="dashboard.result"
        :loading="panelLoading('result')"
        :error="errors.result"
        @retry="retrySummary"
      />
      <MinorDistributionPanel
        :reveal-index="2"
        :data="dashboard.pie"
        :loading="panelLoading('pie')"
        :error="errors.pie"
        @retry="retrySummary"
      />
    </div>

    <section class="grid min-h-0 grid-rows-layout-mobile-stack gap-4 lg:grid-rows-layout-stack max-sm:grid-rows-[20rem_40rem]">
      <TrendChartPanel
        v-model:chart-type="alarmChartType"
        :reveal-index="0"
        title="接处警趋势变化"
        unit="(单位：起)"
        :data="dashboard.lineAlarm"
        :loading="panelLoading('lineAlarm')"
        :error="errors.lineAlarm"
        :slider-threshold="30"
        :slider-window="30"
        @retry="retrySummary"
      />

      <div class="grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <TrendChartPanel
          v-model:chart-type="rankChartType"
          :reveal-index="1"
          title="抢盗窃数据趋势"
          unit="(单位：起)"
          :data="dashboard.rank"
          :loading="panelLoading('rank')"
          :error="errors.rank"
          :carousel="false"
          show-filters
          :month-range="rankFilter.monthRange"
          :unit-options="cityBranchUnitOptions"
          :dept-id="rankFilter.deptId"
          :grid-left="40"
          :grid-right="18"
          :grid-bottom="38"
          :x-axis-rotate="0"
          :legend-left="12"
          @change-month-range="handleRankMonthRange"
          @update-unit="handleRankUnit"
          @retry="reloadRankTrendPanel"
        />

        <TrendChartPanel
          v-model:chart-type="juvenileChartType"
          :reveal-index="2"
          title="未成年人数趋势"
          unit="(单位：人)"
          :data="dashboard.juvenile"
          :loading="panelLoading('juvenile')"
          :error="errors.juvenile"
          :carousel="false"
          show-filters
          :month-range="juvenileFilter.monthRange"
          :unit-options="cityBranchUnitOptions"
          :dept-id="juvenileFilter.deptId"
          :grid-left="40"
          :grid-right="18"
          :grid-bottom="38"
          :x-axis-rotate="0"
          :legend-left="12"
          :bar-width="10"
          @change-month-range="handleJuvenileMonthRange"
          @update-unit="handleJuvenileUnit"
          @retry="reloadJuvenilePanel"
        />
      </div>
    </section>

    <div class="grid min-h-0">
      <UnitRankPanel
        v-model:rank-type="rankType"
        :reveal-index="0"
        :data="dashboard.rankData"
        :loading="panelLoading('rankData')"
        :error="errors.rankData"
        @retry="reloadRankDataPanel"
      />
    </div>
  </main>

  <ScreenFilterOverlay :open="filterOpen" @close="closeFilter">
    <ScreenToolbar
      v-model="query"
      :unit-options="specialPoliceUnitOptions"
      :loading="loading"
      @submit="handleSubmit"
      @reset="resetQuery"
    />
  </ScreenFilterOverlay>
</template>
