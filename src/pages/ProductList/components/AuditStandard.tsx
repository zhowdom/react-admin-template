import React from 'react';
import { Button } from 'antd';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { updateGoodsReviewStandard, getReviewStandard } from '@/services/pages/productList';

const AuditStandard: React.FC<{
  reload: any;
  dicList: any;
}> = ({ reload, dicList }) => {
  return (
    <ModalForm
      title="产品自动评审标准"
      trigger={<Button type={'primary'}>产品自动评审标准</Button>}
      layout="horizontal"
      width={450}
      modalProps={{
        okText: '保存',
      }}
      validateTrigger="onBlur"
      onFinish={async (values: any) => {
        const res: any = await updateGoodsReviewStandard(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res.message);
          return false;
        }
        pubMsg('修改成功！', 'success');
        if (reload) reload();
        return true;
      }}
      request={async () => {
        const res = await getReviewStandard();
        if (res?.code == pubConfig.sCode) {
          return res.data;
        } else {
          pubMsg('获取评审周期失败, ' + res.message);
          return { day: null };
        }
      }}
    >
      <ProFormSelect
        label={'评审周期'}
        name={'day'}
        fieldProps={{ allowClear: false }}
        rules={[pubRequiredRule]}
        valueEnum={dicList?.GOODS_REVIEW_CYCLE || {}}
        extra={<>1、测试期自动评审规则同时影响生命周期和sku销售状态<br/>2、评审周期指首次入库时间或上次评审时间距离当前时间天数</>}
      />
    </ModalForm>
  );
};
export default AuditStandard;
