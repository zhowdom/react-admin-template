import { useState, useRef } from 'react';
import { Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import { ProFormInstance } from '@ant-design/pro-form';
import type { ActionType } from '@ant-design/pro-table';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  cloudWarehouseInventoryStreamPage,
  synInventoryStream,
  synInventoryStreamExport,
} from '@/services/pages/libraryManager';
import { Button, Space } from 'antd';
import { useAccess, Access } from 'umi';

const Dialog = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [loading, setLoading] = useState(false); // loading
  const [formParams, setFormParams] = useState({});
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const access = useAccess();
  const [inventory_id, setInventory_id] = useState(''); // inventory_id
  const [confirmLoading, setConfirmLoading] = useState(false); // loading
  const [downLoading, setDownLoading] = useState(false); // loading

  // 获取表格数据
  const getList = async (params: any): Promise<any> => {
    console.log(1);
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };
    const res = await cloudWarehouseInventoryStreamPage(postData);
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
  const initForm = {
    showSizeChanger: false,
  };
  props.historyLogModel.current = {
    open: (id: any) => {
      setIsModalVisible(true);
      console.log(id);
      setInventory_id(id);
      setLoading(true);
      setFormParams({ inventory_id: id });
    },
  };
  // 关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };
  const columns: any[] = [
    {
      title: '业务日期',
      dataIndex: 'date',
      width: 150,
      align: 'center',
    },
    {
      title: '单据类型',
      dataIndex: 'bill_type_name',
      width: 100,
      align: 'center',
    },
    {
      title: '单据编号',
      dataIndex: 'bill_code',
      align: 'center',
    },
    {
      title: '仓库',
      dataIndex: 'warehousing_name',
      align: 'center',
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'center',
    },
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
    },
    {
      title: '商品编码(ERP编码)',
      dataIndex: 'erp_sku',
      align: 'center',
      width: 80,
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
    },
    {
      title: '库存编号',
      dataIndex: 'stock_no',
      align: 'center',
    },
    {
      title: '发生数量',
      dataIndex: 'size',
      align: 'center',
    },
    {
      title: '发生成本',
      dataIndex: 'cost',
      align: 'center',
    },
    {
      title: '库存余量',
      dataIndex: 'quantity',
      align: 'center',
    },
    {
      title: '库存成本',
      dataIndex: 'item_cost',
      align: 'center',
    },
    {
      title: '出入库时间',
      dataIndex: 'time',
      hideInSearch: true,
      align: 'center',
      width: 150,
    },
  ];

  // 同步库存流水
  const synchronization = async (): Promise<any> => {
    setConfirmLoading(true);
    const res = await synInventoryStream({ inventory_id: inventory_id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('同步成功！', 'success');
      ref?.current?.reload();
    }
    setConfirmLoading(false);
  };
  // 导出库存流水
  const downLoadExcel = async () => {
    setDownLoading(true);
    const res: any = await synInventoryStreamExport({ inventory_id: inventory_id });
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `库存流水导出.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    setDownLoading(false);
  };
  return (
    <Modal
      width={1400}
      title="查看库存流水"
      visible={isModalVisible}
      onCancel={() => modalClose()}
      footer={false}
      destroyOnClose
      confirmLoading={loading}
      maskClosable={false}
    >
      <ProTable
        actionRef={ref}
        columns={columns}
        search={false}
        options={false}
        formRef={formRef}
        bordered
        params={formParams}
        tableAlertRender={false}
        dateFormatter="string"
        request={getList}
        rowKey="id"
        size="small"
        className="p-table-0"
        pagination={initForm}
        headerTitle={
          <Space key="space">
            <Access key="synchronization" accessible={access.canSee('libraryManager_sync_history')}>
              <Button
                type="primary"
                loading={confirmLoading}
                onClick={() => {
                  synchronization();
                }}
              >
                同步库存流水
              </Button>
            </Access>
            <Access key="approval" accessible={access.canSee('libraryManager_sync_history_export')}>
              <Button
                loading={downLoading}
                onClick={() => {
                  downLoadExcel();
                }}
              >
                导出库存流水
              </Button>
            </Access>
          </Space>
        }
      />
    </Modal>
  );
};
export default Dialog;
