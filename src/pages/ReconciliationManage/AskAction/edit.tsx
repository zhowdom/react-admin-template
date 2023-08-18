import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Spin, Space, Row, Col, Form, Empty } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProFormDatePicker,
} from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import './style.less';
import { connect, history } from 'umi';
import {
  purchaseOrderGetDetailById,
  updatePurchaseOrder,
} from '@/services/pages/reconciliationAskAction';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { findValidVendorToSubject } from '@/services/pages/purchasePlan';
import { pubConfig, pubMsg, pubFilter } from '@/utils/pubConfig';
import { useAccess, Access } from 'umi';
import OrderDetail from '@/components/OrderDetail';
import HandleAction from './Dialog/HandleAction';
import moment from 'moment';

const Page: FC<Record<string, any>> = (props) => {
  // model下发数据
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [mainList, setMainList] = useState([]);
  const id = history.location?.query?.id || '';
  const access = useAccess();
  // 添加弹窗实例1
  const aduitModel = useRef();
  // 打开弹窗
  const handleOpen: any = (ids?: any, type?: any, required?: any, values?: any) => {
    const data: any = aduitModel?.current;
    data.open(ids, type, required, values);
  };
  // 查询某个供应商下面所有在有效期内的签约主体
  const getValidVendor = async (vendorId?: any) => {
    const res = await findValidVendorToSubject({ vendorId });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newVenders = res.data.map((v: any) => {
        return {
          value: v.subject_id,
          label: v.subject_name,
        };
      });
      setMainList(newVenders);
    }
  };
  // 详情
  const getDetail = async (): Promise<any> => {
    setLoading(true);
    const res = await purchaseOrderGetDetailById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDetail(res.data);
      getValidVendor(res.data.vendor_id);
      formRef?.current?.setFieldsValue({ ...res.data });
    }
    setLoading(false);
  };
  useEffect(() => {
    getDetail();
  }, []);

  // 弹窗关闭
  const modalClose = (data: any) => {
    if (!data) return;
    setTimeout(() => {
      getDetail();
    }, 200);
  };
  // 上传
  const handleUpload = (info: any) => {
    formRef?.current?.setFieldsValue({
      proof: info,
    });
  };
  // 表单提交
  const saveSubmit = async (values: Record<string, any>) => {
    setLoading(true);
    const newD = JSON.parse(JSON.stringify(values))
    newD.requirement_pay_time = moment(new Date(newD.requirement_pay_time)).format('YYYY-MM-DD') + ' 00:00:00';
    const res = await updatePurchaseOrder(newD);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('保存成功！', 'success');
    }
    setLoading(false);
  };

  // 提交
  const submit = () => {
    formRef?.current?.submit();
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
                  <Access key="saveButton" accessible={access.canSee('askAction_update')}>
                    <Button
                      type="primary"
                      onClick={() => {
                        submit();
                      }}
                    >
                      保存
                    </Button>
                  </Access>
                  <Access key="auditButton" accessible={access.canSee('askAction_auditAgain')}>
                    <Button
                      ghost
                      type="primary"
                      onClick={() => {
                        formRef?.current?.validateFields().then(() => {
                          handleOpen(
                            detail?.id,
                            'saveAudit',
                            false,
                            formRef?.current?.getFieldsValue(),
                          );
                        });
                      }}
                    >
                      申请审批
                    </Button>
                  </Access>
                </Space>
                <Access key="findByIdButton" accessible={access.canSee('askAction_order_detail')}>
                  <OrderDetail
                    id={detail.order_id}
                    title={
                      <Button style={{ float: 'right' }} ghost type="primary">
                        查看采购单
                      </Button>
                    }
                    dicList={common?.dicList}
                  />
                </Access>
              </>
            }
            bordered={false}
          >
            <ProFormText name="id" label="id" hidden />
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item label="请款日期">{detail?.create_time}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="当前状态">
                  {pubFilter(common.dicList.PURCHASE_REQUEST_FUNDS_STATUS, detail.approval_status)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <ProFormText
                  name="amount"
                  label="请款金额"
                  rules={[{ required: true, message: '请输入请款金额' }]}
                />
              </Col>
              <Col span={12}>
                <Form.Item label="请款人">{detail?.create_user_name}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="供应商名称">{detail?.vendor_name}</Form.Item>
              </Col>
              <Col span={12}>
                <ProFormSelect
                  name="main_id"
                  label="付款主体"
                  rules={[{ required: true, message: '请选择付款主体' }]}
                  showSearch
                  debounceTime={300}
                  fieldProps={{
                    options: mainList,
                    filterOption: (input: any, option: any) => {
                      const trimInput = input.replace(/^\s+|\s+$/g, '');
                      if (trimInput) {
                        return option.label.indexOf(trimInput) >= 0;
                      } else {
                        return true;
                      }
                    },
                    notFoundContent: (
                      <Empty
                        className="pub-empty-blue"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="没有满足所选供应商的付款主体"
                      />
                    ),
                  }}
                />
              </Col>
              <Col span={12}>
                <Form.Item label="收款账户名">{detail?.bank_account_name}</Form.Item>
              </Col>
              <Col span={12}>
                <ProFormDatePicker
                  name="requirement_pay_time"
                  label="要求付款时间"
                  rules={[{ required: true, message: '请选择要求付款时间' }]}
                />
              </Col>
              <Col span={12}>
                <Form.Item label="银行账号">{detail?.bank_account}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="开户行">{detail?.bank_name}</Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="上传附件"
                  name="proof"
                  extra="支持PDF、Word、JPG、JPEG、PNG、EXCEL文件格式"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                >
                  <UploadFileList
                    fileBack={handleUpload}
                    businessType="PURCHASE_ORDER_REQUEST_FUNDS"
                    listType="picture-card"
                    defaultFileList={detail.proof || []}
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
      <HandleAction aduitNoModel={aduitModel} handleClose={modalClose} />
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
