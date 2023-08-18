import { useEffect, useState } from 'react';
import { DatePicker, Select } from 'antd';
import moment from 'moment';

const Time: React.FC<{
  value?: any;
  onChange?: any;
}> = ({ onChange, value }) => {
  const [defaultData, setDefaultData] = useState(value||{
    sType:'sign',
    dType:'date',
    dateList:[moment().startOf('month'), moment().endOf('month')],
  });
  // 返回到页面
  const allBack = (backData: any[]) => {
    onChange(backData);
  };
  useEffect(() => {
    // const data: any = [
    //   cacheTime?.[0] || 'sign',
    //   cacheTime?.[1] || 'date',
    //   [
    //     cacheTime?.[2]?.[0]?moment(cacheTime?.[2]?.[0]):initialValueData[0],
    //     cacheTime?.[2]?.[1]?moment(cacheTime?.[2]?.[1]):initialValueData[1]
    //   ]
    // ];
    // setTypeSelect(data?.[0]);
    // setTimeSelect(data?.[1]);
    // setTime(data?.[2]);
    // setDefaultData(data);
    // console.log(cacheTime, 'dataS');
    // console.log(data, 'dataS');
    // allBack(
    //   cacheTime?.[0] || 'sign',
    //   cacheTime?.[1] || 'date',
    //   [
    //     cacheTime?.[2]?.[0]?moment(cacheTime?.[2]?.[0]):initialValueData[0],
    //     cacheTime?.[2]?.[1]?moment(cacheTime?.[2]?.[1]):initialValueData[1]
    //   ]
    // );
  }, []);
  // 改变类型时
  const changeTypeSelect = async (val?: any) => {
    // console.log(111)
    // console.log(val)
    const newD = defaultData;
    newD.sType = val;
    newD.dateList = [null,null];
    setDefaultData(newD);
    allBack(newD);
  };
  // 改变时间类型时
  const changeTimeSelect = async (val?: any) => {
    // console.log(9999)
    // console.log(val)
    const newD = defaultData;
    newD.dType = val;
    newD.dateList = [null,null];
    setDefaultData(newD);
    allBack(newD);
  };

  // 改变日期值
  const changeDate = (dataType: string, val: any) => {
    // console.log(888)
    // console.log(dataType)
    const newD = defaultData;
    const dateText = val ? moment(val) : null;
    if (dataType == 'start') {
      newD.dateList[0] = dateText;
    } else {
      newD.dateList[1] = dateText;
    }
    setDefaultData(newD);
    allBack(newD);
  };


  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <div style={{ width: '90px', paddingRight: '3px' }}>
        <Select
          defaultValue={defaultData?.sType}
          style={{ width: '100%' }}
          options={[
            {
              label: '签约时间',
              value: 'sign',
            },

            {
              label: '创建时间',
              value: 'create',
            },
          ]}
          onChange={(v: any) => changeTypeSelect(v)}
        />
      </div>
      <div style={{ width: '80px', paddingRight: '3px' }}>
        <Select
          style={{ width: '100%' }}
          defaultValue={defaultData?.dType}
          options={[
            {
              label: '按天',
              value: 'date',
            },

            {
              label: '按月',
              value: 'month',
            },
          ]}
          onChange={(v: any) => changeTimeSelect(v)}
        />
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        <div>
          <DatePicker
            value={defaultData?.dateList?.[0]}
            picker={defaultData?.dType}
            onChange={(val: any) => {
              let newText = null;
              if (defaultData?.dType == 'date') {
                newText = val || null
              } else {
                newText = val ? moment(val).startOf('month') : null
              }
              changeDate('start', newText);
            }}
            placeholder={'开始日期'}
          />
        </div>
        <div className='rangeTimeSearch-line'>-</div>
        <div>
          <DatePicker
            value={defaultData?.dateList?.[1]}
            picker={defaultData?.dType}
            onChange={(val: any) => {
              let newText = null;
              if (defaultData?.dType == 'date') {
                newText = val || null
              } else {
                newText = val ? moment(val).endOf('month') : null
              }
              changeDate('end', newText);
            }}
            placeholder={'结束日期'}
          />
        </div>
      </div>
    </div>
  );
};
export default Time;
