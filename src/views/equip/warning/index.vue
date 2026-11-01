<script setup>
import { Bell, RefreshCw } from '@lucide/vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { getWarningList, getWarningSummary, refreshWarning } from '@/api/equip'
import { equipCtx, loadEquipCtx } from '../context'

const loading = ref(false)
const activeTab = ref('loan')
const summary = ref({})
const loanWarnings = ref([])
const expireWarnings = ref([])
const rotateWarnings = ref([])
const days = ref(30)

const scope = computed(() => equipCtx.scope)

async function getData() {
  loading.value = true
  try {
    await loadEquipCtx()
    const [sum, list] = await Promise.all([getWarningSummary(days.value), getWarningList(days.value)])
    summary.value = sum.data || {}
    loanWarnings.value = list.data?.loanWarnings || []
    expireWarnings.value = list.data?.expireWarnings || []
    rotateWarnings.value = list.data?.rotateWarnings || []
  } finally {
    loading.value = false
  }
}

async function handleRefresh() {
  await refreshWarning()
  ElMessage.success('提醒消息已生成，可在消息中心查看')
  await loadEquipCtx(true)
}

onMounted(getData)
</script>

<template>
  <div v-loading="loading" class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>预警中心</h3>
        <div class="flex flex-wrap items-center gap-2">
          <el-select v-model="days" style="width: 140px" @change="getData">
            <el-option label="提前 30 天" :value="30" />
            <el-option label="提前 60 天" :value="60" />
            <el-option label="提前 90 天" :value="90" />
            <el-option label="提前 180 天" :value="180" />
          </el-select>
          <el-button :icon="RefreshCw" @click="getData">
            刷新
          </el-button>
          <el-button type="primary" :icon="Bell" @click="handleRefresh">
            生成提醒消息
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div class="equip-kpi">
            <div class="equip-kpi__label">
              借用即将到期 / 逾期
            </div>
            <div class="equip-kpi__value">
              {{ summary.loanWarnings ?? 0 }}<span class="equip-kpi__unit">单</span>
            </div>
          </div>
          <div class="equip-kpi">
            <div class="equip-kpi__label">
              装备有效期预警
            </div>
            <div class="equip-kpi__value">
              {{ summary.expireWarnings ?? 0 }}<span class="equip-kpi__unit">批</span>
            </div>
          </div>
          <div class="equip-kpi">
            <div class="equip-kpi__label">
              装备轮换提醒
            </div>
            <div class="equip-kpi__value">
              {{ summary.rotateWarnings ?? 0 }}<span class="equip-kpi__unit">项</span>
            </div>
          </div>
        </div>
        <div class="mt-3 text-[12px] text-[#93a9bd]">
          当前范围：{{ scope.all ? '全支队' : '本单位及下属单位' }}；借用到期默认提前 2 天提醒，有效期按装备配置的预警天数计算
        </div>
      </div>
    </section>

    <section class="equip-panel">
      <div class="equip-panel__body">
        <el-tabs v-model="activeTab">
          <el-tab-pane :label="`借用到期提醒（${loanWarnings.length}）`" name="loan">
            <el-table :data="loanWarnings" size="small" empty-text="暂无借用到期提醒">
              <el-table-column label="借用单号" prop="loanNo" min-width="160" show-overflow-tooltip />
              <el-table-column label="借用单位" prop="loanDeptName" min-width="150" show-overflow-tooltip />
              <el-table-column label="借用人" prop="borrowerName" width="110" align="center" />
              <el-table-column label="借用数量" prop="totalQty" width="90" align="center" />
              <el-table-column label="预计归还" prop="expectReturnDate" width="130" align="center" />
              <el-table-column label="状态" width="130" align="center">
                <template #default="{ row }">
                  <span class="equip-tag" :class="row.overdueDays > 0 ? 'equip-tag--danger' : 'equip-tag--warn'">
                    {{ row.warnState }}{{ row.overdueDays > 0 ? ` ${row.overdueDays} 天` : '' }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane :label="`装备有效期预警（${expireWarnings.length}）`" name="expire">
            <el-table :data="expireWarnings" size="small" empty-text="暂无有效期预警">
              <el-table-column label="装备名称" prop="itemName" min-width="150" show-overflow-tooltip />
              <el-table-column label="批次号" prop="batchNo" min-width="150" show-overflow-tooltip />
              <el-table-column label="持有单位" prop="deptName" min-width="150" show-overflow-tooltip />
              <el-table-column label="剩余数量" prop="remainQty" width="100" align="center" />
              <el-table-column label="到期日期" prop="expireDate" width="130" align="center" />
              <el-table-column label="剩余天数" width="110" align="center">
                <template #default="{ row }">
                  <span class="equip-tag" :class="row.remainDays < 0 ? 'equip-tag--danger' : 'equip-tag--warn'">
                    {{ row.remainDays < 0 ? `已过期 ${-row.remainDays} 天` : `${row.remainDays} 天` }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane :label="`装备轮换提醒（${rotateWarnings.length}）`" name="rotate">
            <el-table :data="rotateWarnings" size="small" empty-text="暂无轮换提醒">
              <el-table-column label="装备名称" prop="itemName" min-width="150" show-overflow-tooltip />
              <el-table-column label="领用单号" prop="requisitionNo" min-width="160" show-overflow-tooltip />
              <el-table-column label="持有单位" prop="deptName" min-width="150" show-overflow-tooltip />
              <el-table-column label="领用数量" prop="qty" width="90" align="center" />
              <el-table-column label="领用时间" prop="issueTime" width="130" align="center" />
              <el-table-column label="轮换周期" width="100" align="center">
                <template #default="{ row }">
                  {{ row.rotateMonths }} 个月
                </template>
              </el-table-column>
              <el-table-column label="应检查日期" prop="rotateDate" width="130" align="center" />
              <el-table-column label="超期" width="100" align="center">
                <template #default="{ row }">
                  <span class="equip-tag equip-tag--warn">{{ row.overdueDays }} 天</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </section>
  </div>
</template>
