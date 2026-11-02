<script setup>
import {
  Bell,
  Boxes,
  ChartColumn,
  ClipboardList,
  FolderTree,
  Gauge,
  LogOut,
  Maximize,
  Minimize,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Warehouse
} from '@lucide/vue'
import { useFullscreen } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUnreadCount } from '@/api/equip'
import auth from '@/plugins/auth'
import { equipCtx, loadEquipCtx, setUnread } from '../context'
import '@/assets/styles/equip.css'

const route = useRoute()
const router = useRouter()
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

/** 侧边导航：独立系统的固定菜单，按权限过滤 */
const menus = [
  {
    group: '总览',
    children: [{ title: '指挥工作台', path: '/warehouse/home', icon: Gauge }]
  },
  {
    group: '装备管理',
    children: [
      { title: '装备档案', path: '/warehouse/item', icon: Boxes, perm: 'equip:item:list' },
      { title: '装备分类', path: '/warehouse/category', icon: FolderTree, perm: 'equip:category:list' }
    ]
  },
  {
    group: '库存管理',
    children: [{ title: '库存总览', path: '/warehouse/stock', icon: Warehouse, perm: 'equip:stock:list' }]
  },
  {
    group: '出入库管理',
    children: [
      { title: '装备入库', path: '/warehouse/inbound', icon: PackagePlus, perm: 'equip:inbound:list' },
      { title: '装备出库', path: '/warehouse/outbound', icon: PackageMinus, perm: 'equip:outbound:list' }
    ]
  },
  {
    group: '领用与借用',
    children: [
      { title: '装备领用', path: '/warehouse/requisition', icon: ClipboardList, perm: 'equip:requisition:list' },
      { title: '装备借用', path: '/warehouse/loan', icon: PackageCheck, perm: 'equip:loan:list' },
      { title: '审批中心', path: '/warehouse/approval', icon: ShieldCheck, perm: 'equip:requisition:list' }
    ]
  },
  {
    group: '统计与预警',
    children: [
      { title: '统计报表', path: '/warehouse/stat', icon: ChartColumn, perm: 'equip:stat:list' },
      { title: '预警中心', path: '/warehouse/warning', icon: TriangleAlert, perm: 'equip:warning:list' }
    ]
  },
  {
    group: '系统',
    children: [
      { title: '消息中心', path: '/warehouse/message', icon: Bell, perm: 'equip:message:list' },
      { title: '审批人配置', path: '/warehouse/approver', icon: Settings, perm: 'equip:approver:list' }
    ]
  }
]

const visibleMenus = computed(() =>
  menus
    .map(group => ({
      ...group,
      children: group.children.filter(item => !item.perm || auth.hasPermi(item.perm))
    }))
    .filter(group => group.children.length > 0)
)

const pageTitle = computed(() => route.meta?.title || '警用装备仓库管理系统')

/* ---------- 界面缩放（0.8 ~ 1，存本地，下次进入沿用） ---------- */
const ZOOM_KEY = 'equip.ui.zoom'
const ZOOM_LIST = [0.8, 0.85, 0.9, 0.95, 1]
const savedZoom = Number(localStorage.getItem(ZOOM_KEY))
const zoom = ref(ZOOM_LIST.includes(savedZoom) ? savedZoom : 0.9)

function setZoomVar(value) {
  document.body.style.setProperty('--equip-zoom', String(value))
}

function onZoomChange(value) {
  setZoomVar(value)
  localStorage.setItem(ZOOM_KEY, String(value))
}

const scope = computed(() => equipCtx.scope)
const roleText = computed(() => {
  if (scope.value.all) {
    return '支队装备管理员'
  }
  return scope.value.approver ? '装备审批人' : '单位装备管理员'
})

const now = ref('')
let timer = null
function tick() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  now.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function go(path) {
  if (route.path !== path) {
    router.push(path)
  }
}

function backToMain() {
  if (window.opener) {
    window.close()
    setTimeout(() => {
      window.location.href = '/index'
    }, 300)
  } else {
    window.location.href = '/index'
  }
}

async function refreshUnread() {
  try {
    const res = await getUnreadCount()
    setUnread(res.data || 0)
  } catch {
    // 忽略未读统计异常，不影响主流程
  }
}

async function boot() {
  document.body.classList.add('equip-theme')
  setZoomVar(zoom.value)
  tick()
  timer = setInterval(tick, 1000)
  try {
    await loadEquipCtx(true)
    await refreshUnread()
  } catch {
    ElMessage.error('装备系统初始化失败，请检查参数 equip.hq.deptId 与数据库配置')
  }
}

onMounted(boot)

onBeforeUnmount(() => {
  document.body.classList.remove('equip-theme')
  document.body.style.removeProperty('--equip-zoom')
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="equip-shell">
    <!-- 左侧导航 -->
    <aside class="equip-shell__aside">
      <div class="equip-shell__brand">
        <div class="equip-shell__brand-mark">
          <ShieldCheck :size="18" />
        </div>
        <div class="equip-shell__brand-text">
          <strong>警用装备仓库</strong>
        </div>
      </div>

      <nav class="equip-shell__nav">
        <template v-for="group in visibleMenus" :key="group.group">
          <div class="equip-shell__group">
            {{ group.group }}
          </div>
          <a
            v-for="item in group.children"
            :key="item.path"
            class="equip-nav-item"
            :class="{ 'is-active': route.path === item.path }"
            @click="go(item.path)"
          >
            <component :is="item.icon" :size="16" />
            <span>{{ item.title }}</span>
            <span v-if="item.path === '/warehouse/message' && equipCtx.unread > 0" class="equip-nav-item__badge">
              {{ equipCtx.unread > 99 ? '99+' : equipCtx.unread }}
            </span>
          </a>
        </template>
      </nav>

      <div class="equip-shell__aside-foot">
        <div>数据权限：{{ scope.all ? '全局（支队）' : '本单位及下属' }}</div>
        <div>总仓库：{{ scope.hqDeptName || '-' }}</div>
      </div>
    </aside>

    <!-- 右侧主体 -->
    <div class="equip-shell__body">
      <header class="equip-shell__header">
        <div>
          <div class="equip-shell__title">
            {{ pageTitle }}
          </div>
          <div class="equip-shell__crumb">
            警用装备仓库管理系统 / {{ pageTitle }}
          </div>
        </div>
        <div class="ml-auto flex items-center gap-4 text-[12px] text-[#93a9bd]">
          <span class="hidden md:inline">{{ now }}</span>
          <button class="equip-header-btn" title="消息" @click="go('/warehouse/message')">
            <Bell :size="16" />
            <span v-if="equipCtx.unread > 0" class="equip-header-dot">{{ equipCtx.unread > 99 ? '99+' : equipCtx.unread }}</span>
          </button>
          <button class="equip-header-btn" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
            <component :is="isFullscreen ? Minimize : Maximize" :size="16" />
          </button>
          <el-select
            v-model="zoom"
            class="equip-zoom-select"
            size="small"
            title="界面缩放"
            style="width: 82px"
            @change="onZoomChange"
          >
            <el-option v-for="z in ZOOM_LIST" :key="z" :label="`${Math.round(z * 100)}%`" :value="z" />
          </el-select>
          <div class="flex items-center gap-2 text-[#d8e9f6]">
            <span class="equip-header-avatar">{{ (scope.userName || '警').slice(0, 1) }}</span>
            <span>
              <span class="block leading-4">{{ scope.userName || '-' }}</span>
              <span class="block text-[11px] leading-4 text-[#6fa8ce]">{{ roleText }}</span>
            </span>
          </div>
          <button class="equip-header-btn equip-header-btn--text" title="返回主系统" @click="backToMain">
            <LogOut :size="15" />
            主系统
          </button>
        </div>
      </header>

      <main class="equip-shell__main">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.equip-header-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 9px;
  border-radius: 4px;
  border: 1px solid rgba(20, 106, 170, 0.5);
  background: #061b34;
  color: #c3d6e6;
  cursor: pointer;
  transition: all 0.18s ease;
}

.equip-header-btn:hover {
  border-color: #20b5f1;
  color: #ffffff;
}

.equip-header-btn--text {
  font-size: 12px;
}

.equip-zoom-select :deep(.el-select__wrapper) {
  min-height: 30px;
  height: 30px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #061b34;
  box-shadow: 0 0 0 1px rgba(20, 106, 170, 0.5) inset;
}

.equip-header-dot {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  color: #03101f;
  background: #f5a622;
}

.equip-header-avatar {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 13px;
  color: #03101f;
  background: linear-gradient(135deg, #20b5f1, #0d6fb0);
}
</style>
