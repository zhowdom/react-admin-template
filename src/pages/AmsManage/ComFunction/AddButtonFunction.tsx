import ProForm, { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { methodsBindMM } from '@/services/pages/AmsManage/comFunction';
import { useState } from 'react';
import { Alert, Button } from 'antd';
import { EditableProTable } from '@ant-design/pro-components';
import { getUuid } from '@/utils/pubConfirm';
const Comp: React.FC<{
  reload: any;
}> = ({ reload }) => {
  const [tabsList, tabsListSet] = useState([
    {
      menuIds: '',
      methodIds: '',
      tempId: getUuid(),
    },
  ]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    tabsList.map((item) => item.tempId),
  );
  return (
    <ModalForm
      title={'快速添加绑定关系'}
      trigger={<Button type="primary">快速添加绑定关系</Button>}
      width={850}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      initialValues={{
        dataSource: tabsList,
      }}
      onOpenChange={async (visible: boolean) => {
        if (!visible) {
          const data = {
            menuIds: '',
            methodIds: '',
            tempId: getUuid(),
          };
          tabsListSet([data]);
          setEditableRowKeys([data.tempId])
        }
      }}
      onFinish={async (values: any) => {
        const res = await methodsBindMM(values.dataSource);
        if (res?.code != pubConfig.sCodeOrder) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功', 'success');
          reload();
          return true;
        }
      }}
    >
      <Alert
        message="前端CODE为空，提交时会自动过滤掉"
        type="info"
        style={{ marginBottom: '10px' }}
      />
      <ProForm.Item label="" name="dataSource" trigger="onValuesChange">
        <EditableProTable
          rowKey="tempId"
          toolBarRender={false}
          columns={[
            {
              title: '前端CODE',
              dataIndex: 'menuIds',
              align: 'center',
            },
            {
              title: '后端接口URL',
              dataIndex: 'methodIds',
              align: 'center',
            },
          ]}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            record: () => ({
              menuIds: '',
              methodIds: '',
              tempId: getUuid(),
            }),
          }}
          editable={{
            type: 'multiple',
            editableKeys,
            onChange: setEditableRowKeys,
            actionRender: undefined,
          }}
        />
      </ProForm.Item>
    </ModalForm>
  );
};
export default Comp;
