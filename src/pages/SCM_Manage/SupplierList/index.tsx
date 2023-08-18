import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { connect, useAccess } from 'umi';
import { pubConfig, pubFilter, pubMsg, selectProps } from '@/utils/pubConfig';
import { pubGetUserList, pubGetVendorList, getUuid } from '@/utils/pubConfirm';
import { exportExcel, getList } from '@/services/pages/SCM_Manage/supplierList';
import { Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import ExportBtn from '@/components/ExportBtn';
import ProductLine from "@/components/PubForm/ProductLine";

const Page: React.FC = ({ common }: any) => {
  const actionRef = useRef<ActionType>();
  const [exportForm, setExportForm] = useState<any>({});
  const access = useAccess();
  // 获取开发负责人
  const pubGetUserListAction = async (v: any): Promise<any> => {
    const res: any = await pubGetUserList(v);
    return res?.map((item: any) => ({ ...item, value: item.name })) || [];
  };
  // 获取表格数据
  const getListAction = async (params: any, sort: any): Promise<any> => {
    const page = {
      current: params?.current,
      size: params?.pageSize,
    };
    const sortList = {};
    Object.keys(sort).forEach((key: any) => {
      sortList[key] = sort[key] == 'ascend' ? 'asc' : 'desc';
    });
    delete params.current;
    delete params.pageSize;
    const postData = {
      page,
      sortList,
      paramList: params,
    };
    const res = await getList(postData);
    setExportForm(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data:
        res?.data?.records?.map((v: any) => {
          return {
            ...v,
            tempId: getUuid(),
          };
        }) || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '产品线',
      dataIndex: 'category',
      hideInTable: true,
      renderFormItem: () => <ProductLine single={true} />,
      search: {
        transform: (val: string[]) => ({ businessScope: val[0], categoryId: val[1] }),
      },
      order: 6,
    },
    {
      title: '产品线',
      dataIndex: 'categoryName',
      hideInSearch: true,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '供应商名称',
      dataIndex: 'vendorId',
      hideInTable: true,
      valueType: 'select',
      request: async (v: any) => pubGetVendorList(v),
      order: 5,
      debounceTime: 300,
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '供应商名称',
      dataIndex: 'name',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: (
        <>
          供应商代码
          <Tooltip placement="top" title="供应商名称相同的时候，根据供应商代码区分供应商">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'code',
      width: 100,
      hideInSearch: true,
    },
    {
      title: (
        <>
          供应商合作状态
          <Tooltip
            placement="top"
            title={
              <div>
                未合作
                <br />
                合作中
                <br />
                不再合作
                <br />
                暂停合作
                <br />
                未签合同临时合作
              </div>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      valueType: 'select',
      dataIndex: 'vendorStatus',
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.VENDOR_COOPERATION_STATUS, record.vendorStatus) || '-';
      },
      valueEnum: common.dicList.VENDOR_COOPERATION_STATUS,
      order: 4,
      width: 140,
    },
    {
      title: (
        <>
          供应商开发负责人
          <Tooltip placement="top" title="该供应商当前开发负责人">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'liabilityName',
      align: 'center',
      request: pubGetUserListAction,
      valueType: 'select',
      fieldProps: selectProps,
      order: 3,
      width: 150,
    },
    {
      title: (
        <>
          入驻时间
          <Tooltip placement="top" title="该供应商入驻的时间">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'createTime',
      align: 'center',
      valueType: 'dateRange',
      search: {
        transform: (value: any) => ({
          beginTime: value[0] + ' 00:00:00',
          endTime: value[1] + ' 23:59:59',
        }),
      },
      render: (_, record: any) => record.createTime,
      sorter: true,
      width: 146,
    },
    {
      title: (
        <>
          结算方式
          <Tooltip placement="top" title="该供应商当前的结算方式">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'paymentMethod',
      width: 140,
      valueType: 'select',
      align: 'center',
      fieldProps: selectProps,
      valueEnum: common?.dicList?.VENDOR_PAYMENT_METHOD || {},
      order: 2,
      render: (_, record: any) => {
        const text = pubFilter(common?.dicList?.VENDOR_PAYMENT_METHOD, record.paymentMethod) || ''
        return text.replace('预付', `预付${record.prepaymentPercentage}%`)
      }
    },
    {
      title: (
        <>
          结算币种
          <Tooltip placement="top" title="该供应商当前的结算币种">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      fieldProps: selectProps,
      valueType: 'select',
      dataIndex: 'currency',
      width: 90,
      align: 'center',
      order: 1,
      valueEnum: common?.dicList.SC_CURRENCY,
    },
    {
      title: (
        <>
          税率
          <Tooltip placement="top" title="该供应商当前的结算税率">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'taxRate',
      align: 'center',
      width: 80,
      hideInSearch: true,
      renderText: (text) => text + '%',
    },
    {
      title: (
        <>
          供应商工厂地址（省市）
          <Tooltip placement="top" title="该供应商当前的工厂所在地的省和城市">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'provincesName',
      width: 166,
      align: 'center',
      hideInSearch: true,
      renderText: (text: any, record: any) => `${text || ''}-${record.cityName || ''}`,
    },
    {
      title: (
        <>
          供应商联系人
          <Tooltip placement="top" title="该供应商默认联系人（供应商公司老板）">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'vendorContactName',
      align: 'center',
      hideInSearch: true,
      width: 120,
    },
    {
      title: (
        <>
          供应商联系人电话
          <Tooltip placement="top" title="该供应商默认联系人电话（供应商公司老板））">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'telephone',
      align: 'center',
      hideInSearch: true,
      width: 140,
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1800, '', 6);

  return (
    <ProTable
      bordered
      actionRef={actionRef}
      rowKey={'tempId'}
      dateFormatter="string"
      pagination={{
        showSizeChanger: true,
      }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      {...ColumnSet}
      showSorterTooltip={false}
      headerTitle="供应商明细汇总"
      request={getListAction}
      columns={columns}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      toolBarRender={() => [
        <Space key="space">
          {access.canSee('liyi99-report_supplier_list-export') ? (
            <ExportBtn
              exportHandle={exportExcel}
              exportForm={{
                ...exportForm,
                export_config: { columns: ColumnSet.customExportConfig },
              }}
            />
          ) : null}
        </Space>,
      ]}
    />
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
