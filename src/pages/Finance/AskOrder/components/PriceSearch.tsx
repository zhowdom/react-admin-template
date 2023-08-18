import {InputNumber, Space } from 'antd';
import { useState } from 'react';

const Component: React.FC<{
  value?: any;
  onChange?: any;
}> = ({ onChange }) => {
  const [value1, valueSet1] = useState('');
  const [value2, valueSet2] = useState('');
  // 只可选近四年的日期
  return (
    <Space>
      <InputNumber
        min={0}
        onChange={(val: any) => {
          valueSet1(val);
          onChange([val, value2]);
        }}
      />
      <span>-</span>
      <InputNumber
        min={value1 || 0}
        onChange={(val: any) => {
          valueSet2(val);
          onChange([value1, val]);
        }}
      />
    </Space>
  );
};
export default Component;
