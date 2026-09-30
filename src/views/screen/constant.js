export const PERIOD_OPTIONS = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' }
]

export const UNIT_PARENT_IDS = {
  specialPolice: 101, // 特警支队单位
  cityBranch: 102 // 全市分局单位
}

export const getCurrentYearRange = () => {
  const year = new Date().getFullYear()
  return {
    startDate: `${year}-01-01 00:00:00`,
    endDate: `${year}-12-31 23:59:59`
  }
}

export const createInitialQuery = () => ({
  ...getCurrentYearRange(),
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
