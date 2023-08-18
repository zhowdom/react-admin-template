import { useState, useRef } from 'react';
import { Modal, Form, Spin } from 'antd';
import { connect } from 'umi';
import ProForm, { ProFormInstance, ProFormText, ProFormSelect } from '@ant-design/pro-form';
import {
  addSysImportTemplate,
  getSysImportTemplateById,
  updateSysImportTemplate,
} from '@/services/pages/settinsTemplateDown';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import UploadFileList from '@/components/PubUpload/UploadFileList';

const Dialog = (props: any) => {
  const { common } = props;
  console.log(common);
  const [modalType, setModalType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const [detail, setDetail] = useState({
    sys_file: [], //附件
  });

  // 获取ID详情
  const getDetail = async (id: any): Promise<any> => {
    const paramData = {
      id: id,
    };
    const res = await getSysImportTemplateById(paramData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      formRef.current?.setFieldsValue(res.data);
      setDetail(res.data);
    }
  };

  props.addModel.current = {
    open: (id: any) => {
      setIsModalVisible(true);
      setModalType(id ? 'edit' : 'add');
      if (id) {
        getDetail(id);
      } else {
        setTimeout(() => {
          setDetail({ sys_file: [] });
        }, 1);
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

  // 模板名称
  const changeRegion = (val: any, option: any) => {
    formRef.current?.setFieldsValue({ template_name: option.label });
  };

  // 提交
  const saveSubmit = async (data: any): Promise<any> => {
    if (modalType == 'add') {
      setLoading(true);
      const res = await addSysImportTemplate(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('添加成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    } else {
      console.log(456);
      setLoading(true);
      const res = await updateSysImportTemplate(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('编辑成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    }
  };
  // 上传结束后
  const handleUpload = async (data: any) => {
    console.log(data);
    formRef.current?.setFieldsValue({ sys_file: data });
  };
  return (
    <Modal
      width={600}
      title={modalType == 'add' ? '新增导入模板' : '编辑导入模板'}
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
            console.log(123);
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
          <ProFormSelect
            name="template_code"
            label="模板类型"
            rules={[{ required: true, message: '请选择模板类型' }]}
            valueEnum={common.dicList.SYS_IMPORT_TEMPLATE_TYPE}
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
              onChange: (v, option) => changeRegion(v, option),
            }}
          />
          <ProFormText name="template_name" label="模板名称" hidden />
          <Form.Item
            label="上传模板"
            name="sys_file"
            rules={[{ required: true, message: '请上传上传模板' }]}
            extra="只支持.xlsx,.xls格式"
          >
            <UploadFileList
              fileBack={handleUpload}
              required
              businessType="SYS_IMPORT_TEMPLATE"
              listType="picture"
              accept={['.xlsx,.xls,.csv']}
              acceptType={['xlsx', 'xls', 'csv']}
              maxSize="5"
              maxCount="1"
              defaultFileList={detail.sys_file}
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
