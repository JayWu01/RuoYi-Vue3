import request from '@/utils/request'

/**
 * 映射分组接口
 */
// 查询分组列表
export function listMappingGroup(query) {
    return request({
        url: '/mapping/group/list',
        method: 'get',
        params: query
    })
}

// 新增分组
export function addMappingGroup(data) {
    return request({
        url: '/mapping/group',
        method: 'post',
        data: data
    })
}

// 修改分组
export function updateMappingGroup(data) {
    return request({
        url: '/mapping/group',
        method: 'put',
        data: data
    })
}

// 删除分组
export function delMappingGroup(ids) {
    return request({
        url: `/mapping/group/${ids}`,
        method: 'delete'
    })
}

/**
 * 映射规则接口
 */
// 查询映射规则列表
export function listMappingRule(query) {
    return request({
        url: '/mapping/rule/list',
        method: 'get',
        params: query
    })
}

// 新增映射规则
export function addMappingRule(data) {
    return request({
        url: '/mapping/rule',
        method: 'post',
        data: data
    })
}

// 修改映射规则
export function updateMappingRule(data) {
    return request({
        url: '/mapping/rule',
        method: 'put',
        data: data
    })
}

// 删除映射规则
export function delMappingRule(ids) {
    return request({
        url: `/mapping/rule/${ids}`,
        method: 'delete'
    })
}
