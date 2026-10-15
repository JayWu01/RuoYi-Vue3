import { Buffer } from 'node:buffer'

const pad = value => String(value).padStart(2, '0')

const parseDate = (value) => {
  const date = new Date(`${value || ''}T00:00:00`)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

const getDateLabels = (query, limit = 31) => {
  const start = parseDate(query.startDate)
  const end = parseDate(query.endDate)
  const labels = []
  const cursor = new Date(start)
  const step = query.period === 'week' ? 7 : 1

  for (let index = 0; index < limit; index += 1) {
    if (cursor > end) {
      break
    }

    labels.push(`${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`)
    cursor.setDate(cursor.getDate() + step)
  }

  return labels.length ? labels : ['08-01']
}

const createSeries = (length, base, amplitude, offset = 0) =>
  Array.from({ length }, (_, index) => Math.max(
    0,
    Math.round(base + Math.sin((index + offset) / 2.2) * amplitude + (index % 5) * 7)
  ))

const createMetric = (value, rate, up = true) => ({
  value,
  rate: `${up ? '↑' : '↓'}${rate}%`,
  up
})

const createStats = (total, rates = ['↑6.4', '↑12.8', '↓3.1']) => ({
  monthTotal: total,
  lastMonth: `${rates[0]}%`,
  yoy: `${rates[1]}%`,
  wow: `${rates[2]}%`
})

const createAlarmKpi = () => ({
  updateTime: '2026-08-27 10:30:00',
  total: createMetric(1286, '8.6'),
  selfAlarm: createMetric(764, '5.2'),
  transfer: createMetric(342, '2.8', false),
  dispatch110: createMetric(180, '4.1')
})

const createResultKpi = () => ({
  fugitive: createMetric(86, '12.4'),
  gang: createMetric(24, '6.2', false),
  current: createMetric(113, '9.7')
})

const createMinorPie = () => ({
  red: 42,
  orange: 68,
  yellow: 96,
  blue: 124,
  gray: 37,
  dayChange: '↓4.8%'
})

const createFugitiveTrend = (query) => {
  const xAxis = getDateLabels(query)
  return {
    xAxis,
    caught: createSeries(xAxis.length, 260, 82),
    atLarge: createSeries(xAxis.length, 720, 140, 1),
    newlyAdded: createSeries(xAxis.length, 150, 56, 2)
  }
}

const createAlarmTrend = (query) => {
  const xAxis = getDateLabels(query)
  return {
    xAxis,
    self: createSeries(xAxis.length, 780, 180),
    transfer: createSeries(xAxis.length, 340, 96, 1),
    dispatch: createSeries(xAxis.length, 180, 58, 2)
  }
}

const createRank = (query) => {
  const xAxis = getDateLabels(query)
  const values = [142, 126, 108, 96, 83, 71]
  return {
    trend: {
      xAxis,
      robbery: createSeries(xAxis.length, 48, 18),
      theft: createSeries(xAxis.length, 82, 24, 1),
      pickpocket: createSeries(xAxis.length, 31, 12, 2)
    },
    units: ['城北派出所', '城南派出所', '开发区派出所', '火车站派出所', '滨江派出所', '新城派出所'],
    values,
    stats: createStats(values.reduce((sum, value) => sum + value, 0))
  }
}

const createJuvenile = (query) => {
  const xAxis = getDateLabels(query)
  const total = 268
  return {
    xAxis,
    self: createSeries(xAxis.length, 38, 15),
    transfer: createSeries(xAxis.length, 24, 10, 1),
    dispatch: createSeries(xAxis.length, 16, 8, 2),
    stats: createStats(total, ['↑4.2', '↑8.6', '↓2.4'])
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
  '/policeScreen/getTwoRob',
  '/policeScreen/getJuvenileTrend',
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
      return createRank(query)
    case '/policeScreen/getJuvenileTrend':
      return createJuvenile(query)
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

        const data = getMockData(path, query)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ code: 200, msg: '操作成功', data }))
      })
    }
  }
}
