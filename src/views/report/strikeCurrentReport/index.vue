<template>
  <div class="app-container">
    <!-- 查询区域 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" size="small">
      <el-form-item label="打击日期" prop="strikeDate">
        <el-date-picker
            v-model="queryParams.strikeDate"
            type="daterange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
        />
      </el-form-item>
<!--      <el-form-item label="警务站">-->
<!--        <el-select v-model="queryParams.deptId" placeholder="全部警务站" clearable>-->
<!--          <el-option label="八一广场警务站" value="1001"/>-->
<!--          <el-option label="滕王阁警务站" value="1002"/>-->
<!--          <el-option label="福州路警务站" value="1003"/>-->
<!--        </el-select>-->
<!--      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="success" icon="Download" @click="handleExport">导出双层表头报表</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table ref="tableRef" v-loading="loading" :data="tableData" border
              show-summary
              :summary-method="getSummary">
      <el-table-column label="单位" prop="unitName" align="center"/>
      <el-table-column label="呼号" prop="unitCode" align="center"/>
      <el-table-column label="敲打总人数" prop="totalPerson" align="center"/>
      <el-table-column label="红" prop="crimeRed" align="center"/>
      <el-table-column label="橙" prop="crimeOrange" align="center"/>
      <el-table-column label="黄" prop="crimeYellow" align="center"/>
      <el-table-column label="蓝" prop="crimeBlue" align="center"/>
      <el-table-column label="黑" prop="crimeBlack" align="center"/>
      <el-table-column label="非预警未成年人数" prop="unwarnedMinor" align="center"/>
      <el-table-column label="抓获嫌疑人数" prop="arrestSuspectCount" align="center"/>
      <el-table-column label="打掉团伙数量" prop="arrestGroupCount" align="center"/>
      <el-table-column label="检查车辆数" prop="checkCarCount" align="center"/>
      <el-table-column label="未关车门数" prop="openDoorCount" align="center"/>
    </el-table>
    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
// 引入独立api
import { getStrikeReportList, exportStrikeReport } from '@/api/report/strikeCurrentReport'
// Ruoyi 下载blob工具
import { download } from '@/utils/request'

const tableRef = ref(null)
const queryFormRef = ref(null)
const loading = ref(false)
const tableData = ref([])
const total = ref(0)


const queryParams = reactive({
  pageNum: 1,
  pageSize: 100,
  // 【修改】默认选中上一个月（第一天 到 最后一天）
  strikeDate: [
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
  if (queryParams.strikeDate?.length === 2) {
    queryParams.startDate = queryParams.strikeDate[0]
    queryParams.endDate = queryParams.strikeDate[1]
  }
  loading.value = true
  const res = await getStrikeReportList(queryParams)
  if (res.code === 200) {
    tableData.value = res.rows
    total.value = res.total
  }
  loading.value = false
}

//重置
const resetQuery = () => {
  queryFormRef.value.resetFields()
  queryParams.strikeDate = []
  queryParams.startDate = ''
  queryParams.endDate = ''
  queryParams.deptId = null
  handleQuery()
}

// 合计行：数值列求和
const getSummary = ({ columns, data }) => {
  const sumProps = ['totalPerson', 'crimeRed', 'crimeOrange', 'crimeYellow',
    'crimeBlue', 'crimeBlack', 'unwarnedMinor', 'arrestSuspectCount',
    'arrestGroupCount', 'checkCarCount', 'openDoorCount']
  return columns.map((column, index) => {
    if (index === 0) return '警务站合计'
    if (sumProps.includes(column.property)) {
      const values = data.map(item => Number(item[column.property]) || 0)
      return values.reduce((acc, val) => acc + val, 0)
    }
    return ''
  })
}



const handleExport = async () => {
  if (queryParams.strikeDate?.length === 2) {
    queryParams.startDate = queryParams.strikeDate[0]
    queryParams.endDate = queryParams.strikeDate[1]
  }

  let dateTitle = ''
  if (queryParams.startDate && queryParams.endDate) {
    // ✅ 重点：M月D日，不带年份，输出：10月1日-10月15日
    const startStr = dayjs(queryParams.startDate).format('M月D日')
    const endStr = dayjs(queryParams.endDate).format('M月D日')
    dateTitle = `${startStr}-${endStr}`
  } else {
    dateTitle = '全部时段'
  }
  const fileName = `全市警务站打击现行工作数据统计表（${dateTitle}）.xlsx`

  const res = await exportStrikeReport({ ...queryParams })
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
handleQuery()
</script>
