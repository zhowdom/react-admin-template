import {
  cacheDelete,
  getCacheList,
  getKey,
  refreshBasicCache,
  refreshBasicCacheScm,
} from '@/services/pages/AmsManage/cache';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Button, Col, Empty, Popconfirm, Row, Spin } from 'antd';
import { useRef, useState } from 'react';
import { Access, connect, useAccess } from 'umi';
import './index.less';

const Cache = () => {
  const ref = useRef<ActionType>();
  const [contLoading, setContLoading] = useState(false);
  const [content, setContent] = useState('');
  const access = useAccess();
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      key: params?.key ?? '*',
    };

    const res = await getCacheList(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data:
        res.data.map((v: any) => {
          return {
            index: v,
          };
        }) || [],
      success: true,
      total: res?.data?.length || 0,
    };
  };
  // 刷新ams缓存
  const refresh = async () => {
    const res = await refreshBasicCache({});
    if (res.code == '0') {
      pubMsg('刷新成功!', 'success');
      ref?.current?.reload();
    }
  };
  // 刷新scm缓存
  const refreshScm = async () => {
    const res = await refreshBasicCacheScm({});
    if (res.code == '0') {
      pubMsg('刷新成功!', 'success');
      ref?.current?.reload();
    }
  };
  // 获取详情
  const getContent = async (value: any) => {
    setContLoading(true);
    const res = await getKey({ key: value });
    if (res.code == '0') {
      setContent(JSON.stringify(res.data,null,2));
    } else {
      pubMsg(res?.message);
    }
    setContLoading(false);
  };
  // 删除
  const deleteAction = async (data: any) => {
    const res = await cacheDelete({ key: data.index });
    if (res.code == '0') {
      pubMsg('删除成功!', 'success');
      ref?.current?.reload();
    } else {
      pubMsg(res?.message);
    }
  };
  return (
    <Row className="cacheList" gutter={20}>
      <Col span={12}>
        <div style={{ padding: '10px', background: '#fff' }}>
          <ProTable
            actionRef={ref}
            scroll={{ y: '80vh' }}
            columns={[
              {
                title: 'Token的值',
                dataIndex: 'index',
                hideInSearch: true,
                render: (_: any, record: any) => (
                  <a
                    onClick={() => {
                      getContent(record.index);
                    }}
                  >
                    {record.index}
                  </a>
                ),
              },
              {
                title: '',
                dataIndex: 'key',
                hideInTable: true,
              },
              {
                title: '操作',
                dataIndex: 'options',
                align: 'center',
                width: 60,
                hideInSearch: true,
                hideInTable: !access.canSee('ams_cache_delete'),
                render: (_: any, record: any) => (
                  <Popconfirm
                    key="delete"
                    title="确定删除吗?"
                    onConfirm={async () => deleteAction(record)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a style={{ color: 'red' }}>删除</a>
                  </Popconfirm>
                ),
              },
            ]}
            pagination={false}
            tableAlertRender={false}
            tableAlertOptionRender={false}
            request={getListAction}
            rowKey="id"
            showHeader={false}
            options={false}
            search={{
              className: 'light-search-form',
              defaultCollapsed: false,
              optionRender: (searchConfig, formProps, dom) => [
                <Access key="search" accessible={access.canSee('ams_cache_reload')}>
                  {dom[1]}
                </Access>,
                <Access key="ams" accessible={access.canSee('ams_cache_reload')}>
                  <Button
                    type="primary"
                    onClick={() => {
                      refresh();
                    }}
                  >
                    刷新ams基础数据缓存
                  </Button>
                </Access>,
                <Access key="scm" accessible={access.canSee('scm_cache_reload')}>
                  <Button
                    key="scm"
                    type="primary"
                    onClick={() => {
                      refreshScm();
                    }}
                  >
                    刷新scm基础数据缓存
                  </Button>
                </Access>,
              ],
            }}
            dateFormatter="string"
          />
        </div>
      </Col>
      <Col span={12}>
        <div style={{ padding: '30px 10px 10px 10px', background: '#fff', height: '90vh',overflow: 'auto' }}>
          <Spin spinning={contLoading}>{content ? <pre>{content}</pre> : <Empty />}</Spin>
        </div>
      </Col>
    </Row>
  );
};
const ConnectPage: React.FC = connect(
  ({ common }: { account: Record<string, unknown>; common: Record<string, unknown> }) => ({
    common,
  }),
)(Cache);
export default ConnectPage;
