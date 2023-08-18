import { PageContainer } from '@ant-design/pro-layout';
import { connect, history } from 'umi';
import React, { useRef } from 'react';
import { Button, Popconfirm, Space } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { CompassFilled, PlusOutlined } from '@ant-design/icons';
import type { PlatformShopTableListItem } from '@/types/storage';
import { clearKieSession, getType, removeRule, rule } from '@/services/pages/rules';
import { pubMsg } from '@/utils/pubConfig';
// 规则配置列表页
const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      pageNo: params?.current,
      type: params?.type || '',
      name: params?.name || '',
    };
    delete postData.current;
    const res = await rule(postData);
    if (res?.code == '0') {
      return {
        data: res.data.content || [],
        success: true,
        total: res?.data?.totalElements || 0,
      };
    }
    return {
      success: false,
    };
  };
  // 清除缓存
  const clearCache = async (id?: string) => {
    const res = await clearKieSession({ id });
    if (res?.code == '0') {
      pubMsg('清除缓存成功', 'success');
    } else {
      pubMsg('清除缓存失败');
    }
  };
  // 删除
  const remove = async (id?: string) => {
    const res = await removeRule({ id });
    if (res?.code == '0') {
      pubMsg('删除成功', 'success');
    } else {
      pubMsg('删除失败');
    }
  };

  const columns: ProColumns<PlatformShopTableListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      width: 120,
      valueType: 'select',
      request: async () => {
        const res = await getType();
        if (res && res.code == '0' && res?.data?.list) {
          return res?.data?.list.map((item: any) => ({
            label: item.dictLabel,
            value: item.dictValue,
          }));
        }
        return [];
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '备注',
      dataIndex: 'description',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      hideInSearch: true,
      width: 146,
    },
    {
      title: '操作',
      key: 'option',
      width: 160,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => [
        <a
          onClick={() => {
            history.push(`/setting-manage-report/rules/detail?id=${record.id}`);
          }}
          key="view"
        >
          查看
        </a>,
        <Popconfirm
          title="确定删除所选数据?"
          onConfirm={() => remove(record.id)}
          key="remove"
          okText="确定"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>,
        <a onClick={() => clearCache(record.id)} key="clear">
          清除缓存
        </a>,
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
          headerTitle="规则列表"
          size={'small'}
          columns={columns}
          actionRef={ref}
          options={{ fullScreen: true, setting: false }}
          pagination={{
            showSizeChanger: true,
          }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getList}
          rowKey="id"
          dateFormatter="string"
          toolBarRender={() => [
            <>
              <Space>
                <Button onClick={() => clearCache()} icon={<CompassFilled />}>
                  清除全部缓存
                </Button>
                <Button
                  onClick={() => history.push('/setting-manage-report/rules/detail')}
                  ghost
                  type="primary"
                  icon={<PlusOutlined />}
                >
                  新增
                </Button>
              </Space>
            </>,
          ]}
        />
      </PageContainer>
    </>
  );
};

const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
