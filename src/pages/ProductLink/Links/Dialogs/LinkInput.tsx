import { Button, Col, Form, Modal, Row } from 'antd';
import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import type {
  ActionType,
  ProColumnType,
  EditableFormInstance,
  ProFormInstance,
} from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import {
  getUuid,
  pubGetPlatformList,
  pubGetStoreList,
  pubGetUserList,
  pubProLineList,
} from '@/utils/pubConfirm';
import './index.less';
import { pubConfig, pubMsg, pubNormalize } from '@/utils/pubConfig';
import { findBySku, insertLink, syncSku } from '@/services/pages/link';

export default (props: any) => {
  const ref: any = useRef<ActionType>();
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const editorFormRefIn = useRef<EditableFormInstance<any>>();
  const editorFormRefInVc = useRef<EditableFormInstance<any>>();
  const tipsObj = {
    TM: {
      tip: '只同步可售状态(库存大于0)的sku',
      placeholder: '请输入店铺商品ID (SPU)',
      msg: ['请确保录入正确的SKU和款式对应关系，否则会影响采购备货！'],
    },
    JD_FCS: {
      tip: '只同步正常销售状态的sku',
      placeholder: '请输入店铺商品ID (SPU)',
      msg: ['请确保录入正确的SKU和款式对应关系，否则会影响采购备货！'],
    },
    JD_POP: {
      tip: '只同步正常销售状态的sku',
      placeholder: '请输入店铺商品ID (SPU)',
      msg: ['请确保录入正确的SKU和款式对应关系，否则会影响采购备货！'],
    },
    JD_OPERATE: {
      tip: '',
      placeholder: '',
      msg: ['请确保录入正确的SKU和款式对应关系，否则会影响采购备货！'],
    },
    AMAZON_SC: {
      tip: '',
      placeholder: '请输入链接父Asin',
      msg: ['请确保录入正确的SKU和款式对应关系，否则会影响采购备货！'],
    },
    AMAZON_VC: {
      tip: '成功录入系统的SKU对应关系就不再允许修改，请您务必准确录入！',
      placeholder: '',
      msg: [
        '1、录入VC商品链接时，支持同时录入多条链接',
        '2、录入的SKU和款式编码需保持一一对应，否则会影响采购备货',
      ],
    },
    WALMART: {
      tip: '多变体链接需要录入group ID，单变体录入WPID',
      placeholder: '请输入Group ID或WPID',
      msg: ['请确保录入正确的SKU和款式对应关系，否则会影响采购备货！'],
    },
  };
  const [syncLoading, setSyncLoading] = useState(false);
  const [otherShow, setOtherShow] = useState(false);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [proLine, setProLine] = useState([]);
  const formRef = useRef<ProFormInstance>();
  const formItemLayout2 = {
    labelCol: { span: 3 },
    wrapperCol: { span: 20 },
  };
  const selectProps = {
    showSearch: true,
    labelInValue: true,
  };
  // 获取产品线
  const getProLineListAction = async () => {
    const res: any = await pubProLineList({ business_scope: props?.business_scope });
    setProLine(res);
  };
  useEffect(() => {
    getProLineListAction();
  }, []);
  // 查询款式编码对应款式名称
  const findBySkuCode = async (sku_code: any, rowIndex: any, editorRef: any) => {
    // 需要等这个接口查询结果才能提交
    (window as any).isFetchingSku = true;
    const res = await findBySku(sku_code);
    (window as any).isFetchingSku = false;
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      editorRef?.current?.setRowData?.(rowIndex, {
        sku_name: '',
        goods_sku_id: '',
      });
      formRef?.current?.validateFields();
      return;
    }
    if (res?.data) {
      editorRef?.current?.setRowData?.(rowIndex, {
        sku_name: res.data.sku_name,
        goods_sku_id: res.data.id,
      });
    } else {
      editorRef?.current?.setRowData?.(rowIndex, {
        sku_name: '',
        goods_sku_id: '',
      });
      pubMsg(`未找到款式编码:"${sku_code}" 对应的款式`);
    }
    formRef?.current?.validateFields();
  };
  /*columns*/
  // 跨境columns
  const columnsIn: ProColumnType<any>[] = [
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
      formItemProps: (form, { entity }) => {
        return {
          normalize: pubNormalize,
          rules: [
            {
              required: true,
              message: '请输入对应款式编码',
            },
            {
              validator() {
                if (!entity.goods_sku_id) {
                  return Promise.reject(new Error('未找到对应款式'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: (form: any, { rowIndex }: any) => {
        return {
          onBlur: async (e: any) => {
            const sku_code = e?.target?.value;
            if (sku_code) {
              findBySkuCode(sku_code, rowIndex, editorFormRefIn);
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
  ];
  // 京东自营columns
  const columnsJd: ProColumnType<any>[] = [
    {
      title: 'SKU(商品编号)',
      dataIndex: 'shop_sku_code',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入SKU(商品编号)' }],
      },
    },
    {
      title: '对应款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      editable: (t: any, record: any) => record.editableSkuCode,
      formItemProps: (form, { entity }) => {
        return {
          normalize: pubNormalize,
          rules: [
            {
              required: true,
              message: '请输入对应款式编码',
            },
            {
              validator() {
                if (!entity.goods_sku_id) {
                  return Promise.reject(new Error('未找到对应款式'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: (form: any, { rowIndex }: any) => {
        return {
          onBlur: async (e: any) => {
            const sku_code = e?.target?.value;
            if (sku_code) {
              findBySkuCode(sku_code, rowIndex, editorFormRefIn);
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
  ];
  // columnsVc
  const columnsVc: ProColumnType<any>[] = [
    {
      title: 'Asin(链接Id)',
      dataIndex: 'amazon_asin',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入Asin(链接Id)' }],
      },
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入SKU' }],
      },
    },
    {
      title: 'UPC/EAN',
      dataIndex: 'bar_code',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入UPC/EAN' }],
      },
    },
    {
      title: '对应款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      editable: (t: any, record: any) => record.editableSkuCode,
      formItemProps: (form, { entity }) => {
        return {
          normalize: pubNormalize,
          rules: [
            {
              required: true,
              message: '请输入对应款式编码',
            },
            {
              validator() {
                if (!entity.goods_sku_id) {
                  return Promise.reject(new Error('未找到对应款式'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: (form: any, { rowIndex }: any) => {
        return {
          onBlur: async (e: any) => {
            const sku_code = e?.target?.value;
            if (sku_code) {
              findBySkuCode(sku_code, rowIndex, editorFormRefInVc);
            }
          },
        };
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      align: 'center',
      render: () => [<a key="delete">删除</a>],
    },
  ];
  return (
    <ModalForm
      title="链接录入"
      trigger={
        <Button type="primary" ghost>
          链接录入
        </Button>
      }
      labelAlign="right"
      labelCol={{ flex: '90px' }}
      layout="horizontal"
      onOpenChange={(visible) => {
        // 关闭重置
        if (!visible) {
          setOtherShow(false);
          setEditableRowKeys([]);
        }
      }}
      modalProps={{
        destroyOnClose: true,
        okButtonProps: {
          disabled: syncLoading,
        },
        maskClosable: false,
      }}
      formRef={formRef}
      width={1000}
      className="link"
      onFinish={async (values) => {
        if ((window as any).isFetchingSku) {
          setTimeout(() => {
            formRef.current?.submit();
          }, 200);
          return false;
        }
        const postData = {
          ...values,
          business_scope: props.business_scope,
          spread_user_name: values.spread_user.label,
          spread_user_id: values.spread_user.value,
          id: props?.record?.id,
        };
        if (!otherShow && !['AMAZON_SC', 'WALMART', 'JD_OPERATE'].includes(values.platform_code)) {
          Modal.warning({
            title: '提示',
            content: '请点击同步后，再提交',
          });
          return false;
        } else {
          postData.skuList = postData.skuList.map((v: any) => {
            return {
              ...v,
              combination: v?.combination || 0,
            };
          });
          const res = await insertLink(postData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return false;
          } else {
            pubMsg('提交成功!', 'success');
            props.reload();
            return true;
          }
        }
      }}
      onFinishFailed={() => {
        if (!(window as any).isFetchingSku) {
          Modal.warning({
            title: '提示',
            content: '请检查表单信息正确性',
          });
        } else {
          setTimeout(() => {
            formRef.current?.submit();
          }, 200);
        }
      }}
      validateTrigger={'onBlur'}
    >
      <Row className="link-input">
        <Col span={12} className="proLine-group">
          <ProFormSelect
            name="category_id"
            label="产品线"
            options={proLine || []}
            rules={[{ required: true, message: '请选择产品线' }]}
            placeholder="请选择产品线"
            showSearch
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            name="spread_user"
            label="推广"
            fieldProps={selectProps}
            request={async (v: any) => {
              const res: any = await pubGetUserList(v);
              return res;
            }}
            placeholder="请选择推广"
            rules={[
              { required: true, message: '请选择推广' },
              ({}) => ({
                validator(_, value) {
                  if (JSON.stringify(value) === '{}') {
                    return Promise.reject(new Error('请选择推广'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormText name="platform_code" label="platform_code" hidden />
          <ProFormSelect
            name="platform_id"
            label="平台"
            rules={[{ required: true, message: '请选择平台' }]}
            showSearch
            debounceTime={300}
            fieldProps={{
              showSearch: true,
              onChange: (val, data: any) => {
                (window as any).isFetchingSku = false;
                formRef.current?.setFieldsValue({
                  platform_code: data?.platform_code || '',
                  shop_id: '',
                });
                if (
                  ['AMAZON_SC', 'AMAZON_VC', 'WALMART', 'JD_OPERATE'].includes(data?.platform_code)
                ) {
                  setOtherShow(true);
                  const skus = [
                    {
                      tempId: getUuid(),
                      shop_sku_code: '',
                      bar_code: '',
                      sku_code: '',
                    },
                  ];
                  formRef.current?.setFieldsValue({
                    skuList: skus,
                  });
                  setEditableRowKeys([skus?.[0].tempId]);
                }
              },
            }}
            request={async () => {
              const res: any = await pubGetPlatformList({ business_scope: props.business_scope });
              return props.business_scope
                ? res.filter(
                    (v: any) =>
                      v.business_scope == props.business_scope &&
                      !['1552846034395881473', '1580120899712675841'].includes(v.value),
                  )
                : [];
            }}
          />
        </Col>
        <Col span={12}>
          <ProFormDependency name={['platform_id']}>
            {({ platform_id }) => {
              return (
                <ProFormSelect
                  name="shop_id"
                  label="店铺"
                  showSearch
                  debounceTime={300}
                  fieldProps={{
                    showSearch: true,
                    filterOption: (input: any, option: any) => {
                      const trimInput = input.replace(/^\s+|\s+$/g, '');
                      if (trimInput) {
                        return option.label.indexOf(trimInput) >= 0;
                      } else {
                        return true;
                      }
                    },
                  }}
                  params={{
                    platform_id: platform_id,
                  }}
                  request={async () => {
                    if (!platform_id) {
                      return [];
                    }
                    const res: any = await pubGetStoreList({ platform_id });
                    return res;
                  }}
                  rules={[
                    { required: true, message: '请选择店铺' },
                    ({}) => ({
                      validator(_, value) {
                        if (JSON.stringify(value) === '{}') {
                          return Promise.reject(new Error('请选择店铺'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                />
              );
            }}
          </ProFormDependency>
        </Col>
        <ProFormDependency name={['platform_code']}>
          {({ platform_code }) => {
            /* TM, JD_POP, JD_FCS, JD_OPERATE, WALMART, AMAZON_SC,* */
            return (
              platform_code && (
                <>
                  {/*国内的 天猫 京东POP 京东FCS*/}
                  {['TM', 'JD_POP', 'JD_FCS'].includes(platform_code) ? (
                    <>
                      <Col span={12}>
                        <ProFormText
                          placeholder={tipsObj?.[platform_code]?.placeholder || ''}
                          label="链接ID"
                          name="link_id"
                          rules={[
                            {
                              required: true,
                              message: `请输入链接ID${
                                ['JD_POP', 'JD_FCS'].includes(platform_code) ? '(SPU)' : ''
                              }`,
                            },
                          ]}
                        />
                      </Col>
                      <Col span={3}>
                        <Button
                          loading={syncLoading}
                          type="primary"
                          style={{ marginLeft: '10px' }}
                          onClick={() =>
                            formRef.current
                              ?.validateFields(['link_id', 'platform_id', 'shop_id'])
                              .then(async () => {
                                const postData = formRef.current?.getFieldsValue([
                                  'link_id',
                                  'platform_code',
                                  'shop_id',
                                ]);
                                setSyncLoading(true);
                                const res = await syncSku(postData);
                                setSyncLoading(false);
                                if (res?.code != pubConfig.sCode) {
                                  pubMsg(res?.message);
                                } else {
                                  const skus: any = res?.data?.skuList.map(
                                    (v: any, index: number) => {
                                      return {
                                        ...v,
                                        tempId: index,
                                        editableBarCode: !v.bar_code,
                                        editableSkuCode: !v.sku_code,
                                      };
                                    },
                                  );
                                  // 需要两次, 第一次渲染会出现无字段情况, todo: 一次设置无bug
                                  formRef.current?.setFieldsValue({
                                    skuList: skus,
                                  });
                                  formRef.current?.setFieldsValue({
                                    skuList: skus,
                                  });
                                  setEditableRowKeys(skus.map((v: any) => v.tempId));
                                  setOtherShow(true);
                                }
                              })
                          }
                        >
                          {syncLoading ? '同步中' : '同步'}
                        </Button>
                      </Col>
                      <Col
                        span={8}
                        style={{
                          color: '#363',
                          paddingLeft: '10px',
                          alignSelf: 'start',
                          minHeight: '32px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {tipsObj?.[platform_code]?.tip || ''}
                      </Col>
                      <Col span={24} className="edit-table">
                        {otherShow ? (
                          <EditableProTable
                            editableFormRef={editorFormRef}
                            name="skuList"
                            bordered
                            rowKey="tempId"
                            actionRef={ref}
                            size="small"
                            recordCreatorProps={false}
                            editable={{
                              type: 'multiple',
                              editableKeys,
                              actionRender: (row, config, defaultDoms) => {
                                return [defaultDoms.delete];
                              },
                            }}
                            columns={[
                              {
                                title: platform_code == 'TM' ? 'SKU(店铺SKU)' : 'SKU(商家编码)',
                                dataIndex: 'shop_sku_code',
                                align: 'center',
                                editable: false,
                              },
                              {
                                title: '对应款式编码',
                                dataIndex: 'sku_code',
                                align: 'center',
                                editable: (t: any, record: any) => record.editableSkuCode,
                                formItemProps: (form, { entity }) => {
                                  return {
                                    normalize: pubNormalize,
                                    rules: [
                                      {
                                        required: !entity.combination,
                                        message: '请输入对应款式编码',
                                      },
                                      {
                                        validator() {
                                          if (!entity.goods_sku_id && !entity.combination) {
                                            return Promise.reject(new Error('未找到对应款式'));
                                          }
                                          return Promise.resolve();
                                        },
                                      },
                                    ],
                                  };
                                },
                                fieldProps: (form: any, { rowIndex }: any) => {
                                  return {
                                    onBlur: async (e: any) => {
                                      const sku_code = e?.target?.value;
                                      if (sku_code) {
                                        const res = await findBySku(sku_code);
                                        if (res?.code != pubConfig.sCode) {
                                          pubMsg(res?.message);
                                          editorFormRef?.current?.setRowData?.(rowIndex, {
                                            sku_name: '',
                                            goods_sku_id: '',
                                          });
                                          formRef?.current?.validateFields();
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
                                        formRef?.current?.validateFields();
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
                                formItemProps: (form, { entity }) => {
                                  return {
                                    rules: [
                                      {
                                        required: !entity.combination,
                                        message: '款式名称不能为空',
                                      },
                                    ],
                                  };
                                },
                              },
                              {
                                title: '操作',
                                dataIndex: 'combination',
                                align: 'center',
                                editable: false,
                                hideInTable: false,
                                width: 140,
                                render: (_: any, record: any) => {
                                  return record.combination ? (
                                    <a
                                      style={{ color: 'red' }}
                                      onClick={() => {
                                        formRef?.current?.setFieldsValue({
                                          skuList: formRef?.current
                                            ?.getFieldValue('skuList')
                                            .map((v: any) => {
                                              return {
                                                ...v,
                                                combination:
                                                  v.tempId == record.tempId ? 0 : v.combination,
                                              };
                                            }),
                                        });
                                      }}
                                    >
                                      取消组合商品
                                    </a>
                                  ) : (
                                    <a
                                      onClick={() => {
                                        // console.log(formRef?.current?.getFieldValue('skuList'));
                                        formRef?.current?.setFieldsValue({
                                          skuList: formRef?.current
                                            ?.getFieldValue('skuList')
                                            .map((v: any) => {
                                              return {
                                                ...v,
                                                combination:
                                                  v.tempId == record.tempId ? 1 : v.combination,
                                              };
                                            }),
                                        });
                                        formRef?.current?.validateFields();
                                      }}
                                    >
                                      标记为组合商品
                                    </a>
                                  );
                                },
                              },
                            ]}
                            dataSource={[]}
                          />
                        ) : null}
                        {tipsObj?.[platform_code]?.message
                          ? tipsObj?.[platform_code]?.message.map((item: string, i: number) => (
                              <div key={i} style={{ color: '#363', paddingLeft: '95px' }}>
                                {item}
                              </div>
                            ))
                          : null}
                      </Col>
                    </>
                  ) : null}
                  {/*跨境和京东自营(JD_OPERATE)*/}
                  {['AMAZON_SC', 'WALMART', 'JD_OPERATE'].includes(platform_code) ? (
                    <>
                      <Col span={24} className="edit-table item0">
                        <Form.Item
                          label={platform_code == 'JD_OPERATE' ? '链接' : 'SKU'}
                          {...formItemLayout2}
                          labelAlign="right"
                          labelCol={{ flex: '90px' }}
                          required
                        >
                          <EditableProTable
                            editableFormRef={editorFormRefIn}
                            loading={syncLoading}
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
                                  bar_code: '',
                                };
                              },
                            }}
                            editable={{
                              type: 'multiple',
                              editableKeys,
                              actionRender: (row, config, defaultDoms) => {
                                return [defaultDoms.delete];
                              },
                              onChange: (keys) => {
                                setEditableRowKeys(keys);
                              },
                            }}
                            columns={platform_code == 'JD_OPERATE' ? columnsJd : columnsIn}
                          />
                        </Form.Item>
                      </Col>
                      {/*跨境连接输入*/}
                      <>
                        {['AMAZON_SC', 'WALMART'].includes(platform_code) ? (
                          <Col span={12}>
                            <ProFormText
                              placeholder={tipsObj?.[platform_code]?.placeholder || ''}
                              label="链接ID"
                              name="link_id"
                              rules={[{ required: true, message: '请输入链接ID' }]}
                            />
                          </Col>
                        ) : null}
                        {tipsObj?.[platform_code]?.tip ? (
                          <Col
                            span={12}
                            style={{
                              color: '#363',
                              paddingLeft: '10px',
                              alignSelf: 'start',
                              minHeight: '32px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {tipsObj?.[platform_code]?.tip || ''}
                          </Col>
                        ) : null}
                      </>
                    </>
                  ) : null}
                  {/*AMAZON_VC*/}
                  {['AMAZON_VC'].includes(platform_code) ? (
                    <>
                      <Col span={24} className="edit-table item0">
                        <Form.Item
                          label={'SKU'}
                          {...formItemLayout2}
                          labelAlign="right"
                          labelCol={{ flex: '90px' }}
                          required
                        >
                          <EditableProTable
                            editableFormRef={editorFormRefInVc}
                            loading={syncLoading}
                            name="skuList"
                            bordered
                            rowKey="tempId"
                            size="small"
                            recordCreatorProps={{
                              newRecordType: 'dataSource',
                              record: () => {
                                return {
                                  tempId: getUuid(),
                                  amazon_asin: '',
                                  shop_sku_code: '',
                                  sku_code: '',
                                  bar_code: '',
                                };
                              },
                            }}
                            editable={{
                              type: 'multiple',
                              editableKeys,
                              actionRender: (row, config, defaultDoms) => {
                                return [defaultDoms.delete];
                              },
                              onChange: (keys) => {
                                setEditableRowKeys(keys);
                              },
                            }}
                            columns={columnsVc}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  ) : null}
                  {/*上架时间*/}
                  {['JD_OPERATE', 'WALMART', 'AMAZON_VC'].includes(platform_code) && (
                    <Col span={12}>
                      <ProFormDateTimePicker
                        rules={[{ required: true, message: '请选择上架时间' }]}
                        name="sales_time"
                        label="上架时间"
                      />
                    </Col>
                  )}
                  {/*操作说明*/}
                  <Col span={24}>
                    {['AMAZON_SC', 'WALMART', 'JD_OPERATE', 'AMAZON_VC'].includes(platform_code) &&
                    tipsObj?.[platform_code]?.message
                      ? tipsObj?.[platform_code]?.message.map((item: string, i: number) => (
                          <div key={i} style={{ color: '#363', paddingLeft: '95px' }}>
                            {item}
                          </div>
                        ))
                      : null}
                  </Col>
                </>
              )
            );
          }}
        </ProFormDependency>
      </Row>
    </ModalForm>
  );
};
