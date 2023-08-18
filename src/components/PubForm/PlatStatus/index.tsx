import {useState} from 'react';
import {Select} from 'antd';
import {ProFormSelect} from '@ant-design/pro-components';

const Comp: React.FC<{
  value?: any;
  onChange?: any;
  dicList: any;
  options?: any[];
  withLabel?: boolean;
}> = ({value, onChange, dicList, options, withLabel = false}) => {
  const [label, labelSet] = useState('');
  const [status, statusSet] = useState(value);
  const [valueEnum, valueEnumSet] = useState({});
  return (
    <div style={{display: 'flex', maxWidth: '100%'}}>
      <Select
        style={{width: 100}}
        placeholder="平台"
        allowClear
        options={options || [
          {
            label: '京东FCS',
            value: 'ORDER_JD_FCS_PLATFORM_STATUS',
          },
          {
            label: '京东POP',
            value: 'ORDER_JD_POP_PLATFORM_STATUS',
          },
          {
            label: '天猫',
            value: 'ORDER_TM_PLATFORM_STATUS',
          },
          {
            label: 'ERP订单',
            value: 'ORDER_ERP_STATUS',
          },
          {
            label: '抖音',
            value: 'ORDER_DY_PLATFORM_STATUS',
          },
        ]}
        onChange={(v: any, obj: any) => {
          labelSet(obj?.label)
          statusSet('');
          valueEnumSet(dicList[v] || {zfb: {text: '支付宝'}});
        }}
      />
      <ProFormSelect
        ignoreFormItem
        placeholder="状态"
        allowClear
        valueEnum={valueEnum}
        fieldProps={{
          style: {marginLeft: 2, flex: 1, width: 'calc(100% - 100px)'},
          value: status,
          onChange: (v: any, obj: any) => {
            statusSet(v);
            if (withLabel) {
              onChange(`${label}-${v}-${obj.label}`);
            } else {
              onChange(v);
            }
          },
        }}
        showSearch
      />
    </div>
  );
};

export default Comp;
