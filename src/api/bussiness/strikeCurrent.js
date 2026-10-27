import request from '@/utils/request'

export function listStrikeCurrent(query) {
  return request({
    url: '/police/strikeCurrent/list',
    method: 'get',
    params: query
  })
}

export function getStrikeCurrent(id) {
  return request({
    url: '/police/strikeCurrent/' + id,
    method: 'get'
  })
}

export function addStrikeCurrent(data) {
  return request({
    url: '/police/strikeCurrent',
    method: 'post',
    data: data
  })
}

export function updateStrikeCurrent(data) {
  return request({
    url: '/police/strikeCurrent',
    method: 'put',
    data: data
  })
}

export function delStrikeCurrent(ids) {
  return request({
    url: '/police/strikeCurrent/' + ids,
    method: 'delete'
  })
}

/**
 * 当前登录用户的数据归属部门（新增页面回显单位用）
 * 返回 { deptId, deptName, admin }
 */
export function getCurrentDept() {
  return request({
    url: '/police/strikeCurrent/currentDept',
    method: 'get'
  })
}

/**
 * 导出
 * @param {object} params
 */
export function exportStrikeCurrent(params) {
  return request({
    url: '/police/strikeCurrent/export',
    method: 'get',
    params,
    responseType: 'blob'// 必须加，否则二进制乱码
  })
}
