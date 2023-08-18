import { DatePicker } from 'antd';
import moment from 'moment';

export default (props: any) => {
  return (
    <DatePicker
      picker="week"
      placeholder="请选择"
      onChange={(data: any, dataString: string) => {
        props.callBack({
          start: data ? moment(data).weekday(0).format('YYYY-MM-DD') : '',
          end: data ? moment(data).weekday(6).format('YYYY-MM-DD') : '',
          // week: dataString.replaceAll('-', '-第'),
          week: dataString,
        });
      }}
    />
  );
};
