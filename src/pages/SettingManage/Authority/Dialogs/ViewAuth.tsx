import { Modal, Button, Card, Table } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useEffect, useMemo, useState } from 'react';
import { configPage } from '@/services/pages/settinsPermission';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import '../style.less';
/*全部 - 产品线*/
const ProductLineTableAll: React.FC<{
  dataSource: any[];
  onSelect: any;
}> = ({ dataSource, onSelect }) => {
  const [dataSourceFormat, dataSourceFormatSet] = useState(dataSource);
  useEffect(() => dataSourceFormatSet(dataSource), [dataSource]);
  return (
    <Table
      bordered
      dataSource={dataSourceFormat}
      rowKey={'value'}
      size={'small'}
      pagination={false}
      showHeader={false}
      columns={[
        {
          title: '产品线名称',
          width: 120,
          dataIndex: 'label',
        },
        {
          title: '操作',
          width: 200,
          dataIndex: 'option',
          align: 'center',
          render: (_, record: any) => (
            <Button ghost type={'primary'} size={'small'} onClick={() => onSelect(record)}>
              查看
            </Button>
          ),
        },
      ]}
    />
  );
};

const ViewAuth: React.FC<{
  title?: any;
  productLines: any[];
}> = ({ productLines = [], title }) => {
  const [open, openSet] = useState(false);
  const [allProductLine, allProductLineSet] = useState<{ CN: any[]; IN: any[] }>({
    CN: [],
    IN: [],
  });
  const [users, usersSet] = useState<Record<string, any>[]>();
  const [selectedProductLine, selectedProductLineSet] = useState<Record<string, any>>();

  useEffect(() => {
    allProductLineSet({ CN: productLines[1]?.children, IN: productLines[0]?.children });
  }, [productLines]);

  const columnUser: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '姓名',
        dataIndex: 'name',
        width: 120,
      },
      {
        title: '职位',
        dataIndex: 'position',
        sorter: true,
        search: false,
      },
      {
        title: '员工账号',
        dataIndex: 'account',
        search: false,
      },
      {
        title: '产品线名称',
        dataIndex: 'vendor_group_name',
        search: false,
        render: () => selectedProductLine?.name,
      },
    ],
    [selectedProductLine],
  );
  const onSelect = async (record: any) => {
    selectedProductLineSet(record);
    const res = await configPage({
      pageIndex: 1,
      pageSize: 9999,
      vendor_group_id: record.id,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    usersSet(res?.data?.records || []);
  };
  return (
    <>
      <Button type={'primary'} onClick={() => openSet(true)}>
        查看产品线员工
      </Button>
      <Modal
        title={title || `查看产品线员工`}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ paddingTop: 8 }}
        className={'full-height-body'}
        open={open}
        onCancel={() => {
          openSet(false);
        }}
        destroyOnClose
        footer={null}
      >
        <Card title={'全部产品线'} size={'small'}>
          <Table
            rowKey={'id'}
            style={{ minHeight: 250 }}
            scroll={{ y: 200 }}
            size={'small'}
            pagination={false}
            columns={[
              {
                title: '产品线名称',
                width: 120,
                dataIndex: 'business_scope',
                className: 'text-bold',
              },
              {
                title: '操作',
                width: 200,
                dataIndex: 'option',
                align: 'center',
              },
            ]}
            dataSource={[
              {
                id: 'CN',
                business_scope: '国内',
              },
              {
                id: 'IN',
                business_scope: '跨境',
              },
            ]}
            expandable={{
              expandRowByClick: true,
              indentSize: 20,
              expandedRowRender: (record: any) => (
                <ProductLineTableAll
                  onSelect={onSelect}
                  dataSource={
                    record.business_scope.includes('国内') ? allProductLine.CN : allProductLine.IN
                  }
                />
              ),
            }}
          />
        </Card>
        <Card
          title={
            selectedProductLine
              ? `${selectedProductLine.business_scope == 'CN' ? '国内' : '跨境'} - ${
                  selectedProductLine?.name || ''
                }(已授权用户数: ${users?.length || ''})`
              : '请选择需要查看的产品线'
          }
          size={'small'}
        >
          <ProTable
            rowKey={'id'}
            columns={columnUser}
            style={{ minHeight: 360 }}
            cardProps={{ bodyStyle: { padding: 0 } }}
            scroll={{ y: 210 }}
            showSorterTooltip={false}
            tableAlertRender={false}
            options={false}
            size={'small'}
            className={'no-sticky-pagination'}
            search={{
              className: 'light-search-form',
              span: 12,
              labelWidth: 76,
              defaultCollapsed: true,
            }}
            pagination={{ defaultPageSize: 50 }}
            params={{ timeStamp: Date.now() }}
            request={async (params: any) => {
              if (params?.name) {
                const data = users?.filter((item) =>
                  item.name?.toLowerCase().includes(params.name?.toLowerCase()),
                );
                return {
                  success: true,
                  data,
                };
              }
              if (params?.account) {
                const data = users?.filter((item) =>
                  item.account?.toLowerCase().includes(params.account?.toLowerCase()),
                );
                return {
                  success: true,
                  data,
                };
              }
              return {
                success: true,
                data: users,
              };
            }}
          />
        </Card>
      </Modal>
    </>
  );
};
export default ViewAuth;
