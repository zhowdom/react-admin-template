import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { PlatformDingdingItem } from '@/types/storage';
import {
  syncMessagePage,
  syncMessageSync,
  deleteByIdSyncMessage,
} from '@/services/pages/settinsDingDingAudit';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubFilter, pubModal } from '@/utils/pubConfig';
import HistoryDetail from './HistoryDetail';
import { useAccess, Access } from 'umi';

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
const ContractManage = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const access = useAccess();
  // 添加弹窗实例

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    console.log('查询', params);
    const postData = {
      ...params,
      approval_status: params?.approval_status ? [params?.approval_status] : null,
      business_type: params?.business_type ? [params?.business_type] : null,
      business_id: params?.business_id ? [params?.business_id] : null,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    delete postData.current;
    delete postData.pageSize;
    const res = await syncMessagePage(postData);
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
  // 同步钉钉状态
  const changeStatus: any = (row?: any) => {
    pubModal('是否同步状态？')
      .then(async () => {
        const res = await syncMessageSync({ id: row?.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubMsg('操作成功！', 'success');
        setTimeout(() => {
          ref?.current?.reload();
        }, 200);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  // 删除
  const deleteMessage = (data: any) => {
    pubModal(`是否确定删除此记录？`)
      .then(async () => {
        const res = await deleteByIdSyncMessage({ id: data.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        ref?.current?.reload();
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };

  const columns = [
    {
      title: '业务名称',
      dataIndex: 'business_name',
      align: 'center',
      width: 190,
    },
    {
      title: '业务类型',
      dataIndex: 'business_code',
      align: 'center',
      width: 170,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      width: 90,
      fieldProps: selectProps,
      valueEnum: common.dicList.SYNC_MESSAGE_STATUS,
      render: (_: any, row: any) => {
        return row?.status ? pubFilter(dicList.SYNC_MESSAGE_STATUS, row?.status) : '-';
      },
    },
    {
      title: '业务ID',
      dataIndex: 'business_id',
      align: 'center',
      width: 170,
      render: (text: any, row: any) => {
        // VENDOR_BASE("scmToErpVendorSyncHandler","供应商基础信息同步"),
        // VENDOR_BANK_ACCOUNT("scmToErpVendorBankAccountHandler","供应商账户信息同步"),
        // VENDOR_GROUP("scmToErpItemCategorySyncHandler","供应商产品线同步"),
        // GOODS_SYNC("scmToErpGoodsSyncHandler","产品信息同步"),
        // GOODS_SKU_SYNC("scmToErpGoodsSkuSyncHandler","商品信息同步"),
        // GOODS_SKU_VENDOR_SYNC("scmToErpGoodsSkuVendorSyncHandler","采购商品信息同步"),
        // SYS_PLATFORM_SHOP("scmToErpGoodsGroupSyncHandler","店铺同步"),
        // INVENTTORY_COST("scmToErpInventoryCostHandler","库存成本同步");
        const allCode = [
          'scmToErpVendorSyncHandler',
          'scmToErpVendorBankAccountHandler',
          'scmToErpItemCategorySyncHandler',
          'scmToErpGoodsSyncHandler',
          'scmToErpGoodsSkuSyncHandler',
          'scmToErpGoodsSkuVendorSyncHandler',
          'scmToErpGoodsGroupSyncHandler',
          'scmToErpInventoryCostHandler',
        ];
        if (allCode.indexOf(row.business_code) > -1) return <a>{text}</a>;
        return text;
      },
    },
    {
      title: '业务单号',
      dataIndex: 'business_no',
      align: 'center',
      width: 170,
    },
    {
      title: '数据来源',
      dataIndex: 'data_sources',
      hideInSearch: true,
      align: 'center',
      width: 100,
      valueEnum: common.dicList.SYS_DATA_SOURCES,
      render: (_: any, row: any) => {
        return pubFilter(dicList.SYS_DATA_SOURCES, row?.data_sources);
      },
    },
    {
      title: '操作类型',
      dataIndex: 'operation_type',
      valueType: 'select',
      align: 'center',
      width: 80,
      fieldProps: selectProps,
      valueEnum: common.dicList.SYNC_OPERATION_TYPE,
      render: (_: any, row: any) => {
        return pubFilter(dicList.SYNC_OPERATION_TYPE, row?.operation_type);
      },
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      align: 'center',
      width: 250,
    },
    {
      title: '处理时间',
      dataIndex: 'process_time',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      align: 'center',
      width: 150,
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      hideInSearch: true,
      align: 'center',
      width: 150,
    },
    {
      title: '操作',
      key: 'option',
      width: 160,
      align: 'center',
      fixed: 'right',
      valueType: 'option',
      render: (_: any, row: any) => {
        const newList = [
          <HistoryDetail key="detail" detail={row} title="详情" dicList={common.dicList} />,
          <Access key="del" accessible={access.canSee('erpHistory_delete')}>
            <a
              onClick={() => {
                deleteMessage(row);
              }}
              key="del"
            >
              删除
            </a>
          </Access>,
        ];
        if (row.status == '1' || row.status == '3' || row.status == '4') {
          newList.push(
            <Access key="edit" accessible={access.canSee('erpHistory_edit')}>
              <a
                onClick={() => {
                  changeStatus(row);
                }}
                key="edit"
              >
                同步
              </a>
            </Access>,
          );
        }
        return newList;
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
        <ProTable<PlatformDingdingItem>
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          scroll={{ x: 1800 }}
          formRef={formRef}
          search={{ defaultCollapsed: false, className: 'light-search-form' }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getList}
          rowKey="id"
          dateFormatter="string"
          headerTitle="ERP同步记录"
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ContractManage);
export default ConnectPage;
