import React, { createRef, useState } from 'react';
import { Row, Col, Form, Statistic, Tooltip } from 'antd';
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import ComUpload from './customUpload';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import ComEditTable from './customEditTable';
import { getUuid } from '@/utils/pubConfirm';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { handleCutZero } from '@/utils/pubConfig';

type DataSourceType = {
  id?: React.Key;
  sku_name?: string;
  sys_files?: any[];
  project_price?: number;
  tempId: any;
  ref1: any;
};

const EditZTTable: React.FC = (props: any) => {
  const disabled: any = props.disabled;
  const formItemLayout1 = {
    labelCol: { span: 1.5 },
    wrapperCol: { span: 23 },
  };
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
        .catch((e) => {
          console.log(e);
          callback(false);
        });
    },
  };
  // 设置选中的表格key
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(props.editIds);
  // 设置表格数据
  const [dataSource, setDataSource] = useState<DataSourceType[]>(() => props.defaultData);
  const fileColumns: ProColumns<DataSourceType>[] = [
    {
      title: (
        <>
          款式编码
          <Tooltip
            placement="top"
            title=" 命名规则建议: 产品线英文简称两位+需求简称1位+357系1位+V+迭代次数+任意
26个字母1位（按已被使用顺序自动生成）
举例：STK5V3A  /  STK5V3B   /STK5V3C   /STK5V3F"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'sku_code',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入款式编码' }],
      },
      width: 120,
    },
    {
      title: (
        <>
          款式名称
          <Tooltip
            placement="top"
            title=" 命名规则建议: 需求+产品类目+需求简称1位+357系1位+V+迭代次数+尺寸/规格
举例：儿童滑板车K5V3蓝色带座椅"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'sku_name',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入款式名称' }],
      },
      width: 120,
    },
    {
      title: '图片',
      align: 'center',
      dataIndex: 'sys_files',
      width: 240,
      formItemProps: {
        rules: [
          {
            validator: async (rule, value) => {
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
            sys_files={data?.[_?.index]?.sys_files || []}
            disabled={disabled}
            key="upload"
          />
        );
      },
      render: (text) => {
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
      title: '定价',
      dataIndex: 'project_price',
      valueType: 'digit',
      align: 'center',
      formItemProps: {
        rules: [{ required: true, message: '请输入定价' }],
      },
      fieldProps: {
        precision: 2,
        formatter: (value) => {
          return handleCutZero(String(value));
        },
      },
      width: 120,
      render: (_, record) => {
        return (
          <Statistic
            value={record?.project_price || 0}
            valueStyle={{ fontWeight: 400, fontSize: '14px' }}
          />
        );
      },
    },
    /*{
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
      width: 120,
      hideInTable: props.isEstablish,
    },*/
    {
      title: '规格类型',
      onCell: () => ({ colSpan: 5, style: { padding: 0 } }),
      dataIndex: 'type',
      align: 'center',
      editable: false,
      width: 90,
      valueEnum: {
        1: { text: '单品尺寸' },
        2: { text: '包装尺寸' },
      },
      render: (_, record: any) => {
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
              editIds={record.projectsGoodsSkuSpecifications.map((v: any) => v.tempId)}
              onChange={(data: any[]) => {
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
      width: 110,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
      width: 110,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      width: 110,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      align: 'center',
      width: 110,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 60,
      align: 'center',
      fixed: 'right',
      hideInTable: disabled,
      render: (text, record) => [
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

  return (
    <>
      <Row>
        <Col span={24}>
          <Form.Item
            {...formItemLayout1}
            rules={[{ required: !disabled, message: '请添加产品SKU' }]}
            label="款式"
            name="projectsGoodsSkus"
          >
            <EditableProTable<DataSourceType>
              columns={fileColumns}
              scroll={{ x: 1600 }}
              tableStyle={{ margin: '10px 0 0 -24px', padding: 0 }}
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
                          props.formRef.current.getFieldValue('projectsGoodsSkus')?.length || 0;
                        return {
                          tempId: getUuid(),
                          sku_name: '',
                          uom: '',
                          sys_files: [],
                          currency: '',
                          index,
                          project_price: '',
                          projectsGoodsSkuSpecifications: [
                            { tempId: '1', high: '', length: '', type: 1, weight: '', width: '' },
                            { tempId: '2', high: '', length: '', type: 2, weight: '', width: '' },
                          ],
                        };
                      },
                      style: {
                        marginLeft: '-24px',
                        width: '100%',
                        marginTop: '10px',
                      },
                    }
              }
              onChange={(editableRows) => {
                setDataSource(editableRows);
                props.tableDataChange(editableRows);
              }}
              editable={{
                type: 'multiple',
                editableKeys,
                form: props.form,
                actionRender: (row, config, defaultDoms) => {
                  return disabled ? null : [defaultDoms.delete];
                },
                onValuesChange: (record, recordList) => {
                  props.tableDataChange(recordList);
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
export default EditZTTable;
