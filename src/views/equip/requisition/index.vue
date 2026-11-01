<script setup>
import { Check, Eye, Plus, RefreshCw, Send, Trash, Undo2, X } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  addRequisition,
  approveRequisition,
  cancelRequisition,
  delRequisition,
  getRequisition,
  listRequisition,
  receiveRequisition,
  rejectRequisition
} from '@/api/equip'
import { addDateRange } from '@/utils/ruoyi'
import StatusTag from '../components/StatusTag.vue'
import { partsText, REQ_STATUS } from '../constants'
import { defaultDeptId, equipCtx, findDeptName } from '../context'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const open = ref(false)
const detailOpen = ref(false)
const detail = ref({})
const formRef = ref(null)
const dateRange = ref([])

const query = reactive({ pageNum: 1, pageSize: 10, requisitionNo: '', status: '' })

const scope = computed(() => equipCtx.scope)
const items = computed(() => equipCtx.items)
const deptTree = computed(() => equipCtx.deptTree)
const isApprover = computed(() => !!scope.value.approver)

const form = reactive({
  applyDeptId: null,
  applyDeptName: '',
  receiverName: '',
  receiverPhone: '',
  applyReason: '',
  remark: '',
  items: []
})

const rules = {
  applyDeptId: [{ required: true, message: '请选择领用单位', trigger: 'change' }],
  receiverName: [{ required: true, message: '请填写实际领取人', trigger: 'blur' }]
}

const totalQty = computed(() => form.items.reduce((sum, row) => sum + (Number(row.qty) || 0), 0))

async function getList() {
  loading.value = true
  try {
    const res = await listRequisition(addDateRange({ ...query }, dateRange.value))
    list.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function onDeptChange(deptId) {
  form.applyDeptName = findDeptName(deptId)
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
  form.applyDeptId = defaultDeptId()
  form.applyDeptName = scope.value.deptName || findDeptName(form.applyDeptId)
  form.receiverName = ''
  form.receiverPhone = ''
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
    if (!form.applyDeptName) {
      form.applyDeptName = findDeptName(form.applyDeptId)
    }
    if (!form.items.length) {
      ElMessage.warning('请至少添加一条领用明细')
      return
    }
    if (form.items.some(r => !r.itemId || !r.qty || r.qty <= 0)) {
      ElMessage.warning('请完整填写领用明细的装备和数量')
      return
    }
    await addRequisition({ ...form })
    ElMessage.success('领用申请已提交，等待支队审批')
    open.value = false
    getList()
  })
}

async function handleApprove(row) {
  const { value } = await ElMessageBox.prompt('请输入审批意见（可留空）', `审批通过：${row.requisitionNo}`, {
    inputType: 'textarea',
    inputPlaceholder: '同意',
    confirmButtonText: '通过',
    cancelButtonText: '取消'
  })
  await approveRequisition({ requisitionId: row.requisitionId, approveRemark: value || '同意' })
  ElMessage.success('审批已通过')
  getList()
}

async function handleReject(row) {
  const { value } = await ElMessageBox.prompt('请填写驳回原因（必填）', `驳回：${row.requisitionNo}`, {
    inputType: 'textarea',
    inputValidator: v => (v && v.trim() ? true : '驳回原因不能为空'),
    confirmButtonText: '驳回',
    cancelButtonText: '取消'
  })
  await rejectRequisition({ requisitionId: row.requisitionId, approveRemark: value })
  ElMessage.success('已驳回')
  getList()
}

async function handleReceive(row) {
  await ElMessageBox.confirm(
    `确认【${row.applyDeptName}】已完成领取？确认后支队库存将扣减并计入领用单位库存。`,
    '确认领取',
    { type: 'warning' }
  )
  await receiveRequisition(row.requisitionId)
  ElMessage.success('领取完成，库存已更新')
  getList()
}

async function handleCancel(row) {
  await ElMessageBox.confirm(`确定撤销领用申请【${row.requisitionNo}】？`, '提示', { type: 'warning' })
  await cancelRequisition(row.requisitionId)
  ElMessage.success('已撤销')
  getList()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除领用单【${row.requisitionNo}】？`, '提示', { type: 'warning' })
  await delRequisition([row.requisitionId])
  ElMessage.success('删除成功')
  getList()
}

async function handleDetail(row) {
  const res = await getRequisition(row.requisitionId)
  detail.value = res.data || {}
  detailOpen.value = true
}

function canApprove(row) {
  return isApprover.value && row.status === '0'
}

function canReceive(row) {
  return row.status === '1'
}

onMounted(getList)
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>装备领用管理</h3>
        <div class="flex gap-2">
          <el-button v-hasPermi="['equip:requisition:add']" type="primary" :icon="Plus" @click="handleAdd">
            领用申请
          </el-button>
          <el-button :icon="RefreshCw" @click="getList">
            刷新
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <div class="mb-3 flex flex-wrap items-center gap-2 text-[12px] text-[#93a9bd]">
          <span>流程：提交申请 → 支队审批 → 实际领取确认（确认后才变更库存）</span>
          <span class="text-[#55708a]">｜</span>
          <span>领用装备归属单位，需登记实际领取人</span>
        </div>
        <el-form :inline="true" :model="query" class="mb-3">
          <el-form-item label="领用单号">
            <el-input v-model="query.requisitionNo" placeholder="请输入单号" clearable style="width: 180px" @keyup.enter="getList" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 130px">
              <el-option v-for="(cfg, key) in REQ_STATUS" :key="key" :label="cfg.label" :value="key" />
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
          <el-table-column label="领用单号" prop="requisitionNo" min-width="160" show-overflow-tooltip />
          <el-table-column label="领用单位" prop="applyDeptName" min-width="130" show-overflow-tooltip />
          <el-table-column label="实际领取人" prop="receiverName" width="110" align="center" />
          <el-table-column label="数量" prop="totalQty" width="80" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <StatusTag :value="row.status" :map="REQ_STATUS" />
            </template>
          </el-table-column>
          <el-table-column label="申请人" prop="applyBy" width="100" align="center" />
          <el-table-column label="申请时间" prop="applyTime" width="160" align="center" />
          <el-table-column label="审批人" prop="approveBy" width="100" align="center" />
          <el-table-column label="操作" width="280" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Eye" @click="handleDetail(row)">
                详情
              </el-button>
              <el-button
                v-if="canApprove(row)"
                v-hasPermi="['equip:requisition:approve']"
                link
                type="success"
                :icon="Check"
                @click="handleApprove(row)"
              >
                通过
              </el-button>
              <el-button
                v-if="canApprove(row)"
                v-hasPermi="['equip:requisition:approve']"
                link
                type="danger"
                :icon="X"
                @click="handleReject(row)"
              >
                驳回
              </el-button>
              <el-button
                v-if="canReceive(row)"
                v-hasPermi="['equip:requisition:receive']"
                link
                type="success"
                :icon="Send"
                @click="handleReceive(row)"
              >
                确认领取
              </el-button>
              <el-button
                v-if="row.status === '0' || row.status === '1'"
                v-hasPermi="['equip:requisition:cancel']"
                link
                type="warning"
                :icon="Undo2"
                @click="handleCancel(row)"
              >
                撤销
              </el-button>
              <el-button
                v-if="row.status === '3' || row.status === '4'"
                v-hasPermi="['equip:requisition:remove']"
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

    <!-- 申请 -->
    <el-dialog v-model="open" title="装备领用申请" width="900px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="领用单位" prop="applyDeptId">
              <el-tree-select
                v-model="form.applyDeptId"
                :data="deptTree"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                check-strictly
                node-key="id"
                placeholder="请选择领用单位"
                style="width: 100%"
                @change="onDeptChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实际领取人" prop="receiverName">
              <el-input v-model="form.receiverName" placeholder="实际到仓库领取的人员" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input v-model="form.receiverPhone" placeholder="选填" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="申请事由">
              <el-input v-model="form.applyReason" type="textarea" :rows="2" maxlength="300" placeholder="简要说明领用原因" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          领用明细（合计 {{ totalQty }}）
        </el-divider>
        <div class="mb-2 flex justify-end">
          <el-button size="small" type="primary" :icon="Plus" @click="addRow">
            添加明细
          </el-button>
        </div>
        <el-table :data="form.items" size="small" empty-text="请添加领用明细">
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

    <!-- 详情 -->
    <el-dialog v-model="detailOpen" title="领用单详情" width="860px" append-to-body>
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="领用单号">
          {{ detail.requisitionNo }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :value="detail.status" :map="REQ_STATUS" />
        </el-descriptions-item>
        <el-descriptions-item label="领用单位">
          {{ detail.applyDeptName }}
        </el-descriptions-item>
        <el-descriptions-item label="实际领取人">
          {{ detail.receiverName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ detail.receiverPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="领用总数量">
          {{ detail.totalQty }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人">
          {{ detail.applyBy || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">
          {{ detail.applyTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批人">
          {{ detail.approveBy || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批时间">
          {{ detail.approveTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批意见" :span="2">
          {{ detail.approveRemark || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="发放经办">
          {{ detail.issueBy || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="领取时间">
          {{ detail.issueTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="申请事由">
          {{ detail.applyReason || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-table :data="detail.items || []" size="small" class="mt-4">
        <el-table-column label="装备" prop="itemName" min-width="160" />
        <el-table-column label="数量" prop="qty" width="90" align="center" />
        <el-table-column label="单位" prop="unit" width="80" align="center" />
        <el-table-column label="配件" min-width="180">
          <template #default="{ row }">
            {{ partsText(row.partsInfo) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
