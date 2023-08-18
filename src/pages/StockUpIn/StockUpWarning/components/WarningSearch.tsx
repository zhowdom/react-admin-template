import { Select, Space } from 'antd';
import moment from 'moment';
import { useState } from 'react';

const Component: React.FC<{
  value?: any;
  onChange?: any;
  options?: any;
}> = ({ onChange }) => {
  const [type1, typeSet1] = useState();
  const [type2, typeSet2] = useState();
  const [days, daysSet] = useState();
  // const weekOfday: any = moment(new Date()).format('E'); //计算是这周第几天
  // const monday: any = moment(new Date()).subtract(weekOfday - 1, 'days'); //获取周一
  const weekNow = Number(moment().format('WW'));
  const weekList = new Array(13).fill(1).map((item: any, index: number) => {
    return {
      label: `第${Number(weekNow) + index}周`,
      value: moment().add(index, 'week').startOf('isoWeek').format('YYYY-MM-DD'),
      disabled:
        type2 &&
        new Date(moment().add(index, 'week').endOf('isoWeek').format('YYYY-MM-DD')).getTime() >
          new Date(type2).getTime(),
    };
  });
  const weekList1 = new Array(13).fill(1).map((item: any, index: number) => {
    return {
      label: `第${Number(weekNow) + index}周`,
      value: moment().add(index, 'week').endOf('isoWeek').format('YYYY-MM-DD'),
      disabled:
        type1 &&
        new Date(moment().add(index, 'week').startOf('isoWeek').format('YYYY-MM-DD')).getTime() <
          new Date(type1).getTime(),
    };
  });
  return (
    <Space>
      <Select
        value={type1}
        style={{ width: '120px' }}
        placeholder={type2 ? '默认当前周' : '请选择起始周'}
        onChange={(val: any) => {
          typeSet1(val);
          onChange({ dates: [val, type2], days });
        }}
        allowClear={true}
        options={weekList}
      />
      <span>至</span>
      <Select
        value={type2}
        placeholder="请选择截止周"
        style={{ width: '120px' }}
        onChange={(val: any) => {
          typeSet2(val);
          onChange({ dates: [type1, val], days });
        }}
        allowClear={true}
        options={weekList1}
      />
      <Select
        value={days}
        placeholder="请选择周转天范围"
        style={{ width: '180px' }}
        onChange={(val: any) => {
          daysSet(val);
          onChange({ dates: [type1, type2], days: val });
        }}
        allowClear={true}
        options={[
          {
            label: '小于21天',
            value: '0-20',
          },
          {
            label: '21-40天(两端包含)',
            value: '21-40',
          },
          {
            label: '41-60天(两端包含)',
            value: '41-60',
          },
          {
            label: '大于60天',
            value: '61-9999999',
          },
        ]}
      />
    </Space>
  );
};
export default Component;
