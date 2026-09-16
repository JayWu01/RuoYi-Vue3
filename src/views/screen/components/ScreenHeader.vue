<script setup>
import { FileDown, Maximize, Minimize } from '@lucide/vue'

defineProps({
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
  }
})

defineEmits(['fullscreen', 'export'])
</script>

<template>
  <header class="relative flex min-h-header items-center justify-center border-b border-x-0 border-t-0 border-line/50 after:absolute after:bottom-[-2px] after:left-1/4 after:h-0.5 after:w-1/2 after:bg-gradient-to-r after:from-transparent after:via-accent after:to-transparent after:shadow-header after:content-empty max-lg:justify-start max-md:flex-col max-md:items-start max-md:gap-2 max-md:py-3">
    <div class="flex items-center gap-2 max-lg:ml-4 max-lg:text-left max-md:ml-0">
      <div aria-hidden="true" class="hidden h-16 w-48 items-center lg:flex xl:w-56 2xl:w-64">
        <span class="relative flex h-12 w-full items-center">
          <span class="absolute left-0 right-5 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-accent/35 to-accent/90" />
          <span class="relative ml-auto flex h-10 items-center justify-center gap-1">
            <span class="h-4 w-3 -skew-x-[135deg] bg-gradient-to-b from-[#57d9fa] via-[#2bbaf0] to-[#0b68b3] shadow-[0_0_0.65rem_rgba(32,181,241,0.45)]" />
            <span class="h-4 w-3 -skew-x-[135deg] bg-gradient-to-b from-[#42c9f5] via-[#20b5f1] to-[#0a5da9] shadow-[0_0_0.65rem_rgba(32,181,241,0.38)]" />
            <span class="h-4 w-3 -skew-x-[135deg] bg-gradient-to-b from-[#3bbff0] via-[#149fe1] to-[#0a579d] shadow-[0_0_0.65rem_rgba(32,181,241,0.34)]" />
            <span class="h-4 w-3 -skew-x-[135deg] bg-gradient-to-b from-[#35b7ed] via-[#128fd0] to-[#084b8e] shadow-[0_0_0.65rem_rgba(32,181,241,0.3)]" />
            <span class="h-4 w-3 -skew-x-[135deg] bg-gradient-to-b from-[#2da9e3] via-[#0f82c1] to-[#073f7d] shadow-[0_0_0.65rem_rgba(32,181,241,0.28)]" />
            <span class="h-4 w-3 -skew-x-[135deg] bg-gradient-to-b from-[#269bd8] via-[#0d73b3] to-[#06366c] shadow-[0_0_0.65rem_rgba(32,181,241,0.25)]" />
          </span>
        </span>
      </div>
      <div class="text-center max-lg:text-left">
        <h1 class="m-0 bg-gradient-to-b from-white via-[#f1fbff] to-[#8fc9ed] bg-clip-text text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[0.25rem] text-transparent drop-shadow-[0_0_12px_rgba(81,183,244,0.4)]">
          街面巡防质效
        </h1>
        <p class="mb-0 mt-1 text-xs tracking-[0.25rem] text-[#78a8c8] max-md:tracking-[0.25rem]">
          POLICE STATION DAILY WORK DATA CENTER
        </p>
      </div>
      <div aria-hidden="true" class="hidden h-16 w-48 items-center lg:flex xl:w-56 2xl:w-64">
        <span class="relative flex h-12 w-full items-center">
          <span class="absolute left-5 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-l from-transparent via-accent/35 to-accent/90" />
          <span class="relative mr-auto flex h-10 items-center justify-center gap-1">
            <span class="h-4 w-3 skew-x-[135deg] bg-gradient-to-b from-[#57d9fa] via-[#2bbaf0] to-[#0b68b3] shadow-[0_0_0.65rem_rgba(32,181,241,0.45)]" />
            <span class="h-4 w-3 skew-x-[135deg] bg-gradient-to-b from-[#42c9f5] via-[#20b5f1] to-[#0a5da9] shadow-[0_0_0.65rem_rgba(32,181,241,0.38)]" />
            <span class="h-4 w-3 skew-x-[135deg] bg-gradient-to-b from-[#3bbff0] via-[#149fe1] to-[#0a579d] shadow-[0_0_0.65rem_rgba(32,181,241,0.34)]" />
            <span class="h-4 w-3 skew-x-[135deg] bg-gradient-to-b from-[#35b7ed] via-[#128fd0] to-[#084b8e] shadow-[0_0_0.65rem_rgba(32,181,241,0.3)]" />
            <span class="h-4 w-3 skew-x-[135deg] bg-gradient-to-b from-[#2da9e3] via-[#0f82c1] to-[#073f7d] shadow-[0_0_0.65rem_rgba(32,181,241,0.28)]" />
            <span class="h-4 w-3 skew-x-[135deg] bg-gradient-to-b from-[#269bd8] via-[#0d73b3] to-[#06366c] shadow-[0_0_0.65rem_rgba(32,181,241,0.25)]" />
          </span>
        </span>
      </div>
    </div>
    <div class="absolute right-4 flex items-center gap-3 text-xs text-muted max-lg:static max-lg:ml-auto max-lg:flex-wrap max-lg:justify-end max-md:ml-0">
      <span class="inline-flex items-center gap-2">
        <i
          :class="{ 'animate-data-pulse': loading }"
          class="h-2 w-2 rounded-full bg-success shadow-[0_0_0.5rem_rgba(141,189,83,0.7)]"
        />
        数据更新时间：{{ updateTime }}
      </span>

      <div class="inline-flex shrink-0 items-center gap-1 p-0.5">
        <button
          type="button"
          :aria-label="fullscreen ? '退出全屏' : '全屏'"
          :aria-pressed="fullscreen"
          :title="fullscreen ? '退出全屏' : '全屏'"
          class="!m-0 !grid !h-6 !w-6 !place-items-center !rounded !border-0 !bg-transparent !p-0 !text-[#b7cfdd] transition-colors hover:!bg-field hover:!text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
          :class="{ '!bg-field !text-accent': fullscreen }"
          @click="$emit('fullscreen')"
        >
          <component
            :is="fullscreen ? Minimize : Maximize"
            :size="15"
            :stroke-width="1.8"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          aria-label="导出数据"
          title="导出数据"
          class="!m-0 !grid !h-6 !w-6 !place-items-center !rounded-md !border-0 !bg-transparent !p-0 !text-[#b7cfdd] transition-colors hover:!bg-field hover:!text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
          @click="$emit('export')"
        >
          <FileDown :size="15" :stroke-width="1.8" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>
</template>
