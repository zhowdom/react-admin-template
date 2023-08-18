import { useState, useRef } from 'react';
import { InputNumber, Modal, Spin } from 'antd';
import { connect } from 'umi';
import ProForm, {
  ProFormInstance,
  ProFormText,
  ProFormSelect,
  ProFormRadio,
  ProFormDependency,
} from '@ant-design/pro-form';
import {
  addSysPlatformShop,
  getSysPlatformShopById,
  updateSysPlatformShop,
} from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetPlatformList, pubGetUserList } from '@/utils/pubConfirm';
import './index.less';

const Dialog = (props: any) => {
  const { common, curItem } = props;
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
    setLoading(true);
    const paramData = {
      id: id,
    };
    const res = await getSysPlatformShopById(paramData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      res.data.status = res.data.status + '';
      res.data.shop_manager_id = res.data.sysPlatformShopUserList
        ? res.data.sysPlatformShopUserList.map((v: any) => v.shop_manager_id)
        : [];
      formRef.current?.setFieldsValue({
        ...res.data,
        business_scope: curItem?.business_scope,
        platform_id: curItem?.key,
      });
    }
    setLoading(false);
  };

  props.addModel.current = {
    open: (id: string) => {
      setIsModalVisible(true);
      setModalType(id ? 'edit' : 'add');
      if (id) {
        getDetail(id);
      } else {
        setTimeout(() => {
          formRef.current?.setFieldsValue({
            status: '1',
            business_scope: curItem?.business_scope,
            platform_id: curItem?.key,
          });
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
  // 提交
  const saveSubmit = async (data: any): Promise<any> => {
    data.source_id = data.source_id || data.source_id == 0 ? data.source_id + '' : null;
    if (modalType == 'add') {
      setLoading(true);
      const res = await addSysPlatformShop(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('添加成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    } else {
      setLoading(true);
      const res = await updateSysPlatformShop(data);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('编辑成功！', 'success');
        modalClose(false);
      }
      setLoading(false);
    }
  };
  // 改变 店长
  const changePeople = (data: any) => {
    const newPerson = data.map((v: any) => ({
      shop_manager_id: v.value,
      shop_manager_name: v.name,
    }));
    formRef.current?.setFieldsValue({ sysPlatformShopUserList: newPerson });
  };
  return (
    <Modal
      width={500}
      title={modalType == 'add' ? `新增店铺(${curItem.tab})` : `编辑店铺(${curItem.tab})`}
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      className="shop-dialog"
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
          <ProFormText name="business_scope" label="businessScope" hidden />
          <ProFormDependency name={['business_scope']}>
            {({ business_scope }) => {
              return (
                <>
                  <ProFormSelect
                    name="platform_id"
                    label="平台"
                    hidden
                    rules={[{ required: true, message: '请选择平台' }]}
                    showSearch
                    debounceTime={300}
                    fieldProps={selectProps}
                    params={{ business_scope }}
                    request={async () => {
                      const res: any = await pubGetPlatformList({ isDy: true });
                      return (
                        res.filter(
                          (v: any) =>
                            !['YUN_CANG', 'HUI_YE_CANG'].includes(v.platform_code) &&
                            v.business_scope == business_scope,
                        ) || []
                      );
                    }}
                  />
                </>
              );
            }}
          </ProFormDependency>

          <ProFormDependency name={['business_scope']}>
            {({ business_scope }) => {
              return (
                <>
                  {business_scope === 'IN' && (
                    <ProFormSelect
                      name="shop_site"
                      label="站点"
                      showSearch
                      debounceTime={300}
                      fieldProps={selectProps}
                      rules={[{ required: true, message: '请选择站点' }]}
                      valueEnum={common.dicList.SYS_PLATFORM_SHOP_SITE}
                    />
                  )}
                </>
              );
            }}
          </ProFormDependency>
          <ProFormText
            name="shop_name"
            label="店铺名称"
            rules={[{ required: true, message: '请输入店铺名称' }]}
          />
          <ProFormText
            name="shop_short_name"
            label="店铺简称"
            rules={[{ required: true, message: '请输入店铺简称' }]}
          />
          <ProFormText name="platform_shop_name" label="平台店铺名" />
          <ProForm.Item
            label="店铺编号(ERP)"
            name="source_id"
            rules={[{ pattern: /^(-)?\d+$/, message: '请输入整数' }]}
          >
            <InputNumber placeholder="请输入" />
          </ProForm.Item>

          <ProFormSelect
            mode="multiple"
            name="shop_manager_id"
            label="店长"
            rules={[{ required: true, message: '请选择店长' }]}
            request={async (v) => {
              const res: any = await pubGetUserList(v);
              return res;
            }}
            fieldProps={{
              onChange: (id, data) => {
                changePeople(data);
              },
            }}
          />
          <ProFormText name="sysPlatformShopUserList" label="店长对象" hidden />

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
