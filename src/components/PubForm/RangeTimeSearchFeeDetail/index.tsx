import { DatePicker, Select } from 'antd';
import { useState } from 'react';
import moment from 'moment';
import './style.less';

// 时间类型(按天,按月等)+时间范围组合搜索
const Component: React.FC<{
  value?: any;
  onChange?: any;
  optionsType?: string; // 左侧 快速日期选择，目前只有客诉在用，备用字段，防止以后有别的地方用
}> = ({ onChange, optionsType = 'kesu', value }) => {
  const [type, typeSet] = useState(value ? value.type : '30day');
  const [searchType, searchTypeSet] = useState(value ? value.searchType : 'purchaseTime');
  const [dates, datesSet] = useState<any[]>(value && value.dates ? value.dates : [null, null]);
  // 客诉用的
  const afterFeedbackOption = [
    { label: '近30天', value: '30day' },
    { label: '昨天', value: 'yesterday' },
    { label: '上周', value: 'lastweek' },
    { label: '上月', value: 'lastmonth' },
    { label: '近7天', value: '7day' },
    { label: '近15天', value: '15day' },
    { label: '近90天', value: '90day' },
    { label: '近180天', value: '180day' },
    { label: '自定义', value: 'selfday' },
  ]
  // 返回
  const goBack = () => {
    onChange({ type, searchType, dates: dates });
  };
  // 改变日期值
  const changeDate = (dataType: string, val: any) => {
    // console.log(dataType)
    const dateText = val ? moment(val) : null;
    if (dataType == 'start') {
      dates[0] = dateText;
      console.log(dates)
      datesSet(dates)
    } else {
      dates[1] = dateText;
      datesSet(dates)
    }
    setTimeout(() => {
      // console.log(dates)
      // console.log(moment(dates[0]).format('YYYY-MM-DD'))
      // console.log(moment(dates[1]).format('YYYY-MM-DD'))
      goBack();
      typeSet('selfday');
    }, 200);
  };
  // 改变下拉类型
  const changeType = (selectType: string) => {
    console.log(selectType);
    typeSet(selectType);
    let newDate: any = []
    if (selectType == '30day') {
      newDate = [
        moment().add(-30, 'day'),
        moment(),
      ]
    } else if (selectType == 'yesterday') {
      newDate = [
        moment().add(-1, 'day'),
        moment().add(-1, 'day'),
      ]
      datesSet(newDate)
    } else if (selectType == 'lastweek') {
      newDate = [
        moment().add(-1, 'week').startOf('week'),
        moment().add(-1, 'week').endOf('week'),
      ]
    } else if (selectType == 'lastmonth') {
      newDate = [
        moment().add(-1, 'month').startOf('month'),
        moment().add(-1, 'month').endOf('month'),
      ]
    } else if (selectType == '7day') {
      newDate = [
        moment().add(-7, 'day'),
        moment(),
      ]
    } else if (selectType == '15day') {
      newDate = [
        moment().add(-15, 'day'),
        moment(),
      ]
    } else if (selectType == '90day') {
      newDate = [
        moment().add(-90, 'day'),
        moment(),
      ]
    } else if (selectType == '180day') {
      newDate = [
        moment().add(-180, 'day'),
        moment(),
      ]
    }
    setTimeout(() => {
      datesSet(newDate)
      onChange({ type: selectType, searchType, dates: newDate });
    }, 200);
  };
  return (
    <div className='rangeTimeSearchDetail'>
      <div className='rangeTimeSearchDetail-searchType'>
        <Select
          defaultValue={searchType}
          style={{ width: 85, marginRight: 2, textAlign: 'right' }}
          onChange={(val: any) => {
            searchTypeSet(val);
            onChange({ type, searchType: val, dates: dates });
          }}
          options={[
            { label: '下单时间', value: 'purchaseTime' },
            { label: '客诉时间', value: 'complaintTime' },
          ]
          }
        />
      </div>
      <div className='rangeTimeSearchDetail-search'>
        <Select
          value={type}
          style={{ width: '80px' }}
          onChange={(val: any) => {
            changeType(val);
          }}
          options={
            optionsType == 'kesu' ? afterFeedbackOption : []
          }
        />
      </div>
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
      <div className='rangeTimeSearchDetail-line'>-</div>
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
  );
};
export default Component;
