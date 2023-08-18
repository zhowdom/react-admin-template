import { ProFormDependency, ProFormRadio, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Col, Row } from 'antd';
import TimePayMethod from './TimePayMethod';

export default (props: any) => {
  const { modalType, selectProps, setDataSource, dataSource, dicList, formRef } = props;
  return (
    <ProFormDependency name={['name_id']}>
      {(data: any) => {
        // 框架合同,结算变更协议
        if (['1', '11'].includes(data.name_id)) {
          return (
            <>
              <ProFormRadio.Group
                disabled={modalType === 'detail'}
                name="payment_method_key"
                label="结算方式"
                rules={[{ required: true, message: '请选择结算方式' }]}
                valueEnum={dicList?.VENDOR_CONTRACT_PAYMENT_METHOD_KEY}
              />
              <ProFormDependency name={['payment_method_key']}>
                {({ payment_method_key }: any) => {
                  console.log(payment_method_key);
                  if (payment_method_key == 0) {
                    return (
                      <>
                        <Row>
                          <Col span={6} />
                          <Col span={14}>
                            <ProFormSelect
                              readonly={modalType === 'detail'}
                              name="payment_method_value"
                              rules={[{ required: true, message: '请选择结算方式' }]}
                              showSearch
                              debounceTime={300}
                              fieldProps={selectProps}
                              valueEnum={dicList?.CONTRACT_PAYMENT_METHOD}
                            />
                          </Col>
                        </Row>
                      </>
                    );
                  } else if (payment_method_key == 1) {
                    return (
                      <>
                        <Row>
                          <Col span={6} />
                          <Col span={18}>
                            <div
                              className="addContract-nav"
                              style={{ marginBottom: modalType === 'detail' ? '12px' : '25px' }}
                            >
                              <div className="addContract-item">
                                前
                                <ProFormText
                                  disabled={modalType === 'detail'}
                                  name="stage_before_number"
                                  placeholder="张数"
                                  wrapperCol={{ span: 24 }}
                                  rules={[{ required: true, message: '请输入张数' }]}
                                />
                                张采购单按预付
                                <ProFormText
                                  disabled={modalType === 'detail'}
                                  name="stage_before_scale"
                                  placeholder="预付比例"
                                  wrapperCol={{ span: 24 }}
                                  rules={[{ required: true, message: '请输入预付比例' }]}
                                />
                                %+
                                <ProFormSelect
                                  name="stage_before_days"
                                  rules={[{ required: true, message: '请选择结算天数' }]}
                                  showSearch
                                  disabled={modalType === 'detail'}
                                  debounceTime={300}
                                  fieldProps={selectProps}
                                  wrapperCol={{ span: 24 }}
                                  style={{ width: '120px' }}
                                  valueEnum={dicList?.CONTRACT_PREPAID_PAYMENT_METHOD}
                                />
                                结算，
                              </div>
                              <div className="addContract-item">
                                后续所有采购单，均按
                                <ProFormSelect
                                  name="stage_after_days"
                                  rules={[{ required: true, message: '请选择结算方式' }]}
                                  showSearch
                                  disabled={modalType === 'detail'}
                                  debounceTime={300}
                                  fieldProps={selectProps}
                                  request={async () => {
                                    console.log(8888);
                                    const resD: any = [];
                                    const res = await dicList?.CONTRACT_PAYMENT_METHOD;
                                    console.log(res);
                                    for (const k in res) {
                                      if (k != '1') {
                                        resD.push({
                                          label: res[k].text,
                                          value: k,
                                        });
                                      }
                                    }
                                    console.log(resD);

                                    return resD;
                                  }}
                                  // valueEnum={dicList?.CONTRACT_PAYMENT_METHOD}
                                />
                                结算
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </>
                    );
                  } else if (payment_method_key == 2) {
                    return (
                      <TimePayMethod
                        formRef={formRef}
                        setDataSource={setDataSource}
                        dataSource={dataSource}
                        dicList={dicList}
                        disabled={modalType === 'detail'}
                      />
                    );
                  } else {
                    return <></>;
                  }
                }}
              </ProFormDependency>
            </>
          );
        } else {
          return '';
        }
      }}
    </ProFormDependency>
  );
};
