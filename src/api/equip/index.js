import request from '@/utils/request'

/* ==================== 装备系统上下文 ==================== */

// 当前用户装备数据权限/审批权限
export function getEquipScopeInfo() {
  return request({ url: '/equip/scope/info', method: 'get' })
}

// 可选择的单位树
export function getEquipDeptTree() {
  return request({ url: '/equip/scope/deptTree', method: 'get' })
}

// 审批人候选用户
export function getEquipUsers(params) {
  return request({ url: '/equip/scope/users', method: 'get', params })
}

/* ==================== 装备分类 ==================== */

export function listCategory(query) {
  return request({ url: '/equip/category/list', method: 'get', params: query })
}

export function getCategory(categoryId) {
  return request({ url: `/equip/category/${categoryId}`, method: 'get' })
}

export function addCategory(data) {
  return request({ url: '/equip/category', method: 'post', data })
}

export function updateCategory(data) {
  return request({ url: '/equip/category', method: 'put', data })
}

export function delCategory(categoryId) {
  return request({ url: `/equip/category/${categoryId}`, method: 'delete' })
}

/* ==================== 装备档案 ==================== */

export function listItem(query) {
  return request({ url: '/equip/item/list', method: 'get', params: query })
}

export function getItemOptions() {
  return request({ url: '/equip/item/options', method: 'get' })
}

export function getItem(itemId) {
  return request({ url: `/equip/item/${itemId}`, method: 'get' })
}

export function addItem(data) {
  return request({ url: '/equip/item', method: 'post', data })
}

export function updateItem(data) {
  return request({ url: '/equip/item', method: 'put', data })
}

export function delItem(itemIds) {
  return request({ url: `/equip/item/${itemIds}`, method: 'delete' })
}

/* ==================== 库存 ==================== */

export function listStock(query) {
  return request({ url: '/equip/stock/list', method: 'get', params: query })
}

export function listStockFlow(query) {
  return request({ url: '/equip/stock/flow', method: 'get', params: query })
}

export function listStockBatch(query) {
  return request({ url: '/equip/stock/batch', method: 'get', params: query })
}

/* ==================== 入库 ==================== */

export function listInbound(query) {
  return request({ url: '/equip/inbound/list', method: 'get', params: query })
}

export function getInbound(inboundId) {
  return request({ url: `/equip/inbound/${inboundId}`, method: 'get' })
}

export function addInbound(data) {
  return request({ url: '/equip/inbound', method: 'post', data })
}

export function confirmInbound(inboundId) {
  return request({ url: `/equip/inbound/confirm/${inboundId}`, method: 'put' })
}

export function cancelInbound(inboundId) {
  return request({ url: `/equip/inbound/cancel/${inboundId}`, method: 'put' })
}

export function delInbound(inboundIds) {
  return request({ url: `/equip/inbound/${inboundIds}`, method: 'delete' })
}

/* ==================== 出库 ==================== */

export function listOutbound(query) {
  return request({ url: '/equip/outbound/list', method: 'get', params: query })
}

export function getOutbound(outboundId) {
  return request({ url: `/equip/outbound/${outboundId}`, method: 'get' })
}

export function addOutbound(data) {
  return request({ url: '/equip/outbound', method: 'post', data })
}

export function confirmOutbound(outboundId) {
  return request({ url: `/equip/outbound/confirm/${outboundId}`, method: 'put' })
}

export function cancelOutbound(outboundId) {
  return request({ url: `/equip/outbound/cancel/${outboundId}`, method: 'put' })
}

export function delOutbound(outboundIds) {
  return request({ url: `/equip/outbound/${outboundIds}`, method: 'delete' })
}

/* ==================== 领用 ==================== */

export function listRequisition(query) {
  return request({ url: '/equip/requisition/list', method: 'get', params: query })
}

export function getRequisition(requisitionId) {
  return request({ url: `/equip/requisition/${requisitionId}`, method: 'get' })
}

export function addRequisition(data) {
  return request({ url: '/equip/requisition', method: 'post', data })
}

export function approveRequisition(data) {
  return request({ url: '/equip/requisition/approve', method: 'put', data })
}

export function rejectRequisition(data) {
  return request({ url: '/equip/requisition/reject', method: 'put', data })
}

export function receiveRequisition(requisitionId) {
  return request({ url: `/equip/requisition/receive/${requisitionId}`, method: 'put' })
}

export function cancelRequisition(requisitionId) {
  return request({ url: `/equip/requisition/cancel/${requisitionId}`, method: 'put' })
}

export function delRequisition(requisitionIds) {
  return request({ url: `/equip/requisition/${requisitionIds}`, method: 'delete' })
}

/* ==================== 借用 ==================== */

export function listLoan(query) {
  return request({ url: '/equip/loan/list', method: 'get', params: query })
}

export function getLoan(loanId) {
  return request({ url: `/equip/loan/${loanId}`, method: 'get' })
}

export function addLoan(data) {
  return request({ url: '/equip/loan', method: 'post', data })
}

export function approveLoan(data) {
  return request({ url: '/equip/loan/approve', method: 'put', data })
}

export function rejectLoan(data) {
  return request({ url: '/equip/loan/reject', method: 'put', data })
}

export function issueLoan(loanId) {
  return request({ url: `/equip/loan/issue/${loanId}`, method: 'put' })
}

export function returnLoan(data) {
  return request({ url: '/equip/loan/return', method: 'post', data })
}

export function renewLoan(data) {
  return request({ url: '/equip/loan/renew', method: 'put', data })
}

export function cancelLoan(loanId) {
  return request({ url: `/equip/loan/cancel/${loanId}`, method: 'put' })
}

export function delLoan(loanIds) {
  return request({ url: `/equip/loan/${loanIds}`, method: 'delete' })
}

/* ==================== 审批人配置 ==================== */

export function listApprover(query) {
  return request({ url: '/equip/approver/list', method: 'get', params: query })
}

export function addApprover(data) {
  return request({ url: '/equip/approver', method: 'post', data })
}

export function delApprover(approverIds) {
  return request({ url: `/equip/approver/${approverIds}`, method: 'delete' })
}

/* ==================== 站内消息 ==================== */

export function listMessage(query) {
  return request({ url: '/equip/message/list', method: 'get', params: query })
}

export function getUnreadCount() {
  return request({ url: '/equip/message/unreadCount', method: 'get' })
}

export function readMessage(msgId) {
  return request({ url: `/equip/message/read/${msgId}`, method: 'put' })
}

export function readAllMessage() {
  return request({ url: '/equip/message/readAll', method: 'put' })
}

export function delMessage(msgIds) {
  return request({ url: `/equip/message/${msgIds}`, method: 'delete' })
}

/* ==================== 统计 ==================== */

export function getStatOverview() {
  return request({ url: '/equip/stat/overview', method: 'get' })
}

export function getStatAll(params) {
  return request({ url: '/equip/stat/all', method: 'get', params })
}

export function getStatByCategory() {
  return request({ url: '/equip/stat/category', method: 'get' })
}

export function getStatByDept() {
  return request({ url: '/equip/stat/dept', method: 'get' })
}

export function getStatByItem() {
  return request({ url: '/equip/stat/item', method: 'get' })
}

/* ==================== 预警 ==================== */

export function getWarningSummary(days) {
  return request({ url: '/equip/warning/summary', method: 'get', params: { days } })
}

export function getWarningList(days) {
  return request({ url: '/equip/warning/list', method: 'get', params: { days } })
}

export function refreshWarning() {
  return request({ url: '/equip/warning/refresh', method: 'post' })
}
