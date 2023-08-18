import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubMsg } from '@/utils/pubConfig';
import Detail from './Detail';
import { auditLogPage } from '@/services/base';
import { useState } from 'react';

export default (props: any) => {
  const { _ref } = props;
  const [isModalVisible, setIsModalVisible] = useState<any>(false);
  const [businessId, setBusinessId] = useState<any>(false);
  const [businessTypeString, businessTypeStringSet] = useState<string>('');
  _ref.current = {
    visibileChange: (visible: any, id: any, businessType: string = '') => {
      setBusinessId(id);
      businessTypeStringSet(businessType);
      setTimeout(() => {
        setIsModalVisible(visible);
      }, 100);
    },
  };
  return (
    <ModalForm
      title={props?.title || '操作日志'}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      visible={isModalVisible}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        onCancel: () => {
          setIsModalVisible(false);
        },
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
          const postData = {
            businessId,
            businessType: businessTypeString,
            appName: 'liyi99-sc-scm',
          };
          const res = await auditLogPage(postData);
          if (res?.code != '0') {
            pubMsg(res?.message);
          }
          return {
            data: res?.data.map((v: any, i: number) => ({ ...v, index: i + 1 })) || [],
            success: true,
            total: res?.data?.total || 0,
          };
        }}
        params={businessId}
        options={false}
        bordered
        size="small"
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        pagination={false}
        scroll={{ y: 'calc(70vh - 80px)' }}
        search={false}
        columns={[
          {
            title: '序号',
            dataIndex: 'index',
            align: 'center',
            width: 60,
          },
          {
            title: '类型',
            dataIndex: 'businessType',
            align: 'left',
          },
          {
            title: '备注',
            dataIndex: 'remark',
            align: 'left',
            ellipsis: true,
          },
          {
            title: '操作人',
            dataIndex: 'createName',
            align: 'left',
          },
          {
            title: '操作时间',
            dataIndex: 'createTime',
            align: 'left',
          },
          {
            title: '操作人IP',
            dataIndex: 'requestIp',
            align: 'left',
          },
          // {
          //   title: '备注',
          //   dataIndex: 'operationText',
          //   align: 'left',
          //   width: 400,
          //   render: (_: any, record: any) => {
          //     return record?.auditFieldLogs?.length
          //       ? record?.auditFieldLogs.map((v: any) => (
          //           <div key={v.id}>
          //             {`${v.propertyName}由【${v.beforeValue}】修改成【${v.afterValue}】`}
          //           </div>
          //         ))
          //       : '-';
          //   },
          // },
          {
            title: '日志详情',
            key: 'option',
            width: 80,
            align: 'left',
            valueType: 'option',
            fixed: 'right',
            className: 'wrap',
            render: (text: any, record: any) => {
              return [
                <Detail
                  key="detail"
                  trigger="详情"
                  auditLogId={record.id}
                  createId={record.createId}
                />,
              ];
            },
          },
        ]}
      />
    </ModalForm>
  );
};
