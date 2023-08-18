import { useState } from 'react';
import { Button, Col, Modal, Row, Spin } from 'antd';
import { history } from 'umi';
import { createWarehousingByPlan, mergeCreateWarehousingByPlanYunCang, mergeCreateWarehousingByPlanIn } from '@/services/pages/deliveryPlan';
import { pubConfig, pubMsg, pubAlert } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const {
    type,
    ids,
    title,
    selectData,
    reload,
    approval_status,
    isOptions,
    business_scope,
    hideBtn,
    setVisible,
    isMerge = false, // 是否合并创建入库单
  } = props; // isOptions是否批量操作
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderList, setOrderList] = useState<any[]>([]);

  // 创建入库单
  const entryAction = async () => {
    setLoading(true);
    const pid = ids.join(',');
    let api = createWarehousingByPlan
    if (isMerge) {
      if (business_scope == 'CN') {
        api = mergeCreateWarehousingByPlanYunCang
      } else {
        api = mergeCreateWarehousingByPlanIn
      }
    }
    const res: any = await api({ id: pid });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setOrderList(res?.data);
      setIsModalVisible(true);
    }
  };

  const open = () => {
    if (isOptions) {
      console.log(approval_status, 'approval_status')
      if (selectData.every((item: any) => approval_status.includes(item.approval_status))) {
        entryAction();
      } else {
        switch (type) {
          case 'createWarehousingByPlan': //createWarehousingByPlan-创建入库单  approval_status 3
            pubAlert('只有"审核通过"或"部分生成入库单"状态才可创建入库单,请重新选择发货计划！');
            break;
        }
      }
    } else {
      entryAction();
    }
  };
  // 取消+关闭
  const modalClose = () => {
    setIsModalVisible(false);
    reload();
  };

  return (
    <>
      {!hideBtn ? (
        isOptions ? (
          <Button disabled={!ids?.length} loading={loading} onClick={() => open()}>
            {title}
          </Button>
        ) : (
          <a onClick={() => open()}>{title}</a>
        )
      ) : (
        <></>
      )}
      <Modal
        width={500}
        title={'创建成功'}
        visible={isModalVisible}
        onCancel={() => modalClose()}
        destroyOnClose
        maskClosable={false}
        footer={false}
      >
        <Spin spinning={loading}>
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
                    if (setVisible) setVisible(false);
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
                    if (setVisible) setVisible(false);
                    modalClose();
                    setTimeout(() => {
                      history.push(
                        business_scope == 'CN'
                          ? '/stock-manage/cn?type=cn'
                          : '/stock-manage/in?type=in',
                      );
                    }, 500);
                  }}
                >
                  前往入库单列表
                </Button>
              </Col>
            </Row>
          </>
        </Spin>
      </Modal>
    </>
  );
};

export default Dialog;
