const EMPTY_TREND = () => ({ xAxis: [], seriesList: [] })

const toRows = (data) => {
  if (Array.isArray(data)) {
    return data
  }
  return Array.isArray(data?.data) ? data.data : []
}

const toNumberSeries = list => (Array.isArray(list) ? list.map(item => Number(item) || 0) : [])

const normalizeSeriesList = seriesList => (Array.isArray(seriesList)
  ? seriesList.map(item => ({
      name: String(item?.name ?? ''),
      data: toNumberSeries(item?.data)
    }))
  : [])

const hasSeriesShape = data => Array.isArray(data?.xAxis) && Array.isArray(data?.seriesList)

export function normalizeTrendResponse(data) {
  if (!hasSeriesShape(data)) {
    return EMPTY_TREND()
  }

  return {
    xAxis: data.xAxis.map(item => String(item ?? '')),
    seriesList: normalizeSeriesList(data.seriesList)
  }
}

export function normalizeTwoRob(data) {
  if (hasSeriesShape(data)) {
    return normalizeTrendResponse(data)
  }

  const rows = toRows(data)
  if (!rows.length) {
    return EMPTY_TREND()
  }

  return {
    xAxis: rows.map(row => String(row?.statDate ?? '')),
    seriesList: [
      {
        name: '两抢一盗案件数',
        data: rows.map(row => Number(row?.monthTotal) || 0)
      }
    ]
  }
}

export function normalizeJuvenile(data) {
  const canonical = normalizeTrendResponse(data)
  const rows = toRows(data)

  if (!canonical.xAxis.length && rows.length) {
    return {
      xAxis: rows.map(row => String(row?.statDate ?? '')),
      seriesList: [
        {
          name: '未成年犯罪案件数',
          data: rows.map(row => Number(row?.minorCaseCount) || 0)
        },
        {
          name: '涉未成年人数',
          data: rows.map(row => Number(row?.minorPerson) || 0)
        }
      ]
    }
  }

  const seriesByName = new Map(canonical.seriesList.map(item => [item.name, item.data]))
  const names = ['未成年犯罪案件数', '涉未成年人数']

  return {
    xAxis: canonical.xAxis,
    seriesList: names.map((name, index) => ({
      name,
      data: seriesByName.get(name) ?? canonical.seriesList[index]?.data ?? []
    }))
  }
}

export function normalizeRankList(data) {
  const items = Array.isArray(data?.items) ? data.items : []

  // 新结构：后端已按部门（sys_dept）算好排名/环比/单站平均
  if (items.length) {
    return {
      dimension: String(data?.dimension ?? 'station'),
      rankType: String(data?.rankType ?? ''),
      items: items.map(item => ({
        deptId: item?.deptId ?? null,
        unitName: String(item?.unitName ?? ''),
        countNum: Number(item?.countNum) || 0,
        // 「其他单位」汇总行 rank/avgNum/stationCount 为 null，原样保留
        rank: item?.rank ?? null,
        ratioText: String(item?.ratioText ?? '-'),
        increaseNum: Number(item?.increaseNum) || 0,
        stationCount: item?.stationCount ?? null,
        avgNum: item?.avgNum ?? null
      }))
    }
  }

  // 兼容旧结构（yAxis + series），按顺序自己补排名
  const yAxis = Array.isArray(data?.yAxis) ? data.yAxis.map(item => String(item ?? '')) : []
  const series = toNumberSeries(data?.series)
  const ratioSeries = Array.isArray(data?.ratioSeries) ? data.ratioSeries : []
  const increaseSeries = toNumberSeries(data?.increaseSeries)
  const length = Math.min(yAxis.length, series.length)

  return {
    dimension: String(data?.dimension ?? 'station'),
    rankType: String(data?.rankType ?? ''),
    items: yAxis.slice(0, length).map((name, index) => ({
      deptId: null,
      unitName: name,
      countNum: series[index] ?? 0,
      rank: index + 1,
      ratioText: String(ratioSeries[index] ?? '-'),
      increaseNum: increaseSeries[index] ?? 0,
      stationCount: 0,
      avgNum: 0
    }))
  }
}

export function normalizeMinorPie(data) {
  const dataList = Array.isArray(data?.dataList)
    ? data.dataList.map(item => ({
        name: String(item?.name ?? ''),
        value: Number(item?.value) || 0,
        percent: String(item?.percent ?? '')
      }))
    : []
  const total = Number(data?.total)
  const sum = dataList.reduce((accumulator, item) => accumulator + item.value, 0)

  return {
    total: Number.isFinite(total) && total > 0 ? total : sum,
    ratioCompareYesterday: data?.ratioCompareYesterday ?? '-',
    unwarnedMinorCount: data?.unwarnedMinorCount ?? null,
    unwarnedMinorRatio: data?.unwarnedMinorRatio ?? '-',
    dataList
  }
}

export function normalizeUnitOptions(data) {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map(item => ({
    deptId: item?.deptId,
    deptName: String(item?.deptName ?? '')
  }))
}

export function normalizeRecord(data) {
  return data && typeof data === 'object' ? data : {}
}
