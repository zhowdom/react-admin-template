import { useState } from 'react';
import {  Input, Select } from 'antd';

const Comp = (props: any) => {
  const [inputValue, setInputValue] = useState<any>('');
  const [selectId, setSelectId] = useState('stock_no');
  // 返回到页面
  const allBack = (label: string, value: string) => {
    props.onChange([label, value]);
  };
  // 改变类型时
  const changeSelect = async (id?: any) => {
    setSelectId(id);
    allBack(id, inputValue);
  };
  // 改变值时
  const changeValue = async (e?: any) => {
    setInputValue(e.target.value);
    allBack(selectId, e.target.value);
  };

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <div style={{ width: '120px', paddingRight: '5px' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择类型"
          defaultValue="stock_no"
          options={[
            {
              label: '发货计划编号',
              value: 'delivery_no',
            },
            {
              label: '入库单号',
              value: 'stock_no',
            },
            {
              label: '订舱号',
              value: 'sh_no',
            },
          ]}
          onChange={(v: any) => changeSelect(v)}
        />
      </div>
      <div style={{ flex: 1 }}>
      <Input placeholder="请输入" onChange={changeValue}/>

      </div>
    </div>
  );
};
export default Comp;
