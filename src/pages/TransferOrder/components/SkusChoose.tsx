import { listCloudWarehouseGoodsSku } from '@/services/pages/transfer';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useState } from 'react';

export default (props: any) => {
  const { callback, formRef } = props;
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  return (
    <ModalForm
      title="添加明细"
      trigger={
        <Button type="primary" ghost icon={<PlusOutlined />}>
          添加明细
        </Button>
      }
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      onVisibleChange={(visible) => {
        // 关闭重置
        if (!visible) {
          setSelectedItems([]);
        } else {
          setSelectedRows(props?.editableKeys);
        }
      }}
      width={1200}
      onFinish={async () => {
        callback(selectedItems);
        return true;
      }}
    >
      <ProTable
        request={async (params): Promise<any> => {
          const res = await listCloudWarehouseGoodsSku({
            ...params,
            platform_warehousing_id: formRef.current.getFieldValue('storage_out').value,
          });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          let data =
            res?.data?.map((v: any) => {
              return { ...v, nums: null };
            }) || [];
          if (params) {
            Object.keys(params).forEach((key) => {
              if (Object.keys(data[0])?.includes(key)) {
                data = data.filter((item: any) => item[key]?.includes(params[key]));
              }
            });
          }
          return {
            data,
            success: true,
          };
        }}
        rowSelection={{
          fixed: true,
          onChange: (selectedRowKeys: any, rowItems: any) => {
            setSelectedRows(selectedRowKeys);
            setSelectedItems(rowItems);
          },
          selectedRowKeys: selectedRows,
        }}
        options={false}
        bordered
        size="small"
        rowKey="id"
        search={{ className: 'light-search-form' }}
        pagination={false}
        columns={[
          {
            title: '商品名称',
            dataIndex: 'sku_name',
            align: 'center',
          },
          {
            title: 'SKU',
            dataIndex: 'sku_code',
            order: 8,
            width: 110,
          },
          {
            title: 'ERP编码',
            dataIndex: 'erp_sku',
            align: 'center',
          },
          {
            title: '库存编码',
            dataIndex: 'stock_no',
            align: 'center',
            width: 130,
          },
        ]}
      />
    </ModalForm>
  );
};
