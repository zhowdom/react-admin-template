import { useMemo, useRef, useState } from 'react';
import { Col, Popconfirm, Row, Space, Button } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { getList, linkSync, exportSku } from '@/services/pages/link';
import PlatStore from '@/components/PubForm/PlatStore';
import { pubBlobDownLoad, pubGetUserList, pubProLineList } from '@/utils/pubConfirm';
import SkuTable from './SkuTable';
import Popularize from './Dialogs/ChangePopularize';
import AddSku from './Dialogs/AddSku';
import UpdateRelative from './Dialogs/UpdateRelative';
import TurnWait from './Dialogs/TurnWait';
import ReviewLog from './Dialogs/ReviewLog';
import UploadBarCode from './Dialogs/UploadBarCode';
import BatchChangePopularize from './Dialogs/BatchChangePopularize';
import OffSale from './Dialogs/OffSale';
import UngroupLink from './Dialogs/UngroupLink';
import LinkInput from './Dialogs/LinkInput';
import GroupLink from './Dialogs/GroupLink';
import { Link, useAccess, Access } from 'umi';
import EditProductLine from './Dialogs/EditProductLine';
import ChangeAudit from '@/pages/ProductLink/Links/Dialogs/ChangeAudit';
import CommonLog from '@/components/CommonLog';
import { getOperationHistory } from '@/services/pages/stockManager';

const Page: React.FC<{
  business_scope: string;
  setStatistics: any;
  dicList: any;
  label: 'ON_SALE' | 'REVIEWING' | 'EXCEPTION' | 'SOLD_OUT' | 'ALL' | string;
}> = (props: any) => {
  const access = useAccess();
  const { dicList, business_scope, label, setStatistics } = props;
  const codeIn = business_scope == 'IN' ? '_in' : ''; // 跨境的权限编码需要加_in
  const [exporting, exportingSet] = useState(false);
  const [selectedRowKeys, selectedRowKeysSet] = useState<any[]>([]);
  const [selectedRow, selectedRowSet] = useState<any[]>([]);
  const [exportForm, exportFormSet] = useState({});
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    exportFormSet(postData);
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setStatistics({});
    } else {
      setStatistics(res?.data?.ext_data || {});
    }

    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const resetSelected = () => {
    selectedRowKeysSet([]);
    selectedRowSet([]);
  };
  const formRef = useRef<any>();
  const ref = useRef<ActionType>();
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });

  const columns: ProColumns<any>[] = useMemo(
    () => [
      {
        title: '图片',
        editable: false,
        dataIndex: 'image_url',
        align: 'center',
        valueType: 'image',
        hideInSearch: true,
        width: 80,
      },
      {
        title: '链接名称 / 链接ID',
        dataIndex: 'goods_code',
        width: 130,
        hideInSearch: true,
        render: (_: any, record: any) => {
          return record.link_name || record.link_id ? (
            <>
              <div>{record.link_name}</div>
              {access.canSee('productLink_link_id' + codeIn) ? (
                <a href={record.link_url || '#'} target="_blank" rel="noreferrer">
                  <div>{record.link_id}</div>
                </a>
              ) : (
                ''
              )}
            </>
          ) : (
            '-'
          );
        },
      },
      {
        title: '链接名称',
        dataIndex: 'link_name',
        hideInTable: true,
      },
      {
        title: '链接ID',
        dataIndex: 'link_id',
        hideInTable: true,
      },
      {
        title: 'SKU',
        dataIndex: 'linkManagementSkuList',
        width: '110px',
        onCell: () => ({
          colSpan: ['REVIEWING', 'ON_SALE', 'ALL'].includes(label) ? 6 : 5,
          style: { padding: 0 },
        }),
        className: 'p-table-inTable noBorder',
        render: (_, record: any) => (
          <SkuTable
            data={record.linkManagementSkuList}
            dicList={dicList}
            showCount={true}
            label={label}
          />
        ),
        search: {
          transform: (val) => ({ shop_sku_code: val }),
        },
      },
      {
        title: '款式编码',
        dataIndex: 'sku_code',
        width: '100px',
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '款式名称',
        dataIndex: 'sku_name',
        width: '200px',
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '产品售价',
        dataIndex: 'sku_code',
        hideInSearch: true,
        width: 90,
        align: 'right',
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: (_, type: string) => {
          return type === 'table' ? '销售状态' : 'SKU销售状态';
        },
        dataIndex: 'sales_status',
        valueType: 'select',
        valueEnum: dicList.LINK_MANAGEMENT_SALES_STATUS,
        width: 100,
        align: 'center',
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '是否可售',
        tooltip: (
          <div>
            <p>各平台可售状态说明:</p>
            <p>1、Amazon：状态为BUYABLE为可售</p>
            <p>2、walmart：状态为published为可售</p>
            <p>3、京东：后台标记为可售即为可售</p>
            <p>4、天猫：库存大于0即为可售</p>
          </div>
        ),
        dataIndex: 'is_sale',
        align: 'center',
        width: 100,
        order: 2,
        valueEnum: dicList?.SC_YES_NO,
        hideInTable: !['REVIEWING', 'ON_SALE', 'ALL'].includes(label),
        hideInSearch: !['REVIEWING', 'ON_SALE', 'ALL'].includes(label),
        onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      },
      {
        title: '生命周期',
        dataIndex: 'life_cycle',
        valueType: 'select',
        align: 'center',
        width: 80,
        order: 4,
        fieldProps: {
          showSearch: true,
        },
        valueEnum: dicList.LINK_MANAGEMENT_LIFE_CYCLE,
        render: (_: any, record: any) => {
          return pubFilter(props?.dicList.LINK_MANAGEMENT_LIFE_CYCLE, record?.life_cycle) || '-';
        },
      },
      {
        title: '异常类型',
        dataIndex: 'exception_type',
        order: 2,
        valueType: 'select',
        valueEnum: props?.dicList.LINK_MANAGEMENT_EXCEPTION_TYPE,
        align: 'center',
        width: 180,
        render: (_: any, record: any) => {
          return (
            <>
              <div>
                {pubFilter(props?.dicList.LINK_MANAGEMENT_EXCEPTION_TYPE, record?.exception_type) ||
                  '-'}
              </div>
              <span
                style={{
                  display: record?.exception_type == '2' ? 'block' : 'none',
                  color: 'red',
                  fontSize: '12px',
                }}
              >
                可以尝试使用链接同步功能或下架已删除的SKU，如果还是失败请找IT小哥处理~
              </span>
            </>
          );
        },
        hideInTable: !['EXCEPTION'].includes(label),
        search: false,
      },
      {
        title: '产品线',
        dataIndex: 'category_name',
        order: 7,
        width: 120,
        align: 'center',
        valueType: 'select',
        request: () => pubProLineList({ business_scope }),
        fieldProps: {
          showSearch: true,
          mode: 'multiple',
        },
        search: {
          transform: (val) => ({ category_ids: val.toString() }),
        },
        renderText: (text, record: any) =>
          record.business_scope && text
            ? `${pubFilter(dicList?.SYS_BUSINESS_SCOPE, record.business_scope)}-${text}`
            : '-',
      },
      {
        title: '店铺',
        dataIndex: 'plat_store',
        hideInTable: true,
        order: 6,
        renderFormItem: () => <PlatStore business_scope={business_scope} />,
        search: {
          transform: (val: any[]) => ({
            platform_id: val[0], // 平台
            shop_id: val[1], // 店铺
          }),
        },
      },
      {
        title: '推广',
        dataIndex: 'spread_user_id',
        align: 'center',
        request: async (v) => {
          const res: any = await pubGetUserList(v);
          return res;
        },
        valueType: 'select',
        hideInTable: true,
        fieldProps: {
          showSearch: true,
        },
        order: 5,
      },
      {
        title: '平台',
        dataIndex: 'platform_code',
        width: '120px',
        align: 'center',
        hideInSearch: true,
        valueEnum: props?.dicList?.SYS_PLATFORM_NAME,
        render: (_: any, record: any) => {
          return pubFilter(dicList?.SYS_PLATFORM_NAME, record?.platform_code) || '-';
        },
      },
      {
        title: '店铺/推广',
        dataIndex: 'store_spread',
        hideInSearch: true,
        align: 'center',
        width: 180,
        render: (text, record: any) => (
          <>
            {record.shop_name || '-'}
            <br />
            {record.spread_user_name || '-'}
          </>
        ),
      },
      {
        title: '是否可售',
        tooltip: (
          <div>
            <p>各平台可售状态说明</p>
            <p>1、Amazon：状态为BUYABLE为可售</p>
            <p>2、walmart：状态为published为可售</p>
            <p>3、京东：后台标记为可售即为可售</p>
            <p>4、天猫：库存大于0即为可售</p>
          </div>
        ),
        dataIndex: 'is_sale',
        align: 'center',
        width: 100,
        order: 2,
        valueEnum: dicList?.SC_YES_NO,
        hideInTable: ['REVIEWING', 'ON_SALE', 'ALL'].includes(label),
        hideInSearch: ['REVIEWING', 'ON_SALE', 'ALL'].includes(label),
      },
      {
        title: '上架时间',
        tooltip: '产品上架到平台的时间',
        dataIndex: 'sales_time',
        align: 'center',
        valueType: 'dateRange',
        order: 3,
        width: 146,
        sorter: (a: any, b: any) =>
          new Date(a.sales_time).getTime() - new Date(b.sales_time).getTime(),
        search: {
          transform: (val) => ({
            begin_time: `${val[0]} 00:00:00`,
            end_time: `${val[1]} 23:59:59`,
          }),
        },
        render: (_, record: any) => record.sales_time,
        hideInTable: ['ON_SALE', 'EXCEPTION', 'SOLD_OUT', 'ALL'].includes(label),
      },
      {
        title: '评审原因',
        dataIndex: 'review_reason',
        width: 90,
        ellipsis: true,
        hideInTable: !['REVIEWING'].includes(label),
        search: false,
      },
      {
        title: '操作',
        key: 'option',
        width: ['ON_SALE', 'EXCEPTION'].includes(label) ? 210 : 150,
        align: 'center',
        valueType: 'option',
        fixed: 'right',
        render: (_: any, record: any) => {
          return (
            <Row>
              <Access accessible={access.canSee('productLink_detail' + codeIn)}>
                <Col span={12}>
                  <Link to={`/product-link/links-detail?id=${record.id}`}>详情</Link>
                </Col>
              </Access>
              <Access
                accessible={
                  access.canSee('productLink_change_pul' + codeIn) && ['ON_SALE'].includes(label)
                }
              >
                <Col span={12}>
                  <Popularize
                    record={record}
                    reload={() => {
                      ref?.current?.reload();
                    }}
                    title="推广变更"
                  />
                </Col>
              </Access>
              <Access
                accessible={
                  access.canSee('productLink_add_sku' + codeIn) &&
                  record.business_scope == 'IN' &&
                  record.platform_code !== 'JD_OPERATE' &&
                  ['ON_SALE', 'ALL'].includes(label)
                }
              >
                {['WALMART', 'AMAZON_SC'].includes(record.platform_code) && (
                  <Col span={12}>
                    <AddSku
                      reload={() => {
                        ref?.current?.reload();
                      }}
                      record={record}
                      title="新增sku"
                    />
                  </Col>
                )}
              </Access>
              <Access
                accessible={
                  access.canSee('productLink_update_rel' + codeIn) &&
                  ['ALL', 'ON_SALE', 'EXCEPTION'].includes(label)
                }
              >
                <Col span={12}>
                  <UpdateRelative
                    title="更新对应关系"
                    dataSource={record}
                    reload={() => {
                      ref?.current?.reload();
                    }}
                  />
                </Col>
              </Access>
              <Access
                accessible={
                  access.canSee('productLink_turn_wait' + codeIn) &&
                  ['ON_SALE'].includes(label) &&
                  !['11'].includes(record?.life_cycle + '')
                }
              >
                <Col span={12}>
                  <TurnWait
                    dicList={dicList}
                    title="发起评审"
                    record={record}
                    reload={() => {
                      ref?.current?.reload();
                    }}
                  />
                </Col>
              </Access>
              <Access
                accessible={
                  access.canSee('productLink_audit_result' + codeIn) &&
                  ['REVIEWING'].includes(label)
                }
                key="ChangeAudit"
              >
                <Col span={12}>
                  <ChangeAudit
                    title={'确认评审结果'}
                    dicList={props?.dicList}
                    record={record}
                    reload={() => {
                      ref?.current?.reload();
                    }}
                  />
                </Col>
              </Access>
              <Access
                accessible={
                  access.canSee('productLink_review_log' + codeIn) &&
                  ['ON_SALE', 'ALL'].includes(label)
                }
              >
                <Col span={12}>
                  <ReviewLog title="评审日志" id={record?.id} dicList={props.dicList} />
                </Col>
              </Access>
              <Access
                accessible={
                  (access.canSee('productLink_link_sync' + codeIn) &&
                    !['JD_OPERATE', 'AMAZON_VC'].includes(record.platform_code) &&
                    ['ON_SALE', 'ALL'].includes(label)) ||
                  (['EXCEPTION'].includes(label) && record?.exception_type == '2')
                }
              >
                <Col span={12}>
                  <Popconfirm
                    title="确定同步吗?"
                    onConfirm={async () => {
                      const res = await linkSync({
                        id: record?.id,
                      });
                      if (res?.code != pubConfig.sCode) {
                        pubMsg(res?.message);
                      } else {
                        pubMsg('同步成功!', 'success');
                        ref?.current?.reload();
                      }
                    }}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a>链接同步</a>
                  </Popconfirm>
                </Col>
              </Access>
              <Access
                accessible={
                  access.canSee('scm_productLink_ungroup' + codeIn) &&
                  ['ON_SALE'].includes(label) &&
                  business_scope == 'IN' &&
                  record?.linkManagementSkuList?.length > 1
                }
              >
                <Col span={12}>
                  <UngroupLink
                    title="链接拆分"
                    data={record}
                    reload={() => {
                      ref?.current?.reload();
                    }}
                  />
                </Col>
              </Access>
              <Access
                accessible={
                  access.canSee('scm_productLink_off_sale' + codeIn) &&
                  ['ALL', 'ON_SALE', 'EXCEPTION'].includes(label)
                  // (record.is_sale == 0 || record?.exception_type == 2)
                }
              >
                <Col span={12}>
                  <OffSale
                    dicList={dicList}
                    title="SKU下架"
                    data={record}
                    reload={() => {
                      ref?.current?.reload();
                    }}
                  />
                </Col>
              </Access>
              <Access
                accessible={
                  access.canSee('productLink_upload_barcode' + codeIn) &&
                  ['ON_SALE'].includes(label)
                }
              >
                <Col span={12}>
                  {/*上传条码文件*/}
                  <UploadBarCode
                    title="上传条码"
                    record={record}
                    reload={() => {
                      ref?.current?.reload();
                    }}
                  />
                </Col>
              </Access>
              <Access
                accessible={
                  access.canSee('productLink_edit_productLine' + codeIn) &&
                  ['ON_SALE'].includes(label)
                }
              >
                <Col span={12}>
                  <EditProductLine
                    title="修改产品线"
                    record={record}
                    reload={() => {
                      ref?.current?.reload();
                    }}
                    dicList={dicList}
                  />
                </Col>
              </Access>
              <Access
                key="handleLog"
                accessible={
                  business_scope == 'IN'
                    ? access.canSee('productLink_handleLog_in')
                    : access.canSee('productLink_handleLog_cn')
                }
              >
                <Col span={12}>
                  <CommonLog
                    api={getOperationHistory}
                    business_id={record.id}
                    dicList={props?.dicList}
                  />
                </Col>
              </Access>
            </Row>
          );
        },
      },
    ],
    [props],
  );

  return (
    <ProTable
      columns={columns}
      actionRef={ref}
      options={{ fullScreen: true, setting: false }}
      pagination={{
        showSizeChanger: true,
      }}
      bordered
      formRef={formRef}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      params={{ label, business_scope }}
      request={getListAction}
      search={{ labelWidth: 'auto', className: 'light-search-form', defaultCollapsed: false }}
      scroll={{ x: 1500 }}
      sticky={{ offsetHeader: 48 }}
      defaultSize={'small'}
      rowKey="id"
      dateFormatter="string"
      toolBarRender={() => [
        <Space key="toolBarRender">
          <Access
            accessible={
              access.canSee('scm_productLink_group' + codeIn) &&
              ['ON_SALE'].includes(label) &&
              business_scope == 'IN'
            }
          >
            <GroupLink
              title={'链接合并'}
              reload={() => {
                resetSelected();
                ref?.current?.reload();
              }}
              data={selectedRow}
            />
          </Access>
          <Access accessible={access.canSee('productLink_export' + codeIn)}>
            <Button
              loading={exporting}
              onClick={async () => {
                exportingSet(true);
                const res = await exportSku(exportForm);
                exportingSet(false);
                pubBlobDownLoad(res, '链接sku');
              }}
              type={'primary'}
              ghost
            >
              导出SKU
            </Button>
          </Access>
          <Access accessible={access.canSee('productLink_change_pul_b' + codeIn)}>
            <BatchChangePopularize
              reload={() => {
                resetSelected();
                ref?.current?.reload();
              }}
              selectedRow={selectedRow}
              dicList={dicList}
              title="批量变更推广"
            />
          </Access>
          <Access accessible={access.canSee('productLink_link_input' + codeIn)}>
            {/*链接录入*/}
            <LinkInput
              business_scope={business_scope}
              dicList={dicList}
              reload={() => {
                ref?.current?.reload();
              }}
            />
          </Access>
        </Space>,
      ]}
      rowSelection={{
        selectedRowKeys,
        fixed: 'left',
        onChange: (keys, options) => {
          selectedRowKeysSet(keys);
          selectedRowSet(options);
        },
      }}
    />
  );
};

export default Page;
