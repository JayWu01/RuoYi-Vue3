import { usePreferredReducedMotion } from '@vueuse/core'
import { computed } from 'vue'

/**
 * 大屏动效令牌 —— 与 tokens.css 的 --scr-dur-* / --scr-ease-* 对应。
 * motion-v 只负责编排（面板入场、排名错峰、浮层），
 * 数字滚动与加载进度仍用 CSS 过渡，避免每帧重建组件。
 */
export const MOTION = {
  duration: {
    fast: 0.15,
    base: 0.22,
    slow: 0.38,
    reveal: 0.52
  },
  ease: [0.22, 1, 0.36, 1],
  stagger: 0.055,
  rowStagger: 0.035,
  distance: 10,
  rowDistance: 6
}

export function useScreenMotion() {
  const preferred = usePreferredReducedMotion()
  const reduced = computed(() => preferred.value === 'reduce')

  const panelInitial = computed(() => (reduced.value
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: MOTION.distance }))

  const rowInitial = computed(() => (reduced.value
    ? { opacity: 1, x: 0 }
    : { opacity: 0, x: -MOTION.rowDistance }))

  const revealTransition = index => (reduced.value
    ? { duration: 0 }
    : {
        duration: MOTION.duration.reveal,
        delay: index * MOTION.stagger,
        ease: MOTION.ease
      })

  const rowTransition = index => (reduced.value
    ? { duration: 0 }
    : {
        duration: MOTION.duration.base,
        delay: index * MOTION.rowStagger,
        ease: MOTION.ease
      })

  const modalTransition = computed(() => (reduced.value
    ? { duration: 0 }
    : { duration: MOTION.duration.base, ease: MOTION.ease }))

  const fadeTransition = computed(() => (reduced.value
    ? { duration: 0 }
    : { duration: MOTION.duration.base }))

  return {
    reduced,
    panelInitial,
    rowInitial,
    revealTransition,
    rowTransition,
    modalTransition,
    fadeTransition
  }
}
