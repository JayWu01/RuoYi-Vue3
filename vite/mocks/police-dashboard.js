import { Buffer } from 'node:buffer'

const pad = value => String(value).padStart(2, '0')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const parseDate = (value) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/)
  if (!match) return null

  const [, year, month, day, hour = 0, minute = 0, second = 0] = match
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  )
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDay = date => `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const formatMonth = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

const createBuckets = (query) => {
  const end = parseDate(query.endDate) || new Date()
  const rawStart = parseDate(query.startDate) || end
  const start = rawStart > end ? end : rawStart
  const statType = query.statType || 'day'
  const buckets = []

  if (statType === 'month') {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
    const last = new Date(end.getFullYear(), end.getMonth(), 1)
    while (cursor <= last && buckets.length < 24) {
      buckets.push(formatMonth(cursor))
      cursor.setMonth(cursor.getMonth() + 1)
    }
  } else if (statType === 'week') {
    const cursor = new Date(end)
    cursor.setDate(cursor.getDate() - 7 * 11)
    for (let index = 0; index < 12 && cursor <= end; index += 1) {
      buckets.push(formatDay(cursor))
      cursor.setDate(cursor.getDate() + 7)
    }
  } else {
    const cursor = new Date(end)
    cursor.setDate(cursor.getDate() - 30)
    for (let index = 0; index < 31 && cursor <= end; index += 1) {
      buckets.push(formatDay(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  return buckets.length ? buckets : [formatDay(end)]
}

const hashString = (value) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const createSeries = (length, base, amplitude, seed) => {
  let state = seed || 1
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }

  return Array.from({ length }, (_, index) => Math.max(
    0,
    Math.round(
      base
      + Math.sin((index + (seed % 9)) / 2.2) * amplitude
      + random() * amplitude * 0.5
    )
  ))
}

const querySeed = (query, offset = 0) => hashString(JSON.stringify({
  deptId: query.deptId ?? '',
  statType: query.statType ?? '',
  rankType: query.rankType ?? '',
  offset
}))

const createAlarmKpi = () => ({
  totalAlarm: 1286,
  totalAlarmRatio: '+8.6%',
  selfAlarm: 764,
  selfAlarmRatio: '+5.2%',
  transferAlarm: 342,
  transferAlarmRatio: '-2.8%',
  policeDispatch: 180,
  policeDispatchRatio: '+4.1%'
})

const createResultKpi = () => ({
  netFugitiveCount: 86,
  netFugitiveRatio: '+12.4%',
  gangCount: 24,
  gangRatio: '-6.2%',
  currentArrestMinor: 113,
  currentArrestMinorRatio: '+9.7%',
  checkCarCount: 1560,
  checkCarCountRatio: '+5.1%',
  openDoorCount: 328,
  openDoorCountRatio: '+2.8%',
  doorPullAmount: 186500,
  doorPullAmountRatio: '+11.2%'
})

const createMinorPie = () => {
  const dataList = [
    { name: '红标', value: 32 },
    { name: '橙标', value: 25 },
    { name: '黄标', value: 28 },
    { name: '蓝标', value: 21 },
    { name: '黑标', value: 12 }
  ]
  const total = dataList.reduce((sum, item) => sum + item.value, 0)

  return {
    total,
    ratioCompareYesterday: '+3.2%',
    unwarnedMinorCount: 23,
    unwarnedMinorRatio: '-1.8%',
    dataList: dataList.map(item => ({
      ...item,
      percent: `${((item.value / total) * 100).toFixed(1)}%`
    }))
  }
}

const createFugitiveTrend = (query) => {
  const xAxis = createBuckets(query)
  return {
    xAxis,
    seriesList: [
      { name: '网逃抓获数', data: createSeries(xAxis.length, 28, 9, querySeed(query, 1)) },
      { name: '团伙抓获数', data: createSeries(xAxis.length, 12, 5, querySeed(query, 2)) }
    ]
  }
}

const createAlarmTrend = (query) => {
  const xAxis = createBuckets(query)
  return {
    xAxis,
    seriesList: [
      { name: '接处警总数', data: createSeries(xAxis.length, 86, 24, querySeed(query, 3)) },
      { name: '自接警', data: createSeries(xAxis.length, 52, 16, querySeed(query, 4)) },
      { name: '转警', data: createSeries(xAxis.length, 23, 8, querySeed(query, 5)) }
    ]
  }
}

const createTwoRob = (query) => {
  const xAxis = createBuckets({ ...query, statType: 'month' })
  return {
    xAxis,
    seriesList: [
      {
        name: '两抢一盗案件数',
        data: createSeries(xAxis.length, 46, 16, querySeed(query, 6))
      }
    ]
  }
}

const createJuvenile = (query) => {
  const xAxis = createBuckets({ ...query, statType: 'month' })
  return {
    xAxis,
    seriesList: [
      {
        name: '未成年犯罪案件数',
        data: createSeries(xAxis.length, 24, 9, querySeed(query, 7))
      },
      {
        name: '涉未成年人数',
        data: createSeries(xAxis.length, 16, 7, querySeed(query, 8))
      }
    ]
  }
}

const rankStations = [
  '八一广场警务站',
  '火车站警务站',
  '城南警务站',
  '高新警务站',
  '滨江警务站',
  '城北警务站',
  '经开区警务站',
  '老城警务站'
]

const rankBaseValues = {
  callPolice: [168, 152, 143, 126, 118, 97, 86, 74],
  netFugitive: [42, 38, 35, 31, 27, 22, 18, 15],
  minorBeat: [36, 31, 28, 25, 21, 18, 15, 12],
  pullCarDoor: [58, 52, 47, 41, 36, 30, 25, 19]
}

const createRankList = (query) => {
  const baseValues = rankBaseValues[query.rankType] || rankBaseValues.callPolice
  const seed = querySeed(query, 9)
  const ranked = rankStations
    .map((name, index) => ({
      name,
      value: Math.max(0, baseValues[index] + ((seed >> (index % 8)) % 7) - 3)
    }))
    .sort((left, right) => right.value - left.value)

  return {
    yAxis: ranked.map(item => item.name),
    series: ranked.map(item => item.value)
  }
}

const units = {
  101: [
    { deptId: '10101', deptName: '特警一大队' },
    { deptId: '10102', deptName: '特警二大队' },
    { deptId: '10103', deptName: '特警三大队' }
  ],
  102: [
    { deptId: '10201', deptName: '城北分局' },
    { deptId: '10202', deptName: '城南分局' },
    { deptId: '10203', deptName: '开发区分局' },
    { deptId: '10204', deptName: '滨江分局' }
  ]
}

const mockPaths = new Set([
  '/policeScreen/getAlarmKpi',
  '/policeScreen/getResultKpi',
  '/policeScreen/getMinorPie',
  '/policeScreen/getFugitiveTrend',
  '/policeScreen/getAlarmTrend',
  '/policeScreen/getTwoRob',
  '/policeScreen/getUnitRank',
  '/policeScreen/getJuvenileTrend',
  '/policeScreen/getRankList',
  '/system/dept/listByParentId'
])

const getMockData = (path, query) => {
  switch (path) {
    case '/policeScreen/getAlarmKpi':
      return createAlarmKpi()
    case '/policeScreen/getResultKpi':
      return createResultKpi()
    case '/policeScreen/getMinorPie':
      return createMinorPie()
    case '/policeScreen/getFugitiveTrend':
      return createFugitiveTrend(query)
    case '/policeScreen/getAlarmTrend':
      return createAlarmTrend(query)
    case '/policeScreen/getTwoRob':
    case '/policeScreen/getUnitRank':
      return createTwoRob(query)
    case '/policeScreen/getJuvenileTrend':
      return createJuvenile(query)
    case '/policeScreen/getRankList':
      return createRankList(query)
    case '/system/dept/listByParentId':
      return units[query.parentId] || []
    default:
      return undefined
  }
}

const readJsonBody = req => new Promise((resolve, reject) => {
  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8')
    resolve(body ? JSON.parse(body) : {})
  })
  req.on('error', reject)
})

export function createPoliceDashboardMock(apiPrefix = '/dev-api') {
  const prefix = apiPrefix.replace(/\/$/, '')

  return {
    name: 'police-dashboard-mock',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url || '/', 'http://localhost')
        if (!requestUrl.pathname.startsWith(prefix)) {
          next()
          return
        }

        const path = requestUrl.pathname.slice(prefix.length) || '/'
        if (!mockPaths.has(path)) {
          next()
          return
        }

        const query = req.method === 'GET'
          ? Object.fromEntries(requestUrl.searchParams)
          : await readJsonBody(req)

        await delay(120)

        const data = getMockData(path, query)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ code: 200, msg: '操作成功', data }))
      })
    }
  }
}
