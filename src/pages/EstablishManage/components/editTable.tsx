import React, { createRef, useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, Statistic, Tooltip, Space } from 'antd';
import { history } from 'umi';
import { EditableProTable } from '@ant-design/pro-table';
import ComUpload from './customUpload';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import ComEditTable from './customEditTable';
import { getUuid, pubGetStoreList, pubAllGoodsSkuBrand } from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { handleCutZero } from '@/utils/pubConfig';
import BatchSettingSkus from './BatchSettingSkus';

import FormSpecField from './FormSpecField';
import { ProFormDependency } from '@ant-design/pro-form';
// 定稿款式信息
const EditZTTable = (props: any) => {
  const { disabled, isFinal, batchChange, allDetail } = props;
  const formItemLayout1 = {
    labelCol: { flex: 'auto' },
    wrapperCol: { flex: 1 },
  };
  const [scroll, setScroll] = useState({ x: 1200 });
  const [tableKey, setTableKey] = useState(getUuid());
  const form_business_scope = props?.formRef.current.getFieldValue('business_scope');
  const refsPbj = {};
  props.ref1.current = {
    innFormValidate: (callback: (res: boolean) => void) => {
      const all = [];
      for (const item of Object.values(refsPbj)) {
        const p = new Promise((resolve: any, reject: any) => {
          item?.current?.innFormValidate(resolve, reject);
        });
        all.push(p);
      }
      Promise.all(all)
        .then(() => {
          callback(true);
        })
        .catch(() => {
          callback(false);
        });
    },
  };
  // 设置选中的表格key
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  // 设置表格数据
  const [dataSource, setDataSource] = useState<any[]>([]);
  useEffect(() => {
    if (
      !(
        (props.approval_status > 5 &&
          history?.location?.pathname.indexOf('/finalize-detail-edit') == -1) ||
        !isFinal
      )
    ) {
      setScroll({ x: 2200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.approval_status, history?.location?.pathname]);

  const getColumns = (listing_site: any) => {
    // 表格展示列
    return [
      {
        title: (
          <>
            款式名称
            <Tooltip
              placement="top"
              title={
                <>
                  款式名称=产品名称+款式属性
                  <br />
                  此处只需要填写款式属性
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: disabled ? 'sku_name' : 'sku_form_spec',
        align: 'center',
        width: 300,
        renderFormItem: () => {
          return <FormSpecField productName={props?.productName} />;
        },
        formItemProps: {
          rules: [
            {
              validator: async (rule: any, value: any) => {
                if (value?.sku_form?.length > 6) {
                  return Promise.reject(new Error('款式形态应少于等于6个字'));
                }
                if (!value?.sku_spec) {
                  return Promise.reject(new Error('规格型号必填'));
                }
                return Promise.resolve();
              },
            },
          ],
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
      },

      {
        title: '图片',
        dataIndex: 'image_url',
        align: 'center',
        valueType: 'image',
        hideInSearch: true,
        width: 120,
        hideInTable: !props?.isDialog,
      },
      {
        title: '图片',
        align: 'center',
        dataIndex: 'sys_files',
        width: 180,
        hideInTable: props?.isDialog,
        formItemProps: {
          rules: [
            {
              validator: async (rule: any, value: any) => {
                const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
                if (!unDeleteFiles?.length) {
                  return Promise.reject(new Error('请上传图片'));
                }
                return Promise.resolve();
              },
            },
          ],
        },
        renderFormItem: (_: any) => {
          const data = props.formRef.current.getFieldValue('projectsGoodsSkus');
          return (
            <ComUpload
              isFinal={isFinal}
              sys_files={data?.[_?.index]?.sys_files || []}
              disabled={disabled}
              key="upload"
            />
          );
        },
        render: (text: any) => {
          return (
            <UploadFileList
              key="pic"
              fileBack={() => { }}
              businessType="PROJECT_GOODS_SKU"
              listType="picture-card"
              checkMain={false}
              required
              disabled
              defaultFileList={text ? (text == '-' ? undefined : text) : undefined}
              accept={['.jpg,.jpeg,.png']}
              acceptType={['jpg', 'jpeg', 'png']}
              maxCount="1"
              size="small"
            />
          );
        },
      },
      {
        title: '产品定位',
        dataIndex: 'position',
        valueType: 'select',
        align: 'center',
        width: 100,
        formItemProps: {
          rules: [{ required: true, message: '请选择产品定位' }],
        },
        valueEnum: props?.dicList.PROJECTS_GOODS_SKU_POSITION,
      },

      {
        title: '品牌',
        dataIndex: 'brand_id',
        valueType: 'select',
        align: 'center',
        width: 100,
        hideInTable: form_business_scope == 'CN',
        formItemProps: {
          rules: [{ required: true, message: '请选择品牌' }],
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
        request: async () => {
          const res = await pubAllGoodsSkuBrand();
          return res;
        },
      },
      {
        title: '定价',
        dataIndex: 'project_price',
        valueType: 'digit',
        align: 'center',
        formItemProps: {
          rules: [{ required: true, message: '请输入定价' }],
        },
        fieldProps: {
          precision: 2,
          formatter: (value: any) => {
            return handleCutZero(String(value));
          },
        },
        width: 100,
        render: (_: any, record: any) => {
          return (
            <Statistic
              value={record?.project_price || 0}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
            />
          );
        },
      },
      {
        title: '底线成交价',
        dataIndex: 'bottom_line_price',
        valueType: 'digit',
        align: 'center',
        formItemProps: {
          rules: [{ required: true, message: '请输入底线成交价' }],
        },
        fieldProps: {
          precision: 2,
          formatter: (value: any) => {
            return handleCutZero(String(value));
          },
        },
        width: 100,
        render: (_: any, record: any) => {
          return (
            <Statistic
              value={record?.bottom_line_price ?? '-'}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
            />
          );
        },
      },
      {
        title: (
          <>
            采销价
            <Tooltip
              placement="top"
              title={
                <>
                  采销价针对京东自营平台，如果上架站点中有京东自营，则需要填写采销价，其他平台不需要填写
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'procurement_price',
        valueType: 'digit',
        align: 'center',
        formItemProps: {
          rules: [
            {
              required:
                form_business_scope == 'CN'
                  ? listing_site?.includes('2') || listing_site?.includes('5')
                  : false,
              message: '请输入采销价',
            },
          ],
        },
        fieldProps: {
          precision: 2,
          formatter: (value: any) => {
            return handleCutZero(String(value));
          },
        },
        width: 100,
        render: (_: any, record: any) => {
          return (
            <Statistic
              value={record?.procurement_price ?? '-'}
              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
            />
          );
        },
      },
      {
        title: (
          <>
            商品条码
            <br />
            (UPC/Gtin)
          </>
        ),
        dataIndex: 'bar_code',
        align: 'center',
        hideInTable: !isFinal,
        formItemProps: {
          rules: [{ required: form_business_scope === 'CN', message: '请输入商品条码' }],
        },
        width: 120,
      },
      {
        title: '配送类型',
        dataIndex: 'send_kind',
        valueType: 'select',
        align: 'center',
        width: 160,
        formItemProps: {
          rules: [{ required: true, message: '请选择配送类型' }],
        },
        hideInTable: form_business_scope == 'CN' ? false : true,
        valueEnum: props?.dicList.SYS_SEND_KIND,
      },
      {
        title: '预计店铺',
        dataIndex: 'expected_shop',
        valueType: 'select',
        align: 'center',
        width: 120,
        formItemProps: {
          rules: [{ required: true, message: '请选择预计店铺' }],
        },
        hideInTable: form_business_scope == 'IN' ? false : true,
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
        request: async () => {
          const res: any = await pubGetStoreList({ business_scope: 'IN' });
          return res;
        },
      },
      {
        title: '规格类型',
        onCell: () => ({ colSpan: isFinal ? 6 : 5, style: { padding: 0 } }),
        dataIndex: 'type',
        align: 'center',
        editable: false,
        width: 90,
        valueEnum: isFinal
          ? {
            1: { text: '单品尺寸' },
            2: { text: '包装尺寸' },
            3: { text: '箱规' },
          }
          : {
            1: { text: '单品尺寸' },
            2: { text: '包装尺寸' },
          },
        render: (_: any, record: any, index: number) => {
          const cur: any = props.formRef.current.getFieldValue('projectsGoodsSkus');
          if (!refsPbj[record.tempId]) {
            refsPbj[record.tempId] = createRef();
          }
          return (
            <div style={{ margin: '-1px' }}>
              <ComEditTable
                ref2={refsPbj[record.tempId]}
                value={record.projectsGoodsSkuSpecifications}
                disabled={disabled}
                editIds={record?.projectsGoodsSkuSpecifications?.map((v: any) => v.tempId)}
                onChange={(data: any[]) => {
                  console.log(index)
                  console.log(cur)
                  props?.getSKUSpecsSize(data, record,allDetail, (backData: any) => {
                    console.log(backData)
                    const newList = cur.map((k: any, kindex: number) => ({
                      ...k,
                      message: kindex == index ? backData : k.message,
                    }))
                    props.formRef.current.setFieldsValue({
                      'projectsGoodsSkus': newList
                    })
                  });
                  // props.tableDataChange(newList, newList[index]);
                  cur[record.index].projectsGoodsSkuSpecifications = data;
                }}
              />
            </div>
          );
        },
      },
      {
        title: '长(cm)',
        dataIndex: 'length',
        align: 'center',
        width: 100,
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '宽(cm)',
        dataIndex: 'width',
        align: 'center',
        width: 100,
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '高(cm)',
        dataIndex: 'high',
        align: 'center',
        width: 100,
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '重量(g)',
        dataIndex: 'weight',
        align: 'center',
        width: 100,
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '每箱数量',
        dataIndex: 'pics',
        align: 'center',
        width: 100,
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: (
          <>
            产品尺寸类型
            <Tooltip
              placement="top"
              title={
                <>
                  系统通过款式的包装尺寸去匹配平台的产品尺寸类型规则，来计算当前款式在平台属于那种尺寸类型。
                  <br />
                  如果匹配不到，则会提醒当前款
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'message',
        editable: false,
        align: 'left',
        width: 160,
        render: (text: any, record: any) => {
          return (record?.message && record?.message?.success) ? (
            <>
              <strong style={{ color: record?.message?.belong_classify == '2' ? 'red' : '' }}>{record?.message?.title}</strong>
              <br />
              <Space>
                <span style={{ color: '#aaa' }}>预估旺季派送费:</span>
                <span>{record?.message?.peakSeasonFba}</span>
              </Space>
              <Space>
                <span style={{ color: '#aaa' }}>预估淡季派送费:</span>
                <span>{record?.message?.lowSeasonFba}</span>
              </Space>
            </>
          ) : (
            <strong style={{ color: 'red' }}>{record?.message?.title}</strong>
          )
        },
      },
      {
        title: '操作',
        valueType: 'option',
        width: 50,
        align: 'center',
        fixed: 'right',
        hideInTable: disabled,
        render: (text: any, record: any) => [
          <a
            key="delete"
            onClick={() => {
              const data = dataSource.filter((item) => item.tempId !== record.tempId);
              setDataSource(data);
              props.tableDataChange(data);
            }}
          >
            删除
          </a>,
        ],
      },
    ];
  };
  useEffect(() => {
    // const form_listing_site = props?.formRef.current.getFieldValue('form_listing_site');
    // console.log(form_listing_site,'form_listing_site')
    setEditableRowKeys(props.editIds);
    setDataSource(props.defaultData);
  }, [props]);

  // 批量设置回调数据
  const batchCallback = useCallback((data: any) => {
    batchChange(data);
    setTableKey(getUuid());
  }, []);
  return (
    <>
      {isFinal && !disabled && (
        <BatchSettingSkus
          dicList={props?.dicList}
          productName={props.productName}
          form_business_scope={props?.formRef.current.getFieldValue('business_scope')}
          form={props.form}
          formRef1={props.formRef}
          callback={batchCallback}
        />
      )}
      <Row>
        <Col span={24}>
          <ProFormDependency name={['listing_site']}>
            {({ listing_site }) => {
              return (
                <Form.Item
                  {...formItemLayout1}
                  rules={[{ required: !disabled, message: '请添加产品SKU' }]}
                  name="projectsGoodsSkus"
                >
                  <EditableProTable
                    key={tableKey}
                    columns={getColumns(listing_site)}
                    scroll={props?.isDialog ? { x: 1200 } : scroll}
                    className="p-table-0 product-edit-skus-e"
                    rowKey="tempId"
                    value={dataSource}
                    bordered
                    recordCreatorProps={
                      disabled
                        ? false
                        : {
                          newRecordType: 'dataSource',
                          record: () => {
                            const index =
                              props.formRef.current.getFieldValue('projectsGoodsSkus')?.length ||
                              0;
                            const tempId = getUuid();
                            return {
                              tempId,
                              uom: '',
                              sys_files: [],
                              currency: '',
                              index,
                              project_price: '',
                              position: '100',
                              procurement_price: null,
                              projectsGoodsSkuCustomsClearance:
                                form_business_scope == 'CN'
                                  ? undefined
                                  : {
                                    tempId,
                                  },
                              projectsGoodsSkuSpecifications: [
                                {
                                  tempId: '1',
                                  high: '',
                                  length: '',
                                  type: 1,
                                  weight: '',
                                  width: '',
                                },
                                {
                                  tempId: '2',
                                  high: '',
                                  length: '',
                                  type: 2,
                                  weight: '',
                                  width: '',
                                },
                                {
                                  tempId: '3',
                                  high: '',
                                  length: '',
                                  type: 3,
                                  weight: '',
                                  width: '',
                                  pics: '',
                                },
                              ],
                            };
                          },
                          style: {
                            width: '100%',
                            marginTop: '10px',
                          },
                        }
                    }
                    onChange={(editableRows) => {
                      console.log(1212, editableRows)
                      setDataSource(editableRows);
                      props.tableDataChange(editableRows, undefined, true);
                    }}
                    editable={{
                      type: 'multiple',
                      editableKeys,
                      form: props.form,
                      actionRender: (row, config, defaultDoms) => {
                        return disabled ? null : [defaultDoms.delete];
                      },
                      onValuesChange: (record, recordList) => {
                        props.tableDataChange(recordList, record);
                      },
                      onChange: (editableKeyss) => {
                        setEditableRowKeys(editableKeyss);
                      },
                    }}
                  />
                </Form.Item>
              );
            }}
          </ProFormDependency>
        </Col>
      </Row>
    </>
  );
};
export default EditZTTable;
