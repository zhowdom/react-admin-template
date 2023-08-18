import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form } from 'antd';
import { history } from 'umi';
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import BatchSetting from './BatchSetting';
import { getUuid } from '@/utils/pubConfirm';

const LogisticsClearance = (props: any) => {
  const formItemLayout1: any = {
    labelCol: { width: '130px' },
    wrapperCol: { span: 23 },
  };
  const [tableKey, setTableKey] = useState(getUuid());
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const { productName, disabled, approval_status, dicList, formRef } = props;
  const [eData, eDataSet] = useState<any>({});
  const fileColumns: ProColumns<any>[] = [
    {
      title: '款式名称',
      dataIndex: 'sku_attribute',
      align: 'left',
      width: 120,
      editable: false,
      render: (_: any, record: any) => {
        return disabled
          ? record?.sku_name ?? '-'
          : `${productName}${record?.sku_form_spec?.sku_form ?? ''}${
              record?.sku_form_spec?.sku_spec ?? '-'
            }`;
      },
      hideInTable:
        approval_status > 5 && history?.location?.pathname.indexOf('/finalize-detail-edit') == -1,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'left',
      hideInTable: !(
        approval_status > 5 && history?.location?.pathname.indexOf('/finalize-detail-edit') == -1
      ),
      width: 120,
      editable: false,
    },
    {
      title: '材质(英文)',
      dataIndex: 'texture_en',
      align: 'left',
      width: 180,
      formItemProps: () => {
        return {
          rules: [
            {
              validator(_, value: any) {
                const str = value?.replace(/(^\s*)|(\s*$)/g, '');
                if (!str) {
                  return Promise.reject(new Error('必填'));
                }
                if (/[\u4E00-\u9FA5]/.test(str)) {
                  return Promise.reject(new Error('请输入英文'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      align: 'left',
      width: 200,
      formItemProps: () => {
        return {
          rules: [
            {
              pattern: /^(?=.*\S).+$/,
              message: '请输入用途',
            },
            { required: true, message: '请输入用途' },
          ],
        };
      },
    },
    {
      title: '是否带磁',
      dataIndex: 'magnetism',
      valueType: 'select',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请选择是否带磁' }],
      },
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '是否有磁性包装',
      dataIndex: 'magnetism_packing',
      valueType: 'select',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请选择是否有磁性包装' }],
      },
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '是否带电',
      dataIndex: 'electric',
      valueType: 'select',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请选择是否带电' }],
      },
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '额定功率 (W)',
      dataIndex: 'w',
      valueType: 'digit',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入额定功率' }],
      },
      editable: (text: any, record: any) => {
        return eData[record.tempId] == '1';
      },
    },
    {
      title: '额定电压 (V)',
      dataIndex: 'v',
      align: 'center',
      valueType: 'digit',
      formItemProps: {
        rules: [{ required: true, message: '请输入额定电压' }],
      },
      editable: (text: any, record: any) => {
        return eData[record.tempId] == '1';
      },
    },
    {
      title: '额定电流 (A)',
      dataIndex: 'a',
      align: 'center',
      valueType: 'digit',
      formItemProps: {
        rules: [{ required: true, message: '请输入额定电流' }],
      },
      editable: (text: any, record: any) => {
        return eData[record.tempId] == '1';
      },
    },
  ];
  useEffect(() => {
    setTimeout(() => {
      const projectsGoodsSkuCustomsClearance = formRef?.current?.getFieldValue(
        'projectsGoodsSkuCustomsClearance',
      );
      setEditableRowKeys(
        disabled ? [] : projectsGoodsSkuCustomsClearance?.map((k: any) => k.tempId),
      );
      setDataSource(projectsGoodsSkuCustomsClearance);
      const obj = {};
      projectsGoodsSkuCustomsClearance.forEach((v: any) => {
        obj[v.tempId] = v.electric ?? '0';
      });
      eDataSet(obj);
    }, 1000);
  }, [props]);
  // 批量设置回调数据
  const batchCallback = useCallback((data: any) => {
    formRef?.current?.setFieldsValue({
      projectsGoodsSkuCustomsClearance: data,
    });
    setDataSource(data);
    const obj = {};
    data.forEach((v: any) => {
      obj[v.tempId] = v.electric ?? '0';
    });
    eDataSet(obj);
    setTimeout(() => {
      setTableKey(getUuid());
    },800)
  }, []);
  return (
    <>
      <Row>
        <Col span={24}>
          <Form.Item
            {...formItemLayout1}
            label="物流清关信息"
            name="projectsGoodsSkuCustomsClearance"
            required={!disabled}
          >
            {!disabled && (
              <BatchSetting
                productName={productName}
                formRef1={formRef}
                callback={batchCallback}
                dicList={dicList}
                form={props?.form}
              />
            )}

            <EditableProTable
              key={tableKey}
              columns={fileColumns}
              className="p-table-0"
              value={dataSource}
              rowKey="tempId"
              bordered
              scroll={{ x: 1200 }}
              recordCreatorProps={false}
              editable={{
                type: 'multiple',
                editableKeys: disabled ? [] : editableKeys,
                form: props?.form,
                onValuesChange: (record, recordList) => {
                  if (record.electric == '0') {
                    props?.form?.setFieldsValue({
                      [`${record.tempId}`]: {
                        w: undefined,
                        v: undefined,
                        a: undefined,
                      },
                    });
                  }
                  const data = JSON.parse(JSON.stringify(eData));
                  data[record.tempId] = record.electric ?? '0';
                  eDataSet(data);
                  formRef?.current?.setFieldsValue({
                    projectsGoodsSkuCustomsClearance: recordList.map((v: any) => ({
                      ...v,
                      w: v.electric == '0' ? undefined : v.w,
                      v: v.electric == '0' ? undefined : v.v,
                      a: v.electric == '0' ? undefined : v.a,
                    })),
                  });
                },
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};
export default LogisticsClearance;
