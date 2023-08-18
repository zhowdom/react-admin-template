import { useState, useRef } from 'react';
import { Modal, Spin, Row, Col, Form } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormDigit, ProFormTextArea } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubModal, pubMsg } from '@/utils/pubConfig';
import { updateSafeDays } from '@/services/pages/link';

const Dialog = (props: any) => {
  const { dicList } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [detail, setDetail] = useState<any>({});
  const formRef = useRef<ProFormInstance>();

  props.editStockModel.current = {
    open: (type: any, data?: any) => {
      setIsModalVisible(true);
      setModalType(type);
      if (type == 'list') {
        // 批量
        setTimeout(() => {
          formRef?.current?.setFieldsValue({
            link_sku_ids: data,
          });
        }, 200);
      } else {
        setTimeout(() => {
          formRef?.current?.setFieldsValue({
            link_sku_ids: [data.link_management_sku_id],
          });
          setDetail(data);
        }, 200);
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    console.log(val);
    const newData = JSON.parse(JSON.stringify(val));
    pubModal(`是否确定修改选中SKU的安全库存？`)
      .then(async () => {
        setLoading(true);
        const res = await updateSafeDays({
          ...newData,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          setLoading(false);
          return;
        }
        pubMsg('设置成功!', 'success');
        modalClose(false);
        setLoading(false);
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  return (
    <Modal
      width={modalType == 'list' ? 600 : 800}
      title={modalType == 'list' ? '批量修改安全库存' : '修改安全库存'}
      open={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        {modalType == 'one' ? (
          <Row gutter={10} className="light-form-item-row">
            <Col span={12}>
              <Form.Item label="链接名">{detail?.link_name}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="链接ID">{detail?.link_id}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="SKU">{detail?.shop_sku_code}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="对应款式">{detail?.sku_name}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="销售价">{detail?.sale_price}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="销售状态">
                {pubFilter(dicList?.LINK_MANAGEMENT_SALES_STATUS, detail?.sales_status)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="是否可售">
                {pubFilter(dicList?.SC_YES_NO, detail?.is_sale)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="上架时间">{detail?.sales_time}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="运输方式">
                {pubFilter(
                  dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD,
                  detail?.shipping_method,
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="安全库存天数">{detail?.life_cycle}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="装柜方式">{detail?.box_type == 'whole' ? '整柜' : '散货'}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="目的仓">{pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE, detail?.delivery_route)}</Form.Item>
            </Col>

            
            <Col span={12}>
              <Form.Item label="产品线">{`${pubFilter(
                dicList?.SYS_BUSINESS_SCOPE,
                detail.business_scope,
              )}-${detail?.category_name}`}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="平台">
                {pubFilter(dicList?.SYS_PLATFORM_NAME, detail?.platform_code)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="店铺">{detail?.shop_name}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="推广">{detail?.spread_user_name}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="生命周期">
                {pubFilter(dicList?.LINK_MANAGEMENT_LIFE_CYCLE, detail?.life_cycle)}
              </Form.Item>
            </Col>
          </Row>
        ) : (
          ''
        )}
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="link_sku_ids" hidden />
          <ProFormDigit
            name="safe_days"
            label="新安全库存天数"
            placeholder="请选择新安全库存天数"
            rules={[{ required: true, message: '请选择新安全库存天数' }]}
          />
          <ProFormTextArea
            name="reason"
            label="修改原因"
            placeholder="请输入修改原因"
            rules={[{ required: true, message: '请输入修改原因' }]}
            formItemProps={{
              style: { margin: '10px 0 4px' },
            }}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;
