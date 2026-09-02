<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="打击日期" prop="strikeDate">
        <el-date-picker
            v-model="queryParams.strikeDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="请选择打击日期"
        ></el-date-picker>
      </el-form-item>
      <!--新增单位下拉-->
      <el-form-item label="所属单位" prop="deptId">
        <el-select v-model="queryParams.deptId" placeholder="请选择单位" clearable>
          <el-option label="单位A" :value="1"></el-option>
          <!-- 实际项目用部门树/部门下拉组件 -->
        </el-select>
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
      <el-table-column label="检查车辆数" prop="checkCarCount" v-show="showColumns.checkCarCount"></el-table-column>
      <el-table-column label="拉车门数" prop="openDoorCount" v-show="showColumns.openDoorCount"></el-table-column>
      <el-table-column label="抓网逃数" prop="netFugitiveCount" v-show="showColumns.netFugitiveCount"></el-table-column>
      <el-table-column label="抓获团伙数" prop="arrestGroupCount" v-show="showColumns.arrestGroupCount"></el-table-column>
      <el-table-column label="抓获嫌疑人数" prop="arrestSuspectCount" v-show="showColumns.arrestSuspectCount"></el-table-column>
      <el-table-column label="送矫未成年数量" prop="correctMinorCount" v-show="showColumns.correctMinorCount"></el-table-column>
      <el-table-column label="单位名称" prop="unitName" v-show="showColumns.unitName"></el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              size="mini"
              type="text"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-has-perm="'police:strikeCurrent:edit'"
          >修改</el-button>
          <el-button
              size="mini"
              type="text"
              icon="Delete"
              @click="handleDelete(scope.row)"
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

    <!-- ====================== 新增/编辑主弹窗【修复】 ====================== -->
    <el-dialog :title="title" :model-value="open"
               @update:model-value="open = $event" width="950px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="打击日期" prop="strikeDate">
          <el-date-picker v-model="form.strikeDate" value-format="YYYY-MM-DD" type="date" placeholder="请选择打击日期"></el-date-picker>
        </el-form-item>

        <el-divider content-position="left">敲打未成年</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="罪错‑红">
              <el-input-number v-model="form.crimeRed" :min="0" style="width:140px" @change="calcTotal"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="罪错‑橙">
              <el-input-number v-model="form.crimeOrange" :min="0" style="width:140px" @change="calcTotal"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="罪错‑黄">
              <el-input-number v-model="form.crimeYellow" :min="0" style="width:140px" @change="calcTotal"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="罪错‑蓝">
              <el-input-number v-model="form.crimeBlue" :min="0" style="width:140px" @change="calcTotal"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="罪错‑黑">
              <el-input-number v-model="form.crimeBlack" :min="0" style="width:140px" @change="calcTotal"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总人数">
              <el-input v-model="form.totalPerson" style="width:140px" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!--敲打未成年身份证子表-->
        <div v-if="form.totalPerson > 0">
          <el-form-item label="人员身份证列表">
            <el-table :data="form.personList" border size="small">
              <el-table-column label="序号" type="index" width="60"/>
              <el-table-column label="身份证号">
                <template #default="scope">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <el-input
                        v-model="scope.row.idCard"
                        placeholder="必填身份证"
                        @input="handleIdCardInput(scope.row)"
                        @blur="handleIdCardBlur(scope.row)"
                        style="flex:1;">
                    </el-input>
                    <span v-if="scope.row.idCardError" style="color:#f56c6c;font-size:12px;white-space:nowrap;">
        {{scope.row.idCardError}}
      </span>
                  </div>
                </template>
              </el-table-column>

            </el-table>
            <div style="color:#f56c6c;font-size:12px;margin-top:4px;">
              需要填写 {{form.totalPerson}} 条身份证信息
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

        <!--拉开车门车牌子表-->
        <div v-if="form.openDoorCount > 0">
          <el-form-item label="拉开车门号牌列表">
            <el-table :data="form.doorCarList" border size="small">
              <el-table-column label="序号" type="index" width="60"/>
              <el-table-column label="车牌号">
                <template #default="scope">
                  <el-input v-model="scope.row.carNo" placeholder="必填车牌"></el-input>
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
      <template #footer><div class="dialog-footer">
        <el-button @click="open = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div></template>
    </el-dialog>

    <!--人员弹窗-->
    <el-dialog title="录入人员身份信息" :model-value="personDialogVisible"
               @update:model-value="personDialogVisible = $event" width="700px">
      <el-table :data="personForm.personList" border>
        <el-table-column label="序号" type="index" width="60"></el-table-column>
        <el-table-column label="身份证号">
          <template #default="scope">
            <el-input v-model="scope.row.idCard" placeholder="身份证号必填"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <template #footer><div>
        <el-button @click="personDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmPerson">确认人员信息</el-button>
      </div></template>
    </el-dialog>

    <!--车辆弹窗-->
    <el-dialog title="录入车辆号牌信息" :model-value="carDialogVisible"
               @update:model-value="carDialogVisible = $event" width="700px">
      <el-table :data="carForm.carList" border>
        <el-table-column label="序号" type="index" width="60"></el-table-column>
        <el-table-column label="车牌号">
          <template #default="scope">
            <el-input v-model="scope.row.carNo" placeholder="车牌号必填"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <template #footer><div>
        <el-button @click="carDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmCar">确认车辆信息</el-button>
      </div></template>
    </el-dialog>

    <!--导入弹窗-->
    <el-dialog title="警务站打击现行数据导入" :model-value="importOpen"
               @update:model-value="importOpen = $event" width="500px">
      <el-upload
          ref="upload"
          :action="uploadUrl"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :file-list="fileList"
      >
        <el-button type="primary">选择文件</el-button>
        <div slot="tip" class="el-upload__tip">
          <el-link type="text" @click="downloadTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <template #footer><div class="dialog-footer">
        <el-button @click="importOpen=false">取消</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>

<script>
import { listStrikeCurrent, getStrikeCurrent, addStrikeCurrent, updateStrikeCurrent, delStrikeCurrent } from "@/api/bussiness/strikeCurrent";
export default {
  name:"PoliceStrikeCurrent",
  data(){
    return{
      showSearch:true,
      loading:false,
      tableData:[],
      total:0,
      multiple:true,
      ids:[],
      queryParams:{
        pageNum:1,
        pageSize:10,
        strikeDate:null,
        deptId: null //新增单位查询条件
      },
      //========全部列配置：key和prop一一对应，true默认显示 false默认隐藏========
      showColumns: {
        index:true,
        strikeDate:true,
        crimeRed:true,
        crimeOrange:true,
        crimeYellow:true,
        crimeBlue:true,
        crimeBlack:true,
        totalPerson:true,
        checkCarCount:true,
        openDoorCount:true,
        netFugitiveCount:true,
        correctMinorCount:true,
        unitName:true
      },
      //给列设置组件使用，label为显示中文，prop绑定字段
      tableColumns: [
        { label:"序号", prop:"index" },
        { label:"打击日期", prop:"strikeDate" },
        { label:"红色警情", prop:"crimeRed" },
        { label:"橙色警情", prop:"crimeOrange" },
        { label:"黄色警情", prop:"crimeYellow" },
        { label:"蓝色警情", prop:"crimeBlue" },
        { label:"黑色警情", prop:"crimeBlack" },
        { label:"总盘查人数", prop:"totalPerson" },
        { label:"检查车辆数", prop:"checkCarCount" },
        { label:"拉车门数", prop:"openDoorCount" },
        { label:"抓网逃数", prop:"netFugitiveCount" },
        { label:"送矫未成年数量", prop:"correctMinorCount" },
        { label:"单位名称", prop:"unitName" }
      ],
      open:false, //主弹窗开关
      title:"",
      form:{
        id:null,
        strikeDate:null,
        crimeRed:0,
        crimeOrange:0,
        crimeYellow:0,
        crimeBlue:0,
        crimeBlack:0,
        totalPerson:0,
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
        personList:[], //敲打未成年身份证
        doorCarList:[] //拉开车门车牌
      },
      rules:{
        strikeDate:[{required:true,message:"打击日期不能为空",trigger:"blur"}],
        netFugitiveCase:[
          {validator:(rule,value,callback)=>{
              if(this.form.netFugitiveCount>0 && !value) callback(new Error("追网逃有数据时案情必填"));
              else callback();
            },trigger:"blur"}
        ],
        arrestCase:[
          {validator:(rule,value,callback)=>{
              if(this.form.arrestSuspectCount>0 && !value) callback(new Error("抓获现行有数据时案情必填"));
              else callback();
            },trigger:"blur"}
        ],
        correctMinorCase:[
          {validator:(rule,value,callback)=>{
              if(this.form.correctMinorCount>0 && !value) callback(new Error("送矫未成年有数据时案情必填"));
              else callback();
            },trigger:"blur"}
        ]
      },
      personDialogVisible:false,
      personForm:{personList:[]},
      carDialogVisible:false,
      carForm:{carList:[]},
      importOpen:false,
      uploadUrl:import.meta.env.VITE_APP_BASE_API + "/police/strikeCurrent/importData",
      fileList:[]
    }
  },
  created(){
    this.getList();
  },
  methods:{
    getList(){
      this.loading=true;
      listStrikeCurrent(this.queryParams).then(res=>{
        this.tableData = res.rows;
        this.total = res.total;
        this.loading=false;
      })
    },
    handleQuery(){
      this.queryParams.pageNum=1;
      this.getList();
    },
    resetQuery(){
      this.$refs.queryForm.resetFields();
      this.handleQuery();
    },
    handleSelectionChange(val){
      this.ids = val.map(item=>item.id);
      this.multiple = !val.length;
    },
    // 新增按钮
    handleAdd(){
      this.resetForm();
      this.title="新增警务站打击现行数据";
      this.open = true; //打开弹窗！
    },
    // 修改按钮
    handleUpdate(row){
      this.resetForm();
      getStrikeCurrent(row.id).then(res=>{
        this.form = {...res.data};
        //回显时补全error字段
        if(this.form.personList){
          this.form.personList = this.form.personList.map(item=>{
            return {...item, idCardError:""}
          })
        }
        this.title="修改警务站打击现行数据";
        this.open = true;
      })
    },
    resetForm(){
      this.$refs.form && this.$refs.form.resetFields();
      this.form={
        id:null,
        strikeDate:null,
        crimeRed:0,
        crimeOrange:0,
        crimeYellow:0,
        crimeBlue:0,
        crimeBlack:0,
        totalPerson:0,
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
        personList:[],
        carList:[],
        doorCarList:[]
      };
      this.personForm.personList=[];
      this.carForm.carList=[];
    },
    calcTotal(){
      this.form.totalPerson = this.form.crimeRed + this.form.crimeOrange + this.form.crimeYellow + this.form.crimeBlue + this.form.crimeBlack;
      const need = this.form.totalPerson;
      const list = this.form.personList;
      if(list.length > need){
        this.form.personList = list.slice(0, need);
      }else{
        for(let i = list.length; i < need; i++){
          this.form.personList.push({idCard:"", idCardError:""});
        }
      }
    },
    // 身份证合法性校验，支持18位，兼容15位旧身份证
    checkIdCard(idCard) {
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
    },
    handleIdCardBlur(row){
      row.idCardError = "";
      const val = row.idCard?.trim();
      if(!val) {
        row.idCardError = "身份证不能为空";
        return;
      }
      if(!this.checkIdCard(val)){
        row.idCardError = "身份证格式不正确";
      }
    },
    //输入时清除该行错误
    handleIdCardInput(row){
      row.idCardError = "";
    },

    syncOpenDoorCarRow(){
      const need = this.form.openDoorCount;
      const list = this.form.doorCarList;
      if(list.length > need){
        this.form.doorCarList = list.slice(0, need);
      }else{
        for(let i = list.length; i < need; i++){
          this.form.doorCarList.push({carNo:""});
        }
      }
    },
    async submitForm(){
      try {
        await this.$refs.form.validate();
      }catch(e){
        return;
      }

      //提交前清空所有身份证错误
      this.form.personList.forEach(item=>item.idCardError="");
      let hasError = false;

      if(this.form.totalPerson > 0){
        if(this.form.personList.length !== this.form.totalPerson){
          this.$message.error(`必须填写${this.form.totalPerson}条身份证信息`);
          return;
        }
        for(let i=0;i<this.form.personList.length;i++){
          const item = this.form.personList[i];
          const val = item.idCard?.trim();
          if(!val){
            item.idCardError = "身份证不能为空";
            hasError = true;
          }else if(!this.checkIdCard(val)){
            item.idCardError = "身份证格式不正确";
            hasError = true;
          }
        }
        if(hasError){
          return;
        }
      }

      //2.拉开车门数>0校验车牌（保留弹窗提示，如需行内提示后续可以照此改造）
      if(this.form.openDoorCount > 0){
        if(this.form.doorCarList.length !== this.form.openDoorCount){
          this.$message.error(`必须填写${this.form.openDoorCount}条拉开车门车牌信息`);
          return;
        }
        const emptyDoorCar = this.form.doorCarList.some(item => !item.carNo?.trim());
        if(emptyDoorCar){
          this.$message.error("拉开车门车牌存在空值，请补全");
          return;
        }
      }
      this.doSave();
    },
    confirmPerson(){
      if(this.personForm.personList.some(x=>!x.idCard)){
        this.$message.error("身份证号不能为空！");
        return;
      }
      this.personDialogVisible=false;
      if(this.form.openDoorCount>0){
        this.carForm.carList=[];
        for(let i=0;i<this.form.openDoorCount;i++){
          this.carForm.carList.push({carNo:""});
        }
        this.carDialogVisible=true;
        return;
      }
      this.doSave();
    },
    confirmCar(){
      if(this.carForm.carList.some(x=>!x.carNo)){
        this.$message.error("车牌号不能为空！");
        return;
      }
      this.carDialogVisible=false;
      this.doSave();
    },
    doSave(){
      let params = {...this.form};
      //提交时剔除前端错误字段，不要传给后端
      params.personList = this.form.personList.map(({idCard,idCardError})=>({idCard}));
      params.doorCarList = this.form.doorCarList;

      if(this.form.id != null){
        updateStrikeCurrent(params).then(res=>{
          this.$modal.msgSuccess("修改成功");
          this.open=false;
          this.getList();
        })
      }else{
        addStrikeCurrent(params).then(res=>{
          this.$modal.msgSuccess("新增成功");
          this.open=false;
          this.getList();
        })
      }
    },
    handleDelete(row){
      this.$modal.confirm('确认删除该条数据？').then(()=>{
        return delStrikeCurrent(row.id);
      }).then(()=>{
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(()=>{})
    },
    handleBatchDelete(){
      this.$modal.confirm('确认删除选中数据？').then(()=>{
        return delStrikeCurrent(this.ids);
      }).then(()=>{
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(()=>{})
    },
    handleExport(){
      this.$download.post('/police/strikeCurrent/export', this.queryParams);
    },
    handleImport(){
      this.importOpen=true;
    },
    downloadTemplate(){
      this.$download.get('/police/strikeCurrent/importTemplate');
    },
    uploadSuccess(res){
      this.$modal.msgSuccess(res.msg);
      this.importOpen=false;
      this.getList();
    },
    uploadError(){
      this.$message.error("导入失败");
    }
  }
}
</script>
