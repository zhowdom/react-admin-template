import { useEffect, useRef, useState } from 'react';
import { EditableProTable } from '@ant-design/pro-table';
import { Button, Form } from 'antd';
import Popconfirm from 'antd/es/popconfirm';
import TransferModal from './TransferModal';

const EditZTTable = (props: any) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(props.editIds || []);
  const [dataSource, setDataSource] = useState<any>();
  const { name } = props;
  const formItemLayout1 = {
    labelCol: { span: 1.5 },
    wrapperCol: { span: 23 },
  };
  // 删除SKU
  const delSku = async (record: any) => {
    const newData = props.formRef?.current?.getFieldsValue();
    console.log(newData, record);
    const data = newData?.[`${name}`]?.filter((item: any) => item.id !== record.id);
    setDataSource(data);
    props.formRef.current.setFieldsValue({
      [`${name}`]: data || [],
    });
  };
  // 添加SKU弹窗实例
  const choseSkuModel = useRef();
  // SKU弹窗
  const choseSkuModelOpen: any = () => {
    const data: any = choseSkuModel?.current;
    const ids = props?.formRef?.current
      ?.getFieldValue([`${name}`])
      ?.map((v: any) => v.goods_sku_id);
    data.open(ids);
  };
  // SKU弹窗关闭
  const skuModalClose = (data: any, rows: any) => {
    if (!data) return;
    if (rows?.length) {
      const cur = JSON.parse(JSON.stringify(rows));
      props.formRef.current.setFieldsValue({
        [`${name}`]: cur,
      });
    } else {
      props.formRef.current.setFieldsValue({
        [`${name}`]: [],
      });
    }

    // setState((pre: any) => {
    //   return {
    //     ...pre,
    //     chosedIds: data,
    //   };
    // });
  };
  useEffect(() => {
    setEditableRowKeys(props.editIds);
  }, [props.editIds]);
  const columns: any = [
    {
      title: '图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
      editable: false,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      editable: false,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
      editable: false,
    },

    {
      title: '数量',
      dataIndex: 'quantity',
      align: 'center',
      valueType: 'digit',
      formItemProps: {
        rules: [{ required: true, message: '请输入数量' }],
      },
    },
    {
      title: '采购单价',
      dataIndex: 'price',
      align: 'center',
      editable: false,
    },
    {
      title: '单位',
      key: 'uom',
      dataIndex: 'uom',
      editable: false,
      align: 'center',
      render: (_: any, record: any) => {
        const item = props.dicList.GOODS_UOM;
        const key = record.uom;
        return [<span key="uom">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      editable: false,
      align: 'center',
      hideInTable: props.disabled,
      render: (text: any, record: any) => [
        <Popconfirm
          key="delete"
          title="确认删除"
          onConfirm={() => {
            delSku(record);
          }}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <Form.Item
      {...formItemLayout1}
      rules={[{ required: !props.disabled, message: '请添加产品SKU' }]}
      label="款式: "
      name={name}
    >
      <EditableProTable
        className="p-table-0"
        columns={columns}
        rowKey="goods_sku_id"
        value={dataSource}
        tableStyle={{ marginTop: '0' }}
        recordCreatorProps={false}
        headerTitle={
          !props.disabled
            ? [
                <Button
                  type="primary"
                  key="save"
                  onClick={() => {
                    choseSkuModelOpen();
                  }}
                >
                  全部款式
                </Button>,
                <TransferModal
                  formRef={props.formRef}
                  choseSkuModel={choseSkuModel}
                  handleClose={skuModalClose}
                  key="dialog"
                />,
              ]
            : ''
        }
        onChange={setDataSource}
        editable={{
          type: 'multiple',
          editableKeys: props.disabled ? [] : editableKeys,
          actionRender: (row, config, defaultDoms) => {
            return [defaultDoms.delete];
          },
          form: props.form,
          onValuesChange: (record, recordList) => {
            props.formRef.current.setFieldsValue({
              [`${name}`]: recordList,
            });
            setDataSource(recordList);
          },
          onChange: setEditableRowKeys,
        }}
        bordered={true}
      />
    </Form.Item>
  );
};
export default EditZTTable;
