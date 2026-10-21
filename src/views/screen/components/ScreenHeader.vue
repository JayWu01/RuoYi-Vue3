<script setup>
import {
  ChevronDown,
  Ellipsis,
  FileDown,
  Maximize,
  Minimize,
  Moon,
  Shield,
  SlidersHorizontal,
  Sun
} from '@lucide/vue'
import { useEventListener, useNow } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed, ref, useTemplateRef, watch } from 'vue'

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
  }
})

defineEmits(['fullscreen', 'export', 'toggleTheme', 'toggleFilter'])

const now = useNow()
const clockText = computed(() => dayjs(now.value).format('HH:mm:ss'))
const isDark = computed(() => props.theme === 'dark')

const updatedAt = computed(() => {
  const match = String(props.updateTime ?? '').match(/(\d{2}:\d{2}:\d{2})/)
  return match?.[1] ?? '--:--:--'
})
const updateTitle = computed(() => `数据更新时间：${props.updateTime || '-'}`)

const dockHovered = ref(false)
const dockFocused = ref(false)
const dockPinned = ref(false)
const dockRef = useTemplateRef('dockRef')
const dockOpen = computed(() => dockHovered.value || dockFocused.value || dockPinned.value)

const toggleDock = () => {
  dockPinned.value = !dockPinned.value
}

const handleDockFocusOut = (event) => {
  if (!dockRef.value?.contains(event.relatedTarget)) {
    dockFocused.value = false
  }
}

useEventListener(document, 'pointerdown', (event) => {
  if (dockPinned.value && !dockRef.value?.contains(event.target)) {
    dockPinned.value = false
  }
})

watch(() => props.filterOpen, (open) => {
  if (open) {
    dockPinned.value = false
    dockHovered.value = false
  }
})
</script>

<template>
  <header class="screen-header">
    <div class="header-left">
      <button
        type="button"
        class="filter-trigger"
        :class="{ 'is-active': filterOpen }"
        :aria-expanded="filterOpen"
        aria-haspopup="dialog"
        @click="$emit('toggleFilter')"
      >
        <SlidersHorizontal :size="14" :stroke-width="2" aria-hidden="true" />
        <span class="filter-trigger-label">筛选</span>
        <span class="filter-summary">{{ filterSummary }}</span>
        <ChevronDown
          class="filter-chevron"
          :class="{ 'is-open': filterOpen }"
          :size="13"
          :stroke-width="2.2"
          aria-hidden="true"
        />
      </button>
    </div>

    <div class="header-brand">
      <div class="brand-mark" aria-hidden="true">
        <Shield :size="19" :stroke-width="2.2" />
      </div>
      <div class="min-w-0">
        <h1 class="brand-title">
          街面巡防质效
        </h1>
        <p class="brand-sub">
          POLICE STATION DAILY WORK DATA CENTER
        </p>
      </div>
    </div>

    <div class="header-right" :class="{ 'is-dock-open': dockOpen }">
      <span class="chip live header-live"><span class="d" />{{ loading ? '同步中' : '实时' }}</span>

      <span class="header-item header-updated" :title="updateTitle">
        更新 {{ updatedAt }}
      </span>

      <span class="header-clock">{{ clockText }}</span>

      <div
        ref="dockRef"
        class="action-dock"
        :class="{ 'is-open': dockOpen }"
        @mouseenter="dockHovered = true"
        @mouseleave="dockHovered = false"
        @focusin="dockFocused = true"
        @focusout="handleDockFocusOut"
      >
        <div class="action-dock-items">
          <button
            type="button"
            class="icon-btn theme-toggle"
            :aria-label="isDark ? '切换为浅色模式' : '切换为深色模式'"
            :title="isDark ? '切换为浅色模式' : '切换为深色模式'"
            @click="$emit('toggleTheme')"
          >
            <Transition name="scr-icon" mode="out-in">
              <Sun v-if="isDark" key="sun" :size="15" :stroke-width="2" aria-hidden="true" />
              <Moon v-else key="moon" :size="15" :stroke-width="2" aria-hidden="true" />
            </Transition>
          </button>

          <button
            type="button"
            class="icon-btn"
            :class="{ 'is-active': fullscreen }"
            :aria-label="fullscreen ? '退出全屏' : '全屏'"
            :aria-pressed="fullscreen"
            :title="fullscreen ? '退出全屏' : '全屏'"
            @click="$emit('fullscreen')"
          >
            <component
              :is="fullscreen ? Minimize : Maximize"
              :size="15"
              :stroke-width="2"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            class="icon-btn"
            aria-label="导出数据"
            title="导出数据"
            :disabled="loading"
            @click="$emit('export')"
          >
            <FileDown :size="15" :stroke-width="2" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          class="icon-btn action-dock-trigger"
          :class="{ 'is-active': dockOpen }"
          :aria-expanded="dockOpen"
          aria-label="更多操作"
          title="更多操作"
          @click="toggleDock"
        >
          <Ellipsis :size="16" :stroke-width="2.2" aria-hidden="true" />
        </button>
      </div>
    </div>

    <span v-if="loading" class="header-progress" aria-hidden="true" />
  </header>
</template>
