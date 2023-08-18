import { Button, Col, Modal, Row } from 'antd';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import { pubGetUserList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { batchChangeSpread } from '@/services/pages/link';
import { useState } from 'react';

export default (props: any) => {
  const { selectedRow } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="批量变更推广"
      trigger={
        Array.from(new Set(selectedRow?.map((v: any) => v.spread_user_id)))?.length != 1 ? (
          <Button
            type="primary"
            ghost
            disabled={!selectedRow?.length}
            onClick={() => {
              pubMsg('所勾选的链接不是同一推广，请重新勾选', 'warning');
            }}
          >
            批量变更推广
          </Button>
        ) : (
          <Button
            type="primary"
            ghost
            disabled={!selectedRow?.length}
            onClick={() => {
              setIsModalVisible(true)
            }}
          >
            批量变更推广
          </Button>
        )
      }
      labelAlign="right"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 15 }}
      layout="horizontal"
      visible={isModalVisible}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        onCancel: () => {
          setIsModalVisible(false);
        },
      }}
      width={500}
      onFinish={async (values: any) => {
        const postData = {
          spread_user_id: values?.new_spread_user?.value,
          spread_user_name: values?.new_spread_user?.name,
          ids: selectedRow?.map((v: any) => v.id)?.join(','),
        };
        const res = await batchChangeSpread(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('变更成功!', 'success');
          props.reload();
          setIsModalVisible(false)
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Row gutter={20}>
        <Col span={24}>
          <ProFormSelect
            name="new_spread_user"
            label="变更后推广"
            showSearch
            debounceTime={300}
            fieldProps={{
              filterOption: (input: any, option: any) => {
                const trimInput = input.replace(/^\s+|\s+$/g, '');
                if (trimInput) {
                  return option.label.indexOf(trimInput) >= 0;
                } else {
                  return true;
                }
              },
              labelInValue: true,
            }}
            request={async (v) => {
              const res: any = await pubGetUserList(v);
              return res;
            }}
            rules={[
              { required: true, message: '请选择新推广' },
              ({}) => ({
                validator(_, value) {
                  if (JSON.stringify(value) === '{}') {
                    return Promise.reject(new Error('请选择新推广'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};
