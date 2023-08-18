import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Spin, Space, Row, Col, Form } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormTextArea, ProFormDigit } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import './style.less';
import { connect, history } from 'umi';
import {
  sysBusinessDeductionById,
  updateSysBusinessDeduction,
  sysBusinessInitiateAnApplication,
} from '@/services/pages/reconciliationDeduction';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { pubConfig, pubMsg, pubFilter, pubModal } from '@/utils/pubConfig';
import { useAccess, Access } from 'umi';
import OrderDetail from '@/components/OrderDetail';
import { IsGrey } from '@/utils/pubConfirm';

const Page: FC<Record<string, any>> = (props) => {
  // model下发数据
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const id = history.location?.query?.id || '';
  let saveType = '';
  const access = useAccess();

  // 详情
  const getDetail = async (): Promise<any> => {
    setLoading(true);
    const res = await sysBusinessDeductionById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDetail(res.data);
      formRef?.current?.setFieldsValue({ ...res.data});
    }
    setLoading(false);
  };
  useEffect(() => {
    getDetail();
  }, []);

  // 上传
  const handleUpload = (info: any) => {
    console.log(info);
    formRef?.current?.setFieldsValue({
      sys_files: info,
    });
  };

  // 提交审批
  const auditSave = async (pid: string) => {
    setLoading(true);
    const res = await sysBusinessInitiateAnApplication({ id: pid });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功！', 'success');
      history.goBack();
    }
    setLoading(false);
  };
  // 表单提交
  const saveSubmit = async (values: Record<string, any>) => {
    setLoading(true);
    const res = await updateSysBusinessDeduction(values);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      if (saveType == 'save') {
        pubMsg('保存成功！', 'success');
      } else if (saveType == 'saveAudit') {
        auditSave(values.id);
      }
    }
    setLoading(false);
  };

  // 提交
  const submit = (type: string) => {
    saveType = type;
    if (type == 'save') {
      formRef?.current?.submit();
    } else {
      pubModal('是否确认发起对账审批流程？')
        .then(async () => {
          formRef?.current?.submit();
        })
        .catch(() => {
          console.log('点了取消');
        });
    }
  };

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <ProForm
        layout={'horizontal'}
        formRef={formRef}
        submitter={false}
        labelAlign="right"
        labelWrap={true}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 12 }}
        onFinish={async (values) => {
          saveSubmit(values);
        }}
      >
        <Spin spinning={loading}>
          <Card
            title={
              <>
                <Space>
                  <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                    返回
                  </Button>
                  <Access
                    key="updateButton"
                    accessible={access.canSee('sysBusinessDeduction_updateSave')}
                  >
                    <Button
                      type="primary"
                      onClick={() => {
                        submit('save');
                      }}
                    >
                      保存
                    </Button>
                  </Access>
                  {/* <Button
                    ghost
                    type="primary"
                    onClick={() => {
                      submit('saveAudit');
                    }}
                  >
                    重新提交审批
                  </Button> */}
                </Space>
                {detail.business_type == '2' ? (
                  <Access
                    key="findByIdButton"
                    accessible={access.canSee('sysBusinessDeduction_order_detail')}
                  >
                    <OrderDetail
                      id={detail.business_id}
                      title={
                        <Button style={{ float: 'right' }} ghost type="primary">
                          查看采购单
                        </Button>
                      }
                      dicList={common?.dicList}
                    />
                  </Access>
                ) : (
                  ''
                )}
              </>
            }
            bordered={false}
          >
            <ProFormText name="id" label="id" hidden />
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item label="扣款单号">{detail?.deduction_no}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="当前状态">
                  {pubFilter(
                    common?.dicList?.PURCHASE_ORDER_DEDUCTION_STATUS,
                    detail.approval_status,
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="供应商">{detail?.vendor_name}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="采购主体">{detail?.main_name}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="申请日期">{detail?.create_time}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="扣款类型">
                  {pubFilter(
                    common?.dicList?.BUSINESS_DEDUCTION_BUSINESS_TYPE,
                    detail.business_type,
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="请款人">{detail?.create_user_name}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="来源单号">
                  {detail.business_type == '2' ? detail?.business_no : '--'}
                </Form.Item>
              </Col>
              <Col span={12}>
                <ProFormDigit
                  name="amount"
                  label="申请扣款金额"
                  placeholder="请输入申请扣款金额"
                  rules={[{ required: true, message: '请输入申请扣款金额' }]}
                  min={0}
                  fieldProps={{ precision: 2 }}
                />
              </Col>
              <Col span={12}>
                <Form.Item label="可用金额">{IsGrey ? '' :detail?.available_amount}</Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="上传附件"
                  name="sys_files"
                  extra="支持PDF、Word、JPG、JPEG、PNG、EXCEL文件格式"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 10 }}
                >
                  <UploadFileList
                    fileBack={handleUpload}
                    businessType="PURCHASE_ORDER_REQUEST_FUNDS"
                    listType="picture"
                    defaultFileList={detail.sys_files}
                    accept={['.png,.jpg,.docx,.pdf,.doc,.xls,.xlsx']}
                    acceptType={['png', 'jpg', 'docx', 'pdf', 'doc', 'xls', 'xlsx']}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <ProFormTextArea
                  name="reason"
                  label="请款原因"
                  placeholder="请输入请款原因"
                  rules={[{ required: true, message: '请输入请款原因' }]}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 10 }}
                />
              </Col>
              <Col span={24}>
                <Form.Item label="操作记录" labelCol={{ span: 4 }} wrapperCol={{ span: 10 }}>
                  {detail?.remarks?.map((v: any) => {
                    return v.remarks;
                  })}
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Spin>
      </ProForm>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
