import {Button, Form, Popconfirm} from 'antd';
import ProForm, {ProFormInstance, ProFormSelect} from '@ant-design/pro-form';
import {ModalForm, ProFormText} from '@ant-design/pro-form';
import {useRef, useState} from 'react';
import {pubConfig, pubMsg} from '@/utils/pubConfig';
import {ActionType, EditableFormInstance, EditableProTable, ProFormDependency} from '@ant-design/pro-components';
import {getList} from '@/services/pages/shipment/expressWarehouse';
import './index.less';
import {getUuid} from '@/utils/pubConfirm';
import {orderDeliveryExpressCompanyPage, regionArea} from '@/services/pages/shipment';
import {insert, update, deleteById} from '@/services/pages/shipment/expressWarehouse';
import {Access, useAccess} from 'umi';
import {optionsDeliveryWarehouse} from "@/pages/shipment/warehouse";
import {getList as getVendorList} from "@/services/pages/supplier";

// 获取发货仓和供应商下拉
export const fetchOptions = (platform_code: string, optionsSet: any, disabledItem = true) => {
  if (platform_code == 'VENDOR') {
    getVendorList({
      page_size: 999,
      current_page: 1,
    }).then(res => {
      if (res?.code == pubConfig.sCode) {
        optionsSet(res.data?.records?.map((item: any) => ({
          label: item.name,
          value: item.id,
        })))
      } else {
        optionsSet([])
      }
    })
  } else {
    optionsDeliveryWarehouse({platform_code}, disabledItem).then(res => {
      if (res) {
        optionsSet(res);
      } else {
        optionsSet([]);
      }
    })
  }
}

const Component: React.FC<{
  reload: any;
  _ref: any;
  dicList: any;
}> = ({_ref, reload, dicList}) => {
  const formRef = useRef<ProFormInstance>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialValues, setInitialValues] = useState<any>();
  const [searchForm, setSearchForm] = useState<any>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [expressList, setExpressList] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [optionsWarehouse, optionsWarehouseSet] = useState<any[]>([]);
  const actionRef = useRef<ActionType>();
  const editorFormRef: any = useRef<EditableFormInstance<any>>();
  const access = useAccess();
  const [editForm] = Form.useForm();

  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    setLoading(true);
    const postData = {
      ...params,
      current_page: 1,
      page_size: 999,
    };
    const res = await getList(postData);
    const tempData = {
      tempId: getUuid(),
    };
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setEditableRowKeys([tempData.tempId]);
      setExpressList([tempData]);
      setLoading(false);
      return;
    }
    if (res?.data?.records?.[0]?.warehouseExpressList?.length) {
      const data = res?.data?.records?.[0]?.warehouseExpressList?.map((v: any) => {
        return {
          ...v,
          tempId: getUuid(),
          priority_area: v.priority_area.replaceAll(',', '、')?.split('、'),
        };
      });
      setExpressList(data);
    } else {
      setExpressList([tempData]);
      setEditableRowKeys([tempData.tempId]);
    }
    setLoading(false);
  };
  // 打开弹窗
  _ref.current = {
    visibileChange: (visible: boolean, record: any) => {
      setInitialValues(record);
      setSearchForm(
        record ? {platform_code: record.platform_code, warehouse_id: record.warehouse_id} : null,
      );

      if (record) {
        fetchOptions(record.platform_code, optionsWarehouseSet)
        getListAction({platform_code: record.platform_code, warehouse_id: record.warehouse_id});
      } else {
        const tempData = {
          tempId: getUuid(),
        };
        setEditableRowKeys([tempData.tempId]);
        setExpressList([tempData]);
      }
      setTimeout(() => {
        setIsModalVisible(visible);
      }, 100);
    },
  };
  const selectProps = {
    showSearch: true,
  };
  // 清空
  const resetAction = () => {
    setSearchForm(null);
    setExpressList([]);
    formRef?.current?.setFieldsValue({
      platform_code: null,
      warehouse_id: null,
    });
  };
  // 删除
  const deleteAction = async (record: any) => {
    if (record.id) {
      const res = await deleteById({id: record.id});
      if (res?.code != pubConfig.sCode) {
        return pubMsg(res?.message);
      }
    }
    setExpressList(expressList.filter((item: any) => item.tempId !== record.tempId));
    reload();
    pubMsg('操作成功', 'success');
  };
  // 获取优先区域
  const getAreas = async () => {
    const res = await regionArea();
    if (res?.code == pubConfig.sCode) {
      return res.data?.map((item: any) => ({
        label: item.area_name,
        value: item.area_name,
        options: item?.provinceList.map((p: any) => ({
          label: p.province_name,
          value: p.province_name,
        })),
      }));
    }
    return [];
  };
  const columns: any[] = [
    {
      title: '顺序',
      valueType: 'index',
      editable: false,
      align: 'left',
      width: 100,
    },
    {
      title: '快递编码',
      dataIndex: 'express_company_id',
      align: 'left',
      fieldProps: selectProps,
      valueType: 'select',
      width: 200,
      formItemProps: {
        rules: [{required: true, message: '请选择快递编码'}],
      },
      request: async (v: any) => {
        const res: any = await orderDeliveryExpressCompanyPage({
          ...v,
          current_page: 1,
          page_size: 999999,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return [];
        }
        return res?.data?.records
          ?.map((item: any) => {
            return {
              label: `${item?.express_code}(${item?.express_short})`,
              value: item.id,
              disabled: item.status == '0',
              status: item.status,
            };
          })
          .sort((a: any, b: any) => b.status - a.status);
      },
    },
    {
      title: '优先区域',
      dataIndex: 'priority_area',
      align: 'left',
      valueType: 'select',
      request: getAreas,
      fieldProps: {
        ...selectProps,
        mode: 'multiple',
      },
      formItemProps: {
        rules: [{required: true, message: '请选择优先区域'}],
      },
      render: (_: any, record: any) => record?.priority_area?.join('、') || '-',
    },
    {
      title: '排列系数',
      dataIndex: 'sort_coefficient',
      align: 'left',
      width: 200,
      formItemProps: {
        rules: [{required: true, message: '请输入排列系数'}],
      },
      valueType: 'digit',
    },

    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (text: any, record: any, _: any, action: any) => [
        access.canSee('order_express-warehouse_edit') && (
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(record.tempId);
            }}
          >
            编辑
          </a>
        ),
        <Access
          key="edit"
          accessible={!record?.id || access.canSee('order_express-warehouse_delete')}
        >
          <Popconfirm
            key="delete"
            title="确定删除吗?"
            onConfirm={async () => deleteAction(record)}
            okText="确定"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        </Access>,
      ],
    },
  ];

  // 保存
  const saveAction = () => {
    formRef?.current?.validateFields(['platform_code', 'warehouse_id']).then((res) => {
      setSearchForm(res);
      getListAction(res);
    });
  };
  return (
    <ModalForm
      title={initialValues ? '仓库快递配置' : '仓库快递配置'}
      labelAlign="right"
      labelCol={{flex: '0 0 90px'}}
      layout="horizontal"
      width={1200}
      grid
      className="express-w"
      visible={isModalVisible}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        onCancel: () => {
          setIsModalVisible(false);
        },
      }}
      submitter={{
        searchConfig: {
          submitText: '确认',
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      formRef={formRef}
      initialValues={initialValues ? {...initialValues, status: initialValues?.status + ''} : {}}
    >
      <ProFormText hidden name="id" label="id"/>
      <ProFormSelect
        label="发货平台"
        name={'platform_code'}
        valueEnum={dicList?.ORDER_DELIVERY_WAREHOUSE || {}}
        colProps={{span: 8}}
        disabled={searchForm}
        readonly={initialValues}
        rules={[{required: !initialValues, message: '请选择平台'}]}
        fieldProps={{
          onChange: (platform_code) => {
            formRef.current?.setFieldsValue({
              warehouse_id: null,
              warehouse_name: null,
            });
            fetchOptions(platform_code, optionsWarehouseSet)
          }
        }}
      />
      <ProFormDependency name={['platform_code']}>
        {({platform_code}) => {
          if (platform_code) {
            if (platform_code == 'VENDOR') {
              return (
                <ProFormSelect
                  label={'供应商'}
                  name={'warehouse_id'}
                  colProps={{span: 8}}
                  disabled={searchForm}
                  readonly={initialValues}
                  rules={[{required: !initialValues, message: '请选择'}]}
                  fieldProps={{
                    showSearch: true,
                    options: optionsWarehouse,
                  }}
                  transform={(val) => {
                    return {
                      warehouse_id: val,
                      warehouse_name: optionsWarehouse.find(o => o.value == val)?.label,
                    };
                  }}
                />
              );
            }
            return (
              <ProFormSelect
                label={'发货仓库'}
                name={'warehouse_id'}
                colProps={{span: 8}}
                disabled={searchForm}
                readonly={initialValues}
                rules={[{required: !initialValues, message: '请选择'}]}
                fieldProps={{
                  showSearch: true,
                  options: optionsWarehouse,
                }}
                transform={(val) => {
                  return {
                    warehouse_id: val,
                    warehouse_name: optionsWarehouse.find(o => o.value == val)?.label,
                  };
                }}
              />
            );
          }
          return null;
        }}
      </ProFormDependency>
      {!searchForm && (
        <ProForm.Item>
          <Button type="primary" style={{marginLeft: '5px'}} onClick={saveAction}>
            保存
          </Button>
        </ProForm.Item>
      )}
      {searchForm && !initialValues && (
        <ProForm.Item>
          <Button style={{marginLeft: '5px'}} onClick={resetAction}>
            重选
          </Button>
        </ProForm.Item>
      )}
      {searchForm && (
        <EditableProTable
          rowKey="tempId"
          recordCreatorProps={
            access.canSee('order_express-warehouse_add')
              ? {
                newRecordType: 'dataSource',
                record: () => ({tempId: getUuid()}),
              }
              : false
          }
          actionRef={actionRef}
          editableFormRef={editorFormRef}
          scroll={{y: 'calc(70vh - 125px)'}}
          loading={loading}
          columns={columns}
          value={expressList}
          onChange={setExpressList}
          editable={{
            type: 'multiple',
            editableKeys,
            form: editForm,
            actionRender: (row: any, config, defaultDom) => {
              const arr = row?.id
                ? [defaultDom.save, defaultDom.cancel, defaultDom.delete]
                : [defaultDom.save, defaultDom.delete];
              return arr;
            },
            onSave: (rowKey, data: any) => {
              return new Promise(async (resolve, reject) => {
                // 保存
                let postData = JSON.parse(JSON.stringify(data));
                const warehouseData = formRef?.current?.getFieldsValue(['platform_code', 'warehouse_id'])
                warehouseData.warehouse_name = optionsWarehouse.find(o => o.value == warehouseData.warehouse_id)?.label
                postData = {
                  ...postData,
                  ...warehouseData,
                };
                postData.priority_area = postData?.priority_area?.join('、');
                const res: any = (await data?.id) ? update(postData) : insert(postData);
                res.then((r: any) => {
                  console.log(res, res?.code != pubConfig.sCode);
                  if (r?.code != pubConfig.sCode) {
                    reject();
                    pubMsg(r?.message);
                  } else {
                    const temp = expressList.filter((v: any) => v.tempId == data?.tempId)?.[0];
                    temp.id = r.data;
                    const index = expressList.findIndex((v: any) => v.tempId == data?.tempId);
                    editorFormRef?.current?.setRowData(index, temp);
                    pubMsg('保存成功', 'success');
                    resolve(r.data);
                    reload();
                  }
                });
              });
            },
            onChange: setEditableRowKeys,
          }}
        />
      )}
    </ModalForm>
  );
};
export default Component;
