// 列表合并单元格内嵌table / 装箱配置
import React, { useState } from 'react';
import { Form, InputNumber, Popconfirm, Space } from 'antd';
import Field from '@ant-design/pro-field';
import { mul } from '@/utils/pubConfirm';
import { ProTable } from '@ant-design/pro-components';
import HandleUnNormal from '@/pages/StockManager/Dialog/HandleUnNormal';
import AddProducts from './CNDialog/AddProducts';

const ListInnerTable: React.FC<{
  value?: any;
  formRef?: any;
  showHeader?: boolean;
  readonly?: boolean;
  type?: string /*国内: cn, 跨境:in*/;
  columnsState?: any; // 列显示隐藏状态;
  colSpanSet?: { value: any }; // 父table内嵌子table需跨列数量
  reload?: any;
  tableKey?: any; // 刷新表格需要
  tableKeySet?: any; // 刷新表格需要
  dicList?: any; // 刷新表格需要
  from?: any;
  operationType?: 'packSet' | 'logisticsSet'; // 装箱或者物流编辑
  warehousing_type?: any; // 1 为计划外入库单
  hideSpec?: boolean; // 是否隐藏箱规显示
  isParts?: boolean; // 配件入库单
  pId?: boolean;
  deleteAction?: any;
  plat?: string;
  common?: any;
  recordS?: any;
  order_type?: any; // 是否是配件补发单，在入库单-创建配件补发单的时候用，如果再有用到这个的，添加备注到这里
}> = ({
  value,
  showHeader,
  readonly,
  formRef,
  type,
  columnsState,
  colSpanSet,
  reload,
  tableKey,
  tableKeySet,
  dicList,
  from,
  operationType,
  warehousing_type,
  hideSpec,
  isParts,
  pId,
  deleteAction,
  plat,
  common,
  recordS,
  order_type,
}: any) => {
  const [key, keySet] = useState(1);
  // console.log(pId, 'pId');
  // console.log(value, 9987);
  const columns: any[] = [
    /*合并字段orderSkuList*/
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      width: 160,
    },
    {
      title: 'SKU',
      dataIndex: type == 'cn' ? 'stock_no' : 'shop_sku_code',
      width: 120,
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
      width: 120,
      hideInTable: type != 'cn',
    },
    {
      title: '计划发货数量(总)',
      dataIndex: 'num',
      align: 'center',
      width: 90,
      hideInTable: isParts || ['汇业仓'].includes(plat) || from === 'page' || order_type == 2,
      renderText: (text: any) => (warehousing_type == 1 ? '计划外' : text),
    },
    {
      title: order_type == 2 ? '发货数量': '计划发货数量(本次)',
      dataIndex: 'delivery_plan_current_num',
      align: 'center',
      width: 90,
      hideInTable: isParts || ['汇业仓'].includes(plat) || from === 'page',
      renderText: (text: any) => (warehousing_type == 1 ? '计划外' : text),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          {hideSpec ? null : (
            <div style={{ width: '350px' }}>
              箱规（最多支持两种箱规）
              <br />
              长（cm）* 宽（cm）* 高（cm）= 体积（cm³）
            </div>
          )}
          <div style={{ width: '60px', display: from == 'EditDrawer' ? 'block' : 'none' }}>
            单箱重量(kg)
          </div>
          <div style={{ width: '60px', whiteSpace: 'nowrap' }}>
            箱规
            <br />
            (每箱数量)
          </div>
          <div style={{ width: '60px' }}>箱数</div>
        </div>
      ),
      dataIndex: 'specificationList',
      align: 'center',
      width: from == 'EditDrawer' ? 680 : hideSpec ? 200 : 620,
      render: (_: any, record: any, index: number) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {record.specificationList
              .filter((item: any) => !item.delete)
              .map((item: any, i: number) => (
                <Space
                  key={i}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    textAlign: 'center',
                    margin: '4px 0',
                  }}
                >
                  <div
                    style={{
                      width: '350px',
                      display: hideSpec ? 'none' : 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                    }}
                  >
                    <Form.Item
                      name={['orderSkuList', index, 'specificationList', i, 'length']}
                      noStyle
                      rules={[
                        { required: true, message: '长度必填' },
                        {
                          validator: (c, val) => {
                            if (val > 10000) {
                              return Promise.reject(new Error('长度不能超过10000'));
                            }
                            if (val == 0 || val < 0) {
                              return Promise.reject(`长度必须大于0`);
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      {i === 0 || readonly ? (
                        <Field valueType="digit" mode={'read'} plain={true} />
                      ) : (
                        <InputNumber min={0} style={{ width: '66px' }} />
                      )}
                    </Form.Item>
                    *
                    <Form.Item
                      name={['orderSkuList', index, 'specificationList', i, 'width']}
                      noStyle
                      rules={[
                        { required: true, message: '宽度必填' },
                        {
                          validator: (c, val) => {
                            if (val > 10000) {
                              return Promise.reject(new Error('宽度不能超过10000'));
                            }
                            if (val == 0 || val < 0) {
                              return Promise.reject(`宽度必须大于0`);
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      {i === 0 || readonly ? (
                        <Field valueType="digit" mode={'read'} plain={true} />
                      ) : (
                        <InputNumber min={0} style={{ width: '66px' }} />
                      )}
                    </Form.Item>
                    *
                    <Form.Item
                      name={['orderSkuList', index, 'specificationList', i, 'high']}
                      noStyle
                      rules={[
                        { required: true, message: '高度必填' },
                        {
                          validator: (c, val) => {
                            if (val > 10000) {
                              return Promise.reject(new Error('高度不能超过10000'));
                            }
                            if (val == 0 || val < 0) {
                              return Promise.reject(`高度必须大于0`);
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      {i === 0 || readonly ? (
                        <Field valueType="digit" mode={'read'} plain={true} />
                      ) : (
                        <InputNumber min={0} style={{ width: '66px' }} />
                      )}
                    </Form.Item>
                    =<div>{mul(mul(item.length, item.width), item.high).toFixed(2)}</div>
                  </div>
                  {from == 'EditDrawer' ? (
                    <div
                      style={{
                        width: '66px',
                      }}
                    >
                      <Form.Item
                        name={['orderSkuList', index, 'specificationList', i, 'unit_weight']}
                        className="aa"
                        noStyle
                        rules={[
                          { required: !readonly, message: '单箱重量必填' },
                          {
                            validator: (r: any, v: any) => {
                              if (v > 10000) {
                                return Promise.reject(new Error('单箱重量不能超过10000'));
                              }
                              const num = formRef?.current?.getFieldValue([
                                'orderSkuList',
                                index,
                                'specificationList',
                                i,
                                'num',
                              ]);
                              if (
                                !readonly &&
                                type != 'cn' &&
                                record?.specificationList?.length == 2 &&
                                record.specificationList.every((a: any) => a.num != 0)
                              ) {
                                return Promise.resolve();
                              }
                              if (!readonly && (v == 0 || v < 0) && num != 0) {
                                return Promise.reject(`${i + 1}, 单箱重量必须大于0`);
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        {i === 0 || readonly ? (
                          <Field valueType="digit" mode={'read'} plain={true} />
                        ) : (
                          <InputNumber
                            min={0}
                            style={{ width: '66px' }}
                            onChange={() => {
                              formRef?.current?.validateFields([
                                ['orderSkuList', index, 'specificationList', i, 'unit_weight'],
                              ]);
                            }}
                          />
                        )}
                      </Form.Item>
                    </div>
                  ) : (
                    ''
                  )}
                  <div
                    style={{
                      width: '66px',
                    }}
                  >
                    <Form.Item
                      name={['orderSkuList', index, 'specificationList', i, 'pics']}
                      noStyle
                      rules={[
                        { required: true, message: '箱规必填' },
                        {
                          validator: (r: any, v: any) => {
                            if (v > 10000) {
                              return Promise.reject(new Error('箱规不能超过10000'));
                            }
                            if (
                              !readonly &&
                              type != 'cn' &&
                              record?.specificationList?.length == 2 &&
                              record.specificationList.every((a: any) => a.num != 0)
                            ) {
                              return Promise.resolve();
                            }
                            if (v == 0 && item.num > 0) {
                              return Promise.reject(`${i + 1}, 箱数大于0, 每箱数量不能小于0`);
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      {i === 0 || readonly ? (
                        <Field valueType="digit" mode={'read'} plain={true} />
                      ) : (
                        <InputNumber
                          min={0}
                          style={{ width: '66px' }}
                          onChange={() => {
                            formRef?.current?.validateFields([
                              ['orderSkuList', index, 'specificationList', i, 'num'],
                            ]);
                          }}
                        />
                      )}
                    </Form.Item>
                  </div>
                  <div
                    style={{
                      width: '66px',
                    }}
                  >
                    <Form.Item
                      name={['orderSkuList', index, 'specificationList', i, 'num']}
                      noStyle
                      rules={[
                        { required: true, message: '箱数必填' },
                        {
                          validator: (c, val) => {
                            if (val > 10000) {
                              return Promise.reject(new Error('最多不能超过10000箱'));
                            }

                            const newSpec = record?.specificationList.filter((v: any)=>!v.delete)
                            if (
                              type != 'cn' &&
                              newSpec?.length == 2 &&
                              newSpec.every((v: any) => v.num != 0)
                            ) {
                              return Promise.reject(
                                `第${
                                  i == 0 ? '一' : '二'
                                }行：箱规不能同时使用，请将默认箱规或者备用箱规箱数置为0`,
                              );
                            }

                            const num = record.specificationList
                              .filter((s: any) => !s.delete)
                              .reduce(
                                (previousValue: any, currentValue: any) =>
                                  previousValue + currentValue.pics * currentValue.num,
                                0,
                              );
                            if (num != record.delivery_plan_current_num && !isParts) {
                              return Promise.reject(
                                `${
                                  i + 1
                                }, 非整箱或发货数量不等于本次计划发货数量，请重新设置装箱！`,
                              );
                            }
                            if (item.pics == 0 && item.num > 0) {
                              return Promise.reject(`${i + 1}, 箱数大于0,每箱数量应大于0`);
                            }
                            if (num == 0) {
                              return Promise.reject(`${i + 1}, 箱数和发货数量应大于0`);
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      {readonly ? (
                        /*num*/
                        <Field valueType="digit" mode={'read'} plain={true} />
                      ) : (
                        <InputNumber
                          min={0}
                          style={{ width: '66px' }}
                          precision={0}
                          onChange={() => {
                            formRef?.current?.validateFields([
                              ['orderSkuList', index, 'specificationList', i, 'unit_weight'],
                            ]);
                          }}
                        />
                      )}
                    </Form.Item>
                  </div>
                </Space>
              ))}
            {record.specificationList && record.specificationList.length && !readonly ? (
              <a
                style={{ maxWidth: '200px', margin: 'auto' }}
                onClick={() => {
                  if (record.specificationList.filter((v: any) => v.delete != 1)?.length == 1) {
                    if (record.specificationList.some((v: any) => v.delete == 1)) {
                      record.specificationList[1].delete = null;
                    } else {
                      record.specificationList.push({
                        order_id: record.specificationList[0]?.order_id,
                        order_no: record.specificationList[0]?.order_no,
                        arrival_actual_num: record.specificationList[0]?.arrival_actual_num,
                        length: 0,
                        width: 0,
                        high: 0,
                        pics: 0,
                        num: 0,
                      });
                    }
                  } else {
                    // 删除旧数据加上delete:1传回后端
                    const lastOne = record.specificationList[record.specificationList.length - 1];
                    if (lastOne.id) {
                      lastOne.delete = 1;
                    } else {
                      record.specificationList.splice(1, 1);
                    }
                    setTimeout(() => {
                      formRef?.current?.validateFields([
                        ['orderSkuList', 0, 'specificationList', 0, 'num'],
                      ]);
                    }, 500);
                  }
                  keySet(Date.now());
                }}
              >
                {record.specificationList.filter((v: any) => v.delete != 1)?.length == 1
                  ? '+ 添加备用箱规'
                  : '- 删除备用箱规'}
              </a>
            ) : null}
          </div>
        );
      },
      hideInTable: from === 'page',
    },
    {
      title: '发货数量',
      dataIndex: 'numTotal',
      align: 'center',
      width: 90,
      hideInSearch: true,
      dependencies: ['specificationList'],
      render: (_: any, record: any) => {
        // console.log(record, 3232323);
        const num = record.specificationList.reduce((previousValue: any, currentValue: any) => {
          let temp = previousValue;
          if (!currentValue.delete) {
            temp += currentValue.pics * currentValue.num;
          }
          return temp;
        }, 0);
        return from === 'page' ? (
          record.order_type == 2 ? (
            <span>{isNaN(num) ? '-' : num}</span>
          ) : (
            record.delivery_plan_current_num
          )
        ) : (
          <span>{isNaN(num) ? '-' : num}</span>
        );
      },
    },
    {
      title: '实际入库数量',
      dataIndex: 'warehousing_num',
      align: 'center',
      width: 90,
      hideInTable: operationType == 'packSet',
    },
    {
      title: '平台入库异常',
      dataIndex: 'difference_num',
      align: 'center',
      width: 90,
      render: (_: any, record: any) => (
        <HandleUnNormal
          tableKey={tableKey}
          tableKeySet={tableKeySet}
          dataSource={record}
          recordS={{...recordS, goods_sku_id: record.goods_sku_id, id: record.order_id}}
          reload={reload}
          dicList={dicList}
          type={type}
          common={common}
        />
      ),
      hideInTable: operationType == 'packSet',
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      hideInTable: !isParts,
      render: (_: any, row: any) => [
        <Popconfirm
          key="delete"
          title="确定删除吗?"
          onConfirm={async () => deleteAction(row.goods_sku_id)}
          okText="确定"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
    /*合并字段orderSkuList结束*/
  ];
  const columnsFilter: any[] = columns.filter((column: any) => {
    if (columnsState && Object.keys(columnsState)?.length) {
      if (typeof columnsState[column.dataIndex]?.show === 'boolean') {
        return columnsState[column.dataIndex].show;
      }
      return true;
    }
    return true;
  });
  // console.log(columnsFilter, 'columnsFilter');
  if (typeof colSpanSet === 'object') {
    colSpanSet.value = columnsFilter.length;
  }
  const setSkuList = (list: any) => {
    formRef.current.setFieldsValue({
      orderSkuList: list,
    });
  };
  return (
    <div className="p-table-inTable-content">
      {isParts ? (
        /*添加商品*/
        <div
          style={{ marginBottom: '10px' }}
        >
          <AddProducts
            pId={pId}
            setSkuList={setSkuList}
            drawerFormRef={formRef}
            plat={plat}
          />
        </div>
      ) : undefined}
      <ProTable
        key={key}
        columns={columnsFilter}
        dataSource={value}
        rowKey={(record) => record.goods_sku_id + record.order_id}
        showHeader={showHeader || false}
        className={'p-table-0'}
        bordered
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
        style={{ wordBreak: 'break-all' }}
        scroll={from == 'EditDrawer' ? { x: 1200 } :  undefined}
      />
    </div>
  );
};
export default ListInnerTable;
