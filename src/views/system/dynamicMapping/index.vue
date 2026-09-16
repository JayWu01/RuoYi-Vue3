<template>
  <div style="display:flex;height:calc(100vh - 140px);gap:12px;">
    <!--左侧分组-->
    <div style="width:260px;border:1px solid var(--el-border-color);padding:10px;">
      <div style="margin-bottom:8px;">
        <el-button size="small" type="primary" @click="openGroupDialog">新增分组</el-button>
        <el-button size="small" @click="loadGroupList">刷新</el-button>
      </div>
      <el-tree
          :data="groupTree"
          node-key="id"
          :props="{label:'groupName'}"
          @node-click="onGroupClick"
          show-icon
      />
    </div>

    <!--右侧映射表格-->
    <div style="flex:1;border:1px solid var(--el-border-color);padding:10px;display:flex;flex-direction:column;">
      <div style="margin-bottom:8px;" v-if="selectedGroupId">
        <el-button size="small" type="primary" @click="openRuleDialog">新增规则</el-button>
        <el-button size="small" @click="loadRuleList">刷新</el-button>
      </div>
      <el-table :data="ruleList" border stripe v-if="selectedGroupId" v-loading="ruleLoading">
        <el-table-column prop="sourceText" label="来源文本（外部原始）" min-width="220"/>
        <el-table-column prop="targetDeptName" label="目标部门名称" min-width="200"/>
        <el-table-column label="操作" min-width="120">
          <template #default="scope">
            <el-link type="primary" @click="editRule(scope.row)">编辑</el-link>
            <el-link type="danger" @click="delRule(scope.row)">删除</el-link>
          </template>
        </el-table-column>
      </el-table>
      <!-- ✅新增分页组件 -->
      <el-pagination
          v-if="selectedGroupId"
          style="margin-top:10px;text-align:right;"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
      />

      <div v-else style="text-align:center;color:#888;padding-top:50px;">请选择左侧分组</div>
    </div>
  </div>

  <!--分组弹窗-->
  <el-dialog v-model="groupOpen" title="分组配置" width="400px">
    <el-form :model="groupForm">
      <el-form-item label="分组名称">
        <el-input v-model="groupForm.groupName"/>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="groupForm.remark"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="groupOpen=false">取消</el-button>
      <el-button type="primary" @click="submitGroup">确定</el-button>
    </template>
  </el-dialog>

  <!--映射规则弹窗-->
  <el-dialog v-model="ruleOpen" title="映射规则配置" width="400px">
    <el-form :model="ruleForm">
      <el-form-item label="来源文本">
        <el-input v-model="ruleForm.sourceText"/>
      </el-form-item>
      <el-form-item label="目标部门">
        <el-select v-model="ruleForm.targetDeptId" placeholder="请选择部门" @change="onDeptChange">
          <el-option
              v-for="item in deptOptions"
              :key="item.deptId"
              :label="item.deptName"
              :value="item.deptId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="ruleOpen=false">取消</el-button>
      <el-button type="primary" @click="submitRule">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import { ElMessage } from 'element-plus'
import { listMappingGroup, addMappingGroup, updateMappingGroup, delMappingGroup,
  listMappingRule, addMappingRule, updateMappingRule, delMappingRule } from '@/api/system/dynamicMapping'
import { listDept } from '@/api/system/dept'

// ==========左侧分组相关==========
const groupTree = ref([])
const selectedGroupId = ref(null)
const groupOpen = ref(false)
const groupForm = ref({})

// 加载分组列表
const loadGroupList = async () => {
  const res = await listMappingGroup()
  if(res.code === 200){
    groupTree.value = res.rows
  }
}

// 点击左侧分组
const onGroupClick = (data) => {
  selectedGroupId.value = data.id
  loadRuleList()
}

// 打开新增分组弹窗
const openGroupDialog = () => {
  groupForm.value = {}
  groupOpen.value = true
}

const onDeptChange = (deptId) => {
  const dept = deptOptions.value.find(item => item.deptId === deptId)
  if (dept) {
    ruleForm.value.targetDeptName = dept.deptName
  } else {
    ruleForm.value.targetDeptName = ''
  }
}


// 提交分组（新增/编辑）【修复 .value 问题】
const submitGroup = async () => {
  const form = groupForm.value
  if(!form.groupName){
    ElMessage.warning("分组名称不能为空")
    return
  }
  let res
  if(form.id){
    //编辑
    res = await updateMappingGroup(form)
  }else{
    //新增
    res = await addMappingGroup(form)
  }
  if(res.code === 200){
    ElMessage.success("保存成功")
    groupOpen.value = false
    loadGroupList()
  }else{
    ElMessage.error(res.msg || "保存失败")
  }
}

// ==========右侧映射规则==========
const ruleList = ref([])
const ruleLoading = ref(false)
const ruleOpen = ref(false)
const ruleForm = ref({})
const deptOptions = ref([])

// 加载部门下拉选项（ruoyi自带部门api：listDept）
const loadDeptOptions = async () => {
  const res = await listDept()
  if(res.code ===200){
    deptOptions.value = res.data
  }
}


//打开新增规则弹窗
const openRuleDialog = () => {
  ruleForm.value = {}
  // 新增：绑定当前选中分组ID
  ruleForm.value.groupId = selectedGroupId.value
  ruleOpen.value = true
}


//编辑规则
const editRule = (row) => {
  ruleForm.value = {...row}
  ruleOpen.value = true
}

//提交映射规则【修复 .value 问题】
const submitRule = async () => {
  const form = ruleForm.value
  if(!form.sourceText){
    ElMessage.warning("来源文本不能为空")
    return
  }
  if(!form.targetDeptId){
    ElMessage.warning("请选择目标部门")
    return
  }
  let res
  if(form.id){
    res = await updateMappingRule(form)
  }else{
    res = await addMappingRule(form)
  }
  if(res.code ===200){
    ElMessage.success("保存成功")
    ruleOpen.value = false
    loadRuleList()
  }else{
    ElMessage.error(res.msg || "保存失败")
  }
}

//删除规则
const delRule = async (row) => {
  await delMappingRule(row.id)
  ElMessage.success("删除成功")
  loadRuleList()
}

//页面初始化加载
onMounted(()=>{
  loadGroupList()
  loadDeptOptions()
})

// ==========分页变量==========
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  loadRuleList()
}
// 当前页改变
const handleCurrentChange = (val) => {
  pageNum.value = val
  loadRuleList()
}

//加载规则列表【修改，传入分页参数】
const loadRuleList = async () => {
  ruleLoading.value = true
  // 传 pageNum、pageSize、groupId
  const res = await listMappingRule({
    groupId: selectedGroupId.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  })
  if(res.code ===200){
    ruleList.value = res.rows
    total.value = res.total // 接收总条数
  }
  ruleLoading.value = false
}


</script>
