import { pubFilter } from '@/utils/pubConfig';
import { getUuid } from '@/utils/pubConfirm';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Popconfirm } from 'antd';
import moment from 'moment';

export default (props: any) => {
  const { dataSource, dicList, setDataSource, disabled, formRef } = props;
  // 删除
  const deleteAction = async (tempId: string) => {
    const vendorContractPayMethods = formRef.current
      ?.getFieldValue('vendorContractPayMethods')
      .filter((v: any) => v.tempId != tempId);
    setDataSource(vendorContractPayMethods);
    formRef?.current?.setFieldsValue({
      vendorContractPayMethods,
    });
  };

  const Update = (prop?: any) => {
    const { record, index } = prop;
    return (
      <ModalForm
        title={record ? '编辑' : '添加'}
        trigger={
          record ? (
            <a>编辑</a>
          ) : (
            <Button
              type="dashed"
              style={{
                width: '440px',
                marginLeft: '185px',
                display: disabled ? 'none' : 'block',
              }}
              icon={<PlusOutlined />}
            >
              添加时间段
            </Button>
          )
        }
        className="item10 full"
        labelAlign="right"
        labelCol={{ flex: '110px' }}
        wrapperCol={{ flex: '300px' }}
        layout="horizontal"
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
        }}
        width={550}
        initialValues={
          record
            ? {
                ...record,
                before_date:
                  index == 0 ? undefined : dataSource?.length && dataSource[index - 1].assert_time,
                last_date:
                  !dataSource?.length || index == dataSource?.length - 1
                    ? undefined
                    : dataSource[index + 1].assert_time,
              }
            : { before_date: dataSource?.length && dataSource[dataSource.length - 1].assert_time }
        }
        onFinish={async (values: any) => {
          const data = JSON.parse(JSON.stringify(values));
          data.assert_time =
            data.assert_time.indexOf('00:00:00') > -1
              ? data.assert_time
              : data.assert_time + ' 00:00:00';
          data.tempId = data.tempId || getUuid();
          const data1 = record
            ? dataSource.map((v: any) => {
                return v.tempId === data?.tempId ? data : v;
              })
            : [...dataSource, data];
          setDataSource(data1);
          formRef?.current?.setFieldsValue({
            vendorContractPayMethods: data1,
          });
          return true;
        }}
      >
        <ProFormDatePicker name="before_date" label="before_date" hidden />
        <ProFormDatePicker name="last_date" label="last_date" hidden />
        <ProFormDatePicker name="tempId" label="tempId" hidden />
        <ProFormDatePicker
          name="assert_time"
          label="生效时间"
          placeholder="请选择生效时间"
          rules={[
            { required: true, message: '请选择生效时间' },
            ({ getFieldValue }: any) => ({
              validator(_: any, value: any) {
                if (
                  value &&
                  getFieldValue('before_date') &&
                  new Date(getFieldValue('before_date')).getTime() >=
                    (typeof value == 'string'
                      ? new Date(value).getTime()
                      : new Date(value.format('YYYY-MM-DD 00:00:00')).getTime())
                ) {
                  return Promise.reject(new Error('生效时间不能早于上一阶段结束时间'));
                }
                if (
                  value &&
                  getFieldValue('last_date') &&
                  new Date(getFieldValue('last_date')).getTime() <=
                    (typeof value == 'string'
                      ? new Date(value).getTime()
                      : new Date(value.format('YYYY-MM-DD 00:00:00')).getTime())
                ) {
                  return Promise.reject(new Error('生效时间不能大于下一阶段结束时间'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        />
        <ProFormSelect
          name="pay_method"
          label="结算方式"
          valueEnum={dicList.VENDOR_PAYMENT_METHOD}
          rules={[{ required: true, message: '请选择结算方式' }]}
          placeholder="请选择结算方式"
        />
        <ProFormDependency name={['pay_method']}>
          {({ pay_method }) => {
            return ['8', '9', '10', '11', '12', '13'].includes(pay_method) ? (
              <ProFormDigit
                name="prepayment_percentage"
                label="预付比例"
                placeholder="请输入预付比例"
                min={0}
                max={100}
                fieldProps={{ precision: 2, addonAfter: '%' }}
                rules={[{ required: true, message: '请输入预付比例' }]}
              />
            ) : (
              ''
            );
          }}
        </ProFormDependency>
      </ModalForm>
    );
  };
  const columns: any[] = [
    {
      title: '生效时间',
      dataIndex: 'assert_time',
      align: 'left',
      width: 160,
      render: (text: any, record: any) => {
        return (
          <span>{record.assert_time ? moment(record.assert_time).format('YYYY-MM-DD') : '-'}</span>
        );
      },
    },
    {
      title: '结算方式',
      dataIndex: 'pay_method',
      align: 'left',
      render: (_: any, record: any) => {
        if (['8', '9', '10', '11', '12', '13'].includes(record?.pay_method)) {
          return record.prepayment_percentage
            ? pubFilter(dicList?.VENDOR_PAYMENT_METHOD, record?.pay_method)?.replace(
                '+',
                `${record.prepayment_percentage}%+`,
              ) ?? '-'
            : pubFilter(dicList?.VENDOR_PAYMENT_METHOD, record?.pay_method) ?? '-';
        }
        return pubFilter(dicList?.VENDOR_PAYMENT_METHOD, record?.pay_method) ?? '-';
      },
    },
    {
      title: '操作',
      key: 'option',
      align: 'left',
      fixed: 'right',
      valueType: 'option',
      className: 'wrap',
      hideInTable: disabled,
      width: 120,
      render: (_: any, record: any, index: number) => {
        return [
          <Update key="edit" record={record} index={index} />,
          <Popconfirm
            key="delete"
            title="确定删除吗?"
            onConfirm={async () => deleteAction(record.tempId)}
            okText="确定"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>,
        ];
      },
    },
  ];

  return (
    <>
      <ProForm.Item
        className="ml185"
        label=""
        name="vendorContractPayMethods"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 18 }}
        rules={[{ required: true, message: '请添加时间段' }]}
      >
        <ProTable
          bordered
          cardProps={{ bodyStyle: { padding: '0 0 10px 0' } }}
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          search={false}
          options={false}
          style={{ width: '440px', marginLeft: disabled ? '145px' : '185px' }}
          pagination={false}
        />
        <Update key="add" />
      </ProForm.Item>
    </>
  );
};
