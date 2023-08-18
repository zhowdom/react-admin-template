import { Button } from 'antd';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useRef } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { enumRangeType } from '@/pages/SettingManage/Authority/Dialogs/TagBatch';
import { syncRangeType } from '@/services/pages/settinsPermission';
const enumRangeTypeFilter = { ...enumRangeType };
Reflect.deleteProperty(enumRangeTypeFilter, '-');
// 同步产品线
const SyncTagUser: React.FC<{
  reload: any;
}> = ({ reload }) => {
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      width={400}
      formRef={formRef}
      layout={'inline'}
      title="同步产品线"
      trigger={<Button type={'primary'}>{'同步产品线'}</Button>}
      onFinish={async (values: any) => {
        const res = await syncRangeType(values);
        if (res.code == pubConfig.sCode) {
          pubMsg(res?.message || '同步成功!', 'success');
          if (typeof reload === 'function') reload();
          return true;
        } else {
          pubMsg(`操作失败: ${res.message}`);
          return false;
        }
      }}
      modalProps={{
        destroyOnClose: true,
      }}
    >
      <ProFormSelect
        label={'同步范围'}
        name={'range_type'}
        fieldProps={{
          allowClear: false,
        }}
        initialValue={'CN/IN'}
        valueEnum={enumRangeTypeFilter}
      />
    </ModalForm>
  );
};
export default SyncTagUser;
