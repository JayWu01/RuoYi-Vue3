<script setup>
import { Check, Eye, RefreshCw, Trash, X } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import {
  approveLoan,
  approveRequisition,
  delMessage,
  getLoan,
  getRequisition,
  listMessage,
  readAllMessage,
  readMessage,
  rejectLoan,
  rejectRequisition
} from '@/api/equip'
import auth from '@/plugins/auth'
import StatusTag from '../components/StatusTag.vue'
import { LOAN_STATUS, MSG_TYPE, partsText, REQ_STATUS } from '../constants'
import { equipCtx, loadEquipCtx, setUnread } from '../context'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const ids = ref([])

const query = reactive({ pageNum: 1, pageSize: 10, msgType: '', isRead: '' })

/* ==================== 消息 → 关联单据 ==================== */

/** 消息类型能直接判断单据归属 */
const MSG_BIZ_TYPE = {
  REQUISITION_APPLY: 'requisition',
  LOAN_APPLY: 'loan',
  LOAN_DUE: 'loan',
  LOAN_OVERDUE: 'loan'
}

/** 审批通过/驳回这类消息无从判断归属，用单号前缀兜底（LY=领用单 JY=借用单） */
function resolveBiz(row) {
  if (!row || !row.bizId) {
    return null
  }
  let type = MSG_BIZ_TYPE[row.msgType]
  if (!type) {
    const no = row.bizNo || ''
    if (no.startsWith('LY')) {
      type = 'requisition'
    } else if (no.startsWith('JY')) {
      type = 'loan'
    }
  }
  return type ? { type, id: row.bizId } : null
}

/** 有关联单据、且当前账号有对应查询权限时，才允许点开详情 */
function canViewDetail(row) {
  const biz = resolveBiz(row)
  if (!biz) {
    return false
  }
  return auth.hasPermi(biz.type === 'loan' ? 'equip:loan:list' : 'equip:requisition:list')
}

/** 待审批消息 + 有审批权限的账号，按钮才显示“去审批” */
function rowActionLabel(row) {
  const isApply = ['REQUISITION_APPLY', 'LOAN_APPLY'].includes(row.msgType)
  if (!isApply || !equipCtx.scope.approver) {
    return '详情'
  }
  const perm = auth.hasPermi(row.msgType === 'LOAN_APPLY' ? 'equip:loan:approve' : 'equip:requisition:approve')
  return perm ? '去审批' : '详情'
}

/* ==================== 详情 + 就地审批 ==================== */

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailType = ref('requisition')
const detail = ref({})
const detailMsg = ref({})

const detailStatusMap = computed(() => (detailType.value === 'loan' ? LOAN_STATUS : REQ_STATUS))
const detailNo = computed(() => detail.value.requisitionNo || detail.value.loanNo || detailMsg.value.bizNo || '-')

/** 只有“待审批”的申请单、且当前账号有对应审批权限时，才显示通过/驳回 */
const canApprove = computed(() => {
  const msg = detailMsg.value
  const doc = detail.value
  if (!msg || !doc || doc.status !== '0') {
    return false
  }
  if (!['REQUISITION_APPLY', 'LOAN_APPLY'].includes(msg.msgType)) {
    return false
  }
  if (!equipCtx.scope.approver) {
    return false
  }
  return auth.hasPermi(detailType.value === 'loan' ? 'equip:loan:approve' : 'equip:requisition:approve')
})

async function openDetail(row) {
  const biz = resolveBiz(row)
  if (!biz) {
    return
  }
  detailMsg.value = row
  detailType.value = biz.type
  detail.value = {}
  detailOpen.value = true
  detailLoading.value = true
  try {
    const res = biz.type === 'loan' ? await getLoan(biz.id) : await getRequisition(biz.id)
    detail.value = res.data || {}
  } catch {
    // 单据不存在或无权限查看（接口错误已由请求拦截器提示）
    detailOpen.value = false
    return
  } finally {
    detailLoading.value = false
  }
  await handleRead(row)
}

async function approveInDetail() {
  try {
    const { value } = await ElMessageBox.prompt('请输入审批意见（可留空）', `审批通过：${detailNo.value}`, {
      inputType: 'textarea',
      inputPlaceholder: '同意',
      confirmButtonText: '通过',
      cancelButtonText: '取消'
    })
    if (detailType.value === 'loan') {
      await approveLoan({ loanId: detail.value.loanId, approveRemark: value || '同意' })
    } else {
      await approveRequisition({ requisitionId: detail.value.requisitionId, approveRemark: value || '同意' })
    }
    ElMessage.success('已通过')
    detailOpen.value = false
    await getList()
  } catch {
    // 用户取消弹窗，或接口异常（已由请求拦截器统一提示）
  }
}

async function rejectInDetail() {
  try {
    const { value } = await ElMessageBox.prompt('请填写驳回原因（必填）', `驳回：${detailNo.value}`, {
      inputType: 'textarea',
      inputValidator: v => (v && v.trim() ? true : '驳回原因不能为空'),
      confirmButtonText: '驳回',
      cancelButtonText: '取消'
    })
    if (detailType.value === 'loan') {
      await rejectLoan({ loanId: detail.value.loanId, approveRemark: value })
    } else {
      await rejectRequisition({ requisitionId: detail.value.requisitionId, approveRemark: value })
    }
    ElMessage.success('已驳回')
    detailOpen.value = false
    await getList()
  } catch {
    // 用户取消弹窗，或接口异常（已由请求拦截器统一提示）
  }
}

/* ==================== 列表操作 ==================== */

async function getList() {
  loading.value = true
  try {
    const res = await listMessage(query)
    list.value = res.rows || []
    total.value = res.total || 0
    await loadEquipCtx(true)
  } finally {
    loading.value = false
  }
}

function handleSelectionChange(rows) {
  ids.value = rows.map(r => r.msgId)
}

async function handleRead(row) {
  if (row.isRead === '1') {
    return
  }
  await readMessage(row.msgId)
  row.isRead = '1'
  await loadEquipCtx(true)
}

async function handleReadAll() {
  await readAllMessage()
  ElMessage.success('已全部标记为已读')
  setUnread(0)
  getList()
}

async function handleDelete(rows) {
  const msgIds = rows ? [rows.msgId] : ids.value
  if (!msgIds.length) {
    return
  }
  try {
    await ElMessageBox.confirm('确定删除选中的消息？', '提示', { type: 'warning' })
  } catch {
    return
  }
  await delMessage(msgIds)
  ElMessage.success('删除成功')
  getList()
}

onMounted(getList)
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>消息中心</h3>
        <div class="flex gap-2">
          <el-button @click="handleReadAll">
            全部已读
          </el-button>
          <el-button type="danger" :icon="Trash" :disabled="!ids.length" @click="handleDelete()">
            批量删除
          </el-button>
          <el-button :icon="RefreshCw" @click="getList">
            刷新
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <el-form :inline="true" :model="query" class="mb-3">
          <el-form-item label="消息类型">
            <el-select v-model="query.msgType" placeholder="全部" clearable style="width: 170px">
              <el-option v-for="(label, key) in MSG_TYPE" :key="key" :label="label" :value="key" />
            </el-select>
          </el-form-item>
          <el-form-item label="阅读状态">
            <el-select v-model="query.isRead" placeholder="全部" clearable style="width: 130px">
              <el-option label="未读" value="0" />
              <el-option label="已读" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList">
              查询
            </el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <span class="equip-tag" :class="row.isRead === '0' ? 'equip-tag--warn' : 'equip-tag--info'">
                {{ row.isRead === '0' ? '未读' : '已读' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="130" align="center">
            <template #default="{ row }">
              {{ MSG_TYPE[row.msgType] || row.msgType }}
            </template>
          </el-table-column>
          <el-table-column label="标题" min-width="170" show-overflow-tooltip>
            <template #default="{ row }">
              <el-link v-if="canViewDetail(row)" type="primary" :underline="false" @click="openDetail(row)">
                {{ row.title }}
              </el-link>
              <span v-else>{{ row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column label="内容" prop="content" min-width="300" show-overflow-tooltip />
          <el-table-column label="关联单号" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <el-link v-if="canViewDetail(row)" type="primary" :underline="false" @click="openDetail(row)">
                {{ row.bizNo }}
              </el-link>
              <span v-else>{{ row.bizNo || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="时间" prop="createTime" width="160" align="center" />
          <el-table-column label="操作" width="190" align="center" fixed="right">
            <template #default="{ row }">
              <el-button v-if="canViewDetail(row)" link type="primary" :icon="Eye" @click="openDetail(row)">
                {{ rowActionLabel(row) }}
              </el-button>
              <el-button v-if="row.isRead === '0'" link type="primary" @click="handleRead(row)">
                标记已读
              </el-button>
              <el-button link type="danger" :icon="Trash" @click="handleDelete(row)">
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

    <!-- 单据详情：申请类消息可直接在这里审批 -->
    <el-dialog
      v-model="detailOpen"
      :title="detailType === 'loan' ? '借用单详情' : '领用单详情'"
      width="820px"
      append-to-body
    >
      <div v-loading="detailLoading">
        <el-alert
          v-if="detailMsg.content"
          :title="detailMsg.content"
          type="info"
          :closable="false"
          show-icon
          class="mb-3"
        />

        <el-descriptions :column="3" border size="small">
          <el-descriptions-item :label="detailType === 'loan' ? '借用单号' : '领用单号'">
            {{ detailNo }}
          </el-descriptions-item>
          <el-descriptions-item :label="detailType === 'loan' ? '借用单位' : '领用单位'">
            {{ detail.applyDeptName || detail.loanDeptName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <StatusTag :value="detail.status" :map="detailStatusMap" />
          </el-descriptions-item>

          <template v-if="detailType === 'loan'">
            <el-descriptions-item label="实际借用人">
              {{ detail.borrowerName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="借用日期">
              {{ detail.loanDate || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="预计归还">
              {{ detail.expectReturnDate || '-' }}
            </el-descriptions-item>
          </template>
          <template v-else>
            <el-descriptions-item label="实际领取人">
              {{ detail.receiverName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ detail.receiverPhone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="申请人">
              {{ detail.applyBy || '-' }}
            </el-descriptions-item>
          </template>

          <el-descriptions-item label="总数量">
            {{ detail.totalQty ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="detailType === 'loan' ? '借用事由' : '申请事由'" :span="2">
            {{ detail.applyReason || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detail.approveRemark" label="审批意见" :span="3">
            {{ detail.approveRemark }}
          </el-descriptions-item>
        </el-descriptions>

        <el-table :data="detail.items || []" size="small" class="mt-4" empty-text="暂无明细">
          <el-table-column label="装备" prop="itemName" min-width="150" show-overflow-tooltip />
          <el-table-column label="数量" prop="qty" width="90" align="center" />
          <el-table-column label="单位" prop="unit" width="80" align="center" />
          <el-table-column label="配件" min-width="160">
            <template #default="{ row }">
              {{ partsText(row.partsInfo) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailOpen = false">
          关闭
        </el-button>
        <template v-if="canApprove">
          <el-button type="danger" :icon="X" @click="rejectInDetail()">
            驳回
          </el-button>
          <el-button type="primary" :icon="Check" @click="approveInDetail()">
            通过
          </el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>
