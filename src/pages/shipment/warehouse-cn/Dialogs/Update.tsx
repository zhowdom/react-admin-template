import { Modal } from 'antd';
import { ProFormInstance, ProFormSelect } from '@ant-design/pro-form';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { insert, update } from '@/services/pages/shipment/warehousecN';

const Component: React.FC<{
  reload: any;
  tabStatus: any;
  _ref: any;
  dicList: any;
}> = ({ _ref, reload, tabStatus, dicList }) => {
  const formRef = useRef<ProFormInstance>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialValues, setInitialValues] = useState<any>();
  _ref.current = {
    visibileChange: (visible: boolean, record: any) => {
      setInitialValues(record);
      setTimeout(() => {
        setIsModalVisible(visible);
      }, 100);
    },
  };
  return (
    <ModalForm
      title={initialValues ? '编辑' : '新增'}
      labelAlign="right"
      labelCol={{ flex: '0 0 90px' }}
      layout="horizontal"
      width={550}
      grid
      visible={isModalVisible}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        onCancel: () => {
          setIsModalVisible(false);
        },
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        let api = insert;
        values.platform_code = tabStatus;
        if (initialValues?.id) {
          values.id = initialValues.id;
          api = update;
        }
        const res = await api(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubMsg(res?.message || '操作成功', 'success');
        reload();
        setIsModalVisible(false);
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
      initialValues={initialValues ? { ...initialValues, status: initialValues?.status + '' } : {}}
    >
      <ProFormText hidden name="id" label="id" />
      <ProFormText
        colProps={{ span: 24 }}
        name="warehouse_code"
        label="仓库代码"
        fieldProps={{ maxLength: 200 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="warehouse_name"
        label="仓库名称"
        fieldProps={{ maxLength: 200 }}
        rules={[pubRequiredRule]}
      />
      {tabStatus != 'HUIYE' && (
        <ProFormText
          colProps={{ span: 24 }}
          name="signing_company"
          label="签约公司"
          fieldProps={{ maxLength: 200 }}
          rules={[pubRequiredRule]}
        />
      )}
      <ProFormSelect
        name="status"
        label="状态"
        valueEnum={dicList?.SYS_ENABLE_STATUS}
        placeholder="请选择状态"
        rules={[{ required: true, message: '请选择状态' }]}
      />
    </ModalForm>
  );
};
export default Component;
