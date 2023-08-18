import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormInstance } from '@ant-design/pro-form';
import { Button } from 'antd';
import { PlusOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { partsFreePage } from '@/services/base';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import { pubGetVendorList } from '@/utils/pubConfirm';

export default (props: any) => {
  const { setSkuList, drawerFormRef, disabled } = props;
  const [dataSource, setDataSource] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [selectObj, setSelectObj] = useState<any>({});
  const formRef = useRef<ProFormInstance>();
  const getList = async (): Promise<any> => {
    setLoading(true);
    const postData = {
      ...formRef?.current?.getFieldsValue(),
      business_scope: 'CN',
      sku_type: 2,
      current_page: 1,
      page_size: 999,
      like_sku_code: formRef?.current?.getFieldsValue()?.sku_code,
    };
    delete postData.sku_code;
    const res: any = await partsFreePage(postData);
    if (res.code != pubConfig.sCode) {
      pubMsg(res.message);
    }
    const orderSkuList = drawerFormRef?.current?.getFieldValue('orderSkuList');
    orderSkuList?.forEach((item: any) => {
      res?.data?.records.forEach((v: any) => {
        v.goods_sku_id ||= v.id;
        if (item.goods_sku_id === v.goods_sku_id && item.delete != 1) {
          setSelectObj((pre: any) => ({ ...pre, [`${v.goods_sku_id}`]: item }));
        }
      });
    });
    res?.data?.records.forEach((v: any) => {
      v.stock_no ||= v.sku_code;
      v.specificationList ||= v?.goodsSkuSpecificationList?.flatMap((item: any) =>
        item.type === 3
          ? [
              {
                ...item,
                weight: item.weight / 1000,
                unit_weight: item.weight / 1000,
                is_default: 1,
                id: null,
              },
            ]
          : [],
      );
    });
    setDataSource(res?.data?.records);
    setLoading(false);
  };
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
  return (
    <ModalForm
      title="添加入库商品"
      trigger={
        <Button disabled={disabled} type="primary" ghost icon={<PlusOutlined />}>
          添加商品
        </Button>
      }
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={1000}
      onFinish={async () => {
        return Promise.resolve(Object.values(selectObj)).then((res: any) => {
          setSkuList(res || []);
          return true;
        });
      }}
      onVisibleChange={(visible: boolean) => {
        if (visible) {
          setSelectObj({});
          getList();
        }
      }}
    >
      <ProTable
        rowKey={(record) => record.goods_sku_id + record.sku_code}
        onSubmit={getList}
        onReset={getList}
        options={false}
        formRef={formRef}
        bordered
        loading={loading}
        search={{ defaultCollapsed: false }}
        dataSource={dataSource}
        size="small"
        pagination={false}
        columns={[
          {
            title: '图片',
            dataIndex: 'image_url',
            align: 'center',
            valueType: 'image',
            hideInSearch: true,
            width: 80,
          },
          {
            title: '商品名称',
            dataIndex: 'sku_name',
            align: 'center',
          },
          {
            title: 'SKU',
            dataIndex: 'sku_code',
            align: 'center',
          },
          {
            title: (_, type: string) => {
              return type === 'table' ? '关联供应商' : '供应商';
            },
            dataIndex: 'vendor_id',
            fieldProps: selectProps,
            align: 'left',
            valueType: 'select',
            request: async (v) => {
              const res: any = await pubGetVendorList(v);
              return res;
            },
            order: 2,
            render: (_: any, record: any) =>
              record?.vendor_name?.split(',')?.map((v: any) => (
                <div key={v} style={{ lineHeight: '28px' }}>
                  {v}
                </div>
              )) ?? '-',
          },
          {
            title: '操作',
            key: 'option',
            width: 90,
            align: 'center',
            valueType: 'option',
            render: (_, row: any) => {
              if (selectObj[row.goods_sku_id]) {
                return <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '18px' }} />;
              } else {
                return (
                  <a
                    onClick={() => {
                      selectObj[row.goods_sku_id] = row;
                      setDataSource([...dataSource]);
                    }}
                    key="edit"
                  >
                    添加
                  </a>
                );
              }
            },
          },
        ]}
      />
    </ModalForm>
  );
};
