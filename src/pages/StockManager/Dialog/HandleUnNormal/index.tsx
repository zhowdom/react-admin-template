import React, { useRef, useState } from 'react';
import { ModalForm } from '@ant-design/pro-form';
import * as api from '@/services/pages/stockManager';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import PubDivider from '@/components/PubForm/PubDivider';
import { Col, Form, Row, Tag } from 'antd';
import StockOrderItem from '@/components/Reconciliation/StockOrderItem';
import { EditableProTable } from '@ant-design/pro-components';
import type { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { arraySum } from '@/utils/pubConfirm';
import { useAccess } from '@@/plugin-access/access';
import BeforeHandleMore from './BeforeHandleMore';
import HandleUnNormalLessCN from './HandleUnNormalLessCN';
import HandleUnNormalLessIN from './HandleUnNormalLessIN';
import { history } from 'umi';

// 异常入库处理处理
const HandleUnNormal: React.FC<{
  dataSource: Record<string, any>;
  reload: any;
  title?: string;
  trigger?: JSX.Element;
  dicList?: any;
  tableKey?: any; // 刷新父表格需要
  tableKeySet?: any; // 刷新父表格需要
  type: 'cn' | 'in'; // 国内:cn 跨境:in
  refreshKeySet?: any; // 父组件刷新需要
  common?: any;
  recordS?: any;
}> = ({
  dataSource,
  reload,
  title,
  trigger,
  dicList,
  type,
  tableKey,
  tableKeySet,
  refreshKeySet,
  common,
  recordS,
}) => {
  const access = useAccess();
  const [detail, detailSet] = useState<any>({});
  const formRef = useRef<ProFormInstance>(); // 多收弹框form
  const [sForm] = Form.useForm();
  const [editableKeys, setEditableKeys] = useState<string[]>([]);
  const [vendorId, setVendorId] = useState<any>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const _ref: any = useRef();
  // 来自入库单页面保留处理功能，其他页面仅查看
  const isFromStock = history.location.pathname.indexOf('stock-manage') > -1;
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
        return record.type == '1' ? '采购单' : '';
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
  if (dataSource?.difference_num > 0) {
    if (!isFromStock) {
      return dataSource.difference_num + '(少收)';
    }
    if (
      (type == 'in' && !access.canSee('stockManager_exception_handle_in')) ||
      (type == 'cn' && !access.canSee('stockManager_exception_handle_cn'))
    ) {
      return (
        <a onClick={() => pubMsg('您暂无处理异常的权限~')}>
          {dataSource.difference_num + '(少收)'}
        </a>
      );
    }
    return type == 'cn' ? (
      <HandleUnNormalLessCN
        dataSource={dataSource}
        reload={reload}
        refreshKeySet={refreshKeySet}
        recordS={recordS}
      />
    ) : (
      <HandleUnNormalLessIN
        dataSource={dataSource}
        reload={reload}
        refreshKeySet={refreshKeySet}
        recordS={recordS}
      />
    );
  } else if (dataSource?.difference_num < 0) {
    if (!isFromStock) {
      return dataSource.difference_num + '(多收)';
    }
    if (!access.canSee('stockManager_exception_handle_cn')) {
      return (
        <a onClick={() => pubMsg('您暂无处理异常的权限~')}>
          {dataSource.difference_num + '(多收)'}
        </a>
      );
    }
    return (
      <>
        <a
          key="changePriceModal"
          onClick={() => {
            if (type == 'in') {
              setIsModalVisible(true);
            } else {
              _ref.current.visibileChange(true);
            }
          }}
        >
          {trigger || (
            <span title={'点击可以处理异常'}>{dataSource.difference_num + '(多收)'}</span>
          )}
        </a>
        <BeforeHandleMore
          dataSource={dataSource}
          _ref={_ref}
          reload={reload}
          refreshKeySet={refreshKeySet}
          setIsModalCreateVisible={setIsModalVisible}
        />
        <ModalForm
          open={isModalVisible}
          width={1200}
          formRef={formRef}
          layout={'horizontal'}
          title={title || `异常处理(多收:${dataSource.difference_num})`}
          modalProps={{
            destroyOnClose: true,
            onCancel: () => {
              setIsModalVisible(false);
            },
          }}
          onFinish={async (values: any) => {
            const submitData: any = {};
            const newData = values.dataSource;
            const vendorData = newData.find((v: any) => vendorId == v.vendor_id);
            // console.log(vendorData);
            // console.log(newData);
            if (!vendorData || !vendorData.vendor_id) {
              pubMsg('请选择关联采购单', 'info');
              return;
            }

            submitData.order_id = dataSource?.id;
            submitData.vendor_id = vendorData.vendor_id;
            submitData.vendor_code = vendorData.vendor_code;
            submitData.vendor_name = vendorData.vendor_name;
            submitData.purchaseOrderSkuList = [];

            // 取选中的SKU，SKU可能有多个 当没有选中后面的时候，SKU给空
            const choseData = newData.filter((v: any) => v.choseOrderSkuType.length); // 选中的商品/备品的集合
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
                  }));
                submitData.purchaseOrderSkuList.push({
                  goods_sku_id: item,
                  purchaseOrderSkuTypeList: typeData,
                });
              });
              // console.log(skuIds);
            }
            const res = await api.createOutsideThePlan({
              selectPurchaseOrder: submitData,
              id: dataSource?.order_id,
              num: dataSource?.difference_num,
              specificationList: detail?.orderSkuList[0]?.specificationList,
            });
            if (res.code == pubConfig.sCode) {
              pubMsg(res?.message, 'success');
              if (refreshKeySet) refreshKeySet(Date.now);
              if (reload) reload();
              setIsModalVisible(false);
              _ref.current.visibileChange(false);
              return true;
            } else {
              pubMsg(`提交失败: ${res.message}`);
              return false;
            }
          }}
          params={{ order_id: dataSource.order_id, tableKey: tableKey || '' }}
          request={async () => {
            /*获取异常入库单详情*/
            const resDetail = await api.getOutsideOrderInfo({
              order_no: dataSource.order_no,
              goods_sku_id: dataSource.goods_sku_id,
            });
            if (resDetail.code == pubConfig.sCode) {
              detailSet(resDetail.data);
              /*获取关联的供应商采购单*/
              const res = await api.findSelectPurchaseOrder({
                order_id: resDetail?.data?.id,
                goods_sku_id: resDetail?.data?.goods_sku_id,
                vendor_id: resDetail?.data?.vendor_id,
              });
              if (res.code == pubConfig.sCode) {
                const newData: any = [];
                res.data.forEach((v: any, vindex: number) => {
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
                console.log(newData);
                const dd = newData.map((s: any) => s.purchase_order_sku_id);
                setEditableKeys(dd);
                setVendorId(resDetail?.data?.vendor_id);
                return { dataSource: newData };
              } else {
                pubMsg(res.message);
                return { dataSource: [] };
              }
            } else {
              pubMsg(resDetail.message);
              detailSet({});
              return { dataSource: [] };
            }
          }}
        >
          <PubDivider title="入库单信息" />
          <Row gutter={15}>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="入库单号">
                {detail?.order_no}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="供应商">
                {detail?.vendor_name}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="状态">
                {pubFilter(dicList?.WAREHOUSING_ORDER_STATUS, detail?.approval_status)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="创建人">
                {detail?.create_user_name}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="创建时间">
                {detail?.create_time}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="要求平台入库时间">
                {detail?.required_warehousing_time}
              </Form.Item>
            </Col>
          </Row>
          <PubDivider title="货件信息" />
          <Row gutter={15}>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="发货计划编号">
                {detail?.delivery_plan_nos || detail?.delivery_plan_no}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="平台">
                {detail?.platform_name}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="店铺">
                {detail?.shop_name}
              </Form.Item>
            </Col>
          </Row>
          <PubDivider title="装箱设置" />
          <StockOrderItem
            dataList={detail?.orderSkuList}
            business="CN"
            readonly={true}
            warehousing_type={detail?.warehousing_type}
            isHandelException={true}
          />
          <PubDivider title="物流信息" />
          <Row gutter={15}>
            <Col span={24}>
              <Form.Item className={'mb-0'} label="收货区域">
                {detail?.warehouse_area}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="收货仓库">
                {detail?.warehouse_name}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="仓库联系人">
                {detail?.warehouse_contacts}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="联系人电话">
                {detail?.warehouse_contacts_phone}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item className={'mb-0'} label="仓库详细地址">
                {detail?.warehouse_address}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="平台预约单号">
                {detail?.platform_appointment_order_no}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="平台入库单号">
                {detail?.platform_warehousing_order_no}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item className={'mb-0'} label="预计平台入库时间">
                {detail?.platform_appointment_time}
              </Form.Item>
            </Col>
          </Row>
          <PubDivider title="关联采购单" />
          <Form.Item className={'mb-0'} noStyle name={'dataSource'}>
            <EditableProTable
              size={'small'}
              rowKey="purchase_order_sku_id"
              dateFormatter="string"
              bordered
              // dataSource={dataSource}
              columns={columnsSupplier}
              recordCreatorProps={false}
              editable={{
                type: 'multiple',
                editableKeys,
                form: sForm,
                onValuesChange: (record: any, recordList: any) => {
                  console.log(record);
                  console.log(recordList);

                  formRef.current?.setFieldsValue({
                    dataSource: recordList,
                  });
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
          </Form.Item>
          <div>说明:</div>
          <ul style={{ paddingInlineStart: '20px' }}>
            <li>1，系统默认逻辑：先扣采购单正常采购商品、再扣采购单备品，然后扣维修单；</li>
            <li>
              2，指定扣减逻辑：先扣指定采购单正常采购商品，再扣指定采购单备品，然后扣指定维修单，指定单据不够库存，则继续先扣未指定采购单采购商品和备品，再扣未指定维修单；
            </li>
            <li>3，同一类型单据，按创建时间，先建先出；</li>
            <li>4，只能选择一个供应商出货；</li>
          </ul>
        </ModalForm>
      </>
    );
  }
  /*国内少收已处理的*/
  if (type == 'cn' && dataSource?.orderException?.exception_type == '1') {
    return (
      <HandleUnNormalLessCN
        dataSource={dataSource}
        reload={reload}
        refreshKeySet={refreshKeySet}
        readonly={true}
        tableKeySet={tableKeySet}
        tableKey={tableKey}
        common={common}
        recordS={recordS}
      />
    );
  }
  /*跨境少收已处理的*/
  if (
    type == 'in' &&
    (dataSource?.exception_handling_num || dataSource?.exception_handling_num == 0)
  ) {
    return <span>{dataSource.exception_handling_num}(已处理)</span>;
  }
  /*国内多收已处理的*/
  if (
    (type == 'cn' && dataSource?.orderException?.exception_type == '0') ||
    (type == 'in' && dataSource?.orderException)
  ) {
    return (
      <>
        <BeforeHandleMore
          dataSource={dataSource}
          _ref={_ref}
          reload={reload}
          refreshKeySet={refreshKeySet}
          setIsModalCreateVisible={setIsModalVisible}
        />
        <div>
          <div>
            {dataSource.exception_handling_num || 0}
            <a
              onClick={() => {
                _ref?.current?.showCutDown();
              }}
            >
              (已处理)
            </a>
          </div>
        </div>
      </>
    );
  }
  /*国内/跨境多收或者无异常的*/
  return (
    <span>{typeof dataSource.difference_num == 'number' ? dataSource.difference_num : '-'}</span>
  );
};

export default HandleUnNormal;
