import {
  ModalForm,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProForm,
  ProFormSelect,
  ProFormDependency,
} from '@ant-design/pro-components';
import { acceptTypes, pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { Button, Alert } from 'antd';
import {
  shipmentClosedApply,
  getShipmentProcess,
  shipmentProcessReject,
  shipmentProcessAdopt,
  shipmentProcessDirectClose,
} from '@/services/pages/stockManager';
import React, { useRef, useState } from 'react';
import './index.less';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
// 货件关闭申请
const ComponentModal: React.FC<{
  dataSource: any;
  reload?: any;
  dicList: any;
  type: 'apply' | 'approval';
  readonly?: boolean;
}> = ({ dataSource, reload, dicList, type, readonly }) => {
  const formRef: any = useRef();
  const [initialData, initialDataSet] = useState<any>({});
  const [open, openSet] = useState<boolean>(false);
  const [submitType, submitTypeSet] = useState<'apply' | 'reject' | 'approval' | 'direct'>('apply');
  const [compensateC, compensateCSet] = useState<any>(
    dataSource?.warehousing_num - dataSource?.arrival_num >= 0 ? 0 : 1,
  );
  return (
    <>
      <a onClick={() => openSet(true)}>
        {readonly ? '异常详情' : type == 'apply' ? '货件关闭申请' : '关闭异常入库单'}
      </a>
      <ModalForm
        visible={open}
        width={600}
        formRef={formRef}
        layout={'horizontal'}
        className={type == 'approval' ? 'item8' : ''}
        title={readonly ? '异常详情' : type == 'apply' ? '货件关闭申请' : '关闭异常入库单 - 审批'}
        labelCol={{ flex: '134px' }}
        request={async () => {
          if (type == 'apply' && dataSource.shipment_process_status == 0) {
            compensateCSet(dataSource?.warehousing_num - dataSource?.arrival_num >= 0 ? 0 : 1);
            return {};
          } else {
            const res = await getShipmentProcess({ order_no: dataSource.order_no });
            if (res?.code == pubConfig.sCode) {
              initialDataSet(res?.data);
              compensateCSet(res?.data?.compensate);
              return res?.data || {};
            }
            pubMsg(res?.message);
            return {};
          }
        }}
        onFinish={async (values: any) => {
          let api = shipmentClosedApply;
          const postData = {
            ...values,
            warehousing_id: dataSource.id,
            warehousing_no: dataSource.order_no,
          };
          if (dataSource.shipment_process_status > 0) {
            postData.id = initialData.id;
          }
          if (submitType == 'reject') {
            api = shipmentProcessReject;
            postData.order_no = postData.warehousing_no;
            postData.id = initialData.id;
          } else if (submitType == 'approval') {
            api = shipmentProcessAdopt;
            postData.order_no = postData.warehousing_no;
            postData.id = initialData.id;
          } else if (submitType == 'direct') {
            api = shipmentProcessDirectClose;
            postData.order_no = postData.warehousing_no;
            postData.id = initialData.id;
            postData.closed_type = 2;
          }
          const res = await api(postData);
          if (res?.code == pubConfig.sCode) {
            pubMsg(res?.message, 'success');
            if (reload) reload();
            openSet(false);
            return true;
          } else {
            pubMsg(res?.message);
          }
          return false;
        }}
        modalProps={{
          destroyOnClose: true,
          footer: null,
          onCancel: () => openSet(false),
        }}
        submitter={{
          render: (props) => {
            return [
              <Button key={'cancel'} onClick={() => openSet(false)}>
                关闭弹框
              </Button>,
              type == 'apply' &&
                !readonly &&
                dataSource?.warehousing_num - dataSource?.arrival_num >= 0 &&
                compensateC == 0 && (
                  <Button
                    key={'closeSubmit'}
                    type={'primary'}
                    ghost
                    onClick={() => {
                      submitTypeSet('direct');
                      props.form?.submit?.();
                    }}
                  >
                    直接关闭货件
                  </Button>
                ),
              type == 'apply' &&
                !readonly &&
                !(
                  dataSource?.warehousing_num - dataSource?.arrival_num >= 0 && compensateC == 0
                ) && (
                  <Button
                    key={'applySubmit'}
                    type={'primary'}
                    onClick={() => {
                      submitTypeSet('apply');
                      props.form?.submit?.();
                    }}
                  >
                    提交申请
                  </Button>
                ),
              type == 'approval' && !readonly && (
                <Button
                  key={'return'}
                  danger
                  onClick={() => {
                    submitTypeSet('reject');
                    props.form?.submit?.();
                  }}
                >
                  驳回
                </Button>
              ),
              type == 'approval' && !readonly && (
                <Button
                  key={'approval'}
                  type={'primary'}
                  onClick={() => {
                    submitTypeSet('approval');
                    props.form?.submit?.();
                  }}
                >
                  确认关闭货件异常
                </Button>
              ),
            ];
          },
        }}
      >
        {!initialData ? (
          <Alert showIcon message={'未找到任何信息~'} />
        ) : (
          <>
            <p style={{ fontWeight: 'bold', marginBottom: readonly ? '10px' : '20px' }}>
              {dataSource?.warehousing_num - dataSource?.arrival_num > 0 && (
                <>
                  平台入库数量为
                  <span style={{ color: 'red' }}> {dataSource?.warehousing_num ?? 0} </span>, 大于
                  跨境发货数量
                </>
              )}
              {dataSource?.warehousing_num - dataSource?.arrival_num == 0 && (
                <>
                  平台入库数量为
                  <span style={{ color: 'red' }}> {dataSource?.warehousing_num ?? 0} </span>, 等于
                  跨境发货数量
                </>
              )}
              {dataSource?.warehousing_num - dataSource?.arrival_num < 0 && (
                <>
                  平台入库数量为
                  <span style={{ color: 'red' }}> {dataSource?.warehousing_num ?? 0} </span>, 小于
                  跨境发货数量
                </>
              )}
            </p>
            {/* 货件异常，平台多收或正常(dataSource?.warehousing_num-dataSource?.arrival_num >= 0)的时候，平台是否赔偿，默认选择否,少收默认是 */}
            <ProFormRadio.Group
              label="平台是否赔偿"
              name="compensate"
              readonly={
                type == 'approval' || dataSource?.warehousing_num - dataSource?.arrival_num >= 0
              }
              initialValue={compensateC}
              fieldProps={{
                onChange: (e: any) => {
                  compensateCSet(e?.target?.value);
                },
              }}
              options={[
                {
                  label: '是',
                  value: 1,
                },
                {
                  label: '否',
                  value: 0,
                },
              ]}
            />
            <ProFormDependency name={['compensate']}>
              {({ compensate }) => (
                <>
                  {compensate == 1 && (
                    <>
                      <ProFormText
                        name={'compensate_no'}
                        label={'赔偿单号'}
                        width={'md'}
                        rules={type == 'apply' ? [pubRequiredRule] : []}
                        readonly={type == 'approval'}
                      />
                      <ProForm.Group
                        size={'small'}
                        style={{ marginLeft: type == 'apply' ? 55 : 65 }}
                      >
                        <ProFormDigit
                          name={'amount'}
                          label={'赔偿金额'}
                          labelCol={{ flex: 'none' }}
                          rules={type == 'apply' ? [pubRequiredRule] : []}
                          fieldProps={{ precision: 2 }}
                          readonly={type == 'approval'}
                        />
                        <ProFormSelect
                          name={'currency'}
                          rules={type == 'apply' ? [pubRequiredRule] : []}
                          initialValue={'USD'}
                          valueEnum={dicList?.SC_CURRENCY || {}}
                          fieldProps={{ allowClear: false }}
                          readonly={type == 'approval'}
                        />
                      </ProForm.Group>
                    </>
                  )}
                  {/* 多收的时候，平台否赔偿的时候，附件和关闭理由，非必填 */}
                  <ProFormTextArea
                    extra={
                      dataSource.shipment_process_status == 3
                        ? `驳回备注: ${initialData?.remark || '-'}`
                        : ''
                    }
                    name={'reason'}
                    label={'货件关闭申请理由'}
                    rules={
                      type == 'apply' &&
                      !(
                        dataSource?.warehousing_num - dataSource?.arrival_num >= 0 &&
                        compensate == 0
                      )
                        ? [pubRequiredRule]
                        : []
                    }
                    readonly={type == 'approval'}
                  />
                  {type == 'apply' ? (
                    <ProForm.Item
                      label="附件"
                      name="pod_files"
                      extra={'支持PDF、Word、JPG、JPEG、PNG、EXCEL文件格式, 单个不能超过50M'}
                      style={{ marginTop: '20px' }}
                      rules={
                        type == 'apply' &&
                        !(
                          dataSource?.warehousing_num - dataSource?.arrival_num >= 0 &&
                          compensate == 0
                        )
                          ? [pubRequiredRule]
                          : []
                      }
                    >
                      <UploadFileList
                        fileBack={(data: any) => {
                          formRef?.current?.setFieldsValue({ pod_files: data });
                        }}
                        required
                        defaultFileList={initialData?.pod_files}
                        businessType="WAREHOUSING_ORDER_SHIPMENT_CLOSED"
                        accept={`${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                        acceptType={`${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                        acceptMessage="上传格式不对，请检查上传文件"
                        maxSize="50"
                        maxCount="20"
                        multiple
                      />
                    </ProForm.Item>
                  ) : (
                    <>
                      <ProForm.Item label={'附件'}>
                        <ShowFileList data={initialData?.pod_files || []} />
                      </ProForm.Item>
                      {!(dataSource?.warehousing_num - dataSource?.arrival_num >= 0) && (
                        <ProFormTextArea
                          name={'remark'}
                          label={'备注'}
                          readonly={readonly}
                          rules={readonly ?  [] : [pubRequiredRule]}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </ProFormDependency>
          </>
        )}
      </ModalForm>
    </>
  );
};
export default ComponentModal;
