<script setup>
import {
  ChevronDown,
  FileDown,
  Maximize,
  Minimize,
  Moon,
  RefreshCw,
  Shield,
  SlidersHorizontal,
  Sun
} from '@lucide/vue'
import { useNow } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed } from 'vue'
import ExpandingActionGroup from './ExpandingActionGroup.vue'
import TickingClock from './TickingClock.vue'

const props = defineProps({
  updateTime: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    default: 'dark'
  },
  filterOpen: {
    type: Boolean,
    default: false
  },
  filterSummary: {
    type: String,
    default: ''
  },
  panel: {
    type: String,
    default: 'swat'
  },
  exportable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: 'live'
  },
  filterable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['fullscreen', 'export', 'refresh', 'toggleTheme', 'toggleFilter', 'update:panel'])

const PANEL_TABS = [
  { value: 'swat', label: '特巡警' },
  { value: 'subBureau', label: '分县局' }
]

const now = useNow()
const clockText = computed(() => dayjs(now.value).format('HH:mm:ss'))
const isDark = computed(() => props.theme === 'dark')
const isPending = computed(() => props.status === 'pending')
const isStale = computed(() => props.status === 'stale')
const statusText = computed(() => {
  if (isPending.value) {
    return '数据接入中'
  }
  if (props.loading) {
    return '同步中'
  }
  return isStale.value ? '数据未更新' : '数据正常'
})
const statusTone = computed(() => {
  if (isPending.value) {
    return 'text-scr-faint'
  }
  if (props.loading || isStale.value) {
    return 'text-scr-warning'
  }
  return 'text-scr-success'
})

const updateTitle = computed(() => `数据更新时间：${props.updateTime || '-'}`)
const updateLabel = computed(() => {
  if (isPending.value) {
    return '等待接入'
  }

  const updated = dayjs(props.updateTime)
  if (!updated.isValid()) {
    return '暂无更新'
  }

  const seconds = Math.max(0, dayjs(now.value).diff(updated, 'second'))
  if (seconds < 60) {
    return '刚刚更新'
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} 分钟前更新`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours} 小时前更新`
  }

  const days = Math.floor(hours / 24)
  if (days < 30) {
    return `${days} 天前更新`
  }

  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months} 个月前更新`
  }
  return `${Math.floor(days / 365)} 年前更新`
})
const updateDisplay = computed(() => (isStale.value ? `上次 ${updateLabel.value}` : updateLabel.value))

const headerActions = computed(() => {
  const actions = [
    {
      key: 'refresh',
      label: '刷新',
      aria: '刷新数据',
      icon: RefreshCw,
      disabled: props.loading,
      spinning: props.loading
    },
    {
      key: 'theme',
      label: isDark.value ? '浅色' : '深色',
      aria: isDark.value ? '切换为浅色模式' : '切换为深色模式',
      icon: isDark.value ? Sun : Moon
    },
    {
      key: 'fullscreen',
      label: props.fullscreen ? '退出' : '全屏',
      aria: props.fullscreen ? '退出全屏' : '全屏',
      icon: props.fullscreen ? Minimize : Maximize
    }
  ]

  if (props.exportable) {
    actions.push({
      key: 'export',
      label: '导出',
      aria: '导出数据',
      icon: FileDown,
      disabled: props.loading
    })
  }

  return actions
})

const handleHeaderAction = (key) => {
  if (key === 'refresh') {
    emit('refresh')
  } else if (key === 'theme') {
    emit('toggleTheme')
  } else if (key === 'fullscreen') {
    emit('fullscreen')
  } else if (key === 'export') {
    emit('export')
  }
}
</script>

<template>
  <header class="sticky top-0 z-30 grid min-h-[var(--scr-header-height)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 border-b border-scr-line bg-scr-header px-5 max-[1023px]:gap-2.5 max-[1023px]:px-3.5 max-[640px]:gap-2 max-[640px]:px-3">
    <div class="flex min-w-0 items-center justify-self-start gap-2">
      <!-- 分县局入口隐藏时只剩一个面板，不显示单选标签 -->
      <div
        v-if="PANEL_TABS.length > 1"
        class="flex h-[34px] items-center gap-1 rounded-full border border-scr-line bg-scr-surface p-[2px]"
        role="tablist"
        aria-label="单位类型"
      >
        <button
          v-for="tab in PANEL_TABS"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="panel === tab.value"
          class="inline-flex h-[30px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent px-3 text-scr-status font-semibold text-scr-muted transition-colors duration-scr-fast hover:text-scr-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--scr-focus)]"
          :class="panel === tab.value ? 'bg-scr-accent-soft text-scr-accent' : ''"
          @click="emit('update:panel', tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <button
        v-if="filterable"
        type="button"
        class="inline-flex h-[34px] min-w-0 cursor-pointer items-center gap-2 rounded-full border border-scr-line bg-scr-surface px-3 text-scr-muted transition-colors duration-scr-fast hover:border-scr-line-strong hover:bg-scr-surface-2 hover:text-scr-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--scr-focus)] max-[640px]:size-[34px] max-[640px]:justify-center max-[640px]:p-0"
        :class="filterOpen ? 'border-scr-accent-line bg-scr-accent-soft text-scr-accent' : ''"
        :aria-expanded="filterOpen"
        aria-haspopup="dialog"
        @click="$emit('toggleFilter')"
      >
        <SlidersHorizontal :size="14" :stroke-width="2" class="shrink-0" aria-hidden="true" />
        <span class="shrink-0 text-scr-label font-semibold leading-none max-[640px]:hidden">筛选</span>
        <span
          class="max-w-[250px] truncate text-scr-meta leading-none tabular-nums max-[1330px]:hidden"
          :class="filterOpen ? 'text-scr-accent opacity-80' : 'text-scr-faint'"
        >{{ filterSummary }}</span>
        <ChevronDown
          :size="13"
          :stroke-width="2.2"
          class="shrink-0 text-scr-faint transition-transform duration-scr-base max-[640px]:hidden"
          :class="filterOpen ? 'rotate-180' : ''"
          aria-hidden="true"
        />
      </button>
    </div>

    <div class="flex min-w-0 items-center justify-self-center gap-3 max-[1023px]:gap-2.5 max-[640px]:gap-2">
      <div class="grid size-9 shrink-0 place-items-center rounded-[10px] bg-scr-accent text-scr-on-accent max-[1023px]:size-8 max-[640px]:size-7" aria-hidden="true">
        <Shield :size="20" :stroke-width="2.2" />
      </div>
      <h1 class="m-0 whitespace-nowrap text-scr-h1 font-bold leading-none tracking-[0.4px] text-scr-fg max-[1023px]:text-scr-title max-[640px]:tracking-[0.2px]">
        街面巡防质效
      </h1>
    </div>

    <div class="flex min-w-0 items-center justify-self-end gap-2.5 text-scr-meta text-scr-faint max-[1023px]:gap-2">
      <div class="status-capsule inline-flex h-[38px] items-center gap-2.5 whitespace-nowrap rounded-full border border-scr-line bg-scr-surface px-3.5 max-[1160px]:gap-2 max-[1023px]:px-2.5 max-[640px]:hidden">
        <span
          class="inline-flex items-center gap-[5px] text-scr-status font-semibold leading-none tracking-[0.2px] transition-colors max-[1160px]:hidden"
          :class="statusTone"
          aria-live="polite"
        >
          <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
          <Transition
            enter-active-class="transition duration-scr-fast ease-scr-out"
            enter-from-class="opacity-0 translate-y-0.5 blur-[2px]"
            leave-active-class="transition duration-scr-fast ease-in"
            leave-to-class="opacity-0 -translate-y-0.5 blur-[2px]"
            mode="out-in"
          >
            <span :key="statusText" class="inline-block min-w-[32px] leading-none">{{ statusText }}</span>
          </Transition>
        </span>

        <span class="h-3.5 w-px shrink-0 bg-scr-line max-[1160px]:hidden" aria-hidden="true" />

        <span class="min-w-[92px] text-center leading-none tabular-nums max-[1330px]:hidden" :title="updateTitle">
          <Transition
            enter-active-class="transition duration-scr-base ease-scr-out"
            enter-from-class="opacity-0 translate-y-0.5"
            leave-active-class="transition duration-scr-fast ease-in"
            leave-to-class="opacity-0 -translate-y-0.5"
            mode="out-in"
          >
            <span :key="updateDisplay" class="inline-block leading-none">{{ updateDisplay }}</span>
          </Transition>
        </span>

        <span class="h-3.5 w-px shrink-0 bg-scr-line max-[1330px]:hidden" aria-hidden="true" />

        <TickingClock
          :value="clockText"
          label="当前时间"
          class="text-scr-clock font-bold tracking-[0.3px] text-scr-fg max-[1023px]:text-[18px]"
        />
      </div>

      <ExpandingActionGroup
        :actions="headerActions"
        default-key="refresh"
        @select="handleHeaderAction"
      />
    </div>

    <span v-if="loading" class="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 overflow-hidden" aria-hidden="true">
      <span class="absolute inset-y-0 left-0 w-[30%] animate-scr-progress bg-[linear-gradient(90deg,transparent,var(--scr-accent),var(--scr-accent-2),transparent)]" />
    </span>
  </header>
</template>
