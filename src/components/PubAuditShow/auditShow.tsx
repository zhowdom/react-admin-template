import { useState, useRef } from 'react';
import { Modal } from 'antd';
import { connect } from 'umi';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { TableHistoryListItem } from '@/types/contract';
import { contractApprovalPage } from '@/services/pages/contract';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { ProFormInstance } from '@ant-design/pro-form';

import AuditDetail from './AuditDetail';
const Dialog = (props: any) => {
  const { common } = props;
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [list, setList] = useState({});

  const formRef = useRef<ProFormInstance>();

  // 获取表格数据
  const getList = async (id: any): Promise<any> => {
    const postData = {
      id: id,
      current_page: 1,
      page_size: 20,
    };
    setLoading(true);
    const res = await contractApprovalPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setList(res.data.records);
    }
  };

  props.pubAuditShowModel.current = {
    open: (id: any) => {
      setIsModalVisible(true);
      getList(id);
    },
  };
  // 关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };
  const ref = useRef<ActionType>();
  // 添加弹窗实例
  const auditDetailModel = useRef();

  // 审批历史详情 弹窗打开
  const auditDetailModelOpen: any = (row: any) => {
    const data: any = auditDetailModel?.current;
    data.open(row.id);
    console.log(row.id);
  };
  // 审批历史详情 弹窗关闭
  const auditDetailModelClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      ref?.current?.reload();
    }, 200);
  };

  const columns: ProColumns<TableHistoryListItem>[] = [
    {
      title: '审批时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '审批状态',
      dataIndex: 'business_status',
      hideInSearch: true,
      align: 'center',
      render: (_, record) => {
        return pubFilter(common.dicList.APPROVAL_STATUS, record.business_status);
      },
    },
    {
      title: '审批详情',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_, row) => [
        <a
          onClick={() => {
            auditDetailModelOpen(row);
          }}
          key="edit"
        >
          详情
        </a>,
      ],
    },
  ];

  return (
    <Modal
      width={560}
      title="审批记录"
      visible={isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
      className="detail-modal-table-nopadding"
    >
      <>
        <AuditDetail auditDetailModel={auditDetailModel} handleClose={auditDetailModelClose} />
        <ProTable<TableHistoryListItem>
          columns={columns}
          search={false}
          options={false}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          dataSource={list}
          rowKey="id"
          loading={loading}
          dateFormatter="string"
        />
      </>
    </Modal>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
