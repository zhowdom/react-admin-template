import React, { useState, useRef } from 'react';
import { EditableFormInstance, EditableProTable } from '@ant-design/pro-table';
import {Divider, Form, Space, Statistic} from 'antd';
import { pubAlert, pubFilter } from '@/utils/pubConfig';
import { IsGrey, mul } from '@/utils/pubConfirm';
import CustomArea from './CustomArea';
import BuyHistory from './BuyHistory';
import Popconfirm from 'antd/es/popconfirm';
import { history } from 'umi';
import './index.less';
import { sortBy } from 'lodash';

const EditZTTable = (props: any) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(props.editIds || []);
  const [dataSource, setDataSource] = useState<any>();
  const type = history?.location?.query?.type;
  const hide = type === 'detail'; // 查看
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const formItemLayout1 = {
    // labelCol: { span: 1.5 },
    wrapperCol: { span: 24 },
  };
  // 删除SKU
  const delSku = async (record: any) => {
    const newData = props.formRef1?.current?.getFieldsValue();
    if (record.goods_sku_type == 1) {
      const skuList = newData.purchaseOrderSku.filter((v: any) => v.goods_sku_type == 1);
      if (skuList?.length == 1) return pubAlert('请至少保留一个SKU！');
    }
    let data = newData?.purchaseOrderSku?.filter((item: any) =>
      record.goods_sku_type == 1
        ? item.goods_sku_id !== record.goods_sku_id
        : item.id !== record.id,
    );
    // 判断是否包含备品
    data = data.map((item: any) => {
      const hasSpare = data.find((k: any) => k.goods_sku_id == item.goods_sku_id && k.goods_sku_type == 2);
      return {
        ...item,
        rowSpan: item.goods_sku_type == 1 ? (hasSpare ? 2 : 1) : 0,
      }
    })
      // 数据顺序不一致, 合并单元格错位v1.2.3
    data = sortBy(data, ['sku_code', 'goods_sku_type'])
    setDataSource(
      data.map((v: any, index: number) => {
        v.index = index + '';
      }),
    );
    props.deleteChange(record);
    props.tableDataChange(data);
  };
  const columns: any = [
    {
      title: '关联采购计划单号',
      dataIndex: 'plan_no',
      align: 'center',
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan, style: { padding: 0 } }),
      hideInTable: props.order_type == 2,
      width: 120,
      render: (_, record: any) => {
        if (record?.purchasePlanList?.length) {
          return <Space style={{width: '100%'}} direction={'vertical'} split={<Divider style={{margin: 0, borderColor: '#d9d9d9', width: '100%'}} plain />}>
            {record?.purchasePlanList.map((item: any) => item.plan_no)}
          </Space>
        } else {
          return _
        }
      },
    },
    {
      title: '计划下单数量',
      dataIndex: 'plan_num',
      align: 'center',
      editable: false,
      hideInTable: hide || props.order_type == 2,
      onCell: (record: any) => ({ rowSpan: record.rowSpan, style: { padding: 0 } }),
      render: (_, record: any) => {
        if (record?.purchasePlanList?.length) {
          return <Space style={{width: '100%'}} direction={'vertical'} split={<Divider style={{margin: 0, borderColor: '#d9d9d9', width: '100%'}} plain />}>
            {record?.purchasePlanList.map((item: any) => item.num)}
          </Space>
        } else {
          return _
        }
      },
    },
    {
      title: '未下单数量',
      dataIndex: 'undelivered_qty',
      align: 'center',
      editable: false,
      hideInTable: hide || props.order_type == 2,
      onCell: (record: any) => ({ rowSpan: record.rowSpan, style: { padding: 0 } }),
      render: (_, record: any) => {
        if (record?.purchasePlanList?.length) {
          return <Space style={{width: '100%'}} direction={'vertical'} split={<Divider style={{margin: 0, borderColor: '#d9d9d9', width: '100%'}} plain />}>
            {record?.purchasePlanList.map((item: any) => item.no_order_qty)}
          </Space>
        } else {
          return _
        }
      },
    },
    {
      title: '商品图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: 'SKU',
      dataIndex: props.business_scope === 'CN' ? 'stock_no' : 'shop_sku_code',
      align: 'center',
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      width: 120,
      render: (_: any, record: any) => {
        return (
          <>
            <div>{props?.business_scope === 'CN' ? record.stock_no : record.shop_sku_code}</div>
            <BuyHistory
              title="采购历史"
              business_scope={props?.business_scope}
              data={record}
              dicList={props?.dicList}
            />
          </>
        );
      },
    },
    {
      title: '商品条形码',
      dataIndex: 'bar_code',
      align: 'center',
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '生命周期',
      dataIndex: 'life_cycle',
      valueType: 'select',
      align: 'center',
      width: 100,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      render: (_: any, record: any) => {
        return pubFilter(props?.dicList?.GOODS_LIFE_CYCLE, record?.life_cycle) || '-';
      },
      hideInTable: props.order_type == 2,
    },
    {
      title: '单位',
      dataIndex: 'uom',
      align: 'center',
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      width: 70,
    },
    {
      title: '箱规(每箱数量)',
      dataIndex: 'quantity_per_box',
      align: 'center',
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '商品类型',
      dataIndex: 'goods_sku_type',
      align: 'center',
      editable: false,
      width: 100,
      render: (_: any, record: any) => {
        return record.goods_sku_type == '1' ? '采购商品' : '备品(赠品)';
      },
    },
    {
      title: '下单数量',
      dataIndex: 'num',
      align: 'center',
      valueType: 'digit',
      width: 110,
      fieldProps: {
        precision: 0,
      },
      formItemProps: (_: any, row: any) => {
        return {
          rules: [
            {
              required: true,
              validator(a: any, value: any) {
                if (!value && props?.pageType == 'edit') {
                  return Promise.reject(new Error('请输入下单数量'));
                }

                const allPro = props?.form?.getFieldsValue();
                const newBaPro = {};
                let allNum = 0;
                for (const k in allPro) {
                  allNum += allPro[k].num;
                  newBaPro[k] = [
                    {
                      name: 'num',
                      value: allPro[k].num,
                    },
                  ];
                }
                // if (props?.pageType == 'update') {
                //   console.log(props.form, 'allPro');
                //   // props.form?.validateFields([['1592002997142679554','num']])
                // }
                // 下单数量最大值, 兼容作废情况
                let origin_u = row.entity.origin_u
                if (row.entity.approval_status == '9') {
                  origin_u = row.entity.undelivered_qty
                }
                if (!allNum && props?.pageType == 'update') {
                  return Promise.reject(new Error('下单总数量不能为0'));
                }

                if (
                  value > origin_u &&
                  row.entity.goods_sku_type == 1 &&
                  props?.order_type == 1
                ) {
                  return Promise.reject(new Error(`可下单数量: ${origin_u}`));
                }
                if (row.entity.quantity_per_box && value % row.entity.quantity_per_box) {
                  return Promise.reject(new Error('非整箱！'));
                }
                if (value < 0) {
                  return Promise.reject(new Error('下单数量不能小于1'));
                }
                if (value > 99999) {
                  return Promise.reject(`输入内容不能超过99999`);
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '箱数',
      dataIndex: 'number_boxes',
      align: 'center',
      editable: false,
      render: (_, record: any) => {
        return (
          <Statistic
            value={record?.number_boxes}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          />
        );
      },
    },

    {
      title: `单价${props.tableCurrency}`,
      dataIndex: 'price',
      align: 'center',
      valueType: 'digit',
      width: 160,
      editable: (text: any, record: any) =>
        (props?.pageType == 'edit' ||
          (props?.approval_status == '3' && props?.pageType == 'update')) &&
        record.goods_sku_type == 1,
      formItemProps: (_: any, row: any) => {
        return {
          extra: row.entity.extra ? row.entity.extra : '',
          rules: [
            {
              required: true,
              message: '请输入单价',
            },
            {
              message: `不能高于最新采购价 ${row.entity.copy_price}`,
              validator(a: any, value: any) {
                if (value > row.entity.copy_price && props?.order_type == 1) {
                  return Promise.reject();
                }
                return Promise.resolve();
              },
            },
            {
              message: `输入内容不能超过99999`,
              validator(a: any, value: any) {
                if (value > 99999) {
                  return Promise.reject();
                }
                return Promise.resolve();
              },
            },

            {
              warningOnly: true,
              validator(a: any, value: any) {
                if (!row.entity?.copy_price) return Promise.resolve();
                if (!value) return Promise.resolve();
                if (value < mul(row.entity.copy_price, 0.8) && props?.order_type == 1) {
                  return Promise.reject(new Error('低于最新采购价20%'));
                }

                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: {
        min: 0,
        precision: 2,
      },
      hideInTable: IsGrey
    },
    {
      title: `金额${props.tableCurrency}`,
      editable: false,
      dataIndex: 'total',
      align: 'center',
      render: (_, record: any) => {
        const totalNum = record.price && record.num ? mul(record.price, record.num) : '0.00';
        return [
          <span key="status">
            <Statistic
              value={totalNum}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
              precision={2}
            />
          </span>,
        ];
      },
      hideInTable: IsGrey
    },
    {
      title: '供应商出货时间(货好时间)',
      dataIndex: 'shipment_time',
      align: 'center',
      valueType: 'date',
      width: 140,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      align: 'center',
      tooltip: '备注会同步至供应商，供应商可以查看，但不显示到签约采购单',
      renderFormItem: () => {
        return <CustomArea />;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      editable: false,
      align: 'center',
      hideInTable: props?.pageType != 'edit',
      render: (text: any, record: any) => [
        <Popconfirm
          key="delete"
          title="确认删除"
          onConfirm={() => {
            delSku(record);
          }}
        >
          <a>{record.goods_sku_type == 1 ? '删除' : '删除备品'}</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <Form.Item {...formItemLayout1} label="" name="purchaseOrderSku">
      <EditableProTable
        columns={columns}
        rowKey="id"
        value={dataSource}
        className={'p-table-0 add-order-one-table item0'}
        controlled={true}
        tableStyle={{ width: '100%' }}
        recordCreatorProps={false}
        headerTitle={false}
        scroll={{ x: 2000 }}
        onChange={setDataSource}
        editableFormRef={editorFormRef}
        editable={{
          type: 'multiple',
          editableKeys,
          form: props.form,
          onValuesChange: (record, recordList) => {
            record.number_boxes = record.quantity_per_box
              ? Math.ceil(record.num / record.quantity_per_box)
              : record.quantity_per_box;
            record.total_price = mul(record.num, record.price);
            if (record.goods_sku_type == 1) {
              if (record.price < mul(record.copy_price, 0.8) && props?.order_type == 1) {
                record.extra = '低于最新采购价20%';
              } else {
                record.extra = '';
              }
            }
            props.formRef1.current.setFieldsValue({
              purchaseOrderSku: recordList,
            });
            setDataSource(recordList);
          },
          onChange: setEditableRowKeys,
        }}
        bordered={true}
      />
    </Form.Item>
  );
};
export default EditZTTable;
