import { priceValue } from '@/utils/filter';
import { pubFilter } from '@/utils/pubConfig';
import type { EditableFormInstance } from '@ant-design/pro-components';
import { mul } from '@/utils/pubConfirm';
import { EditableProTable } from '@ant-design/pro-components';
import { useState, useRef } from 'react';
import '../index.less';
import CustomSelect from '@/components/CustomSelect';

const OrderTable = (props: any) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(props.editIds);
  const [dataSource, setDataSource] = useState<any>(props?.value || []);
  const { dicList, currency, type, afterColor } = props;
  const [tableCurrency] = useState(pubFilter(dicList?.SC_CURRENCY, currency));
  const editorFormRef = useRef<EditableFormInstance<any>>();
  // 对象某属性相同去重
  const setAction = (arr: any, key: string) => {
    const typeList: any = []; //定义空数组，用于装载去重之后的数组，
    const newObj: any = {}; //定义空对象，用于数组转换成对象
    if (arr?.length) {
      //如果有值
      arr.forEach((item: any) => {
        // console.log(item?.[`${key}`])
        //可以用indexOf()数组去重 如果检索的结果匹配到,则返回 1. 如果检索的结果没有匹配值,则返回 -1.
        if (typeList.indexOf(item?.[`${key}`]) === -1) {
          typeList.push(item?.[`${key}`]);
          console.log(typeList);
          newObj[item?.[`${key}`]] = [item];
        }
      });
    }
    return Object.values(newObj).flat(1);
  };
  const columns: any = [
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
    },
    {
      title: '商品条形码',
      dataIndex: 'bar_code',
      align: 'center',
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '箱规(每箱数量)',
      dataIndex: 'quantity_per_box',
      width: 110,
      align: 'center',
      valueType: 'select',
      renderFormItem: (record: any) => {
        const options = setAction(
          record?.entity?.chooseSpecification?.map((v: any) => {
            return {
              value: v.pics,
              label: v.pics,
            };
          }) || [],
          'value',
        );

        return <CustomSelect options={options} />;
      },
      render: (_: any, record: any) => {
        if (type === 'before') {
          return record.before_quantity_per_box;
        } else if (type === 'after') {
          return (
            <span
              className={
                afterColor && record.before_quantity_per_box != record.after_quantity_per_box
                  ? 'add-color'
                  : ''
              }
            >
              {record.after_quantity_per_box}
            </span>
          );
        } else if (type === 'both') {
          return record.before_quantity_per_box == record.after_quantity_per_box ? (
            <span>{record.before_quantity_per_box}</span>
          ) : (
            <div className="both-style">
              <span>{`${record.before_quantity_per_box}`}</span>
              <span>{` -> `}</span>
              <span>{`${record.after_quantity_per_box}`}</span>
            </div>
          );
        } else {
          return record.quantity_per_box;
        }
      },
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '单位',
      dataIndex: 'uom',
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
      title: '未交货数量',
      dataIndex: 'undelivered_num',
      align: 'center',
      hideInTable: props?.pageType != 'edit',
      editable: false,
    },
    {
      title: '已被锁定数量',
      dataIndex: 'lock_num',
      align: 'center',
      editable: false,
      hideInTable: props?.pageType != 'edit',
    },
    {
      title: '下单数量',
      dataIndex: 'num',
      align: 'center',
      valueType: 'digit',
      width: 110,
      fieldProps: {
        precision: 0,
        min: 0,
      },
      render: (_: any, record: any) => {
        if (type === 'before') {
          return record.before_num;
        } else if (type === 'after') {
          return (
            <span
              className={afterColor && record.before_num != record.after_num ? 'add-color' : ''}
            >
              {record.after_num}
            </span>
          );
        } else if (type === 'both') {
          return record.before_num == record.after_num ? (
            <span>{record.before_num}</span>
          ) : (
            <div className="both-style">
              <span>{`${record.before_num}`}</span>
              <span>{` -> `}</span>
              <span>{`${record.after_num}`}</span>
            </div>
          );
        } else {
          return record.num;
        }
      },
      formItemProps: (_: any, row: any) => {
        return {
          rules: [
            {
              required: true,
              validator(a: any, value: any) {
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
                if (!allNum) {
                  return Promise.reject(new Error('下单总数量不能为0'));
                }
                if (value > row.entity.copy_num && props?.order_type == 1) {
                  return Promise.reject(new Error(`可下单数量: ${row.entity.copy_num}`));
                }

                if (value < row.entity.lock_num && props?.order_type == 1) {
                  return Promise.reject(new Error(`下单数量不能小于${row.entity.lock_num}`));
                }
                // 部分入库下单数量允许修改为锁定数量  2023-04-12 去掉入库单的状态判断
                if (
                  // props?.delivery_status == '1' &&
                  (!(row.entity.quantity_per_box && value % row.entity.quantity_per_box) ||
                    value == row.entity.lock_num) &&
                  row.entity.lock_num != 0
                ) {
                  return Promise.resolve();
                } else if (row.entity.quantity_per_box && value % row.entity.quantity_per_box) {
                  return Promise.reject(new Error('非整箱！'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: `单价(${tableCurrency})`,
      dataIndex: 'price',
      render: (_: any, record: any) => {
        if (type === 'before') {
          return priceValue(record?.before_price);
        } else if (type === 'after') {
          return (
            <span
              className={afterColor && record.before_price != record.after_price ? 'add-color' : ''}
            >
              {`${priceValue(record?.after_price)}`}
            </span>
          );
        } else if (type === 'both') {
          return record.before_price == record.after_price ? (
            priceValue(record?.before_price)
          ) : (
            <div className="both-style">
              <span>{`${priceValue(record?.before_price)}`}</span>
              <span>{` -> `}</span>
              <span>{`${priceValue(record?.after_price)}`}</span>
            </div>
          );
        } else {
          return record.price;
        }
      },
      align: 'center',
      valueType: 'digit',
      width: 110,
      editable: (text: any, record: any) => props?.pageType == 'edit' && record.goods_sku_type == 1,
      formItemProps: (_: any, row: any) => {
        return {
          extra: row.entity.extra ? row.entity.extra : '',
          rules: [
            {
              required: true,
              message: '请输入单价',
            },
            {
              message: '不能高于最新采购价或者原来采购单价格',
              validator(a: any, value: any) {
                if (value > row.entity.max_price && props?.order_type == 1) {
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
    },
    {
      title: `金额(${tableCurrency})`,
      editable: false,
      dataIndex: 'total',
      align: 'center',
      width: 150,
      render: (_, record: any) => {
        if (type === 'before') {
          const totalNum =
            record.before_price && record.before_num
              ? mul(record.before_price, record.before_num)
              : '-';
          return [<span key="status">{priceValue(totalNum)}</span>];
        } else if (type === 'after') {
          const totalNumB =
            record.before_price && record.before_num
              ? mul(record.before_price, record.before_num)
              : '-';
          const totalNumA =
            record.after_price && record.after_num
              ? mul(record.after_price, record.after_num)
              : '-';
          return [
            <span key="status" className={afterColor && totalNumB != totalNumA ? 'add-color' : ''}>
              {priceValue(totalNumA)}
            </span>,
          ];
        } else if (type === 'both') {
          const totalNumB =
            record.before_price && record.before_num
              ? mul(record.before_price, record.before_num)
              : '-';
          const totalNumA =
            record.after_price && record.after_num
              ? mul(record.after_price, record.after_num)
              : '-';
          return totalNumA == totalNumB ? (
            <>{priceValue(totalNumA)}</>
          ) : (
            <div className="both-style">
              <span>{`${priceValue(totalNumB)} `}</span>
              <span>{` -> `}</span>
              <span>{`${priceValue(totalNumA)}`}</span>
            </div>
          );
        } else {
          const totalNum = record.price && record.num ? mul(record.price, record.num) : '-';
          return [<span key="status">{priceValue(totalNum)}</span>];
        }
      },
    },
    {
      title: '供应商出货时间(货好时间)',
      dataIndex: 'shipment_time',
      render: (_: any, record: any) => {
        if (type === 'before') {
          return record.before_shipment_time;
        } else if (type === 'after') {
          return (
            <span
              className={
                afterColor && record.before_shipment_time != record.after_shipment_time
                  ? 'add-color'
                  : ''
              }
            >
              {record.after_shipment_time}
            </span>
          );
        } else if (type === 'both') {
          return record.before_shipment_time === record.after_shipment_time ? (
            record.before_shipment_time
          ) : (
            <div className="both-style">
              <span>{`${record.before_shipment_time}`}</span>
              <span>{` -> `}</span>
              <span>{`${record.after_shipment_time}`}</span>
            </div>
          );
        } else {
          return record.shipment_time;
        }
      },
      align: 'center',
      valueType: 'date',
      width: 130,
      formItemProps: {
        rules: [{ required: true, message: '请选择供应商出货时间(货好时间)' }],
      },
    },
  ];
  return (
    <EditableProTable
      size={props?.size || 'small'}
      tableStyle={{ margin: '10px 0' }}
      columns={columns}
      rowKey="id"
      value={dataSource}
      className="expanded-table item0"
      controlled={true}
      recordCreatorProps={false}
      headerTitle={false}
      onChange={setDataSource}
      editableFormRef={editorFormRef}
      scroll={{ x: 1200 }}
      editable={{
        type: 'multiple',
        editableKeys,
        form: props?.form,
        onValuesChange: (record, recordList) => {
          console.log(2, recordList);
          console.log(1);
          record.total_price = mul(record.num, record.price);
          if (record.goods_sku_type == 1) {
            if (record.price < mul(record.copy_price, 0.8) && props?.order_type == 1) {
              record.extra = '低于最新采购价20%';
            } else {
              record.extra = '';
            }
          }
          if (props.pageType === 'edit') {
            console.log(recordList);
            props?.formRef?.current?.setFieldsValue({
              [props.formName]: recordList,
            });
          }
          setDataSource(recordList);
        },
        onChange: setEditableRowKeys,
      }}
      bordered={true}
    />
  );
};
export default OrderTable;
