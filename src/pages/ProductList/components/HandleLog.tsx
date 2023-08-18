import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { getLogist } from '@/services/pages/productList';

export default (props: any) => {
  const { id, dicList } = props;
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.85)',
  };
  return (
    <ModalForm
      title="操作日志"
      trigger={<a> {props.trigger}</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={{
        searchConfig: {
          submitText: '确认',
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      width={1200}
    >
      <ProTable
        request={async (): Promise<any> => {
          const res = await getLogist({ id });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: res?.data || [],
            success: true,
            total: res?.data?.length || 0,
          };
        }}
        options={false}
        bordered
        size="small"
        pagination={false}
        search={false}
        columns={[
          {
            title: '操作类型',
            dataIndex: 'business_type',
            align: 'left',
            render: (_: any, record: any) => {
              return (
                record?.business_type == 'GOODS_SKU_CHANGE_HISTORY' ? '发货仓变更' : (pubFilter(dicList?.SYS_CHANGE_HISTORY_BUSINESS_TYPE, record?.business_type) || '-')
              );
            },
          },
          {
            title: '操作对象',
            dataIndex: 'business_name',
            align: 'left',
          },
          {
            title: '变更前',
            dataIndex: 'before_value',
            align: 'left',
            render: (dom: any, record: any) => {
              return <pre style={preStyle}>{record.before_value}</pre>;
            },
          },
          {
            title: '变更后',
            dataIndex: 'after_value',
            align: 'left',
            render: (dom: any, record: any) => {
              return <pre style={preStyle}>{record.after_value}</pre>;
            },
          },

          {
            title: '操作人',
            dataIndex: 'create_user_name',
            align: 'left',
          },
          {
            title: '操作时间',
            dataIndex: 'create_time',
            align: 'left',
            width: 90,
          },
        ]}
      />
    </ModalForm>
  );
};
