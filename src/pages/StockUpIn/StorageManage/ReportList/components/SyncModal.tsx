import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import { pubFreeGetStoreList } from '@/utils/pubConfirm';
import { Button } from 'antd';
import { syncAmazon, syncWalmart } from '@/services/pages/stockUpIn/storageManage/reportList';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
export default (props: any) => {
  const pubGetStoreListAction = async () => {
    const res: any = await pubFreeGetStoreList({ business_scope: 'IN' });
    return res.filter((v: any) => props.platform_name.split(',').includes(v.platform_name));
  };
  return (
    <ModalForm
      title="请选择店铺"
      labelAlign="right"
      layout="horizontal"
      onFinish={async (values: any) => {
        const res =
          props.platform_name != 'Walmart' ? await syncAmazon(values) : await syncWalmart(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功!', 'success');
          props.reload();
          return true;
        }
      }}
      style={{ marginTop: '20px' }}
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      trigger={<Button type="primary">库存同步</Button>}
      width={450}
    >
      <ProFormSelect
        name="shop_id"
        label=""
        labelCol={{ span: 0 }}
        request={pubGetStoreListAction}
        rules={[{ required: true, message: '请选择店铺' }]}
        placeholder="请选择店铺"
        showSearch
        allowClear
      />
    </ModalForm>
  );
};
