import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect, useAccess } from 'umi';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { getUuid, pubGetPlatformList, pubProLineList } from '@/utils/pubConfirm';
import { exportExcel, getList } from '@/services/pages/SCM_Manage/stockSaleQuantityCN';
import { Button, Space, Tooltip, Dropdown, Menu, Card } from 'antd';
import { PageContainer, BetaSchemaForm } from '@ant-design/pro-components';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import ExportBtn from '@/components/ExportBtn';
import DetailPlanedShipment from '../components/DetailPlanedShipment';
import DetailInprocessNumList from '../components/DetailInprocessNumList';
import DetailTransitNumList from '../components/DetailTransitNumList';
import VirtualTable from '@/components/VirtualTable';
// @ts-ignore
import accounting from 'accounting';
import moment from 'moment';
import CustomColumnSet from '@/components/CustomColumnSet';
const tooltipObj = {
  在库数量: '该SKU对应各个平台区域及区域合计在库数量',
  日均销量: (
    <>
      一，根据筛选条件时间段，汇总该SKU对应该平台区域及区域合计销量
      ，汇总后的销量除以筛选时间段实际天数得出日均销量，销量是按收货地址区域来统计，不是按仓库出货地址区域统计；
      <br />
      例如：今天是2022年11月9日，
      <br />
      如果选择的时间是 6、7、8号，则是三天的日均销量；
      <br />
      如果选择的时间是7、8、9好，则是
      <br />
      两天的日均销量；
      <br />
      二，
      <br />
      销量，遇到小数点，向上取整
      <br />
      天数，遇到小数点，向下取整
      <br />
      三，
      <br />
      销量统计逻辑判断
      <br />
      （1）在库库存为0 销量为0，这种场景，不纳入日均销量统计；
      <br />
      （2）在库库存不为0 销量为0 ，即使是没有导入，这种场景，正常纳入日均销量统计；
      <br />
      例如 9月30 日 导入了销量 国庆7天没有导入销量 10月8日导入了销量 ，那么我们 日均销量 是除以 是 9
      ；
    </>
  ),
  可用天数: (
    <>
      一，根据筛选条件时间段，该SKU对应各个平台区域及区域合计库存，分别对应除以该SKU对应各个平台区域及区域合计销量，得到各个平台区域及合计可用天数；<br />
      公式：库存可用天数 = 在库数量 ➗  （统计天数内的销量之和  ➗  有效天数 ）<br />
      二，可用天数=“库存” ÷ 平均销量 =1.1 或者 1.5 或者1.9，都向下取整，可用天数为1天；
    </>
  ),
  在途数量: (<>
    1，实时汇总供应链系统已计划未建入库单数量和已建入库单未入库数量；<br />
    2，已建入库单未入库数量，包括入库单新建、已同步、撤回中、已撤回、国内在途五个状态的发货数量；
  </>),
  合计: (
    <>
      各个区域和合计的日均销量是通过销量汇总除以天数，遇到小数点向上取整，各个区域分别向上取整后，可能之和不等于合计日均销量；
    </>
  ),
  在制数量: (
    <>
      在制总数量（PMC），是还可以计划发货的数量，即已审核通过的采购计划总数量-已审核通过的发货计划总数量-计划外入库单的发货总数量
    </>
  ),
  已计划发货数量: (
    <>
      发货计划已审批，但是供应商还未发货的数量，包括：
      <br />
      1，未建入库单的发货计划数量；
      <br />
      2，已建入库单，但是入库单状态还在新建、撤回中、已撤回状态的发货计划数量；
    </>
  ),
  维修数量: <>供应商反馈的维修良品数量</>,
  总库存: <>定时汇总各个平台和云仓的在库库存之和</>,
  '日均销量(总)': (
    <>
      1，日均销量（汇总）= 各个平台销量之和除以筛选时间段天数；
      <br />
      2，销量统计逻辑判断
      <br />
      （1）在库库存为0 销量为0，这种场景，不纳入日均销量统计；
      <br />
      （2）在库库存不为0 销量为0 ，即使是没有导入，这种场景，正常纳入日均销量统计；
      <br />
      例如 9月30 日 导入了销量 国庆7天没有导入销量 10月8日导入了销量 ，那么我们 日均销量 是除以 是 9
      ；
    </>
  ),
  总库存可用天数: (
    <>
      定时汇总的库存总数量除以当前设置时间段的总平均销量得到总库存可用天数
      <br />
      公式：总库存可用天数 = 各平台在库数量之和 ➗  （各平台统计天数内的销量之和  ➗  有效天数 ）
    </>
  ),
};

const getScrollY = () => {
  const documentClientHeight = document.body?.clientHeight - 367;
  return documentClientHeight && documentClientHeight > 300 ? documentClientHeight : 610; // 表格默认高度
};
const defaultScrollY = getScrollY();
const Page: React.FC<{
  common: any;
}> = ({ common }) => {
  const [collapsedAll, setCollapsedAll] = useState<any>(false);
  const [collapsedObj, setCollapsedObj] = useState<any>({});
  const [tempData, setTempData] = useState<any>({});
  const [optionsPlatform, optionsPlatformSet] = useState([]);
  const [selectedRecord, selectedRecordSet] = useState<any>({});
  const [open, openSet] = useState(false);
  const [openDetailPlanedShipment, openDetailPlanedShipmentSet] = useState(false);
  const [openDetailInprocessNumList, openDetailInprocessNumListSet] = useState(false);
  //
  const access = useAccess();
  const formRef: any = useRef(null);
  const tableRef: any = useRef(null);
  const [loading, loadingSet] = useState<boolean>(false);
  const [scrollY, scrollYSet] = useState<number>(defaultScrollY);
  const [dataSource, dataSourceSet] = useState<any[]>([]);
  const [refreshColumns, refreshColumnsSet] = useState<number>(0);
  const [sortList, sortListSet] = useState<any>({});
  const [exportForm, exportFormSet] = useState({});
  const [customColumns, customColumnsSet] = useState<React.Key[] | null>(null);
  const [customExportConfig, customExportConfigSet] = useState<any>({});

  const initData: ProColumns<any>[] = useMemo(
    () => [
      {
        order: 7,
        title: '产品线',
        dataIndex: 'category_id',
        valueType: 'select',
        request: async () => pubProLineList({ business_scope: 'CN' }),
        debounceTime: 300,
        fieldProps: {
          showSearch: true,
        },
        sorter: true,
        width: 90,
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        render: (_: any, record: any) => record.category_name || '-',
      },
      {
        title: '产品名称',
        dataIndex: 'goods_name',
        width: 200,
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        sorter: true,
        align: 'left',
      },
      {
        title: '款式名称',
        dataIndex: 'sku_name',
        align: 'left',
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        width: 240,
        sorter: true,
      },
      {
        title: 'SKU',
        dataIndex: 'stock_no',
        width: 130,
        sorter: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        fieldProps: {
          placeholder: '输入多个用逗号隔开',
        },
      },
      {
        title: '款式生命周期',
        dataIndex: 'life_cycle',
        width: 120,
        align: 'center',
        sorter: true,
        fieldProps: { showSearch: true },
        valueEnum: common?.dicList?.GOODS_LIFE_CYCLE || {},
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        render: (_: any, record: any) => record.life_cycle_name || '-',
      },
      {
        title: '时间段(销量)',
        width: 100,
        dataIndex: 'timeRange',
        valueType: 'dateRange',
        hideInTable: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        initialValue: [moment().add(-1, 'week'), moment().add(-1, 'day')],
        fieldProps: {
          allowClear: false,
          disabledDate: (current: any) => {
            return current && current.isAfter(moment().add(-1, 'day'));
          },
        },
        renderFormItem: () => <NewDatePicker />,
        search: {
          transform: (val) => ({ startSalesDate: val[0], endSalesDate: val[1] }),
        },
      },
      {
        title: '在制数量',
        tooltip: tooltipObj['在制数量'],
        dataIndex: 'in_process_num',
        width: 100,
        align: 'right',
        hideInSearch: true,
        sorter: true,
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        render: (text, record: any) => (
          <a
            className={record.in_process_num < 0 ? 'text-red' : ''}
            onClick={() => {
              selectedRecordSet(record);
              openDetailInprocessNumListSet(true);
            }}
          >
            {accounting.formatNumber(record.in_process_num)}
          </a>
        ),
        valueType: 'digit',
      },
      {
        title: '维修数量',
        tooltip: tooltipObj['维修数量'],
        dataIndex: 'repair_num',
        width: 100,
        align: 'right',
        hideInSearch: true,
        sorter: (a: any, b: any) => a.repair_num - b.repair_num,
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        valueType: 'digit',
      },
      {
        title: '总库存',
        tooltip: tooltipObj['总库存'],
        dataIndex: 'total_inventory',
        width: 100,
        align: 'right',
        hideInSearch: true,
        sorter: (a: any, b: any) => a.total_inventory - b.total_inventory,
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        valueType: 'digit',
      },
      {
        title: '日均销量(总)',
        tooltip: tooltipObj['日均销量(总)'],
        dataIndex: 'total_sales',
        width: 120,
        align: 'right',
        hideInSearch: true,
        sorter: (a: any, b: any) => a.total_sales - b.total_sales,
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        valueType: 'digit',
      },
      {
        title: '总库存可用天数',
        tooltip: tooltipObj['总库存可用天数'],
        dataIndex: 'total_available_day',
        width: 130,
        align: 'right',
        hideInSearch: true,
        sorter: (a: any, b: any) => a.total_available_day - b.total_available_day,
        onCell: (record: any) => ({ rowSpan: record.rowSpan }),
        render: (_: any, record: any) => (
          <span
            style={{
              color:
                record.total_available_day <= 7
                  ? 'red'
                  : record.total_available_day >= 45
                    ? 'orange'
                    : '#282828',
            }}
          >
            {record.total_available_day}
          </span>
        ),
      },
      {
        title: '明细',
        dataIndex: 'name',
        align: 'center',
        hideInSearch: true,
        width: 100,
        render: (_: any, record: any) => (
          <>
            {record.name == '在途数量' ? <>在途数量<br />(PMC)</> : record.name || '-'}
            <Tooltip placement="top" title={tooltipObj[record.name]}>
              <InfoCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
      },
    ],
    [common],
  );
  const [columns, setColumns] = useState<any>(initData);
  const columnsFormat: ProColumns<any>[] = useMemo(() => {
    if (customColumns) {
      if (customColumns.length) {
        return columns.filter(
          (item: any) => !(item.hideInTable || !customColumns.includes(item.dataIndex)),
        );
      } else {
        return [];
      }
    }
    return columns;
  }, [customColumns, columns]);
  // 获取动态列
  const getTitle = (newData: any = []) => {
    const other: any = [];
    newData?.[0]?.detailList.forEach((item: any) => {
      const childrenData = item?.regionInventoryList?.map((v: any, i: number) => {
        return {
          title:
            v.region_name == '合计' ? (
              <>
                {v.region_name}{' '}
                <Tooltip
                  title={
                    <>
                      各个区域和合计的日均销量是通过销量汇总除以天数，遇到小数点向上取整，各个区域分别向上取整后，可能之和不等于合计日均销量；
                    </>
                  }
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </>
            ) : (
              v.region_name
            ),
          width: 90,
          key: v.region_name,
          dataIndex: `${item.platform_code}${i}`,
          align: 'right',
          hideInSearch: true,
          className: collapsedObj[item.platform_code] && v.region_name === '合计' ? 'bgColorQ' : '',
          render: (_: any, record: any) => {
            if (record.name === '可用天数') {
              return (
                <span
                  style={{
                    color:
                      record[`${item.platform_code}${i}`] <= 10
                        ? 'red'
                        : record[`${item.platform_code}${i}`] >= 45
                          ? 'orange'
                          : '#282828',
                  }}
                >
                  {record[`${item.platform_code}${i}`]}
                </span>
              );
            }
            if (record.name === '在途数量') {
              return (
                <a
                  onClick={() => {
                    selectedRecordSet({
                      ...record,
                      platform_code: item.platform_code,
                      platform_name: item.platform_name,
                      region_name: v.region_name,
                      in_transit_num: record[`${item.platform_code}${i}`],
                      not_created_inventory_quantity: record[`${item.platform_code}${i}_row`].not_created_inventory_quantity,
                      warehouse_receipt_not_quantity: record[`${item.platform_code}${i}_row`].warehouse_receipt_not_quantity,
                    });
                    openSet(true);
                  }}
                >
                  {accounting.formatNumber(record[`${item.platform_code}${i}`])}
                </a>
              );
            }
            return <span>{accounting.formatNumber(record[`${item.platform_code}${i}`])}</span>;
          },
        };
      });
      const obj = {
        title: (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {item.platform_name}
            {collapsedObj[item.platform_code] ? (
              <Space
                style={{ float: 'left', color: '#717484' }}
                size={2}
                className="custom-a"
                onClick={() => {
                  setCollapsedObj((pre: any) => {
                    return {
                      ...pre,
                      [`${item.platform_code}`]: false,
                    };
                  });
                }}
              >
                <a style={{ color: '#717484' }}>收起</a>
                <DoubleLeftOutlined />
              </Space>
            ) : (
              <Space
                style={{ float: 'right', color: '#717484' }}
                size={2}
                className="custom-a"
                onClick={() => {
                  setCollapsedObj((pre: any) => {
                    return {
                      ...pre,
                      [item.platform_code]: true,
                    };
                  });
                }}
              >
                <a style={{ color: '#717484' }}>
                  展开
                  <DoubleRightOutlined />
                </a>
              </Space>
            )}
          </div>
        ),
        hideInSearch: true,
        children: collapsedObj[item.platform_code]
          ? childrenData
          : childrenData.filter((c: any) => c.key == '合计'),
        dataIndex: item.platform_code,
        align: 'right',
        width: collapsedObj[item.platform_code] ? childrenData.length * 90 : 90,
      };
      other.push(obj);
    });
    setColumns(() => {
      return [...initData, ...other];
    });
    return newData;
  };

  useEffect(() => {
    getTitle(tempData);
  }, [collapsedObj, tempData]);
  //获取平台
  useEffect(() => {
    pubGetPlatformList({ business_scope: 'CN' }).then((res: any) => {
      optionsPlatformSet(
        res
          ?.filter((item: any) => item.code != 'HUI_YE_CANG')
          .map((item: any) => ({
            label: item.label == '天猫' ? '菜鸟' : item.label,
            value: item.code,
          })),
      );
    });
  }, []);
  const optionsExportList = useMemo(() => {
    const temp = optionsPlatform.map((v: any) => ({
      label: (
        <ExportBtn
          btnText={v.label}
          btnType={'link'}
          exportHandle={exportExcel}
          exportForm={{
            ...exportForm,
            exportConfig: { columns: customExportConfig },
            platform_code: v.value,
          }}
        />
      ),
      key: v.value,
    }));
    temp.unshift({
      label: (
        <ExportBtn
          btnText={'全部平台'}
          btnType={'link'}
          exportHandle={exportExcel}
          exportForm={{ ...exportForm, platform_code: '' }}
        />
      ),
      key: 'all',
    });
    return temp;
  }, [optionsPlatform, exportForm]);

  // 重组数据
  const handleData = (data1: any) => {
    const temp: any = [];
    data1?.forEach((a: any) => {
      const obj = {
        ...a,
        regionInventoryListBefore: a.regionInventoryList,
        regionInventoryList: a.regionInventoryList[0].detailList.map((b: any) => {
          return {
            code: b.code,
            name: b.name,
            detailList: [],
          };
        }),
      };
      obj.regionInventoryList?.forEach((e: any) => {
        obj.regionInventoryListBefore?.forEach((c: any) => {
          const obj1 = {
            platform_code: c.platform_code,
            platform_name: c.platform_name,
            regionInventoryList: c.detailList.filter((v: any) => v.code === e.code)?.[0]
              .regionInventoryList,
          };
          e.detailList.push(obj1);
        });
      });
      temp.push(obj);
    });
    return temp || [];
  };
  // 合并行数据
  const handleRow = (data1: any) => {
    // console.log(handleData(data), 'data');
    const newData: any = [];
    handleData(data1)?.forEach((item: any) => {
      item.regionInventoryList?.forEach((v: any, i: number) => {
        const obj = {
          ...item,
          ...v,
          tempId: getUuid(),
          index: i,
          rowSpan: i == 0 ? item.regionInventoryList?.length : 0,
        };
        v.detailList?.forEach((c: any) => {
          c.regionInventoryList?.forEach((d: any, di: number) => {
            console.log(c.platform_code, 'c.platform_code')
            console.log(di, 'di')
            obj[`${c.platform_code}${di}`] = d.quantity;
            obj[`${c.platform_code}${di}_row`] = d;
          });
        });
        newData.push(obj);
      });
    });
    setTempData(newData);
    return getTitle(newData);
  };
  // 获取表格数据
  const getAction = async (params: any): Promise<any> => {
    const postData = params;
    loadingSet(true);
    const res = await getList(postData);
    loadingSet(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    exportFormSet(postData);
    // 保存平台区域数量
    const listOneData = JSON.parse(JSON.stringify(res?.data?.[0]?.regionInventoryList || []));
    const listOne = {};
    listOneData?.forEach((v: any) => {
      listOne[v?.platform_code] = v.detailList[0]?.regionInventoryList.length - 1;
      setCollapsedObj((pre: any) => {
        return {
          ...pre,
          [`${v?.platform_code}`]: pre[`${v?.platform_code}`] || false,
        };
      });
    });
    const resData = res?.data || [];
    const newD = handleRow(resData);
    dataSourceSet(newD);
    console.log(newD, 'resData');
    refreshColumnsSet(Date.now());
  };
  useEffect(() => {
    formRef?.current?.submit();
  }, []);
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      {/*搜索条件*/}
      <BetaSchemaForm
        formRef={formRef}
        layoutType={'QueryFilter'}
        columns={columns.filter((c: any) => !(c.hideInSearch || c.search === false)) as any}
        className={'light-search-form'}
        style={{ padding: '10px 10px 0 10px', marginBottom: 10, background: '#fff' }}
        labelWidth={94}
        onFinish={async (values: any) => {
          const postData = {
            ...values,
            current: 1,
            pageSize: 9999,
            startSalesDate: values?.timeRange[0] || '',
            endSalesDate: values?.timeRange[1] || '',
            sortList,
          };
          delete postData.timeRange;
          postData.stock_no = postData?.stock_no
            ?.replaceAll(' ', '')
            ?.replaceAll('，', ',')
            .replace(/,$/gi, '');
          exportFormSet(postData);
          getAction(postData);
        }}
        onReset={() => formRef?.current?.submit()}
        submitter={{
          submitButtonProps: {
            loading,
          },
        }}
        autoFocusFirstInput={false}
        defaultCollapsed={false}
        onCollapse={() => {
          tableRef?.current?.reset();
        }}
      />
      {/*虚拟表格*/}
      <Card size={'small'} bordered={false}>
        <VirtualTable
          title={() => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>国内库存-销量汇总(横版)</span>
              <Space key="space">
                <Button
                  ghost
                  loading={loading}
                  type="primary"
                  onClick={() => {
                    loadingSet(true);
                    const newKeys = {};
                    for (const key in collapsedObj) {
                      newKeys[key] = !collapsedAll;
                    }
                    setCollapsedObj(newKeys);
                    setCollapsedAll(!collapsedAll);
                    setTimeout(() => {
                      loadingSet(false);
                    }, 500);
                  }}
                >
                  {!loading ? (
                    collapsedAll ? (
                      <Space size={2}>
                        <a>全部收起</a>
                      </Space>
                    ) : (
                      <Space size={2}>
                        <a>全部展开</a>
                        <DoubleRightOutlined />
                      </Space>
                    )
                  ) : (
                    <Space size={2}>
                      {collapsedAll ? (
                        <>
                          <a>全部展开</a>
                        </>
                      ) : (
                        <>
                          <a>全部收起</a>
                        </>
                      )}
                    </Space>
                  )}
                </Button>
                {access.canSee('liyi99-report_stock-sale-cn-export-h') && (
                  <Dropdown
                    disabled={tempData.length == 0}
                    arrow
                    overlay={<Menu items={optionsExportList} />}
                  >
                    <Button
                      disabled={tempData?.length == 0}
                      type={'primary'}
                      ghost
                      icon={<UnorderedListOutlined />}
                    >
                      导出
                    </Button>
                  </Dropdown>
                )}
                <Button
                  className={'ml-2'}
                  type={'text'}
                  icon={<ReloadOutlined />}
                  onClick={() => formRef?.current?.submit()}
                />
                <CustomColumnSet
                  columns={columns}
                  customColumnsSet={customColumnsSet}
                  customExportConfigSet={customExportConfigSet}
                  refreshColumns={refreshColumns}
                />
              </Space>
            </div>
          )}
          size={'small'}
          overscanCount={3}
          loading={loading}
          rowKey={(record: any) => record.id + record.region_code}
          bordered
          columns={columnsFormat as any}
          dataSource={dataSource}
          pagination={false}
          scroll={{ y: scrollY }}
          scrollYSet={scrollYSet}
          onChange={(pagination, filters, sorter: any) => {
            const sortParams = {};
            if (sorter.order) {
              sortParams[sorter.field] = sorter.order == 'ascend' ? 'asc' : 'desc';
            }
            sortListSet(sortParams);
            formRef.current?.submit();
          }}
        />
      </Card>
      {/*弹框 在途数量*/}
      <DetailTransitNumList
        data={selectedRecord}
        open={open}
        openSet={openSet}
        dicList={common?.dicList}
      />
      {/*已计划发货数量*/}
      <DetailPlanedShipment
        data={selectedRecord}
        dicList={common?.dicList}
        open={openDetailPlanedShipment}
        openSet={openDetailPlanedShipmentSet}
      />
      {/*在制数量*/}
      <DetailInprocessNumList
        data={selectedRecord}
        dicList={common?.dicList}
        open={openDetailInprocessNumList}
        openSet={openDetailInprocessNumListSet}
      />
    </PageContainer>
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
