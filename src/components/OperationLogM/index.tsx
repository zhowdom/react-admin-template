import { ModalForm } from '@ant-design/pro-form';
import OperationLog from '../OperationLog';

export default (props: any) => {
  return (
    <ModalForm
      title={props.title || '日志'}
      trigger={<a>{props.title || '日志'}</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={false}
      width={1200}
    >
      <OperationLog id={props.id} dicList={props.dicList} />
    </ModalForm>
  );
};
