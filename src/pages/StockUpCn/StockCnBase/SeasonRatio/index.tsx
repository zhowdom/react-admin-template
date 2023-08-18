/*淡旺季销售系数  @zhujing 2022-06-24*/
import { Access, connect, useAccess } from 'umi';
import { useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { Button, Popover, Space, Tooltip, Upload } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-form';
import Update from './Dialogs/Update';
import { getList, getList_cnflex, getList_cnflex_byid, changeFieldHistory, downloadgoodsFlex, downloadskuFlex } from '@/services/pages/stockUpIn/seasonRatio';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import ExportBtn from '@/components/ExportBtn';
import ImportBtn from '@/components/ImportBtn';
import { pubProLineList } from '@/utils/pubConfirm';
import { freeListLinkManagementSku, baseFileUpload } from '@/services/base';
import { random, uniqBy } from 'lodash';
import { QuestionCircleOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { pubBeforeUpload, pubBlobDownLoad } from '@/utils/pubConfirm';
import * as api from '@/services/pages/stockManage';
import CommonLog from '@/components/CommonLog';
import { getOperationHistory } from '@/services/pages/stockManager';

const Page: React.FC<{ common: any }> = ({ common }) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [exportForm, exportFormSet] = useState({});
  const [childtablestatusPool, childtablestatusPoolset] = useState<any>({});
  const [needupdatechild, needupdatechildset] = useState<Boolean>(true);
  const [searchnum, searchnumset] = useState<number>(0);

  const [randomKey, randomKeyset] = useState<any>('')
  const [loading, setLoading] = useState({
    downLoading: false,
    upLoading: false,
  });

  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });

  const onExpandHandle = async (_:any, id:any) => {
    let res = await getList_cnflex_byid({id: id});
    const newData = res?.data.map((v: any)=> ({
      ...v,
      parentId: id
    }))
    childtablestatusPool[id+'']['data'] = newData || [];
    childtablestatusPoolset(childtablestatusPool);
    childtablestatusPool[String(id)]['key'] = new Date();
    randomKeyset(new Date())
  }

  const getType = (b:any) => {
    needupdatechildset(b);
    searchnumset(searchnum + 1);
  }

  // 列表
  const columns: ProColumns<any>[] = [
    
    {
      title: '产品线',
      dataIndex: 'vendor_group_id',
      valueType: 'select',
      request: () => pubProLineList({ business_scope: 'CN', 'permission_filtering': true }),
      fieldProps: { showSearch: true },
      width: 120,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      hideInTable: true,
      width: 120,
    },
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      hideInTable: true,
      width: 120,
    },
    // {
    //   title: '站点',
    //   dataIndex: 'site',
    //   width: 60,
    //   fieldProps: {
    //     showSearch: true,
    //     filterOption: (input: any, option: any) => {
    //       const trimInput = input.replace(/^\s+|\s+$/g, '');
    //       if (trimInput) {
    //         return option.label.indexOf(trimInput) >= 0;
    //       } else {
    //         return true;
    //       }
    //     },
    //   },
    //   valueEnum: common?.dicList?.SYS_PLATFORM_SHOP_SITE || {},
    // },
    // {
    //   title: '店铺SKU',
    //   dataIndex: 'sku',
    //   valueType: 'select',
    //   fieldProps: { showSearch: true },
    //   request: () =>
    //     freeListLinkManagementSku({
    //       sku_type: '1',
    //     }).then((res: any) => {
    //       if (res.code == pubConfig.sCode) {
    //         if (res?.data) {
    //           return uniqBy(res.data, 'shop_sku_code').map((item: any) => ({
    //             ...item,
    //             label: `${item?.shop_sku_code}`,
    //             value: item?.shop_sku_code,
    //             key: `${item?.id}&&${item?.shop_sku_code}`,
    //           }));
    //         }
    //         return [];
    //       }
    //       return [];
    //     }),
    //   width: 130,
    // },
    {
      title: '年度增长率',
      dataIndex: 'growth_rate',
      align: 'right',
      hideInSearch: true,
      width: 130,
      render(_: any) {
        return _ != '-' ? `${_}%` : _;
      },
    },
    {
      title: '1月',
      dataIndex: 'month_1',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '2月',
      dataIndex: 'month_2',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '3月',
      dataIndex: 'month_3',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '4月',
      dataIndex: 'month_4',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '5月',
      dataIndex: 'month_5',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '6月',
      dataIndex: 'month_6',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '7月',
      dataIndex: 'month_7',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '8月',
      dataIndex: 'month_8',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '9月',
      dataIndex: 'month_9',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '10月',
      dataIndex: 'month_10',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '11月',
      dataIndex: 'month_11',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '12月',
      dataIndex: 'month_12',
      align: 'right',
      hideInSearch: true,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
    },
    {
      title: '操作',
      width: 130,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => [
        <Access
          key="edit"
          accessible={
            (!record.sku && access.canSee('stock_up_seasonRatio_alterflex'))
          }
        >
          <Update
            initialValues={record}
            title={record.type == '1' ? '国内商品淡旺季系数' : '国内产品线淡旺季系数'}
            // title={pubFilter(common?.dicList?.CN_SEASON_COEFFICIENT_CONFIG_TYPE, record.type)}
            trigger={<a>修改</a>}
            reload={actionRef?.current?.reload}
            dicList={common.dicList}
            handleFn={onExpandHandle}
            getType={getType}
          />
        </Access>,
        <Access key="log" accessible={access.canSee('stock_up_seasonRatio_flexlog')}>
          <CommonLog
            api={getOperationHistory}
            business_id={record.id}
            dicList={common?.dicList}
          />
        </Access>,
      ],
    },
  ];

  const columnsChild: ProColumns<any>[] = [
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      width: 120,
    },
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      width: 120,
    },
    
  ]

  // 导出下载： src\utils\pubConfirm.tsx --> pubDownloadSysImportTemplate
  const downLoadTemp = async (
    // code: string,
    // title?: string,
    // platform_code?: any,
    apiType?: string
  )=> {
      // downloadgoodsFlex, downloadskuFlex
      setLoading((values: any) => {
        return { ...values, downLoading: true };
      });
      const _api = apiType == 'sku' ? downloadskuFlex : downloadgoodsFlex
      const res: any = await _api({apiType});
      // const type = res.response.headers.get('content-type');
      setLoading((values: any) => {
        return { ...values, downLoading: false };
      });
      const fileData = res.response.headers.get('content-disposition');
      let fileName = '下载文件.xls';
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      pubBlobDownLoad(res.data, fileName, () => {
        actionRef?.current?.reload();
      }, true);
  };


  // 导入
  const handleUpload = async (data: any, type: any) => {
    setLoading((values: any) => {
      return { ...values, upLoading: true };
    });
    const res = await baseFileUpload({
      file: data.file,
      business_type: 'STOCK_UP_CN_SEASON_COEFFICIENT_IMPORT',
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading((values: any) => {
        return { ...values, upLoading: false };
      });
      return;
    }
    // const resData = await api.jdFcsStockImport(res.data[0]);
    let resData:any;
    if (type == 'goods') {
      resData = await api.importgoodsFlex(res.data[0]);
    } else if (type == 'sku') {
      resData = await api.importskuFlex(res.data[0]);
    }
    setLoading((values: any) => {
      return { ...values, upLoading: false };
    });
    pubBlobDownLoad(resData, '导入结果', () => {
      actionRef?.current?.reload();
    });
  };

  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        className="seasonRatio"
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        onSubmit={() => {
          if (searchnum == 0) {
            needupdatechildset(true);
          } else {
            needupdatechildset(false);
          }
          searchnumset(searchnum + 1);
        }}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          exportFormSet(formData);
          const res = await getList_cnflex(formData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          try{
            // 只有默认初始状态进入页面查询时候，以及点击子table时候，才执行这里。
            if (needupdatechild) {
              for (let [k, s] of Object.entries(res?.data?.records || [])) {
                childtablestatusPool[`${s?.id+''}`] = {
                  key: new Date(),
                  data: []
                }
              }
              childtablestatusPoolset(childtablestatusPool);
            }
          } catch(e) {
            console.log(e)
          }
          return {
            success: true,
            data: res?.data?.records || [],
            total: res?.data?.total || 0,
          };
        }}
        rowKey="id"
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        dateFormatter="string"
        headerTitle={
          <Space>
            <Access
              accessible={
                access.canSee('stock_up_seasonRatio_goodsflex')
              }
            >
              <Update title={'新增-产品线淡旺季系数'} reload={actionRef?.current?.reload} dicList={common.dicList} actionType={'goods'} />
            </Access>
            <Access
              accessible={
                access.canSee('stock_up_seasonRatio_skuflex')
              }
            >
              <Update title={'新增-款式淡旺季系数'} reload={actionRef?.current?.reload} dicList={common.dicList} actionType={'sku'} />
            </Access>
            {/*导入*/}
            {/* <Access accessible={access.canSee('scm_stock_up_seasonRatio_import')}>
              <ImportBtn
                btnText={'导入产品线系数'}
                reload={() => actionRef?.current?.reload()}
                business_type={'SEASON_SALE_RATIO'}
                templateCode={'SEASON_SALE_RATIO'}
                importHandle={'/sc-scm/seasonSaleRatio/ratioImport'}
              />
            </Access> */}
            {/* <Access accessible={access.canSee('scm_stock_up_seasonRatio_import_sku')}>
              <ImportBtn
                btnText={'导入店铺SKU系数'}
                reload={() => actionRef?.current?.reload()}
                business_type={'SEASON_SALE_RATIO_SKU'}
                templateCode={'SEASON_SALE_RATIO_SKU'}
                importHandle={'/sc-scm/seasonSaleRatio/ratioImportSku'}
              />
            </Access> */}
            {/*导出*/}
            {/* <Access accessible={access.canSee('scm_stock_up_seasonRatio_export')}>
              <ExportBtn
                exportForm={exportForm}
                exportHandle={'/sc-scm/seasonSaleRatio/ratioExport'}
              />
            </Access> */}

          <Access key="import" accessible={access.canSee('scm_libraryManager_import_goodsflex')}>
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
                    downLoadTemp('goods');
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
                customRequest={(ev) => handleUpload(ev, 'goods')}
              >
                <Button
                  icon={<UploadOutlined />}
                  type="primary"
                  disabled={loading.upLoading}
                  loading={loading.upLoading}
                  ghost
                >
                  导入产品线淡旺季系数
                </Button>
              </Upload>
            </Popover>
          </Access>

          <Access key="import_sku" accessible={access.canSee('scm_libraryManager_import_skuflex')}>
            <Popover
              key="down_sku"
              title={'需要下载导入模板 ?'}
              content={
                <Button
                  type="link"
                  loading={loading.downLoading}
                  disabled={loading.downLoading}
                  icon={<LinkOutlined />}
                  onClick={() => {
                    downLoadTemp('sku');
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
                key="upLoad_sku"
                showUploadList={false}
                customRequest={(ev) => handleUpload(ev, 'sku')}
              >
                <Button
                  icon={<UploadOutlined />}
                  type="primary"
                  disabled={loading.upLoading}
                  loading={loading.upLoading}
                  ghost
                >
                  导入款式淡旺季系数
                </Button>
              </Upload>
            </Popover>
          </Access>

          </Space>
        }
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
        expandable={{
          expandedRowClassName: () => 'pa-0',
          onExpand: (_, record) => {
            onExpandHandle(_, record?.id);
            console.log(searchnum, 'searchnum')
            searchnumset(searchnum+1)
          },
          expandedRowRender: (record: any) => (
            <>
            {/* {JSON.stringify(childtablestatusPool?.[String(record.id)]?.data)} */}
            <ProTable
              className={'margin-1'}
              rowKey={'id'}
              bordered
              showHeader={true}
              // key={childtablestatusPool?.[String(record.id)]?.key}
              key={randomKey}
              columns={[
                // { dataIndex: 'expandable', width: 48, align: 'center' },
                ...columnsChild.concat(columns.slice(1))
              ]}
              dataSource={childtablestatusPool?.[String(record.id)]?.data || []}
              pagination={false}
              search={false}
              options={false}
              cardProps={{ bodyStyle: { padding: 0 } }}
              // request={async () => {
              //   let res = await getList_cnflex_byid({id: record?.id})
              //   return {
              //     success: true,
              //     data: res?.data || [],
              //   }
              // }}
            />
            </>
          ),
          rowExpandable: (record: any) => true,
        }}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;
