import { useState, useRef } from 'react';
import { Modal, Form, Spin } from 'antd';
import { connect } from 'umi';
// import { request } from 'umi';
import ProForm, { ProFormInstance, ProFormText } from '@ant-design/pro-form';
import {
  insert,
  getTemplateDetailById,
  updateById,
  contractDetectKeyWords,
} from '@/services/pages/contract';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
// import { pubGetSigningListAuth } from '@/utils/pubConfirm';
import UploadFileList from '@/components/PubUpload/UploadFileList';

const Dialog = (props: any) => {
  const { common } = props;
  console.log(common);
  const [keyList] = useState<any>(['1']);
  const [modalType, setModalType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();

  const [detailData, setDetailData] = useState<any>({});
  // 获取模板详情
  const getDetail = async (id: any): Promise<any> => {
    const paramData = {
      id: id,
    };
    const res = await getTemplateDetailById(paramData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      res.data.seal_key = res.data.official_seal_key ? JSON.parse(res.data.official_seal_key) : [];
      res.data.sys_files = res.data.sys_files || [];
      setDetailData(res.data);
      formRef.current?.setFieldsValue(res.data);
    }
  };

  props.addModel.current = {
    open: (id: any) => {
      setIsModalVisible(true);
      setModalType(id ? 'edit' : 'add');
      if (id) {
        getDetail(id);
      } else {
        setDetailData({});
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  // 提交
  const save = async (data: any): Promise<any> => {
    if (modalType == 'add') {
      const res = await insert(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        modalClose(false);
      }
      setLoading(false);
    } else {
      const res = await updateById(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        modalClose(false);
      }
      setLoading(false);
    }
  };
  // 提交前校验关键词
  const checkKey = async (data: any): Promise<any> => {
    const res = await contractDetectKeyWords({
      id: data.sys_files[0].id,
      partyA: data.seal_key[0]?.party_a,
      partyB: data.seal_key[0]?.party_b,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    delete data.seal_key;
    save(data);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    setLoading(true);
    const newData = JSON.parse(JSON.stringify(val));
    newData.official_seal_key = JSON.stringify(newData.seal_key);
    checkKey(newData);
  };
  // 上传结束后
  const handleUpload = async (data: any) => {
    formRef.current?.setFieldsValue({ sys_files: data });
  };
  return (
    <Modal
      width={800}
      title="上传合同模板"
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
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
          onFinishFailed={(v) => {
            console.log(v);
          }}
          labelAlign="right"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="id" label="ID" hidden />
          <ProFormText
            name="name"
            label="合同名称"
            rules={[{ required: true, message: '请选择' }]}
          />
          {/* <ProFormSelect
            name="subject_id"
            label="默认签约主体(甲方)"
            rules={[{ required: true, message: '请选择签约主体' }]}
            showSearch
            debounceTime={300}
            fieldProps={{
              filterOption: (input: any, option: any) => {
                const trimInput = input.replace(/^\s+|\s+$/g, '');
                if (trimInput) {
                  return option.label.indexOf(trimInput) >= 0;
                } else {
                  return true;
                }
              },
            }}
            request={async (v) => {
              const res: any = await pubGetSigningListAuth(v);
              return res;
            }}
          /> */}
          <Form.Item
            label="签章关键字"
            name="official_seal_key"
            rules={[{ required: true, message: '请输入签章关键字' }]}
          >
            <table className="pub-my-table-templet">
              <thead>
                <tr>
                  <th>甲方</th>
                  <th>乙方</th>
                </tr>
              </thead>
              <tbody>
                {keyList.map((item: any, index: number) => {
                  return (
                    <tr key={index}>
                      <td align="center">
                        <ProFormText
                          name={['seal_key', index, 'party_a']}
                          rules={[{ required: true, message: '请选择' }]}
                        />
                      </td>
                      <td align="center">
                        <ProFormText
                          name={['seal_key', index, 'party_b']}
                          rules={[{ required: true, message: '请选择' }]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Form.Item>
          <Form.Item
            label="上传合同"
            name="sys_files"
            rules={[{ required: true, message: '请上传合同' }]}
            extra="只支持.docx格式"
          >
            <UploadFileList
              fileBack={handleUpload}
              required
              businessType="VENDOR_LICENSE"
              listType="picture"
              accept={['.docx']}
              acceptType={['docx']}
              defaultFileList={detailData.sys_files}
              maxSize="5"
              maxCount="1"
            />
          </Form.Item>
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
