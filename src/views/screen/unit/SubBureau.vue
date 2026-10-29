<script setup>
import { Database } from '@lucide/vue'
import { onMounted } from 'vue'

const emit = defineEmits(['filterChange', 'loadingChange', 'statusChange'])

onMounted(() => {
  emit('loadingChange', false)
  emit('statusChange', 'pending')
  emit('filterChange', { open: false, summary: '数据接入中' })
})

const toggleFilter = () => {}
const reloadAll = () => {}

defineExpose({
  reloadAll,
  toggleFilter
})
</script>

<template>
  <main class="screen-main grid min-h-0 flex-1 place-items-center p-4">
    <section class="pending-state" aria-labelledby="sub-bureau-pending-title">
      <span class="pending-icon" aria-hidden="true">
        <Database :size="24" :stroke-width="1.7" />
      </span>
      <h2 id="sub-bureau-pending-title">
        分县局数据接入中
      </h2>
      <p>
        接口就绪后，这里会显示分县局的接处警、战果、趋势与派出所排名。
      </p>
      <p class="pending-note">
        当前不展示示例数据，避免被误读为真实警情。
      </p>
    </section>
  </main>
</template>
