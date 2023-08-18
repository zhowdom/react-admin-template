import { ModalForm } from '@ant-design/pro-form';
import { useState } from 'react';
import { getLogisticsDetails } from '@/services/pages/order/sales-refund';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Spin, Tabs, Timeline } from 'antd';
import ProTable from '@ant-design/pro-table';
import './style.less';
// import { CheckCircleOutlined, UpCircleOutlined } from '@ant-design/icons';

const Comp = (props: any) => {
  const { expressCodes, currentCode, platform } = props;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  // 获取详情数据
  const getDetail = async (expressCode: string): Promise<any> => {
    setLoading(true);
    const res = await getLogisticsDetails({ expressCode });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res.message);
      setLoading(false);
      return;
    }
    setDetail(res.data);
    setLoading(false);
  };

  // 切换tab
  const onChange = (key: string) => {
    getDetail(key);
  };

  const items: any[] = expressCodes.map((v: any, i: number) => ({
    key: v,
    label: `包裹${i + 1}`,
  }));
  const columns1: any[] = [
    {
      title: '商品名称',
      dataIndex: 'skuName',
      align: 'center',
    },
    {
      title: '商品编码',
      dataIndex: 'skuCode',
      width: '200px',
      align: 'center',
    },
    {
      title: '货品编码',
      dataIndex: 'itemCode',
      width: '200px',
      align: 'center',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: '100px',
      align: 'right',
    },
  ];
  const columns2: any[] = [
    {
      title: '长(cm)',
      dataIndex: 'length',
      width: '100px',
      align: 'right',
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      width: '100px',
      align: 'right',
    },
    {
      title: '高(cm)',
      dataIndex: 'height',
      width: '100px',
      align: 'right',
    },
    {
      title: '包裹体积（L）',
      dataIndex: 'volume',
      width: '100px',
      align: 'right',
    },
    {
      title: '理论重量（kg）',
      dataIndex: 'weight',
      width: '100px',
      align: 'right',
    },
    {
      title: '实际重量（kg）',
      dataIndex: 'theoreticalWeight',
      width: '100px',
      align: 'right',
    },
  ];
  return (
    <ModalForm
      title="物流详情"
      trigger={<a>{currentCode}</a>}
      layout="horizontal"
      modalProps={{ destroyOnClose: true, className: 'refund-express-detail' }}
      width={1000}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          getDetail(currentCode);
        }
      }}
      submitter={{
        searchConfig: {
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
    >
      <Tabs defaultActiveKey={currentCode} items={items} onChange={onChange} />
      <Spin spinning={loading}>
        <div>
          <div className="express-title" style={{ marginTop: '20px' }}>发货清单</div>
          <ProTable
            dataSource={detail?.items || []}
            defaultSize="small"
            rowKey="goodsSkuId"
            pagination={false}
            options={false}
            search={false}
            toolBarRender={false}
            cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
            style={{ wordBreak: 'break-all' }}
            bordered
            columns={columns1}
          />
          {platform == 'QIMEN_YUNCANG' ? <>
            <div className="express-title" style={{ marginTop: '20px' }}>
              包裹信息
            </div>
            <ProTable
              defaultSize="small"
              dataSource={
                !detail?.packageInfo || JSON.stringify(detail?.packageInfo) == '{}'
                  ? []
                  : [detail?.packageInfo]
              }
              rowKey="id"
              pagination={false}
              options={false}
              search={false}
              toolBarRender={false}
              cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
              style={{ wordBreak: 'break-all' }}
              bordered
              columns={columns2}
            />
          </> : null}
          <div className="express-title" style={{ marginTop: '18px' }}>
            物流详情
            <span style={{ fontSize: '12px' }}>
              （{detail.expressName}：{detail.expressCode}）
            </span>
          </div>
          <Timeline mode={'left'} style={{ paddingTop: '12px' }}>
            {detail?.traceList?.map((v: any) => (
              <Timeline.Item
                label={v.operationTime}
                key={v.operationTime}
              >
                <div>{v.traceInfo}</div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </Spin>
    </ModalForm>
  );
};
export default Comp;
