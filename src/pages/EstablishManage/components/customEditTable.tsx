import React, { useState } from 'react';
import { EditableProTable } from '@ant-design/pro-table';
import { history } from 'umi';
import './establish.less';
import { Form } from 'antd';
import { handleCutZero } from '@/utils/pubConfig';
type props = {
  value: any[];
  disabled: boolean;
  onChange?: () => void;
  ref2: any;
  editIds: any[];
};
const ComEditTable: React.FC<props> = (props: props) => {
  const [editForm] = Form.useForm();
  const [dataSource, setDataSource] = useState(props.value);
  const pathname = history?.location?.pathname;
  // 可编辑表格
  const [editableKeys] = useState<React.Key[]>(props.editIds || ['1', '2']);
  const columns: any[] = [
    {
      title: '规格类型',
      dataIndex: 'type',
      align: 'center',
      editable: false,
      width: 90,
      valueEnum: {
        1: { text: '单品尺寸' },
        2: { text: '包装尺寸' },
        3: { text: '箱规' },
      },
    },
    {
      title: '长(cm)',
      dataIndex: 'length',
      align: 'center',
      valueType: 'digit',
      width: 100,
      fieldProps: {
        min: '',
        precision: 2,
        formatter: (value: any) => {
          return handleCutZero(String(value));
        },
      },
      formItemProps: (form: any, config: any) => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (config.rowIndex === 2) {
                  if (typeof value == 'number' && value <= 0) {
                    return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                  }
                  if (value > 9999999) {
                    return Promise.reject(new Error(`输入内容不能超过9999999`));
                  }
                  return Promise.resolve();
                }
                if (pathname.indexOf('finalize-detail') > -1 && typeof value != 'number') {
                  return Promise.reject(new Error('请输入长度'));
                }
                if (typeof value == 'number' && value <= 0) {
                  return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
      valueType: 'digit',
      width: 100,
      formItemProps: (form: any, config: any) => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (config.rowIndex === 2) {
                  if (typeof value == 'number' && value <= 0) {
                    return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                  }
                  if (value > 9999999) {
                    return Promise.reject(new Error(`输入内容不能超过9999999`));
                  }
                  return Promise.resolve();
                }
                if (pathname.indexOf('finalize-detail') > -1 && typeof value != 'number') {
                  return Promise.reject(new Error('请输入宽度'));
                }
                if (typeof value == 'number' && value <= 0) {
                  return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
      fieldProps: {
        precision: 2,
        formatter: (value: any) => {
          return handleCutZero(String(value));
        },
      },
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      valueType: 'digit',
      width: 100,
      fieldProps: {
        precision: 2,
        formatter: (value: any) => {
          return handleCutZero(String(value));
        },
      },
      formItemProps: (form: any, config: any) => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (config.rowIndex === 2) {
                  if (typeof value == 'number' && value <= 0) {
                    return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                  }
                  if (value > 9999999) {
                    return Promise.reject(new Error(`输入内容不能超过9999999`));
                  }
                  return Promise.resolve();
                }
                if (pathname.indexOf('finalize-detail') > -1 && typeof value != 'number') {
                  return Promise.reject(new Error('请输入高度'));
                }
                if (typeof value == 'number' && value <= 0) {
                  return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      align: 'center',
      valueType: 'digit',
      width: 100,
      fieldProps: {
        precision: 2,
        formatter: (value: any) => {
          return handleCutZero(String(value));
        },
      },
      formItemProps: (form: any, config: any) => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (config.rowIndex === 2) {
                  if (typeof value == 'number' && value <= 0) {
                    return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                  }
                  if (value > 9999999) {
                    return Promise.reject(new Error(`输入内容不能超过9999999`));
                  }
                  return Promise.resolve();
                }
                if (pathname.indexOf('finalize-detail') > -1 && typeof value != 'number') {
                  return Promise.reject(new Error('请输入重量'));
                }
                if (typeof value == 'number' && value <= 0) {
                  return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
      valueType: 'digit',
      width: 100,
      editable: (text: any, record: any) => {
        return record.type === 3;
      },
      render: (text: any, record: any) => {
        return record.type === 3 ? text : '-';
      },
      formItemProps: (form: any, config: any) => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (config.rowIndex === 2) {
                  if (value > 9999999) {
                    return Promise.reject(new Error(`输入内容不能超过9999999`));
                  }
                  return Promise.resolve();
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
  ];
  const { onChange } = props;
  props.ref2.current = {
    innFormValidate: (resolve: any, reject: any) => {
      Promise.all([editForm.validateFields()])
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    },
    // 复制箱规
    setFieldAction: (data: any) => {
      const obj = {};
      dataSource.forEach((item: any) => {
        Object.entries(data).forEach((v: any) => {
          if (item.type == v[1].type) {
            obj[item.tempId] =
              v[1].isCopy === 0
                ? item
                : {
                    type: v[1].type,
                    length: v[1].length,
                    width: v[1].width,
                    high: v[1].high,
                    weight: v[1].weight,
                    pics: v[1].pics,
                  };
          }
        });
      });
      const dataSourceC = JSON.parse(JSON.stringify(dataSource));
      dataSourceC.forEach((v: any, index: number) => {
        dataSourceC[index] = { ...v, ...obj[v.tempId] };
      });
      setDataSource(dataSourceC);
      editForm.setFieldsValue(obj);
      onChange(dataSourceC);
    },
  };

  return (
    <EditableProTable
      bordered
      loading={false}
      className="p-table-0 customEditTable"
      showHeader={false}
      recordCreatorProps={false}
      columns={columns}
      rowKey="tempId"
      dataSource={dataSource}
      value={dataSource}
      editable={{
        type: 'multiple',
        editableKeys: props.disabled ? [] : editableKeys,
        onValuesChange: (record, recordList) => {
          onChange(recordList);
          setDataSource(recordList);
        },
        form: editForm,
      }}
    />
  );
};

export default ComEditTable;
