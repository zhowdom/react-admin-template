import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess, Access } from 'umi';
import { useState, useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import type { TableListItem } from '@/types/sign';
import Dialog from './dialog';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  getList,
  getCompanyVerifyUrl,
  beforeAuthsign,
  cancelExtsignAutoPage,
} from '@/services/pages/sign';
import { pubConfig, pubMsg, pubModal, pubAlert, pubFilter } from '@/utils/pubConfig';
import { pubGoUrl } from '@/utils/pubConfirm';

const Sign = (props: any) => {
  const access = useAccess();
  const { sign, common } = props;
  const { dicList } = common;
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
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
  const [state, setState] = useState({
    isModalVisible: false,
    dialogForm: sign.initDiaData, // 弹窗表单
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
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  // 新增或编辑,有id编辑,无id新增
  const toUpdate: any = (row: { id: string | undefined }) => {
    setState((pre: any) => {
      return {
        ...pre,
        dialogForm: row?.id ? row : sign.initDiaData,
        isModalVisible: true,
      };
    });
  };
  // 弹窗关闭
  const handleClose = (cancel: any) => {
    setState((pre) => {
      return { ...pre, isModalVisible: false };
    });
    if (!cancel) {
      ref?.current?.reload();
    }
  };
  // 认证
  const toAuthentication: any = async (row: { id: string | undefined }) => {
    pubModal('是否提交电子合同签约主体认证？')
      .then(async () => {
        const res = await getCompanyVerifyUrl({ id: row.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubAlert('请在新窗口链接里完成签约认证！').then(() => {
          pubGoUrl(res.data);
        });
        setTimeout(() => {
          ref?.current?.reload();
        }, 200);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  // 授权自动签约
  const toSign: any = async (row: { id: string | undefined }) => {
    pubModal('是否提交 “授权自动签约” 请求？')
      .then(async () => {
        const res = await beforeAuthsign({ id: row.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubAlert('请在新窗口链接里完成签约认证！').then(() => {
          pubGoUrl(res.data);
        });
        setTimeout(() => {
          ref?.current?.reload();
        }, 200);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  // 取消自动签约
  const toCancelSign: any = async (row: { id: string | undefined }) => {
    pubModal('是否禁用 “自动签约”？')
      .then(async () => {
        const res = await cancelExtsignAutoPage({ id: row.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubAlert('请在新窗口链接里完成签约认证！').then(() => {
          pubGoUrl(res.data);
        });
        setTimeout(() => {
          ref?.current?.reload();
        }, 200);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '主体名称',
      dataIndex: 'client_corp_name',
      align: 'center',
    },
    // {
    //   title: '是否默认',
    //   dataIndex: 'is_default',
    //   valueType: 'select',
    //   align: 'center',
    //   fieldProps: selectProps,
    //   hideInSearch: true,
    //   valueEnum: dicList.SC_YES_NO,
    //   render: (_, record: any) => {
    //     const item = dicList.SC_YES_NO;
    //     const key = record?.is_default;
    //     return [<span key="is_default">{item?.[key]?.text || '-'}</span>];
    //   },
    // },
    {
      title: '公司类型',
      dataIndex: 'abroad',
      valueType: 'select',
      align: 'center',
      fieldProps: selectProps,
      valueEnum: dicList.SYS_ABROAD,
      render: (_: any, record: any) => {
        return pubFilter(dicList.SYS_ABROAD, record.abroad) || '-';
      },
    },
    {
      title: '认证状态',
      dataIndex: 'auth_status',
      valueType: 'select',
      align: 'center',
      fieldProps: selectProps,
      valueEnum: dicList.USER_AUTH_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(dicList.USER_AUTH_STATUS, record.auth_status);
      },
    },
    {
      title: '是否自动签约',
      dataIndex: 'extsign_auto_status',
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(
          {
            0: { text: '否' },
            1: { text: '是' },
          },
          record.extsign_auto_status,
        );
      },
    },
    {
      title: '是否具有出口资质',
      dataIndex: 'export_qualification',
      hideInSearch: true,
      align: 'center',
      valueType: 'select',
      valueEnum: dicList.VENDOR_SIGNING_EXPORT_QUALIFICATION,
    },

    // {
    //   title: '启用状态',
    //   dataIndex: 'status',
    //   hideInSearch: true,
    //   align: 'center',
    //   render: (_, record: any) => {
    //     const item = dicList.VENDOR_SIGNING_STATUS;
    //     const key = record?.status;
    //     return [<span key="status">{item?.[key]?.text || '-'}</span>];
    //   },
    // },

    {
      title: '操作',
      key: 'option',
      width: 220,
      align: 'center',
      valueType: 'option',
      render: (text: any, record: any) => {
        const renderList = [];
        if (record.auth_status == 0 || record.auth_status == 2) {
          renderList.push(
            <Access key="edit" accessible={access.canSee('contract_sign_edit')}>
              <a
                onClick={() => {
                  toUpdate(record);
                }}
              >
                编辑
              </a>
            </Access>,
          );
        }
        if (record.auth_status == 0 || record.auth_status == 1 || record.auth_status == 2) {
          renderList.push(
            <Access key="verify" accessible={access.canSee('contract_sign_verifyUrl')}>
              <a
                onClick={() => {
                  toAuthentication(record);
                }}
                key="edit"
              >
                认证
              </a>
            </Access>,
          );
        }
        if (record.auth_status == 3 && record.extsign_auto_status == 0) {
          renderList.push(
            <Access key="autoSign" accessible={access.canSee('contract_sign_extsignAutoPage')}>
              <a
                onClick={() => {
                  toSign(record);
                }}
              >
                授权自动签约
              </a>
            </Access>,
          );
        }
        if (record.auth_status == 3 && record.extsign_auto_status == 1) {
          renderList.push(
            <Access key="enable" accessible={access.canSee('contract_sign_cancel')}>
              <a
                onClick={() => {
                  toCancelSign(record);
                }}
              >
                禁用
              </a>
            </Access>,
            <Access key="view" accessible={access.canSee('contract_url_view_protocol')}>
              <a
                onClick={() => {
                  pubGoUrl(record.extsign_auto_contract_viewpdf_url);
                }}
                key="edit"
              >
                查看签约协议
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
      <Dialog
        state={state}
        isModalVisible={state.isModalVisible}
        handleClose={handleClose}
        dicList={dicList}
      />
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
          pagination={{
            showSizeChanger: true,
          }}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          rowKey="id"
          dateFormatter="string"
          toolBarRender={() => [
            <Space key="update">
              <Access key="add" accessible={access.canSee('contract_sign_add')}>
                <Button
                  onClick={() => {
                    toUpdate();
                  }}
                  ghost
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  添加签约主体公司
                </Button>
              </Access>
            </Space>,
          ]}
        />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(
  ({ sign, common }: { sign: Record<string, unknown>; common: Record<string, unknown> }) => ({
    sign,
    common,
  }),
)(Sign);
export default ConnectPage;
