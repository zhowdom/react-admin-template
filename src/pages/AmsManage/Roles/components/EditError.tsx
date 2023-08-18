import { useState,useRef } from 'react';
import { Modal } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import EditErrorDetail from './EditErrorDetail';

const Dialog = (props: any) => {
  const [state, setState] = useState({
    isModalVisible: false, // 弹窗显示
    data: [], //
  });
  // 添加弹窗实例
  const editErrorDetailModel = useRef();
  props.editErrorModel.current = {
    open: (data: any) => {
      setState((pre: any) => {
        return {
          ...pre,
          data: JSON.parse(JSON.stringify(data)),
          isModalVisible: true,
        };
      });
    },
  };
  // 关闭
  const modalClose = () => {
    setState((pre: any) => {
      return {
        ...pre,
        isModalVisible: false,
      };
    });
  };

  // 详情弹窗
  const erroDetailModalOpen: any = (row: any) => {
    const data: any = editErrorDetailModel?.current;
    data.open(row?.roles);
  };

  // 表格配置
  const columns: ProColumns[] = [
    {
      title: '申请ID',
      dataIndex: 'id',
      align: 'center',
      width: 180,
    },
    {
      title: '申请人',
      dataIndex: 'createName',
      align: 'center',
      width: 180,
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '操作',
      align: 'center',
      dataIndex: 'options',
      render: (_, record) => (
        <a onClick={()=>erroDetailModalOpen(record)}>查看 </a>
      ),
    },
  ];
  return (
    <Modal
      width={800}
      title="重复的申请信息如下"
      open={state.isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
    >
    <ProTable
      columns={columns}
      options={false}
      pagination={false}
      bordered
      dataSource={state.data}
      rowKey="id"
      size='small'
      search={false}
      dateFormatter="string"
      className="p-table-0"
    />
    <EditErrorDetail editErrorDetailModel={editErrorDetailModel} />
    </Modal>
  );
};
export default Dialog;
