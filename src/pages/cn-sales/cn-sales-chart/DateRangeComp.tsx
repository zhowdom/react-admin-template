import { DatePicker, Space } from 'antd';
import moment from 'moment';
import { useState } from 'react';

const Component: React.FC<{
  value?: any;
  onChange?: any;
  initialValue?: any;
  allowClear?: any;
}> = ({ onChange, initialValue, allowClear = true }) => {
  const [date1, dateSet1] = useState(initialValue?.[0]);
  const [date2, dateSet2] = useState(initialValue?.[1]);
  // 只可选近四年的日期
  return (
    <Space>
      <DatePicker
        value={date1}
        onChange={(val: any) => {
          dateSet1(val);
          onChange([val, date2]);
        }}
        allowClear={allowClear}
        disabledDate={(current: any) => {
          return current && (current > date2 || current < moment().startOf('year').add(-4, 'year'));
        }}
      />
      <span>-</span>
      <DatePicker
        value={date2}
        onChange={(val: any) => {
          dateSet2(val);
          onChange([date1, val]);
        }}
        disabledDate={(current: any) =>
          current && (current < date1 || current < moment().startOf('year').add(-4, 'year'))
        }
        allowClear={allowClear}
      />
    </Space>
  );
};
export default Component;
