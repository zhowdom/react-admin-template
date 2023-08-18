import { DatePicker } from 'antd';
import { useState } from 'react';
// 预设日期范围 + 日期范围组合搜索
import moment from 'moment';

const Component: React.FC<{
  value?: any;
  onChange?: any;
  allowClear?: any;
  needRange?: any;
  customDisabled1?: any;
  customDisabled2?: any;
  picker?: any;
}> = ({
  onChange,
  value = ['', ''],
  allowClear = true,
  needRange = false,
  customDisabled1,
  customDisabled2,
  picker = ''
}) => {
  const [params, paramsSet] = useState({
    startTime: value ? value[0] : null,
    endTime: value ? value[1] : null,
  });
  // 返回
  const goBack = (type: any, dateVal: any) => {
    const newData = { ...params };
    if (type == 'start') {
      const startVal = (picker == 'month' && dateVal)
      ?
      moment(`${moment(dateVal).startOf('month').format('YYYY-MM-DD')} 00:00:00`)
      :
      dateVal;
      console.log(startVal)
      paramsSet({
        ...params,
        startTime: startVal,
      });
      newData.startTime = startVal;
    } else if (type == 'end') {
      const endVal = (picker == 'month' && dateVal)
      ?
      moment(`${moment(dateVal).endOf('month').format('YYYY-MM-DD')} 23:59:59`)
      :
      dateVal;
      paramsSet({
        ...params,
        endTime: endVal,
      });
      newData.endTime = endVal;
    }
    // console.log(newData)
    // if (newData.startTime && newData.endTime) {
    //   onChange([newData.startTime,newData.endTime]);
    // }
    onChange([newData.startTime, newData.endTime]);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div>
        <DatePicker
          value={params.startTime}
          picker={picker}
          onChange={(val: any) => {
            const aa = val ? moment(`${moment(val).format('YYYY-MM-DD')} 00:00:00`) : null;
            goBack('start', aa);
          }}
          disabledDate={(current: any) =>
            (needRange && current && current > params.endTime) ||
            (customDisabled1 && customDisabled1(current, [params.startTime, params.endTime]))
          }
          allowClear={allowClear}
          placeholder={'开始日期'}
        />
      </div>
      <div style={{ marginLeft: '2px', marginRight: '2px' }}>-</div>
      <div>
        <DatePicker
          value={params.endTime}
          picker={picker}
          onChange={(val: any) => {
            const aa = val ? moment(`${moment(val).format('YYYY-MM-DD')} 23:59:59`) : null;
            goBack('end', aa);
          }}
          disabledDate={(current: any) =>
            (needRange && current && current < params.startTime) ||
            (customDisabled2 && customDisabled2(current, [params.startTime, params.endTime]))
          }
          allowClear={allowClear}
          placeholder={'结束日期'}
        />
      </div>
    </div>
  );
};
export default Component;
