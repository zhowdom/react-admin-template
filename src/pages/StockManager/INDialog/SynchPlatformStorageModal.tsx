import { ModalForm, ProFormDatePicker, ProFormDigit, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { Col, Row, Space } from 'antd';
import moment from 'moment';
import { useRef } from 'react';
import * as api from '@/services/pages/stockManager';
import { pubConfig, pubMsg, pubModal } from '@/utils/pubConfig';
// 2.手动入库
const SynchPlatformStorageModal: React.FC<{ dataSource: any; reload: any }> = ({
  dataSource,
  reload,
}) => {
  const formRef3 = useRef<ProFormInstance>(); // 弹框form
  const rulesRequired: any = [{ required: true, message: '必填' }];
  const InnerTable: React.FC<{ orderSkuList: any[] }> = ({ orderSkuList }) => {
    const columns: any[] = [
      {
        title: '商品名称',
        dataIndex: 'sku_name',
        align: 'center',
        width: 120,
      },
      {
        title: 'SKU',
        dataIndex: 'shop_sku_code',
        align: 'center',
        width: 120,
        render: (_: any, record: any) => (
          <div>
            {_}
            {<ProFormText initialValue={dataSource.id} hidden noStyle />}
            {<ProFormText initialValue={record.goods_sku_id} hidden noStyle />}
          </div>
        ),
      },
      {
        title: '每箱数量',
        dataIndex: 'pics',
        align: 'center',
        width: 120,
        render: (_: any, record: any) => {
          return record.specificationList.map((item: any, index: number) => (
            <div key={index}>{item.pics}</div>
          ));
        },
      },
      {
        title: '箱数',
        dataIndex: 'num',
        align: 'center',
        width: 120,
        render: (_: any, record: any) => {
          return record.specificationList.map((item: any, index: number) => (
            <div key={index}>{item.num}</div>
          ));
        },
      },
      {
        title: '发货数量',
        dataIndex: 'orderSkuList',
        align: 'center',
        width: 120,
        render: (_: any, record: any) => {
          return (
            <span>
              {record.specificationList
                ? record.specificationList.reduce(
                    (previousValue: any, currentValue: any) =>
                      previousValue + currentValue.pics * currentValue.num,
                    0,
                  )
                : 0}
            </span>
          );
        },
      },
      {
        title: '到港数量',
        dataIndex: 'arrival_num',
        align: 'center',
        width: 140,
        render: () => dataSource.arrival_num,
      },
      {
        title: '到港时间',
        dataIndex: 'arrival_time',
        align: 'center',
        width: 140,
        render: () => dataSource.arrival_time,
      },
    ];
    return (
      <ProTable
        columns={columns}
        rowKey={'order_id'}
        bordered
        dataSource={orderSkuList}
        cardProps={{ style: { padding: 0 } }}
        showHeader={false}
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        style={{ wordBreak: 'break-all' }}
      />
    );
  };
  const columns: any[] = [
    {
      title: '计划编号',
      dataIndex: 'delivery_plan_no',
      align: 'center',
      width: 120,
      render: (_: any, record: any) => record.delivery_plan_nos || record.delivery_plan_no
    },
    {
      title: '入库单号',
      dataIndex: 'order_no',
      align: 'center',
      width: 120,
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      align: 'center',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 7, style: { padding: 0 } }),
      render: (_: any, record: any) => <InnerTable orderSkuList={record.orderSkuList} />,
    },
    {
      title: 'SKU',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '每箱数量',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '箱数',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '发货数量',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '到港数量',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 140,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '到港时间',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 140,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
  ];
  return (
    <ModalForm
      layout={'horizontal'}
      title="手动入库"
      width={'80%'}
      trigger={<a type={'link'}>{'手动入库'}</a>}
      onFinish={async (values: any) => {
        pubModal(
          <Space>
            <span>平台入库数量: {values.warehousing_num}</span>
            <span>实际入库时间: {values.warehousing_time}</span>
          </Space>,
          '确认提交信息?',
        )
          .then(async () => {
            const res = await api.synchPlatformStorage(values);
            if (res.code == pubConfig.sCode) {
              pubMsg(res?.message, 'success');
              if (typeof reload === 'function') reload();
              return true;
            } else {
              pubMsg(`提交失败: ${res.message}`);
              return false;
            }
          })
          .catch(() => {
            console.log('点击了取消');
          });
      }}
      formRef={formRef3}
      onVisibleChange={async (visible: boolean) => {
        if (!visible) {
          formRef3?.current?.resetFields();
        }
      }}
    >
      <ProTable
        style={{ marginBottom: '12px' }}
        size={'small'}
        columns={columns}
        dataSource={[dataSource]}
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        rowKey={'id'}
        bordered
        scroll={{ x: 1600 }}
      />
      <Row gutter={24}>
        <Col span={8}>
          <ProFormDigit
            fieldProps={{ precision: 0 }}
            label={'平台入库数量'}
            name={'warehousing_num'}
            required
            rules={[
              () => ({
                validator(_, value) {
                  if (!value && value != 0) {
                    return Promise.reject(new Error('请输入平台入库数量'));
                  }
                  if (value > dataSource.arrival_num) {
                    return Promise.reject(new Error('不能大于发货数量'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
        <Col span={8}>
          <ProFormDatePicker
            label={'实际入库时间'}
            name={'warehousing_time'}
            rules={rulesRequired}
            initialValue={moment()}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            hidden
            label={'入库单编号'}
            name={'order_no'}
            initialValue={dataSource.order_no}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};
export default SynchPlatformStorageModal;
