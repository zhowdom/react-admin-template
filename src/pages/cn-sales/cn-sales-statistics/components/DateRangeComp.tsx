import { DatePicker, Space } from 'antd';
import moment from 'moment';
import { useState } from 'react';

const Component: React.FC<{
  value?: any;
  onChange?: any;
  initialValue?: any;
  disabledDateEnd?: any;
  allowClear?: any;
  limitMonth?: any;
}> = ({ onChange, initialValue, disabledDateEnd, allowClear = true, limitMonth }) => {
  const [date1, dateSet1] = useState(initialValue?.[0]);
  const [date2, dateSet2] = useState(initialValue?.[1]);
  return (
    <Space>
      <DatePicker
        value={date1}
        onChange={(val: any) => {
          dateSet1(val);
          onChange([val, date2]);
        }}
        allowClear={allowClear}
        disabledDate={(current: any) =>
          current && limitMonth && current < moment(date2).add(-limitMonth, 'month')
        }
      />
      <span>-</span>
      <DatePicker
        value={date2}
        onChange={(val: any) => {
          dateSet2(val);
          onChange([date1, val]);
        }}
        disabledDate={(current: any) => current && current > disabledDateEnd}
        allowClear={allowClear}
      />
    </Space>
  );
};
export default Component;
