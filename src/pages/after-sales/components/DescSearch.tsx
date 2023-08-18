import { useState } from 'react';
import { Input, Select } from 'antd';

const Comp = (props: any) => {
  const [inputValue, setInputValue] = useState('');
  const [selectId, setSelectId] = useState('English');

  // 返回到页面
  const allBack = (busScopeId: string, line: string) => {
    props.onChange([busScopeId, line]);
  };
  // 改变类型时
  const changeSelect = async (id?: any) => {
    setSelectId(id);
    allBack(id, inputValue);
  };
  // 改变值时
  const changeInput = async (e?: any) => {
    setInputValue(e.target.value);
    allBack(selectId, e.target.value);
  };

  return (
    <div style={{ width: '100%', display: 'flex', marginLeft: '80px' }}>
      <div style={{ width: '130px', paddingRight: '5px' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择类型"
          defaultValue="English"
          options={[
            {
              label: '客诉描述（英）',
              value: 'English',
            },
            {
              label: '客诉描述（中）',
              value: 'Chinese',
            },
          ]}
          onChange={(v: any) => changeSelect(v)}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Input
          style={{ width: '100%' }}
          placeholder="请输入"
          allowClear
          onChange={(e: any) => changeInput(e)}
        />
      </div>
    </div>
  );
};
export default Comp;
