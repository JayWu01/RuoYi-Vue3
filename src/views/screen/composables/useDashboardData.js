import dayjs from 'dayjs'
import { computed, reactive, ref, shallowRef } from 'vue'
import {
  getAlarmKpi,
  getAlarmTrend,
  getJuvenileTrend,
  getMinorPie,
  getRankList,
  getResultKpi,
  getTwoRob,
  getUnitOptions
} from '../api/policeDashboard'
import { createEmptyDashboard, UNIT_PARENT_IDS } from '../constant'
import {
  normalizeJuvenile,
  normalizeMinorPie,
  normalizeRankList,
  normalizeRecord,
  normalizeTrendResponse,
  normalizeTwoRob,
  normalizeUnitOptions
} from '../utils/normalizeScreenData'

const moduleLabels = {
  alarmKpi: '接处警数据',
  result: '战果类数据',
  pie: '罪错未成年分布',
  lineAlarm: '接处警趋势',
  rank: '抢盗窃数据趋势',
  rankData: '警务站排名',
  juvenile: '未成年人数据趋势',
  specialPoliceUnits: '特警支队单位',
  cityBranchUnits: '全市分局单位'
}

const createModuleState = () => ({
  alarmKpi: false,
  result: false,
  pie: false,
  lineAlarm: false,
  rank: false,
  rankData: false,
  juvenile: false,
  specialPoliceUnits: false,
  cityBranchUnits: false
})

const createRequestVersions = () => Object.fromEntries(
  Object.keys(createModuleState()).map(key => [key, 0])
)

export function useDashboardData() {
  const dashboard = shallowRef(createEmptyDashboard())
  const updateTime = ref('-')
  const loading = reactive(createModuleState())
  const errors = reactive(createModuleState())
  const versions = createRequestVersions()

  const isLoading = computed(() => Object.values(loading).some(Boolean))
  const errorMessage = computed(() =>
    Object.keys(errors)
      .filter(key => errors[key])
      .map(key => `${moduleLabels[key]}加载失败`)
      .join('、')
  )

  const loadModule = async (key, request, normalize = normalizeRecord) => {
    const version = ++versions[key]
    loading[key] = true
    errors[key] = false

    try {
      const response = await request()
      if (version !== versions[key]) {
        return
      }

      dashboard.value = {
        ...dashboard.value,
        [key]: normalize(response)
      }

      if (key !== 'specialPoliceUnits' && key !== 'cityBranchUnits') {
        updateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    } catch (error) {
      if (version !== versions[key]) {
        return
      }

      errors[key] = true
      console.error(`${moduleLabels[key]}请求失败：`, error)
    } finally {
      if (version === versions[key]) {
        loading[key] = false
      }
    }
  }

  const loadAlarmKpi = params => loadModule('alarmKpi', () => getAlarmKpi(params))
  const loadResult = params => loadModule('result', () => getResultKpi(params))
  const loadPie = params => loadModule('pie', () => getMinorPie(params), normalizeMinorPie)
  const loadLineAlarm = params => loadModule('lineAlarm', () => getAlarmTrend(params), normalizeTrendResponse)
  const loadRank = params => loadModule('rank', () => getTwoRob(params), normalizeTwoRob)
  const loadRankData = params => loadModule('rankData', () => getRankList(params), normalizeRankList)
  const loadJuvenile = params => loadModule('juvenile', () => getJuvenileTrend(params), normalizeJuvenile)
  const loadSpecialPoliceUnits = () => loadModule('specialPoliceUnits', () => getUnitOptions({ parentId: UNIT_PARENT_IDS.specialPolice }), normalizeUnitOptions)
  const loadCityBranchUnits = () => loadModule('cityBranchUnits', () => getUnitOptions({ parentId: UNIT_PARENT_IDS.cityBranch }), normalizeUnitOptions)

  const reloadRank = params => loadRank(params)
  const reloadRankData = params => loadRankData(params)
  const reloadJuvenile = params => loadJuvenile(params)

  const reloadSummary = params => Promise.allSettled([
    loadAlarmKpi(params),
    loadResult(params),
    loadPie(params),
    loadLineAlarm(params)
  ])

  const reloadMetrics = (params, panelParams = {}) => Promise.allSettled([
    reloadSummary(params),
    reloadRank(panelParams.rank || params),
    reloadRankData(panelParams.rankData || panelParams.rank || params),
    reloadJuvenile(panelParams.juvenile || params)
  ])

  const reload = (params, panelParams = {}) => Promise.allSettled([
    reloadMetrics(params, panelParams),
    loadSpecialPoliceUnits(),
    loadCityBranchUnits()
  ])

  return {
    dashboard,
    errors,
    errorMessage,
    updateTime,
    isLoading,
    reload,
    reloadJuvenile,
    reloadMetrics,
    reloadRank,
    reloadRankData,
    reloadSummary
  }
}
