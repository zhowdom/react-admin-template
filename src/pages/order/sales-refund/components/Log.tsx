import {Table, Modal} from 'antd';
import {useState} from "react";
import {log} from '@/services/pages/order/delivery-order';
import {pubConfig, pubMsg} from "@/utils/pubConfig";

const Component: React.FC<{
  dataSource: Record<string, any>;
  title?: string,
  trigger?: any,
}> = ({dataSource, title, trigger}) => {
  const [open, openSet] = useState(false)
  const [data, dataSet] = useState([])
  const fetchData = () => {
    log({sourceId: dataSource.id, pageIndex: 1, pageSize: 999}).then(res => {
      if (res?.code == pubConfig.sCodeOrder) {
        dataSet(res.data)
      } else {
        pubMsg('获取日志失败:' + res?.message)
        dataSet([])
      }
    })
  }
  return (
    <>
      <a onClick={() => {
        fetchData()
        openSet(true)
      }}>{trigger || '日志'}</a>
      <Modal width={1000} open={open} title={title || '日志'} onCancel={() => openSet(false)} destroyOnClose footer={null}>
        <Table
          rowKey={'id'}
          pagination={{defaultPageSize: 10}}
          dataSource={data}
          columns={[
            {
              title: '序号',
              dataIndex: 'index',
              width: 60,
              align: 'center',
              render: (text, record, index) => index + 1,
            },
            {
              title: '日期',
              dataIndex: 'createTime',
              width: 136,
            },
            {
              title: '操作人',
              dataIndex: 'createName',
              width: 90,
            },
            {
              title: '操作内容',
              dataIndex: 'trackRecord',
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default Component;
