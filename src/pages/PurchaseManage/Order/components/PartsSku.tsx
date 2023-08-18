import React, { useState, useRef } from 'react';
import { Modal, Spin } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import { goodsSkuVendorPage } from '@/services/pages/cooperateProduct';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { CheckCircleOutlined } from '@ant-design/icons';

const Dialog: React.FC<any> = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [loading, setLoading] = useState(false); // 弹窗显示
  const [allChosed, setAllChosed] = useState<any>([]);
  const [skuList, setSkuList] = useState<any>([]);
  const [venderInfo, setVenderInfo] = useState<any>({});
  const actionRef = useRef();
  // 根据供应商ID 得到配件列表
  const getPartsProd = async (params: any, vendor_id?: any, chosedSku?: any): Promise<any> => {
    setLoading(true);
    const postData = {
      ...params,
      like_sku_code: params.sku_code,
      vendor_id: vendor_id ? vendor_id : venderInfo.id,
      sku_type: 2,
      current_page: 1,
      page_size: 999,
    };
    delete postData.sku_code;
    const res = await goodsSkuVendorPage(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const newD = res.data.records.map((v: any) => {
      const isH = chosedSku.find((k: any) => k.id == v.id);
      return {
        ...v,
        isChosed: isH ? true : false,
      };
    });

    setSkuList(newD);
    console.log(252525);
    setLoading(false);
  };

  if (props?.partsSkuModel) {
    props.partsSkuModel.current = {
      open: (venderData: any, skuDate?: any) => {
        setIsModalVisible(true);
        setAllChosed(JSON.parse(JSON.stringify(skuDate)));
        setVenderInfo(venderData);
        setTimeout(() => {
          getPartsProd({}, venderData.id, skuDate);
        }, 200);
      },
    };
  }

  // 选择
  const chosedSku = (data: any) => {
    data.isChosed = true;
    setAllChosed([...allChosed, data]);
    console.log(allChosed);
    setSkuList([...skuList]);
  };
  // 关闭
  const modalClose = () => {
    setIsModalVisible(false);
    setAllChosed([]);
    setSkuList([]);
  };
  const columns: ProColumns<any>[] = [
    {
      title: '图片',
      dataIndex: 'image_url',
      align: 'center',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '商品名称',
      dataIndex: 'sku_name',
      align: 'left',
    },
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      align: 'center',
      width: 160,
    },
    {
      title: '操作',
      key: 'option',
      width: 80,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_, record: any) => {
        return record.isChosed ? (
          <CheckCircleOutlined style={{ color: '#06b956' }} />
        ) : (
          <a onClick={() => chosedSku(record)} key="chosed">
            添加
          </a>
        );
      },
    },
  ];
  const modalOk = () => {
    const newBack = JSON.parse(JSON.stringify(allChosed));
    props.handleClose(newBack);
    modalClose();
  };
  return (
    <Modal
      width={900}
      title="添加入库配件"
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={() => modalClose()}
      destroyOnClose
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <ProTable<any>
          className="p-table-0"
          rowKey="id"
          actionRef={actionRef}
          params={{
            venderInfo: venderInfo,
          }}
          options={false}
          bordered={true}
          pagination={false}
          onSubmit={(params) => getPartsProd(params, null, allChosed)}
          dataSource={skuList}
          columns={columns}
        />
      </Spin>
    </Modal>
  );
};
export default Dialog;
