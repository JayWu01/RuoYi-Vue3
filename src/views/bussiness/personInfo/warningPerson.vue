<template>
  <div class="app-container">
    <div class="page-header">
      <h2>⚠️重复线索预警列表</h2>
    </div>

    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryRef" inline>
      <el-form-item label="接警时间">
        <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getData">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 预警表格 -->
    <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;margin-top:10px"
    >
      <el-table-column label="警单编号" prop="receiveAlarmNo" align="center" />
      <el-table-column label="姓名" prop="personName" align="center" />
      <el-table-column label="身份证号" prop="cardNo" align="center" />
      <el-table-column label="手机号" prop="phoneNo" align="center" />
      <el-table-column label="性别" prop="gender" align="center" />
      <el-table-column label="接警时间" prop="alarmTime" align="center" />
      <el-table-column label="重复类型" prop="repeatType" align="center">
        <template #default="scope">
          <el-tag
              :type="getTagType(scope.row.repeatType)"
          >{{ scope.row.repeatType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right">
        <template #default="scope">
          <el-button type="text" icon="View" @click="openCompareDialog(scope.row)">查看警情对比</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getData"
    />

    <!-- 弹窗：本组警情对比 -->
    <el-dialog
        v-model="compareDialog.visible"
        title="重复线索组对比"
        width="85%"
        append-to-body
    >
      <el-table
          :data="compareDialog.tableData"
          border
          stripe
          :row-class-name="setRowClass"
      >
        <el-table-column label="警单编号" prop="receiveAlarmNo" align="center"/>
        <el-table-column label="姓名" prop="personName" align="center"/>
        <el-table-column label="身份证号" prop="cardNo" align="center"/>
        <el-table-column label="手机号" prop="phoneNo" align="center"/>
        <el-table-column label="性别" prop="gender" align="center"/>
        <el-table-column label="接警时间" prop="alarmTime" align="center"/>
        <el-table-column label="重复类型" prop="repeatType" align="center">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.repeatType)">{{ scope.row.repeatType }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="compareDialog.visible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getWarningList, getGroupPersonByAlarmIds } from '@/api/bussiness/personInfo'

const queryRef = ref(null)
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dateRange: [],
  beginTime: '',
  endTime: ''

})

// 弹窗
const compareDialog = ref({
  visible: false,
  tableData: []
})
// 当前点击的警号，用于高亮
const currentClickAlarmId = ref('')

/** 获取列表 */
const getData = async () => {
  loading.value = true
  // 把日期范围拆成beginTime、endTime传给后端
  if (queryParams.dateRange && queryParams.dateRange.length === 2) {
    queryParams.beginTime = queryParams.dateRange[0]
    queryParams.endTime = queryParams.dateRange[1]
  } else {
    queryParams.beginTime = ''
    queryParams.endTime = ''
  }
  const res = await getWarningList(queryParams)
  if (res.code === 200) {
    tableData.value = res.rows
    total.value = res.total
  }
  loading.value = false
}

/** 重置查询 */
const resetQuery = () => {
  queryRef.value.resetFields()
  queryParams.dateRange = []
  queryParams.beginTime = ''
  queryParams.endTime = ''
  getData()
}

/** 打开对比弹窗 */
const openCompareDialog = async (row) => {
  currentClickAlarmId.value = row.receiveAlarmNo
  // relatedAlarmIds 逗号分割，拿到本组全部警号
  const alarmIdArr = row.relatedAlarmIds.split(',')
  const res = await getGroupPersonByAlarmIds({ alarmIdList: alarmIdArr })
  if (res.code === 200) {
    compareDialog.value.tableData = res.rows
    compareDialog.value.visible = true
  }
}

/** 弹窗行高亮，标记当前点击的那条记录 */
const setRowClass = ({ row }) => {
  if (row.receiveAlarmNo === currentClickAlarmId.value) {
    return 'current-row'
  }
  return ''
}

/** 标签颜色 */
const getTagType = (type) => {
  if (type === '身份证重复') return 'danger'
  if (type === '手机号重复') return 'warning'
  if (type === '姓名疑似重复') return 'info'
  return ''
}
</script>

<style scoped>
/* 弹窗高亮行样式 */
:deep(.current-row) {
  background-color: #e6f7ff !important;
}
.page-header {
  margin-bottom:12px;
}
</style>