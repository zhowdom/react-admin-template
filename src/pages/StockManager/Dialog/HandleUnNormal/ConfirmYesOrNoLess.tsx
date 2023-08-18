import React, { useState } from 'react';
import { ModalForm } from '@ant-design/pro-form';
import {
  warehouseExceptionHandling,
  warehouseingNoLack,
  warehouseingLackExceptionByCn,
} from '@/services/pages/stockManager';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

// 异常入库处理处理
const HandleUnNormal: React.FC<{
  _ref1: any;
  reload: any;
  setLessVisible: any;
  refreshKeySet: any;
}> = ({ _ref1, reload, setLessVisible, refreshKeySet }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState<any>();
  const obj = {
    '1': '确定供应商少发？', // 跨境
    '2': '确定供应商没有少发？', // 跨境
    '3': '确定提交吗？', // 国内
  };
  _ref1.current = {
    visibileChange: (visible: boolean, dataC?: any) => {
      setIsModalVisible(visible);
      if (dataC) {
        setData(dataC);
      }
    },
  };
  return (
    <ModalForm
      width={400}
      layout={'horizontal'}
      title={'提示'}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {
          setIsModalVisible(false);
        },
      }}
      initialValues={data}
      labelCol={{ flex: '130px' }}
      open={isModalVisible}
      onFinish={async () => {
        const res =
          data?.type == '1'
            ? await warehouseExceptionHandling(data)
            : data?.type == '2'
            ? await warehouseingNoLack(data)
            : await warehouseingLackExceptionByCn(data);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功！', 'success');
          setLessVisible(false);
          if (reload) reload();
          if (refreshKeySet) refreshKeySet(Date.now);
          setIsModalVisible(false);
          return true;
        }
      }}
    >
      <p>
        <p>{obj[data?.type]}</p>
      </p>
    </ModalForm>
  );
};

export default HandleUnNormal;
