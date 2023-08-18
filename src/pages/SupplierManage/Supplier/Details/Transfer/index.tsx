import { useRef, useState } from 'react';
import { Button, Col, Modal, Row } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormText } from '@ant-design/pro-form';
import { ProFormSelect } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetUserList } from '@/utils/pubConfirm';
import { getTransferHistory, transferAction } from '@/services/pages/supplier';

const Transfer = (props: any) => {
  const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const formRef = useRef<ProFormInstance>();
  // 获取表格数据
  const getListAction = async (): Promise<any> => {
    const postData = {
      vendorId: props.id,
    };
    const res = await getTransferHistory(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data || [],
      success: true,
    };
  };
  const columns: any[] = [
    {
      title: '转让前对接开发',
      dataIndex: 'from_user_name',
      align: 'center',
    },
    {
      title: '转让后对接开发',
      dataIndex: 'to_user_name',
      align: 'center',
    },
    {
      title: '转让时间',
      dataIndex: 'create_time',
      align: 'center',
    },
  ];

  // 关闭
  const handleClose = () => {
    setModalShow(false);
  };
  // 提交操作
  const handleOk = () => {
    formRef?.current?.submit();
  };
  // 提交数据
  const updateForm = async (data: any) => {
    const postData = {
      receiveName: data.name,
      receiveId: data.value,
      vendorId: props.id,
    };
    const res = await transferAction(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      formRef?.current?.setFieldsValue({
        liability_name: data.name,
      });
      // 更新责任人基础信息
      props.onUpdate({
        label: postData.receiveName,
        name: postData.receiveName,
        id: postData.receiveId,
        value: postData.receiveId,
      });
      props.setLab(data.name);
      pubMsg('转让成功', 'success');
      setModalShow(false);
    }
    setLoading(false);
  };
  return (
    <>
      <Button
        onClick={() => {
          setModalShow(true);
        }}
        type="primary"
        key="transfer"
        style={{ zIndex: 1 }}
      >
        供应商转让
      </Button>
      <Modal
        width={1000}
        title="供应商转让"
        visible={modalShow}
        onOk={handleOk}
        onCancel={handleClose}
        destroyOnClose
        maskClosable={false}
        confirmLoading={loading}
        okText={loading ? '提交中' : '确定'}
      >
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            setLoading(true);
            updateForm(values.person);
          }}
          labelAlign="right"
          {...formItemLayout}
          submitter={false}
          layout="horizontal"
          initialValues={{
            liability_name: props.name,
          }}
        >
          <Row gutter={10}>
            <Col span={12}>
              <ProFormText name="liability_name" label="供应商对接开发人" readonly />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="person"
                label="供应商最新对接开发:"
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
                  { required: true, message: '请选择供应商最新对接开发' },
                  ({}) => ({
                    validator(_, value) {
                      if (JSON.stringify(value) === '{}') {
                        return Promise.reject(new Error('请选择供应商最新对接开发'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              />
            </Col>
          </Row>
        </ProForm>
        <h3>供应商转让记录</h3>
        <ProTable
          columns={columns}
          pagination={false}
          request={getListAction}
          search={false}
          rowKey="id"
          bordered
          dateFormatter="string"
          headerTitle="供应商转让记录"
          toolBarRender={false}
        />
      </Modal>
    </>
  );
};
export default Transfer;
