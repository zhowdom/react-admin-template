import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import type { TableListItem } from '@/types/businessOut/communicate';
import { getPage } from '@/services/pages/communicate';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';
import Add from './Dialog/Add';
import Detail from './Dialog/Detail';
import { pubGetUserList, pubGetVendorList } from '@/utils/pubConfirm';
import { useAccess, Access } from 'umi';

const Communicate = (props: any) => {
  const { common } = props;
  // 添加弹窗实例
  const addModel = useRef();
  const detailModel = useRef();

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const access = useAccess();
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
  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    console.log('查询', params);
    const postData = {
      ...params,
      vendorName: params.vendor_name,
      vendorCode: params.vendor_code,
      applicant_id: params.communicate_name,
      current_page: params?.current,
      page_size: params?.pageSize,
      time_start: params?.time?.[0] || null,
      time_end: params?.time?.[1] || null,
    };
    delete postData.time;
    const res = await getPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.code == pubConfig.sCode ? res.data.records : [],
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };
  // 新增弹窗 编辑弹窗
  const addModalOpen: any = (row: any) => {
    const data: any = addModel?.current;
    data.open(row?.id);
  };
  // 详情弹窗
  const detailModelOpen: any = (row: any) => {
    const data: any = detailModel?.current;
    data.open(row.id);
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '供应商编码',
      dataIndex: 'vendor_code',
      align: 'center',
    },
    {
      title: '供应商名称',
      dataIndex: 'vendor_id',
      align: 'center',
      order: 2,
      fieldProps: selectProps,
      valueType: 'select',
      hideInTable: true,
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
    },
    {
      title: '供应商名称',
      dataIndex: 'vendor_name',
      align: 'center',
      order: 2,
      hideInSearch: true,
    },
    {
      title: '合作状态',
      dataIndex: 'vendor_status',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => {
        return pubFilter(common.dicList.VENDOR_COOPERATION_STATUS, record.vendor_status);
      },
    },
    {
      title: '沟通时间',
      dataIndex: 'communicate_time',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '员工姓名',
      dataIndex: 'communicate_name',
      align: 'center',
      fieldProps: selectProps,
      valueType: 'select',
      request: async (v) => {
        const res: any = await pubGetUserList(v);
        return res;
      },

    },
    {
      title: '流程来源',
      dataIndex: 'source',
      align: 'center',
      hideInSearch: true,
      render: (_, record: any) => {
        return pubFilter(common.dicList.VENDOR_COMMUNICATION_SOURCE, record.source);
      },
    },
    {
      title: '拜访信息状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      hideInSearch: true,
      valueEnum: common.dicList.VENDOR_COMMUNICATION_STATUS,
      render: (_, record: any) => {
        return pubFilter(common.dicList.VENDOR_COMMUNICATION_STATUS, record.status);
      },
    },
    {
      title: '沟通时间',
      align: 'center',
      dataIndex: 'time',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_, row) => {
        const renderList = [];
        if (row.status == 'C') {
          renderList.push(
            <a
              onClick={() => {
                detailModelOpen(row);
              }}
              key="detail"
            >
              查看
            </a>,
          );
        }
        if (row.status == 'I') {
          renderList.push(
            <Access key="editButton" accessible={access.canSee('businessCommunicate_edit')}>
              <a
                onClick={() => {
                  addModalOpen(row);
                }}
                key="edit"
              >
                编辑
              </a>
            </Access>,
          );
        }
        return renderList;
      },
    },
  ];
  return (
    <>
      <Add addModel={addModel} handleClose={modalClose} />
      <Detail detailModel={detailModel} handleClose={modalClose} />

      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable<TableListItem>
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{}}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getList}
          rowKey="id"
          search={{ defaultCollapsed: false, className: 'light-search-form' }}
          dateFormatter="string"
          headerTitle="出差记录"
          toolBarRender={() => [
            <>
              <Space>
                <Access key="addButton" accessible={access.canSee('businessCommunicate_add')}>
                  <Button
                    onClick={() => {
                      addModalOpen();
                    }}
                    ghost
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    新增日常沟通
                  </Button>
                </Access>
              </Space>
            </>,
          ]}
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Communicate);
export default ConnectPage;
