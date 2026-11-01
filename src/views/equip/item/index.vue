<script setup>
import { Pencil, Plus, RefreshCw, Trash } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { addItem, delItem, listCategory, listItem, updateItem } from '@/api/equip'
import { loadEquipCtx } from '../context'

const baseApi = import.meta.env.VITE_APP_BASE_API
const loading = ref(false)
const list = ref([])
const total = ref(0)
const ids = ref([])
const categories = ref([])
const open = ref(false)
const title = ref('')
const formRef = ref(null)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  itemName: '',
  categoryId: null,
  status: ''
})

const form = reactive({
  itemId: null,
  categoryId: null,
  itemName: '',
  specModel: '',
  unit: '个',
  imageUrl: '',
  hasExpiry: '0',
  expiryMonths: 12,
  warnDays: 30,
  rotateMonths: 0,
  status: '0',
  remark: '',
  partList: []
})

const rules = {
  categoryId: [{ required: true, message: '请选择装备分类', trigger: 'change' }],
  itemName: [{ required: true, message: '请输入装备名称', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入计量单位', trigger: 'blur' }]
}

function imageSrc(url) {
  if (!url) {
    return ''
  }
  return url.startsWith('http') ? url : `${baseApi}${url}`
}

/** 分类扁平化（用于下拉） */
const categoryOptions = computed(() => {
  const result = []
  const walk = (nodes, prefix = '') => {
    for (const node of nodes || []) {
      result.push({ value: node.categoryId, label: `${prefix}${node.categoryName}` })
      walk(node.children, `${prefix}${node.categoryName} / `)
    }
  }
  walk(categories.value)
  return result
})

async function getList() {
  loading.value = true
  try {
    const res = await listItem(query)
    list.value = res.rows || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  const res = await listCategory({})
  categories.value = res.data || []
}

function handleSelectionChange(rows) {
  ids.value = rows.map(r => r.itemId)
}

function resetForm() {
  Object.assign(form, {
    itemId: null,
    categoryId: null,
    itemName: '',
    specModel: '',
    unit: '个',
    imageUrl: '',
    hasExpiry: '0',
    expiryMonths: 12,
    warnDays: 30,
    rotateMonths: 0,
    status: '0',
    remark: '',
    partList: []
  })
}

function handleAdd() {
  resetForm()
  title.value = '新增装备档案'
  open.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function handleUpdate(row) {
  resetForm()
  Object.assign(form, {
    ...row,
    partList: (row.partList || []).map(p => ({ partName: p.partName, unit: p.unit }))
  })
  title.value = '修改装备档案'
  open.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function addPart() {
  form.partList.push({ partName: '', unit: '个' })
}

function removePart(index) {
  form.partList.splice(index, 1)
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    if (form.hasExpiry === '1' && (!form.expiryMonths || form.expiryMonths <= 0)) {
      ElMessage.warning('存在有效期的装备必须填写有效期时长')
      return
    }
    const payload = { ...form, partList: form.partList.filter(p => p.partName) }
    if (form.itemId) {
      await updateItem(payload)
      ElMessage.success('修改成功')
    } else {
      await addItem(payload)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
    loadEquipCtx(true)
  })
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除装备【${row.itemName}】？`, '提示', { type: 'warning' })
  await delItem([row.itemId])
  ElMessage.success('删除成功')
  getList()
}

async function handleBatchDelete() {
  if (!ids.value.length) {
    return
  }
  await ElMessageBox.confirm('确定删除选中的装备档案？', '提示', { type: 'warning' })
  await delItem(ids.value)
  ElMessage.success('删除成功')
  getList()
}

onMounted(() => {
  loadCategories()
  getList()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <section class="equip-panel">
      <div class="equip-panel__head">
        <h3>装备档案</h3>
        <div class="flex gap-2">
          <el-button v-hasPermi="['equip:item:add']" type="primary" :icon="Plus" @click="handleAdd">
            新增装备
          </el-button>
          <el-button v-hasPermi="['equip:item:remove']" type="danger" :icon="Trash" :disabled="!ids.length" @click="handleBatchDelete">
            批量删除
          </el-button>
          <el-button :icon="RefreshCw" @click="getList">
            刷新
          </el-button>
        </div>
      </div>
      <div class="equip-panel__body">
        <el-form :inline="true" :model="query" class="mb-3">
          <el-form-item label="装备名称">
            <el-input v-model="query.itemName" placeholder="请输入装备名称" clearable style="width: 180px" @keyup.enter="getList" />
          </el-form-item>
          <el-form-item label="装备分类">
            <el-select v-model="query.categoryId" placeholder="全部" clearable style="width: 180px">
              <el-option v-for="opt in categoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部" clearable style="width: 110px">
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

        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column label="图片" width="80" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.imageUrl"
                :src="imageSrc(row.imageUrl)"
                :preview-src-list="[imageSrc(row.imageUrl)]"
                preview-teleported
                fit="cover"
                style="width: 42px; height: 42px; border-radius: 4px"
              />
              <span v-else class="text-[#55708a]">-</span>
            </template>
          </el-table-column>
          <el-table-column label="装备名称" prop="itemName" min-width="140" show-overflow-tooltip />
          <el-table-column label="装备分类" prop="categoryName" min-width="110" show-overflow-tooltip />
          <el-table-column label="规格型号" prop="specModel" min-width="100" show-overflow-tooltip />
          <el-table-column label="单位" prop="unit" width="70" align="center" />
          <el-table-column label="有效期" width="120" align="center">
            <template #default="{ row }">
              <span v-if="row.hasExpiry === '1'" class="equip-tag equip-tag--warn">{{ row.expiryMonths }} 个月</span>
              <span v-else class="equip-tag equip-tag--info">无</span>
            </template>
          </el-table-column>
          <el-table-column label="提前预警" width="100" align="center">
            <template #default="{ row }">
              {{ row.hasExpiry === '1' ? `${row.warnDays} 天` : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="轮换周期" width="100" align="center">
            <template #default="{ row }">
              {{ row.rotateMonths > 0 ? `${row.rotateMonths} 个月` : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="配件" width="80" align="center">
            <template #default="{ row }">
              {{ row.partList?.length || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <span class="equip-tag" :class="row.status === '0' ? 'equip-tag--success' : 'equip-tag--danger'">
                {{ row.status === '0' ? '启用' : '停用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button v-hasPermi="['equip:item:edit']" link type="primary" :icon="Pencil" @click="handleUpdate(row)">
                修改
              </el-button>
              <el-button v-hasPermi="['equip:item:remove']" link type="danger" :icon="Trash" @click="handleDelete(row)">
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

    <el-dialog v-model="open" :title="title" width="820px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="装备分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类" filterable style="width: 100%">
                <el-option v-for="opt in categoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="装备名称" prop="itemName">
              <el-input v-model="form.itemName" placeholder="请输入装备名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="form.specModel" placeholder="选填" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量单位" prop="unit">
              <el-input v-model="form.unit" placeholder="个/套/件" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否有有效期">
              <el-radio-group v-model="form.hasExpiry">
                <el-radio value="0">
                  否
                </el-radio>
                <el-radio value="1">
                  是
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.hasExpiry === '1'" :span="8">
            <el-form-item label="有效期(月)">
              <el-input-number v-model="form.expiryMonths" :min="1" :max="240" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.hasExpiry === '1'" :span="8">
            <el-form-item label="提前预警(天)">
              <el-input-number v-model="form.warnDays" :min="0" :max="365" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="轮换周期(月)">
              <el-input-number v-model="form.rotateMonths" :min="0" :max="240" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
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
          </el-col>
          <el-col :span="24">
            <el-form-item label="装备图片">
              <image-upload v-model="form.imageUrl" :limit="1" :file-size="5" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="300" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          附属配件
        </el-divider>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-[12px] text-[#93a9bd]">配件数量在领用/借用时会单独登记与核对</span>
          <el-button size="small" :icon="Plus" @click="addPart">
            添加配件
          </el-button>
        </div>
        <el-table :data="form.partList" size="small" empty-text="暂无配件">
          <el-table-column label="配件名称" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.partName" placeholder="例如：充电器" maxlength="64" />
            </template>
          </el-table-column>
          <el-table-column label="单位" width="140">
            <template #default="{ row }">
              <el-input v-model="row.unit" maxlength="20" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" :icon="Trash" @click="removePart($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
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
