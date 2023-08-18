import { useState } from 'react';
import { Modal} from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { findWarehousingOrderNextBatch } from '@/services/pages/cn-sales';

const Dialog = (props: any) => {
  const { dicList } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState<any>([]);
  // 关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };
  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    const res = await findWarehousingOrderNextBatch(params);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setDataSource(res?.data)
  };
  props.lastInstockTimeModel.current = {
    open: (data: any) => {
      setIsModalVisible(true);
      getList(data);
    },
  };

  const columns: any = [
      {
        title: '入库单号',
        dataIndex: 'orderNo',
        width: 140,
      },
      {
        title: '平台入库单号',
        dataIndex: 'platformWarehousingOrderNo',
      },
      {
        title: '平台',
        dataIndex: 'platformName',
        width: 100,
        align: 'center',
      },
      {
        title: '入库状态',
        dataIndex: 'approvalStatus',
        valueEnum: dicList?.WAREHOUSING_ORDER_STATUS,
        width: 80,
        align: 'center',
      },
      {
        title: '预计入库数量',
        dataIndex: 'deliveryPlanCurrentNum',
        width: 100,
        align: 'center',
      },
      {
        title: '要求平台入库时间',
        dataIndex: 'requiredWarehousingTime',
        width: 120,
        align: 'center',
      },
      {
        title: '预计平台入库时间',
        dataIndex: 'platformAppointmentTime',
        width: 120,
        align: 'center',
      },
    ];
  return (
    <Modal
      width={900}
      title="下批到仓时间"
      open={isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
    >
    <ProTable
      headerTitle={false}
      rowKey={(record: any) => record.orderNo}
      bordered
      columns={columns}
      options={false}
      pagination={false}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      search={false}
      dataSource={dataSource}
      showSorterTooltip={false}
      cardProps={{ bodyStyle: { padding: 0 } }}
    />
    </Modal>
  );
};
export default Dialog;
