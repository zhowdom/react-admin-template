import { Button, Modal } from 'antd';
import { ProColumns, ProFormDigit, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import {
  EditableProTable,
  ModalForm,
  ProFormSelect,
  ProFormRadio,
  ProFormDependency,
} from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { pubProLineList } from '@/utils/pubConfirm';
import { handleCutZero, pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { insert, insert_sku_cnflex, insert_goods_cnflex, update, update_cnflex } from '@/services/pages/stockUpIn/seasonRatio';
import { freeListLinkManagementSku, findSelectGoodsSku } from '@/services/base';
import { useAccess } from 'umi';
import { uniqBy } from 'lodash';

const initialRatioData: any = [
  {
    tempId: '1',
    month_1: '',
    month_2: '',
    month_3: '',
    month_4: '',
    month_5: '',
    month_6: '',
    month_7: '',
    month_8: '',
    month_9: '',
    month_10: '',
    month_11: '',
    month_12: '',
  },
];
const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  dicList: any;
  initialValues?: any;
  actionType?: string;
  handleFn?: any,
  getType?: any,
}> = ({ title, trigger, reload, initialValues, dicList, actionType, handleFn, getType }) => {
  const access = useAccess();
  const [category, categorySet] = useState<any>({});
  const formRef = useRef<ProFormInstance>();
  let columns: ProColumns<any>[] = [
    {
      title: '1月',
      dataIndex: 'month_1',
    },
    {
      title: '2月',
      dataIndex: 'month_2',
    },
    {
      title: '3月',
      dataIndex: 'month_3',
    },
    {
      title: '4月',
      dataIndex: 'month_4',
    },
    {
      title: '5月',
      dataIndex: 'month_5',
    },
    {
      title: '6月',
      dataIndex: 'month_6',
    },
    {
      title: '7月',
      dataIndex: 'month_7',
    },
    {
      title: '8月',
      dataIndex: 'month_8',
    },
    {
      title: '9月',
      dataIndex: 'month_9',
    },
    {
      title: '10月',
      dataIndex: 'month_10',
    },
    {
      title: '11月',
      dataIndex: 'month_11',
    },
    {
      title: '12月',
      dataIndex: 'month_12',
    },
  ];
  columns = columns.map((column) => ({
    ...column,
    align: 'center',
    valueType: 'digit',
    fieldProps: {
      precision: 2,
      step: 0.1,
      controls: false,
    },
    formItemProps: {
      rules: [
        pubRequiredRule,
        {
          validator: (_, val: any) => {
            if (!val) {
              return Promise.reject('系数必须大于0');
            }
            return Promise.resolve();
          },
        },
      ],
      width: 'xs',
    },
  }));
  return (
    <ModalForm
      title={title || '淡旺季系数配置'}
      trigger={trigger || <Button type="primary">{title}</Button>}
      width={1300}
      layout={'horizontal'}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        const data: any = {
          ...values,
          vendor_group_id: values?.vendor_group_id || category?.vendor_group_id,
          // category_name: category?.category_name || '',
        };
        Object.keys(values.ratioData[0]).forEach((key: any) => {
          data[key] = values.ratioData[0][key];
        });
        data.growth_rate = values.growth_rate;
        let api;
        if (initialValues?.id) {
          data.id = initialValues.id;
          api = update_cnflex;
        } else {
          api = actionType == 'sku' ? insert_sku_cnflex : insert_goods_cnflex
        }
        delete data.ratioData;
        const res = await api(data);
        if (res?.code == pubConfig.sCode) {
          console.log(initialValues)
          if (initialValues?.parentId) {
            getType && getType(true);
            handleFn('_', initialValues?.parentId);
          } else {
            if (reload) reload();
            getType && getType(false);
          }
          pubMsg(res?.message, 'success');
          return Promise.resolve(true);
        } else {
          pubMsg(res?.message);
          return Promise.resolve(false);
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
      initialValues={{
        type: initialValues ? (initialValues?.type == '2' ? 'sku' : 'productLine') : (actionType == 'sku' ? 'sku' : 'productLine'),
        vendor_group_id: initialValues?.vendor_group_id || '',
        goods_sku_id: initialValues?.goods_sku_id || '',
        site: initialValues?.site || '',
        ratioData: initialValues ? [{ tempId: '1', ...initialValues }] : initialRatioData,
        growth_rate: initialValues?.growth_rate ?? '',
        sku_name: initialValues?.sku_name || '-',
      }}
    >
      {/* <ProFormRadio.Group
        colProps={{ span: 7 }}
        label={'系数类型'}
        name={'type'}
        fieldProps={{
          onChange: () => {
            categorySet({});
            formRef.current?.setFieldsValue({ vendor_group_id: '', sku: '' });
          },
        }}
        readonly={!!initialValues?.id}
        options={[
          {
            label: '产品线系数',
            value: 'productLine',
            disabled: !access.canSee('stock_up_seasonRatio_add'),
          },
          {
            label: '店铺SKU系数',
            value: 'sku',
            disabled: !access.canSee('stock_up_seasonRatio_add_sku'),
          },
        ]}
        rules={[pubRequiredRule]}
      /> */}
      {initialValues?.id && initialValues?.type == '2' ?
        (
          <>
            <ProFormSelect
            colProps={{ span: 12 }}
            name="vendor_group_id"
            label="产品线"
            showSearch
            debounceTime={300}
            request={() => pubProLineList({ business_scope: 'CN', 'permission_filtering': true })}
            rules={[pubRequiredRule]}
            readonly={!!initialValues?.id}
          />
          <ProFormText
            name="sku_name"
            label="款式名称"
            colProps={{ span: 12 }}
            readonly={true}
          />
          </>
        ) : ''
      }

      <ProFormDependency name={['type']}>
        {({ type }) => {
          return type == 'productLine' ? (
            <ProFormSelect
              colProps={{ span: 8 }}
              name="vendor_group_id"
              label="产品线"
              showSearch
              debounceTime={300}
              request={() => pubProLineList({ business_scope: 'CN', 'permission_filtering': true })}
              rules={[pubRequiredRule]}
              readonly={!!initialValues?.id}
            />
          ) : (
            <ProFormSelect
              colProps={{ span: 10 }}
              name="goods_sku_id"
              label="SKU"
              placeholder={'sku或产品线关键词'}
              showSearch
              debounceTime={300}
              request={() =>
                findSelectGoodsSku({
                  business_scope: 'CN',
                  sku_type: '1',
                  current_page: 1,
                  page_size: 9999,
                  permission_filtering: true,
                }).then((res: any) => {
                  if (res.code == pubConfig.sCode) {
                    if (res?.data) {
                      return res?.data?.records?.map((val: any) => ({
                        label: `${val?.sku_code}(${val?.sku_name})`,
                        value: `${val?.id}`,
                      })) || [];
                    }
                    return [];
                  }
                  return [];
                })
              }
              fieldProps={{
                onChange: (value, option: any) => {
                  categorySet(option);
                },
              }}
              rules={[pubRequiredRule]}
              readonly={!!initialValues?.id}
            />
          );
        }}
      </ProFormDependency>
      {/* <ProFormSelect
        colProps={{ span: 6 }}
        name="site"
        label="站点"
        showSearch
        valueEnum={dicList?.SYS_PLATFORM_SHOP_SITE || {}}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
      /> */}

      <ProFormDigit
        colProps={{ span: 6 }}
        label="年度增长率(%)"
        name="growth_rate"
        fieldProps={{
          min: -10000000000000000,
          formatter: (value: any) => {
            return handleCutZero(String(value));
          },
        }}
        rules={[
          { required: true, message: '请输入年度增长率' },
          {
            validator(_, value) {
              if (value < -100) {
                return Promise.reject(new Error('不能小于-100'));
              }
              if (
                `${value}`.indexOf('.') != -1 &&
                `${value}`.slice(`${value}`.indexOf('.') + 1)?.length > 2
              ) {
                return Promise.reject(new Error('最多保留两位小数'));
              }
              return Promise.resolve();
            },
          },
        ]}
        placeholder="请输入年度增长率"
      />
      <EditableProTable
        bordered
        headerTitle={<span><span style={{'color': 'red', 'paddingRight': '5px'}}>*</span>系数配置</span>}
        size={'small'}
        rowKey="tempId"
        recordCreatorProps={false}
        columns={columns}
        name={'ratioData'}
        editable={{ editableKeys: ['1'] }}
      />
    </ModalForm>
  );
};
export default Component;
