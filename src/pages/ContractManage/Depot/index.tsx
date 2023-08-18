import { PageContainer } from '@ant-design/pro-layout';
import { connect, useAccess, Access } from 'umi';
import { useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { CloudUploadOutlined } from '@ant-design/icons';
import type { TableDepotListItem } from '@/types/contract';
import { getPage } from '@/services/pages/contract';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubDownLoad } from '@/utils/pubConfirm';

import Add from './Dialog/Add';

const ContractManage = (props: any) => {
  const access = useAccess();
  const { common } = props;
  console.log(common);
  // 添加弹窗实例
  const addModel = useRef();

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await getPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const newData = res.data.records.map((val: any) => {
      return {
        ...val,
        party_a: val.official_seal_key ? JSON.parse(val.official_seal_key)[0].party_a : '',
        party_b: val.official_seal_key ? JSON.parse(val.official_seal_key)[0].party_b : '',
      };
    });

    return {
      data: newData,
      success: res?.code == pubConfig.sCode,
      total: res?.data?.total || 0,
    };
  };

  // 下载
  const downLoad: any = (row: any) => {
    pubDownLoad(row.sys_files[0]?.access_url, row.sys_files[0]?.name);
  };
  // 新增弹窗
  const addModalOpen: any = (row?: any) => {
    const data: any = addModel?.current;
    data.open(row?.id);
  };
  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };
  const columns: ProColumns<TableDepotListItem>[] = [
    {
      title: '合同模板名',
      dataIndex: 'name',
      align: 'center',
    },
    // {
    //   title: '默认签约主体',
    //   dataIndex: 'subject_id',
    //   valueType: 'select',
    //   align: 'center',
    //   hideInTable: true,
    //   fieldProps: {
    //     showSearch: true,
    //     filterOption: (input: any, option: any) => {
    //       const trimInput = input.replace(/^\s+|\s+$/g, '');
    //       if (trimInput) {
    //         return option.label.indexOf(trimInput) >= 0;
    //       } else {
    //         return true;
    //       }
    //     },
    //   },
    //   request: async (v) => {
    //     const res: any = await pubGetSigningList(v);
    //     return res;
    //   },
    // },
    // {
    //   title: '默认签约主体(甲方)',
    //   dataIndex: 'subject_Name',
    //   align: 'center',
    //   hideInSearch: true,
    // },
    {
      title: '甲方签章关键字',
      dataIndex: 'party_a',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '乙方签章关键字',
      dataIndex: 'party_b',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 150,
      align: 'center',
      valueType: 'option',
      render: (_, row) => [
        <Access key="download" accessible={access.canSee('depot_downloadUrl')}>
          <a
            onClick={() => {
              downLoad(row);
            }}
          >
            模板附件下载
          </a>
        </Access>,
        <Access key="edit" accessible={access.canSee('depot_edit')}>
          <a
            onClick={() => {
              addModalOpen(row);
            }}
          >
            编辑
          </a>
        </Access>,
      ],
    },
  ];
  return (
    <>
      <Add addModel={addModel} handleClose={modalClose} />

      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable<TableDepotListItem>
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{}}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getList}
          rowKey="id"
          search={{ className: 'light-search-form', defaultCollapsed: false }}
          dateFormatter="string"
          headerTitle="合同模板记录"
          toolBarRender={() => [
            <Space key="upload">
              <Access key="add" accessible={access.canSee('depot_add')}>
                <Button
                  onClick={() => {
                    addModalOpen();
                  }}
                  ghost
                  type="primary"
                  icon={<CloudUploadOutlined />}
                >
                  新增合同模板
                </Button>
              </Access>
            </Space>,
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
