import { Button, Col, Form, Modal, Row } from 'antd';
import { ModalForm, ProFormRadio, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubAlert, pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import { sysCloudWarehousingCloudPage } from '@/services/pages/storageManage';
import { EditableProTable } from '@ant-design/pro-components';
import SkusChoose from './SkusChoose';
import './index.less';
import { insert } from '@/services/pages/transfer';
import { PlusOutlined } from '@ant-design/icons';

export default (props: any) => {
  const formItemLayout1 = {
    labelCol: { span: 0 },
    wrapperCol: { span: 24 },
  };
  const [tableData, setTableData] = useState([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([1]);
  const formRef = useRef<ProFormInstance>();
  const _ref = useRef();
  const [editForm] = Form.useForm();
  const [detailsShow, setDetailsShow] = useState(false);
  const callback = (data: any[]) => {
    console.log(data);
    const newData: any = formRef?.current?.getFieldValue('details') || [];
    data.forEach((element: any) => {
      console.log(element.id);
      console.log(!newData.find((v: any) => v.id == element.id));
      if (!newData.find((v: any) => v.id == element.id)) {
        newData.push(element);
      }
    });
    console.log(newData);
    formRef?.current?.setFieldsValue({
      details: newData,
    });
    setEditableRowKeys(newData?.map((v: any) => v.id));
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="新建调拨单"
      trigger={
        <Button type="primary" ghost>
          新建调拨单
        </Button>
      }
      labelAlign="right"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 16 }}
      layout="horizontal"
      formRef={formRef}
      onVisibleChange={(visible) => {
        // 关闭重置
        if (!visible) {
          setTableData([]);
          setEditableRowKeys([]);
        }
      }}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={1200}
      onFinish={(values: any) => {
        return Promise.all([editForm.validateFields()])
          .then(async () => {
            const postData = {
              ...values,
              details: values.details.map((v: any) => {
                return {
                  ...v,
                  goods_sku_id: v.id,
                };
              }),
              platform_warehousing_out_id: values?.storage_out?.value,
              platform_warehousing_in_id: values?.storage_in?.value,
            };
            delete postData.storage_in;
            delete postData.storage_out;
            const res = await insert(postData);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return false;
            } else {
              pubMsg('新建成功!', 'success');
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
      <Row gutter={20}>
        <Col span={12}>
          <ProFormSelect
            name="storage_out"
            label="调出仓库"
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
              onChange: (val) => {
                setDetailsShow(!!val?.value);
              },
            }}
            request={async () => {
              const res = await sysCloudWarehousingCloudPage({
                current_page: 1,
                page_size: 999,
                status: 1,
              });
              if (res && res.code == pubConfig.sCode) {
                const data = res.data.records.map((item: any) => ({
                  ...item,
                  label: item.warehousing_name,
                  value: item.id,
                }));
                return data;
              }
              return [];
            }}
            rules={[
              { required: true, message: '请选择调出仓库' },
              ({}) => ({
                validator(_, value) {
                  if (JSON.stringify(value) === '{}') {
                    return Promise.reject(new Error('请选择调出仓库'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="storage_in"
            label="调入仓库"
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
            request={async () => {
              const res = await sysCloudWarehousingCloudPage({
                current_page: 1,
                page_size: 999,
                status: 1,
              });
              if (res && res.code == pubConfig.sCode) {
                const data = res.data.records.map((item: any) => ({
                  ...item,
                  label: item.warehousing_name,
                  value: item.id,
                }));
                return data;
              }
              return [];
            }}
            rules={[
              { required: true, message: '请选择调入仓库' },
              ({}) => ({
                validator(_, value) {
                  if (JSON.stringify(value) === '{}') {
                    return Promise.reject(new Error('请选择调入仓库'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
        <Col span={12} className="item0">
          <ProFormRadio.Group
            disabled
            rules={[{ required: true, message: '请选择调拨类型' }]}
            label="调拨类型"
            name="bill_type"
            initialValue={'2'}
            options={[
              {
                label: '虚拟调拨',
                value: '1',
              },
              {
                label: '实物调拨',
                value: '2',
              },
            ]}
          />
        </Col>
        <Col span={12} className="item0">
          <ProFormText name="reason" label="调拨原因" />
        </Col>

        <Col span={24}>
          <Form.Item
            label=""
            {...formItemLayout1}
            name="details"
            rules={[{ required: true, message: '请选择添加明细' }]}
          >
            <EditableProTable
              headerTitle={
                !detailsShow ? (
                  <Button
                    type="primary"
                    ghost
                    icon={<PlusOutlined />}
                    onClick={() => {
                      pubAlert('请选择调出仓库');
                    }}
                  >
                    添加明细
                  </Button>
                ) : (
                  <SkusChoose
                    callback={callback}
                    key="choose"
                    editableKeys={editableKeys}
                    formRef={formRef}
                  />
                )
              }
              bordered
              size="small"
              rowKey="id"
              recordCreatorProps={false}
              editable={{
                type: 'multiple',
                editableKeys,
                form: editForm,
                onDelete: (key: string) => {
                  const _refC: any = _ref?.current;
                  _refC?.setSelected(key);
                },
                actionRender: (row, config, defaultDoms) => {
                  return [defaultDoms.delete];
                },
                onChange: (editableKeyss) => {
                  setEditableRowKeys(editableKeyss);
                },
                onValuesChange: (record, recordList) => {
                  formRef?.current?.setFieldsValue({
                    details: recordList,
                  });
                },
              }}
              columns={[
                {
                  title: '商品名称',
                  dataIndex: 'sku_name',
                  align: 'center',
                  editable: false,
                },
                {
                  title: 'SKU',
                  dataIndex: 'sku_code',
                  align: 'center',
                  editable: false,
                },

                {
                  title: '可调拨数量',
                  dataIndex: 'available_num',
                  align: 'center',
                  editable: false,
                },
                {
                  title: '调拨数量',
                  dataIndex: 'nums',
                  align: 'center',
                  formItemProps: (form: any, config: any) => {
                    return {
                      rules: [
                        {
                          validator(a: any, value: any) {
                            const reg = /^[0-9]*[1-9][0-9]*$/;
                            if (!value && value != 0) {
                              return Promise.reject(new Error('调拨数量不能为空'));
                            }
                            if (!reg.test(value)) {
                              return Promise.reject(new Error('只能填写大于0的整数'));
                            }
                            if (config.entity.available_num < value) {
                              return Promise.reject(new Error('不能大于可调拨数量'));
                            }
                            return Promise.resolve();
                          },
                        },
                      ],
                    };
                  },
                  valueType: 'digit',
                },
                {
                  title: '操作',
                  valueType: 'option',
                  width: 80,
                  align: 'center',
                  render: () => [<a key="delete">删除</a>],
                },
              ]}
              dataSource={tableData || [{}]}
            />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
};
