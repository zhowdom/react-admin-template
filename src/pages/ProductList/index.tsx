import { PageContainer } from '@ant-design/pro-layout';
import { connect, Link, useAccess, Access, useAliveController, history } from 'umi';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Space, Tooltip } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubFilter, pubModal } from '@/utils/pubConfig';
import {
  getList,
  statusCount,
  synSendKingToErp,
  checkConductProject,
} from '@/services/pages/productList';
import ProductLine from '@/components/PubForm/ProductLine';
import SkuTable from './components/SkuTable';
import { pubGetUserList } from '@/utils/pubConfirm';
import SpecEdit from './components/SpecEdit';
// import BarCodeEdit from './components/BarCodeEdit';
import FixPrice from './components/FixPrice';
import HandleLog from './components/HandleLog';
import TurnWait from './components/TurnWait';
import AuditStandard from './components/AuditStandard';
import ChangeAudit from './components/ChangeAudit';
import ReviewLog from './components/ReviewLog';

const cacheKey = 'EstablishPageProductList';
const Page = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  const { dropScope } = useAliveController();
  const [tabList, setTabList] = useState([]);
  const [pageSize, setPageSize] = useState<any>(20);
  const [tabStatus, setTabStatus] = useState<any>(sessionStorage.getItem(cacheKey) || 'ON_SALE');
  // 获取状态及数据统计
  const statusCountAction = async () => {
    const res: any = await statusCount({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const tabs = res.data.map((v: any) => {
        return {
          key: v.key,
          tab: `${v.name} (${v.count})`,
        };
      });
      setTabList(tabs);
    }
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      name: params.name_cn,
      business_scope: params.category_data ? params.category_data[0] : '', //业务范畴
      category_id: params.category_data ? params.category_data[1] : '', //产品线
    };
    statusCountAction();
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  useEffect(() => {
    statusCountAction();
  }, []);
  useActivate(() => {
    statusCountAction();
    if (ref?.current) ref?.current?.reload();
  });
  const selectProps = {
    showSearch: true,
  };

  // 配送类型同步到ERP
  const productlistSyncToErp = async (id: string) => {
    pubModal(`是否同步此信息到ERP？`)
      .then(async () => {
        const res: any = await synSendKingToErp({ id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('同步成功', 'success');
          ref?.current?.reload();
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 当前产品有未完结的版本迭代流程处理
  const handleVersionIfContinue = (message: any, id: string) => {
    Modal.confirm({
      title: '提示',
      content: message,
      okText: '是',
      cancelText: '否',
      async onOk() {
        history.push(
          `/sign-establish/establish-detail-version?type=1&id=${id}&is_continue=1&timeStamp=${new Date().getTime()}`,
        );
      },
    });
  };
  const columns: ProColumns<any>[] = [
    {
      title: '图片',
      editable: false,
      dataIndex: 'image_id',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      renderText(text, record) {
        return record.goodsSkus && record.goodsSkus.length ? record.goodsSkus[0].image_url : '';
      },
      width: 90,
    },
    {
      title: '产品编码',
      dataIndex: 'goods_code',
      align: 'center',
      order: 13,
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'name_cn',
      order: 14,
      width: 120,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      width: '100px',
      order: 11,
      align: 'center',
      onCell: () => ({ colSpan: 5, style: { padding: 0 } }),
      className: 'p-table-inTable noBorder',
      render: (_, record: any) => (
        <SkuTable data={record.goodsSkus} dicList={dicList} showCount={true} />
      ),
    },
    {
      title: (
        <>
          ERP编码
          <Tooltip
            placement="top"
            title={() => (
              <span>
                ERP编码指老系统现有规则的编码
                <br />
                在国内ERP对应『款式编号』
                <br />
                在跨境ERP对应『商品SKU』
              </span>
            )}
          >
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'erp_sku',
      width: '100px',
      order: 10,
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      width: '200px',
      order: 12,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: (data, type: string) => {
        return type == 'form' ? '商品条码/UPC' : '商品条码';
      },
      dataIndex: 'bar_code',
      width: '100px',
      order: 9,
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '款式生命周期',
      dataIndex: 'life_cycle',
      width: '120px',
      align: 'center',
      valueType: 'select',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
      valueEnum: dicList?.GOODS_LIFE_CYCLE,
    },
    {
      title: '产品线',
      dataIndex: 'category_name',
      hideInSearch: true,
      align: 'center',
      width: 100,
      renderText: (text, record: any) =>
        `${pubFilter(common?.dicList?.SYS_BUSINESS_SCOPE, record.business_scope)}-${text || ''}`,
    },
    {
      title: '产品线',
      dataIndex: 'category_data',
      hideInTable: true,
      order: 15,
      renderFormItem: (_, rest, form) => {
        return (
          <ProductLine
            back={(v: any) => {
              form.setFieldsValue({ category_data: v });
            }}
          />
        );
      },
    },
    {
      title: '签样确认人',
      dataIndex: 'sample_user_id',
      align: 'center',
      order: 7,
      request: async (v) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
      valueType: 'select',
      hideInTable: true,
      fieldProps: selectProps,
    },
    {
      title: (
        <>
          签样时间
          <Tooltip placement="top" title="签样确认时间">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'sample_time',
      hideInSearch: true,
      width: 150,
      order: 6,
      sorter: (a: any, b: any) =>
        new Date(a.sample_time).getTime() - new Date(b.sample_time).getTime(),
      align: 'center',
      render: (_: any, record: any) => {
        return record.sample_time || record.sample_user_name ? (
          <div>
            <p>{record.sample_time}</p>
            <p>{record.sample_user_name}</p>
          </div>
        ) : (
          <span>-</span>
        );
      },
    },
    {
      title: '签样时间',
      dataIndex: 'time',
      order: 7,
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (val) => ({ time_start: val[0], time_end: val[1] }),
      },
    },
    {
      title: '发起人',
      dataIndex: 'review_create_user_id',
      align: 'center',
      order: 6,
      request: async (v) => {
        const res: any = await pubGetUserList(v);
        return res;
      },
      valueType: 'select',
      hideInTable: true,
      hideInSearch: !['REVIEW'].includes(tabStatus),
      fieldProps: { showSearch: true },
    },
    {
      title: '发起评审时间',
      dataIndex: 'review_create_time',
      width: 150,
      align: 'center',
      order: 6,
      valueType: 'dateRange',
      search: {
        transform: (val) => ({ review_create_time_start: val[0], review_create_time_end: val[1] }),
      },
      hideInTable: !['REVIEW'].includes(tabStatus),
      hideInSearch: !['REVIEW'].includes(tabStatus),
      render: (_: any, record: any) => {
        return record.review_create_time || record.review_create_user_name ? (
          <>
            <div>{record.review_create_time}</div>
            <div>{record.review_create_user_name}</div>
          </>
        ) : (
          <span>-</span>
        );
      },
    },
    {
      title: '评审原因',
      ellipsis: true,
      width: 200,
      dataIndex: 'reason',
      hideInSearch: true,
      hideInTable: !['REVIEW'].includes(tabStatus),
    },
    {
      title: '操作',
      key: 'option',
      width: 230,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      className: 'wrap',
      render: (text: any, record: any) => {
        return [
          <Access key="detail" accessible={access.canSee('productlist_detail')}>
            <Link to={`/sign-establish/product-detail?id=${record.id}`}>详情</Link>
          </Access>,
          <Access key="detailMarketing" accessible={access.canSee('productlist_detail_Marketing')}>
            <Link to={`/sign-establish/product-detail-marketing?id=${record.id}`}>详情(营销)</Link>
          </Access>,
          <Access
            key="addSku"
            accessible={access.canSee('productlist_sku_add') && tabStatus == 'ON_SALE'}
          >
            <a
              onClick={() => {
                history.push(
                  `/sign-establish/establish-detail-sku?type=1&id=${
                    record.id
                  }&timeStamp=${new Date().getTime()}`,
                );
              }}
            >
              新增款式
            </a>
          </Access>,
          <Access
            key="version"
            accessible={
              record.latest_version == 1 &&
              access.canSee('productlist_version') &&
              tabStatus == 'ON_SALE'
            }
          >
            <a
              onClick={async () => {
                const res: any = await checkConductProject({ goods_id: record.id });
                if (res?.code != pubConfig.sCode) {
                  //当前产品有未完结的版本迭代流程，是否继续发起版本迭代
                  if (res.code == 'E000123') {
                    handleVersionIfContinue(res?.message, record.id);
                  } else {
                    pubMsg(res?.message);
                  }
                } else {
                  history.push(
                    `/sign-establish/establish-detail-version?type=1&id=${
                      record.id
                    }&timeStamp=${new Date().getTime()}`,
                  );
                }
              }}
            >
              版本迭代
            </a>
          </Access>,
          <Access
            key="spec"
            accessible={
              access.canSee('productlist_updateGoodsSkuSpecification') && tabStatus == 'ON_SALE'
            }
          >
            {/*规格修改*/}
            <SpecEdit key="spec" id={record.id} />
          </Access>,
          // <Access
          //   key="barcode"
          //   accessible={access.canSee('productlist_updateBarCode') && tabStatus == 'ON_SALE'}
          // >
          //   {/*修改商品条码*/}
          //   <BarCodeEdit dataSource={record?.goodsSkus} reload={ref?.current?.reload} />
          // </Access>,
          <Access
            key="editSku"
            accessible={access.canSee('productlist_editSku') && tabStatus == 'ON_SALE'}
          >
            {/*修改款式信息*/}
            <a
              onClick={() => {
                dropScope('/sign-establish/product-edit');
                setTimeout(() => {
                  history.push(`/sign-establish/product-edit?id=${record.id}`);
                }, 200);
              }}
            >
              修改款式信息
            </a>
          </Access>,
          // 产品定价
          <Access
            key="fixPrice"
            accessible={
              record.business_scope === 'IN' &&
              access.canSee('productlist_fix_price') &&
              tabStatus == 'ON_SALE'
            }
          >
            <FixPrice
              dicList={dicList}
              goodsSkus={record.goodsSkus}
              business_scope={record.business_scope}
              category_id={record.category_id}
            />
          </Access>,
          <Access
            key="turnWait"
            accessible={
              access.canSee('scm_product-list-turn-wait') &&
              ['ON_SALE'].includes(tabStatus) &&
              [1, 2].includes(Number(record.life_cycle))
            }
          >
            <TurnWait
              dicList={dicList}
              title="发起评审"
              data={record}
              reload={() => {
                statusCountAction();
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access
            key="changeAudit"
            accessible={
              access.canSee('scm_product-list-audit-result') && ['REVIEW'].includes(tabStatus)
            }
          >
            <ChangeAudit
              dicList={dicList}
              business_scope={record.business_scope}
              title="确认评审结果"
              data={record}
              reload={() => {
                statusCountAction();
                ref?.current?.reload();
              }}
            />
          </Access>,
          <Access key="log" accessible={access.canSee('scm_productlist_sync_toErp')}>
            <a
              onClick={() => {
                productlistSyncToErp(record.id);
              }}
            >
              配送类型同步到ERP
            </a>
          </Access>,
          // 评审日志
          <Access key="rlog" accessible={access.canSee('scm_productlist_review_log')}>
            <ReviewLog dicList={dicList} id={record.id} />
          </Access>,
          // 操作日志
          <Access key="slog" accessible={access.canSee('scm_productlist_log')}>
            <HandleLog dicList={dicList} trigger="操作日志" id={record.id} />
          </Access>,
        ];
      },
    },
  ];
  // 切换tabs时
  const changeTabs = async (key: any) => {
    sessionStorage.setItem(cacheKey, key == 'all' ? null : key);
    setTabStatus(key == 'all' ? null : key);
    setPageSize(20);
  };
  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
        tabActiveKey={tabStatus || 'all'}
        className="pubPageTabs"
        tabList={tabList}
        onTabChange={changeTabs}
      >
        <ProTable
          rowKey={(record) => record.id + record.batch_no}
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
            pageSize,
            onChange: (page, size) => {
              setPageSize(size);
            },
          }}
          params={{ sales_status: tabStatus }}
          bordered
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          scroll={{ x: 1800 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          dateFormatter="string"
          headerTitle={
            <Access
              key="audit-standard"
              accessible={access.canSee('scm_product-list-audit-standard')}
            >
              {/*产品自动评审标准*/}
              <AuditStandard reload={ref.current?.reload} dicList={dicList} />
            </Access>
          }
          revalidateOnFocus={false}
          toolBarRender={() => [
            <Access key="add" accessible={access.canSee('productlist_establish_add')}>
              <Space>
                <Button
                  onClick={() => {
                    dropScope('/sign-establish/establish-detail-add');
                    setTimeout(() => {
                      history.push('/sign-establish/establish-detail-add?type=1');
                    }, 200);
                  }}
                  ghost
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  新增立项商品
                </Button>
              </Space>
            </Access>,
          ]}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;
