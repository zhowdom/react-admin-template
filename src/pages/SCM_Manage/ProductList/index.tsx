import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { connect, useAccess } from 'umi';
import {pubConfig, pubFilter, pubMsg} from '@/utils/pubConfig';
import { getUuid, pubBlobDownLoad } from '@/utils/pubConfirm';
import { exportExcel, getList } from '@/services/pages/SCM_Manage/productList';
import { Button, Space, Tooltip } from 'antd';
import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ProductLine from '@/components/PubForm/ProductLine';

const Page: React.FC<{
  common: any;
}> = ({ common }) => {
  const actionRef = useRef<ActionType>();
  const [downLoading, setDownLoading] = useState(false);
  const [exportForm, setExportForm] = useState({});
  const access = useAccess();
  // 导出excel
  const downLoad = async () => {
    if (!access.canSee('liyi99-report_product-list-export')) {
      pubMsg('您暂无"导出"权限, 可联系管理员开通哦~');
      return;
    }
    setDownLoading(true);
    const res: any = await exportExcel(exportForm);
    setDownLoading(false);
    pubBlobDownLoad(res, '商品数据');
  };

  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const page = {
      current: params?.current,
      size: params?.pageSize,
    };
    delete params.current;
    delete params.pageSize;
    const postData = {
      page,
      paramList: {
        ...params,
        businessScope: params?.categoryData?.length ? params.categoryData[0] : 'CN',
        categoryId: params?.categoryData.length ? params.categoryData[1] : '',
      },
    };
    const res = await getList(postData);
    setExportForm(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data:
        res?.data?.records.map((v: any) => {
          return {
            ...v,
            tempId: getUuid(),
          };
        }) || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // table配置
  const columns: any[] = [
    {
      title: '产品线',
      dataIndex: 'categoryData',
      hideInTable: true,
      order: 7,
      initialValue: ["CN",''],
      renderFormItem: (_: any, rest: any, form: any) => (
        <ProductLine
          allowClear={[false,true]}
          back={(a: any, b: any) => {
            form.setFieldsValue({ categoryData: [a, b] });
          }}
        />
      ),
    },
    {
      title: (
        <>
          产品线
          <Tooltip placement="top" title="商品款式对应的产品线">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'categoryName',
      fixed: 'left',
      width: 100,
      hideInSearch: true,
      render: (_, record: any) => pubFilter(common?.dicList?.SYS_BUSINESS_SCOPE, record.businessScope) + ' - ' + record.categoryName
    },
    {
      title: '商品名称',
      dataIndex: 'skuName',
      fixed: 'left',
      width: 180,
    },
    {
      title: '款式编码(SKU)',
      dataIndex: 'skuCode',
      fixed: 'left',
      width: 100,
    },
    {
      title: (
        <>
          产品尺寸（长、宽、高、重量）
          <Tooltip placement="top" title="单个产品实物长宽高尺寸和单个产品重量">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      hideInSearch: true,
      children: [
        {
          title: '长（cm）',
          dataIndex: 'length1',
          align: 'center',
        },
        {
          title: '宽（cm）',
          dataIndex: 'width1',
          align: 'center',
        },
        {
          title: '高（cm）',
          dataIndex: 'high1',
          align: 'center',
        },
        {
          title: '重量（g）',
          dataIndex: 'weight1',
          align: 'center',
        },
      ],
      dataIndex: 'size',
      align: 'center',
    },
    {
      title: (
        <>
          产品包装尺寸（彩盒）（长、宽、高、重量）
          <Tooltip
            placement="top"
            title="单个产品实物用彩盒包装后的长宽高尺寸和用彩盒包装后的单个产品重量"
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      hideInSearch: true,
      children: [
        {
          title: '长（cm）',
          dataIndex: 'length2',
          align: 'center',
        },
        {
          title: '宽（cm）',
          dataIndex: 'width2',
          align: 'center',
        },
        {
          title: '高（cm）',
          dataIndex: 'high2',
          align: 'center',
        },
        {
          title: '重量（g）',
          dataIndex: 'weight2',
          align: 'center',
        },
      ],
      dataIndex: 'wrapper',
      align: 'center',
    },
    {
      title: (
        <>
          产品装箱尺寸（长、宽、高、重量）
          <Tooltip placement="top" title="箱规，产品装箱后单箱的长宽高尺寸和重量">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      hideInSearch: true,
      children: [
        {
          title: '长（cm）',
          dataIndex: 'length3',
          align: 'center',
        },
        {
          title: '宽（cm）',
          dataIndex: 'width3',
          align: 'center',
        },
        {
          title: '高（cm）',
          dataIndex: 'high3',
          align: 'center',
        },
        {
          title: '重量（g）',
          dataIndex: 'weight3',
          align: 'center',
        },
      ],
      dataIndex: 'box',
      align: 'center',
    },
    {
      title: <>箱规<br/>(每箱数量)</>,
      dataIndex: 'pics',
      width: 80,
      align: 'center',
      hideInSearch: true,
    },
  ];

  return (
    <ProTable
      bordered
      actionRef={actionRef}
      rowKey="tempId"
      dateFormatter="string"
      pagination={{
        showSizeChanger: true,
      }}
      scroll={{ x: 1600 }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      showSorterTooltip={false}
      options={{ fullScreen: true, setting: false }}
      headerTitle="商品尺寸"
      request={getListAction}
      columns={columns}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      toolBarRender={() => [
        <Space key="space">
          {access.canSee('liyi99-report_product-list-export') ? (
            <Button
              icon={<DownloadOutlined />}
              ghost
              type="primary"
              disabled={downLoading}
              loading={downLoading}
              onClick={() => {
                downLoad();
              }}
            >
              导出
            </Button>
          ) : null}
        </Space>,
      ]}
    />
  );
};

// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
