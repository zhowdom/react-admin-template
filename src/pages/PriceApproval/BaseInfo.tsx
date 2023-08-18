/*产品基本信息
 * dataSource: 后端数据; name: 规格字段名;  form: 规格编辑form; dicList: 数据字典; readonly: 是否只读模式
 * demo: <BaseInfo
          dataSource={dataSource}
          name={'projectsGoodsSkus'}
          readonly={readonly}
          dicList={common?.dicList}
          form={formSpecification}
        />
 * */
import React, { useEffect, useState } from 'react';
import { Card, Statistic, Tabs } from 'antd';
import ProDescriptions from '@ant-design/pro-descriptions';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import type { ProColumnType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import CloudCangTable from './cloudCangTable';
import { history } from 'umi';
import { handleCutZero, pubFilter } from '@/utils/pubConfig';
import QiMenCangTable from './QiMenCangTable';
import { pubGetStoreList, pubAllGoodsSkuBrand } from '@/utils/pubConfirm';
import PubLogisticsClearance from '@/components/PubLogisticsClearance';

// 商品规格
const Specification: React.FC<any> = ({
  readonly,
  form,
  value,
  onChange,
  editType,
  business_scope,
  dicList,
  isApproval,
}: any) => {
  const dataSourceFormat: any = [];
  // 需要编辑 箱规
  if (value && value.length) {
    value.forEach((sku: any) => {
      if (sku.projectsGoodsSkuSpecifications && sku.projectsGoodsSkuSpecifications.length) {
        sku.projectsGoodsSkuSpecifications.forEach((specification: any) => {
          dataSourceFormat.push({
            ...specification,
            sku_code: sku.sku_code,
            sku_name: sku.sku_name,
            position: readonly
              ? sku.position + ''
              : sku.projectsGoodsSkuSpecifications[0]?.position
              ? sku.projectsGoodsSkuSpecifications[0]?.position + ''
              : sku.position + '',
            project_price: readonly
              ? sku.project_price
              : sku.projectsGoodsSkuSpecifications[0]?.project_price || sku.project_price,
            bottom_line_price: readonly
              ? sku.bottom_line_price
              : sku.projectsGoodsSkuSpecifications[0]?.bottom_line_price || sku.bottom_line_price,
              procurement_price: readonly
              ? sku.procurement_price
              : sku.projectsGoodsSkuSpecifications[0]?.procurement_price || sku.procurement_price,

            image_url: sku.image_url,
            sku_id: sku.id,
            expected_shop: sku.expected_shop,
            expected_shop_name: sku.expected_shop_name,
            send_kind: sku.send_kind,
            // 编辑时，要实时从箱规里取  不可编辑时，是从箱规的外面取的
            bar_code: readonly
              ? sku.bar_code
              : sku.projectsGoodsSkuSpecifications[0]?.bar_code || sku.bar_code,
            brand_id: readonly
              ? sku.brand_id
              : sku.projectsGoodsSkuSpecifications[0]?.brand_id || sku.brand_id,
            rowSpan: sku.projectsGoodsSkuSpecifications.length,
          });
        });
      }
    });
  }
  console.log(dataSourceFormat);
  type goodSpecType = {
    id?: React.Key;
    goods_id?: number | string;
    sku_id?: number | string;
    type?: number | string;
    high?: number;
    length?: number;
    width?: number;
    weight?: number;
    pics?: number;
    expected_shop?: string;
    send_kind?: string;
    bar_code?: string;
    project_price?: number;
    bottom_line_price?: any;
    position?: any;
    brand_id?: any;
    procurement_price?: any
  };
  const columnsSkus: ProColumnType<goodSpecType>[] = [
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      editable: false,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
      width: 100,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      ellipsis: true,
      align: 'center',
      editable: false,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
      width: 100,
    },
    {
      title: '图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      width: 70,
      editable: false,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
    },
    {
      title: '产品定位',
      dataIndex: 'position',
      valueType: 'select',
      align: 'center',
      width: 160,
      editable: false,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
      valueEnum: dicList.PROJECTS_GOODS_SKU_POSITION,
    },
    {
      title: '品牌',
      dataIndex: 'brand_id',
      valueType: 'select',
      align: 'center',
      width: 120,
      hideInTable: business_scope == 'CN',
      formItemProps: {
        rules: [{ required: true, message: '请选择品牌' }],
      },
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      request: async () => {
        const res = await pubAllGoodsSkuBrand();
        return res;
      },
      editable: () => history?.location?.pathname.indexOf('signature/detail') > -1,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
    },
    {
      title: '定价',
      dataIndex: 'project_price',
      valueType: 'digit',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入定价' }],
      },
      fieldProps: {
        precision: 2,
        formatter: (v) => {
          return handleCutZero(String(v));
        },
      },
      width: 120,
      editable: () => history?.location?.pathname.indexOf('signature/detail') > -1,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
    },
    {
      title: '底线成交价',
      dataIndex: 'bottom_line_price',
      valueType: 'digit',
      align: 'center',
      editable: false,
      fieldProps: {
        precision: 2,
        formatter: (v) => {
          return handleCutZero(String(v));
        },
      },
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
      width: 120,
      render: (_, record) => {
        return (
          <Statistic
            value={record?.bottom_line_price || 0}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          />
        );
      },
    },
    {
      title: '采销价',
      dataIndex: 'procurement_price',
      valueType: 'digit',
      align: 'center',
      editable: false,
      fieldProps: {
        precision: 2,
        formatter: (v) => {
          return handleCutZero(String(v));
        },
      },
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
      width: 120,
      render: (_, record) => {
        return (
          <Statistic
            value={record?.procurement_price || '-'}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          />
        );
      },
    },
    {
      title: '配送类型',
      dataIndex: 'send_kind',
      valueType: 'select',
      align: 'center',
      width: 160,
      formItemProps: {
        rules: [{ required: true, message: '请选择配送类型' }],
      },
      editable: false,
      hideInTable: business_scope == 'CN' ? false : true,
      valueEnum: dicList.SYS_SEND_KIND,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
    },
    {
      title: '预计店铺',
      dataIndex: 'expected_shop',
      valueType: 'select',
      align: 'center',
      width: 120,
      formItemProps: {
        rules: [{ required: true, message: '请选择预计店铺' }],
      },
      editable: false,
      hideInTable: business_scope == 'IN' ? false : true,
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      request: async () => {
        const res: any = await pubGetStoreList({ business_scope: 'IN' });
        return res;
      },
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
      editable: () => history?.location?.pathname.indexOf('signature/detail') > -1,
      width: 120,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
    },
    {
      title: '规格类型',
      tooltip: (
        <img
          style={{ display: 'block', maxWidth: '100%' }}
          alt="规格说明"
          src="/appPage_Scm/images/productTooltip.png"
        />
      ),
      dataIndex: 'type',
      align: 'center',
      editable: false,
      width: 90,
      valueEnum: {
        1: { text: '单品尺寸' },
        2: { text: '包装尺寸' },
        3: { text: '*箱规' },
      },
      render: (_: any, record: any) => {
        if (record.type == 3 && !isApproval) {
          return (
            <>
              <span style={{ color: 'red' }}>*</span>箱规
            </>
          );
        }
        return _;
      },
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
      valueType: 'digit',
      width: 100,
      editable: (text: any, record: any) => record.type == 3 && !isApproval,
      fieldProps: {
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: '商品规格错误, 请输入大于0的数值',
              type: 'number',
              min: 0.1,
            },
          ],
        };
      },
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
      valueType: 'digit',
      width: 100,
      fieldProps: {
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      editable: (text: any, record: any) => record.type == 3 && !isApproval,
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: '商品规格错误, 请输入大于0的数值',
              type: 'number',
              min: 0.1,
            },
          ],
        };
      },
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      fieldProps: {
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      valueType: 'digit',
      width: 100,
      editable: (text: any, record: any) => record.type == 3 && !isApproval,
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: '商品规格错误, 请输入大于0的数值',
              type: 'number',
              min: 0.1,
            },
          ],
        };
      },
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      align: 'center',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      width: 100,
      editable: (text: any, record: any) => record.type == 3 && !isApproval,
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: '商品规格错误, 请输入大于0的数值',
              type: 'number',
              min: 0.1,
            },
          ],
        };
      },
    },
  ];
  // 需要编辑 箱规
  if (editType == 3 || isApproval) {
    columnsSkus.push({
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
      editable: () => !isApproval,
      valueType: 'digit',
      width: 100,
      renderText: (text, record) => (record.type == 3 ? text : ''),
      formItemProps: (_, { entity }: any) => {
        return {
          hidden: !(entity?.type == 3 || entity?.type == 4),
          rules:
            entity?.type == 3 || entity?.type == 4
              ? [
                  {
                    required: true,
                    message: '商品规格错误, 请输入大于0的数值',
                    type: 'number',
                    min: 0.1,
                  },
                ]
              : [],
        };
      },
    });
  }
  return (
    <EditableProTable<goodSpecType>
      className={'p-table-0 specialTable'}
      cardProps={{ style: { padding: 0 } }}
      controlled={true}
      bordered
      editable={{
        form,
        type: 'multiple',
        editableKeys: readonly
          ? []
          : dataSourceFormat
              // .filter((item: any) => item.type == 3)
              .map((record: any) => `${record.sku_id}-${record.type}`),
      }}
      onChange={(val) => {
        onChange(
          value.map((sku: any) => {
            const projectsGoodsSkuSpecifications = val.filter((s: any) => sku.id === s.sku_id);
            const first = projectsGoodsSkuSpecifications?.[0];
            return {
              ...sku,
              project_price: first?.project_price,
              bottom_line_price: first?.bottom_line_price,
              procurement_price: first?.procurement_price,
              bar_code: first?.bar_code == undefined ? sku.bar_code : first?.bar_code,
              position: first?.position == undefined ? sku.position : first?.position,
              projectsGoodsSkuSpecifications,
              brand_id: first?.brand_id,
            };
          }),
        );
      }}
      value={dataSourceFormat}
      recordCreatorProps={false}
      columns={columnsSkus}
      rowKey={(record) => `${record.sku_id}-${record.type}`}
      tableStyle={{ padding: '6px' }}
    />
  );
};
// 审批信息
const BaseInfo: React.FC<any> = ({
  dataSource,
  dicList,
  readonly,
  form,
  name,
  editType,
  labelWidth,
  isApproval,
}: any) => {
  const dataSourceFormat = { ...dataSource, ...dataSource.projects };
  console.log(dataSourceFormat, 'dataSourceFormat');
  const [tabKey, setTabKey] = useState<string>('1');

  console.log(tabKey, 999);
  useEffect(() => {
    setTabKey(
      dataSourceFormat.projectsQiMenCloudCangData?.length &&
        !dataSourceFormat.projectsCloudCangData?.length
        ? '2'
        : '1',
    );
  }, [dataSource]);
  const onChange = (key: string) => {
    console.log(key);
    setTabKey(key);
  };
  return (
    <Card
      title={'产品基本信息'}
      style={{ width: '100%', marginTop: '15px' }}
      bordered={false}
      bodyStyle={{ overflow: 'auto' }}
    >
      <ProDescriptions
        labelStyle={{ width: '100px', justifyContent: 'flex-end' }}
        dataSource={dataSourceFormat}
        columns={[
          {
            title: '立项状态',
            dataIndex: 'approval_status',
            valueEnum: dicList?.PROJECTS_APPROVAL_STATUS || {},
          },
          {
            title: '立项类型',
            dataIndex: 'type',
            valueEnum: dicList?.PROJECTS_TYPE || {},
          },
          {
            title: '产品线',
            dataIndex: 'business_scope',
            render: (text, record) => {
              return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {text == 'IN' ? '跨境' : '国内'}-{record?.vendor_group_name ?? '-'}
                </div>
              );
            },
          },
          {
            title: '上架站点',
            dataIndex: 'listing_site',
            valueEnum:
              dataSource.business_scope == 'CN'
                ? dicList.PROJECTS_LISTING_SITE_1
                : dataSource.business_scope == 'IN'
                ? dicList.PROJECTS_LISTING_SITE_2
                : {},
            render: (_: any, record: any) => {
              console.log(record?.listing_site?.split(','), dicList.PROJECTS_LISTING_SITE_1);
              return dataSource.business_scope == 'CN' ? (
                <ProFormSelect
                  readonly
                  labelCol={{ flex: 0 }}
                  valueEnum={dicList.PROJECTS_LISTING_SITE_1}
                  fieldProps={{
                    value: record?.listing_site?.split(','),
                  }}
                  mode="multiple"
                  label=""
                />
              ) : (
                <span>
                  {pubFilter(dicList.PROJECTS_LISTING_SITE_2, record?.listing_site)}-
                  {record.listing_site_country}
                </span>
              );
            },
          },
          { title: '预计上架时间', dataIndex: 'estimated_launch_time' },
          { title: '产品名称', dataIndex: 'name' },
          { title: '产品编码', dataIndex: 'goods_code' },
          { title: '单位', dataIndex: 'uom', valueEnum: dicList?.GOODS_UOM },
          { title: '定价币种', dataIndex: 'currency', valueEnum: dicList?.SC_CURRENCY },
          { title: '产品开发', dataIndex: 'developer_name', span: 3 },
          {
            title: '立项文档',
            dataIndex: 'requirementsList',
            span: 3,
            render: (_, record: any) =>
              record?.requirementsList && record?.requirementsList?.length ? (
                <ShowFileList data={record?.requirementsList || []} />
              ) : null,
          },
          {
            title: '定稿文档',
            dataIndex: 'finalizedList',
            span: 3,
            render: (_, record: any) =>
              record?.finalizedList && record?.finalizedList?.length ? (
                <ShowFileList data={record?.finalizedList || []} />
              ) : null,
          },
          {
            title: '',
            dataIndex: 'projectsGoodsSkus',
            span: 3,
            render: () => (
              <ProForm.Item label={'款式'} name={name} labelCol={{ flex: labelWidth || '80px' }}>
                <Specification
                  readonly={readonly}
                  form={form}
                  editType={editType}
                  business_scope={dataSource.business_scope}
                  dicList={dicList}
                  isApproval={isApproval}
                />
              </ProForm.Item>
            ),
          },
          {
            title: '',
            dataIndex: 'projectsCloudCangData',
            span: 3,
            hideInDescriptions:
              !dataSourceFormat?.projectsCloudCangData?.length &&
              !dataSourceFormat?.projectsQiMenCloudCangData?.length,
            render: (_, record: any) => (
              <div style={{ width: '100%' }}>
                <Tabs
                  activeKey={tabKey}
                  onChange={onChange}
                  items={
                    dataSourceFormat?.projectsCloudCangData?.length &&
                    dataSourceFormat?.projectsQiMenCloudCangData?.length
                      ? ([
                          {
                            label: `万里牛云仓信息`,
                            key: '1',
                          },
                          {
                            label: `奇门云仓信息`,
                            key: '2',
                          },
                        ] as any)
                      : dataSourceFormat?.projectsCloudCangData?.length
                      ? [
                          {
                            label: `万里牛云仓信息`,
                            key: '1',
                          },
                        ]
                      : dataSourceFormat?.projectsQiMenCloudCangData?.length
                      ? [
                          {
                            label: `奇门云仓信息`,
                            key: '2',
                          },
                        ]
                      : []
                  }
                />
                {!!record?.projectsCloudCangData?.length && tabKey == '1' && (
                  <CloudCangTable
                    defaultData={record?.projectsCloudCangData}
                    dicList={dicList}
                    platform_code="YUNCANG"
                    approval_status={dataSource?.approval_status}
                  />
                )}
                {!!record?.projectsQiMenCloudCangData?.length && tabKey == '2' && (
                  <QiMenCangTable
                    defaultData={record?.projectsQiMenCloudCangData}
                    dicList={dicList}
                    platform_code="QIMEN_YUNCANG"
                    approval_status={dataSource?.approval_status}
                  />
                )}
              </div>
            ),
          },
          {
            title: '',
            dataIndex: 'projectsCloudCangData',
            span: 3,
            hideInDescriptions: dataSource?.business_scope == 'CN' ,
            render: (_: any, record: any) => (
              <PubLogisticsClearance
                dicList={dicList}
                labelCol={{ flex: '106px' }}
                projectsGoodsSkuCustomsClearance={record?.projectsGoodsSkuCustomsClearance}
              />
            ),
          },
        ]}
      />
    </Card>
  );
};

export default BaseInfo;
