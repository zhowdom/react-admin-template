import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'antd';
import { history } from 'umi';
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { getList } from '@/services/pages/shipment/warehousecN';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const CloudCangTable = (props: any) => {
  const formItemLayout1 = {
    labelCol: { flex: 'auto' },
    wrapperCol: { flex: 1 },
  };
  const { hidden, productName, disabled } = props;
  // 设置选中的表格key
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  // 设置表格数据
  const [dataSource, setDataSource] = useState<any[]>([]);
  const fileColumns: ProColumns<any>[] = [
    {
      title: '款式名称',
      dataIndex: 'sku_attribute',
      align: 'center',
      width: 200,
      editable: false,
      render: (_: any, record: any) => {
        return disabled
          ? record?.sku_name ?? '-'
          : `${productName}${record?.sku_form_spec?.sku_form ?? ''}${
              record?.sku_form_spec?.sku_spec ?? '-'
            }`;
      },
      hideInTable:
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      hideInTable: !(
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1
      ),
      width: 120,
      editable: false,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
      hideInTable: !(
        props.approval_status > 5 &&
        history?.location?.pathname.indexOf('/finalize-detail-edit') == -1
      ),
      width: 120,
      editable: false,
    },
    {
      title: '发货仓',
      dataIndex: 'cloud_warehouse_id',
      valueType: 'select',
      align: 'center',
      width: 120,
      formItemProps: {
        rules: [{ required: true, message: '请选择发货仓' }],
      },
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      params: { platform_code: props?.platform_code },
      request: async () => {
        const res: any = await getList({
          current_page: 1,
          page_size: '99999',
          platform_code: 'QIMEN_YUNCANG',
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return [];
        }
        const newArray = res?.data?.records
          .map((v: any) => {
            return {
              value: v.id,
              label: v.warehouse_name + '(' + v.warehouse_code + ')',
              name: v.warehouse_name,
              disabled: v.status != 1,
              data: v,
              status: v.status,
            };
          })
          .sort((a: any, b: any) => b.status - a.status);
        return newArray;
      },
    },
    {
      title: '退货仓',
      dataIndex: 'return_cloud_warehouse_id',
      valueType: 'select',
      align: 'center',
      width: 120,
      fieldProps: {
        showSearch: true,
        filterOption: (input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        },
      },
      params: { platform_code: props?.platform_code },
      request: async () => {
        const res: any = await getList({
          current_page: 1,
          page_size: '99999',
          platform_code: 'QIMEN_YUNCANG',
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return [];
        }
        const newArray = res?.data?.records
          .map((v: any) => {
            return {
              value: v.id,
              label: v.warehouse_name + '(' + v.warehouse_code + ')',
              name: v.warehouse_name,
              disabled: v.status != 1,
              data: v,
              status: v.status,
            };
          })
          .sort((a: any, b: any) => b.status - a.status);
        return newArray;
      },
    },
  ];
  useEffect(() => {
    const data = props.formRef.current.getFieldValue('projectsQiMenCloudCangData');
    setEditableRowKeys(data?.map((k: any) => k.id || k.tempId));
    setDataSource(data);
  }, [props]);
  return (
    <>
      <Row>
        <Col span={24}>
          <Form.Item
            {...formItemLayout1}
            name="projectsQiMenCloudCangData"
            hidden={hidden}
            style={{ marginTop: '10px' }}
          >
            <EditableProTable
              columns={fileColumns}
              className="p-table-0"
              rowKey="tempId"
              value={dataSource}
              bordered
              recordCreatorProps={false}
              editable={{
                type: 'multiple',
                editableKeys: props?.disabled ? [] : editableKeys,
                form: props.form,
                onValuesChange: (record, recordList) => {
                  props?.formRef?.current?.setFieldsValue({
                    projectsQiMenCloudCangData: recordList,
                    projectsGoodsSkus: props?.formRef?.current
                      ?.getFieldValue('projectsGoodsSkus')
                      .map((v: any) => ({
                        ...v,
                        cloud_warehouse_id:
                          record.tempId == v.tempId ? record.cloud_warehouse_id : v.cloud_warehouse_id,
                        return_cloud_warehouse_id:
                          record.tempId == v.tempId
                            ? record.return_cloud_warehouse_id
                            : v.return_cloud_warehouse_id,
                      })),
                  });
                },
                onChange: (editableKeyss) => {
                  setEditableRowKeys(editableKeyss);
                },
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};
export default CloudCangTable;
