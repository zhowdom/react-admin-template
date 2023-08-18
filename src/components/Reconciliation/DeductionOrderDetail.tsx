import { useState } from 'react';
import { Spin, Drawer } from 'antd';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { sysBusinessDeductionById } from '@/services/pages/reconciliationDeduction';
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
    const res = await sysBusinessDeductionById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDetail(res.data);
    }
    setLoading(false);
  };
  props.deductionOrderDetailModel.current = {
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
    <Drawer
      title="扣款单详情"
      width={1000}
      visible={isModalVisible}
      onClose={() => modalClose()}
      destroyOnClose={true}
      className="purchase-order-detail-drawer"
    >
      <Spin spinning={loading}>
        <div className="reconciliation-detail-table">
          <div className="r-w">
            <DetailItem title="扣款单号">{detail?.deduction_no}</DetailItem>
            <DetailItem title="申请日期">{dateFormat(detail?.create_time)}</DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="扣款类型">
              {pubFilter(dicList?.BUSINESS_DEDUCTION_BUSINESS_TYPE, detail.business_type)}
            </DetailItem>
            <DetailItem title="当前状态">
              {pubFilter(dicList?.PURCHASE_ORDER_DEDUCTION_STATUS, detail.approval_status)}
            </DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="供应商">{detail?.vendor_name}</DetailItem>
            <DetailItem title="采购主体">{detail?.main_name}</DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="申请扣款金额">{priceValue(detail?.amount)}</DetailItem>
            <DetailItem title="可用金额">{priceValue(detail?.available_amount)}</DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="来源单号">
              {detail.business_type == '2' ? detail?.business_no : '--'}
            </DetailItem>
            <DetailItem title="申请人">{detail?.create_user_name}</DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="附件">
              <ShowFileList data={detail?.sys_files || []} />
            </DetailItem>
          </div>
          <div className="r-w">
            <DetailItem title="扣款原因">{detail?.reason}</DetailItem>
          </div>
        </div>
      </Spin>
    </Drawer>
  );
};

export default Dialog;
