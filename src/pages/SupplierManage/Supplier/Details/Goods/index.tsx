import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { getGoodsList, getSupplierDetail } from '@/services/pages/supplier';
import { history } from 'umi';
import { useState } from 'react';
import ProductSkuTable from '@/components/PubSKU/ProductSkuTable';

const Goods = (props: any) => {
  const [businessScope, setSusinessScope] = useState<any>('');
  const pathname = history.location.pathname;
  const type = pathname.indexOf('/edit-basic') != -1 ? 1 : 2;
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      vendor_id: props.id,
    };

    const resDetail: any = await getSupplierDetail({ id: history?.location?.query?.id });
    if (resDetail?.code != pubConfig.sCode) {
      pubMsg(resDetail?.message);
    }
    setSusinessScope(resDetail?.data?.business_scope);
    console.log(resDetail);
    const res = await getGoodsList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  const columns: any[] = [
    {
      title: '图片',
      editable: false,
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
    },

    {
      title: '产品名称',
      dataIndex: 'name_cn',
      width: 200,
      align: 'center',
      render: (dom: any, entity: any) => {
        return (
          <a
            onClick={() => {
              history.push(
                `/products/cooperate-product/detail?readonly=1&id=${entity.goods_sku_id}&vendor_id=${props.id}&type=${type}&tab=goods`,
              );
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '商品名称/款式编码',
      dataIndex: 'sku_name',
      width: 200,
      render: (text: any, record: any) => {
        return `${text} / ${record.sku_code}`;
      },
    },
    {
      title: (
        <>
          ERP编码
          <br />
          (商品SKU)
        </>
      ),
      dataIndex: 'erp_sku',
      align: 'center',
      width: 130,
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      className: 'p-table-inTable noBorder',
      hideInTable: businessScope == 'CN',
      width: 100,
      onCell: () => ({ colSpan: 3, style: { padding: 0 } }),
      render: (_: any, record: any) => {
        return (
          <ProductSkuTable
            skus={record?.goodList}
            dicList={props?.dicList}
            columnsKey={['shop_sku_code', 'shop_name', 'sales_status']}
          />
        );
      },
    },
    {
      title: '店铺名',
      dataIndex: 'shop_name',
      align: 'center',
      hideInSearch: true,
      hideInTable: businessScope == 'CN',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },

    {
      title: '销售状态',
      dataIndex: 'sales_status',
      align: 'center',
      hideInSearch: true,
      hideInTable: businessScope == 'CN',
      width: 100,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '单位',
      dataIndex: 'uom',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => {
        const item = props.dicList.GOODS_UOM;
        const key = record.uom;
        return [<span key="uom">{item?.[key]?.text || '-'}</span>];
      },
    },

    {
      title: '含税价',
      dataIndex: 'price',
      align: 'center',
    },
    {
      title: '币种',
      dataIndex: 'currency',
      hideInSearch: true,
      align: 'center',
      valueEnum: props.dicList?.SC_CURRENCY,
      render: (_, record: any) => {
        const item = props.dicList.SC_CURRENCY;
        const key = record?.currency;
        return [<span key="currency">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      align: 'center',
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
    },
    {
      title: '创建人',
      dataIndex: 'create_user_name',
      align: 'center',
    },
    {
      title: '采购状态',
      dataIndex: 'purchase_status',
      hideInSearch: true,
      align: 'center',
      valueEnum: props.dicList?.GOODS_SKU_PURCHASE_STATUS,
      render: (_, record: any) => {
        const item = props.dicList.GOODS_SKU_PURCHASE_STATUS;
        const key = record?.purchase_status;
        return [<span key="purchase_status">{item?.[key]?.text || '-'}</span>];
      },
    },
  ];

  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable
          pagination={{
            showSizeChanger: true,
          }}
          scroll={{ x: 1500 }}
          columns={columns}
          options={false}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={false}
          rowKey="id"
          dateFormatter="string"
          headerTitle={false}
          bordered
          toolBarRender={false}
        />
      </PageContainer>
    </>
  );
};

export default Goods;
