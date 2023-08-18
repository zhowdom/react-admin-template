import { Access, useAccess } from 'umi';
import { useRef, useState, useEffect } from 'react';
import { Spin } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import { vendorFeedbackPage, vendorFeedbackUpdateStatus } from '@/services/pages/supplier';
import { pubConfig, pubFilter, pubModal, pubMsg } from '@/utils/pubConfig';
import { pubGetFeedbackVendorList } from '@/utils/pubConfirm';
import ComplaintDetail from './Dialog/ComplaintDetail';

const Page = (props: any) => {
  const { dicList } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [vendorList, setVendorList] = useState<any>([]);
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  // 添加弹窗实例
  const complaintDetailModel = useRef();
  // 获取供应商下拉
  const getVendor = async (): Promise<any> => {
    const res = await pubGetFeedbackVendorList();
    setVendorList(res);
  };
  useEffect(() => {
    getVendor();
  }, []);
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      start_feedback_date: params.time && params.time.length ? params.time[0] : '',
      end_feedback_date: params.time && params.time.length ? params.time[1] : '',
    };
    const res = await vendorFeedbackPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 详情
  const complaintDetailModelOpen: any = (row: any) => {
    const data: any = complaintDetailModel?.current;
    data.open(row);
  };
  // 改状态
  const updateStatus = async (data: any) => {
    pubModal(`是否确定标记为${data.state == 'processed' ? '未处理' : '已处理'}?`)
      .then(async () => {
        setConfirmLoading(true);
        const res: any = await vendorFeedbackUpdateStatus({ id: data?.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功', 'success');
          actionRef?.current?.reload();
        }
        setConfirmLoading(false);
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '反馈标题',
      dataIndex: 'title',
      align: 'left',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '反馈时间',
      dataIndex: 'create_time',
      align: 'center',
      width: 180,
      hideInSearch: true,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_id',
      align: 'center',
      fieldProps: {
        showSearch: true,
        options: vendorList,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      valueType: 'select',
      hideInTable: true,
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      align: 'center',
      valueType: 'select',
      width: 100,
      valueEnum: dicList?.VENDOR_FEEDBACK_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(dicList?.VENDOR_FEEDBACK_STATUS, record?.status) || '-';
      },
    },
    {
      title: '反馈时间',
      dataIndex: 'time',
      align: 'center',
      valueType: 'dateRange',
      width: 100,
      hideInTable: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 200,
      align: 'center',
      fixed: 'right',
      valueType: 'option',
      className: 'wrap',
      render: (_, row) => [
        <Access key="edit" accessible={access.canSee('scm_complaint_detail')}>
          <a
            onClick={() => {
              complaintDetailModelOpen(row);
            }}
          >
            反馈详情
          </a>
        </Access>,
        <Access key="changePay" accessible={access.canSee('scm_complaint_update')}>
          <a
            onClick={() => {
              updateStatus(row);
            }}
            style={{ color: row?.status == 'processed' ? 'red' : '' }}
          >
            {`标记为${row?.status == 'processed' ? '未处理' : '已处理'}`}
          </a>
        </Access>,
      ],
    },
  ];
  return (
    <>
      <Spin spinning={confirmLoading}>
        <ProTable
          bordered
          columns={columns}
          actionRef={actionRef}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          rowKey="id"
          dateFormatter="string"
        />
      </Spin>
      <ComplaintDetail complaintDetailModel={complaintDetailModel} />
    </>
  );
};

export default Page;
