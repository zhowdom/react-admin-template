/*跨境平台仓库管理列表页  @zhujing 2022-06-24*/
import { Access, connect, useAccess } from 'umi';
import { useRef, useState } from 'react';
import { useActivate } from 'react-activation';
import { Button, Popover, Space, Upload } from 'antd';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import type { ProFormInstance, ActionType, ProColumns } from '@ant-design/pro-components';
import * as api from '@/services/pages/storageManage';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import Update from './Dialogs/Update';
import { LinkOutlined, UploadOutlined } from '@ant-design/icons';
import { pubBeforeUpload, pubDownloadSysImportTemplate } from '@/utils/pubConfirm';
import { baseFileUpload } from '@/services/base';

const Page: React.FC<{ common: any }> = ({ common }) => {
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const [loadingObj, loadingObjSet] = useState<any>({
    uploading: false,
    downloadingTemp: false,
  });
  const access = useAccess();
  // keepAlive页面激活钩子函数
  useActivate(() => {
    actionRef?.current?.reload();
  });
  // 下载导入模板
  const downLoadTemp = async () => {
    loadingObjSet((values: any) => {
      return { ...values, downloadingTemp: true };
    });
    await pubDownloadSysImportTemplate('SYS_PLATFORM_TC');
    loadingObjSet((values: any) => {
      return { ...values, downloadingTemp: false };
    });
  };
  // 导入发货计划
  const handleUpload = async (data: any) => {
    loadingObjSet((values: any) => {
      return { ...values, uploading: true };
    });
    const res = await baseFileUpload({
      file: data.file,
      business_type: 'SYS_PLATFORM_TC',
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      loadingObjSet((values: any) => {
        return { ...values, uploading: false };
      });
      return;
    }
    const resData = await api.tcImport(res.data[0]);
    if (resData?.code != pubConfig.sCode) {
      pubMsg(resData?.message);
      loadingObjSet((values: any) => {
        return { ...values, uploading: false };
      });
      return;
    }
    loadingObjSet((values: any) => {
      return { ...values, uploading: false };
    });
    pubMsg('导入成功！' + resData?.message, 'success');
    actionRef?.current?.reload();
  };
  // 列表
  const columns: ProColumns<any>[] = [
    {
      title: 'TC(中转仓名称)',
      dataIndex: 'tc_name',
      hideInSearch: true,
      width: 140,
      align: 'center',
    },
    {
      title: '详细地址',
      dataIndex: 'address',
      hideInSearch: true,
    },
    {
      title: '联系人',
      dataIndex: 'contacts',
      hideInSearch: true,
      width: 120,
      align: 'center',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      hideInSearch: true,
      width: 120,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      width: 100,
      align: 'center',
      renderText: (text: any) => (text == '1' ? '启用' : '禁用'),
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (dom: any, record) => (
        <Access key="edit" accessible={access.canSee('platform_tc_update_by_id')}>
          <Update
            initialValues={record}
            title={'编辑'}
            trigger={<a>编辑</a>}
            reload={actionRef?.current?.reload}
            dicList={common.dicList}
          />
        </Access>
      ),
    },
  ];
  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable
        bordered
        columns={columns}
        actionRef={actionRef}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={async (params: any) => {
          const formData = {
            ...params,
            current_page: params.current,
            page_size: params.pageSize,
          };
          const res = await api.tcPage(formData);
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
        rowKey="id"
        search={false}
        dateFormatter="string"
        headerTitle={
          <Space>
            <Access accessible={access.canSee('platform_tc_insert')}>
              <Update reload={actionRef?.current?.reload} dicList={common.dicList} />
            </Access>
            <Access accessible={access.canSee('platform_tc_batch_import')}>
              <Popover
                key="down"
                title={'需要下载导入模板 ?'}
                content={
                  <Button
                    type="link"
                    loading={loadingObj.downloadingTemp}
                    disabled={loadingObj.downloadingTemp}
                    icon={<LinkOutlined />}
                    onClick={() => {
                      downLoadTemp();
                    }}
                  >
                    {loadingObj.downloadingTemp ? '下载中' : '下载导入模板'}
                  </Button>
                }
              >
                <Upload
                  beforeUpload={(file: any) =>
                    pubBeforeUpload({
                      file,
                      acceptType: ['xls', 'xlsx'], // 上传限制 非必填
                      maxCount: 1, // 非必填
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
                    disabled={loadingObj.uploading}
                    loading={loadingObj.uploading}
                    ghost
                  >
                    京东中转仓导入
                  </Button>
                </Upload>
              </Popover>
            </Access>
          </Space>
        }
        scroll={{ x: 800 }}
        sticky={{ offsetHeader: 48 }}
        defaultSize={'small'}
      />
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);
export default ConnectPage;
