import { Col, Form, Modal, Row } from 'antd';
import type { ProFormInstance, EditableFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormDateTimePicker, EditableProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { getUuid } from '@/utils/pubConfirm';
import './index.less';
import { findBySku, insertLinkSku } from '@/services/pages/link';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

export default (props: any) => {
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const [skuList, setSkuList] = useState([
    {
      tempId: getUuid(),
    },
  ]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(
    skuList.map((v: any) => v.tempId),
  );
  const formRef = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const formItemLayout1 = {
    labelCol: { span: 3 },
    wrapperCol: { span: 20 },
  };

  return (
    <ModalForm
      title={'新增SKU' + ' - ' + props.record.platform_code}
      trigger={<a> 新增sku</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      onVisibleChange={(visible) => {
        // 关闭重置
        if (!visible) {
          const skus = [
            {
              tempId: getUuid(),
            },
          ];
          setSkuList(skus);
          setEditableRowKeys(skus.map((v: any) => v.tempId));
        }
      }}
      formRef={formRef}
      width={1000}
      initialValues={{
        skuList: skuList,
      }}
      onFinish={async (values) => {
        return Promise.all([editForm.validateFields()])
          .then(async () => {
            values.skuList = values.skuList.map((v: any) => {
              return {
                ...v,
                combination: 0,
              };
            });
            const res = await insertLinkSku({
              ...values,
              id: props?.record?.id,
            });
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return false;
            } else {
              pubMsg('新增成功!', 'success');
              props.reload();
              return true;
            }
          })
          .catch(() => {
            Modal.warning({
              title: '提示',
              content: '请检查表单信息正确性',
            });
          });
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Row>
        <Col span={12} className="item10">
          <Form.Item label="链接名：">{props?.record?.link_name || '-'}</Form.Item>
        </Col>
        <Col span={12} className="item10">
          <Form.Item label="链接ID">{props?.record?.link_id || '-'}</Form.Item>
        </Col>
        <Col span={24} className="edit-table item0">
          <Form.Item label="新增sku" {...formItemLayout1} labelAlign="right" required>
            <EditableProTable
              editableFormRef={editorFormRef}
              name="skuList"
              bordered
              rowKey="tempId"
              size="small"
              recordCreatorProps={{
                newRecordType: 'dataSource',
                record: () => {
                  return {
                    tempId: getUuid(),
                    shop_sku_code: '',
                    sku_code: '',
                    sku_name: '',
                  };
                },
              }}
              editable={{
                type: 'multiple',
                editableKeys,
                form: editForm,
                actionRender: (row, config, defaultDoms) => {
                  return [defaultDoms.delete];
                },
                onChange: (editableKeyss) => {
                  setEditableRowKeys(editableKeyss);
                },
              }}
              columns={[
                {
                  title: 'SKU',
                  dataIndex: 'shop_sku_code',
                  align: 'center',
                  formItemProps: {
                    rules: [{ required: true, message: '请输入SKU' }],
                  },
                },
                {
                  title: '对应款式编码',
                  dataIndex: 'sku_code',
                  align: 'center',
                  formItemProps: {
                    rules: [{ required: true, message: '请输入对应款式编码' }],
                  },
                  fieldProps: (form: any, { rowIndex }: any) => {
                    return {
                      onBlur: async (e: any) => {
                        const sku_code = e?.target?.value;
                        if (sku_code) {
                          const res = await findBySku(sku_code);
                          if (res?.code != pubConfig.sCode) {
                            pubMsg(res?.message);
                            return;
                          }
                          if (res?.data) {
                            editorFormRef?.current?.setRowData?.(rowIndex, {
                              sku_name: res.data.sku_name,
                              goods_sku_id: res.data.id,
                            });
                          } else {
                            editorFormRef?.current?.setRowData?.(rowIndex, {
                              sku_name: '',
                              goods_sku_id: '',
                            });
                            pubMsg(`未找到款式编码:"${sku_code}" 对应的款式`);
                          }
                        }
                      },
                    };
                  },
                },
                {
                  title: '款式名称',
                  dataIndex: 'sku_name',
                  align: 'center',
                  editable: false,
                  formItemProps: {
                    rules: [{ required: true, message: '款式名称不能为空' }],
                  },
                },
                {
                  title: '操作',
                  valueType: 'option',
                  width: 80,
                  align: 'center',
                  render: () => [<a key="delete">删除</a>],
                },
              ]}
            />
          </Form.Item>
        </Col>
        {props.record.platform_code == 'WALMART' && (
          <Col span={12} className="item10">
            <ProFormDateTimePicker
              rules={[{ required: true, message: '请选择上架时间' }]}
              name="sales_time"
              label="上架时间"
              wrapperCol={{
                span: 20,
              }}
            />
          </Col>
        )}
        <span className="sku-tip">不允许录入已经存在的SKU</span>
      </Row>
    </ModalForm>
  );
};
