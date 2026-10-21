<script>
import { Download, Pencil, Plus, RefreshCw, Search, Trash2, Upload } from '@lucide/vue'
import { addPoliceAlarm, delPoliceAlarm, getPoliceAlarm, listPoliceAlarm, updatePoliceAlarm } from '@/api/bussiness/policeAlarm'
import ExcelImportDialog from '@/components/ExcelImportDialog'

export default {
  name: 'PoliceAlarm',
  components: { ExcelImportDialog },
  setup() {
    return { Download, Pencil, Plus, RefreshCw, Search, Trash2, Upload }
  },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      policeAlarmList: [],
      title: '',
      open: false,
      dateRange: [],
      form: {},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        alarmNo: undefined,
        alarmType: undefined,
        isValid: undefined
      },
      columns: {
        id: { label: '主键ID', visible: true },
        alarmNo: { label: '警情编号', visible: true },
        alarmTime: { label: '报警时间', visible: true },
        alarmAddr: { label: '报警地址', visible: true },
        alarmType: { label: '警情类型', visible: true },
        isValid: { label: '是否有效', visible: true },
        backup1: { label: '备用字段1', visible: false },
        backup2: { label: '备用字段2', visible: false },
        createTime: { label: '创建时间', visible: true },
        remark: { label: '备注', visible: true }
      },
      rules: {
        alarmNo: [
          { required: true, message: '警情编号不能为空', trigger: 'blur' }
        ],
        alarmTime: [
          { required: true, message: '报警时间不能为空', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listPoliceAlarm(this.addDateRange(this.queryParams, this.dateRange)).then((res) => {
        this.policeAlarmList = res.rows
        this.total = res.total
        this.loading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        id: undefined,
        alarmNo: undefined,
        alarmTime: undefined,
        alarmAddr: undefined,
        alarmType: undefined,
        isValid: '1',
        backup1: undefined,
        backup2: undefined,
        backup3: undefined,
        backup4: undefined,
        backup5: undefined,
        remark: undefined
      }
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增警情台账'
    },
    handleUpdate(row) {
      this.reset()
      const alarmId = row.id || this.ids
      getPoliceAlarm(alarmId).then((res) => {
        this.form = res.data
        this.open = true
        this.title = '修改警情台账'
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        if (this.form.id) {
          updatePoliceAlarm(this.form).then(() => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
        } else {
          addPoliceAlarm(this.form).then(() => {
            this.$modal.msgSuccess('新增成功')
            this.open = false
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      const idList = row.id || this.ids
      this.$modal.confirm('是否确认删除该警情台账数据？').then(() => {
        return delPoliceAlarm(idList)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    handleExport() {
      this.download('/bussiness/policeAlarm/export', { ...this.queryParams }, `police_alarm_${Date.now()}.xlsx`)
    },
    handleViewData(row) {
      this.$modal.msgInfo('可自行扩展详情抽屉/弹窗')
    },
    handleImport() {
      this.$refs.importRef.open()
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="content-inner">
      <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="80px">
        <el-form-item label="警情编号" prop="alarmNo">
          <el-input v-model="queryParams.alarmNo" placeholder="请输入警情编号" clearable class="w-[220px]" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="警情类型" prop="alarmType">
          <el-input v-model="queryParams.alarmType" placeholder="请输入警情类型" clearable class="w-[220px]" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="是否有效" prop="isValid">
          <el-select v-model="queryParams.isValid" placeholder="请选择是否有效" clearable class="w-[220px]">
            <el-option label="有效" value="1" />
            <el-option label="无效" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="报警时间">
          <el-date-picker v-model="dateRange" class="w-[240px]" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" size="mini" @click="handleQuery">
            搜索
          </el-button>
          <el-button :icon="RefreshCw" size="mini" @click="resetQuery">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button v-hasPermi="['business:policeAlarm:add']" type="primary" plain :icon="Plus" size="mini" @click="handleAdd">
            新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['business:policeAlarm:edit']" type="success" plain :icon="Pencil" size="mini" :disabled="single" @click="handleUpdate">
            修改
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['business:policeAlarm:remove']" type="danger" plain :icon="Trash2" size="mini" :disabled="multiple" @click="handleDelete">
            删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['business:policeAlarm:import']" type="info" plain :icon="Upload" size="mini" @click="handleImport">
            导入
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['business:policeAlarm:export']" type="warning" plain :icon="Download" size="mini" @click="handleExport">
            导出
          </el-button>
        </el-col>
        <right-toolbar v-model:show-search="showSearch" :columns="columns" @query-table="getList" />
      </el-row>

      <el-table v-loading="loading" :data="policeAlarmList" @selection-change="handleSelectionChange">
        <el-table-column label="是否有效" prop="isValid" align="center">
          <template #default="scope">
            <span>{{ scope.row.isValid === 1 ? '有效' : '无效' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="处理状态" prop="handleStatus" align="center" />
        <el-table-column label="接警类型" prop="alarmType" align="center" />
        <el-table-column label="警单编号" prop="alarmNo" align="center" />
        <el-table-column label="接警时间" prop="alarmTime" align="center" />
        <el-table-column label="事发地址" prop="incidentAddress" align="center" />
        <el-table-column label="报警内容" prop="alarmContent" align="center" show-overflow-tooltip />
        <el-table-column label="报警人名称" prop="alarmPersonName" align="center" />
        <el-table-column label="报警电话" prop="alarmPhone" align="center" />
        <el-table-column label="警情类别" prop="policeCategory" align="center" />
        <el-table-column label="警情类型" prop="policeType" align="center" />
        <el-table-column label="警情细类" prop="policeDetailType" align="center" />
        <el-table-column label="警情子类" prop="policeSubType" align="center" />
        <el-table-column label="接警员" prop="receivePoliceOfficer" align="center" />
        <el-table-column label="管辖单位" prop="jurisdictionUnit" align="center" />
        <el-table-column label="处警单位" prop="disposeUnit" align="center" />
        <el-table-column label="出警民警" prop="outPoliceOfficer" align="center" />
        <el-table-column label="处置时间" prop="disposeTime" align="center" />
        <el-table-column label="到场时间" prop="arriveTime" align="center" />
        <el-table-column label="现场反馈" prop="siteFeedback" align="center" show-overflow-tooltip />
        <el-table-column label="反馈时间" prop="feedbackTime" align="center" />
        <el-table-column label="反馈类别" prop="feedbackCategory" align="center" />
        <el-table-column label="反馈类型" prop="feedbackType" align="center" />
        <el-table-column label="反馈细类" prop="feedbackDetailType" align="center" />
        <el-table-column label="反馈子类" prop="feedbackSubType" align="center" />
        <el-table-column label="反馈内容" prop="feedbackContent" align="center" show-overflow-tooltip />
        <el-table-column label="处理结果" prop="disposeResult" align="center" />
        <el-table-column label="属地村社" prop="villageCommunity" align="center" />
        <el-table-column label="所属镇街" prop="townStreet" align="center" />
        <el-table-column label="所属中队" prop="belongSquad" align="center" />
        <el-table-column label="处警状态" prop="disposeState" align="center" />
        <el-table-column label="接警方式" prop="receiveAlarmWay" align="center" />
        <el-table-column label="接警编号" prop="receiveAlarmNo" align="center" />
      </el-table>
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model:visible="open" :title="title" width="720px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="警情编号" prop="alarmNo">
              <el-input v-model="form.alarmNo" placeholder="请输入警情编号" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="警情类型" prop="alarmType">
              <el-input v-model="form.alarmType" placeholder="请输入警情类型" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="报警时间" prop="alarmTime">
              <el-date-picker v-model="form.alarmTime" type="datetime" placeholder="请选择报警时间" value-format="yyyy-MM-dd HH:mm:ss" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否有效" prop="isValid">
              <el-radio-group v-model="form.isValid">
                <el-radio label="1">
                  有效
                </el-radio>
                <el-radio label="0">
                  无效
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="报警地址" prop="alarmAddr">
              <el-input v-model="form.alarmAddr" placeholder="请输入报警地址" maxlength="255" />
            </el-form-item>
          </el-col>
        </el-row>
        <!--        <el-row> -->
        <!--          <el-col :span="12"> -->
        <!--            <el-form-item label="备用字段1" prop="backup1"> -->
        <!--              <el-input v-model="form.backup1" placeholder="备用字段1" maxlength="255"/> -->
        <!--            </el-form-item> -->
        <!--          </el-col> -->
        <!--          <el-col :span="12"> -->
        <!--            <el-form-item label="备用字段2" prop="backup2"> -->
        <!--              <el-input v-model="form.backup2" placeholder="备用字段2" maxlength="255"/> -->
        <!--            </el-form-item> -->
        <!--          </el-col> -->
        <!--        </el-row> -->
        <!--        <el-row> -->
        <!--          <el-col :span="12"> -->
        <!--            <el-form-item label="备用字段3" prop="backup3"> -->
        <!--              <el-input v-model="form.backup3" placeholder="备用字段3" maxlength="255"/> -->
        <!--            </el-form-item> -->
        <!--          </el-col> -->
        <!--          <el-col :span="12"> -->
        <!--            <el-form-item label="备用字段4" prop="backup4"> -->
        <!--              <el-input v-model="form.backup4" placeholder="备用字段4" maxlength="255"/> -->
        <!--            </el-form-item> -->
        <!--          </el-col> -->
        <!--        </el-row> -->
        <!--        <el-row> -->
        <!--          <el-col :span="24"> -->
        <!--            <el-form-item label="备用字段5" prop="backup5"> -->
        <!--              <el-input v-model="form.backup5" placeholder="备用字段5" maxlength="255"/> -->
        <!--            </el-form-item> -->
        <!--          </el-col> -->
        <!--        </el-row> -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">
            确 定
          </el-button>
          <el-button @click="cancel">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <ExcelImportDialog ref="importRef" title="警情台账导入" action="/bussiness/policeAlarm/importData" template-action="/bussiness/policeAlarm/importTemplate" template-file-name="police_alarm_template" @success="getList" />
  </div>
</template>
