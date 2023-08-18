import { Divider, Modal } from 'antd';
import {
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { pubConfig, pubMsg, pubRequiredLengthRule } from '@/utils/pubConfig';
import { insert, update, binding } from '@/services/pages/shipment/warehousecN';
import './index.less';

const Component: React.FC<{
  reload: any;
  tabStatus: any;
  _ref: any;
  common: any;
}> = ({ _ref, reload, tabStatus, common }) => {
  const formRef = useRef<ProFormInstance>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialValues, setInitialValues] = useState<any>();
  _ref.current = {
    visibileChange: (visible: boolean, record: any) => {
      setInitialValues(record);
      setTimeout(() => {
        setIsModalVisible(visible);
      }, 100);
    },
  };
  return (
    <ModalForm
      title={
        initialValues
          ? initialValues?.handleType == 'edit'
            ? '编辑'
            : '奇门仓库绑定'
          : '新增奇门仓库'
      }
      labelAlign="right"
      className={initialValues ? 'disabled-style' : ''}
      labelCol={{ flex: '0 0 90px' }}
      layout="horizontal"
      width={800}
      grid
      visible={isModalVisible}
      modalProps={{
        okText: initialValues?.handleType == 'bind' ? '绑定' : '确定',
        destroyOnClose: true,
        maskClosable: false,
        onCancel: () => {
          setIsModalVisible(false);
        },
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        let api = insert;
        values.platform_code = tabStatus;
        if (initialValues?.handleType == 'edit') {
          values.id = initialValues.id;
          api = update;
        } else if (initialValues?.handleType == 'bind') {
          values.id = initialValues.id;
          api = binding;
        }
        const res = await api(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubMsg(res?.message || '操作成功', 'success');
        reload();
        setIsModalVisible(false);
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
      initialValues={initialValues ? { ...initialValues, status: initialValues?.status + '' } : {}}
    >
      <ProFormText hidden name="id" label="id" />
      <ProFormText
        colProps={{ span: 12 }}
        name="warehouse_name"
        disabled={initialValues?.handleType == 'bind'}
        label="仓库名称"
        fieldProps={{ maxLength: 200 }}
        rules={[{ required: true, message: '请输入仓库名称' }]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="warehouse_code"
        label="仓库代码"
        disabled={initialValues?.handleType == 'bind'}
        fieldProps={{ maxLength: 200 }}
        rules={[{ required: true, message: '请输入仓库代码' }]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="contacts"
        disabled={initialValues?.handleType == 'bind'}
        label="仓库联系人"
        fieldProps={{ maxLength: 200 }}
        rules={[{ required: true, message: '请输入仓库联系人' }]}
      />
      <ProFormText
        colProps={{ span: 12 }}
        name="phone"
        label="联系电话"
        disabled={initialValues?.handleType == 'bind'}
        fieldProps={{ maxLength: 200 }}
        rules={[{ required: true, message: '请输入联系电话' }]}
      />
      <ProFormSelect
        name={'province'}
        colProps={{ span: 8 }}
        label="仓库地址"
        disabled={initialValues?.handleType == 'bind'}
        placeholder={'选择省份'}
        rules={[{ required: true, message: '请选择省份' }]}
        fieldProps={{
          onChange: () => formRef?.current?.setFieldsValue({ city: '', area: '' }),
          options: common?.cityData2?.map((item: any) => ({
            label: item.label,
            value: item.label,
          })),
        }}
      />
      <ProFormDependency name={['province']}>
        {({ province }) => {
          const selectedProvince =
            common?.cityData2?.find((item: any) => item.label === province) || {};
          const cityList =
            selectedProvince && selectedProvince.children
              ? selectedProvince.children.map((item: any) => ({
                  label: item.label,
                  value: item.label,
                }))
              : [];
          return (
            <ProFormSelect
              label=""
              labelCol={{ flex: 0 }}
              colProps={{ span: 8 }}
              name={'city'}
              disabled={initialValues?.handleType == 'bind'}
              placeholder={'选择城市'}
              fieldProps={{
                options: cityList,
                onChange: () => formRef?.current?.setFieldsValue({ area: '' }),
              }}
              rules={[{ required: true, message: '请选择城市' }]}
            />
          );
        }}
      </ProFormDependency>
      <ProFormDependency name={['city']}>
        {({ city }) => {
          const selectedArea = common?.cityData3?.find((item: any) => item.label === city) || {};
          const areaList =
            selectedArea && selectedArea.children
              ? selectedArea.children.map((item: any) => ({
                  label: item.label,
                  value: item.label,
                }))
              : [];
          return (
            <ProFormSelect
              label=""
              labelCol={{ flex: 0 }}
              colProps={{ span: 8 }}
              name={'area'}
              placeholder={'选择区'}
              disabled={initialValues?.handleType == 'bind'}
              fieldProps={{ options: areaList }}
              rules={[{ required: true, message: '选择区' }]}
            />
          );
        }}
      </ProFormDependency>
      <div style={{ paddingLeft: '90px', width: '100%' }}>
        <ProFormTextArea
          label=""
          colProps={{ span: 24 }}
          name="address"
          fieldProps={{
            autoSize: { minRows: 4 },
            disabled: initialValues?.handleType == 'bind',
          }}
          placeholder={'请输入详细地址'}
          rules={[
            { required: true, message: '请输入详细地址' },
            {
              validator: (_, value) => pubRequiredLengthRule(value, 200),
            },
          ]}
        />
      </div>
      <ProFormRadio.Group
        name="status"
        label="状态"
        disabled={initialValues?.handleType == 'bind'}
        placeholder="请选择状态"
        rules={[{ required: true, message: '请选择状态' }]}
        valueEnum={common.dicList.SYS_ENABLE_STATUS}
      />

      {initialValues?.handleType == 'bind' && (
        <>
          <Divider />
          <ProFormText
            colProps={{ span: 12 }}
            name="app_key"
            label="appKey"
            fieldProps={{ maxLength: 200 }}
            rules={[{ required: true, message: '请输入appKey' }]}
          />
          <ProFormText
            colProps={{ span: 12 }}
            name="customer_id"
            label="货主ID"
            fieldProps={{ maxLength: 200 }}
            rules={[{ required: true, message: '请输入货主ID' }]}
          />
          <ProFormText
            colProps={{ span: 12 }}
            name="qimen_warehouse_code"
            label="仓库编码"
            fieldProps={{ maxLength: 200 }}
            rules={[{ required: true, message: '请输入仓库编码' }]}
          />
          <ProFormText
            colProps={{ span: 12 }}
            name="qimen_warehouse_name"
            label="仓库名称"
            fieldProps={{ maxLength: 200 }}
            rules={[{ required: true, message: '请输入仓库名称' }]}
          />
        </>
      )}
    </ModalForm>
  );
};
export default Component;
