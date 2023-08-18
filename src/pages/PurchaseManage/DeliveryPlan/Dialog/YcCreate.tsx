import { pubConfig, pubFilter, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-components';
import React, { useState } from 'react';
import { Button, Col, Modal, Row } from 'antd';
import { history } from 'umi';
import { createWarehousingByPlan } from '@/services/pages/deliveryPlan';

const Dialog: React.FC<{
  reload: any;
  dicList: Record<string, any>;
  dialogForm: Record<string, any>;
  business_scope: 'CN' | 'IN';
  title?: '创建入库单';
}> = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderList, setOrderList] = useState<any[]>([]);
  // 提交
  const updateForm = async (postData: any) => {
    const res: any = await createWarehousingByPlan(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return false;
    } else {
      setOrderList(res?.data);
      setIsModalVisible(true);
      return true;
    }
  };
  // 取消+关闭
  const modalClose = () => {
    setIsModalVisible(false);
    props?.reload();
  };
  return (
    <>
      <Modal
        width={500}
        title={'创建成功'}
        visible={isModalVisible}
        onCancel={() => modalClose()}
        destroyOnClose
        maskClosable={false}
        footer={false}
      >
        <>
          <Row style={{ marginBottom: '50px' }}>
            <Col>入库单号：</Col>
            <Col>
              {orderList.map((item: string) => (
                <p key={item}>{item}</p>
              ))}
            </Col>
          </Row>
          <Row gutter={20} style={{ marginLeft: '-10px' }}>
            <Col span={12}>
              <Button
                type="primary"
                ghost
                onClick={() => {
                  modalClose();
                }}
              >
                返回发货计划列表
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                ghost
                onClick={() => {
                  modalClose();
                  history.push(
                    props.business_scope == 'CN'
                      ? '/stock-manage/cn?type=cn'
                      : '/stock-manage/in?type=in',
                  );
                }}
              >
                前往入库单列表
              </Button>
            </Col>
          </Row>
        </>
      </Modal>
      <ModalForm
        width={400}
        title={props.title || '创建入库单'}
        layout="horizontal"
        onFinish={async (values) => {
          const postData = {
            id: props.dialogForm?.id,
            num: values.num,
          };
          return updateForm(postData);
        }}
        initialValues={{
          ...props.dialogForm,
          num: props?.dialogForm?.no_generate_warehousing_order_num,
          type_warehouse_name: `${
            pubFilter(
              props?.dicList?.SYS_PLATFORM_WAREHOUSING_PLATFORM,
              props?.dialogForm?.platform_warehousing_type,
            ) || '无类型'
          }-${props?.dialogForm?.warehouse_name}`,
        }}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
        }}
        submitter={{
          searchConfig: {
            submitText: '确定生成入库单',
          },
        }}
        className="supplier-detail"
        trigger={<a>创建入库单</a>}
      >
        <ProFormText
          hidden={props.business_scope === 'CN'}
          formItemProps={{ className: 'mb-0' }}
          name="platform_name"
          label="平台"
          readonly
        />
        <ProFormText
          hidden={props.business_scope === 'IN'}
          formItemProps={{ className: 'mb-0' }}
          name="type_warehouse_name"
          label="仓库铺"
          readonly
        />
        <ProFormText
          hidden={props.business_scope === 'CN'}
          formItemProps={{ className: 'mb-0' }}
          name="shop_name"
          label="店铺"
          readonly
        />
        <ProFormText
          formItemProps={{ className: 'mb-0' }}
          name={props.business_scope === 'CN' ? 'stock_no' : 'shop_sku_code'}
          label="SKU"
          readonly
        />
        <ProFormText
          formItemProps={{ className: 'mb-0' }}
          name="goods_sku_name"
          label="商品名称"
          readonly
        />
        <ProFormText
          formItemProps={{ className: 'mb-0' }}
          name="pics"
          label="箱规(每箱数量)"
          readonly
        />
        <ProFormDigit
          width={'sm'}
          fieldProps={{ precision: 0 }}
          min={1}
          max={9999999}
          label="入库单数量"
          name="num"
          placeholder="请输入入库单数量"
          rules={[
            pubRequiredRule,
            {
              validator: (_: any, val: any) => {
                if (val % props.dialogForm.pics == 0 || props?.business_scope === 'CN') {
                  return Promise.resolve();
                }
                return Promise.reject('非整箱, 无法提交');
              },
            },
          ]}
        />
      </ModalForm>
    </>
  );
};
export default Dialog;
