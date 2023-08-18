import { useState } from 'react';
import { Modal, Row, Col } from 'antd';
import { connect } from 'umi';
import ProTable from '@ant-design/pro-table';
import { getSkusList } from '@/services/pages/sample';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import './ChangePrice.less';

const Dialog = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [form] = useState({
    project_goods_id: '', // 商品ID
    sku_name: '', // 商品SKU
  });
  const [leftData, setLeftData] = useState([]);
  const [rightData, setrightData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // 计算右侧的数据
  const getRightData = (data: any, rows: any) => {
    console.log(data, rows, 'cj');
    setSelectedRowKeys(data);
    setrightData(rows);
  };
  // 删除右侧时
  const delRightItem = (id: string) => {
    console.log(selectedRowKeys);
    const overKeys = selectedRowKeys?.length ? JSON.parse(JSON.stringify(selectedRowKeys)) : [];
    overKeys.splice(
      overKeys.findIndex((item: string) => item === id),
      1,
    );
    const cur = rightData?.filter((item: any) => item.id != id);
    setrightData(cur);
    setSelectedRowKeys(overKeys);
    // getRightData(overKeys, cur);
  };

  // 获取商品的SKU列表
  const getSkus = async (name: string) => {
    const res = await getSkusList({
      sku_name: name,
      project_goods_id: form.project_goods_id,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setLeftData(res?.data?.records || []);
  };
  props.choseSkuModel.current = {
    open: (id: any, ids: any, rows: any) => {
      setIsModalVisible(true);
      setrightData(rows || []);
      form.project_goods_id = id;
      setSelectedRowKeys(ids);
      setTimeout(() => {
        getSkus('');
      }, 10);
    },
  };
  // 取消+关闭
  const modalClose = (val?: any, rows?: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(false);
    props.handleClose(val, rows);
  };
  // 弹窗点确定时
  const modalOk = () => {
    console.log(rightData, 1);
    modalClose(selectedRowKeys, rightData);
  };

  // table配置
  const columns = [
    {
      title: '图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
    },
  ];
  // 右内里table配置
  const columnsRight = [
    {
      title: '图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'option',
      align: 'center',
      valueType: 'option',
      width: 60,
      render: (_, row: any) => [
        <a
          onClick={() => {
            delRightItem(row.id);
          }}
          key="edit"
        >
          删除
        </a>,
      ],
    },
  ];

  // // 提交
  // const saveSubmit = async (val: any) => {
  //   // form.sku_name = val.sku_name;
  //   const name: string = val?.sku_name
  //   getSkus(name);
  // };
  return (
    <Modal
      width={1000}
      title="选择款式"
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={() => modalClose()}
      destroyOnClose
      maskClosable={false}
    >
      <Row gutter={24}>
        <Col span={12}>
          <div className="choseSku-nav choseSku-left">
            <div className="choseSku-right-title">款式名称列表</div>
            <ProTable
              className="p-table-0"
              rowKey="id"
              bordered={true}
              dateFormatter="string"
              dataSource={leftData}
              columns={columns}
              options={false}
              search={false}
              size="small"
              tableAlertRender={false}
              rowSelection={{
                selectedRowKeys: selectedRowKeys,
                onChange: getRightData,
              }}
              pagination={false}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="choseSku-nav choseSku-right">
            <div className="choseSku-right-title">已选的款式</div>
            <ProTable
              rowKey="id"
              bordered={true}
              dateFormatter="string"
              className="p-table-0"
              dataSource={rightData}
              columns={columnsRight}
              options={false}
              search={false}
              size="small"
              pagination={false}
            />
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
