import request from '@/utils/request'
import {
  getAlarmKpi as requestAlarmKpi,
  getAlarmTrend as requestAlarmTrend,
  getFugitiveTrend as requestFugitiveTrend,
  getJuvenileTrend as requestJuvenileTrend,
  getMinorPie as requestMinorPie,
  getResultKpi as requestResultKpi,
  getTwoRob as requestUnitRank
} from './generated/services/general'

/** @typedef {import('./generated/components').PoliceStatQueryDTO} PoliceStatQueryDTO */

/**
 * 获取警情卡片数据。
 * @param {PoliceStatQueryDTO} params 查询条件
 * @returns {ReturnType<typeof requestAlarmKpi>} 警情卡片数据
 */
export function getAlarmKpi(params) {
  return requestAlarmKpi({ data: params })
}

/**
 * 获取战果类卡片数据。
 * @param {PoliceStatQueryDTO} params 查询条件
 * @returns {ReturnType<typeof requestResultKpi>} 战果类卡片数据
 */
export function getResultKpi(params) {
  return requestResultKpi({ data: params })
}

/**
 * 获取未成年罪错饼图数据。
 * @param {PoliceStatQueryDTO} params 查询条件
 * @returns {ReturnType<typeof requestMinorPie>} 饼图数据
 */
export function getMinorPie(params) {
  return requestMinorPie({ data: params })
}

/**
 * 获取网逃抓捕趋势数据。
 * @param {PoliceStatQueryDTO} params 查询条件
 * @returns {ReturnType<typeof requestFugitiveTrend>} 趋势数据
 */
export function getFugitiveTrend(params) {
  return requestFugitiveTrend({ data: params })
}

/**
 * 获取警情趋势数据。
 * @param {PoliceStatQueryDTO} params 查询条件
 * @returns {ReturnType<typeof requestAlarmTrend>} 趋势数据
 */
export function getAlarmTrend(params) {
  return requestAlarmTrend({ data: params })
}

/**
 * 获取两抢一盗案件趋势数据。
 * @param {PoliceStatQueryDTO} params 查询条件
 * @returns {ReturnType<typeof requestTwoRob>} 趋势数据
 */
// export function getTwoRob(params) {
//   return requestTwoRob({ data: params })
// }
/**
 * 获取两抢一盗案件趋势数据。
 * @param {PoliceStatQueryDTO} params 查询条件
 * @returns {ReturnType<typeof requestTwoRob>} 趋势数据
 */
export function getTwoRob(params) {
  return requestUnitRank({ data: params })
}

/**
 * 获取未成年罪错趋势数据。
 * @param {PoliceStatQueryDTO} params 查询条件
 * @returns {ReturnType<typeof requestJuvenileTrend>} 趋势数据
 */
export function getJuvenileTrend(params) {
  return requestJuvenileTrend({ data: params })
}

/**
 * 获取警务站排名数据（接处警 / 追网逃 / 敲打未成年 / 拉车门）。
 * @param {PoliceStatQueryDTO & { rankType: string }} params 查询条件，rankType 决定统计维度
 * @returns {Promise<{ yAxis: string[], series: number[] }>} 排名数据
 */
export function getRankList(params) {
  return request({
    url: '/policeScreen/getRankList',
    method: 'post',
    data: params
  }).then(response => response.data)
}

/**
 * 获取单位选项。
 * @param {{ parentId: number }} params 父级单位 ID
 * @returns {Promise<Array<{ deptId: string | number, deptName: string }>>} 单位列表
 */
export function getUnitOptions(params) {
  return request({
    url: '/system/dept/listByParentId',
    method: 'get',
    params
  }).then(response => response.data)
}
