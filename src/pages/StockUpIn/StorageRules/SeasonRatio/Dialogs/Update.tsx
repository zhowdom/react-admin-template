import { Button, Modal, Space } from 'antd';
import { ProColumns, ProFormDigit, ProFormInstance } from '@ant-design/pro-components';
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
import { insert, update } from '@/services/pages/stockUpIn/seasonRatio';
import { freeListLinkManagementSku } from '@/services/base';
import { useAccess } from 'umi';
import { uniqBy } from 'lodash';
import { pubGetPlatformList } from '@/utils/pubConfirm';

const initialRatioData: any = [
  {
    tempId: '1',
    january: 1.0,
    february: 1.0,
    march: 1.0,
    april: 1.0,
    may: 1.0,
    june: 1.0,
    july: 1.0,
    august: 1.0,
    september: 1.0,
    october: 1.0,
    november: 1.0,
    december: 1.0,
  },
];
const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  dicList: any;
  initialValues?: any;
}> = ({ title, trigger, reload, initialValues, dicList }) => {
  const access = useAccess();
  const [category, categorySet] = useState<any>({});
  const [storeSkuList, setStoreSkuList] = useState<any>([])
  const formRef = useRef<ProFormInstance>();
  let columns: ProColumns<any>[] = [
    {
      title: '1月',
      dataIndex: 'january',
    },
    {
      title: '2月',
      dataIndex: 'february',
    },
    {
      title: '3月',
      dataIndex: 'march',
    },
    {
      title: '4月',
      dataIndex: 'april',
    },
    {
      title: '5月',
      dataIndex: 'may',
    },
    {
      title: '6月',
      dataIndex: 'june',
    },
    {
      title: '7月',
      dataIndex: 'july',
    },
    {
      title: '8月',
      dataIndex: 'august',
    },
    {
      title: '9月',
      dataIndex: 'september',
    },
    {
      title: '10月',
      dataIndex: 'october',
    },
    {
      title: '11月',
      dataIndex: 'november',
    },
    {
      title: '12月',
      dataIndex: 'december',
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

  // 店铺SKU下拉查询
  const freeListLinkManagementSku_run = (platform_code?: any) =>
    freeListLinkManagementSku({
      sku_type: '1',
      platform_code,
    }).then((res: any) => {
      if (res.code == pubConfig.sCode) {
        if (res?.data) {
          return uniqBy(res.data, 'shop_sku_code').map((item: any) => ({
            ...item,
            label: `${item?.shop_sku_code}(${item?.category_name})`,
            value: item?.shop_sku_code,
            key: `${item?.id}&&${item?.shop_sku_code}`,
          }));
        }
        return [];
      }
      return [];
    });
  return (
    <ModalForm
      title={title || '淡旺季系数配置'}
      trigger={trigger || <Button type="primary">新增</Button>}
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
          category_id: values?.category_id || category?.category_id,
          category_name: category?.category_name || '',
        };
        Object.keys(values.ratioData[0]).forEach((key: any) => {
          data[key] = values.ratioData[0][key];
        });
        data.growth_rate = values.growth_rate;
        let api = insert;
        if (initialValues?.id) {
          data.id = initialValues.id;
          api = update;
        }
        delete data.ratioData;
        const res = await api(data);
        if (res?.code == pubConfig.sCode) {
          if (reload) reload();
          pubMsg(res?.message, 'success');
        } else {
          pubMsg(res?.message);
          return false;
        }
        return Promise.resolve(true);
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
      initialValues={{
        type: initialValues ? (!!initialValues?.sku ? 'sku' : 'productLine') : 'sku',
        category_id: initialValues?.category_id || '',
        sku: initialValues?.sku || '',
        site: initialValues?.site || '',
        ratioData: initialValues ? [{ tempId: '1', ...initialValues }] : initialRatioData,
        growth_rate: initialValues?.growth_rate ?? '',
        platform_id: initialValues?.platform_id ?? '',
      }}
    >
      <Space.Compact block>
        <ProFormSelect
          colProps={{ span: 6 }}
          name="platform_id"
          label="平台"
          showSearch
          request={() => pubGetPlatformList({ business_scope: 'IN'})}
          rules={[pubRequiredRule]}
          readonly={!!initialValues?.id}
          fieldProps={{
            onChange: async (value, option: any) => {
              categorySet({});
              formRef.current?.setFieldsValue({ category_id: '', sku: '' });
              let res = await freeListLinkManagementSku_run(option.code);
              setStoreSkuList(res)
            },
          }}
        />

        <ProFormSelect
          colProps={{ span: 6, push:1 }}
          name="site"
          label="站点"
          showSearch
          valueEnum={dicList?.SYS_PLATFORM_SHOP_SITE || {}}
          rules={[pubRequiredRule]}
          readonly={!!initialValues?.id}
        />
      </Space.Compact>

      <ProFormRadio.Group
        colProps={{ span: 7 }}
        label={'系数类型'}
        name={'type'}
        fieldProps={{
          onChange: () => {
            categorySet({});
            formRef.current?.setFieldsValue({ category_id: '', sku: '' });
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
      />
      <ProFormDependency name={['type']}>
        {({ type }) => {
          return type == 'productLine' ? (
            <ProFormSelect
              colProps={{ span: 8 }}
              name="category_id"
              label="产品线"
              showSearch
              debounceTime={300}
              request={() => pubProLineList({ business_scope: 'IN' })}
              rules={[pubRequiredRule]}
              readonly={!!initialValues?.id}
            />
          ) : (
            <ProFormSelect
              colProps={{ span: 10 }}
              name="sku"
              label="店铺SKU"
              placeholder={'sku或产品线关键词'}
              showSearch
              debounceTime={300}
              // request={() => freeListLinkManagementSku_run()}
              fieldProps={{
                options: storeSkuList,
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
        headerTitle={'系数配置'}
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
