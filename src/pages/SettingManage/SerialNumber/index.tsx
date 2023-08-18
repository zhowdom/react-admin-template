import { PageContainer } from '@ant-design/pro-layout';
import { connect } from 'umi';
import { useRef } from 'react';
import { Button, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import type { TableListItem } from '@/types/setting/sysVariable';
import { getList, deleteById } from '@/services/pages/settinsSerialNumber';
import { pubConfig, pubMsg, pubModal } from '@/utils/pubConfig';
import type { ProFormInstance } from '@ant-design/pro-form';

import AddDialog from './AddDialog';
import { useAccess, Access } from 'umi';

const SerialNumber = (props: any) => {
  const { common } = props;
  console.log(common);
  // 添加弹窗实例
  const addModel = useRef();

  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const access = useAccess();

  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    console.log('查询', params);
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    delete postData.current;
    delete postData.pageSize;
    const res = await getList(postData);
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
  // 删除
  const del = async (row: { id: string | undefined }) => {
    pubModal('是否删除序列号？')
      .then(async () => {
        const res = await deleteById({ id: row.id });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return;
        }
        pubMsg('删除成功!', 'success');
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
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '序列号编码',
      dataIndex: 'serial_code',
      align: 'center',
    },
    {
      title: '当前值',
      dataIndex: 'current_value',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '最大值',
      dataIndex: 'max_value',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '增长大小',
      dataIndex: 'step_value',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '模板',
      dataIndex: 'template',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '模板值',
      dataIndex: 'template_value',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      align: 'center',
      valueType: 'option',
      render: (_, row) => [
        <Access key="editButton" accessible={access.canSee('serial_edit')}>
          <a
            onClick={() => {
              addModalOpen(row);
            }}
            key="down"
          >
            编辑
          </a>
        </Access>,
        <Access key="delButton" accessible={access.canSee('serial_delete')}>
          <a
            onClick={() => {
              del(row);
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
      <AddDialog addModel={addModel} handleClose={modalClose} />

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
          rowKey="id"
          search={{ defaultCollapsed: false, className: 'light-search-form' }}
          dateFormatter="string"
          headerTitle="序列号"
          toolBarRender={() => [
            <>
              <Space>
                <Access key="addButton" accessible={access.canSee('serial_add')}>
                  <Button
                    onClick={() => {
                      addModalOpen();
                    }}
                    ghost
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    新增序列号
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
}))(SerialNumber);
export default ConnectPage;
