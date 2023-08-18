import { Button, Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { updateRemarkOrder } from '@/services/pages/order';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  ids: string[];
}> = ({ title, trigger, reload, ids = [] }) => {
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      title={title || `添加订单备注`}
      trigger={
        trigger || (
          <Button size={'small'} type={'primary'} disabled={ids.length == 0}>
            添加备注
          </Button>
        )
      }
      labelAlign="right"
      labelCol={{ flex: '0 0 80px' }}
      layout="horizontal"
      width={500}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        const dataForSubmit: any[] = [];
        ids.forEach((id: any) => {
          dataForSubmit.push({
            id,
            sysRemark: values.sysRemark,
          });
        });
        const res = await updateRemarkOrder(dataForSubmit);
        if (res?.code != '0') {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '保存成功!', 'success');
        if (reload) reload();
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
    >
      <ProFormTextArea
        colProps={{ span: 24 }}
        name={'sysRemark'}
        rules={[pubRequiredRule]}
        placeholder={'备注内容输入'}
      />
    </ModalForm>
  );
};
export default Component;
