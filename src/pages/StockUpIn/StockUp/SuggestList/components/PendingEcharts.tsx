import { Tabs } from 'antd';
import { useState } from 'react';
import './index.less';
import EchartsSKU from './Echarts/EchartsSKU';
import EchartsSPU from './Echarts/EchartsSPU';
import History from './Echarts/History';

export default (props: any) => {
  const [tabStatus, setTabStatus] = useState('sku');
  const onStatusClick = (key: any) => {
    setTabStatus(key);
  };
  return (
    <div className="suggest-echart">
      <Tabs
        onChange={onStatusClick}
        activeKey={tabStatus}
        className="suggest-tabs"
        items={[
          {
            key: 'sku',
            label: 'SKU',
            children: <EchartsSKU id={props?.id} sku={props?.sku} detail={props?.detail} />,
          },
          {
            key: 'spu',
            label: 'SPU',
            children: <EchartsSPU id={props?.id} detail={props?.detail} />,
          },
          {
            key: 'history',
            label: '历史数据',
            children: <History id={props?.id} />,
          },
        ]}
      />
    </div>
  );
};
