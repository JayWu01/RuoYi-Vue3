<script setup name="User">
import { CircleCheck, Download, KeyRound, Pencil, Plus, RefreshCw, Search, Trash2, Upload } from '@lucide/vue'
import {
  addUser,
  changeUserStatus,
  delUser,
  deptTreeSelect,
  getUser,
  listUser,
  resetUserPwd,
  updateUser
} from '@/api/system/user'
import ExcelImportDialog from '@/components/ExcelImportDialog'
import TreePanel from '@/components/TreePanel'
import { usePasswordRule } from '@/utils/passwordRule'
import UserViewDrawer from './view'

const router = useRouter()
const { proxy } = getCurrentInstance()
const { pwdValidator, pwdPromptValidator } = usePasswordRule()
const { sys_normal_disable, sys_user_sex } = useDict('sys_normal_disable', 'sys_user_sex')

const userList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const deptOptions = ref(undefined)
const enabledDeptOptions = ref(undefined)
const initPassword = ref(undefined)
const postOptions = ref([])
const roleOptions = ref([])
// 列显隐信息
const columns = ref({
  userId: { label: '用户编号', visible: true },
  userName: { label: '用户名称', visible: true },
  nickName: { label: '用户昵称', visible: true },
  deptName: { label: '部门', visible: true },
  phonenumber: { label: '手机号码', visible: true },
  status: { label: '状态', visible: true },
  createTime: { label: '创建时间', visible: true }
})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  },
  rules: {
    userName: [
      { required: true, message: '用户名称不能为空', trigger: 'blur' },
      {
        min: 2,
        max: 20,
        message: '用户名称长度必须介于 2 和 20 之间',
        trigger: 'blur'
      }
    ],
    nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
    email: [
      {
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: ['blur', 'change']
      }
    ],
    phonenumber: [
      {
        pattern: /^1[3-9|]\d{9}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询用户列表 */
function getList() {
  loading.value = true
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    userList.value = res.rows
    total.value = res.total
  })
}

/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then((response) => {
    deptOptions.value = response.data
    enabledDeptOptions.value = filterDisabledDept(JSON.parse(JSON.stringify(response.data)))
  })
}

/** 过滤禁用的部门 */
function filterDisabledDept(deptList) {
  return deptList.filter((dept) => {
    if (dept.disabled) {
      return false
    }
    if (dept.children && dept.children.length) {
      dept.children = filterDisabledDept(dept.children)
    }
    return true
  })
}

/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id
  handleQuery()
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  queryParams.value.deptId = undefined
  proxy.$refs.deptTreeRef.setCurrentKey(null)
  handleQuery()
}

/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value
  proxy.$modal
    .confirm(`是否确认删除用户编号为"${userIds}"的数据项？`)
    .then(() => {
      return delUser(userIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'system/user/export',
    {
      ...queryParams.value
    },
    `user_${Date.now()}.xlsx`
  )
}

/** 用户状态修改  */
function handleStatusChange(row) {
  const text = row.status === '0' ? '启用' : '停用'
  proxy.$modal
    .confirm(`确认要"${text}""${row.userName}"用户吗?`)
    .then(() => {
      return changeUserStatus(row.userId, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(`${text}成功`)
    })
    .catch(() => {
      row.status = row.status === '0' ? '1' : '0'
    })
}

/** 更多操作 */
function handleCommand(command, row) {
  switch (command) {
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleAuthRole':
      handleAuthRole(row)
      break
    default:
      break
  }
}

/** 跳转角色分配 */
function handleAuthRole(row) {
  const userId = row.userId
  router.push(`/system/user-auth/role/${userId}`)
}

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy
    .$prompt(`请输入「${row.userName}」的新密码`, '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      inputValidator: pwdPromptValidator
    })
    .then(({ value }) => {
      resetUserPwd(row.userId, value).then(() => {
        proxy.$modal.msgSuccess(`修改成功，新密码是：${value}`)
      })
    })
    .catch(() => {})
}

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 详情按钮操作 */
function handleViewData(row) {
  proxy.$refs.userViewRef.open(row.userId)
}

/** 导入按钮操作 */
function handleImport() {
  proxy.$refs.importUserRef.open()
}

/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: '0',
    remark: undefined,
    postIds: [],
    roleIds: []
  }
  proxy.resetForm('userRef')
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  getUser().then((response) => {
    postOptions.value = response.posts
    roleOptions.value = response.roles
    open.value = true
    title.value = '添加用户'
    form.value.password = initPassword.value
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const userId = row.userId || ids.value
  getUser(userId).then((response) => {
    form.value = response.data
    postOptions.value = response.posts
    roleOptions.value = response.roles
    form.value.postIds = response.postIds
    form.value.roleIds = response.roleIds
    open.value = true
    title.value = '修改用户'
    form.value.password = ''
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs.userRef.validate((valid) => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addUser(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

onMounted(() => {
  getDeptTree()
  getList()
  proxy.getConfigKey('sys.user.initPassword').then((response) => {
    initPassword.value = response.msg
  })
})
</script>

<template>
  <div class="app-container tree-sidebar-manage-wrap">
    <TreePanel
      ref="deptTreeRef"
      title="组织机构"
      :tree-data="deptOptions"
      search-placeholder="请输入部门名称"
      storage-key="dept-sidebar-width"
      :default-expand-all="true"
      @node-click="handleNodeClick"
      @refresh="getDeptTree"
    />
    <div class="tree-sidebar-content">
      <div class="content-inner">
        <el-form
          v-show="showSearch"
          ref="queryRef"
          :model="queryParams"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="用户名称" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户名称"
              clearable
              class="w-[240px]"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="queryParams.phonenumber"
              placeholder="请输入手机号码"
              clearable
              class="w-[240px]"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="用户状态"
              clearable
              class="w-[240px]"
            >
              <el-option
                v-for="dict in sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" class="w-[308px]">
            <el-date-picker
              v-model="dateRange"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
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
              v-hasPermi="['system:user:add']"
              type="primary"
              plain
              :icon="Plus"
              @click="handleAdd"
            >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:edit']"
              type="success"
              plain
              :icon="Pencil"
              :disabled="single"
              @click="handleUpdate"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:remove']"
              type="danger"
              plain
              :icon="Trash2"
              :disabled="multiple"
              @click="handleDelete"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:import']"
              type="info"
              plain
              :icon="Upload"
              @click="handleImport"
            >
              导入
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:user:export']"
              type="warning"
              plain
              :icon="Download"
              @click="handleExport"
            >
              导出
            </el-button>
          </el-col>
          <right-toolbar
            v-model:show-search="showSearch"
            :columns="columns"
            storage-key="xxxxxxxx"
            @query-table="getList"
          />
        </el-row>

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column
            v-if="columns.userId.visible"
            key="userId"
            label="用户编号"
            align="center"
            prop="userId"
          />
          <el-table-column
            v-if="columns.userName.visible"
            key="userName"
            label="用户名称"
            align="center"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <a class="link-type cursor-pointer" @click="handleViewData(scope.row)">{{
                scope.row.userName
              }}</a>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.nickName.visible"
            key="nickName"
            label="用户昵称"
            align="center"
            prop="nickName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="columns.deptName.visible"
            key="deptName"
            label="部门"
            align="center"
            prop="dept.deptName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="columns.phonenumber.visible"
            key="phonenumber"
            label="手机号码"
            align="center"
            prop="phonenumber"
            width="120"
          />
          <el-table-column v-if="columns.status.visible" key="status" label="状态" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns.createTime.visible"
            label="创建时间"
            align="center"
            prop="createTime"
            width="160"
          >
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="150"
            class-name="small-padding fixed-width"
          >
            <template #default="scope">
              <el-tooltip v-if="scope.row.userId !== 1" content="修改" placement="top">
                <el-button
                  v-hasPermi="['system:user:edit']"
                  link
                  type="primary"
                  :icon="Pencil"
                  @click="handleUpdate(scope.row)"
                />
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="删除" placement="top">
                <el-button
                  v-hasPermi="['system:user:remove']"
                  link
                  type="primary"
                  :icon="Trash2"
                  @click="handleDelete(scope.row)"
                />
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="重置密码" placement="top">
                <el-button
                  v-hasPermi="['system:user:resetPwd']"
                  link
                  type="primary"
                  :icon="KeyRound"
                  @click="handleResetPwd(scope.row)"
                />
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="分配角色" placement="top">
                <el-button
                  v-hasPermi="['system:user:edit']"
                  link
                  type="primary"
                  :icon="CircleCheck"
                  @click="handleAuthRole(scope.row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </div>
    </div>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="enabledDeptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                placeholder="请选择归属部门"
                clearable
                check-strictly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.userId == undefined"
              label="用户密码"
              prop="password"
              :rules="pwdValidator"
            >
              <el-input
                v-model="form.password"
                placeholder="请输入用户密码"
                type="password"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option
                  v-for="dict in sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">
            确 定
          </el-button>
          <el-button @click="cancel">
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户详情抽屉 -->
    <UserViewDrawer ref="userViewRef" />
    <!-- 用户导入对话框 -->
    <ExcelImportDialog
      ref="importUserRef"
      title="用户导入"
      action="/system/user/importData"
      template-action="/system/user/importTemplate"
      template-file-name="user_template"
      update-support-label="是否更新已经存在的用户数据"
      @success="getList"
    />
  </div>
</template>
