import dayjs from 'dayjs'

export const PERIOD_OPTIONS = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]

const toParentId = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const UNIT_PARENT_IDS = {
  specialPolice: toParentId(import.meta.env.VITE_SCREEN_SPECIAL_POLICE_PARENT_ID, 101),
  cityBranch: toParentId(import.meta.env.VITE_SCREEN_CITY_BRANCH_PARENT_ID, 102)
}

export const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000

export const getCurrentYearRange = () => ({
  startDate: dayjs().startOf('year').format('YYYY-MM-DD HH:mm:ss'),
  endDate: dayjs().format('YYYY-MM-DD HH:mm:ss')
})

export const createInitialQuery = () => ({
  ...getCurrentYearRange(),
  statType: 'day'
})

export const createEmptyDashboard = () => ({
  alarmKpi: {},
  result: {},
  pie: {
    total: 0,
    ratioCompareYesterday: '-',
    unwarnedMinorCount: null,
    unwarnedMinorRatio: '-',
    dataList: []
  },
  lineAlarm: {
    xAxis: [],
    seriesList: []
  },
  rank: {
    xAxis: [],
    seriesList: []
  },
  rankData: {
    yAxis: [],
    series: []
  },
  juvenile: {
    xAxis: [],
    seriesList: []
  },
  specialPoliceUnits: [],
  cityBranchUnits: []
})

export const MINOR_LEVELS = [
  { key: 'red', label: '红标', color: '#ef6b62' },
  { key: 'orange', label: '橙标', color: '#f3a51c' },
  { key: 'yellow', label: '黄标', color: '#f5c35d' },
  { key: 'blue', label: '蓝标', color: '#526fa9' },
  { key: 'gray', label: '黑标', color: '#37424c' }
]
