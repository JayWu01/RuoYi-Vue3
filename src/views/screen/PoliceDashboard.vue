<script setup>
import { onKeyStroke, useDocumentVisibility, useFullscreen, useIntervalFn, useScrollLock, watchDebounced } from '@vueuse/core'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch, watchEffect } from 'vue'
import ScreenFilterOverlay from './components/ScreenFilterOverlay.vue'
import ScreenHeader from './components/ScreenHeader.vue'
import ScreenToolbar from './components/ScreenToolbar.vue'
import TrendChartPanel from './components/TrendChartPanel.vue'
import { useDashboardData } from './composables/useDashboardData'
import { useScreenFilters } from './composables/useScreenFilters'
import { toggleScreenTheme, useScreenTheme } from './composables/useScreenTheme'
import { AUTO_REFRESH_INTERVAL, PERIOD_OPTIONS } from './constant'
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
const { theme } = useScreenTheme()

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

/* 面板入场：按顺序轻微上浮，避免整页同时出现 */
const vReveal = {
  mounted(el, binding) {
    el.style.setProperty('--scr-reveal-delay', `${(Number(binding.value) || 0) * 55}ms`)
    el.classList.add('scr-reveal')
  }
}

watchEffect(() => {
  document.documentElement.dataset.screenTheme = theme.value
})

onBeforeUnmount(() => {
  delete document.documentElement.dataset.screenTheme
})

const formatDay = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createYesterdayRange = () => {
  const yesterday = formatDay(new Date(Date.now() - 24 * 60 * 60 * 1000))
  return [yesterday, yesterday]
}

const rankDataFilter = shallowRef({
  dateRange: createYesterdayRange()
})

const rankDateRange = computed({
  get: () => rankDataFilter.value.dateRange,
  set: (value) => {
    rankDataFilter.value = {
      ...rankDataFilter.value,
      dateRange: value ?? []
    }
  }
})

const toDayTimeRange = (dateRange) => {
  if (Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
    return {
      startDate: `${dateRange[0]} 00:00:00`,
      endDate: `${dateRange[1]} 23:59:59`
    }
  }
  return {}
}

const createRankDataQuery = filter => ({
  ...query.value,
  ...toDayTimeRange(filter.dateRange),
  rankType: rankType.value
})

const getRankTrendParams = () => ({
  ...createPanelQuery(rankFilter.value),
  rankType: rankType.value
})
const getRankDataParams = () => createRankDataQuery(rankDataFilter.value)
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

watchDebounced(rankFilter, reloadRankTrendPanel, { deep: true, debounce: 120 })
watchDebounced([rankDataFilter, rankType], reloadRankDataPanel, { deep: true, debounce: 120 })
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
  rankDataFilter.value = {
    dateRange: createYesterdayRange()
  }
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

useIntervalFn(() => {
  if (loading.value || visibility.value !== 'visible') {
    return
  }

  void reloadMetrics(query.value, getPanelParams())
}, AUTO_REFRESH_INTERVAL)

onMounted(reloadAll)
</script>

<template>
  <div class="dashboard" :data-theme="theme">
    <div class="flex min-h-screen w-full flex-col overflow-x-hidden font-ui text-scr-fg lg:h-screen lg:overflow-y-auto">
      <ScreenHeader
        :update-time="updateTime"
        :loading="loading"
        :fullscreen="isFullscreen"
        :theme="theme"
        :filter-open="filterOpen"
        :filter-summary="filterSummary"
        @fullscreen="toggle"
        @toggle-theme="toggleScreenTheme"
        @toggle-filter="toggleFilter"
        @export="exportData"
      />

      <main
        class="screen-main grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 max-lg:grid-rows-[56.5rem_auto_48.75rem] lg:min-h-[84rem] lg:grid-cols-2 xl:grid-cols-layout-desktop 2xl:grid-cols-layout-wide max-sm:gap-3 max-sm:p-3"
        :aria-busy="loading || undefined"
      >
        <div class="grid min-h-0 grid-rows-layout-mobile-left gap-4 lg:row-span-2 lg:grid-rows-layout-left xl:row-span-1">
          <AlarmKpiPanel
            v-reveal="1"
            :data="dashboard.alarmKpi"
            :loading="panelLoading('alarmKpi')"
          />
          <ResultPanel
            v-reveal="2"
            :data="dashboard.result"
            :loading="panelLoading('result')"
          />
          <MinorDistributionPanel
            v-reveal="3"
            :data="dashboard.pie"
            :loading="panelLoading('pie')"
          />
        </div>

        <section class="grid min-h-0 grid-rows-layout-mobile-stack gap-4 lg:grid-rows-layout-stack max-sm:grid-rows-[20rem_40rem]">
          <TrendChartPanel
            v-model:chart-type="alarmChartType"
            v-reveal="1"
            title="接处警趋势变化"
            unit="(单位：起)"
            :data="dashboard.lineAlarm"
            :loading="panelLoading('lineAlarm')"
            :slider-threshold="30"
            :slider-window="30"
            :show-data-shadow="false"
          />

          <div class="grid grid-cols-2 min-h-0 gap-4 max-sm:grid-cols-1 max-sm:grid-rows-2">
            <TrendChartPanel
              v-model:chart-type="rankChartType"
              v-reveal="2"
              title="抢盗窃数据趋势"
              unit="(单位：起)"
              :data="dashboard.rank"
              :loading="panelLoading('rank')"
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
              v-reveal="3"
              title="未成年人数趋势"
              unit="(单位：人)"
              :data="dashboard.juvenile"
              :loading="panelLoading('juvenile')"
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
          <UnitRankPanel
            v-model:rank-type="rankType"
            v-model:date-range="rankDateRange"
            v-reveal="1"
            :data="dashboard.rankData"
            :loading="panelLoading('rankData')"
          />
        </div>
      </main>
    </div>

    <ScreenFilterOverlay :open="filterOpen" @close="closeFilter">
      <ScreenToolbar
        v-model="query"
        :unit-options="specialPoliceUnitOptions"
        :loading="loading"
        @submit="handleSubmit"
        @reset="resetQuery"
      />
    </ScreenFilterOverlay>
  </div>
</template>
