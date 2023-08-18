import { Access, useAccess } from 'umi';
import { useRef, useState } from 'react';
import { Button, Popover, Space, Tooltip, Upload } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import * as api from '@/services/pages/stockManage';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import ViewLife from './components/ViewLife';
import InnerTable from './components/InnerTable';
import { QuestionCircleOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { pubBeforeUpload, pubBlobDownLoad, pubDownloadSysImportTemplate } from '@/utils/pubConfirm';
import { baseFileUpload } from '@/services/base';
import moment from 'moment';

const Page = (props: any) => {
  const { dicList } = props;
  // const [confirmLoading, setConfirmLoading] = useState(false);
  const [downLoading, setDownLoading] = useState(false); // loading
  const [loading, setLoading] = useState({
    downLoading: false,
    upLoading: false,
  });
  const [exportForm, exportFormSet] = useState({});
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
        <ViewLife goods_sku_id={record.goods_sku_id} dicList={dicList} platform_code="JD_FCS" />
      ),
      width: 145,
      hideInTable: !access.canSee('libraryManager_life_fcs'),
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      align: 'center',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '店铺',
      dataIndex: 'shop_name',
      align: 'center',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '仓库（区域）',
      dataIndex: 'region',
      align: 'center',
      hideInSearch: true,
      width: '120px',
      onCell: () => ({ colSpan: 6, style: { padding: 0 } }),
      className: 'p-table-inTable noBorder',
      render: (_, record: any) => <InnerTable data={record.inventories} dicList={dicList} tabType={'jdFcs'} />,
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
          <Tooltip placement="top" title={'导入京东FCS库存的时候获取的VMI库存'}>
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'vmi_qty',
      hideInSearch: true,
      align: 'center',
      width: '120px',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: (
        <>
          FCS在库库存
          <Tooltip placement="top" title={'FCS在库库存= FCS可用库存 - VMI库存'}>
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
          FCS可用库存
          <br />
          （导入库存）
          <Tooltip placement="top" title={'共享后可用数量=VMI库存+在库可用数量'}>
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'import_available',
      align: 'center',
      hideInSearch: true,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: '120px',
    },
    {
      title: (
        <>
          总库存
          <Tooltip placement="top" title={'总库存=在途库存+在库库存'}>
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'total_quantity',
      align: 'center',
      hideInSearch: true,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      width: '120px',
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
  ];
  // // 同步
  // const synchronizationAction = async () => {
  //   pubModal('是否确定同步库存数据?')
  //     .then(async () => {
  //       setConfirmLoading(true);
  //       const res: any = await api.syn({ platform_code: 'JD_FCS' });
  //       if (res?.code != pubConfig.sCode) {
  //         pubMsg(res?.message);
  //       } else {
  //         pubMsg('同步成功', 'success');
  //         actionRef?.current?.reload();
  //       }
  //       setConfirmLoading(false);
  //     })
  //     .catch(() => {
  //       console.log('点击了取消');
  //     });
  // };
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
    await pubDownloadSysImportTemplate('STOCK_JD_FCS');
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
    const resData = await api.jdFcsStockImport(res.data[0]);
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
      options={{ fullScreen: true }}
      pagination={{
        defaultPageSize: 100,

        showSizeChanger: true,
      }}
      form={{
        ignoreRules: false,
      }}
      dateFormatter="string"
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      formRef={formRef}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      request={async (params: any) => {
        console.log(params);
        const formData = {
          ...params,
          current_page: params?.current,
          page_size: params?.pageSize,
          platform_code: 'JD_FCS',
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
      rowKey="goods_sku_id"
      headerTitle={
        <Space key="space" wrap>
          {/* <Access key="approval" accessible={access.canSee('libraryManager_sync_fcs')}>
            <Button
              loading={confirmLoading}
              onClick={() => {
                synchronizationAction();
              }}
            >
              同步库存
            </Button>
          </Access> */}
          <Access key="exportInventory" accessible={access.canSee('libraryManager_export_fcs')}>
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
      search={{ defaultCollapsed: false, className: 'light-search-form' }}
      toolBarRender={() => [
        <Space key="space">
          <Access key="import" accessible={access.canSee('scm_libraryManager_import_fcs')}>
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
                    acceptType: ['xls', 'xlsx', 'csv'], // 上传限制 非必填
                    // maxSize:20, // 非必填
                    // maxCount: 1, // 非必填
                    // acceptMessage:"上传格式不对，请检查上传文件", // 非必填
                  })
                }
                accept=".xls,.xlsx,.csv" // 打开时，默认显示的文件类型 非必填
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
                  京东FCS库存导入
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
