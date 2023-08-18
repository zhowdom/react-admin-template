import { Modal, Button, Table, Space, Alert, Cascader } from 'antd';
import {
  ProForm,
  ProFormSelect,
  ProFormTextArea,
  StepsForm,
  ProFormRadio,
  ProFormDependency,
  ProFormCascader,
} from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import {
  batchUpdateGoodSkuWarehouse,
  batchUpdateGoodSkuWarehouseArea,
  isVerificationSameVendor,
} from '@/services/pages/shipment';
import { getAreas, optionsDeliveryWarehouse } from '../index';
import type { FormInstance } from '@ant-design/pro-components';
import { getList as getVendorList } from '@/services/pages/supplier';
// 批量添加发货仓
const Component: React.FC<{
  reload: any;
  dicList: any;
  type?: 'area' | undefined;
}> = ({ dicList, reload, type }) => {
  const formRef: any = useRef<FormInstance>();
  const [open, openSet] = useState(false);
  const [inputData, inputDataSet] = useState<any[]>([]);
  const [resultData, resultDataSet] = useState<any[]>([]);
  const [optionsWarehouse, optionsWarehouseSet] = useState<any[]>([]);
  const validInputData = useMemo(() => [...new Set(inputData)], [inputData]);
  const resultMessage = useMemo(() => {
    const temp = resultData.reduce(
      (result, record) => {
        if (record.errorCode == pubConfig.sCode) {
          return { ...result, success: result.success + 1 };
        } else {
          return { ...result, fail: result.fail + 1 };
        }
      },
      { success: 0, fail: 0 },
    );
    return `共${validInputData.length}个款式需调整配送${type == 'area' ? '区域' : '仓库'}，其中${
      temp.success
    }个调整成功，${temp.fail}个调整失败；`;
  }, [resultData]);
  return (
    <>
      <Button type={'primary'} onClick={() => openSet(true)}>
        {type == 'area' ? '批量调整配送区域' : '批量添加仓库'}
      </Button>
      <StepsForm
        onFinish={async () => {
          openSet(false);
        }}
        stepsFormRender={(dom, submitter) => {
          let submitterFormat: any = submitter;
          if (submitterFormat && submitterFormat?.length > 1) {
            submitterFormat = [
              submitterFormat[0],
              <Button
                key={'confirm'}
                onClick={() => {
                  openSet(false);
                }}
                type={'primary'}
              >
                确定
              </Button>,
            ];
          }
          return (
            <Modal
              title={type == 'area' ? '批量调整配送区域' : '批量添加仓库'}
              width={1000}
              open={open}
              onCancel={() => {
                openSet(false);
                inputDataSet([]);
              }}
              footer={submitterFormat}
              destroyOnClose
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
          formRef={formRef}
          name="form"
          title={`数据填写`}
          onFinish={async (values) => {
            if (values.platform_code == 'VENDOR') {
              const resValid: any = await isVerificationSameVendor(values);
              if (resValid?.code != pubConfig.sCode) {
                pubMsg('提交失败: ' + resValid?.message);
                return false;
              }
            }
            let api = batchUpdateGoodSkuWarehouse;
            if (type == 'area') {
              api = batchUpdateGoodSkuWarehouseArea;
            }
            const res = await api(values);
            if (res?.code == pubConfig.sCode) {
              resultDataSet(res.data);
              if (reload) reload();
              return true;
            }
            pubMsg(res?.message);
            return false;
          }}
        >
          <Alert
            style={{ marginBottom: 10, width: '100%' }}
            banner
            type={'info'}
            message={
              type == 'area'
                ? '提示：款式的配送区域已分配完成，才可以批量调整配送区域；'
                : '提示：添加发货平台/发货仓库时，不设置配送区域设置;'
            }
          />
          <ProForm.Group colProps={{ span: 12 }}>
            <ProFormRadio.Group
              label="编码类型"
              name={'code_type'}
              radioType={'button'}
              options={[
                { label: '款式编码', value: '1' },
                { label: 'ERP编码', value: '2' },
                { label: '条形码', value: '3' },
              ]}
              rules={[pubRequiredRule]}
            />
            <ProFormDependency name={['code_type']}>
              {({ code_type }) => (
                <ProFormTextArea
                  label={code_type == 3 ? '条形码' : code_type == 2 ? 'ERP编码' : '款式编码'}
                  name={'sku_codes'}
                  rules={[pubRequiredRule]}
                  transform={(val) => {
                    if (!(val && val.trim())) {
                      pubMsg(
                        `请输入${
                          code_type == 3 ? '条形码' : code_type == 2 ? 'ERP编码' : '款式编码'
                        }`,
                      );
                      return val;
                    }
                    const codes = val?.split('\n').filter((item: any) => item?.trim());
                    inputDataSet(codes);
                    // 去重
                    const codesString = [...new Set(codes)].toString();
                    if (code_type == 1) {
                      return { sku_codes: codesString };
                    } else if (code_type == 2) {
                      return { erp_skus: codesString };
                    }
                    return { bar_codes: codesString };
                  }}
                  fieldProps={{
                    rows: 10,
                    onChange: (e) => {
                      const codes = e?.target?.value
                        ?.split('\n')
                        .filter((item: any) => item?.trim());
                      inputDataSet(codes);
                    },
                  }}
                  extra={
                    <Space className={inputData.length > 100 ? 'text-red' : ''}>
                      <span>当前输入: {`${inputData.length}/100条`}</span>
                      {validInputData.length == inputData.length ? null : (
                        <span>重复: {inputData.length - validInputData.length}条</span>
                      )}
                    </Space>
                  }
                />
              )}
            </ProFormDependency>
          </ProForm.Group>
          <ProForm.Group colProps={{ span: 12 }}>
            {type == 'area' ? (
              <ProFormCascader
                label={'发货区域'}
                name={'province_names'}
                request={async () => {
                  const areas = await getAreas();
                  return areas?.map((a: any) => ({
                    ...a,
                    children: a.options.map((o: any) => ({ label: o.label, value: o.label })),
                  }));
                }}
                rules={[pubRequiredRule]}
                fieldProps={{
                  allowClear: true,
                  showSearch: true,
                  maxTagCount: 'responsive',
                  multiple: true,
                  showCheckedStrategy: Cascader?.SHOW_CHILD,
                }}
                transform={(val) => {
                  return {
                    province_names: val
                      .map((item: any[]) => item.slice(1))
                      ?.flat()
                      ?.toString(),
                  };
                }}
              />
            ) : null}
            <ProFormRadio.Group
              label="发货平台"
              name={'platform_code'}
              radioType={'button'}
              valueEnum={dicList?.ORDER_DELIVERY_WAREHOUSE || {}}
              rules={[pubRequiredRule]}
              fieldProps={{
                onChange: async (e) => {
                  formRef.current?.setFieldsValue({
                    delivery_warehouse_id: null,
                    delivery_warehouse_name: '',
                    return_warehouse_id: null,
                    return_warehouse_name: '',
                  });
                  const res = await optionsDeliveryWarehouse({ platform_code: e.target.value });
                  if (res) optionsWarehouseSet(res);
                },
              }}
            />
            <ProFormDependency name={['platform_code']}>
              {({ platform_code }) => {
                if (platform_code) {
                  if (platform_code == 'VENDOR') {
                    return (
                      <ProFormSelect
                        label={'供应商'}
                        name={'delivery_warehouse_id'}
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
                            delivery_warehouse_id: val?.value,
                            delivery_warehouse_name: val?.label,
                          };
                        }}
                      />
                    );
                  }
                  return (
                    <ProFormSelect
                      label={'发货仓库'}
                      name={'delivery_warehouse_id'}
                      rules={[pubRequiredRule]}
                      fieldProps={{
                        showSearch: true,
                        labelInValue: true,
                        options: optionsWarehouse,
                      }}
                      transform={(val) => {
                        return {
                          delivery_warehouse_id: val?.value,
                          delivery_warehouse_name: val?.label,
                        };
                      }}
                    />
                  );
                }
                return null;
              }}
            </ProFormDependency>

            {type == 'area' ? null : (
              <>
                <ProFormDependency name={['platform_code']}>
                  {({ platform_code }) =>
                    platform_code == 'YUNCANG' ? (
                      <ProFormSelect
                        label={'退货仓库'}
                        name={'return_warehouse_id'}
                        rules={[pubRequiredRule]}
                        fieldProps={{
                          labelInValue: true,
                          options: optionsWarehouse,
                        }}
                        transform={(val) => {
                          return {
                            return_warehouse_id: val?.value,
                            return_warehouse_name: val?.label,
                          };
                        }}
                      />
                    ) : null
                  }
                </ProFormDependency>
                <ProFormSelect
                  label={'打包策略'}
                  name={'package_strategy'}
                  valueEnum={dicList?.ORDER_DELIVERY_PACKAGE_STRATEGY || {}}
                  rules={[pubRequiredRule]}
                />
              </>
            )}
            <ProFormTextArea label={'备注'} name={'remarks'} fieldProps={{ rows: 2 }} />
          </ProForm.Group>
        </StepsForm.StepForm>
        <StepsForm.StepForm name="result" title="调整结果" onFinish={async () => true}>
          <Alert
            style={{ marginBottom: 10, width: '100%' }}
            banner
            type={'info'}
            message={resultMessage}
          />
          <Table
            size={'small'}
            scroll={{ y: 400 }}
            bordered
            rowKey={(record: any) => record.sku_code + record.erp_sku + record.bar_code}
            columns={[
              {
                title: 'No.',
                dataIndex: 'index',
                width: 60,
                align: 'center',
                render: (text, record, index) => index + 1,
              },
              {
                title: '款式名称',
                dataIndex: 'sku_name',
                width: 220,
              },
              {
                title: '款式编码',
                dataIndex: 'sku_code',
              },
              {
                title: 'ERP编码',
                dataIndex: 'erp_sku',
              },
              {
                title: '条形码',
                dataIndex: 'bar_code',
              },
              {
                title: '调整结果',
                dataIndex: 'errorCode',
                align: 'center',
                render: (_: any, record: any) => (
                  <span className={record.errorCode == pubConfig.sCode ? 'text-green' : 'text-red'}>
                    {record.errorCode == pubConfig.sCode ? '成功' : '失败'}
                  </span>
                ),
              },
              {
                title: '原因',
                dataIndex: 'remarks',
              },
            ]}
            pagination={false}
            dataSource={resultData}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};
export default Component;
