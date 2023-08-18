import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import { getReviewHistory } from '@/services/pages/productList';
import './index.less';

export default (props: any) => {
  const { id } = props;
  const InnerTable = (p: any) => {
    console.log(p.data);
    return (
      <div className="p-table-inTable-content">
        <ProTable
          dataSource={p.data || [{}]}
          className={'p-table-0'}
          rowKey="id"
          showHeader={false}
          pagination={false}
          options={false}
          search={false}
          toolBarRender={false}
          cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
          style={{ wordBreak: 'break-all' }}
          bordered
          columns={[
            {
              title: '评审款式',
              dataIndex: 'sku_code',
              align: 'left',
              width: 250,
              render: (dom: any, record: any) => {
                return (
                  <>
                    <div>{record.sku_code}</div>
                    <div>{record.sku_name}</div>
                  </>
                );
              },
            },
            {
              title: (
                <>
                  评审前
                  <br />
                  生命周期
                </>
              ),
              dataIndex: 'life_cycle_name',
              align: 'left',
              width: 70,
            },
            {
              title: (
                <>
                  评审后
                  <br />
                  生命周期
                </>
              ),
              dataIndex: 'review_life_cycle_name',
              align: 'left',
              width: 70,
            },
          ]}
        />
      </div>
    );
  };
  return (
    <ModalForm
      title="评审日志"
      trigger={<a> 评审日志</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      className="reviewLog"
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
        request={async (params): Promise<any> => {
          const res = await getReviewHistory({
            current_page: params?.current,
            page_size: params?.pageSize,
            goods_id: id,
          });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: res?.data?.records || [],
            success: true,
            total: res?.data?.total || 0,
          };
        }}
        pagination={{
          showSizeChanger: true,
        }}
        options={false}
        bordered
        size="small"
        search={false}
        columns={[
          {
            title: '发起评审时间',
            dataIndex: 'review_create_time',
            align: 'center',
            render: (_: any, record: any) => (
              <>
                <div>{record.review_create_time}</div>
                <div>{record.review_create_user_name}</div>
              </>
            ),
            width: 128,
          },
          {
            title: '评审确认时间',
            dataIndex: 'review_result_time',
            align: 'center',
            render: (_: any, record: any) => (
              <>
                <div>{record.review_result_time}</div>
                <div>{record.review_result_user_name}</div>
              </>
            ),
            width: 128,
          },
          {
            title: '评审款式',
            dataIndex: 'sku_code',
            align: 'left',
            onCell: () => ({ colSpan: 3, style: { padding: 0 } }),
            className: 'p-table-inTable noBorder',
            render: (_, record: any) => <InnerTable data={record.goodsSkus} />,
            width: 250,
          },
          {
            title: (
              <>
                评审前
                <br />
                生命周期
              </>
            ),
            dataIndex: 'life_cycle_name',
            onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
            width: 70,
            align: 'left',
          },
          {
            title: (
              <>
                评审后
                <br />
                生命周期
              </>
            ),
            dataIndex: 'review_life_cycle_name',
            align: 'left',
            onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
            width: 70,
          },
          {
            title: '评审说明',
            dataIndex: 'remarks',
            align: 'left',
          },
          {
            title: '附件',
            dataIndex: 'sys_files',
            width: 200,
            render: (_: any, record: any) => {
              return record?.sys_files?.length ? (
                <ShowFileList data={record.sys_files || []} listType="text" />
              ) : (
                '-'
              );
            },
          },
          {
            title: '评审状态',
            dataIndex: 'review_status_name',
            align: 'left',
            width: 100,
          },
        ]}
      />
    </ModalForm>
  );
};
