import { QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Spin, Statistic, Tooltip } from 'antd';
import './index.less';

export default (props: any) => {
  const { data, loading } = props;
  return (
    <Spin spinning={loading}>
      <Card className="custom-top-table" bordered={false}>
        <div style={{ float: 'left', fontSize: '14px' }}>商品库存及价值统计报表（国内）</div>
        <div style={{ float: 'right', marginBottom: '10px' }}>币种：人民币</div>
        <table width={'100%'}>
          <tbody>
            <tr>
              <td align="right">
                <>
                  总金额：
                  <Tooltip placement="top" title="总金额=在库总金额+未交货总金额+在途总金额">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.totalAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
              <td align="right">
                <>
                  待支付总金额：
                  <Tooltip
                    placement="top"
                    title="待支付总金额=未交货待支付总金额+在途待支付总金额+已收货待支付总金额"
                  >
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.totalUnpaidAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
              <td align="right">
                <></>
              </td>
              <td>
                <></>
              </td>
            </tr>
            <tr>
              <td align="right">
                <>
                  在库总金额：
                  <Tooltip placement="top" title="在库总金额=库存价值之和">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.inStockTotalAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
              <td align="right">
                <>
                  已收货待支付总金额：
                  <Tooltip
                    placement="top"
                    title="已收货待支付总金额 = 已入库未支付总金额=【采购单已入库货值-采购单已入库已支付金额】所有采购单汇总"
                  >
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.inStockUnpaidAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
              <td align="right">
                <></>
              </td>
              <td>
                <></>
              </td>
            </tr>
            <tr>
              <td align="right">
                <>
                  在途总金额：
                  <Tooltip placement="top" title="在途总金额=在途价值汇总">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.cnTransitTotalAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
              <td align="right">
                <>
                  在途待支付总金额：
                  <Tooltip
                    placement="top"
                    title="在途待支付总金额=在途货值-采购单预付或者提前特批的未被对账单抵消的金额，当提前预付或者提前特批金额大于在途货值，则在途待支付金额为0，不能为负数。汇总所有采购单在途待支付金额得出在途待支付总金额汇总。"
                  >
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.cnTransitUnpaidAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
              <td align="right">
                <>
                  在途已支付总金额：
                  <Tooltip
                    placement="top"
                    title="在途已支付总金额=采购单预付或者提前特批的未被对账单抵消的金额，如果预付或特批提前支付的金额大于在途货值，则取在途货值的金额。多出的金额统计到未交货已支付金额。汇总所有采购单在途已支付金额得出在途已支付总金额。"
                  >
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.cnTransitPaidAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
            </tr>
            <tr>
              <td align="right">
                <>
                  未交货总金额：
                  <Tooltip placement="top" title="未交货总金额 = 未交货价值汇总">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.undeliveredTotalAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
              <td align="right">
                <>
                  未交货待支付总金额：
                  <Tooltip placement="top" title="未交货待支付总金额=未交货货值-未交货已支付总金额">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.undeliveredUnpaidAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
              <td align="right">
                <>
                  未交货已支付总金额：
                  <Tooltip
                    placement="top"
                    title="采购单预付或者提前特批的未被对账单抵消的金额减去在途货值，剩余的金额为该采购单的未交货已支付金额，汇总所有采购单未交货已支付金额得出未交货已支付总金额"
                  >
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </>
              </td>
              <td>
                <Statistic
                  value={data.undeliveredPaidAmount}
                  valueStyle={{ fontWeight: 400, fontSize: '12px' }}
                  precision={2}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </Spin>
  );
};
