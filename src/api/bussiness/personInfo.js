import request from '@/utils/request'

// 查询警单人员信息列表
export function listPersonInfo(query) {
    return request({
        url: '/screen/personInfo/list',
        method: 'get',
        params: query
    })
}

// 查询警单人员信息详细
export function getPersonInfo(rowId) {
    return request({
        url: '/screen/personInfo/' + rowId,
        method: 'get'
    })
}

// 新增警单人员信息
export function addPersonInfo(data) {
    return request({
        url: '/screen/personInfo',
        method: 'post',
        data: data
    })
}

// 修改警单人员信息
export function updatePersonInfo(data) {
    return request({
        url: '/screen/personInfo',
        method: 'put',
        data: data
    })
}

// 删除警单人员信息
export function delPersonInfo(rowIds) {
    return request({
        url: '/screen/personInfo/' + rowIds,
        method: 'delete'
    })
}

// 放在原有api文件末尾
// 查询重复人员列表
export function getDuplicateList(params) {
    return request({
        url: '/screen/personInfo/duplicateList',
        method: 'get',
        params: params
    })
}

// 获取重复线索预警列表
export function getPersonWarningList(query) {
    return request({
        url: '/screen/personInfo/warninglist',
        method: 'get',
        params: query
    })
}

