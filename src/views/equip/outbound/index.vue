<script setup>
import { Eye, Plus, RefreshCw, Trash } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  addOutbound,
  cancelOutbound,
  confirmOutbound,
  delOutbound,
  getOutbound,
  listOutbound
} from '@/api/equip'
import { addDateRange } from '@/utils/ruoyi'
import StatusTag from '../components/StatusTag.vue'
import { OUTBOUND_STATUS } from '../constants'
import { equipCtx } from '../context'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const open = ref(false)
const detailOpen = ref(false)
const detail = ref({})
const formRef = ref(null)
const dateRange = ref([])

const query = reactive({ pageNum: 1, pageSize: 10, outboundNo: '', status: '' })

const scope = computed(() => equipCtx.scope)
const items = computed(() => equipCtx.items)

const form = reactive({
  outReason: '',
  handler: '',
  remark: '',
  items: []
})

const rules = {
  outReason: [{ required: true, message: '请填写出库原因', trigger: 'blur' }]
}

const totalQty = computed(() => form.items.reduce((sum, row) => sum + (Number(row.qty) || 0), 0))

async function getList() {
  loading.value = true
  try {
    const res = await listOutbound(addDateRange({ ...query }, dateRange.value))
    list.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
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
  form.outReason = ''
  form.handler = ''
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
    if (!form.items.length) {
      ElMessage.warning('请至少添加一条出库明细')
      return
    }
    if (form.items.some(r => !r.itemId || !r.qty || r.qty <= 0)) {
      ElMessage.warning('请完整填写出库明细的装备和数量')
      return
    }
    await addOutbound({ ...form })
    ElMessage.success('出库单已创建，请确认出库')
    open.value = false
    getList()
  })
}

async function handleConfirm(row) {
  await ElMessageBox.confirm(`确认出库单【${row.outboundNo}】并扣减支队仓库库存？`, '确认出库', { type: 'warning' })
  await confirmOutbound(row.outboundId)
  ElMessage.success('出库成功，库存已更新')
  getList()
}

async function handleCancel(row) {
  await ElMessageBox.confirm(`确定作废出库单【${row.outboundNo}】？`, '提示', { type: 'warning' })
  await cancelOutbound(row.outboundId)
  ElMessage.success('已作废')
  getList()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除出库单【${row.outboundNo}】？`, '提示', { type: 'warning' })
  await delOutbound([row.outboundId])
  ElMessage.success('删除成功')
  getList()
}

async function handleDetail(row) {
  const res = await getOutbound(row.outboundId)
  detail.value = res.data || {}
  detailOpen.value = true
}

onMounted(getList)
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>装备出库管理</h3>
        <div class="flex gap-2">
          <el-button v-hasPermi="['equip:outbound:add']" type="primary" :icon="Plus" @click="handleAdd">
            新增出库
          </el-button>
          <el-button :icon="RefreshCw" @click="getList">
            刷新
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <div class="mb-3 flex flex-wrap items-center gap-2 text-[12px] text-[#93a9bd]">
          <span>出库仓库：{{ scope.hqDeptName || '-' }}</span>
          <span class="text-[#55708a]">｜</span>
          <span>出库用于领用、借用以外的库存减少，确认出库后自动扣减库存</span>
        </div>
        <el-form :inline="true" :model="query" class="mb-3">
          <el-form-item label="出库单号">
            <el-input v-model="query.outboundNo" placeholder="请输入单号" clearable style="width: 180px" @keyup.enter="getList" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 130px">
              <el-option label="待确认" value="0" />
              <el-option label="已出库" value="1" />
              <el-option label="已作废" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
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
          <el-table-column label="出库单号" prop="outboundNo" min-width="160" show-overflow-tooltip />
          <el-table-column label="出库仓库" prop="outDeptName" min-width="140" show-overflow-tooltip />
          <el-table-column label="出库数量" prop="totalQty" width="100" align="center" />
          <el-table-column label="出库原因" prop="outReason" min-width="160" show-overflow-tooltip />
          <el-table-column label="经办人" prop="handler" width="100" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <StatusTag :value="row.status" :map="OUTBOUND_STATUS" />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
          <el-table-column label="操作" width="240" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Eye" @click="handleDetail(row)">
                详情
              </el-button>
              <el-button
                v-if="row.status === '0'"
                v-hasPermi="['equip:outbound:confirm']"
                link
                type="success"
                @click="handleConfirm(row)"
              >
                确认出库
              </el-button>
              <el-button
                v-if="row.status === '0'"
                v-hasPermi="['equip:outbound:remove']"
                link
                type="warning"
                @click="handleCancel(row)"
              >
                作废
              </el-button>
              <el-button
                v-if="row.status !== '1'"
                v-hasPermi="['equip:outbound:remove']"
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

    <el-dialog v-model="open" title="新增装备出库单" width="860px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="出库原因" prop="outReason">
              <el-input v-model="form.outReason" placeholder="例如：装备报废、调拨外单位" maxlength="200" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="经办人">
              <el-input v-model="form.handler" placeholder="选填" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="出库仓库">
              <el-input :model-value="scope.hqDeptName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="300" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          出库明细（合计 {{ totalQty }}）
        </el-divider>
        <div class="mb-2 flex justify-end">
          <el-button size="small" type="primary" :icon="Plus" @click="addRow">
            添加明细
          </el-button>
        </div>
        <el-table :data="form.items" size="small" empty-text="请添加出库明细">
          <el-table-column label="装备" min-width="220">
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
          <el-table-column label="配件及数量" min-width="180">
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
          保存待确认
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailOpen" title="出库单详情" width="820px" append-to-body>
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="出库单号">
          {{ detail.outboundNo }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :value="detail.status" :map="OUTBOUND_STATUS" />
        </el-descriptions-item>
        <el-descriptions-item label="出库仓库">
          {{ detail.outDeptName }}
        </el-descriptions-item>
        <el-descriptions-item label="出库原因" :span="2">
          {{ detail.outReason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="出库总数量">
          {{ detail.totalQty }}
        </el-descriptions-item>
        <el-descriptions-item label="经办人">
          {{ detail.handler || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ detail.createTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="确认人">
          {{ detail.confirmBy || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">
          {{ detail.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-table :data="detail.items || []" size="small" class="mt-4">
        <el-table-column label="装备" prop="itemName" min-width="160" />
        <el-table-column label="数量" prop="qty" width="90" align="center" />
        <el-table-column label="单位" prop="unit" width="80" align="center" />
        <el-table-column label="配件" prop="partsInfo" min-width="180" />
      </el-table>
    </el-dialog>
  </div>
</template>
