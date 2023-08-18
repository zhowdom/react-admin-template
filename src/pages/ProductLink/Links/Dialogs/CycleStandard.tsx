import { Button, Card, Modal } from 'antd';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import './index.less';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { updateReviewStandard, getReviewStandard } from '@/services/pages/link';
import { useRef } from 'react';
import type { ProFormInstance } from '@ant-design/pro-form';

export default (props: any) => {
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      title="生命周期评审标准"
      trigger={
        <Button type="primary" ghost>
          周期评审标准
        </Button>
      }
      labelAlign="right"
      labelCol={{ span: 4 }}
      layout="horizontal"
      formRef={formRef}
      modalProps={{
        okText: '全部保存',
        cancelText: '返回',
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={800}
      className="cycle-standard"
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          const res = await getReviewStandard({});
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          } else {
            formRef.current?.setFieldsValue(res.data || {});
          }
        }
      }}
      onFinish={async (values: any) => {
        const res = await updateReviewStandard(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功!', 'success');
          props?.reload();
          return true;
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Card
        title={
          <>
            <span className="weight">M1</span>评审标准
          </>
        }
        type="inner"
        size="small"
      >
        <ProFormSelect
          rules={[{ required: true, message: '请选择评审周期' }]}
          wrapperCol={{
            span: 8,
          }}
          tooltip="上架时间距离现在的时间"
          valueEnum={props?.dicList.LINK_MANAGEMENT_REVIEW_CYCLE}
          name="m2"
          label="评审周期"
        />
      </Card>
      <Card
        title={
          <>
            <span className="weight">M2</span>评审标准
          </>
        }
        className="m20"
        type="inner"
        size="small"
      >
        <ProFormSelect
          rules={[{ required: true, message: '请选择评审周期' }]}
          tooltip="距离上一次评审的时间"
          valueEnum={props?.dicList.LINK_MANAGEMENT_REVIEW_CYCLE}
          wrapperCol={{
            span: 8,
          }}
          name="m3"
          label="评审周期"
        />
      </Card>
      <Card
        title={
          <>
            <span className="weight">Mn</span>评审标准
          </>
        }
        className="m20"
        type="inner"
        size="small"
      >
        <ProFormSelect
          rules={[{ required: true, message: '请选择评审周期' }]}
          tooltip="距离上一次评审的时间"
          valueEnum={props?.dicList.LINK_MANAGEMENT_REVIEW_CYCLE}
          wrapperCol={{
            span: 8,
          }}
          name="mn"
          label="评审周期"
        />
      </Card>
    </ModalForm>
  );
};
