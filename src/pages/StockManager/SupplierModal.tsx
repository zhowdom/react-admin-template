/*供应商选择弹框*/
import React, { useRef, useState } from 'react';
import type { ProFormInstance, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  EditableProTable,
} from '@ant-design/pro-components';
import * as api from '@/services/pages/stockManager';
import { Form, Tag } from 'antd';
import { arraySum } from '@/utils/pubConfirm';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const SupplierModal: React.FC<{
  dataSource: any;
  actionRef: any;
  type?: 'cn' | 'in' /*国内:cn 跨境:in*/;
  dicList: any;
}> = ({ dataSource, actionRef,type, dicList }) => {
  const formRef = useRef<ProFormInstance>(); // 弹框
  const [sForm] = Form.useForm();
  const [editableKeys, setEditableKeys] = useState<string[]>([]);
  const [vendorId, setVendorId] = useState<any>('');
  const [dataSourceNew, dataSourceNewSet] = useState([]);
  const columnsSupplier: ProColumns<Record<string, any>>[] = [
    {
      title: '选择',
      dataIndex: 'choseVendor',
      align: 'center',
      width: 50,
      valueType: 'radio',
      valueEnum: { 1: { text: ' ' } },
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      width: 120,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '供应商代码',
      dataIndex: 'vendor_code',
      align: 'center',
      width: 90,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
      width: 120,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan2 }),
    },
    {
      title: 'SKU',
      dataIndex: type == 'cn' ? 'stock_no' : 'shop_sku_code',
      align: 'center',
      width: 100,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan2 }),
    },
    {
      title: '总未交货数量',
      dataIndex: 'total_undelivered_num',
      width: 110,
      editable: false,
      align: 'center',
      onCell: (record: any) => ({ rowSpan: record.rowSpan2 }),
    },
    {
      title: '单号',
      dataIndex: 'p_order_no',
      align: 'center',
      width: 110,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan3 }),
    },
    {
      title: '单据类型',
      dataIndex: 'type',
      align: 'center',
      width: 100,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan3 }),
      render: (_: any, record: any) => {
        return record.type == '1' ? '采购单' : '配件单';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'p_create_time',
      align: 'center',
      width: 96,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan3 }),
    },
    {
      title: '指定优先商品',
      dataIndex: 'choseOrderSkuType',
      width: 120,
      valueType: 'checkbox',
      valueEnum: (record: any) => {
        return { 1: { text: record.goods_sku_type == '1' ? '采购商品' : '备品(赠品)' } };
      },
      fieldProps: (_: any, record: any) => ({
        disabled: !(record.entity.vendor_id == vendorId),
      }),
      onCell: (record: any) => ({ rowSpan: record.rowSpan4 }),
    },
    {
      title: '未交货数量',
      dataIndex: 'undelivered_num',
      width: 100,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan4 }),
    },
    {
      title: '采购主体',
      dataIndex: 'p_order_main_name',
      width: 160,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan4 }),
      render: (_: any, record: any) => (
        <div>
          {record.p_order_main_name}
          {record.tax_refund == 1 && type != 'cn' ? (
            <Tag color="green" style={{ marginLeft: '2px' }}>
              可退税
            </Tag>
          ) : (
            ''
          )}
        </div>
      ),
    },
    {
      title: '采购单结算币种',
      dataIndex: 'currency',
      align: 'center',
      width: 120,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan4 }),
      valueEnum: dicList?.SC_CURRENCY || {},
    },
  ];
  // 清空选择项
  const resetSelected = () => {
    setVendorId('');
    sForm.resetFields(dataSourceNew.map((item: any) => item.purchase_order_sku_id));
  };
  // 筛选组合数据
  const getDataSou = (data: any) => {
    const newData: any = [];
    data.forEach((v: any, vindex: number) => {
      if (v.skuPurchaseOrderList) {
        // 供应商要合并的集合，取每个 sku的合 和每个sku下面 采购单的合 和每个采购单下面 商品/备品的合
        const skuNum = v.skuPurchaseOrderList.map((sku: any) =>
          sku.orderDetails.map((order: any) => order.orderSkuTypeList.length),
        );
        const skuNum1 = skuNum.flat(2); // 多维转一维
        // console.log(skuNum1);
        v.skuPurchaseOrderList.forEach((k: any, kindex: number) => {
          if (k.orderDetails) {
            // SKU要合并的集合，取每个 sku 下面 采购单的合 和每个采购单下面 商品/备品的合
            const orderNum = k.orderDetails.map(
              (order: any) => order.orderSkuTypeList.length,
            );
            // console.log(orderNum, '*');
            // SKU显示的总未交货数量 前端算，取最后一层的值相加
            const undelivered_num_list = k.orderDetails.map((numK: any) =>
              numK.orderSkuTypeList.map((numH: any) => numH.undelivered_num),
            );
            const undelivered_num_list1 = undelivered_num_list.flat(2); // 多维转一维
            // console.log(undelivered_num_list1, '*');
            k.orderDetails.forEach((h: any, hindex: number) => {
              if (h.orderSkuTypeList) {
                const typeNum = h.orderSkuTypeList.length;
                // console.log(typeNum);
                h.orderSkuTypeList.forEach((t: any, tindex: number) => {
                  newData.push({
                    ...v,
                    ...k,
                    ...h,
                    ...t,
                    total_undelivered_num: arraySum(undelivered_num_list1),
                    choseOrderSkuType: [],
                    rowSpan1: !kindex && !hindex && !tindex ? arraySum(skuNum1) : 0,
                    rowSpan2: !hindex && !tindex ? arraySum(orderNum) : 0,
                    rowSpan3: !tindex ? typeNum : 0,
                    rowSpan4: 1,
                  });
                });
              } else {
              }
            });
          } else {
            newData.push({
              ...v,
              ...k,
              rowSpan1: !vindex ? arraySum(skuNum) : 0,
              rowSpan2: 1,
              rowSpan3: 1,
              rowSpan4: 1,
            });
          }
        });
      } else {
        newData.push({ ...v, rowSpan1: 1, rowSpan2: 1, rowSpan3: 1, rowSpan4: 1 });
      }
    });
    return newData
  };

  // 获取全部数据 第一次进入时用
  const getAllList = async () => {
    const res = await api.findSelectPurchaseOrder({
      order_id: dataSource.id,
      goods_sku_id: dataSource.goods_sku_id,
    });
    if (res.code == pubConfig.sCode) {
      const newData: any = getDataSou(res.data);
      dataSourceNewSet(newData);
      const dd = newData.map((s: any) => s.purchase_order_sku_id);
      setEditableKeys(dd);
    } else {
      pubMsg(res.message);
    }
  };
  return (
    <ModalForm
      title="选择供应商"
      formRef={formRef}
      width={'1200'}
      layout={'horizontal'}
      trigger={<a>{dataSource?.vendor_name ? '更换供应商' : '选择供应商'}</a>}
      onFinish={async (values: any) => {
        console.log(values)
        console.log(dataSourceNew)
        const submitData: any = {};
        const vendorData: any = dataSourceNew.find((v: any) => vendorId == v.vendor_id);
        console.log(vendorData)
        if (!vendorData || !vendorData.vendor_id) {
          pubMsg('请选择供应商', 'info');
          return;
        } else {
          submitData.order_id = dataSource?.id;
          submitData.vendor_id = vendorData.vendor_id;
          submitData.vendor_code = vendorData.vendor_code;
          submitData.vendor_name = vendorData.vendor_name;
          submitData.purchaseOrderSkuList = [];
        }
        // 取选中的SKU，SKU可能有多个 当没有选中后面的时候，SKU给空
        const choseData = dataSourceNew.filter(
          (v: any) => v.choseOrderSkuType && v.choseOrderSkuType.length,
        ); // 选中的商品/备品的集合
        if (!choseData.length) {
          submitData.purchaseOrderSkuList = [];
        } else {
          // 选中的 SKUid 集合
          const skuIds = [...new Set(choseData.map((v: any) => v.goods_sku_id))];
          skuIds.forEach((item: any) => {
            // 选中的 商品/备品 数据集合
            const typeData = choseData
              .filter((v: any) => v.goods_sku_id == item)
              .map((k: any) => ({
                purchase_order_sku_id: k.purchase_order_sku_ids || k.purchase_order_sku_id,
                goods_sku_type: k.goods_sku_type,
                purchase_no: k.p_order_no,
              }));
            submitData.purchaseOrderSkuList.push({
              goods_sku_id: item,
              purchaseOrderSkuTypeList: typeData,
            });
          });
          // console.log(skuIds);
        }
        console.log(submitData, 'submitData');
        const res = await api.updateOrderVendor(submitData);
        if (res.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          actionRef.current?.reload();
          return true;
        } else {
          pubMsg(`提交失败: ${res.message}`);
          return false;
        }
      }}
      onOpenChange={(visible: boolean) => {
        if (visible) {
          getAllList();
        } else {
          resetSelected();// 清空选择项
          dataSourceNewSet([]);
          setEditableKeys([]);
        }
      }}
      modalProps={{
        destroyOnClose: true,
      }}
    >
      <EditableProTable
        size={'small'}
        rowKey="purchase_order_sku_id"
        dateFormatter="string"
        bordered
        value={dataSourceNew}
        columns={columnsSupplier}
        recordCreatorProps={false}
        editable={{
          type: 'multiple',
          editableKeys,
          form: sForm,
          onValuesChange: (record: any, recordList: any) => {
            dataSourceNewSet(recordList);
            // 当选中供应商是时，其他的供应商下的已选中给取消掉
            if (record.choseVendor) {
              setVendorId(record.vendor_id);
              const otherKey = recordList
                .filter((eKey: any) => eKey.vendor_id != record.vendor_id)
                .map((sKey: any) => sKey.purchase_order_sku_id);
              otherKey.forEach((item: any) => {
                sForm.setFieldsValue({
                  [item]: {
                    choseVendor: '',
                    choseOrderSkuType: [],
                  },
                });
              });
            }
          },
        }}
        tableAlertRender={false}
        search={false}
        toolBarRender={false}
        pagination={false}
        scroll={{ x: 1300, y: 600 }}
      />
      <div>说明:</div>
      <ul style={{ paddingInlineStart: '20px' }}>
        <li>1，系统默认逻辑：先扣采购单正常采购商品、再扣该采购单备品，然后扣维修单；</li>
        <li>
        2，指定扣减逻辑：先扣指定采购单正常采购商品，再扣该指定采购单备品，然后扣指定维修单，指定单据不够库存，则继续先扣未指定采购单采购商品和备品，再扣未指定维修单；
        </li>
        <li>3，同一类型单据，按创建时间，先建先出；</li>
        <li>4，只能选择一个供应商出货；</li>
      </ul>
    </ModalForm>
  );
};
export default SupplierModal;
