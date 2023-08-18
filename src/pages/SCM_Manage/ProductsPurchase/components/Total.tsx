import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Access, connect, useAccess } from 'umi';
import { pubAlert, pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { pubBlobDownLoad } from '@/utils/pubConfirm';
import { exportExcel, getList } from '@/services/pages/SCM_Manage/productsPurchase';
import { Button, Space, Statistic, Tooltip } from 'antd';
import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ProductLine from '@/components/PubForm/ProductLine';
import TimeSearch from '@/components/PubForm/TimeSearch';
import moment from 'moment';
import type { ProFormInstance } from '@ant-design/pro-form';

const Page = (props: any) => {
  const actionRef = useRef<ActionType>();
  const [downLoading, setDownLoading] = useState(false);
  const [exportForm, setExportForm] = useState<any>({});
  const [tableData, setTableData] = useState<any>({});
  const access = useAccess();
  const formRef = useRef<ProFormInstance>();
  // 导出excel
  const downLoad = async () => {
    if (!access.canSee('liyi99-report_products-purchase-total-export')) {
      pubMsg('您暂无"导出"权限, 可联系管理员开通哦~');
      return;
    }
    setDownLoading(true);
    const res: any = await exportExcel(exportForm);
    setDownLoading(false);
    pubBlobDownLoad(res, '采购商品列表');
  };

  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    if (!params?.time?.dateList?.[0] || !params?.time?.dateList?.[1]) {
      pubAlert('请选择时间范围', '', 'warning');
      return {
        data: tableData?.records || [],
        success: true,
        total: tableData.total || 0,
      };
    }
    const page = {
      current: params?.current,
      size: params?.pageSize,
    };

    delete params.current;
    delete params.pageSize;
    const postData = {
      page,
      ...params,
      categoryBusinessScope: params.category_data ? params.category_data[0] : '', //业务范畴
      categoryId: params.category_data ? params.category_data[1] : '', //产品线

      beginCreateTime:
        params.time?.sType === 'create' && params.time?.dateList?.[0]
          ? `${moment(params.time?.dateList?.[0]).format('YYYY-MM-DD')} 00:00:00`
          : null,
      endCreateTime:
        params.time?.sType === 'create' && params.time?.dateList?.[1]
          ? `${moment(params.time?.dateList?.[1]).format('YYYY-MM-DD')} 23:59:59`
          : null,

      beginSigningTime:
        params.time?.sType === 'sign' && params.time?.dateList?.[0]
          ? `${moment(params.time?.dateList?.[0]).format('YYYY-MM-DD')} 00:00:00`
          : null,
      endSigningTime:
        params.time?.sType === 'sign' && params.time?.dateList?.[1]
          ? `${moment(params.time?.dateList?.[1]).format('YYYY-MM-DD')} 23:59:59`
          : null,

    };
    const res = await getList(postData);
    setExportForm(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    setTableData(res?.data || {});
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // table配置
  const columns: any[] = [
    {
      title: '',
      dataIndex: 'time',
      align: 'center',
      order: 4,
      hideInTable: true,
      initialValue: {
        sType: 'sign',
        dType: 'date',
        dateList: [moment().startOf('month'), moment().endOf('month')],
      },
      renderFormItem: () => <TimeSearch />,
      search: {
        transform: (val: any) => {
          console.log(val)
          // console.log(moment(val.dates[1]).format('YYYY-MM-DD'))
            return {
              time: val,
            };
        },
      },
      // renderFormItem: (_, rest, form) => {
      //   return (
      //     <TimeSearch
      //       back={(v: any) => {
      //         console.log(v)
      //         form.setFieldsValue({ time: v });
      //       }}
      //     />
      //   );
      // },
    },
    {
      title: '商品名称',
      dataIndex: 'skuName',
      align: 'center',
      order: 1,
    },
    {
      title: 'SKU',
      dataIndex: 'skuCode',
      align: 'center',
      order: 2,
    },
    {
      title: '产品线',
      dataIndex: 'category_data',
      width: 110,
      align: 'center',
      order: 3,
      renderFormItem: (_, rest, form) => {
        return (
          <ProductLine
            single={true}
            back={(v: any) => {
              form.setFieldsValue({ category_data: v });
            }}
          />
        );
      },
      render: (_: any, record: any) =>
        `${pubFilter(props?.dicList?.SYS_BUSINESS_SCOPE, record.categoryBusinessScope)}-${record.categoryName
        }`,
    },
    {
      title: '生命周期(销售状态)',
      dataIndex: 'lifeCycle',
      width: '75px',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <span>{pubFilter(props?.dicList?.GOODS_LIFE_CYCLE, record?.lifeCycle) || '-'}</span>
      ),
    },
    {
      title: '下单数量',
      dataIndex: 'num',
      width: 100,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '采购单价(最高/最低/平均)',
      dataIndex: 'sku_price',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        `${record.maxPrice} / ${record.minPrice} / ${record.averagePrice}`,
    },
    {
      title: (
        <>
          未交货数量
          <Tooltip
            placement="top"
            title={
              <div>
                已签约的采购单中，未建立入库单SKU数量、或入库单状态为：新建/已同步/已通知/撤回中/已撤回
              </div>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'undeliveredNum',
      width: 100,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '在途数量',
      dataIndex: 'transitNum',
      width: 100,
      hideInSearch: true,
      align: 'center',
      render: (_, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.transitNum || 0}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
            />
          </span>,
        ];
      },
    },
    {
      title: (
        <>
          已到货数量
          <Tooltip
            placement="top"
            title={
              <>
                <div>跨境：到港数量</div>
                <div>国内：平台入库数量</div>
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'warehouseNum',
      width: 100,
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '物流丢失数量',
      dataIndex: 'logisticsLossQty',
      align: 'center',
      hideInSearch: true
    },
    {
      title: '操作',
      key: 'option',
      width: 70,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      className: 'wrap',
      hideInTable: !access.canSee('liyi99-report_products-purchase-detail'),
      render: (_: any, record: any) => {
        return [
          <Access key="detail" accessible={access.canSee('liyi99-report_products-purchase-detail')}>
            <a
              onClick={() => {
                props.toDetail({
                  skuCode: record.skuCode,
                  time: exportForm.time,
                });
              }}
            >
              详情
            </a>
          </Access>,
        ];
      },
    },
  ];

  return (
    <ProTable
      bordered
      actionRef={actionRef}
      rowKey={(record: any) => record.goodsSkuId + record.skuCode}
      dateFormatter="string"
      pagination={{
        showSizeChanger: true,
      }}
      formRef={formRef}
      scroll={{ x: 1200 }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      showSorterTooltip={false}
      options={{ fullScreen: true, setting: false }}
      headerTitle="采购单汇总表 - 汇总"
      request={getListAction}
      columns={columns}
      search={{ span: 8, labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      toolBarRender={() => [
        <Space key="space">
          {access.canSee('liyi99-report_products-purchase-total-export') ? (
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
