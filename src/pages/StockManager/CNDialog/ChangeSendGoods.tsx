import { Button, Form, message, Space, Select } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { batchUpdateLogisticsOrderNo } from '@/services/pages/storageManage';
import { useRef, useState } from 'react';
import SendGoodItemTable from './SendGoodItemTable';
import { getCompanyList } from '@/services/pages/logisticsManageIn/company';

export default (props: any) => {
  const [dataSource, setDataSource] = useState<any>();
  const [editIds, setEditIds] = useState<any>();
  const formRef = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [loading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [selectOptions, setSelectOptions] = useState<any>([]);

  // 提交
  const updateByIdActionA = (data: any) => {
    return formRef?.current
      ?.validateFields()
      .then(async () => {
        setBtnLoading(true);
        const res = await batchUpdateLogisticsOrderNo(data);
        if (res?.code != pubConfig.sCode) {
          setBtnLoading(false);
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功', 'success');
          props?.reload()
          setBtnLoading(false);
          return true;
        }
      })
      .catch((e) => {
        console.log(e);
        setBtnLoading(false);
        message.warning('请检查表单正确性');
        editForm.validateFields();
      });
  };
  // 获取物流商 下拉数据
  const getOptions = async () => {
    const res: any = await getCompanyList({
      current_page: 1,
      page_size: 99999,
      business_scope: 'CN',
      status: '1',
    });
    const newD = res?.data?.records?.map((v: any) => ({
      value: v.name,
      label: v.name,
    }));
    setSelectOptions(newD)
  };

  // 改变类型时
  const changeSelect = async (type?: any) => {
    console.log(type);
    const newForm = {}
    dataSource.forEach((v: any) => {
      const aa = {
        ...v,
        logistics_company: type,
      }
      newForm[v.id] = aa
    })
    editForm.setFieldsValue(newForm);
  };
  const columns: any = [
    {
      title: '入库单号',
      align: 'center',
      dataIndex: 'order_no',
      editable: false,
      width: 130,
    },
    {
      title: '平台入库单号',
      align: 'center',
      dataIndex: 'platform_warehousing_order_no',
      editable: false,
      width: 130,
    },
    {
      title: '平台',
      align: 'center',
      dataIndex: 'platform_name',
      editable: false,
      width: 90,
    },

    {
      title: '商品名称',
      dataIndex: 'sku_name',
      editable: false,
      className: 'p-table-inTable noBorder',
      width: 160,
      align: 'center',
      onCell: () => ({ colSpan: 3, style: { padding: 0 } }),
      render: (_, row: any) => {
        return (
          <SendGoodItemTable
            value={row.orderSkuList}
          />
        );
      },
    },
    {
      title: 'SKU',
      align: 'center',
      dataIndex: 'stock_no',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: 120,
      editable: false,
    },

    {
      title: '发货数量',
      dataIndex: 'numTotal',
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: 100,
    },
    {
      title: '供应商',
      align: 'center',
      dataIndex: 'vendor_name',
      editable: false,
      render: (_: any, record: any) => (record.vendor_name ? `${record.vendor_name}(${record.vendor_code})` : ''),
    },
    {
      title: '工厂所在地（省市）',
      align: 'center',
      dataIndex: 'vendor_province_city',
      editable: false,
    },
    {
      title: '收货区域',
      align: 'center',
      dataIndex: 'warehouse_area',
      editable: false,
      width: 120,
    },
    {
      title: '收货仓库',
      align: 'center',
      dataIndex: 'warehouse_name',
      editable: false,
      width: 110,
    },
    {
      title: (
        <>
          <span
            style={{
              color: 'red',
              display: 'inline-block',
            }}
          >
            *
          </span>
          <span>物流商</span>
          <div>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择"
              options={selectOptions}
              onChange={(v: any) => changeSelect(v)}
            />
          </div>
        </>
      ),
      width: 150,
      align: 'center',
      dataIndex: 'logistics_company',
      valueType: 'select',
      fixed: 'right',
      fieldProps: {
        options: selectOptions,
      },
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '请选择物流商' }],
        };
      },
    },
    {
      title: '运单号',
      align: 'center',
      dataIndex: 'logistics_order_no',
      width: 150,
      fixed: 'right',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '请输入运单号' }],
        };
      },

    },
  ]
  return (
    <ModalForm
      formRef={formRef}
      title={'批量操作已发货'}
      trigger={props.trigger}
      layout="horizontal"
      className="deliDetail"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onOpenChange={(val: boolean) => {
        if (!val) {
          setDataSource([]);
          setEditIds([]);
        } else {
          console.log(props?.selectedRowData)
          setDataSource(props?.selectedRowData);
          setEditIds(props?.selectedRowKeys);
          getOptions();
        }
      }}
      onFinish={async (values: any) => {
        return Promise.all([editForm.validateFields()])
          .then(() => {
            // console.log(values.numDetails)
            return updateByIdActionA(values.numDetails.map((v: any) => ({
              id: v.id,
              logistics_company: v.logistics_company,
              logistics_order_no: v.logistics_order_no,
            })))
          })
          .catch(() => { });
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        message.warning('请检查表单正确性');
        return true;
      }}
      width={1000}
      submitter={{
        render: (data: any, doms: any) => (
          <Space>
            <Button
              loading={btnLoading}
              type="primary"
              key="save"
              onClick={async () => {
                data.form?.submit?.();
              }}
            >
              确定发货
            </Button>
            {doms[0]}
          </Space>
        ),
      }}
    >
      <Form.Item
        label=""
        name="numDetails"
        rules={[
          {
            validator: async (rule, value) => {
              if (
                value?.filter((v: any) => !v.logistics_company)?.length
              ) {
                return Promise.reject(new Error('请选择物流商'));
              }
              if (
                value?.filter((v: any) => !v.logistics_order_no)?.length
              ) {
                return Promise.reject(new Error('请输入运单号'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <>
          <EditableProTable
            loading={loading}
            className={'p-table-0'}
            value={dataSource}
            rowKey="id"
            search={false}
            pagination={false}
            options={false}
            scroll={{ x: 1500 }}
            size="small"
            style={{ minWidth: '400px' }}
            recordCreatorProps={false}
            onChange={(dd) => {
              console.log(55)
              setDataSource(dd)
            }}
            editable={{
              type: 'multiple',
              // editableKeys: true ? [] : editIds,
              editableKeys: editIds,
              form: editForm,
              onValuesChange: (r, recordList) => {
                console.log(444)
                formRef.current?.setFieldsValue({
                  numDetails: recordList,
                });
                setDataSource(recordList);
              },
            }}
            bordered={true}
            columns={columns}
          />
        </>
      </Form.Item>
    </ModalForm>
  );
};
