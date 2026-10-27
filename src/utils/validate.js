/**
 * 路径匹配器
 * @param {string} pattern
 * @param {string} path
 * @returns {boolean}
 */
export function isPathMatch(pattern, path) {
  const regexPattern = pattern
    .replace(/([.+^${}()|[\]\\])/g, '\\$1')
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DOUBLE_STAR__/g, '.*')
    .replace(/\?/g, '[^/]')
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(path)
}

/**
 * 判断value字符串是否为空
 * @param {string} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value == null || value == '' || value == undefined || value == 'undefined') {
    return true
  }
  return false
}

/**
 * 判断url是否是http或https
 * @param {string} url
 * @returns {boolean}
 */
export function isHttp(url) {
  return url.includes('http://') || url.includes('https://')
}

/**
 * 判断path是否为外链
 * @param {string} path
 * @returns {boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.includes(str.trim())
}

/**
 * @param {string} url
 * @returns {boolean}
 */
export function validURL(url) {
  const reg
    = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d?)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:\d+)*(\/($|[\w.,?'\\+&%$#=~-]+))*$/
  return reg.test(url)
}

/**
 * @param {string} str
 * @returns {boolean}
 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {boolean}
 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {boolean}
 */
export function validAlphabets(str) {
  const reg = /^[A-Z]+$/i
  return reg.test(str)
}

/**
 * @param {string} email
 * @returns {boolean}
 */
export function validEmail(email) {
  const reg
    = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i
  return reg.test(email)
}

/**
 * @param {string} str
 * @returns {boolean}
 */
export function isString(str) {
  return typeof str === 'string' || str instanceof String
}

/**
 * 身份证严格校验（18/15位，18位校验末位校验码）
 * 不做 trim：含空白字符（空格、全角空格、制表符等）一律判为不合法，
 * 防止“首尾空格被静默裁掉后入库”的脏数据问题。
 * @param {string} idCard
 * @returns {boolean}
 */
export function validIdCard(idCard) {
  if (typeof idCard !== 'string' || !idCard) {
    return false
  }
  const reg18 = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i
  const reg15 = /^[1-9]\d{7}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}$/
  if (!reg18.test(idCard) && !reg15.test(idCard)) {
    return false
  }
  if (idCard.length === 18) {
    const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCode = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(idCard[i]) * weight[i]
    }
    return checkCode[sum % 11] === idCard[17].toUpperCase()
  }
  return true
}

/**
 * 身份证校验，返回错误提示文案；校验通过返回空字符串
 * @param {string} idCard
 * @returns {string}
 */
export function getIdCardError(idCard) {
  if (typeof idCard !== 'string' || idCard === '') {
    return '身份证不能为空'
  }
  if (/\s/.test(idCard)) {
    return '身份证不应包含空格'
  }
  if (!validIdCard(idCard)) {
    return '身份证格式不正确'
  }
  return ''
}

/**
 * @param {Array} arg
 * @returns {boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}
