import {Modal, Button, Table, Space, Alert} from 'antd';
import {
  ProForm,
  ProFormSelect,
  ProFormTextArea,
  StepsForm,
  ProFormRadio,
  ProFormDependency,
} from '@ant-design/pro-components';
import {useMemo, useRef, useState} from 'react';
import {pubConfig, pubMsg, pubRequiredRule, pubMyFilter, pubFilter} from '@/utils/pubConfig';
import type {FormInstance} from '@ant-design/pro-components';
import {
  batchInterceptCheck,
  batchIntercept,
  addExchangeView,
  addExchange,
} from '@/services/pages/order/delivery-order';
import {flatData} from '@/utils/filter';

const optionsIdType = [
  {label: 'ERP订单号', value: 'ERP_NO'},
  {label: '平台订单号', value: 'PLATFORM_NO'},
  {label: '配送单号', value: 'DELIVERY_NO'},
  {label: '仓库订单号', value: 'LBX_NO'},
  {label: '快递单号', value: 'SHIP_NO'},
];

const Component: React.FC<{
  reload: any;
  dicList: any;
  open: any;
  openSet: any;
  platformWarehouseCode: string;
  defaultIdType?: 'ERP_NO' | 'PLATFORM_NO' | 'DELIVERY_NO' | 'LBX_NO' | 'SHIP_NO';
  defaultIds?: string;
  selectedRowsPage?: Record<string, any>[];
  type: 'refund' | 'intercept';
}> = ({
        dicList,
        reload,
        open,
        openSet,
        platformWarehouseCode,
        defaultIdType = 'DELIVERY_NO',
        defaultIds,
        selectedRowsPage = [],
        type = 'intercept',
      }) => {
  const formRefOne: any = useRef<FormInstance>();
  const [current, currentSet] = useState<number>(0);
  const [inputData, inputDataSet] = useState<any[]>([]);
  const [confirmData, confirmDataSet] = useState<any>({});
  const [resultData, resultDataSet] = useState<any>({});
  const [selectedRowKeys, selectedRowKeysSet] = useState<any>([]);
  const [selectedRows, selectedRowsSet] = useState<any>([]);
  const confirmDataSource = useMemo(() => flatData(confirmData?.data || [], 'itemList'), [confirmData])
  const validInputData = useMemo(() => [...new Set(inputData)], [inputData]);
  const commonColumns = [
    {
      title: '订单号',
      dataIndex: 'erpNo',
      onCell: (record: any) => ({rowSpan: record.rowSpan1}),
    },
    {
      title: '平台单号',
      dataIndex: 'platformNo',
      onCell: (record: any) => ({rowSpan: record.rowSpan1}),
    },
    {
      title: '配送单号',
      dataIndex: 'deliveryCode',
      onCell: (record: any) => ({rowSpan: record.rowSpan1}),
    },
    {
      title: '仓库订单号',
      dataIndex: 'deliveryOrderId',
      onCell: (record: any) => ({rowSpan: record.rowSpan1}),
    },
    {
      title: '快递单号',
      dataIndex: 'expressCode',
      onCell: (record: any) => ({rowSpan: record.rowSpan1}),
    },
    {
      title: '款式名称',
      dataIndex: 'skuName',
      width: 220,
    },
    {
      title: '款式编码',
      dataIndex: 'skuCode',
    },
    {
      title: '发货数量',
      dataIndex: 'sendNum',
      width: 80,
    },
  ];
  const reset = () => {
    inputDataSet([]);
    confirmDataSet({});
    resultDataSet({});
    selectedRowKeysSet([]);
    selectedRowsSet([]);
    currentSet(0);
    formRefOne.current?.resetFields();
  };
  const initialIds: string = useMemo(() => {
    if (defaultIds) {
      return defaultIds
    } else if (selectedRowsPage?.length) {
      return selectedRowsPage.map((item) => item.deliveryCode).join('\n');
    }
    return '';
  }, [selectedRowsPage, defaultIds]);
  return (
    <StepsForm
      current={current}
      onCurrentChange={(val) => {
        currentSet(val)
        if (val == 0) {
          confirmDataSet({});
          resultDataSet({});
        }
      }}
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
            title={`[${pubFilter(dicList?.ORDER_DELIVERY_WAREHOUSE || {}, platformWarehouseCode)}]${
              type == 'intercept' ? '拦截' : '销退'
            }`}
            width={current == 0 ? 999 : 1400}
            open={open}
            onCancel={() => {
              openSet(false);
              reset();
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
        labelCol: {flex: '0 0 90px'},
      }}
    >
      <StepsForm.StepForm
        name="form"
        title={`填写单据`}
        formRef={formRefOne}
        onFinish={async (values) => {
          if (!validInputData?.length) {
            pubMsg(`请输入单据号`);
            return;
          }
          let api = addExchangeView;
          if (type == 'intercept') api = batchInterceptCheck;
          const res = await api({...values, platformWarehouseCode});
          if (res?.code == pubConfig.sCodeOrder) {
            confirmDataSet(res);
            const rows: any[] = res?.data.filter((item: any) => item.status == 1);
            selectedRowsSet(rows);
            selectedRowKeysSet(rows.map((item: any) => item.id));
            return true;
          } else {
            pubMsg(res?.message);
            return false;
          }
        }}
      >
        <Alert
          style={{marginBottom: 10, width: '100%'}}
          banner
          type={'info'}
          message={
            type == 'intercept'
              ? '提示: 通过快递包裹维度拦截；未发货时拦截订单将会被取消；已发货时拦截不会改变发货状态，拦截结果不会实时返回；如拦截成功则会创建销退入库单；'
              : '提示: 只有“部分发货完成/发货完成”的配送单下未创建过销退单的包裹；'
          }
        />
        <ProForm.Group colProps={{span: 12}}>
          <ProFormRadio.Group
            label="单据类型"
            name={'idType'}
            radioType={'button'}
            options={optionsIdType}
            rules={[pubRequiredRule]}
            readonly={!!defaultIds}
            initialValue={defaultIdType}
          />
          <ProFormDependency name={['idType']}>
            {({idType}) => (
              <ProFormTextArea
                label={pubMyFilter(optionsIdType, idType)}
                name={'ids'}
                rules={[
                  pubRequiredRule,
                  {validator: () => validInputData.length > 100 ? Promise.reject('每次最多100条'):Promise.resolve()}
                ]}
                readonly={!!defaultIds}
                initialValue={initialIds}
                transform={(val) => {
                  if (!(val && val.trim()) && idType) {
                    return val;
                  }
                  const codes = val?.split('\n').filter((item: any) => item?.trim());
                  inputDataSet(codes);
                  // 去重
                  const ids = [...new Set(codes)];
                  return {ids};
                }}
                fieldProps={{
                  rows: 10,
                  onChange: (e) => {
                    const codes = e?.target?.value?.split('\n').filter((item: any) => item?.trim());
                    inputDataSet(codes);
                  },
                }}
                extra={
                  defaultIds ? null : (
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
        <ProForm.Group colProps={{span: 12}}>
          <ProFormSelect
            label="原因"
            name={'reason'}
            valueEnum={dicList?.ORDER_INTERCEPT_REASON || {}}
            rules={[pubRequiredRule]}
          />
          <ProFormTextArea label={'备注'} name={'remark'} fieldProps={{rows: 10}}/>
        </ProForm.Group>
      </StepsForm.StepForm>
      <StepsForm.StepForm
        name="confirm"
        title="确认单据"
        onFinish={async () => {
          if (!selectedRows?.length) {
            pubMsg('未勾选或无任何可用数据项, 无法提交');
            return;
          }
          let api = addExchange;
          if (type == 'intercept') api = batchIntercept;
          const res = await api(selectedRows);
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
          style={{marginBottom: 10, width: '100%'}}
          banner
          type={'info'}
          message={confirmData?.message}
        />
        {selectedRows.length ? (
          <Alert
            style={{marginBottom: 10, width: '100%'}}
            banner
            type={'success'}
            message={`已选 ${selectedRows.length} 条数据项`}
          />
        ) : null}
        <Table
          size={'small'}
          pagination={false}
          scroll={{y: 400, x: 1600}}
          bordered
          rowKey={(record: any) => record.rowSpan1 ? record.id : record.id + record.skuCode}
          columns={[
            ...commonColumns,
            {
              title: '不可拦截原因',
              dataIndex: 'nonInterceptReason',
              onCell: (record: any) => ({rowSpan: record.rowSpan1}),
              fixed: 'right',
            },
          ]}
          dataSource={confirmDataSource}
          rowSelection={{
            fixed: 'left',
            selectedRowKeys,
            onChange: (keys: any[], rows: any[]) => {
              selectedRowKeysSet(keys);
              selectedRowsSet(rows);
            },
            getCheckboxProps: (record: any) => ({
              disabled: record.status != 1,
            }),
            renderCell: (value: boolean, record: any, index: number, originNode: React.ReactNode) => ({
              props: {rowSpan: record.rowSpan1},
              children: originNode,
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
          style={{marginBottom: 10, width: '100%'}}
          banner
          type={'info'}
          message={resultData.message}
        />
        <Table
          size={'small'}
          pagination={false}
          scroll={{y: 400, x: 1600}}
          bordered
          rowKey={(record: any) => record.rowSpan1 ? record.id : record.id + record.skuCode}
          columns={[
            ...commonColumns,
            {
              title: '结果',
              dataIndex: 'interceptResult',
              width: 80,
              onCell: (record: any) => ({rowSpan: record.rowSpan1}),
              fixed: 'right',
            },
            {
              title: '失败原因',
              dataIndex: 'interceptFailReason',
              onCell: (record: any) => ({rowSpan: record.rowSpan1}),
              fixed: 'right',
            },
          ]}
          dataSource={flatData(resultData?.data || [], 'itemList')}
        />
      </StepsForm.StepForm>
    </StepsForm>
  );
};
export default Component;
