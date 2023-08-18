import ProCard from '@ant-design/pro-card';
import { Row, Col, Form, Popover } from 'antd';
import {
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProFormDigit,
  ProFormGroup,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { connect } from 'umi';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { pubGetUserList } from '@/utils/pubConfirm';
import { useEffect } from 'react';
import './index.less';
const BaseInfo = (props: any) => {
  const { dispatch, extraShow, disabled } = props;
  const colList = { xs: 24, sm: 12, md: 8 };
  // 经营范围超出省略
  const myResize = () => {
    const content: any = document.querySelector(
      '.show-content .ant-form-item-control-input-content',
    );
    const textview = document.getElementsByClassName('show-text')[0];
    const showAll: any = document.getElementsByClassName('show-all')[0];
    const scrollHeight = textview.scrollHeight;
    const height = content.clientHeight;
    if (scrollHeight > height) {
      showAll.style.display = 'block';
    } else {
      showAll.style.display = 'none';
    }
  };
  useEffect(() => {
    if (disabled) {
      setTimeout(myResize, 500);
    }
  }, [props?.formData?.management_scope, disabled]);

  useEffect(() => {
    window.addEventListener('resize', myResize);
    return () => {
      window.removeEventListener('resize', myResize);
    };
  }, []);
  // 图片识别
  const handleUpload = (files: any, init: boolean) => {
    props.setAbout({
      license_files: files,
    });
    const filesFilter = files?.filter((v: any) => v.delete != 1);
    if (!init && !props.disabled && filesFilter.length) {
      dispatch({
        type: 'supplier/businessLicenseAction',
        payload: {
          imageId: files?.[0]?.id,
        },
        callback: (data: any) => {
          const postData = { ...data };
          props.setAbout(postData);
        },
      });
    }
  };
  return (
    <ProCard headerBordered title="供应商基础信息">
      {props.formData && (
        <Row gutter={24}>
          <Col {...colList} className="disabled">
            <ProFormText
              name="name"
              readonly={props.disabled}
              label="供应商名称"
              placeholder="请输入供应商名称"
              rules={[
                { required: !props.disabled, message: '请输入供应商名称' },
                {
                  pattern: /^(?=.*\S).+$/,
                  message: '请输入供应商名称',
                },
              ]}
              fieldProps={{
                onBlur: function (e) {
                  const curF: any = props.formRef?.current;
                  curF.setFieldsValue({
                    name: e.target.value.replace(/^\s+|\s+$/g, ''),
                  });
                  curF.validateFields(['name']);
                },
              }}
            />
          </Col>
          <Col {...colList} className="disabled">
            <ProFormText
              name="en_name"
              label="公司英文名称"
              placeholder="请输入公司英文名称"
              readonly={props.disabled}
            />
          </Col>
          <Col {...colList} className="disabled">
            <Form.Item label="供应商代码">{props?.formData?.code || '-'}</Form.Item>
          </Col>
          <Col {...colList} className="disabled">
            <ProFormSelect
              name="abroad"
              label="公司类型"
              readonly={props.disabled}
              valueEnum={props?.dicList?.SYS_ABROAD}
              placeholder="请选择公司类型"
              rules={[{ required: !props.disabled, message: '请选择公司类型' }]}
            />
          </Col>
          <Col {...colList} className="disabled">
            <ProFormText
              name="legal_person"
              label="法人"
              readonly={props.disabled}
              placeholder="请输入法人"
              rules={[
                { required: !props.disabled, message: '请输入法人' },
                {
                  pattern: /^(?=.*\S).+$/,
                  message: '请输入法人',
                },
              ]}
            />
          </Col>
          <Col {...colList} className="disabled">
            <ProFormText
              readonly={props.disabled}
              name="organization_code"
              label="统一社会信用代码"
              placeholder="请输入统一社会信用代码"
              rules={[
                { required: !props.disabled, message: '请输入统一社会信用代码' },
                {
                  pattern: /^(?=.*\S).+$/,
                  message: '请输入统一社会信用代码',
                },
              ]}
            />
          </Col>
          <Col {...colList} className="disabled">
            <ProFormText
              readonly={props.disabled}
              name="registered_capital"
              label="注册资金"
              placeholder="请输入注册资金"
            />
          </Col>
          <Col {...colList}>
            <ProFormSelect
              readonly={props?.formData?.liability_name || props.disabled}
              name="liabilityName"
              label="对接开发:"
              showSearch
              debounceTime={300}
              rules={[
                {
                  required: !(props?.formData?.liability_name || props.disabled),
                  message: '请选择对接开发',
                },
                ({}) => ({
                  validator(_, value) {
                    if (JSON.stringify(value) === '{}') {
                      return Promise.reject(new Error('请选择对接开发'));
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
          </Col>
          <Col {...colList}>
            <ProFormSelect
              readonly={props.disabled}
              name="vendor_kind"
              label="供应商性质"
              valueEnum={props.dicList.VENDOR_KIND}
              placeholder={props.disabled ? '--' : '请选择供应商性质'}
            />
          </Col>
          <Col {...colList} className="red">
            <ProFormSelect
              name="vendor_status"
              label="合作状态"
              readonly
              valueEnum={props.dicList.VENDOR_COOPERATION_STATUS}
              allowClear={false}
              extra={
                extraShow == '4' && !props.disabled
                  ? '未签合同临时合作采购单下单金额不得超过2万'
                  : ''
              }
            />
          </Col>
          <Col {...colList}>
            <ProFormSelect
              readonly
              name="currency"
              label="结算币种"
              valueEnum={props?.dicList?.SC_CURRENCY}
              placeholder={props.disabled ? '--' : '请选择币种'}
            />
          </Col>
          <Col {...colList}>
            <ProFormSelect
              name="tax_rate"
              label="税率"
              readonly={props.disabled}
              valueEnum={props.dicList.VENDOR_TAX_RATE}
              placeholder={props.disabled ? '--' : '请选择税率'}
              rules={[{ required: !props.disabled, message: '请选择税率' }]}
            />
          </Col>
          <Col {...colList}>
            <ProFormSelect
              name="payment_method"
              label="结算方式"
              readonly
              valueEnum={props.dicList.VENDOR_PAYMENT_METHOD}
              placeholder={props.disabled ? '--' : '请选择结算方式'}
            />
          </Col>
          <ProFormDependency name={['payment_method', 'prepayment_percentage']}>
            {({ payment_method, prepayment_percentage }) => {
              return ['8', '9', '10', '11', '12', '13'].includes(payment_method) ? (
                <Col {...colList}>
                  {props.disabled ? (
                    <Form.Item label="预付比例">
                      {prepayment_percentage ? prepayment_percentage + '%' : '-'}
                    </Form.Item>
                  ) : (
                    <ProFormDigit
                      name="prepayment_percentage"
                      label="预付比例"
                      placeholder="请输入预付比例"
                      min={0}
                      max={100}
                      fieldProps={{ precision: 2, addonAfter: '%' }}
                      rules={[{ required: true, message: '请输入预付比例' }]}
                    />
                  )}
                </Col>
              ) : (
                ''
              );
            }}
          </ProFormDependency>
          <Col xs={12} className="disabled">
            <ProFormText
              readonly={props.disabled}
              name="register_address"
              label="供应商注册地址"
              placeholder="请输入供应商注册地址"
              rules={[
                { required: !props.disabled, message: '请输入供应商注册地址' },
                {
                  pattern: /^(?=.*\S).+$/,
                  message: '请输入供应商注册地址',
                },
              ]}
            />
          </Col>
          <Col xs={12}>
            <ProFormSelect
              name="belonging_area"
              label="供应商所在地区"
              readonly={props.disabled}
              valueEnum={props.dicList.VENDOR_REGION}
              placeholder={props.disabled ? '--' : '请选择供应商所在地区'}
              rules={[{ required: !props.disabled, message: '请选择供应商所在地区' }]}
            />
          </Col>
          <Col xs={12} className={!props.businessEdit ? 'show-detail pro sup' : ''}>
            <div className="proLine-group">
              <ProFormGroup>
                {props.disabled || !props.businessEdit ? (
                  <div className="item">
                    <span className="label sup">产品线分组 : </span>
                    <span className="value">
                      {props?.formData?.business_scope
                        ? props?.formData?.business_scope == 'CN'
                          ? '国内 - '
                          : '跨境 - '
                        : '-'}
                    </span>
                  </div>
                ) : (
                  <ProFormSelect
                    name="business_scope"
                    label="产品线分组："
                    readonly={props.disabled}
                    options={[
                      {
                        value: 'CN',
                        label: '国内',
                      },
                      {
                        value: 'IN',
                        label: '跨境',
                      },
                    ]}
                    onChange={(val: any) => {
                      props.getProLineListAction(val, true);
                    }}
                    placeholder="类型"
                    rules={[{ required: true, message: '请选择类型' }]}
                  />
                )}

                <ProFormDependency name={['vendor_group_id']}>
                  {() => {
                    return (
                      <ProFormSelect
                        name="vendor_group_id"
                        label=""
                        disabled={props.disabled}
                        options={props?.proList || []}
                        mode="multiple"
                        rules={[{ required: true, message: '请选择产品线分组' }]}
                        placeholder={props.disabled ? ' ' : '请选择产品线'}
                        showSearch
                        fieldProps={{
                          maxTagCount: props.disabled ? undefined : 1,
                        }}
                      />
                    );
                  }}
                </ProFormDependency>
              </ProFormGroup>
            </div>
          </Col>
          <Col xs={12} className="disabled hide-more">
            <ProFormDependency name={['management_scope']}>
              {({ management_scope }) => {
                return props.disabled ? (
                  <Form.Item name="management_scope" label="经营范围" className="show-content">
                    <div className="show-text">{management_scope || '-'}</div>
                    <span className="show-all">
                      <Popover
                        content={<pre>{management_scope}</pre>}
                        title={false}
                        trigger="click"
                      >
                        <a>查看</a>
                      </Popover>
                    </span>
                  </Form.Item>
                ) : (
                  <ProFormTextArea
                    name="management_scope"
                    label="经营范围"
                    required={!props.disabled}
                    readonly={props.disabled}
                    placeholder="请输入经营范围"
                    rules={[
                      () => ({
                        validator(_, value) {
                          const temp = value.trim();
                          if (!temp && !props.disabled) {
                            return Promise.reject(new Error('请填写经营范围'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  />
                );
              }}
            </ProFormDependency>
          </Col>
          <Col xs={12}>
            {props.formData && (
              <Form.Item
                required={!props.disabled}
                rules={[
                  () => ({
                    validator(_, value) {
                      const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
                      if (!unDeleteFiles?.length) {
                        return Promise.reject(new Error('请上传供应商营业执照'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                label="供应商营业执照"
                name="license_files"
                valuePropName="license_files"
                extra="只支持jpg,png格式"
              >
                <UploadFileList
                  disabled={props.disabled}
                  fileBack={handleUpload}
                  required={!props.disabled}
                  businessType="VENDOR_LICENSE"
                  listType="picture-card"
                  checkMain={false}
                  defaultFileList={props.formData.license_files}
                  accept={['.jpg,.jpeg,.png']}
                  acceptType={['jpg', 'jpeg', 'png']}
                  maxSize="5"
                  maxCount="1"
                />
              </Form.Item>
            )}
          </Col>
        </Row>
      )}
    </ProCard>
  );
};
export default connect(({ supplier }: { supplier: Record<string, unknown> }) => ({
  supplier,
}))(BaseInfo);
