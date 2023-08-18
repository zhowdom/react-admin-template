import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef, useState } from 'react';
import { Button, Space } from 'antd';
// Upload
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
// import { LinkOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { PlusOutlined } from '@ant-design/icons';
import type { PlatformShopTableListItem } from '@/types/storage';
import { getSysPlatformWarehousingPage, syncPopWarehouse } from '@/services/pages/storageManage';
import { pubConfig, pubMsg, pubFilter, pubModal } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  // pubDownloadSysImportTemplate,
  pubGetPlatformList,
  pubGetPlatformRegion,
  // pubBeforeUpload,
} from '@/utils/pubConfirm';
// import { baseFileUpload } from '@/services/base';

import AddDialog from './AddDialog';
import { useAccess, Access } from 'umi';
// import { dateFormat } from '@/utils/filter';

const ContractManage = (props: any) => {
  const { common } = props;
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
  // const [loading, setLoading] = useState({
  //   downLoading: false,
  //   upLoading: false,
  // });
  // 添加弹窗实例
  const addModel = useRef();
  const access = useAccess();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    console.log('查询', params);
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    delete postData.current;
    delete postData.pageSize;
    const res = await getSysPlatformWarehousingPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    return {
      data: res?.code == pubConfig.sCode ? res.data.records : [],
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };
  // 新增 编辑弹窗
  const addModalOpen: any = (row?: any) => {
    const data: any = addModel?.current;
    data.open(row?.id);
  };

  // 弹窗关闭
  const modalClose = (data: any) => {
    console.log(data);
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };

  // 下载导入模板
  // const downLoadTemp = async () => {
  //   setLoading((values: any) => {
  //     return { ...values, downLoading: true };
  //   });
  //   const res = await pubDownloadSysImportTemplate('PLATFORM_WAREHOUSING_CN');
  //   console.log(res);
  //   setLoading((values: any) => {
  //     return { ...values, downLoading: false };
  //   });
  // };

  // 批量导入
  // const handleUpload = async (data: any) => {
  //   setLoading((values: any) => {
  //     return { ...values, upLoading: true };
  //   });
  //   const res = await baseFileUpload({
  //     file: data.file,
  //     business_type: 'DELIVERY_PLAY_IMPORT',
  //   });
  //   if (res?.code != pubConfig.sCode) {
  //     pubMsg(res?.message);
  //     setLoading((values: any) => {
  //       return { ...values, upLoading: false };
  //     });
  //     return;
  //   }
  //   const resData = await importPlatformWarehousing(res.data ? res.data[0] : null);
  //   console.log(resData);
  //   const type = resData.response.headers.get('content-type');
  //   console.log(type);
  //   if (type === 'application/json') {
  //     const reader = new FileReader();
  //     reader.readAsText(resData.data);
  //     reader.onload = (e) => {
  //       const json = JSON.parse(e?.target?.result as string);
  //       if (json?.code != pubConfig.sCode) {
  //         pubMsg(json?.message);
  //         setLoading((values: any) => {
  //           return { ...values, upLoading: false };
  //         });
  //         return;
  //       }
  //       pubMsg('导入成功！', 'success');
  //       ref?.current?.reload();
  //     };
  //   } else {
  //     pubMsg('导入失败！');
  //     const blob = new Blob([resData.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
  //     const objectURL = URL.createObjectURL(blob);
  //     const btn = document.createElement('a');
  //     const fileData = resData.response.headers.get('content-disposition');
  //     let fileName = `平台仓库导入错误数据${dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')}.xls`;
  //     if (fileData) {
  //       fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
  //     }
  //     btn.download = fileName;
  //     btn.href = objectURL;
  //     btn.click();
  //     URL.revokeObjectURL(objectURL);
  //     setLoading((values: any) => {
  //       return { ...values, upLoading: false };
  //     });
  //   }
  // };

  const columns: ProColumns<PlatformShopTableListItem>[] = [
    {
      title: '平台',
      dataIndex: 'platform_id',
      valueType: 'select',
      align: 'center',
      width: 90,
      order: 10,
      request: async () => {
        const res: any = await pubGetPlatformList({ business_scope: 'CN' });
        return res.filter((v: any) => !['1552846034395881473'].includes(v.value));
      },
      render: (_: any, record: any) => <>{record.platform_name || '-'} </>,
      fieldProps: {
        ...selectProps,
        onChange: () => {
          formRef.current?.setFieldsValue({
            region: null,
          });
        },
      },
    },
    {
      title: '仓库区域',
      dataIndex: 'region',
      align: 'center',
      fieldProps: selectProps,
      dependencies: ['platform_id'],
      valueType: 'select',
      request: async (v) => {
        if (!v.platform_id) {
          return [];
        }
        const res: any = await pubGetPlatformRegion({
          ...v,
          id: v.platform_id,
        });
        return res.map((item: any) => {
          return {
            ...item,
            value: item.label,
          };
        });
      },
    },
    {
      title: '仓库区域编码',
      dataIndex: 'region_code',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '仓库名称',
      dataIndex: 'warehousing_name',
      align: 'center',
    },
    {
      title: '仓库代码',
      dataIndex: 'warehousing_code',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '仓库联系人',
      dataIndex: 'contacts',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '联系人电话',
      dataIndex: 'phone',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '仓库详细地址',
      dataIndex: 'address',
      align: 'left',
      hideInSearch: true,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
      width: 80,
      fieldProps: selectProps,
      valueEnum: common.dicList.SYS_ENABLE_STATUS,
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.SYS_ENABLE_STATUS, record.status);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      align: 'center',
      valueType: 'option',
      render: (_, row: any) => [
        <Access key="editButton" accessible={access.canSee('warehouse_edit')}>
          <a
            onClick={() => {
              addModalOpen(row);
            }}
            key="edit"
          >
            编辑
          </a>
        </Access>,
      ],
    },
  ];
  // 同步
  const synchronizationAction = async () => {
    pubModal('是否确定同步数据?')
      .then(async () => {
        setConfirmLoading(true);
        const res: any = await syncPopWarehouse({});
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功', 'success');
          ref?.current?.reload();
        }
        setConfirmLoading(false);
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  return (
    <>
      <AddDialog addModel={addModel} handleClose={modalClose} />

      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable<PlatformShopTableListItem>
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getList}
          rowKey="id"
          search={{ defaultCollapsed: false, className: 'light-search-form' }}
          dateFormatter="string"
          toolBarRender={() => [
            <>
              <Space>
                <Access key="addButton" accessible={access.canSee('warehouse_add')}>
                  <Button
                    onClick={() => {
                      addModalOpen();
                    }}
                    ghost
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    新增仓库
                  </Button>
                </Access>
                <Access
                  key="approval"
                  accessible={
                    access.canSee('scm_warehouse_sync_pop') &&
                    formRef.current?.getFieldValue('platform_id') == '1532170842660691969'
                  }
                >
                  <Button
                    loading={confirmLoading}
                    onClick={() => {
                      synchronizationAction();
                    }}
                  >
                    同步京东POP仓库
                  </Button>
                </Access>
                {/* <Access key="import" accessible={access.canSee('xxxxx')}>
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
                      批量导入
                    </Button>
                  </Upload>
                </Access>
                <Access key="down" accessible={access.canSee('xxxxx')}>
                  <Button
                    loading={loading.downLoading}
                    disabled={loading.downLoading}
                    icon={<LinkOutlined />}
                    onClick={() => {
                      downLoadTemp();
                    }}
                  >
                    {loading.downLoading ? '下载中' : '下载模板'}
                  </Button>
                </Access> */}
              </Space>
            </>,
          ]}
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ContractManage);
export default ConnectPage;
