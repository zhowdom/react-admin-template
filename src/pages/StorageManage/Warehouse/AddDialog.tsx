import { useState, useRef } from 'react';
import { Form, Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProForm, {
  ProFormInstance,
  ProFormText,
  ProFormSelect,
  ProFormRadio,
  ProFormTextArea,
} from '@ant-design/pro-form';
import {
  addSysPlatformWarehousing,
  getSysPlatformWarehousingById,
  updateSysPlatformWarehousing,
} from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetPlatformList, pubGetPlatformRegion } from '@/utils/pubConfirm';

const Dialog = (props: any) => {
  const { common } = props;
  const [modalType, setModalType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();

  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };

  // 获取ID详情
  const getDetail = async (id: any): Promise<any> => {
    const paramData = {
      id: id,
    };
    const res = await getSysPlatformWarehousingById(paramData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      res.data.status = res.data.status + '';
      res.data.region_id = res.data.region_id + '';
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
        setTimeout(() => {
          formRef.current?.setFieldsValue({ status: '1' });
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

  // 改变仓库区域
  // const changeRegion = (val: any, option: any) => {
  //   formRef.current?.setFieldsValue({ region: option.label });
  // };

  // 提交
  const saveSubmit = async (data: any): Promise<any> => {
    if (modalType == 'add') {
      setLoading(true);
      const res = await addSysPlatformWarehousing(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('添加成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    } else {
      setLoading(true);
      const res = await updateSysPlatformWarehousing(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('编辑成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    }
  };
  return (
    <Modal
      width={600}
      title={modalType == 'add' ? '新增仓库' : '编辑仓库'}
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
          <ProFormSelect
            name="platform_id"
            label="平台"
            readonly={modalType != 'add'}
            rules={[{ required: true, message: '请选择平台' }]}
            showSearch
            debounceTime={300}
            fieldProps={{
              ...selectProps,
              onChange: async () => {
                formRef.current?.setFieldsValue({
                  region_id: null,
                });
              },
            }}
            request={async () => {
              const res: any = await pubGetPlatformList({ business_scope: 'CN' });
              const newRes =
                modalType == 'add'
                  ? res.filter((v: any) => !['1552846034395881473'].includes(v.value))
                  : res.filter((v: any) => !['1552846034395881473'].includes(v.value));
              return newRes;
            }}
          />
          <Form.Item noStyle shouldUpdate>
            {(form) => {
              const platform_id = form.getFieldValue('platform_id');
              return (
                <ProFormSelect
                  readonly={modalType != 'add'}
                  name="region_id"
                  label="仓库区域"
                  rules={[{ required: true, message: '请选择仓库区域' }]}
                  params={{
                    id: platform_id,
                  }}
                  request={async (v) => {
                    if (!v.id) {
                      return [];
                    }
                    const res: any = await pubGetPlatformRegion({
                      ...v,
                    });
                    return res;
                  }}
                />
              );
            }}
          </Form.Item>

          <ProFormText
            name="warehousing_name"
            label="仓库名称"
            rules={[{ required: true, message: '请输入仓库名称' }]}
          />
          <ProFormText
            name="contacts"
            label="仓库联系人"
            rules={[{ required: true, message: '请输入仓库联系人' }]}
          />
          <ProFormText
            name="phone"
            label="联系人电话"
            rules={[{ required: true, message: '请输入联系人电话' }]}
          />
          <ProFormTextArea
            name="address"
            label="仓库详细地址"
            rules={[{ required: true, message: '请输入仓库详细地址' }]}
          />
          <ProFormTextArea name="remarks" label="备注" />
          <ProFormRadio.Group
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
            valueEnum={common.dicList.SYS_ENABLE_STATUS}
          />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
