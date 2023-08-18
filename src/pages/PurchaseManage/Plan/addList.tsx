import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, history, useAccess, Access } from 'umi';
import {
  findMorePurchaseOrderData,
  saveOrderByPlan,
  saveOrderAuditByPlan,
} from '@/services/pages/purchasePlan';
import { pubConfig, pubAlert, pubMsg } from '@/utils/pubConfig';
import AddListItem from './Dialog/AddListItem';
import { mul } from '@/utils/pubConfirm';
import './style.less';

const Page: FC<Record<string, any>> = (props) => {
  const access = useAccess();
  // model下发数据
  const { common } = props;
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<any>([]);
  const [checkFormId, setCheckFormId] = useState<any>([]); // 所有子组件里，能编辑的供应商ID数组
  const [saveType, setSaveType] = useState(''); // 全部校验表单后，的提交类型，是保存还是提交审核
  const [checkAllForm, setCheckAllForm] = useState(0); // 组件里，是否开始触发全部表单校验
  const [isRolad, setIsRolad] = useState(0); // 组件里，是否开始刷数据
  const planIds = history.location?.query?.planIds || '';
  const vendorIds = history.location?.query?.vendorIds || '';
  // 计算
  const getNumAndPrice = async (data: any, isCheck?: boolean) => {
    // isCheck 要不要重新计算数量  默认是要计算，在保存某一个时，是不用重新计算数量的
    const newFormData = JSON.parse(JSON.stringify(data));
    console.log(112);
    // 分配数量要以采购计划ID 分配 ，因为不同的采购计划SKU可能会相同
    // 计算所有的采购计划出现个数
    const arr = newFormData.map((element: any) => {
      if (!element.isReadOnly) {
        return element.purchaseOrderSku.map((sku: any) => {
          return sku.plan_id;
        });
      }
    });
    function fn(arrs: any) {
      return [].concat(...arrs.map((item: any) => (Array.isArray(item) ? fn(item) : item)));
    }
    let allSku = fn(arr);
    // 去掉空
    allSku = allSku.filter((v) => v);

    console.log(allSku);
    const skuCount = {};
    allSku.forEach((vs: any) => {
      if (skuCount[vs] == undefined) {
        skuCount[vs] = { num: 1 };
      } else {
        skuCount[vs].num++;
      }
    });

    newFormData.forEach((element: any) => {
      //  从SKU里面取一个币别放到外层
      element.currency = element.purchaseOrderSku[0].currency;
      //
      element.planList = element.purchaseOrderSku.map((v: any) => v.plan_id);
      for (const k in skuCount) {
        if (element.planList.indexOf(k) > -1) {
          // 找到每个SKU的最后一个供应商
          skuCount[k].lastVendor = element.vendor_id;
          // 每个SKU的未下单数量
          skuCount[k].undelivered_qty =
            element.purchaseOrderSku[element.planList.indexOf(k)].undelivered_qty;
        }
      }
    });
    // 计算下单数量 和箱数和总价 必须在计划完skuCount后面算
    newFormData.forEach((element: any) => {
      if (!element.isReadOnly && !isCheck) {
        element.purchaseOrderSku.forEach((sku: any) => {
          const eachNum =
            element.vendor_id == skuCount[sku.plan_id].lastVendor
              ? Math.floor(skuCount[sku.plan_id].undelivered_qty / skuCount[sku.plan_id].num) +
                (skuCount[sku.plan_id].undelivered_qty % skuCount[sku.plan_id].num)
              : Math.floor(skuCount[sku.plan_id].undelivered_qty / skuCount[sku.plan_id].num);
          sku.num = eachNum;
          sku.number_boxes = sku.quantity_per_box
            ? Math.ceil(eachNum / sku.quantity_per_box)
            : sku.quantity_per_box;
          sku.copy_price = sku.price;
          sku.total_price = mul(sku.num, sku.price);
        });
      }
    });

    console.log(skuCount);
    console.log(newFormData);
    console.log(443);

    // 得到能编辑的供应商ID数组，组件里要判断取消按钮用
    let vIds = newFormData.map((v: any) => {
      if (!v.isReadOnly) {
        return v.vendor_id;
      }
    });
    vIds = vIds.filter((v: any) => v);

    setTimeout(() => {
      setAllData(newFormData);
      setIsRolad(Date.now());
      setCheckFormId(vIds);
    }, 1);
  };

  // 生成采购单准备数据(单个供应商) 用计划ID 供应商ID查
  const getDetail = async (): Promise<any> => {
    setLoading(true);
    const res = await findMorePurchaseOrderData({ planIds, vendorIds });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      res.data.forEach((v: any) => {
        v.purchaseOrderSku.map((k: any) => {
          k.tId = `${v.vendor_id}-${k.plan_id}-1`;
          k.goods_sku_type = k.goods_sku_type || 1;
          k.shipment_time = k.vendor_shipment_time;
          k.rowSpan = 1;
          k.hasSpare = false;
          k.over_code = k.plan_business_scope === 'CN' ? k.sku_code : k.shop_sku_code;
        });
      });
      getNumAndPrice(res.data);
    }
    setLoading(false);
  };
  // 接口提交
  const submitOver = async (values: Record<string, any>) => {
    // 判断SKU的发货数量是不是为0  ERP同步过来的数据有可能为0，限制不能生成采购单
    let num = 0;
    values.forEach((k: any) => {
      k.purchaseOrderSku.forEach((v: any) => {
        console.log(v.quantity_per_box);
        if (!v.quantity_per_box) {
          num++;
        }
      });
    });
    console.log(num);
    if (num) return pubAlert('发货数量不能为0，请查检修改SKU箱规！');

    let res;
    setLoading(true);
    if (saveType == 'save') {
      res = await saveOrderByPlan(values);
    }
    if (saveType == 'saveAndAudit') {
      res = await saveOrderAuditByPlan(values);
    }
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功', 'success');
      history.goBack();
    }
    setLoading(false);
  };
  useEffect(() => {
    console.log(11);
    getDetail();
  }, []);

  // 单个数据的变化
  const itemChange = (data: any, itemIndex: any) => {
    console.log(123);
    const newData = JSON.parse(JSON.stringify(allData));
    newData[itemIndex] = data;
    console.log(newData);
    setAllData(newData);
  };

  // 单个的变化
  const listBack = (data: any) => {
    const { delVendor, delSku, addSpare, isReadOnly, itemIndex, delRow, delIndex } = data;
    // 如果是删除供应商
    if (delVendor) {
      const newData = JSON.parse(JSON.stringify(allData));
      newData.splice(itemIndex, 1);
      getNumAndPrice(newData);
    }
    // 如果是删除SKU
    if (delSku) {
      const newData = JSON.parse(JSON.stringify(allData));
      if (delRow.goods_sku_type == 1) {
        newData[itemIndex].purchaseOrderSku = newData[itemIndex].purchaseOrderSku.filter(
          (v: any) => v.plan_id != delRow.plan_id,
        );
        console.log(newData);
        getNumAndPrice(newData);
      } else {
        newData[itemIndex].purchaseOrderSku.splice(delIndex, 1);
        newData[itemIndex].purchaseOrderSku[delIndex - 1].hasSpare = false;
        newData[itemIndex].purchaseOrderSku[delIndex - 1].rowSpan = 1;
        // 删除备品不重新计算数量
        setAllData(newData);
        setIsRolad(Date.now());
      }
    }
    // 如果是添加备品
    if (addSpare) {
      const newData = JSON.parse(JSON.stringify(allData));
      newData[itemIndex] = data.newItem;
      console.log(newData);
      // 添加备品不重新计算数量
      setAllData(newData);
      setIsRolad(Date.now());
    }
    // 如果是某一个保存成功，记住这个的ID 注意这里不能改allData的数据
    if (isReadOnly) {
      const newData = JSON.parse(JSON.stringify(allData));
      newData[itemIndex].isReadOnly = isReadOnly;
      newData[itemIndex].orderNo = data.orderNo;

      const saveSku = {};
      data.newSkuData.forEach((vs: any) => {
        saveSku[vs.goods_sku_id] = vs.num;
      });
      newData.forEach((element: any) => {
        element.purchaseOrderSku.forEach((sku: any) => {
          if (saveSku[sku.goods_sku_id]) {
            sku.undelivered_qty = sku.undelivered_qty - saveSku[sku.goods_sku_id];
          }
        });
      });
      getNumAndPrice(newData, true);
    }
  };

  // 检查每个Form后
  const allSaveData: any[] = [];
  const newArrName: any[] = [];
  const checkFormBack = (data: any) => {
    if (!data.isOk) {
      newArrName.push(data.vendor_name);
    } else {
      allSaveData.push(data.data);
    }

    console.log(allSaveData);
    console.log(newArrName);
    console.log(checkFormId);
    if (newArrName.length + allSaveData.length == checkFormId.length) {
      console.log(newArrName);
      if (newArrName.length) {
        pubMsg(`供应商 “${newArrName.join(',')}” 信息未填完整！`);
      } else {
        console.log(allSaveData);
        submitOver(allSaveData);
      }
    }
  };
  // 所有的提交
  const allSave = (type: string) => {
    setSaveType(type);
    setCheckAllForm(Date.now());
  };

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      footer={[
        <Button key="3" icon={<ArrowLeftOutlined />} onClick={history.goBack}>
          返回
        </Button>,
        <Access
          key="2"
          accessible={
            access.canSee('purchase_plan_create_batch') ||
            access.canSee('purchase_plan_create_in_batch')
          }
        >
          <Button type="primary" ghost onClick={() => allSave('save')}>
            全部保存采购单
          </Button>
        </Access>,
        <Access
          key="1"
          accessible={
            access.canSee('purchase_plan_create_batch') ||
            access.canSee('purchase_plan_create_in_batch')
          }
        >
          <Button type="primary" onClick={() => allSave('saveAndAudit')}>
            全部保存并提交审核
          </Button>
        </Access>,
      ]}
    >
      <Spin spinning={loading}>
        {allData.map((item: any, index: number) => {
          return (
            <AddListItem
              allData={allData}
              itemData={item}
              itemIndex={index}
              key={item.vendor_id}
              itemChange={itemChange}
              itemBack={listBack}
              checkFormId={checkFormId}
              dicList={common?.dicList}
              checkFormBack={checkFormBack}
              isRolad={isRolad} // 控制组件里要不要重新渲染
              checkAllForm={checkAllForm} // 组件里，是否开始触发全部表单校验
            />
          );
        })}
      </Spin>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
