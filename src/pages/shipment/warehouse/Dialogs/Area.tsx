import { Row, Col, Button, Space } from 'antd';
import { cloneDeep } from 'lodash';
import { pubMsg } from '@/utils/pubConfig';
/*区域组件*/
const Component: React.FC<{
  selectedWarehouseId: string;
  delivery_warehouse_id?: string;
  areas: any[];
  areasSet: any;
  rowProp?: Record<string, any>;
}> = ({ areas, rowProp, areasSet, delivery_warehouse_id, selectedWarehouseId }) => {
  let areasFilter = cloneDeep(areas);
  // 已分配的area
  if (delivery_warehouse_id) {
    areasFilter.forEach((item) => {
      item.options = item.options.filter(
        (o: any) => o.delivery_warehouse_id == delivery_warehouse_id,
      );
    });
    areasFilter = areasFilter.filter((a: any) => a?.options?.length > 0);
  }
  return (
    <Row wrap={false} gutter={10} {...rowProp} style={{ minHeight: 242, paddingBottom: 10 }}>
      {areasFilter.map((area) => (
        <Col key={area.value}>
          <Space size={2} direction={'vertical'} align={'center'}>
            <Button
              style={{ minWidth: 70, fontWeight: 'bold' }}
              size={'small'}
              type={'text'}
              onClick={() => {
                if (!delivery_warehouse_id) {
                  areasSet(
                    areas.map((a) => {
                      if (a.value == area.value) {
                        return {
                          ...a,
                          options: a?.options?.map((c: any) => ({
                            ...c,
                            delivery_warehouse_id: c.delivery_warehouse_id || selectedWarehouseId,
                          })),
                        };
                      }
                      return a;
                    }),
                  );
                }
              }}
            >
              {area.label}
              {!delivery_warehouse_id ? <a style={{ marginLeft: 2, fontSize: 12 }}>全选</a> : null}
            </Button>
            {area.options
              .filter((city: any) => {
                if (delivery_warehouse_id) {
                  return city.delivery_warehouse_id == delivery_warehouse_id;
                } else {
                  return city;
                }
              })
              .map((city: any) => (
                <Button
                  style={{ minWidth: 70 }}
                  title={
                    delivery_warehouse_id
                      ? 'Tips: 点击从"仓库"中删除该"区域"'
                      : 'Tips: 点击添加该"区域"到下方选中的"仓库"'
                  }
                  disabled={!!city.delivery_warehouse_id && !delivery_warehouse_id}
                  onClick={() => {
                    if (!selectedWarehouseId) {
                      pubMsg('请先选中仓库后再分配区域~');
                      return;
                    }
                    areasSet(
                      areas.map((a) => ({
                        ...a,
                        options: a?.options.map((c: any) => {
                          if (c.value == city.value) {
                            return {
                              ...c,
                              delivery_warehouse_id: c.delivery_warehouse_id
                                ? ''
                                : selectedWarehouseId,
                            };
                          }
                          return c;
                        }),
                      })),
                    );
                  }}
                  size={'small'}
                  key={city.value}
                  type={'primary'}
                >
                  {city.label}
                </Button>
              ))}
          </Space>
        </Col>
      ))}
    </Row>
  );
};
export default Component;
