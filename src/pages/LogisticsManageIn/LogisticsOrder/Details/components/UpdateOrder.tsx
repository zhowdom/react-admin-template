import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Button, Modal } from 'antd';
import { useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { pubConfig, pubFilter, pubMsg, pubAlert } from '@/utils/pubConfig';
import StockOrderDetail_IN from '@/components/Reconciliation/StockOrderDetail_IN';
import { useAccess } from 'umi';
import PlatStore from '@/components/PubForm/PlatStore';
import { chooseWarehouseOrder } from '@/services/pages/logisticsManageIn/logisticsOrder';
import { flatData } from '@/utils/filter';
import { getUuid } from '@/utils/pubConfirm';

export default (props: any) => {
  const { dicList, formRefP, shipping_method, deleteIds, setDeleteIds } = props;
  const formRef = useRef<ProFormInstance>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRowKeys, selectedRowKeysSet] = useState<any[]>([]);
  const [selectedRowData, selectedRowDataSet] = useState<any[]>([]);
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      exclude_warehouse_order_id: formRefP?.current
        ?.getFieldValue('logisticsOrderDetails')
        ?.map((v: any) => v?.warehousing_order_id ?? v?.id),
      page_size: params?.pageSize,
      warehouse_order_no: params.order_no,
      include_warehouse_order_id: deleteIds ? [...new Set(deleteIds)] : [],
    };
    const res = await chooseWarehouseOrder(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  // 取消+关闭
  const modalClose = () => {
    setIsModalVisible(false);
    selectedRowKeysSet([]);
    selectedRowDataSet([]);
  };
  const modalOk = () => {
    if (!selectedRowData?.length) return pubAlert('请勾选数据');
    // 勾选数据处理
    const data = selectedRowData.map((v: any) => {
      return {
        ...v,
        warehousingOrderSpecifications1: v.warehousingOrderSpecificationList,
        warehousingOrderSpecifications: v.warehousingOrderSpecificationList?.filter((c: any) => c.num),
        warehousing_order_no: v.order_no,
        warehousing_order_id: v.id,
        id: null,
      };
    });
    const dataFlat = flatData(data, 'warehousingOrderSpecifications', 'null', false);
    formRefP?.current?.setFieldsValue({
      logisticsOrderDetails: [
        // 页面上
        ...formRefP?.current?.getFieldValue('logisticsOrderDetails'),
        // 新添加的处理成合并单元格数据展示页面
        ...dataFlat.map((v: any) => {
          if (deleteIds.includes(v.warehousing_order_id)) {
            const index = deleteIds.findIndex((item: any) => item === v.warehousing_order_id);
            setDeleteIds((pre: any) => {
              pre.splice(index, 1);
              return pre;
            });
          }
          const cur = Array.isArray(v.warehousingOrderSpecifications)
            ? v.warehousingOrderSpecifications?.[0]
            : v.warehousingOrderSpecifications;
          return {
            ...v,
            tempId: getUuid(),
            length: cur?.length,
            width: cur?.width,
            high: cur?.high,
            unit_weight: cur?.unit_weight,
          };
        }),
      ],
    });
    modalClose();
  };
  return (
    <>
      <Button
        ghost
        type="primary"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
      >
        添加跨境平台入库单
      </Button>
      <Modal
        width={'95%'}
        title="添加跨境平台入库单"
        open={isModalVisible}
        destroyOnClose
        maskClosable={false}
        onOk={modalOk}
        onCancel={() => modalClose()}
      >
        <div>
          出货渠道：{pubFilter(dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD, shipping_method)}
        </div>
        <ProTable
          options={false}
          formRef={formRef}
          bordered
          search={{ defaultCollapsed: false, labelWidth: 'auto' }}
          request={getListAction}
          size="small"
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 10,
          }}
          tableAlertRender={false}
          rowKey="id"
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onSelect: (record, selected) => {
              let keys = [...selectedRowKeys];
              let data = [...selectedRowData];
              if (selected) {
                keys = [...selectedRowKeys, record.id];
                data = [...selectedRowData, record];
              } else {
                keys = selectedRowKeys.filter((item) => item !== record.id);
                data = selectedRowData.filter((item) => item.id !== record.id);
              }
              selectedRowKeysSet(keys);
              selectedRowDataSet(data);
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
              if (selected) {
                const addCheckedKeys = changeRows.map((item) => {
                  return item.id;
                });
                selectedRowKeysSet([...selectedRowKeys, ...addCheckedKeys]);
                selectedRowDataSet([...selectedRowData, ...changeRows]);
              } else {
                const subCheckedKeys = selectedRowKeys.filter((idT) => {
                  return !changeRows.some((item) => {
                    return item.id === idT;
                  });
                });
                const subCheckedRows = selectedRowData.filter((idT) => {
                  return !changeRows.some((item) => {
                    return item.id === idT;
                  });
                });
                selectedRowKeysSet(subCheckedKeys);
                selectedRowDataSet(subCheckedRows);
              }
            },
          }}
          columns={[
            {
              title: '入库单号',
              dataIndex: 'order_no',
              align: 'center',
              order: 2,
              width: 130,
              render: (_: any, record: any) => {
                return (
                  <StockOrderDetail_IN
                    id={record.id}
                    from="stock"
                    dicList={dicList}
                    access={access}
                    title={<a key="detail">{record.order_no}</a>}
                  />
                );
              },
            },
            {
              title: '状态',
              dataIndex: 'approval_status',
              align: 'center',
              order: 11,
              width: 100,
              hideInSearch: true,
              render: () => <span>国内已入库</span>,
            },
            {
              title: '运输方式',
              dataIndex: 'shipping_method',
              align: 'center',
              hideInSearch: true,
              render: (_: any, record: any) =>
                pubFilter(
                  dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD,
                  record?.shipping_method,
                ) ?? '-',
            },
            {
              title: '平台',
              dataIndex: 'platform_name',
              align: 'center',
              width: 90,
              hideInSearch: true,
            },
            {
              title: '店铺',
              dataIndex: 'shop_name',
              align: 'center',
              hideInSearch: true,
            },
            {
              title: '店铺',
              dataIndex: 'plat_store',
              align: 'center',
              order: 4,
              render: (_: any, record: any) => record?.shop_name || '-',
              renderFormItem: (_, rest, form) => {
                return (
                  <PlatStore
                    business_scope="IN"
                    back={(v: any) => {
                      form.setFieldsValue({ plat_store: v });
                    }}
                  />
                );
              },
              search: {
                transform: (value) => {
                  return {
                    platform_id: value ? value?.[0] : null, // 平台
                    shop_id: value ? value?.[1] : null, // 店铺
                  };
                },
              },
            },
            {
              title: '平台目的仓',
              dataIndex: 'platform_target_warehouse',
              align: 'center',
              hideInSearch: true,
            },
            {
              title: '采购主体',
              dataIndex: 'vendor_signing_name',
              align: 'center',
              hideInSearch: true,
            },
            {
              title: '商品名称',
              dataIndex: 'sku_name',
              align: 'center',
              hideInSearch: true,
            },
            {
              title: 'SKU',
              dataIndex: 'sku_code',
              align: 'center',
            },
            {
              title: '每箱数量',
              dataIndex: 'pics',
              align: 'center',
              hideInSearch: true,
              render: (_: any, record: any) =>
                record?.warehousingOrderSpecificationList?.[0]?.pics ?? '-',
            },
            {
              title: '箱数',
              dataIndex: 'num',
              align: 'center',
              hideInSearch: true,
              render: (_: any, record: any) =>
                record?.warehousingOrderSpecificationList?.[0]?.num ?? '-',
            },
            {
              title: '发货数量',
              dataIndex: 'picsTotal',
              align: 'center',
              hideInSearch: true,
              width: 90,
              render: (_: any, record: any) => {
                // 箱规计算出来为0, 默认取父的本次计划发货数量
                return (
                  <span>
                    {record?.warehousingOrderSpecificationList?.reduce(
                      (previousValue: any, currentValue: any) =>
                        previousValue + currentValue.pics * currentValue.num,
                      0,
                    ) || record.delivery_plan_current_num}
                  </span>
                );
              },
            },
            {
              title: '到港数量',
              dataIndex: 'arrival_num',
              align: 'center',
              hideInSearch: true,
            },
            {
              title: '到港时间',
              dataIndex: 'arrival_time',
              align: 'center',
              hideInSearch: true,
            },
          ]}
        />
      </Modal>
    </>
  );
};
