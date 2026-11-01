<script setup>
import { Check, RefreshCw, X } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import {
  approveLoan,
  approveRequisition,
  getLoan,
  getRequisition,
  listLoan,
  listRequisition,
  rejectLoan,
  rejectRequisition
} from '@/api/equip'
import StatusTag from '../components/StatusTag.vue'
import { LOAN_STATUS, partsText, REQ_STATUS } from '../constants'
import { equipCtx } from '../context'

const loading = ref(false)
const reqList = ref([])
const loanList = ref([])
const reqDetailOpen = ref(false)
const loanDetailOpen = ref(false)
const reqDetail = ref({})
const loanDetail = ref({})

const scope = computed(() => equipCtx.scope)
const isApprover = computed(() => !!scope.value.approver)

async function getData() {
  loading.value = true
  try {
    const [req, loan] = await Promise.all([
      listRequisition({ pageNum: 1, pageSize: 50, status: '0' }),
      listLoan({ pageNum: 1, pageSize: 50, status: '0' })
    ])
    reqList.value = req.rows || []
    loanList.value = loan.rows || []
  } finally {
    loading.value = false
  }
}

async function approveReq(row) {
  const { value } = await ElMessageBox.prompt('请输入审批意见（可留空）', `审批通过：${row.requisitionNo}`, {
    inputType: 'textarea',
    inputPlaceholder: '同意',
    confirmButtonText: '通过',
    cancelButtonText: '取消'
  })
  await approveRequisition({ requisitionId: row.requisitionId, approveRemark: value || '同意' })
  ElMessage.success('已通过')
  getData()
}

async function rejectReq(row) {
  const { value } = await ElMessageBox.prompt('请填写驳回原因（必填）', `驳回：${row.requisitionNo}`, {
    inputType: 'textarea',
    inputValidator: v => (v && v.trim() ? true : '驳回原因不能为空'),
    confirmButtonText: '驳回',
    cancelButtonText: '取消'
  })
  await rejectRequisition({ requisitionId: row.requisitionId, approveRemark: value })
  ElMessage.success('已驳回')
  getData()
}

async function approveLoanRow(row) {
  const { value } = await ElMessageBox.prompt('请输入审批意见（可留空）', `审批通过：${row.loanNo}`, {
    inputType: 'textarea',
    inputPlaceholder: '同意',
    confirmButtonText: '通过',
    cancelButtonText: '取消'
  })
  await approveLoan({ loanId: row.loanId, approveRemark: value || '同意' })
  ElMessage.success('已通过')
  getData()
}

async function rejectLoanRow(row) {
  const { value } = await ElMessageBox.prompt('请填写驳回原因（必填）', `驳回：${row.loanNo}`, {
    inputType: 'textarea',
    inputValidator: v => (v && v.trim() ? true : '驳回原因不能为空'),
    confirmButtonText: '驳回',
    cancelButtonText: '取消'
  })
  await rejectLoan({ loanId: row.loanId, approveRemark: value })
  ElMessage.success('已驳回')
  getData()
}

async function showReq(row) {
  const res = await getRequisition(row.requisitionId)
  reqDetail.value = res.data || {}
  reqDetailOpen.value = true
}

async function showLoan(row) {
  const res = await getLoan(row.loanId)
  loanDetail.value = res.data || {}
  loanDetailOpen.value = true
}

onMounted(getData)
</script>

<template>
  <div v-loading="loading" class="flex flex-col gap-4">
    <div class="equip-panel">
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <div class="text-[16px] font-semibold text-[#e9f5ff]">
            装备业务审批中心
          </div>
          <div class="mt-1 text-[12px] text-[#93a9bd]">
            审批权限由“审批人配置”统一维护；审批通过仅改变单据状态，实际发放/领取后才变更库存
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="!isApprover" class="equip-tag equip-tag--warn">当前账号未配置审批权限</span>
          <el-button :icon="RefreshCw" @click="getData">
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>待审批领用申请（{{ reqList.length }}）</h3>
      </div>
      <div class="equip-panel__body">
        <el-table :data="reqList" empty-text="暂无待审批领用申请">
          <el-table-column label="领用单号" prop="requisitionNo" min-width="160" show-overflow-tooltip />
          <el-table-column label="领用单位" prop="applyDeptName" min-width="130" show-overflow-tooltip />
          <el-table-column label="实际领取人" prop="receiverName" width="110" align="center" />
          <el-table-column label="数量" prop="totalQty" width="80" align="center" />
          <el-table-column label="申请事由" prop="applyReason" min-width="160" show-overflow-tooltip />
          <el-table-column label="申请人" prop="applyBy" width="100" align="center" />
          <el-table-column label="申请时间" prop="applyTime" width="160" align="center" />
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="showReq(row)">
                明细
              </el-button>
              <el-button v-hasPermi="['equip:requisition:approve']" link type="success" :icon="Check" @click="approveReq(row)">
                通过
              </el-button>
              <el-button v-hasPermi="['equip:requisition:approve']" link type="danger" :icon="X" @click="rejectReq(row)">
                驳回
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>待审批借用申请（{{ loanList.length }}）</h3>
      </div>
      <div class="equip-panel__body">
        <el-table :data="loanList" empty-text="暂无待审批借用申请">
          <el-table-column label="借用单号" prop="loanNo" min-width="160" show-overflow-tooltip />
          <el-table-column label="借用单位" prop="loanDeptName" min-width="130" show-overflow-tooltip />
          <el-table-column label="实际借用人" prop="borrowerName" width="110" align="center" />
          <el-table-column label="数量" prop="totalQty" width="80" align="center" />
          <el-table-column label="预计归还" prop="expectReturnDate" width="120" align="center" />
          <el-table-column label="借用事由" prop="applyReason" min-width="150" show-overflow-tooltip />
          <el-table-column label="申请时间" prop="applyTime" width="160" align="center" />
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="showLoan(row)">
                明细
              </el-button>
              <el-button v-hasPermi="['equip:loan:approve']" link type="success" :icon="Check" @click="approveLoanRow(row)">
                通过
              </el-button>
              <el-button v-hasPermi="['equip:loan:approve']" link type="danger" :icon="X" @click="rejectLoanRow(row)">
                驳回
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <el-dialog v-model="reqDetailOpen" title="领用申请明细" width="780px" append-to-body>
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="领用单号">
          {{ reqDetail.requisitionNo }}
        </el-descriptions-item>
        <el-descriptions-item label="领用单位">
          {{ reqDetail.applyDeptName }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :value="reqDetail.status" :map="REQ_STATUS" />
        </el-descriptions-item>
        <el-descriptions-item label="实际领取人">
          {{ reqDetail.receiverName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ reqDetail.receiverPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="总数量">
          {{ reqDetail.totalQty }}
        </el-descriptions-item>
        <el-descriptions-item label="申请事由" :span="3">
          {{ reqDetail.applyReason || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-table :data="reqDetail.items || []" size="small" class="mt-4">
        <el-table-column label="装备" prop="itemName" min-width="150" />
        <el-table-column label="数量" prop="qty" width="90" align="center" />
        <el-table-column label="单位" prop="unit" width="80" align="center" />
        <el-table-column label="配件" min-width="150">
          <template #default="{ row }">
            {{ partsText(row.partsInfo) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="loanDetailOpen" title="借用申请明细" width="780px" append-to-body>
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="借用单号">
          {{ loanDetail.loanNo }}
        </el-descriptions-item>
        <el-descriptions-item label="借用单位">
          {{ loanDetail.loanDeptName }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :value="loanDetail.status" :map="LOAN_STATUS" />
        </el-descriptions-item>
        <el-descriptions-item label="实际借用人">
          {{ loanDetail.borrowerName }}
        </el-descriptions-item>
        <el-descriptions-item label="借用日期">
          {{ loanDetail.loanDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="预计归还">
          {{ loanDetail.expectReturnDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="借用事由" :span="3">
          {{ loanDetail.applyReason || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-table :data="loanDetail.items || []" size="small" class="mt-4">
        <el-table-column label="装备" prop="itemName" min-width="150" />
        <el-table-column label="数量" prop="qty" width="90" align="center" />
        <el-table-column label="单位" prop="unit" width="80" align="center" />
        <el-table-column label="配件" min-width="150">
          <template #default="{ row }">
            {{ partsText(row.partsInfo) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
