// 接处警统计报表 api
import request from '@/utils/request'

// 查询接处警报表列表
export function getAlarmReportList(query) {
  return request({
    url: '/police/alarmReport/list',
    method: 'get',
    params: query
  })
}

// 导出，不要加 responseType: 'blob' 以外的处理，与 strikeCurrentReport 保持一致
export function exportAlarmReport(params) {
  return request({
    url: '/police/alarmReport/export',
    method: 'get',
    params: params,
    responseType: 'blob'
  })
}

// 特警支队下属单位（ parentId=101 ，返回该子树下的叶子警务站列表 ）
export function getAlarmUnitOptions() {
  return request({
    url: '/system/dept/listByParentId',
    method: 'get',
    params: { parentId: 101 }
  }).then(response => response.data)
}
