import React from 'react';
import { Form } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { updateBarCode } from '@/services/pages/productList';

const BarCodeEdit: React.FC<{ dataSource: any; reload: any }> = ({ dataSource = [], reload }) => {
  const [editForm] = Form.useForm();
  const editableKeys = dataSource.map((item: any) => item.id);
  return (
    <ModalForm
      title="修改商品条码"
      trigger={<a>修改商品条码</a>}
      layout="horizontal"
      modalProps={{ destroyOnClose: true }}
      initialValues={{ goodsSkus: dataSource }}
      validateTrigger="onBlur"
      onFinish={async (values: any) => {
        const res: any = await updateBarCode(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res.message);
          return;
        }
        pubMsg('修改成功！', 'success');
        if (reload) reload();
        return true;
      }}
    >
      <EditableProTable
        name="goodsSkus"
        request={async () => ({
          data: dataSource,
          success: true,
        })}
        value={dataSource}
        columns={[
          {
            title: '款式名称',
            dataIndex: 'sku_name',
            editable: false,
            width: 280,
          },
          {
            title: 'ERP编码',
            dataIndex: 'erp_sku',
            align: 'center',
            editable: false,
            width: 120,
          },
          {
            title: '商品条码',
            dataIndex: 'bar_code',
            align: 'center',
            formItemProps: () => {
              return {
                rules: [pubRequiredRule],
              };
            },
          },
        ]}
        cardProps={{ bodyStyle: { padding: 0 } }}
        rowKey="id"
        bordered
        recordCreatorProps={false}
        editable={{
          type: 'multiple',
          editableKeys,
          form: editForm,
          actionRender: () => [],
        }}
      />
    </ModalForm>
  );
};
export default BarCodeEdit;
