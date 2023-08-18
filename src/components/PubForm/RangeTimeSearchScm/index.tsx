import { DatePicker, Select } from 'antd';
import { useState } from 'react';

// 时间类型+时间范围组合搜索
const Component: React.FC<{
  value?: any;
  onChange?: any;
  options?: any;
  width?: number | string;
}> = ({ onChange, options, width = 88 }) => {
  const [type, typeSet] = useState('create_time');
  const [dates, datesSet] = useState<any[]>(['', '']);
  return (
    <div style={{display: 'flex'}}>
      <Select
        defaultValue={type}
        style={{ width, marginRight: 2, textAlign: 'right' }}
        onChange={(val: any) => {
          typeSet(val);
          onChange({ type: val, dates });
        }}
        options={
          options || [
            { label: '创建时间', value: 'create_time' },
            { label: '审核时间', value: 'approval_agree_time' },
            { label: '签约时间', value: 'signing_time' },
          ]
        }
      />
      {/*@ts-ignore*/}
      <DatePicker.RangePicker
        format={['YYYY-MM-DD', 'YYYY-MM-DD']}
        onChange={(_: any, datesString) => {
          datesSet(datesString);
          onChange({ type, dates: datesString });
        }}
        allowClear
        style={{flex: 1}}
      />
    </div>
  );
};
export default Component;
