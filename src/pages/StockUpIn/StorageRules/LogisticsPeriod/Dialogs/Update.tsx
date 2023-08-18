import { Button, Popconfirm, Tabs } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormDependency, ProFormSelect, ProForm } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { useRef, useState, useMemo } from 'react';
import { getUuid, pubGetPlatformList, pubPlatformWarehousingIn } from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubRequiredRule, pubModal } from '@/utils/pubConfig';
import './index.less';
import * as api from '@/services/pages/stockUpIn/logisticsPeriod';
import { orderBy } from 'lodash';

const initialDataSource: any = [
  {
    tempId: '0',
    warehouse_id: null,
    domestic_transport_cycle: 0,
    shipping_cycle: 0,
    foreign_transport_cycle: 0,
    shelves_cycle: 0,
    remarks: '',
  },
];
const Component: React.FC<{
  reload: any;
  title?: string;
  dicList: any;
  initialValues?: any;
  trigger?: React.ReactElement;
}> = ({ title, dicList, trigger, reload, initialValues }) => {
  const formRef = useRef<ProFormInstance<any>>();
  const editorFormRef = useRef<any>();
  const actionRef = useRef<any>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [dataSource, dataSourceSet] = useState<any>(initialDataSource);
  const [visible, visibleSet] = useState<boolean>(false);
  const [warehouseParams, warehouseParamsSet] = useState<any>(
    initialValues ? { site: initialValues.site, platform_id: initialValues.platform_id } : {},
  );
  const [recordData, recordDataSet] = useState<any>();
  const columns: ProColumns<any>[] = [
    {
      title: '仓库/平均周期(天)',
      dataIndex: 'warehouse_id',
      width: 160,
      valueType: 'select',
      align: 'center',
      params: warehouseParams,
      request: async (params: any, record: any) => {
        const res = await pubPlatformWarehousingIn(params);
        // 过滤已配置的仓库
        const existWarehouseIds = record?.record?.id
          ? []
          : dataSource.map((item: any) => item.warehouse_id);
        let data = res.filter((item: any) => !existWarehouseIds.includes(item.value));
        // 禁用状态不可配置
        data = data.map((item: any) => ({ ...item, disabled: item.status == '0' }));
        return data;
      },
      formItemProps: {
        rules: [pubRequiredRule],
      },
      fieldProps: {
        placeholder: '选择仓库',
      },
      render: (text: any, record: any) => {
        if (record.warehouse_id == 0) {
          return '平均周期(天)';
        }
        return record.warehousing_name;
      },
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method',
      width: 100,
      align: 'center',
      editable: false,
      valueEnum: dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || [],
    },
    {
      title: '国内运输周期(天)',
      dataIndex: 'domestic_transport_cycle',
      width: 140,
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 0,
      },
      formItemProps: {
        rules: [pubRequiredRule],
      },
    },
    {
      title: '船期(天)',
      dataIndex: 'shipping_cycle',
      width: 110,
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 0,
      },
      formItemProps: {
        rules: [pubRequiredRule],
      },
    },
    {
      title: '国外运输周期(天)',
      dataIndex: 'foreign_transport_cycle',
      width: 140,
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 0,
      },
      formItemProps: {
        rules: [pubRequiredRule],
      },
    },
    {
      title: '上架周期(天)',
      dataIndex: 'shelves_cycle',
      width: 110,
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 0,
      },
      formItemProps: {
        rules: [pubRequiredRule],
      },
    },
    {
      title: '合计',
      dataIndex: 'total',
      width: 100,
      align: 'right',
      editable: false,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      align: 'center',
      fieldProps: {
        maxLength: 500,
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      align: 'center',
      render: (text, record, _, action) =>
        _ >= 1
          ? [
              <a
                key="editable"
                onClick={() => {
                  action?.startEditable?.(record.tempId);
                }}
              >
                编辑
              </a>,
              <Popconfirm
                key={'delete'}
                title={'确定删除?'}
                onConfirm={async () => {
                  if (!record.id) return;
                  const res = await api.remove(record.id);
                  if (res.code != pubConfig.sCode) {
                    pubMsg(res?.message || '删除失败');
                    return;
                  }
                  pubMsg('删除成功!', 'success');
                  actionRef?.current?.reload();
                }}
              >
                <a>删除</a>
              </Popconfirm>,
            ]
          : [],
    },
  ];
  // 排序, warehouse_id: 0的排第一, 其他的按创建时间正序排
  const sortByProp = (
    objArray: any[],
    prop: string = 'create_time',
    type: 'asc' | 'desc' = 'asc',
  ) => {
    // 平均周期
    const first = objArray.find((item: any) => item.warehouse_id == 0);
    const otherArray = objArray.filter((item: any) => item.warehouse_id != 0);
    return [first, ...orderBy(otherArray, [prop], [type])];
  };
  // 获取tabs汇总数据
  const getRecordData = async (site: any, platform_id: any) => {
    if (!site || !platform_id) {
      recordDataSet(null);
      return;
    }
    const res = await api.getList({ site, platform_id });
    if (res?.data?.records?.length) {
      recordDataSet(res?.data?.records[0]);
    }
  };
  // 刷新数据
  const getDetail = async (site: any, platform_id: any, shipping_method: any) => {
    getRecordData(site, platform_id);
    let data = initialDataSource;
    if (!site || !platform_id) {
      dataSourceSet(data);
      return [];
    }
    const res = await api.getDetail({
      site,
      platform_id,
      shipping_method,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    if (res?.data?.length) {
      const tempArray = res?.data?.map((item: any) => ({ ...item, tempId: item.id }));
      data = sortByProp(tempArray);
    }
    reload();
    dataSourceSet(data);
    return [];
  };
  // 运输方式
  const tabItems = useMemo(() => {
    const shipments = dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD;
    if (shipments) {
      return Object.keys(shipments).map((key: any) => ({
        label: recordData
          ? `${shipments[key].detail_name}(${recordData[shipments[key].detail_code]})`
          : shipments[key].detail_name,
        key: shipments[key].detail_code,
      }));
    }
    return [];
  }, [dicList, recordData]);
  return (
    <ModalForm
      title={title || '新增/编辑 - 物流时效信息'}
      trigger={
        trigger ? (
          <a onClick={() => visibleSet(true)}>编辑</a>
        ) : (
          <Button onClick={() => visibleSet(true)} type="primary">
            新增
          </Button>
        )
      }
      width={1200}
      layout={'horizontal'}
      grid
      modalProps={{
        // destroyOnClose: true,
        maskClosable: false,
        onCancel: () => {
          if (editableKeys?.length) {
            pubModal('您有未保存的数据, 确定关闭弹窗?')
              .then(async () => {
                visibleSet(false);
              })
              .catch(() => {
                console.log('点击了取消');
              });
            return;
          }
          visibleSet(false);
        },
      }}
      formRef={formRef}
      params={{ visible }}
      validateTrigger="onBlur"
      visible={visible}
      submitter={{
        render: () => {
          return (
            <Button
              onClick={() => {
                if (editableKeys?.length) {
                  pubModal('您有未保存的数据, 确定关闭弹窗?')
                    .then(async () => {
                      visibleSet(false);
                    })
                    .catch(() => {
                      console.log('点击了取消');
                    });
                  return;
                }
                visibleSet(false);
              }}
            >
              关闭
            </Button>
          );
        },
      }}
      initialValues={initialValues || {}}
    >
      <ProFormSelect
        colProps={{ span: 12 }}
        name="platform_id"
        label="平台"
        showSearch
        debounceTime={300}
        request={() => pubGetPlatformList({ business_scope: 'IN' })}
        rules={[pubRequiredRule]}
        fieldProps={{
          allowClear: false,
          onChange: () => {
            setEditableRowKeys([]);
            formRef.current?.setFieldsValue({ site: '' });
          },
        }}
        readonly={!!initialValues?.platform_id}
      />
      <ProFormSelect
        colProps={{ span: 12 }}
        name="site"
        label="站点"
        showSearch
        debounceTime={300}
        valueEnum={dicList?.SYS_PLATFORM_SHOP_SITE || []}
        rules={[pubRequiredRule]}
        fieldProps={{
          allowClear: false,
          onChange: async (site: any) => {
            const platform_id = formRef.current?.getFieldValue('platform_id');
            const shipping_method = formRef.current?.getFieldValue('shipping_method');
            getDetail(site, platform_id, shipping_method);
            warehouseParamsSet({ ...warehouseParams, site, platform_id });
          },
        }}
        readonly={!!initialValues?.site}
      />
      <ProForm.Item
        label={''}
        name={'shipping_method'}
        initialValue={'dragon_boat_ordinary'}
        style={{ marginBottom: 0, paddingLeft: '24px', width: '100%' }}
      >
        <Tabs
          items={tabItems}
          onChange={(shipping_method) => {
            const platform_id = formRef.current?.getFieldValue('platform_id');
            const site = formRef.current?.getFieldValue('site');
            getDetail(site, platform_id, shipping_method);
          }}
        />
      </ProForm.Item>
      <ProFormDependency name={['platform_id', 'site', 'shipping_method']}>
        {({ platform_id, site, shipping_method }) => {
          return platform_id && site && shipping_method ? (
            <>
              <EditableProTable
                actionRef={actionRef}
                className={'emphasizeFirstRow'}
                bordered
                size={'small'}
                rowKey="tempId"
                recordCreatorProps={{
                  record: () => {
                    return {
                      tempId: getUuid(),
                      warehouse_id: null,
                      domestic_transport_cycle: 0,
                      shipping_cycle: 0,
                      foreign_transport_cycle: 0,
                      shelves_cycle: 0,
                      remarks: '',
                      shipping_method: formRef.current?.getFieldValue('shipping_method'),
                    };
                  },
                  creatorButtonText: '添加一个仓库信息',
                }}
                value={dataSource}
                columns={columns}
                editableFormRef={editorFormRef}
                editable={{
                  editableKeys,
                  onChange: (keys: any) => {
                    warehouseParamsSet({ ...warehouseParams, timeStamp: Date.now() });
                    setEditableRowKeys(keys);
                  },
                  onSave: async (key, row) => {
                    // 提交数据
                    let apiTem = api.insert;
                    if (row.id) {
                      apiTem = api.update;
                    }
                    const res = await apiTem({
                      site,
                      platform_id,
                      shipping_method,
                      ...row,
                    });
                    if (res?.code != pubConfig.sCode) {
                      pubMsg(res?.message);
                      return false;
                    } else {
                      // 刷新结果
                      getDetail(site, platform_id, shipping_method);
                    }
                    return row;
                  },
                }}
                request={() => getDetail(site, platform_id, shipping_method)}
              />
            </>
          ) : null;
        }}
      </ProFormDependency>
    </ModalForm>
  );
};
export default Component;
