<script setup>
import { RefreshCw, Search } from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { listCategory, listStock, listStockBatch, listStockFlow } from '@/api/equip'
import { addDateRange } from '@/utils/ruoyi'
import { BIZ_TYPE } from '../constants'
import { equipCtx } from '../context'

const activeTab = ref('stock')
const loading = ref(false)
const categories = ref([])

const stockQuery = reactive({ pageNum: 1, pageSize: 10, itemName: '', categoryId: null, deptId: null })
const stockList = ref([])
const stockTotal = ref(0)

const flowQuery = reactive({ pageNum: 1, pageSize: 10, bizNo: '', bizType: '' })
const flowList = ref([])
const flowTotal = ref(0)
const flowDateRange = ref([])

const batchQuery = reactive({ pageNum: 1, pageSize: 10, itemName: '' })
const batchList = ref([])
const batchTotal = ref(0)

const scope = computed(() => equipCtx.scope)

const stockSummary = computed(() => {
  const summary = { total: 0, available: 0, loaned: 0, damaged: 0, lost: 0 }
  for (const row of stockList.value) {
    summary.total += row.totalQty || 0
    summary.available += row.availableQty || 0
    summary.loaned += row.loanedQty || 0
    summary.damaged += row.damagedQty || 0
    summary.lost += row.lostQty || 0
  }
  return summary
})

async function getStockList() {
  loading.value = true
  try {
    const res = await listStock(stockQuery)
    stockList.value = res.rows || []
    stockTotal.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function getFlowList() {
  loading.value = true
  try {
    const params = addDateRange({ ...flowQuery }, flowDateRange.value)
    const res = await listStockFlow(params)
    flowList.value = res.rows || []
    flowTotal.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function getBatchList() {
  loading.value = true
  try {
    const res = await listStockBatch(batchQuery)
    batchList.value = res.rows || []
    batchTotal.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  const res = await listCategory({})
  const flat = []
  const walk = (nodes, prefix = '') => {
    for (const node of nodes || []) {
      flat.push({ value: node.categoryId, label: `${prefix}${node.categoryName}` })
      walk(node.children, `${prefix}${node.categoryName} / `)
    }
  }
  walk(res.data || [])
  categories.value = flat
}

function remainDays(row) {
  if (!row.expireDate) {
    return null
  }
  const diff = new Date(row.expireDate).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.floor(diff / 86400000)
}

onMounted(() => {
  loadCategories()
  getStockList()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-5">
      <div class="equip-kpi">
        <div class="equip-kpi__label">
          库存总量
        </div>
        <div class="equip-kpi__value">
          {{ stockSummary.total }}
        </div>
      </div>
      <div class="equip-kpi">
        <div class="equip-kpi__label">
          可用库存
        </div>
        <div class="equip-kpi__value">
          {{ stockSummary.available }}
        </div>
      </div>
      <div class="equip-kpi">
        <div class="equip-kpi__label">
          借出中
        </div>
        <div class="equip-kpi__value">
          {{ stockSummary.loaned }}
        </div>
      </div>
      <div class="equip-kpi">
        <div class="equip-kpi__label">
          损坏数量
        </div>
        <div class="equip-kpi__value">
          {{ stockSummary.damaged }}
        </div>
      </div>
      <div class="equip-kpi">
        <div class="equip-kpi__label">
          累计遗失
        </div>
        <div class="equip-kpi__value">
          {{ stockSummary.lost }}
        </div>
      </div>
    </div>

    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>装备库存</h3>
        <span class="text-[12px] text-[#6fa8ce]">
          {{ scope.all ? '全支队数据' : '本单位及下属单位数据' }}
        </span>
      </div>
      <div class="equip-panel__body">
        <el-tabs v-model="activeTab">
          <!-- 库存 -->
          <el-tab-pane label="库存总览" name="stock">
            <el-form :inline="true" :model="stockQuery" class="mb-3">
              <el-form-item label="装备名称">
                <el-input v-model="stockQuery.itemName" placeholder="请输入装备名称" clearable style="width: 170px" @keyup.enter="getStockList" />
              </el-form-item>
              <el-form-item label="装备分类">
                <el-select v-model="stockQuery.categoryId" placeholder="全部" clearable style="width: 170px">
                  <el-option v-for="opt in categories" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="getStockList">
                  查询
                </el-button>
                <el-button :icon="RefreshCw" @click="getStockList">
                  刷新
                </el-button>
              </el-form-item>
            </el-form>
            <el-table v-loading="loading" :data="stockList">
              <el-table-column label="所属单位" prop="deptName" min-width="150" show-overflow-tooltip />
              <el-table-column label="装备名称" prop="itemName" min-width="140" show-overflow-tooltip />
              <el-table-column label="装备分类" prop="categoryName" min-width="110" show-overflow-tooltip />
              <el-table-column label="单位" prop="unit" width="70" align="center" />
              <el-table-column label="库存总量" prop="totalQty" width="100" align="center" />
              <el-table-column label="可用数量" width="100" align="center">
                <template #default="{ row }">
                  <span class="text-[#b6e08a]">{{ row.availableQty }}</span>
                </template>
              </el-table-column>
              <el-table-column label="借出数量" width="100" align="center">
                <template #default="{ row }">
                  <span class="text-[#f5c35d]">{{ row.loanedQty }}</span>
                </template>
              </el-table-column>
              <el-table-column label="损坏数量" width="100" align="center">
                <template #default="{ row }">
                  <span class="text-[#ff8f88]">{{ row.damagedQty }}</span>
                </template>
              </el-table-column>
              <el-table-column label="累计遗失" prop="lostQty" width="100" align="center" />
              <el-table-column label="更新时间" prop="updateTime" width="160" align="center" />
            </el-table>
            <pagination
              v-show="stockTotal > 0"
              v-model:page="stockQuery.pageNum"
              v-model:limit="stockQuery.pageSize"
              :total="stockTotal"
              @pagination="getStockList"
            />
          </el-tab-pane>

          <!-- 流水 -->
          <el-tab-pane label="库存变动流水" name="flow">
            <el-form :inline="true" :model="flowQuery" class="mb-3">
              <el-form-item label="业务单号">
                <el-input v-model="flowQuery.bizNo" placeholder="请输入单号" clearable style="width: 170px" @keyup.enter="getFlowList" />
              </el-form-item>
              <el-form-item label="业务类型">
                <el-select v-model="flowQuery.bizType" placeholder="全部" clearable style="width: 150px">
                  <el-option v-for="(label, key) in BIZ_TYPE" :key="key" :label="label" :value="key" />
                </el-select>
              </el-form-item>
              <el-form-item label="发生时间">
                <el-date-picker
                  v-model="flowDateRange"
                  type="daterange"
                  value-format="YYYY-MM-DD"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 240px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="getFlowList">
                  查询
                </el-button>
              </el-form-item>
            </el-form>
            <el-table v-loading="loading" :data="flowList">
              <el-table-column label="发生时间" prop="createTime" width="160" align="center" />
              <el-table-column label="业务类型" width="110" align="center">
                <template #default="{ row }">
                  {{ BIZ_TYPE[row.bizType] || row.bizType }}
                </template>
              </el-table-column>
              <el-table-column label="业务单号" prop="bizNo" min-width="160" show-overflow-tooltip />
              <el-table-column label="单位" prop="deptName" min-width="130" show-overflow-tooltip />
              <el-table-column label="装备" prop="itemName" min-width="130" show-overflow-tooltip />
              <el-table-column label="总量" width="80" align="center">
                <template #default="{ row }">
                  {{ row.chgTotal > 0 ? `+${row.chgTotal}` : row.chgTotal }}
                </template>
              </el-table-column>
              <el-table-column label="可用" width="80" align="center">
                <template #default="{ row }">
                  {{ row.chgAvailable > 0 ? `+${row.chgAvailable}` : row.chgAvailable }}
                </template>
              </el-table-column>
              <el-table-column label="借出" width="80" align="center">
                <template #default="{ row }">
                  {{ row.chgLoaned > 0 ? `+${row.chgLoaned}` : row.chgLoaned }}
                </template>
              </el-table-column>
              <el-table-column label="变更后可用" prop="afterAvailable" width="110" align="center" />
              <el-table-column label="操作人" prop="operatorName" width="100" align="center" />
              <el-table-column label="说明" prop="remark" min-width="140" show-overflow-tooltip />
            </el-table>
            <pagination
              v-show="flowTotal > 0"
              v-model:page="flowQuery.pageNum"
              v-model:limit="flowQuery.pageSize"
              :total="flowTotal"
              @pagination="getFlowList"
            />
          </el-tab-pane>

          <!-- 批次 -->
          <el-tab-pane label="有效期批次" name="batch">
            <el-form :inline="true" :model="batchQuery" class="mb-3">
              <el-form-item label="装备名称">
                <el-input v-model="batchQuery.itemName" placeholder="请输入装备名称" clearable style="width: 170px" @keyup.enter="getBatchList" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="getBatchList">
                  查询
                </el-button>
              </el-form-item>
            </el-form>
            <el-table v-loading="loading" :data="batchList">
              <el-table-column label="装备名称" prop="itemName" min-width="140" show-overflow-tooltip />
              <el-table-column label="批次号" prop="batchNo" min-width="150" show-overflow-tooltip />
              <el-table-column label="持有单位" prop="deptName" min-width="140" show-overflow-tooltip />
              <el-table-column label="来源单号" prop="sourceNo" min-width="150" show-overflow-tooltip />
              <el-table-column label="生产日期" prop="produceDate" width="120" align="center" />
              <el-table-column label="到期日期" prop="expireDate" width="120" align="center" />
              <el-table-column label="批次数量" prop="qty" width="90" align="center" />
              <el-table-column label="剩余数量" prop="remainQty" width="90" align="center" />
              <el-table-column label="到期状态" width="120" align="center">
                <template #default="{ row }">
                  <template v-if="row.expireDate">
                    <span v-if="remainDays(row) < 0" class="equip-tag equip-tag--danger">已过期 {{ -remainDays(row) }} 天</span>
                    <span v-else-if="remainDays(row) <= 30" class="equip-tag equip-tag--warn">剩 {{ remainDays(row) }} 天</span>
                    <span v-else class="equip-tag equip-tag--success">正常</span>
                  </template>
                  <span v-else class="equip-tag equip-tag--info">未登记</span>
                </template>
              </el-table-column>
            </el-table>
            <pagination
              v-show="batchTotal > 0"
              v-model:page="batchQuery.pageNum"
              v-model:limit="batchQuery.pageSize"
              :total="batchTotal"
              @pagination="getBatchList"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </section>
  </div>
</template>
