import { connect, history, useAccess } from 'umi';
import { useState, useRef } from 'react';
import { Button, Modal, Form } from 'antd';
import { ProFormSelect } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormDependency, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { pubGetUserList } from '@/utils/pubConfirm';
import { pubRequiredRule } from '@/utils/pubConfig';

const AddSupplier = (props: any) => {
  const access = useAccess();
  const { dispatch, dicList } = props;

  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [license_file, setLicense_files] = useState<any>();
  // 设置图片识别数据
  const setAbout = (updateData: any) => {
    console.log(updateData, 'updateData');
    formRef?.current?.setFieldsValue({
      ...updateData,
    });
  };

  // 图片识别
  const handleUpload = (files: any, init: boolean) => {
    const file = files.filter((v: any) => v.delete != 1);
    setAbout({
      license_files: file.length ? files : [],
    });
    if (!init && file.length) {
      dispatch({
        type: 'supplier/businessLicenseAction',
        payload: {
          imageId: file?.[0]?.id,
        },
        callback: (data: any) => {
          const postData = { ...data };
          setAbout(postData);
        },
      });
    }
  };
  // 表单提交
  const handleOk = () => {
    formRef?.current?.submit();
  };
  // 新增产品线
  const addForm = (postData: any) => {
    dispatch({
      type: 'supplier/addFormAction',
      payload: postData,
      callback: (data: any) => {
        if (data) {
          setLoading(false);
          props.handleClose();
          setLicense_files([]);
          if (access.canSee('supplier_add')) {
            setTimeout(() => {
              history.push(`/supplier-manage/basic?id=${data}`);
            }, 500);
          }
        } else {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Modal
      bodyStyle={{ maxHeight: '68vh' }}
      width={600}
      title="供应商基础信息"
      visible={props.state.isModalVisible}
      onOk={handleOk}
      footer={
        <div style={{ fontSize: 13, lineHeight: '24px', paddingBottom: '15px' }}>
          <p style={{ textAlign: 'left', color: '#a8a8a8' }}>
            温馨提示
            <br />
            1. 本次提交为首次创建供应商,审核通过后需要完善供应商其他资料
            <br />
            2. 创建的信息可以在审核成功后重新编辑
          </p>
          <Button
            key="back"
            onClick={() => {
              formRef?.current?.setFieldsValue({
                license_files: [],
              });
              setLicense_files([]);
              props.handleClose();
            }}
          >
            取消
          </Button>
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            loading={loading}
            disabled={loading}
          >
            {loading ? '提交中' : '保存'}
          </Button>
        </div>
      }
      onCancel={() => {
        formRef?.current?.setFieldsValue({
          license_files: [],
        });
        setLicense_files([]);
        props.handleClose();
      }}
      destroyOnClose
      maskClosable={false}
    >
      <ProForm
        onFinish={async (values) => {
          console.log(values);
          setLoading(true);
          const postData = {
            ...values,
            liability_name: values.liabilityName?.name || null,
            liability_id: values.liabilityName?.value || null,
            license_files: values?.license_files || [],
          };
          const file = values?.license_files.filter((v: any) => v.delete != 1) || [];
          setLicense_files(file);
          addForm(postData);
        }}
        onFinishFailed={() => {
          Modal.warning({
            title: '提示',
            content: '请检查表单信息正确性',
          });
        }}
        labelAlign="right"
        labelCol={{ flex: '132px' }}
        wrapperCol={{ flex: '400px' }}
        submitter={false}
        formRef={formRef}
        initialValues={props.state.dialogForm}
        layout="horizontal"
      >
        <ProFormSelect
          name="business_scope"
          label="业务范畴"
          showSearch
          rules={[pubRequiredRule]}
          valueEnum={dicList.SYS_BUSINESS_SCOPE}
        />
        <ProFormText
          name="user_mobile"
          label="供应商手机号"
          placeholder="请输入供应商手机号"
          rules={[
            { required: true, message: '请输入供应商手机号' },
            { pattern: /^[1][0-9]{10}$/, message: '请输入正确格式手机号' },
          ]}
        />
        <ProFormSelect
          name="liabilityName"
          label="对接开发:"
          showSearch
          debounceTime={300}
          rules={[
            { required: true, message: '请选择供应商对接开发' },
            ({}) => ({
              validator(_, value) {
                if (JSON.stringify(value) === '{}') {
                  return Promise.reject(new Error('请选择供应商对接开发'));
                }
                return Promise.resolve();
              },
            }),
          ]}
          fieldProps={{
            filterOption: (input: any, option: any) => {
              const trimInput = input.replace(/^\s+|\s+$/g, '');
              if (trimInput) {
                return option.label.indexOf(trimInput) >= 0;
              } else {
                return true;
              }
            },
            labelInValue: true,
          }}
          request={async (v) => {
            const res: any = await pubGetUserList(v);
            return res;
          }}
        />
        <Form.Item
          label="供应商营业执照"
          name="license_files"
          rules={[{ required: true, message: '请上传供应商营业执照' }]}
          extra="只支持.jpg ,.png格式"
        >
          <UploadFileList
            fileBack={handleUpload}
            required
            businessType="VENDOR_LICENSE"
            listType="picture-card"
            checkMain={false}
            defaultFileList={license_file}
            accept={['.jpg,.jpeg,.png']}
            acceptType={['jpg', 'jpeg', 'png']}
            maxSize="5"
            maxCount="1"
          />
        </Form.Item>

        <ProFormDependency name={['license_files']}>
          {({ license_files }) => {
            return license_files?.length ? (
              <>
                <ProFormText
                  name="name"
                  label="供应商名称"
                  placeholder="请输入供应商名称"
                  rules={[{ required: true, message: '请输入供应商名称' }]}
                  fieldProps={{
                    onBlur: function (e) {
                      const curF: any = formRef?.current;
                      curF.setFieldsValue({
                        name: e.target.value.replace(/^\s+|\s+$/g, ''),
                      });
                      curF.validateFields(['name']);
                    },
                  }}
                />
                <ProFormText
                  name="organization_code"
                  label="统一社会信用代码"
                  placeholder="请输入统一社会信用代码"
                  rules={[{ required: true, message: '请输入统一社会信用代码' }]}
                  fieldProps={{
                    onBlur: function (e) {
                      const curF: any = formRef?.current;
                      curF.setFieldsValue({
                        organization_code: e.target.value.replace(/^\s+|\s+$/g, ''),
                      });
                      curF.validateFields(['organization_code']);
                    },
                  }}
                />
                <ProFormText
                  name="legal_person"
                  label="法人姓名"
                  placeholder="请输入法人姓名"
                  rules={[{ required: true, message: '请输入法人姓名' }]}
                  fieldProps={{
                    onBlur: function (e) {
                      const curF: any = formRef?.current;
                      curF.setFieldsValue({
                        legal_person: e.target.value.replace(/^\s+|\s+$/g, ''),
                      });
                      curF.validateFields(['legal_person']);
                    },
                  }}
                />
                <ProFormTextArea
                  rules={[{ required: true, message: '请输入公司经营范围' }]}
                  label="经营范围"
                  placeholder="请输入公司经营范围"
                  name="management_scope"
                  fieldProps={{
                    onBlur: function (e) {
                      const curF: any = formRef?.current;
                      curF.setFieldsValue({
                        management_scope: e.target.value.replace(/^\s+|\s+$/g, ''),
                      });
                      curF.validateFields(['management_scope']);
                    },
                  }}
                />
                <ProFormTextArea
                  rules={[{ required: true, message: '请输入公司地址' }]}
                  label="公司地址"
                  placeholder="请输入公司地址"
                  name="register_address"
                  fieldProps={{
                    onBlur: function (e) {
                      const curF: any = formRef?.current;
                      curF.setFieldsValue({
                        register_address: e.target.value.replace(/^\s+|\s+$/g, ''),
                      });
                      curF.validateFields(['register_address']);
                    },
                  }}
                />
                <div style={{ display: 'none' }}>
                  <ProFormText
                    name="registered_capital"
                    label="注册资金"
                    placeholder="请输入注册资金"
                  />
                </div>
              </>
            ) : (
              ''
            );
          }}
        </ProFormDependency>
      </ProForm>
    </Modal>
  );
};
export default connect(({ supplier }: { supplier: Record<string, unknown> }) => ({
  supplier,
}))(AddSupplier);
