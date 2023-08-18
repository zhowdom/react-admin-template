import React, { useRef, useState } from 'react';
import ProTable from '@ant-design/pro-table';
import { Modal } from 'antd';
import { Form, Row, Col } from 'antd';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { ProFormSelect } from '@ant-design/pro-form';
import { findGoodsSkuToVendor, findSelectChangePrice } from '@/services/pages/cooperateProduct';
import ChangePrice from './ChangePrice';
/*根据商品skuID选择供应商, 然后选择供应商的关联sku*/
const SelectSkuByVendor: React.FC<{
  dataSource: any;
  reload: any;
  title?: any;
  dicList: any;
}> = ({ dataSource, reload, title, dicList }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const actionRef = useRef<any>();
  // 关闭
  const modalClose = () => {
    setSelectedRows([]);
    setIsModalVisible(false);
  };
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };
  const requiredRule = { required: true, message: '必填项' };

  const getList = async (params: any): Promise<any> => {
    const res: any = await findSelectChangePrice(params);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setTableData(res.data);
  };

  return (
    <>
      <a
        key="changePriceModal"
        onClick={() => {
          setIsModalVisible(true);
          setTableData([]);
        }}
      >
        {title || '价格变更'}
      </a>
      <Modal
        title={title || '商品选择'}
        visible={isModalVisible}
        width={800}
        onCancel={modalClose}
        destroyOnClose
        footer={[
          <ChangePrice
            key="changePriceSave"
            title={'确认选择'}
            priceDetailList={selectedRows}
            dataSource={selectedVendor}
            dicList={dicList}
            reset={actionRef?.current?.reset}
            reload={() => {
              reload();
              modalClose();
            }}
          />,
        ]}
      >
        <Form>
          <Row>
            <Col span={12}>
              <Form.Item label="产品名称" {...formItemLayout}>
                {dataSource?.name_cn}
              </Form.Item>
            </Col>
            <Col span={12}>
              <ProFormSelect
                label={'供应商'}
                name={'vendor_id'}
                rules={[requiredRule]}
                fieldProps={{
                  showSearch: true,
                  onChange: (v: any, t: any) => {
                    getList({ goods_sku_id: dataSource?.id, vendor_id: v });
                    setSelectedVendor(t);
                  },
                }}
                request={async () => {
                  const res = await findGoodsSkuToVendor({ goods_sku_id: dataSource?.id });
                  if (res?.code != pubConfig.sCode) {
                    pubMsg(res?.message);
                    return [];
                  }
                  return res.data.map((item: any) => {
                    return {
                      label: item.vendor_name,
                      value: item.vendor_id,
                    };
                  });
                }}
              />
            </Col>
          </Row>
        </Form>
        <ProTable
          actionRef={actionRef}
          search={false}
          dataSource={tableData}
          pagination={false}
          columns={[
            {
              title: '款式编码',
              dataIndex: 'sku_code',
              align: 'center',
              editable: false,
            },
            {
              title: '商品名称',
              dataIndex: 'sku_name',
              align: 'center',
              width: 250,
              hideInSearch: true,
            },
            {
              title: 'ERP编码',
              dataIndex: 'erp_sku',
              align: 'center',
              editable: false,
            },
            {
              title: '采购价格',
              dataIndex: 'before_price',
              align: 'center',
              width: 100,
              hideInSearch: true,
            },
            {
              title: '结算币种',
              dataIndex: 'before_currency',
              align: 'center',
              width: 100,
              hideInSearch: true,
              valueEnum: dicList?.SC_CURRENCY,
            },
          ]}
          rowKey="id"
          bordered
          toolBarRender={false}
          options={false}
          cardProps={{ bodyStyle: { padding: 0 } }}
          rowSelection={{
            onChange: (_, rows: any) => {
              setSelectedRows(rows);
            },
          }}
        />
      </Modal>
    </>
  );
};
export default SelectSkuByVendor;
