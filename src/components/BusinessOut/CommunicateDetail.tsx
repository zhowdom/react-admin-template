/**
 * 沟通ID 查沟通详情
 */
import { useState, useEffect } from 'react';
import { connect } from 'umi';
import { Form, Row, Col } from 'antd';
import ProForm from '@ant-design/pro-form';
import { getDetailById } from '@/services/pages/communicate';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import BusinessOutDetail from '@/components/BusinessOut/BusinessOutDetail'; // 出差的详情
import CommunicateDetailTop from '@/components/BusinessOut/CommunicateDetail-Top'; // 沟通详情的上半部分
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示

const Detail = (props: any) => {
  const [detailData, setDetailData] = useState<any>({
    source: '', // 来源  从出差来的要显示出差详情
    vendorTravelRecords: {
      // 出差信息对象
      travelRecordsTrip: {
        dpp_region: {}, //出发省份对象
        dpc_region: {}, //出发城市对象
        dtp_region: {}, //目的省份对象
        dtc_region: {}, //目的城市对象
        travelPeopleList: [],
      },
    },
    sys_files: [],
  });

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };

  // 获取沟通详情
  const getBusinessOutDetail = async (): Promise<any> => {
    const paramData = {
      id: props.id,
    };
    const res = await getDetailById(paramData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDetailData(res.data);
    }
  };
  useEffect(() => {
    getBusinessOutDetail();
  }, []);

  // 公共的部分
  function Footer() {
    return (
      <Row>
        <Col span={24}>
          <Form.Item label="沟通时间" labelCol={{ span: 3 }} wrapperCol={{ span: 18 }}>
            {detailData.communicate_time}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="沟通内容" labelCol={{ span: 3 }} wrapperCol={{ span: 18 }}>
            {detailData.communicate_content}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="其他信息" labelCol={{ span: 3 }} wrapperCol={{ span: 10 }}>
            <ShowFileList data={detailData.sys_files} isShowDownLoad={true} />
          </Form.Item>
        </Col>
      </Row>
    );
  }

  return (
    <ProForm
      submitter={false}
      layout="horizontal"
      className="pub-detail-form"
      {...formItemLayout}
      labelWrap={true}
    >
      {detailData.source === 'VENDOR_TRAVEL_RECORDS' ? (
        <BusinessOutDetail id={detailData.travel_records_id} />
      ) : (
        <CommunicateDetailTop data={detailData} />
      )}
      <Footer />
    </ProForm>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);
