import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ModalForm, ProFormDateRangePicker, ProFormText } from '@ant-design/pro-form';
import React, { useRef, useState } from 'react';

const CheckFileListTable: React.FC<{
  value?: any;
  onChange?: any;
  readonly?: boolean;
  form: any;
  _ref: any;
}> = ({ value, onChange, readonly, form, _ref }: any) => {
  const formRef = useRef<ProFormInstance>();
  const defaultData = value || [];
  const [data, setData] = useState<any[]>([...defaultData]);
  const [dataDeleted, setDataDeleted] = useState<any[]>([]);
  // 上传回调
  const handleUpload = async (files: any[]) => {
    formRef.current?.setFieldsValue({ sysFiles: files });
  };
  _ref.current = {
    setData: (data1: any) => {
      setData(data1);
    },
  };
  // table配置
  const columns: ProColumns<any>[] = [
    {
      title: '证书名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '证书编号',
      dataIndex: 'report_no',
      align: 'center',
    },
    {
      title: '附件',
      dataIndex: 'sysFiles',
      align: 'center',
      render: (dom, entity) => {
        return entity?.sysFiles && entity.sysFiles[0] ? (
          <a download href={entity.sysFiles[0].access_url}>
            {entity.sysFiles[0].name}
          </a>
        ) : (
          ''
        );
      },
    },
    {
      title: '生效时间',
      dataIndex: 'start_date',
      align: 'center',
      valueType: 'date',
    },
    {
      title: '失效时间',
      dataIndex: 'end_date',
      align: 'center',
      valueType: 'date',
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 100,
      render: (_, row) => [
        readonly ? null : (
          <Popconfirm
            key="delete"
            title="确认删除"
            onConfirm={async () => {
              const temp = data.map((item: any) => {
                if (item.id == row.id) return { ...item, delete: 1 };
                return item;
              });
              setData(temp.filter((item) => !item.delete));
              setDataDeleted(temp.filter((item) => !!item.delete));
              onChange(temp);
              form.current.validateFields(['authorizeReportList']);
            }}
          >
            <a>删除</a>
          </Popconfirm>
        ),
      ],
    },
  ];
  return (
    <ProTable
      className={'p-table-0'}
      style={{ maxWidth: '1200px' }}
      rowKey="id"
      columns={columns}
      dataSource={data}
      pagination={false}
      search={false}
      options={false}
      toolbar={{
        actions: [
          <ModalForm<any>
            formRef={formRef}
            key="modalP"
            title="添加产品文档"
            trigger={
              <Button size={'small'} type="primary" disabled={readonly}>
                <PlusOutlined />
                添加产品文档
              </Button>
            }
            onFinish={async (values) => {
              values.start_date = values.date[0];
              values.end_date = values.date[1];
              values.id = Date.now();
              const temp = [...data, values];
              setData(temp);
              onChange([...temp, ...dataDeleted]);
              form.current.validateFields(['authorizeReportList']);
              formRef?.current?.resetFields();
              return true;
            }}
          >
            <ProForm.Group>
              <ProFormText
                width="md"
                name="name"
                label="附件名称"
                fieldProps={{ maxLength: 30 }}
                rules={[{ required: true, message: '必填项' }]}
              />
              <ProFormText
                width="md"
                name="report_no"
                label="附件编号"
                fieldProps={{ maxLength: 40 }}
                rules={[{ required: true, message: '必填项' }]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormDateRangePicker
                width="md"
                name="date"
                label="生效时间"
                fieldProps={{ format: 'YYYY-MM-DD' }}
                rules={[{ required: true, message: '必填项' }]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProForm.Item
                label="文档:"
                name="sysFiles"
                extra="支持常见文件格式: office文档, pdf等, 只能上传单个, 不得超过20M"
                rules={[{ required: true, message: '必填项' }]}
              >
                <UploadFileList
                  fileBack={handleUpload}
                  required
                  businessType="PRODUCT_AUTHORIZE_REPORT"
                  acceptMessage="上传格式不对，请检查上传文件"
                  maxSize="20"
                  maxCount="1"
                />
              </ProForm.Item>
            </ProForm.Group>
          </ModalForm>,
        ],
      }}
    />
  );
};
export default CheckFileListTable;
