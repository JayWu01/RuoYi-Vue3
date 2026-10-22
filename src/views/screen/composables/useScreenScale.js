import { inject, ref } from 'vue'

export const screenScaleKey = Symbol('screen-scale')

const fallbackScale = ref(1)

// 读取大屏画布的缩放比例，不在适配层内时固定为 1
export function useScreenScale() {
  return inject(screenScaleKey, fallbackScale)
}
