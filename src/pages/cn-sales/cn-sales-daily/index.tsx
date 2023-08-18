import React, { useRef, useState } from 'react';
import { Space, Pagination } from 'antd';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import * as api from '@/services/pages/cn-sales';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { flatData } from '@/utils/filter';
import ImportBtnDirectory from '@/components/ImportBtnDirectory';
import { getUuid, pubGetStoreList, pubProLineList } from '@/utils/pubConfirm';
import NewDatePicker from '@/components/PubForm/NewDatePicker';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import { useAccess } from 'umi';
// 京东自营日销量
const Page: React.FC<any> = () => {
  const access = useAccess();
  const [pagination, paginationSet] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const formRef: any = useRef<ProFormInstance>();
  const actionRef: any = useRef<ActionType>();
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '产品线',
      dataIndex: 'categoryId',
      align: 'center',
      valueType: 'select',
      width: 90,
      request: () => pubProLineList({ business_scope: 'CN' }),
      fieldProps: { showSearch: true },
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '商品名称',
      dataIndex: 'skuName',
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: 'SKU(库存编号)',
      dataIndex: 'stockNo',
      width: 130,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '店铺',
      dataIndex: 'shopId',
      request: async () => {
        const res = await pubGetStoreList({ business_scope: 'CN', platform_code: 'JD_OPERATE' });
        return res?.filter((item: any) => item.platform_name == '京东自营');
      },
      fieldProps: { showSearch: true },
      valueType: 'select',
      width: 130,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '店铺SKU',
      dataIndex: 'shopSku',
      width: 130,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
    },
    {
      title: '区域',
      dataIndex: 'region',
      width: 80,
      align: 'center',
      valueType: 'select',
      search: false,
      request: async () => {
        const res = await api.salesRegionConfigList();
        if (res?.code == pubConfig.sCodeOrder) {
          return res.data.map((item: any) => ({ label: item.region, value: item.regionId }));
        }
        return [];
      },
      render: (_: any,record: any) => record.regionName??'-'
    },
    {
      title: '成交商品件数',
      dataIndex: 'num',
      search: false,
      align: 'right',
      width: 100,
    },
    {
      title: '成交金额',
      dataIndex: 'salesAmt',
      search: false,
      align: 'right',
      width: 90,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '销量时间',
      dataIndex: 'salesDate',
      valueType: 'dateRange',
      renderFormItem: () => <NewDatePicker />,
      search: {
        transform: (value: any) => ({
          startSalesDate: value[0] ? `${value[0]} 00:00:00` : null,
          endSalesDate: value[1] ? `${value[1]} 23:59:59` : null,
        }),
      },
      align: 'center',
      render: (_, record) => record.salesDate,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      width: 100,
    },
    {
      title: '导入时间',
      dataIndex: 'importDateStr',
      align: 'center',
      width: 130,
      onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
      search: false,
    },
  ];
  // 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1000, '');
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        {...ColumnSet}
        pagination={false}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        params={{
          current: pagination.current,
          pageSize: pagination.pageSize,
        }}
        onSubmit={() => {
          pagination.current = 1;
        }}
        request={async (params: any) => {
          const formData = {
            ...params,
            pageIndex: pagination.current,
          };
          delete formData.timeRange;
          delete formData.current;
          const res = await api.jdOperateOrderPage(formData);
          if (res?.code != pubConfig.sCodeOrder) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          let dataFlat: any[] = [];
          if (res?.data?.list?.length) {
            dataFlat = flatData(res.data.list, 'details');
          }
          // console.log(dataFlat, 'dataFlat');
          paginationSet({ ...pagination, total: res?.data?.total || 0 });
          return {
            success: true,
            data: dataFlat?.map((v: any) => ({...v,tempId: getUuid()})) || [],
          };
        }}
        rowKey="tempId"
        dateFormatter="string"
        headerTitle={'京东自营销量'}
        toolBarRender={() => [
          <Space key={'tools'}>
            {access.canSee('liyi99-report_cn-self-daily-jd-import') ? (
              <ImportBtnDirectory
                btnText={'导入'}
                reload={actionRef?.current?.reload}
                templateCode={'JD_OPERATE_ORDER_IMPORT'}
                url={'/report-service/jdOperateOrder/batchImport'}
              />
            ) : null}
          </Space>,
        ]}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        showSorterTooltip={false}
        search={{ defaultCollapsed: false, className: 'light-search-form', labelWidth: 90 }}
      />
      {/*ProTable合并单元格分页bug, 需要自定义分页*/}
      <div
        style={{
          position: 'sticky',
          padding: '1px 24px',
          borderTop: '1px solid #e9e9e9',
          bottom: 0,
          right: 0,
          zIndex: 2,
          width: '100%',
          textAlign: 'right',
          background: '#fff',
        }}
      >
        <Pagination
          showTotal={(total: number) => `总共${total}条`}
          onChange={(current, pageSize) => {
            if (pagination.pageSize == pageSize) {
              paginationSet({ ...pagination, current, pageSize });
            } else {
              paginationSet({ ...pagination, current: 1, pageSize });
            }
          }}
          showSizeChanger
          size={'small'}
          {...pagination}
        />
      </div>
    </PageContainer>
  );
};

export default Page;
