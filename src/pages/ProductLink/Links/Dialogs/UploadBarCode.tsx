import { Col, Form, Modal, Row } from 'antd';
import { ModalForm } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import type { ActionType } from '@ant-design/pro-table';
import { useRef, useState } from 'react';
import ComUpload from './customUpload';
import './index.less';
import { uploadSkuFiles, findById } from '@/services/pages/link';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

export default (props: any) => {
  const ref: any = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [editableKeys, setEditableKeys] = useState([]);
  const formItemLayout1 = {
    labelCol: { span: 3 },
    wrapperCol: { span: 20 },
  };
  return (
    <ModalForm
      title="上传条码文件"
      trigger={<a>上传条码文件</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          const res = await findById({ id: props?.record?.id });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          } else {
            const skuList =
              res?.data?.linkManagementSkuList?.filter((v: any) => v.combination != 1) || [];
            formRef.current?.setFieldsValue({
              skuList: skuList,
            });
            setEditableKeys(skuList?.map((v: any) => v.id));
          }
        }
      }}
      formRef={formRef}
      width={800}
      onFinish={async (values) => {
        return Promise.all([editForm.validateFields()])
          .then(async () => {
            const res = await uploadSkuFiles({
              ...values,
              id: props?.record?.id,
            });
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return false;
            } else {
              pubMsg('提交成功!', 'success');
              props.reload();
              return true;
            }
          })
          .catch(() => {
            Modal.warning({
              title: '提示',
              content: '请上传条码文件',
            });
          });
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        Modal.warning({
          title: '提示',
          content: '请上传条码文件',
        });
      }}
    >
      <Row>
        <Col span={12}>
          <Form.Item label="链接名：" name="links">
            {props?.record?.link_name}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="链接ID" name="links">
            {props?.record?.link_id}
          </Form.Item>
        </Col>
        <Col span={24} className="edit-table bar-code">
          <Form.Item
            label={
              props.record?.platform_code == 'AMAZON_SC'
                ? 'FNSKU条码'
                : props.record?.platform_code == 'WALMART'
                ? 'UPC条码'
                : '69码'
            }
            name="skuList"
            {...formItemLayout1}
            labelAlign="right"
          >
            <EditableProTable
              bordered
              rowKey="id"
              actionRef={ref}
              size="small"
              recordCreatorProps={false}
              onChange={(editableRows) => {
                formRef?.current?.setFieldsValue({
                  skuList: editableRows,
                });
              }}
              editable={{
                type: 'multiple',
                editableKeys,
                form: editForm,
                actionRender: (row, config, defaultDoms) => {
                  return [defaultDoms.delete];
                },
                onValuesChange: (record, recordList) => {
                  console.log(recordList, 'recordList');
                  formRef?.current?.setFieldsValue({
                    skuList: recordList,
                  });
                },
              }}
              columns={[
                {
                  title:
                    props.record?.platform_code == 'AMAZON_SC'
                      ? 'SFNSKU'
                      : props.record?.platform_code == 'WALMART' ||
                        props.record?.platform_code == 'AMAZON_VC'
                      ? 'UPC'
                      : '69码',
                  dataIndex:
                    props.record?.platform_code == 'AMAZON_SC' ? 'amazon_fnsku' : 'bar_code',
                  editable: false,
                },
                {
                  title: 'SKU',
                  dataIndex: 'sku_code',
                  editable: false,
                },
                {
                  title: '条码文件',
                  dataIndex: 'sys_files',
                  formItemProps: {
                    rules: [{ required: true, message: '请上传条码文件' }],
                  },
                  renderFormItem: (_: any) => {
                    const data = formRef?.current?.getFieldValue('skuList');
                    return <ComUpload sys_files={data?.[_?.index]?.sys_files || []} key="upload" />;
                  },
                },
              ]}
              dataSource={[]}
            />
          </Form.Item>
          <div className="sku-tip" style={{ color: 'red' }}>
            请上传前务必检查清楚文件内容，错误上传会导致供应商错误发货！
          </div>
        </Col>
      </Row>
    </ModalForm>
  );
};
