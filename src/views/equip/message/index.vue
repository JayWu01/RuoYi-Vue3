<script setup>
import { RefreshCw, Trash } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { delMessage, listMessage, readAllMessage, readMessage } from '@/api/equip'
import { MSG_TYPE } from '../constants'
import { loadEquipCtx, setUnread } from '../context'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const ids = ref([])

const query = reactive({ pageNum: 1, pageSize: 10, msgType: '', isRead: '' })

async function getList() {
  loading.value = true
  try {
    const res = await listMessage(query)
    list.value = res.rows || []
    total.value = res.total || 0
    await loadEquipCtx(true)
  } finally {
    loading.value = false
  }
}

function handleSelectionChange(rows) {
  ids.value = rows.map(r => r.msgId)
}

async function handleRead(row) {
  if (row.isRead === '1') {
    return
  }
  await readMessage(row.msgId)
  row.isRead = '1'
  await loadEquipCtx(true)
}

async function handleReadAll() {
  await readAllMessage()
  ElMessage.success('已全部标记为已读')
  setUnread(0)
  getList()
}

async function handleDelete(rows) {
  const msgIds = rows ? [rows.msgId] : ids.value
  if (!msgIds.length) {
    return
  }
  await ElMessageBox.confirm('确定删除选中的消息？', '提示', { type: 'warning' })
  await delMessage(msgIds)
  ElMessage.success('删除成功')
  getList()
}

onMounted(getList)
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>消息中心</h3>
        <div class="flex gap-2">
          <el-button @click="handleReadAll">
            全部已读
          </el-button>
          <el-button type="danger" :icon="Trash" :disabled="!ids.length" @click="handleDelete()">
            批量删除
          </el-button>
          <el-button :icon="RefreshCw" @click="getList">
            刷新
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <el-form :inline="true" :model="query" class="mb-3">
          <el-form-item label="消息类型">
            <el-select v-model="query.msgType" placeholder="全部" clearable style="width: 170px">
              <el-option v-for="(label, key) in MSG_TYPE" :key="key" :label="label" :value="key" />
            </el-select>
          </el-form-item>
          <el-form-item label="阅读状态">
            <el-select v-model="query.isRead" placeholder="全部" clearable style="width: 130px">
              <el-option label="未读" value="0" />
              <el-option label="已读" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList">
              查询
            </el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <span class="equip-tag" :class="row.isRead === '0' ? 'equip-tag--warn' : 'equip-tag--info'">
                {{ row.isRead === '0' ? '未读' : '已读' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="130" align="center">
            <template #default="{ row }">
              {{ MSG_TYPE[row.msgType] || row.msgType }}
            </template>
          </el-table-column>
          <el-table-column label="标题" prop="title" min-width="170" show-overflow-tooltip />
          <el-table-column label="内容" prop="content" min-width="320" show-overflow-tooltip />
          <el-table-column label="关联单号" prop="bizNo" min-width="150" show-overflow-tooltip />
          <el-table-column label="时间" prop="createTime" width="160" align="center" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.isRead === '0'" link type="primary" @click="handleRead(row)">
                标记已读
              </el-button>
              <el-button link type="danger" :icon="Trash" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          v-model:page="query.pageNum"
          v-model:limit="query.pageSize"
          :total="total"
          @pagination="getList"
        />
      </div>
    </section>
  </div>
</template>
