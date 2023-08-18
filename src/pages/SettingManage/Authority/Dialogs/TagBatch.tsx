import { Modal, Button, Row, Col, Tag } from 'antd';
import { ProTable, ProFormSelect } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { updateRangeType } from '@/services/pages/settinsPermission';

/*标记产品线范围 字典*/
export const enumRangeType = {
  'CN/IN': { text: 'CN/IN' },
  IN: { text: 'IN' },
  CN: { text: 'CN' },
  '-': { text: '-' },
};

// 标记产品线范围 - 批量 - 弹框
const TagBatch: React.FC<{
  title?: any;
  reload: any;
  defaultSelectedUsers?: any[];
}> = ({ title, reload, defaultSelectedUsers = [] }) => {
  const [open, openSet] = useState(false);
  const [submitting, submittingSet] = useState(false);
  const [selectedUsers, selectedUsersSet] = useState<Record<string, any>[]>(defaultSelectedUsers);
  const [range_type, range_typeSet] = useState<string>('CN/IN');

  useEffect(() => {
    selectedUsersSet(defaultSelectedUsers);
  }, [defaultSelectedUsers]);

  const columns: ProColumns<any>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '账号',
      dataIndex: 'account',
    },
    {
      title: '职位',
      dataIndex: 'position',
    },
    {
      title: '产品线范围',
      dataIndex: ['sysDataAuthorityConfig', 'range_type'],
      width: 100,
      align: 'center',
      render: (_: any, record: any) => {
        const rangeType = record?.sysDataAuthorityConfig?.range_type;
        if (!rangeType) {
          return <span title={'未设置产品线范围'}> </span>;
        } else if (rangeType == '-') {
          return <span title={'该员工无任何产品线范围'}>-</span>;
        }
        return <Tag color={rangeType == 'CN' ? 'cyan' : 'blue'}>{rangeType}</Tag>;
      },
    },
    {
      title: '操作',
      dataIndex: 'options',
      valueType: 'option',
      width: 90,
      align: 'center',
      render: (_, record: any) => (
        <Button
          type={'link'}
          disabled={selectedUsers.length == 1}
          onClick={() => {
            selectedUsersSet(selectedUsers.filter((item) => item.id !== record.id));
          }}
        >
          删除
        </Button>
      ),
    },
  ];
  return (
    <>
      <Button
        title={'选择需要标记的员工后点击'}
        disabled={!selectedUsers?.length}
        type={'primary'}
        onClick={() => openSet(true)}
      >
        标记产品线范围
      </Button>
      <Modal
        confirmLoading={submitting}
        title={title || `员工的产品线范围标记`}
        width={800}
        open={open}
        onCancel={() => {
          if (reload) reload();
          openSet(false);
        }}
        destroyOnClose
        onOk={async () => {
          const postData: {
            user_id: string;
            range_type: string;
          } = {
            user_id: '',
            range_type,
          };
          postData.user_id = selectedUsers.map((item) => item.user_id).toString();
          submittingSet(true);
          const res = await updateRangeType(postData);
          submittingSet(false);
          if (res?.code == pubConfig.sCode) {
            if (reload) reload();
            pubMsg('标记成功', 'success');
            openSet(false);
          } else {
            Modal.error({
              content: `操作失败: ${res.message}` || '操作失败, 服务异常未知!',
            });
          }
        }}
      >
        <Row>
          <Col span={24}>
            <ProTable
              headerTitle={`已选的用户(${selectedUsers.length}个)`}
              rowKey={'id'}
              columns={columns}
              style={{ minHeight: 350 }}
              cardProps={{ bodyStyle: { padding: 0 } }}
              scroll={{ y: 250 }}
              showSorterTooltip={false}
              tableAlertRender={false}
              options={false}
              pagination={false}
              size={'small'}
              className={'no-sticky-pagination'}
              search={false}
              params={{ timeStamp: Date.now() }}
              request={async () => {
                return {
                  success: true,
                  data: selectedUsers,
                };
              }}
            />
          </Col>
          <Col span={10}>
            <ProFormSelect
              tooltip={
                <>
                  1、选择用户后，可以标记为『-』
                  <br />
                  2、『-』的意思是指:
                  将员工的产品线范围从全部中移除，下次同步最新产品线时，就可以忽略这部分的用户
                </>
              }
              label={'标记范围'}
              fieldProps={{
                value: range_type,
                allowClear: false,
                onChange: (value: string) => range_typeSet(value),
              }}
              name={'range_type'}
              valueEnum={enumRangeType}
            />
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default TagBatch;
