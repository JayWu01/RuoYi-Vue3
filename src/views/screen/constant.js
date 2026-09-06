export const PERIOD_OPTIONS = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]

export const UNIT_PARENT_IDS = {
  specialPolice: 101, // 特警支队单位
  cityBranch: 102 // 全市分局单位
}

const getLastYearRange = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const monthText = String(month + 1).padStart(2, '0')
  const day = today.getDate()
  const startDay = Math.min(day, new Date(year - 1, month + 1, 0).getDate())

  return {
    startDate: `${year - 1}-${monthText}-${String(startDay).padStart(2, '0')}`,
    endDate: `${year}-${monthText}-${String(day).padStart(2, '0')}`
  }
}

export const getCurrentYearRange = () => {
  const year = new Date().getFullYear()
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`
  }
}

export const createInitialQuery = () => ({
  ...getLastYearRange(),
  // deptName: '全部单位',
  // deptId: '全部单位',
  statType: 'day'
})

export const createEmptyDashboard = () => ({
  updateTime: '-',
  alarmKpi: {},
  result: {},
  pie: {
    total: 0,
    ratioCompareYesterday: '-',
    dataList: []
  },
  lineFugitive: {
    xAxis: [],
    seriesList: []
  },
  lineAlarm: {
    xAxis: [],
    seriesList: []
  },
  rank: { data: [] },
  juvenile: { data: [] },
  specialPoliceUnits: [],
  cityBranchUnits: []
})

export const MINOR_LEVELS = [
  {
    key: 'red',
    label: '红标',
    colorClass: 'bg-category-red'
  },
  {
    key: 'orange',
    label: '橙标',
    colorClass: 'bg-category-orange'
  },
  {
    key: 'yellow',
    label: '黄标',
    colorClass: 'bg-category-yellow'
  },
  {
    key: 'blue',
    label: '蓝标',
    colorClass: 'bg-category-blue'
  },
  {
    key: 'gray',
    label: '黑标',
    colorClass: 'bg-category-gray'
  }
]
