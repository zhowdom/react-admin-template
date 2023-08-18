import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess } from 'umi';
import { pubConfig, pubMsg, selectProps } from '@/utils/pubConfig';
import { pubGetVendorList } from '@/utils/pubConfirm';
import { exportExcel, getList } from '@/services/pages/SCM_Manage/cooperateProduct';
import { Space, Statistic, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ProductLine from '@/components/PubForm/ProductLine';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import ExportBtn from '@/components/ExportBtn';

const Page: React.FC<{dicList: any, skuCode?: string, fromTab?: boolean}> = (props: any) => {
  const actionRef = useRef<ActionType>();
  const { dicList, skuCode = '', fromTab } = props;
  const [exportForm, setExportForm] = useState<any>({});
  const access = useAccess();
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
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // table配置
  const columns: any[] = [
    {
      title: (
        <>
          国内/跨境
          <Tooltip placement="top" title="国内和跨境产品线分类">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'businessScope',
      fixed: 'left',
      width: 90,
      align: 'center',
      valueEnum: dicList?.SYS_BUSINESS_SCOPE || {},
    },
    {
      title: (
        <>
          采购单号
          <Tooltip placement="top" title="采购商品款式对应的采购单号">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'orderNo',
      fixed: 'left',
      width: 120,
      align: 'center',
    },
    {
      title: '采购单状态',
      dataIndex: 'approvalStatus',
      width: 90,
      align: 'center',
      valueType: 'select',
      fieldProps: selectProps,
      valueEnum: () => ({
        3: dicList.PURCHASE_APPROVAL_STATUS?.[3],
        5: dicList.PURCHASE_APPROVAL_STATUS?.[5],
        8: dicList.PURCHASE_APPROVAL_STATUS?.[8],
        11: dicList.PURCHASE_APPROVAL_STATUS?.[11],
      }),
    },
    {
      title: '供应商名称',
      dataIndex: 'vendorName',
      valueType: 'select',
      request: async () => pubGetVendorList(),
      debounceTime: 300,
      fieldProps: {
        showSearch: true,
      },
      search: {
        transform: (value: any) => ({ vendorId: value }),
      },
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
      dataIndex: 'vendorCode',
      width: 100,
      hideInSearch: true,
    },
    {
      title: (
        <>
          是否节假日订单
          <Tooltip placement="top" title="采购单的类型，节日订单或者正常订单">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'festival',
      width: 120,
      align: 'center',
      valueType: 'select',
      fieldProps: selectProps,
      valueEnum: dicList.PURCHASE_FESTIVAL,
      hideInSearch: true,
    },
    {
      title: '产品线',
      dataIndex: 'category',
      hideInTable: true,
      renderFormItem: () => <ProductLine single={true} />,
      search: {
        transform: (val: string[]) => ({ businessScope: val[0], categoryId: val[1] }),
      },
    },
    {
      title: '产品线',
      dataIndex: 'categoryName',
      width: 90,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: (
        <>
          商品名称
          <Tooltip placement="top" title="款式名称">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'skuName',
    },
    {
      title: 'SKU',
      dataIndex: 'skuCode',
      width: 110,
      align: 'center',
      initialValue: fromTab ? '' : skuCode,
      render: (_: any, record: any) => {
        return record.businessScope == 'CN' ? record.stockNo : record.shopSkuCode;
      },
    },
    {
      title: (
        <>
          款式生命周期
          <Tooltip placement="top" title="商品款式对应的生命周期阶段">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'lifeCycle',
      width: 100,
      align: 'center',
      hideInSearch: true,
      valueEnum: dicList?.GOODS_LIFE_CYCLE,
    },
    {
      title: (
        <>
          采购数量
          <Tooltip placement="top" title="该SKU对应的采购单的采购数量">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'num',
      align: 'right',
      hideInSearch: true,
      width: 90,
      valueType: 'digit',
    },
    {
      title: (
        <>
          在途数量
          <br />
          (跨境国内在途)
        </>
      ),
      dataIndex: 'transitNum',
      tooltip:
        '该SKU对应的采购单国内在途数量，国内业务指供应商已发货但未入平台，跨境业务指供应商已发货但未到港入库。',
      align: 'right',
      hideInSearch: true,
      width: 120,
      valueType: 'digit',
    },
    {
      title: (
        <>
          已入库数量
          <br />
          (跨境到港)
        </>
      ),
      dataIndex: 'receiveNum',
      tooltip:
        '该SKU对应的采购单国内入库数量，国内业务指已经入平台仓库的数量，跨境业务指已经到港入库数量。',
      align: 'right',
      hideInSearch: true,
      width: 110,
      valueType: 'digit',
    },
    {
      title: '物流丢失数量',
      dataIndex: 'logisticsLossQty',
      align: 'center',
      hideInSearch: true
    },
    {
      title: (
        <>
          采购单价
          <Tooltip placement="top" title="该SKU对应的采购单的采购单价">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'price',
      align: 'right',
      width: 90,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.price}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: (
        <>
          最近采购单价
          <br />
          (上一次采购单价)
        </>
      ),
      dataIndex: 'lastPrice',
      tooltip: '该SKU上一次下采购单的采购价格(针对所有供应商的采购单)',
      align: 'right',
      width: 136,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.lastPrice}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: (
        <>
          价格增减幅度
          <br />
          （对比上一次采购)
        </>
      ),
      dataIndex: 'amplitude',
      width: 140,
      tooltip: '该SKU上一次下采购单的采购价格和本次采购的采购单价增减比',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: (
        <>
          采购金额
          <Tooltip
            placement="top"
            title="该SKU在对应采购单里面的采购金额=该SKU的采购数量*该SKU的采购单价"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'amount',
      hideInSearch: true,
      align: 'right',
      width: 90,
      render: (_: any, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.amount}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: (
        <>
          采购运费
          <Tooltip
            placement="top"
            title="入库单维护的运费分摊到具体SKU的运费，并且乘以数量（入库单的运费，分支付给供应商的运费和支付给物流服务商的运费）"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'freightAmount',
      hideInSearch: true,
      align: 'right',
      width: 90,
      render: (_: any, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.freightAmount}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
    },
    {
      title: (
        <>
          币种
          <Tooltip placement="top" title="取对应采购单的币种">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'currency',
      hideInSearch: true,
      align: 'center',
      width: 90,
      valueEnum: dicList?.SC_CURRENCY || {},
    },
    {
      title: '采购单创建时间',
      dataIndex: 'createTime',
      width: 126,
      align: 'center',
      valueType: 'dateRange',
      sorter: true,
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          beginTime: value[0] ? `${value[0]} 00:00:00` : null,
          endTime: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
      render: (_: any, record: any) => record.createTime,
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1800, '', 6, [], '/liyi99-report/scm/cooperate-product');
  return (
    <ProTable
      bordered
      actionRef={actionRef}
      rowKey={(record: any) => record.id + record.goodsSkuId}
      dateFormatter="string"
      pagination={{
        showSizeChanger: true,
      }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      {...ColumnSet}
      showSorterTooltip={false}
      headerTitle="采购单汇总表 - 采购明细"
      request={getListAction}
      columns={columns}
      search={{  span: 8,labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      toolBarRender={() => [
        <Space key="space">
          {access.canSee('liyi99-report_products-purchase-details-export') ? (
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

export default Page;
