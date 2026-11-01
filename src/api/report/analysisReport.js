// 数据统计话术 api
import request from '@/utils/request'

// 查询数据统计话术（本期量/前期量/环比量/环比率 + 各块话术）
export function getAnalysisReport(query) {
  return request({
    url: '/police/analysisReport/get',
    method: 'get',
    params: query
  })
}
