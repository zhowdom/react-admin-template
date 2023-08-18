import React, { useRef, useState } from 'react';
import { history } from 'umi';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { findCategoryToValidVendor } from '@/services/pages/cooperateProduct';
import { Form, Row, Col } from 'antd';
import ProTable from '@ant-design/pro-table';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import './style.less';

// 供应商备份弹框
const CopyModal: React.FC<{ data: any; dicList: any }> = (props: any) => {
  const copyFormRef: any = useRef<ProFormInstance>();
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const requiredRule = { required: true, message: '必填项' };
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };
  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  return (
    <ModalForm
      title="供应商备份"
      trigger={<a>供应商备份</a>}
      width={700}
      formRef={copyFormRef}
      layout={'horizontal'}
      onFinish={async (values) => {
        if (!selectedRows.length) return pubMsg('请选择要备份的商品！');
        copyFormRef?.current.resetFields();
        history.push(
          `/products/vendor-backup/price-approval?goods_sku_id=${selectedRows.join(
            ',',
          )}&vendor_id=${values.vendor_id}&copy=1`,
        );
        return true;
      }}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          setTableData([]);
          copyFormRef?.current?.setFieldsValue({ vendor_id: '' });
        }
      }}
    >
      <Row>
        <Col span={12}>
          <Form.Item label="产品名称" {...formItemLayout}>
            {props?.data?.name_cn}
          </Form.Item>
        </Col>
        <Col span={12}>
          <ProFormSelect
            label={'供应商'}
            name={'vendor_id'}
            rules={[requiredRule]}
            params={{ goods_sku_id: props?.data.id }}
            fieldProps={{
              showSearch: true,
              onChange: (v: any, t: any) => {
                setTableData(t?.data?.goodsSkus || []);
              },
            }}
            request={async (params) => {
              const res = await findCategoryToValidVendor(params);
              if (res?.code != pubConfig.sCode) {
                pubMsg(res?.message);
                return [];
              }
              return res.data.map((item: any) => {
                item.goodsSkus = item.goodsSkus.map((v: any) => ({
                  ...v,
                  currency: item.currency,
                }));
                return {
                  label: item.vendor_name,
                  value: item.vendor_id,
                  data: item,
                  disabled: item.is_existed_vendor,
                };
              });
            }}
          />
        </Col>
      </Row>
      {tableData?.length ? (
        <>
          <ProTable
            // actionRef={actionRef}
            dataSource={tableData}
            pagination={false}
            search={false}
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
                title: '生命周期',
                dataIndex: 'life_cycle',
                valueType: 'select',
                align: 'center',
                width: 80,
                order: 4,
                fieldProps: selectProps,
                valueEnum: props?.dicList?.GOODS_LIFE_CYCLE,
                render: (_: any, record: any) => {
                  return pubFilter(props?.dicList.GOODS_LIFE_CYCLE, record?.life_cycle) || '-';
                },
              },
            ]}
            rowKey="id"
            bordered
            toolBarRender={false}
            options={false}
            rowSelection={{
              onChange: (_: any) => {
                setSelectedRows(_);
              },
            }}
          />
          <p style={{ color: '#aaa', marginTop: '8px' }}>
            说明：清仓期的产品不在本页面展示，因清仓期产品不允许备份供应商
          </p>
        </>
      ) : (
        ''
      )}
    </ModalForm>
  );
};
export default CopyModal;
