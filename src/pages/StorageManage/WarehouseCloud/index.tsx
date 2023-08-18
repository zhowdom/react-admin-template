import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef, useState } from 'react';
import { Button, Space } from 'antd';
import { useAccess, Access } from 'umi';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { PlatformShopTableListItem } from '@/types/storage';
import {
  sysCloudWarehousingCloudPage,
  sysCloudWarehousingSyn,
} from '@/services/pages/storageManage';
import { pubConfig, pubMsg, pubModal, pubFilter } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';
import AddDialog from './AddDialog';

const ContractManage = (props: any) => {
  const { common } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const access = useAccess();

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  // 添加弹窗实例
  const addModel = useRef();
  // 新增 编辑弹窗
  const addModalOpen: any = (row?: any) => {
    const data: any = addModel?.current;
    data.open(row);
  };

  // 弹窗关闭
  const modalClose = (data: any) => {
    console.log(data);
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };

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
    const res = await sysCloudWarehousingCloudPage(postData);
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

  // 同步
  const synchronizationAction = async () => {
    pubModal('是否确定同步仓库数据?')
      .then(async () => {
        setConfirmLoading(true);
        const res: any = await sysCloudWarehousingSyn({});
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('同步成功', 'success');
          ref?.current?.reload();
        }
        setConfirmLoading(false);
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };

  const columns: ProColumns<PlatformShopTableListItem>[] = [
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
      title: '仓库类型',
      dataIndex: 'category',
      valueType: 'select',
      align: 'center',
      hideInSearch: true,
      width: 120,
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.SYS_PLATFORM_WAREHOUSING_CATEGORY, record.category);
      },
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
      hideInSearch: true,
      width: 80,
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.SYS_ENABLE_STATUS, record.status);
      },
    },
    {
      title: '默认快递',
      dataIndex: 'express_code',
      valueType: 'select',
      align: 'center',
      hideInSearch: true,
      width: 80,
      render: (_: any, record: any) => {
        return pubFilter(common.dicList.CLOUD_WAREHOUSE_EXPRESS, record.express_code);
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      align: 'center',
      valueType: 'option',
      render: (_, row: any) => [
        <Access key="editButton" accessible={access.canSee('warehouseCloud_edit_express')}>
          <a
            onClick={() => {
              addModalOpen(row);
            }}
            key="edit"
          >
            修改快递
          </a>
        </Access>,
      ],
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
          headerTitle={
            <Space>
              {/* warehouseCloud_synchronization */}
              <Access key="synButton" accessible={access.canSee('warehouseCloud_synchronization')}>
                <Button
                  loading={confirmLoading}
                  type="primary"
                  onClick={() => {
                    synchronizationAction();
                  }}
                >
                  同步仓库数据
                </Button>
              </Access>
            </Space>
          }
        />
        <AddDialog addModel={addModel} handleClose={modalClose} />
      </PageContainer>
    </>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ContractManage);
export default ConnectPage;
