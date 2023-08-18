import { Access, connect, history, useAccess } from 'umi';
import React, { useRef, useState, useEffect } from 'react';
import { Button, Popconfirm, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';
import {
  findGoodsSkuToVendor,
  getGoodsSkuVendorPage,
  syncPlatformStockNo,
  updateMainVendor,
} from '@/services/pages/cooperateProduct';
import type { TableListItem, TableListPagination } from './data';
import { pubGetUserList, pubGetVendorList, pubProLineList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import SelectSkuByVendor from './Dialog/SelectSkuByVendor';
import ChangePriceList from './Dialog/ChangePriceList';
import ChangeHistory from './Dialog/ChangeHistory';
import DeliSveryStore from './Dialog/DeliSveryStore';
import { useActivate } from 'react-activation';
import CopyModal from './Dialog/CopyModal';
import ProductSkuTable from '@/components/PubSKU/ProductSkuTable';
import UpdateDeliveryDay from './Dialog/UpdateDeliveryDay';
import SetSpec from './Dialog/SetSpec';
import BatchSetSendStore from './Dialog/BatchSetSendStore';
import { getList as getList_select } from '@/services/pages/shipment/warehousecN';
import HandleLog from './components/HandleLog';

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

  // 批量发货--多选操作
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRow, setSelectedRow] = useState<React.Key[]>([]);
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  // 缓存页面每次激活后重新请求列表(刷新)
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });
  // 添加弹窗实例
  const changeHistoryModel = useRef();
  const changePriceListModel = useRef();
  const setBatchSendStoreModel = useRef();

  // 批量价格变更弹窗
  const changePriceListModelOpen: any = (type: string) => {
    const data: any = changePriceListModel?.current;
    data.open(type);
  };
  // 批量设置发货仓
  const setBatchSendStoreModelOpen: any = () => setBatchSendStoreModel?.current?.showModal()
  // 发货仓与退货仓列表
  const [QIMEN_YUNCANG_MAP, setQIMEN_YUNCANG_MAP] = useState([])
  const [YUNCANG_MAP, setYUNCANG_MAP] = useState([])
  const querySendStoreORreturnStore = async (type:string) => {
    const res: any = await getList_select({
      current_page: 1,
      page_size: '99999',
      platform_code: type, // type: 奇门云仓-'QIMEN_YUNCANG'||万里牛云仓-'YUNCANG'
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return [];
    }
    const newArray = res?.data?.records
      .map((v: any) => {
        return {
          value: v.id,
          label: v.warehouse_name + '(' + v.warehouse_code + ')',
          name: v.warehouse_name,
          disabled: v.status != 1,
          data: v,
          status: v.status,
        };
      })
      .sort((a: any, b: any) => b.status - a.status);

      type === 'QIMEN_YUNCANG' ? setQIMEN_YUNCANG_MAP(newArray) : setYUNCANG_MAP(newArray)
    return newArray;
  }

  useEffect(() => {
    querySendStoreORreturnStore('QIMEN_YUNCANG')
    querySendStoreORreturnStore('YUNCANG')
  }, [1])
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
      business_scope: 'CN', //业务范畴
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
    setSelectedRowKeys([]);
    setSelectedRow([]);
    return {
      data: res?.code == pubConfig.sCode ? (res.data.records.map((item:any) => {
        let {cloud_warehouse_id, return_cloud_warehouse_id, send_kind, ...a} = item
        return {
          send_kind,
          cloud_warehouse_id: (send_kind == 5 || send_kind == 6) ? cloud_warehouse_id : '', // 针对脏殊数特殊处理
          return_cloud_warehouse_id: (send_kind == 5 || send_kind == 6) ? return_cloud_warehouse_id : '',
          ...a
        }
      })) : [],
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };

  const goDetail = async (id: any) => {
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
            if (!access.canSee('cooperate_view_cn')) {
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
      title: '库存编号',
      dataIndex: 'stock_no',
      hideInTable: true,
    },
    {
      title: '库存编号',
      tooltip: (
        <>
          老ERP直接导入的产品显示老系统库存编号
          <br />
          新系统立项签样的产品显示的是款式编码
        </>
      ),
      dataIndex: 'stock_no',
      align: 'center',
      width: 130,
      hideInSearch: true,
    },
    {
      title: '平台库存编号',
      dataIndex: 'platform_stock_no',
      hideInTable: true,
    },
    {
      title: '平台库存编号',
      tooltip: (
        <>
          京东FCS：平台商品编码
          <br />
          京东自营：SKU
          <br />
          天猫：菜鸟货品id
          <br />
          京东POP：平台商品编码(EMG码)
        </>
      ),
      dataIndex: 'platform_stock_no',
      align: 'center',
      width: 180,
      className: 'p-table-inTable noBorder',
      onCell: () => ({ colSpan: 2, style: { padding: 0 } }),
      render: (_: any, record: any) => {
        return (
          <ProductSkuTable
            skus={record?.goodList}
            dicList={common?.dicList}
            columnsKey={['platform_stock_no', 'name_or_shop_name']}
          />
        );
      },
      hideInSearch: true,
    },
    {
      title: '平台/店铺',
      dataIndex: 'name_or_shop_name',
      align: 'center',
      hideInSearch: true,
      width: 200,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
    },
    {
      title: '生命周期',
      dataIndex: 'life_cycle',
      width: 100,
      valueEnum: common?.dicList?.GOODS_LIFE_CYCLE || {},
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
      render: (_, row: any) => (
        <div className={'space-side-gap'}>
          <Space>
            {access.canSee('cooperate_view_cn') ? (
              <a onClick={() => goDetail(row.id)}>详情</a>
            ) : null}
            <Access key="copy" accessible={access.canSee('cooperate_vendor_backup_cn')}>
              <CopyModal key={'backup'} data={row} dicList={common?.dicList} />
            </Access>
            {/*价格变更*/}
            <Access key="change" accessible={access.canSee('cooperate_price_change_cn')}>
              <SelectSkuByVendor
                key={'changePrice'}
                dataSource={row}
                reload={actionRef?.current?.reload}
                dicList={common?.dicList}
              />
            </Access>
          </Space>
          <Space>
            <Access key="change" accessible={access.canSee('cooperate_change_history_cn')}>
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
              accessible={access.canSee('cooperate_update_delivery_day_cn')}
            >
              {/*修改交期*/}
              <UpdateDeliveryDay id={row.id} />
            </Access>
          </Space>
          <Space direction={'vertical'} size={0}>
            {/*设置主供应商*/}
            {access.canSee('cooperate_vendor_set_cn') ? (
              <SetVendorModal key={'mainVendor'} data={row} reload={actionRef?.current?.reload} />
            ) : null}
            {/*同步平台库存编码*/}
            <Access
              accessible={
                access.canSee('coo_productLink_link_sync') &&
                !['JD_OPERATE', 'AMAZON_VC'].includes(row.platform_code)
              }
            >
              <Popconfirm
                title="确定同步吗?"
                onConfirm={async () => {
                  const res = await syncPlatformStockNo({ id: row?.id });
                  if (res?.code != pubConfig.sCode) {
                    pubMsg(res?.message);
                  } else {
                    pubMsg('同步成功!', 'success');
                    actionRef?.current?.reload();
                  }
                }}
                okText="确定"
                cancelText="取消"
              >
                <a>同步平台库存编码</a>
              </Popconfirm>
            </Access>
            <Access accessible={access.canSee('cooperate_set_spec_cn')}>
              <SetSpec record={row} reload={actionRef?.current?.reload} />
            </Access>
          </Space>

          <Space direction={'vertical'} size={0}>
            <Access accessible={access.canSee('scm_cooperate_send_store')}>
              {/*设置发货仓*/}
              {
                <DeliSveryStore data={row} reload={actionRef?.current?.reload} dicList={common.dicList} QIMEN_YUNCANG_MAP={QIMEN_YUNCANG_MAP} YUNCANG_MAP={YUNCANG_MAP} />
              }
            </Access>
          </Space>

          <Space direction={'vertical'} size={0}>
            <Access accessible={access.canSee('scm_cooperate_send_handlelog')}>
            <HandleLog dicList={common.dicList} trigger="操作日志" id={row.id} />
           </Access>
          </Space>

        </div>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRow(newSelectedRow);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <ProTable<TableListItem, TableListPagination>
        rowSelection={rowSelection}
        actionRef={actionRef}
        rowKey="id"
        pagination={{
          defaultPageSize: 50,
        }}
        bordered
        dateFormatter="string"
        request={getList}
        columns={columns}
        tableAlertRender={false}
        search={{
          className: 'light-search-form',
          defaultCollapsed: false,
        }}
        scroll={{ x: 1500 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        toolBarRender={() => [
          <Access key="change" accessible={access.canSee('cooperate_batch_price_change_cn')}>
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
          <Access key="change" accessible={access.canSee('scm_cooperate_batch_send_store')}>
          <Space key="space">
            <Button
              type="primary"
              key="order"
              disabled={selectedRowKeys?.length <= 0}
              onClick={() => {
                setBatchSendStoreModelOpen();
              }}
            >
              批量设置发货仓
            </Button>

          </Space>
        </Access>,
        ]}
      />
      <ChangePriceList changePriceListModel={changePriceListModel} handleClose={modalClose} />
      <ChangeHistory changeHistoryModel={changeHistoryModel} handleClose={modalClose} />
      <BatchSetSendStore ref={setBatchSendStoreModel} common={common} QIMEN_YUNCANG_MAP={QIMEN_YUNCANG_MAP} YUNCANG_MAP={YUNCANG_MAP} selectedRowArray={selectedRow} reload={actionRef?.current?.reload} />

    </PageContainer>
  );
};

// 全局model注入
const ConnectPageCn: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPageCn;
