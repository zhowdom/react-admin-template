import { Select, Input } from 'antd';
import { useState } from 'react';

// 类型 + 输入内容 搜索
const Component: React.FC<{
  value?: any;
  onChange?: any;
  options?: any;
  width?: number;
}> = ({ onChange, options, value, width = 96 }) => {
  const [type, typeSet] = useState(value ? value[0] : 'erpNo');
  const [inputValue, inputValueSet] = useState<number>(value ? value[1] : '');
  return (
    <div style={{ display: 'flex' }}>
      <Select
        placeholder={'类型'}
        defaultValue={type}
        style={{ width }}
        onChange={(val: any) => {
          typeSet(val);
          onChange([val, inputValue]);
        }}
        options={
          options || [
            { label: 'ERP单号', value: 'erpNo' },
            { label: '平台单号', value: 'platformNo' },
            { label: '配送单号', value: 'shipmentNo' },
            { label: '快递单号', value: 'expressNo' },
          ]
        }
      />
      <Input
        style={{ flex: 1, marginLeft: 2 }}
        allowClear
        placeholder={'输入关键词模糊查询'}
        onChange={(e: any) => {
          inputValueSet(e?.target?.value);
          onChange([type, e?.target?.value]);
        }}
      />
    </div>
  );
};
export default Component;
