import React from 'react';
import { Button, Card, Divider, Result, Skeleton, Space, Tag, Badge } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { history, useRequest, useModel } from 'umi';
import { getDetail, getDetailUser } from '@/services/pages/notification';
import styles from './index.less';
import { countUnread } from '@/services/pages/notification';
import { pubConfig } from '@/utils/pubConfig';

// 获取招聘类型
const Page: React.FC = () => {
  const { setInitialState } = useModel('@@initialState');
  const id = history.location.query?.id || '';
  const type = history.location.query?.type || '';
  let api = getDetail;
  if (type) {
    api = getDetailUser;
  }
  const { data, loading } = useRequest(() => api({ id }), {
    formatResult(res) {
      if (res && res.code == pubConfig.sCode) {
        return res.data;
      } else {
        return res.message;
      }
    },
  });
  // 更新顶部未读消息数量
  useRequest(countUnread, {
    refreshDeps: [loading],
    onSuccess(unreadMsgCount) {
      setInitialState((s: any) => ({ ...s, unreadMsgCount }));
    },
  });
  return (
    <>
      <PageContainer title={false}>
        {loading ? (
          <Card style={{ minHeight: '680px' }}>
            <Skeleton active />
          </Card>
        ) : typeof data === 'object' ? (
          <div>
            <Card
              bodyStyle={{ minHeight: 'calc(100vh - 300px)' }}
              actions={[<Button onClick={history.goBack}>返回</Button>]}
            >
              <h1 style={{ textAlign: 'center' }}>{data.title}</h1>
              <Space style={{ color: 'grey' }} split={<Divider type="vertical" />}>
                <span>发布时间: {data.create_time}</span>
                <span>发布者: {data.create_user_name}</span>
              </Space>
              <Divider />
              <div
                className={styles.htmlContent}
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            </Card>
            {type ? null : (
              <Card
                bordered={false}
                style={{ background: 'transparent' }}
                bodyStyle={{ padding: '0 24px', fontSize: '12px' }}
              >
                <Divider style={{ fontSize: '14px' }}>消息阅读日志</Divider>
                <Badge status="success" />
                已读人员:{' '}
                {data.readList.map((item: any) => (
                  <Tag key={item.user_id}>{item.user_name || item.user_id}</Tag>
                ))}
                <br />
                <Badge status="warning" />
                未读人员:{' '}
                {data.unReadList.map((item: any) => (
                  <Tag key={item.user_id} style={{ marginTop: '4px' }}>
                    {item.user_name || item.user_id}
                  </Tag>
                ))}
              </Card>
            )}
          </div>
        ) : (
          <Result
            status="404"
            title="无法查看"
            subTitle={data}
            extra={
              <Button type="primary" onClick={history.goBack}>
                返回
              </Button>
            }
          />
        )}
      </PageContainer>
    </>
  );
};
export default Page;
