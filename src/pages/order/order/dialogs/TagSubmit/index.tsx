import { Alert, Button, Modal } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormRadio, CheckCard, ProForm } from '@ant-design/pro-components';
import { useRef } from 'react';
import { pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { updateTagOrder } from '@/services/pages/order';
import { TagsFilled } from '@ant-design/icons';

const TagSubmit: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  ids: string[];
  tags: any[];
}> = ({ title, trigger, reload, ids = [], tags = [] }) => {
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      title={title || `订单标记`}
      trigger={trigger || <Button disabled={ids.length == 0}>标记</Button>}
      labelAlign="right"
      labelCol={{ flex: '0 0 126px' }}
      layout="horizontal"
      width={800}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async ({ optType, orderTagRecords }: any) => {
        const dataForSubmit: any[] = [];
        ids.forEach((id: any) => {
          dataForSubmit.push({
            id,
            optType,
            orderTagRecords: orderTagRecords?.map((item: any) => ({ tag: item })),
          });
        });
        const res = await updateTagOrder(dataForSubmit);
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
      {tags.length == 0 ? (
        <Alert
          style={{ width: '100%', marginBottom: 20 }}
          type={'info'}
          showIcon
          banner
          message={'Tips: 暂无可用的标记, 请点击"标记管理"新建标记后在进行本操作~'}
        />
      ) : null}
      <ProFormRadio.Group
        label={'操作类型'}
        name={'optType'}
        rules={[pubRequiredRule]}
        options={[
          {
            label: '追加',
            value: 1,
          },
          {
            label: '覆盖',
            value: 2,
          },
          {
            label: '清空',
            value: 3,
          },
        ]}
      />
      <ProForm.Item
        label={'选择标记(可多选)'}
        name={'orderTagRecords'}
        rules={[pubRequiredRule]}
        style={{ width: '100%' }}
      >
        <CheckCard.Group size={'small'} multiple style={{ width: '100%' }}>
          {tags.map((item: any) => (
            <CheckCard
              key={item.value}
              value={item.value}
              title={item.label}
              avatar={<TagsFilled style={{ color: item.cssClass || 'grey' }} />}
              size={'small'}
              style={{ width: 180 }}
            />
          ))}
        </CheckCard.Group>
      </ProForm.Item>
    </ModalForm>
  );
};
export default TagSubmit;
