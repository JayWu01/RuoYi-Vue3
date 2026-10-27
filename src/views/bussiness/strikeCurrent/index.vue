<script setup>
import { Download, Pencil, Plus, RefreshCw, Search, Trash2, Upload } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, getCurrentInstance, reactive, ref, watch } from 'vue'
import { addStrikeCurrent, delStrikeCurrent, getCurrentDept, getStrikeCurrent, listStrikeCurrent, updateStrikeCurrent } from '@/api/bussiness/strikeCurrent'
import { deptTreeSelect } from '@/api/system/user'
import ExcelImportDialog from '@/components/ExcelImportDialog/index.vue'
import { getIdCardError } from '@/utils/validate'

const { proxy } = getCurrentInstance()

const showSearch = ref(true)
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const multiple = ref(true)
const ids = ref([])

const queryFormRef = ref(null)
const formRef = ref(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  strikeDate: [],
  beginTime: null,
  endTime: null,
  unitName: null
})

const showColumns = reactive({
  index: true,
  strikeDate: true,
  crimeRed: true,
  crimeOrange: true,
  crimeYellow: true,
  crimeBlue: true,
  crimeBlack: true,
  totalPerson: true,
  unwarnedMinor: true,
  checkCarCount: true,
  openDoorCount: true,
  doorPullAmount: true,
  netFugitiveCount: true,
  correctMinorCount: true,
  unitName: true
})

const open = ref(false)
const title = ref('')

// ===== 单位（部门）相关 =====
const deptOptions = ref([])
const currentDept = ref({ deptId: null, deptName: '', admin: false })
const importRef = ref(null)

// 加载当前登录用户的数据归属部门；管理员额外加载树状部门表用于选择
const loadDeptContext = async () => {
  try {
    const res = await getCurrentDept()
    currentDept.value = res.data || { deptId: null, deptName: '', admin: false }
    if (currentDept.value.admin) {
      const tree = await deptTreeSelect()
      deptOptions.value = tree.data || []
    }
  } catch (e) {
    // 部门信息加载失败不阻断页面
  }
}

// 新增时的默认单位：普通用户固定本人部门并回显，管理员留空待选择
const applyDefaultUnit = () => {
  if (currentDept.value.admin) {
    form.unitDeptId = null
    form.unitName = ''
  } else {
    form.unitDeptId = currentDept.value.deptId
    form.unitName = currentDept.value.deptName
  }
}

// 管理员在树里选完部门后，同步显示部门名称
const handleUnitChange = (deptId) => {
  const find = (list) => {
    for (const node of list) {
      if (node.id === deptId) return node
      if (node.children && node.children.length) {
        const hit = find(node.children)
        if (hit) return hit
      }
    }
    return null
  }
  const hit = find(deptOptions.value)
  form.unitName = hit ? hit.label : ''
}

const defaultFormState = () => ({
  id: null,
  strikeDate: null,
  unitDeptId: null,
  unitName: '',
  crimeRed: 0,
  crimeOrange: 0,
  crimeYellow: 0,
  crimeBlue: 0,
  crimeBlack: 0,
  totalPerson: 0,
  unwarnedMinor: 0,
  checkCarCount: 0,
  openDoorCount: 0,
  doorPullAmount: 0,
  netFugitiveCount: 0,
  netFugitiveCase: '',

  arrestGroupCount: 0,
  gangList: [],
  arrestNormalCount: 0,
  normalSuspectList: [],
  arrestSuspectCount: 0,

  correctMinorCount: 0,
  correctMinorCase: '',
  remark: '',
  personList: [],
  doorCarList: []
})

const form = reactive(defaultFormState())

// ========== 新增计算属性：团伙嫌疑人总和 ==========
const totalGangSuspect = computed(() => {
  return form.gangList.reduce((sum, gang) => sum + Number(gang.gangSuspectNum || 0), 0)
})
// 监听自动计算抓获嫌疑人数
watch([totalGangSuspect, () => form.arrestNormalCount], () => {
  form.arrestSuspectCount = totalGangSuspect.value + Number(form.arrestNormalCount || 0)
})

// 根据团伙数量生成团伙数组，保留原有填写数据
const buildGangList = () => {
  const count = form.arrestGroupCount
  const oldList = [...form.gangList]
  form.gangList = []
  for (let i = 0; i < count; i++) {
    if (oldList[i]) {
      form.gangList.push({ ...oldList[i] })
    } else {
      form.gangList.push({
        gangSuspectNum: 0,
        idCardList: [],
        gangCase: ''
      })
    }
  }
}

// 单个团伙修改嫌疑人数，自动生成身份证+姓名列表
const buildGangIdCard = (gang) => {
  const num = gang.gangSuspectNum
  const oldCards = [...gang.idCardList]
  gang.idCardList = []
  for (let i = 0; i < num; i++) {
    gang.idCardList.push({
      name: oldCards[i]?.name ?? '',
      idCard: oldCards[i]?.idCard ?? '',
      idCardError: ''
    })
  }
}

// 普通现行人数变更，生成N套【姓名+身份证+案情】
const buildNormalSuspectList = () => {
  const num = form.arrestNormalCount
  const oldList = [...form.normalSuspectList]
  form.normalSuspectList = []
  for (let i = 0; i < num; i++) {
    form.normalSuspectList.push({
      name: oldList[i]?.name ?? '',
      idCard: oldList[i]?.idCard ?? '',
      idCardError: '',
      caseContent: oldList[i]?.caseContent ?? ''
    })
  }
}

// 单条身份证校验（团伙+普通现行共用）
const checkSingleIdCard = (person) => {
  // 不裁剪首尾空格，但保证一定是字符串
  person.idCard = typeof person.idCard === 'string' ? person.idCard : (person.idCard ?? '')
  person.idCardError = getIdCardError(person.idCard)
  return !person.idCardError
}

// 团伙业务校验：每个团伙嫌疑人数 >=3
const validateGangRule = () => {
  const a = form.arrestGroupCount
  if (a <= 0) return true
  for (const gang of form.gangList) {
    const n = Number(gang.gangSuspectNum || 0)
    if (n < 3) {
      ElMessage.error(`团伙【${form.gangList.indexOf(gang) + 1}】嫌疑人数不能少于3人，当前${n}人`)
      return false
    }
  }
  return true
}

// 表单校验规则
const rules = {
  arrestGroupCount: [
    { required: true, message: '请填写抓获团伙数', trigger: 'blur' }
  ],
  arrestNormalCount: [
    { required: true, message: '请填写普通现行嫌疑人数', trigger: 'blur' }
  ],
  strikeDate: [{ required: true, message: '打击日期不能为空', trigger: 'blur' }],
  unitDeptId: [
    { validator: (rule, value, callback) => {
      if (currentDept.value.admin && !value) callback(new Error('请选择所属单位'))
      else callback()
    }, trigger: 'change' }
  ],
  netFugitiveCase: [
    { validator: (rule, value, callback) => {
      if (form.netFugitiveCount > 0 && !value) callback(new Error('追网逃有数据时案情必填'))
      else callback()
    }, trigger: 'blur' }
  ],
  correctMinorCase: [
    { validator: (rule, value, callback) => {
      if (form.correctMinorCount > 0 && !value) callback(new Error('送矫未成年有数据时案情必填'))
      else callback()
    }, trigger: 'blur' }
  ]
}

const personDialogVisible = ref(false)
const personForm = reactive({ personList: [] })
const carDialogVisible = ref(false)
const carForm = reactive({ carList: [] })

// personType转中文
const getPersonTypeName = (type) => {
  const map = {
    crimeRed: '罪错‑红',
    crimeOrange: '罪错‑橙',
    crimeYellow: '罪错‑黄',
    crimeBlue: '罪错‑蓝',
    crimeBlack: '罪错‑黑',
    unwarnedMinor: '非预警未成年'
  }
  return map[type] || type
}

/**
 * 构建personList，自动计算totalPerson，保留已填身份证，每条携带personType
 */
const buildPersonList = () => {
  form.totalPerson = form.crimeRed + form.crimeOrange + form.crimeYellow + form.crimeBlue + form.crimeBlack + form.unwarnedMinor
  // 旧数据按personType分组保存已录入身份证
  const group = {}
  form.personList.forEach((item) => {
    if (!group[item.personType]) group[item.personType] = []
    group[item.personType].push(item.idCard)
  })
  const newList = []
  for (let i = 0; i < form.crimeRed; i++) {
    newList.push({ idCard: group.crimeRed?.[i] ?? '', personType: 'crimeRed', idCardError: '' })
  }
  for (let i = 0; i < form.crimeOrange; i++) {
    newList.push({ idCard: group.crimeOrange?.[i] ?? '', personType: 'crimeOrange', idCardError: '' })
  }
  for (let i = 0; i < form.crimeYellow; i++) {
    newList.push({ idCard: group.crimeYellow?.[i] ?? '', personType: 'crimeYellow', idCardError: '' })
  }
  for (let i = 0; i < form.crimeBlue; i++) {
    newList.push({ idCard: group.crimeBlue?.[i] ?? '', personType: 'crimeBlue', idCardError: '' })
  }
  for (let i = 0; i < form.crimeBlack; i++) {
    newList.push({ idCard: group.crimeBlack?.[i] ?? '', personType: 'crimeBlack', idCardError: '' })
  }
  for (let i = 0; i < form.unwarnedMinor; i++) {
    newList.push({ idCard: group.unwarnedMinor?.[i] ?? '', personType: 'unwarnedMinor', idCardError: '' })
  }
  form.personList = newList
}

// 敲打未成年人员身份证（子表）
const handleIdCardBlur = (row) => {
  row.idCard = typeof row.idCard === 'string' ? row.idCard : (row.idCard ?? '')
  row.idCardError = getIdCardError(row.idCard)
}

const handleIdCardInput = (row) => {
  row.idCardError = ''
}

const syncOpenDoorCarRow = () => {
  const need = form.openDoorCount
  const list = form.doorCarList
  if (list.length > need) {
    form.doorCarList = list.slice(0, need)
  } else {
    for (let i = list.length; i < need; i++) {
      form.doorCarList.push({ carNo: '' })
    }
  }
}

// 监听日期范围数组，自动拆成 beginTime / endTime
watch(() => queryParams.strikeDate, (newVal) => {
  if (newVal && newVal.length === 2) {
    queryParams.beginTime = newVal[0]
    queryParams.endTime = newVal[1]
  } else {
    queryParams.beginTime = null
    queryParams.endTime = null
  }
})

const getList = async () => {
  loading.value = true
  const reqParams = { ...queryParams }
  delete reqParams.strikeDate
  const res = await listStrikeCurrent(reqParams)
  tableData.value = res.rows
  total.value = res.total
  loading.value = false
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.strikeDate = []
  queryParams.beginTime = null
  queryParams.endTime = null
  handleQuery()
}

const handleSelectionChange = (val) => {
  ids.value = val.map(item => item.id)
  multiple.value = !val.length
}

const handleAdd = () => {
  resetForm()
  applyDefaultUnit()
  title.value = '新增警务站打击现行数据'
  open.value = true
}

const handleUpdate = async (row) => {
  resetForm()
  const res = await getStrikeCurrent(row.id)
  Object.assign(form, res.data)

  // 后端嵌套结构 转前端页面gangList模型
  const backendGangList = res.data.gangList || []
  form.gangList = backendGangList.map((gang) => {
    return {
      gangSuspectNum: gang.gangSuspectList?.length || 0,
      gangCase: gang.gangCaseContent,
      idCardList: gang.gangSuspectList?.map((sus) => {
        return {
          name: sus.suspectName,
          idCard: sus.idCard,
          idCardError: ''
        }
      }) || []
    }
  })

  // 后端普通嫌疑人转前端
  const backendNormalList = res.data.normalSuspectList || []
  form.normalSuspectList = backendNormalList.map((sus) => {
    return {
      name: sus.suspectName,
      idCard: sus.idCard,
      caseContent: sus.singleCaseContent,
      idCardError: ''
    }
  })

  form.arrestNormalCount = form.normalSuspectList.length
  form.arrestGroupCount = form.gangList.length

  if (form.personList) {
    form.personList = form.personList.map(p => ({ ...p, idCardError: '' }))
  }
  form.arrestSuspectCount = totalGangSuspect.value + Number(form.arrestNormalCount || 0)
  title.value = '修改警务站打击现行数据'
  open.value = true
}

const resetForm = () => {
  formRef.value?.clearValidate()
  Object.assign(form, defaultFormState())
  personForm.personList = []
  carForm.carList = []
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  if (!validateGangRule()) return

  let hasError = false
  // 校验敲打未成年身份证
  if (form.personList.length > 0) {
    form.personList.forEach((item) => {
      // 与失焦校验保持一致：不 trim，空白字符直接判错
      item.idCard = typeof item.idCard === 'string' ? item.idCard : (item.idCard ?? '')
      item.idCardError = getIdCardError(item.idCard)
      if (item.idCardError) hasError = true
    })
    if (hasError) {
      ElMessage.error('请检查敲打未成年身份证填写')
      return
    }
  }

  // 校验团伙子表：姓名、案情、身份证
  for (const gang of form.gangList) {
    if (!gang.gangCase?.trim()) {
      ElMessage.error(`团伙【${form.gangList.indexOf(gang) + 1}】案情经过不能为空`)
      return
    }
    for (const p of gang.idCardList) {
      // if(!p.name?.trim()){
      //   ElMessage.error(`团伙【${form.gangList.indexOf(gang)+1}】嫌疑人姓名不能为空`)
      //   hasError=true;
      // }
      checkSingleIdCard(p)
      if (p.idCardError) hasError = true
    }
  }
  if (hasError) {
    ElMessage.error('团伙嫌疑人身份证存在错误，请检查！')
    return
  }

  // 校验普通现行嫌疑人：姓名、身份证、个案案情
  for (const p of form.normalSuspectList) {
    // if(!p.name?.trim()){
    //   ElMessage.error("普通现行嫌疑人姓名不能为空");
    //   hasError = true
    // }
    checkSingleIdCard(p)
    if (p.idCardError || !p.caseContent?.trim()) {
      hasError = true
    }
  }
  if (hasError) {
    ElMessage.error('普通现行嫌疑人身份证/个案案情不能为空，请检查！')
    return
  }

  // 校验车牌
  if (form.openDoorCount > 0) {
    if (form.doorCarList.length !== form.openDoorCount) {
      ElMessage.error(`必须填写${form.openDoorCount}条拉开车门车牌信息`)
      return
    }
    const emptyDoorCar = form.doorCarList.some(item => !item.carNo?.trim())
    if (emptyDoorCar) {
      ElMessage.error('拉开车门车牌存在空值，请补全')
      return
    }
  }
  doSave()
}

// 人员弹窗身份证失焦校验
const handlePersonDialogIdCardBlur = (row) => {
  row.idCard = typeof row.idCard === 'string' ? row.idCard : (row.idCard ?? '')
  row.idCardError = getIdCardError(row.idCard)
}

const confirmPerson = () => {
  // 与其余身份证输入处保持一致的校验：非空、无空白字符、18/15位格式及校验码
  let firstError = ''
  personForm.personList.forEach((row) => {
    row.idCard = typeof row.idCard === 'string' ? row.idCard : (row.idCard ?? '')
    row.idCardError = getIdCardError(row.idCard)
    if (row.idCardError && !firstError) {
      firstError = row.idCardError
    }
  })
  if (firstError) {
    ElMessage.error(firstError)
    return
  }
  personDialogVisible.value = false
  if (form.openDoorCount > 0) {
    carForm.carList = []
    for (let i = 0; i < form.openDoorCount; i++) {
      carForm.carList.push({ carNo: '' })
    }
    carDialogVisible.value = true
    return
  }
  doSave()
}

const confirmCar = () => {
  if (carForm.carList.some(x => !x.carNo)) {
    ElMessage.error('车牌号不能为空！')
    return
  }
  carDialogVisible.value = false
  doSave()
}

const doSave = async () => {
  const params = { ...form }

  params.personList = form.personList.map(({ idCard, personType }) => ({ idCard, personType }))
  params.doorCarList = form.doorCarList

  // 团伙列表映射为后端嵌套实体
  params.gangList = form.gangList.map((gang, gIndex) => {
    return {
      gangIndex: gIndex + 1,
      gangCaseContent: gang.gangCase,
      gangSuspectList: gang.idCardList.map((cardItem) => {
        return {
          suspectName: cardItem.name,
          idCard: cardItem.idCard,
          singleCaseContent: gang.gangCase
        }
      })
    }
  })

  // 普通嫌疑人映射后端
  params.normalSuspectList = form.normalSuspectList.map((item) => {
    return {
      suspectName: item.name,
      idCard: item.idCard,
      singleCaseContent: item.caseContent
    }
  })

  if (form.id != null) {
    await updateStrikeCurrent(params)
    ElMessage.success('修改成功')
  } else {
    await addStrikeCurrent(params)
    ElMessage.success('新增成功')
  }
  open.value = false
  getList()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该条数据？').then(async () => {
    await delStrikeCurrent(row.id)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm('确认删除选中数据？').then(async () => {
    await delStrikeCurrent(ids.value)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const handleExport = () => {
  console.log('export', queryParams)
  proxy.download('police/strikeCurrent/export', { ...queryParams }, `打击现行台账_${Date.now()}.xlsx`)
}

const handleImport = () => {
  importRef.value?.open()
}

// 导入完成（成功/部分成功）后刷新列表；失败明细文件由导入组件自动下载
const handleImportSuccess = () => {
  getList()
}

getList()
loadDeptContext()
</script>

<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" size="small" :inline="true">
      <el-form-item label="打击日期" prop="strikeDate">
        <el-date-picker
          v-model="queryParams.strikeDate"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="所属单位" prop="unitName">
        <el-input
          v-model="queryParams.unitName"
          placeholder="请输入单位名称"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">
          搜索
        </el-button>
        <el-button :icon="RefreshCw" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-has-perm="'police:strikeCurrent:add'"
          type="primary"
          plain
          :icon="Plus"
          size="mini"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-has-perm="'police:strikeCurrent:import'"
          type="success"
          plain
          :icon="Upload"
          size="mini"
          @click="handleImport"
        >
          导入
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-has-perm="'police:strikeCurrent:export'"
          type="warning"
          plain
          :icon="Download"
          size="mini"
          @click="handleExport"
        >
          导出
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-has-perm="'police:strikeCurrent:remove'"
          type="danger"
          plain
          :icon="Trash2"
          size="mini"
          :disabled="multiple"
          @click="handleBatchDelete"
        >
          删除
        </el-button>
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @refresh-table="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-show="showColumns.index" type="index" label="序号" width="60" />
      <el-table-column v-show="showColumns.strikeDate" label="打击日期" prop="strikeDate" />
      <el-table-column v-show="showColumns.unitName" label="单位名称" prop="unitName" />
      <el-table-column v-show="showColumns.totalPerson" label="敲打总人数" prop="totalPerson" />
      <el-table-column v-show="showColumns.crimeRed" label="红色警情" prop="crimeRed" />
      <el-table-column v-show="showColumns.crimeOrange" label="橙色警情" prop="crimeOrange" />
      <el-table-column v-show="showColumns.crimeYellow" label="黄色警情" prop="crimeYellow" />
      <el-table-column v-show="showColumns.crimeBlue" label="蓝色警情" prop="crimeBlue" />
      <el-table-column v-show="showColumns.crimeBlack" label="黑色警情" prop="crimeBlack" />
      <el-table-column v-show="showColumns.unwarnedMinor" label="非预警未成年人数" prop="unwarnedMinor" />
      <el-table-column v-show="showColumns.arrestSuspectCount" label="抓获嫌疑人数" prop="arrestSuspectCount" />
      <el-table-column v-show="showColumns.arrestGroupCount" label="抓获团伙数" prop="arrestGroupCount" />
      <el-table-column v-show="showColumns.checkCarCount" label="检查车辆数" prop="checkCarCount" />
      <el-table-column v-show="showColumns.openDoorCount" label="未关车门数" prop="openDoorCount" />
      <el-table-column v-show="showColumns.doorPullAmount" label="检查车内贵重物品（元）" prop="doorPullAmount" />
      <el-table-column v-show="showColumns.netFugitiveCount" label="抓网逃数" prop="netFugitiveCount" />
      <el-table-column v-show="showColumns.correctMinorCount" label="送矫未成年数量" prop="correctMinorCount" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button
            v-has-perm="'police:strikeCurrent:edit'"
            size="mini"
            type="text"
            :icon="Pencil"
            @click="handleUpdate(row)"
          >
            修改
          </el-button>
          <el-button
            v-has-perm="'police:strikeCurrent:remove'"
            size="mini"
            type="text"
            :icon="Trash2"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @update:page="queryParams.pageNum = $event"
      @update:limit="queryParams.pageSize = $event"
      @pagination="getList"
    />

    <!-- 新增/编辑主弹窗 -->
    <el-dialog
      v-model="open"
      :title="title"
      width="950px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="打击日期" prop="strikeDate">
          <el-date-picker v-model="form.strikeDate" value-format="YYYY-MM-DD" type="date" placeholder="请选择打击日期" />
        </el-form-item>

        <!-- 所属单位：管理员可从树状部门表选择；警务站用户自动回显本部门且只读 -->
        <el-form-item label="所属单位" prop="unitDeptId">
          <el-tree-select
            v-if="currentDept.admin"
            v-model="form.unitDeptId"
            :data="deptOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="id"
            placeholder="请选择所属单位"
            clearable
            check-strictly
            class="w-[320px]"
            @change="handleUnitChange"
          />
          <div v-else class="flex items-center gap-2">
            <el-input :model-value="form.unitName" class="w-[320px]" disabled />
            <span class="text-xs text-[#909399]">部门ID：{{ form.unitDeptId ?? '-' }}（自动带出，不可修改）</span>
          </div>
        </el-form-item>

        <el-divider content-position="left">
          敲打未成年
        </el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="罪错‑红">
              <el-input-number v-model="form.crimeRed" :min="0" class="w-[140px]" @change="buildPersonList" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="罪错‑橙">
              <el-input-number v-model="form.crimeOrange" :min="0" class="w-[140px]" @change="buildPersonList" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="罪错‑黄">
              <el-input-number v-model="form.crimeYellow" :min="0" class="w-[140px]" @change="buildPersonList" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="罪错‑蓝">
              <el-input-number v-model="form.crimeBlue" :min="0" class="w-[140px]" @change="buildPersonList" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="罪错‑黑">
              <el-input-number v-model="form.crimeBlack" :min="0" class="w-[140px]" @change="buildPersonList" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="非预警未成年数">
              <el-input-number v-model="form.unwarnedMinor" :min="0" class="w-[140px]" @change="buildPersonList" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="敲打总人数">
              <el-input v-model="form.totalPerson" class="w-[140px]" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 敲打未成年身份证子表，带personType类型 -->
        <div v-if="form.personList.length > 0">
          <el-form-item label="人员身份证列表">
            <el-table :data="form.personList" border size="small">
              <el-table-column label="序号" type="index" width="60" />
              <!-- 人员类型列，上线可删除 -->
              <el-table-column label="人员类型" width="140">
                <template #default="{ row }">
                  <span>{{ getPersonTypeName(row.personType) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="身份证号">
                <template #default="{ row }">
                  <div class="flex items-center gap-2">
                    <el-input
                      v-model="row.idCard"
                      placeholder="必填身份证"
                      class="flex-1"
                      @input="handleIdCardInput(row)"
                      @blur="handleIdCardBlur(row)"
                    />
                    <span v-if="row.idCardError" class="text-xs text-[#f56c6c] whitespace-nowrap">
                      {{ row.idCardError }}
                    </span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div class="text-xs text-[#f56c6c] mt-1">
              需要填写 {{ form.personList.length }} 条身份证信息
            </div>
          </el-form-item>
        </div>

        <el-divider content-position="left">
          拉车门
        </el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="检查车辆数">
              <el-input-number v-model="form.checkCarCount" :min="0" class="w-[140px]" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拉开车门数">
              <el-input-number v-model="form.openDoorCount" :min="0" class="w-[140px]" @change="syncOpenDoorCarRow" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="检查车内贵重物品（元）">
              <el-input-number v-model="form.doorPullAmount" :min="0" class="w-[140px]" @change="syncOpenDoorCarRow" />
            </el-form-item>
          </el-col>
        </el-row>

        <div v-if="form.openDoorCount > 0">
          <el-form-item label="拉开车门号牌列表">
            <el-table :data="form.doorCarList" border size="small">
              <el-table-column label="序号" type="index" width="60" />
              <el-table-column label="车牌号">
                <template #default="{ row }">
                  <el-input v-model="row.carNo" placeholder="必填车牌" />
                </template>
              </el-table-column>
            </el-table>
            <div class="text-xs text-[#f56c6c] mt-1">
              需要填写 {{ form.openDoorCount }} 条拉开车门车牌信息
            </div>
          </el-form-item>
        </div>

        <el-divider content-position="left">
          追网逃
        </el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="抓网逃数">
              <el-input-number v-model="form.netFugitiveCount" :min="0" class="w-[140px]" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案情" prop="netFugitiveCase">
              <el-input v-model="form.netFugitiveCase" type="textarea" rows="2" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- ===================== 【改造抓获现行区块】 ===================== -->
        <el-divider content-position="left">
          抓获现行
        </el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="抓获团伙总数" prop="arrestGroupCount">
              <el-input-number
                v-model="form.arrestGroupCount"
                :min="0"
                class="w-[140px]"
                @change="buildGangList"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="普通现行嫌疑人数" prop="arrestNormalCount">
              <el-input-number
                v-model="form.arrestNormalCount"
                :min="0"
                class="w-[140px]"
                @change="buildNormalSuspectList"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 团伙列表 -->
        <div v-if="form.arrestGroupCount > 0" class="rounded-md border border-[#dcdcdc] p-3 mb-3">
          <div
            v-for="(gang, gIdx) in form.gangList"
            :key="gIdx"

            class="mb-4 border-b border-dashed border-[#eee] pb-3"
          >
            <div class="font-bold mb-2">
              团伙{{ gIdx + 1 }}
            </div>
            <el-row>
              <el-col :span="12">
                <el-form-item label="本团伙嫌疑人数">
                  <el-input-number
                    v-model="gang.gangSuspectNum"
                    :min="0"
                    class="w-[140px]"
                    @change="buildGangIdCard(gang)"
                  />
                  <span
                    v-if="gang.gangSuspectNum > 0 && gang.gangSuspectNum < 3"

                    class="text-xs text-[red] ml-2"
                  >单个团伙人数≥3</span>
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 当前团伙嫌疑人身份证列表 -->
            <div v-if="gang.gangSuspectNum > 0" class="pl-2.5 my-2">
              <div class="text-xs text-[#666] mb-1">
                团伙{{ gIdx + 1 }}嫌疑人身份证：
              </div>
              <div
                v-for="(person, pIdx) in gang.idCardList"
                :key="pIdx"

                class="flex items-center gap-2 mb-1.5"
              >
                <span class="w-[90px]">嫌疑人{{ pIdx + 1 }}：</span>
                <el-input
                  v-model="person.idCard"
                  placeholder="请输入身份证"
                  @blur="checkSingleIdCard(person)"
                />
                <span v-if="person.idCardError" class="text-xs text-[red]">{{ person.idCardError }}</span>
              </div>
            </div>
            <!-- 团伙案情：1团伙1条 -->
            <el-form-item :label="`团伙${gIdx + 1}案情经过`">
              <el-input
                v-model="gang.gangCase"
                type="textarea"
                rows="2"
                placeholder="填写本团伙案情"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 普通现行嫌疑人子区域 -->
        <div v-if="form.arrestNormalCount > 0" class="rounded-md border border-[#dcdcdc] p-3 mb-3">
          <div
            v-for="(item, idx) in form.normalSuspectList"
            :key="idx"

            class="mb-3 border-b border-dashed border-[#eee] pb-2"
          >
            <div class="font-bold">
              普通嫌疑人{{ idx + 1 }}
            </div>
            <el-form-item label="身份证号">
              <el-input
                v-model="item.idCard"
                placeholder="请输入身份证"
                @blur="checkSingleIdCard(item)"
              />
              <span v-if="item.idCardError" class="text-xs text-[red]">{{ item.idCardError }}</span>
            </el-form-item>
            <el-form-item label="个案案情">
              <el-input
                v-model="item.caseContent"
                type="textarea"
                rows="2"
                placeholder="填写该嫌疑人案情"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 抓获嫌疑人数【自动合计，只读】 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="抓获嫌疑人数（自动合计）" prop="arrestSuspectCount">
              <el-input v-model="form.arrestSuspectCount" disabled class="w-[140px]" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          送矫未成年
        </el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="人数">
              <el-input-number v-model="form.correctMinorCount" :min="0" class="w-[140px]" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案情" prop="correctMinorCase">
              <el-input v-model="form.correctMinorCase" type="textarea" rows="2" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">
            取 消
          </el-button>
          <el-button type="primary" @click="submitForm">
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 人员弹窗（保留，原有逻辑） -->
    <el-dialog v-model="personDialogVisible" title="录入人员身份信息" width="700px">
      <el-table :data="personForm.personList" border>
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="身份证号">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-input
                v-model="row.idCard"
                placeholder="身份证号必填"
                class="flex-1"
                @blur="handlePersonDialogIdCardBlur(row)"
              />
              <span v-if="row.idCardError" class="text-xs text-[#f56c6c] whitespace-nowrap">
                {{ row.idCardError }}
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div>
          <el-button @click="personDialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="confirmPerson">
            确认人员信息
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 车辆弹窗（保留） -->
    <el-dialog v-model="carDialogVisible" title="录入车辆号牌信息" width="700px">
      <el-table :data="carForm.carList" border>
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="车牌号">
          <template #default="{ row }">
            <el-input v-model="row.carNo" placeholder="车牌号必填" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div>
          <el-button @click="carDialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="confirmCar">
            确认车辆信息
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入弹窗（复用通用组件：支持下载模板、部分成功、失败明细自动下载） -->
    <ExcelImportDialog
      ref="importRef"
      title="警务站打击现行数据导入"
      action="/police/strikeCurrent/importData"
      template-action="/police/strikeCurrent/importTemplate"
      template-file-name="警务站打击现行数据模板"
      update-support-label="更新已经存在的数据（同单位同日期）"
      @success="handleImportSuccess"
    />
  </div>
</template>
