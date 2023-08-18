import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { closeExceptionIn } from '@/services/pages/stockManager';
import { useRef } from 'react';
import './index.less';
// 关闭异常入库单
const ComponentModal: React.FC<{
  dataSource: any;
  reload: any;
}> = ({ dataSource, reload }) => {
  const formRef = useRef();
  return (
    <ModalForm
      width={500}
      formRef={formRef}
      layout={'horizontal'}
      title={'关闭异常入库单'}
      trigger={<a>{'关闭异常入库单'}</a>}
      labelCol={{ flex: '100px' }}
      onFinish={async (values: any) => {
        const res = await closeExceptionIn({ ...values, order_id: dataSource.id });
        if (res?.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          if (reload) reload();
          return true;
        } else {
          pubMsg(res?.message);
        }
        return false;
      }}
    >
      <div style={{ marginBottom: '12px', marginLeft: '33px' }}>
        入库单号: {dataSource.order_no}
      </div>
      <div style={{ marginBottom: '12px', marginLeft: '33px' }}>
        商品名称: {dataSource.sku_name}
      </div>
      <ProFormText label={'异常原因'} name={'exception_reason'} rules={[pubRequiredRule]} />
      <ProFormTextArea label={'备注'} name={'closed_remark'} rules={[pubRequiredRule]} />
    </ModalForm>
  );
};
export default ComponentModal;
