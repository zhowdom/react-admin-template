import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import React from 'react';
import { Modal } from 'antd';
import { connect } from 'umi';

// 变更日志
const ChangeLog: React.FC<any> = (props: any) => {
  const dataSource: any[] = props.dataSource || [];
  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '操作时间',
      dataIndex: 'create_user_name',
      align: 'center',
    },
    {
      title: '操作人',
      dataIndex: 'business_status',
      align: 'center',
    },
    {
      title: '操作类型',
      dataIndex: 'create_user_name',
      align: 'center',
    },
    {
      title: '变更详情',
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
              title: '变更详情',
              width: 520,
              content: (
                <div>
                  <p style={{ color: '#a8a8a8' }}>
                    说明：立项申请的操作日志，只记录发生改变的字段，没有改变的字段或者图片变更不记录
                  </p>
                  <ProTable
                    headerTitle={false}
                    rowKey="id"
                    columns={[
                      {
                        title: '变更前',
                        dataIndex: 'create_user_name',
                        align: 'center',
                      },
                      {
                        title: '变更后',
                        dataIndex: 'create_user_name',
                        align: 'center',
                      },
                    ]}
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
                </div>
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
      headerTitle="变更日志"
      rowKey="id"
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
}))(ChangeLog);
