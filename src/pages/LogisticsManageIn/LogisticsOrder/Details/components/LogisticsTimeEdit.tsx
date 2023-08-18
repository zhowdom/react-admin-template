import { Card, Col, Row } from 'antd';
import { ProFormDatePicker } from '@ant-design/pro-form';
import '../index.less';

export default () => {
  return (
    <Card
      title="物流时效"
      bordered={false}
      style={{ marginBottom: '15px' }}
      className="custom-top-table"
    >
      <Row gutter={24}>
        <Col span={8}>
          <ProFormDatePicker
            name="delivery_date"
            rules={[{ required: true, message: '请选择实际出厂/发货/装柜时间' }]}
            label="实际出厂/发货/装柜时间"
          />
        </Col>
        <Col span={8}>
          <ProFormDatePicker
            name="etd_date"
            dependencies={['delivery_date']}
            rules={[
              { required: true, message: '请选择预计开船时间ETD' },
              ({ getFieldValue }: any) => ({
                validator(_: any, value: any) {
                  console.log(getFieldValue('delivery_date'));
                  if (
                    !value ||
                    new Date(getFieldValue('delivery_date')).getTime() <= new Date(value).getTime()
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('应大于等于实际出厂/发货/装柜时间'));
                },
              }),
            ]}
            placeholder={'请选择预计开船时间ETD'}
            label="预计开船时间ETD"
          />
        </Col>
        <Col span={8}>
          <ProFormDatePicker
            label={'预计入仓时间'}
            name={'platform_appointment_time'}
            dependencies={['etd_date']}
            rules={[
              { required: true, message: '请选择预计入仓时间' },
              ({ getFieldValue }: any) => ({
                validator(_: any, value: any) {
                  if (
                    !value ||
                    new Date(getFieldValue('etd_date')).getTime() <= new Date(value).getTime()
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('应大于等于预计开船时间ETD'));
                },
              }),
            ]}
          />
        </Col>
      </Row>
    </Card>
  );
};
