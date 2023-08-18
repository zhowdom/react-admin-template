import { Access, useAccess } from 'umi';
import { useRef, useState } from 'react';
import { Button, Popover, Space, Tooltip, Upload } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import * as api from '@/services/pages/stockManage';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import ViewLife from './components/ViewLife';
import InnerTable from './components/InnerTable';
import { pubBeforeUpload, pubBlobDownLoad, pubDownloadSysImportTemplate } from '@/utils/pubConfirm';
import { LinkOutlined, QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { baseFileUpload } from '@/services/base';
import moment from 'moment';

const Page = (props: any) => {
  const { dicList } = props;
  const [downLoading, setDownLoading] = useState(false); // loading
  const [exportForm, exportFormSet] = useState({});
  const [loading, setLoading] = useState({
    downLoading: false,
    upLoading: false,
  });
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: '商品图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
    },
    {
      title: 'SKU',
      dataIndex: 'stock_no',
      align: 'center',
    },
    {
      title: '商品条形码',
      dataIndex: 'bar_code',
      align: 'center',
    },
    {
      title: '款式生命周期',
      dataIndex: 'life_cycle',
      valueType: 'select',
      valueEnum: dicList.GOODS_LIFE_CYCLE,
      render: (_: any, record: any) => {
        return pubFilter(dicList.GOODS_LIFE_CYCLE, record?.life_cycle) || '-';
      },
    },
    {
      title: '链接生命周期',
      dataIndex: 'customerComments',
      align: 'center',
      hideInSearch: true,
      render: (_: any, record: any) => (
        <ViewLife goods_sku_id={record.goods_sku_id} dicList={dicList} platform_code="JD_OPERATE" />
      ),
      width: 145,
      hideInTable: !access.canSee('libraryManager_life_self'),
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: (
        <>
          店铺
          <br />
          (平台店铺名)
        </>
      ),
      dataIndex: 'shop_name',
      align: 'center',
      ellipsis: true,
      hideInSearch: true,
      render: (_: any, record: any) =>
        `${record?.shop_name ?? '-'}(${record?.platform_shop_name ?? '-'})`,
    },
    {
      title: '仓库（区域）',
      dataIndex: 'region',
      align: 'center',
      hideInSearch: true,
      width: '120px',
      onCell: () => ({ colSpan: 6, style: { padding: 0 } }),
      className: 'p-table-inTable noBorder',
      render: (_, record: any) => <InnerTable data={record.inventories} dicList={dicList} tabType={'jdSelf'} />,
    },
    {
      title: (
        <>
          在途
          <Tooltip placement="top" title={'供应商已发货，平台还未入库的数量'}>
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'in_transit_num',
      align: 'center',
      hideInSearch: true,
      width: '120px',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: (
        <>
          VMI库存
          <Tooltip placement="top" title={'导入京东自营库存的时候获取的VMI库存'}>
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'vmi_qty',
      align: 'center',
      hideInSearch: true,
      width: '120px',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: (
        <>
          自营在库数量
          <Tooltip placement="top" title={'自营在库库存= 自营可用库存 - VMI库存'}>
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'available',
      align: 'center',
      hideInSearch: true,
      width: '120px',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: (
        <>
          <div>自营可用数量</div>
          <div>
            （导入库存）
            <Tooltip
              placement="top"
              title={
                <>
                  <div>实际导入的京东自营可用库存数量，这部分数量包含了VMI共享的库存</div>
                </>
              }
            >
              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </div>
        </>
      ),
      dataIndex: 'import_available',
      hideInSearch: true,
      align: 'center',
      width: '120px',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: (
        <>
          总库存
          <Tooltip
            placement="top"
            title={
              <>
                {/* <div>总库存=在途库存+在库库存；</div>
                <div>在库库存取平台导入；</div> */}
                <div>总库存=在途+自营在库数量</div>
              </>
            }
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'total_quantity',
      align: 'center',
      hideInSearch: true,
      width: '120px',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '库存时间',
      dataIndex: 'inventory_time',
      align: 'center',
      valueType: 'date',
      sorter: (a: any, b: any) =>
        new Date(a.inventory_time).getTime() - new Date(b.inventory_time).getTime(),
      search: {
        transform: (val) => ({ start_inventory_time: val, end_inventory_time: val }),
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '库存时间必选',
          },
        ],
      },
      initialValue: moment(new Date()).format('YYYY-MM-DD'),
      width: 80,
      render: (_: any, record: any) => record.inventory_time ?? '-',
    },
    {
      title: '最后更新时间',
      dataIndex: 'syn_time',
      align: 'center',
      width: 90,
      hideInSearch: true,
    },
    // {
    //   title: '店铺SKU',
    //   dataIndex: 'shop_sku_code',
    //   align: 'center',
    //   hideInTable: true,
    // },
  ];
  // 导出库存
  const downLoadsynchronization = async () => {
    setDownLoading(true);
    const res: any = await api.exportInventory(exportForm);
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `库存导出.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setDownLoading(false);
  };
  // 下载导入模板
  const downLoadTemp = async () => {
    setLoading((values: any) => {
      return { ...values, downLoading: true };
    });
    await pubDownloadSysImportTemplate('STOCK_JD_OPERATE');
    setLoading((values: any) => {
      return { ...values, downLoading: false };
    });
  };

  // 导入
  const handleUpload = async (data: any) => {
    setLoading((values: any) => {
      return { ...values, upLoading: true };
    });
    const res = await baseFileUpload({
      file: data.file,
      business_type: 'SYS_IMPORT_TEMPLATE',
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading((values: any) => {
        return { ...values, upLoading: false };
      });
      return;
    }
    const resData = await api.stockImportSelf(res.data[0]);
    setLoading((values: any) => {
      return { ...values, upLoading: false };
    });
    pubBlobDownLoad(resData, '导入结果', () => {
      actionRef?.current?.reload();
    });
  };
  return (
    <ProTable
      bordered
      columns={columns}
      actionRef={actionRef}
      options={{ fullScreen: true, setting: false }}
      pagination={{
        defaultPageSize: 100,

        showSizeChanger: true,
      }}
      form={{
        ignoreRules: false,
      }}
      formRef={formRef}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      request={async (params: any) => {
        const formData = {
          ...params,
          current_page: params?.current,
          page_size: params?.pageSize,
          platform_code: 'JD_OPERATE',
        };
        exportFormSet(formData);
        const res = await api.getList(formData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return {
            success: false,
            data: [],
            total: 0,
          };
        }
        return {
          success: true,
          data: res?.data?.records || [],
          total: res?.data?.total || 0,
        };
      }}
      rowKey="tempId"
      dateFormatter="string"
      headerTitle={
        <Space key="space" wrap>
          <Access key="exportInventory" accessible={access.canSee('libraryManager_export_self')}>
            <Button
              type="primary"
              loading={downLoading}
              onClick={() => {
                downLoadsynchronization();
              }}
            >
              导出库存
            </Button>
          </Access>
        </Space>
      }
      scroll={{ x: 1200 }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      search={{ defaultCollapsed: false, className: 'light-search-form' }}
      toolBarRender={() => [
        <Space key="space">
          <Access key="import" accessible={access.canSee('libraryManager_import_self')}>
            <Popover
              key="down"
              title={'需要下载导入模板 ?'}
              content={
                <Button
                  type="link"
                  loading={loading.downLoading}
                  disabled={loading.downLoading}
                  icon={<LinkOutlined />}
                  onClick={() => {
                    downLoadTemp();
                  }}
                >
                  {loading.downLoading ? '下载中' : '下载导入模板'}
                </Button>
              }
            >
              <Upload
                beforeUpload={(file: any) =>
                  pubBeforeUpload({
                    file,
                    acceptType: ['xls', 'xlsx'], // 上传限制 非必填
                    // maxSize:20, // 非必填
                    // maxCount: 1, // 非必填
                    // acceptMessage:"上传格式不对，请检查上传文件", // 非必填
                  })
                }
                accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
                key="upLoad"
                showUploadList={false}
                customRequest={handleUpload}
              >
                <Button
                  icon={<UploadOutlined />}
                  type="primary"
                  disabled={loading.upLoading}
                  loading={loading.upLoading}
                  ghost
                >
                  京东自营库存导入
                </Button>
              </Upload>
            </Popover>
          </Access>
        </Space>,
      ]}
    />
  );
};

export default Page;
