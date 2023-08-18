import { ModalForm, ProForm, ProFormDatePicker, ProFormSelect } from '@ant-design/pro-components';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { updateClosingTime } from '@/services/pages/stockManager';
import { pubGetSysPortList } from '@/utils/pubConfirm';
import { useRef, useState } from 'react';
import './index.less';
import moment from 'moment';
// 修改截仓时间
const CutOffTime: React.FC<{
  dataSource: any;
  reload: any;
  closing_time: any;
  harbor: any;
}> = ({ dataSource, reload, closing_time, harbor }) => {
  const [address, setAddress] = useState(dataSource?.harbor_addr);
  const formRef = useRef(); // 编辑物流信息drawer
  return (
    <ModalForm
      width={500}
      formRef={formRef}
      layout={'horizontal'}
      title={'修改送货信息'}
      trigger={<a>{'修改送货信息'}</a>}
      labelCol={{
        flex: '130px',
      }}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          formRef?.current?.setFieldsValue({
            closing_time: closing_time || moment(new Date()).format('YYYY-MM-DD'),
            harbor,
          });
        }
      }}
      onFinish={async (values: any) => {
        values.harbor_addr = address;
        const res = await updateClosingTime({ ...values, order_id: dataSource.id });
        if (res?.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          reload();
          return true;
        } else {
          pubMsg(res?.message);
        }
        return false;
      }}
    >
      <div style={{ marginBottom: '12px', marginLeft: '62px' }}>
        商品名称 : {dataSource.sku_name}
      </div>
      <ProFormSelect
        label={'跨境起运港仓库'}
        name={'harbor'}
        request={async () => {
          const res: any = await pubGetSysPortList({ type: 1 });
          return res.map((v: any) => {
            return {
              ...v,
              disabled: v.status != '1',
            };
          });
        }}
        rules={[pubRequiredRule]}
        onChange={(val: any, data: any) => {
          setAddress(`${data.data.province_name}${data.data.city_name}${data.data.address}`);
        }}
      />
      <ProForm.Item label={'送货地址'} className="mt-16">
        <pre>{address}</pre>
      </ProForm.Item>
      <div className="mt-28">
        <ProFormDatePicker label={'截仓时间'} name={'closing_time'} rules={[pubRequiredRule]} />
      </div>
    </ModalForm>
  );
};
export default CutOffTime;
