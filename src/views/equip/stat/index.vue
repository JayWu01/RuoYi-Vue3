<script setup>
import { RefreshCw } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { getStatAll } from '@/api/equip'

const loading = ref(false)
const dateRange = ref([])
const data = ref({})
const billSummary = ref([])

const overview = computed(() => data.value.overview || {})
const byCategory = computed(() => data.value.byCategory || [])
const byDept = computed(() => data.value.byDept || [])
const byItem = computed(() => data.value.byItem || [])

const flowText = computed(() => {
  const list = data.value.flowSummary || []
  return list
    .reduce((sum, row) => sum + (Number(row.flowCount) || 0), 0)
})

async function getData() {
  loading.value = true
  try {
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.beginTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const res = await getStatAll(params)
    data.value = res.data || {}
    billSummary.value = res.data?.billSummary || []
  } finally {
    loading.value = false
  }
}

function exportCsv() {
  const rows = [['装备分类', '库存总量', '可用数量', '借出数量', '损坏数量']]
  for (const row of byCategory.value) {
    rows.push([row.categoryName || '', row.totalQty, row.availableQty, row.loanedQty, row.damagedQty])
  }
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `装备分类统计_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

onMounted(getData)
</script>

<template>
  <div v-loading="loading" class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>装备统计报表</h3>
        <div class="flex flex-wrap items-center gap-2">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
          <el-button type="primary" @click="getData">
            统计
          </el-button>
          <el-button :icon="RefreshCw" @click="getData">
            刷新
          </el-button>
          <el-button @click="exportCsv">
            导出分类统计
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div class="equip-kpi">
            <div class="equip-kpi__label">
              支队仓库可用
            </div>
            <div class="equip-kpi__value">
              {{ overview.hqAvailable ?? 0 }}<span class="equip-kpi__unit">件</span>
            </div>
          </div>
          <div class="equip-kpi">
            <div class="equip-kpi__label">
              大队持有合计
            </div>
            <div class="equip-kpi__value">
              {{ overview.deptAvailable ?? 0 }}<span class="equip-kpi__unit">件</span>
            </div>
          </div>
          <div class="equip-kpi">
            <div class="equip-kpi__label">
              借出中
            </div>
            <div class="equip-kpi__value">
              {{ overview.hqLoaned ?? 0 }}<span class="equip-kpi__unit">件</span>
            </div>
          </div>
          <div class="equip-kpi">
            <div class="equip-kpi__label">
              库存流水条数
            </div>
            <div class="equip-kpi__value">
              {{ flowText }}<span class="equip-kpi__unit">条</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <section class="equip-panel">
        <div class="equip-panel__head">
          <h3>装备分类统计</h3>
        </div>
        <div class="equip-panel__body">
          <el-table :data="byCategory" size="small" empty-text="暂无数据">
            <el-table-column label="装备分类" prop="categoryName" min-width="140" />
            <el-table-column label="总量" prop="totalQty" width="90" align="center" />
            <el-table-column label="可用" prop="availableQty" width="90" align="center" />
            <el-table-column label="借出" prop="loanedQty" width="90" align="center" />
            <el-table-column label="损坏" prop="damagedQty" width="90" align="center" />
          </el-table>
        </div>
      </section>

      <section class="equip-panel">
        <div class="equip-panel__head">
          <h3>各单位装备持有统计</h3>
        </div>
        <div class="equip-panel__body">
          <el-table :data="byDept" size="small" empty-text="暂无数据">
            <el-table-column label="单位" prop="deptName" min-width="150" show-overflow-tooltip />
            <el-table-column label="总量" prop="totalQty" width="90" align="center" />
            <el-table-column label="可用" prop="availableQty" width="90" align="center" />
            <el-table-column label="借出" prop="loanedQty" width="90" align="center" />
            <el-table-column label="损坏" prop="damagedQty" width="90" align="center" />
            <el-table-column label="遗失" prop="lostQty" width="90" align="center" />
          </el-table>
        </div>
      </section>
    </div>

    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>装备明细统计</h3>
      </div>
      <div class="equip-panel__body">
        <el-table :data="byItem" size="small" empty-text="暂无数据">
          <el-table-column label="装备名称" prop="itemName" min-width="160" show-overflow-tooltip />
          <el-table-column label="装备分类" prop="categoryName" min-width="130" />
          <el-table-column label="单位" prop="unit" width="80" align="center" />
          <el-table-column label="库存总量" prop="totalQty" width="110" align="center" />
          <el-table-column label="可用数量" prop="availableQty" width="110" align="center" />
          <el-table-column label="借出数量" prop="loanedQty" width="110" align="center" />
          <el-table-column label="损坏数量" prop="damagedQty" width="110" align="center" />
        </el-table>
      </div>
    </section>

    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>业务单据统计</h3>
      </div>
      <div class="equip-panel__body">
        <el-table :data="billSummary" size="small" empty-text="暂无数据">
          <el-table-column label="单据类型" prop="bizName" min-width="140" />
          <el-table-column label="单据数量" prop="billCount" width="120" align="center" />
          <el-table-column label="装备数量" prop="qty" width="120" align="center" />
        </el-table>
      </div>
    </section>
  </div>
</template>
