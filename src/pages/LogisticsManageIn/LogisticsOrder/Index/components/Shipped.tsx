import { Button, Form, Modal } from 'antd';
import { ModalForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import './index.less';
import moment from 'moment';
import { atd } from '@/services/pages/logisticsManageIn/logisticsOrder';

export default (props: any) => {
  const { initialValues, disabled } = props;
  const formRef = useRef<ProFormInstance>();
  const [visible, visibleSet] = useState<boolean>(false);
  const [submitting, submittingSet] = useState<any>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postData, setPostData] = useState<any>({});
  // 二次确认确定
  const handleOk = async () => {
    submittingSet(true);
    const res: any = await atd({
      ...postData,
      atd_date: moment(postData.atd_date).format('YYYY-MM-DD 00:00:00'),
      eta_date: moment(postData.eta_date).format('YYYY-MM-DD 00:00:00'),
    });
    submittingSet(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功!', 'success');
      props.reload();
      visibleSet(false);
      setIsModalOpen(false);
    }
  };
  // 二次确认弹窗关闭
  const handleCancel = () => {
    setIsModalOpen(false);
    submittingSet(false);
  };

  return (
    <>
      <ModalForm<{
        name: string;
        company: string;
      }>
        title={'已开船'}
        formRef={formRef}
        trigger={
          initialValues ? (
            <a onClick={() => visibleSet(true)}> {props.trigger}</a>
          ) : (
            <Button ghost type="primary" onClick={() => visibleSet(true)} disabled={disabled}>
              {props.trigger}
            </Button>
          )
        }
        visible={visible}
        className="length210"
        labelAlign="right"
        labelCol={{ span: 8 }}
        layout="horizontal"
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          onCancel: () => visibleSet(false),
          okText: '确定已开船',
        }}
        initialValues={initialValues}
        width={480}
        onFinish={async (values: any) => {
          setPostData(values);
          setIsModalOpen(true);
        }}
      >
        <ProFormText name="id" label="id" hidden />
        <Form.Item label="预计开船时间ETD">
          {moment(initialValues?.etd_date).format('YYYY-MM-DD') ?? '-'}
        </Form.Item>
        <ProFormDatePicker name="delivery_date" label="实际出厂/发货/装柜时间" hidden />
        <ProFormDatePicker
          name="atd_date"
          dependencies={['delivery_date']}
          rules={[
            { required: true, message: '请选择实际开船时间ATD' },
            ({ getFieldValue }: any) => ({
              validator(_: any, value: any) {
                if (
                  !value ||
                  new Date(getFieldValue('delivery_date')).getTime() <=
                    new Date(value.format('YYYY-MM-DD 00:00:00')).getTime()
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('应大于等于实际出厂/发货/装柜时间'));
              },
            }),
          ]}
          placeholder={'请选择实际开船时间ATD'}
          label="实际开船时间ATD"
        />
        <ProFormDatePicker
          name="eta_date"
          dependencies={['atd_date']}
          rules={[
            { required: true, message: '请选择预计到港时间ETA' },
            ({ getFieldValue }: any) => ({
              validator(_: any, value: any) {
                if (
                  !value ||
                  new Date(getFieldValue('atd_date').format('YYYY-MM-DD 00:00:00')).getTime() <
                    new Date(value.format('YYYY-MM-DD 00:00:00')).getTime()
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('应大于实际开船时间'));
              },
            }),
          ]}
          placeholder={'请选择预计到港时间ETA'}
          label="预计到港时间ETA"
        />
      </ModalForm>
      <Modal
        className="common-confirm-modal"
        title={<div style={{ fontWeight: 600 }}>确定已开船吗?</div>}
        open={isModalOpen}
        onOk={handleOk}
        width={420}
        onCancel={handleCancel}
        destroyOnClose
        okButtonProps={{ loading: submitting }}
      >
        <Form name="basic" labelCol={{ span: 8 }}>
          <Form.Item label="预计开船时间ETD">
            {moment(initialValues?.etd_date).format('YYYY-MM-DD') ?? '-'}
          </Form.Item>
          <Form.Item label="实际开船时间ATD">{postData?.atd_date ?? '-'}</Form.Item>
          <Form.Item label="预计到港时间ATA">{postData?.eta_date ?? '-'}</Form.Item>
        </Form>
      </Modal>
    </>
  );
};
