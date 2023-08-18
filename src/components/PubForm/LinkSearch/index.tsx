import { useState } from 'react';
import { Input, Select } from 'antd';

const Comp = (props: any) => {
  const [inputValue, setInputValue] = useState('');
  const [selectId, setSelectId] = useState(props?.hideSku ? 'linkName' : 'skuCode');

  // 返回到页面
  const allBack = (busScopeId: string, line: string) => {
    props.back([busScopeId, line]);
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
    <div style={{ width: '100%', display: 'flex' }}>
      <div style={{ width: '115px', paddingRight: '5px' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择类型"
          defaultValue={props?.hideSku ? 'linkName' : 'skuCode'}
          options={
            props?.hideSku
              ? [
                  {
                    label: '链接名',
                    value: 'linkName',
                  },

                  {
                    label: '链接ID',
                    value: 'linkId',
                  },
                ]
              : [
                  {
                    label: 'SKU',
                    value: 'skuCode',
                  },
                  {
                    label: '链接名',
                    value: 'linkName',
                  },
                  {
                    label: '链接ID',
                    value: 'linkId',
                  },
                ]
          }
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
