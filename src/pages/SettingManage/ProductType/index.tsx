import { PageContainer } from '@ant-design/pro-layout';
import { connect, Access, useAccess } from 'umi';
import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getList, sysChangeFieldHistory } from '@/services/pages/productType';
import Log from '../Log';
import AddOrUpdate from './components/AddOrUpdate';
import { priceValue } from '@/utils/filter';
import { getUuid } from '@/utils/pubConfirm';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

const Page = (props: any) => {
  const access = useAccess();
  const labels = {
    10: '最长边',
    20: '次长边',
    30: '最短边',
    40: '最长边+周长',
    50: '计费重',
  };

  const { common } = props;
  const { dicList } = common;
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      platform_id: params.category_data ? params.category_data[0] : '', //平台
      shop_site: params.category_data ? params.category_data[1] : '', //站点
    };
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data:
        res?.data?.records.map((v: any) => {
          return {
            ...v,
            tempId: getUuid(),
          };
        }) || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
  const columns: ProColumns<any>[] = [
    {
      title: '类型名称',
      dataIndex: 'name',
      align: 'center',
      order: 1,
    },
    {
      title: '尺寸类型',
      dataIndex: 'belong_classify',
      align: 'center',
      valueType: 'select',
      valueEnum: common?.dicList?.STORAGE_FEE_BELONG_CLASSIFY || {},
      order: 2,
    },
    {
      title: '类型标准',
      dataIndex: 'standardList',
      hideInSearch: true,
      width: 285,
      render: (_: any, record: any) => {
        const standardList = record?.standardList;
        return standardList.map((v: any) => {
          const condition =
            pubFilter(dicList.PRODUCT_VALUATION_TYPE_STANDARD_CONDITION, v?.standard_condition) ||
            '-';
          const value =
            v?.standard_condition == 1
              ? `${priceValue(v.start_value)} - ${priceValue(v.end_value)}`
              : `${priceValue(v.fixed_value)}`;
          return v?.standard_condition == 7 && v.fixed_value == null ? (
            <div key={`${record.id}-${v.id}`}>{`${labels[v.type_standard]}: ${condition}`}</div>
          ) : (
            <div key={`${record.id}-${v.id}`}>{`${labels[v.type_standard]}: ${condition}${value} ${v.unit}`}</div>
          );
        });
      },
    },
    {
      title: '派送费规则(淡季)',
      dataIndex: 'lowSeasonFba',
      width: 220,
      hideInSearch: true,
      render: (_: any, record: any) => {
        const currency = pubFilter(dicList.SC_CURRENCY, record?.currency) || '-';
        const lowSeasonFba = record?.lowSeasonFba;
        return lowSeasonFba?.billing_type == '1' ? (
          `固定金额：${priceValue(lowSeasonFba?.fixed_price) || '-'} ${currency}`
        ) : (
          <div>
            {`首重：${priceValue(lowSeasonFba?.first_weight_price) || '-'} ${currency}`}
            <br />
            {`续重：${priceValue(lowSeasonFba?.continued_weight_price) || '-'} ${currency}  / 磅`}
            <br />
            {lowSeasonFba?.first_weight && `首重重量：${lowSeasonFba?.first_weight || '-'}磅`}
          </div>
        );
      },
    },
    {
      title: '派送费规则(旺季)',
      dataIndex: 'peakSeasonFba',
      width: 220,
      hideInSearch: true,
      render: (_: any, record: any) => {
        const currency = pubFilter(dicList.SC_CURRENCY, record?.currency) || '-';
        const peakSeasonFba = record?.peakSeasonFba;
        return peakSeasonFba?.billing_type == '1' ? (
          `固定金额：${priceValue(peakSeasonFba?.fixed_price) || '-'} ${currency}`
        ) : (
          <div>
            {`首重：${priceValue(peakSeasonFba?.first_weight_price) || '-'} ${currency}`}
            <br />
            {`续重：${priceValue(peakSeasonFba?.continued_weight_price) || '-'} ${currency}  / 磅`}
            <br />
            {peakSeasonFba?.first_weight && `首重重量：${peakSeasonFba?.first_weight || '-'} 磅`}
          </div>
        );
      },
    },
    {
      title: '适用平台',
      dataIndex: 'platform_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: (
        <>
          优先级
          <Tooltip
            placement="top"
            title="当产品信息同时满足多个产品类型的标准时，按优先级数值从小到大优先匹配，优先级设置不能重复"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'priority',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '适用站点',
      dataIndex: 'shop_site',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        pubFilter(dicList.FIRST_TRANSPORT_QUOTE_SHOP_SITE, record?.shop_site) || '-',
    },
    {
      title: '创建日期',
      dataIndex: 'create_time',
      align: 'center',
      width: 150,
      hideInSearch: true,
      sorter: (a: any, b: any) => a.time - b.time,
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      align: 'center',
      hideInSearch: true,
      width: 160,
    },
    {
      title: '操作',
      key: 'option',
      width: 230,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      className: 'wrap',
      render: (text: any, record: any) => {
        return [
          <Access key="product_type_edit" accessible={access.canSee('product_type_edit')}>
            <AddOrUpdate
              trigger="编辑"
              initialValues={record}
              dicList={dicList}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access key="detail" accessible={access.canSee('product_type_log')}>
            <Log
              trigger="日志"
              id={record?.id}
              dicList={dicList}
              title=""
              api={sysChangeFieldHistory}
            />
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
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          scroll={{ x: 1500 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          rowKey="tempId"
          dateFormatter="string"
          headerTitle={false}
          revalidateOnFocus={false}
          toolBarRender={() => [
            <Access key="product_type_add" accessible={access.canSee('product_type_add')}>
              <AddOrUpdate
                trigger="添加产品类型"
                dicList={dicList}
                reload={() => {
                  ref?.current?.reload();
                }}
              />
            </Access>,
          ]}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;
