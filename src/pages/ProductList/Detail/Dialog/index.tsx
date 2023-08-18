import { Modal } from 'antd';
import { useCallback, useState } from 'react';
import { connect } from 'umi';
import Price from './Price';
import OnSale from './OnSale';
import Spec from './Spec';
import WarehouseRecord from './WarehouseRecord';
import Size from './Size';

const Dialog = (props: any) => {
  const [visible, setVisible] = useState(false);
  props.ref2.current = {
    visibleChange: useCallback(() => setTimeout(() => setVisible((pre: boolean) => !pre), 200), []),
  };
  return (
    <Modal
      footer={false}
      width="1000px"
      title={
        props.type === 'price'
          ? '供应商报价'
          : props.type === 'onSale'
          ? '上架详情'
          : props.type === 'warehousingRecord'
          ? '入库记录'
          : props.type === 'size'
          ? '产品尺寸类型查询'
          : '规格详情'
      }
      visible={visible}
      onCancel={() => setVisible(false)}
      destroyOnClose
      maskClosable={false}
    >
      <>
        {props.type === 'price' && <Price data={props?.dialogData} />}
        {props.type === 'onSale' && (
          <OnSale data={props?.dialogData} business_scope={props?.business_scope} />
        )}
        {props.type === 'spec' && <Spec data={props?.dialogData} />}
        {props.type === 'warehousingRecord' && (
          <WarehouseRecord data={props?.dialogData} business_scope={props?.business_scope} />
        )}
        {props.type === 'size' && <Size data={props?.dialogData} />}
      </>
    </Modal>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
