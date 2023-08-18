import { Button, Modal, Alert } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { updateExceptionTypeOrder } from '@/services/pages/order';

const ExceptionSubmit: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  ids: string[];
  exceptions: any[];
}> = ({ title, trigger, reload, ids = [], exceptions = [] }) => {
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      title={title || `提交异常`}
      trigger={trigger || <Button disabled={ids.length == 0}>提交异常</Button>}
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
            exceptionType: values.exceptionType,
            sysRemark: values.sysRemark,
          });
        });
        const res = await updateExceptionTypeOrder(dataForSubmit);
        if (res?.code != '0') {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '提交成功', 'success');
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
    >
      {exceptions.length == 0 ? (
        <Alert
          type={'info'}
          style={{ width: '100%', marginBottom: 20 }}
          showIcon
          banner
          message={'Tips: 暂无可用异常类型, 请点击"异常管理"新建异常类型后在进行本操作'}
        />
      ) : null}
      <ProFormSelect
        colProps={{ span: 24 }}
        name="exceptionType"
        label="异常类型"
        showSearch
        rules={[pubRequiredRule]}
        options={exceptions}
      />
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'备注说明'}
        placeholder={'请输入备注说明'}
        name={'sysRemark'}
      />
    </ModalForm>
  );
};
export default ExceptionSubmit;
