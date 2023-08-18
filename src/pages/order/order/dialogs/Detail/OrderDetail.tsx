import { findSelectGoodsSku } from '@/services/base';
import { saveOrUpdateOrderItem, handDiscountAmt } from '@/services/pages/order';
import { pubAlert, pubMsg,pubConfig } from '@/utils/pubConfig';
import { getUuid, sub } from '@/utils/pubConfirm';
import { EditableProTable, ProForm, ProFormInstance } from '@ant-design/pro-components';
import { ProDescriptions } from '@ant-design/pro-components';
import {Button, Form, Modal, Popconfirm, Space} from 'antd';
import { useEffect, useRef, useState } from 'react';
import './index.less';

const Component: React.FC<{
  detail: any;
  orderDetail: any;
  dicList: any;
  detailHandle: any;
  detailHandleSet: any;
  _ref: any;
  id: any;
  fetchBaseDetail: any;
}> = ({ detail, orderDetail, detailHandle, detailHandleSet, _ref, id, fetchBaseDetail }) => {
  // 设置选中的表格key
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [editForm] = Form.useForm();
  const formRef = useRef<ProFormInstance>();
  const [optionsSku, optionsSkuSet] = useState([]);
  const [preData, preDataSet] = useState<any>([]); // 上一次编辑数据
  _ref.current = {
    setData: (data: any) => {
      formRef?.current?.setFieldsValue({
        detailsData: data,
      });
      preDataSet(data);
      setEditableRowKeys(
        data?.filter((v: any) => v.skuPropName != '赠品')?.map((v: any) => v.tempId),
      );
    },
  };
  useEffect(() => {
    findSelectGoodsSku({
      business_scope: 'CN',
      sku_type: '1',
      current_page: 1,
      page_size: 999,
    }).then((res) => {
      if (res.code == pubConfig.sCode) {
        const data =
          res?.data?.records?.map((val: any) => ({
            ...val,
            label: `${val?.sku_name}`,
            value: `${val?.id}`,
          })) || [];
        optionsSkuSet(data);
      }
    });
  }, []);
  // 删除
  const deleteAction = (record: any) => {
    const data = formRef?.current
      ?.getFieldValue('detailsData')
      .filter((item: any) => item.tempId !== record.tempId);
    formRef?.current?.setFieldsValue({
      detailsData: data,
    });
  };
  const columns: any = [
    {
      title: '序号',
      dataIndex: 'index',
      align: 'center',
      width: 50,
      editable: false,
    },
    {
      title: '图片',
      valueType: 'image',
      dataIndex: ['goodsSku', 'image_url'],
      width: 80,
      align: 'center',
      editable: false,
    },
    {
      title: '礼品名称',
      dataIndex: 'goods',
      editable: false,
      render: (_: any, record: any) =>
        record?.goods?.name_cn || record?.goods?.name_en
          ? `${record?.goods?.name_cn || ''}(${record?.goods?.name_en || ''})`
          : '-',
    },
    {
      title: 'SKU',
      dataIndex: 'erpSku',
      editable: false,
      width: 90,
    },
    {
      title: '款式编码',
      dataIndex: ['goodsSku', 'sku_code'],
      editable: false,
    },
    {
      title: '款式名称',
      dataIndex: 'goodsSkuId',
      editable: detailHandle == 2,
      valueType: 'select',
      formItemProps: {
        rules: [{ required: true, message: '请选择款式名称' }],
      },
      fieldProps: {
        showSearch: true,
        options: optionsSku,
        style: {maxWidth: 116},
      },
    },
    {
      title: '数量',
      dataIndex: 'num',
      width: 70,
      editable: detailHandle == 2,
      align: 'right',
      valueType: 'digit',
      formItemProps: () => {
        const reg: any = /^[1-9]\d*$/;
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (typeof value != 'number') {
                  return Promise.reject(new Error('请输入数量'));
                }
                if (typeof value == 'number' && (value <= 0 || !reg.test(value))) {
                  return Promise.reject(new Error('请输入大于0的整数'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: {
        style: {textAlign: 'right', maxWidth: 54},
        controls: false
      },
    },
    {
      title: '产品定价',
      dataIndex: ['goodsSku', 'price'],
      width: 70,
      align: 'right',
      editable: false,
    },
    {
      title: '打折金额',
      dataIndex: 'discountAmt',
      width: 70,
      align: 'right',
      editable: false,
      render: (_: any, record: any) => record?.discountAmt || '0.00',
    },
    {
      title: '其他费用',
      dataIndex: 'fee',
      width: 70,
      align: 'right',
      editable: false,
      render: (_: any, record: any) => record?.fee || '0.00',
    },
    {
      title: '销售价',
      dataIndex: 'salePrice',
      width: 70,
      align: 'right',
      editable: false,
    },
    {
      title: '人工打折',
      dataIndex: 'handDiscountAmt',
      width: 80,
      valueType: 'digit',
      align: 'right',
      formItemProps: (_: any, row: any) => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                const allPro = editForm?.getFieldsValue();
                let allNum = detail?.paymentDiff;
                for (const k in allPro) {
                  if (k != row?.entity?.tempId) {
                    allNum = sub(allNum, allPro[k].handDiscountAmt);
                  }
                }
                const overNum =
                  detail?.paymentDiff > 0 ? Math.min(allNum, row.entity.itemMaxNum) : 0;
                if (typeof value != 'number') {
                  return Promise.reject(new Error('请输入'));
                }
                if (typeof value == 'number' && value < 0) {
                  return Promise.reject(new Error('不能为负数'));
                }
                if (value > overNum) {
                  editForm.setFieldValue(row?.entity?.tempId, {
                    handDiscountAmt: overNum,
                  });
                  // return Promise.reject(new Error(`最大值不能超过${overNum}`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: {
        precision: 2,
        style: {textAlign: 'right', maxWidth: 66},
        controls: false
      },
      editable: detailHandle == 1,
    },
    {
      title: '属性',
      dataIndex: 'skuProp',
      width: 70,
      align: 'center',
      editable: false,
      render: (_: any, record: any) => {
        return record?.skuPropName || '商品';
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 50,
      align: 'center',
      fixed: 'right',
      hideInTable: detailHandle != 2,
      render: (text: any, record: any) => [
        <Popconfirm
          key="delete"
          title="确定删除吗?"
          onConfirm={async () => deleteAction(record)}
          okText="确定"
          cancelText="取消"
        >
          <a key="delete">删除</a>
        </Popconfirm>,
      ],
    },
  ];
  return (
    <>
      <ProForm
        formRef={formRef}
        onFinish={async (values) => {
          return Promise.all([editForm.validateFields()])
            .then(async () => {
              let postData = JSON.parse(JSON.stringify(values?.detailsData));
              if (detailHandle != 1 && postData?.some?.((v: any) => !v.erpSku)) {
                return pubAlert('ERP款式编码不能为空,请重新选择款式名称', '', 'warning');
              }
              // 组件bug输入过长获取不准确，重新赋值
              if (detailHandle == 1) {
                const data = editForm.getFieldsValue();
                postData = postData?.map((v: any) => {
                  return {
                    ...v,
                    handDiscountAmt: data[v.tempId]?.handDiscountAmt || v.handDiscountAmt,
                  };
                });
              }

              const res =
                detailHandle != 1
                  ? await saveOrUpdateOrderItem({
                      orderItems: postData.map((v: any) => {
                        return {
                          ...v,
                          goodsCategoryId: v?.categoryId,
                          isModifySalePrice: v?.isModifySalePrice == 'y' ? 'y' : 'n',
                        };
                      }),
                      id,
                    })
                  : await handDiscountAmt(postData);
              if (res?.code != '0') {
                pubMsg(res?.message);
                return false;
              } else {
                pubMsg('操作成功!', 'success');
                fetchBaseDetail();
                detailHandleSet(null);
              }
            })
            .catch(() => {
              Modal.warning({
                title: '提示',
                content: '请检查表单信息正确性',
              });
            });
        }}
        onFinishFailed={() => {
          editForm.validateFields();
          Modal.warning({
            title: '提示',
            content: '请检查表单信息正确性',
          });
        }}
        submitter={
          detailHandle
            ? {
                render: (props, dom: any[]) => (
                  <Space style={{ float: 'right' }}>
                    <Button
                      onClick={() => {
                        detailHandleSet(null);
                        _ref.current?.setData(orderDetail);
                      }}
                    >
                      取消
                    </Button>
                    {dom[1]}
                  </Space>
                ),
              }
            : false
        }
      >
        <Form.Item
          noStyle
          labelCol={{ flex: 0 }}
          label=""
          name="detailsData"
          rules={[{ required: true, message: '请添加订单明细' }]}
        >
          <EditableProTable
            size={'small'}
            bordered
            className="details"
            loading={!orderDetail}
            scroll={{x: 1200, y: 300}}
            cardProps={{ bodyStyle: { padding: 0 } }}
            rowKey={'tempId'}
            search={false}
            options={false}
            pagination={false}
            columns={columns}
            recordCreatorProps={
              detailHandle != 2
                ? false
                : {
                    newRecordType: 'dataSource',
                    record: () => {
                      const index = formRef?.current?.getFieldValue('detailsData')?.length + 1 || 1;
                      return {
                        tempId: getUuid(),
                        index,
                        goodsSku: {},
                        goods: {},
                        num: 1,
                      };
                    },
                  }
            }
            onChange={(editableRows) => {
              formRef?.current?.setFieldsValue({
                detailsData: editableRows,
              });
            }}
            editable={{
              type: 'multiple',
              editableKeys,
              form: editForm,
              actionRender: (row, config, defaultDoms) => {
                return detailHandle != 2 ? [] : [defaultDoms.delete];
              },
              onValuesChange: (record: any, recordList: any) => {
                if (record?.goodsSkuId && detailHandle == 2) {
                  const sku: any = optionsSku.filter(
                    (v: any) => v.goods_sku_id == record.goodsSkuId,
                  )?.[0];
                  recordList.forEach((v: any, i: number) => {
                    recordList[i].goodsSku = recordList[i].goodsSku || {};
                    recordList[i].goods = recordList[i].goods || {};
                    if (v.tempId == record?.tempId) {
                      // 只要款式名称选择修改了,无论与原始值是否相同,标识修改
                      let isModifySalePrice;
                      const preObj = preData?.filter((p: any) => p.tempId == record?.tempId)?.[0];
                      if ((record.id && preObj?.goodsSkuId != record.goodsSkuId) || !record.id) {
                        isModifySalePrice = 'y';
                      }
                      // 数据替换
                      recordList[i].erpSku = sku?.erp_sku;
                      recordList[i].goodsSku.image_url = sku?.image_url;
                      recordList[i].goodsSku.sku_code = sku?.sku_code;
                      recordList[i].goodsSku.price = sku?.price;
                      recordList[i].goodsSku.sku_name = sku?.sku_name;
                      recordList[i].categoryId = sku?.goods_category_id;
                      recordList[i].goodsId = sku?.goods_id;
                      recordList[i].goods.name_cn = sku?.name_cn;
                      recordList[i].goods.name_en = sku?.name_en;
                      recordList[i].isModifySalePrice = isModifySalePrice;
                      // 改变款式时销售价取定价
                      if (preObj.num == recordList[i].num) {
                        recordList[i].salePrice = sku?.price;
                      }
                    }
                  });
                  preDataSet(recordList);
                  formRef?.current?.setFieldsValue({
                    detailsData: recordList,
                  });
                } else {
                  formRef?.current?.setFieldsValue({
                    detailsData: recordList,
                  });
                  preDataSet(recordList);
                }
              },
              onChange: (editableKeyss) => {
                setEditableRowKeys(editableKeyss);
              },
            }}
          />
        </Form.Item>
      </ProForm>
      <ProDescriptions
        column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        size={'small'}
      >
        <ProDescriptions.Item valueType={{ type: 'money', moneySymbol: false }} label="订单金额">
          {detail?.orderAmt}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType={{ type: 'money', moneySymbol: false }} label="其他费用">
          {detail?.otherCharge}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType={{ type: 'money', moneySymbol: false }} label="折扣金额">
          {detail?.discountAmt}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType={{ type: 'money', moneySymbol: false }} label="平台优惠">
          {detail?.platformDiscount}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType={{ type: 'money', moneySymbol: false }} label="客户应付">
          {detail?.custPayableAmt}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType={{ type: 'money', moneySymbol: false }} label="客户实付">
          {detail?.custActualPaid}
        </ProDescriptions.Item>
        <ProDescriptions.Item valueType={{ type: 'money', moneySymbol: false }} label="支付差额">
          {detail?.paymentDiff}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="支付方式">{detail?.paymentTypeName || '-'}</ProDescriptions.Item>
      </ProDescriptions>
    </>
  );
};
export default Component;
