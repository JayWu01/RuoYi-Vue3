<script setup>
import { useDocumentVisibility, useFullscreen, useIntervalFn, watchDebounced } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { computed, onMounted, watch } from 'vue'
import ScreenHeader from './components/ScreenHeader.vue'
import ScreenToolbar from './components/ScreenToolbar.vue'
import TrendChartPanel from './components/TrendChartPanel.vue'
import { useDashboardData } from './composables/useDashboardData'
import { useScreenFilters } from './composables/useScreenFilters'
import { AUTO_REFRESH_INTERVAL } from './constant'
import AlarmKpiPanel from './modules/AlarmKpiPanel.vue'
import MinorDistributionPanel from './modules/MinorDistributionPanel.vue'
import ResultPanel from './modules/ResultPanel.vue'
import UnitRankPanel from './modules/UnitRankPanel.vue'
import { exportScreenCsv } from './utils/exportScreenData'

const { isFullscreen, toggle } = useFullscreen(undefined, { autoExit: true })
const {
  dashboard,
  errorMessage,
  updateTime,
  isLoading: loading,
  reload,
  reloadMetrics,
  reloadRank,
  reloadRankData,
  reloadJuvenile,
  reloadSummary
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
  getPanelParams,
  updateRankMonthRange,
  updateJuvenileMonthRange,
  updateRankUnit,
  updateJuvenileUnit,
  resetFilters
} = useScreenFilters()

const visibility = useDocumentVisibility()
const specialPoliceUnitOptions = computed(() => dashboard.value.specialPoliceUnits)
const cityBranchUnitOptions = computed(() => dashboard.value.cityBranchUnits)

const getRankParams = () => ({ ...createPanelQuery(rankFilter.value), rankType: rankType.value })
const getJuvenileParams = () => createPanelQuery(juvenileFilter.value)

const reloadRankPanels = () => {
  const params = getRankParams()
  void reloadRank(params)
  void reloadRankData(params)
}

const reloadJuvenilePanel = () => {
  void reloadJuvenile(getJuvenileParams())
}

watchDebounced([rankFilter, rankType], reloadRankPanels, { deep: true, debounce: 120 })
watchDebounced(juvenileFilter, reloadJuvenilePanel, { deep: true, debounce: 120 })

const loadData = () => {
  if (!isQueryValid.value) {
    ElMessage.warning('请选择完整的日期范围')
    return
  }

  void reloadMetrics(query.value, getPanelParams())
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
  void reloadSummary(query.value)
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

useIntervalFn(() => {
  if (loading.value || visibility.value !== 'visible') {
    return
  }

  void reloadMetrics(query.value, getPanelParams())
}, AUTO_REFRESH_INTERVAL)

onMounted(reloadAll)
</script>

<template>
  <div class="dashboard">
    <div class="flex h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-canvas bg-grid bg-grid-size font-ui text-content">
      <ScreenHeader
        :update-time="updateTime"
        :loading="loading"
        :fullscreen="isFullscreen"
        @fullscreen="toggle"
        @export="exportData"
      />

      <ScreenToolbar
        v-model="query"
        :unit-options="specialPoliceUnitOptions"
        :loading="loading"
        @submit="loadData"
        @reset="resetQuery"
      />

      <main
        class="grid min-h-0 flex-1 grid-cols-1 gap-3 max-lg:grid-rows-layout-mobile lg:min-h-[84rem] lg:grid-cols-2 xl:min-h-0 xl:grid-cols-layout-desktop p-3 lg:p-4"
      >
        <div class="grid min-h-0 grid-rows-layout-mobile-left gap-3 lg:row-span-2 lg:grid-rows-layout-left xl:row-span-1">
          <AlarmKpiPanel :data="dashboard.alarmKpi" />
          <ResultPanel :data="dashboard.result" />
          <MinorDistributionPanel :data="dashboard.pie" />
        </div>

        <section class="grid min-h-0 grid-rows-layout-mobile-stack gap-3 lg:grid-rows-layout-stack">
          <TrendChartPanel
            v-model:chart-type="alarmChartType"
            title="接处警趋势变化"
            unit="(单位：起)"
            :data="dashboard.lineAlarm"
            :slider-threshold="30"
            :slider-window="30"
            :show-data-shadow="false"
          />

          <div class="grid grid-cols-2 min-h-0 gap-3">
            <TrendChartPanel
              v-model:chart-type="rankChartType"
              title="抢盗窃数据趋势"
              unit="(单位：起)"
              :data="dashboard.rank"
              show-filters
              :month-range="rankFilter.monthRange"
              :unit-options="cityBranchUnitOptions"
              :dept-id="rankFilter.deptId"
              :scale-axis="true"
              :grid-left="42"
              :grid-right="18"
              :grid-bottom="70"
              :x-axis-rotate="30"
              :legend-left="12"
              @change-month-range="handleRankMonthRange"
              @update-unit="handleRankUnit"
            />

            <TrendChartPanel
              v-model:chart-type="juvenileChartType"
              title="未成年人数趋势"
              unit="(单位：人)"
              :data="dashboard.juvenile"
              show-filters
              :month-range="juvenileFilter.monthRange"
              :unit-options="cityBranchUnitOptions"
              :dept-id="juvenileFilter.deptId"
              :scale-axis="true"
              :grid-left="42"
              :grid-right="18"
              :grid-bottom="70"
              :x-axis-rotate="30"
              :legend-left="12"
              :bar-width="7"
              @change-month-range="handleJuvenileMonthRange"
              @update-unit="handleJuvenileUnit"
            />
          </div>
        </section>

        <div class="grid min-h-0">
          <UnitRankPanel v-model:rank-type="rankType" :data="dashboard.rankData" />
        </div>
      </main>
    </div>
  </div>
</template>
