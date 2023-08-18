import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess, Access, history, useActivate } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { Button, Space, Popover, Image, Popconfirm } from 'antd';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined, QuestionCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import type { TableListItem } from '@/types/contract';
import {
  getVendorContractPage,
  deleteStatus,
  batchDownloadContract,
  withdrawn,
} from '@/services/pages/contract';
import {
  pubGetVendorList,
  pubDownLoad,
  pubGetSigningList,
  pubPdfBlobDownLoad,
} from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubModal, pubFilter } from '@/utils/pubConfig';
import { dateFormat } from '@/utils/filter';

import type { ProFormInstance } from '@ant-design/pro-form';

import Add from './Dialog/Add';
import RenewContract from './Dialog/RenewContract';
import StopContract from './Dialog/StopContract';
import PubAuditHistory from '@/components/PubAuditShow/auditHistory';

const ContractManage = (props: any) => {
  const access = useAccess();
  const vendorId: any = history?.location?.query?.vendorId;
  const { common } = props;
  const [visible, setVisible] = useState({
    show: false,
    url: '',
  });
  const [downloading, setDownLoading] = useState(false);
  const [selectRows, setSelectRows] = useState([]);
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

  // 添加弹窗实例
  const addModel = useRef();
  const renewContractModel = useRef();
  const stopContractModel = useRef();
  const pubAuditHistoryModel = useRef();

  const formRef: any = useRef<ProFormInstance>();
  const ref: any = useRef(null);

  const initForm = () => {
    if (vendorId) {
      formRef?.current?.setFieldsValue({
        vendor_id: vendorId,
      });
      formRef?.current?.submit();
    } else {
      formRef?.current?.submit();
    }
  };
  useEffect(() => {
    initForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useActivate(() => {
    initForm();
  });
  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    console.log('查询', params);
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      begin_begin_date: params?.begin_time_data?.[0] ? params?.begin_time_data?.[0] : null, //开始日期
      begin_end_date: params?.begin_time_data?.[1] ? params?.begin_time_data?.[1] : null, //结束日期
      start_contract_finish: params?.contract_finish_time?.[0]
        ? params?.contract_finish_time?.[0]
        : null, //合同完成时间--开始日期
      end_contract_finish: params?.contract_finish_time?.[1]
        ? params?.contract_finish_time?.[1]
        : null, //合同完成时间--结束日期
      // start_end_date: params?.endTime?.[0] || null,
      // end_end_date: params?.endTime?.[1] || null,
    };
    delete postData.current;
    delete postData.pageSize;
    const res = await getVendorContractPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setSelectRows([]);
    ref?.current?.clearSelected();
    return {
      data: res?.code == pubConfig.sCode ? res.data.records : [],
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };
  // 新增 编辑弹窗
  const addModalOpen: any = (row?: any) => {
    const data: any = addModel?.current;
    data.open(row);
  };
  // 框架合同续签弹窗
  const renewContractModelOpen: any = (row?: any) => {
    const data: any = renewContractModel?.current;
    data.open(row);
  };
  // 终止合同弹窗
  const stopContractModelOpen: any = (row: any) => {
    const data: any = stopContractModel?.current;
    data.open(row);
  };
  // 审批历史弹窗
  const pubAuditHistoryModelOpen: any = (row: any) => {
    const data: any = pubAuditHistoryModel?.current;
    data.open(row.approval_history_id);
  };
  // 删除合同
  const delContract: any = (row: any) => {
    pubModal('是否确定删除合同编号为 ' + row.code + ' 的合同？')
      .then(async () => {
        const res = await deleteStatus({ id: row.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubMsg('操作成功！', 'success');
        setTimeout(() => {
          ref?.current?.reload();
        }, 200);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };

  // 弹窗关闭
  const modalClose = (data: any) => {
    console.log(data);
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };
  // 下载
  const downLoad: any = (row: any, isView?: boolean) => {
    if (!row.download_url) return pubMsg('当前合同无合同文件！');
    if (isView) {
      pubDownLoad(row?.view_url || row.download_url, row.name, true);
    } else {
      if (row.download_url.indexOf('aliyuncs.com') > -1) {
        window
          .fetch(row.download_url)
          .then((res) => {
            return res?.blob();
          })
          .then((res) => pubPdfBlobDownLoad(res, `${row.name}(${row.vendor_name})`));
      } else {
        pubDownLoad(row.download_url, row.name);
      }
    }
  };
  // 批量下载
  const downloadContract = async (ids: any) => {
    if (!ids.length) return pubMsg('请选择要下载的数据！');
    setDownLoading(true);
    const res: any = await batchDownloadContract({ ids: ids.join(',') });
    const type = res.response.headers.get('content-type');
    if (type === 'application/json') {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `${dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')}批量合同下载.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
      modalClose(true);
    }
    setDownLoading(false);
  };

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '合同编号',
      dataIndex: 'code',
      order: 6,
      align: 'center',
    },
    {
      title: '合同名称',
      dataIndex: 'name_id',
      order: 8,
      align: 'center',
      valueType: 'select',
      hideInTable: true,
      fieldProps: selectProps,
      valueEnum: common?.dicList.CONTRACT_NAME,
    },
    {
      title: '合同名称',
      dataIndex: 'name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '供应商(乙方)',
      dataIndex: 'vendor_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '供应商',
      dataIndex: 'vendor_id',
      valueType: 'select',
      hideInTable: true,
      order: 9,
      fieldProps: selectProps,
      request: async (v) => {
        const res: any = await pubGetVendorList(v);
        return res;
      },
    },
    {
      title: '签约主体(甲方)',
      dataIndex: 'subject_name',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '签约主体',
      dataIndex: 'subject_id',
      valueType: 'select',
      align: 'center',
      order: 10,
      hideInTable: true,
      fieldProps: selectProps,
      request: async (v) => {
        const res: any = await pubGetSigningList({ key_word: v?.keyWords });
        return res;
      },
    },
    {
      title: '签约状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      width: 120,
      order: 5,
      fieldProps: selectProps,
      valueEnum: common?.dicList.VENDOR_CONTACTS_STATUS,
      render: (_, record) => {
        const renderList = [];
        renderList.push(
          <p key="edit1" style={{ marginBottom: 0 }}>
            {pubFilter(common?.dicList.VENDOR_CONTACTS_STATUS, record.status)}
          </p>,
        );
        if (record.status == 2 || record.status == 4 || record.status == 5) {
          renderList.push(
            <Popover key="edit" content={record.remark} title="失败原因" trigger="hover">
              <QuestionCircleOutlined style={{ color: '#ff0000' }} />
            </Popover>,
          );
        }
        return renderList;
      },
    },
    {
      title: '创建方式',
      dataIndex: 'type',
      align: 'center',
      hideInSearch: true,
      render: (_, record) => {
        return pubFilter(common?.dicList?.VENDOR_CONTRACT_TYPE, record.type);
      },
    },
    {
      title: '合同开始时间',
      dataIndex: 'begin_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '合同开始时间',
      dataIndex: 'begin_time_data',
      align: 'center',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: '合同结束时间',
      dataIndex: 'end_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '合同剩余天数',
      dataIndex: 'remainingDays',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '签约完成时间',
      dataIndex: 'contract_finish_date',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '签约完成时间',
      dataIndex: 'contract_finish_time',
      hideInTable: true,
      valueType: 'dateRange',
      align: 'center',
    },
    {
      title: '操作',
      key: 'option',
      width: 220,
      align: 'center',
      valueType: 'option',
      className: 'wrap',
      render: (_, row) => {
        const renderList = [
          <a
            onClick={() => {
              addModalOpen({ ...row, readonly: true });
            }}
            key="detail"
          >
            查看
          </a>,
          <Access key="down" accessible={access.canSee('contract_download')}>
            <a
              onClick={() => {
                downLoad(row);
              }}
              key="down"
            >
              合同下载
            </a>
          </Access>,
          <Access key="viewContact" accessible={access.canSee('contract_download')}>
            <a
              onClick={() => {
                downLoad(row, true);
              }}
            >
              合同预览
            </a>
          </Access>,
        ];

        if ([2, 12, 13].includes(row.status)) {
          renderList.push(
            <Access key="editAgin" accessible={access.canSee('contract_add')}>
              <a
                onClick={() => {
                  addModalOpen(row);
                }}
              >
                重新提交审批
              </a>
            </Access>,
          );
        }
        if ([2, 10, 13, 12].includes(row.status)) {
          renderList.push(
            <Access key="delete" accessible={access.canSee('contract_delete')}>
              <a
                onClick={() => {
                  delContract(row);
                }}
              >
                删除
              </a>
            </Access>,
          );
        }
        if ((row.status == 6 || row.status == 9) && row.name_id == 1) {
          renderList.push(
            <Access key="continue" accessible={access.canSee('contract_extsign')}>
              <a
                onClick={() => {
                  renewContractModelOpen(row);
                }}
              >
                续签申请
              </a>
            </Access>,
          );
        }
        if (row.status == 6) {
          renderList.push(
            <Access key="stop" accessible={access.canSee('contract_stop')}>
              <a
                onClick={() => {
                  stopContractModelOpen(row);
                }}
              >
                终止合同
              </a>
            </Access>,
          );
        }
        if (row.status == 6 && row.renew_sys_files_url) {
          renderList.push(
            <a
              onClick={() => {
                setVisible({
                  show: true,
                  url: row.renew_sys_files_url,
                });
              }}
              key="stop2"
            >
              营业执照
            </a>,
          );
        }
        if (row.status == 8 && row.finish_sys_files) {
          renderList.push(
            <Access key="stop" accessible={access.canSee('down_view_stop_file')}>
              <a
                onClick={() => {
                  pubDownLoad(row?.finish_sys_files[0]?.access_url, `${row?.name}-终止附件`);
                }}
                key="stop3"
              >
                下载终止附件
              </a>
            </Access>,
          );
        }
        // 合同审批中和续签审批中撤回
        if ([1, 7].includes(row.status)) {
          renderList.push(
            <Access key="cancel" accessible={access.canSee('scm_contract_withdrawn')}>
              <Popconfirm
                title="确定需撤回?"
                onConfirm={async () => {
                  const res = await withdrawn({ id: row.id });
                  if (res.code == pubConfig.sCode) {
                    pubMsg(res?.message, 'success');
                    ref.current?.reload();
                    return true;
                  } else {
                    pubMsg(`提交失败: ${res.message}`);
                    return false;
                  }
                }}
                okText="确定"
                cancelText="取消"
              >
                <a>撤回</a>
              </Popconfirm>
            </Access>,
          );
        }
        if (row.status != 13) {
          renderList.push(
            <Access key="history" accessible={access.canSee('contract_history')}>
              <a
                onClick={() => {
                  pubAuditHistoryModelOpen(row);
                }}
              >
                审批历史
              </a>
            </Access>,
          );
        }

        return renderList;
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
      >
        <ProTable<TableListItem>
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{}}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getList}
          rowSelection={
            access.canSee('contract_download_list')
              ? {
                  fixed: true,
                  defaultSelectedRowKeys: selectRows,
                  onChange: (selectedRowKeys: any) => {
                    setSelectRows(selectedRowKeys);
                  },
                }
              : false
          }
          manualRequest={true}
          rowKey="id"
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          dateFormatter="string"
          headerTitle="合同列表"
          toolBarRender={() => [
            <>
              <Space>
                <Access key="down" accessible={access.canSee('contract_download_list')}>
                  <Button
                    key="cancel"
                    type="primary"
                    ghost
                    icon={<DownloadOutlined />}
                    disabled={downloading}
                    loading={downloading}
                    onClick={() => {
                      downloadContract(selectRows);
                    }}
                  >
                    批量下载合同
                  </Button>
                </Access>
                <Access key="create" accessible={access.canSee('contract_add')}>
                  <Button
                    onClick={() => {
                      addModalOpen();
                    }}
                    ghost
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    创建合同
                  </Button>
                </Access>
              </Space>
            </>,
          ]}
        />
      </PageContainer>
      <Add addModel={addModel} handleClose={modalClose} dicList={common?.dicList} />
      <RenewContract
        renewContractModel={renewContractModel}
        handleClose={modalClose}
        dicList={common?.dicList}
      />
      <StopContract stopContractModel={stopContractModel} handleClose={modalClose} />
      <PubAuditHistory pubAuditHistoryModel={pubAuditHistoryModel} handleClose={modalClose} />
      <Image
        style={{ display: 'none' }}
        src={visible.url}
        preview={{
          visible: visible.show,
          src: visible.url,
          onVisibleChange: (value) => {
            setVisible({ show: value, url: '' });
          },
        }}
      />
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ContractManage);
export default ConnectPage;
