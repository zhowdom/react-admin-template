/**
 * 沟通详情的上半部分
 */
import { connect } from 'umi';
import { Form, Row, Col } from 'antd';
import { pubFilter } from '@/utils/pubConfig';

const Detail = (props: any) => {
  const { common } = props;
  return (
    <Row>
      <Col span={24}>
        <Form.Item label="员工姓名" labelCol={{ span: 3 }} wrapperCol={{ span: 18 }}>
          {props.data.communicate_name}
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label="供应商" labelCol={{ span: 3 }} wrapperCol={{ span: 18 }}>
          {props.data.vendor_name}(
          {pubFilter(common.dicList.VENDOR_COOPERATION_STATUS, props.data.vendor_status)})
        </Form.Item>
      </Col>
    </Row>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);
