import { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableListItem } from '@/types/account';
import { Link } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import { sysChangeFieldHistory } from '@/services/pages/purchaseOrder';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubDownLoad } from '@/utils/pubConfirm';

const OrderLog = (props: any) => {
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      current_page: params?.current,
      page_size: params?.pageSize,
      id: props?.items?.id,
    };
    const res = await sysChangeFieldHistory(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 表格配置
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 120,
      align: 'center',
    },

    {
      title: '操作内容',
      dataIndex: 'item_name',
      align: 'center',
    },
    {
      title: '操作前',
      dataIndex: 'before_value',
      align: 'center',
      render: (_, record: any) => {
        if (record?.item_type == 2) {
          record.before_value_data = JSON.parse(record.before_value)[0];
        }
        console.log(record.before_value_data);
        return record?.item_type == 2 ? (
          <Link
            to={'#'}
            onClick={() => {
              pubDownLoad(record?.before_value_data?.access_url);
            }}
          >
            {record?.before_value_data?.name}
          </Link>
        ) : (
          <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
            {record.before_value}
          </pre>
        );
      },
    },
    {
      title: '操作后',
      dataIndex: 'after_value',
      align: 'center',
      render: (_, record: any) => {
        if (record?.item_type == 2) {
          record.after_value_data = JSON.parse(record.after_value)[0];
        }
        return record?.item_type == 2 ? (
          <Link
            to={'#'}
            onClick={() => {
              pubDownLoad(record?.after_value_data?.access_url);
            }}
          >
            {record?.after_value_data?.name}
          </Link>
        ) : (
          <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{record.after_value}</pre>
        );
      },
    },
    {
      title: '操作时间',
      dataIndex: 'create_time',
      align: 'center',
    },
    {
      title: '操作人',
      dataIndex: 'create_user_name',
      align: 'center',
    },
  ];
  return (
    <ProTable<TableListItem>
      columns={columns}
      options={false}
      pagination={{}}
      bordered
      actionRef={ref}
      formRef={formRef}
      request={getListAction}
      rowKey="id"
      search={false}
      dateFormatter="string"
      className="p-table-0"
      headerTitle={false}
    />
  );
};

export default OrderLog;
