<script setup>
import { watchDebounced } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { computed, onMounted, shallowRef } from 'vue'
import { getRankList } from '../api/policeDashboard'
import ScreenToolbar from '../components/ScreenToolbar.vue'
import TrendChartPanel from '../components/TrendChartPanel.vue'
import { createInitialQuery } from '../constant'
import MinorDistributionPanel from '../modules/MinorDistributionPanel.vue'
import ResultPanel from '../modules/ResultPanel.vue'
import UnitRankPanel from '../modules/UnitRankPanel.vue'
import { normalizeRankList } from '../utils/normalizeScreenData'

// 分县局面板暂未接入数据，先持有独立的查询条件与单位列表，不与 SWAT 面板共享状态
const query = shallowRef(createInitialQuery())
const unitOptions = shallowRef([])
const loading = shallowRef(false)

// 左栏两个区域先以空数据渲染，后续替换为分县局自己的接口结果
const resultData = shallowRef({})
const minorDistributionData = shallowRef({})

// 中栏两个趋势模块各自维护时间选择与图表类型，同样不复用 SWAT 的状态
const rankTrendData = shallowRef({ xAxis: [], seriesList: [] })
const juvenileTrendData = shallowRef({ xAxis: [], seriesList: [] })
const rankTrendFilter = shallowRef({ monthRange: null })
const juvenileTrendFilter = shallowRef({ monthRange: null })
const rankChartType = shallowRef('line')
const juvenileChartType = shallowRef('line')

const updateRankMonthRange = (monthRange) => {
  rankTrendFilter.value = { ...rankTrendFilter.value, monthRange: monthRange ?? null }
}

const updateJuvenileMonthRange = (monthRange) => {
  juvenileTrendFilter.value = { ...juvenileTrendFilter.value, monthRange: monthRange ?? null }
}

// 右侧排名：已接入 /policeScreen/getRankList，部门全部来自 sys_dept，没数据的单位补 0
const rankData = shallowRef(normalizeRankList(null))
const rankType = shallowRef('callPolice')
const rankDimension = shallowRef('station')
const rankUnitId = shallowRef(null)
const rankLoading = shallowRef(false)
// 示例分县局占位，后续替换为分县局单位接口
const rankUnitOptions = [
  { deptId: 301, deptName: '红谷滩分局' },
  { deptId: 302, deptName: '东湖区分局' },
  { deptId: 303, deptName: '南昌县局' },
  { deptId: 304, deptName: '安义县局' }
]

const rankEmptyText = computed(() => {
  const unit = rankUnitOptions.find(item => item.deptId === rankUnitId.value)
  return unit ? `${unit.deptName}下辖派出所暂无排名数据` : '暂无分县局排名数据'
})

const isQueryValid = computed(() => Boolean(query.value.startDate && query.value.endDate))

// 排名面板：时间取顶部工具栏的日期范围，切指标/维度时自动重查
const loadRankData = async () => {
  rankLoading.value = true
  try {
    const response = await getRankList({
      startDate: query.value.startDate,
      endDate: query.value.endDate,
      rankType: rankType.value,
      rankDimension: rankDimension.value
    })
    rankData.value = normalizeRankList(response)
  } catch (error) {
    console.error('警务站排名请求失败：', error)
  } finally {
    rankLoading.value = false
  }
}

watchDebounced([rankType, rankDimension], () => {
  void loadRankData()
}, { debounce: 120 })

onMounted(() => {
  void loadRankData()
})

// 除右侧排名面板已接入 getRankList 外，其余分县局面板仍待接入；
// 点查询时只刷新已接线的排名
const loadData = () => {
  if (!isQueryValid.value) {
    ElMessage.warning('请选择完整的日期范围')
    return
  }
  void loadRankData()
}

const resetQuery = () => {
  query.value = createInitialQuery()
  rankTrendFilter.value = { monthRange: null }
  juvenileTrendFilter.value = { monthRange: null }
  rankType.value = 'callPolice'
  rankDimension.value = 'station'
  rankUnitId.value = null
  void loadRankData()
}
</script>

<template>
  <ScreenToolbar
    v-model="query"
    :unit-options="unitOptions"
    :loading="loading"
    @submit="loadData"
    @reset="resetQuery"
  />

  <main
    class="grid min-h-0 flex-1 grid-cols-1 gap-3 max-lg:grid-rows-layout-mobile lg:min-h-[84rem] lg:grid-cols-2 xl:min-h-0 xl:grid-cols-layout-desktop p-3 lg:p-4"
  >
    <div class="grid min-h-0 grid-rows-[18rem_22rem] gap-3 lg:row-span-2 lg:grid-rows-[1fr_1.32fr] xl:row-span-1">
      <ResultPanel :data="resultData" />
      <MinorDistributionPanel :data="minorDistributionData" />
    </div>

    <section class="grid min-h-0 grid-rows-layout-mobile-stack gap-3 lg:grid-rows-layout-stack">
      <TrendChartPanel
        v-model:chart-type="rankChartType"
        title="抢盗窃数据趋势"
        unit="(单位：起)"
        :data="rankTrendData"
        show-filters
        :show-unit-filter="false"
        :month-range="rankTrendFilter.monthRange"
        @change-month-range="updateRankMonthRange"
      />

      <TrendChartPanel
        v-model:chart-type="juvenileChartType"
        title="未成年人数趋势"
        unit="(单位：人)"
        :data="juvenileTrendData"
        show-filters
        :show-unit-filter="false"
        :month-range="juvenileTrendFilter.monthRange"
        @change-month-range="updateJuvenileMonthRange"
      />
    </section>

    <div class="grid min-h-0">
      <UnitRankPanel
        v-model:rank-type="rankType"
        v-model:rank-dimension="rankDimension"
        v-model:unit-id="rankUnitId"
        :data="rankData"
        :unit-options="rankUnitOptions"
        :empty-text="rankEmptyText"
        show-unit-filter
      />
    </div>
  </main>
</template>
