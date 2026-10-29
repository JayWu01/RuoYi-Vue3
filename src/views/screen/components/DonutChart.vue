<script setup>
import { Cell, Pie, PieChart, Sector } from 'vccs'
import { computed } from 'vue'
import { useScreenPalette } from '../composables/useScreenPalette'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  /** 画布边长（px） */
  size: {
    type: Number,
    default: 158
  },
  /** 受外部（图例）控制的高亮分段，兼容内部 hover */
  activeIndex: {
    type: Number,
    default: null
  },
  ariaLabel: {
    type: String,
    default: '环形图'
  }
})

const emit = defineEmits(['hover'])

const palette = useScreenPalette()

const items = computed(() => props.data.map((item, index) => ({
  name: String(item?.name ?? ''),
  value: Number(item?.value) || 0,
  color: item?.color || palette.value.series[index % palette.value.series.length]
})))

const total = computed(() => items.value.reduce((sum, item) => sum + item.value, 0))

const activeSegment = computed(() => (
  items.value.find((_, index) => index === props.activeIndex) ?? null
))
</script>

<template>
  <div
    class="donut-wrap"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="ariaLabel"
  >
    <div class="donut-canvas">
      <PieChart
        v-if="items.length"
        :data="items"
        :margin="{ top: 0, right: 0, bottom: 0, left: 0 }"
        :title="ariaLabel"
      >
        <Pie
          data-key="value"
          name-key="name"
          :active-index="activeIndex ?? undefined"
          inner-radius="70%"
          outer-radius="88%"
          :padding-angle="2"
          :corner-radius="7"
          :min-angle="2"
          stroke="none"
          @mouseenter="(_, index) => emit('hover', index)"
          @mouseleave="emit('hover', null)"
        >
          <template #activeShape="shape">
            <Sector
              :cx="shape.cx"
              :cy="shape.cy"
              :inner-radius="shape.innerRadius"
              :outer-radius="shape.outerRadius + 3"
              :start-angle="shape.startAngle"
              :end-angle="shape.endAngle"
              :corner-radius="shape.cornerRadius"
              :fill="shape.fill"
              stroke="none"
            />
          </template>
          <Cell v-for="item in items" :key="item.name" :fill="item.color" />
        </Pie>
      </PieChart>
    </div>

    <div class="donut-center">
      <slot :total="total" :active="activeSegment">
        <span class="donut-total">{{ total }}</span>
        <span class="donut-label">总人数</span>
      </slot>
    </div>
  </div>
</template>
