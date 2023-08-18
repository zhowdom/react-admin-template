import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { ProFormField, ProTable } from '@ant-design/pro-components';
import { connect, useAccess } from 'umi';
import { pubConfig, pubFilter, pubMsg, selectProps } from '@/utils/pubConfig';
import { pubBlobDownLoad, pubGetVendorList } from '@/utils/pubConfirm';
import { exportOrderInList, getList } from '@/services/pages/SCM_Manage/purchaseAmountIN';
import { Button, Space, Tooltip } from 'antd';
import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ModalOrder from '@/components/AmountDetail/Order';
/*采购金额统计(采购下单维度) - 跨境*/
const PageOrder: React.FC<{
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
    const res: any = await exportOrderInList(exportForm);
    setDownLoading(false);
    pubBlobDownLoad(res, '跨境 - 采购金额统计(采购下单维度)');
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
      title: '采购创建起始时间',
      dataIndex: 'time',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: (
        <>
          已批准（货值）
          <Tooltip
            placement="top"
            title="筛选时间范围内，审核通过、待签约、已签约且没有港口入库的三种状态的采购单的采购单总金额汇总（包括运费和采购单扣款）"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'noPayAmount',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record?.noPayAmount ? (
          <ModalOrder
            queryForm={exportForm}
            type={'noPayAmount'}
            businessScope={'IN'}
            dataSource={record}
            dicList={common?.dicList}
            title={record.vendorName + ' - 已批准（货值）明细'}
            trigger={
              <a>
                <ProFormField
                  mode={'read'}
                  noStyle
                  valueType={'digit'}
                  fieldProps={{ precision: 2 }}
                  formItemProps={{ className: 'text-primary' }}
                  text={record?.noPayAmount}
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
          已部分收货(货值)
          <Tooltip
            placement="top"
            title="筛选时间范围内，已签约部分已港口入库采购单的采购单总金额汇总"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
          <div>（到港入库）</div>
        </>
      ),
      dataIndex: 'partialAmount',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record?.partialAmount ? (
          <ModalOrder
            queryForm={exportForm}
            type={'partialAmount'}
            businessScope={'IN'}
            dataSource={record}
            dicList={common?.dicList}
            title={record.vendorName + ' - 已部分收货（货值）明细'}
            trigger={
              <a>
                <ProFormField
                  mode={'read'}
                  noStyle
                  valueType={'digit'}
                  fieldProps={{ precision: 2 }}
                  formItemProps={{ className: 'text-primary' }}
                  text={record?.partialAmount}
                />
              </a>
            }
          />
        ) : (
          0
        ),
      sorter: true,
      width: 160,
    },
    {
      title: (
        <>
          已全部收货(货值)
          <Tooltip
            placement="top"
            title="筛选时间范围内，已签约全部已港口入库采购单的采购单总金额汇总"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
          <div>（到港入库）</div>
        </>
      ),
      dataIndex: 'allAmount',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) =>
        record?.allAmount ? (
          <ModalOrder
            queryForm={exportForm}
            type={'allAmount'}
            businessScope={'IN'}
            dataSource={record}
            dicList={common?.dicList}
            title={record.vendorName + ' - 已全部收货（货值）明细'}
            trigger={
              <a>
                <ProFormField
                  mode={'read'}
                  noStyle
                  valueType={'digit'}
                  fieldProps={{ precision: 2 }}
                  formItemProps={{ className: 'text-primary' }}
                  text={record?.allAmount}
                />
              </a>
            }
          />
        ) : (
          0
        ),
      sorter: true,
      width: 160,
    },
    {
      title: (
        <>
          金额汇总
          <Tooltip
            placement="top"
            title="按采购单创建时间筛选，筛选时间范围内，审批通过后的所有采购单的采购单总金额汇总（审核通过、待签约、已签约、部分入库、全部入库、部分结算、全部结算）"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'amount',
      align: 'right',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <ProFormField
          mode={'read'}
          noStyle
          valueType={'digit'}
          fieldProps={{ precision: 2 }}
          text={record?.amount}
        />
      ),
      sorter: true,
    },
    {
      title: (
        <>
          币种
          <Tooltip placement="top" title="采购单的对应币种">
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
    <>
      <ProTable
        actionRef={actionRef}
        rowKey={(record) => record.vendorId + record.currency}
        dateFormatter="string"
        bordered
        pagination={{
          showSizeChanger: true,
        }}
        scroll={{ x: 1200 }}
        sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
        showSorterTooltip={false}
        options={{ fullScreen: true, setting: false }}
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
    </>
  );
};

// 全局model注入
const ConnectPage = connect(({ common }: any) => ({ common }))(PageOrder);
export default ConnectPage;
