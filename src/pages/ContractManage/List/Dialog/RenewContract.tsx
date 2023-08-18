import { useState, useRef } from 'react';
import { Modal, Form, Spin, Row, Col } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProFormDependency,
  ProFormRadio,
  ProFormDateRangePicker,
} from '@ant-design/pro-form';
import { renewContract, vendorContractFindById } from '@/services/pages/contract';
import { pubAlert, pubConfig, pubMsg } from '@/utils/pubConfig';
import { getUuid, pubGetDepotList } from '@/utils/pubConfirm';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import PubDingDept from '@/components/PubForm/PubDingDept';
import TimePayMethod from './components/TimePayMethod';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const [dataSource, setDataSource] = useState<any>([]);
  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  // 获取详情数据
  const getDetail = async (id: any): Promise<any> => {
    const res = await vendorContractFindById({ id: id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const newData = JSON.parse(JSON.stringify(res.data));
    newData.remark = '';
    newData.vendorContractPayMethods =
      newData?.vendorContractPayMethods?.map((v: any) => ({ ...v, tempId: getUuid() })) || [];
    setDataSource(newData?.vendorContractPayMethods);
    formRef.current?.setFieldsValue({
      ...newData,
    });
  };

  props.renewContractModel.current = {
    open: (data?: any) => {
      setIsModalVisible(true);
      if (data) {
        getDetail(data.id);
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    setDataSource([]);
    formRef?.current?.setFieldsValue({
      vendorContractPayMethods: [],
    });
    if (!val) props.handleClose(true);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    // 兼容旧数据不存在生效时间
    if (
      val?.payment_method_key == 2 &&
      val?.vendorContractPayMethods?.some((v: any) => !v.assert_time)
    ) {
      pubAlert('生效时间不能为空', '', 'warning');
      return;
    }
    const newData = JSON.parse(JSON.stringify(val));
    if (newData.type != 0) {
      newData.begin_time = newData.time[0];
      newData.end_time = newData.time[1];
      delete newData.time;
    }
    PubDingDept(
      async (dId: any) => {
        setLoading(true);
        const res = await renewContract(newData, dId);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('续签成功!', 'success');
          modalClose(false);
        }
        setLoading(false);
      },
      (err: any) => {
        console.log(err);
      },
    );
  };
  // 上传结束后
  const handleUpload1 = async (data: any) => {
    console.log(data);
    formRef.current?.setFieldsValue({ renew_sys_files: data });
  };
  // 上传结束后
  const handleUpload = async (data: any) => {
    console.log(data);
    formRef.current?.setFieldsValue({ sys_files: data });
  };
  return (
    <Modal
      width={800}
      title="框架合同续签"
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="id" hidden />
          <ProFormTextArea
            name="remark"
            label="续签说明"
            placeholder="续签说明"
            rules={[
              { required: true, message: '请输入续签说明' },
              { max: 400, message: '最多输入400字' },
            ]}
          />
          <Form.Item
            label="供应商主体信息(营业执照)"
            name="renew_sys_files"
            extra="只支持.png,.jpg格式"
          >
            <>
              <UploadFileList
                fileBack={handleUpload1}
                businessType="VENDOR_CONTRACT"
                listType="picture"
                accept={['.png,.jpg']}
                acceptType={['png', 'jpg']}
                maxSize="5"
                maxCount="1"
              />
              <div>
                说明：如果修改了营业执照，在续签审批通过后会自动更新供应商的名称、法人以及统一社会信用代码
              </div>
            </>
          </Form.Item>
          <ProFormSelect
            name="type"
            label="选择续签方式"
            showSearch
            debounceTime={300}
            fieldProps={selectProps}
            rules={[{ required: true, message: '请选择续签方式' }]}
            valueEnum={() => {
              const newContract = JSON.parse(JSON.stringify(props?.dicList?.VENDOR_CONTRACT_TYPE));
              delete newContract['1'];
              delete newContract['3'];
              return newContract;
            }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 10 }}
          />
          <ProFormDependency name={['type']}>
            {(data: any) => {
              if (data.type == 0) {
                // 模板线上
                return (
                  <>
                    <ProFormSelect
                      name="template_id"
                      label="续签模板"
                      rules={[{ required: true, message: '请选择合同续签模板' }]}
                      showSearch
                      debounceTime={300}
                      fieldProps={selectProps}
                      request={async (v) => {
                        const res: any = await pubGetDepotList(v);
                        console.log(res);
                        return res;
                      }}
                    />
                  </>
                );
              } else {
                // 模板线下 自定义线上 自定义线下 都有
                return (
                  <>
                    <Form.Item
                      label="上传合同"
                      name="sys_files"
                      rules={[{ required: true, message: '请上传上传合同' }]}
                      extra="只支持.docx,.doc,.pdf格式"
                    >
                      <UploadFileList
                        fileBack={handleUpload}
                        businessType="VENDOR_CONTRACT"
                        required
                        listType="picture"
                        accept={['.docx,.doc,.pdf']}
                        acceptType={['docx', 'doc', 'pdf']}
                        maxSize="5"
                        maxCount="1"
                      />
                    </Form.Item>
                    <ProFormDateRangePicker
                      name="time"
                      fieldProps={{ format: 'YYYY-MM-DD' }}
                      label="合同起止日期"
                      rules={[{ required: true, message: '请选择合同起止日期' }]}
                    />
                  </>
                );
              }
            }}
          </ProFormDependency>

          <ProFormRadio.Group
            name="payment_method_key"
            label="结算方式"
            rules={[{ required: true, message: '请选择结算方式' }]}
            valueEnum={props?.dicList?.VENDOR_CONTRACT_PAYMENT_METHOD_KEY}
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
                          name="payment_method_value"
                          rules={[{ required: true, message: '请选择结算方式' }]}
                          showSearch
                          debounceTime={300}
                          fieldProps={selectProps}
                          valueEnum={props?.dicList?.CONTRACT_PAYMENT_METHOD}
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
                        <div className="addContract-nav">
                          <div className="addContract-item">
                            前
                            <ProFormText
                              name="stage_before_number"
                              placeholder="张数"
                              wrapperCol={{ span: 24 }}
                              rules={[{ required: true, message: '请输入张数' }]}
                            />
                            张采购单按预付
                            <ProFormText
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
                              debounceTime={300}
                              fieldProps={selectProps}
                              wrapperCol={{ span: 24 }}
                              style={{ width: '120px' }}
                              valueEnum={props?.dicList?.CONTRACT_PREPAID_PAYMENT_METHOD}
                            />
                            结算，
                          </div>
                          <div className="addContract-item">
                            后续所有采购单，均按
                            <ProFormSelect
                              name="stage_after_days"
                              rules={[{ required: true, message: '请选择结算方式' }]}
                              showSearch
                              debounceTime={300}
                              fieldProps={selectProps}
                              request={async () => {
                                console.log(8888);
                                const resD: any = [];
                                const res = await props?.dicList?.CONTRACT_PAYMENT_METHOD;
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
                    dicList={props?.dicList}
                  />
                );
              } else {
                return <></>;
              }
            }}
          </ProFormDependency>
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;
