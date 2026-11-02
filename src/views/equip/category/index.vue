<script setup>
import { Pencil, Plus, RefreshCw, Trash } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  addCategory,
  delCategory,
  listCategory,
  updateCategory
} from '@/api/equip'

const loading = ref(false)
const list = ref([])
const open = ref(false)
const title = ref('')
const formRef = ref(null)

const query = reactive({ categoryName: '', status: '' })

const form = reactive({
  categoryId: null,
  parentId: 0,
  categoryName: '',
  orderNum: 1,
  status: '0',
  remark: ''
})

const rules = {
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

/** 父级分类候选项（只能作为二级分类的父级） */
const parentOptions = computed(() => list.value)

async function getList() {
  loading.value = true
  try {
    const res = await listCategory(query)
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.categoryId = null
  form.parentId = 0
  form.categoryName = ''
  form.orderNum = 1
  form.status = '0'
  form.remark = ''
}

function handleAdd(row) {
  resetForm()
  form.parentId = row?.categoryId || 0
  title.value = row ? `新增【${row.categoryName}】的下级分类` : '新增装备分类'
  open.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function handleUpdate(row) {
  resetForm()
  form.categoryId = row.categoryId
  form.parentId = row.parentId || 0
  form.categoryName = row.categoryName
  form.orderNum = row.orderNum
  form.status = row.status
  form.remark = row.remark
  title.value = '修改装备分类'
  open.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    const action = form.categoryId ? updateCategory : addCategory
    await action({ ...form })
    ElMessage.success(form.categoryId ? '修改成功' : '新增成功')
    open.value = false
    getList()
  })
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除分类【${row.categoryName}】？`, '提示', { type: 'warning' })
  await delCategory(row.categoryId)
  ElMessage.success('删除成功')
  getList()
}

onMounted(getList)
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>装备分类管理</h3>
        <div class="flex gap-2">
          <el-button v-hasPermi="['equip:category:add']" type="primary" :icon="Plus" @click="handleAdd()">
            新增分类
          </el-button>
          <el-button :icon="RefreshCw" @click="getList">
            刷新
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <el-form :inline="true" :model="query" class="mb-3">
          <el-form-item label="分类名称">
            <el-input v-model="query.categoryName" placeholder="请输入分类名称" clearable style="width: 180px" @keyup.enter="getList" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="启用" value="0" />
              <el-option label="停用" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList">
              查询
            </el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="list" row-key="categoryId" default-expand-all :tree-props="{ children: 'children' }">
          <el-table-column label="分类名称" prop="categoryName" min-width="220" />
          <el-table-column label="下属种类数" prop="itemCount" width="110" align="center" />
          <el-table-column label="排序" prop="orderNum" width="90" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <span class="equip-tag" :class="row.status === '0' ? 'equip-tag--success' : 'equip-tag--danger'">
                {{ row.status === '0' ? '启用' : '停用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
          <el-table-column label="操作" width="230" align="center">
            <template #default="{ row }">
              <el-button v-hasPermi="['equip:category:add']" link type="primary" :icon="Plus" @click="handleAdd(row)">
                子分类
              </el-button>
              <el-button v-hasPermi="['equip:category:edit']" link type="primary" :icon="Pencil" @click="handleUpdate(row)">
                修改
              </el-button>
              <el-button v-hasPermi="['equip:category:remove']" link type="danger" :icon="Trash" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <el-dialog v-model="open" :title="title" width="560px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上级分类">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            check-strictly
            node-key="categoryId"
            clearable
            placeholder="不选代表一级分类"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" maxlength="64" />
        </el-form-item>
        <el-form-item label="显示排序">
          <el-input-number v-model="form.orderNum" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="0">
              启用
            </el-radio>
            <el-radio value="1">
              停用
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="open = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitForm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
