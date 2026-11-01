import { reactive } from 'vue'
import { getEquipDeptTree, getEquipScopeInfo, getItemOptions } from '@/api/equip'

/**
 * 装备系统全局上下文（独立系统的轻量状态，不写入主系统 store）
 */
export const equipCtx = reactive({
  scope: {
    userId: null,
    userName: '',
    deptId: null,
    deptName: '',
    all: false,
    hqDeptId: null,
    hqDeptName: '',
    approver: false
  },
  unread: 0,
  deptTree: [],
  items: [],
  loaded: false
})

let loading = null

/** 加载上下文（单位树、装备选项、权限） */
export function loadEquipCtx(force = false) {
  if (equipCtx.loaded && !force) {
    return Promise.resolve(equipCtx)
  }
  if (loading) {
    return loading
  }
  loading = Promise.all([getEquipScopeInfo(), getEquipDeptTree(), getItemOptions()])
    .then(([infoRes, treeRes, itemRes]) => {
      equipCtx.scope = infoRes.data?.scope || {}
      equipCtx.unread = infoRes.data?.unreadCount || 0
      equipCtx.deptTree = treeRes.data?.trees || []
      equipCtx.items = itemRes.data || []
      equipCtx.loaded = true
      return equipCtx
    })
    .finally(() => {
      loading = null
    })
  return loading
}

/** 刷新未读消息数 */
export function setUnread(count) {
  equipCtx.unread = typeof count === 'number' ? count : equipCtx.unread
}

/** 按ID取装备 */
export function findItem(itemId) {
  return equipCtx.items.find(i => i.itemId === itemId)
}

/** 按单位ID取单位名称 */
export function findDeptName(deptId) {
  const walk = (list) => {
    for (const node of list || []) {
      if (node.id === deptId) {
        return node.label
      }
      const hit = walk(node.children)
      if (hit) {
        return hit
      }
    }
    return ''
  }
  return walk(equipCtx.deptTree)
}

/** 默认单位（当前用户部门） */
export function defaultDeptId() {
  return equipCtx.scope.deptId || equipCtx.scope.hqDeptId
}
