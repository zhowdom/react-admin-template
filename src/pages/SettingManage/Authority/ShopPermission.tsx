import { ModalForm, ProFormCheckbox, ProForm } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { Divider, Checkbox } from 'antd';
import { platformShops, updateShopConfig } from '@/services/pages/settinsPermission';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

const ShopPermission: React.FC<{
  user: Record<string, any>;
  open: boolean;
  openSet: any;
  reload: any;
}> = ({ user, open, openSet, reload }) => {
  const formRef = useRef<ProFormInstance>();
  const [shops, shopsSet] = useState<any>({});
  const [indeterminate, setIndeterminate] = useState({});
  const [checkAll, setCheckAll] = useState({});

  const onChange = (list: any[], key: string) => {
    setIndeterminate({ ...indeterminate, [key]: !!list.length && list.length < shops[key].length });
    setCheckAll({ ...checkAll, [key]: list.length === shops[key].length });
  };

  const onCheckAllChange = (e: CheckboxChangeEvent, key: string) => {
    setIndeterminate(false);
    setCheckAll({ ...checkAll, [key]: e.target.checked });
    formRef.current?.setFieldsValue({
      [key]: e.target.checked ? shops[key].map((item: any) => item.id) : [],
    });
  };
  const resetStatue = () => {
    const temp = {};
    Object.keys(indeterminate).forEach((key: string) => (temp[key] = false));
    setIndeterminate(temp);
    Object.keys(checkAll).forEach((key: string) => (temp[key] = false));
    setCheckAll(temp);
  };
  return (
    <ModalForm
      title={'编辑店铺权限'}
      visible={open}
      layout={'horizontal'}
      labelCol={{ flex: '60px' }}
      formRef={formRef}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          resetStatue();
          openSet(false);
        },
      }}
      request={async () => {
        const res = Object.keys(shops).length
          ? { data: shops, code: pubConfig.sCode }
          : await platformShops();
        if (res?.code == pubConfig.sCode) {
          shopsSet({ ...res.data });
          const obj = { ...res.data };
          const hasShops = user?.shopMap || {};
          const initialCheckAll = {};
          const initialIndeterminate = {};
          Object.keys(obj).forEach((key) => {
            initialCheckAll[key] = hasShops[key] ? hasShops[key].length == obj[key].length : false;
            initialIndeterminate[key] = hasShops[key]
              ? hasShops[key].length && hasShops[key].length < obj[key].length
              : false;
            obj[key] = hasShops[key] ? hasShops[key].map((item: any) => item.id) : [];
          });
          setCheckAll(initialCheckAll);
          setIndeterminate(initialIndeterminate);
          return obj;
        } else {
          shopsSet({});
          return {};
        }
      }}
      onFinish={async (values) => {
        let shop_id: string[] = [];
        Object.keys(values).forEach((key) => (shop_id = shop_id.concat(values[key])));
        const res = await updateShopConfig([{ user_id: user.user_id, shop_id }]);
        if (res?.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          resetStatue();
          if (reload) reload();
          openSet(false);
        } else {
          pubMsg(res?.message);
        }
        return false;
      }}
    >
      <ProForm.Item label={'员工姓名'}>{user.name}</ProForm.Item>
      <ProForm.Item label={'职位'}>{user.position || '-'}</ProForm.Item>
      <ProForm.Item label={'店铺'}>
        {Object.keys(shops).map((key) => (
          <div key={key}>
            <ProFormCheckbox.Group
              formItemProps={{
                className: 'checkbox-item',
                labelCol: { flex: '100px' },
                labelAlign: 'right',
              }}
              colon={false}
              fieldProps={{
                onChange: (list: any[]) => onChange(list, key),
              }}
              name={key}
              label={
                <>
                  <Checkbox
                    name={key}
                    indeterminate={!!indeterminate[key]}
                    onChange={(e) => onCheckAllChange(e, key)}
                    checked={!!checkAll[key]}
                  >
                    {key} :
                  </Checkbox>
                </>
              }
              options={shops[key].map((item: any) => ({ label: item.shop_name, value: item.id }))}
            />
            <Divider style={{ margin: '4px 0' }} />
          </div>
        ))}
      </ProForm.Item>
    </ModalForm>
  );
};

export default ShopPermission;
