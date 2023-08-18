import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import type { PlatformShopTableListItem } from '@/types/storage';
import {
  linkManagementTestPage,
  deleteByIdLinkManagementTest,
} from '@/services/pages/settinsLinksManage';
import { pubConfig, pubMsg, pubFilter, pubModal } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';

import AddDialog from './AddDialog';
import { useAccess, Access } from 'umi';

const ContractManage = (props: any) => {
  const { common } = props;
  console.log(common);
  // 添加弹窗实例
  const addModel = useRef();
  const access = useAccess();

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
    const res = await linkManagementTestPage(postData);
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

  // 删除
  const deleteLink = (data: any) => {
    pubModal(`是否确定删除此链接？`)
      .then(async () => {
        const res = await deleteByIdLinkManagementTest({ id: data.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        ref?.current?.reload();
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  const columns: ProColumns<PlatformShopTableListItem>[] = [
    {
      title: '平台类型',
      dataIndex: 'platform_code',
      valueType: 'select',
      align: 'center',
      width: 110,
      fieldProps: selectProps,
      valueEnum: common?.dicList?.SYS_PLATFORM_NAME,
      render: (_: any, row: any) => {
        return pubFilter(common?.dicList?.SYS_PLATFORM_NAME, row?.platform_code);
      },
    },
    {
      title: '链接ID',
      dataIndex: 'link_id',
      align: 'center',
    },
    {
      title: '店铺SKU',
      dataIndex: 'shop_sku_code',
      align: 'center',
    },
    {
      title: '添加时间',
      dataIndex: 'create_time',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_, row) => [
        <Access key="edit" accessible={access.canSee('link_edit')}>
          <a
            onClick={() => {
              addModalOpen(row);
            }}
            key="edit"
          >
            编辑
          </a>
        </Access>,
        <Access key="del" accessible={access.canSee('link_delete')}>
          <a
            onClick={() => {
              deleteLink(row);
            }}
            key="del"
          >
            删除
          </a>
        </Access>,
      ],
    },
  ];
  return (
    <>
      <AddDialog addModel={addModel} handleClose={modalClose} dicList={common?.dicList} />

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
          dateFormatter="string"
          headerTitle="链接设置管理"
          toolBarRender={() => [
            <>
              <Space>
                <Access key="accessButton" accessible={access.canSee('link_add')}>
                  <Button
                    onClick={() => {
                      addModalOpen();
                    }}
                    ghost
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    新增链接
                  </Button>
                </Access>
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
