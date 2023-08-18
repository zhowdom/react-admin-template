import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { findActualDeductionQty } from '@/services/pages/stockManager';
import './style.less';
import { arraySum1 } from '@/utils/pubConfirm';

const Dialog: React.FC<{
  id: string;
  business_scope: string;
  is_all_or_logistics_loss?: number; // 物流丢失页面
}> = (props: any) => {
  // 获取Table数据
  const getTableDetail = async (): Promise<any> => {
    const res = await findActualDeductionQty(
      props?.is_all_or_logistics_loss
        ? {
            id: props?.id,
            is_all_or_logistics_loss: props.is_all_or_logistics_loss,
          }
        : {
            id: props?.id,
          },
    );
    if (res.code != pubConfig.sCode) {
      pubMsg('获取关联采购单信息失败');
      return {
        success: true,
        data: [],
      };
    }
    const data: any = [];
    /*合并行需要过滤没有供应商的数据v1.2.3*/
    res.data.filter((item: any) => !!item.vendor_id).forEach((item: any) => {
      let fNum = 0;
      // 扣减数据为0的过滤掉不显示
      item.skuPurchaseOrderList = item.skuPurchaseOrderList.map((v: any)=>({
        ...v,
        orderDetails: v.orderDetails.filter((k: any)=> k.actual_num !=0)
      }))
      const aa = item.skuPurchaseOrderList.map((ss: any) =>
        ss.orderDetails && ss.orderDetails.length ? ss.orderDetails.length : 0,
      );
      // console.log(arraySum1(aa));
      fNum = arraySum1(aa);

      if (item.skuPurchaseOrderList && item.skuPurchaseOrderList.length) {
        item.skuPurchaseOrderList.forEach((k: any, kindex: number) => {
          const secondDate = {
            stock_no: k.stock_no,
            shop_sku_code: k.shop_sku_code,
            sku_name: k.sku_name,
            sNum: 1,
            fNum: 0,
          };
          if (k.orderDetails && k.orderDetails.length) {
            k.orderDetails.forEach((order: any, hindex: number) => {
              const thirdDate = {
                p_order_no: order.p_order_no,
                type: order.type,
                actual_num: order.actual_num,
                goods_sku_type: order.goods_sku_type,
                logistics_loss_qty: order.logistics_loss_qty,
              };
              if (!hindex) {
                secondDate.sNum = k.orderDetails.length || 1;
              } else {
                secondDate.sNum = 0;
              }
              if (!kindex && !hindex) {
                data.push({ ...item, ...secondDate, fNum, ...thirdDate });
              } else {
                data.push({ ...item, ...secondDate, ...thirdDate });
              }
            });
          } else {
            data.push({ ...item, ...secondDate });
          }
        });
      } else {
        data.push({ ...item, fNum: 1, sNum: 1 });
      }
    });
    console.log(data)
    return {
      data: data || [],
      success: true,
      total: 0,
    };
  };
  const columns1: any = [
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      width: 120,
      onCell: (record: any) => {
        return { rowSpan: record.fNum || 0 };
      },
    },
    {
      title: '供应商代码',
      dataIndex: 'vendor_code',
      align: 'center',
      width: 90,
      onCell: (record: any) => {
        return { rowSpan: record.fNum || 0 };
      },
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      width: 120,
      onCell: (record: any) => {
        return { rowSpan: record.sNum || 0 };
      },
    },
    {
      title: 'SKU',
      dataIndex: props?.business_scope === 'CN' ? 'stock_no' : 'shop_sku_code',
      align: 'center',
      width: 100,
      onCell: (record: any) => {
        return { rowSpan: record.sNum || 0 };
      },
    },
    {
      title: '单据类型',
      dataIndex: 'type',
      align: 'center',
      width: 100,
      valueEnum: {
        1: { text: '采购单' },
        2: { text: '维修单' },
      },
    },
    {
      title: '单号',
      dataIndex: 'p_order_no',
      align: 'center',
      width: 110,
    },
    {
      title: '商品类型',
      dataIndex: 'goods_sku_type',
      align: 'center',
      width: 100,
      render: (_: any, record: any) => {
        return record.goods_sku_type == '1' ? '采购商品' : '备品(赠品)';
      },
    },
    {
      title: '扣减数量',
      dataIndex: 'actual_num',
      align: 'center',
      width: 100,
    },
    {
      title: '物流丢失数量',
      dataIndex: 'logistics_loss_qty',
      align: 'center',
      width: 100,
      hideInTable: !props.is_all_or_logistics_loss,
    },
  ];
  return (
    <ProTable
      rowKey={(record) => record.stock_no + record.p_order_no + record.goods_sku_type}
      search={false}
      options={false}
      bordered={true}
      pagination={false}
      columns={columns1}
      request={getTableDetail}
      className="p-table-0"
      size="small"
      scroll={{ x: 1200 }}
    />
  );
};

export default Dialog;
