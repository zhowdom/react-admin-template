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
import React from 'react';
import { Card } from 'antd';
import ProDescriptions from '@ant-design/pro-descriptions';
import type { ProColumnType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import ProForm from '@ant-design/pro-form';
import { handleCutZero } from '@/utils/pubConfig';

// 商品规格
const Specification: React.FC<any> = ({ readonly, form, value, onChange, editType }: any) => {
  const dataSourceFormat: any = [];
  // 需要编辑 箱规
  if (value && value.length) {
    value.forEach((sku: any) => {
      if (sku.skuSpecifications && sku.skuSpecifications.length) {
        sku.skuSpecifications.forEach((specification: any) => {
          dataSourceFormat.push({
            ...specification,
            sku_name: sku.sku_name,
            sku_code: sku.sku_code,
            price: sku.price,
            image_url: sku.image_url,
            bar_code: sku.bar_code,
            sku_id: sku.id,
            erp_sku: sku.erp_sku,
            rowSpan: sku.skuSpecifications.length,
          });
        });
      }
    });
  }
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
  };
  const columnsSkus: ProColumnType<goodSpecType>[] = [
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
      title: '款式名称',
      dataIndex: 'sku_name',
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
      title: 'ERP编码',
      dataIndex: 'erp_sku',
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
      title: '定价',
      dataIndex: 'price',
      align: 'center',
      editable: false,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
      width: 80,
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
      editable: false,
      onCell: ({ rowSpan }: any, index: any) => {
        if (index % rowSpan) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
      width: 120,
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
        if (record.type == 3) {
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
      fieldProps: {
        max: 999999,
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
        max: 999999,
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
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      valueType: 'digit',
      fieldProps: {
        max: 999999,
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      width: 100,
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
        max: 999999,
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      width: 100,
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
  if (editType == 3) {
    columnsSkus.push({
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
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
      className={'p-table-0'}
      cardProps={{ style: { padding: 0 } }}
      controlled={true}
      editable={{
        form,
        type: 'multiple',
        editableKeys: readonly
          ? []
          : dataSourceFormat
              .filter((item: any) => item.type == 3)
              .map((record: any) => `${record.sku_id}-${record.type}`),
      }}
      onChange={(val) => {
        onChange(
          value.map((sku: any) => {
            return {
              ...sku,
              skuSpecifications: val.filter((s: any) => sku.id === s.sku_id),
            };
          }),
        );
      }}
      value={dataSourceFormat}
      recordCreatorProps={false}
      columns={columnsSkus}
      bordered
      rowKey={(record) => `${record.sku_id}-${record.type}`}
      tableStyle={{ padding: '6px' }}
    />
  );
};
// 审批信息
const BaseInfo: React.FC<any> = ({ dataSource, dicList, readonly, form, name, editType }: any) => {
  const dataSourceFormat = { ...dataSource, ...dataSource.goods };
  return (
    <Card
      title={'产品基本信息'}
      style={{ width: '100%', marginTop: '10px' }}
      bordered={false}
      bodyStyle={{ overflow: 'auto' }}
    >
      <ProDescriptions
        labelStyle={{ width: '80px', justifyContent: 'flex-end' }}
        dataSource={dataSourceFormat}
        columns={[
          { title: '产品名称', dataIndex: 'name_cn', span: 3 },
          {
            title: '产品线',
            dataIndex: 'business_scope',
            render: (text, record) => {
              return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {text == 'IN' ? '跨境' : '国内'} - {record.category_name}
                </div>
              );
            },
          },

          { title: '产品编码', dataIndex: 'goods_code' },
          { title: '单位', dataIndex: 'uom', valueEnum: dicList?.GOODS_UOM },
          {
            title: '',
            dataIndex: name,
            render: () => (
              <ProForm.Item label={'款式'} name={name} labelCol={{ flex: '80px' }}>
                <Specification readonly={readonly} form={form} editType={editType} />
              </ProForm.Item>
            ),
          },
        ]}
      />
    </Card>
  );
};

export default BaseInfo;
