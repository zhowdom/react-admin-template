import type { ProFormInstance, ProColumns } from '@ant-design/pro-components';
import {
  ProTable,
  EditableProTable,
  ModalForm,
  ProFormDatePicker,
  ProFormText,
} from '@ant-design/pro-components';
import { Col, Form, Row, Space } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import * as api from '@/services/pages/stockManager';
import { pubConfig, pubMsg, pubModal, pubRequiredRule } from '@/utils/pubConfig';

// 1.国内港口入库
const InnerTable: React.FC<{
  value: any[];
  onChange: any;
  form: any;
}> = ({ value, onChange, form }) => {
  const [specificationList, specificationListSet] = useState(value);
  const columns: ProColumns<any>[] = [
    {
      title: (
        <span>
          箱规
          <br />
          (每箱数量)
        </span>
      ),
      dataIndex: 'pics',
      align: 'center',
      width: 110,
      readonly: true,
    },
    {
      title: '箱数',
      dataIndex: 'num',
      align: 'center',
      width: 110,
      readonly: true,
    },
    {
      title: '国内收货箱数',
      dataIndex: 's_num',
      align: 'center',
      width: 110,
      valueType: 'digit',
      fieldProps: (f, { entity }) => ({
        min: 0,
        max: entity.num,
        precision: 0,
      }),
      formItemProps: {
        rules: [pubRequiredRule],
      },
    },
    {
      title: '发货数量',
      dataIndex: 'picsMultipleNum',
      align: 'center',
      width: 110,
      editable: false,
      render: (_: any, record: any) => record.pics * record.num,
    },
  ];

  return (
    <div className="p-table-inTable-content">
      {' '}
      <EditableProTable
        rowKey={'id'}
        bordered
        cardProps={{ style: { padding: 0 } }}
        showHeader={false}
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        style={{ wordBreak: 'break-all' }}
        recordCreatorProps={false}
        columns={columns}
        value={specificationList}
        editable={{
          form,
          type: 'multiple',
          editableKeys: value.map((item: any) => item.id),
          onValuesChange: (record: any, recordList) => {
            specificationListSet(recordList);
            onChange(recordList);
          },
        }}
      />
    </div>
  );
};

const PortStorageModal: React.FC<{ dataSource: any; reload: any }> = ({ dataSource, reload }) => {
  const formRef = useRef<ProFormInstance>(); // 弹框form
  const [editableFormRef] = Form.useForm();
  const [spec, specSet] = useState([]);
  const columns: any[] = [
    {
      title: '计划编号',
      dataIndex: 'delivery_plan_no',
      align: 'center',
      width: 120,
      render: (_: any, record: any) => record.delivery_plan_nos || record.delivery_plan_no,
    },
    {
      title: '入库单号',
      dataIndex: 'order_no',
      align: 'center',
      width: 120,
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      align: 'center',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      width: 120,
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      width: 120,
    },
    /*组合表格开始*/
    {
      title: (
        <span>
          箱规
          <br />
          (每箱数量)
        </span>
      ),
      dataIndex: 'orderSkuList',
      width: 110,
      align: 'center',
      onCell: () => ({ colSpan: 4, style: { padding: 0 } }),
      className: 'p-table-inTable noBorder',
      render: (val: any) => {
        return (
          <InnerTable
            value={val[0]?.specificationList
              ?.filter((item: any) => item.num)
              .map((k: any) => ({
                ...k,
                order_no: val[0]?.order_no,
              }))}
            onChange={specSet}
            form={editableFormRef}
          />
        );
      },
    },
    {
      title: '箱数',
      width: 110,
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '国内收货箱数',
      dataIndex: 'arrival_num',
      width: 110,
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '发货数量',
      width: 110,
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    /*组合表格结束*/
  ];
  return (
    <ModalForm
      layout={'horizontal'}
      title="国内港口入库"
      width={'90%'}
      trigger={<a type={'link'}>{'国内港口入库'}</a>}
      onFinish={async (values: any) => {
        editableFormRef
          .validateFields()
          .then(() => {
            const postData = spec.map((item: any) => ({
              s_id: item.id,
              order_no: dataSource.order_no,
              s_num: item.s_num,
              pics: item.pics,
              arrival_time: values.arrival_time,
            }));
            pubModal(
              <Space>
                <span>到港时间: {values.arrival_time}</span>
              </Space>,
              '确认提交信息?',
            )
              .then(async () => {
                const res = await api.portStorage(postData);
                if (res.code == pubConfig.sCode) {
                  pubMsg(res?.message, 'success');
                  if (typeof reload === 'function') reload();
                  return true;
                } else {
                  pubMsg(`提交失败: ${res.message}`);
                  return false;
                }
              })
              .catch(() => {
                console.log('点击了取消');
              });
          })
          .catch(() => {
            pubMsg('填写内容校验未通过, 请检查');
          });
      }}
      initialValues={{ data: [] }}
      formRef={formRef}
      onVisibleChange={async (visible: boolean) => {
        if (!visible) {
          formRef?.current?.resetFields();
        }
      }}
    >
      <ProTable
        size={'small'}
        columns={columns}
        dataSource={[dataSource]}
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        rowKey={'id'}
        bordered
        scroll={{ x: 1000 }}
        style={{ marginBottom: '12px' }}
      />
      <Row gutter={24}>
        <Col span={8}>
          <ProFormDatePicker
            label={'到港时间'}
            name={'arrival_time'}
            rules={[pubRequiredRule]}
            initialValue={moment()}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            hidden
            label={'入库单编号'}
            name={'order_no'}
            initialValue={dataSource.order_no}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};
export default PortStorageModal;
