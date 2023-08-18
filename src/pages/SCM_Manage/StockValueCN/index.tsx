import React, { useRef, useState, useMemo } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { connect, useAccess } from 'umi';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { pubProLineList } from '@/utils/pubConfirm';
import {
  getList,
  listPurchasePlan,
  listPurchaseSku,
  listWarehousingSku,
  listInventoryDetail,
  exportWarehousingSku,
  exportPurchaseSku,
  exportPurchasePlan,
  exportExcel,
} from '@/services/pages/SCM_Manage/stockValueCN';
import { Tooltip, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TableExtra from './components/TableExtra';
import DetailTable from './components/DetailTable';
import { columns1, columns2, columns3, columns4 } from './components/columns';
import { priceValue } from '@/utils/filter';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import ExportBtn from '@/components/ExportBtn';

const Page: React.FC = ({ common }: any) => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [headerData, setHeaderData] = useState({});
  const [loading, setLoading] = useState(false);
  const [exportForm, exportFormSet] = useState<any>({});
  // 获取表格数据
  const getListAction = async (params: any, sort: any): Promise<any> => {
    setLoading(true);
    const page = {
      current: params?.current,
      size: params?.pageSize,
    };
    delete params.current;
    delete params.pageSize;
    const sortList = {};
    Object.keys(sort).forEach((key: any) => {
      sortList[key] = sort[key] == 'ascend' ? 'asc' : 'desc';
    });
    const postData = {
      page,
      sortList,
      paramList: params,
    };
    exportFormSet(postData);
    const res = await getList(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    setHeaderData(res?.data?.inventoryValueHeader || {});
    setLoading(false);
    return {
      data: res?.data?.inventoryValueList || [],
      success: true,
    };
  };
  // table配置
  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '产品线',
        dataIndex: 'categoryId',
        valueType: 'select',
        request: async () => pubProLineList({ business_scope: 'CN' }),
        order: 5,
        debounceTime: 300,
        fieldProps: {
          showSearch: true,
        },
        render: (_: any, record: any) => record.categoryName || '-',
        width: 120,
        sorter: true,
      },
      {
        title: '款式生命周期',
        dataIndex: 'lifeCycle',
        fieldProps: { showSearch: true },
        valueEnum: common?.dicList?.GOODS_LIFE_CYCLE || {},
        render: (_: any, record: any) => {
          return pubFilter(common?.dicList.GOODS_LIFE_CYCLE, record?.lifeCycle) || '-';
        },
        width: 100,
        sorter: true,
      },

      {
        title: '商品名称',
        dataIndex: 'skuName',
        sorter: true,
      },
      {
        title: 'SKU',
        dataIndex: 'shopSkuCode',
        align: 'center',
        sorter: true,
      },

      {
        title: (
          <>
            在库数量
            <Tooltip
              placement="top"
              title={'在库数量：当前SKU所有平台店铺库存汇总（点击在库数量查看各平台库存）'}
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        hideInSearch: true,
        dataIndex: 'inventoryNum',
        align: 'center',
        sorter: true,
        render: (_: any, record: any) => {
          return typeof record.inventoryNum == 'number' ? (
            <DetailTable
              hideSearch={true}
              width={800}
              id={record.id}
              api={listInventoryDetail}
              columns={columns1}
              trigger={record.inventoryNum}
              dicList={common?.dicList}
              type={'inventoryNum'}
            />
          ) : (
            '-'
          );
        },
      },
      {
        title: (
          <>
            在途数量
            <Tooltip
              placement="top"
              title="在途数量：当前SKU所有采购单在途数量，即采购单已签约已发货但是未入库的数量。包含备品，备品价格为0，不影响货值统计。"
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'cnTransitNum',
        align: 'center',
        hideInSearch: true,
        sorter: true,
        render: (_: any, record: any) => {
          return typeof record.cnTransitNum == 'number' ? (
            <DetailTable
              id={record.id}
              powerKey="liyi99-report_valueCn-transitNum-export"
              title="在途数量明细"
              downApi={exportWarehousingSku}
              api={listWarehousingSku}
              columns={columns2}
              trigger={record.cnTransitNum}
              dicList={common?.dicList}
            />
          ) : (
            '-'
          );
        },
      },
      {
        title: (
          <>
            未交货数量
            <Tooltip
              placement="top"
              title="未交货数量：当前SKU所有采购单未交货数量，即采购单已签约且供应商未发货数量。包含备品，备品价格为0，不影响货值统计。"
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'undeliveredNum',
        align: 'center',
        hideInSearch: true,
        sorter: true,
        render: (_: any, record: any) => {
          return typeof record.undeliveredNum == 'number' ? (
            <DetailTable
              id={record.id}
              powerKey="liyi99-report_valueCn-undeliveredNum-export"
              title=" 未交货数量明细"
              downApi={exportPurchaseSku}
              dicList={common?.dicList}
              api={listPurchaseSku}
              columns={columns3}
              trigger={record.undeliveredNum}
            />
          ) : (
            '-'
          );
        },
      },

      {
        title: (
          <>
            计划数量
            <br />
            （含下单中数量）
            <Tooltip placement="top" title="计划下单数量，包含未下单数量和下单中数量。">
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'planOrderNum',
        align: 'center',
        hideInSearch: true,
        sorter: true,
        render: (_: any, record: any) => {
          return typeof record.planOrderNum == 'number' ? (
            <DetailTable
              powerKey="liyi99-report_valueCn-planOrderNum-export"
              id={record.id}
              title="计划数量明细"
              downApi={exportPurchasePlan}
              dicList={common?.dicList}
              api={listPurchasePlan}
              columns={columns4}
              trigger={record.planOrderNum}
            />
          ) : (
            '-'
          );
        },
      },

      {
        title: (
          <>
            加权库存成本
            <Tooltip
              placement="top"
              title={(<div>
                加权库存成本：在入库单进行“平台入库”操作时触发SKUDB库存成本计算（移动加权），计算公式：(最新库存数量*上一次库存成本+本次入库数量*本次入库采购单价)/(最新库存数量+本次入库数量)
                <div>供应链系统计算触发点：国内平台入库单点击【自动收货/手动入库】或系统自动入库时候，入库单状态为已入库</div>
              </div>)}
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'unitFinalCost',
        align: 'center',
        hideInSearch: true,
        sorter: true,
        render: (_: any, record: any) => priceValue(record.unitFinalCost),
      },
      {
        title: (
          <>
            平均采购价
            <Tooltip
              placement="top"
              title={
                <>
                  <div>
                    1. 平均采购价=(未交货数量的价值+国内在途价值)/(未交货的数量+国内在途数量)
                  </div>
                  <div>2. 用于和库存成本做对比分析</div>
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'price',
        align: 'center',
        hideInSearch: true,
        sorter: true,
        render: (_: any, record: any) => priceValue(record.price),
      },
      {
        title: (
          <>
            未交货货值
            <Tooltip placement="top" title="未交货数量价值：采购单未交货数量*对应的采购单价汇总">
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'undeliveredAmount',
        align: 'center',
        hideInSearch: true,
        sorter: true,
        render: (_: any, record: any) => priceValue(record.undeliveredAmount),
      },
      {
        title: (
          <>
            在途货值
            <Tooltip
              placement="top"
              title="在途价值：入库单中，状态为在途状态的入库数量*对应的采购单价 汇总"
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'cnTransitAmount',
        align: 'center',
        hideInSearch: true,
        sorter: true,
        render: (_: any, record: any) => priceValue(record.cnTransitAmount),
      },
      {
        title: (
          <>
            库存货值
            <Tooltip placement="top" title="库存价值：最新库存数量*最新库存成本">
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'inventoryValue',
        align: 'center',
        hideInSearch: true,
        sorter: true,
        render: (_: any, record: any) => priceValue(record.inventoryValue),
      },
    ],
    [common],
  );
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2300, '');
  return (
    <ProTable
      className={'page-table-no-pagination'}
      actionRef={actionRef}
      rowKey={'id'}
      dateFormatter="string"
      pagination={false}
      tableExtraRender={() => <TableExtra data={headerData} loading={loading} />}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      {...ColumnSet}
      toolBarRender={() => [
        <Space key="space">
          {access.canSee('liyi99-report_valueCn-export') ? (
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
      showSorterTooltip={false}
      request={getListAction}
      columns={columns}
      headerTitle={
        <span style={{ color: 'red', fontSize: '12px' }}>说明：每天9:00、14:00、21:00更新</span>
      }
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
    />
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
