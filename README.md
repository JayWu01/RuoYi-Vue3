<h1 align="center">数智巡防管理系统</h1>

<p align="center">面向街面警务站的巡防业务管理与数据可视化平台</p>

<p align="center">
  <img alt="Vue" src="https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white">
  <img alt="Element Plus" src="https://img.shields.io/badge/Element%20Plus-2.13-409eff?logo=element&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-3.4-06b6d4?logo=tailwindcss&logoColor=white">
</p>

> 本项目基于 [RuoYi-Vue3](https://gitcode.com/yangzongzhuan/RuoYi-Vue3) v3.9.2 二次开发。仓库仅包含前端工程，需配合包含巡防业务模块的 RuoYi-Vue（Spring Boot）后端使用。

## 项目简介

数智巡防管理系统围绕街面警务站的日常巡防业务构建，在 RuoYi 的用户、角色、菜单、权限、日志、代码生成等基础能力之上，扩展了接处警台账、警单人员、重复线索预警、未成年人违法犯罪、两抢一盗、打击现行等业务管理能力，并提供报表导出与「街面巡防质效」数据大屏。

- 管理端入口：`/index`
- 数据大屏：`/screen`（独立全屏页面，可在新窗口直接打开）
- 默认后端地址：`http://localhost:8080`

## 技术栈

| 分类      | 技术                                                                               |
| --------- | ---------------------------------------------------------------------------------- |
| 基础框架  | RuoYi-Vue3 v3.9.2                                                                  |
| 前端框架  | Vue 3.5                                                                            |
| 构建工具  | Vite 6                                                                             |
| UI 组件库 | Element Plus 2.13、@element-plus/icons-vue、Lucide                                 |
| 状态管理  | Pinia 3                                                                            |
| 路由      | Vue Router 4                                                                       |
| 样式方案  | Tailwind CSS 3.4、Sass                                                             |
| 图表      | vccs 1.0（Vue 版 Recharts）                                                        |
| HTTP 请求 | Axios                                                                              |
| 常用工具  | VueUse、dayjs、file-saver、js-cookie、jsencrypt、fuse.js、SortableJS、vuedraggable |
| 代码规范  | ESLint（@antfu/eslint-config）                                                     |

## 功能模块

### 街面巡防质效大屏

独立路由 `/screen`，面向指挥室 / 值班室的大屏展示场景，数据来源于后端 `/policeScreen/*` 统计接口。

- **筛选条件**：日期时间范围、统计周期（日 / 周 / 月）、基层单位（特警支队下属警务站、市局各分局）
- **数据面板**：
  - 接处警数据（警情 KPI）
  - 接处警趋势变化
  - 战果类数据
  - 抢盗窃数据趋势
  - 网逃数据趋势变化
  - 未成年人数趋势
  - 罪错未成年（红、橙、黄、蓝、黑）分布
  - 警务站排名（接处警 / 追网逃 / 敲打未成年 / 拉车门）
- **交互能力**：折线图 / 柱状图切换、全屏展示、数据刷新、CSV 导出

### 巡防业务

| 模块                 | 代码位置                                           | 主要功能                                                        |
| -------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| 接处警台账           | `src/views/bussiness/policeAlarm`                  | 接处警记录增删改查、Excel 导入、转警导入、导出                  |
| 警单人员信息         | `src/views/bussiness/personInfo`                   | 警单人员维护、批量删除                                          |
| 重复线索预警         | `src/views/bussiness/personInfo/warningPerson.vue` | 重复人员线索预警、警情对比                                      |
| 未成年人违法犯罪统计 | `src/views/bussiness/policeMinorCrime`             | 按分局、统计月份维护未成年人违法犯罪数据                        |
| 两抢一盗发案数统计   | `src/views/bussiness/policeTwoRob`                 | 按分局、统计月份维护两抢一盗发案数据                            |
| 警务站打击现行数据   | `src/views/bussiness/strikeCurrent`                | 打击现行数据增删改查、Excel 导入导出                            |
| 接处警报表           | `src/views/report/alarmReport`                     | 按日期、警务站查询，大队列合并、合计行，导出双层表头 Excel 报表 |
| 打击现行报表         | `src/views/report/strikeCurrentReport`             | 全市警务站打击现行工作数据统计、双层表头报表导出                |

### 系统管理（RuoYi 内置）

包含用户、部门、岗位、菜单、角色、字典、参数、通知公告、操作日志、登录日志、在线用户、定时任务、代码生成、系统接口、服务监控、缓存监控、连接池监视、表单构建等能力，并扩展了「动态映射」模块用于维护来源文本与目标部门的映射规则。

## 目录结构

```text
.
├── src/
│   ├── api/                  # 接口封装（bussiness / report / system / monitor / tool）
│   ├── assets/               # 静态资源、图标、样式
│   ├── components/           # 通用组件（文件上传、Excel 导入、分页、编辑器等）
│   ├── directive/            # 自定义指令（权限、复制等）
│   ├── layout/               # 管理端整体布局
│   ├── plugins/              # 全局插件（下载、缓存等）
│   ├── router/               # 路由配置（/screen 为大屏独立路由）
│   ├── store/                # Pinia 状态管理
│   ├── utils/                # 请求、权限、下载等工具
│   └── views/
│       ├── bussiness/        # 巡防业务模块
│       ├── report/           # 报表模块
│       ├── screen/           # 街面巡防质效大屏
│       ├── system/           # 系统管理
│       ├── monitor/          # 系统监控
│       └── tool/             # 系统工具
├── vite/
│   ├── mocks/                # 大屏本地 Mock 数据
│   └── plugins/              # Vite 插件配置
├── docs/                     # 项目文档
├── public/                   # 公共资源
├── .env.development          # 开发环境变量
├── .env.staging              # 测试环境变量
├── .env.production           # 生产环境变量
├── vite.config.js            # Vite 配置
└── package.json
```

## 快速开始

### 环境要求

- Node.js >= 18（推荐 20 LTS 及以上）
- pnpm >= 9（仓库使用 `pnpm-lock.yaml`）
- 可访问的 RuoYi-Vue 后端服务

### 安装与启动

```bash
# 安装依赖
pnpm install

# 启动开发服务，默认访问 http://localhost:80
pnpm dev
```

开发服务器端口在 `vite.config.js` 的 `server.port` 中配置。开发环境下，`/dev-api` 开头的请求会被代理到 `.env.development` 中的 `VITE_BACKEND_URL`，并在转发时去掉 `/dev-api` 前缀。

```ini
# .env.development
VITE_BACKEND_URL = 'http://localhost:8080'
```

### 本地 Mock 大屏（可选）

后端未就绪时，可在 `.env.development.local` 中开启大屏 Mock：

```ini
VITE_USE_MOCK = 'true'
```

开启后，`vite/mocks/police-dashboard.js` 会拦截 `/policeScreen/*` 与 `/system/dept/listByParentId` 请求并返回模拟数据。修改环境变量后需重启开发服务；该开关仅用于本地开发，生产构建请保持关闭。

### 构建与检查

```bash
# 构建测试环境
pnpm build:stage

# 构建生产环境
pnpm build:prod

# 本地预览构建产物
pnpm preview

# ESLint 检查
pnpm lint
```

构建产物输出到 `dist/`。生产 / 测试环境可根据 `VITE_BUILD_COMPRESS` 额外生成 gzip 压缩文件。

## 环境变量

| 变量                  | 说明                                                               |
| --------------------- | ------------------------------------------------------------------ |
| `VITE_APP_TITLE`      | 系统标题，当前为「数智巡防管理系统」                               |
| `VITE_APP_ENV`        | 环境标识（development / staging / production）                     |
| `VITE_APP_BASE_API`   | 接口请求前缀，开发 `/dev-api`、测试 `/stage-api`、生产 `/prod-api` |
| `VITE_BACKEND_URL`    | 开发服务器代理的后端地址                                           |
| `VITE_USE_MOCK`       | 是否启用大屏 Mock 数据，仅本地开发使用                             |
| `VITE_BUILD_COMPRESS` | 构建压缩方式，支持 gzip、brotli                                    |

## 部署说明

1. 执行 `pnpm build:prod` 生成 `dist/`。
2. 将 `dist/` 部署到 Nginx 等静态服务器。
3. 将 `/prod-api` 反向代理到后端服务，并去除接口前缀。

```nginx
server {
    listen 80;
    server_name example.com;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /prod-api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> 前端路由使用 History 模式，Nginx 需配置 `try_files` 回退到 `index.html`。

## 接口约定

- 登录、权限、菜单、系统管理等沿用 RuoYi-Vue 接口（如 `/login`、`/getInfo`、`/getRouters`）。
- 巡防业务接口按模块分为 `/bussiness/*`、`/police/*`、`/screen/*`。
- 大屏统计接口统一为 `/policeScreen/*`，查询参数使用 `PoliceStatQueryDTO`。
- 文件导入导出沿用 RuoYi 的 Excel 工具与前端下载封装。

## 浏览器支持

建议使用最新版本的 Chrome、Edge 浏览器。大屏建议在 1920 × 1080 及以上分辨率、横屏模式下展示。

