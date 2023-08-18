import { useRef, useState } from 'react';
import { ModalForm } from '@ant-design/pro-form';
import { Button, Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import ConfirmYesOrNoLess from './ConfirmYesOrNoLess';

// 异常入库处理处理
const HandleUnNormal: any = (props: any) => {
  const { dataSource, reload, refreshKeySet } = props;
  const formRefLess = useRef<ProFormInstance>(); // 少收弹框form
  const [lessVisible, setLessVisible] = useState(false);
  const _ref1: any = useRef();

  return (
    <>
      <ModalForm
        width={450}
        formRef={formRefLess}
        layout={'inline'}
        title={<div style={{ fontWeight: 'bold', fontSize: '16px' }}>入库异常处理</div>}
        trigger={
          <a
            title={'点击可以处理异常'}
            onClick={() => {
              setLessVisible(true);
            }}
          >
            {dataSource.difference_num + '(少收)'}
          </a>
        }
        // onFinish={notAddAction}

        visible={lessVisible}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setLessVisible(false);
          },
          okText: '少发',
        }}
        submitter={{
          render: (data: any, doms: any) => (
            <Space>
              {doms[0]}
              <Button
                type="primary"
                key="no"
                ghost
                onClick={() => {
                  _ref1?.current?.visibileChange(true, {
                    order_no: dataSource.order_no,
                    goods_sku_id: dataSource.goods_sku_id,
                    type: '2',
                  });
                }}
              >
                未少发
              </Button>
              <Button
                type="primary"
                key="yes"
                onClick={() => {
                  _ref1?.current?.visibileChange(true, {
                    order_no: dataSource.order_no,
                    goods_sku_id: dataSource.goods_sku_id,
                    type: '1',
                  });
                }}
              >
                少发
              </Button>
            </Space>
          ),
        }}
      >
        <div style={{ marginBottom: '25px' }}>
          <div>1. 供应商少发</div>
          <div style={{ lineHeight: '28px', paddingLeft: '14px' }}>
            按实际<span style={{ color: 'red' }}>收货</span>数量，扣减采购单数量！
          </div>
        </div>
        <div>
          <div>2. 供应商未少发</div>
          <div style={{ lineHeight: '28px', paddingLeft: '14px' }}>
            按实际<span style={{ color: 'red' }}>发货</span>数量，扣减采购单数量！
          </div>
        </div>
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
