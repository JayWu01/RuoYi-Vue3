<script setup>
import { Download, Pencil, Plus, RefreshCw, Search, Trash2, Upload } from '@lucide/vue'
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import {
  addPoliceTwoRob,
  delPoliceTwoRob,
  getPoliceTwoRob,
  listPoliceTwoRob,
  updatePoliceTwoRob
} from '@/api/bussiness/policeTwoRob'
import ExcelImportDialog from '@/components/ExcelImportDialog'

/**
 * 获取全局方法
 */
const { proxy } = getCurrentInstance()

/**
 * 基础变量
 */
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const twoRobList = ref([])
const title = ref('')
const open = ref(false)

/**
 * 表单引用
 */
const queryFormRef = ref()
const formRef = ref()
const importRef = ref()

/**
 * 查询参数
 */
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  deptName: undefined,
  statDate: undefined
})

/**
 * 表单数据
 */
const form = reactive({})

/**
 * 列配置
 */
const columns = reactive({
  index: {
    label: '序号',
    visible: true
  },
  deptName: {
    label: '分局单位',
    visible: true
  },
  statDate: {
    label: '统计月份',
    visible: true
  },
  monthTotal: {
    label: '案件数',
    visible: true
  },
  createTime: {
    label: '创建时间',
    visible: true
  },
  remark: {
    label: '备注',
    visible: false
  },
  operation: {
    label: '操作',
    visible: true
  }
})

/**
 * 初始化
 */
onMounted(() => {
  getList()
})

/**
 * 查询列表
 */
function getList() {
  loading.value = true
  listPoliceTwoRob(queryParams)
    .then((response) => {
      twoRobList.value = response.rows
      total.value = response.total
    })
    .finally(() => {
      loading.value = false
    })
}

/**
 * 重置表单
 */
function reset() {
  Object.assign(form, {
    id: undefined,
    deptId: undefined,
    deptName: '',
    statDate: '',
    monthTotal: 0,
    remark: ''
  })
  proxy.resetForm('form')
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
}

// 表格选择
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 新增
function handleAdd() {
  reset()
  title.value = '新增两抢一盗发案数统计'
  open.value = true
}

// 修改
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  getPoliceTwoRob(id)
    .then((response) => {
      Object.assign(form, response.data)
      title.value = '修改两抢一盗发案数统计'
      open.value = true
    })
}

// 取消
function cancel() {
  open.value = false
  reset()
}

// 提交
function submitForm() {
  formRef.value.validate((valid) => {
    if (!valid) {
      return
    }
    if (form.id !== undefined) {
      updatePoliceTwoRob(form)
        .then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
    } else {
      addPoliceTwoRob(form)
        .then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
    }
  })
}

// 删除
function handleDelete(row) {
  const deleteIds = row.id || ids.value
  proxy.$modal.confirm(
    '是否确认删除该统计记录？'
  )
    .then(() => {
      return delPoliceTwoRob(deleteIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess(
        '删除成功'
      )
    })
    .catch(() => {
    })
}

// 导出
function handleExport() {
  proxy.download(
    'bussiness/twoRob/export',
    {
      ...queryParams
    },
    `两抢一盗发案数统计_${Date.now()}.xlsx`
  )
}

// 导入
function handleImport() {
  importRef.value.open()
}
</script>

<template>
  <div class="app-container">
    <div class="content-inner">
      <!-- 搜索区域 -->
      <el-form
        v-show="showSearch"
        ref="queryFormRef"
        :model="queryParams"
        size="small"
        :inline="true"
        label-width="80px"
      >
        <el-form-item label="分局单位" prop="deptName">
          <el-input
            v-model="queryParams.deptName"
            placeholder="请输入分局单位"
            clearable
            class="w-[220px]"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="统计月份" prop="statDate">
          <el-date-picker
            v-model="queryParams.statDate"
            class="w-[220px]"
            value-format="YYYY-MM"
            type="month"
            placeholder="选择月份"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            size="small"
            @click="handleQuery"
          >
            搜索
          </el-button>
          <el-button
            :icon="RefreshCw"
            size="small"
            @click="resetQuery"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 工具栏 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['bussiness:twoRob:add']"
            type="primary"
            plain
            :icon="Plus"
            size="small"
            @click="handleAdd"
          >
            新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['bussiness:twoRob:edit']"
            type="success"
            plain
            :icon="Pencil"
            size="small"
            :disabled="single"
            @click="handleUpdate"
          >
            修改
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['bussiness:twoRob:remove']"
            type="danger"
            plain
            :icon="Trash2"
            size="small"
            :disabled="multiple"
            @click="handleDelete"
          >
            删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['bussiness:twoRob:import']"
            type="info"
            plain
            :icon="Upload"
            size="small"
            @click="handleImport"
          >
            导入
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['bussiness:twoRob:export']"
            type="warning"
            plain
            :icon="Download"
            size="small"
            @click="handleExport"
          >
            导出
          </el-button>
        </el-col>
        <right-toolbar
          v-model:show-search="showSearch"
          :columns="columns"
          @query-table="getList"
        />
      </el-row>

      <!-- 表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="twoRobList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
        />
        <el-table-column
          v-if="columns.index.visible"
          label="序号"
          type="index"
          width="60"
          align="center"
        />
        <el-table-column
          v-if="columns.deptName.visible"
          label="分局单位"
          prop="deptName"
          align="center"
        />
        <el-table-column
          v-if="columns.statDate.visible"
          label="统计月份"
          prop="statDate"
          align="center"
          width="120"
        />
        <el-table-column
          v-if="columns.monthTotal.visible"
          label="案件数"
          prop="monthTotal"
          align="center"
          width="100"
        />
        <el-table-column
          v-if="columns.createTime.visible"
          label="创建时间"
          prop="createTime"
          align="center"
          width="160"
        />
        <el-table-column
          v-if="columns.remark.visible"
          label="备注"
          prop="remark"
          align="center"
          show-overflow-tooltip
        />

        <!-- 操作 -->
        <el-table-column
          v-if="columns.operation.visible"
          label="操作"
          align="center"
          width="160"
        >
          <template #default="{ row }">
            <el-button
              v-hasPermi="['bussiness:twoRob:edit']"
              link
              type="primary"
              :icon="Pencil"
              size="small"
              @click="handleUpdate(row)"
            >
              修改
            </el-button>
            <el-button
              v-hasPermi="['bussiness:twoRob:remove']"
              link
              type="danger"
              :icon="Trash2"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </div>

    <!-- 新增修改弹窗 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="800px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="form"
        label-width="100px"
      >
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item
              label="分局单位"
              prop="deptName"
            >
              <el-input v-model="form.deptName" placeholder="请输入分局单位" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="统计月份"
              prop="statDate"
            >
              <el-date-picker
                v-model="form.statDate"
                type="month"
                value-format="YYYY-MM"
                placeholder="选择月份"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="案件数"
              prop="monthTotal"
            >
              <el-input-number v-model="form.monthTotal" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button
          type="primary"
          @click="submitForm"
        >
          确 定
        </el-button>
        <el-button @click="cancel">
          取 消
        </el-button>
      </template>
    </el-dialog>

    <!-- 导入组件 -->
    <ExcelImportDialog
      ref="importRef"
      title="两抢一盗发案数统计导入"
      action="/bussiness/twoRob/importData"
      template-action="/bussiness/twoRob/importTemplate"
      template-file-name="两抢一盗发案数统计模板"
      update-support-label="是否更新已存在的统计数据"
      @success="getList"
    />
  </div>
</template>

<style scoped>
.content-inner {
  width: 100%;
}
</style>
