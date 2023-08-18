import { Button } from 'antd';
import { ModalForm, ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { addItem, edit } from '@/services/pages/tariffSetting';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { PlusOutlined } from '@ant-design/icons';
import { add, pubProLineList } from '@/utils/pubConfirm';
import { useEffect, useRef, useState } from 'react';
import './index.less';

export default (props: any) => {
  const { initialValues } = props;
  const [proLine, setProLine] = useState();
  const formRef = useRef<ProFormInstance>();
  // 获取产品线
  const getProLineListAction = async (business_scope: string, clear?: boolean) => {
    const res: any = await pubProLineList({ business_scope });
    setProLine(res);
    if (clear) {
      formRef?.current?.setFieldsValue({
        category_id: '',
      });
    }
  };
  const getTotal = (rate1: number, rate2: number, rate3: number, rate4: number) => {
    if (rate1 >= 0 && rate2 >= 0 && rate3 >= 0 && rate4 >= 0) {
      const num = add(add(rate1, rate2), add(rate3, rate4));
      formRef?.current?.setFieldsValue({
        total: num.toFixed(2) + '%',
      });
    }
  };
  useEffect(() => {
    getProLineListAction('IN', true);
  }, []);
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={initialValues ? '编辑产品线关税率' : '添加产品线关税率'}
      formRef={formRef}
      trigger={
        initialValues ? (
          <a> {props.trigger}</a>
        ) : (
          <Button ghost type="primary" icon={<PlusOutlined />}>
            {props.trigger}
          </Button>
        )
      }
      className="item10"
      labelAlign="right"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      initialValues={
        initialValues
          ? {
              ...initialValues,
              total:
                add(
                  add(initialValues.base_tariff, initialValues.additional_tariff),
                  add(initialValues.levy_tariff, initialValues.vat_rate_tariff),
                ).toFixed(2) + '%',
            }
          : undefined
      }
      width={550}
      onFinish={async (values: any) => {
        const res: any = initialValues ? await edit(values) : await addItem(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功!', 'success');
          props.reload();
          return true;
        }
      }}
    >
      <ProFormText name="id" label="id" hidden />
      <ProFormSelect
        readonly={initialValues}
        name="shop_site"
        label="站点"
        wrapperCol={{ flex: '270px' }}
        valueEnum={props?.dicList?.FIRST_TRANSPORT_QUOTE_SHOP_SITE}
        rules={[{ required: true, message: '请选择站点' }]}
        placeholder="选择站点"
        showSearch
        allowClear
      />
      <div className="tariff-formItem">
        <div>
          <ProFormSelect
            readonly
            labelCol={{ span: 16 }}
            name="business_scope"
            label="产品线"
            placeholder="选择业务范畴"
            rules={[{ required: true, message: '选择业务范畴' }]}
            valueEnum={{
              IN: '跨境',
              CN: '国内',
            }}
            initialValue="IN"
            fieldProps={{
              onChange: (val: any) => {
                getProLineListAction(val, true);
              },
            }}
          />
          <span>-</span>
          <ProFormSelect
            readonly={initialValues}
            name="category_id"
            label=""
            labelCol={{ span: 0 }}
            options={proLine || []}
            rules={[{ required: true, message: '请选择产品线' }]}
            placeholder="请选择产品线"
            showSearch
            allowClear
          />
        </div>
      </div>

      <ProFormDigit
        label="基础税率"
        name="base_tariff"
        style={{ width: '250px' }}
        rules={[
          { required: true, message: '请输入基础税率' },
          () => ({
            validator(_, value) {
              if (value > 99999999.99) {
                return Promise.reject(new Error('应小于100,000,000'));
              }
              return Promise.resolve();
            },
          }),
        ]}
        addonAfter="%"
        fieldProps={{
          precision: 2,
          onChange: (val: any) => {
            getTotal(
              val,
              formRef.current?.getFieldValue('additional_tariff'),
              formRef.current?.getFieldValue('levy_tariff'),
              formRef.current?.getFieldValue('vat_rate_tariff'),
            );
          },
        }}
      />
      <ProFormDigit
        label="加征关税"
        name="levy_tariff"
        style={{ width: '250px' }}
        rules={[
          { required: true, message: '请输入加征关税' },
          () => ({
            validator(_, value) {
              if (value > 99999999.99) {
                return Promise.reject(new Error('应小于100,000,000'));
              }
              return Promise.resolve();
            },
          }),
        ]}
        addonAfter="%"
        fieldProps={{
          precision: 2,
          onChange: (val: any) => {
            getTotal(
              formRef.current?.getFieldValue('base_tariff'),
              formRef.current?.getFieldValue('additional_tariff'),
              val,
              formRef.current?.getFieldValue('vat_rate_tariff'),
            );
          },
        }}
      />
      <ProFormDigit
        label="额外税率"
        name="additional_tariff"
        addonAfter="%"
        fieldProps={{
          precision: 2,
          onChange: (val: any) => {
            getTotal(
              formRef.current?.getFieldValue('base_tariff'),
              val,
              formRef.current?.getFieldValue('levy_tariff'),
              formRef.current?.getFieldValue('vat_rate_tariff'),
            );
          },
        }}
        rules={[
          { required: true, message: '请输入额外税率' },
          () => ({
            validator(_, value) {
              if (value > 99999999.99) {
                return Promise.reject(new Error('应小于100,000,000'));
              }
              return Promise.resolve();
            },
          }),
        ]}
      />
      <ProFormDigit
        label="增值税率"
        name="vat_rate_tariff"
        style={{ width: '250px' }}
        rules={[
          { required: true, message: '请输入增值税率' },
          () => ({
            validator(_, value) {
              if (value > 99999999.99) {
                return Promise.reject(new Error('应小于100,000,000'));
              }
              return Promise.resolve();
            },
          }),
        ]}
        addonAfter="%"
        fieldProps={{
          precision: 2,
          onChange: (val: any) => {
            getTotal(
              formRef.current?.getFieldValue('base_tariff'),
              formRef.current?.getFieldValue('additional_tariff'),
              formRef.current?.getFieldValue('levy_tariff'),
              val,
            );
          },
        }}
      />
      <ProFormText name="total" label="总关税率" readonly />
    </ModalForm>
  );
};
