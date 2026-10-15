<script setup>
import { useFullscreen } from '@vueuse/core'
import { saveAs } from 'file-saver'
import { computed, onMounted, shallowRef } from 'vue'
import ScreenHeader from './components/ScreenHeader.vue'
import ScreenToolbar from './components/ScreenToolbar.vue'
import { useDashboardData } from './composables/useDashboardData'
import { createInitialQuery } from './constant'
import AlarmKpiPanel from './modules/AlarmKpiPanel.vue'
import AlarmTrendPanel from './modules/AlarmTrendPanel.vue'
import FugitiveTrendPanel from './modules/FugitiveTrendPanel.vue'
import JuvenileTrendPanel from './modules/JuvenileTrendPanel.vue'
import MinorDistributionPanel from './modules/MinorDistributionPanel.vue'
import ResultPanelVue from './modules/ResultPanel.vue'
import TowRob from './modules/TowRob.vue'
import UnitRankPanel from './modules/UnitRankPanel.vue'

const { isFullscreen, toggle } = useFullscreen(undefined, { autoExit: true })
const {
  dashboard,
  isLoading: loading,
  reload,
  reloadJuvenile,
  reloadMetrics,
  reloadRank,
  reloadRankData
} = useDashboardData()

const query = shallowRef(createInitialQuery())
const alarmChartType = shallowRef('line')
const rankChartType = shallowRef('line')
const juvenileChartType = shallowRef('line')
// 警务站排名统计类型：callPolice 接处警 / netFugitive 追网逃 / minorBeat 敲打未成年 / pullCarDoor 拉车门
const rankType = shallowRef('callPolice')
const createInitialMonthRange = () => [
  // query.value.startDate.slice(0, 7),
  // query.value.endDate.slice(0, 7)
]
const rankFilter = shallowRef({
  monthRange: createInitialMonthRange()
  // deptId: '全部单位',
  // deptName: '全部单位'
})
const juvenileFilter = shallowRef({
  monthRange: createInitialMonthRange()
  // deptId: '全部单位',
  // deptName: '全部单位'
})

const specialPoliceUnitOptions = computed(() => dashboard.value.specialPoliceUnits)
const cityBranchUnitOptions = computed(() => dashboard.value.cityBranchUnits)

const updateQuery = (value) => {
  query.value = value
}

const toMonthDateRange = (monthRange) => {
  const [startMonth, endMonth] = monthRange
  const [year, monthNumber] = endMonth.split('-').map(Number)
  const lastDay = new Date(year, monthNumber, 0).getDate()
  // 后端 PoliceStatQueryDTO 用 @JsonFormat("yyyy-MM-dd HH:mm:ss") 解析，必须带时间部分
  return {
    startDate: `${startMonth}-01 00:00:00`,
    endDate: `${endMonth}-${String(lastDay).padStart(2, '0')} 23:59:59`
  }
}

const createPanelQuery = filter => ({
  ...query.value,
  statType: 'month',
  ...(filter.monthRange?.length === 2 && filter.monthRange.every(Boolean)
    ? toMonthDateRange(filter.monthRange)
    : {}),
  deptId: filter.deptId,
  deptName: filter.deptName
})

const getPanelParams = () => ({
  rank: { ...createPanelQuery(rankFilter.value), rankType: rankType.value },
  juvenile: createPanelQuery(juvenileFilter.value)
})

const updatePanelFilter = (filter, key, value, reloadPanel) => {
  const nextFilter = { ...filter.value, [key]: value }
  filter.value = nextFilter
  void reloadPanel(createPanelQuery(nextFilter))
}

const updatePanelUnit = (filter, deptId, unitOptions, reloadPanel) => {
  const selectedUnit = unitOptions.value.find(unit => unit.deptId === deptId)
  const nextFilter = {
    ...filter.value,
    // deptId: deptId || '全部单位',
    // deptName: selectedUnit?.deptName || '全部单位'
    deptId,
    deptName: selectedUnit?.deptName
  }
  filter.value = nextFilter
  void reloadPanel(createPanelQuery(nextFilter))
}

// 抢盗窃趋势 + 警务站排名共用 rankFilter，两个面板需要一起刷新
const reloadRankPanels = (filter) => {
  const params = { ...createPanelQuery(filter), rankType: rankType.value }
  void reloadRank(params)
  void reloadRankData(params)
}

const updateRankMonthRange = (monthRange) => {
  if (monthRange == null) {
    rankFilter.value = { ...rankFilter.value, monthRange: null }
    reloadRankPanels(rankFilter.value)
    return
  }

  if (monthRange.length === 2 && monthRange.every(Boolean)) {
    rankFilter.value = { ...rankFilter.value, monthRange }
    reloadRankPanels(rankFilter.value)
  }
}

const updateRankUnit = (deptId) => {
  const selectedUnit = cityBranchUnitOptions.value.find(unit => unit.deptId === deptId)
  rankFilter.value = {
    ...rankFilter.value,
    deptId,
    deptName: selectedUnit?.deptName
  }
  reloadRankPanels(rankFilter.value)
}

const updateJuvenileMonthRange = (monthRange) => {
  if (monthRange == null) {
    updatePanelFilter(juvenileFilter, 'monthRange', null, reloadJuvenile)
    return
  }

  if (monthRange.length === 2 && monthRange.every(Boolean)) {
    updatePanelFilter(juvenileFilter, 'monthRange', monthRange, reloadJuvenile)
  }
}

const updateJuvenileUnit = (deptId) => {
  updatePanelUnit(juvenileFilter, deptId, cityBranchUnitOptions, reloadJuvenile)
}

const loadData = () => reloadMetrics(query.value, getPanelParams())

const reloadAll = () => reload(query.value, getPanelParams())

const resetQuery = () => {
  query.value = createInitialQuery()
  loadData()
}

const escapeCsvValue = (value) => {
  const text = String(value ?? '')
  return text.includes(',') || text.includes('\n') ? `"${text.replaceAll('"', '""')}"` : text
}

const exportData = () => {
  const rows = [
    ['模块', '指标', '数值', '变化'],
    [
      '接处警数据',
      '总数',
      dashboard.value.alarmKpi.totalAlarm,
      dashboard.value.alarmKpi.totalAlarmRatio
    ],
    [
      '接处警数据',
      '自接警数据',
      dashboard.value.alarmKpi.selfAlarm,
      dashboard.value.alarmKpi.selfAlarmRatio
    ],
    [
      '接处警数据',
      '转警数据',
      dashboard.value.alarmKpi.transferAlarm,
      dashboard.value.alarmKpi.transferAlarmRatio
    ],
    [
      '接处警数据',
      '110派警',
      dashboard.value.alarmKpi.policeDispatch,
      dashboard.value.alarmKpi.policeDispatchRatio
    ],
    [
      '战果类数据',
      '抓获网逃数',
      dashboard.value.result.netFugitiveCount,
      dashboard.value.result.netFugitiveRatio
    ],
    [
      '战果类数据',
      '抓获团伙数',
      dashboard.value.result.gangCount,
      dashboard.value.result.gangRatio
    ],
    [
      '战果类数据',
      '抓获现行',
      dashboard.value.result.currentArrestMinor,
      dashboard.value.result.currentArrestMinorRatio
    ]
  ]
  const csv = `\ufeff${rows.map(row => row.map(escapeCsvValue).join(',')).join('\n')}`
  saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), '警务站大屏数据.csv')
}
// 父script，切换选项卡触发，切换统计维度后重新拉取排名数据
const onChangeRankType = (type) => {
  rankType.value = type
  void reloadRankData({ ...createPanelQuery(rankFilter.value), rankType: type })
}

onMounted(reloadAll)
</script>

<template>
  <div class="dashboard">
    <div class="flex h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-canvas bg-grid bg-grid-size font-ui text-content">
      <ScreenHeader
        :update-time="dashboard.updateTime"
        :loading="loading"
        :fullscreen="isFullscreen"
        @fullscreen="toggle"
        @export="exportData"
      />

      <ScreenToolbar
        :model-value="query"
        :unit-options="specialPoliceUnitOptions"
        :loading="loading"
        @update:model-value="updateQuery"
        @submit="loadData"
        @reset="resetQuery"
      />

      <main
        class="grid min-h-0 flex-1 grid-cols-1 gap-3 max-lg:grid-rows-layout-mobile lg:min-h-[84rem] lg:grid-cols-2 xl:min-h-0 xl:grid-cols-layout-desktop p-3 lg:p-4"
        :class="{ 'opacity-80': loading }"
      >
        <div class="grid min-h-0 grid-rows-layout-mobile-left gap-3 lg:row-span-2 lg:grid-rows-layout-left xl:row-span-1">
          <AlarmKpiPanel :data="dashboard.alarmKpi" />
          <ResultPanelVue :data="dashboard.result" />
          <MinorDistributionPanel :data="dashboard.pie" />
        </div>

        <section class="grid min-h-0 grid-rows-layout-mobile-stack gap-3 lg:grid-rows-layout-stack">
<!--          <FugitiveTrendPanel :data="dashboard.lineFugitive" />-->
          <AlarmTrendPanel
              :data="dashboard.lineAlarm"
              :chart-type="alarmChartType"
              @change-chart="alarmChartType = $event"
          />
          <div class="grid grid-cols-2 min-h-0 gap-3">
            <TowRob
                :data="dashboard.rank"
                :month-range="rankFilter.monthRange"
                :unit-options="cityBranchUnitOptions"
                :dept-id="rankFilter.deptId"
                :chart-type="rankChartType"
                @update-unit="updateRankUnit"
                @change-month-range="updateRankMonthRange"
                @change-chart="rankChartType = $event"
            />

            <JuvenileTrendPanel
                :data="dashboard.juvenile"
                :month-range="juvenileFilter.monthRange"
                :chart-type="juvenileChartType"
                :unit-options="cityBranchUnitOptions"
                :dept-id="juvenileFilter.deptId"
                @change-month-range="updateJuvenileMonthRange"
                @change-chart="juvenileChartType = $event"
                @update-unit="updateJuvenileUnit"
            />
          </div>
        </section>

        <div class="grid min-h-0">
          <UnitRankPanel
              :data="dashboard.rankData"
              :rank-type="rankType"
              :month-range="rankFilter.monthRange"
              :unit-options="cityBranchUnitOptions"
              :dept-id="rankFilter.deptId"
              :chart-type="rankChartType"
              @change-chart="rankChartType = $event"
              @change-month-range="updateRankMonthRange"
              @update-unit="updateRankUnit"
              @change-rank-type="onChangeRankType"
          />
        </div>

      </main>
    </div>
  </div>
</template>
