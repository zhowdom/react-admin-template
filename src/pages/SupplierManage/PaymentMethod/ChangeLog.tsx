import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useAccess } from 'umi';
import Add from '@/pages/ContractManage/List/Dialog/Add';
import { useRef } from 'react';

export default (props: any) => {
  const { vendorId, api, dicList } = props;
  const addModel = useRef();
  const access = useAccess();
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.85)',
  };
  // 新增 编辑弹窗
  const addModalOpen: any = (row?: any) => {
    const data: any = addModel?.current;
    data.open(row);
  };
  return (
    <ModalForm
      title="操作日志"
      trigger={<a> 变更日志</a>}
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
            vendor_id: vendorId,
            current_page: params?.current,
            page_size: params?.pageSize,
          };
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
            title: '变更类型',
            dataIndex: 'type',
            align: 'left',
            width: 80,
            render: (_: any, record: any) => (record?.type == '2' ? ' 条件变更' : '合同签约'),
          },
          {
            title: '变更前结算方式',
            dataIndex: 'before_pay_method',
            align: 'left',
            render: (_: any, record: any) => <pre style={preStyle}>{record.before_pay_method}</pre>,
          },

          {
            title: '变更后结算方式',
            dataIndex: 'after_pay_method',
            align: 'left',
            render: (_: any, record: any) => <pre style={preStyle}>{record.after_pay_method}</pre>,
          },
          {
            title: '发起人',
            dataIndex: 'create_user_name',
            align: 'left',
            width: 150,
          },
          {
            title: '变更时间',
            dataIndex: 'create_time',
            align: 'left',
            width: 150,
          },
          {
            title: '操作',
            key: 'option',
            width: 100,
            align: 'left',
            valueType: 'option',
            fixed: 'right',
            className: 'wrap',
            hideInTable: !access.canSee('scm_payMethod_contract'),
            render: (_: any, record: any) => {
              return [
                <a
                  key="view"
                  onClick={() => {
                    addModalOpen({ ...record, id: record.after_contract_id, readonly: true });
                  }}
                >
                  查看合同
                </a>,
              ];
            },
          },
        ]}
      />
      <Add addModel={addModel} dicList={dicList} />
    </ModalForm>
  );
};
