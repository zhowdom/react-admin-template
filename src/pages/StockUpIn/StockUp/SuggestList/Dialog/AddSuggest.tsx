import { useState } from 'react';
import { Button, Modal, Spin, Alert } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-table';
import {
  stockUpAdviceCreate,
  getBaseData,
} from '@/services/pages/stockUpIn/stockUp/suggestList';
import { getShopSkuCode } from '@/services/base';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { pubAllLinks } from '@/utils/pubConfirm';
import './addSuggest.less';
import { uniqBy } from 'lodash';

const Dialog: React.FC<{
  dicList: any;
  reload: any;
  addSuggestModel: any;
}> = (props: any) => {
  const { reload, dicList } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allLink, setAllLink] = useState<any[]>([]);
  const [allSku, setAllSku] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]); // 第一次列表
  const [dataSecond, setDataSecond] = useState<any[]>([]); // 第二次列表
  const [selectedRowKeys, selectedRowKeysSet] = useState([]);
  const [selectedRow, selectedRowSet] = useState([]);
  const [seep, seepSet] = useState(1); // 第几步

  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  const columns: ProColumns<any>[] = [
    {
      title: '店铺',
      dataIndex: 'shop_name',
      hideInSearch: true,
      width: 120,
      align: 'center',
    },
    {
      title: '链接名称/链接ID',
      dataIndex: 'sku_name',
      hideInSearch: true,
      width: 240,
      render: (_, record: any) => (
        <>
          <div>{record?.link_name}</div>
          <div>{record?.link_id}</div>
        </>
      )
    },
    {
      title: 'SKU',
      dataIndex: 'shop_sku',
      align: 'center',
      width: 120,
      valueType: 'select',
      fieldProps: {
        ...selectProps,
        options: allSku
      },
      render: (_, record: any) => record?.shop_sku
    },
    {
      title: '链接ID',
      dataIndex: 'link_management_id',
      hideInTable: true,
      valueType: 'select',
      align: 'center',
      fieldProps: {
        ...selectProps,
        options: allLink
      },
    },
    {
      title: '销售状态',
      dataIndex: 'sales_status',
      hideInSearch: true,
      width: 80,
      align: 'center',
      render: (_: any, record: any) => {
        return pubFilter(dicList.LINK_MANAGEMENT_SALES_STATUS, record?.sales_status) || '-';
      },
    },
    {
      title: '校验说明',
      dataIndex: 'message',
      hideInSearch: true,
      align: 'center',
      render: (_: any, record: any) => {
        let newD: any = '';
        if (seep == 1 && record?.stock_up_advice_code) {
          newD = (
            <>
              {`不可重复创建，存在【${record?.status_name}】备货建议：`}
              <a href={`/stock-up-in/stockUp/suggest-detail?code=${record.stock_up_advice_code}&readonly=true&deaitlonly=true` || '#'} target="_blank" rel="noreferrer">
                {record.stock_up_advice_code}
              </a>
            </>
          )
        }
        if (seep == 2 && record?.stock_up_advice_code) {
          newD = (
            <>
              {`创建失败，存在【${record?.status_name}】备货建议：`}
              <a href={`/stock-up-in/stockUp/suggest-detail?code=${record.stock_up_advice_code}&readonly=true&deaitlonly=true` || '#'} target="_blank" rel="noreferrer">
                {record.stock_up_advice_code}
              </a>
            </>
          )
        }
        if (seep == 2 && record?.new_stock_up_advice_code) {
          newD = (
            <>
              {`创建成功，备货建议号：`}
              <a href={`/stock-up-in/stockUp/suggest-detail?code=${record.new_stock_up_advice_code}&readonly=true&deaitlonly=true` || '#'} target="_blank" rel="noreferrer">
                {record.new_stock_up_advice_code}
              </a>
            </>
          )
        }
        return newD;
      },
    },
  ];
  const getData = async (params: any): Promise<any> => {
    if (!params?.shop_sku && !params?.link_management_id) return pubMsg('请至少输入一个查询条件！');
    setLoading(true);
    // console.log(params)
    const res = await getBaseData({
      current_page: 1, //当前页数
      page_size: 99999, //每页的条数
      ...params
    });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setDataSource(res.data.records || []);
    const chosedKeys = res.data.records.filter((v: any) => !v.stock_up_advice_code)
    selectedRowKeysSet(chosedKeys.map((k: any) => `${k.shop_sku}-${k.shop_id}`));
    selectedRowSet(chosedKeys);
  };

  props.addSuggestModel.current = {
    open: async () => {
      setIsModalVisible(true);
      const link: any = await pubAllLinks()
      const sku: any = await getShopSkuCode({
        sku_type: '1',
        business_scope: 'IN',
      });
      // console.log(link);
      // console.log(sku);
      setAllLink(link);
      const newSku = sku ? sku.map((val: any) => ({
        label: `${val?.sku_name}(${val?.shop_sku_code})`,
        value: `${val?.shop_sku_code}`,
      })) : []; // 去重shop_sku_code 因为同一个SKU可能在不同的店铺，是允许shop_sku_code重复的
      // console.log(newSku);
      setAllSku(uniqBy(newSku, 'value'));

      seepSet(1)
    },
  };
  // 取消+关闭
  const modalClose = (val?: any) => {
    setDataSource([])
    setDataSecond([])
    selectedRowKeysSet([]);
    selectedRowSet([]);
    setIsModalVisible(false);
    if (val) reload();
  };

  const modalOk = async () => {
    if (seep == 1) {
      if (!selectedRow.length) return pubMsg('请选择要操作的数据');
      setLoading(true);
      console.log(selectedRow)
      const newD = selectedRow.map((v: any) => ({
        shop_id: v.shop_id,
        shop_sku: v.shop_sku,
      }))
      const res = await stockUpAdviceCreate({ createParams: newD });
      setLoading(false);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
        return;
      }
      seepSet(2);
      setDataSecond(res?.data || [])
      selectedRowKeysSet([]);
      selectedRowSet([]);

    } else if (seep == 2) {
      modalClose(true);
    }
  };
  const cancelMod = () => {
    if (seep == 1) {
      modalClose();
    } else if (seep == 2) {
      seepSet(1);
      setDataSource([])
      setDataSecond([])
      selectedRowKeysSet([]);
      selectedRowSet([]);
      reload();
    }
  };

  return (
    <Modal
      width={1000}
      title="新建备货建议"
      open={isModalVisible}
      onOk={modalOk}
      onCancel={() => cancelMod()}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      cancelText={seep == 1 ? "取消" : '继续创建'}
      okText={seep == 1 ? "提交" : '关闭'}
      className='AddSuggestModal'
    >
      <Alert
        message={(
          <>
            <div>提示：</div>
            <div>1、当前仅支持SKU或SPU维度快速创建备货建议；</div>
            <div>2、如存在“待处理”/“待审批”的备货建议时，不可重复创建；</div>
          </>
        )}
        type="info"
      />
      <Spin spinning={loading}>
        {
          seep == 1 ? (
            <ProTable<any>
              columns={columns}
              options={false}
              search={{
                span: 12,
                className: 'light-search-form',
                labelWidth: 'auto',
                defaultCollapsed: false,
                optionRender: (searchConfig, formProps, dom) => [
                  <div key={'sug-rest'}>
                    {dom[0]}
                  </div>,
                  <Button
                    key={'sug-search'}
                    type="primary"
                    onClick={() => {
                      getData(formProps.form?.getFieldsValue());
                    }}
                  >
                    查询
                  </Button>
                ]
              }}
              bordered
              pagination={false}
              tableAlertRender={false}
              dateFormatter="string"
              dataSource={dataSource}
              rowKey={(record) => record.shop_sku + '-' + record.shop_id}
              size="small"
              className="p-table-0"
              rowSelection={{
                selectedRowKeys,
                onChange: (rowKeys: any, rows: any) => {
                  selectedRowKeysSet(rowKeys);
                  selectedRowSet(rows);
                },
                getCheckboxProps: (record: any) => ({
                  disabled: record.stock_up_advice_code,
                }),
              }}
            />
          ) : (
            <div style={{ marginTop: '15px' }}>
              <ProTable<any>
                columns={columns}
                options={false}
                search={false}
                bordered
                pagination={false}
                tableAlertRender={false}
                dateFormatter="string"
                dataSource={dataSecond}
                rowKey={(record) => record.shop_sku + '-' + record.shop_id}
                size="small"
                className="p-table-0"
              />
            </div>
          )
        }



      </Spin>
    </Modal>
  );
};

export default Dialog;
