import { Modal, Button, Table, Space, Alert } from 'antd';
import {
  ProForm,
  ProFormSelect,
  ProFormTextArea,
  StepsForm,
  ProFormRadio,
  ProFormDependency,
} from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import { pubConfig, pubMsg, pubRequiredRule, pubMyFilter, pubFilter } from '@/utils/pubConfig';
import type { FormInstance } from '@ant-design/pro-components';
import { transferDelivery, getVendorList } from '@/services/pages/order/delivery-order';
import { optionsDeliveryWarehouse } from './index';

const optionsIdType = [
  { label: 'ERP订单号', value: 'ERP_NO' },
  { label: '平台订单号', value: 'PLATFORM_NO' },
  { label: '配送单号', value: 'DELIVERY_NO' },
];

const Component: React.FC<{
  reload: any;
  dicList: any;
  open: any;
  openSet: any;
  platformWarehouseCode: string;
  selectedData?: Record<string, any>;
  selectedRowsPage?: Record<string, any>[];
}> = ({
  dicList,
  reload,
  open,
  openSet,
  platformWarehouseCode,
  selectedData = {},
  selectedRowsPage = [],
}) => {
  const formRefOne: any = useRef<FormInstance>();
  const [current, currentSet] = useState<number>(0);
  const [inputData, inputDataSet] = useState<any[]>([]);
  const [confirmData, confirmDataSet] = useState<any>({});
  const [resultData, resultDataSet] = useState<any>({});
  const [selectedRowKeys, selectedRowKeysSet] = useState<any>([]);
  const validInputData = useMemo(() => [...new Set(inputData)], [inputData]);
  const [optionsWarehouse, optionsWarehouseSet] = useState<any[]>([]);
  const commonColumns = [
    {
      title: 'ERP订单号',
      dataIndex: 'erpNo',
      width: 140,
    },
    {
      title: '平台订单号',
      dataIndex: 'platformNo',
      width: 180,
    },
    {
      title: '配送单号',
      dataIndex: 'deliveryCode',
      width: 180,
    },
    {
      title: '原发货仓',
      dataIndex: 'oldWarehouseName',
      width: 90,
    },
    {
      title: '转入发货仓',
      dataIndex: 'newWarehouseName',
      width: 90,
    },
  ];
  const reset = () => {
    inputDataSet([]);
    confirmDataSet({});
    resultDataSet({});
    selectedRowKeysSet([]);
    currentSet(0);
    formRefOne.current?.resetFields();
  };
  const initialIds = useMemo(() => {
    if (selectedData?.deliveryCode) {
      return selectedData.deliveryCode;
    } else if (selectedRowsPage.length) {
      return selectedRowsPage.map((item) => item.deliveryCode).join('\n');
    }
    return '';
  }, [selectedRowsPage, selectedData]);
  return (
    <StepsForm
      current={current}
      onCurrentChange={currentSet}
      onFinish={async () => {
        openSet(false);
        reset();
        return true;
      }}
      stepsFormRender={(dom, submitter) => {
        let submitterFormat: any = submitter;
        if (submitterFormat && submitterFormat?.length > 1 && submitterFormat[1].key == 'submit') {
          submitterFormat = [
            <Button
              key={'close'}
              onClick={() => {
                reset();
                openSet(false);
              }}
              type={'primary'}
            >
              关闭
            </Button>,
          ];
        } else {
          submitterFormat = [
            <Button
              key={'cancel'}
              onClick={() => {
                reset();
                openSet(false);
              }}
            >
              取消
            </Button>,
            submitter,
          ];
        }
        return (
          <Modal
            title={`[${pubFilter(
              dicList?.ORDER_DELIVERY_WAREHOUSE || {},
              platformWarehouseCode,
            )}]转仓`}
            width={current == 0 ? 999 : 1400}
            open={open}
            onCancel={() => {
              openSet(false);
              reset();
            }}
            footer={submitterFormat}
            destroyOnClose
            maskClosable={false}
          >
            {dom}
          </Modal>
        );
      }}
      formProps={{
        layout: 'horizontal',
        grid: true,
        labelAlign: 'right',
        labelCol: { flex: '0 0 90px' },
      }}
    >
      <StepsForm.StepForm
        name="form"
        title={`选择需转仓配送单并选择转入仓库`}
        formRef={formRefOne}
        onFinish={async (values) => {
          if (!validInputData?.length) {
            pubMsg(`请输入单号`);
            return;
          }
          const res = await transferDelivery({
            ...values,
            step: 'CHECK',
            currentPlatformWarehouseCode: platformWarehouseCode,
          });
          if (res?.code == pubConfig.sCodeOrder) {
            confirmDataSet(res);
            const rows: any[] = res?.data.filter((item: any) => item.valid);
            selectedRowKeysSet(rows.map((item: any) => item.deliveryCode));
            return true;
          } else {
            pubMsg(res?.message);
            return false;
          }
        }}
      >
        <ProForm.Group colProps={{ span: 12 }}>
          <ProFormRadio.Group
            label="单据类型"
            name={'idType'}
            radioType={'button'}
            options={optionsIdType}
            rules={[pubRequiredRule]}
            readonly={!!selectedData?.deliveryCode}
            initialValue={'DELIVERY_NO'}
          />
          <ProFormDependency name={['idType']}>
            {({ idType }) => (
              <ProFormTextArea
                label={pubMyFilter(optionsIdType, idType)}
                name={'ids'}
                rules={[
                  pubRequiredRule,
                  {validator: () => validInputData.length > 100 ? Promise.reject('每次最多100条'):Promise.resolve()}
                ]}
                readonly={!!selectedData?.deliveryCode}
                initialValue={initialIds}
                transform={(val) => {
                  if (!(val && val.trim()) && idType) {
                    return val;
                  }
                  const codes = val?.split('\n').filter((item: any) => item?.trim());
                  inputDataSet(codes);
                  // 去重
                  const ids = [...new Set(codes)];
                  return { ids };
                }}
                fieldProps={{
                  rows: 10,
                  onChange: (e) => {
                    const codes = e?.target?.value?.split('\n').filter((item: any) => item?.trim());
                    inputDataSet(codes);
                  },
                }}
                extra={
                  selectedData?.deliveryCode ? null : (
                    <Space className={inputData.length > 100 ? 'text-red' : ''}>
                      <span>当前输入: {`${inputData.length}/100条`}</span>
                      {validInputData.length == inputData.length ? null : (
                        <span>重复: {inputData.length - validInputData.length}条</span>
                      )}
                    </Space>
                  )
                }
              />
            )}
          </ProFormDependency>
        </ProForm.Group>
        <ProForm.Group colProps={{ span: 12 }}>
          <ProFormRadio.Group
            label="发货平台"
            name={'newPlatformWarehouseCode'}
            radioType={'button'}
            valueEnum={dicList?.ORDER_DELIVERY_WAREHOUSE || {}}
            rules={[pubRequiredRule]}
            fieldProps={{
              onChange: async (e) => {
                formRefOne.current?.setFieldsValue({
                  storageId: null,
                  storageName: '',
                });
                const res = await optionsDeliveryWarehouse({ platform_code: e.target.value });
                if (res) optionsWarehouseSet(res);
              },
            }}
          />
          <ProFormDependency name={['newPlatformWarehouseCode']}>
            {({ newPlatformWarehouseCode }) => {
              if (newPlatformWarehouseCode) {
                if (newPlatformWarehouseCode == 'VENDOR') {
                  return (
                    <ProFormSelect
                      label={'供应商'}
                      name={'storageId'}
                      rules={[pubRequiredRule]}
                      fieldProps={{
                        labelInValue: true,
                        showSearch: true,
                      }}
                      request={async (params) => {
                        const res = await getVendorList({
                          ...params,
                          page_size: 999,
                          current_page: 1,
                        });
                        if (res?.code == pubConfig.sCode) {
                          return res.data?.records?.map((item: any) => ({
                            label: item.name,
                            value: item.id,
                          }));
                        }
                        return [];
                      }}
                      transform={(val) => {
                        return {
                          storageId: val?.value,
                          storageName: val?.label,
                        };
                      }}
                    />
                  );
                }
                return (
                  <ProFormSelect
                    label={'转入仓库'}
                    name={'storageId'}
                    rules={[pubRequiredRule]}
                    fieldProps={{
                      labelInValue: true,
                      options: optionsWarehouse,
                    }}
                    transform={(val) => {
                      return {
                        storageId: val?.value,
                        storageName: val?.label,
                      };
                    }}
                  />
                );
              }
              return null;
            }}
          </ProFormDependency>
          <ProFormSelect
            label="转仓原因"
            name={'reason'}
            valueEnum={dicList?.ORDER_DELIVERY_TRANSFER_REASON || {}}
            rules={[pubRequiredRule]}
          />
          <ProFormTextArea
            label={'转仓备注'}
            name={'remark'}
            fieldProps={{ rows: 4 }}
            rules={[pubRequiredRule]}
          />
        </ProForm.Group>
      </StepsForm.StepForm>
      <StepsForm.StepForm
        name="confirm"
        title="确认单据"
        onFinish={async () => {
          if (!selectedRowKeys?.length) {
            pubMsg('未勾选或无任何可用数据项, 无法提交');
            return;
          }
          const stepOneData = formRefOne.current?.getFieldsFormatValue();
          const res = await transferDelivery({
            ...stepOneData,
            idType: 'DELIVERY_NO',
            ids: selectedRowKeys,
            step: 'TRANSFER',
            currentPlatformWarehouseCode: platformWarehouseCode,
          });
          if (res?.code == pubConfig.sCodeOrder) {
            resultDataSet(res);
            if (reload) reload();
            return true;
          } else {
            pubMsg(res?.message);
            return false;
          }
        }}
      >
        <Alert
          style={{ marginBottom: 10, width: '100%' }}
          banner
          type={'info'}
          message={confirmData?.message}
        />
        {selectedRowKeys.length ? (
          <Alert
            style={{ marginBottom: 10, width: '100%' }}
            banner
            type={'success'}
            message={`已选 ${selectedRowKeys.length} 条数据项`}
          />
        ) : null}
        <Table
          size={'small'}
          scroll={{ y: 400, x: 1200 }}
          pagination={{showTotal: (val) => `共${val}条`}}
          bordered
          rowKey={(record: any) => record.deliveryCode}
          columns={[
            ...commonColumns,
            {
              title: '校验结果',
              dataIndex: 'result',
              width: 80,
            },
            {
              title: '原因',
              dataIndex: 'reason',
            },
          ]}
          dataSource={confirmData?.data || []}
          rowSelection={{
            fixed: 'left',
            selectedRowKeys,
            onChange: (keys: any[]) => {
              selectedRowKeysSet(keys);
            },
            getCheckboxProps: (record: any) => ({
              disabled: !record.valid,
            }),
          }}
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        name="result"
        title="调整结果"
        onFinish={async () => {
          return true;
        }}
      >
        <Alert
          style={{ marginBottom: 10, width: '100%' }}
          banner
          type={'info'}
          message={resultData.message}
        />
        <Table
          size={'small'}
          scroll={{ y: 400 }}
          bordered
          rowKey={(record: any) => record.id + record.skuCode}
          columns={[
            ...commonColumns,
            {
              title: '转仓结果',
              dataIndex: 'result',
              width: 80,
            },
            {
              title: '原因',
              dataIndex: 'reason',
            },
          ]}
          pagination={false}
          dataSource={resultData.data}
        />
      </StepsForm.StepForm>
    </StepsForm>
  );
};
export default Component;
