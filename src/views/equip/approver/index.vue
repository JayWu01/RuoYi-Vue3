<script setup>
import { Plus, RefreshCw, Trash } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { addApprover, delApprover, getEquipUsers, listApprover } from '@/api/equip'

const loading = ref(false)
const list = ref([])
const open = ref(false)
const formRef = ref(null)
const userOptions = ref([])
const userLoading = ref(false)
const query = reactive({ userName: '', status: '' })

const form = reactive({ userId: null, bizType: 'ALL', remark: '' })

const rules = {
  userId: [{ required: true, message: '请选择审批人', trigger: 'change' }]
}

const BIZ_TYPE_OPTIONS = [
  { value: 'ALL', label: '全部业务（领用+借用）' },
  { value: 'REQUISITION', label: '装备领用' },
  { value: 'LOAN', label: '装备借用' }
]

async function getList() {
  loading.value = true
  try {
    const res = await listApprover(query)
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

async function searchUsers(keyword) {
  userLoading.value = true
  try {
    const res = await getEquipUsers({ keyword })
    userOptions.value = res.data || []
  } finally {
    userLoading.value = false
  }
}

function handleAdd() {
  form.userId = null
  form.bizType = 'ALL'
  form.remark = ''
  searchUsers('')
  open.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    await addApprover({ ...form })
    ElMessage.success('审批人已添加')
    open.value = false
    getList()
  })
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定移除审批人【${row.nickName}】？`, '提示', { type: 'warning' })
  await delApprover([row.approverId])
  ElMessage.success('删除成功')
  getList()
}

function bizTypeText(value) {
  return BIZ_TYPE_OPTIONS.find(o => o.value === value)?.label || value
}

onMounted(getList)
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>装备审批人配置</h3>
        <div class="flex gap-2">
          <el-button v-hasPermi="['equip:approver:edit']" type="primary" :icon="Plus" @click="handleAdd">
            添加审批人
          </el-button>
          <el-button :icon="RefreshCw" @click="getList">
            刷新
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <div class="mb-3 text-[12px] text-[#93a9bd]">
          审批权限不写死在代码中：只有此处配置且状态为启用的账号，才能审批装备领用/借用申请（超级管理员默认具备审批权限）
        </div>
        <el-form :inline="true" :model="query" class="mb-3">
          <el-form-item label="用户">
            <el-input v-model="query.userName" placeholder="账号或姓名" clearable style="width: 180px" @keyup.enter="getList" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="启用" value="0" />
              <el-option label="停用" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList">
              查询
            </el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="list" empty-text="暂未配置审批人">
          <el-table-column label="账号" prop="userName" width="140" />
          <el-table-column label="姓名" prop="nickName" width="120" />
          <el-table-column label="所属单位" prop="deptName" min-width="160" show-overflow-tooltip />
          <el-table-column label="可审批业务" min-width="180">
            <template #default="{ row }">
              {{ bizTypeText(row.bizType) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <span class="equip-tag" :class="row.status === '0' ? 'equip-tag--success' : 'equip-tag--danger'">
                {{ row.status === '0' ? '启用' : '停用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="配置时间" prop="createTime" width="160" align="center" />
          <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button v-hasPermi="['equip:approver:edit']" link type="danger" :icon="Trash" @click="handleDelete(row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <el-dialog v-model="open" title="添加装备审批人" width="520px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="审批人" prop="userId">
          <el-select
            v-model="form.userId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="输入账号或姓名搜索"
            :remote-method="searchUsers"
            :loading="userLoading"
            style="width: 100%"
          >
            <el-option v-for="user in userOptions" :key="user.userId" :label="`${user.nickName}（${user.userName}）`" :value="user.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="可审批业务">
          <el-select v-model="form.bizType" style="width: 100%">
            <el-option v-for="opt in BIZ_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="open = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitForm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
