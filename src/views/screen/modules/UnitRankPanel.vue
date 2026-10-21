<script setup>
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import { createDashboardTooltip, useECharts } from '../composables/useECharts'

const props = defineProps({
  data: { type: Object, required: true, default: () => ({}) },
  rankType: { type: String, default: 'callPolice' },
  monthRange: { type: String },
  unitOptions: { type: Array },
  deptId: { type: [String, Number] },
  chartType: { type: String, default: 'bar' }
})

const emit = defineEmits([
  'change-chart',
  'change-month-range',
  'update-unit',
  'change-rank-type'
])

const chartRef = ref(null)
const { setOption } = useECharts(chartRef)

const rankTabList = ref([
  { label: '接处警', value: 'callPolice' },
  { label: '追网逃', value: 'netFugitive' },
  { label: '敲打未成年', value: 'minorBeat' },
  { label: '拉车门', value: 'pullCarDoor' }
])

function handleTabChange(val) {
  console.log('切换排名类型：', val)
  emit('change-rank-type', val)
}

/**
 * 动态计算坐标轴最大值和分割间隔，和另外两个图表保持一致
 * @param {number[]} values 数据数组
 * @returns { {max:number, interval:number} }
 */
function calcAxisMaxAndInterval(values) {
  const validValues = values.filter(v => typeof v === 'number')
  if (!validValues.length) {
    return { max: 5, interval: 1 }
  }
  const maxVal = Math.max(...validValues)
  if (maxVal === 0) {
    return { max: 5, interval: 1 }
  }
  const pow10 = 10 ** Math.floor(Math.log10(maxVal))
  let interval = pow10
  if (maxVal / pow10 > 5) interval = pow10 * 2
  else if (maxVal / pow10 > 2) interval = pow10
  else interval = pow10 / 5

  const max = Math.ceil(maxVal / interval) * interval
  return { max, interval }
}

const renderChart = () => {
  const yAxisData = props.data?.yAxis || []
  // 后端 SUM/COUNT 可能返回数字字符串，统一转成 Number，避免坐标轴计算失效
  const seriesData = (props.data?.series || []).map(v => Number(v) || 0)

  if (!yAxisData.length) {
    setOption({
      yAxis: { type: 'category', data: [] },
      xAxis: { type: 'value' },
      series: [],
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无数据',
          fill: '#a8b4c1',
          fontSize: 16,
          fontWeight: 'normal'
        },
        z: 100
      }
    })
    return
  }

  const allValues = [...seriesData]
  const { max, interval } = calcAxisMaxAndInterval(allValues)

  // ========== 核心：按排名设置不同柱子渐变色，区分单位 ==========
  const barColorList = seriesData.map((_, index) => {
    if (index === 0) {
      // 第1名 橙红
      return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
        { offset: 0, color: '#ff4c3b' },
        { offset: 1, color: '#ff9547' }
      ])
    } else if (index === 1) {
      // 第2名 橙色
      return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
        { offset: 0, color: '#ff7b26' },
        { offset: 1, color: '#ffc048' }
      ])
    } else if (index === 2) {
      // 第3名 黄色
      return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
        { offset: 0, color: '#f8c220' },
        { offset: 1, color: '#ffe470' }
      ])
    } else {
      // 第4名往后 蓝色渐变
      return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
        { offset: 0, color: '#318bff' },
        { offset: 1, color: '#64c7ff' }
      ])
    }
  })

  // 数据条数少时加大柱宽，避免面板被少数几根细柱衬得空旷
  const barWidth = yAxisData.length <= 3 ? 30 : yAxisData.length <= 6 ? 24 : 16

  setOption({
    backgroundColor: 'transparent',
    tooltip: createDashboardTooltip(),
    grid: {
      left: 140, // 加宽左侧，放【排名 + 警务站名称】
      right: 30,
      // 无图例，顶部只留极小边距，避免柱区上方出现大片空白
      top: 14,
      bottom: 8,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      // 核心：强制整数刻度
      min: 0,
      max,
      interval,
      splitLine: {
        lineStyle: { color: 'rgba(72,108,132,.28)', type: 'dashed' }
      },
      axisLabel: { color: '#a8b4c1' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      // Y轴文字拼接【排名 警务站名称】，例如：1  八一广场警务站
      data: yAxisData.map((name, idx) => `${idx + 1}　${name}`),
      inverse: true, // ✅ 数组第0项渲染在图表最上方
      axisLine: { lineStyle: { color: '#38536a' } },
      axisLabel: {
        color: '#a8b4c1',
        align: 'right',
        fontSize: 15,
        lineHeight: 22
      },
      axisTick: { show: false }
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        barWidth,
        data: seriesData,
        itemStyle: {
          color(params) {
            return barColorList[params.dataIndex]
          }
        },
        label: {
          show: true,
          position: 'right',
          color: '#ffffff',
          fontSize: 12
        }
      }
    ]
  })
}

watch(() => props.data, renderChart, { deep: true })
onMounted(renderChart)
</script>

<template>
  <ScreenPanel title="警务站排名" unit="(单位：起)">
    <div class="flex flex-col min-h-0 h-full">
      <!-- 紧凑选项卡：贴近面板头部，少占高度，把空间让给图表 -->
      <div class="mb-4 flex shrink-0 gap-1.5">
        <div
          v-for="tab in rankTabList"
          :key="tab.value"
          class="relative z-10 cursor-pointer whitespace-nowrap rounded border text-sm px-3 py-1.5 transition-all duration-200"
          :class="rankType === tab.value
            ? 'border-[#3498ff] bg-gradient-to-r from-[#185299] to-[#2470cc] text-white shadow-[0_0_8px_rgba(52,152,255,0.35)]'
            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-800'"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
          </button>
        </div>

        <!-- 面板内筛选：时间范围 + 单位，独立于顶部工具栏 -->
        <div class="mb-2 flex shrink-0 items-center gap-2 px-3">
          <span class="whitespace-nowrap text-sm text-muted">日期范围</span>
          <el-date-picker
            :model-value="dateRange"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            size="small"
            popper-class="dashboard-popper"
            class="dashboard-date-picker min-w-0 flex-1"
            @update:model-value="emit('change-date-range', $event)"
          />
          <!--        <el-select -->
          <!--            popper-class="dashboard-popper" -->
          <!--            class="dashboard-select min-w-0 flex-1" -->
          <!--            :model-value="deptId" -->
          <!--            clearable -->
          <!--            size="small" -->
          <!--            placeholder="全部单位" -->
          <!--            @update:model-value="emit('update-unit', $event)" -->
          <!--        > -->
          <!--          <el-option label="全部单位" :value="null"/> -->
          <!--          <el-option v-for="unit in unitOptions" :key="unit.deptId" :label="unit.deptName" :value="unit.deptId" /> -->
          <!--        </el-select> -->
        </div>

        <!-- 排名表格：排名 | 名称 | 数据(条状图+数值) -->
        <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          <table class="w-full table-fixed border-collapse text-[0.8125rem]">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#0e3a61]">
                <th class="w-14 border border-[#1e4a73] px-2 py-1.5 font-bold text-slate-100">
                  排名
                </th>
                <th class="border border-[#1e4a73] px-2 py-1.5 font-bold text-slate-100">
                  名称
                </th>
                <th class="w-[46%] border border-[#1e4a73] px-2 py-1.5 font-bold text-slate-100">
                  数据
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!rows.length">
                <td colspan="3" class="border border-[#1e4a73] px-2 py-6 text-center text-slate-400">
                  暂无数据
                </td>
              </tr>
              <tr
                v-for="(row, index) in rows"
                :key="row.name"
                class="transition-colors hover:bg-[#123a60]/60"
              >
                <td class="border border-[#1e4a73] px-2 py-1.5 text-center text-slate-300">
                  {{ index + 1 }}
                </td>
                <td class="border border-[#1e4a73] px-2 py-1.5 text-center text-slate-200">
                  <span class="block truncate" :title="row.name">{{ row.name }}</span>
                </td>
                <td class="border border-[#1e4a73] px-2 py-1.5">
                  <div class="flex items-center gap-2">
                    <div class="h-3.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-[#0b2440]/70">
                      <div
                        class="h-full rounded-sm"
                        :style="{ width: barWidthStyle(row.value), background: barColor(index) }"
                      />
                    </div>
                    <span class="w-9 shrink-0 text-right font-bold text-white">{{ row.value }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </ScreenPanel>
</template>
