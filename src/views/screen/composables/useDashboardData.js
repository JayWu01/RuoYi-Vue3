import { computed, reactive, shallowRef } from 'vue'
import {
  getAlarmKpi,
  getAlarmTrend,
  getFugitiveTrend,
  getJuvenileTrend,
  getMinorPie,
  getRankList,
  getResultKpi,
  getUnitOptions,
  getTwoRob
} from '../api/policeDashboard'
import { createEmptyDashboard, UNIT_PARENT_IDS } from '../constant'

const moduleLabels = {
  alarmKpi: '接处警数据',
  result: '战果类数据',
  pie: '罪错未成年分布',
  lineFugitive: '网逃数据趋势',
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
  lineFugitive: false,
  lineAlarm: false,
  rank: false,
  rankData: false,
  juvenile: false,
  specialPoliceUnits: false,
  cityBranchUnits: false
})

export function useDashboardData() {
  const dashboard = shallowRef(createEmptyDashboard())
  const loading = reactive(createModuleState())
  const errors = reactive(createModuleState())

  const isLoading = computed(() => Object.values(loading).some(Boolean))
  const errorMessage = computed(() =>
    Object.keys(errors)
      .filter(key => errors[key])
      .map(key => `${moduleLabels[key]}加载失败`)
      .join('、')
  )

  const loadModule = async (key, request, updateDashboard) => {
    loading[key] = true
    errors[key] = false

    try {
      const data = await request()
      dashboard.value = {
        ...dashboard.value,
        ...updateDashboard(data)
      }
    } catch (error) {
      errors[key] = true
      console.error(`${moduleLabels[key]}请求失败：`, error)
    } finally {
      loading[key] = false
    }
  }

  // 接处警数据
  const loadAlarmKpi = params => loadModule('alarmKpi', () => getAlarmKpi(params), alarmKpi => ({ alarmKpi }))

  // 战果类数据
  const loadResult = params => loadModule('result', () => getResultKpi(params), result => ({ result }))

  // 罪错未成年分布
  const loadPie = params => loadModule('pie', () => getMinorPie(params), pie => ({ pie }))

  // 网逃数据趋势
  const loadLineFugitive = params => loadModule('lineFugitive', () => getFugitiveTrend(params), lineFugitive => ({ lineFugitive }))

  // 报警数据趋势
  const loadLineAlarm = params => loadModule('lineAlarm', () => getAlarmTrend(params), lineAlarm => ({ lineAlarm }))

  // 单位排名
  const loadRank = params => loadModule('rank', () => getTwoRob(params), rank => ({ rank }))

  // 警务站排名（顶部分类 + 单位横向柱状图）
  const loadRankData = params => loadModule('rankData', () => getRankList(params), rankData => ({ rankData }))

  // 青少年数据趋势
  const loadJuvenile = params => loadModule('juvenile', () => getJuvenileTrend(params), juvenile => ({ juvenile }))

  const reloadRank = params => loadRank(params)
  const reloadRankData = params => loadRankData(params)
  const reloadJuvenile = params => loadJuvenile(params)

  // 特警单位列表
  const loadSpecialPoliceUnits = () => loadModule('specialPoliceUnits', () => getUnitOptions({ parentId: UNIT_PARENT_IDS.specialPolice }), specialPoliceUnits => ({ specialPoliceUnits }))

  // 市局单位列表
  const loadCityBranchUnits = () => loadModule('cityBranchUnits', () => getUnitOptions({ parentId: UNIT_PARENT_IDS.cityBranch }), cityBranchUnits => ({ cityBranchUnits }))

  // 重新加载指标数据
  const reloadMetrics = (params, panelParams = {}) => {
    void loadAlarmKpi(params)
    void loadResult(params)
    void loadPie(params)
    void loadLineFugitive(params)
    void loadLineAlarm(params)
    void reloadRank(panelParams.rank || params)
    void reloadRankData(panelParams.rankData || panelParams.rank || params)
    void reloadJuvenile(panelParams.juvenile || params)
  }

  // 重新加载所有数据
  const reload = (params, panelParams = {}) => {
    reloadMetrics(params, panelParams)
    void loadSpecialPoliceUnits()
    void loadCityBranchUnits()
  }

  return {
    dashboard,
    errorMessage,
    isLoading,
    reload,
    reloadJuvenile,
    reloadMetrics,
    reloadRank,
    reloadRankData
  }
}
