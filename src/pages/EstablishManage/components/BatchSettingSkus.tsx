import ProTable, { EditableProTable } from '@ant-design/pro-table';
import { DrawerForm, ProFormInstance } from '@ant-design/pro-form';
import { Button, Form, Modal, Popconfirm, Radio, Space, Statistic, Tooltip } from 'antd';
import { getUuid, pubAllGoodsSkuBrand, pubGetStoreList } from '@/utils/pubConfirm';
import { createRef, memo, useRef, useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { history } from 'umi';
import ComUpload from './customUpload';
import { handleCutZero } from '@/utils/pubConfig';
import ComEditTable from './customEditTable';
import './SpecEdit.less';
import FormSpecField from './FormSpecField';
export default memo((props: any) => {
  const { form_business_scope, dicList, callback, formRef1, form} = props;
  const formRef = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [copyData, setCopyData] = useState<any[]>([]);
  // 设置选中的表格key
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  // 设置表格数据
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const refsPbj = {};
  const innFormValidate = (cb: (res: boolean) => void) => {
    const all = [];
    for (const item of Object.values(refsPbj)) {
      const p = new Promise((resolve: any, reject: any) => {
        item?.current?.innFormValidate(resolve, reject);
      });
      all.push(p);
    }
    Promise.all(all)
      .then(() => {
        cb(true);
      })
      .catch(() => {
        cb(false);
      });
  };
  // 复制某一条数据
  const copySkuSpecifications = (data: any) => {
    setCopyData(JSON.parse(JSON.stringify(data.projectsGoodsSkuSpecifications)));
  };
  // 粘贴数据
  const pasteSkuSpecifications = (tempId?: string) => {
    const obj = {};
    copyData.forEach((v: any) => {
      obj[v.tempId] = v;
    });
    // 粘贴某一条
    if (tempId) {
      refsPbj[tempId]?.current?.setFieldAction(obj);
      // 全部粘贴
    } else {
      const data = formRef?.current?.getFieldValue('projectsGoodsSkus');
      data.forEach((v: any) => {
        refsPbj[v.tempId]?.current?.setFieldAction(obj);
      });
    }
  };
  const columns: any = [
    {
      title: (
        <>
          款式名称
          <Tooltip
            placement="top"
            title={
              <>
                款式名称=产品名称+款式属性
                <br />
                此处只需要填写款式属性
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'sku_form_spec',
      align: 'center',
      width: 300,
      renderFormItem: () => {
        return <FormSpecField productName={props?.productName}/>;
      },
      formItemProps: {
        rules: [
          {
            validator: async (rule: any, value: any) => {
              if(value?.sku_form?.length > 6) {
                return Promise.reject(new Error('款式形态应少于等于6个字'));
              }
              if (!value?.sku_spec) {
                return Promise.reject(new Error('规格型号必填'));
              }
              return Promise.resolve();
            },
          },
        ],
      },
      hideInTable:
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      hideInTable: !(
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1
      ),
      width: 100,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
      hideInTable: !(
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1
      ),
      width: 100,
    },

    {
      title: '图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 120,
      hideInTable: !props?.isDialog,
    },
    {
      title: '图片',
      align: 'center',
      dataIndex: 'sys_files',
      width: 180,
      hideInTable: props?.isDialog,
      formItemProps: {
        rules: [
          {
            validator: async (rule: any, value: any) => {
              const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
              if (!unDeleteFiles?.length) {
                return Promise.reject(new Error('请上传图片'));
              }
              return Promise.resolve();
            },
          },
        ],
      },
      renderFormItem: (_: any, c: any) => {
        return (
          <ComUpload
            isFinal={true}
            sys_files={form?.getFieldValue()?.[c.recordKey]?.sys_files || []}
            disabled={false}
            key="upload"
          />
        );
      },
    },
    {
      title: '产品定位',
      dataIndex: 'position',
      valueType: 'select',
      align: 'center',
      width: 100,
      formItemProps: {
        rules: [{ required: true, message: '请选择产品定位' }],
      },
      valueEnum: dicList.PROJECTS_GOODS_SKU_POSITION,
    },
    {

      title: '品牌',
      dataIndex: 'brand_id',
      valueType: 'select',
      align: 'center',
      width: 100,
      hideInTable: form_business_scope == 'CN' ,
      formItemProps: {
        rules: [{ required: true, message: '请选择品牌' }],
      },
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      request: async () => {
        const res = await pubAllGoodsSkuBrand();
        return res;
      },
    },
    {
      title: '定价',
      dataIndex: 'project_price',
      valueType: 'digit',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入定价' }],
      },
      fieldProps: {
        precision: 2,
        formatter: (value: any) => {
          return handleCutZero(String(value));
        },
      },
      width: 90,
      render: (_: any, record: any) => {
        return (
          <Statistic
            value={record?.project_price || 0}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          />
        );
      },
    },
    {
      title: '底线成交价',
      dataIndex: 'bottom_line_price',
      valueType: 'digit',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入底线成交价' }],
      },
      fieldProps: {
        precision: 2,
        formatter: (value: any) => {
          return handleCutZero(String(value));
        },
      },
      width: 120,
      render: (_: any, record: any) => {
        return (
          <Statistic
            value={record?.bottom_line_price ?? '-'}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          />
        );
      },
    },
    {
      title: (
        <>
          采销价
          <Tooltip
            placement="top"
            title={
              <>
                采销价针对京东自营平台，如果上架站点中有京东自营，则需要填写采销价，其他平台不需要填写
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'procurement_price',
      valueType: 'digit',
      align: 'center',
      formItemProps: {
        rules: [
          {
            required:
              form_business_scope == 'CN'
                ? formRef1?.current?.getFieldValue('listing_site')?.includes('2') || formRef1?.current?.getFieldValue('listing_site')?.includes('5')
                : false,
            message: '请输入采销价',
          },
        ],
      },
      fieldProps: {
        precision: 2,
        formatter: (value: any) => {
          return handleCutZero(String(value));
        },
      },
      width: 100,
      render: (_: any, record: any) => {
        return (
          <Statistic
            value={record?.procurement_price ?? '-'}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          />
        );
      },
    },
    {
      title: (
        <>
          商品条码
          <br />
          (UPC/Gtin)
        </>
      ),
      dataIndex: 'bar_code',
      align: 'center',
      formItemProps: {
        rules: [{ required: form_business_scope === 'CN', message: '请输入商品条码' }],
      },
      width: 120,
    },
    {
      title: '配送类型',
      dataIndex: 'send_kind',
      valueType: 'select',
      align: 'center',
      width: 160,
      formItemProps: {
        rules: [{ required: true, message: '请选择配送类型' }],
      },
      hideInTable: form_business_scope == 'CN' ? false : true,
      valueEnum: dicList.SYS_SEND_KIND,
    },
    {
      title: '预计店铺',
      dataIndex: 'expected_shop',
      valueType: 'select',
      align: 'center',
      width: 120,
      formItemProps: {
        rules: [{ required: true, message: '请选择预计店铺' }],
      },
      hideInTable: form_business_scope == 'IN' ? false : true,
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      request: async () => {
        const res: any = await pubGetStoreList({ business_scope: 'IN' });
        return res;
      },
    },
    {
      title: '规格类型',
      onCell: () => ({ colSpan: 6, style: { padding: 0 } }),
      dataIndex: 'type',
      align: 'center',
      editable: false,
      width: 90,
      valueEnum: {
        1: { text: '单品尺寸' },
        2: { text: '包装尺寸' },
        3: { text: '箱规' },
      },
      render: (_: any, record: any) => {
        const cur: any = formRef?.current?.getFieldValue('projectsGoodsSkus');
        if (!refsPbj[record.tempId]) {
          refsPbj[record.tempId] = createRef();
        }
        return (
          <div style={{ margin: '-1px' }}>
            <ComEditTable
              ref2={refsPbj[record.tempId]}
              value={record.projectsGoodsSkuSpecifications}
              disabled={false}
              editIds={record?.projectsGoodsSkuSpecifications?.map((v: any) => v.tempId)}
              onChange={(data: any[]) => {
                cur[record.index].projectsGoodsSkuSpecifications = data;
              }}
            />
          </div>
        );
      },
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
      width: 100,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
      width: 100,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      width: 100,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      align: 'center',
      width: 100,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
      width: 100,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 100,
      align: 'center',
      fixed: 'right',
      editable: false,
      render: (text: any, record: any) => {
        return (
          <Space direction="vertical">
            {!copyData?.length && (
              <Popconfirm
                key="delete"
                title="确定删除吗?"
                onConfirm={async () => {
                  const data = dataSource.filter((item) => item.tempId !== record.tempId);
                  setDataSource(data);
                  formRef.current?.setFieldsValue({
                    projectsGoodsSkus: data,
                  });
                }}
                okText="确定"
                cancelText="取消"
              >
                <a>删除</a>
              </Popconfirm>
            )}

            {!copyData?.length && (
              <a
                key="copy"
                onClick={() => {
                  copySkuSpecifications(record);
                }}
              >
                复制规格
              </a>
            )}
            {copyData?.length ? (
              <a
                key="paste"
                onClick={() => {
                  pasteSkuSpecifications(record.tempId);
                }}
              >
                粘贴已复制数据
              </a>
            ) : (
              ''
            )}
          </Space>
        );
      },
    },
  ];
  const columns1: any = [
    {
      title: '',
      dataIndex: 'sku_name',
      align: 'center',
      onCell: (_: any, index: any) => ({ rowSpan: index ? 0 : 3 }),
      render: () => <a>已复制的数据</a>,
      width: 100,
    },
    {
      title: '规格类型',
      dataIndex: 'type',
      align: 'center',
      width: 90,
      valueEnum: {
        1: { text: '单品尺寸' },
        2: { text: '包装尺寸' },
        3: { text: '箱规' },
      },
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
      width: 150,
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
      width: 150,
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      width: 150,
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      align: 'center',
      width: 150,
    },
    {
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
      width: 150,
      render: (text: any, record: any) => {
        return record.type === 3 ? text : '-';
      },
    },
    {
      title: '是否粘贴',
      dataIndex: 'isCopy',
      align: 'center',
      width: 150,
      render: (text: any, record: any) => {
        return (
          <Radio.Group
            defaultValue={1}
            onChange={(e: any) => {
              const cur = copyData.map((v: any) => {
                return {
                  ...v,
                  isCopy: v.type == record.type ? e.target.value : v.isCopy,
                };
              });
              setCopyData(cur);
            }}
          >
            <Radio value={1}>是</Radio>
            <Radio value={0}>否</Radio>
          </Radio.Group>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 120,
      onCell: (_: any, index: any) => ({ rowSpan: index ? 0 : 3 }),
      align: 'center',
      render: () => [
        <Button
          key="clear"
          type="link"
          onClick={() => {
            setCopyData([]);
          }}
        >
          清除
        </Button>,
        <Button
          key="pasteAll"
          type="link"
          onClick={() => {
            pasteSkuSpecifications();
          }}
        >
          粘贴到全部
        </Button>,
      ],
    },
  ];
  return (
    <DrawerForm
      title="批量设置款式"
      trigger={
        <Button type="primary" style={{ marginBottom: '10px' }}>
          批量设置
        </Button>
      }
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      drawerProps={{
        destroyOnClose: true,
      }}
      submitter={{
        submitButtonProps: {
          loading: submitLoading,
        },
        searchConfig: {
          submitText: submitLoading ? '提交中' : '确定',
        },
      }}
      onOpenChange={(v) => {
        if (v) {
          setLoading(true);
          const data = formRef1?.current?.getFieldValue('projectsGoodsSkus');
          setTimeout(() => {
            formRef.current?.setFieldsValue({
              projectsGoodsSkus: data || [],
            });
            setEditableRowKeys(data?.map((item: any) => item.tempId));
            setDataSource(data);
            editForm.setFieldsValue(props.form.getFieldValue());
            setLoading(false);
          }, 200);
        } else {
          setCopyData([]);
          setEditableRowKeys([]);
          setDataSource([]);
          setLoading(false);
          setSubmitLoading(false);
        }
      }}
      formRef={formRef}
      width={'95%'}
      onFinish={(values) => {
        setSubmitLoading(true);
        return new Promise((resolve) => {
          Promise.all([editForm.validateFields()])
            .then(() => {
              innFormValidate((res: any) => {
                if (res) {
                  setTimeout(() => {
                    callback(values.projectsGoodsSkus);
                  }, 20);

                  setTimeout(() => {
                    resolve(true);
                  }, 600);
                } else {
                  Modal.warning({
                    title: '提示',
                    content: '请检查表单信息正确性',
                  });
                  setSubmitLoading(false);
                  resolve(false);
                }
              });
            })
            .catch(() => {
              innFormValidate(() => {});
              resolve(false);
              setSubmitLoading(false);
              Modal.warning({
                title: '提示',
                content: '请检查表单信息正确性',
              });
            });
        });
      }}
      onFinishFailed={() => {
        innFormValidate(() => {});
      }}
    >
      {copyData.length ? (
        <div className="copyTable">
          <ProTable
            className={'p-table-0'}
            dataSource={copyData}
            rowKey="type"
            pagination={false}
            options={false}
            search={false}
            toolBarRender={false}
            size="small"
            bordered
            columns={columns1}
          />
        </div>
      ) : (
        ''
      )}
      <Form.Item rules={[{ required: true, message: '请添加产品SKU' }]} name="projectsGoodsSkus">
        <EditableProTable
          columns={columns}
          scroll={{ x: 2200, y: copyData.length ? 'calc(80vh - 200px)' : 'calc(80vh - 70px)' }}
          className="p-table-0 product-edit-skus-e"
          rowKey="tempId"
          value={dataSource}
          loading={loading}
          bordered
          recordCreatorProps={{
            newRecordType: 'dataSource',
            record: () => {
              const index = formRef?.current?.getFieldValue('projectsGoodsSkus')?.length || 0;
              const tempId = getUuid()
              return {
                tempId,
                uom: '',
                sys_files: [],
                currency: '',
                index,
                project_price: '',
                position: '100',
                projectsGoodsSkuSpecifications: [
                  {
                    tempId: '1',
                    high: '',
                    length: '',
                    type: 1,
                    weight: '',
                    width: '',
                  },
                  {
                    tempId: '2',
                    high: '',
                    length: '',
                    type: 2,
                    weight: '',
                    width: '',
                  },
                  {
                    tempId: '3',
                    high: '',
                    length: '',
                    type: 3,
                    weight: '',
                    width: '',
                    pics: '',
                  },
                ],
                projectsGoodsSkuCustomsClearance: form_business_scope == 'CN' ? undefined : {
                  tempId
                }
              };
            },
            style: {
              width: '100%',
              marginTop: '10px',
            },
          }}
          onChange={(editableRows) => {
            setDataSource(editableRows);
            formRef?.current?.setFieldsValue({
              projectsGoodsSkus: editableRows,
            });
          }}
          editable={{
            type: 'multiple',
            editableKeys,
            form: editForm,
            onValuesChange: (record, recordList) => {
              formRef?.current?.setFieldsValue({
                projectsGoodsSkus: recordList,
              });
            },
            onChange: (editableKeyss) => {
              setEditableRowKeys(editableKeyss);
            },
          }}
        />
      </Form.Item>
    </DrawerForm>
  );
});
