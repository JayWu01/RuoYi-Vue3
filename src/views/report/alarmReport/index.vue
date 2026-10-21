<script setup>
import { Download, RefreshCw, Search } from '@lucide/vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { exportAlarmReport, getAlarmReportList, getAlarmUnitOptions } from '@/api/report/alarmReport'

const tableRef = ref(null)
const queryFormRef = ref(null)
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const unitOptions = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 100,
  // 默认选中上一个月（第一天 到 最后一天）
  alarmDate: [
    dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
    dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
  ],
  startDate: '',
  endDate: '',
  deptId: null
})

// 查询
const handleQuery = async () => {
  // 日期范围拆分为起止
  if (queryParams.alarmDate?.length === 2) {
    queryParams.startDate = queryParams.alarmDate[0]
    queryParams.endDate = queryParams.alarmDate[1]
  }
  loading.value = true
  const res = await getAlarmReportList(queryParams)
  if (res.code === 200) {
    tableData.value = res.rows
    total.value = res.total
  }
  loading.value = false
}

// 重置
const resetQuery = () => {
  queryFormRef.value.resetFields()
  queryParams.alarmDate = []
  queryParams.startDate = ''
  queryParams.endDate = ''
  queryParams.deptId = null
  handleQuery()
}

// 大队列：相邻同大队纵向合并单元格
const detSpanMethod = ({ row, rowIndex, column }) => {
  if (column.property !== 'detName') return
  const data = tableData.value
  if (rowIndex > 0 && data[rowIndex - 1].detName === row.detName) {
    return { rowspan: 0, colspan: 0 }
  }
  let span = 1
  for (let i = rowIndex + 1; i < data.length; i++) {
    if (data[i].detName === row.detName) span++
    else break
  }
  return { rowspan: span, colspan: 1 }
}

// 合计行：数值列求和
const getSummary = ({ columns, data }) => {
  const sumProps = ['totalAlarm', 'policeDispatch', 'transferAlarm', 'selfAlarm']
  return columns.map((column, index) => {
    if (index === 0) return '总计'
    if (sumProps.includes(column.property)) {
      const values = data.map(item => Number(item[column.property]) || 0)
      return values.reduce((acc, val) => acc + val, 0)
    }
    return ''
  })
}

const handleExport = async () => {
  if (queryParams.alarmDate?.length === 2) {
    queryParams.startDate = queryParams.alarmDate[0]
    queryParams.endDate = queryParams.alarmDate[1]
  }

  // 文件名与后端标题一致：2026年全市街面警务站接处警统计表（8.1-8.31）.xlsx
  let dateTitle = ''
  if (queryParams.startDate && queryParams.endDate) {
    const startStr = dayjs(queryParams.startDate).format('M.D')
    const endStr = dayjs(queryParams.endDate).format('M.D')
    dateTitle = `${startStr}-${endStr}`
  } else {
    dateTitle = '全部时段'
  }
  const year = queryParams.startDate ? `${dayjs(queryParams.startDate).format('YYYY')}年` : ''
  const fileName = `${year}全市街面警务站接处警统计表（${dateTitle}）.xlsx`

  const res = await exportAlarmReport({ ...queryParams })
  // 判断返回类型，如果是json说明后端报错
  if (res.type === 'application/json') {
    const reader = new FileReader()
    reader.onload = () => {
      const json = JSON.parse(reader.result)
      ElMessage.error(json.msg || '导出失败')
    }
    reader.readAsText(res)
    return
  }
  const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(a.href)
  document.body.removeChild(a)
}

onMounted(() => {
  handleQuery()
  getAlarmUnitOptions().then((list) => {
    unitOptions.value = list || []
  }).catch(() => {
    unitOptions.value = []
  })
})
</script>

<template>
  <div class="app-container">
    <!-- 查询区域 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true" size="small">
      <el-form-item label="接警日期" prop="alarmDate">
        <el-date-picker
          v-model="queryParams.alarmDate"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <!--      <el-form-item label="警务站"> -->
      <!--        <el-select v-model="queryParams.deptId" placeholder="全部警务站" clearable filterable class="w-[200px]"> -->
      <!--          <el-option -->
      <!--              v-for="unit in unitOptions" -->
      <!--              :key="unit.deptId" -->
      <!--              :label="unit.deptName" -->
      <!--              :value="unit.deptId" -->
      <!--          /> -->
      <!--        </el-select> -->
      <!--      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">
          搜索
        </el-button>
        <el-button :icon="RefreshCw" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="success" :icon="Download" @click="handleExport">
          导出报表
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格：大队列纵向合并，与纸质报表样式一致 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      border
      show-summary
      :summary-method="getSummary"
      :span-method="detSpanMethod"
    >
      <el-table-column label="大队" prop="detName" align="center" />
      <el-table-column label="警务站" prop="unitName" align="center" />
      <el-table-column label="总警情数" prop="totalAlarm" align="center" />
      <el-table-column label="110派警" prop="policeDispatch" align="center" />
      <el-table-column label="流出所转警" prop="transferAlarm" align="center" />
      <el-table-column label="自接警" prop="selfAlarm" align="center" />
      <el-table-column label="大队单站日警情数" prop="detDailyAvg" align="center" />
    </el-table>
    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="handleQuery"
    />
  </div>
</template>
