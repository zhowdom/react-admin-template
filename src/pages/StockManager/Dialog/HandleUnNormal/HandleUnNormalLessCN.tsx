import { useRef, useState } from 'react';
import {
  ModalForm,
  ProFormDependency,
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Button, Form, Space } from 'antd';

import type { ProFormInstance } from '@ant-design/pro-components';
import { pubAlert, pubRequiredMaxRule } from '@/utils/pubConfig';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import ConfirmYesOrNoLess from './ConfirmYesOrNoLess';
import SupplyAgainOrder from './SupplyAgainOrder';
import { useAccess } from 'umi';
import { add } from '@/utils/pubConfirm';
import '../../style.less';

// 异常入库处理处理
const HandleUnNormal: any = (props: any) => {
  const { dataSource, reload, refreshKeySet, readonly, tableKeySet, common, recordS, tableKey } =
    props;
  const formRefLess = useRef<ProFormInstance>(); // 少收弹框form
  const [lessVisible, setLessVisible] = useState(false);
  const _ref1: any = useRef();
  const access = useAccess();
  // console.log(dataSource.orderException, 'orderException');
  return (
    <>
      <ModalForm
        width={readonly ? 850 : 950}
        formRef={formRefLess}
        labelCol={{ flex: '110px' }}
        wrapperCol={{ flex: '138px' }}
        layout="horizontal"
        labelAlign="left"
        className="lessHandle"
        initialValues={readonly ? dataSource?.orderException : undefined}
        title={<div style={{ fontWeight: 'bold', fontSize: '16px' }}>入库异常处理</div>}
        trigger={
          readonly ? (
            <span>
              {dataSource.exception_handling_num}
              <a>(已处理)</a>
            </span>
          ) : (
            <a
              title={'点击可以处理异常'}
              onClick={() => {
                setLessVisible(true);
              }}
            >
              {dataSource.difference_num + '(少收)'}
            </a>
          )
        }
        open={lessVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setLessVisible(false);
          },
          cancelText: readonly ? '关闭' : '取消',
        }}
        submitter={{
          render: (data: any, doms: any) =>
            !readonly ? (
              <Space>
                {doms[0]}
                <Button
                  type="primary"
                  key="yes"
                  onClick={() => {
                    formRefLess.current?.validateFields().then((values: any) => {
                      if (
                        add(
                          add(values.supplier_underdelivery_qty, values.warehousing_less_qty),
                          values.logistics_loss_qty,
                        ) != dataSource.difference_num
                      ) {
                        pubAlert('供应商少发+仓库漏收+物流丢失 应等于总异常数量', '', 'warning');
                        return;
                      }
                      _ref1?.current?.visibileChange(true, {
                        order_no: dataSource.order_no,
                        goods_sku_id: dataSource.goods_sku_id,
                        ...values,
                        type: '3',
                      });
                    });
                  }}
                >
                  确定
                </Button>
              </Space>
            ) : (
              <span>{doms[0]}</span>
            ),
        }}
      >
        <Space align="start">
          <Form.Item label="" wrapperCol={{ flex: 'auto' }}>
            <strong style={{ fontSize: '16px' }}>
              异常总数量：
              {readonly
                ? `${add(
                  add(
                    Number(dataSource?.orderException?.supplier_underdelivery_qty),
                    Number(dataSource?.orderException.warehousing_less_qty),
                  ),
                  Number(dataSource?.orderException.logistics_loss_qty),
                )} （已处理）`
                : dataSource.difference_num}
            </strong>
          </Form.Item>
          {readonly && (
            <span style={{ lineHeight: '32px', paddingLeft: '12px', color: 'rgba(0,0,0,.6)' }}>
              确认时间 :&nbsp; {dataSource?.orderException?.create_time}
            </span>
          )}
        </Space>
        <Space align="start">
          <span className="lineH24 pab">(1)</span>
          {readonly ? (
            <div className="readonly">
              供应商少发 : {dataSource?.orderException?.supplier_underdelivery_qty ?? '-'}{' '}
            </div>
          ) : (
            <ProFormDigit
              name="supplier_underdelivery_qty"
              label="供应商少发"
              rules={[
                { required: true, message: '请输入供应商少发数量' },
                {
                  validator: (_, value) => pubRequiredMaxRule(value, 9999999),
                },
              ]}
            />
          )}
          <span className="lineH24" style={{ marginLeft: readonly ? 0 : '-13px' }}>
            （说明：少发数量，不扣减采购单数量）
          </span>
          {readonly &&
            access.canSee('stockManager_updateWarehousingOrder_cn') &&
            !dataSource?.orderException?.supplier_underdelivery_order_no &&
            recordS &&
            dataSource?.orderException?.supplier_underdelivery_qty &&
            dataSource?.orderException?.supplier_underdelivery_qty != 0 && (
              <SupplyAgainOrder
                dataSource={{ ...recordS, tc_warehouse_contacts: recordS?.tc_contacts }}
                common={common}
                reload={reload}
                tableKey={tableKey}
                tableKeySet={tableKeySet}
                exception_less_type={0}
                curPlan={dataSource?.orderException?.supplier_underdelivery_qty}
                trigger={<a className="last-item-style">创建补发入库单</a>}
              />
            )}
          {readonly && dataSource?.orderException?.supplier_underdelivery_order_no && (
            <span className="last-item-style">
              {dataSource?.orderException?.supplier_underdelivery_order_no}
              <i className="last-item-style-isDel">
                {dataSource?.orderException?.supplier_underdelivery_order_no_delete == '1' ? '(已删除，数量已归还！)' : ''}
              </i>
            </span>
          )}
        </Space>
        <Space align="start">
          <span className="lineH24 pab">(2)</span>
          {readonly ? (
            <div className="readonly">
              仓库漏收 : {dataSource?.orderException?.warehousing_less_qty ?? '-'}
            </div>
          ) : (
            <ProFormDigit
              name="warehousing_less_qty"
              label="仓库漏收"
              rules={[
                { required: true, message: '请输入仓库漏收数量' },
                {
                  validator: (_, value) => pubRequiredMaxRule(value, 9999999),
                },
              ]}
            />
          )}
          <span className="lineH24">（说明：漏收数量，不扣减采购单数量，需重新推单）</span>
          {readonly &&
            access.canSee('stockManager_updateWarehousingOrder_cn') &&
            !dataSource?.orderException?.warehousing_less_order_no &&
            recordS &&
            dataSource?.orderException?.warehousing_less_qty &&
            dataSource?.orderException?.warehousing_less_qty != 0 && (
              <SupplyAgainOrder
                dataSource={{ ...recordS, tc_warehouse_contacts: recordS?.tc_contacts }}
                common={common}
                reload={reload}
                tableKey={tableKey}
                tableKeySet={tableKeySet}
                exception_less_type={1}
                curPlan={dataSource?.orderException?.warehousing_less_qty}
                trigger={<a className="last-item-style">创建补发入库单</a>}
              />
            )}
          {readonly && dataSource?.orderException?.warehousing_less_order_no && (
            <span className="last-item-style">
              {dataSource?.orderException?.warehousing_less_order_no}
              <i className="last-item-style-isDel">
                {dataSource?.orderException?.warehousing_less_order_no_delete == '1' ? '(已删除，数量已归还！)' : ''}
              </i>
            </span>
          )}
        </Space>
        <Space align="start">
          <span className="lineH24 pab">(3)</span>
          {readonly ? (
            <div className="readonly">
              物流丢失 : {dataSource?.orderException?.logistics_loss_qty ?? '-'}
              <ProFormText name="logistics_loss_qty" label="logistics_loss_qty" hidden />
            </div>
          ) : (
            <ProFormDigit
              name="logistics_loss_qty"
              label="物流丢失"
              rules={[
                { required: true, message: '请输入物流丢失数量' },
                {
                  validator: (_, value) => pubRequiredMaxRule(value, 9999999),
                },
              ]}
            />
          )}

          <span className="lineH24">（说明：物流丢失数量，扣减采购单数量，按确认时间对账）</span>
        </Space>
        <ProFormDependency name={['logistics_loss_qty']}>
          {({ logistics_loss_qty }) => {
            return logistics_loss_qty > 0 ? (
              <>
                <div className="item">
                  {readonly ? (
                    <div className="readonly">
                      赔偿金额 : {dataSource?.orderException?.satisfaction_amount ?? '-'}{' '}
                    </div>
                  ) : (
                    <ProFormDigit
                      name="satisfaction_amount"
                      label="赔偿金额"
                      wrapperCol={{ flex: '174px' }}
                      fieldProps={{ precision: 2, addonAfter: '元' }}
                      rules={[
                        {
                          validator: (_, value) => pubRequiredMaxRule(value, 9999999),
                        },
                      ]}
                    />
                  )}
                </div>
                <div className="item" style={{ paddingLeft: readonly ? '12px' : 0 }}>
                  <Form.Item
                    label="赔偿凭证"
                    name="satisfaction_voucher_file_list"
                    extra={readonly ? '' : '支持PDF、Word、JPG、JPEG、PNG、EXCEL文件格式'}
                    labelCol={{ flex: readonly ? '77px' : '110px' }}
                  >
                    <UploadFileList
                      fileBack={(data: any) => {
                        formRefLess?.current?.setFieldsValue({
                          satisfaction_voucher_file_list: data,
                        });
                      }}
                      required
                      defaultFileList={dataSource?.orderException?.satisfaction_voucher_file_list}
                      disabled={readonly}
                      businessType="VENDOR_ACCOUNT_PROOF"
                      multiple
                      maxSize="100"
                      accept={['.png,.jpg,.docx,.pdf,.doc,.xls,.xlsx']}
                      acceptType={['png', 'jpg', 'docx', 'pdf', 'doc', 'xls', 'xlsx']}
                    />
                  </Form.Item>
                </div>
              </>
            ) : (
              <></>
            );
          }}
        </ProFormDependency>
        <ProFormTextArea
          name="remark"
          label="备注"
          readonly={readonly}
          placeholder="请输入备注"
          labelCol={{ flex: readonly ? '50px' : '70px' }}
          wrapperCol={{ flex: '560px' }}
          formItemProps={{
            style: { marginLeft: '47px' },
          }}
        />
      </ModalForm>
      <ConfirmYesOrNoLess
        _ref1={_ref1}
        setLessVisible={setLessVisible}
        reload={reload}
        refreshKeySet={refreshKeySet}
      />
    </>
  );
};

export default HandleUnNormal;
