/**
 * 出差ID 查出差审批详情
 */
import { useState, useEffect } from 'react';
import { Steps, Empty, Spin } from 'antd';
import { findApprovalDetail } from '@/services/pages/businessOut';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Detail = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>([]);
  // 获取出差审批详情
  const getApprovalDetail = async (): Promise<any> => {
    const paramData = {
      id: props.id,
    };
    setLoading(true);
    const res = await findApprovalDetail(paramData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setDetailData([]);
    } else {
      setDetailData(res.data);
    }
    setLoading(false);
  };
  useEffect(() => {
    getApprovalDetail();
  }, []);

  const { Step } = Steps;
  return detailData.length ? (
    <Spin spinning={loading}>
      <Steps progressDot current={detailData.length} direction="vertical">
        {detailData.map((val: any) => {
          return (
            <Step
              key={val.id}
              title={val.approval_status_name}
              subTitle={val.approval_user_name}
              description={val.remark}
            />
          );
        })}
      </Steps>
    </Spin>
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="此记录暂无审批记录！" />
  );
};
export default Detail;
