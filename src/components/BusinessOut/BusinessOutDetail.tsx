/**
 * 出差ID 查出差详情
 */
import { useState, useEffect } from 'react';
import { connect } from 'umi';
import { Form, Row, Col, Input, Spin } from 'antd';
import { getDetailById } from '@/services/pages/businessOut';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';

const Detail = (props: any) => {
  const { common } = props;
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>({
    travelRecordsTrip: {
      dpp_region: {}, //出发省份对象
      dpc_region: {}, //出发城市对象
      dtp_region: {}, //目的省份对象
      dtc_region: {}, //目的城市对象
      travelPeopleList: [],
    },
  });
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };
  const formItemLayout1 = {
    labelCol: { span: 3 },
    wrapperCol: { span: 20 },
  };
  // 获取出差详情
  const getBusinessOutDetail = async (): Promise<any> => {
    const paramData = {
      id: props.id,
    };
    setLoading(true);
    const res = await getDetailById(paramData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      res.data.travelRecordsTrip.departure_time = res.data.travelRecordsTrip.departure_time.substr(
        0,
        16,
      );
      res.data.travelRecordsTrip.return_time = res.data.travelRecordsTrip.return_time.substr(0, 16);
      const fromNum = Date.parse(res.data.travelRecordsTrip.departure_time);
      const endNum = Date.parse(res.data.travelRecordsTrip.return_time);
      if (fromNum && endNum) {
        const day = ((endNum - fromNum) / (1000 * 60 * 60 * 24)).toFixed(2); // 时间戳相减，然后除以天数 四舍五入
        const hour = ((endNum - fromNum) / (1000 * 60 * 60)).toFixed(2); // 时间戳相减，然后除以天数 四舍五入
        res.data.travelRecordsTrip.time_day = day;
        res.data.travelRecordsTrip.time_long = hour;
      }
      setDetailData(res.data);
    }
    setLoading(false);
  };
  useEffect(() => {
    getBusinessOutDetail();
  }, []);

  return (
    <Spin spinning={loading}>
      <Row>
        <Col span={12}>
          <Form.Item label="出差申请人" {...formItemLayout}>
            {detailData.applicant_name}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="出差申请状态" {...formItemLayout}>
            {pubFilter(common.dicList.VENDOR_TRAVEL_RECORD_STATUS, detailData.approval_status)}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="供应商" {...formItemLayout1}>
            {detailData.vendor_name}(
            {pubFilter(common.dicList.VENDOR_COOPERATION_STATUS, detailData.vendor_status)})
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="同行人" {...formItemLayout1}>
            {detailData.travelRecordsTrip.travelPeopleList.map((v: any, index: number) => {
              const bd = '、';
              return !index ? v.people_name : bd + v.people_name;
            })}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="计划拜访时间" {...formItemLayout}>
            {detailData.travelRecordsTrip.visit_time}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="交通工具" {...formItemLayout}>
            {pubFilter(
              common.dicList.SC_TRANSPORTATION,
              detailData.travelRecordsTrip.transportation,
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="出发城市" {...formItemLayout}>
            {detailData.travelRecordsTrip.dpp_region?.name} -{' '}
            {detailData.travelRecordsTrip.dpc_region?.name}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="目的城市" {...formItemLayout}>
            {detailData.travelRecordsTrip.dtp_region?.name} -{' '}
            {detailData.travelRecordsTrip.dtc_region?.name}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="出发时间" {...formItemLayout}>
            {detailData.travelRecordsTrip.departure_time}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="返程时间" {...formItemLayout}>
            {detailData.travelRecordsTrip.return_time}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="出差时长" {...formItemLayout}>
            {detailData.travelRecordsTrip.time_long}小时
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="出差天数" {...formItemLayout}>
            {detailData.travelRecordsTrip.time_day}天
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="需要预定车票" {...formItemLayout}>
            {pubFilter(common.dicList.SC_YES_NO, detailData.travelRecordsTrip.need_reserve_ticket)}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="需要预定酒店" {...formItemLayout}>
            {pubFilter(common.dicList.SC_YES_NO, detailData.travelRecordsTrip.need_reserve_hotel)}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="出差备注" {...formItemLayout}>
            <Input.TextArea
              className="pub-detail-form-textArea"
              value={detailData.remark}
              readOnly
              autoSize={true}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="中转城市" {...formItemLayout}>
            <Input.TextArea
              className="pub-detail-form-textArea"
              value={detailData.travelRecordsTrip.transit_city}
              readOnly
              autoSize={true}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="出差目的" {...formItemLayout1}>
            <Input.TextArea
              className="pub-detail-form-textArea"
              value={detailData.purpose}
              readOnly
              autoSize={true}
            />
          </Form.Item>
        </Col>
      </Row>
    </Spin>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);
