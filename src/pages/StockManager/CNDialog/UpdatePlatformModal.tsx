import { useRef, useState } from 'react';
import { ModalForm, ProFormDatePicker, ProFormDigit, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Button, Space, Alert } from 'antd';
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import * as api from '@/services/pages/stockManager';
import { pubConfig, pubMsg, pubModal, pubAlert } from '@/utils/pubConfig';
import { queryPlatformWarehousingYunCang } from '@/services/pages/stockManager';
// 手动入库
const UpdatePlatformModal: React.FC<{
  dataSource: any;
  tableKeySet: any;
  reload: any;
  pId?: any;
}> = ({ dataSource, tableKeySet, reload, pId }) => {
  const [btnLoading, setBtnLoading] = useState(false);
  const [yunCloudDisabled, setYunCloudDisabled] = useState<boolean | string>(false);
  const updatePlatformFormRef = useRef<ProFormInstance>(); // 手动入库
  const rulesRequired: any = { required: true, message: '必填' };
  const InnerTable: React.FC<{ orderSkuList: any[] }> = ({ orderSkuList }) => {
    const columns: any[] = [
      {
        title: '商品名称',
        dataIndex: 'sku_name',
        align: 'center',
        width: 120,
      },
      {
        title: 'SKU',
        dataIndex: 'stock_no',
        align: 'center',
        width: 120,
        render: (_: any, record: any, index: number) => (
          <div>
            {_}
            {
              <ProFormText
                initialValue={record.order_id}
                name={['data', index, 'id']}
                hidden
                noStyle
              />
            }
            {
              <ProFormText
                initialValue={record.goods_sku_id}
                name={['data', index, 'goods_sku_id']}
                hidden
                noStyle
              />
            }
          </div>
        ),
      },
      {
        title: '每箱数量',
        dataIndex: 'pics',
        align: 'center',
        width: 120,
        render: (_: any, record: any) => {
          return record.specificationList.map((item: any, index: number) => (
            <div key={index}>{item.pics}</div>
          ));
        },
      },
      {
        title: '箱数',
        dataIndex: 'num',
        align: 'center',
        width: 120,
        render: (_: any, record: any) => {
          return record.specificationList.map((item: any, index: number) => (
            <div key={index}>{item.num}</div>
          ));
        },
      },
      {
        title: '发货数量',
        dataIndex: 'orderSkuList',
        align: 'center',
        width: 120,
        render: (_: any, record: any) => {
          return (
            <span>
              {record.specificationList.reduce(
                (previousValue: any, currentValue: any) =>
                  previousValue + currentValue.pics * currentValue.num,
                0,
              )}
            </span>
          );
        },
      },
      {
        title: '平台入库数量',
        dataIndex: 'warehousing_num',
        align: 'center',
        className: 'editTableFormItem',
        width: 140,
        render: (_: any, record: any, index: number) => {
          const max = record.specificationList.reduce(
            (previousValue: any, currentValue: any) =>
              previousValue + currentValue.pics * currentValue.num,
            0,
          );
          return (
            <ProFormDigit
              name={['data', index, 'warehousing_num']}
              width={'xs'}
              readonly={
                pId == '1552846034395881473' &&
                dataSource.order_type == 1 &&
                dataSource.platform_warehousing_type !== 'QIMEN'
              }
              rules={[
                () => ({
                  validator(a, value) {
                    if (!value && value != 0) {
                      return Promise.reject(new Error('请输入平台入库数量'));
                    }
                    if (value > max) {
                      return Promise.reject(new Error('不能大于发货数量'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              fieldProps={{ precision: 0 }}
              placeholder={'入库数量'}
            />
          );
        },
      },
      {
        title: '平台入库时间',
        dataIndex: 'warehousing_time',
        align: 'center',
        className: 'editTableFormItem',
        width: 140,
        render: (_: any, record: any, index: number) => (
          <ProFormDatePicker
            name={['data', index, 'warehousing_time']}
            width={120}
            readonly={
              pId == '1552846034395881473' &&
              dataSource.order_type == 1 &&
              dataSource.platform_warehousing_type !== 'QIMEN'
            }
            rules={[rulesRequired]}
            placeholder={'入库时间'}
            initialValue={moment()}
          />
        ),
      },
    ];
    return (
      <div className="p-table-inTable-content">
        <ProTable
          columns={columns}
          rowKey={'order_id'}
          bordered
          className={'p-table-0'}
          dataSource={orderSkuList}
          showHeader={false}
          pagination={false}
          options={false}
          cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
          style={{ wordBreak: 'break-all' }}
          search={false}
          toolBarRender={false}
        />
      </div>
    );
  };
  const columns: any[] = [
    {
      title: '计划编号',
      dataIndex: 'delivery_plan_no',
      align: 'center',
      width: 120,
      render: (_: any, record: any) => record.delivery_plan_nos || record.delivery_plan_no,
    },
    {
      title: '入库单号',
      dataIndex: 'order_no',
      align: 'center',
      width: 120,
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      align: 'center',
      width: 120,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      align: 'center',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      className: 'p-table-inTable noBorder',
      onCell: () => ({ colSpan: 7, style: { padding: 0 } }),
      render: (_: any, record: any) => <InnerTable orderSkuList={record.orderSkuList} />,
    },
    {
      title: 'SKU',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '每箱数量',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '箱数',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '发货数量',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 120,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '平台入库数量',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 140,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '平台入库时间',
      dataIndex: 'orderSkuList',
      align: 'center',
      width: 140,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
  ];
  const getYunCloudDetail = async () => {
    setYunCloudDisabled(true);
    const res = await queryPlatformWarehousingYunCang({ id: dataSource.id });
    if (res?.code != pubConfig.sCode) {
      setYunCloudDisabled(res?.message);
      pubMsg(res?.message);
      return;
    }
    if (!res.data.length) {
      pubAlert('获取云仓实际入库数量异常！');
      setYunCloudDisabled('获取云仓实际入库数量异常!');
      return;
    }
    const newData = JSON.parse(JSON.stringify(dataSource));
    const formRef = updatePlatformFormRef?.current?.getFieldsValue();
    newData.orderSkuList.forEach((element: any, index: number) => {
      const newItem = res.data.find((k: any) => k.goods_sku_id == element.goods_sku_id);
      console.log(newItem);
      if (newItem) {
        formRef.data[index].warehousing_num = newItem.warehousing_num;
        formRef.data[index].warehousing_time = newItem.warehousing_time;
      }
    });
    updatePlatformFormRef?.current?.setFieldsValue(formRef);
    setYunCloudDisabled(false);
  };
  return (
    <ModalForm
      title="手动入库"
      formRef={updatePlatformFormRef}
      width={'80%'}
      trigger={<a type={'link'}>{'手动入库'}</a>}
      submitter={{
        render: (data: any, doms: any) => (
          <Space>
            {doms[0]}
            <Button
              loading={btnLoading}
              disabled={!!yunCloudDisabled}
              type="primary"
              key="save"
              onClick={async () => {
                updatePlatformFormRef?.current?.submit?.();
              }}
            >
              {btnLoading ? '提交中...' : yunCloudDisabled == true ? '获取云仓数据中...' : '提交'}
            </Button>
          </Space>
        ),
      }}
      onFinish={async (values: any) => {
        pubModal('确保所填写信息的准确性')
          .then(async () => {
            setBtnLoading(true);
            const res = await api.updatePlatformsNum(values?.data || []);
            if (res.code == pubConfig.sCode) {
              pubMsg(res?.message, 'success');
              tableKeySet(Date.now());
              if (typeof reload === 'function') reload();
            } else {
              pubMsg(`提交失败: ${res.message}`);
              setBtnLoading(false);
            }
            setBtnLoading(false);
          })
          .catch(() => {
            console.log('点击了取消');
          });
      }}
      onVisibleChange={async (visible: boolean) => {
        if (!visible) {
          updatePlatformFormRef?.current?.resetFields();
        } else {
          // 云仓 && 非'奇门云仓'类型 && 非配件入库单 ,数量和日期从接口得，不可编辑
          if (
            pId == '1552846034395881473' &&
            dataSource.order_type == 1 &&
            dataSource.platform_warehousing_type !== 'QIMEN'
          ) {
            getYunCloudDetail();
          }
        }
      }}
    >
      {typeof yunCloudDisabled == 'string' && yunCloudDisabled ? (
        <Alert type={'error'} className={'mb-1'} message={yunCloudDisabled} />
      ) : null}
      <ProTable
        size={'small'}
        columns={columns}
        dataSource={[dataSource]}
        pagination={false}
        options={false}
        search={false}
        toolBarRender={false}
        rowKey={'id'}
        bordered
        scroll={{ x: 1600 }}
      />
    </ModalForm>
  );
};
export default UpdatePlatformModal;
