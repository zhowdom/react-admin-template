import { Input, Select } from 'antd';
import { useState } from 'react';
import './style.less';

// 时间类型(按天,按月等)+时间范围组合搜索
const Component: React.FC<{
  value?: any;
  onChange?: any;
}> = ({ onChange}) => {
  const [type, typeSet] = useState('');
  const [text, textSet] = useState('');
  // 客诉用的
  const contentOption = [
    { label: '全部', value: '' },
    { label: '有描述', value: '0' },
    { label: '描述为空', value: '1' },
  ]
  // 改变下拉类型
  const changeType = (selectType: string) => {
    typeSet(selectType);
    const newD = String(selectType);
    if(newD == '1'){
      textSet('');
    }
    setTimeout(() => {
      onChange({ type: selectType, text: newD == '1'?'':text });
    }, 200);
  };
  //
  const changeText = (cont: string) => {
    const newD = String(type);
    if(newD == ''){
      textSet(cont);
    }else if(newD == '0'){
      textSet(cont);
    }else if(newD == '1'){
      console.log(1111)
      textSet('');
    }
    setTimeout(() => {
      onChange({ type: type, text: cont });
    }, 200);
  };
  return (
    <div className='FeedBackDeatilComments'>
      <div className='FeedBackDeatilComments-searchType'>
        <Select
          defaultValue={type}
          style={{ width: 85, marginRight: 2}}
          onChange={(val: any) => {
            changeType(val);
          }}
          options={contentOption}
        />
      </div>
      <div className='rangeTimeSearchDetail-input'>
        <Input
          value={text}
          disabled={type == '1'}
          onChange={(val: any) => {
            changeText(val.target.value);
          }}
          placeholder={'模糊查询'}
        />
      </div>
    </div>
  );
};
export default Component;
