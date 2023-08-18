import type { ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProTable } from '@ant-design/pro-components';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { requestFundsHistory } from '@/services/pages/sample';
import PaymentRequestM from './PaymentRequestM';

const Component: React.FC<{
  dataSource: any;
  title?: string;
  trigger?: string;
  dicList: any;
}> = ({ dataSource, title, trigger, dicList }) => {
  const columns: ProColumns<any>[] = [
    {
      title: '请款金额',
      dataIndex: 'amount',
      align: 'center',
      width: 90,
    },
    {
      title: '请款时间',
      dataIndex: 'create_time',
      align: 'center',
      width: 146,
    },
    {
      title: '要求付款日期',
      dataIndex: 'requirement_pay_time',
      align: 'center',
      width: 110,
    },
    {
      title: '请款人',
      dataIndex: 'create_user_name',
      align: 'center',
      width: 100,
    },
    {
      title: '请款审批状态',
      dataIndex: 'approval_status',
      align: 'center',
      valueEnum: dicList?.PURCHASE_SAMPLE_ORDER_REQUEST_FUNDS || [],
      width: 110,
    },
    {
      title: '请款说明',
      dataIndex: 'reason',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'option',
      className: 'wrap',
      width: 100,
      align: 'center',
      valueType: 'option',
      render: (text: any, record: any) => (
        <PaymentRequestM
          id={record.id}
          viewDetail={true}
          dicList={dicList}
          title={`请款详情`}
          trigger="查看"
        />
      ),
      fixed: 'right',
    },
  ];
  return (
    <ModalForm
      title={title || '请款记录'}
      trigger={<a>{trigger || '请款记录'}</a>}
      layout="horizontal"
      width={866}
      modalProps={{
        destroyOnClose: true,
      }}
      submitter={{
        searchConfig: {
          resetText: '关闭',
        },
        render: (p: any, dom: any) => {
          return dom[0];
        },
      }}
    >
      <ProTable
        cardProps={{ bodyStyle: { padding: 0 } }}
        search={false}
        options={false}
        pagination={false}
        rowKey={'id'}
        size={'small'}
        bordered
        columns={columns}
        params={{ id: dataSource.id }}
        request={async (params) => {
          console.log(dataSource.id);
          const res: any = await requestFundsHistory(params);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
            };
          }
          return {
            success: true,
            data: res.data,
          };
        }}
      />
    </ModalForm>
  );
};
export default Component;
