import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import React from 'react';
import { Modal, Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { connect } from 'umi';

// 审批信息
const ApprovalInfo: React.FC<any> = (props: any) => {
  const dataSource: any[] = props.dataSource || [];
  const { common } = props;
  const { dicList } = common;
  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '提交人',
      dataIndex: 'create_user_name',
      align: 'center',
    },
    {
      title: '审批状态',
      dataIndex: 'business_status',
      align: 'center',
      valueEnum: dicList.APPROVAL_STATUS || [],
      render: (_, record: any) => {
        const item = dicList.APPROVAL_STATUS;
        const key = record?.business_status;
        return [<span key="business_status">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '提交时间',
      dataIndex: 'create_time',
      align: 'center',
      valueType: 'date',
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 100,
      render: (_, row) => [
        <a
          key="delete"
          onClick={() => {
            console.log(row.sysApprovalDetailHistories);
            Modal.info({
              title: '审批记录',
              width: 520,
              content: (
                <Timeline mode={'left'} style={{ margin: '34px 0 0 0' }}>
                  {row.sysApprovalDetailHistories.map((item: any, index: number) => {
                    return (
                      <Timeline.Item
                        key={index}
                        label={
                          <div>
                            {item.approval_time}
                            <br />
                            (提交人: {item.approval_user_name || '未知'})
                          </div>
                        }
                        dot={
                          index == row.sysApprovalDetailHistories.length - 1 ? (
                            <ClockCircleOutlined />
                          ) : null
                        }
                        color={
                          item.approval_status == 0
                            ? '#2e62e2'
                            : item.approval_status == 1
                            ? 'green'
                            : 'red'
                        }
                      >
                        <div style={{ fontSize: '16px' }}>{item.approval_status_name}</div>
                        <div style={{ color: '#999' }}>
                          {index == 0 ? '备注:' : '审批意见:'} {item.remark ? item.remark : '无'}
                        </div>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              ),
            });
          }}
        >
          详情
        </a>,
      ],
    },
  ];
  return (
    <ProTable
      headerTitle="审批信息:"
      rowKey="id"
      loading={!(dataSource && dataSource.length)}
      columns={columns}
      params={dataSource}
      request={async () => {
        if (dataSource) {
          return {
            data: dataSource,
            success: true,
          };
        }
        return {
          data: [],
          success: true,
        };
      }}
      pagination={false}
      search={false}
      options={false}
    />
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ApprovalInfo);
