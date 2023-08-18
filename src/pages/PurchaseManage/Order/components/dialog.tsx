import { useRef, useState } from 'react';
import { Button, Drawer, Modal, Space } from 'antd';
import { connect } from 'umi';
import Detail from './DeliveryDetail';
import Deduction from './deduction';
import AskPayment from './AskPayment';
import Turn from './Turn';
import OrderLog from './OrderLog';
import ProcessLog from './ProcessLog';
// 入库明细 弹框
const Dialog = (props: any) => {
  const _ref: any = useRef();
  const onSubmit = () => {
    _ref?.current?.submit();
  };
  const [loading, setLoading] = useState(false);
  const titles = {
    detail: '入库明细',
    addDeduction: '采购单扣款',
    askPayment: '采购请款',
    turn: '采购单转出',
    orderLog: '采购单修改记录',
    processLog: '状态流转记录',
  };
  const toggleLoading = () => {
    setLoading((pre: boolean) => !pre);
  };
  return !props?.items?.drawer ? (
    <Modal
      footer={
        props.titleKey === 'askPayment' ? (
          <Space>
            <Button onClick={() => props.handleClose()}>取消</Button>
            <Button onClick={onSubmit} type="primary" loading={loading} disabled={loading}>
              {loading ? '提交中' : '确定'}
            </Button>
          </Space>
        ) : (
          false
        )
      }
      width={
        ['turn', 'addDeduction'].includes(props.titleKey)
          ? 600
          : props.titleKey == 'detail'
          ? '85%'
          : 1400
      }
      title={
        props.titleKey == 'detail'
          ? props.items.business_scope == 'CN'
            ? '入库明细（国内）'
            : '入库明细（跨境）'
          : titles[props.titleKey]
      }
      open={props.isModalVisible}
      onCancel={() => props.handleClose()}
      destroyOnClose
      maskClosable={false}
    >
      <>
        {props.titleKey === 'askPayment' && (
          <AskPayment
            toggleLoading={toggleLoading}
            dicList={props?.dicList}
            handleClose={props.handleClose}
            refAsk={_ref}
            items={props.items}
          />
        )}
        {props.titleKey === 'turn' && <Turn handleClose={props.handleClose} items={props.items} />}
        {props.titleKey === 'processLog' && <ProcessLog items={props.items} />}
        {props.titleKey === 'orderLog' && <OrderLog items={props.items} />}
        {props.titleKey === 'addDeduction' && (
          <Deduction items={props.items} dicList={props.dicList} handleClose={props.handleClose} />
        )}
        {props.titleKey === 'detail' && <Detail items={props.items} />}
      </>
    </Modal>
  ) : (
    <Drawer
      title={titles[props.titleKey]}
      width={1200}
      destroyOnClose
      onClose={() => props.handleClose()}
      visible={props.isModalVisible}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        props.titleKey === 'askPayment' ? (
          <Space>
            <Button onClick={() => props.handleClose()}>取消</Button>
            <Button onClick={onSubmit} type="primary" loading={loading} disabled={loading}>
              {loading ? '提交中' : '确定'}
            </Button>
          </Space>
        ) : (
          false
        )
      }
    >
      {props.titleKey === 'askPayment' && (
        <AskPayment
          toggleLoading={toggleLoading}
          dicList={props?.dicList}
          handleClose={props.handleClose}
          refAsk={_ref}
          items={props.items}
        />
      )}
    </Drawer>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
