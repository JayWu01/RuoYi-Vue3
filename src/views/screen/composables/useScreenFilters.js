import { computed, shallowRef } from 'vue'
import { createInitialQuery } from '../constant'

const pad2 = value => String(value).padStart(2, '0')
const normalizeMonth = value => String(value ?? '').slice(0, 7)
const isMonth = value => /^\d{4}-\d{2}$/.test(value)

export const createPanelFilter = () => ({
  monthRange: [],
  deptId: null,
  deptName: undefined
})

export function useScreenFilters() {
  const query = shallowRef(createInitialQuery())
  const rankFilter = shallowRef(createPanelFilter())
  const juvenileFilter = shallowRef(createPanelFilter())
  const rankType = shallowRef('callPolice')
  const alarmChartType = shallowRef('line')
  const rankChartType = shallowRef('line')
  const juvenileChartType = shallowRef('line')

  const isQueryValid = computed(() => Boolean(query.value.startDate && query.value.endDate))

  const toMonthDateRange = (monthRange) => {
    if (!Array.isArray(monthRange) || monthRange.length !== 2) {
      return null
    }

    const startMonth = normalizeMonth(monthRange[0])
    const endMonth = normalizeMonth(monthRange[1])
    if (!isMonth(startMonth) || !isMonth(endMonth)) {
      return null
    }

    const [year, month] = endMonth.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()

    return {
      startDate: `${startMonth}-01 00:00:00`,
      endDate: `${endMonth}-${pad2(lastDay)} 23:59:59`
    }
  }

  const createPanelQuery = (filter = {}) => ({
    ...query.value,
    statType: 'month',
    ...(toMonthDateRange(filter.monthRange) ?? {}),
    deptId: filter.deptId ?? null,
    deptName: filter.deptName
  })

  const getPanelParams = () => ({
    rank: { ...createPanelQuery(rankFilter.value), rankType: rankType.value },
    juvenile: createPanelQuery(juvenileFilter.value)
  })

  const updateRankMonthRange = (monthRange) => {
    rankFilter.value = { ...rankFilter.value, monthRange: monthRange ?? null }
  }

  const updateJuvenileMonthRange = (monthRange) => {
    juvenileFilter.value = { ...juvenileFilter.value, monthRange: monthRange ?? null }
  }

  const updateRankUnit = ({ deptId, deptName }) => {
    rankFilter.value = { ...rankFilter.value, deptId, deptName }
  }

  const updateJuvenileUnit = ({ deptId, deptName }) => {
    juvenileFilter.value = { ...juvenileFilter.value, deptId, deptName }
  }

  const resetFilters = () => {
    query.value = createInitialQuery()
    rankFilter.value = createPanelFilter()
    juvenileFilter.value = createPanelFilter()
    rankType.value = 'callPolice'
    alarmChartType.value = 'line'
    rankChartType.value = 'line'
    juvenileChartType.value = 'line'
  }

  return {
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
  }
}
