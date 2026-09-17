<template>
  <div class="app-container">
    <!-- ========== 顶部工具栏 ========== -->
    <div class="top-toolbar">
      <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['screen:personInfo:add']">新增</el-button>
      <el-button type="danger" icon="Delete" @click="handleBatchDelete" v-hasPermi="['screen:personInfo:remove']" :disabled="ids.length === 0">批量删除</el-button>
    </div>

    <!-- 搜索区 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="警单编号" prop="alarmId">
        <el-input v-model="queryParams.alarmId" placeholder="请输入警单编号"/>
      </el-form-item>
      <el-form-item label="人员姓名" prop="personName">
        <el-input v-model="queryParams.personName" placeholder="请输入姓名"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="personInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="警单编号" prop="alarmId" />
      <el-table-column label="人员姓名" prop="personName" />
      <el-table-column label="身份证号" prop="cardNo" />
      <el-table-column label="联系电话" prop="phoneNo" />
      <el-table-column label="性别" prop="gender" />
      <el-table-column label="出生日期" prop="birthDate" />
      <el-table-column label="民族" prop="nation" />
      <el-table-column label="接警时间" prop="alarmTime" />
      <!-- ========== 操作列 ========== -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['screen:personInfo:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['screen:personInfo:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="personInfoRef" :model="personInfo" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="警单编号" prop="alarmId">
              <el-input v-model="personInfo.alarmId" placeholder="请输入警单编号"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人员姓名" prop="personName">
              <el-input v-model="personInfo.personName" placeholder="请输入姓名"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="cardNo">
              <el-input v-model="personInfo.cardNo" placeholder="请输入身份证"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phoneNo">
              <el-input v-model="personInfo.phoneNo" placeholder="请输入电话"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="personInfo.gender" placeholder="请选择">
                <el-option label="男" value="男"/>
                <el-option label="女" value="女"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthDate">
              <el-input v-model="personInfo.birthDate" placeholder="例：1990-01-01"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="民族" prop="nation">
              <el-input v-model="personInfo.nation" placeholder="请输入民族"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接警时间" prop="alarmTime">
              <el-date-picker v-model="personInfo.alarmTime" type="datetime" placeholder="选择接警时间"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="户籍地址" prop="householdAddr">
          <el-input v-model="personInfo.householdAddr" placeholder="户籍地址"/>
        </el-form-item>
        <el-form-item label="现居住地址" prop="currentAddr">
          <el-input v-model="personInfo.currentAddr" placeholder="现居住地址"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ========== 重复人员预警弹窗【新增】 ========== -->
    <el-dialog title="⚠️ 发现重复人员信息" v-model="duplicateOpen" width="800px">
      <el-table :data="duplicateList" border>
        <el-table-column label="警单编号" prop="alarmId"/>
        <el-table-column label="姓名" prop="personName"/>
        <el-table-column label="身份证" prop="cardNo"/>
        <el-table-column label="手机号" prop="phoneNo"/>
        <el-table-column label="性别" prop="gender"/>
        <el-table-column label="接警时间" prop="alarmTime"/>
        <el-table-column label="户籍地址" prop="householdAddr"/>
      </el-table>
      <template #footer>
        <el-button type="primary" @click="duplicateOpen=false">确认查看完毕</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
// 导入api，增加 getDuplicateList
import { listPersonInfo, getPersonInfo, addPersonInfo, updatePersonInfo, delPersonInfo, getDuplicateList } from "@/api/bussiness/personInfo"
import { ElMessage, ElMessageBox } from 'element-plus'

const { proxy } = getCurrentInstance()
const personInfoRef = ref(null)
const queryRef = ref(null)
const loading = ref(false)
const open = ref(false)
const title = ref("")
const personInfoList = ref([])
const ids = ref([])
const total = ref(0)

// 重复预警弹窗变量
const duplicateOpen = ref(false)
const duplicateList = ref([])

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  alarmId: null,
  personName: null
})

const personInfo = ref({
  id: null,
  alarmId: "",
  personName: "",
  cardNo: "",
  phoneNo: "",
  gender: "",
  birthDate: "",
  householdAddr: "",
  currentAddr: "",
  nation: "",
  alarmTime: null
})

/** 查询列表 */
function getList() {
  loading.value = true
  listPersonInfo(queryParams.value).then(res => {
    personInfoList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

/** 重置搜索 */
function resetQuery() {
  queryRef.value.resetFields()
  getList()
}

/** 多选 */
function handleSelectionChange(rows) {
  ids.value = rows.map(item => item.id)
}

/** 新增 */
function handleAdd() {
  reset()
  title.value = "新增警单人员信息"
  open.value = true
}

/** 修改 */
function handleUpdate(row) {
  reset()
  title.value = "修改警单人员信息"
  personInfo.value = { ...row }
  open.value = true
}

/** 提交表单（核心改造） */
function submitForm() {
  personInfoRef.value.validate(valid => {
    if (!valid) return
    if (personInfo.value.id != null) {
      // 修改
      updatePersonInfo(personInfo.value).then(res => {
        ElMessage.success("修改成功")
        open.value = false
        getList()
        // 查询重复列表，传入当前id，排除自身
        checkDuplicate(personInfo.value.id, personInfo.value)
      })
    } else {
      // 新增
      addPersonInfo(personInfo.value).then(res => {
        ElMessage.success("新增成功")
        open.value = false
        getList()
        // 新增无id，传null
        checkDuplicate(null, personInfo.value)
      })
    }
  })
}

/**
 * 校验重复并打开弹窗
 */
function checkDuplicate(id, entity) {
  getDuplicateList({
    id: id,
    personName: entity.personName,
    cardNo: entity.cardNo,
    phoneNo: entity.phoneNo
  }).then(res => {
    // 返回的重复人员数组
    const list = res.data
    if(list && list.length > 0) {
      duplicateList.value = list
      duplicateOpen.value = true
    }
  })
}

/** 单条删除 */
function handleDelete(row) {
  ElMessageBox.confirm("确定要删除该条记录?", "警告", { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }).then(() => {
    return delPersonInfo([row.id])
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  })
}

/** 批量删除 */
function handleBatchDelete() {
  ElMessageBox.confirm("确定要删除选中数据？", "警告", { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }).then(() => {
    return delPersonInfo(ids.value)
  }).then(() => {
    getList()
    ElMessage.success("批量删除成功")
  })
}

/** 重置表单 */
function reset() {
  personInfo.value = {
    id: null,
    alarmId: "",
    personName: "",
    cardNo: "",
    phoneNo: "",
    gender: "",
    birthDate: "",
    householdAddr: "",
    currentAddr: "",
    nation: "",
    alarmTime: null
  }
}

getList()
</script>

<style scoped>
.top-toolbar {
  margin-bottom: 10px;
}
</style>
