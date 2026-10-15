import type { AxiosRequestConfig } from 'axios';
import type * as ComponentTypes from '../components';

type getTwoRobResponse = {
  /**
   * 未成年犯罪月度统计列表
   */

  data: Array<{
    /**
     * 统计月份 例：2026.8
     */

    statDate?: string;
    /**
     * 两抢一盗案件数
     */

    monthTotal?: number;
  }>;
};
type getTwoRobExtraConfig = Omit<AxiosRequestConfig, 'data' | 'params'> & {
  data: ComponentTypes.PoliceStatQueryDTO;
};
/**
 * ---
 *
 * [POST] 抢盗窃案件趋势
 *
 * **path:** /policeScreen/getTwoRob
 *
 * ---
 *
 * **RequestBody**
 * ```ts
 * type RequestBody = {
 *   startDate?: string
 *   endDate?: string
 *   // 单位名称，全部单位传"全部单位"
 *   deptName?: string
 *   // 单位id，全部单位传"全部单位"
 *   deptId?: string
 *   // 统计类型 day:日 week:周 month:月
 *   statType?: string
 * }
 * ```
 *
 * ---
 *
 * **Response**
 * ```ts
 * type Response = {
 *   // 未成年犯罪月度统计列表
 *   // [items] start
 *   // [items] end
 *   data: Array<{
 *     // 统计月份 例：2026.8
 *     statDate?: string
 *     // 两抢一盗案件数
 *     monthTotal?: number
 *   }>
 * }
 * ```
 *
 */
export declare function getTwoRob(config: getTwoRobExtraConfig): Promise<getTwoRobResponse>;

type getJuvenileTrendResponse = {
  /**
   * 未成年犯罪月度统计列表
   */

  data?: Array<{
    /**
     * 统计月份 例：2026.8
     */

    statDate?: string;
    /**
     * 未成年犯罪案件数
     */

    minorCaseCount?: number;
    /**
     * 涉未成年人数
     */

    minorPerson?: number;
  }>;
};
type getJuvenileTrendExtraConfig = Omit<AxiosRequestConfig, 'data' | 'params'> & {
  data: ComponentTypes.PoliceStatQueryDTO;
};
/**
 * ---
 *
 * [POST] 获取未成年罪错趋势折线图
 *
 * **path:** /policeScreen/getJuvenileTrend
 *
 * ---
 *
 * **RequestBody**
 * ```ts
 * type RequestBody = {
 *   startDate?: string
 *   endDate?: string
 *   // 单位名称，全部单位传"全部单位"
 *   deptName?: string
 *   // 单位id，全部单位传"全部单位"
 *   deptId?: string
 *   // 统计类型 day:日 week:周 month:月
 *   statType?: string
 * }
 * ```
 *
 * ---
 *
 * **Response**
 * ```ts
 * type Response = {
 *   // 未成年犯罪月度统计列表
 *   // [items] start
 *   // [items] end
 *   data?: Array<{
 *     // 统计月份 例：2026.8
 *     statDate?: string
 *     // 未成年犯罪案件数
 *     minorCaseCount?: number
 *     // 涉未成年人数
 *     minorPerson?: number
 *   }>
 * }
 * ```
 *
 */
export declare function getJuvenileTrend(config: getJuvenileTrendExtraConfig): Promise<getJuvenileTrendResponse>;

type getAlarmKpiResponse = {
  /**
   * 主键ID
   */

  id?: number;
  /**
   * 有无效
   */

  isValid?: number;
  /**
   * 处理状态
   */

  handleStatus?: string;
  /**
   * 接警类型
   */

  alarmType?: string;
  /**
   * 警单编号
   */

  receiveAlarmNo?: string;
  /**
   * 接警时间
   */

  alarmTime?: string;
  /**
   * 事发地址
   */

  incidentAddress?: string;
  /**
   * 报警内容
   */

  alarmContent?: string;
  /**
   * 报警人名称
   */

  alarmPersonName?: string;
  /**
   * 报警电话
   */

  alarmPhone?: string;
  /**
   * 警情类别
   */

  policeCategory?: string;
  /**
   * 警情类型
   */

  policeType?: string;
  /**
   * 警情细类
   */

  policeDetailType?: string;
  /**
   * 警情子类
   */

  policeSubType?: string;
  /**
   * 接警员
   */

  receivePoliceOfficer?: string;
  /**
   * 管辖单位
   */

  jurisdictionUnit?: string;
  /**
   * 处警单位
   */

  disposeUnit?: string;
  /**
   * 出警民警
   */

  outPoliceOfficer?: string;
  /**
   * 处置时间
   */

  disposeTime?: string;
  /**
   * 到场时间
   */

  arriveTime?: string;
  /**
   * 现场反馈
   */

  siteFeedback?: string;
  /**
   * 反馈时间
   */

  feedbackTime?: string;
  /**
   * 反馈类别
   */

  feedbackCategory?: string;
  /**
   * 反馈类型
   */

  feedbackType?: string;
  /**
   * 反馈细类
   */

  feedbackDetailType?: string;
  /**
   * 反馈子类
   */

  feedbackSubType?: string;
  /**
   * 反馈内容
   */

  feedbackContent?: string;
  /**
   * 处理结果
   */

  disposeResult?: string;
  /**
   * 属地村社
   */

  villageCommunity?: string;
  /**
   * 所属中队代码
   */

  squadCode?: string;
  /**
   * 所属中队名称
   */

  squadName?: string;
  /**
   * 事发路段
   */

  incidentRoad?: string;
  /**
   * 自动定位
   */

  autoLocation?: string;
  /**
   * 手动定位
   */

  manualLocation?: string;
  /**
   * 移动App定位
   */

  appLocation?: string;
  /**
   * 自接警 0否 1是
   */

  selfReceiveAlarm?: number;
  /**
   * 是否回访 0否 1是
   */

  isReturnVisit?: number;
  /**
   * 总警情数量
   */

  totalAlarm?: number;
  /**
   * 总警情环比百分比，带正负号，例 "+18%" "-5%"
   */

  totalAlarmRatio?: string;
  /**
   * 本级自接警情数量
   */

  selfAlarm?: number;
  /**
   * 本级自接警情环比百分比，带正负号，例 "+18%" "-5%"
   */

  selfAlarmRatio?: string;
  /**
   * 流转移交警情数量
   */

  transferAlarm?: number;
  /**
   * 流转移交警情环比百分比，带正负号，例 "+18%" "-5%"
   */

  transferAlarmRatio?: string;
  /**
   * 110派警次数
   */

  policeDispatch?: number;
  /**
   * 110派警环比百分比，带正负号，例 "+18%" "-5%"
   */

  policeDispatchRatio?: string;
};
type getAlarmKpiExtraConfig = Omit<AxiosRequestConfig, 'data' | 'params'> & {
  data: ComponentTypes.PoliceStatQueryDTO;
};
/**
 * ---
 *
 * [POST] 获取警情卡片数据
 *
 * **path:** /policeScreen/getAlarmKpi
 *
 * ---
 *
 * **RequestBody**
 * ```ts
 * type RequestBody = {
 *   startDate?: string
 *   endDate?: string
 *   // 单位名称，全部单位传"全部单位"
 *   deptName?: string
 *   // 单位id，全部单位传"全部单位"
 *   deptId?: string
 *   // 统计类型 day:日 week:周 month:月
 *   statType?: string
 * }
 * ```
 *
 * ---
 *
 * **Response**
 * ```ts
 * type Response = {
 *   // 主键ID
 *   id?: number
 *   // 有无效
 *   isValid?: number
 *   // 处理状态
 *   handleStatus?: string
 *   // 接警类型
 *   alarmType?: string
 *   // 警单编号
 *   receiveAlarmNo?: string
 *   // 接警时间
 *   alarmTime?: string
 *   // 事发地址
 *   incidentAddress?: string
 *   // 报警内容
 *   alarmContent?: string
 *   // 报警人名称
 *   alarmPersonName?: string
 *   // 报警电话
 *   alarmPhone?: string
 *   // 警情类别
 *   policeCategory?: string
 *   // 警情类型
 *   policeType?: string
 *   // 警情细类
 *   policeDetailType?: string
 *   // 警情子类
 *   policeSubType?: string
 *   // 接警员
 *   receivePoliceOfficer?: string
 *   // 管辖单位
 *   jurisdictionUnit?: string
 *   // 处警单位
 *   disposeUnit?: string
 *   // 出警民警
 *   outPoliceOfficer?: string
 *   // 处置时间
 *   disposeTime?: string
 *   // 到场时间
 *   arriveTime?: string
 *   // 现场反馈
 *   siteFeedback?: string
 *   // 反馈时间
 *   feedbackTime?: string
 *   // 反馈类别
 *   feedbackCategory?: string
 *   // 反馈类型
 *   feedbackType?: string
 *   // 反馈细类
 *   feedbackDetailType?: string
 *   // 反馈子类
 *   feedbackSubType?: string
 *   // 反馈内容
 *   feedbackContent?: string
 *   // 处理结果
 *   disposeResult?: string
 *   // 属地村社
 *   villageCommunity?: string
 *   // 所属中队代码
 *   squadCode?: string
 *   // 所属中队名称
 *   squadName?: string
 *   // 事发路段
 *   incidentRoad?: string
 *   // 自动定位
 *   autoLocation?: string
 *   // 手动定位
 *   manualLocation?: string
 *   // 移动App定位
 *   appLocation?: string
 *   // 自接警 0否 1是
 *   selfReceiveAlarm?: number
 *   // 是否回访 0否 1是
 *   isReturnVisit?: number
 *   // 总警情数量
 *   totalAlarm?: number
 *   // 总警情环比百分比，带正负号，例 "+18%" "-5%"
 *   totalAlarmRatio?: string
 *   // 本级自接警情数量
 *   selfAlarm?: number
 *   // 本级自接警情环比百分比，带正负号，例 "+18%" "-5%"
 *   selfAlarmRatio?: string
 *   // 流转移交警情数量
 *   transferAlarm?: number
 *   // 流转移交警情环比百分比，带正负号，例 "+18%" "-5%"
 *   transferAlarmRatio?: string
 *   // 110派警次数
 *   policeDispatch?: number
 *   // 110派警环比百分比，带正负号，例 "+18%" "-5%"
 *   policeDispatchRatio?: string
 * }
 * ```
 *
 */
export declare function getAlarmKpi(config: getAlarmKpiExtraConfig): Promise<getAlarmKpiResponse>;

type getResultKpiResponse = {
  /**
   * 抓获网逃数
   */

  netFugitiveCount?: number;
  /**
   * 抓获网逃同/环比
   */

  netFugitiveRatio?: string;
  /**
   * 抓获团伙数
   */

  gangCount?: number;
  /**
   * 抓获团伙数 同/环比
   */

  gangRatio?: string;
  /**
   * 抓获现行红标未成年
   */

  currentArrestMinor?: number;
  /**
   * 抓获现行红标未成年同/环比
   */

  currentArrestMinorRatio?: string;
};
type getResultKpiExtraConfig = Omit<AxiosRequestConfig, 'data' | 'params'> & {
  data: ComponentTypes.PoliceStatQueryDTO;
};
/**
 * ---
 *
 * [POST] 获取战果类卡片数据
 *
 * **path:** /policeScreen/getResultKpi
 *
 * ---
 *
 * **RequestBody**
 * ```ts
 * type RequestBody = {
 *   startDate?: string
 *   endDate?: string
 *   // 单位名称，全部单位传"全部单位"
 *   deptName?: string
 *   // 单位id，全部单位传"全部单位"
 *   deptId?: string
 *   // 统计类型 day:日 week:周 month:月
 *   statType?: string
 * }
 * ```
 *
 * ---
 *
 * **Response**
 * ```ts
 * type Response = {
 *   // 抓获网逃数
 *   netFugitiveCount?: number
 *   // 抓获网逃同/环比
 *   netFugitiveRatio?: string
 *   // 抓获团伙数
 *   gangCount?: number
 *   // 抓获团伙数 同/环比
 *   gangRatio?: string
 *   // 抓获现行红标未成年
 *   currentArrestMinor?: number
 *   // 抓获现行红标未成年同/环比
 *   currentArrestMinorRatio?: string
 * }
 * ```
 *
 */
export declare function getResultKpi(config: getResultKpiExtraConfig): Promise<getResultKpiResponse>;

type getMinorPieResponse = {
  /**
   * 总人数
   */

  total?: number;
  /**
   * 较昨日
   */

  ratioCompareYesterday?: string;
  /**
   * 饼图数据列表
   */

  dataList?: Array<{
    /**
     * 罪错-红，橙，黄蓝黑
     */

    name?: string;
    /**
     * 人数
     */

    value?: number;
    /**
     * 百分比
     */

    percent?: string;
  }>;
};
type getMinorPieExtraConfig = Omit<AxiosRequestConfig, 'data' | 'params'> & {
  data: ComponentTypes.PoliceStatQueryDTO;
};
/**
 * ---
 *
 * [POST] 获取未成年罪错饼图数据
 *
 * **path:** /policeScreen/getMinorPie
 *
 * ---
 *
 * **RequestBody**
 * ```ts
 * type RequestBody = {
 *   startDate?: string
 *   endDate?: string
 *   // 单位名称，全部单位传"全部单位"
 *   deptName?: string
 *   // 单位id，全部单位传"全部单位"
 *   deptId?: string
 *   // 统计类型 day:日 week:周 month:月
 *   statType?: string
 * }
 * ```
 *
 * ---
 *
 * **Response**
 * ```ts
 * type Response = {
 *   // 总人数
 *   total?: number
 *   // 较昨日
 *   ratioCompareYesterday?: string
 *   // 饼图数据列表
 *   // [items] start
 *   // [items] end
 *   dataList?: Array<{
 *     // 罪错-红，橙，黄蓝黑
 *     name?: string
 *     // 人数
 *     value?: number
 *     // 百分比
 *     percent?: string
 *   }>
 * }
 * ```
 *
 */
export declare function getMinorPie(config: getMinorPieExtraConfig): Promise<getMinorPieResponse>;

type getFugitiveTrendResponse = {
  /**
   * X轴坐标轴
   */

  xAxis?: string[];
  /**
   * 折线图系列数据
   */

  seriesList?: Array<{
    /**
     * 系列名称
     */

    name?: string;
    /**
     * 系列数值集合
     */

    data?: number[];
  }>;
};
type getFugitiveTrendExtraConfig = Omit<AxiosRequestConfig, 'data' | 'params'> & {
  data: ComponentTypes.PoliceStatQueryDTO;
};
/**
 * ---
 *
 * [POST] 获取网逃抓捕趋势折线图
 *
 * **path:** /policeScreen/getFugitiveTrend
 *
 * ---
 *
 * **RequestBody**
 * ```ts
 * type RequestBody = {
 *   startDate?: string
 *   endDate?: string
 *   // 单位名称，全部单位传"全部单位"
 *   deptName?: string
 *   // 单位id，全部单位传"全部单位"
 *   deptId?: string
 *   // 统计类型 day:日 week:周 month:月
 *   statType?: string
 * }
 * ```
 *
 * ---
 *
 * **Response**
 * ```ts
 * type Response = {
 *   // X轴坐标轴
 *   // [items] start
 *   // [items] end
 *   xAxis?: string[]
 *   // 折线图系列数据
 *   // [items] start
 *   // [items] end
 *   seriesList?: Array<{
 *     // 系列名称
 *     name?: string
 *     // 系列数值集合
 *     // [items] start
 *     // [items] end
 *     data?: number[]
 *   }>
 * }
 * ```
 *
 */
export declare function getFugitiveTrend(config: getFugitiveTrendExtraConfig): Promise<getFugitiveTrendResponse>;

type getAlarmTrendResponse = {
  /**
   * X轴坐标轴
   */

  xAxis?: string[];
  /**
   * 折线图系列数据
   */

  seriesList?: Array<{
    /**
     * 系列名称
     */

    name?: string;
    /**
     * 系列数值集合
     */

    data?: number[];
  }>;
};
type getAlarmTrendExtraConfig = Omit<AxiosRequestConfig, 'data' | 'params'> & {
  data: ComponentTypes.PoliceStatQueryDTO;
};
/**
 * ---
 *
 * [POST] 获取警情趋势折线图
 *
 * **path:** /policeScreen/getAlarmTrend
 *
 * ---
 *
 * **RequestBody**
 * ```ts
 * type RequestBody = {
 *   startDate?: string
 *   endDate?: string
 *   // 单位名称，全部单位传"全部单位"
 *   deptName?: string
 *   // 单位id，全部单位传"全部单位"
 *   deptId?: string
 *   // 统计类型 day:日 week:周 month:月
 *   statType?: string
 * }
 * ```
 *
 * ---
 *
 * **Response**
 * ```ts
 * type Response = {
 *   // X轴坐标轴
 *   // [items] start
 *   // [items] end
 *   xAxis?: string[]
 *   // 折线图系列数据
 *   // [items] start
 *   // [items] end
 *   seriesList?: Array<{
 *     // 系列名称
 *     name?: string
 *     // 系列数值集合
 *     // [items] start
 *     // [items] end
 *     data?: number[]
 *   }>
 * }
 * ```
 *
 */
export declare function getAlarmTrend(config: getAlarmTrendExtraConfig): Promise<getAlarmTrendResponse>;