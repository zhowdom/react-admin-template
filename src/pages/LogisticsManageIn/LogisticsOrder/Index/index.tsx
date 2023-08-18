import { PageContainer } from '@ant-design/pro-layout';
import { connect, Access, useAccess, useModel, history } from 'umi';
import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import Shipped from './components/Shipped';
import { Col, Popconfirm, Popover, Row, Space } from 'antd';
import DatecSearch from './components/DatecSearch';
import AtHarbour from './components/AtHarbour';
import AtWarehouse from './components/AtWarehouse';
import Signed from './components/Signed';
import EditBookingNumber from './components/EditBookingNumber';
import EditTime from './components/EditTime';
import UploadPodFiles from './components/UploadPodFiles';
import CabinetOrDelivered from './components/CabinetOrDelivered';
import {
  getLogisticsOrderList,
  statusCount,
  deleteById,
  deliveryUndo,
  actualWarehouseWithdraw,
} from '@/services/pages/logisticsManageIn/logisticsOrder';
import { detailExport, getLspList, principalList } from '@/services/pages/logisticsManageIn/lsp';
import EditAT from './components/EditAT';
import CommonLog from '@/components/CommonLog';
import { getOperationHistory } from '@/services/pages/stockManager';
import ConfirmAtWarehouse from './components/ConfirmAtWarehouse';
import ExportBtn from '@/components/ExportBtn';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';

const Page = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  const [pageSize, setPageSize] = useState<any>(20);
  const [tabList, setTabList] = useState([]);
  const [tabStatus, setTabStatus] = useState('all');
  const [visible, visibleSet] = useState<boolean>(false);
  const [editTimevisible, editTimevisibleSet] = useState<boolean>(false);
  const [editATvisible, editATvisibleSet] = useState<boolean>(false);
  const [editBookingData, editBookingDataSet] = useState<any>({});
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const [exportForm, setExportForm] = useState<any>({});
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
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.85)',
  };
  // 获取负责人
  const pubGetUserListAction = async (key: any): Promise<any> => {
    return new Promise(async (resolve) => {
      const res = await principalList({
        key_word: key.keyWords?.replace(/(^\s*)/g, '') || '',
      });
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
        resolve([]);
        return;
      }
      const newArray = res?.data.map((v: any) => {
        return {
          ...v,
          value: v.user_id,
          label: v.name + '(' + v.account + ')',
          name: v.name,
        };
      });
      resolve(newArray);
    });
  };
  // 删除
  const deleteAction = async (id: string) => {
    const res = await deleteById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功', 'success');
      ref?.current?.reload();
    }
  };
  // 撤回到新建
  const cancelAction = async (id: string) => {
    const res = await deliveryUndo({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功', 'success');
      ref?.current?.reload();
    }
  };
   // 退回已到港
   const backToPortAction = async (id: string) => {
    const res = await actualWarehouseWithdraw({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功', 'success');
      ref?.current?.reload();
    }
  };
  const columns: ProColumns<any>[] = [
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      hideInSearch: true,
      width: 140,
      render: (_: any, record: any) => {
        return (
          <>
            {pubFilter(dicList?.LOGISTICS_ORDER_STATUS, record?.status) ?? '-'}
            {record?.overdue_days > 0 ? (
              <div style={{ color: '#ff0000', fontSize: '12px' }}>
                距
                {record?.status == '2'
                  ? '预计开船'
                  : record?.status == '3'
                  ? '预计到港'
                  : '预计入仓'}
                逾期{record?.overdue_days}天
              </div>
            ) : (
              ''
            )}
          </>
        );
      },
    },
    {
      title: '跨境物流单号',
      dataIndex: 'order_no',
      align: 'center',
      render: (_: any, record: any) => {
        return (
          <div className="order-wrapper">
            {access.canSee('scm_logisticsOrder_detail') ? (
              <a
                onClick={() => {
                  history.push(
                    `/logistics-manage-in/logistics-order-detail?id=${
                      record.id
                    }&timeStamp=${new Date().getTime()}`,
                  );
                }}
              >
                {record.order_no}
              </a>
            ) : (
              <span className="c-order">{record.order_no}</span>
            )}
          </div>
        );
      },
    },
    {
      title: '订舱号',
      dataIndex: 'booking_number',
      align: 'center',
    },
    {
      title: '舱位类型',
      dataIndex: 'shipping_space_type',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        pubFilter(dicList?.LOGISTICS_ORDER_SHIPPING_SPACE_TYPE, record?.shipping_space_type) ?? '-',
    },
    {
      title: '运输方式',
      dataIndex: 'shipping_method',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) =>
        pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD, record?.shipping_method) ??
        '-',
    },
    {
      title: '物流商',
      dataIndex: 'logistics_vendor_id',
      align: 'center',
      valueType: 'select',
      request: async () => {
        const res: any = await getLspList({
          current_page: 1,
          page_size: 99999,
        });
        return res?.data?.records?.map((v: any) => ({
          value: v.id,
          label: v.name,
        }));
      },
    },
    {
      title: 'SO号/运单号',
      dataIndex: 'so_no',
      align: 'center',
      width: 100,
    },
    {
      title: '柜号',
      dataIndex: 'cabinet_no',
      align: 'center',
      width: 100,
    },
    {
      title: '封条号',
      dataIndex: 'seal_no',
      align: 'center',
      width: 100,
    },
    {
      title: '物流负责人',
      dataIndex: 'principal_name',
      align: 'center',
      request: pubGetUserListAction,
      valueType: 'select',
      fieldProps: selectProps,
      search: {
        transform(value) {
          return {
            principal_id: value,
          };
        },
      },
    },
    {
      title: '备注',
      dataIndex: 'sysBusinessRemarks',
      hideInSearch: true,
      align: 'center',
      width: 100,
      ellipsis: true,
      render: (_: any, record: any) =>
        record?.sysBusinessRemarks?.length ? (
          <Popover
            placement="topLeft"
            content={record?.sysBusinessRemarks?.map((v: any, i: number) => {
              return (
                <div key={v.id} style={{ width: '300px' }}>
                  <Row gutter={4}>
                    <Col span={1}>{i + 1}.</Col>
                    <Col span={10}>
                      <pre style={preStyle}>{v.remarks}</pre>
                    </Col>
                    <Col span={12}>
                      <span style={{ color: '#aaa', fontSize: '12px' }}>—{v.create_time}</span>
                    </Col>
                  </Row>
                </div>
              );
            })}
            title="备注"
          >
            {record?.sysBusinessRemarks?.map((v: any) => {
              return <span key={v.id}>{v.remarks}</span>;
            })}
          </Popover>
        ) : (
          '-'
        ),
    },
    {
      title: '',
      dataIndex: 'descSearch',
      hideInTable: true,
      renderFormItem: () => <DatecSearch />,
      search: {
        transform: (val: any) => ({ date_search: val }),
      },
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
          <Access
            key="add"
            accessible={access.canSee('scm_logisticsOrder_edit') && record.status == '1'}
          >
            <a
              onClick={() => {
                history.push(
                  `/logistics-manage-in/logistics-order-edit?id=${
                    record.id
                  }&timeStamp=${new Date().getTime()}`,
                );
              }}
            >
              编辑
            </a>
          </Access>,
          <Access key="detail" accessible={access.canSee('scm_logisticsOrder_detail')}>
            <a
              onClick={() => {
                history.push(
                  `/logistics-manage-in/logistics-order-detail?id=${
                    record.id
                  }&timeStamp=${new Date().getTime()}`,
                );
              }}
            >
              详情
            </a>
          </Access>,
          <Access
            key="shi"
            accessible={record.status == '2' && access.canSee('scm_logisticsOrder_atd')}
          >
            <Shipped
              trigger="已开船"
              initialValues={record}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access
            key="har"
            accessible={record.status == '3' && access.canSee('scm_logisticsOrder_ata')}
          >
            <AtHarbour
              trigger="已到港"
              initialValues={record}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access
            key="ware"
            accessible={record.status == '4' && access.canSee('scm_logisticsOrder_actualWarehouse')}
          >
            <AtWarehouse
              trigger="已到仓"
              initialValues={record}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access
            key="sign"
            accessible={record.status == '5' && access.canSee('scm_logisticsOrder_signed')}
          >
            <Signed
              trigger="已签收"
              initialValues={record}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access
            key="bookingNumber"
            accessible={
              access.canSee('scm_logisticsOrder_editBookingNumber') &&
              (record.status == '1' || record.status == '2')
            }
          >
            <a
              onClick={() => {
                visibleSet(true);
                editBookingDataSet(record);
              }}
            >
              修改订舱号
            </a>
          </Access>,
          <Access
            key="logisticsOrder_editTime"
            accessible={
              access.canSee('scm_logisticsOrder_editTime') &&
              (record.status == '2' || record.status == '3' || record.status == '4')
            }
          >
            <a
              onClick={() => {
                editTimevisibleSet(true);
                editBookingDataSet(record);
              }}
            >
              修改预计时间
            </a>
          </Access>,
          <Access
            key="booking"
            accessible={record.status == '1' && access.canSee('scm_logisticsOrder_delivery')}
          >
            <CabinetOrDelivered
              trigger="已装柜/已送货"
              initialValues={record}
              dicList={dicList}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access
            key="logisticsOrder_editAT"
            accessible={
              access.canSee('scm_logisticsOrder_editAT') &&
              ['2', '3', '4', '5', '6'].includes(record.status)
            }
          >
            <a
              onClick={() => {
                editATvisibleSet(true);
                editBookingDataSet(record);
              }}
            >
              修改实际时间
            </a>
          </Access>,
          <Access
            key="delete"
            accessible={record.status == '1' && access.canSee('scm_logisticsOrder_delete')}
          >
            <Popconfirm
              key="delete"
              title="确定删除吗?"
              onConfirm={async () => deleteAction(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a>删除</a>
            </Popconfirm>
          </Access>,
          // 确认到仓时间
          <Access
            key="caw"
            accessible={
              record.status == '5' && access.canSee('scm_logisticsOrder_confirmWarehouseTime')
            }
          >
            <ConfirmAtWarehouse
              initialValues={record}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          // 上传签收证明
          <Access
            key="upf"
            accessible={record.status == '6' && access.canSee('scm_logisticsOrder_uploadPodFiles')}
          >
            <UploadPodFiles
              initialValues={record}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access
            key="backToNew"
            accessible={record.status == '2' && access.canSee('scm_logisticsOrder_backToNew')}
          >
            <Popconfirm
              key="delete"
              title="确定撤回到新建吗?"
              onConfirm={async () => cancelAction(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a>撤回到新建</a>
            </Popconfirm>
          </Access>,
           <Access
           key="backToPort"
           accessible={record.status == '5' && access.canSee('scm_logisticsOrder_backToPort')}
         >
           <Popconfirm
             key="delete"
             title="确定退回已到港吗?"
             onConfirm={async () => backToPortAction(record.id)}
             okText="确定"
             cancelText="取消"
           >
             <a>退回已到港</a>
           </Popconfirm>
         </Access>,
          // 日志
          <Access key="log" accessible={access.canSee('scm_logisticsOrder_log')}>
            <CommonLog
              api={getOperationHistory}
              business_no={record.order_no}
              dicList={common?.dicList}
            />
          </Access>,
        ];
      },
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 2300);
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
  // 获取状态及数据统计
  const statusCountAction = async () => {
    const res: any = await statusCount({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const tabs = res.data.map((v: any) => {
        return {
          key: v.key,
          tab: `${v.name} (${v.count})`,
        };
      });
      setTabList(tabs);
    }
  };
  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key);
    setPageSize(20);
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      status: tabStatus == 'all' ? null : tabStatus,
      [`start_${params?.date_search?.[0]}`]: params?.date_search?.[1]?.[0] || null,
      [`end_${params?.date_search?.[0]}`]: params?.date_search?.[1]?.[1] || null,
    };
    setExportForm(postData);
    const res = await getLogisticsOrderList(postData);
    statusCountAction();
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  return (
    <>
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
        <ProTable
          columns={columns}
          actionRef={ref}
          pagination={{
            showSizeChanger: true,
            pageSize,
            onChange: (page, size) => {
              setPageSize(size);
            },
          }}
          params={{ tabStatus }}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{
            defaultCollapsed: false,
            className: 'light-search-form',
            labelWidth: 'auto',
            span: 8,
          }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          {...ColumnSet}
          toolBarRender={() =>
            access.canSee('scm_logisticsOrder_export')
              ? [
                  <Space key="space">
                    <ExportBtn
                      exportHandle={detailExport}
                      exportForm={{
                        ...exportForm,
                        export_config: { columns: ColumnSet.customExportConfig },
                      }}
                      btnText="导出明细"
                    />
                  </Space>,
                ]
              : []
          }
          rowKey="id"
          dateFormatter="string"
          revalidateOnFocus={false}
        />
      </PageContainer>
      <EditBookingNumber
        visible={visible}
        initialValues={editBookingData}
        onColse={(isReload?: any) => {
          console.log(isReload);
          visibleSet(false);
          if (isReload) {
            ref?.current?.reload();
          }
        }}
      />
      <EditTime
        visible={editTimevisible}
        initialValues={editBookingData}
        onColse={(isReload?: any) => {
          console.log(isReload);
          editTimevisibleSet(false);
          if (isReload) {
            ref?.current?.reload();
          }
        }}
      />
      <EditAT
        visible={editATvisible}
        initialValues={editBookingData}
        onColse={(isReload?: any) => {
          editATvisibleSet(false);
          if (isReload) {
            ref?.current?.reload();
          }
        }}
      />
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;
