import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import './RateSetting/components/index.less';

export default (props: any) => {
  const { title, api, id } = props;
  // 转换数据
  const transferAction = (data: any) => {
    const source: any = [];
    for (const item of data) {
      const changeItems: any = Object.values(item);
      const cur: any = {
        changeItems,
        change_history_id: changeItems?.[0]?.change_history_id || null,
        create_user_name: changeItems?.[0]?.create_user_name || null,
        create_time: changeItems?.[0]?.create_time || null,
      };
      source.push(cur);
    }
    return source;
  };
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.85)',
  };
  return (
    <ModalForm
      title="日志"
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
        request={async (params: any): Promise<any> => {
          const res = await api({ id, current_page: params?.current, page_size: params?.pageSize });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: res?.data?.records ? transferAction(res?.data?.records) : [],
            success: true,
            total: res?.data?.total || 0,
          };
        }}
        options={false}
        bordered
        size="small"
        pagination={{
          showSizeChanger: true,
          className: 'modal-pagi',
        }}
        search={false}
        columns={[
          {
            title: 'id',
            dataIndex: 'change_history_id',
          },
          {
            title: title ? `变更前${title}` : '变更前',
            dataIndex: 'before',
            render: (_: any, record: any) => {
              return record?.changeItems?.length
                ? record?.changeItems.map((v: any) => (
                    <pre key={v.id} style={preStyle}>
                      {v.item_name}: {v.before_value}
                    </pre>
                  ))
                : '-';
            },
          },
          {
            title: title ? `变更后${title}` : '变更后',
            dataIndex: 'after',
            render: (_: any, record: any) => {
              return record?.changeItems?.length
                ? record?.changeItems.map((v: any) => (
                    <pre key={v.id} style={preStyle}>
                      {v.item_name}: {v.after_value}
                    </pre>
                  ))
                : '-';
            },
          },
          {
            title: '操作人',
            dataIndex: 'create_user_name',
            width: 80,
          },
          {
            title: '操作时间',
            dataIndex: 'create_time',
            width: 150,
          },
        ]}
      />
    </ModalForm>
  );
};
