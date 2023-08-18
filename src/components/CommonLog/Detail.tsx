import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { treeByOperationId } from '@/services/pages/stockManager';
import ShowFileList from '../PubShowFiles/ShowFileList';
import UploadFileList from '../PubUpload/UploadFileList';
import TreeNode from './TreeNode';

export default (props: any) => {
  const { id } = props;
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.85)',
  };
  // 递归数据
  const handleTree = (data: any) => {
    data.forEach((v: any, i: number) => {
      const children1 =
        v.children ?? v.children1 ? JSON.parse(JSON.stringify(v.children ?? v.children1)) : [];
      delete v.children;
      v.index = i + 1;
      children1.map((a: any) => {
        if (a?.children?.length) {
          a.children1 = handleTree(a?.children);
          delete a.children;
        }
      });
      v.children1 = children1;
    });
    return data;
  };

  return (
    <ModalForm
      title="操作日志详情"
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
          const res = await treeByOperationId({
            id,
            current_page: params?.current,
            page_size: params?.pageSize,
          });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          }
          return {
            data: handleTree(res.data) || [],
            success: true,
            total: res?.data?.length || 0,
          };
        }}
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        options={false}
        bordered
        size="small"
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
            width: 70,
          },
          {
            title: '操作内容',
            dataIndex: 'item_name',
            align: 'left',
            width: 130,
          },

          {
            title: '操作前',
            dataIndex: 'before_value',
            align: 'left',
            render: (dom: any, record: any) => {
              if (record.children1?.length) {
                return <TreeNode data={record} fieldkey={'before_value'} level={1} />;
              } else {
                switch (record.item_type) {
                  case 1:
                    return (
                      <pre style={preStyle}>
                        {record?.before_value || record?.before_value == '0'
                          ? record?.before_value
                          : '空'}
                      </pre>
                    );
                  case 2:
                    return (
                      <ShowFileList
                        data={record.before_value || []}
                        isShowDownLoad={true}
                        listType="text-line"
                      />
                    );
                  case 3:
                    <UploadFileList
                      listType="picture-card"
                      defaultFileList={record.before_value || []}
                      accept={['.png,.jpg,.jpeg']}
                      acceptType={['png', 'jpg', 'jpeg']}
                    />;
                  case 4:
                    return (
                      <pre style={preStyle}>
                        {record?.before_value || record?.before_value == '0'
                          ? record?.before_value
                          : '空'}
                      </pre>
                    );
                  default:
                    return (
                      <pre style={preStyle}>
                        {record?.before_value || record?.before_value == '0'
                          ? record?.before_value
                          : '空'}
                      </pre>
                    );
                }
              }
            },
          },
          {
            title: '操作后',
            dataIndex: 'after_value',
            align: 'left',
            render: (dom: any, record: any) => {
              if (record.children1?.length) {
                return <TreeNode data={record} fieldkey={'after_value'} level={1} />;
              } else {
                switch (record.item_type) {
                  case 1:
                    return (
                      <pre
                        style={{
                          ...preStyle,
                          color: record.before_value != record.after_value ? '#d46b08' : '',
                        }}
                      >
                        {record?.after_value || record?.after_value == '0'
                          ? record?.after_value
                          : '空'}
                      </pre>
                    );
                  case 2:
                    return (
                      <ShowFileList
                        data={record.after_value || []}
                        isShowDownLoad={true}
                        listType="text-line"
                      />
                    );
                  case 3:
                    <UploadFileList
                      listType="picture-card"
                      defaultFileList={record.after_value || []}
                      accept={['.png,.jpg,.jpeg']}
                      acceptType={['png', 'jpg', 'jpeg']}
                    />;
                  case 4:
                    return (
                      <pre
                        style={{
                          ...preStyle,
                          color: record.before_value != record.after_value ? '#d46b08' : '',
                        }}
                      >
                        {record?.after_value || record?.after_value == '0'
                          ? record?.after_value
                          : '空'}
                      </pre>
                    );
                  default:
                    return (
                      <pre
                        style={{
                          ...preStyle,
                          color: record.before_value != record.after_value ? '#d46b08' : '',
                        }}
                      >
                        {record?.after_value || record?.after_value == '0'
                          ? record?.after_value
                          : '空'}
                      </pre>
                    );
                }
              }
            },
          },
        ]}
      />
    </ModalForm>
  );
};
