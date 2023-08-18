import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Button, Col, Popconfirm, Row } from 'antd';
import { useRef, useState } from 'react';
import { pubAlert, pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import PubWeekRender from '@/components/PubWeekRender';
import { changePrincipal } from '@/services/pages/logisticsPlanIn';
import { principalList } from '@/services/pages/logisticsManageIn/lsp';

export default (props: any) => {
  const { selectedRowDataSet, selectedRowKeysSet, dataSource, disabled, dicList, reload } = props;
  const formRef = useRef<ProFormInstance>();
  const [tableData, setTableData] = useState<any>([]);
  const user = JSON.parse(localStorage.getItem('userInfo') as string)?.user;
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
  // 移出
  const deleteAction = (row: any) => {
    if (tableData.length == 1) return pubAlert('至少保留一条数据！');
    const dataC = dataSource.filter((v: any) => v.order_id != row.order_id);
    selectedRowDataSet(dataC);
    selectedRowKeysSet(dataC.map((v: any) => v.order_id));
    setTableData(dataC);
  };
  // 提交
  const handleSubmit = async (postData: any) => {
    const res: any = await changePrincipal(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return false;
    } else {
      pubMsg('操作成功', 'success');
      selectedRowKeysSet([]);
      selectedRowDataSet([]);
      reload();
      return true;
    }
  };
  // 获取负责人
  const pubGetUserListAction = async (key: any): Promise<any> => {
    return new Promise(async (resolve) => {
      const res = await principalList({
        key_word: key.keyWords?.replace(/(^\s*)/g, '') || '',
      });
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
        resolve([]);
        return;
      }
      const newArray = res?.data.map((v: any) => {
        return {
          ...v,
          value: `${v.user_id}--${v.name}`,
          label: `${v.name}(${v.account})`,
          name: v.name,
        };
      });

      if (!newArray.filter((v: any) => v.user_id == user.id).length) {
        newArray.push({
          user_id: user.id,
          value: `${user.id}--${user.name}`,
          label: `${user.name}(${user.account})`,
          name: user.name,
        });
      }
      resolve(newArray);
    });
  };
  return (
    <ModalForm
      title="物流负责人认领"
      trigger={
        <Button type="primary" ghost disabled={disabled} size="small">
          物流负责人认领
        </Button>
      }
      labelAlign="right"
      layout="horizontal"
      formRef={formRef}
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
        okText: '确定认领',
      }}
      width={'90%'}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          principal_id: values.principal.split('--')?.[0],
          principal_name: values.principal.split('--')?.[1],
          order_no: dataSource.map((v: any) => v.order_no) ?? [],
        };
        return handleSubmit(postData);
      }}
      onOpenChange={(visible: boolean) => {
        if (!visible) {
          setTableData([]);
        } else {
          setTableData(dataSource);
        }
      }}
    >
      <ProTable
        options={false}
        bordered
        dataSource={tableData}
        size="small"
        search={false}
        pagination={false}
        headerTitle={
          <span style={{ color: 'red', fontSize: '12px' }}>
            说明：已有物流负责人，确定之后，将改成最新认领人
          </span>
        }
        style={{ marginTop: '-20px' }}
        scroll={{ x: 1200 }}
        columns={[
          {
            title: '发货计划编号',
            dataIndex: 'delivery_plan_id',
            align: 'center',
            width: 150,
            render: (_: any, record: any) => record?.planDetailList?.[0]?.delivery_plan_id ?? '-',
          },
          {
            title: 'PMC负责人',
            dataIndex: 'pmc_name',
            align: 'center',
            width: 100,
            hideInSearch: true,
            render: (_: any, record: any) => record?.planDetailList?.[0]?.pmc_name ?? '-',
          },
          {
            title: '计划出货周期',
            dataIndex: 'cycle_time',
            align: 'center',
            width: 110,
            render: (_: any, record: any) => (
              <PubWeekRender
                option={{
                  cycle_time: record?.planDetailList?.[0]?.cycle_time,
                  begin: record?.planDetailList?.[0]?.shipment_begin_cycle_time,
                  end: record?.planDetailList?.[0]?.shipment_end_cycle_time,
                }}
              />
            ),
          },
          {
            title: '计划发货数量(总)',
            dataIndex: 'delivery_plan_current_num',
            align: 'center',
            width: 110,
          },
          {
            title: '未建入库单数量',
            dataIndex: 'no_generate_warehousing_order_num',
            align: 'center',
            width: 110,
            render: (_: any, record: any) => record?.planDetailList?.[0]?.no_generate_warehousing_order_num ?? '-',
          },
          {
            title: '入库单号',
            dataIndex: 'order_no',
            align: 'center',
            width: 100,
          },
          {
            title: '入库单状态',
            dataIndex: 'approval_status',
            align: 'center',
            render: (_: any, record: any) => {
              return pubFilter(dicList?.WAREHOUSING_ORDER_IN_STATUS, record.approval_status) || '-';
            },
            width: 90,
          },
          {
            title: '采购负责人',
            dataIndex: 'purchase_name',
            align: 'center',
            width: 90,
          },
          {
            title: '店铺',
            dataIndex: 'shop_name',
            align: 'center',
            width: 100,
          },
          {
            title: '商品名称',
            dataIndex: 'sku_name',
            align: 'center',
            width: 200,
          },
          {
            title: 'SKU',
            dataIndex: 'shop_sku_code',
            align: 'center',
            width: 100,
          },
          {
            title: '物流负责人',
            dataIndex: 'principal_name',
            align: 'center',
            width: 90,
          },
          {
            title: '操作',
            key: 'option',
            width: 80,
            align: 'center',
            valueType: 'option',
            render: (_, row: any) => (
              <Popconfirm
                key="delete"
                title="确定移出吗?"
                onConfirm={async () => deleteAction(row)}
                okText="确定"
                cancelText="取消"
              >
                <a>移出</a>
              </Popconfirm>
            ),
          },
        ]}
      />
      <Row>
        <Col span={6}>
          <ProFormSelect
            name="principal"
            label="物流负责人"
            fieldProps={selectProps}
            request={pubGetUserListAction}
            initialValue={`${user.id}--${user.name}`}
            placeholder="请选择物流负责人"
            rules={[
              { required: true, message: '请选择物流负责人' },
              ({}) => ({
                validator(_, value) {
                  if (JSON.stringify(value) === '{}') {
                    return Promise.reject(new Error('请选择物流负责人'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          />
        </Col>
      </Row>
    </ModalForm>
  );
};
