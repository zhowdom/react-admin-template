import { Button, Col, Divider, Modal, Row } from 'antd';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubRequiredLengthRule, pubRequiredMaxRule } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import { getDesWareList } from '@/services/pages/logisticsManageIn/desPortWare';
import './index.less';
import { getLspList } from '@/services/pages/logisticsManageIn/lsp';
import { getLogisticsPort } from '@/services/pages/logisticsManageIn/ports';
import { getCompanyList } from '@/services/pages/logisticsManageIn/company';
import { delivery } from '@/services/pages/logisticsManageIn/logisticsOrder';
import moment from 'moment';

export default (props: any) => {
  const { initialValues, disabled, dicList } = props;
  const formRef = useRef<ProFormInstance>();
  const [visible, visibleSet] = useState<boolean>(false);
  const [submitting, submittingSet] = useState<any>(false);
  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postData, setPostData] = useState<any>({});
  // 二次确认确定
  const handleOk = async () => {
    submittingSet(true);
    const res: any = await delivery({
      ...postData,
      id: initialValues.id,
      delivery_date: moment(postData.delivery_date).format('YYYY-MM-DD 00:00:00'),
      etd_date: moment(postData.etd_date).format('YYYY-MM-DD 00:00:00'),
      platform_appointment_time: moment(postData.platform_appointment_time).format(
        'YYYY-MM-DD 00:00:00',
      ),
    });
    submittingSet(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功!', 'success');
      props.reload();
      visibleSet(false);
      setIsModalOpen(false);
    }
  };
  // 二次确认弹窗关闭
  const handleCancel = () => {
    setIsModalOpen(false);
    submittingSet(false);
  };
  return (
    <>
      {' '}
      <ModalForm<{
        name: string;
        company: string;
      }>
        title={'已装柜/已送货'}
        formRef={formRef}
        trigger={
          initialValues ? (
            <a onClick={() => visibleSet(true)}> {props.trigger}</a>
          ) : (
            <Button ghost type="primary" onClick={() => visibleSet(true)} disabled={disabled}>
              {props.trigger}
            </Button>
          )
        }
        visible={visible}
        className="length210 large"
        labelAlign="right"
        labelCol={{ span: 11 }}
        layout="horizontal"
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          onCancel: () => visibleSet(false),
          confirmLoading: submitting,
          okText: '确定已装柜/已送货',
        }}
        initialValues={initialValues}
        width={850}
        onFinish={async (values: any) => {
          setPostData(values);
          setIsModalOpen(true);
        }}
      >
        <ProFormText name="id" label="id" hidden />
        <Divider orientation="left" orientationMargin="0">
          物流单信息
        </Divider>
        <Row>
          <Col span={12} style={{ marginBottom: '10px' }}>
            <ProFormSelect
              readonly
              name="shipping_method"
              label="出货渠道(运输方式)"
              valueEnum={dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD}
              placeholder="请选择运输方式"
              fieldProps={{
                getPopupContainer: (triggerNode: any) => triggerNode.parentNode,
                ...selectProps,
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <ProFormSelect
              name="logistics_vendor_id"
              label="物流商(代码)"
              rules={[{ required: true, message: '请选择物流商(代码)' }]}
              fieldProps={selectProps}
              showSearch
              debounceTime={300}
              request={async () => {
                const res: any = await getLspList({
                  current_page: 1,
                  page_size: 99999,
                });
                return res?.data?.records?.map((v: any) => ({
                  value: v.id,
                  label: v.name,
                  data: v,
                  disabled: v.status != '5',
                }));
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="booking_account"
              label="订舱账号"
              placeholder="请选择订舱账号"
              valueEnum={dicList.LOGISTICS_ORDER_BOOKING_ACCOUNT}
            />
          </Col>
        </Row>
        <Divider orientation="left" orientationMargin="0">
          装柜信息
        </Divider>
        <Row>
          <Col span={12}>
            <ProFormSelect
              name="shipping_space_type"
              label="舱位类型"
              rules={[{ required: true, message: '请选择舱位类型' }]}
              valueEnum={dicList?.LOGISTICS_ORDER_SHIPPING_SPACE_TYPE}
              placeholder="请选择舱位类型"
              fieldProps={{
                getPopupContainer: (triggerNode: any) => triggerNode.parentNode,
              }}
            />
          </Col>
          <ProFormDependency name={['shipping_space_type']}>
            {({ shipping_space_type }: any) => {
              return (
                shipping_space_type == '1' && (
                  <>
                    <Col span={12}>
                      <ProFormText
                        name="so_no"
                        label="SO号/运单号"
                        rules={[
                          {
                            required: true,
                            message: '请输入SO号/运单号',
                          },
                          {
                            validator: (_: any, value: any) => pubRequiredLengthRule(value, 50),
                          },
                        ]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        name="cabinet_no"
                        label="柜号"
                        rules={[
                          { required: true, message: '请输入柜号' },
                          {
                            validator: (_: any, value: any) => pubRequiredLengthRule(value, 50),
                          },
                        ]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormText
                        name="seal_no"
                        label="封条号"
                        rules={[
                          { required: true, message: '请输入封条号' },
                          {
                            validator: (_: any, value: any) => pubRequiredLengthRule(value, 50),
                          },
                        ]}
                      />
                    </Col>
                    <Col span={12}>
                      <ProFormDigit
                        label="柜重(kg)"
                        name="cabinet_weight"
                        fieldProps={{
                          precision: 3,
                        }}
                        rules={[
                          { required: true, message: '请输入柜重' },
                          {
                            validator: (_, value) =>
                              pubRequiredMaxRule(
                                value,
                                10000000,
                                false,
                                '不超过10000000 kg （10吨）',
                              ),
                          },
                        ]}
                        placeholder="请输入柜重"
                      />
                    </Col>
                  </>
                )
              );
            }}
          </ProFormDependency>
        </Row>

        <Row>
          <Col span={12}>
            <ProFormText name="start_port_name" label="起运港" hidden />
            <ProFormSelect
              name="start_port_id"
              label="起运港"
              rules={[{ required: true, message: '请选择起运港' }]}
              fieldProps={{
                ...selectProps,
                onChange: (val: any, data: any) => {
                  formRef?.current?.setFieldsValue({
                    start_port_name: data.label,
                  });
                },
              }}
              showSearch
              debounceTime={300}
              request={async () => {
                const res: any = await getLogisticsPort({
                  current_page: 1,
                  page_size: 99999,
                  type: 1,
                });
                return res?.data?.records?.map((v: any) => ({
                  value: v.id,
                  label: v.name,
                  data: v,
                  disabled: v.status != '1',
                }));
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormText name="end_port_name" label="目的港" hidden />
            <ProFormSelect
              name="end_port_id"
              label="目的港"
              rules={[{ required: true, message: '请选择目的港' }]}
              fieldProps={{
                ...selectProps,
                onChange: (val: any, data: any) => {
                  formRef?.current?.setFieldsValue({
                    end_port_name: data.label,
                  });
                },
              }}
              showSearch
              debounceTime={300}
              request={async () => {
                const res: any = await getLogisticsPort({
                  current_page: 1,
                  page_size: 99999,
                  type: 2,
                });
                return res?.data?.records?.map((v: any) => ({
                  value: v.id,
                  label: v.name,
                  data: v,
                  disabled: v.status != '1',
                }));
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormText name="end_port_warehouse_name" label="目的港仓库" hidden />
            <ProFormSelect
              name="end_port_warehouse_id"
              label="目的港仓库"
              rules={[{ required: true, message: '请选择目的港仓库' }]}
              fieldProps={{
                ...selectProps,
                onChange: (val: any, data: any) => {
                  formRef?.current?.setFieldsValue({
                    end_port_warehouse_name: data.label,
                  });
                },
              }}
              showSearch
              debounceTime={300}
              request={async () => {
                const res: any = await getDesWareList({
                  current_page: 1,
                  page_size: 99999,
                  type: 2,
                });
                return res?.data?.records?.map((v: any) => ({
                  value: v.id,
                  label: v.name,
                  data: v,
                  disabled: v.status != '1',
                }));
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormText name="express_name" label="船公司/快递公司" hidden />
            <ProFormSelect
              disabled={props.dialogForm?.id}
              name="express_id"
              label="船公司/快递公司"
              fieldProps={{
                ...selectProps,
                onChange: (val: any, data: any) => {
                  formRef?.current?.setFieldsValue({
                    express_name: data.label,
                  });
                },
              }}
              rules={[{ required: true, message: '请选择船公司/快递公司' }]}
              showSearch
              debounceTime={300}
              request={async () => {
                const res: any = await getCompanyList({
                  current_page: 1,
                  page_size: 99999,
                  business_scope: 'IN',
                });
                return res?.data?.records?.map((v: any) => ({
                  value: v.id,
                  label: v.name,
                  data: v,
                  disabled: v.status != '1',
                }));
              }}
            />
          </Col>
        </Row>
        <Divider orientation="left" orientationMargin="0">
          物流时效
        </Divider>
        <Row>
          <Col span={12}>
            <ProFormDatePicker
              name="delivery_date"
              rules={[{ required: true, message: '请选择实际出厂/发货/装柜时间' }]}
              label="实际出厂/发货/装柜时间"
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              name="etd_date"
              dependencies={['delivery_date']}
              rules={[
                { required: true, message: '请选择预计开船时间ETD' },
                ({ getFieldValue }: any) => ({
                  validator(_: any, value: any) {
                    if (
                      !value ||
                      new Date(getFieldValue('delivery_date')).getTime() <=
                        new Date(value).getTime()
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('应大于等于实际出厂/发货/装柜时间'));
                  },
                }),
              ]}
              placeholder={'请选择预计开船时间ETD'}
              label="预计开船时间ETD"
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              label={'预计入仓时间'}
              name={'platform_appointment_time'}
              dependencies={['etd_date']}
              rules={[
                { required: true, message: '请选择预计入仓时间' },
                ({ getFieldValue }: any) => ({
                  validator(_: any, value: any) {
                    if (
                      !value ||
                      new Date(getFieldValue('etd_date')).getTime() <= new Date(value).getTime()
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('应大于等于预计开船时间ETD'));
                  },
                }),
              ]}
            />
          </Col>
        </Row>
      </ModalForm>
      <Modal
        className="common-confirm-modal"
        title={<div style={{ fontWeight: 600 }}>提示</div>}
        open={isModalOpen}
        onOk={handleOk}
        width={420}
        onCancel={handleCancel}
        destroyOnClose
        okButtonProps={{ loading: submitting }}
      >
        <div style={{ paddingLeft: '26px' }}>确定已装柜/已送货吗?</div>
      </Modal>
    </>
  );
};
