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

const updateTitle = computed(() => `数据更新时间：${props.updateTime || '-'}`)
const updateLabel = computed(() => {
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
  <header class="sticky top-0 z-30 grid min-h-[var(--scr-header-height)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 border-b border-scr-line bg-scr-glass-strong px-5 backdrop-blur-[20px] max-[1023px]:gap-2.5 max-[1023px]:px-3.5 max-[640px]:gap-2 max-[640px]:px-3">
    <div class="flex min-w-0 items-center justify-self-start gap-2">
      <!-- 分县局入口隐藏时只剩一个面板，不显示单选标签 -->
      <div
        v-if="PANEL_TABS.length > 1"
        class="flex items-center gap-1 rounded-full border border-scr-line bg-scr-surface p-0.5"
        role="tablist"
        aria-label="单位类型"
      >
        <button
          v-for="tab in PANEL_TABS"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="panel === tab.value"
          class="inline-flex h-7 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent px-3 text-xs font-semibold text-scr-muted transition-colors duration-150 hover:text-scr-fg"
          :class="panel === tab.value ? 'bg-scr-accent-soft text-scr-accent' : ''"
          @click="emit('update:panel', tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <button
        type="button"
        class="inline-flex h-[34px] min-w-0 cursor-pointer items-center gap-2 rounded-full border border-scr-line bg-scr-surface px-3 text-scr-muted transition-colors duration-150 hover:border-scr-line-strong hover:bg-scr-surface-2 hover:text-scr-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--scr-focus)] max-[640px]:size-8 max-[640px]:justify-center max-[640px]:p-0"
        :class="filterOpen ? 'border-scr-accent-line bg-scr-accent-soft text-scr-accent' : ''"
        :aria-expanded="filterOpen"
        aria-haspopup="dialog"
        @click="$emit('toggleFilter')"
      >
        <SlidersHorizontal :size="14" :stroke-width="2" class="shrink-0" aria-hidden="true" />
        <span class="shrink-0 text-xs font-semibold leading-none max-[640px]:hidden">筛选</span>
        <span
          class="max-w-[230px] truncate text-[10.5px] leading-none tabular-nums max-[1330px]:hidden"
          :class="filterOpen ? 'text-scr-accent opacity-80' : 'text-scr-faint'"
        >{{ filterSummary }}</span>
        <ChevronDown
          :size="13"
          :stroke-width="2.2"
          class="shrink-0 text-scr-faint transition-transform duration-200 max-[640px]:hidden"
          :class="filterOpen ? 'rotate-180' : ''"
          aria-hidden="true"
        />
      </button>
    </div>

    <div class="flex min-w-0 items-center justify-self-center gap-2.5 max-[1023px]:gap-2 max-[640px]:gap-[7px]">
      <div class="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-scr-accent-gradient text-scr-on-accent shadow-[0_6px_18px_var(--scr-accent-glow)] max-[1023px]:size-[30px] max-[1023px]:rounded-[9px] max-[640px]:size-7 max-[640px]:rounded-lg" aria-hidden="true">
        <Shield :size="19" :stroke-width="2.2" />
      </div>
      <div class="min-w-0 flex flex-col gap-1">
        <h1 class="m-0 whitespace-nowrap text-[17px] font-bold leading-[1.2] tracking-[0.5px] text-scr-fg max-[1023px]:text-base max-[768px]:text-[15.5px] max-[640px]:text-[15px] max-[640px]:tracking-[0.3px]">
          街面巡防质效
        </h1>
        <p class="my-0 whitespace-nowrap text-[9.5px] font-medium leading-none tracking-[2.4px] text-scr-faint max-[1023px]:hidden">
          POLICE STATION DAILY WORK DATA CENTER
        </p>
      </div>
    </div>

    <div class="flex min-w-0 items-center justify-self-end gap-2.5 text-[10.5px] text-scr-faint max-[1023px]:gap-2">
      <div class="status-capsule inline-flex h-9 items-center gap-2.5 whitespace-nowrap rounded-full border border-scr-line bg-scr-surface px-3 max-[1160px]:gap-2 max-[1023px]:h-[34px] max-[1023px]:px-2.5 max-[640px]:hidden">
        <span
          class="inline-flex items-center gap-[5px] text-[10.5px] font-semibold leading-none tracking-[0.3px] transition-colors max-[1160px]:hidden"
          :class="loading ? 'text-scr-warning' : 'text-scr-success'"
        >
          <span class="size-1.5 animate-scr-blink rounded-full bg-current shadow-[0_0_8px_currentColor]" aria-hidden="true" />
          <Transition
            enter-active-class="transition duration-150 ease-scr-out"
            enter-from-class="opacity-0 translate-y-0.5 blur-[2px]"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0 -translate-y-0.5 blur-[2px]"
            mode="out-in"
          >
            <span :key="loading ? 'syncing' : 'live'" class="inline-block min-w-[32px] leading-none">{{ loading ? '同步中' : '实时' }}</span>
          </Transition>
        </span>

        <span class="h-3.5 w-px shrink-0 bg-scr-line max-[1160px]:hidden" aria-hidden="true" />

        <span class="min-w-[82px] text-center leading-none tabular-nums max-[1330px]:hidden" :title="updateTitle">
          <Transition
            enter-active-class="transition duration-200 ease-scr-out"
            enter-from-class="opacity-0 translate-y-0.5"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="opacity-0 -translate-y-0.5"
            mode="out-in"
          >
            <span :key="updateLabel" class="inline-block leading-none">{{ updateLabel }}</span>
          </Transition>
        </span>

        <span class="h-3.5 w-px shrink-0 bg-scr-line max-[1330px]:hidden" aria-hidden="true" />

        <TickingClock
          :value="clockText"
          label="当前时间"
          class="text-base font-bold tracking-[0.4px] text-scr-fg max-[1023px]:text-[13px]"
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
