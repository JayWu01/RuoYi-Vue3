<script setup>
import { Copy, RefreshCw, Search } from '@lucide/vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { getAnalysisReport } from '@/api/report/analysisReport'

const queryFormRef = ref(null)
const loading = ref(false)
const report = ref(null)

const queryParams = reactive({
  // 默认本期：今天 00:00:00 ~ 23:59:59（上期即昨天，由后端自动推算）
  timeRange: [
    `${dayjs().format('YYYY-MM-DD')} 00:00:00`,
    `${dayjs().format('YYYY-MM-DD')} 23:59:59`
  ],
  startDate: '',
  endDate: ''
})

const handleQuery = async () => {
  if (queryParams.timeRange?.length === 2) {
    queryParams.startDate = queryParams.timeRange[0]
    queryParams.endDate = queryParams.timeRange[1]
  } else {
    ElMessage.warning('请选择本期起止时间')
    return
  }
  loading.value = true
  try {
    const res = await getAnalysisReport({ startDate: queryParams.startDate, endDate: queryParams.endDate })
    if (res.code === 200) {
      report.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.timeRange = [
    `${dayjs().format('YYYY-MM-DD')} 00:00:00`,
    `${dayjs().format('YYYY-MM-DD')} 23:59:59`
  ]
  handleQuery()
}

const copyText = async (text, tip) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(tip || '已复制')
  } catch {
    // 非安全上下文（http）时 clipboard API 不可用，退回 execCommand
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    ElMessage.success(tip || '已复制')
  }
}

// 环比量显示：正数带 +，0 显示 0
const fmtIncrease = (row) => {
  const v = Number(row.increase)
  if (!Number.isFinite(v)) return '-'
  return v > 0 ? `+${v}` : `${v}`
}

onMounted(() => {
  handleQuery()
})
</script>

<template>
  <div class="app-container">
    <!-- 查询区域 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true" size="small">
      <el-form-item label="本期时间" prop="timeRange">
        <el-date-picker
          v-model="queryParams.timeRange"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">
          生成
        </el-button>
        <el-button :icon="RefreshCw" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
      <el-form-item v-if="report">
        <el-button type="success" :icon="Copy" @click="copyText(report.fullText, '全部话术已复制')">
          复制全部话术
        </el-button>
      </el-form-item>
    </el-form>

    <div v-loading="loading">
      <template v-if="report">
        <!-- 期间说明 -->
        <el-alert type="info" :closable="false" class="mb-3">
          <template #title>
            本期：{{ report.currentPeriodText }} ｜ 环比上期：{{ report.previousPeriodText }}
          </template>
        </el-alert>

        <!-- 各统计大块 -->
        <el-card v-for="block in report.blocks" :key="block.blockName" class="mb-3" shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">{{ block.blockName }}</span>
              <el-button size="small" text type="primary" :icon="Copy" @click="copyText(block.narrative, '本段话术已复制')">
                复制本段
              </el-button>
            </div>
          </template>

          <!-- 指标明细表 -->
          <el-table :data="block.metrics" border size="small" class="mb-3">
            <el-table-column label="指标" prop="metricName" min-width="200" />
            <el-table-column label="本期量" align="center" width="110">
              <template #default="{ row }">
                {{ row.current }}{{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column label="前期量（上期）" align="center" width="130">
              <template #default="{ row }">
                {{ row.previous }}{{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column label="环比量" align="center" width="110">
              <template #default="{ row }">
                {{ fmtIncrease(row) }}{{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column label="环比率" align="center" width="110">
              <template #default="{ row }">
                <span
                  :class="{
                    'text-red-500': Number(row.increase) > 0,
                    'text-green-600': Number(row.increase) < 0,
                  }"
                >{{ row.ratioText }}</span>
              </template>
            </el-table-column>
          </el-table>

          <!-- 本块话术 -->
          <div class="whitespace-pre-wrap leading-7 text-[14px] text-gray-800">
            {{ block.narrative }}
          </div>
        </el-card>
      </template>

      <el-empty v-else-if="!loading" description="选择时间后点击「生成」" />
    </div>
  </div>
</template>
