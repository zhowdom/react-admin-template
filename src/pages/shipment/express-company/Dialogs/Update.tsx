import { Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormRadio, ProFormText } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import {
  orderDeliveryExpressCompanyInsert,
  orderDeliveryExpressCompanyUpdate,
} from '@/services/pages/shipment';

const Component: React.FC<{
  open: boolean;
  openSet: any;
  reload: any;
  dicList: any;
  initialValues?: any;
}> = ({ reload, initialValues, dicList, open, openSet }) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={initialValues?.id ? '修改 - 快递公司' : '新增 - 快递公司'}
      open={open}
      onOpenChange={openSet}
      labelAlign="right"
      labelCol={{ flex: '0 0 120px' }}
      layout="horizontal"
      width={460}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        let api = orderDeliveryExpressCompanyInsert;
        if (initialValues?.id) {
          values.id = initialValues.id;
          api = orderDeliveryExpressCompanyUpdate;
        }
        const res = await api(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功', 'success');
        reload();
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
      initialValues={
        initialValues ? { ...initialValues, status: initialValues.status.toString() } : {}
      }
    >
      <ProFormText
        colProps={{ span: 24 }}
        name="express_short"
        label="快递简称"
        fieldProps={{ maxLength: 50 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="express_code"
        label="快递编码"
        fieldProps={{ maxLength: 50 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="jd_docking_code"
        label="京东平台对接码"
        fieldProps={{ maxLength: 50 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="tm_docking_code"
        label="天猫平台对接码"
        fieldProps={{ maxLength: 50 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="dy_docking_code"
        label="抖音平台对接码"
        fieldProps={{ maxLength: 50 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="cainiao_docking_code"
        label="菜鸟仓对接码"
        fieldProps={{ maxLength: 50 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="wln_docking_code"
        label="万里牛云仓对接码"
        fieldProps={{ maxLength: 50 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="qm_docking_code"
        label="奇门云仓对接码"
        fieldProps={{ maxLength: 50 }}
        rules={[pubRequiredRule]}
      />
      <ProFormText
        colProps={{ span: 24 }}
        name="jdwh_docking_code"
        label="京东仓对接码"
        fieldProps={{ maxLength: 50 }}
        rules={[pubRequiredRule]}
      />
      <ProFormRadio.Group
        colProps={{ span: 24 }}
        name="status"
        label="状态"
        rules={[pubRequiredRule]}
        valueEnum={dicList?.SYS_ENABLE_STATUS || {}}
      />
    </ModalForm>
  );
};
export default Component;
