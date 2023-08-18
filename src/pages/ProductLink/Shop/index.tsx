import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import type { PlatformShopTableListItem } from '@/types/storage';
import { getSysPlatformShopPage } from '@/services/pages/storageManage';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubGetPlatformList } from '@/utils/pubConfirm';
// import OperationHistoryModal from '@/components/PubAuditShow/OperationHistoryModal';

import AddDialog from './AddDialog';
import { useAccess, Access } from 'umi';
import { sortBy } from 'lodash';
import CommonLog from '@/components/CommonLog';
import { getOperationHistory } from '@/services/pages/stockManager';

const ContractManage = (props: any) => {
  const { common } = props;
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
  const [tabList, setTabList] = useState<any>([]);
  const [tabStatus, setTabStatus] = useState(null);
  const [curItem, setCurItem] = useState<any>({});
  // 添加弹窗实例
  const addModel = useRef();
  const access = useAccess();

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    if (!params?.platform_id) {
      return {
        data: [],
        success: true,
        total: 0,
      };
    }
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    delete postData.current;
    delete postData.pageSize;
    const res = await getSysPlatformShopPage(postData);
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
  // 新增 编辑弹窗
  const addModalOpen: any = (row?: any) => {
    const data: any = addModel?.current;
    data.open(row?.id);
  };

  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };
  const getPlatListAction = async () => {
    const res: any = await pubGetPlatformList({ isDy: true });
    const dataC =
      res?.filter((v: any) => !['YUN_CANG', 'HUI_YE_CANG']?.includes(v.platform_code)) || [];
    const dataCCn = dataC
      ?.filter((v: any) => v.business_scope == 'CN')
      ?.map((v: any) => {
        return {
          ...v,
          order:
            v.label.indexOf('天猫') > -1
              ? 1
              : v.label.indexOf('京东') > -1
              ? v.label.indexOf('自营') > -1
                ? 3
                : 2
              : 4,
        };
      }) || [];
    const dataCIn = dataC?.filter((v: any) => v.business_scope == 'IN') || [];
    const list = [...sortBy(dataCIn, ['label']),...sortBy(dataCCn, ['order'])]?.map((v: any) => ({...v,key: v.value,tab: v.label})) || []
    setCurItem(list?.[0]);
    setTabStatus(list?.[0]?.key);
    setTabList(list);
  };
  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key);
    setCurItem(tabList?.filter((v: any) => v.key == key)?.[0] || {});
  };
  useEffect(() => {
    getPlatListAction();
  }, []);
  const columns: ProColumns<PlatformShopTableListItem>[] = [
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '站点',
      dataIndex: 'shop_site',
      align: 'center',
      width: 100,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.SYS_PLATFORM_SHOP_SITE, record.shop_site);
      },
      hideInTable: curItem?.business_scope == 'CN',
    },
    {
      title: '店铺名称',
      dataIndex: 'shop_name',
      width: curItem?.business_scope == 'CN' ? 250 : 220,
    },
    {
      title: '店铺简称',
      dataIndex: 'shop_short_name',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '店铺编号',
      dataIndex: 'source_id',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '平台店铺名',
      dataIndex: 'platform_shop_name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      width: 100,
      hideInSearch: true,
      fieldProps: selectProps,
      valueEnum: common.dicList.SYS_ENABLE_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.SYS_ENABLE_STATUS, record.status);
      },
    },
    {
      title: '店长',
      dataIndex: 'sysPlatformShopUserList',
      align: 'left',
      hideInSearch: true,
      render: (_: any, record: any) => {
        const pers = record.sysPlatformShopUserList
          ? record.sysPlatformShopUserList.map((v: any) => v.shop_manager_name)
          : [];
        return pers.join(',');
      },
    },
    {
      title: '创建人',
      width: 100,
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      width: 150,
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_, row) => [
        <Access key="edit" accessible={access.canSee('shop_edit')}>
          <a
            onClick={() => {
              addModalOpen(row);
            }}
            key="edit"
          >
            编辑
          </a>
        </Access>,
        <Access key="history" accessible={access.canSee('shop_history')}>
          {/* <OperationHistoryModal key="optionHistory" id={[row.id]} /> */}
          <CommonLog api={getOperationHistory} business_id={row.id} dicList={common?.dicList} />
        </Access>,
      ],
    },
  ];
  return (
    <>
      <AddDialog addModel={addModel} handleClose={modalClose} curItem={curItem} />

      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
        fixedHeader
        tabActiveKey={tabStatus}
        className="pubPageTabs"
        tabList={tabList}
        onTabChange={changeTabs}
      >
        <ProTable<PlatformShopTableListItem>
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          bordered
          scroll={{ x: 1200 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getList}
          rowKey="id"
          params={{ platform_id: tabStatus }}
          search={{ defaultCollapsed: false, className: 'light-search-form' }}
          dateFormatter="string"
          toolBarRender={() => [
            <Space key="buttons">
              <Access accessible={access.canSee('shop_add')}>
                <Button
                  onClick={() => {
                    addModalOpen();
                  }}
                  ghost
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  新增店铺
                </Button>
              </Access>
            </Space>,
          ]}
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ContractManage);
export default ConnectPage;
