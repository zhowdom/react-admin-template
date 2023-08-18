import { Col, Modal, Row, Space } from 'antd';
import { ProForm, ProFormInstance, ProFormTextArea } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import './index.less';
import {
  getCrossInventoryWarnDetailInRemark,
  saveCrossInventoryWarnDetailInRemark,
} from '@/services/pages/stockUpIn/stockUpWarning';

const Marks: React.FC<{
  open: any;
  openSet: any;
  data: Record<string, any>;
}> = ({ data = {}, open, openSet }) => {
  const [originRemarks, setOriginRemarks] = useState<any>([]);
  const [loading, loadingSet] = useState<any>(false);
  const formRef = useRef<ProFormInstance>();
  return (
    <>
      <Modal
        width={700}
        title={'备注明细'}
        open={open}
        onCancel={() => openSet(false)}
        bodyStyle={{ paddingTop: 0 }}
        destroyOnClose
        footer={false}
        className="modal-table"
      >
        <ProForm
          formRef={formRef}
          labelCol={{ span: 0 }}
          submitter={{
            searchConfig: {
              resetText: '关闭',
              submitText: '保存',
            },
            submitButtonProps: {
              loading,
            },
          }}
          onReset={() => {
            openSet(false);
          }}
          className="mark-form"
          onFinish={async (values) => {
            loadingSet(true);
            const res = await saveCrossInventoryWarnDetailInRemark({
              ...data.params,
              remark: values.remark,
            });
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              loadingSet(false);
            } else {
              pubMsg('保存成功', 'success');
              const res1 = await getCrossInventoryWarnDetailInRemark(data.params);
              if (res1?.code != pubConfig.sCode) {
                pubMsg(res1?.message);
                setOriginRemarks([]);
              } else {
                setOriginRemarks(res1.data);
              }
              loadingSet(false);
              formRef?.current?.setFieldsValue({ remark: '' });
            }
          }}
          request={async () => {
            const res = await getCrossInventoryWarnDetailInRemark(data.params);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              setOriginRemarks([]);
            } else {
              setOriginRemarks(res.data);
            }
            return { remark: null };
          }}
        >
          <div>
            <div style={{ textAlign: 'left', margin: '16px 0' }}>
              <strong key="time">{`${data?.params?.timeRangeC}`}</strong>
            </div>
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <Space size={50} align="start">
                <Space align="start">
                  <div style={{ width: '60px' }}>款式名称：</div>
                  <div style={{ width: '300px' }}>{data?.params?.sku_name}</div>
                </Space>
                <Space align="start">
                  <div style={{ width: '30px' }}>SKU: </div>
                  <div>{data?.params?.shop_sku}</div>
                </Space>
              </Space>
            </div>
            <div style={{ paddingTop: '4px', display: originRemarks?.length ? 'block' : 'none' }}>
              {originRemarks?.map((item: any, index: number) => {
                return (
                  <div key={item.id} style={{ marginBottom: '4px', lineHeight: '24px' }}>
                    <Row gutter={10}>
                      <Col span={17}>
                        <Space align="start">
                          {`${index + 1}.`}
                          <pre
                            style={{
                              wordBreak: 'break-all',
                              whiteSpace: 'pre-wrap',
                              marginBottom: '6px',
                              textAlign: 'left',
                              lineHeight: '24px',
                              width: '420px',
                            }}
                          >
                            &nbsp;{item.remark}
                          </pre>
                        </Space>
                      </Col>
                      <Col span={7}>
                        <span style={{ color: '#aaa', lineHeight: '24px' }}>
                          {item.create_user_name} &nbsp;&nbsp;{item.create_time}
                        </span>
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </div>

            <ProFormTextArea
              colProps={{ span: 24 }}
              name="remark"
              label=""
              fieldProps={{ rows: 4 }}
              rules={[
                { required: true, message: '请输入' },
                { max: 200, message: '最多输入200字' },
              ]}
            />
          </div>
        </ProForm>
      </Modal>
    </>
  );
};
export default Marks;
