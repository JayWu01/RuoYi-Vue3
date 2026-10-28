# 项目记忆 — RuoYi-Vue3 大屏

## 协作边界（重要，用户明确要求）
- **只改当前工作区 `D:/code/RuoYi-Vue3` 内的文件。** 同级目录的配套后端 `D:/code/RuoYi-Vue-master`（以及 `d:/code/` 下其他仓库）一律**只读**，不要写入。
- 需要改后端时，先说明原因和具体改动点，等用户明确点头再动手。
- **即使在工作区内、即使是修 bug，也要先报改动方案（文件 + 具体位置 + 理由）再动手，不要先斩后奏。**
- **不要擅自重构用户自己写的代码结构或改写其注释。** 用户会在代码里留下明确意图（例如"这里未来写 axios 请求"这类预留注释），那是他给自己留的活儿，替换掉会破坏他的计划。
- 用户对自己仓库的未提交改动很在意：会话中改动过的文件往往同时含他的未提交工作，**回退绝不能建议 `git checkout -- <file>`**（会一并丢掉他的改动），只能用精确的反向编辑。
- 判断哪些改动属于用户自己：`git -C <repo> status --short` + `git diff --numstat`，不要把用户的未提交改动误认成自己的产物，也不要"顺手"整理。


## 大屏技术约定
- 大屏前端代码集中在 `src/views/screen/`，结构：`api/`（含 `generated/` 自动生成，勿手改）、`composables/`、`components/`、`modules/`（各面板）。
- 数据统一走 `useDashboardData`，每个模块用 `loadModule(key, request, updateDashboard)` 把结果合并进 `dashboard`（shallowRef 整体替换）。
- **新增面板的标准四步**（这次踩过坑，缺任一步面板就空）：
  1. `constant.js` 的 `createEmptyDashboard()` 加初值；
  2. `useDashboardData.js` 加 `moduleLabels` / `createModuleState` / `loadXxx` / `reloadXxx`，并接进 `reloadMetrics`；
  3. `api/policeDashboard.js` 加请求封装（`request(...).then(r => r.data)`，会剥掉 AjaxResult 外壳）；
  4. 父组件 `PoliceDashboard.vue` 定义对应筛选状态并在切换时重新请求。
- 图表组件统一用 `composables/useECharts`，**注意 `echarts.graphic.*` 需要组件内自行 `import * as echarts from 'echarts'`**。
- 后端接口前缀 `/policeScreen`，入参统一 `PoliceStatQueryDTO`，返回 `AjaxResult`。
- **MyBatis 驼峰映射是关着的**（mybatis-config.xml 里 mapUnderscoreToCamelCase 被注释）：给 resultType 实体写查询，列必须手写驼峰别名（`dept_id as deptId`）或用 resultMap，否则属性全 null 且不报错——2026-10-24 排名面板空白就是这个坑。
- **排名（`/policeScreen/getRankList`）口径已定型**：排名项只能来自 `sys_dept`（101 特警支队 → 大队 → 警务站），台账/打击现行里的单位文本只用来映射到部门，绝不直接当排名项；没数据的部门补 0 参与排名；并列同名次。维度/指标用后端的 `Enum/RankDimensionEnum`、`Enum/RankIndexEnum`，前端传 `rankDimension=station|dept`。抓现行 = `arrest_group_count + arrest_suspect_count`。
- `police_alarm_record.alarm_time` 是 **varchar(50)** 且定长 19 位，过滤用 `alarm_time >= DATE_FORMAT(#{startDate},'%Y-%m-%d 00:00:00')` 这种字符串比较，别用 `STR_TO_DATE(alarm_time)`（破坏索引）。`police_strike_current.strike_date` 是真正的 date，可直接比较；注意 `unwarnedMinor` 列名是驼峰。

## 后端 Excel 导入约定（接处警台账那两个接口已定型）
- 导入不要用公共 `ExcelUtil.importExcel`（丢真实行号、抛 UtilException、一行失败全中断）；走 `utils/imports/PoliceAlarmExcelReader` + `PoliceAlarmImportSupport` 四阶段：逐行校验 → 批量判重 → 分块批量写（失败块回退逐行定位）→ 汇总 + 失败明细 xlsx 走 Base64 返回。
- 大批量写库用 Mapper 的 `insertBatch` / `insertOrUpdateBatch`（多行 values，`BATCH_SIZE=200`）；判重一次查完 `selectExistingAlarmNos`（每 1000 条一批），不要逐行查。
- **`on duplicate key update` 依赖唯一索引**：先 `countUniqueIndexOnAlarmNo()` 查 information_schema.statistics，没有唯一索引时必须退回「逐行 update + 批量 insert」，否则会重复插入。
- 字段长度以 `information_schema.columns.character_maximum_length` 为准，超长自动截断并记 warning；`receive_alarm_no` 超长直接判错（截断会串单）。
- 不要改公共 `ExcelUtil` / `ExcelMultiHeadUtil`，它们被全项目复用。
