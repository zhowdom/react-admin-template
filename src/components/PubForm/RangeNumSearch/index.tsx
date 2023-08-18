import { Select, InputNumber } from 'antd';
import { useState } from 'react';

// 类型 + 数字范围 搜索
const Component: React.FC<{
  value?: any;
  onChange?: any;
  options?: any;
}> = ({ onChange, options, value }) => {
  const [havingType, typeSet] = useState(value ? value.havingType : null);
  const [havingTypeStart, havingTypeStartSet] = useState<number>(
    value ? value.havingTypeStart : null,
  );
  const [havingTypeEnd, havingTypeEndSet] = useState<number>(value ? value.havingTypeEnd : null);
  return (
    <div style={{ display: 'flex' }}>
      <Select
        placeholder={'类型'}
        allowClear
        defaultValue={havingType}
        style={{ width: '80px' }}
        onChange={(val: any) => {
          typeSet(val);
          onChange({ havingType: val, havingTypeStart, havingTypeEnd });
        }}
        options={
          options || [
            { label: '销量', value: 1 },
            { label: '退货数', value: 2 },
            { label: '换货数', value: 3 },
          ]
        }
      />
      <InputNumber
        placeholder={'开始数量'}
        value={havingTypeStart}
        min={1}
        max={havingTypeEnd || 99999999}
        precision={0}
        step={5}
        style={{ marginLeft: '2px' }}
        onBlur={() => onChange({ havingType, havingTypeStart, havingTypeEnd })}
        onChange={(val) => {
          havingTypeStartSet(val);
        }}
      />
      <InputNumber
        placeholder={'结束数量'}
        value={havingTypeEnd}
        min={havingTypeStart || 1}
        precision={0}
        step={5}
        style={{ marginLeft: '2px' }}
        onBlur={() => onChange({ havingType, havingTypeStart, havingTypeEnd })}
        onChange={(val) => {
          havingTypeEndSet(val);
        }}
      />
    </div>
  );
};
export default Component;
