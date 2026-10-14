// api/police/strikeReport.js 修正后
import request from '@/utils/request'

// 查询打击报表列表
export function getStrikeReportList(query) {
    return request({
        url: '/police/strikeReport/list',
        method: 'get',
        params: query
    })
}

// 导出，不要加 responseType: 'blob'
export function exportStrikeReport(params) {
    return request({
        url: '/police/strikeReport/export',
        method: 'get',
        params: params,
        responseType: 'blob'
    })
}
