import { DatePicker, TimePicker } from 'antd';
import { useState } from 'react';
import moment from 'moment';
// 选某一天的时间范围 表单项
const Component: React.FC<{
  value?: string[];
  onChange?: any;
}> = ({ onChange, value }) => {
  const [date, dateSet] = useState<any>(value ? moment(value[0]) : moment());
  const [times, timesSet] = useState<any[]>(value ? [moment(value[0]), moment(value[1])] : []);
  return (
    <>
      {/*@ts-ignore*/}
      <DatePicker
        defaultValue={date}
        allowClear={false}
        onChange={(val: any, s) => {
          dateSet(val);
          if (times[0] && times[1]) {
            const start = moment(times[0]).format('HH:mm');
            const end = moment(times[1]).format('HH:mm');
            onChange([`${s} ${start}`, `${s} ${end}`]);
          }
        }}
        style={{ width: '120px', marginRight: '5px' }}
      />
      {/*@ts-ignore*/}
      <TimePicker.RangePicker
        defaultValue={times}
        minuteStep={30}
        format={['HH:mm', 'HH:mm']}
        onChange={(val: any, t) => {
          timesSet(val);
          if (date) {
            const s = moment(date).format('YYYY-MM-DD');
            onChange([`${s} ${t[0]}`, `${s} ${t[1]}`]);
          }
        }}
        style={{ width: '160px' }}
      />
    </>
  );
};
export default Component;
