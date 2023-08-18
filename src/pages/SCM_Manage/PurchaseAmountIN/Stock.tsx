import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { connect, useAccess } from 'umi';
import { pubConfig, pubFilter, pubMsg, selectProps } from '@/utils/pubConfig';
import { pubBlobDownLoad, pubGetVendorList } from '@/utils/pubConfirm';
import {
  exportReceivingInList,
  getListReceipt,
} from '@/services/pages/SCM_Manage/purchaseAmountIN';
import { Button, Space, Statistic, Tooltip } from 'antd';
import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ModalStock from '@/components/AmountDetail/Stock';
import { ProFormField } from '@ant-design/pro-components';
/*采购金额统计(收货入库维度) - 跨境*/
const PageStock: React.FC<{
  common?: any;
}> = ({ common }) => {
  const actionRef = useRef<ActionType>();
  const [downLoading, setDownLoading] = useState(false);
  const [exportForm, setExportForm] = useState({});
  const access = useAccess();
  // 导出excel
  const downLoad = async () => {
    if (!access.canSee('liyi99-report_purchase-amount-in-export')) {
      pubMsg('您暂无"导出"权限, 可联系管理员开通哦~');
      return;
    }
    setDownLoading(true);
    const res: any = await exportReceivingInList(exportForm);
    setDownLoading(false);
    pubBlobDownLoad(res, '跨境 - 采购金额统计(收货入库维度)');
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
      paramList: {
        ...params,
        startCreateTime: params.time ? params.time[0] : '',
        endCreateTime: params.time ? params.time[1] : '',
      },
    };
    const res = await getListReceipt(postData);
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
      title: '供应商名称',
      dataIndex: 'vendorId',
      hideInTable: true,
      valueType: 'select',
      request: async (v: any) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
      debounceTime: 300,
      fieldProps: {
        showSearch: true,
      },
    },
    {
      title: '供应商名称',
      dataIndex: 'vendorName',
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
      dataIndex: 'vendorCode',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '供应商等级',
      dataIndex: 'vendorGrade',
      align: 'center',
      hideInSearch: true,
      render: (_, record: any) => pubFilter(common?.dicList.VENDOR_GRADE, record?.vendorGrade) || '-',
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
      dataIndex: 'vendorStatus',
      align: 'center',
      valueType: 'select',
      valueEnum: common?.dicList?.VENDOR_COOPERATION_STATUS || {},
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
      valueType: 'select',
      align: 'center',
      fieldProps: selectProps,
      valueEnum: common?.dicList?.VENDOR_PAYMENT_METHOD || {},
    },
    {
      title: '采购单收货时间',
      dataIndex: 'time',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: (
        <>
          已收货数量
          <Tooltip
            placement="top"
            title="筛选条件内，该供应商所有采购单对应入库单的已到港入库商品数量。统计国内已入库、跨境在途、平台入库中、平台入库异常、平台已入库五个状态的到港数量。"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
          <div>（到港入库）</div>
        </>
      ),
      dataIndex: 'warehousingNum',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record?.warehousingNum ? (
          <ModalStock
            queryForm={exportForm}
            type={'warehousingNum'}
            businessScope={'IN'}
            dataSource={record}
            dicList={common?.dicList}
            title={record.vendorName + ' - 已收货数量'}
            trigger={
              <a>
                <ProFormField
                  mode={'read'}
                  noStyle
                  valueType={'digit'}
                  fieldProps={{ precision: 0 }}
                  formItemProps={{ className: 'text-primary' }}
                  text={record?.warehousingNum}
                />
              </a>
            }
          />
        ) : (
          0
        ),
      sorter: true,
    },
    {
      title: (
        <>
          已收货金额
          <Tooltip
            placement="top"
            title="筛选条件内，该供应商所有采购单对应入库单的已到港入库商品数量乘以对应商品采购单价"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
          <div>（到港入库）</div>
        </>
      ),
      dataIndex: 'warehousingAmount',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record?.warehousingAmount ? (
          <ModalStock
            queryForm={exportForm}
            type={'warehousingAmount'}
            businessScope={'IN'}
            dataSource={record}
            dicList={common?.dicList}
            title={record.vendorName + ' - 已收货金额'}
            trigger={
              <a>
                <ProFormField
                  mode={'read'}
                  noStyle
                  valueType={'digit'}
                  fieldProps={{ precision: 2 }}
                  formItemProps={{ className: 'text-primary' }}
                  text={record?.warehousingAmount}
                />
              </a>
            }
          />
        ) : (
          0
        ),
      sorter: true,
    },
    {
      title: (
        <>
          已支付金额
          <Tooltip
            placement="top"
            title="筛选条件内，该供应商所有采购单对应入库单的已入库商品数量乘以对应商品采购单价，且已支付金额（含预付），预付是账单已抵消部分。"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
          <div>（含预付）</div>
        </>
      ),
      dataIndex: 'paymentAmount',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.paymentAmount}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
      sorter: true,
    },
    {
      title: (
        <>
          待支付金额
          <Tooltip
            placement="top"
            title="筛选条件内，该供应商所有采购单对应入库单的已入库商品数量乘以对应商品采购单价，且未支付金额。待支付金额=已入库货值-已支付金额。"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'noPaymentAmount',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) => {
        return [
          <span key="status">
            <Statistic
              value={record?.noPaymentAmount}
              valueStyle={{ fontWeight: 400, fontSize: '12px' }}
              precision={2}
            />
          </span>,
        ];
      },
      sorter: true,
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
      align: 'center',
      width: 80,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return pubFilter(common?.dicList.SC_CURRENCY, record?.currency) || '-';
      },
    },
  ];

  return (
    <ProTable
      actionRef={actionRef}
      rowKey={(record: any) => record.vendorId + record.currency}
      dateFormatter="string"
      pagination={{
        showSizeChanger: true,
      }}
      scroll={{ x: 1000 }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      showSorterTooltip={false}
      options={{ fullScreen: true, setting: false }}
      bordered
      headerTitle="采购金额统计(跨境)"
      request={getListAction}
      columns={columns}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      toolBarRender={() => [
        <Space key="space">
          {access.canSee('liyi99-report_purchase-amount-in-export') ? (
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
const ConnectPage = connect(({ common }: any) => ({ common }))(PageStock);
export default ConnectPage;
