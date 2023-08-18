import { PageContainer } from '@ant-design/pro-layout';
import { Access, connect, useAccess } from 'umi';
import React, { useRef, useState } from 'react';
import { Button, Col, Popconfirm, Row, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import type { TableListItem } from '@/types/productLine';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { deleteById, getList, insert, terminate, updateById } from '@/services/pages/productLine';
import { acceptTypes, pubConfig, pubMsg } from '@/utils/pubConfig';
import Product from '@/components/PubForm/ProductLine';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import ApprovalHistoryModal from '@/components/PubAuditShow/ApprovalHistoryModal';
import PubDingDept from '@/components/PubForm/PubDingDept';
import moment from 'moment';

type submitDataType = {
  id?: string;
  business_scope: string;
  name: string;
};
const requiredRule = { required: true, message: '必填项' };

// 新增/编辑弹框
const EditModal: React.FC<{ data?: any; reload: any }> = ({ data, reload }: any) => {
  const formRef = useRef<ProFormInstance>();
  const [submitting, submittingSet] = useState(false);
  const handleUpload = async (files: any = [], prop: string) => {
    // const temp = files.filter((item: any) => !item.delete); // 过滤已删除的文件
    formRef.current?.setFieldsValue({ [prop]: files });
  };
  return (
    <ModalForm<submitDataType>
      formRef={formRef}
      title={data?.id ? '编辑产品线(行业立项)' : '新增产品线(行业立项)'}
      trigger={
        data?.id ? (
          <a>重新提交</a>
        ) : (
          <Button ghost type="primary" icon={<PlusOutlined />}>
            新增产品线(行业立项)
          </Button>
        )
      }
      labelAlign="right"
      labelCol={{ span: 4 }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      style={{ paddingRight: '15px' }}
      onFinish={async (values: submitDataType) => {
        if (submitting) return;
        submittingSet(true);
        PubDingDept(
          async (dId: any) => {
            let api = insert;
            if (values.id) api = updateById;
            const res = await api(values, dId);
            if (res?.code == pubConfig.sCode) {
              pubMsg(res?.message, 'success');
              if (typeof reload === 'function') reload();
              formRef?.current?.resetFields();
              submittingSet(false);
              return true;
            } else {
              pubMsg(res?.message);
              submittingSet(false);
              return false;
            }
          },
          (err: any) => {
            submittingSet(false);
            console.log(err);
          },
        );
      }}
      initialValues={data || { parent_id: 0, business_scope: 'CN' }}
    >
      <ProFormText hidden noStyle name="id" />
      <ProFormText hidden noStyle name="parent_id" />
      <Row>
        <Col span={12}>
          <ProFormSelect
            labelCol={{
              span: 8,
            }}
            label={'产品线类型'}
            allowClear={false}
            name={'business_scope'}
            rules={[requiredRule]}
            options={[
              {
                value: 'CN',
                label: '国内',
              },
              {
                value: 'IN',
                label: '跨境',
              },
            ]}
          />
        </Col>
        <Col span={12}>
          <ProFormText
            labelCol={{
              span: 8,
            }}
            name="name"
            label="产品线名称"
            rules={[requiredRule]}
          />
        </Col>
      </Row>
      <ProFormDigit
        wrapperCol={{
          span: 6,
        }}
        name="annual_sales"
        min={0}
        fieldProps={{ precision: 0 }}
        label="新线市场规模"
        rules={[requiredRule]}
      />
      <ProFormTextArea
        name="reason"
        fieldProps={{ rows: 4 }}
        label="新增理由"
        rules={[requiredRule]}
      />
      <ProForm.Item
        label="附件"
        name="sys_files"
        extra={'支持常用文档和图片以及压缩包格式文件，单个不能超过50M'}
        style={{ marginTop: '20px' }}
        rules={[requiredRule]}
      >
        <UploadFileList
          fileBack={(files: any) => handleUpload(files, 'sys_files')}
          required
          defaultFileList={data?.sys_files}
          businessType="VENDOR_GROUP"
          accept={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
          acceptType={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
          acceptMessage="上传格式不对，请检查上传文件"
          maxSize="50"
          maxCount="5"
        />
      </ProForm.Item>
      <ProFormDatePicker
        name="estimated_online_time"
        label="预计上线时间"
        wrapperCol={{
          span: 6,
        }}
        fieldProps={{
          disabledDate: (current: any) => current && current < moment().add(-1, 'day'),
        }}
      />
    </ModalForm>
  );
};

const Page: React.FC<any> = ({ common }: any) => {
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const res = await getList({
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      business_scope: params?.category_data?.[0] || null, //业务范畴
      id: params?.category_data?.[1] || null,
    });
    // 保存主产品线
    // dispatch({
    //   type: 'productLine/setProdLineAction',
    //   payload: res?.data || [],
    // });

    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.code == pubConfig.sCode ? res?.data?.records : [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const actionRef = useRef<ActionType>();
  // 删除
  const removeItem = async (ids: any) => {
    const res = await deleteById({ ids });
    if (res?.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      actionRef?.current?.reload();
      return true;
    } else {
      pubMsg(res?.message);
    }
    return true;
  };
  // 撤销
  const terminateItem = async (id: any) => {
    const res = await terminate({ id });
    if (res?.code == pubConfig.sCode) {
      pubMsg(res?.message, 'success');
      actionRef?.current?.reload();
      return true;
    } else {
      pubMsg(res?.message);
    }
    return true;
  };
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '产品线',
      dataIndex: 'category_data',
      hideInTable: true,
      order: 10,
      renderFormItem: (_, rest, form) => {
        return (
          <Product
            back={(v: any) => {
              form.setFieldsValue({ category_data: v });
            }}
          />
        );
      },
    },
    {
      title: '产品线名称',
      dataIndex: 'name',
      hideInSearch: true,
    },
    {
      title: '产品线类型',
      dataIndex: 'business_scope',
      align: 'center',
      hideInSearch: true,
      valueEnum: common?.dicList?.SYS_BUSINESS_SCOPE,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      valueEnum: common?.dicList?.VENDOR_GROUP_STATUS,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
    },
    {
      title: '操作',
      key: 'option',
      align: 'center',
      valueType: 'option',
      render: (_, record: any) => (
        <Space>
          {[2, 3].includes(Number(record.status)) && access.canSee('productLine_edit') ? (
            <EditModal data={record} reload={actionRef?.current?.reload} />
          ) : null}
          {[2, 3].includes(Number(record.status)) && access.canSee('productLine_delete') ? (
            <Popconfirm
              title="确定需删除该产品线?"
              onConfirm={async () => removeItem(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a>删除</a>
            </Popconfirm>
          ) : null}
          {[1].includes(Number(record.status)) && access.canSee('productLine_edit') ? (
            <Popconfirm
              title="确定需撤销操作?"
              onConfirm={async () => terminateItem(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <a>撤销</a>
            </Popconfirm>
          ) : null}
          {access.canSee('productLine_log') ? (
            <ApprovalHistoryModal title={'审批日志'} id={record.id} />
          ) : null}
        </Space>
      ),
    },
  ];
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable<TableListItem>
        columns={columns}
        actionRef={actionRef}
        search={{
          span: 8,
          className: 'light-search-form',
          defaultCollapsed: false,
        }}
        pagination={{
          showSizeChanger: true,
        }}
        options={{ fullScreen: true, setting: false }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowKey="id"
        dateFormatter="string"
        headerTitle="产品线管理"
        toolBarRender={() => [
          <Access key="add" accessible={access.canSee('productLine_edit')}>
            <EditModal reload={actionRef?.current?.reload} />
          </Access>,
        ]}
      />
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ productLine, common }: any) => ({ productLine, common }))(
  Page,
);
export default ConnectPage;
