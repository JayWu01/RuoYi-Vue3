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
