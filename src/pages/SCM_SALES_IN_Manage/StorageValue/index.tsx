import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { connect, useAccess } from 'umi';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  pubBlobDownLoad,
  pubGetColumnsState,
  pubGetPlatformList,
  pubProLineList,
  pubRefreshColumnList,
} from '@/utils/pubConfirm';
import { exportExcel, getList, inventoryValueSum } from '@/services/pages/SCM_Manage/storageValue';
import { Button, Space } from 'antd';
import { DownloadOutlined, SaveOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import { changeNum, computedColumnConfig, scrollByColumn } from '@/utils/filter';
import { customColumnDelete, customColumnSet } from '@/services/base';
import ModalCalDetail from './ModalCalDetail';
import './style.less'; // 无分页滚动条位置样式覆盖
// 跨境库存价值报表
const Page: React.FC<{
  common: any;
}> = ({ common }) => {
  const actionRef = useRef<ActionType>();
  const [downLoading, setDownLoading] = useState(false);
  const [exportForm, setExportForm] = useState<any>({});
  const [summary, summarySet] = useState<any>({});
  const access = useAccess();
  // 获取表格数据
  const requestTableData = async (params: any, sort: any): Promise<any> => {
    const page = {
      current: 1,
      size: 9999999,
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
      paramList: {
        ...params,
      },
    };
    const res = await getList(postData);
    inventoryValueSum(postData).then((resSum: any) => {
      if (resSum.code == pubConfig.sCodeOrder) {
        summarySet(resSum.data);
      }
    });
    setExportForm(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '平台',
      dataIndex: 'platformName',
      align: 'center',
      hideInSearch: true,
      width: 90,
      sorter: true,
      fixed: 'left',
    },
    {
      title: '平台',
      dataIndex: 'platformCode',
      hideInTable: true,
      valueType: 'select',
      request: async () => {
        const res = await pubGetPlatformList({ business_scope: 'IN' });
        if (res) {
          return res.map((v: any) => ({ ...v, label: v.label, value: v.platform_code }));
        }
        return [];
      },
    },
    {
      title: '产品线',
      dataIndex: 'categoryId',
      align: 'center',
      valueType: 'select',
      request: () => pubProLineList({ business_scope: 'IN' }),
      fieldProps: { showSearch: true },
      hideInTable: true,
    },
    {
      title: '产品线',
      dataIndex: 'categoryName',
      align: 'center',
      hideInSearch: true,
      sorter: true,
      fixed: 'left',
      width: 80,
    },
    {
      title: '店铺SKU',
      dataIndex: 'shopSkuCode',
      width: 130,
      sorter: true,
      render: (_: any, record: any) => (
        <ModalCalDetail data={record} trigger={<a>{record.shopSkuCode}</a>} />
      ),
      fixed: 'left',
    },
    {
      title: '款式名称',
      dataIndex: 'skuName',
      width: 260,
      sorter: true,
      fixed: 'left',
    },
    {
      title: '款式生命周期',
      tooltip: '内部款式的生命周期',
      dataIndex: 'lifeCycle',
      align: 'center',
      width: 120,
      valueEnum: common?.dicList?.GOODS_LIFE_CYCLE || {},
      sorter: true,
    },
    {
      title: '产品定位',
      dataIndex: 'position',
      valueType: 'select',
      align: 'center',
      width: 100,
      valueEnum: common?.dicList.PROJECTS_GOODS_SKU_POSITION,
    },
    {
      title: '链接生命周期',
      tooltip: '链接（即SPU）的生命周期',
      dataIndex: 'linkLifeCycle',
      align: 'center',
      width: 120,
      hideInSearch: true,
      valueEnum: common?.dicList?.LINK_MANAGEMENT_LIFE_CYCLE || {},
      sorter: true,
    },
    {
      title: '销售状态',
      tooltip: '当前SKU的销售状态',
      dataIndex: 'sales_status_str',
      align: 'center',
      hideInSearch: true,
      width: 110,
    },
    {
      title: '在库库存',
      dataIndex: 'inventoryNum',
      align: 'right',
      valueType: 'digit',
      hideInSearch: true,
      tooltip: '取计算时已同步回来的Amazon 在库库存；',
      sorter: true,
      width: 100,
    },
    {
      title: '预留数量',
      dataIndex: 'reservedQuantity',
      align: 'right',
      valueType: 'digit',
      hideInSearch: true,
      tooltip: '取计算时已同步回来的Amazon 预留数量；',
      sorter: true,
      width: 100,
    },
    {
      title: '跨境在途数量',
      dataIndex: 'inTransitNum',
      align: 'right',
      valueType: 'digit',
      hideInSearch: true,
      tooltip: (
        <div>
          供应链系统：已签约的采购单中，其入库单状态为：跨境在途/平台部分入库/平台入库异常，取平台未收到部分的数量；
        </div>
      ),
      width: 120,
      sorter: true,
    },
    {
      title: '国内在途数量',
      dataIndex: 'cnTransitNum',
      align: 'right',
      valueType: 'digit',
      hideInSearch: true,
      tooltip: (
        <div>
          已计划发货数量，统计如下2类数据：
          <br />
          1）国内在途：状态为“国内在途”的入库单，取【计划发货数量(本次)】字段值 <br />
          2）国内已入库：状态为“国内已入库”的入库单，取【到港数量】
        </div>
      ),
      width: 120,
      sorter: true,
    },
    {
      title: '已计划发货数量',
      dataIndex: 'plannedNum',
      align: 'right',
      valueType: 'digit',
      hideInSearch: true,
      width: 132,
      tooltip: (
        <>
          已计划发货数量，统计如下2类数据：
          <br />
          1）入库单中：状态为“新建/已同步/已放舱/已通知/已撤回/撤回中”的入库单，取【计划发货数量(本次)】字段值
          <br />
          2）发货计划：状态为“审批通过”的发货计划，取【未建入库单数量】
        </>
      ),
      sorter: true,
    },
    {
      title: '未计划发货数量',
      dataIndex: 'undeliveredNum',
      align: 'right',
      valueType: 'digit',
      hideInSearch: true,
      width: 132,
      tooltip: (
        <>
          未计划发货数量，统计公式=采购单未建入库单数量 - 入库单未关联采购单数量 -
          已审批通过发货计划未建入库单数量
          <br />
          采购单未建入库单数量：状态为“已签约/变更中”的采购单，取【下单数量】，再减取被入库单扣减的数量
          <br />
          入库单未关联采购单数量：状态为“新建” 且 未关联 采购单 的入库单，取【计划发货数量(本次)】
          <br />
          已审批通过发货计划未建入库单数量：状态为“审批通过”的发货计划，取【未建入库单数量】
          <br />
        </>
      ),
      sorter: true,
    },
    {
      title: '待下单/签约数量',
      dataIndex: 'underQty',
      align: 'right',
      valueType: 'digit',
      hideInSearch: true,
      tooltip: '所有已经审批通过的采购计划，汇总【下单中】【未下单】字段值',
      sorter: true,
      width: 140,
    },
    {
      title: '库存价值',
      dataIndex: 'inventoryValue',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
      tooltip: '库存价值=(在库库存 + 预留数量) * 库存成本',
      sorter: true,
      width: 100,
    },
    {
      title: '跨境在途价值',
      dataIndex: 'inTransitAmount',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
      width: 120,
      tooltip: (
        <>
          跨境在途部分的货物，按采购单维度统计其未含税的总价值，不含税单价计算公式如下：
          <br />
          CNY：人民币采购单价 / (1+税率) * 1.02
          <br />
          USD：美金采购单价 * 签约月份汇率
        </>
      ),
      sorter: true,
    },
    {
      title: '国内在途价值',
      dataIndex: 'cnTransitAmount',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
      width: 120,
      tooltip: (
        <>
          国内在途部分的货物，按采购单维度统计其未含税的总价值，不含税单价计算公式如下：
          <br />
          CNY：人民币采购单价 / (1+税率) * 1.02
          <br />
          USD：美金采购单价 * 签约月份汇率
        </>
      ),
      sorter: true,
    },
    {
      title: '未计划发货价值',
      dataIndex: 'undeliveredAmount',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
      width: 126,
      tooltip: (
        <>
          未计划发货部分的货物，按采购单维度统计其未含税的总价值，未关联采购单的数量将根据下单时间进行抵扣，若采购单不够扣减则使用住供应商采购单价计算，不含税单价计算公式如下：
          <br />
          CNY：人民币采购单价 / (1+税率) * 1.02
          <br />
          USD：美金采购单价 * 签约月份汇率
        </>
      ),
      sorter: true,
    },
    {
      title: '已计划发货价值',
      dataIndex: 'plannedAmount',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
      width: 126,
      tooltip: (
        <>
          已计划发货部分的货物，按采购单维度统计其未含税的总价值，未关联采购单的数量将根据下单时间进行抵扣，若采购单不够扣减则使用住供应商采购单价计算，不含税单价计算公式如下：
          <br />
          CNY：人民币采购单价 / (1+税率) * 1.02
          <br />
          USD：美金采购单价 * 签约月份汇率
        </>
      ),
      sorter: true,
    },
    {
      title: '不含税采购单价',
      dataIndex: 'price',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
      tooltip:
        '公式计算所得：（未计划发货价值+已计划发货价值+国内在途价值+亚马逊在途价值)/(未计划发货数量+已计划发货数量+国内在途数量+亚马逊在途数量）',
      sorter: true,
      width: 120,
    },
    {
      title: '产品定价',
      dataIndex: 'goodsPrice',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
      sorter: true,
      width: 100,
    },
    {
      title: '库存成本',
      dataIndex: 'unitFinalCost',
      align: 'right',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      hideInSearch: true,
      tooltip: (
        <div>
          库存成本计算公式：最新库存单位成本 =（上一次库存单位成本 * 最新库存数量 + 本次入库数量 *
          采购单单价）/（最新库存数量 + 本次入库数量）
          <br />
          供应链系统计算触发点：在入库单中点【手动入库/自动入库】或系统自动入库时候，入库单状态为“平台已入库”
        </div>
      ),
      sorter: true,
      width: 100,
    },
    {
      title: '近一月销量',
      dataIndex: 'nearestMonthSales',
      align: 'right',
      valueType: 'digit',
      hideInSearch: true,
      width: 110,
      tooltip: '近30天销量：当前SKU昨天起往前30的总销量；',
      sorter: true,
    },
    {
      title: '最后更新时间',
      dataIndex: 'createTime',
      hideInSearch: true,
      sorter: true,
      align: 'center',
      width: 140,
    },
  ];
  // 列配置
  const defaultScrollX = 3400;
  const persistenceKey = location.pathname.replace(/\/$/, '');
  const { initialState, setInitialState } = useModel('@@initialState');
  const customColumnSetting = initialState?.currentUser?.customColumnSetting?.find(
    (item: any) => item.code == persistenceKey,
  );
  const [columnsState, columnsStateSet] = useState<any>(
    pubGetColumnsState(columns, customColumnSetting || persistenceKey),
  );
  const [scrollX, scrollXSet] = useState<any>(scrollByColumn(columnsState, 4) || defaultScrollX);
  const [loadingCustomColumn, loadingCustomColumnSet] = useState<any>(false);
  // 导出excel
  const downLoad = async () => {
    if (!access.canSee('liyi99-report_storage-value-export')) {
      pubMsg('您暂无"导出"权限, 可联系管理员开通哦~');
      return;
    }
    exportForm.export_config = { columns: computedColumnConfig(columns, columnsState) };
    setDownLoading(true);
    const res: any = await exportExcel(exportForm);
    setDownLoading(false);
    pubBlobDownLoad(res, '商品数据');
  };
  return (
    <ProTable
      bordered
      headerTitle={
        <div style={{ flexDirection: 'column' }}>
          <div>IN库存价值报表</div>
          <Space size={10} style={{ paddingTop: '6px' }}>
            <span>库存总价值: {changeNum(summary?.inventoryValueSum || 0)}</span>
            <span>跨境在途总价值: {changeNum(summary?.inTransitAmountSum || 0)}</span>
            <span>国内在途总价值: {changeNum(summary?.cnTransitAmountSum || 0)}</span>
            <span>已计划发货总价值: {changeNum(summary?.plannedAmountSum || 0)}</span>
            <span>未计划发货总价值: {changeNum(summary?.undeliveredAmountSum || 0)}</span>
          </Space>
        </div>
      }
      actionRef={actionRef}
      rowKey="id"
      dateFormatter="string"
      pagination={false}
      className={'page-storage-value'}
      scroll={{ x: scrollX || defaultScrollX }}
      columnsState={{
        value: columnsState,
        onChange: (stateMap: any) => {
          columnsStateSet(stateMap);

          setTimeout(() => {
            scrollXSet(scrollByColumn(stateMap, 4) || defaultScrollX);
          }, 500);
        },
      }}
      options={{
        setting: {
          checkedReset: false,
          extra: (
            <>
              {customColumnSetting?.id ? (
                <a
                  style={{ marginLeft: '4px' }}
                  onClick={() => {
                    if (customColumnSetting?.id) {
                      customColumnDelete({ customColumnId: customColumnSetting?.id }).then(() => {
                        pubRefreshColumnList(initialState, setInitialState);
                        pubMsg('重置(删除)自定义列配置成功!', 'success');
                      });
                    }
                    columnsStateSet(pubGetColumnsState(columns));
                    scrollXSet(defaultScrollX);
                  }}
                >
                  重置
                </a>
              ) : null}
              <Button
                size={'small'}
                type={'primary'}
                icon={<SaveOutlined />}
                loading={loadingCustomColumn}
                onClick={() => {
                  loadingCustomColumnSet(true);
                  customColumnSet({
                    id: customColumnSetting?.id || '',
                    code: persistenceKey,
                    json: JSON.stringify(columnsState),
                    isNotice: 'n',
                  })
                    .then((res) => {
                      if (res?.code == '0') pubMsg('保存成功!', 'success');
                      pubRefreshColumnList(initialState, setInitialState);
                    })
                    .finally(() => {
                      loadingCustomColumnSet(false);
                    });
                }}
              >
                保存
              </Button>
            </>
          ),
        },
      }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      showSorterTooltip={false}
      request={requestTableData}
      columns={columns}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      toolBarRender={() => [
        <Space key="space">
          {access.canSee('liyi99-report_storage-value-export') ? (
            <Button
              icon={<DownloadOutlined />}
              ghost
              type="primary"
              disabled={downLoading}
              loading={downLoading}
              onClick={() => {
                downLoad();
              }}
            >
              导出
            </Button>
          ) : null}
        </Space>,
      ]}
    />
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
