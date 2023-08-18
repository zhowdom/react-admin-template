import {PageContainer} from '@ant-design/pro-layout';
import {Access, connect, useAccess} from 'umi';
import React, {useRef, useState} from 'react';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {useActivate} from 'react-activation';
import type {ProFormInstance} from '@ant-design/pro-form';
import {pubConfig, pubMsg} from '@/utils/pubConfig';
import Update, {fetchOptions} from './Dialogs/Update';
import {Button, Pagination, Space} from 'antd';
import {getList} from '@/services/pages/shipment/expressWarehouse';
import {flatData} from '@/utils/filter';
import {getUuid} from '@/utils/pubConfirm';
import CommonLogAms from '@/components/CommonLogAms';

const Page = (props: any) => {
  const {common} = props;
  const {dicList} = common;
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const access = useAccess();
  const _ref: any = useRef();
  const _refL: any = useRef();
  const [tableKey, setTableKey] = useState<any>(1);
  const [pagination, paginationSet] = useState({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [optionsWarehouse, optionsWarehouseSet] = useState([])
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
    let dataFlat: any[] = [];
    res.data.records = res.data.records?.map((v: any, i: number) => {
      return {
        ...v,
        index: i + 1,
      };
    });
    if (res?.data?.records?.length) {
      dataFlat = flatData(res.data.records, 'warehouseExpressList');
    }
    paginationSet({
      ...pagination,
      current: res?.data.current_page,
      total: res?.data?.total || 0,
    });
    return {
      success: true,
      data: dataFlat || [],
      total: res.data?.total || 0,
    };
  };
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });

  const columns: ProColumns<any>[] = [
    {
      title: '顺序',
      dataIndex: 'index',
      align: 'center',
      hideInSearch: true,
      onCell: ({rowSpan1}) => ({rowSpan: rowSpan1}),
      width: 70,
    },
    {
      title: '发货平台',
      dataIndex: 'platform_code',
      valueType: 'select',
      align: 'center',
      width: 100,
      order: 10,
      valueEnum: dicList?.ORDER_DELIVERY_WAREHOUSE,
      fieldProps: {
        showSearch: true,
        onChange: (platform_code: string) => {
          formRef.current?.setFieldsValue({
            region: null,
          });
          fetchOptions(platform_code, optionsWarehouseSet, false)
        },
      },
      onCell: ({rowSpan1}) => ({rowSpan: rowSpan1}),
    },
    {
      title: '仓库名称',
      dataIndex: 'warehouse_id',
      width: 120,
      align: 'center',
      fieldProps: {
        showSearch: true,
        options: optionsWarehouse,
      },
      valueType: 'select',
      onCell: ({rowSpan1}) => ({rowSpan: rowSpan1}),
      render: (_: any, record: any) => record?.warehouse_name ?? '-',
    },
    {
      title: '快递编码',
      dataIndex: 'express_code',
      width: 120,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '快递简称',
      dataIndex: 'express_short',
      width: 120,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '优先区域',
      dataIndex: 'priority_area',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '排列系数',
      dataIndex: 'sort_coefficient',
      width: 70,
      align: 'center',
      hideInSearch: true,
    },

    {
      title: '操作',
      key: 'option',
      width: 140,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      onCell: ({rowSpan1}) => ({rowSpan: rowSpan1}),
      className: 'wrap',
      render: (_: any, record: any) => {
        return [
          <Access key="edit" accessible={access.canSee('order_express-warehouse_edit')}>
            <a
              onClick={() => {
                _ref.current.visibileChange(true, record);
              }}
            >
              编辑
            </a>
          </Access>,
          <Access key="log" accessible={access.canSee('order_express-warehouse_log')}>
            <a
              onClick={() => {
                _refL.current.visibileChange(true, record?.warehouse_id);
              }}
            >
              操作日志
            </a>
          </Access>,
        ];
      },
    },
  ];

  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable
          columns={columns}
          actionRef={ref}
          pagination={false}
          onSubmit={() => {
            pagination.current = 1;
          }}
          key={tableKey}
          params={{
            current: pagination.current,
            pageSize: pagination.pageSize,
          }}
          bordered
          options={{fullScreen: true, setting: false}}
          headerTitle={
            <Space size={20}>
              <Access key="edit" accessible={access.canSee('order_express-warehouse_add')}>
                <Button
                  type="primary"
                  onClick={() => {
                    _ref.current.visibileChange(true);
                  }}
                >
                  新增
                </Button>
              </Access>
            </Space>
          }
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{className: 'light-search-form', defaultCollapsed: false}}
          scroll={{x: 1100}}
          sticky={{offsetHeader: 48}}
          defaultSize={'small'}
          rowKey="id"
          dateFormatter="string"
          revalidateOnFocus={false}
        />
        {/*ProTable合并单元格分页bug, 需要自定义分页*/}
        <div
          className="custom-pagination"
          style={{
            position: 'sticky',
            padding: '1px 24px',
            borderTop: '1px solid #e9e9e9',
            bottom: 0,
            right: 0,
            zIndex: 2,
            width: '100%',
            textAlign: 'right',
            background: '#fff',
          }}
        >
          <Pagination
            showTotal={(total: number) => `总共${total}条`}
            onChange={(current, pageSize) => {
              if (pagination.pageSize == pageSize) {
                paginationSet({...pagination, current, pageSize});
              } else {
                paginationSet({...pagination, current: 1, pageSize});
              }
            }}
            showSizeChanger
            size={'small'}
            {...pagination}
          />
        </div>
        <Update
          _ref={_ref}
          reload={() => {
            ref?.current?.reload();
            setTableKey(getUuid());
          }}
          dicList={common.dicList}
        />
        <CommonLogAms dicList={common?.dicList} _ref={_refL}/>
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({common}: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;
