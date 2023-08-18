import { Button, Divider, Modal, Space } from 'antd';
import {
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubMsg, pubRequiredLengthRule } from '@/utils/pubConfig';
import { updateAddress, aiAddress } from '@/services/pages/order';
import './index.less';

const ExceptionSubmit: React.FC<{
  trigger?: JSX.Element;
  title?: string;
  ids: string[];
  common: any;
  finishHandle: any;
}> = ({ title, trigger, ids = [], common, finishHandle }) => {
  const formRef = useRef<ProFormInstance>();
  // 一键识别
  const getAiAddress = async () => {
    const aa = formRef?.current?.getFieldsValue()?.text;
    console.log(aa.value);
    aiAddress({ text: aa }).then((res) => {
      if (res?.code == '0') {
        console.log(res);
        formRef?.current?.setFieldsValue({
          receiverName: res.data.person,
          receiverMobile: res.data.phonenum,
          receiverState: res.data.province,
          receiverCity: res.data.city,
          receiverDistrict: res.data.county,
          receiverAddress: `${res.data.town}${res.data.detail}`,
        });
      } else {
        pubMsg(res?.message);
      }
    });
  };
  return (
    <ModalForm
      title={title || `修改地址`}
      trigger={trigger}
      labelAlign="right"
      labelCol={{ flex: '0 0 80px' }}
      layout="horizontal"
      width={800}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        values.orderId = ids.join(',');
        console.log(values);
        const res = await updateAddress(values);
        if (res?.code != '0') {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '提交成功', 'success');
        finishHandle(values);
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
    >
      <ProFormText
        colProps={{ span: 8 }}
        label={'姓名'}
        placeholder={'请输入姓名'}
        name={'receiverName'}
        rules={[{ required: true, message: '请输入姓名' }]}
      />
      <ProFormText
        colProps={{ span: 8 }}
        label={'电话'}
        placeholder={'请输入电话'}
        name={'receiverMobile'}
        rules={[{ required: true, message: '请输入电话' }]}
      />
      <ProFormText
        colProps={{ span: 8 }}
        label={'邮编'}
        placeholder={'请输入邮编'}
        name={'zipCode'}
      />
      <ProFormSelect
        name={'receiverState'}
        colProps={{ span: 8 }}
        label="省份"
        placeholder={'选择省份'}
        rules={[{ required: true, message: '请选择省份' }]}
        fieldProps={{
          onChange: () =>
            formRef?.current?.setFieldsValue({ receiverCity: '', receiverDistrict: '' }),
          options: common?.cityData2?.map((item: any) => ({
            label: item.label,
            value: item.label,
          })),
        }}
      />
      <ProFormDependency name={['receiverState']}>
        {({ receiverState }) => {
          const selectedProvince =
            common?.cityData2?.find((item: any) => item.label === receiverState) || {};
          const cityList =
            selectedProvince && selectedProvince.children
              ? selectedProvince.children.map((item: any) => ({
                  label: item.label,
                  value: item.label,
                }))
              : [];
          return (
            <ProFormSelect
              label="市"
              colProps={{ span: 8 }}
              name={'receiverCity'}
              placeholder={'选择城市'}
              fieldProps={{
                options: cityList,
                onChange: () => formRef?.current?.setFieldsValue({ receiverDistrict: '' }),
              }}
              rules={[{ required: true, message: '请选择城市' }]}
            />
          );
        }}
      </ProFormDependency>
      <ProFormDependency name={['receiverCity']}>
        {({ receiverCity }) => {
          const selectedArea =
            common?.cityData3?.find((item: any) => item.label === receiverCity) || {};
          const areaList =
            selectedArea && selectedArea.children
              ? selectedArea.children.map((item: any) => ({
                  label: item.label,
                  value: item.label,
                }))
              : [];
          return (
            <ProFormSelect
              label="区"
              colProps={{ span: 8 }}
              name={'receiverDistrict'}
              placeholder={'选择区'}
              fieldProps={{ options: areaList }}
              rules={[{ required: true, message: '选择区' }]}
            />
          );
        }}
      </ProFormDependency>
      <ProFormTextArea
        label={'详细地址'}
        colProps={{ span: 24 }}
        fieldProps={{
          autoSize: { minRows: 4 },
        }}
        placeholder={'请输入详细地址'}
        rules={[
          { required: true, message: '请输入详细地址' },
          {
            validator: (_, value) => pubRequiredLengthRule(value, 200),
          },
        ]}
        name={'receiverAddress'}
      />
      <Divider />
      <Space align="center" className="disting-space">
        <ProFormTextArea
          labelCol={{
            flex: '80px',
          }}
          colProps={{ span: 24 }}
          label={''}
          fieldProps={{
            autoSize: { minRows: 4 },
          }}
          placeholder={'输入地址一键识别'}
          name={'text'}
        />
        <Button onClick={() => getAiAddress()}>一键识别</Button>
      </Space>
    </ModalForm>
  );
};
export default ExceptionSubmit;
