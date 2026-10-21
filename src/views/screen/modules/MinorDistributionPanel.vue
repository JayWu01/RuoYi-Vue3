<script setup>
/**
 * 罪错未成年分布：纯 SVG 环图（替代 ECharts pie，减少一个 canvas 实例）
 * 中心总人数 + 右侧图例（名称 / 数值 / 占比）+ 底部非预警与环比信息。
 */
import { ChartPie } from '@lucide/vue'
import { computed, ref } from 'vue'
import { getScreenPalette } from '../charts/palette'
import AnimatedStatistic from '../components/AnimatedStatistic.vue'
import DonutChart from '../components/DonutChart.vue'
import ScreenPanel from '../components/ScreenPanel.vue'
import TrendValue from '../components/TrendValue.vue'
import { useScreenTheme } from '../composables/useScreenTheme'
import { MINOR_LEVELS } from '../constant'
import { isTrendUp } from '../utils/trend'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const { theme } = useScreenTheme()
const palette = computed(() => getScreenPalette(theme.value))

const activeIndex = ref(null)

const pieData = computed(() => props.data.dataList || [])
const total = computed(() => props.data.total ?? pieData.value.reduce((sum, item) => sum + (item.value || 0), 0))
const hasData = computed(() => total.value > 0)
const showSkeleton = computed(() => props.loading && !hasData.value)
const unwarnedCount = computed(() => props.data.unwarnedMinorCount ?? '-')
const unwarnedRatio = computed(() => props.data.unwarnedMinorRatio ?? '-')
const compareRatio = computed(() => props.data.ratioCompareYesterday ?? '-')
const unwarnedUp = computed(() => isTrendUp(unwarnedRatio.value))
const compareUp = computed(() => isTrendUp(compareRatio.value))

const percentage = value => (total.value ? `${((value / total.value) * 100).toFixed(1)}%` : '0%')

const levelColor = (name, index) => {
  const level = MINOR_LEVELS.find(entry => entry.label === name)
  return palette.value.levels[level?.key]
    ?? palette.value.levels[MINOR_LEVELS[index]?.key]
    ?? palette.value.levels.gray
}

const donutData = computed(() => pieData.value.map((item, index) => ({
  name: item.name,
  value: item.value || 0,
  color: levelColor(item.name, index)
})))

const trendClass = up => (up ? 'trend-up-bad' : 'trend-down-good')
</script>

<template>
  <ScreenPanel title="罪错未成年分布" unit="(单位：人)" :loading="loading">
    <div class="panel-stack">
      <Transition name="scr-swap">
        <div v-if="showSkeleton" key="skeleton" class="flex min-h-0 flex-1 flex-col" aria-hidden="true">
          <div class="flex min-h-0 flex-1 items-center gap-3 px-4 pb-2">
            <span class="scr-skeleton is-circle shrink-0" style="width: 158px; height: 158px" />
            <div class="flex min-w-0 flex-1 flex-col gap-3">
              <div v-for="index in 5" :key="index" class="flex items-center gap-2">
                <span class="scr-skeleton is-circle" style="width: 7px; height: 7px" />
                <span class="scr-skeleton" style="width: 42px; height: 10px" />
                <span class="scr-skeleton ml-auto" style="width: 30px; height: 10px" />
                <span class="scr-skeleton" style="width: 38px; height: 10px" />
              </div>
            </div>
          </div>
          <div class="panel-footer">
            <span class="scr-skeleton" style="width: 110px; height: 10px" />
            <span class="scr-skeleton ml-auto" style="width: 120px; height: 10px" />
          </div>
        </div>

        <div v-else key="content" class="flex min-h-0 flex-1 flex-col">
          <div v-if="hasData" class="flex min-h-0 flex-1 items-center gap-3 px-4 pb-2">
            <div class="shrink-0">
              <DonutChart
                :data="donutData"
                :size="158"
                :active-index="activeIndex"
                aria-label="罪错未成年等级分布环形图"
                @hover="activeIndex = $event"
              >
                <template #default="{ total: donutTotal, active }">
                  <AnimatedStatistic
                    :value="active?.value ?? donutTotal"
                    class="donut-total"
                    :loading="loading"
                  />
                  <span class="donut-label">{{ active?.name ?? '总人数' }}</span>
                </template>
              </DonutChart>
            </div>

            <ul class="donut-legend m-0 list-none p-0" role="list">
              <li
                v-for="(item, index) in donutData"
                :key="item.name"
                class="donut-legend-row"
                :class="{ 'is-active': activeIndex === index }"
                @mouseenter="activeIndex = index"
                @mouseleave="activeIndex = null"
              >
                <span class="dot" :style="{ background: item.color }" />
                <span class="n">{{ item.name }}</span>
                <span class="v">{{ item.value }}</span>
                <span class="p">{{ percentage(item.value) }}</span>
              </li>
            </ul>
          </div>

          <div v-else class="empty-state">
            <div class="empty-ico">
              <ChartPie :size="16" :stroke-width="1.8" />
            </div>
            <span>暂无数据</span>
          </div>

          <div class="panel-footer">
            <span class="chip warn">
              <span class="d" />
              非预警 <b class="strong">{{ unwarnedCount }}</b> 人
            </span>
            <span class="inline-flex items-center gap-1">
              环比
              <TrendValue
                :value="unwarnedRatio"
                :up="unwarnedUp"
                show-direction
                :class="trendClass(unwarnedUp)"
              />
            </span>
            <span class="ml-auto inline-flex items-center gap-1">
              昨日对比
              <TrendValue
                :value="compareRatio"
                :up="compareUp"
                show-direction
                :class="trendClass(compareUp)"
              />
            </span>
          </div>
        </div>
      </Transition>
    </div>
  </ScreenPanel>
</template>
