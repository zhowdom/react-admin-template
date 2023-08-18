import { useRef, useState } from 'react';
import { ProFormInstance, ProFormSelect } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { Space } from 'antd';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import * as api from '@/services/pages/stockManager';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { getCompanyList } from '@/services/pages/logisticsManageIn/company';

// 已发货 弹框
const SyncedModal: React.FC<{
  dataSource: any;
  reload: any;
  access: any;
  type: any; // 国内还是跨境
  title?: any;
}> = ({ dataSource, reload, type, title }) => {
  const syncedFormRef = useRef<ProFormInstance>(); // 修改预约信息
  // 设置表格数据
  const [tableData, setTableData] = useState<any[]>([]);
  const rulesRequired: any = { required: true, message: '必填' };
  // table配置
  const columns: any = [
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      width: 200,
      onCell: (record: any) => ({ rowSpan: record.orderSpan }),
    },
    {
      title: 'SKU',
      dataIndex: type == 'CN' ? 'stock_no' : 'shop_sku_code',
      width: 130,
      onCell: (record: any) => ({ rowSpan: record.orderSpan }),
    },
    {
      title: '未交货数量',
      dataIndex: 'undelivered_num',
      align: 'right',
      width: 100,
      onCell: (record: any) => ({ rowSpan: record.orderSpan }),
    },
    {
      title: '要求发货数量',
      dataIndex: 'orderSkuList',
      align: 'right',
      onCell: (record: any) => ({ rowSpan: record.orderSpan }),
      render: (_: any, record: any) => {
        return (
          <span>
            {record.specificationList
              ? record.specificationList.reduce(
                  (previousValue: any, currentValue: any) =>
                    previousValue + currentValue.pics * currentValue.num,
                  0,
                )
              : 0}
          </span>
        );
      },
    },
    {
      title: '箱规',
      dataIndex: 'specificationList',
      align: 'center',
      editable: false,
      render: (_: any, record: any) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Space
              key={_.tempId}
              style={{
                alignItems: 'center',
                justifyContent: 'space-around',
                textAlign: 'center',
                margin: '4px 0',
              }}
            >
              <div
                style={{
                  width: '150px',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}
              >
                {record.length && record.width && record.high ? (
                  <span>
                    {record.length}* {record.width} * {record.high}
                  </span>
                ) : (
                  <></>
                )}
              </div>
            </Space>
          </div>
        );
      },
    },
    {
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'right',
      width: 80,
    },
    {
      title: '箱数',
      dataIndex: 'snum',
      align: 'right',
      width: 80,
    },
  ];
  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  return (
    <ModalForm
      formRef={syncedFormRef}
      layout={'inline'}
      width={920}
      title={type == 'CN' ? '确认发货 - 国内' : '确认发货 - 跨境'}
      trigger={<a type={'link'}>{title || '已发货'}</a>}
      onFinish={async (values: any) => {
        const postData = { ...values, id: dataSource.id, orderSkuList: dataSource.orderSkuList };
        const res = await api.confirmShip(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('提交成功！', 'success');
          reload();
          return true;
        }
      }}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          const newData: any = [];
          dataSource?.orderSkuList?.forEach((order: any) => {
            if (order?.specificationList?.length) {
              // 过滤掉箱数为0的数据, v1.2.3
              const specificationList = order.specificationList.filter((item: any) => item.num)
              specificationList.forEach((item: any, index: number) => {
                const cur = {
                  ...dataSource,
                  ...order,
                  ...item,
                  orderSpan: index == 0 ? specificationList.length : 0,
                  snum: item.num,
                };
                newData.push(cur);
              });
            } else {
              const cur = {
                ...dataSource,
                ...order,
                orderSpan: 1,
                snum: null,
              };
              newData.push(cur);
            }
          });
          console.log(newData, 'newData');
          setTableData(newData);
        }
      }}
      modalProps={{
        destroyOnClose: true,
      }}
    >
      <ProTable
        rowKey="goods_sku_id"
        dateFormatter="string"
        dataSource={tableData}
        columns={columns}
        pagination={false}
        search={false}
        options={false}
        bordered
        size="small"
        className="p-table-0"
      />
      <div style={{ width: '100%', marginBottom: '20px' }} />
      {type == 'CN' ? (
        <ProFormSelect
          name="logistics_company"
          label="物流商"
          rules={[rulesRequired]}
          initialValue={dataSource?.logistics_company}
          fieldProps={{
            ...selectProps,
          }}
          style={{ width: '200px' }}
          showSearch
          debounceTime={300}
          request={async () => {
            const res: any = await getCompanyList({
              current_page: 1,
              page_size: 99999,
              business_scope: 'CN',
              status: '1',
            });
            return res?.data?.records?.map((v: any) => ({
              value: v.name,
              label: v.name,
            }));
          }}
        />
      ) : (
        <ProFormText
          name={'logistics_company'}
          label={'物流商'}
          rules={[rulesRequired]}
          initialValue={dataSource?.logistics_company}
        />
      )}
      <ProFormText
        name={'logistics_order_no'}
        label={'运单号'}
        rules={[rulesRequired]}
        initialValue={dataSource?.logistics_order_no}
      />
    </ModalForm>
  );
};

export default SyncedModal;
