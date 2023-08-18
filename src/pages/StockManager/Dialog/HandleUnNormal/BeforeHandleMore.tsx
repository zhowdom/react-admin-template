import React, { useRef, useState } from 'react';
import { ModalForm } from '@ant-design/pro-form';
import { pubMsg } from '@/utils/pubConfig';
import { Button, Space } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useAccess } from '@@/plugin-access/access';
import CutMore from './CutMore';

const BeforeHandleMore: React.FC<{
  _ref: any;
  dataSource: Record<string, any>;
  setIsModalCreateVisible: any;
  reload: any;
  refreshKeySet: any;
}> = ({ dataSource, _ref, setIsModalCreateVisible, reload, refreshKeySet }) => {
  const access = useAccess();
  const _ref1 = useRef();
  const formRef = useRef<ProFormInstance>(); // 多收弹框form
  if (!access.canSee('stockManager_exception_handle_cn')) {
    return (
      <a onClick={() => pubMsg('您暂无处理异常的权限~')}>{dataSource.difference_num + '(多收)'}</a>
    );
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isModalVisible, setIsModalVisible] = useState(false);
  _ref.current = {
    visibileChange: (visible: boolean) => setIsModalVisible(visible),
    showCutDown: () => {
      _ref1.current.visibileChange(true, dataSource?.orderException);
    },
  };
  const num = dataSource.specificationList.reduce(
    (previousValue: any, currentValue: any) => previousValue + currentValue.pics * currentValue.num,
    0,
  );
  return (
    <>
      <ModalForm
        width={600}
        formRef={formRef}
        layout={'horizontal'}
        title="入库异常处理"
        visible={isModalVisible}
        modalProps={{
          destroyOnClose: true,
          okText: '确定创建入库单',
          onCancel: () => {
            setIsModalVisible(false);
          },
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
                  _ref1.current.visibileChange(true);
                }}
              >
                确定减去多收数量
              </Button>
              {doms[1]}
            </Space>
          ),
        }}
        onFinish={async () => {
          setIsModalCreateVisible(true);
        }}
      >
        <span style={{ color: 'red', paddingBottom: '20px' }}>
          {`实际入库数量${dataSource.warehousing_num} 大于 发货数量${num}
      ，是否创建后补入库单？`}
        </span>
      </ModalForm>
      <CutMore
        setIsModalCreateVisible={setIsModalVisible}
        _ref1={_ref1}
        order_no={dataSource.order_no}
        reload={reload}
        goods_sku_id={dataSource.goods_sku_id}
        num={dataSource.warehousing_num - num}
        refreshKeySet={refreshKeySet}
      />
    </>
  );
};

export default BeforeHandleMore;
