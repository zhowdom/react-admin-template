import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import { Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import '../StockManager/style.less';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { connect, useAccess } from 'umi';
import WeekTimeSearch from '@/components/PubForm/WeekTimeSearch';
import PubWeekRender from '@/components/PubWeekRender';
import { PageContainer } from '@ant-design/pro-layout';
import PlatStore from '@/components/PubForm/PlatStore';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import { getListD, exportD, principalList } from '@/services/pages/logisticsPlanIn';
import CitySearch from './components/CitySearch';
import ExportBtn from '@/components/ExportBtn';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import { add } from '@/utils/pubConfirm';
import moment from 'moment';

const cacheTabKey = 'LogisticsPlanInDelivery'; // tab缓存
const In: React.FC<{ common: any; history?: any }> = ({ common }) => {
  const { dicList } = common;
  const access = useAccess();
  const formRef = useRef<ProFormInstance>(); // 页面查询条件
  const actionRef = useRef<ActionType>();
  const [pageSize, setPageSize] = useState<any>(20);
  const [tabList, setTabList] = useState([]);
  const [tabStatus, setTabStatus] = useState<any>(
    window.sessionStorage.getItem(cacheTabKey) || 'all',
  );
  const [exportForm, setExportForm] = useState<any>({});
  const [selectedRowKeys, selectedRowKeysSet] = useState<any[]>([]);
  // 搜索清除前后空格
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
  // 激活页面请求列表
  useActivate(() => {
    if (actionRef?.current) actionRef?.current?.reload();
  });
  // table配置
  const columns: any[] = [
    {
      title: '发货计划编号',
      dataIndex: 'plan_no',
      align: 'center',
      width: 100,
      order: 10,
    },
    {
      title: '发货计划状态',
      dataIndex: 'approval_status',
      align: 'center',
      width: 120,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.DELIVERY_PLAN_STATUS, record.approval_status) || '-';
      },
    },

    {
      title: 'PMC负责人',
      dataIndex: 'create_user_id',
      align: 'center',
      width: 100,
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await principalList({ key_word: v.key });
        if (res.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return [];
        }
        console.log(res.data, 'res.data');
        return res?.data
          ?.filter((a: any) => a)
          ?.map((c: any) => ({ value: c.user_id, label: c.name }));
      },
      order: 9,
      render: (_: any, record: any) => record.create_user_name ?? '-',
    },

    {
      title: '计划出货周期',
      dataIndex: 'cycle_time',
      align: 'center',
      width: 110,
      renderFormItem: (_, rest, form) => {
        return (
          <WeekTimeSearch
            callBack={(v: any) => {
              form.setFieldsValue({ cycle_time: [v?.week, v.start, v.end] });
            }}
          />
        );
      },
      render: (_: any, record: any) => (
        <PubWeekRender
          option={{
            cycle_time: record.cycle_time,
            begin: record.shipment_begin_cycle_time,
            end: record.shipment_end_cycle_time,
          }}
        />
      ),
      order: 8,
    },

    {
      title: (
        <div>
          计划发货数量
          <br />
          (总)
        </div>
      ),
      dataIndex: 'num',
      align: 'center',
      width: 110,
      hideInSearch: true,
    },
    {
      title: '未建入库单数量',
      dataIndex: 'not_generated_quantity',
      hideInSearch: true,
      align: 'center',
      width: 100,
    },

    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      hideInSearch: true,
      width: 90,
    },
    {
      title: (_: any, type: string) => {
        return type === 'table' ? '店铺' : '平台店铺';
      },
      dataIndex: 'plat_store',
      align: 'center',
      width: 100,
      render: (_: any, record: any) => record?.shop_name || '-',
      renderFormItem: (_, rest, form) => {
        return (
          <PlatStore
            business_scope="IN"
            back={(v: any) => {
              form.setFieldsValue({ plat_store: v });
            }}
          />
        );
      },
      order: 1,
    },
    {
      title: '站点',
      dataIndex: 'shop_site',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => pubFilter(dicList.SYS_PLATFORM_SHOP_SITE, record?.shop_site),
    },
    {
      title: '品牌',
      dataIndex: 'brand_name',
      align: 'center',
      width: 90,
      hideInSearch: true,
    },
    {
      title: '中文品名',
      dataIndex: 'name_cn',
      align: 'center',
      width: 160,
      order: 6,
    },
    {
      title: '英文品名',
      dataIndex: 'name_en',
      align: 'center',
      order: 5,
    },
    {
      title: (
        <>
          SKU生命周期
          <br />
          (SKU销售状态)
        </>
      ),
      dataIndex: 'life_cycle',
      align: 'center',
      hideInSearch: true,
      width: 110,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.GOODS_LIFE_CYCLE, record.life_cycle) || '-';
      },
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      width: 100,
      order: 4,
    },

    {
      title: (
        <>
          箱数
          <br />
          (未建入库单)
        </>
      ),
      dataIndex: 'not_generated_boxes',
      width: 90,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: (
        <>
          <div>总体积</div>
          <div>（m³）</div>
        </>
      ),
      dataIndex: 'total_volume',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '单箱重量(kg)',
      dataIndex: 'single_box_weight',
      align: 'center',
      hideInSearch: true,
    },

    {
      title: (
        <>
          <div>总重量</div>
          <div>（kg）</div>
        </>
      ),
      dataIndex: 'total_weight',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      width: 200,
      order: 3,
    },
    {
      title: '供应商出货城市',
      dataIndex: 'province_city',
      align: 'center',
      width: 100,
      renderText: (text: any, record: any) =>
        record.city_name && `${record.provinces_name}-${record.city_name}`,
      renderFormItem: () => <CitySearch cityData2={common.cityData2} />,
      search: {
        transform: (val: any) => ({ provinces_name: val?.[0], city_name: val?.[1] }),
      },
      order: 2,
    },

    {
      title: '要求物流入仓时间',
      dataIndex: 'warehousing_time',
      valueType: 'dateRange',
      render: (_: any, record: any) => record.warehousing_time ?? '-',
      width: 100,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (val: any) => ({
          begin_warehousing_time: val[0] && moment(val[0]).format('YYYY-MM-DD'),
          end_warehousing_time: val[1] && moment(val[1]).format('YYYY-MM-DD'),
        }),
      },
      order: 7,
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2300);

  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key);
    window.sessionStorage.setItem(cacheTabKey, key);
    setPageSize(20);
  };
  // tabs处理
  const tabsHandle = (data: any) => {
    const tabs: any = [];
    let allNum = 0;
    ['3', '7', '6'].forEach((v: any) => {
      Object.entries(data?.ext_data).forEach(([key, value]: any) => {
        if (key === v) {
          const obj = {
            key,
            tab: `${pubFilter(dicList.DELIVERY_PLAN_STATUS, value.approval_status)} (${value.num})`,
          };
          allNum = add(allNum, value.num);
          tabs.push(obj);
        }
      });
    });

    tabs?.unshift({ key: 'all', tab: `全部 (${allNum})` });
    setTabList(tabs);
  };
  const tabsHandleDelay = (data: any) => {
    if (dicList?.DELIVERY_PLAN_STATUS) {
      tabsHandle(data);
    } else {
      setTimeout(() => {
        tabsHandleDelay(data);
      }, 1000);
    }
  };
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      fixedHeader
      tabActiveKey={tabStatus || 'all'}
      className="pubPageTabs"
      tabList={tabList}
      onTabChange={changeTabs}
    >
      <ProTable<any>
        size={'small'}
        actionRef={actionRef}
        formRef={formRef}
        bordered
        rowKey="plan_id"
        pagination={{
          showSizeChanger: true,
          pageSize,
          onChange: (page, size) => {
            setPageSize(size);
          },
        }}
        params={{ tabStatus }}
        dateFormatter="string"
        request={async (params) => {
          const postData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
            approval_status: tabStatus == 'all' ? null : tabStatus, //状态
            platform_id: params.plat_store ? params.plat_store?.[0] : null, // 平台
            shop_id: params.plat_store ? params.plat_store?.[1] : null, // 店铺
            shipment_begin_cycle_time: params?.cycle_time?.[1] || null, //下单时间-开始
            shipment_end_cycle_time: params?.cycle_time?.[2] || null, //下单时间-结束
            cycle_time: params?.cycle_time?.[0] || null,
          };
          const res = await getListD(postData);
          setExportForm(postData);
          tabsHandleDelay(res.data);
          selectedRowKeysSet([]);
          if (res && res.code == pubConfig.sCode) {
            return {
              total: res.data?.total || 0,
              data: res.data?.records || [],
              success: true,
            };
          }
          return {
            total: 0,
            data: [],
            success: false,
          };
        }}
        columns={columns}
        search={{ labelWidth: 120, className: 'light-search-form', defaultCollapsed: false }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        {...ColumnSet}
        rowSelection={{
          selectedRowKeys,
          onChange: (rowKeys: any) => {
            selectedRowKeysSet(rowKeys);
          },
        }}
        tableAlertRender={false}
        toolBarRender={() => {
          return access.canSee('scm_logisticsPlanIn_delivery_export')
            ? [
              <Space key="space">
                <ExportBtn
                  exportHandle={exportD}
                  btnText='跨境物流计划(发货计划)导出'
                  exportForm={{
                    ...exportForm,
                    export_config: {
                      columns: ColumnSet.customExportConfig.map((v: any) => ({
                        ...v,
                        title: v.dataIndex == 'plat_store' ? '店铺' : v.title,
                        dataIndex: v.dataIndex == 'plat_store' ? 'shop_name' : v.dataIndex,
                      })),
                    },
                    selected_id: selectedRowKeys
                  }}
                />
              </Space>,
            ]
            : [];
        }}
      />
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(In);
export default ConnectPage;
