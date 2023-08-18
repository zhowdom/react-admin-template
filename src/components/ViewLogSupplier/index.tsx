import { ModalForm } from '@ant-design/pro-components';
import { Table, Tag } from 'antd';
// 供应商查看历史
const Component: React.FC<{ dataSource: any }> = ({ dataSource }) => {
  // console.log(dataSource, 'dataSource');
  return (
    <ModalForm
      title={'供应商查看记录'}
      trigger={
        <Tag color="green" style={{ cursor: 'pointer' }}>
          供应商已查看
        </Tag>
      }
      submitter={false}
      modalProps={{ destroyOnClose: true }}
    >
      <Table
        rowKey={'id'}
        size="small"
        bordered
        dataSource={dataSource}
        columns={[
          {
            title: 'ID',
            dataIndex: 'create_user_id',
            align: 'center',
          },
          {
            title: '查看人',
            dataIndex: 'create_user_name',
            align: 'center',
          },
          {
            title: '查看时间',
            dataIndex: 'create_time',
            align: 'center',
          },
        ]}
      />
    </ModalForm>
  );
};
export default Component;
