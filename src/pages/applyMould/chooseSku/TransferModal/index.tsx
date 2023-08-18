import { useState } from 'react';
import './index.less';
import { Modal, Transfer } from 'antd';
import difference from 'lodash/difference';
import ProTable from '@ant-design/pro-table';
import { getEsSkus, getSkusM } from '@/services/pages/sample';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const TableTransfer = ({ leftColumns, rightColumns, itemKey, ...restProps }: any) => (
  <Transfer {...restProps}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;
      const rowSelection = {
        getCheckboxProps: (item: any) => ({
          disabled: listDisabled || item.disabled,
        }),
        onSelectAll(selected: boolean, selectedRows: any[]) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },

        onSelect({ key }: any, selected: boolean) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };
      return (
        <ProTable
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          style={{
            pointerEvents: listDisabled ? 'none' : undefined,
            wordBreak: 'break-all',
          }}
          pagination={false}
          options={false}
          rowKey={itemKey}
          search={false}
          toolBarRender={false}
          cardProps={{ style: { padding: 0 }, bodyStyle: { padding: 0 } }}
          bordered
        />
      );
    }}
  </Transfer>
);

const leftTableColumns = [
  {
    title: '图片',
    dataIndex: 'image_url',
    align: 'center',
    valueType: 'image',
    hideInSearch: true,
    width: 100,
  },
  {
    title: '款式编码',
    dataIndex: 'sku_code',
    align: 'center',
  },
  {
    title: '款式名称',
    dataIndex: 'sku_name',
    align: 'center',
  },
];
const rightTableColumns = [
  {
    title: '图片',
    dataIndex: 'image_url',
    align: 'center',
    valueType: 'image',
    hideInSearch: true,
    width: 100,
  },
  {
    title: '款式编码',
    dataIndex: 'sku_code',
    align: 'center',
  },
  {
    title: '款式名称',
    dataIndex: 'sku_name',
    align: 'center',
  },
];

export default (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [targetKeys, setTargetKeys] = useState<any>([]);
  const [dataSource, setDataSource] = useState([]);
  const onChange = (nextTargetKeys: any) => {
    setTargetKeys(nextTargetKeys);
  };
  // 取消+关闭
  const modalClose = (val?: any) => {
    const rows: any = dataSource.flatMap((v: any) => {
      return targetKeys && targetKeys.includes(v?.[`${props?.itemKey}`]) ? [v] : [];
    });
    setIsModalVisible(false);
    if (!val) props.handleClose(false);
    props.handleClose(val, rows);
  };
  // 弹窗点确定时
  const modalOk = () => {
    modalClose(targetKeys);
  };
  // 获取商品的SKU列表
  const getSkusAction = async () => {
    const goods_id = props?.formRef.current?.getFieldValue('goods_id');
    if (!goods_id) {
      setDataSource([]);
      return;
    }
    const mould_type = props?.formRef?.current?.getFieldValue('mould_type');
    const res =
      mould_type == '1'
        ? await getEsSkus({
            id: props?.formRef?.current?.getFieldValue('project_goods_id'),
          })
        : await getSkusM({
            goods_id,
          });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const resp = mould_type == '1' ? res?.data : res?.data?.records;
    const data =
      resp?.map((v: any) => {
        return {
          ...v,
          [`${props?.itemKey}`]: v.id,
          key: v.id,
        };
      }) || [];
    console.log(data, 999);
    setDataSource(data);
  };
  props.choseSkuModel.current = {
    open: (ids: any, skus: any) => {
      setIsModalVisible(true);
      setTargetKeys(ids);
      console.log(ids, skus);
      setTimeout(() => {
        if (skus) {
          setDataSource(
            skus.map((v: any) => {
              return {
                ...v,
                key: v?.[`${props?.itemKey}`],
              };
            }),
          );
        } else {
          getSkusAction();
        }
      }, 100);
    },
  };
  return (
    <Modal
      width={1200}
      title="选择款式"
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={() => modalClose()}
      destroyOnClose
      maskClosable={false}
      className="transfer-modal"
    >
      {props?.itemKey ? (
        <TableTransfer
          dataSource={dataSource}
          targetKeys={targetKeys}
          showSearch
          itemKey={props?.itemKey}
          onChange={onChange}
          titles={['款式名称列表', '已选的款式']}
          filterOption={(inputValue: string, item: string) =>
            item.sku_name.indexOf(inputValue) !== -1 || item.sku_code.indexOf(inputValue) !== -1
          }
          leftColumns={leftTableColumns}
          rightColumns={rightTableColumns}
        />
      ) : (
        <></>
      )}
    </Modal>
  );
};
