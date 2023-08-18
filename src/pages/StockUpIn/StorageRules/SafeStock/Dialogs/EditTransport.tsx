import { useState, useRef } from 'react';
import { Modal, Spin, Row, Col, Form } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { validShippingMethod, updateShippingMethod } from '@/services/pages/link';

const Dialog = (props: any) => {
  const { dicList } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [category, setCategory] = useState<any>('');
  const [detail, setDetail] = useState<any>({});
  const [messageVisible, setMessageVisible] = useState<any>({
    shipping_name: '',
  });
  const formRef = useRef<ProFormInstance>();
  const latestStatus = useRef<any>(messageVisible)
  latestStatus.current = messageVisible
  const _desc = category == 'shipping_method' ? '运输方式' : (category == 'delivery_route' ? '目的仓' : '装柜方式')

  props.editTransportModel.current = {
    open: (type: any, data?: any, category?:any) => {
      console.log(category, 'category')
      setIsModalVisible(true);
      setCategory(category)
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
  const editSubmit = async (val: any) => {
    setLoading(true);
    const res = await updateShippingMethod(Object.assign(val, {type: category}));
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('设置成功!', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 提交前：校验
  const saveSubmit = async (val: any) => {
    console.log(val);
    const newData = JSON.parse(JSON.stringify(val));
    setLoading(true);
    const res = await validShippingMethod({
      ...newData,
      type: category
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    setLoading(false);

    // progressSkuList:[]//已存在待审批的的sku
    // progressLinkIdList:[]//已存在待审批的的链接明细id
    // duplicateSkuList:[]//已新运输方式(${新运输方式})一致的sku
    // duplicateLinkIdList:[]//已新运输方式(${新运输方式})一致的链接明细id
    // diffSkuList:[]//与新运输方式不一致的sku
    // diffLinkIdList:[]//与新运输方式不一致的链接明细id

    // 点击提交时，进行如下检查，
    // 1）、是否存在待审批的店铺SKU；
    // 2）、检查是否存在【原运输方式】与【新运输方式】一致的SKU；
    // 3）、判断是否存在【原运输方式】与【新运输方式】不一致的SKU，并进行如下提示：
    //   1）所选记录，全部和【新运输方式】一致，则提示：SKU1、SKU2已提交修改申请，无法重复申请；SKU3、SKU4与新运输方式(${新运输方式})一致，无需更新，当前无SKU可修改运输方式。
    //   2）所选记录，部分和【新运输方式】一致，则提示：SKU1、SKU2已提交修改申请，无法重复申请；SKU3、SKU4与新运输方式(${新运输方式})一致，无需更新，是否将剩余SKU运输方式修改为${新运输方式}？
    //   3）所选记录，全部和【新运输方式】不一致，则提示：确定将所选SKU运输方式修改为$(新运输方式)吗？
    if (!res.data?.diffSkuList?.length) {
      Modal.info({
        title: '提示',
        content: (
          <div>
            {res.data?.progressSkuList?.length ? (
              <div>{res.data?.progressSkuList.join('、')}已提交修改申请，无法重复申请；</div>
            ) : (
              ''
            )}
            {res.data?.duplicateSkuList?.length ? (
              <div>
                {res.data?.duplicateSkuList.join('、')}与新{_desc}({messageVisible.shipping_name}
                )一致，无需更新，当前无SKU可修改{_desc}
              </div>
            ) : (
              ''
            )}
          </div>
        ),
        okText: '我知道了',
        width: 500,
        onOk() {
          // modalClose(1);
        },
      });
    } else {
      Modal.confirm({
        title: '提示',
        content: (
          <div>
            {!res.data?.progressSkuList?.length && !res.data?.duplicateSkuList?.length ? (
              <div>确定将所选SKU{_desc}修改为({messageVisible.shipping_name})吗？</div>
            ) : (
              <>
                {res.data?.progressSkuList?.length ? (
                  <div>{res.data?.progressSkuList.join('、')}已提交修改申请，无法重复申请；</div>
                ) : (
                  ''
                )}
                {res.data?.duplicateSkuList?.length ? (
                  <div>
                    {res.data?.duplicateSkuList.join('、')}与新{_desc}(
                    {messageVisible.shipping_name}
                    )一致，无需更新。
                  </div>
                ) : (
                  ''
                )}
                <div>是否将剩余SKU{_desc}修改为({messageVisible.shipping_name})？</div>
              </>
            )}
          </div>
        ),
        okText: '确定提交',
        width: 500,
        onOk() {
          console.log(`提交的${res.data?.diffSkuList}`);
          editSubmit({
            [`${category}`]: newData[`${category}`], // 运输方式、目的仓、拼柜方式
            reason: newData.reason, // 原因
            link_sku_ids: res.data?.diffLinkIdList,
          });
        },
        onCancel() {
          // modalClose(1);
        },
      });
    }
  };
  return (
    <Modal
      width={modalType == 'list' ? 600 : 800}
      title={
        modalType == 'list' ?
        (category == 'shipping_method' ? '批量更改运输方式' : (category == 'delivery_route' ? '批量更改目的仓' : '批量修改装柜方式'))
        :
        (category == 'shipping_method' ? '更改运输方式' : (category == 'delivery_route' ? '更改目的仓' : '修改装柜方式'))
      }
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
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="link_sku_ids" hidden />
          <ProFormSelect
            name={category}
            label={category == 'shipping_method' ? '运输方式' : (category == 'delivery_route' ? '目的仓' : '装柜方式')}
            placeholder="请选择"
            valueEnum={
              category == 'shipping_method' ?
              props?.dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD:
              (
                category == 'delivery_route' ?
                props?.dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE:
                {'whole': '整柜','part': '散货'}
              )
            }
            rules={[{ required: true, message: '请选择' }]}
            fieldProps={{
              onChange: (_: any, data: any) => {
                console.log(data.label);
                setMessageVisible({
                  ...messageVisible,
                  shipping_name: data.label,
                });
                setTimeout(() => {
                  console.log(messageVisible, 'can not get latest status');
                  console.log(latestStatus.current, 'can get latest status');
                }, 2000);
              },
            }}
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
