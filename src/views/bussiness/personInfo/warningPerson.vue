<template>
  <div class="app-container">
    <div class="page-header">
      <h2>⚠️重复线索预警列表</h2>
    </div>

    <el-form :model="queryParams" ref="queryRef" inline>
      <el-form-item label="接警时间">
        <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getData">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="margin-top:10px;"
    >
      <el-table-column label="警单编号" prop="receiveAlarmNo" />
      <el-table-column label="姓名" prop="personName" />
      <el-table-column label="身份证号" prop="cardNo" />
      <el-table-column label="手机号" prop="phoneNo" />
      <el-table-column label="性别" prop="gender" />
      <el-table-column label="接警时间" prop="alarmTime" />
      <el-table-column label="预警原因" prop="warnReason">
        <template #default="scope">
          <el-tag type="danger">{{ scope.row.warnReason }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="openAlarmDialog(scope.row)">查看警单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getData"
    />

    <!-- 警单详情弹窗【只读，和截图布局完全一致】 -->
    <el-dialog title="警单详情" v-model="alarmDialogVisible" width="80%" :close-on-click-modal="false">
      <el-form label-width="100px" :model="alarmDetail" v-loading="alarmDetailLoading">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="有无效">
              <el-select v-model="alarmDetail.isValid" disabled>
                <el-option label="有效" value="有效"/>
                <el-option label="无效" value="无效"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="处理状态">
              <el-input v-model="alarmDetail.handleStatus" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="接警类型">
              <el-input v-model="alarmDetail.alarmType" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="警单编号">
              <el-input v-model="alarmDetail.receiveAlarmNo" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="接警时间">
              <el-input v-model="alarmDetail.alarmTime" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="事发地址">
              <el-input v-model="alarmDetail.incidentAddress" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="报警内容">
              <el-input v-model="alarmDetail.alarmContent" type="textarea" :rows="3" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="报警人名称">
              <el-input v-model="alarmDetail.alarmPersonName" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="报警电话">
              <el-input v-model="alarmDetail.alarmPhone" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="警情类别">
              <el-input v-model="alarmDetail.policeCategory" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="警情类型">
              <el-input v-model="alarmDetail.policeType" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="警情细类">
              <el-input v-model="alarmDetail.policeDetailType" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="警情子类">
              <el-input v-model="alarmDetail.policeSubType" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="接警员">
              <el-input v-model="alarmDetail.receivePoliceOfficer" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="管辖单位">
              <el-input v-model="alarmDetail.jurisdictionUnit" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="处警单位">
              <el-input v-model="alarmDetail.disposeUnit" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="出警民警">
              <el-input v-model="alarmDetail.outPoliceOfficer" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="处置时间">
              <el-input v-model="alarmDetail.disposeTime" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="到场时间">
              <el-input v-model="alarmDetail.arriveTime" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="现场反馈">
              <el-input v-model="alarmDetail.siteFeedback" type="textarea" :rows="3" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="反馈时间">
              <el-input v-model="alarmDetail.feedbackTime" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="反馈类别">
              <el-input v-model="alarmDetail.feedbackCategory" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="反馈类型">
              <el-input v-model="alarmDetail.feedbackType" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="反馈细类">
              <el-input v-model="alarmDetail.feedbackDetailType" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="反馈子类">
              <el-input v-model="alarmDetail.feedbackSubType" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="反馈内容">
              <el-input v-model="alarmDetail.feedbackContent" type="textarea" :rows="3" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="处理结果">
              <el-input v-model="alarmDetail.disposeResult" type="textarea" :rows="3" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="属地村社">
              <el-input v-model="alarmDetail.villageCommunity" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属中队代码">
              <el-input v-model="alarmDetail.squadCode" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属中队名称">
              <el-input v-model="alarmDetail.squadName" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="事发路段">
              <el-input v-model="alarmDetail.incidentRoad" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="自动定位">
              <el-input v-model="alarmDetail.autoLocation" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="手动定位">
              <el-input v-model="alarmDetail.manualLocation" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="移动App定位">
              <el-input v-model="alarmDetail.appLocation" disabled placeholder="-"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="自接警">
              <el-select v-model="alarmDetail.selfReceiveAlarm" disabled>
                <el-option label="是" value="是"/>
                <el-option label="否" value="否"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否回访">
              <el-select v-model="alarmDetail.isReturnVisit" disabled>
                <el-option label="是" value="是"/>
                <el-option label="否" value="否"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="alarmDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getPersonWarningList } from "@/api/bussiness/personInfo"
import { getPoliceAlarm } from "@/api/bussiness/policeAlarm"
export default {
  name: "personWarning",
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      queryParams: {
        dateRange: [],
        pageNum: 1,
        pageSize: 10
      },
      alarmDialogVisible: false,
      alarmDetailLoading: false,
      alarmDetail: {}
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      this.loading = true
      const params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      }
      if (this.queryParams.dateRange?.length === 2) {
        console.log("选中的日期数组：", this.queryParams.dateRange)
        params.beginTime = this.queryParams.dateRange[0]
        params.endTime = this.queryParams.dateRange[1]
        console.log("传给后端params：",params)
      }
      const res = await getPersonWarningList(params)
      this.tableData = res.rows
      this.total = res.total
      this.loading = false
    },
    resetQuery() {
      this.queryParams = { dateRange: [], pageNum: 1, pageSize: 10 }
      this.getData()
    },
    async openAlarmDialog(row) {
      if (!row.receiveAlarmNo) {
        this.$message.warning("该记录无警单编号！")
        return
      }
      this.alarmDialogVisible = true
      this.alarmDetailLoading = true
      try {
        const res = await getPoliceAlarm(row.receiveAlarmNo)
        console.log("警单返回数据：", res.data)
        this.alarmDetail = res.data
      } catch (err) {
        console.error(err)
        this.$message.error("获取警单详情失败")
        this.alarmDetail = {}
      } finally {
        this.alarmDetailLoading = false
      }
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 15px;
}
</style>
