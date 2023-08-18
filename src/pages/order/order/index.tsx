import { Access, connect, useAccess } from 'umi';
import { useRef, useState, useMemo } from 'react';
import { Menu, Button, Dropdown, Space, Modal, Tooltip, Tag } from 'antd';
import { TagsFilled, BarsOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { findSelectGoodsSku } from '@/services/base';
import { pubGetColumnsSearch } from '@/utils/pubConfirm';
import { pubFilter, pubMsg, pubConfig } from '@/utils/pubConfig';
import CustomSearchModal from '@/components/CustomSearchModal';
import ExportBtn from '@/components/ExportBtn';
import PlatStore from '@/components/PubForm/PlatStore';
import PlatStatus from '@/components/PubForm/PlatStatus';
import Detail from './dialogs/Detail';
import Options from './dialogs/Options';
import TagManager from './dialogs/TagManager';
import ExceptionSubmit from './dialogs/ExceptionSubmit';
import TagSubmit from './dialogs/TagSubmit';
import MarkSubmit from './dialogs/MarckSubmit';
import {
  listPageOrder,
  listPageOrderExceptionRecord,
  exportExcel,
  syncOrder,
  exportDetail,
} from '@/services/pages/order';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import moment from 'moment';
import { toLower } from 'lodash';
import OrderSync from './dialogs/OrderSync';
import SyncResults from './dialogs/SyncResults';

const cacheKey = 'order_pageOrderIndex';
const cacheValue = 'normal';
const Page: React.FC<{ common: any; dispatch: any }> = ({ common, dispatch }) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [menuKey, menuKeySet] = useState(cacheValue);
  const [exceptionType, exceptionTypeSet] = useState(cacheValue);
  const [orderTag, orderTagSet] = useState('');
  const [selectedRowKeys, selectedRowKeysSet] = useState([]);
  const [selectedRowKeysData, selectedRowKeysDataSet] = useState([]);
  const [exportForm, exportFormSet] = useState<any>({});
  // 添加弹窗实例
  const optionsModel = useRef();
  // 操作弹窗
  const optionsModelOpen: any = (row?: any) => {
    const data: any = optionsModel?.current;
    data.open(row);
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      actionRef?.current?.reload();
    }, 200);
  };

  // 款式/sku下拉
  const [optionsSku, optionsSkuSet] = useState([]);
  const [exceptions, exceptionsSet] = useState<any>([]);
  const [tags, tagsSet] = useState<any>([]);

  // 异常字典
  useMemo(() => {
    findSelectGoodsSku({
      business_scope: 'CN',
      sku_type: '1',
      current_page: 1,
      page_size: 999,
    }).then((res) => {
      if (res.code == pubConfig.sCode) {
        const data =
          res?.data?.records?.map((val: any) => ({
            ...val,
            label: `${val?.sku_code}(${val?.sku_name})`,
            value: `${val?.id}`,
          })) || [];
        optionsSkuSet(data);
      }
    });
    // 异常字典
    const tempArray: any[] = [];
    if (common?.dicList?.ORDER_EXCEPTION_TYPE) {
      const temp = common?.dicList?.ORDER_EXCEPTION_TYPE;
      Object.keys(temp).forEach((key) =>
        tempArray.push({
          label: temp[key]?.detail_name,
          key: temp[key]?.detail_code,
          value: temp[key]?.detail_code,
        }),
      );
    }
    exceptionsSet(tempArray);

    //标记字典
    const newTags: any[] = [];
    if (common?.dicList?.ORDER_TAG_TYPE) {
      const temp = common?.dicList?.ORDER_TAG_TYPE;
      Object.keys(temp).forEach((key) =>
        newTags.push({
          ...temp[key],
          label: temp[key]?.detail_name,
          key: temp[key]?.detail_code,
          value: temp[key]?.detail_code,
        }),
      );
    }
    tagsSet(newTags);
  }, [common]);
  // 1. 自定义搜索条件 配置
  const [customSearchConfig, customSearchConfigSet] = useState([]);
  // 2. 列表columns 配置
  const columnsInitial: ProColumns<any>[] & customColumnType[] = useMemo(() => {
    const c: ProColumns<any>[] & customColumnType[] = [
      {
        title: '单据号',
        dataIndex: 'code',
        hideInTable: true,
        customSearchType: { tag: '订单信息', tagColor: 'green' },
      },
      {
        title: 'ERP订单号',
        dataIndex: 'erpNo',
        search: false,
        render: (_: any, record: any) => {
          const colors = {
            repair: 'cyan',
            replace: 'gold',
            exception: 'green',
          };
          const orderTypeName = pubFilter(common?.dicList?.ORDER_ORDER_TYPE, record.orderType);
          return (
            <>
              {record.erpNo || '-'}
              {orderTypeName ? (
                <Tag
                  style={{ marginLeft: 4 }}
                  title={orderTypeName}
                  color={colors[record.orderType]}
                >
                  {orderTypeName.slice(0, 1)}
                </Tag>
              ) : null}
            </>
          );
        },
      },
      {
        title: '平台单号',
        dataIndex: 'platformNo',
        customSearchType: { tag: '订单信息', tagColor: 'green' },
        search: false,
      },
      {
        title: '平台状态',
        dataIndex: 'platformStatus',
        customSearchType: { tag: '订单信息', tagColor: 'green' },
        renderFormItem: () => <PlatStatus dicList={common?.dicList || {}} />,
        render: (_: any, record: any) => record?.platformStatusName || '-',
      },
      {
        title: '订单状态',
        dataIndex: 'orderStatusName',
        customSearchType: { tag: '订单信息', tagColor: 'green' },
        search: false,
        align: 'center',
        width: 80,
      },
      {
        title: '订单来源',
        dataIndex: 'shopName',
        customSearchType: { tag: '订单信息', tagColor: 'green' },
        renderFormItem: () => <PlatStore business_scope={'CN'} />,
        search: {
          transform: (value: any) => ({ platformId: value[0], shopId: value[1] }),
        },
      },
      {
        title: '客户ID',
        dataIndex: 'buyerId',
        customSearchType: { tag: '收件人信息', tagColor: 'cyan' },
        ellipsis: true,
      },
      {
        title: '收件人',
        dataIndex: 'receiverNameEncr',
        customSearchType: { tag: '收件人信息', tagColor: 'cyan' },
        width: 80,
      },
      {
        title: '收件人手机',
        dataIndex: 'receiverMobileEncr',
        customSearchType: { tag: '收件人信息', tagColor: 'cyan' },
        valueType: 'digit',
        hideInTable: true,
      },
      {
        title: '收件人省份',
        dataIndex: 'receiverArea',
        customSearchType: { tag: '收件人信息', tagColor: 'cyan' },
        hideInTable: true,
      },
      {
        title: '收件地址',
        dataIndex: 'receiverArea',
        customSearchType: { tag: '收件人信息', tagColor: 'cyan' },
        ellipsis: true,
        search: false,
      },
      {
        title: '款式',
        dataIndex: 'goodsSkuId',
        customSearchType: { tag: '发货信息', tagColor: 'blue' },
        hideInTable: true,
        valueType: 'select',
        fieldProps: {
          placeholder: '输入款式名称或者编码',
          options: optionsSku,
          showSearch: true,
        },
      },
      {
        title: '发货仓库',
        dataIndex: 'deliveryWarehouse',
        customSearchType: { tag: '发货信息', tagColor: 'blue' },
      },
      {
        title: '快递',
        dataIndex: 'express',
        customSearchType: { tag: '发货信息', tagColor: 'blue' },
        align: 'center',
        width: 90,
      },
      {
        title: '订单金额',
        dataIndex: 'orderAmt',
        customSearchType: { tag: '订单信息', tagColor: 'green' },
        align: 'right',
        width: 90,
        valueType: 'digitRange',
        fieldProps: {
          precision: 2,
        },
        search: {
          transform: (value: any) => ({ orderAmtStart: value[0], orderAmtEnd: value[1] }),
        },
        render: (_, record: any) => record?.orderAmt?.toFixed(2),
      },
      {
        title: '支付类型',
        dataIndex: 'paymentType',
        hideInTable: true,
        customSearchType: { tag: '订单信息', tagColor: 'green' },
        align: 'center',
        width: 90,
        valueEnum: common?.dicList?.ORDER_PAY_TYPE || {},
      },
      {
        title: '支付方式',
        dataIndex: 'paymentTypeName',
        hideInSearch: true,
        customSearchType: { tag: '订单信息', tagColor: 'green' },
        align: 'center',
        width: 90,
        renderFormItem: () => (
          <PlatStatus
            withLabel
            options={[
              {
                label: '抖音',
                value: 'ORDER_DY_PAYMENT_TYPE',
              },
              {
                label: '天猫',
                value: 'ORDER_TM_PAYMENT_TYPE',
              },
              {
                label: '京东',
                value: 'ORDER_JD_PAYMENT_TYPE',
              },
            ]}
            dicList={common?.dicList || {}}
          />
        ),
        search: {
          transform: (val) => ({ paymentType: val }),
        },
      },
      {
        title: '订单标记',
        dataIndex: 'orderTag',
        customSearchType: { tag: '订单信息', tagColor: 'green' },
        search: false,
        render: (_: any, record: any) => {
          if (record.orderTag) {
            return record.orderTag.split(',').map((item: any) => {
              const matchItem = tags.find((tag: any) => tag.value == item);
              return matchItem ? (
                <Tooltip title={matchItem.label} key={item}>
                  <TagsFilled style={{ color: matchItem?.cssClass, marginRight: 4 }} />
                </Tooltip>
              ) : null;
            });
          }
          return '-';
        },
      },
      {
        title: '订单备注',
        dataIndex: 'sysRemark',
        width: 100,
        ellipsis: true,
        search: false,
      },
      {
        title: '体验单',
        dataIndex: 'expType',
        width: 100,
        customSearchType: { tag: '订单信息', tagColor: 'green' },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        customSearchType: { tag: '时间属性', tagColor: 'red' },
        valueType: 'dateRange',
        search: {
          transform: (value) => ({
            createTimeStart: value[0] + ' 00:00:00',
            createTimeEnd: value[1] + ' 23:59:59',
          }),
        },
        render: (_, record) => record.createTime || '-',
        width: 136,
        align: 'center',
      },
      {
        title: '下单时间',
        dataIndex: 'orderTime',
        customSearchType: { tag: '时间属性', tagColor: 'red' },
        valueType: 'dateRange',
        order: -14,
        hideInSearchConfig: true,
        initialValue: [moment().add(-2, 'months').startOf('month'), moment()],
        search: {
          transform: (value) => ({
            orderTimeStart: value[0] + ' 00:00:00',
            orderTimeEnd: value[1] + ' 23:59:59',
          }),
        },
        render: (_, record) => record.orderTime || '-',
        width: 136,
        align: 'center',
      },
      {
        title: '付款时间',
        dataIndex: 'paymentTime',
        customSearchType: { tag: '时间属性', tagColor: 'red' },
        valueType: 'dateRange',
        search: {
          transform: (value) => ({
            paymentTimeStart: value[0] + ' 00:00:00',
            paymentTimeEnd: value[1] + ' 23:59:59',
          }),
        },
        render: (_, record) => record.paymentTime || '-',
        width: 136,
        align: 'center',
      },
      {
        title: '审核时间',
        dataIndex: 'auditTime',
        customSearchType: { tag: '时间属性', tagColor: 'red' },
        valueType: 'dateRange',
        search: {
          transform: (value) => ({
            auditTimeStart: value[0] + ' 00:00:00',
            auditTimeEnd: value[1] + ' 23:59:59',
          }),
        },
        render: (_, record) => record.auditTime || '-',
        width: 136,
        align: 'center',
      },
      {
        title: '发货时间',
        dataIndex: 'requestDeliveryTime',
        customSearchType: { tag: '时间属性', tagColor: 'red' },
        valueType: 'dateRange',
        search: {
          transform: (value) => ({
            requestDeliveryTimeStart: value[0] + ' 00:00:00',
            requestDeliveryTimeEnd: value[1] + ' 23:59:59',
          }),
        },
        render: (_, record) => record.requestDeliveryTime || '-',
        width: 136,
        align: 'center',
      },
      {
        title: '最后同步时间',
        dataIndex: 'lastSyncTime',
        customSearchType: { tag: '时间属性', tagColor: 'red' },
        valueType: 'dateRange',
        search: {
          transform: (value) => ({
            lastSyncTimeStart: value[0] + ' 00:00:00',
            lastSyncTimeEnd: value[1] + ' 23:59:59',
          }),
        },
        render: (_, record) => record.lastSyncTime || '-',
        width: 136,
        align: 'center',
      },
      {
        title: '操作',
        width: 100,
        align: 'center',
        valueType: 'option',
        fixed: 'right',
        render: (dom: any, record: any) => [
          <a key={'options'} onClick={() => optionsModelOpen(record)}>
            操作
          </a>,
          <Access key={'detail'} accessible={access.canSee('order_orderIndexDetail')}>
            {/*详情*/}
            <Detail
              record={record}
              exceptions={exceptions}
              dicList={common?.dicList || {}}
              common={common}
            />
          </Access>,
        ],
      },
    ];
    return c;
  }, [optionsSku]);
  const columns: ProColumns<any>[] = useMemo(() => {
    return pubGetColumnsSearch(columnsInitial, customSearchConfig);
  }, [columnsInitial, customSearchConfig]);
  // 3. 自定义列 配置
  const ColumnSet = useCustomColumnSet(columns, 1600, '', 6);
  const menuItemsOption = [];
  if (access.canSee('order_orderIndexTagSubmitBatch')) {
    menuItemsOption.push({
      label: (
        <TagSubmit
          trigger={<div>标记</div>}
          reload={actionRef.current?.reload}
          title={'批量标记订单'}
          ids={selectedRowKeys}
          tags={tags}
        />
      ),
      key: 'tag',
    });
  }
  if (access.canSee('order_orderIndexSync_batch')) {
    menuItemsOption.push({
      label: (
        <div
          onClick={() => {
            Modal.confirm({
              title: '确定对所选订单执行同步操作?',
              onOk: async () => {
                const postData = selectedRowKeysData.map((values: any) => ({
                  shopId: values.shopId,
                  platformNos: [values.platformNo],
                }));
                const res = await syncOrder(postData);
                if (res?.code != '0') {
                  pubMsg(res?.message);
                  return false;
                }
                pubMsg(res?.message || '操作成功!', 'success');
                actionRef?.current?.reload();
                return true;
              },
            });
          }}
        >
          同步
        </div>
      ),
      key: 'sync',
    });
  }
  if (access.canSee('order_orderIndexMarkInnerBatch')) {
    menuItemsOption.push({
      label: (
        <MarkSubmit
          ids={selectedRowKeys}
          reload={actionRef?.current?.reload}
          title={'批量添加订单备注'}
          trigger={<div>备注</div>}
        />
      ),
      key: 'editRemark',
    });
  }

  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 50,
        }}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params: any) => {
          const formData = {
            ...params,
            pageIndex: params.current,
            exceptionType,
            orderTag,
            menuKey,
          };
          if (params?.platformStatus?.indexOf('ORDER_ERP_STATUS') > -1) {
            formData.orderStatus = formData.platformStatus;
            delete formData.platformStatus;
          }
          window.isLoadingData = true;
          let api = listPageOrder;
          if (menuKey == 'exceptionHistory') {
            api = listPageOrderExceptionRecord;
          }
          exportFormSet(formData);
          const res = await api(formData);
          window.isLoadingData = false;
          if (res?.code != '0') {
            pubMsg(res?.message);
            return {
              success: false,
              data: [],
              total: 0,
            };
          }
          selectedRowKeysSet([]);
          selectedRowKeysDataSet([]);
          window.scrollTo({
            left: 0,
            top: 0,
            behavior: 'smooth',
          });
          // 虚拟滚动条没隐藏问题
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 0);
          return {
            success: true,
            data: res?.data?.list || [],
            total: res?.data?.total || 0,
          };
        }}
        rowKey="id"
        search={{
          defaultCollapsed: false,
          labelWidth: 96,
          className: 'light-search-form action-btn-flow',
          optionRender: (searchConfig, formProps, dom) => [
            <CustomSearchModal
              title={'自定义搜索'}
              key={'CustomSearchModal'}
              menuKey={'all'}
              columnsData={columnsInitial}
              onChange={customSearchConfigSet}
            />,
            ...dom,
          ],
        }}
        dateFormatter="string"
        headerTitle={
          <Space>
            <Access accessible={menuItemsOption.length > 0}>
              <Dropdown
                trigger={['click']}
                disabled={selectedRowKeys.length == 0}
                overlay={<Menu items={menuItemsOption} />}
                arrow
              >
                <Button disabled={selectedRowKeys.length == 0} loading={false} type={'primary'}>
                  批量操作
                </Button>
              </Dropdown>
            </Access>
            <Access accessible={access.canSee('order_orderIndexTagManager')}>
              <TagManager dispatch={dispatch} type={'tag'} triggerText={'标记管理'} />
            </Access>
            <Access
              accessible={
                (!exceptionType || exceptionType == 'normal') &&
                menuKey != 'exceptionHistory' &&
                access.canSee('order_orderIndexExceptionHandleBatch')
              }
            >
              <ExceptionSubmit
                exceptions={exceptions}
                reload={actionRef.current?.reload}
                title={'批量提交异常'}
                ids={selectedRowKeys}
              />
            </Access>
            <Access accessible={access.canSee('order_orderIndexExceptionManager')}>
              <TagManager dispatch={dispatch} type={'exception'} triggerText={'异常管理'} />
            </Access>
            <Access accessible={access.canSee('order_orderIndexSync')}>
              <OrderSync reload={actionRef.current?.reload} />
            </Access>
            <Access accessible={access.canSee('order_orderIndexSync_view')}>
              <SyncResults />
            </Access>
          </Space>
        }
        sticky={{ offsetHeader: 48, offsetScroll: 36 }}
        {...ColumnSet}
        toolBarRender={() => [
          <Space key="space">
            {access.canSee('order_normal_export') ? (
              <ExportBtn
                exportHandle={exportExcel}
                exportForm={{
                  ...exportForm,
                  exportConfig: { columns: ColumnSet.customExportConfig },
                }}
              />
            ) : null}
            {access.canSee('order_export_detail') ? (
              <ExportBtn
                exportHandle={exportDetail}
                exportForm={exportForm}
                btnText="导出明细"
              />
            ) : null}
          </Space>,
        ]}
        tableRender={(_, dom) => (
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              background: '#fff',
            }}
          >
            <Menu
              onClick={(e: any) => {
                if (window.isLoadingData) return;
                menuKeySet(e?.key);
                window.sessionStorage.setItem(cacheKey, e?.key);
                if (['all', 'exceptionHistory'].includes(e?.key)) {
                  exceptionTypeSet('');
                  orderTagSet('');
                } else {
                  if (e.keyPath?.includes('exceptions')) {
                    orderTagSet('');
                    exceptionTypeSet(e?.key as string);
                  } else if (e.keyPath?.includes('tags')) {
                    exceptionTypeSet('');
                    orderTagSet(e?.key as string);
                  } else {
                    exceptionTypeSet(e?.key as string);
                    orderTagSet('');
                  }
                }
                formRef?.current?.submit();
              }}
              style={{ width: 140, flexShrink: 0, paddingTop: 10 }}
              inlineIndent={12}
              defaultSelectedKeys={[menuKey]}
              selectedKeys={[menuKey]}
              defaultOpenKeys={['exceptions', 'tags']}
              mode="inline"
              items={[
                {
                  key: 'all',
                  label: (
                    <>
                      <BarsOutlined style={{ marginRight: 4 }} />
                      全部订单
                    </>
                  ),
                },
                {
                  key: 'normal',
                  label: (
                    <>
                      <BarsOutlined style={{ marginRight: 4 }} />
                      正常订单
                    </>
                  ),
                },
                exceptions.length
                  ? {
                      key: 'exceptions',
                      label: (
                        <>
                          <BarsOutlined style={{ marginRight: 4 }} />
                          异常订单
                        </>
                      ),
                      children: exceptions.map(({ key, label }: any) => ({
                        key,
                        label: <span title={label}>{label}</span>,
                      })),
                    }
                  : null,
                {
                  key: 'exceptionHistory',
                  label: (
                    <>
                      <BarsOutlined style={{ marginRight: 4 }} />
                      异常历史订单
                    </>
                  ),
                },
                tags.length
                  ? {
                      key: 'tags',
                      label: (
                        <>
                          <BarsOutlined style={{ marginRight: 4 }} />
                          标记
                        </>
                      ),
                      children: tags.map(({ key, label, cssClass }: any) => ({
                        key,
                        label: (
                          <>
                            <TagsFilled style={{ color: cssClass }} />
                            <span title={label} style={{ marginLeft: 4 }}>
                              {label}
                            </span>
                          </>
                        ),
                      })),
                    }
                  : null,
              ]}
            />
            <div
              style={{
                flex: 1,
                maxWidth: 'calc(100% - 140px)',
              }}
            >
              {dom}
            </div>
          </div>
        )}
        rowSelection={{
          selectedRowKeys,
          fixed: 'left',
          onChange: (keys: any, data: any) => {
            selectedRowKeysSet(keys);
            selectedRowKeysDataSet(data);
          },
        }}
      />
      <Options
        optionsModel={optionsModel}
        exceptions={exceptions}
        common={common}
        tags={tags}
        handleClose={modalClose}
      />
      ,
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;
