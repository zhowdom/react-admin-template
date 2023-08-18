import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess, Access, history } from 'umi';
import React, { useRef, useState } from 'react';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useActivate } from 'react-activation';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubFilter, pubModal } from '@/utils/pubConfig';
import { getList, deleteById, productInfoExport, statusCount } from '@/services/pages/establish';
import { pubGetUserList } from '@/utils/pubConfirm';
import ProductLine from '@/components/PubForm/ProductLine';
import AuditBack from './components/AuditBack';
import SkuTable from './components/SkuTable';
import SkuSpecEdit from './components/SkuSpecEdit';
import { Button } from 'antd';

const Establish = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  const [downLoadingObj, setDownLoadingObj] = useState({});
  const [exportForm, setExportForm] = useState({});
  const [tabList, setTabList] = useState([]);
  const [tabStatus, setTabStatus] = useState<any>('-1');
  const [pageSize, setPageSize] = useState<any>(20);
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
  // 切换tabs时
  const changeTabs = async (key: any) => {
    setTabStatus(key);
    setPageSize(20);
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      business_scope: params.category_data ? params.category_data[0] : '', //业务范畴
      vendor_group_id: params.category_data ? params.category_data[1] : '', //产品线
      time_start: (params.time && params.time[0]) || null,
      time_end: (params.time && params.time[1]) || null,
      status: params?.tabStatus === '-1' ? null : params?.tabStatus,
    };
    setExportForm(postData);
    statusCountAction();
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    res?.data?.records?.forEach((v: any, i: number) => {
      v.index = `${i}`;
      setDownLoadingObj((pre: any) => {
        return {
          ...pre,
          [`${i}`]: false,
        };
      });
    });
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 导出产品信息
  const downLoadProductInfo = async (index: string, id: string) => {
    setDownLoadingObj((pre: any) => {
      return {
        ...pre,
        [`${index}`]: true,
      };
    });
    const res: any = await productInfoExport({ ...exportForm, id });
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `产品信息导出.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setDownLoadingObj((pre: any) => {
      return {
        ...pre,
        [`${index}`]: false,
      };
    });
  };
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  useActivate(() => {
    if (ref?.current) ref?.current?.reload();
  });
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
  // 删除
  const deleteAction = async (id: string) => {
    pubModal(`是否确定删除此记录？`)
      .then(async () => {
        const res: any = await deleteById({ id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('删除成功', 'success');
          ref?.current?.reload();
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 查看
  const Detail = (params: any) => {
    let link: any;
    // 立项详情
    if (['0', '1', '2', , '3', '101'].includes(params.record.approval_status)) {
      link = `/sign-establish/establish-detail?type=2&id=${params.record.id}`;
      //定稿详情
    } else if (['4', '5', '6', '401'].includes(params.record.approval_status)) {
      link = `/sign-establish/finalize-detail?type=2&id=${params.record.id}`;
      // 审批详情
    } else if (['7', '8', '9', '10'].includes(params.record.approval_status)) {
      link = `/sign-establish/price-approval/detail?id=${params.record.id}&readonly=1`;
      // 签样详情
    } else if (params.record.approval_status == '11') {
      link = `/sign-establish/signature/detail?id=${params.record.id}&readonly=1`;
    }
    return (
      <Access key="detail" accessible={access.canSee('establish_detail')}>
        <a
          onClick={() => {
            history.push(`${link}&timeStamp=${new Date().getTime()}`);
          }}
        >
          查看
        </a>
      </Access>
    );
  };
  const ReSubmit = (params: any) => {
    return (
      <Access
        key="editEs"
        accessible={
          params.record?.approval_status == '101'
            ? access.canSee('scm_establish_rewrite')
            : access.canSee('establish_edit')
        }
      >
        <a
          onClick={() => {
            history.push(
              `/sign-establish/establish-detail-edit?type=1&id=${
                params.record.id
              }&timeStamp=${new Date().getTime()}`,
            );
          }}
        >
          {params.record?.approval_status == '101' ? '编辑' : '修改立项'}
        </a>
      </Access>
    );
  };
  const Finalize = (params: any) => {
    return (
      <Access
        key="editFin"
        accessible={
          params.record?.approval_status == '401'
            ? access.canSee('scm_finalized_rewrite')
            : access.canSee('establish_finalized')
        }
      >
        <a
          onClick={() => {
            history.push(
              `/sign-establish/finalize-detail-edit?type=1&id=${
                params.record.id
              }&timeStamp=${new Date().getTime()}`,
            );
          }}
        >
          {params.reAction
            ? params.record?.approval_status == '401'
              ? '编辑'
              : '重新定稿'
            : params.edit
            ? '定稿修改'
            : '定稿'}
        </a>
      </Access>
    );
  };
  // 价格审批
  const Approval = (params: any) => {
    return (
      <Access key="Approval" accessible={access.canSee('establish_approval')}>
        <a
          onClick={() => {
            history.push(
              `/sign-establish/price-approval/detail?id=${
                params.record.id
              }&from=establish&timeStamp=${new Date().getTime()}`,
            );
          }}
        >
          价格审批
        </a>
      </Access>
    );
  };
  // 开模申请
  const Mould = (params: any) => {
    return (
      <Access key="Mould" accessible={access.canSee('establish_mould_apply')}>
        <a
          onClick={() => {
            history.push(
              `/sign-establish/apply-mould?id=${
                params.record.id
              }&timeStamp=${new Date().getTime()}`,
            );
          }}
        >
          开模申请
        </a>
      </Access>
    );
  };
  const Delete = ({ record }: any) => {
    return (
      <Access
        key="editFin"
        accessible={
          record?.approval_status == '401'
            ? access.canSee('scm_finalized_rewrite_delete')
            : record?.approval_status == '101'
            ? access.canSee('scm_establish_rewrite_delete')
            : access.canSee('establish_delete')
        }
      >
        <a
          onClick={() => {
            deleteAction(record.id);
          }}
        >
          删除
        </a>
      </Access>
    );
  };
  const ReBack = ({ record }: any) => {
    return (
      <Access
        key="cancel"
        accessible={
          (record.approval_status == '1' && access.canSee('establish_cancel')) ||
          (record.approval_status == '4' && access.canSee('establish_finalized_cancel')) ||
          (record.approval_status == '7' && access.canSee('establish_approval_cancel'))
        }
      >
        <AuditBack
          reload={() => ref?.current?.reload()}
          id={record?.id}
          approval_status={record?.approval_status}
          trigger={<a>撤回</a>}
        />
      </Access>
    );
  };
  // 获取发起人
  const pubGetUserListAction = async (v: any): Promise<any> => {
    const res: any = await pubGetUserList(v);
    return res || [];
  };

  const columns: ProColumns<any>[] = [
    {
      title: '立项编号',
      dataIndex: 'project_code',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '产品线',
      dataIndex: 'vendor_group_name',
      hideInSearch: true,
      align: 'center',
      width: 180,
      renderText: (text, record: any) =>
        `${pubFilter(common?.dicList?.SYS_BUSINESS_SCOPE, record.business_scope)}-${text}`,
    },
    {
      title: '产品线',
      dataIndex: 'category_data',
      hideInTable: true,
      order: 8,
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
      title: '产品编码',
      dataIndex: 'goods_code',
      align: 'center',
      order: 6,
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      align: 'center',
      order: 7,
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      width: '100px',
      order: 6,
      align: 'center',
      onCell: () => ({ colSpan: 3, style: { padding: 0 } }),
      className: 'p-table-inTable noBorder',
      render: (_, record: any) => (
        <SkuTable data={record?.skus || []} dicList={dicList} showCount={true} />
      ),
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      width: '200px',
      order: 6,
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      hideInSearch: true,
      width: '100px',
      align: 'center',
      onCell: () => ({ colSpan: 0, style: { padding: 0 } }),
    },
    {
      title: '立项类型',
      dataIndex: 'type',
      align: 'center',
      width: 120,
      order: 5,
      valueEnum: dicList.PROJECTS_TYPE,
      render: (_: any, record: any) => {
        const item = dicList.PROJECTS_TYPE;
        const key = record?.type;
        return [<span key="type">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '当前阶段',
      dataIndex: 'approval_status',
      valueType: 'select',
      align: 'center',
      order: 4,
      width: 120,
      hideInSearch: true,
      fieldProps: selectProps,
      valueEnum: () => {
        const temp = dicList?.PROJECTS_APPROVAL_STATUS
          ? JSON.parse(JSON.stringify(dicList?.PROJECTS_APPROVAL_STATUS))
          : null;
        if (temp) {
          delete temp?.['0'];
        }
        return temp;
      },
      render: (_: any, record: any) => {
        const item = dicList.PROJECTS_APPROVAL_STATUS;
        const key = record?.approval_status;
        return [<span key="approval_status">{item?.[key]?.text || '-'}</span>];
      },
    },

    {
      title: '发起时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      width: 150,
      sorter: (a: any, b: any) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
      align: 'center',
    },
    {
      title: '发起时间',
      dataIndex: 'time',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
      order: 1,
    },
    {
      title: '发起人',
      dataIndex: 'create_user_id',
      align: 'center',
      fieldProps: selectProps,
      valueType: 'select',
      hideInTable: true,
      order: 3,
      request: pubGetUserListAction,
    },
    {
      title: '发起人',
      dataIndex: 'create_user_name',
      align: 'center',
      width: 120,
      hideInSearch: true,
    },

    {
      title: '产品开发',
      dataIndex: 'developer_id',
      align: 'center',
      fieldProps: selectProps,
      valueType: 'select',
      hideInTable: true,
      order: 2,
      request: pubGetUserListAction,
    },
    {
      title: '操作',
      key: 'option',
      width: 180,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      className: 'wrap',
      render: (text: any, record: any) => {
        if (record.approval_status == '1') {
          // 立项中
          return [<Detail key="detail" record={record} />, <ReBack key="reback" record={record} />];
        } else if (['2', '0'].includes(record.approval_status)) {
          // 立项不通过,新建,立项定稿
          return [
            <Detail key="detail" record={record} />,
            <ReSubmit key="reSubmit" record={record} />,
            <Delete key="delete" record={record} />,
          ];
        }  else if (['101'].includes(record.approval_status)) {
          // 草稿
          return [
            <ReSubmit key="reSubmit" record={record} />,
            <Delete key="delete" record={record} />,
          ];
        }else if (record.approval_status == '3') {
          // 立项通过
          return [
            <Detail key="detail" record={record} />,
            <Finalize key="finalize" record={record} />,
          ];
        } else if (record.approval_status == '4') {
          // 定稿中
          return [<Detail key="detail" record={record} />, <ReBack key="reback" record={record} />];
        } else if (record.approval_status == '5' ) {
          // 定稿不通过,定稿草稿
          return [
            <Detail key="detail" record={record} />,
            <Finalize key="finalize" reAction={true} record={record} />,
            <Delete key="delete" record={record} />,
          ];
          // 已定稿
        } else if (record.approval_status == '401') {
          // 草稿
          return [
            <Finalize key="finalize" reAction={true} record={record} />,
            <Delete key="delete" record={record} />,
          ];
          // 已定稿
        } else if (record.approval_status == '6') {
          // 已定稿
          return [
            <Detail key="detail" record={record} />,
            <Finalize key="finalize" record={record} edit={true} />,
            <Approval key="approval" record={record} />,
            <Mould key="mould" record={record} />,
          ];
        } else if (record.approval_status == '7') {
          // 价格审批中
          return [<Detail key="detail" record={record} />, <ReBack key="reback" record={record} />];
          // 待签样
        } else if (record.approval_status == '10') {
          return [
            <Detail key="detail" record={record} />,
            // 设置箱规
            <Access key="setSpec" accessible={access.canSee('scm_establish_set_spec')}>
              <SkuSpecEdit
                key="specEdit"
                initData={{ goods_code: record.goods_code, name: record.name, id: record.id }}
              />
            </Access>,
            // 下载产品信息
            <Access
              key="downloadInfo"
              accessible={access.canSee('scm_establish_productInfo_download')}
            >
              <Button
                type="link"
                loading={downLoadingObj[record.index]}
                onClick={() => {
                  downLoadProductInfo(record.index, record.id);
                }}
              >
                下载产品信息
              </Button>
            </Access>,
          ];
        } else {
          return [<Detail key="detail" record={record} />];
        }
      },
    },
  ];

  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
        fixedHeader
        tabActiveKey={tabStatus || '-1'}
        className="pubPageTabs"
        tabList={tabList}
        onTabChange={changeTabs}
      >
        <ProTable
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
          params={{ tabStatus }}
          bordered
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          scroll={{ x: 1800 }}
          sticky={{ offsetHeader: 48 }}
          defaultSize={'small'}
          rowKey="id"
          dateFormatter="string"
          headerTitle="立项管理"
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Establish);
export default ConnectPage;
