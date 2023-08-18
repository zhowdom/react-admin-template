import { DrawerForm } from '@ant-design/pro-form';
import Detail from './detail';
const Dialog = (props: any) => {
  return (
    <DrawerForm
      title="采购单详情"
      trigger={props?.title || <a>{'采购单详情'}</a>}
      layout="horizontal"
      width="80%"
      drawerProps={{
        destroyOnClose: true,
      }}
      labelCol={{ flex: '130px' }}
      labelWrap={true}
      submitter={false}
    >
      <Detail id={props.id} dicList={props?.dicList} />
    </DrawerForm>
  );
};

export default Dialog;
