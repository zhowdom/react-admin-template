import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import type { PlatformShopTableListItem } from '@/types/storage';
import { getSysPortPage } from '@/services/pages/storageManage';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';
import ImportBtn from '@/components/ImportBtn';

import AddDialog from './AddDialog';
import { useAccess, Access } from 'umi';

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
  // 添加弹窗实例
  const addModel = useRef();
  const access = useAccess();

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      type: 1,
    };
    delete postData.current;
    delete postData.pageSize;
    const res = await getSysPortPage(postData);
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
  const columns: ProColumns<PlatformShopTableListItem>[] = [
    {
      title: '跨境起运港仓库',
      dataIndex: 'name',
      align: 'center',
      order: 10,
    },
    {
      title: '省份',
      dataIndex: 'province_name',
      align: 'center',
      order: 9,
    },
    {
      title: '城市',
      dataIndex: 'city_name',
      align: 'center',
      order: 8,
    },
    {
      title: '送货地址',
      dataIndex: 'address',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      align: 'center',
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
      render: (_, row) => [
        <Access key="editButton" accessible={access.canSee('port_edit')}>
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
          search={{
            labelWidth: 'auto',defaultCollapsed: false, className: 'light-search-form' }}
          dateFormatter="string"
          headerTitle={
            <Space>
              <Access key="addButton" accessible={access.canSee('port_add')}>
                <Button
                  onClick={() => {
                    addModalOpen();
                  }}
                  ghost
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  新增跨境起运港仓库
                </Button>
              </Access>
              <Access key="scm_port_up_export" accessible={access.canSee('scm_port_up_export')}>
                <ImportBtn
                  btnText={'导入'}
                  reload={() => ref?.current?.reload()}
                  business_type={'SYS_PORT_DEPARTURE'}
                  templateCode={'SYS_PORT_DEPARTURE'}
                  importHandle={'/sc-scm/sysPort/importDeparture'}
                />
              </Access>
            </Space>
          }
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(ContractManage);
export default ConnectPage;
