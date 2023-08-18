import { Col, Form, Modal, Row } from 'antd';
import type {
  ActionType,
  EditableFormInstance,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { EditableProTable, ModalForm, ProFormText } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react';
import './index.less';
import { pubConfig, pubMsg, pubNormalize } from '@/utils/pubConfig';
import { findById, findBySku, uploadCorrespondRelation } from '@/services/pages/link';

const UpdateRelative: React.FC<{
  dataSource: any;
  reload: any;
  title?: any;
  trigger?: any;
}> = ({ dataSource, reload, title, trigger }) => {
  const ref: any = useRef<ActionType>();
  const editorFormRef = useRef<EditableFormInstance<any>>();
  const [editableKeys, setEditableRowKeys] = useState<any[]>([]);
  const formRef = useRef<ProFormInstance>();
  const formItemLayout1 = {
    labelCol: { span: 3 },
    wrapperCol: { span: 20 },
  };
  // 查询款式编码对应款式名称
  const findBySkuCode = async (sku_code: any, rowIndex: any) => {
    // 需要等这个接口查询结果才能提交
    (window as any).isFetchingSku = true;
    const res = await findBySku(sku_code);
    (window as any).isFetchingSku = false;
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      editorFormRef?.current?.setRowData?.(rowIndex, {
        sku_name: '',
        goods_sku_id: '',
      });
      formRef?.current?.validateFields();
      return;
    }
    if (res?.data) {
      editorFormRef?.current?.setRowData?.(rowIndex, {
        sku_name: res.data.sku_name,
        goods_sku_id: res.data.id,
      });
    } else {
      editorFormRef?.current?.setRowData?.(rowIndex, {
        sku_name: '',
        goods_sku_id: '',
      });
      pubMsg(`未找到款式编码:"${sku_code}" 对应的款式`);
    }
    formRef?.current?.validateFields();
  };
  // columns配置 platform_code: TM, JD_POP, JD_FCS, JD_OPERATE, WALMART, AMAZON_SC, AMAZON_VC
  // 国内 'TM', 'JD_POP', 'JD_FCS'
  const columnsCn: ProColumns<any>[] = [
    {
      title:
        dataSource?.platform_code == 'TM'
          ? 'SKU(店铺SKU)'
          : dataSource?.platform_code.indexOf('JD') > -1
          ? 'SKU(商家编码)'
          : 'SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      editable: false,
    },
    {
      title: '对应款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      formItemProps: (form, { entity }) => {
        return {
          normalize: pubNormalize,
          rules: [
            {
              required: !entity.combination,
              message: '请输入对应款式编码',
            },
            {
              validator() {
                if (!entity.goods_sku_id && !entity.combination) {
                  return Promise.reject(new Error('未找到对应款式'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: (form: any, { rowIndex }: any) => {
        return {
          onBlur: async (e: any) => {
            const sku_code = e?.target?.value;
            if (sku_code) {
              findBySkuCode(sku_code, rowIndex);
            }
          },
        };
      },
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
      editable: false,
      formItemProps: {
        rules: [{ required: true, message: '款式名称不能为空' }],
      },
    },
    {
      title: '操作',
      dataIndex: 'combination',
      align: 'center',
      editable: false,
      width: 120,
      render: (_: any, record: any, index: number) => {
        return record.combination ? (
          <a
            style={{ color: 'red' }}
            onClick={() => {
              formRef?.current?.setFieldsValue({
                skuList: formRef?.current?.getFieldValue('skuList').map((v: any) => {
                  return {
                    ...v,
                    combination: v.id == record.id ? 0 : v.combination,
                  };
                }),
              });
              findBySkuCode(record.sku_code, index);
            }}
          >
            取消组合商品
          </a>
        ) : (
          <a
            onClick={() => {
              formRef?.current?.setFieldsValue({
                skuList: formRef?.current?.getFieldValue('skuList').map((v: any) => {
                  return {
                    ...v,
                    combination: v.id == record.id ? 1 : v.combination,
                  };
                }),
              });
              formRef?.current?.validateFields();
            }}
          >
            标记为组合商品
          </a>
        );
      },
    },
  ];
  // 跨境 WALMART, AMAZON_SC, JD_OPERATE
  const columnsIn: ProColumns<any>[] = [
    {
      title: dataSource?.platform_code == 'JD_OPERATE' ? 'SKU(商品编号)' : 'SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      editable: dataSource?.platform_code !== 'JD_OPERATE' ? false : undefined,
      formItemProps: {
        rules: [{ required: true, message: '请输入SKU' }],
      },
    },
    {
      title: '对应款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      formItemProps: (form, { entity }) => {
        return {
          normalize: pubNormalize,
          rules: [
            {
              required: true,
              message: '请输入对应款式编码',
            },
            {
              validator() {
                if (!entity.goods_sku_id) {
                  return Promise.reject(new Error('未找到对应款式'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: (form: any, { rowIndex }: any) => {
        return {
          onBlur: async (e: any) => {
            const sku_code = e?.target?.value;
            if (sku_code) {
              findBySkuCode(sku_code, rowIndex);
            }
          },
        };
      },
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      editable: false,
      formItemProps: {
        rules: [{ required: true, message: '款式名称不能为空' }],
      },
    },
  ];
  // 跨境 AMAZON_VC
  const columnsVc: ProColumns<any>[] = [
    {
      title: 'Asin(链接Id)',
      dataIndex: 'amazon_asin',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入Asin(链接Id)' }],
      },
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入SKU' }],
      },
    },
    {
      title: 'UPC/EAN',
      dataIndex: 'bar_code',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入UPC/EAN' }],
      },
    },
    {
      title: '对应款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      formItemProps: (form, { entity }) => {
        return {
          normalize: pubNormalize,
          rules: [
            {
              required: true,
              message: '请输入对应款式编码',
            },
            {
              validator() {
                if (!entity.goods_sku_id) {
                  return Promise.reject(new Error('未找到对应款式'));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: (form: any, { rowIndex }: any) => {
        return {
          onBlur: async (e: any) => {
            const sku_code = e?.target?.value;
            if (sku_code) {
              findBySkuCode(sku_code, rowIndex);
            }
          },
        };
      },
    },
  ];
  return (
    <ModalForm
      title={(title || '更新对应关系') + ' - ' + dataSource?.platform_code}
      trigger={trigger || <a>更新对应关系</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      request={async () => {
        const res = await findById({ id: dataSource?.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return [];
        } else {
          setEditableRowKeys(
            res?.data?.linkManagementSkuList
              ?.filter(
                (item: any) => item.sales_status !== 4 && ![2].includes(item.exception_type),
              )
              ?.map((v: any) => v.id),
          );
          return {
            link_id: res?.data?.link_id,
            skuList:
              res?.data?.linkManagementSkuList
                .filter((item: any) => item.sales_status !== 4 && ![2].includes(item.exception_type))
                .map((v: any) => ({
                  ...v,
                  combination: v.combination || 0,
                })) || [],
          };
        }
      }}
      formRef={formRef}
      width={1000}
      onFinish={async (values) => {
        if ((window as any).isFetchingSku) return false;
        const res = await uploadCorrespondRelation({
          ...values,
          id: dataSource?.id,
          platform_code: dataSource?.platform_code,
          shop_id: dataSource?.shop_id,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('提交成功!', 'success');
          reload();
          return true;
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '表单未正确填写, 请检查',
        });
      }}
      validateTrigger="onBlur"
    >
      <Row>
        <Col span={12}>
          <Form.Item label="链接名：">{dataSource?.link_name}</Form.Item>
        </Col>
        <Col span={12}>
          {dataSource?.platform_code == 'AMAZON_SC' ? (
            <ProFormText label="链接ID" name="link_id" />
          ) : (
            <Form.Item label="链接ID">{dataSource?.link_id}</Form.Item>
          )}
        </Col>
        <Col span={24} className="edit-table">
          <Form.Item
            label="对应关系"
            {...formItemLayout1}
            labelAlign="right"
            required
            className="mb-0"
          >
            <EditableProTable
              name="skuList"
              editableFormRef={editorFormRef}
              bordered
              rowKey="id"
              actionRef={ref}
              size="small"
              recordCreatorProps={false}
              editable={{
                type: 'multiple',
                editableKeys,
                actionRender: (row, config, defaultDoms) => {
                  return [defaultDoms.delete];
                },
              }}
              columns={
                ['TM', 'JD_POP', 'JD_FCS'].includes(dataSource?.platform_code)
                  ? columnsCn
                  : ['AMAZON_VC'].includes(dataSource?.platform_code)
                  ? columnsVc
                  : columnsIn
              }
            />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
};
export default UpdateRelative;
