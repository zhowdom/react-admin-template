import ProTable, { EditableProTable } from '@ant-design/pro-table';
import { DrawerForm, ProFormInstance } from '@ant-design/pro-form';
import { Button, Form, Modal, Space } from 'antd';
import { memo, useRef, useState } from 'react';
import { history } from 'umi';

export default memo((props: any) => {
  const { callback, formRef1, productName, dicList } = props;
  const formRef = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [copyData, setCopyData] = useState<any[]>([]);
  // 设置选中的表格key
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  // 设置表格数据
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [eData, eDataSet] = useState<any>({});
  // 复制某一条数据
  const copySkuSpecifications = (data: any) => {
    setCopyData(JSON.parse(JSON.stringify([data])));
  };
  // 粘贴数据
  const pasteAction = (tempId?: string) => {
    const dataT: any = formRef?.current?.getFieldValue('projectsGoodsSkuCustomsClearance');
    const copyC = copyData?.[0];
    // 粘贴某一条
    if (tempId) {
      const dataTT = dataT.map((v: any) => {
        return v.tempId == tempId
          ? {
              ...v,
              texture_en: copyC.texture_en,
              purpose: copyC.purpose,
              electric: copyC.electric,
              magnetism: copyC.magnetism,
              magnetism_packing: copyC.magnetism_packing,
              v: copyC.v,
              w: copyC.w,
              a: copyC.a,
            }
          : v;
      });
      editForm.setFieldsValue({
        [`${tempId}`]: {
          texture_en: copyC.texture_en,
          purpose: copyC.purpose,
          magnetism: copyC.magnetism,
          magnetism_packing: copyC.magnetism_packing,
          electric: copyC.electric,
          w: copyC.w,
          v: copyC.v,
          a: copyC.a,
        },
      });
      const data = JSON.parse(JSON.stringify(eData));
      data[tempId] = copyC.electric ?? '0';
      formRef.current?.setFieldsValue({
        projectsGoodsSkuCustomsClearance: dataTT,
      });
      eDataSet(data);
      // 全部粘贴
    } else {
      const data = formRef?.current?.getFieldValue('projectsGoodsSkuCustomsClearance');
      const dataTT = data.map((v: any) => {
        return {
          ...v,
          texture_en: copyC.texture_en,
          purpose: copyC.purpose,
          magnetism: copyC.magnetism,
          magnetism_packing: copyC.magnetism_packing,
          electric: copyC.electric,
          w: copyC.w,
          v: copyC.v,
          a: copyC.a,
        };
      });
      console.log(dataTT, 'dataTT');
      const obj = {};
      data.forEach((v: any) => {
        obj[v.tempId] = copyC.electric ?? '0';
        editForm.setFieldsValue({
          [`${v.tempId}`]: {
            texture_en: copyC.texture_en,
            purpose: copyC.purpose,
            magnetism: copyC.magnetism,
            magnetism_packing: copyC.magnetism_packing,
            electric: copyC.electric,
            w: copyC.w,
            v: copyC.v,
            a: copyC.a,
          },
        });
      });
      formRef.current?.setFieldsValue({
        projectsGoodsSkuCustomsClearance: dataTT,
      });
      eDataSet(obj);
    }
  };
  const columns: any = [
    {
      title: '款式名称',
      dataIndex: 'sku_attribute',
      align: 'left',
      width: 200,
      editable: false,
      render: (_: any, record: any) => {
        return `${productName}${record?.sku_form_spec?.sku_form ?? ''}${
          record?.sku_form_spec?.sku_spec ?? '-'
        }`;
      },
      hideInTable:
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1,
    },
    {
      title: '材质(英文)',
      dataIndex: 'texture_en',
      align: 'left',
      formItemProps: () => {
        return {
          rules: [
            {
              validator(_, value: any) {
                const str = value?.replace(/(^\s*)|(\s*$)/g, '');
                if (!str) {
                  return Promise.reject(new Error('必填'));
                }
                if (/[\u4E00-\u9FA5]/.test(str)) {
                  return Promise.reject(new Error('请输入英文'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      width: 180,
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      align: 'left',
      width: 200,
      formItemProps: () => {
        return {
          rules: [
            {
              pattern: /^(?=.*\S).+$/,
              message: '请输入用途',
            },
            { required: true, message: '请输入用途' },
          ],
        };
      },
    },
    {
      title: '是否带磁',
      dataIndex: 'magnetism',
      valueType: 'select',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请选择是否带磁' }],
      },
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '是否有磁性包装',
      dataIndex: 'magnetism_packing',
      valueType: 'select',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请选择是否有磁性包装' }],
      },
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '是否带电',
      dataIndex: 'electric',
      valueType: 'select',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请选择是否带电' }],
      },
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '额定功率 (W)',
      dataIndex: 'w',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入额定功率' }],
      },
      editable: (text: any, record: any) => {
        return eData[record.tempId] == '1';
      },
      valueType: 'digit',
    },
    {
      title: '额定电压 (V)',
      dataIndex: 'v',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入额定电压' }],
      },
      editable: (text: any, record: any) => {
        return eData[record.tempId] == '1';
      },
      valueType: 'digit',
    },
    {
      title: '额定电流 (A)',
      dataIndex: 'a',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入额定电流' }],
      },
      editable: (text: any, record: any) => {
        return eData[record.tempId] == '1';
      },
      valueType: 'digit',
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 140,
      align: 'center',
      fixed: 'right',
      editable: false,
      render: (text: any, record: any) => {
        return (
          <Space direction="vertical">
            {!copyData?.length && (
              <a
                key="copy"
                onClick={() => {
                  copySkuSpecifications(record);
                }}
              >
                复制
              </a>
            )}
            {copyData?.length ? (
              <a
                key="paste"
                onClick={() => {
                  pasteAction(record.tempId);
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
      render: () => <a>已复制款式信息</a>,
      width: 100,
    },
    {
      title: '材质(英文)',
      dataIndex: 'texture_en',
      align: 'left',
      width: 180,
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      align: 'left',
      width: 200,
    },
    {
      title: '是否带磁',
      dataIndex: 'magnetism',
      valueType: 'select',
      align: 'center',
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '是否有磁性包装',
      dataIndex: 'magnetism_packing',
      valueType: 'select',
      align: 'center',
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '是否带电',
      dataIndex: 'electric',
      valueType: 'select',
      align: 'center',
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '额定功率 (W)',
      dataIndex: 'w',
      align: 'center',
    },
    {
      title: '额定电压 (V)',
      dataIndex: 'v',
      align: 'center',
    },
    {
      title: '额定电流 (A)',
      dataIndex: 'a',
      align: 'center',
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
            pasteAction();
          }}
        >
          粘贴到全部
        </Button>,
      ],
    },
  ];
  return (
    <DrawerForm
      title="批量设置物流清关信息"
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
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setLoading(true);
          const data = formRef1?.current?.getFieldValue('projectsGoodsSkuCustomsClearance');
          setTimeout(() => {
            formRef.current?.setFieldsValue({
              projectsGoodsSkuCustomsClearance: data || [],
            });
            setEditableRowKeys(data?.map((item: any) => item.tempId));
            setDataSource(data);
            const obj = {};
            data.forEach((v: any) => {
              obj[v.tempId] = v.electric ?? '0';
            });
            eDataSet(obj);
            editForm.setFieldsValue(props.form.getFieldValue());
            setLoading(false);
          }, 200);
        } else {
          setCopyData([]);
          setEditableRowKeys([]);
          setDataSource([]);
          eDataSet({});
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
              setTimeout(() => {
                console.log(
                  values?.projectsGoodsSkuCustomsClearance,
                  'values?.projectsGoodsSkuCustomsClearance',
                );
                callback(values?.projectsGoodsSkuCustomsClearance);
              }, 100);

              setTimeout(() => {
                setSubmitLoading(false);
                resolve(true);
              }, 600);
            })
            .catch(() => {
              resolve(false);
              setSubmitLoading(false);
              Modal.warning({
                title: '提示',
                content: '请检查表单信息正确性',
              });
            });
        });
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
      <Form.Item
        rules={[{ required: true, message: '请添加产品SKU' }]}
        name="projectsGoodsSkuCustomsClearance"
      >
        <EditableProTable
          columns={columns}
          scroll={{ x: 1200, y: copyData.length ? 'calc(80vh - 200px)' : 'calc(80vh - 70px)' }}
          className="p-table-0 product-edit-skus-e"
          rowKey="tempId"
          value={dataSource}
          loading={loading}
          bordered
          recordCreatorProps={false}
          editable={{
            type: 'multiple',
            editableKeys,
            form: editForm,
            onValuesChange: (record, recordList) => {
              if (record.electric == '0') {
                editForm.setFieldsValue({
                  [`${record.tempId}`]: {
                    w: undefined,
                    v: undefined,
                    a: undefined,
                  },
                });
              }
              const data = JSON.parse(JSON.stringify(eData));
              data[record.tempId] = record.electric ?? '0';
              eDataSet(data);
              formRef?.current?.setFieldsValue({
                projectsGoodsSkuCustomsClearance: recordList.map((v: any) => ({
                  ...v,
                  w: v.electric == '0' ? undefined : v.w,
                  v: v.electric == '0' ? undefined : v.v,
                  a: v.electric == '0' ? undefined : v.a,
                })),
              });
            },
          }}
        />
      </Form.Item>
    </DrawerForm>
  );
});
