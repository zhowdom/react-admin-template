import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, history } from 'umi';
import { Button, Card, Col, Form, Modal, Popconfirm, Row, Space, Spin } from 'antd';
import { ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormSelect } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { EditableProTable } from '@ant-design/pro-table';
import { getUuid } from '@/utils/pubConfirm';
import './index.less';
import { addLsp, getLspDetail, updateLsp } from '@/services/pages/logisticsManageIn/lsp';

const Page = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const formItemLayout1 = {
    labelCol: { span: 0 },
    wrapperCol: { span: 24 },
  };
  const [editForm] = Form.useForm();
  const id = history?.location?.query?.id;
  const formRef = useRef<ProFormInstance>();
  const [detailData, setDetailData] = useState<any>();
  const [loading] = useState(false);
  const pathObj = {
    '/logistics-manage-in/lsp-add': '新增',
    '/logistics-manage-in/lsp-edit': '编辑',
    '/logistics-manage-in/lsp-detail': '详情',
  };
  const pathname = props.route.path;
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(
    pathObj[pathname] == '详情' ? [] : [1],
  );

  // 详情接口
  const getDetailAction = async () => {
    const res = await getLspDetail({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    const initForm: any =
      {
        ...res?.data,
        status: `${res.data.status}`,
        service_type: `${res.data.service_type}`?.split(','),
        pay_method: `${res.data.pay_method}`,
        bankAccountList: res?.data?.bankAccountList?.map((v: any) => ({ ...v, tempId: getUuid() })),
      } || {};
    setEditableRowKeys(
      pathObj[pathname] == '详情' ? [] : initForm.bankAccountList.map((v: any) => v.tempId),
    );
    setDetailData(initForm);
    formRef?.current?.setFieldsValue({
      ...initForm,
    });
  };
  const getAction = () => {
    if (id) {
      getDetailAction();
    } else {
      formRef?.current?.setFieldsValue({
        bankAccountList: [{ tempId: 1 }],
        status: '5',
      });
    }
  };
  useEffect(() => {
    getAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.location?.pathname, history?.location?.search]);
  useEffect(() => {
    getAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 删除SKU
  const delItem = async (record: any) => {
    const newData = formRef?.current?.getFieldValue('bankAccountList');
    const data = newData?.filter((item: any) => item.tempId !== record.tempId);
    formRef?.current?.setFieldsValue({
      bankAccountList: data || [],
    });
  };
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <Spin spinning={loading}>
        <ProForm
          labelAlign="right"
          layout="horizontal"
          formRef={formRef}
          className="label-width-68"
          labelCol={{ flex: '130px' }}
          submitter={{
            render: (data: any) => (
              <FooterToolbar style={{ padding: '6px' }}>
                {pathObj[pathname] == '详情' ? (
                  <Button
                    icon={<ArrowLeftOutlined />}
                    key="back"
                    onClick={() => {
                      setTimeout(() => {
                        history.push('/logistics-manage-in/lsp');
                      }, 200);
                    }}
                  >
                    返回
                  </Button>
                ) : (
                  <Space>
                    <Button
                      key="cancel"
                      onClick={() => {
                        setTimeout(() => {
                          history.push('/logistics-manage-in/lsp');
                        }, 200);
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      onClick={async () => {
                        data.form?.submit?.();
                      }}
                    >
                      确定
                    </Button>
                  </Space>
                )}
              </FooterToolbar>
            ),
          }}
          onFinish={async (values: any) => {
            return Promise.all([editForm.validateFields()])
              .then(async () => {
                const postData = JSON.parse(JSON.stringify(values));
                postData.id = id;
                postData.service_type = postData.service_type.join(',');
                const cur = JSON.parse(JSON.stringify(postData?.bankAccountList));
                if (detailData?.bankAccountList?.length) {
                  for (const item of detailData?.bankAccountList) {
                    if (!cur?.map((v: any) => v.id).includes(item.id)) {
                      postData.bankAccountList.push({ ...item, isDelete: 1 });
                    }
                  }
                }
                const res = id ? await updateLsp(postData) : await addLsp(postData);
                if (res?.code != pubConfig.sCode) {
                  pubMsg(res?.message);
                } else {
                  pubMsg('操作成功!', 'success');
                  setTimeout(() => {
                    history.push('/logistics-manage-in/lsp');
                  }, 200);
                }
              })
              .catch((e) => {
                console.log(e);
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
          <Card title="基础信息" bordered={false} style={{ marginBottom: '15px' }}>
            <Row gutter={24}>
              <Col span={8}>
                <ProFormText
                  name="name"
                  label="物流商名称"
                  readonly={pathObj[pathname] === '详情'}
                  rules={[{ required: pathObj[pathname] != '详情', message: '请输入物流商名称' }]}
                />
              </Col>
              <Col span={8}>
                <ProFormText name="code" label="物流商代码" readonly />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="service_type"
                  label="服务类型"
                  readonly={pathObj[pathname] === '详情'}
                  placeholder="请选择服务类型"
                  fieldProps={{
                    mode: 'multiple',
                  }}
                  valueEnum={dicList.LOGISTICS_VENDOR_SERVICE_TYPE}
                  rules={[{ required: pathObj[pathname] != '详情', message: '请选择服务类型' }]}
                />
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <ProFormSelect
                  name="pay_method"
                  label="结算方式"
                  readonly={pathObj[pathname] === '详情'}
                  valueEnum={dicList.LOGISTICS_PAY_METHOD}
                  placeholder="请选择结算方式"
                  rules={[{ required: pathObj[pathname] != '详情', message: '请选择结算方式' }]}
                />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="status"
                  label="合作状态"
                  valueEnum={dicList.LOGISTICS_STATUS}
                  placeholder="请选择结合作状态"
                  readonly={pathObj[pathname] === '详情'}
                  rules={[{ required: pathObj[pathname] != '详情', message: '请选择结合作状态' }]}
                />
              </Col>
            </Row>
          </Card>
          <Card title="联系方式" bordered={false} style={{ marginBottom: '15px' }}>
            <Row gutter={24}>
              <Col span={8}>
                <ProFormText
                  name="contacts_name"
                  label="联系人"
                  placeholder="请输入联系人"
                  readonly={pathObj[pathname] === '详情'}
                  rules={[{ required: pathObj[pathname] != '详情', message: '请输入联系人' }]}
                />
              </Col>
              <Col span={8}>
                <ProFormText
                  name="contacts_phone"
                  label="联系电话"
                  readonly={pathObj[pathname] === '详情'}
                  placeholder="请输入联系电话"
                  rules={[{ required: pathObj[pathname] != '详情', message: '请输入联系电话' }]}
                />
              </Col>
              <Col span={8}>
                <ProFormText
                  name="contacts_email"
                  label="邮箱"
                  placeholder="请输入邮箱"
                  readonly={pathObj[pathname] === '详情'}
                />
              </Col>
            </Row>
          </Card>
          <Card title="收款信息" bordered={false}>
            <Row gutter={24}>
              <Col span={24}>
                {pathObj[pathname] != '详情' && (
                  <Button
                    onClick={() => {
                      const curId = getUuid();
                      formRef?.current?.setFieldsValue({
                        bankAccountList: [
                          ...formRef?.current?.getFieldValue('bankAccountList'),
                          { tempId: curId },
                        ],
                      });
                      setEditableRowKeys((pre: any) => [...pre, curId]);
                    }}
                    ghost
                    type="primary"
                  >
                    新增收款信息
                  </Button>
                )}

                <Form.Item
                  {...formItemLayout1}
                  label=""
                  name="bankAccountList"
                  rules={[{ required: true, message: '请新增收款信息' }]}
                >
                  <EditableProTable
                    className="LSP"
                    rowKey="tempId"
                    cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
                    value={detailData?.bankAccountList || []}
                    tableStyle={{ margin: '10px 0' }}
                    recordCreatorProps={false}
                    columns={[
                      {
                        title: '结算币种',
                        dataIndex: 'currency',
                        align: 'center',
                        width: 160,
                        valueType: 'select',
                        valueEnum: dicList.SC_CURRENCY,
                        render: (_: any, record: any) => {
                          return pubFilter(dicList?.SC_CURRENCY, record?.currency) || '-';
                        },
                        formItemProps: {
                          rules: [{ required: true, message: '请选择结算币种' }],
                        },
                        fieldProps: {
                          addonBefore: '*',
                        },
                      },

                      {
                        title: '账户名',
                        dataIndex: 'bank_account_name',
                        align: 'center',
                        formItemProps: {
                          rules: [{ required: true, message: '请输入账户名' }],
                        },
                        fieldProps: {
                          addonBefore: '*',
                        },
                      },
                      {
                        title: '开户行',
                        dataIndex: 'bank_name',
                        align: 'center',
                        formItemProps: {
                          rules: [{ required: true, message: '请输入开户行' }],
                        },
                        fieldProps: {
                          addonBefore: '*',
                        },
                      },
                      {
                        title: '银行账号',
                        dataIndex: 'bank_account',
                        align: 'center',
                        formItemProps: {
                          rules: [{ required: true, message: '请输入银行账号' }],
                        },
                        fieldProps: {
                          addonBefore: '*',
                        },
                      },
                      {
                        title: '操作',
                        valueType: 'option',
                        width: 100,
                        editable: false,
                        align: 'center',
                        hideInTable: pathObj[pathname] === '详情',
                        render: (text: any, record: any) => [
                          <Popconfirm
                            key="delete"
                            title="确认删除"
                            onConfirm={() => {
                              delItem(record);
                            }}
                          >
                            <a>删除</a>
                          </Popconfirm>,
                        ],
                      },
                    ]}
                    editable={{
                      type: 'multiple',
                      editableKeys: props.disabled ? [] : editableKeys,
                      actionRender: (row, config, defaultDoms) => {
                        return [defaultDoms.delete];
                      },
                      form: editForm,
                      onValuesChange: (record, recordList) => {
                        formRef?.current?.setFieldsValue({
                          bankAccountList: recordList,
                        });
                      },
                      onChange: setEditableRowKeys,
                    }}
                    bordered
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </ProForm>
      </Spin>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);

export default ConnectPage;
