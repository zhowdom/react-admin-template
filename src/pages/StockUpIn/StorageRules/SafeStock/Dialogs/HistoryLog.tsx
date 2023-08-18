import { useState } from 'react';
import { Modal, Spin, Table, Tabs } from 'antd';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { shippingMethodApprovalHistory } from '@/services/pages/link';
import ProTable from '@ant-design/pro-table';
import { auditLogPage } from '@/services/base';
import Detail from '@/components/CommonLogAms/Detail';
const { TabPane } = Tabs;

const Dialog = (props: any) => {
  const { dicList } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [slist, setSlist] = useState<any>([]); // 安全库存
  const [tlist, setTlist] = useState<any>([]); // 运输方式
  // 获取详情数据
  const getDetail = async (cid: any, type: any): Promise<any> => {
    setLoading(true);
    const res = await shippingMethodApprovalHistory({ id: cid, type});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const newData = JSON.parse(JSON.stringify(res.data));
    setTlist(newData);

    const res1 = await auditLogPage({
      businessId: cid,
      businessType: 'SCM_SHIPPINGMETHOD_MANAGE',
      appName: 'liyi99-sc-scm',
    });
    if (res1?.code != '0') {
      pubMsg(res?.message);
      return;
    }
    setSlist(res1.data);
    setLoading(false);
  };

  props.historyLogModel.current = {
    open: (data?: any) => {
      setIsModalVisible(true);
      getDetail(data?.link_management_sku_id, data?.type);
    },
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  return (
    <Modal
      width={1000}
      title={'日志查看'}
      open={isModalVisible}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      footer={false}
    >
      <Spin spinning={loading}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="操作日志" key="1">
            <ProTable
              dataSource={slist || []}
              options={false}
              bordered
              size="small"
              cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
              pagination={false}
              scroll={{ y: 'calc(70vh - 80px)' }}
              search={false}
              columns={[
                {
                  title: '序号',
                  valueType: 'index',
                  align: 'left',
                  width: 60,
                },

                {
                  title: '类型',
                  dataIndex: 'remark',
                  align: 'left',
                },

                {
                  title: '操作人',
                  dataIndex: 'createName',
                  align: 'left',
                },
                {
                  title: '操作时间',
                  dataIndex: 'createTime',
                  align: 'left',
                },
                {
                  title: '操作人IP',
                  dataIndex: 'requestIp',
                  align: 'left',
                },
                {
                  title: '日志详情',
                  key: 'option',
                  width: 80,
                  align: 'left',
                  valueType: 'option',
                  fixed: 'right',
                  className: 'wrap',
                  render: (text: any, record: any) => {
                    return [
                      <Detail
                        key="detail"
                        trigger="详情"
                        auditLogId={record.id}
                        createId={record.createId}
                      />,
                    ];
                  },
                },
              ]}
            />
          </TabPane>
          <TabPane tab="审批记录" key="2">
            <Table
              dataSource={tlist || []}
              pagination={false}
              bordered
              scroll={{ x: '1200px', y: '360px' }}
              columns={[
                {
                  title: '店铺SKU',
                  dataIndex: 'shop_sku_code',
                  align: 'center',
                },
                {
                  title: '修改前',
                  dataIndex: 'before',
                  align: 'center',
                  width: 110,
                  // render: (_: any) =>
                  //   pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD, _),
                  render: (_: any, record: any) =>
                    record.type == 'shipping_method' ? pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD, _) : pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE, _)
                },
                {
                  title: '修改后',
                  dataIndex: 'after',
                  align: 'center',
                  // render: (_: any) =>
                  //   pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD, _),
                  render: (_: any, record: any) =>
                    record.type == 'shipping_method' ? pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD, _) : pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE, _)
                },
                {
                  title: '申请人',
                  dataIndex: 'create_user_name',
                  align: 'center',
                  width: 90,
                },
                {
                  title: '申请时间',
                  dataIndex: 'create_time',
                  align: 'center',
                },
                {
                  title: '申请原因',
                  dataIndex: 'reason',
                  align: 'center',
                  ellipsis: true,
                },
                {
                  title: '处理人',
                  dataIndex: 'approval_user_name',
                  align: 'center',
                  width: 90,
                },
                {
                  title: '处理结果',
                  dataIndex: 'status',
                  align: 'center',
                  width: 90,
                  render: (_: any) =>
                    pubFilter(dicList?.LINK_MANAGEMENT_SKU_SHIPPING_METHOD_APPROVAL_STATUS, _),
                },
                {
                  title: '处理原因',
                  dataIndex: 'approval_remarks',
                  align: 'center',
                },
                {
                  title: '处理日期',
                  dataIndex: 'approval_time',
                  align: 'center',
                  width: 110,
                },
              ]}
            />
          </TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default Dialog;
