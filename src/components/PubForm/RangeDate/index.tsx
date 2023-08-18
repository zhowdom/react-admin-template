import {DatePicker, Select, Tooltip} from 'antd';
import moment from 'moment';
import {QuestionCircleOutlined} from '@ant-design/icons';
import type {Moment} from 'moment';
import {useEffect} from 'react';
// 预设日期范围 + 日期范围组合搜索

type RangeValue = [Moment | null, Moment | null] | null;
type typeDate =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'latest7'
  | 'latest15'
  | 'latest30'
  | 'custom';
const {RangePicker} = DatePicker;
// 开始结束时间
const formatDate = (type: typeDate, timeZone: number = 8): RangeValue => {
  switch (type) {
    case 'today':
      return [moment().utcOffset(timeZone * 60), moment().utcOffset(timeZone * 60)];
    case 'yesterday':
      return [moment().utcOffset(timeZone * 60).add(-1, 'days'), moment().utcOffset(timeZone * 60).add(-1, 'days')];
    case 'thisWeek':
      return [moment().utcOffset(timeZone * 60).startOf('weeks'), moment().utcOffset(timeZone * 60).endOf('weeks')];
    case 'lastWeek':
      return [moment().utcOffset(timeZone * 60).add(-1, 'weeks').startOf('weeks'), moment().utcOffset(timeZone * 60).add(-1, 'weeks').endOf('weeks')];
    case 'thisMonth':
      return [moment().utcOffset(timeZone * 60).startOf('months'), moment().utcOffset(timeZone * 60).endOf('months')];
    case 'lastMonth':
      return [
        moment().utcOffset(timeZone * 60).add(-1, 'months').startOf('months'),
        moment().utcOffset(timeZone * 60).add(-1, 'months').endOf('months'),
      ];
    case 'latest7':
      return [moment().utcOffset(timeZone * 60).add(-7, 'days'), moment().utcOffset(timeZone * 60)];
    case 'latest15':
      return [moment().utcOffset(timeZone * 60).add(-15, 'days'), moment().utcOffset(timeZone * 60)];
    case 'latest30':
      return [moment().utcOffset(timeZone * 60).add(-30, 'days'), moment().utcOffset(timeZone * 60)];
    default:
      return [moment().utcOffset(timeZone * 60).add(-30, 'days'), moment().utcOffset(timeZone * 60)];
  }
};
// 时间tooltip
const RangeDateTooltip: React.FC = () => (
  <Tooltip
    title={
      <>
        <div>
          选择日期为<span style={{color: 'rgb(255, 156, 0)'}}>站点时间</span>。
        </div>
        <div>
          特别说明：亚马逊后台订单管理中选择的查询时间，是访问亚马逊的IP地址对应时区的时间，并非站点时区时间。
        </div>
        <div>
          例如，用中国国内网络IP去访问亚马逊后台的订单管理，则查询出数据是以北京时间进行查询的，不是站点时区时间。
        </div>
      </>
    }
  >
    {' '}
    <QuestionCircleOutlined/>{' '}
  </Tooltip>
);

const Component: React.FC<{
  value?: any;
  onChange?: any;
  width: number; // 第一个select宽度
  timeZone: number;
}> = ({width = 100, onChange, value = ['latest7', formatDate('latest7', 8)], timeZone = 8}) => {
  useEffect(() => {
    onChange(['latest7', formatDate('latest7', timeZone)])
  }, [timeZone]);
  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      <Select
        placeholder={'统计日期'}
        style={{width: width, marginRight: 2}}
        value={value[0]}
        onChange={(val: any) => {
          onChange([val, formatDate(val, timeZone)]);
        }}
        options={[
          {label: '今天', value: 'today', title: ''},
          {label: '昨天', value: 'yesterday', title: ''},
          {label: '本周', value: 'thisWeek', title: ''},
          {label: '上周', value: 'lastWeek', title: ''},
          {label: '本月', value: 'thisMonth', title: ''},
          {label: '上月', value: 'lastMonth', title: ''},
          {label: '近7天', value: 'latest7', title: ''},
          {label: '近15天', value: 'latest15', title: ''},
          {label: '近30天', value: 'latest30', title: ''},
          {label: '自定义', value: 'custom', title: ''},
        ]}
        menuItemSelectedIcon={<RangeDateTooltip/>}
      />
      {/*@ts-ignore*/}
      <RangePicker
        disabledDate={(current: any) => current && current?.isAfter(moment())}
        value={value[1]}
        onChange={(val: any) => {
          onChange(['custom', val]);
        }}
      />
    </div>
  );
};
export default Component;
