import { Col, Modal, Row } from 'antd';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { updateVendorGrade } from '@/services/pages/supplier';
import PubDingDept from '@/components/PubForm/PubDingDept';

export default (props: any) => {
  const {title,dicList,data} = props;
  const formItemLayout = {
    labelCol: { span: 6  },
    wrapperCol: { span: 14 },
  };

  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="设置供应商等级"
      trigger={<a key={'supplier_level_a'}>{title}</a>}
      labelAlign="right"
      {...formItemLayout}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={400}
      initialValues={{ ids: props?.data?.id } || {}}
      onFinish={async (values: any) => {
        console.log(values)
        const res = await updateVendorGrade(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功!', 'success');
          props._ref?.current?.reload();
          return true;
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
    <ProFormText
      name="ids"
      label="id"
      hidden
    />
    <ProFormSelect
      name="vendor_grade_old"
      label="修改前等级"
      valueEnum={dicList?.VENDOR_GRADE}
      initialValue={data?.vendor_grade}
      placeholder="--"
      readonly
    />
    <ProFormSelect
      name="vendor_grade"
      label="修改后等级"
      valueEnum={dicList?.VENDOR_GRADE}
      placeholder="--"
    />
    </ModalForm>
  );
};
