<script setup>
import { onMounted, ref, watch } from 'vue'
import ChartTypeToggle from '../components/ChartTypeToggle.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import { createDashboardTooltip, useECharts } from '../composables/useECharts'

const props = defineProps({
  data: { type: Object, required: true },
  monthRange: { type: Array, default: null },
  chartType: { type: String, required: true },
  unitOptions: { type: Array, default: () => [] },
  deptId: { type: [String, Number], default: null }
})

const emit = defineEmits(['change-month-range', 'change-chart', 'update-unit'])
const chartRef = ref(null)
const { setOption } = useECharts(chartRef)

/**
 * 动态计算坐标轴最大值和分割间隔
 * @param {number[]} values 数据数组
 * @returns { {max:number, interval:number} }
 */
function calcAxisMaxAndInterval(values) {
  // 过滤掉空值
  const validValues = values.filter(v => typeof v === 'number')
  if (!validValues.length) {
    return { max: 5, interval: 1 }
  }
  const maxVal = Math.max(...validValues)
  if (maxVal === 0) {
    return { max: 5, interval: 1 }
  }
  const pow10 = Math.pow(10, Math.floor(Math.log10(maxVal)))
  let interval = pow10
  if (maxVal / pow10 > 5) interval = pow10 * 2
  else if (maxVal / pow10 > 2) interval = pow10
  else interval = pow10 / 5

  const max = Math.ceil(maxVal / interval) * interval
  return { max, interval }
}

const renderChart = () => {
  const raw = props.data.data || props.data;
  let dataList;
  if (raw && raw.seriesList && Array.isArray(raw.seriesList) && raw.xAxis) {
    const seriesMap = {};
    raw.seriesList.forEach(ser => {
      seriesMap[ser.name] = ser.data;
    });
    const caseData = seriesMap['未成年犯罪案件数'] || [];
    const personData = seriesMap['涉未成年人数'] || [];
    dataList = raw.xAxis.map((date, idx) => ({
      statDate: date,
      minorCaseCount: caseData[idx] || 0,
      minorPerson: personData[idx] || 0
    }));
  } else {
    dataList = raw || [];
  }

  // 空数据保护
  if (!dataList.length) {
    setOption({
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
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

  const caseArr = dataList.map(item => Number(item.minorCaseCount || 0))
  const personArr = dataList.map(item => Number(item.minorPerson || 0))
  // 合并两组数据，取整体最大值用于Y轴
  const allValues = [...caseArr, ...personArr]
  const { max, interval } = calcAxisMaxAndInterval(allValues)

  const colors = ['#6b96e8', '#86c75b']
  const lineChartData = [
    {
      name: '未成年犯罪案件数',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 12,
      data: caseArr,
      lineStyle: { width: 5, color: colors[0] },
      itemStyle: { color: colors[0] }
    },
    {
      name: '涉未成年人数',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 12,
      data: personArr,
      lineStyle: { width: 5, color: colors[1] },
      itemStyle: { color: colors[1] }
    }
  ]

  const barChartData = [
    {
      name: '未成年犯罪案件数',
      type: 'bar',
      barWidth: 7,
      data: caseArr,
      itemStyle: { color: colors[0] }
    },
    {
      name: '涉未成年人数',
      type: 'bar',
      barWidth: 7,
      data: personArr,
      itemStyle: { color: colors[1] }
    }
  ]

  // 根据数据条数动态设置dataZoom范围：少于12条全部展示，多于12条默认只展示12个
  const dataCount = dataList.length
  const endPercent = dataCount > 12 ? 100 : (12 / dataCount) * 100

  setOption({
    legend: {
      top: 8,
      left: 12,
      itemWidth: 18,
      itemHeight: 4,
      itemGap: 18,
      icon: 'roundRect',
      textStyle: { color: '#a8b4c1', fontSize: 12 }
    },
    tooltip: createDashboardTooltip(),
    grid: { left: 42, right: 18, top: 46, bottom: 70, containLabel: true },
    dataZoom: [
      {
        type: 'slider', // 底部滑动条
        show: true,
        height: 14,
        bottom: 10,
        start: 0,
        end: endPercent,
        zoomLock: false,
        handleStyle: { color: '#6b96e8' },
        textStyle: { color: '#a8b4c1' }
      },
      {
        type: 'inside' // 鼠标滚轮缩放平移（大屏鼠标操作）
      }
    ],
    xAxis: {
      data: dataList.map(item => item.statDate),
      axisLabel: {
        color: '#a8b4c1',
        rotate: 30
      },
      axisLine: { lineStyle: { color: '#38536a' } },
      axisTick: { show: false }
    },
    yAxis: {
      min: 0,
      max: max,
      interval: interval,
      splitLine: {
        lineStyle: { color: 'rgba(72,108,132,.28)', type: 'dashed' }
      },
      axisLabel: { color: '#a8b4c1' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: props.chartType === 'line' ? lineChartData : barChartData
  })
}

watch(() => [props.data, props.chartType], renderChart, { deep: true })
onMounted(renderChart)
</script>

<template>
  <ScreenPanel title="未成年人数趋势" unit="(单位：人)">
    <template #actions>
      <ChartTypeToggle :model-value="chartType" @update:model-value="emit('change-chart', $event)" />
    </template>

    <div class="flex min-w-0 items-center justify-end gap-2 px-4">
      <el-date-picker
          :model-value="monthRange"
          type="monthrange"
          format="YYYY-MM"
          value-format="YYYY-MM"
          range-separator="~"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          clearable
          size="small"
          popper-class="dashboard-popper"
          class="dashboard-date-picker min-w-0 flex-1"
          @update:model-value="emit('change-month-range', $event)"
      />
      <el-select
          popper-class="dashboard-popper"
          class="dashboard-select min-w-0 flex-1"
          :model-value="deptId"
          clearable
          size="small"
          placeholder="全部单位"
          @update:model-value="emit('update-unit', $event)"
      >
        <el-option label="全部单位" :value="null"/>
        <el-option v-for="unit in unitOptions" :key="unit.deptId" :label="unit.deptName" :value="unit.deptId" />
      </el-select>
    </div>

    <div ref="chartRef" class="min-h-0 flex-1 w-full" />
  </ScreenPanel>
</template>
