
import { useState, useRef, forwardRef } from 'react';
import { Form, Modal, message, Spin } from 'antd';
import { EditableProTable, ProFormInstance } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { singleOrBatchSetStore } from '@/services/pages/shipment/warehousecN';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

export default forwardRef((props: any, ref: any) => {
  const { common } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<any>([]);
  const [editIds, setEditIds] = useState<any>();
  const [editForm] = Form.useForm();
  const formRef = useRef<ProFormInstance>();
  const showModal = () => {
    setIsModalOpen(true);
    const newData = JSON.parse(JSON.stringify(props?.selectedRowArray)).map((v: any) => ({
      ...v,
      YUNCANG_MAP: props.YUNCANG_MAP || [],
      QIMEN_YUNCANG_MAP: props.QIMEN_YUNCANG_MAP || [],
    }))

    formRef.current?.setFieldsValue({
      goodsSkuChangeList: newData,
    });
    setTableData(newData)
    setEditIds(newData.map((v: any) => v.id))
  };
  const handleOk = () => {
    formRef?.current?.submit();

  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  ref.current = {
    a: 12,
    showModal,
  }

  const columns: any = [
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
      title: 'ERP编码',
      dataIndex: 'erp_sku',
      editable: false,
    },
    {
      title: '发货方式选择',
      dataIndex: 'send_kind',
      align: 'center',
      width: 140,
      valueType: 'select',
      valueEnum: common?.dicList?.SYS_SEND_KIND,
      fieldProps: (text: any, record: any) => {
        return {
          showSearch: true,
          onChange: (r: any) => {
            const newFormItem = {};
            const newItem = record?.entry;
            newItem.send_kind = r;
            newItem.cloud_warehouse_id = '';
            newItem.return_cloud_warehouse_id = '';
            newFormItem[record.entry?.id] = newItem;
            editForm.setFieldsValue(newFormItem);
          }
        };
      },
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '请选择发货方式' }],
        };
      },
    },
    {
      title: '发货仓选择',
      dataIndex: 'cloud_warehouse_id',
      align: 'center',
      width: 210,
      valueType: 'select',
      editable: (_: any, record: any) => record.send_kind == 5 || record.send_kind == 6,
      fieldProps: (_: any, record: any) => {
        return {
          showSearch: true,
          options: record.entry?.send_kind == 5 ? record.entry?.YUNCANG_MAP : (record.entry?.send_kind == 6 ? record.entry?.QIMEN_YUNCANG_MAP : []),
        }
      },
      formItemProps: (_: any, record: any) => {
        return {
          options: record.matchedStoreList,
          rules: [{ required: true, message: '请选择发货仓' }],
        };
      },
      render: () => '-',
    },
    {
      title: '退货仓选择',
      dataIndex: 'return_cloud_warehouse_id',
      align: 'center',
      width: 210,
      valueType: 'select',
      editable: (_: any, record: any) => record.send_kind == 5 || record.send_kind == 6,
      fieldProps: (_: any, record: any) => {
        return {
          showSearch: true,
          options: record.entry?.send_kind == 5 ? record.entry?.YUNCANG_MAP : (record.entry?.send_kind == 6 ? record.entry?.QIMEN_YUNCANG_MAP : [])
        }
      },
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '请选择退货仓' }],
        };
      },
      render: () => '-',
    },
  ];

  // 提交
  const saveSubmit = async (val: any) => {
    formRef?.current
      ?.validateFields()
      .then(async () => {
        const newD = val?.goodsSkuChangeList.map((v: any) => ({
          sku_id: v.id,
          send_kind: v.send_kind,
          cloud_warehouse_id: (v.send_kind == 5 || v.send_kind == 6) ? v.cloud_warehouse_id : '',
          return_cloud_warehouse_id: (v.send_kind == 5 || v.send_kind == 6) ? v.return_cloud_warehouse_id : '',
        }))
        setLoading(true);
        const res = await singleOrBatchSetStore({ goodsSkuChangeList: newD });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功！', 'success');
          props.reload()
          setIsModalOpen(false);
        }
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        message.warning('请检查表单正确性');
        editForm.validateFields();
      });
  };

  // start
  return (
    <Modal title="批量设置发货仓" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width="900px"
      maskClosable={false} destroyOnClose={true} >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values: any) => {
            return Promise.all([editForm.validateFields()])
              .then(() => {
                return saveSubmit(values);
              })
              .catch(() => { });
          }}
          onFinishFailed={() => {
            editForm.validateFields();
            message.warning('请检查表单正确性');
            return true;
          }}
          labelAlign="right"
          labelWrap
          submitter={false}
          layout="horizontal"
        >
          <Form.Item
            label=""
            name="goodsSkuChangeList"
            initialValue={tableData}
          >
            <EditableProTable
              loading={loading}
              className={'p-table-0'}
              rowKey="id"
              search={false}
              pagination={false}
              options={false}
              size="small"
              style={{ minWidth: '400px' }}
              recordCreatorProps={false}
              editable={{
                type: 'multiple',
                // editableKeys: true ? [] : editIds,
                editableKeys: editIds,
                form: editForm,
                onValuesChange: (r, recordList) => {
                  // const newData = recordList.map((v: any) => ({
                  //   ...v,
                  //   cloud_warehouse_id: '',
                  //   return_cloud_warehouse_id: '',
                  // }))
                  formRef.current?.setFieldsValue({
                    goodsSkuChangeList: recordList,
                  });
                  setTableData(recordList);
                },
              }}
              bordered={true}
              columns={columns}
            />
          </Form.Item>
        </ProForm>
      </Spin>
    </Modal>
  )
})
