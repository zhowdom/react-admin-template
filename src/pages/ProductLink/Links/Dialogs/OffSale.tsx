import { Col, Form, Modal, Row, Table } from 'antd';
import { ModalForm, ProFormTextArea, ProForm } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { skuSoldOut } from '@/services/pages/link';
import './index.less';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';

const OffSale: React.FC<{
  title?: string;
  reload: any;
  dicList: any;
  data: Record<string, any>;
}> = ({ title, data, reload, dicList }) => {
  const formRef: any = useRef<ProFormInstance>();
  const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>([]);
  const [skuList, skuListSet] = useState<any[]>([]);
  const [editForm] = Form.useForm();
  let columns = [
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
    },
    Table.SELECTION_COLUMN,
  ];
  if (
    data.platform_code == 'TM' ||
    data.platform_code == 'JD_FCS' ||
    data.platform_code == 'JD_POP'
  ) {
    columns = [
      {
        title: 'SKU',
        dataIndex: 'shop_sku_code',
      },
      {
        title: data.platform_code == 'TM' ? '店铺skuID' : '平台商品编码',
        dataIndex: 'shop_sku_id',
      },
      {
        title: '款式名称',
        dataIndex: 'sku_name',
      },
      {
        title: '款式编码',
        dataIndex: 'sku_code',
      },
      {
        title: '异常类型',
        dataIndex: 'exception_type',
        render: (_: any, record: any) =>
          pubFilter(dicList?.LINK_MANAGEMENT_EXCEPTION_TYPE || {}, record.exception_type),
      },
      Table.SELECTION_COLUMN,
    ];
  }
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '12px',
    color: 'rgba(0, 0, 0, 0.85)',
  };

  return (
    <ModalForm
      title={title || 'SKU下架'}
      trigger={<a>下架</a>}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      formRef={formRef}
      width={1000}
      onFinish={async (values) => {
        const res = await skuSoldOut({
          ...values,
          skuList,
          id: data.id,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          selectedRowKeysSet([]);
            skuListSet([]);
            if (reload) reload();
            Modal.warning({
              title: '提示',
              content: <pre style={preStyle}>{res.data}</pre>,
              okText: '我知道了',
              width: 500,
              onOk() {
                return new Promise(async (resolve) => {
                  resolve(true);
                });
              },
            });
            return res.data.indexof('失败') > -1 ? false : true;
        }
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Row>
        <Col span={12}>
          <ProForm.Item label={'链接名称'}>{data.link_name}</ProForm.Item>
        </Col>
        <Col span={12}>
          <ProForm.Item label={'链接ID'}>{data.link_id}</ProForm.Item>
        </Col>
      </Row>
      <ProForm.Item label={'选择SKU'} name={'skuList'}>
        <Table
          rowKey={'id'}
          dataSource={
            data?.linkManagementSkuList.filter(
              (item: any) => item.sales_status != 4 && item.combination == 0,
            ) || []
          }
          size={'small'}
          pagination={false}
          columns={columns}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, options) => {
              selectedRowKeysSet(keys);
              skuListSet(options);
            },
          }}
        />
      </ProForm.Item>
      <ProFormTextArea
        name="sold_out_reason"
        label="下架原因"
        placeholder="请输入下架原因"
        rules={[{ required: true, message: '请输入下架原因' }]}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 20 }}
      />
    </ModalForm>
  );
};
export default OffSale;
