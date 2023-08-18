import { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import { connect } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import {
  stockUpAdviceWithdraw,
  stockUpAdviceReject,
  stockUpAdviceVoided,
} from '@/services/pages/stockUpIn/stockUp/suggestList';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const { reload, goNext } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, modalTypeSet] = useState('');  // ZF 作废建议   TH 批量退回  CH 撤回
  let fromWhere: any = ''


  const formRef = useRef<ProFormInstance>();
  props.aduitNoModel.current = {
    open: (codes: any, type: string, from: string) => {
      setIsModalVisible(true);
      fromWhere = from
      modalTypeSet(type);
      if (codes) {
        setTimeout(() => {
          formRef?.current?.setFieldsValue({ code: codes });
        }, 200);
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val?: any) => {
    setIsModalVisible(false);
    if (val) {
      if (fromWhere == 'fromDetail') {
        if (modalType == 'TH' || modalType == 'ZF') {
          goNext();
        } else {
          reload();
        }
      } else if (fromWhere == 'fromPage') {
        reload();
      }
    };
  };
  // 提交
  const saveSubmit = async (val: any) => {
    setLoading(true);
    let res: any = null;
    if (modalType == 'ZF') {
      res = await stockUpAdviceVoided(val);
    } else if (modalType == 'TH') {
      res = await stockUpAdviceReject(val);
    } else if (modalType == 'CH') {
      res = await stockUpAdviceWithdraw(val);
    }
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('操作成功！', 'success');
      modalClose(true);
    }
    setLoading(false);
  };

  return (
    <Modal
      width={600}
      title={modalType == 'ZF' ? '作废建议' : modalType == 'TH' ? '批量退回' : '撤回'}
      open={isModalVisible}
      onOk={modalOk}
      onCancel={() => modalClose()}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          labelWrap
          submitter={false}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          <ProFormText name="code" label="code" hidden />
          <ProFormTextArea
            name="reason"
            label="原因"
            placeholder="请输入原因"
            rules={[{ required: true, message: '请输入原因' }]}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
