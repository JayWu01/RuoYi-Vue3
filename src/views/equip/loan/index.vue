<script setup>
import { Check, Eye, Plus, RefreshCw, Send, Trash, Undo2, X } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  addLoan,
  approveLoan,
  cancelLoan,
  delLoan,
  getLoan,
  issueLoan,
  listLoan,
  rejectLoan,
  renewLoan,
  returnLoan
} from '@/api/equip'
import { addDateRange } from '@/utils/ruoyi'
import StatusTag from '../components/StatusTag.vue'
import { LOAN_STATUS, partsText } from '../constants'
import { defaultDeptId, equipCtx, findDeptName } from '../context'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const open = ref(false)
const detailOpen = ref(false)
const returnOpen = ref(false)
const renewOpen = ref(false)
const detail = ref({})
const formRef = ref(null)
const returnRef = ref(null)
const renewRef = ref(null)
const dateRange = ref([])

const query = reactive({ pageNum: 1, pageSize: 10, loanNo: '', status: '', borrowerName: '', params: {} })

const scope = computed(() => equipCtx.scope)
const items = computed(() => equipCtx.items)
const deptTree = computed(() => equipCtx.deptTree)
const isApprover = computed(() => !!scope.value.approver)

const form = reactive({
  loanDeptId: null,
  loanDeptName: '',
  borrowerName: '',
  borrowerPhone: '',
  loanDate: '',
  expectReturnDate: '',
  applyReason: '',
  remark: '',
  items: []
})

const returnForm = reactive({
  loanId: null,
  loanNo: '',
  returnDate: '',
  handleBy: '',
  partsCheck: '',
  attachUrl: '',
  remark: '',
  items: []
})

const renewForm = reactive({
  loanId: null,
  loanNo: '',
  oldReturnDate: '',
  newReturnDate: '',
  renewReason: ''
})

const rules = {
  loanDeptId: [{ required: true, message: '请选择借用单位', trigger: 'change' }],
  borrowerName: [{ required: true, message: '请填写实际借用人', trigger: 'blur' }],
  expectReturnDate: [{ required: true, message: '请设置预计归还日期', trigger: 'change' }]
}

const returnRules = {
  returnDate: [{ required: true, message: '请选择归还日期', trigger: 'change' }]
}

const renewRules = {
  newReturnDate: [{ required: true, message: '请选择新的归还日期', trigger: 'change' }]
}

const totalQty = computed(() => form.items.reduce((sum, row) => sum + (Number(row.qty) || 0), 0))

async function getList() {
  loading.value = true
  try {
    const params = addDateRange({ ...query, params: { ...query.params } }, dateRange.value)
    const res = await listLoan(params)
    list.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function filterOverdue() {
  query.params = query.params.overdue ? {} : { overdue: '1' }
  query.pageNum = 1
  getList()
}

function onDeptChange(deptId) {
  form.loanDeptName = findDeptName(deptId)
}

function addRow() {
  form.items.push({ itemId: null, qty: 1, partsInfo: '' })
}

function removeRow(index) {
  form.items.splice(index, 1)
}

function itemUnit(itemId) {
  return items.value.find(i => i.itemId === itemId)?.unit || ''
}

function handleAdd() {
  form.loanDeptId = defaultDeptId()
  form.loanDeptName = scope.value.deptName || findDeptName(form.loanDeptId)
  form.borrowerName = ''
  form.borrowerPhone = ''
  form.loanDate = new Date().toISOString().slice(0, 10)
  form.expectReturnDate = ''
  form.applyReason = ''
  form.remark = ''
  form.items = []
  addRow()
  open.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    if (!form.loanDeptName) {
      form.loanDeptName = findDeptName(form.loanDeptId)
    }
    if (!form.items.length) {
      ElMessage.warning('请至少添加一条借用明细')
      return
    }
    if (form.items.some(r => !r.itemId || !r.qty || r.qty <= 0)) {
      ElMessage.warning('请完整填写借用明细的装备和数量')
      return
    }
    await addLoan({ ...form })
    ElMessage.success('借用申请已提交，等待支队审批')
    open.value = false
    getList()
  })
}

async function handleApprove(row) {
  const { value } = await ElMessageBox.prompt('请输入审批意见（可留空）', `审批通过：${row.loanNo}`, {
    inputType: 'textarea',
    inputPlaceholder: '同意',
    confirmButtonText: '通过',
    cancelButtonText: '取消'
  })
  await approveLoan({ loanId: row.loanId, approveRemark: value || '同意' })
  ElMessage.success('审批已通过')
  getList()
}

async function handleReject(row) {
  const { value } = await ElMessageBox.prompt('请填写驳回原因（必填）', `驳回：${row.loanNo}`, {
    inputType: 'textarea',
    inputValidator: v => (v && v.trim() ? true : '驳回原因不能为空'),
    confirmButtonText: '驳回',
    cancelButtonText: '取消'
  })
  await rejectLoan({ loanId: row.loanId, approveRemark: value })
  ElMessage.success('已驳回')
  getList()
}

async function handleIssue(row) {
  await ElMessageBox.confirm(
    `确认发放借用单【${row.loanNo}】？发放后支队可用库存减少、借出数量增加。`,
    '借用发放',
    { type: 'warning' }
  )
  await issueLoan(row.loanId)
  ElMessage.success('发放完成，库存已更新')
  getList()
}

async function openReturn(row) {
  const res = await getLoan(row.loanId)
  const loan = res.data || {}
  returnForm.loanId = loan.loanId
  returnForm.loanNo = loan.loanNo
  returnForm.returnDate = new Date().toISOString().slice(0, 10)
  returnForm.handleBy = scope.value.userName || ''
  returnForm.partsCheck = ''
  returnForm.attachUrl = ''
  returnForm.remark = ''
  returnForm.items = (loan.items || []).map(item => ({
    itemId: item.itemId,
    itemName: item.itemName,
    unit: item.unit,
    pendingQty: item.pendingQty,
    returnQty: item.pendingQty,
    lostQty: 0,
    damagedQty: 0,
    partsInfo: item.partsInfo
  }))
  returnOpen.value = true
  nextTick(() => returnRef.value?.clearValidate())
}

function submitReturn() {
  returnRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    const details = returnForm.items.filter(i => (i.returnQty || 0) + (i.lostQty || 0) + (i.damagedQty || 0) > 0)
    if (!details.length) {
      ElMessage.warning('请填写归还、遗失或损坏数量')
      return
    }
    for (const detailRow of details) {
      const totalRow = (detailRow.returnQty || 0) + (detailRow.lostQty || 0) + (detailRow.damagedQty || 0)
      if (totalRow > detailRow.pendingQty) {
        ElMessage.warning(`【${detailRow.itemName}】归还数量合计不能超过待归还数量 ${detailRow.pendingQty}`)
        return
      }
    }
    await returnLoan({ ...returnForm, items: details })
    ElMessage.success('归还登记成功，库存已更新')
    returnOpen.value = false
    getList()
  })
}

function openRenew(row) {
  renewForm.loanId = row.loanId
  renewForm.loanNo = row.loanNo
  renewForm.oldReturnDate = row.expectReturnDate
  renewForm.newReturnDate = ''
  renewForm.renewReason = ''
  renewOpen.value = true
  nextTick(() => renewRef.value?.clearValidate())
}

function submitRenew() {
  renewRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    await renewLoan({ ...renewForm })
    ElMessage.success('续借成功')
    renewOpen.value = false
    getList()
  })
}

async function handleCancel(row) {
  await ElMessageBox.confirm(`确定撤销借用申请【${row.loanNo}】？`, '提示', { type: 'warning' })
  await cancelLoan(row.loanId)
  ElMessage.success('已撤销')
  getList()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除借用单【${row.loanNo}】？`, '提示', { type: 'warning' })
  await delLoan([row.loanId])
  ElMessage.success('删除成功')
  getList()
}

async function handleDetail(row) {
  const res = await getLoan(row.loanId)
  detail.value = res.data || {}
  detailOpen.value = true
}

onMounted(getList)
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>装备借用管理</h3>
        <div class="flex gap-2">
          <el-button v-hasPermi="['equip:loan:add']" type="primary" :icon="Plus" @click="handleAdd">
            借用申请
          </el-button>
          <el-button :type="query.params.overdue ? 'warning' : 'default'" @click="filterOverdue">
            {{ query.params.overdue ? '显示全部' : '只看逾期' }}
          </el-button>
          <el-button :icon="RefreshCw" @click="getList">
            刷新
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <div class="mb-3 flex flex-wrap items-center gap-2 text-[12px] text-[#93a9bd]">
          <span>流程：提交申请 → 支队审批 → 实际发放 → 归还登记（全部归还后自动关闭）</span>
          <span class="text-[#55708a]">｜</span>
          <span>借用装备不计入借用单位正式库存，所有权仍属支队</span>
        </div>
        <el-form :inline="true" :model="query" class="mb-3">
          <el-form-item label="借用单号">
            <el-input v-model="query.loanNo" placeholder="请输入单号" clearable style="width: 170px" @keyup.enter="getList" />
          </el-form-item>
          <el-form-item label="借用人">
            <el-input v-model="query.borrowerName" placeholder="请输入借用人" clearable style="width: 140px" @keyup.enter="getList" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 130px">
              <el-option v-for="(cfg, key) in LOAN_STATUS" :key="key" :label="cfg.label" :value="key" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList">
              查询
            </el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="list">
          <el-table-column label="借用单号" prop="loanNo" min-width="160" show-overflow-tooltip />
          <el-table-column label="借用单位" prop="loanDeptName" min-width="130" show-overflow-tooltip />
          <el-table-column label="实际借用人" prop="borrowerName" width="110" align="center" />
          <el-table-column label="借用数量" prop="totalQty" width="90" align="center" />
          <el-table-column label="借用日期" prop="loanDate" width="115" align="center" />
          <el-table-column label="预计归还" width="130" align="center">
            <template #default="{ row }">
              <span :class="row.overdueDays > 0 ? 'text-[#ff8f88]' : ''">{{ row.expectReturnDate || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120" align="center">
            <template #default="{ row }">
              <StatusTag :value="row.status" :map="LOAN_STATUS" />
              <span v-if="row.overdueDays > 0" class="ml-1 equip-tag equip-tag--danger">逾期{{ row.overdueDays }}天</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Eye" @click="handleDetail(row)">
                详情
              </el-button>
              <el-button
                v-if="isApprover && row.status === '0'"
                v-hasPermi="['equip:loan:approve']"
                link
                type="success"
                :icon="Check"
                @click="handleApprove(row)"
              >
                通过
              </el-button>
              <el-button
                v-if="isApprover && row.status === '0'"
                v-hasPermi="['equip:loan:approve']"
                link
                type="danger"
                :icon="X"
                @click="handleReject(row)"
              >
                驳回
              </el-button>
              <el-button
                v-if="row.status === '1'"
                v-hasPermi="['equip:loan:issue']"
                link
                type="success"
                :icon="Send"
                @click="handleIssue(row)"
              >
                发放
              </el-button>
              <el-button
                v-if="row.status === '2'"
                v-hasPermi="['equip:loan:return']"
                link
                type="primary"
                @click="openReturn(row)"
              >
                归还登记
              </el-button>
              <el-button
                v-if="row.status === '1' || row.status === '2'"
                v-hasPermi="['equip:loan:renew']"
                link
                type="warning"
                @click="openRenew(row)"
              >
                续借
              </el-button>
              <el-button
                v-if="row.status === '0' || row.status === '1'"
                v-hasPermi="['equip:loan:cancel']"
                link
                type="warning"
                :icon="Undo2"
                @click="handleCancel(row)"
              >
                撤销
              </el-button>
              <el-button
                v-if="row.status === '4' || row.status === '5'"
                v-hasPermi="['equip:loan:remove']"
                link
                type="danger"
                :icon="Trash"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          v-model:page="query.pageNum"
          v-model:limit="query.pageSize"
          :total="total"
          @pagination="getList"
        />
      </div>
    </section>

    <!-- 借用申请 -->
    <el-dialog v-model="open" title="装备借用申请" width="940px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="借用单位" prop="loanDeptId">
              <el-tree-select
                v-model="form.loanDeptId"
                :data="deptTree"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                check-strictly
                node-key="id"
                placeholder="请选择借用单位"
                style="width: 100%"
                @change="onDeptChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实际借用人" prop="borrowerName">
              <el-input v-model="form.borrowerName" placeholder="实际领取装备的人员" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input v-model="form.borrowerPhone" placeholder="选填" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="借用日期">
              <el-date-picker v-model="form.loanDate" type="date" value-format="YYYY-MM-DD" placeholder="借用日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预计归还日期" prop="expectReturnDate">
              <el-date-picker v-model="form.expectReturnDate" type="date" value-format="YYYY-MM-DD" placeholder="预计归还日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="借用事由">
              <el-input v-model="form.applyReason" placeholder="选填" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          借用明细（合计 {{ totalQty }}）
        </el-divider>
        <div class="mb-2 flex justify-end">
          <el-button size="small" type="primary" :icon="Plus" @click="addRow">
            添加明细
          </el-button>
        </div>
        <el-table :data="form.items" size="small" empty-text="请添加借用明细">
          <el-table-column label="装备" min-width="240">
            <template #default="{ row }">
              <el-select v-model="row.itemId" placeholder="选择装备" filterable style="width: 100%">
                <el-option v-for="item in items" :key="item.itemId" :label="item.itemName" :value="item.itemId">
                  <span>{{ item.itemName }}</span>
                  <span class="float-right text-[11px] text-[#6fa8ce]">{{ item.unit }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="130">
            <template #default="{ row }">
              <el-input-number v-model="row.qty" :min="1" :max="999999" size="small" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="单位" width="80" align="center">
            <template #default="{ row }">
              {{ itemUnit(row.itemId) }}
            </template>
          </el-table-column>
          <el-table-column label="配件及数量" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.partsInfo" placeholder="如：充电器:1" maxlength="200" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="70" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" :icon="Trash" @click="removeRow($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="open = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitForm">
          提交申请
        </el-button>
      </template>
    </el-dialog>

    <!-- 归还登记 -->
    <el-dialog v-model="returnOpen" :title="`归还登记：${returnForm.loanNo}`" width="900px" append-to-body>
      <el-form ref="returnRef" :model="returnForm" :rules="returnRules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="归还日期" prop="returnDate">
              <el-date-picker v-model="returnForm.returnDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="归还经办人">
              <el-input v-model="returnForm.handleBy" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="配件核对">
              <el-input v-model="returnForm.partsCheck" placeholder="如：配件齐全" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-table :data="returnForm.items" size="small">
          <el-table-column label="装备" prop="itemName" min-width="150" />
          <el-table-column label="待归还" prop="pendingQty" width="90" align="center" />
          <el-table-column label="正常归还" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.returnQty" :min="0" :max="row.pendingQty" size="small" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="遗失" width="110">
            <template #default="{ row }">
              <el-input-number v-model="row.lostQty" :min="0" :max="row.pendingQty" size="small" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="损坏" width="110">
            <template #default="{ row }">
              <el-input-number v-model="row.damagedQty" :min="0" :max="row.pendingQty" size="small" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="配件" prop="partsInfo" min-width="140">
            <template #default="{ row }">
              {{ partsText(row.partsInfo) }}
            </template>
          </el-table-column>
        </el-table>
        <el-form-item label="情况说明" class="mt-3">
          <el-input v-model="returnForm.remark" type="textarea" :rows="2" maxlength="300" placeholder="遗失/损坏需说明情况" />
        </el-form-item>
        <el-form-item label="相关附件">
          <file-upload v-model="returnForm.attachUrl" :limit="3" :file-size="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnOpen = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitReturn">
          确认归还
        </el-button>
      </template>
    </el-dialog>

    <!-- 续借 -->
    <el-dialog v-model="renewOpen" :title="`借用续期：${renewForm.loanNo}`" width="520px" append-to-body>
      <el-form ref="renewRef" :model="renewForm" :rules="renewRules" label-width="120px">
        <el-form-item label="原预计归还">
          <el-input :model-value="renewForm.oldReturnDate" disabled />
        </el-form-item>
        <el-form-item label="新预计归还" prop="newReturnDate">
          <el-date-picker v-model="renewForm.newReturnDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="续借原因">
          <el-input v-model="renewForm.renewReason" type="textarea" :rows="2" maxlength="300" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewOpen = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitRenew">
          确认续借
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情 -->
    <el-dialog v-model="detailOpen" title="借用单详情" width="900px" append-to-body>
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="借用单号">
          {{ detail.loanNo }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :value="detail.status" :map="LOAN_STATUS" />
        </el-descriptions-item>
        <el-descriptions-item label="借用单位">
          {{ detail.loanDeptName }}
        </el-descriptions-item>
        <el-descriptions-item label="实际借用人">
          {{ detail.borrowerName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ detail.borrowerPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="借用总数量">
          {{ detail.totalQty }}
        </el-descriptions-item>
        <el-descriptions-item label="借用日期">
          {{ detail.loanDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="预计归还">
          {{ detail.expectReturnDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="实际归还">
          {{ detail.actualReturnDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="已归还数量">
          {{ detail.returnedQty || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="遗失数量">
          {{ detail.lostQty || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="损坏数量">
          {{ detail.damagedQty || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="审批人">
          {{ detail.approveBy || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批时间">
          {{ detail.approveTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批意见">
          {{ detail.approveRemark || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">
        借用明细
      </el-divider>
      <el-table :data="detail.items || []" size="small">
        <el-table-column label="装备" prop="itemName" min-width="150" />
        <el-table-column label="借用" prop="qty" width="70" align="center" />
        <el-table-column label="已归还" prop="returnedQty" width="80" align="center" />
        <el-table-column label="遗失" prop="lostQty" width="70" align="center" />
        <el-table-column label="损坏" prop="damagedQty" width="70" align="center" />
        <el-table-column label="待归还" prop="pendingQty" width="80" align="center" />
        <el-table-column label="配件" min-width="130">
          <template #default="{ row }">
            {{ partsText(row.partsInfo) }}
          </template>
        </el-table-column>
      </el-table>

      <template v-if="detail.renews && detail.renews.length">
        <el-divider content-position="left">
          续借记录
        </el-divider>
        <el-table :data="detail.renews" size="small">
          <el-table-column label="原预计归还" prop="oldReturnDate" width="130" align="center" />
          <el-table-column label="新预计归还" prop="newReturnDate" width="130" align="center" />
          <el-table-column label="续借原因" prop="renewReason" min-width="180" />
          <el-table-column label="操作人" prop="operateBy" width="100" align="center" />
          <el-table-column label="操作时间" prop="operateTime" width="160" align="center" />
        </el-table>
      </template>

      <template v-if="detail.returns && detail.returns.length">
        <el-divider content-position="left">
          归还记录
        </el-divider>
        <el-table :data="detail.returns" size="small">
          <el-table-column label="归还单号" prop="returnNo" min-width="150" />
          <el-table-column label="归还日期" prop="returnDate" width="120" align="center" />
          <el-table-column label="正常归还" prop="returnQty" width="90" align="center" />
          <el-table-column label="遗失" prop="lostQty" width="70" align="center" />
          <el-table-column label="损坏" prop="damagedQty" width="70" align="center" />
          <el-table-column label="经办人" prop="handleBy" width="100" align="center" />
          <el-table-column label="情况说明" prop="remark" min-width="150" show-overflow-tooltip />
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>
