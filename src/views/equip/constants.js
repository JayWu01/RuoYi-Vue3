/** 装备系统业务字典（与后端 EquipConstants 保持一致） */

export const INBOUND_STATUS = {
  0: { label: '待确认', type: 'warn' },
  1: { label: '已入库', type: 'success' },
  2: { label: '已作废', type: 'danger' }
}

export const OUTBOUND_STATUS = {
  0: { label: '待确认', type: 'warn' },
  1: { label: '已出库', type: 'success' },
  2: { label: '已作废', type: 'danger' }
}

export const REQ_STATUS = {
  0: { label: '待审批', type: 'warn' },
  1: { label: '待领取', type: 'info' },
  2: { label: '已领取', type: 'success' },
  3: { label: '已驳回', type: 'danger' },
  4: { label: '已取消', type: 'info' }
}

export const LOAN_STATUS = {
  0: { label: '待审批', type: 'warn' },
  1: { label: '待发放', type: 'info' },
  2: { label: '借用中', type: 'info' },
  3: { label: '已归还', type: 'success' },
  4: { label: '已驳回', type: 'danger' },
  5: { label: '已取消', type: 'info' }
}

export const BIZ_TYPE = {
  INBOUND: '装备入库',
  OUTBOUND: '装备出库',
  REQUISITION: '装备领用',
  LOAN: '借用发放',
  RETURN: '借用归还',
  LOST: '装备遗失',
  DAMAGED: '装备损坏'
}

export const MSG_TYPE = {
  REQUISITION_APPLY: '领用待审批',
  LOAN_APPLY: '借用待审批',
  APPROVE_PASS: '审批通过',
  APPROVE_REJECT: '审批驳回',
  LOAN_DUE: '借用即将到期',
  LOAN_OVERDUE: '借用已逾期',
  ITEM_EXPIRE: '装备有效期预警',
  ITEM_ROTATE: '装备轮换提醒'
}

/** 解析状态文案 */
export function statusLabel(map, value) {
  const hit = map[value]
  return hit ? hit.label : value || '-'
}

/** 解析状态颜色 */
export function statusType(map, value) {
  const hit = map[value]
  return hit ? hit.type : 'info'
}

/** 是否逾期借用 */
export function isOverdue(row) {
  return row?.status === '2' && row?.overdueDays > 0
}

/** 配件文案：'充电器:1,充电线:1' -> '充电器×1，充电线×1' */
export function partsText(partsInfo) {
  if (!partsInfo) {
    return '-'
  }
  return partsInfo
    .split(',')
    .filter(Boolean)
    .map((item) => {
      const [name, qty] = item.split(':')
      return qty ? `${name}×${qty}` : name
    })
    .join('，')
}
