import { Button, Form, Modal } from 'antd';
import { ModalForm, ProFormDatePicker, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import './index.less';
import { ata } from '@/services/pages/logisticsManageIn/logisticsOrder';
import moment from 'moment';

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
    const res: any = await ata({
      ...postData,
      ata_date: moment(postData.ata_date).format('YYYY-MM-DD 00:00:00'),
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
        title={'已到港'}
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
          confirmLoading: submitting,
          okText: '确定已到港',
        }}
        initialValues={initialValues}
        width={480}
        onFinish={async (values: any) => {
          setPostData(values);
          setIsModalOpen(true);
        }}
      >
        <ProFormText name="id" label="id" hidden />
        <ProFormDatePicker name="atd_date" label="实际开船时间" hidden />
        <Form.Item label="预计到港时间ETA">
          {initialValues?.eta_date ? moment(initialValues?.eta_date).format('YYYY-MM-DD') : '-'}
        </Form.Item>
        <ProFormDatePicker
          name="ata_date"
          rules={[
            { required: true, message: '请选择实际到港时间ATA' },
            ({ getFieldValue }: any) => ({
              validator(_: any, value: any) {
                if (
                  !value ||
                  new Date(getFieldValue('atd_date')).getTime() <
                    new Date(value.format('YYYY-MM-DD 00:00:00')).getTime()
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('不可以早于实际开船时间'));
              },
            }),
          ]}
          placeholder={'请选择实际到港时间ATA'}
          label="实际到港时间ATA"
        />
      </ModalForm>
      <Modal
        className="common-confirm-modal"
        title={<div style={{ fontWeight: 600 }}>确定已到港吗?</div>}
        open={isModalOpen}
        onOk={handleOk}
        width={420}
        onCancel={handleCancel}
        destroyOnClose
        okButtonProps={{ loading: submitting }}
      >
        <Form name="basic" labelCol={{ span: 8 }}>
          <Form.Item label="预计到港时间ETA">
            {initialValues?.eta_date ? moment(initialValues?.eta_date).format('YYYY-MM-DD') : '-'}
          </Form.Item>
          <Form.Item label="实际到港时间ATA">{postData?.ata_date ?? '-'}</Form.Item>
        </Form>
      </Modal>
    </>
  );
};
