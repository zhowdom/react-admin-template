import { useState } from 'react';
import { Spin } from 'antd';
import { DrawerForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { purchaseOrderGetDetailById } from '@/services/pages/reconciliationAskAction';
import DetailItem from '@/components/Reconciliation/DetailItem';
import { dateFormat, priceValue } from '@/utils/filter';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示
import './style.less';

const Dialog = (props: any) => {
  const { dicList } = props;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detail, setDetail] = useState<any>({});

  // 详情
  const getOrderDetail = async (id: string): Promise<any> => {
    setLoading(true);
    const res = await purchaseOrderGetDetailById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDetail(res.data);
    }
    setLoading(false);
  };
  props.askActionOrderDetailModel.current = {
    open: (id: string) => {
      setIsModalVisible(true);
      getOrderDetail(id);
    },
  };
  // 取消+关闭
  const modalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <DrawerForm<{
      name: string;
      company: string;
    }>
      title="特批请款详情"
      visible={isModalVisible}
      layout="horizontal"
      width={1000}
      drawerProps={{
        destroyOnClose: true,
        onClose: () => {
          modalClose();
        },
      }}
      className="purchase-order-detail-drawer"
      submitter={false}
    >
      <Spin spinning={loading}>
        <div className="reconciliation-detail-table">
          <div className="r-w">
            <DetailItem title="请款单号">{detail?.funds_no}</DetailItem>
            <DetailItem title="请款日期">{dateFormat(detail?.create_time)}</DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="请款金额">{priceValue(detail?.amount)}</DetailItem>
            <DetailItem title="当前状态">
              {pubFilter(dicList?.PURCHASE_REQUEST_FUNDS_STATUS, detail.approval_status)}
            </DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="请款人">{detail?.create_user_name}</DetailItem>
            <DetailItem title="供应商名称">{detail?.vendor_name}</DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="付款主体">{detail?.main_name}</DetailItem>
            <DetailItem title="收款账户名">{detail?.bank_account_name}</DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="要求付款时间">{dateFormat(detail?.requirement_pay_time)}</DetailItem>
            <DetailItem title="银行账号">{detail?.bank_account}</DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="开户行">{detail?.bank_name}</DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="附件">
              <ShowFileList data={detail?.proof || []} />
            </DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="扣款原因">{detail?.reason}</DetailItem>
          </div>
        </div>
      </Spin>
    </DrawerForm>
  );
};

export default Dialog;
