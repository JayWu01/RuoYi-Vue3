<template>
  <div class="app-container home">
    <div style="margin-top:40px;">
      <el-row :gutter="30">
        <el-col :span="8">
          <el-button
              type="primary"
              size="large"
              icon="el-icon-monitor"
              style="width:100%;height:90px;font-size:18px"
              @click="openPoliceScreen"
          >
            街面警务站大数据屏
          </el-button>
        </el-col>
<!--        <el-col :span="8">-->
<!--          <el-button-->
<!--              type="primary"-->
<!--              size="large"-->
<!--              icon="el-icon-data-line"-->
<!--              style="width:100%;height:90px;font-size:18px"-->
<!--              @click="openScreenHit"-->
<!--          >-->
<!--            打击现行可视化大屏-->
<!--          </el-button>-->
<!--        </el-col>-->
        <!--        <el-col :span="8">-->
        <!--          <el-button-->
        <!--            type="primary"-->
        <!--            size="large"-->
        <!--            icon="el-icon-pie-chart"-->
        <!--            style="width:100%;height:90px;font-size:18px"-->
        <!--            @click="openScreenAnalysis"-->
        <!--          >-->
        <!--            综合分析可视化大屏-->
        <!--          </el-button>-->
        <!--        </el-col>-->
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Index',
  methods: {
    // 接处警大屏 新窗口打开
    openPoliceScreen() {
      window.open('/screen', '_blank')
    },
    // 勤务态势大屏 新窗口打开
    openScreenWork() {
      window.open('/screenWork', '_blank')
    },
    // 综合分析大屏 新窗口打开
    openScreenAnalysis() {
      window.open('/screenAnalysis', '_blank')
    }
  }
}
</script>
