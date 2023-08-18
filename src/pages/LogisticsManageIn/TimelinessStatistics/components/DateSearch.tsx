import { DatePicker, Select } from 'antd';
import { useState } from 'react';
import moment from 'moment';

const Component: React.FC<{
  value?: any;
  onChange?: any;
  options?: any;
}> = ({ onChange, options, value }) => {
  const [type, typeSet] = useState('1');
  const [dates, datesSet] = useState<any[]>(value ? value.dates : [null,null]);


  // 改变日期值
  const changeDate = (dataType: string, val: any) => {
    const dateText = val ? moment(val) : null;
    const newData = dates
    if (dataType == 'start') {
      newData[0] = dateText;
    } else {
      newData[1] = dateText;
    }
    datesSet(newData)
    onChange({ type, dates: newData });
  };
  return (
    <div style={{ display: 'flex' }}>
      <Select
        value={type}
        style={{ width: '120px' }}
        onChange={(val: any) => {
          typeSet(val);
          const temp = dates?.length ? [dates[0].startOf('day'), dates[1].endOf('day')] : [];
          onChange({ type: val, dates: temp });
        }}
        options={
          options || [
            { label: '实际入仓时间', value: '1' },
            { label: '要求入库时间', value: '2' },
          ]
        }
      />
      <div style={{ flex:1 ,display: 'flex', alignItems: 'center',paddingLeft: '3px' }}>
        <div>
          <DatePicker
            value={dates[0]}
            onChange={(val: any) => {
              // console.log(val)
              changeDate('start', val || null);
            }}
            placeholder={'开始日期'}
          />
        </div>
        <div style={{ marginLeft: '2px', marginRight: '2px' }}>-</div>
        <div>
          <DatePicker
            value={dates[1]}
            onChange={(val: any) => {
              changeDate('end', val || null);
            }}
            placeholder={'结束日期'}
          />
        </div>
      </div>
    </div>
  );
};
export default Component;
