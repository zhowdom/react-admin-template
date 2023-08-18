import { Modal, Card, Space, Popconfirm, Alert } from 'antd';
import { CheckCard } from '@ant-design/pro-components';
import { SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAreas } from '../index';
import { useEffect, useState } from 'react';
import UpdateSingle from './UpdateSingle';
import { getDeliveryWarehouseConfig, deliveryWarehouseConfig } from '@/services/pages/shipment';
import Area from './Area';
import './index.less';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
/*发货仓配置*/
const Component: React.FC<{
  reload: any;
  open: boolean;
  openSet: any;
  data: any;
  dictList: any;
}> = ({ open, openSet, data, dictList, reload }) => {
  const [areas, areasSet] = useState<any[]>([]);
  const [loading, loadingSet] = useState(false);
  const [confirmLoading, confirmLoadingSet] = useState(false);
  const [openAdd, openAddSet] = useState(false);
  const [warehouse, warehouseSet] = useState<any[]>([]);
  const [selectedWarehouseId, selectedWarehouseIdSet] = useState<any>('');
  const [selectedWarehouse, selectedWarehouseSet] = useState<Record<string, any>>({});
  const [refreshKey, refreshKeySet] = useState<number>(0);
  useEffect(() => {
    if (open) {
      loadingSet(true);
      const fetchWarehouse = getDeliveryWarehouseConfig({
        current_page: 1,
        page_size: 2,
        goods_sku_id: data.goods_sku_id,
      }).then((res) => {
        if (res?.code == pubConfig.sCode) {
          const goodSkuWarehouseList = res?.data?.goodSkuWarehouseList || [];
          warehouseSet(goodSkuWarehouseList);
          const temp = goodSkuWarehouseList.filter((item: any) => !item.isDelete);
          selectedWarehouseIdSet(temp[0]?.delivery_warehouse_id || '');
          return goodSkuWarehouseList;
        } else {
          pubMsg(res?.message);
        }
      });
      const fetchAreas = getAreas().then((res) => {
        return res;
      });
      Promise.all([fetchAreas, fetchWarehouse]).then(([a, w]) => {
        loadingSet(false);
        w.forEach((item: any) => {
          a.forEach((aa: any) => {
            aa.options = aa.options.map((aao: any) => ({
              ...aao,
              delivery_warehouse_id: item?.areaList?.find(
                (ia: any) => ia.province_name == aao.label,
              )
                ? item.delivery_warehouse_id
                : aao.delivery_warehouse_id || '',
            }));
          });
        });
        areasSet(a);
      });
    }
  }, [open, refreshKey]);
  // 获取仓库中的区域
  const getAreaList = (delivery_warehouse_id: string) => {
    const areaList: any[] = [];
    areas.forEach((a) => {
      if (a.options) {
        a.options.forEach((o: any) => {
          if (o.delivery_warehouse_id == delivery_warehouse_id)
            areaList.push({ province_name: o.label });
        });
      }
    });
    return areaList;
  };
  // 删除仓库
  const deleteItem = (item: any) => {
    areasSet(
      areas.map((a) => ({
        ...a,
        options: a?.options?.map((c: any) => ({
          ...c,
          delivery_warehouse_id:
            c.delivery_warehouse_id == item.delivery_warehouse_id ? '' : c.delivery_warehouse_id,
        })),
      })),
    );
    const temp = warehouse?.map((w: any) => {
      if (w.id == item.id) {
        return { ...w, isDelete: 1 };
      }
      return w;
    });
    warehouseSet(temp);
    const tempFilter = temp.filter((t: any) => !t.isDelete);
    selectedWarehouseIdSet(tempFilter[tempFilter.length - 1]?.delivery_warehouse_id || '');
  };
  return (
    <>
      <Modal
        title={`发货仓维护(${data.erp_sku || '-'} - ${data.sku_name})`}
        width={1400}
        style={{ top: 20 }}
        open={open}
        onCancel={() => openSet(false)}
        destroyOnClose
        okText={'保存'}
        onOk={async () => {
          const submitData = {
            goods_sku_id: data.goods_sku_id,
            sku_name: data.sku_name,
            goodSkuWarehouseList: warehouse.map((w) => ({
              ...w,
              areaList: w.isDelete ? [] : getAreaList(w.delivery_warehouse_id),
            })),
          };
          confirmLoadingSet(true);
          const res = await deliveryWarehouseConfig(submitData);
          confirmLoadingSet(false);
          if (res?.code == pubConfig.sCode) {
            if (reload) reload();
            pubMsg(res?.message || '保存配置成功', 'success');
            openSet(false);
            return true;
          }
          pubMsg(res?.message);
          return false;
        }}
        confirmLoading={confirmLoading}
      >
        <Card
          loading={loading}
          title={
            <Space>
              <span style={{ fontWeight: 'bold' }}>区域</span>
              <a
                style={{ fontSize: 12 }}
                onClick={() => {
                  areasSet(
                    areas.map((a) => ({
                      ...a,
                      options: a?.options?.map((c: any) => ({
                        ...c,
                        delivery_warehouse_id: selectedWarehouseId,
                      })),
                    })),
                  );
                }}
              >
                全选
              </a>
            </Space>
          }
          size={'small'}
          style={{ minHeight: 260 }}
        >
          <Area
            selectedWarehouseId={selectedWarehouseId}
            rowProp={{ justify: 'center' }}
            areas={areas}
            areasSet={areasSet}
          />
        </Card>
        <Card
          loading={loading}
          title={
            <Space>
              <span style={{ fontWeight: 'bold' }}>仓库</span>
              <a
                style={{ fontSize: 12 }}
                onClick={() => {
                  selectedWarehouseSet({});
                  openAddSet(true);
                }}
              >
                +添加仓库
              </a>
            </Space>
          }
          size={'small'}
          style={{ marginTop: 10, minHeight: 200 }}
        >
          <CheckCard.Group
            value={selectedWarehouseId}
            onChange={(val: any) => {
              if (val) selectedWarehouseIdSet(val);
            }}
            className={'warehouse-group'}
          >
            {warehouse.map((item: any) => (
              <CheckCard
                disabled={item.isDelete == 1}
                key={item.id}
                title={<span style={{ fontWeight: 'bold' }}>{item.delivery_warehouse_name}</span>}
                size={warehouse.filter((w) => w.isDelete == 1).length > 4 ? 'small' : 'default'}
                value={item.delivery_warehouse_id}
                extra={
                  item.isDelete == 1 ? null : (
                    <Space>
                      <a
                        onClick={() => {
                          selectedWarehouseSet(
                            warehouse.find(
                              (w: any) => w.delivery_warehouse_id == item.delivery_warehouse_id,
                            ) || {},
                          );
                          openAddSet(true);
                        }}
                      >
                        <SettingOutlined />
                      </a>
                      <Popconfirm title={'确定删除仓库?'} onConfirm={() => deleteItem(item)}>
                        <a>
                          <DeleteOutlined />
                        </a>
                      </Popconfirm>
                    </Space>
                  )
                }
                description={
                  <div style={{ position: 'relative' }}>
                    {item.isDelete == 1 ? (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 2,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          background: 'rgba(255, 255, 255, .6)',
                        }}
                      >
                        <a
                          onClick={() => {
                            warehouseSet(
                              warehouse?.map((w: any) => {
                                if (w.id == item.id) {
                                  return { ...w, isDelete: 0 };
                                }
                                return w;
                              }),
                            );
                            selectedWarehouseIdSet(item.delivery_warehouse_id);
                          }}
                        >
                          恢复仓库
                        </a>
                      </div>
                    ) : null}
                    <Alert
                      showIcon={false}
                      style={{
                        background: '#fff',
                        color: '#999',
                        padding: '2px 4px',
                        marginBottom: 8,
                      }}
                      banner
                      message={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{`退: ${item?.return_warehouse_name || '--'}`}</span>
                          <span>{`(${pubFilter(
                            dictList?.ORDER_DELIVERY_PACKAGE_STRATEGY,
                            item.package_strategy,
                          )})`}</span>
                        </div>
                      }
                    />
                    <Area
                      selectedWarehouseId={selectedWarehouseId}
                      delivery_warehouse_id={item.delivery_warehouse_id}
                      areas={areas}
                      areasSet={areasSet}
                    />
                  </div>
                }
              />
            ))}
          </CheckCard.Group>
        </Card>
      </Modal>
      <UpdateSingle
        initialValues={selectedWarehouse}
        warehouse={warehouse}
        warehouseSet={warehouseSet}
        deleteItem={deleteItem}
        goods_sku_id={data.goods_sku_id}
        dicList={dictList}
        open={openAdd}
        openSet={openAddSet}
        reload={(res: any, isRefresh?: boolean) => {
          const matched = warehouse.find((w) => w.id == res.id);
          if (matched) {
            warehouseSet(
              warehouse?.map((w: any) =>
                w.id == res.id
                  ? {
                      ...w,
                      package_strategy: res.package_strategy || w.package_strategy,
                      return_warehouse_id: res.return_warehouse_id || w.return_warehouse_id,
                      return_warehouse_name: res.return_warehouse_name || w.return_warehouse_name,
                    }
                  : w,
              ),
            );
          } else {
            warehouseSet([...warehouse, res]);
          }
          selectedWarehouseIdSet(res?.delivery_warehouse_id || '');
          openAddSet(false);
          if (isRefresh) {
            refreshKeySet(Date.now());
          }
        }}
      />
    </>
  );
};
export default Component;
