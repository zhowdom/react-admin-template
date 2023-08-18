import { Access, connect, history, useAccess } from 'umi';
import React, { useRef } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import {
  findGoodsSkuToVendor,
  getGoodsSkuVendorPage,
  updateMainVendor,
} from '@/services/pages/cooperateProduct';
import type { TableListItem, TableListPagination } from './data';
import { pubGetUserList, pubGetVendorList, pubProLineList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import SelectSkuByVendor from './Dialog/SelectSkuByVendor';
import ChangePriceList from './Dialog/ChangePriceList';
import ChangeHistory from './Dialog/ChangeHistory';
import { useActivate } from 'react-activation';
import CopyModal from './Dialog/CopyModal';
import ProductSkuTable from '@/components/PubSKU/ProductSkuTable';
import UpdateDeliveryDay from './Dialog/UpdateDeliveryDay';
import SetSpec from './Dialog/SetSpec';

const requiredRule = { required: true, message: '必填项' };
// 设置主供应商弹框
const SetVendorModal: React.FC<{ data: any; reload: any }> = ({ data, reload }: any) => {
  return (
    <ModalForm
      title={'设置主供应商'}
      trigger={<a>设置主供应商</a>}
      width={500}
      layout={'horizontal'}
      onFinish={async (values) => {
        const res = await updateMainVendor(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message, 'success');
        if (typeof reload) reload();
        return true;
      }}
      modalProps={{ destroyOnClose: true, maskClosable: false }}
    >
      <ProFormText initialValue={data.id} name={'goods_sku_id'} noStyle hidden />
      <ProFormSelect
        label={'主供应商'}
        name={'vendor_id'}
        rules={[requiredRule]}
        params={{ goods_sku_id: data.id }}
        fieldProps={{ showSearch: true }}
        request={async (params) => {
          const res = await findGoodsSkuToVendor(params);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return [];
          }
          return res.data.map((item: any) => ({
            label: item.vendor_name,
            value: item.vendor_id,
            disabled: item.is_main_vendor && item.is_main_vendor == '是',
          }));
        }}
      />
    </ModalForm>
  );
};

const Page: React.FC<{ common: any }> = ({ common }) => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  // 缓存页面每次激活后重新请求列表(刷新)
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });
  // 添加弹窗实例
  const changeHistoryModel = useRef();
  const changePriceListModel = useRef();

  // 批量价格变更弹窗
  const changePriceListModelOpen: any = (type: string) => {
    const data: any = changePriceListModel?.current;
    data.open(type);
  };
  // 变更历史
  const changeHistoryModelOpen: any = (row: any) => {
    const data: any = changeHistoryModel?.current;
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
      vendor_id: params.vendor_id, //供应商Id
      business_scope: 'IN', //业务范畴
      sku_name: params.sku_name, //商品名称
      bar_code: params.bar_code, //商品条形码
      create_user_id: params.create_user_id, //发起人
      begin_date: params?.time?.[0] ? params?.time?.[0] + ' 00:00:00' : null, //开始日期
      end_date: params?.time?.[1] ? params?.time?.[1] + ' 23:59:59' : null, //结束日期
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getGoodsSkuVendorPage(postData);
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

  const goDetail = async (id: any) => {
    console.log(id, 'id')
    history.push(`/products/cooperate-product/detail?id=${id}`);
  };

  // table配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      order: 8,
      width: 110,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      order: 7,
      render: (text, row) => [
        <a
          onClick={() => {
            if (!access.canSee('cooperate_view_in')) {
              pubMsg('暂无查看详情权限~')
              return
            }
            goDetail(row.id);
          }}
          key="edit"
        >
          {text}
        </a>,
      ],
    },
    {
      title: (
        <>
          ERP编码
          <Tooltip
            placement="top"
            title={() => (
              <span>
                ERP编码指老系统现有规则的编码
                <br />
                在国内ERP对应『款式编号』
                <br />
                在跨境ERP对应『商品SKU』
              </span>
            )}
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'erp_sku',
      align: 'center',
      width: 100,
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      width: 150,
      className: 'p-table-inTable noBorder',
      onCell: () => ({ colSpan: 3, style: { padding: 0 } }),
      render: (_: any, record: any) => {
        return (
          <ProductSkuTable
            skus={record?.goodList}
            dicList={common?.dicList}
            columnsKey={['shop_sku_code', 'shop_name', 'sales_status']}
          />
        );
      },
    },
    {
      title: '店铺名',
      dataIndex: 'shop_name',
      align: 'center',
      hideInSearch: true,
      width: 150,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },

    {
      title: '销售状态',
      dataIndex: 'sales_status',
      align: 'center',
      hideInSearch: true,
      width: 100,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
    },
    {
      title: '主供应商',
      dataIndex: 'main_vendor_id',
      hideInTable: true,
      valueType: 'select',
      order: 9,
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
      debounceTime: 300,
      fieldProps: selectProps,
    },
    {
      title: '主供应商',
      dataIndex: 'main_vendor_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '产品线',
      dataIndex: 'category_id-in',
      align: 'center',
      hideInTable: true,
      order: 10,
      fieldProps: { showSearch: true },
      request: () => pubProLineList({ business_scope: 'IN' }),
      search: {
        transform: (category_id: any) => ({ category_id }), // todo: 不同页面同名下拉框缓存互相影响问题
      },
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      align: 'center',
      hideInSearch: true,
      width: 100,
    },
    {
      title: '签样确认人',
      dataIndex: 'create_user_id',
      hideInTable: true,
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
    },
    {
      title: '签样确认时间',
      dataIndex: 'time',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: '签样确认时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      align: 'center',
      width: 150,
      render: (text, row) => {
        return (
          <div>
            {text}
            <div>{row.create_user_name}</div>
          </div>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'left',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, row) => (
        <div className={'space-side-gap'}>
          <Space>
            {access.canSee('cooperate_view_in') ? (
              <a onClick={() => goDetail(row.id)}>详情</a>
            ) : null}
            <Access key="copy" accessible={access.canSee('cooperate_vendor_backup_in')}>
              <CopyModal key={'backup'} data={row} dicList={common?.dicList} />
            </Access>
            {/*价格变更*/}
            <Access key="change" accessible={access.canSee('cooperate_price_change_in')}>
              <SelectSkuByVendor
                key={'changePrice'}
                dataSource={row}
                reload={actionRef?.current?.reload}
                dicList={common?.dicList}
              />
            </Access>
          </Space>
          <Space direction={'vertical'}>
            <Access key="change" accessible={access.canSee('cooperate_change_history_in')}>
              <a
                onClick={() => {
                  changeHistoryModelOpen(row);
                }}
              >
                价格变更历史
              </a>
            </Access>
            <Access
              key="UpdateDeliveryDay"
              accessible={access.canSee('cooperate_update_delivery_day_in')}
            >
              {/*修改交期*/}
              <UpdateDeliveryDay id={row.id} />
            </Access>
            {/*设置主供应商*/}
            {access.canSee('cooperate_vendor_set_in') ? (
              <SetVendorModal key={'mainVendor'} data={row} reload={actionRef?.current?.reload} />
            ) : null}
            <Access accessible={access.canSee('cooperate_set_spec_in')}>
              <SetSpec record={row} reload={actionRef?.current?.reload} />
            </Access>
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
      <ProTable<TableListItem, TableListPagination>
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        rowKey="id"
        pagination={{
          defaultPageSize: 50,
        }}
        bordered
        dateFormatter="string"
        request={getList}
        columns={columns}
        search={{ className: 'light-search-form', defaultCollapsed: false }}
        scroll={{ x: 1500 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        toolBarRender={() => [
          <Access key="change" accessible={access.canSee('cooperate_batch_price_change_in')}>
            <Space key="space">
              <Button
                type="primary"
                key="order"
                onClick={() => {
                  changePriceListModelOpen('add');
                }}
              >
                批量价格变更
              </Button>
            </Space>
          </Access>,
        ]}
      />
      <ChangePriceList changePriceListModel={changePriceListModel} handleClose={modalClose} />
      <ChangeHistory changeHistoryModel={changeHistoryModel} handleClose={modalClose} />
    </PageContainer>
  );
};

// 全局model注入
const ConnectPageIn: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPageIn;
