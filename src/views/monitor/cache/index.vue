<script setup name="Cache">
import { ChartPie, Gauge, Monitor } from '@lucide/vue'
import { Cell, Legend, Pie, PieChart, Tooltip } from 'vccs'
import { computed, getCurrentInstance, ref } from 'vue'
import { getCache } from '@/api/monitor/cache'

const cache = ref({})
const { proxy } = getCurrentInstance()

const commandStats = computed(() => cache.value?.commandStats ?? [])
const commandTotal = computed(() => commandStats.value.reduce(
  (sum, item) => sum + (Number(item.value) || 0),
  0
))
const commandPercent = value => (
  commandTotal.value ? `${((Number(value) / commandTotal.value) * 100).toFixed(1)}%` : '0%'
)

const memoryPercent = computed(() => {
  const info = cache.value?.info
  const used = Number(info?.used_memory)
  const max = Number(info?.maxmemory)
  if (!Number.isFinite(used) || !Number.isFinite(max) || max <= 0) {
    return null
  }
  return Math.min(100, Math.round((used / max) * 100))
})
const memoryRows = computed(() => {
  const used = memoryPercent.value ?? 0
  return [
    { name: '已用', value: used },
    { name: '剩余', value: 100 - used }
  ]
})

function getList() {
  proxy.$modal.loading('正在加载缓存监控数据，请稍候！')
  getCache().then((response) => {
    proxy.$modal.closeLoading()
    cache.value = response.data
  })
}

getList()
</script>

<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header>
            <Monitor class="mr-1 align-middle" />
            <span class="align-middle">基本信息</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" class="w-full">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      Redis版本
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.redis_version }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      运行模式
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.redis_mode === "standalone" ? "单机" : "集群" }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      端口
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.tcp_port }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      客户端数
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.connected_clients }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      运行时间(天)
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.uptime_in_days }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      使用内存
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.used_memory_human }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      使用CPU
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      内存配置
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.maxmemory_human }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      AOF是否开启
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.aof_enabled === "0" ? "否" : "是" }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      RDB是否成功
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.rdb_last_bgsave_status }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      Key数量
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.dbSize" class="cell">
                      {{ cache.dbSize }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      网络入口/出口
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.instantaneous_input_kbps }}kps/{{
                        cache.info.instantaneous_output_kbps
                      }}kps
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <ChartPie class="mr-1 align-middle" />
            <span class="align-middle">命令统计</span>
          </template>
          <div class="relative h-[420px]">
            <PieChart
              v-if="commandStats.length"
              :data="commandStats"
              :margin="{ top: 4, right: 8, bottom: 8, left: 8 }"
            >
              <Pie
                data-key="value"
                name-key="name"
                inner-radius="34%"
                outer-radius="78%"
                :padding-angle="1.5"
                :corner-radius="4"
                stroke="none"
              />
              <Tooltip>
                <template #content="{ payload }">
                  <div class="cache-chart-tooltip">
                    <div v-for="item in payload" :key="item.name" class="row">
                      <span class="dot" :style="{ background: item.color }" />
                      <span class="name">{{ item.name }}</span>
                      <b class="value">{{ item.value }}</b>
                      <span class="pct">{{ commandPercent(item.value) }}</span>
                    </div>
                  </div>
                </template>
              </Tooltip>
              <Legend vertical-align="bottom" align="center" :icon-size="8" />
            </PieChart>
            <el-empty v-else description="暂无数据" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header>
            <Gauge class="mr-1 align-middle" />
            <span class="align-middle">内存信息</span>
          </template>
          <div class="relative h-[420px]">
            <template v-if="memoryPercent !== null">
              <PieChart :data="memoryRows">
                <Pie
                  data-key="value"
                  name-key="name"
                  inner-radius="74%"
                  outer-radius="90%"
                  :corner-radius="10"
                  stroke="none"
                >
                  <Cell fill="var(--el-color-primary)" />
                  <Cell fill="var(--el-border-color-lighter)" />
                </Pie>
              </PieChart>
              <div class="cache-gauge-center">
                <b>{{ cache.info?.used_memory_human }}</b>
                <span>已用 / {{ cache.info?.maxmemory_human }}</span>
                <span class="pct">{{ memoryPercent }}%</span>
              </div>
            </template>
            <el-empty v-else description="未设置内存上限" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
:deep(.v-charts-wrapper) {
  font-family: var(--el-font-family);
}

:deep(.cache-chart-tooltip) {
  padding: 6px 10px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color-overlay);
  box-shadow: var(--el-box-shadow-light);
  color: var(--el-text-color-primary);
  font-size: 12px;
  line-height: 1.8;
  white-space: nowrap;
}
:deep(.cache-chart-tooltip .row) {
  display: flex;
  align-items: center;
  gap: 8px;
}
:deep(.cache-chart-tooltip .dot) {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
:deep(.cache-chart-tooltip .value) {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
:deep(.cache-chart-tooltip .pct) {
  width: 48px;
  color: var(--el-text-color-secondary);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.cache-gauge-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  pointer-events: none;
  text-align: center;
}
.cache-gauge-center b {
  color: var(--el-text-color-primary);
  font-size: 26px;
  line-height: 1;
}
.cache-gauge-center span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.cache-gauge-center .pct {
  color: var(--el-color-primary);
  font-size: 16px;
  font-weight: 600;
}
</style>
