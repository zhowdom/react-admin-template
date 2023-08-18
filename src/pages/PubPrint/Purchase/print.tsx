import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { Button, Space, Spin } from 'antd';
import { Table, Typography } from 'antd';
import './../print.less';
import { connect, history } from 'umi';
import {
  accountStatementOrderGetDetailByIds,
  accountStatementOrderPrint,
} from '@/services/pages/reconciliationPurchase';
import { arraySum, IsGrey, mul } from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubModal, pubAlert } from '@/utils/pubConfig';
import DetailItem from '@/components/Reconciliation/DetailItem';
import { dateFormat, priceValue, convertCurrency, flatData } from '@/utils/filter';
import ProTable from '@ant-design/pro-table';
import moment from 'moment';

// // 禁止选择文本
// const omitformtagList = ['input', 'textarea', 'select'];
// const omitformtags = omitformtagList.join('|');
// function disableselect(e: any) {
//   if (omitformtags.indexOf(e.target.tagName.toLowerCase()) == -1) return false;
// }
// function reEnable() {
//   return true;
// }
// if (typeof document.onselectstart != 'undefined')
//   document.onselectstart = new Function('return false');
// else {
//   document.onmousedown = disableselect;
//   document.onmouseup = reEnable;
// }
// document.title = '对账单';
// // 禁用右键
// function stop() {
//   return false;
// }
// document.oncontextmenu = stop;

//
const Page: FC<Record<string, any>> = () => {
  const [loading, setLoading] = useState(false);
  const [detailList, setDetailList] = useState([]);
  const ids = history.location?.query?.ids || '';
  const { Text } = Typography;

  const getDetail = async () => {
    setLoading(true);
    const res = await accountStatementOrderGetDetailByIds({ ids });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      res.data.forEach((item: any) => {
        let newAccount: any = [];
        const oldAccount = item.accountStatementOrderDetail;
        for (const k in oldAccount) {
          const newItem = oldAccount[k].map((v: any, index: number) => ({
            ...v,
            rowSpan: !index ? oldAccount[k].length : 0,
          }));
          newAccount = [...newItem].concat(newAccount);
        }
        console.log(newAccount);
        item.accountStatementOrderDetail = newAccount;
        item.columnsDetail = {
          warehousing_num: arraySum(
            item.accountStatementOrderDetail?.map((v: any) => v.warehousing_num),
          ),
          arrival_num: arraySum(item.accountStatementOrderDetail?.map((v: any) => v.arrival_num)),
          total_amount: arraySum(item.accountStatementOrderDetail?.map((v: any) => v.total_amount)),
          freight_amount: arraySum(
            item.accountStatementOrderDetail?.map((v: any) => v.freight_amount),
          ),
          total: arraySum(item.accountStatementOrderDetail?.map((v: any) => v.total)),
          prepayment_amount: arraySum(
            item.accountStatementOrderDetail?.map((v: any) => v.prepayment_amount),
          ),
          payable_amount: arraySum(
            item.accountStatementOrderDetail?.map((v: any) => v.payable_amount),
          ),
        };
        item.logistics_loss_list = item?.logistics_loss_list?.map((v: any) => ({
          ...v,
          amount: mul(v.price, v.logistics_loss_qty),
        }));
        item.askactionColumns = {
          amount: arraySum(item.purchaseOrderRequestFundsList?.map((v: any) => v.amount)),
        };
        item.deductionColumns = {
          available_amount: arraySum(
            item.sysBusinessDeductionList?.map((v: any) => v.available_amount),
          ),
          amount: arraySum(item.sysBusinessDeductionList?.map((v: any) => v.amount)),
        };
        item.otherColumns = {
          amount: arraySum(item.sysBusinessOtherFundsList?.map((v: any) => v.amount)),
        };
        item.lostColumns = {
          amount: arraySum(item.logistics_loss_list?.map((v: any) => v.amount)),
        };
      });
      setDetailList(res.data ? res.data : []);
    }
    setLoading(false);
  };
  useEffect(() => {
    getDetail();
  }, []);

  // 打印
  const print = async () => {
    pubModal('是否确认打印对账单？')
      .then(async () => {
        pubAlert('请立即打印，取消打印预览也会计打印数！').then(async () => {
          setLoading(true);
          const res = await accountStatementOrderPrint({ ids: ids });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          } else {
            setTimeout(() => {
              window.print(); //调用浏览器的打印功能
            }, 200);
          }
          setLoading(false);
        });
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  const getColumns = (data: any) => {
    console.log(data);
    return [
      {
        title: '采购单号',
        dataIndex: 'purchase_order_no',
        align: 'left',
        onCell: (record: any) => {
          return { rowSpan: record?.rowSpan || 0 };
        },
      },
      {
        title: 'SKU',
        dataIndex: data.business_scope == 'CN' ? 'stock_no' : 'shop_sku_code',
        align: 'left',
      },
      {
        title: '商品名称',
        dataIndex: 'sku_name',
        align: 'left',
      },
      {
        title: '不含税单价',
        dataIndex: 'no_tax_price',
        align: 'right',
        width: 110,
        render: (_: any, record: any) => {
          return  IsGrey ? '' : priceValue(record.no_tax_price);
        },
      },
      {
        title: '税额',
        dataIndex: 'tax',
        align: 'right',
        width: 110,
        render: (_: any, record: any) => {
          return  IsGrey ? '' : priceValue(record.tax);
        },
      },
      {
        title: '含税单价',
        dataIndex: 'price',
        align: 'right',
        width: 110,
        render: (_: any, record: any) => {
          return  IsGrey ? '' : priceValue(record.price);
        },
      },
      {
        title: `${data.business_scope == 'CN' ? '入库数量' : '到港数量'}`,
        dataIndex: data.business_scope == 'CN' ? 'warehousing_num' : 'arrival_num',
        width: 110,
        align: 'right',
      },
      {
        title: '采购总额',
        dataIndex: 'total_amount',
        align: 'right',
        width: 110,
        render: (_: any, record: any) => {
          return  IsGrey ? '' : priceValue(record.total_amount);
        },
      },
      {
        title: '运费',
        dataIndex: 'freight_amount',
        align: 'right',
        width: 110,
        render: (_: any, record: any) => {
          return  IsGrey ? '' : priceValue(record.freight_amount);
        },
        hideInTable: data.columnsDetail.freight_amount == 0 ? true : false,
      },
      {
        title: '总计',
        dataIndex: 'total',
        align: 'right',
        width: 110,
        render: (_: any, record: any) => {
          return  IsGrey ? '' : priceValue(record.total);
        },
      },
      {
        title: '已预付金额',
        dataIndex: 'prepayment_amount',
        align: 'right',
        width: 110,
        render: (_: any, record: any) => {
          return  IsGrey ? '' : priceValue(record.prepayment_amount);
        },
        hideInTable: data.columnsDetail.prepayment_amount == 0 ? true : false,
      },
      {
        title: '还需支付金额',
        dataIndex: 'payable_amount',
        align: 'right',
        width: 110,
        render: (_: any, record: any) => {
          return  IsGrey ? '' : priceValue(record.payable_amount);
        },
      },
    ];
  };
  const columns1: any[] = [
    {
      title: '请款单号',
      dataIndex: 'funds_no',
      width: 120,
      align: 'left',
    },
    {
      title: '采购单号',
      dataIndex: 'order_no',
      width: 120,
      align: 'left',
    },
    {
      title: '请款时间',
      dataIndex: 'create_time',
      align: 'left',
      width: 120,
      render: (_: any, record: any) => {
        return dateFormat(record.create_time);
      },
    },
    {
      title: '请款人',
      dataIndex: 'create_user_nick_name',
      align: 'left',
      renderText: (text: any, record: any) => text ?? record.create_user_name,
    },
    {
      title: '付款时间',
      dataIndex: 'payment_time',
      align: 'left',
      width: 120,
      render: (_: any, record: any) => {
        return dateFormat(record.create_time);
      },
    },
    {
      title: '请款金额',
      dataIndex: 'amount',
      align: 'right',
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.amount);
      },
    },
  ];
  const columns2: any[] = [
    {
      title: '扣款类型',
      dataIndex: 'business_type_name',
      width: 120,
      align: 'left',
    },
    {
      title: '扣款单号',
      dataIndex: 'deduction_no',
      width: 120,
      align: 'left',
    },
    {
      title: '扣款原因',
      dataIndex: 'reason',
      align: 'left',
    },
    {
      title: '申请日期',
      dataIndex: 'create_time',
      align: 'left',
      width: 100,
      render: (_: any, record: any) => {
        return dateFormat(record.create_time);
      },
    },
    {
      title: '可用扣款金额',
      dataIndex: 'available_amount',
      align: 'right',
      width: 150,
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.available_amount);
      },
    },
    {
      title: '本次抵扣金额',
      dataIndex: 'amount',
      align: 'right',
      width: 150,
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.amount);
      },
    },
  ];
  const columns3: any[] = [
    {
      title: '费用类型',
      dataIndex: 'funds_type',
      align: 'left',
    },
    {
      title: '费用说明',
      dataIndex: 'remark',
      align: 'left',
    },
    {
      title: '费用金额',
      dataIndex: 'amount',
      align: 'right',
      width: 150,
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.amount);
      },
    },
  ];
  const columns4: any[] = [
    {
      title: '入库单号',
      dataIndex: 'order_no',
      align: 'left',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: 'SKU',
      dataIndex: 'stock_no',
      align: 'left',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '商品名称',
      dataIndex: 'goods_sku_name',
      align: 'left',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '采购单号',
      dataIndex: 'purchase_order_no',
      align: 'left',
    },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'right',
      width: 110,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.price);
      },
    },
    {
      title: '丢失数量',
      dataIndex: 'logistics_loss_qty',
      align: 'right',
      width: 110,
    },

    {
      title: '金额',
      dataIndex: 'amount',
      align: 'right',
      width: 110,
      hideInSearch: true,
      render: (_: any, record: any) => {
        return  IsGrey ? '' : priceValue(record.amount);
      },
    },
  ];
  // 重组数据
  const getFlatDataAction = (tableData: any) => {
    if (!tableData?.length) {
      return [];
    }
    const dataC = [];
    const obj = tableData.reduce((prev: any, cur: any) => {
      cur.amount = mul(cur.price, cur.logistics_loss_qty);
      if (prev[cur.order_no]) {
        prev[cur.order_no].push(cur);
      } else {
        prev[cur.order_no] = [cur];
      }
      return prev;
    }, {});
    for (const [key, value] of Object.entries(obj)) {
      const objC = {
        order_no: key,
        childList: value,
      };
      dataC.push(objC);
    }
    return flatData(dataC, 'childList');
  };
  return (
    <Spin spinning={loading}>
      <div className="order-print">
        <div className="order-print-body">
          {detailList.map((item: any,i: number) => {
            return (
              <div className={i == detailList.length - 1 ? '' : 'order-print-page'} key={item?.id}>
                <div className="order-print-title">
                  <span>{dateFormat(new Date())}</span>
                  {`${item?.main_name}-${item?.business_scope}-对账单`}
                  <i>打印次数：{item?.frequency + 1}</i>
                </div>
                <div className="reconciliation-detail-table tsa purchase-table">
                  <div className="r-w">
                    <DetailItem title="供应商名称">{item?.vendor_name}</DetailItem>
                    <DetailItem title="对账单号">{item?.order_no}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="收款账户名">{item?.bank_account_name}</DetailItem>
                    <DetailItem title="付款主体">{item?.main_name}</DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="收款账号">{item?.bank_account}</DetailItem>
                    <DetailItem title="账单期间">
                      {dateFormat(item?.begin_time)} 到 {dateFormat(item?.end_time)}
                    </DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="开户行">{item?.bank_name}</DetailItem>
                    <DetailItem title="结算方式">{item?.payment_method_name}</DetailItem>
                  </div>

                  {item?.currency == 'USD' ? (
                    <>
                      <div className="r-w">
                        <DetailItem title="Bank Routing">{item?.bank_routing}</DetailItem>
                        <DetailItem title="最迟付款日期">
                          {dateFormat(item?.latest_payment_date)}
                        </DetailItem>
                      </div>
                      <div className="r-w">
                        <DetailItem title="SWIFT">{item?.swift}</DetailItem>
                        <DetailItem title="结算币种">{item?.currency_name}</DetailItem>
                      </div>
                      <div className="r-w">
                        <DetailItem title="Bank Address">{item?.bank_address}</DetailItem>
                        <DetailItem title="采购员">
                          {item?.purchaser_nick_name || item?.purchaser_name}
                        </DetailItem>
                      </div>
                      <div className="r-w">
                        <DetailItem title="Company Address">{item?.company_address}</DetailItem>
                        <DetailItem />
                      </div>
                      <div className="r-w">
                        <DetailItem title="Phone Number">{item?.vendor_name}</DetailItem>
                        <DetailItem />
                      </div>
                      <div className="r-w">
                        <DetailItem title="账单应付金额">{ IsGrey ? '' : priceValue(item?.amount)}</DetailItem>
                        <DetailItem />
                      </div>
                      <div className="r-w">
                        <DetailItem title="账单应付金额">
                          { IsGrey ? '' : convertCurrency(item?.amount)}
                        </DetailItem>
                        <DetailItem />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="r-w">
                        <DetailItem title="账单应付金额">{ IsGrey ? '' : priceValue(item?.amount)}</DetailItem>
                        <DetailItem title="最迟付款日期">
                          {dateFormat(item?.latest_payment_date)}
                        </DetailItem>
                      </div>
                      <div className="r-w">
                        <DetailItem title="账单应付金额">
                          { IsGrey ? '' : convertCurrency(item?.amount)}
                        </DetailItem>
                        <DetailItem title="采购员">
                          {item?.purchaser_nick_name || item?.purchaser_name}
                        </DetailItem>
                      </div>
                    </>
                  )}
                  <div className="r-w">
                    <DetailItem title="账单备注">
                      {item?.remarks?.map((elem: any) => {
                        return (
                          <div className="detail-remarks" key={elem.id}>
                            <Space>
                              <span>{moment(elem.create_time).format('YYYY-MM-DD')}</span>
                              <span className="name">{elem.create_user_name}</span>
                              <span>{elem.remarks}</span>
                            </Space>
                          </div>
                        );
                      })}
                    </DetailItem>
                  </div>
                  <div className="r-w">
                    <DetailItem title="审批记录">
                      {item?.approvalHistoryList?.map((elem: any) => {
                        return (
                          <div key={elem.id}>
                            <Space>
                              <span>{moment(elem.approval_time).format('YYYY-MM-DD')}</span>
                              <span className="name">{elem.approval_user_name}</span>
                              <span>{elem.approval_status_name}</span>
                            </Space>
                          </div>
                        );
                      })}
                    </DetailItem>
                  </div>
                </div>
                <div className="recon-table">
                  <div className="recon-table-title">采购单明细</div>
                  <ProTable
                    columns={getColumns(item)}
                    pagination={false}
                    options={false}
                    className="center-th"
                    tableAlertRender={false}
                    tableAlertOptionRender={false}
                    dataSource={item.accountStatementOrderDetail}
                    search={false}
                    rowKey="id"
                    dateFormatter="string"
                    size="small"
                    bordered
                    toolBarRender={false}
                    summary={() => {
                      return item.accountStatementOrderDetail?.length ? (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={6} align="center">
                            合计
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <Text type="danger">
                              {item?.business_scope == 'CN'
                                ? item?.columnsDetail?.warehousing_num
                                : item?.columnsDetail?.arrival_num}
                            </Text>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} align="right">
                            <Text type="danger">
                              { IsGrey ? '' : priceValue(item?.columnsDetail?.total_amount)}
                            </Text>
                          </Table.Summary.Cell>
                          {item?.columnsDetail?.freight_amount == 0 ? (
                            ''
                          ) : (
                            <Table.Summary.Cell index={3} align="right">
                              <Text type="danger">
                                { IsGrey ? '' : priceValue(item?.columnsDetail?.freight_amount)}
                              </Text>
                            </Table.Summary.Cell>
                          )}
                          <Table.Summary.Cell index={4} align="right">
                            <Text type="danger">{ IsGrey ? '' : priceValue(item?.columnsDetail?.total)}</Text>
                          </Table.Summary.Cell>
                          {item?.columnsDetail?.prepayment_amount == 0 ? (
                            ''
                          ) : (
                            <Table.Summary.Cell index={5} align="right">
                              <Text type="danger">
                                { IsGrey ? '' : priceValue(item?.columnsDetail?.prepayment_amount)}
                              </Text>
                            </Table.Summary.Cell>
                          )}
                          <Table.Summary.Cell index={6} align="right">
                            <Text type="danger">
                              { IsGrey ? '' : priceValue(item?.columnsDetail?.payable_amount)}
                            </Text>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      ) : null;
                    }}
                  />
                </div>
                {item.logistics_loss_list?.length ? (
                  <div className="recon-table">
                    <div className="recon-table-title">物流丢失明细</div>
                    <ProTable
                      columns={columns4}
                      pagination={false}
                      options={false}
                      className="center-th"
                      tableAlertRender={false}
                      tableAlertOptionRender={false}
                      dataSource={getFlatDataAction(item.logistics_loss_list)}
                      search={false}
                      rowKey="id"
                      dateFormatter="string"
                      size="small"
                      bordered
                      toolBarRender={false}
                      summary={() => {
                        return item.logistics_loss_list?.length ? (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={6} align="center">
                              合计
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text type="danger">{ IsGrey ? '' : priceValue(item.lostColumns?.amount)}</Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        ) : null;
                      }}
                    />
                  </div>
                ) : (
                  ''
                )}
                {item.purchaseOrderRequestFundsList?.length ? (
                  <div className="recon-table">
                    <div className="recon-table-title">特批请款明细</div>
                    <ProTable
                      columns={columns1}
                      pagination={false}
                      options={false}
                      className="center-th"
                      tableAlertRender={false}
                      tableAlertOptionRender={false}
                      dataSource={item.purchaseOrderRequestFundsList}
                      search={false}
                      rowKey="id"
                      dateFormatter="string"
                      size="small"
                      bordered
                      toolBarRender={false}
                      summary={() => {
                        return item.purchaseOrderRequestFundsList?.length ? (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={5} align="center">
                              合计
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text type="danger">{ IsGrey ? '' : priceValue(item.askactionColumns?.amount)}</Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        ) : null;
                      }}
                    />
                  </div>
                ) : (
                  ''
                )}
                {item.sysBusinessDeductionList?.length ? (
                  <div className="recon-table">
                    <div className="recon-table-title">扣款单明细</div>
                    <ProTable
                      columns={columns2}
                      pagination={false}
                      options={false}
                      tableAlertRender={false}
                      tableAlertOptionRender={false}
                      dataSource={item.sysBusinessDeductionList}
                      search={false}
                      rowKey="id"
                      dateFormatter="string"
                      size="small"
                      bordered
                      className="center-th"
                      toolBarRender={false}
                      summary={() => {
                        return item.sysBusinessDeductionList?.length ? (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4} align="center">
                              合计
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text type="danger">
                                { IsGrey ? '' : priceValue(item.deductionColumns?.available_amount)}
                              </Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} align="right">
                              <Text type="danger">{ IsGrey ? '' : priceValue(item.deductionColumns?.amount)}</Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        ) : null;
                      }}
                    />
                  </div>
                ) : (
                  ''
                )}
                {item.sysBusinessOtherFundsList?.length ? (
                  <div className="recon-table">
                    <div className="recon-table-title">其他费用</div>
                    <ProTable
                      columns={columns3}
                      pagination={false}
                      options={false}
                      className="center-th"
                      tableAlertRender={false}
                      tableAlertOptionRender={false}
                      dataSource={item.sysBusinessOtherFundsList}
                      search={false}
                      rowKey="id"
                      dateFormatter="string"
                      size="small"
                      bordered
                      toolBarRender={false}
                      summary={() => {
                        return item.sysBusinessOtherFundsList?.length ? (
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={2} align="center">
                              合计
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text type="danger">{ IsGrey ? '' : priceValue(item.otherColumns?.amount)}</Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        ) : null;
                      }}
                    />
                  </div>
                ) : (
                  ''
                )}
              </div>
            );
          })}
        </div>
        <div className="order-print-btn">
          <Button
            key="back"
            type="primary"
            onClick={() => {
              print();
            }}
          >
            打印预览
          </Button>
          <p>打印时请在打印设置里取消页眉页脚</p>
        </div>
      </div>
    </Spin>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
