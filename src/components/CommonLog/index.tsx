import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import Detail from './Detail';
import './index.less';

export default (props: any) => {
  const { business_no, api, dicList,business_id} = props;
  return (
    <ModalForm
      title="操作日志"
      trigger={<a> 操作日志</a>}
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
          const postData = {
            businessType: '',
            business_no,
            business_id,
            current_page: params?.current,
            page_size: params?.pageSize
          };
          if(business_id) {
            delete postData.business_no
          } else {
            delete postData.business_id
          }
          const res = await api(postData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: res?.data?.records?.map((v: any, i: number) => ({ ...v, index: i + 1 })) || [],
            success: true,
            total: res?.data?.total || 0,
          };
        }}
        rowKey="id"
        options={false}
        bordered
        size="small"
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        pagination={{
          showSizeChanger: true,
          className: 'modal-pagi',
        }}
        scroll={{ y: 'calc(70vh - 80px)' }}
        search={false}
        columns={[
          {
            title: '序号',
            dataIndex: 'index',
            align: 'center',
          },

          {
            title: '菜单',
            dataIndex: 'menu_name',
            align: 'center',
          },
          {
            title: '功能',
            dataIndex: 'business_type_name',
            align: 'center',
          },

          {
            title: '操作人',
            dataIndex: 'create_user_name',
            align: 'center',
          },
          {
            title: '操作时间',
            dataIndex: 'create_time',
            align: 'center',
          },
          {
            title: '操作人IP',
            dataIndex: 'ip_addr',
            align: 'center',
          },
          {
            title: '日志详情',
            key: 'option',
            width: 230,
            align: 'center',
            valueType: 'option',
            fixed: 'right',
            className: 'wrap',
            render: (text: any, record: any) => {
              return [<Detail key="detail" trigger="详情" id={record.id} dicList={dicList} />];
            },
          },
        ]}
      />
    </ModalForm>
  );
};
