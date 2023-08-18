import { useState } from 'react';
import { DatePicker, Select } from 'antd';
import moment from 'moment';

const Comp = (props: any) => {
  const [inputValue, setInputValue] = useState<any>('');
  const [selectId, setSelectId] = useState('create_time');
  const { RangePicker } = DatePicker;
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
  const changeDate = async (value?: any) => {
    const date: any = value ? JSON.parse(JSON.stringify(value)) : null;
    const dataC: any = date
      ? [
          moment(date[0]).format('YYYY-MM-DD 00:00:00'),
          moment(date[1]).format('YYYY-MM-DD 23:59:59'),
        ]
      : null;
    setInputValue(dataC);
    allBack(selectId, dataC);
  };

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <div style={{ width: '150px', paddingRight: '5px' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择类型"
          defaultValue="create_time"
          options={[
            {
              label: '创建时间',
              value: 'create_time',
            },
            {
              label: '装柜/送货时间',
              value: 'delivery_time',
            },
            {
              label: '预计开船时间',
              value: 'etd_date',
            },
            {
              label: '实际开船时间',
              value: 'atd_date',
            },
            {
              label: '预计到港时间',
              value: 'eta_date',
            },
            {
              label: '实际到港时间',
              value: 'ata_date',
            },
            {
              label: '实际入仓时间',
              value: 'actual_warehouse_date',
            },
            {
              label: 'POD提供时间',
              value: 'pod_date',
            },
          ]}
          onChange={(v: any) => changeSelect(v)}
        />
      </div>
      <div style={{ flex: 1 }}>
        <RangePicker allowClear onChange={changeDate} style={{ width: '100%' }} />
      </div>
    </div>
  );
};
export default Comp;
