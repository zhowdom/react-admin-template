import React, { useState, useEffect} from 'react';
import { Row, Col, Form, Statistic, Tooltip } from 'antd';
import { history } from 'umi';
import { EditableProTable } from '@ant-design/pro-table';
import ComUpload from './customUpload';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { getUuid, pubGetStoreList, pubAllGoodsSkuBrand } from '@/utils/pubConfirm';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { handleCutZero } from '@/utils/pubConfig';
import FormSpecField from './FormSpecField';
import { ProFormDependency } from '@ant-design/pro-form';
// 立项款式信息
const EditZTTable = (props: any) => {
  const { disabled, isFinal } = props;
  const formItemLayout1 = {
    labelCol: { flex: 'auto' },
    wrapperCol: { flex: 1 },
  };
  const [scroll, setScroll] = useState({ x: 1200 });
  const form_business_scope = props?.formRef.current.getFieldValue('business_scope');
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
          rules: isFinal
            ? [
                {
                  validator: async (rule: any, value: any) => {
                    const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
                    if (!unDeleteFiles?.length) {
                      return Promise.reject(new Error('请上传图片'));
                    }
                    return Promise.resolve();
                  },
                },
              ]
            : [],
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
              fileBack={() => {}}
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
    setEditableRowKeys(props.editIds);
    setDataSource(props.defaultData);
  }, [props]);

  return (
    <>
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
                                projectsGoodsSkuSpecifications: null,
                              };
                            },
                            style: {
                              width: '100%',
                              marginTop: '10px',
                            },
                          }
                    }
                    onChange={(editableRows) => {
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
