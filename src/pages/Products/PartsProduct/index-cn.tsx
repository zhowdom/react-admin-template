import { Access, connect, useAccess } from 'umi';
import React, { useRef, useState } from 'react';
import { Button, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { partsPage } from '@/services/pages/partsProduct';
import { pubGetUserList, pubProLineList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useActivate } from 'react-activation';
import ProductSkuTable from './Dialog/ProductSkuTable';
import AddPartsPro from './Dialog/AddPartsPro';
import EditPartsPro from './Dialog/EditPartsPro';
import OrderHistory from './Dialog/OrderHistory';
import VendorSet from './Dialog/VendorSet';

const Page: React.FC<{ common: any }> = ({ common }) => {
  const [openVendorSet, openVendorSetSet] = useState<boolean>(false);
  const [selectedRow, selectedRowSet] = useState<null | Record<string, any>>(null);
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  // 缓存页面每次激活后重新请求列表(刷新)
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });
  // 添加弹窗实例
  const addPartsProModel = useRef();
  const editPartsProModel = useRef();
  const orderHistoryModel = useRef();

  // 新增 添加配件弹窗
  const addModalOpen: any = (type: any, row?: any) => {
    const data: any = addPartsProModel?.current;
    data.open(type, row);
  };
  // 编辑配件弹窗
  const editModalOpen: any = (type: any, row?: any) => {
    const data: any = editPartsProModel?.current;
    data.open(type, row);
  };
  // 采购记录
  const orderHistoryModelOpen: any = (row: any) => {
    const data: any = orderHistoryModel?.current;
    data.open(row.id);
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      actionRef?.current?.reload();
    }, 200);
  };

  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      business_scope: 'CN', //业务范畴
      begin_date: params?.time?.[0] ? params?.time?.[0] + ' 00:00:00' : null, //开始日期
      end_date: params?.time?.[1] ? params?.time?.[1] + ' 23:59:59' : null, //结束日期
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await partsPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }

    return {
      data: res?.code == pubConfig.sCode ? res.data.records : [],
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };

  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '主产品名称',
      dataIndex: 'name_cn',
      align: 'center',
      order: 9,
    },
    {
      title: '主产品编码',
      dataIndex: 'goods_code',
      order: 8,
      width: 110,
    },
    {
      title: '配件名称',
      dataIndex: 'sku_name',
      align: 'center',
      width: 150,
      className: 'p-table-inTable noBorder',
      onCell: () => ({ colSpan: 6, style: { padding: 0, width: 780 } }),
      render: (_: any, record: any) => {
        return <ProductSkuTable skus={record?.goodsSkus} dicList={common?.dicList} />;
      },
    },
    {
      title: '配件编码',
      dataIndex: 'sku_code',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '库存编号',
      dataIndex: 'stock_no',
      align: 'center',
      hideInSearch: true,
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '创建人',
      dataIndex: 'create_user_id',
      hideInTable: true,
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      hideInSearch: true,
      valueType: 'select',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '创建时间',
      dataIndex: 'time',
      hideInTable: true,
      valueType: 'dateRange',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      width: 90,
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '产品线',
      dataIndex: 'category_id-cn',
      align: 'center',
      hideInTable: true,
      order: 10,
      fieldProps: { showSearch: true },
      request: () => pubProLineList({ business_scope: 'CN' }),
      search: {
        transform: (category_id: any) => ({ category_id }), // todo: 不同页面同名下拉框缓存互相影响问题
      },
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 180,
      fixed: 'right',
      render: (_, row: any) => (
        <div className={'space-side-gap'}>
          <Space direction={'vertical'}>
            <Space>
              <Access key="detail" accessible={access.canSee('scm_parts_product_detail')}>
                <a onClick={() => editModalOpen('detail', row)}>查看</a>
              </Access>
              <Access key="edit" accessible={access.canSee('scm_parts_product_edit')}>
                <a onClick={() => editModalOpen('edit', row)}>编辑</a>
              </Access>
              <Access key="addPro" accessible={access.canSee('scm_parts_product_add')}>
                <a onClick={() => addModalOpen('old', row)}>添加配件</a>
              </Access>
            </Space>
            <Space>
              <Access key="history" accessible={access.canSee('scm_parts_product_history')}>
                <a
                  onClick={() => {
                    orderHistoryModelOpen(row);
                  }}
                >
                  采购记录
                </a>
              </Access>
              <Access key="vendorSet" accessible={access.canSee('scm_parts_vendor_set')}>
                <a
                  onClick={() => {
                    selectedRowSet(row);
                    openVendorSetSet(true);
                  }}
                >
                  供应商设置
                </a>
              </Access>
            </Space>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <ProTable<any>
        actionRef={actionRef}
        rowKey="id"
        pagination={{
          pageSize: 50,
          current: 1,
        }}
        bordered
        dateFormatter="string"
        request={getList}
        columns={columns}
        search={{
          labelWidth: 90,
          className: 'light-search-form',
          defaultCollapsed: false,
        }}
        scroll={{ x: 1500 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        toolBarRender={() => [
          <Space key="space">
            <Access key="create" accessible={access.canSee('scm_parts_all_product_add')}>
              <Button
                onClick={() => {
                  addModalOpen('add');
                }}
                type="primary"
                icon={<PlusOutlined />}
              >
                添加产品配件
              </Button>
            </Access>
          </Space>,
        ]}
      />
      <AddPartsPro
        addPartsProModel={addPartsProModel}
        handleClose={modalClose}
        dicList={common?.dicList}
      />
      <EditPartsPro
        editPartsProModel={editPartsProModel}
        handleClose={modalClose}
        dicList={common?.dicList}
      />
      <OrderHistory orderHistoryModel={orderHistoryModel} dicList={common?.dicList} />
      <VendorSet
        open={openVendorSet}
        openSet={openVendorSetSet}
        selectedRow={selectedRow}
        dicList={common?.dicList || {}}
      />
    </PageContainer>
  );
};

// 全局model注入
const ConnectPageCn: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPageCn;
