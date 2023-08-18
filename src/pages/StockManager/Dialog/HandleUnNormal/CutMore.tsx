import React, { useRef, useState } from 'react';
import ProForm, { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-components';
import { warehouseingManyException } from '@/services/pages/stockManager';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

// 异常入库处理处理
const HandleUnNormal: React.FC<{
  _ref1: any;
  reload: any;
  setIsModalCreateVisible: any;
  num: any;
  order_no: any;
  goods_sku_id: any;
  refreshKeySet: any;
}> = ({ _ref1, reload, setIsModalCreateVisible, num, order_no, goods_sku_id, refreshKeySet }) => {
  const formRef = useRef<ProFormInstance>(); // 多收弹框form
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState<any>();
  _ref1.current = {
    visibileChange: (visible: boolean, dataC?: any) => {
      console.log(dataC);
      setIsModalVisible(visible);
      if (dataC) {
        setData(dataC);
      }
    },
  };
  return (
    <ModalForm
      width={600}
      formRef={formRef}
      layout={'horizontal'}
      title={data ? '详情' : '确定减去多收数量'}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setIsModalVisible(false);
        },
      }}
      className={data ? 'item8' : ''}
      submitter={data ? false : undefined}
      initialValues={data}
      labelCol={{ flex: '130px' }}
      visible={isModalVisible}
      onFinish={async (values: any) => {
        const postData = JSON.parse(JSON.stringify(values));
        postData.order_no = order_no;
        postData.goods_sku_id = goods_sku_id;
        const res = await warehouseingManyException(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('提交成功！', 'success');
          setIsModalCreateVisible(false);
          if (reload) reload();
          if (refreshKeySet) refreshKeySet(Date.now);
        }
      }}
    >
      <ProForm.Item label="多收数量">{data?.num || num}</ProForm.Item>
      <ProFormText
        readonly={data}
        name="associated_order_no"
        label="关联单据号"
        rules={[{ required: !data, message: `请输入费用类型` }]}
      />

      <ProFormTextArea
        name="remark"
        readonly={data}
        label="减去多收数量原因："
        placeholder={`请输入原因`}
        rules={[{ required: !data, message: `请输入原因` }]}
      />
    </ModalForm>
  );
};

export default HandleUnNormal;
