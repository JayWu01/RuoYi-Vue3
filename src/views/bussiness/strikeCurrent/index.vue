<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="打击日期" prop="strikeDate">
        <el-date-picker
            v-model="queryParams.strikeDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="请选择打击日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="所属单位" prop="unitName">
        <el-input
            v-model="queryParams.unitName"
            placeholder="请输入单位名称"
            clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            size="mini"
            @click="handleAdd"
            v-has-perm="'police:strikeCurrent:add'"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Upload"
            size="mini"
            @click="handleImport"
            v-has-perm="'police:strikeCurrent:import'"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            size="mini"
            @click="handleExport"
            v-has-perm="'police:strikeCurrent:export'"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            size="mini"
            @click="handleBatchDelete"
            v-has-perm="'police:strikeCurrent:remove'"
            :disabled="multiple"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @refreshTable="getList"></right-toolbar>
    </el-row>

    <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="index" label="序号" width="60" v-show="showColumns.index"></el-table-column>
      <el-table-column label="打击日期" prop="strikeDate" v-show="showColumns.strikeDate"></el-table-column>
      <el-table-column label="红色警情" prop="crimeRed" v-show="showColumns.crimeRed"></el-table-column>
      <el-table-column label="橙色警情" prop="crimeOrange" v-show="showColumns.crimeOrange"></el-table-column>
      <el-table-column label="黄色警情" prop="crimeYellow" v-show="showColumns.crimeYellow"></el-table-column>
      <el-table-column label="蓝色警情" prop="crimeBlue" v-show="showColumns.crimeBlue"></el-table-column>
      <el-table-column label="黑色警情" prop="crimeBlack" v-show="showColumns.crimeBlack"></el-table-column>
      <el-table-column label="总盘查人数" prop="totalPerson" v-show="showColumns.totalPerson"></el-table-column>
      <el-table-column label="非预警未成年人数" prop="unwarnedMinor" v-show="showColumns.unwarnedMinor"></el-table-column>
      <el-table-column label="检查车辆数" prop="checkCarCount" v-show="showColumns.checkCarCount"></el-table-column>
      <el-table-column label="拉车门数" prop="openDoorCount" v-show="showColumns.openDoorCount"></el-table-column>
      <el-table-column label="抓网逃数" prop="netFugitiveCount" v-show="showColumns.netFugitiveCount"></el-table-column>
      <el-table-column label="抓获团伙数" prop="arrestGroupCount" v-show="showColumns.arrestGroupCount"></el-table-column>
      <el-table-column label="抓获嫌疑人数" prop="arrestSuspectCount" v-show="showColumns.arrestSuspectCount"></el-table-column>
      <el-table-column label="送矫未成年数量" prop="correctMinorCount" v-show="showColumns.correctMinorCount"></el-table-column>
      <el-table-column label="单位名称" prop="unitName" v-show="showColumns.unitName"></el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button
              size="mini"
              type="text"
              icon="Edit"
              @click="handleUpdate(row)"
              v-has-perm="'police:strikeCurrent:edit'"
          >修改</el-button>
          <el-button
              size="mini"
              type="text"
              icon="Delete"
              @click="handleDelete(row)"
              v-has-perm="'police:strikeCurrent:remove'"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        :page="queryParams.pageNum"
        @update:page="queryParams.pageNum = $event"
        :limit="queryParams.pageSize"
        @update:limit="queryParams.pageSize = $event"
        @pagination="getList"
    />

    <!-- 新增/编辑主弹窗 -->
    <el-dialog
        :title="title"
        v-model="open"
        width="950px"
        append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="打击日期" prop="strikeDate">
          <el-date-picker v-model="form.strikeDate" value-format="YYYY-MM-DD" type="date" placeholder="请选择打击日期"></el-date-picker>
        </el-form-item>

        <el-divider content-position="left">敲打未成年</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="罪错‑红">
              <el-input-number v-model="form.crimeRed" :min="0" style="width:140px" @change="buildPersonList"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="罪错‑橙">
              <el-input-number v-model="form.crimeOrange" :min="0" style="width:140px" @change="buildPersonList"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="罪错‑黄">
              <el-input-number v-model="form.crimeYellow" :min="0" style="width:140px" @change="buildPersonList"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="罪错‑蓝">
              <el-input-number v-model="form.crimeBlue" :min="0" style="width:140px" @change="buildPersonList"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="罪错‑黑">
              <el-input-number v-model="form.crimeBlack" :min="0" style="width:140px" @change="buildPersonList"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总人数">
              <el-input v-model="form.totalPerson" style="width:140px" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="非预警未成年数">
              <el-input-number v-model="form.unwarnedMinor" :min="0" style="width:140px" @change="buildPersonList"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <!--敲打未成年身份证子表，带personType类型-->
        <div v-if="form.personList.length > 0">
          <el-form-item label="人员身份证列表">
            <el-table :data="form.personList" border size="small">
              <el-table-column label="序号" type="index" width="60"/>
              <!-- 人员类型列，上线可删除 -->
              <el-table-column label="人员类型" width="140">
                <template #default="{ row }">
                  <span>{{ getPersonTypeName(row.personType) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="身份证号">
                <template #default="{ row }">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <el-input
                        v-model="row.idCard"
                        placeholder="必填身份证"
                        @input="handleIdCardInput(row)"
                        @blur="handleIdCardBlur(row)"
                        style="flex:1;">
                    </el-input>
                    <span v-if="row.idCardError" style="color:#f56c6c;font-size:12px;white-space:nowrap;">
                      {{row.idCardError}}
                    </span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div style="color:#f56c6c;font-size:12px;margin-top:4px;">
              需要填写 {{form.personList.length}} 条身份证信息
            </div>
          </el-form-item>
        </div>

        <el-divider content-position="left">拉车门</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="检查车辆数">
              <el-input-number v-model="form.checkCarCount" :min="0" style="width:140px"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拉开车门数">
              <el-input-number v-model="form.openDoorCount" :min="0" style="width:140px" @change="syncOpenDoorCarRow"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <div v-if="form.openDoorCount > 0">
          <el-form-item label="拉开车门号牌列表">
            <el-table :data="form.doorCarList" border size="small">
              <el-table-column label="序号" type="index" width="60"/>
              <el-table-column label="车牌号">
                <template #default="{ row }">
                  <el-input v-model="row.carNo" placeholder="必填车牌"></el-input>
                </template>
              </el-table-column>
            </el-table>
            <div style="color:#f56c6c;font-size:12px;margin-top:4px;">
              需要填写 {{form.openDoorCount}} 条拉开车门车牌信息
            </div>
          </el-form-item>
        </div>

        <el-divider content-position="left">追网逃</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="抓网逃数">
              <el-input-number v-model="form.netFugitiveCount" :min="0" style="width:140px"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案情" prop="netFugitiveCase">
              <el-input v-model="form.netFugitiveCase" type="textarea" rows="2"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">抓获现行</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="抓获团伙数">
              <el-input-number v-model="form.arrestGroupCount" :min="0" style="width:140px"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="抓获嫌疑人数">
              <el-input-number v-model="form.arrestSuspectCount" :min="0" style="width:140px"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="案情" prop="arrestCase">
              <el-input v-model="form.arrestCase" type="textarea" rows="2"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">送矫未成年</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="人数">
              <el-input-number v-model="form.correctMinorCount" :min="0" style="width:140px"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="案情" prop="correctMinorCase">
              <el-input v-model="form.correctMinorCase" type="textarea" rows="2"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" rows="2"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!--人员弹窗（保留，原有逻辑）-->
    <el-dialog title="录入人员身份信息" v-model="personDialogVisible" width="700px">
      <el-table :data="personForm.personList" border>
        <el-table-column label="序号" type="index" width="60"></el-table-column>
        <el-table-column label="身份证号">
          <template #default="{ row }">
            <el-input v-model="row.idCard" placeholder="身份证号必填"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div>
          <el-button @click="personDialogVisible=false">取消</el-button>
          <el-button type="primary" @click="confirmPerson">确认人员信息</el-button>
        </div>
      </template>
    </el-dialog>

    <!--车辆弹窗（保留）-->
    <el-dialog title="录入车辆号牌信息" v-model="carDialogVisible" width="700px">
      <el-table :data="carForm.carList" border>
        <el-table-column label="序号" type="index" width="60"></el-table-column>
        <el-table-column label="车牌号">
          <template #default="{ row }">
            <el-input v-model="row.carNo" placeholder="车牌号必填"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div>
          <el-button @click="carDialogVisible=false">取消</el-button>
          <el-button type="primary" @click="confirmCar">确认车辆信息</el-button>
        </div>
      </template>
    </el-dialog>

    <!--导入弹窗-->
    <el-dialog title="警务站打击现行数据导入" v-model="importOpen" width="500px">
      <el-upload
          ref="uploadRef"
          :action="uploadUrl"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :file-list="fileList"
      >
        <el-button type="primary">选择文件</el-button>
        <template #tip>
          <el-link type="text" @click="downloadTemplate">下载模板</el-link>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importOpen=false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listStrikeCurrent, getStrikeCurrent, addStrikeCurrent, updateStrikeCurrent, delStrikeCurrent } from "@/api/bussiness/strikeCurrent";

const showSearch = ref(true)
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const multiple = ref(true)
const ids = ref([])

const queryFormRef = ref(null)
const formRef = ref(null)
const uploadRef = ref(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  strikeDate: null,
  unitName: null
})

const showColumns = reactive({
  index:true,
  strikeDate:true,
  crimeRed:true,
  crimeOrange:true,
  crimeYellow:true,
  crimeBlue:true,
  crimeBlack:true,
  totalPerson:true,
  unwarnedMinor:true,
  checkCarCount:true,
  openDoorCount:true,
  netFugitiveCount:true,
  correctMinorCount:true,
  unitName:true
})

const open = ref(false)
const title = ref("")

const defaultFormState = () => ({
  id:null,
  strikeDate:null,
  crimeRed:0,
  crimeOrange:0,
  crimeYellow:0,
  crimeBlue:0,
  crimeBlack:0,
  totalPerson:0,
  unwarnedMinor:0,
  checkCarCount:0,
  openDoorCount:0,
  netFugitiveCount:0,
  netFugitiveCase:"",
  arrestGroupCount:0,
  arrestSuspectCount:0,
  arrestCase:"",
  correctMinorCount:0,
  correctMinorCase:"",
  remark:"",
  personList: [], // {idCard:'',personType:'',idCardError:''}
  doorCarList: []
})

const form = reactive(defaultFormState())

//表单校验规则
const rules = {
  strikeDate:[{required:true,message:"打击日期不能为空",trigger:"blur"}],
  netFugitiveCase:[
    {validator:(rule,value,callback)=>{
        if(form.netFugitiveCount>0 && !value) callback(new Error("追网逃有数据时案情必填"));
        else callback();
      },trigger:"blur"}
  ],
  arrestCase:[
    {validator:(rule,value,callback)=>{
        if(form.arrestSuspectCount>0 && !value) callback(new Error("抓获现行有数据时案情必填"));
        else callback();
      },trigger:"blur"}
  ],
  correctMinorCase:[
    {validator:(rule,value,callback)=>{
        if(form.correctMinorCount>0 && !value) callback(new Error("送矫未成年有数据时案情必填"));
        else callback();
      },trigger:"blur"}
  ]
}

const personDialogVisible = ref(false)
const personForm = reactive({personList:[]})
const carDialogVisible = ref(false)
const carForm = reactive({carList:[]})
const importOpen = ref(false)
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + "/police/strikeCurrent/importData")
const fileList = ref([])

//personType转中文
const getPersonTypeName = (type) => {
  const map = {
    crimeRed:'罪错‑红',
    crimeOrange:'罪错‑橙',
    crimeYellow:'罪错‑黄',
    crimeBlue:'罪错‑蓝',
    crimeBlack:'罪错‑黑',
    unwarnedMinor:'非预警未成年'
  }
  return map[type] || type
}

/**
 * 构建personList，自动计算totalPerson，保留已填身份证，每条携带personType
 */
const buildPersonList = () => {
  form.totalPerson = form.crimeRed + form.crimeOrange + form.crimeYellow + form.crimeBlue + form.crimeBlack
  //旧数据按personType分组保存已录入身份证
  const group = {}
  form.personList.forEach(item=>{
    if(!group[item.personType]) group[item.personType] = []
    group[item.personType].push(item.idCard)
  })
  const newList = []
  for(let i=0;i<form.crimeRed;i++){
    newList.push({idCard: group.crimeRed?.[i] ?? '', personType:'crimeRed', idCardError:''})
  }
  for(let i=0;i<form.crimeOrange;i++){
    newList.push({idCard: group.crimeOrange?.[i] ?? '', personType:'crimeOrange', idCardError:''})
  }
  for(let i=0;i<form.crimeYellow;i++){
    newList.push({idCard: group.crimeYellow?.[i] ?? '', personType:'crimeYellow', idCardError:''})
  }
  for(let i=0;i<form.crimeBlue;i++){
    newList.push({idCard: group.crimeBlue?.[i] ?? '', personType:'crimeBlue', idCardError:''})
  }
  for(let i=0;i<form.crimeBlack;i++){
    newList.push({idCard: group.crimeBlack?.[i] ?? '', personType:'crimeBlack', idCardError:''})
  }
  for(let i=0;i<form.unwarnedMinor;i++){
    newList.push({idCard: group.unwarnedMinor?.[i] ?? '', personType:'unwarnedMinor', idCardError:''})
  }
  form.personList = newList
}

//身份证严格校验 18/15位
const checkIdCard = (idCard) => {
  if (!idCard) return false;
  idCard = idCard.trim();
  const reg18 = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  const reg15 = /^[1-9]\d{5}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}$/;
  if (!reg18.test(idCard) && !reg15.test(idCard)) {
    return false;
  }
  if(idCard.length === 18){
    const weight = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
    const checkCode = ['1','0','X','9','8','7','6','5','4','3','2'];
    let sum = 0;
    for(let i=0;i<17;i++){
      sum += parseInt(idCard[i]) * weight[i];
    }
    const mod = sum % 11;
    const lastChar = idCard[17].toUpperCase();
    if(checkCode[mod] !== lastChar){
      return false;
    }
  }
  return true;
}

const handleIdCardBlur = (row) => {
  row.idCardError = "";
  const val = row.idCard?.trim();
  if(!val) {
    row.idCardError = "身份证不能为空";
    return;
  }
  if(!checkIdCard(val)){
    row.idCardError = "身份证格式不正确";
  }
}

const handleIdCardInput = (row) => {
  row.idCardError = ""
}

const syncOpenDoorCarRow = () => {
  const need = form.openDoorCount;
  const list = form.doorCarList;
  if(list.length > need){
    form.doorCarList = list.slice(0, need);
  }else{
    for(let i = list.length; i < need; i++){
      form.doorCarList.push({carNo:""});
    }
  }
}

const getList = async () => {
  loading.value = true
  const res = await listStrikeCurrent(queryParams)
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
  handleQuery()
}

const handleSelectionChange = (val) => {
  ids.value = val.map(item=>item.id);
  multiple.value = !val.length;
}

const handleAdd = () => {
  resetForm()
  title.value = "新增警务站打击现行数据"
  open.value = true
}

const handleUpdate = async (row) => {
  resetForm()
  const res = await getStrikeCurrent(row.id)
  Object.assign(form, res.data)
  //回显初始化错误字段
  if(form.personList){
    form.personList = form.personList.map(p=> ({...p, idCardError:''}))
  }
  title.value = "修改警务站打击现行数据"
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
  }catch(e){
    return
  }
  let hasError = false
  //校验身份证
  if(form.personList.length > 0){
    form.personList.forEach(item=>{
      item.idCardError = ''
      const val = item.idCard?.trim()
      if(!val){
        item.idCardError = '身份证不能为空'
        hasError = true
      }else if(!checkIdCard(val)){
        item.idCardError = '身份证格式不正确'
        hasError = true
      }
    })
    if(hasError){
      ElMessage.error('请检查身份证填写')
      return
    }
  }
  //校验车牌
  if(form.openDoorCount > 0){
    if(form.doorCarList.length !== form.openDoorCount){
      ElMessage.error(`必须填写${form.openDoorCount}条拉开车门车牌信息`)
      return
    }
    const emptyDoorCar = form.doorCarList.some(item => !item.carNo?.trim());
    if(emptyDoorCar){
      ElMessage.error("拉开车门车牌存在空值，请补全");
      return;
    }
  }
  doSave()
}

const confirmPerson = () => {
  if(personForm.personList.some(x=>!x.idCard)){
    ElMessage.error("身份证号不能为空！");
    return;
  }
  personDialogVisible.value=false;
  if(form.openDoorCount>0){
    carForm.carList=[];
    for(let i=0;i<form.openDoorCount;i++){
      carForm.carList.push({carNo:""});
    }
    carDialogVisible.value=true;
    return;
  }
  doSave();
}

const confirmCar = () => {
  if(carForm.carList.some(x=>!x.carNo)){
    ElMessage.error("车牌号不能为空！");
    return;
  }
  carDialogVisible.value=false;
  doSave();
}

const doSave = async () => {
  const params = { ...form }
  //提交只保留 idCard、personType；剔除前端idCardError
  params.personList = form.personList.map(({ idCard, personType }) => ({ idCard, personType }))
  params.doorCarList = form.doorCarList

  if(form.id != null){
    await updateStrikeCurrent(params)
    ElMessage.success("修改成功")
  }else{
    await addStrikeCurrent(params)
    ElMessage.success("新增成功")
  }
  open.value = false
  getList()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该条数据？').then(async ()=>{
    await delStrikeCurrent(row.id)
    ElMessage.success("删除成功")
    getList()
  }).catch(()=>{})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm('确认删除选中数据？').then(async ()=>{
    await delStrikeCurrent(ids.value)
    ElMessage.success("删除成功")
    getList()
  }).catch(()=>{})
}

const handleExport = () => {
  // 项目下载工具自行适配
  console.log('export',queryParams)
}

const handleImport = () => {
  importOpen.value = true
}

const downloadTemplate = () => {
  console.log('downloadTemplate')
}

const uploadSuccess = () => {
  ElMessage.success("导入成功")
  importOpen.value = false
  getList()
}

const uploadError = () => {
  ElMessage.error("导入失败")
}

getList()
</script>
