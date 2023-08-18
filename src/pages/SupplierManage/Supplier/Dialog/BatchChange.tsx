import { useRef } from 'react';
import { Col, Form, Row } from 'antd';
import { ProFormTextArea } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormText } from '@ant-design/pro-form';
import { ProFormSelect } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetUserList } from '@/utils/pubConfirm';
import { transferAction } from '@/services/pages/supplier';

const BatchChange = (props: any) => {
  const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const formItemLayout1 = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
  };
  const formRef = useRef<ProFormInstance>();
  props.bRef.current = {
    submit: () => {
      formRef?.current?.submit();
    },
  };
  const columns: any[] = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '产品线',
      dataIndex: 'productionLine',
      align: 'center',
    },
    {
      title: '合作状态',
      dataIndex: 'vendor_status',
      align: 'center',
      render: (_, record: any) => {
        const item = props.dicList.VENDOR_COOPERATION_STATUS;
        const key = record?.vendor_status;
        return [<span key="vendor_status">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '入驻时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
    },
  ];

  // 提交数据
  const updateForm = async (data: any) => {
    const postData = {
      remarks: data.remarks,
      receiveName: data.person.name,
      receiveId: data.person.value,
      vendorId: props.selectItems.map((v: any) => v.id).join(','),
    };
    console.log(postData);
    const res = await transferAction(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      formRef?.current?.setFieldsValue({
        liability_name: data.name,
      });
      props.handleClose();
      pubMsg('变更成功', 'success');
    }
  };
  return (
    <>
      <ProForm
        style={{ padding: ' 0 20px' }}
        formRef={formRef}
        onFinish={async (values) => {
          updateForm(values);
        }}
        labelAlign="right"
        {...formItemLayout}
        submitter={false}
        layout="horizontal"
        initialValues={{
          liability_name: props.selectItems[0].liability_name,
        }}
      >
        <Row gutter={10}>
          <Col span={12}>
            <ProFormText name="liability_name" label="原开发" readonly />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="person"
              label="新开发:"
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
                console.log(res);
                return res;
              }}
              rules={[
                { required: true, message: '请选择新开发' },
                ({}) => ({
                  validator(_, value) {
                    if (JSON.stringify(value) === '{}') {
                      return Promise.reject(new Error('请选择新开发'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            />
          </Col>
        </Row>
        <ProFormTextArea
          {...formItemLayout1}
          rules={[{ required: true, message: '请输入变更说明' }]}
          name="remarks"
          label="变更说明"
          fieldProps={{ rows: 6 }}
        />
        <Form.Item {...formItemLayout1} label="供应商列表">
          <ProTable
            columns={columns}
            pagination={false}
            dataSource={props.selectItems}
            search={false}
            rowKey="id"
            bordered
            dateFormatter="string"
            headerTitle={false}
            toolBarRender={false}
          />
        </Form.Item>
      </ProForm>
    </>
  );
};
export default BatchChange;
