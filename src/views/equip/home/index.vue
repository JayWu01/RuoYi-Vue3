<script setup>
import { Bell, ChartColumn, ClipboardList, PackageCheck, TriangleAlert, Warehouse } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getStatByCategory, getStatOverview, getWarningSummary, listLoan, listRequisition } from '@/api/equip'
import StatusTag from '../components/StatusTag.vue'
import { LOAN_STATUS, REQ_STATUS } from '../constants'
import { equipCtx, loadEquipCtx } from '../context'

const router = useRouter()
const loading = ref(false)
const overview = ref({})
const categories = ref([])
const pendingReq = ref([])
const pendingLoan = ref([])
const warning = ref({})

const scope = computed(() => equipCtx.scope)

const kpis = computed(() => [
  { label: '支队仓库可用库存', value: overview.value.hqAvailable ?? 0, unit: '件', tone: 'accent' },
  { label: '大队持有合计', value: overview.value.deptAvailable ?? 0, unit: '件', tone: 'success' },
  { label: '借出中数量', value: overview.value.hqLoaned ?? 0, unit: '件', tone: 'info' },
  { label: '待审批申请', value: (overview.value.pendingRequisitions ?? 0) + (overview.value.pendingLoans ?? 0), unit: '单', tone: 'warn' },
  { label: '逾期借用', value: overview.value.overdueLoans ?? 0, unit: '单', tone: 'danger' },
  { label: '即将到期批次', value: overview.value.expiringBatches ?? 0, unit: '批', tone: 'warn' }
])

const maxCategoryQty = computed(() => Math.max(1, ...categories.value.map(c => Number(c.availableQty) || 0)))

async function loadData() {
  loading.value = true
  try {
    await loadEquipCtx()
    const [ov, cat, req, loan, warn] = await Promise.all([
      getStatOverview(),
      getStatByCategory(),
      listRequisition({ pageNum: 1, pageSize: 5, status: '0' }),
      listLoan({ pageNum: 1, pageSize: 5, status: '0' }),
      getWarningSummary()
    ])
    overview.value = ov.data || {}
    categories.value = cat.data || []
    pendingReq.value = req.rows || []
    pendingLoan.value = loan.rows || []
    warning.value = warn.data || {}
  } finally {
    loading.value = false
  }
}

function go(path) {
  router.push(path)
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading" class="flex flex-col gap-4">
    <!-- 欢迎条 -->
    <div class="equip-panel">
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <div class="text-[17px] font-semibold tracking-wide text-[#e9f5ff]">
            {{ scope.userName || '用户' }}，欢迎使用警用装备仓库管理系统
          </div>
          <div class="mt-1 text-[12px] text-[#93a9bd]">
            当前单位：{{ scope.deptName || '-' }} ｜ 支队总仓库：{{ scope.hqDeptName || '-' }} ｜ 管辖范围：{{ scope.all ? '全支队' : '本单位及下属单位' }}
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <el-button type="primary" :icon="PackageCheck" @click="go('/warehouse/inbound')">
            装备入库
          </el-button>
          <el-button :icon="ClipboardList" @click="go('/warehouse/requisition')">
            领用申请
          </el-button>
          <el-button :icon="Warehouse" @click="go('/warehouse/stock')">
            库存总览
          </el-button>
          <el-button :icon="ChartColumn" @click="go('/warehouse/stat')">
            统计报表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 指标 -->
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <div v-for="kpi in kpis" :key="kpi.label" class="equip-kpi">
        <div class="equip-kpi__label">
          {{ kpi.label }}
        </div>
        <div class="equip-kpi__value">
          {{ kpi.value }}<span class="equip-kpi__unit">{{ kpi.unit }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <!-- 分类库存 -->
      <section class="equip-panel xl:col-span-2">
        <div class="equip-panel__head">
          <h3>装备分类库存</h3>
          <span class="text-[12px] text-[#6fa8ce]">可用库存 / 借出 / 损坏</span>
        </div>
        <div class="equip-panel__body">
          <div v-if="!categories.length" class="py-8 text-center text-[13px] text-[#6fa8ce]">
            暂无库存数据，请先完成装备入库
          </div>
          <div v-for="cat in categories" :key="cat.categoryName" class="mb-3">
            <div class="mb-1 flex items-center justify-between text-[13px] text-[#c3d6e6]">
              <span>{{ cat.categoryName || '未分类' }}</span>
              <span class="text-[12px] text-[#93a9bd]">
                可用 {{ cat.availableQty }} ｜ 借出 {{ cat.loanedQty }} ｜ 损坏 {{ cat.damagedQty }}
              </span>
            </div>
            <div class="h-[8px] w-full overflow-hidden rounded bg-[#061b34]">
              <div
                class="h-full rounded bg-gradient-to-r from-[#0d6fb0] to-[#20b5f1]"
                :style="{ width: `${Math.min(100, (Number(cat.availableQty) || 0) / maxCategoryQty * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 预警 -->
      <section class="equip-panel">
        <div class="equip-panel__head">
          <h3>预警提醒</h3>
          <el-button link type="primary" :icon="TriangleAlert" @click="go('/warehouse/warning')">
            进入预警中心
          </el-button>
        </div>
        <div class="equip-panel__body">
          <div class="mb-3 flex items-center justify-between rounded border border-[rgba(20,106,170,.4)] bg-[#061b34] px-3 py-3">
            <div class="text-[13px] text-[#c3d6e6]">
              借用即将到期/逾期
            </div>
            <div class="text-[20px] font-semibold text-[#f5c35d]">
              {{ warning.loanWarnings ?? 0 }}
            </div>
          </div>
          <div class="mb-3 flex items-center justify-between rounded border border-[rgba(20,106,170,.4)] bg-[#061b34] px-3 py-3">
            <div class="text-[13px] text-[#c3d6e6]">
              装备有效期预警
            </div>
            <div class="text-[20px] font-semibold text-[#ff8f88]">
              {{ warning.expireWarnings ?? 0 }}
            </div>
          </div>
          <div class="flex items-center justify-between rounded border border-[rgba(20,106,170,.4)] bg-[#061b34] px-3 py-3">
            <div class="text-[13px] text-[#c3d6e6]">
              装备轮换提醒
            </div>
            <div class="text-[20px] font-semibold text-[#9cc4e0]">
              {{ warning.rotateWarnings ?? 0 }}
            </div>
          </div>
          <el-button class="mt-4 w-full" :icon="Bell" @click="go('/warehouse/message')">
            查看我的消息（{{ equipCtx.unread }}）
          </el-button>
        </div>
      </section>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <section class="equip-panel">
        <div class="equip-panel__head">
          <h3>待审批领用申请</h3>
          <el-button link type="primary" @click="go('/warehouse/approval')">
            更多
          </el-button>
        </div>
        <div class="equip-panel__body">
          <el-table :data="pendingReq" size="small" empty-text="暂无待审批领用申请">
            <el-table-column label="单号" prop="requisitionNo" min-width="150" show-overflow-tooltip />
            <el-table-column label="领用单位" prop="applyDeptName" min-width="120" show-overflow-tooltip />
            <el-table-column label="数量" prop="totalQty" width="70" align="center" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <StatusTag :value="row.status" :map="REQ_STATUS" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>

      <section class="equip-panel">
        <div class="equip-panel__head">
          <h3>待审批借用申请</h3>
          <el-button link type="primary" @click="go('/warehouse/approval')">
            更多
          </el-button>
        </div>
        <div class="equip-panel__body">
          <el-table :data="pendingLoan" size="small" empty-text="暂无待审批借用申请">
            <el-table-column label="单号" prop="loanNo" min-width="150" show-overflow-tooltip />
            <el-table-column label="借用单位" prop="loanDeptName" min-width="120" show-overflow-tooltip />
            <el-table-column label="数量" prop="totalQty" width="70" align="center" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <StatusTag :value="row.status" :map="LOAN_STATUS" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>
    </div>
  </div>
</template>
