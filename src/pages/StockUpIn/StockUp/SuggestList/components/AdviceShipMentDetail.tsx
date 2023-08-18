import { useState } from 'react';
import { Modal, Button } from 'antd';
import '../style.less';

// 弹框 - 数据明细
const ModalCalDetail: React.FC<{
  trigger?: React.ReactNode;
  detail: any;
}> = ({ trigger, detail }) => {
  const { defaultApplyShipment } = detail;
  const [open, openSet] = useState(false);

  // 取消+关闭
  const modalClose = () => {
    openSet(false);
  };
  return (
    <>
      {<div style={{ cursor: 'pointer' }} onClick={() => openSet(true)}>{trigger}</div>}
      <Modal
        title={`默认备货配置`}
        width={400}
        open={open}
        onCancel={modalClose}
        bodyStyle={{ paddingTop: 0 }}
        className={'adviceShipMent'}
        destroyOnClose
        footer={
          [
            <Button key="submit" type="primary" onClick={() => modalClose()}>
              确定
            </Button>
          ]
        }
      >
        <div className={'adviceShipMent-nav'}>
          <div className={'adviceShipMent-title'}>
            <div className={'adviceShipMent-item'}>
              <span>尺寸类型：</span>
              <i>{defaultApplyShipment?.belong_classify_name}</i>
            </div>
            <div className={'adviceShipMent-item'}>
              <span>装柜方式：</span>
              <i>{defaultApplyShipment?.box_type_name}</i>
            </div>
            <div className={'adviceShipMent-item'}>
              <span>发货途径：</span>
              <i>{defaultApplyShipment?.delivery_route_name}</i>
            </div>
            <div className={'adviceShipMent-item'}>
              <span>运输方式：</span>
              <i>{defaultApplyShipment?.shipping_method_name}</i>
            </div>

          </div>
          <table className="pub-my-table-templet">
            <thead>
              <tr>
                <th align="right">阶段</th>
                <th align="left">时效(天)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td align="right">国内运输</td>
                <td align="left">{defaultApplyShipment?.transport_cycle_cn}</td>
              </tr>
              <tr>
                <td align="right">跨境运输</td>
                <td align="left">{defaultApplyShipment?.transport_cycle_in}</td>
              </tr>
              <tr>
                <td align="right">上架</td>
                <td align="left">{defaultApplyShipment?.shelves_cycle}</td>
              </tr>
              <tr>
                <td align="right">合计</td>
                <td align="left">{defaultApplyShipment?.logistics_time}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
};

export default ModalCalDetail;
