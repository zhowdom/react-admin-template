import { pubGetUserList } from '@/utils/pubConfirm';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Button, Col, Row } from 'antd';
import { Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { transfer } from '@/services/pages/purchaseOrder';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Turn = (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const transferAction = async (postData: any) => {
    setLoading(true);
    const res: any = await transfer(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
    } else {
      pubMsg('转出成功', 'success');
      setLoading(false);
      props.handleClose(true);
    }
  };
  return (
    <ProForm
      formRef={formRef}
      onFinish={async (values) => {
        const ids = props.items.join(',');
        const postData = {
          id: ids,
          receive_id: values?.person.value,
          receive_name: values?.person.name,
        };
        transferAction(postData);
      }}
      labelAlign="left"
      submitter={{
        render: (_) => {
          return [
            <div key="wrapper" style={{ textAlign: 'center' }}>
              <Space size={30}>
                <Button key="rest" onClick={() => props.handleClose()}>
                  取消
                </Button>
                <Button
                  type="primary"
                  key="submit"
                  onClick={() => _.form?.submit?.()}
                  loading={loading}
                  disabled={loading}
                >
                  确定
                </Button>
              </Space>
            </div>,
          ];
        },
      }}
      layout="horizontal"
    >
      <Row>
        <Col span={24}>
          <ProFormSelect
            name="person"
            label=""
            showSearch
            debounceTime={300}
            placeholder="请选择转接采购员"
            rules={[
              { required: true, message: '请选择转接采购员' },
              ({}) => ({
                validator(_, value) {
                  if (JSON.stringify(value) === '{}') {
                    return Promise.reject(new Error('请选择转接采购员'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
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
          />
        </Col>
      </Row>
    </ProForm>
  );
};
export default Turn;
