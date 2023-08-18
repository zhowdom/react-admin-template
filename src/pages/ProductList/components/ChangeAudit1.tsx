import { Col, Form, Modal, Row, Space, Radio } from 'antd';
import {
  ModalForm,
  ProFormSelect,
  ProFormTextArea,
  EditableProTable,
} from '@ant-design/pro-components';
import type { ProFormInstance, ProColumns } from '@ant-design/pro-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { getReviewDetail, confirmReviewResult } from '@/services/pages/productList';
import { pubConfig, pubFilter, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { uniqBy, sortBy } from 'lodash';
// 产品管理 - 产品列表 - 确认评审结果
const optionsIsChange = [
  { label: '是', value: '1' },
  { label: '否', value: '0' },
];
const skuList = {
  toM2SkuList: [],
  toMClearSkuList: [],
};
const ChangeAudit: React.FC<{
  title?: any;
  dicList: any;
  reload: any;
  data: { goodsSkus: any[] };
}> = (props: any) => {
  const formRef: any = useRef<ProFormInstance>();
  const { dicList, data } = props;
  const [lifeCycleAll, lifeCycleAllSet] = useState(null);
  const [lifeCycleEnum, lifeCycleEnumSet] = useState<any>(dicList?.GOODS_LIFE_CYCLE || {});
  // 关联链接的skuList 转M2链接
  const [isChangeAllM2, isChangeAllM2Set] = useState<boolean | null>(null);
  const [refresh, refreshSet] = useState(0);
  const [editableKeysM2, editableKeysM2Set] = useState<React.Key[]>([]);
  useEffect(() => {}, [refresh]);
  // 关联链接的skuList 转Clear链接
  const [isChangeAllClear, isChangeAllClearSet] = useState<boolean | null>(null);
  const [editableKeysClear, editableKeysClearSet] = useState<React.Key[]>([]);
  useEffect(() => {
    // m2
    const toM2SkuList = sortBy(uniqBy(skuList.toM2SkuList, 'id'), 'link_id') || [];
    let firstMatchLinkId = '';
    toM2SkuList.forEach((item: any) => {
      if (item.link_id !== firstMatchLinkId) {
        item.rowSpan = toM2SkuList.filter(
          (tempItem: any) => tempItem.link_id == item.link_id,
        ).length;
        firstMatchLinkId = item.link_id;
      } else {
        item.rowSpan = 0;
      }
      item.isChange = '0';
    });
    editableKeysM2Set(toM2SkuList?.map((item: any) => item.id));
    formRef?.current?.setFieldsValue({ toM2LinkIdList: toM2SkuList });
    // m清
    firstMatchLinkId = '';
    const toMClearSkuList = sortBy(uniqBy(skuList.toMClearSkuList, 'id'), 'link_id') || [];
    toMClearSkuList.forEach((item: any) => {
      if (item.link_id !== firstMatchLinkId) {
        item.rowSpan = toMClearSkuList.filter(
          (tempItem: any) => tempItem.link_id == item.link_id,
        ).length;
        firstMatchLinkId = item.link_id;
      } else {
        item.rowSpan = 0;
      }
      item.isChange = '1';
    });
    editableKeysClearSet(toMClearSkuList?.map((item: any) => item.id));
    // console.log(toMClearSkuList, toMClearSkuList, 'toMClearSkuList')
    formRef?.current?.setFieldsValue({ toMClearLinkIdList: toMClearSkuList });
  }, [refresh]);

  // 上传结束后
  const handleUpload = async (sys_files: any) => {
    formRef.current?.setFieldsValue({ sys_files: sys_files });
  };
  const columns: ProColumns<any>[] = useMemo(() => {
    // 单个生命周期变化
    const lifeCycleChange = (val: any, entity: any) => {
      const originData = data.goodsSkus.find((item: any) => item.id == entity.id);
      // 复原需要删除带出的链接
      if (val == 1) {
        if (originData && originData?.life_cycle == 1 && entity?.linkManagementSkuList?.length) {
          skuList.toM2SkuList = skuList.toM2SkuList.filter(
            (item: any) => !entity.linkManagementSkuList.find((link: any) => link.id == item.id),
          );
          skuList.toMClearSkuList = skuList.toMClearSkuList.filter(
            (item: any) => !entity.linkManagementSkuList.find((link: any) => link.id == item.id),
          );
        }
      }
      // 测试期 转 稳定期 1 转 2
      if (val == 2) {
        if (originData && entity?.linkManagementSkuList?.length) {
          if (originData?.life_cycle == 1) {
            skuList.toM2SkuList = skuList.toM2SkuList.concat(
              entity.linkManagementSkuList.filter((item: any) => item.life_cycle == 1),
            );
          }
          if (originData?.life_cycle == 1 || originData?.life_cycle == 2) {
            skuList.toMClearSkuList = skuList.toMClearSkuList.filter(
              (item: any) => !entity.linkManagementSkuList.find((link: any) => link.id == item.id),
            );
          }
        }
      }
      // 测试期,稳定期 转 清仓期 1,2 转 3
      if (val == 3) {
        if (originData && entity?.linkManagementSkuList?.length) {
          if (originData?.life_cycle == 1 || originData?.life_cycle == 2) {
            skuList.toM2SkuList = skuList.toM2SkuList.filter(
              (item: any) => !entity.linkManagementSkuList.find((link: any) => link.id == item.id),
            );
            skuList.toMClearSkuList = skuList.toMClearSkuList.concat(
              entity.linkManagementSkuList.filter(
                (item: any) => !(item.life_cycle == 11 || item.life_cycle == 400),
              ),
            );
          }
        }
      }
      refreshSet(Date.now());
    };
    return [
      {
        title: '款式名称',
        dataIndex: 'sku_name',
        editable: false,
      },
      {
        title: '款式编码',
        dataIndex: 'sku_code',
        editable: false,
      },
      {
        title: (
          <Space>
            {'生命周期'}
            <ProFormSelect
              fieldProps={{
                allowClear: false,
                value: lifeCycleAll,
                onChange: (val) => {
                  if (val) {
                    lifeCycleAllSet(val);
                    const goodsSkus = formRef?.current?.getFieldValue('goodsSkus');
                    formRef?.current?.setFieldsValue({
                      goodsSkus: goodsSkus?.map((item: any) => ({
                        ...item,
                        life_cycle: val,
                      })),
                    });
                    skuList.toM2SkuList = [];
                    skuList.toMClearSkuList = [];
                    goodsSkus.forEach((entity: any) => {
                      lifeCycleChange(val, entity);
                    });
                  }
                },
              }}
              ignoreFormItem
              valueEnum={lifeCycleEnum}
            />
          </Space>
        ),
        dataIndex: 'life_cycle',
        valueType: 'select',
        align: 'center',
        width: 200,
        formItemProps: {
          rules: [{ required: true, message: '请选择生命周期' }],
        },
        valueEnum: (record: any) => {
          // 不可选的生命周期设置
          const life_cycle = record.life_cycle ? String(record.life_cycle) : null;
          const goodsLifeCycle = dicList?.GOODS_LIFE_CYCLE;
          Object.keys(goodsLifeCycle).forEach((key) => {
            goodsLifeCycle[key] = {
              ...goodsLifeCycle[key],
              disabled: Number(key) < Number(life_cycle || -1) || key == '4',
            };
          });
          return goodsLifeCycle;
        },
        fieldProps: (form: any, { entity }: any) => ({
          allowClear: false,
          onChange: (val: any) => {
            lifeCycleAllSet(null);
            lifeCycleChange(val, entity);
          },
        }),
      },
      {
        title: '产品定位',
        dataIndex: 'position',
        align: 'center',
        valueType: 'radio',
        valueEnum: dicList?.PROJECTS_GOODS_SKU_POSITION || {},
        width: 180,
      },
    ];
  }, [lifeCycleEnum, dicList, lifeCycleAll, data]);
  return (
    <ModalForm
      title={'确认评审结果'}
      trigger={<a>确认评审结果</a>}
      labelAlign="right"
      labelCol={{ flex: '0 0 100px' }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        style: { top: 20 },
      }}
      request={async () => {
        const res = await getReviewDetail({ batch_no: data.batch_no, id: data.id });
        if (res?.code == pubConfig.sCode) {
          // 不可选生命周期设置
          const life_cycle = res?.data?.life_cycle ? String(res?.data?.life_cycle) : null;
          const lifeCycleDic = { ...dicList?.GOODS_LIFE_CYCLE };
          Object.keys(lifeCycleDic).forEach((key) => {
            lifeCycleDic[key] = {
              ...lifeCycleDic[key],
              disabled: Number(key) < Number(life_cycle || -1) || key == '4',
            };
          });
          lifeCycleEnumSet(lifeCycleDic);
          return {
            remarks: '',
            ...res?.data,
            goodsSkus: res?.data?.goodsSkus.map((item: any) => ({
              ...item,
              position: item.position + '',
            })),
            toM2LinkIdList: [],
            toMClearLinkIdList: [],
            linkManagementSkuList: [],
          };
        } else {
          pubMsg(res?.message);
        }
        return {};
      }}
      formRef={formRef}
      width={1200}
      onFinish={async (values: Record<string, any>) => {
        const postData = {
          id: data.id,
          batch_no: data.batch_no,
          remarks: values.remarks,
          sys_files: values.sys_files,
          goodsSkus: values.goodsSkus,
          toM2LinkIdList:
            values?.toM2LinkIdList
              ?.filter((item: any) => item.isChange == '1' && item.rowSpan)
              .map((item: any) => item.link_id) || [],
          toMClearLinkIdList:
            values?.toMClearLinkIdList
              ?.filter((item: any) => item.isChange == '1' && item.rowSpan)
              .map((item: any) => item.link_id) || [],
          linkManagementSkuList: [
            ...(values?.toM2LinkIdList?.map((item: any) => ({
              id: item.id,
              sales_status: item.sales_status,
            })) || []),
            ...(values?.toMClearLinkIdList?.map((item: any) => ({
              id: item.id,
              sales_status: item.sales_status,
            })) || []),
          ],
        };
        // console.log(postData, 'postData')
        // return false
        const res = await confirmReviewResult(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('提交成功!', 'success');
          if (props?.reload) props.reload();
          return true;
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
      onVisibleChange={(val) => {
        if (!val) {
          lifeCycleAllSet(null);
          skuList.toM2SkuList = [];
          skuList.toMClearSkuList = [];
        }
      }}
    >
      <Row>
        <Col span={12} className="item10">
          <Form.Item label="产品名">{data?.name_cn || '-'}</Form.Item>
        </Col>
        <Col span={12} className="item10">
          <Form.Item label="产品生命周期">
            {pubFilter(dicList?.GOODS_LIFE_CYCLE, data.life_cycle) || '-'}
          </Form.Item>
        </Col>
        <Col span={24} className="edit-table">
          <Form.Item label="确认结果" labelAlign="right">
            <EditableProTable
              name={'goodsSkus'}
              bordered
              rowKey={'id'}
              size="small"
              recordCreatorProps={false}
              className="center-th"
              editable={{
                type: 'multiple',
                editableKeys: data?.goodsSkus?.map((v: any) => v.id),
              }}
              columns={columns}
            />
          </Form.Item>
        </Col>
        <Col span={24} className="edit-table">
          {editableKeysM2.length ? (
            <Form.Item label="*转M2链接" labelAlign="right">
              <EditableProTable
                name={'toM2LinkIdList'}
                bordered
                rowKey={'id'}
                size="small"
                recordCreatorProps={false}
                className="center-th"
                editable={{
                  type: 'multiple',
                  editableKeys: editableKeysM2,
                }}
                columns={[
                  {
                    title: '链接名称/店铺/推广/生命周期',
                    dataIndex: 'sku_name',
                    width: 210,
                    editable: false,
                    render: (_, record: any) => (
                      <>
                        {record.link_name} <br />
                        {record.name} <br />
                        {record.spread_user_name} <br />
                        {pubFilter(dicList?.LINK_MANAGEMENT_LIFE_CYCLE, record.life_cycle) || '-'}
                      </>
                    ),
                    onCell: ({ rowSpan }: any) => ({ rowSpan }),
                  },
                  {
                    title: 'SKU',
                    dataIndex: 'shop_sku_code',
                    editable: false,
                  },
                  {
                    title: '款式编码',
                    dataIndex: 'sku_code',
                    editable: false,
                  },
                  {
                    title: '款式名称',
                    dataIndex: 'sku_name',
                    editable: false,
                  },
                  {
                    title: '销售状态',
                    dataIndex: 'sales_status',
                    valueType: 'select',
                    align: 'center',
                    formItemProps: {
                      rules: [{ required: true, message: '请选择' }],
                    },
                    valueEnum: {
                      ...dicList?.LINK_MANAGEMENT_SALES_STATUS,
                      4: { ...dicList?.LINK_MANAGEMENT_SALES_STATUS[4], disabled: true },
                    },
                    fieldProps: () => ({
                      allowClear: false,
                    }),
                    editable: () => data?.business_scope == 'IN',
                  },
                  {
                    title: (
                      <>
                        是否转M2
                        <Radio.Group
                          value={isChangeAllM2}
                          options={optionsIsChange}
                          onChange={(e) => {
                            isChangeAllM2Set(e?.target?.value);
                            const toM2LinkIdList = formRef?.current.getFieldValue('toM2LinkIdList');
                            formRef?.current.setFieldsValue({
                              toM2LinkIdList: toM2LinkIdList.map((item: any) => ({
                                ...item,
                                isChange: e?.target?.value,
                              })),
                            });
                            // 选了 是 链接转M2, 就不能在选转M清
                            const toMClearLinkIdList =
                              formRef?.current.getFieldValue('toMClearLinkIdList');
                            toM2LinkIdList.forEach((entity: any) => {
                              if (e?.target?.value == '1') {
                                formRef?.current.setFieldsValue({
                                  toMClearLinkIdList: toMClearLinkIdList.map((item: any) => {
                                    if (item.link_id == entity.link_id) {
                                      return {
                                        ...item,
                                        isChange: '0',
                                        isChangeDisabled: true,
                                      };
                                    }
                                    return item;
                                  }),
                                });
                              } else {
                                formRef?.current.setFieldsValue({
                                  toMClearLinkIdList: toMClearLinkIdList.map((item: any) => {
                                    if (item.link_id == entity.link_id) {
                                      return {
                                        ...item,
                                        isChangeDisabled: false,
                                      };
                                    }
                                    return item;
                                  }),
                                });
                              }
                            });
                          }}
                        />
                      </>
                    ),
                    dataIndex: 'isChange',
                    align: 'center',
                    width: 140,
                    valueType: 'radio',
                    fieldProps: (form, { entity }: any) => ({
                      options: optionsIsChange,
                      onChange: (e: any) => {
                        isChangeAllM2Set(null);
                        // 选了 是 链接转M2, 就不能在选转M清
                        const toMClearLinkIdList =
                          formRef?.current.getFieldValue('toMClearLinkIdList');
                        if (e?.target?.value == '1') {
                          formRef?.current.setFieldsValue({
                            toMClearLinkIdList: toMClearLinkIdList.map((item: any) => {
                              if (item.link_id == entity.link_id) {
                                return {
                                  ...item,
                                  isChange: '0',
                                  isChangeDisabled: true,
                                };
                              }
                              return item;
                            }),
                          });
                        } else {
                          formRef?.current.setFieldsValue({
                            toMClearLinkIdList: toMClearLinkIdList.map((item: any) => {
                              if (item.link_id == entity.link_id) {
                                return {
                                  ...item,
                                  isChangeDisabled: false,
                                };
                              }
                              return item;
                            }),
                          });
                        }
                      },
                    }),
                    formItemProps: {
                      rules: [pubRequiredRule],
                    },
                    onCell: ({ rowSpan }: any) => ({ rowSpan }),
                  },
                ]}
              />
            </Form.Item>
          ) : null}
          {editableKeysClear.length ? (
            <Form.Item label="*转M清链接" labelAlign="right">
              <EditableProTable
                name={'toMClearLinkIdList'}
                bordered
                rowKey={'id'}
                size="small"
                recordCreatorProps={false}
                className="center-th"
                editable={{
                  type: 'multiple',
                  editableKeys: editableKeysClear,
                }}
                columns={[
                  {
                    title: '链接名称/店铺/推广/生命周期',
                    dataIndex: 'sku_name',
                    width: 210,
                    editable: false,
                    render: (_, record: any) => (
                      <>
                        {record.link_name} <br />
                        {record.name} <br />
                        {record.spread_user_name} <br />
                        {pubFilter(dicList?.LINK_MANAGEMENT_LIFE_CYCLE, record.life_cycle) || '-'}
                      </>
                    ),
                    onCell: ({ rowSpan }: any) => ({ rowSpan }),
                  },
                  {
                    title: 'SKU',
                    dataIndex: 'shop_sku_code',
                    editable: false,
                  },
                  {
                    title: '款式编码',
                    dataIndex: 'sku_code',
                    editable: false,
                  },
                  {
                    title: '款式名称',
                    dataIndex: 'sku_name',
                    editable: false,
                  },
                  {
                    title: '销售状态',
                    dataIndex: 'sales_status',
                    valueType: 'select',
                    align: 'center',
                    formItemProps: {
                      rules: [{ required: true, message: '请选择' }],
                    },
                    valueEnum: {
                      ...dicList?.LINK_MANAGEMENT_SALES_STATUS,
                      4: { ...dicList?.LINK_MANAGEMENT_SALES_STATUS[4], disabled: true },
                    },
                    fieldProps: () => ({
                      allowClear: false,
                    }),
                    editable: () => data?.business_scope == 'IN',
                  },
                  {
                    title: (
                      <>
                        是否转M清
                        <Radio.Group
                          value={isChangeAllClear}
                          options={optionsIsChange}
                          onChange={(e) => {
                            isChangeAllClearSet(e?.target?.value);
                            const toMClearLinkIdList =
                              formRef?.current.getFieldValue('toMClearLinkIdList');
                            formRef?.current.setFieldsValue({
                              toMClearLinkIdList: toMClearLinkIdList.map((item: any) => {
                                if (!item?.isChangeDisabled) {
                                  return {
                                    ...item,
                                    isChange: e?.target?.value,
                                  };
                                }
                                return item;
                              }),
                            });
                          }}
                        />
                      </>
                    ),
                    dataIndex: 'isChange',
                    align: 'center',
                    width: 140,
                    valueType: 'radio',
                    fieldProps: (form, { entity }: any) => ({
                      options: optionsIsChange,
                      onChange: () => isChangeAllClearSet(null),
                      disabled: !!entity.isChangeDisabled,
                    }),
                    formItemProps: {
                      rules: [pubRequiredRule],
                    },
                    onCell: ({ rowSpan }: any) => ({ rowSpan }),
                  },
                ]}
              />
            </Form.Item>
          ) : null}
        </Col>
      </Row>
      <ProFormTextArea
        name="remarks"
        label="评审备注"
        placeholder="请输入评审备注"
        rules={[{ required: true, message: '请输入评审备注' }]}
      />
      <Form.Item label="附件" name="sys_files">
        <UploadFileList
          fileBack={handleUpload}
          businessType="VENDOR_COMMUNICATION_RECORD"
          listType="picture"
        />
      </Form.Item>
    </ModalForm>
  );
};
export default ChangeAudit;
