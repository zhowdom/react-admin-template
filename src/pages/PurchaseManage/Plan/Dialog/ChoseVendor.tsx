import { useState, useRef } from 'react';
import { Modal, Spin, Tag } from 'antd';
import { history } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import {
  findGoodsSkuIdToSameVender,
  findSinglePurchaseOrderData,
} from '@/services/pages/purchasePlan';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import '../style.less';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chosedPlanIds, setChosedPlanIds] = useState<any[]>([]);
  const [venderList, setVenderList] = useState([]);
  const [chosedList, setChosedList] = useState<any[]>([]);
  const [chosedIds, setChosedIds] = useState<any[]>([]);

  const formRef = useRef<ProFormInstance>();

  // 根据SKUids 得到可以选择的供应商下拉列表
  const getVenderList = async (ids?: any) => {
    setLoading(true);
    const res = await findGoodsSkuIdToSameVender({ goodsSkuId: ids.join(',') });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setVenderList(res.data);
    }
    setLoading(false);
  };
  // 生成采购单准备数据(单个供应商) 用计划ID查 得到SKU的列表
  const getDetail = async (planIds: any): Promise<any> => {
    setLoading(true);
    setChosedPlanIds(planIds);
    const res = await findSinglePurchaseOrderData({ planIds });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const skuIds = res.data?.purchaseOrderSku.map((v: any) => v.goods_sku_id);
      getVenderList(skuIds);
    }
    setLoading(false);
  };
  props.choseVendorModel.current = {
    open: (ids?: any) => {
      setIsModalVisible(true);
      setChosedPlanIds([]);
      setVenderList([]);
      setChosedList([]);
      setChosedIds([]);
      getDetail(ids);
    },
  };
  // 取消+关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };
  const modalOk = () => {
    if (!chosedIds.length) return pubMsg('请选择供应商！');
    history.push(
      `/purchase-manage/plan-addList?planIds=${chosedPlanIds}&vendorIds=${chosedIds.join(',')}`,
    );
    modalClose();
  };
  // 选择结束
  const chosedOver = (data: any) => {
    const ids = data.map((v: any) => v.id);
    setChosedIds(ids);
    setChosedList(data);
  };
  // 选择
  const chosedRow = (data: any) => {
    const newData = JSON.parse(JSON.stringify(chosedList));
    newData.push(data);
    chosedOver(newData);
  };
  // 取消选择
  const delRow = (e: any, data: any) => {
    e.preventDefault();
    const newData = JSON.parse(JSON.stringify(chosedList));
    const index = chosedList.findIndex((v) => v.id == data.id);
    newData.splice(index, 1);
    chosedOver(newData);
  };
  const columns = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '供应商代码',
      dataIndex: 'code',
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '供应商联系人',
      dataIndex: ['contacts', 'name'],
      hideInSearch: true,
      align: 'center',
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) => {
        const renderList = [];
        if (chosedIds.indexOf(row.id) > -1) {
          renderList.push(
            <span key="edit" style={{ color: '#999' }}>
              已添加
            </span>,
          );
        } else {
          renderList.push(
            <a
              onClick={() => {
                chosedRow(row);
              }}
              key="edit"
            >
              添加
            </a>,
          );
        }
        return renderList;
      },
    },
  ];

  return (
    <Modal
      width={800}
      title="请选择下单供应商"
      open={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <div className="addOrder-choseVendor">
          <div>已选供应商：</div>
          <div>
            {chosedList.map((v: any) => {
              return (
                <Tag color="blue" closable onClose={(e) => delRow(e, v)} key={v.id}>
                  {v.name}
                </Tag>
              );
            })}
          </div>
        </div>
        <ProTable
          columns={columns}
          search={false}
          options={false}
          formRef={formRef}
          pagination={false}
          bordered
          tableAlertRender={false}
          tableAlertOptionRender={false}
          dataSource={venderList}
          rowKey="id"
          className="p-table-0"
          dateFormatter="string"
        />
      </Spin>
    </Modal>
  );
};

export default Dialog;
