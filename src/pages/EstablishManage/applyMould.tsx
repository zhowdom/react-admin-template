import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, history } from 'umi';
import { Button, Card, Col, Form, Modal, Row, Space, Spin, Statistic } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import {
  ProFormDependency,
  ProFormSelect,
  ProFormGroup,
  ProFormDatePicker,
  ProFormTextArea,
} from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { pubConfig, pubMsg, pubModal, acceptTypes } from '@/utils/pubConfig';
import { getDetail, mouldApply } from '@/services/pages/establish';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { EditableProTable } from '@ant-design/pro-table';
import { pubProLineList } from '@/utils/pubConfirm';

const Mould = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const formItemLayout1 = {
    labelCol: { span: 1.5 },
    wrapperCol: { span: 23 },
  };
  type DataSourceType = {
    id?: React.Key;
    sku_name?: string;
    sys_files?: any[];
    project_price?: number;
    tempId: any;
    ref1: any;
  };
  // type: 1新增/重新提交,2 查看
  const type = history?.location?.query?.type;
  const id = history?.location?.query?.id;
  const isEstablish = history?.location?.pathname.indexOf('/establish-detail') > -1;
  const disabled = type === '2';
  const formRef = useRef<ProFormInstance>();
  const [proLine, setProLine] = useState();
  const [detailData, setDetailData] = useState<any>();
  const [loading] = useState(false);

  const disabledDate = (current: any) => {
    return current && new Date(current).getTime() + 24 * 60 * 60 < new Date().getTime();
  };

  // 获取产品线
  const getProLineListAction = async (business_scope: string, clear?: boolean) => {
    const res: any = await pubProLineList({ business_scope });
    setProLine(res);
    if (clear) {
      formRef?.current?.setFieldsValue({
        vendor_group_id: [],
        listing_site: [],
      });
    }
  };

  // 详情接口
  const getDetailAction = async () => {
    const res = await getDetail({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    let initForm: any = res?.data || {};
    getProLineListAction(initForm.business_scope);
    initForm = {
      ...initForm,
      ...initForm.projects,
    };
    initForm.listing_site = initForm?.projects?.listing_site?.split(',') || null;
    initForm.finalized_type = initForm?.projects?.finalized_type?.split(',') || null;
    initForm.developer = {
      value: initForm.developer_id,
      label: initForm.developer_name,
    };
    if (initForm?.sys_files?.length) {
      initForm.sys_files[0].isMain = 1;
    }
    if (initForm?.projectsGoodsSkus?.length) {
      initForm.projectsGoodsSkus = initForm?.projectsGoodsSkus.map((item: any, index: number) => {
        return {
          ...item,
          tempId: item.id,
          index,
        };
      });
    }
    setDetailData(initForm);
    formRef?.current?.setFieldsValue({
      ...initForm,
      mould_reason: null,
      mould_sale_plan: null,
      mould_attainable_quota: null,
      mould_advantages: null,
    });
  };

  // 申请开模
  const updateForm = (postData: any) => {
    postData.project_goods_id = id;
    const curData = {
      project_goods_id: id,
      mould_reason: postData.mould_reason,
      mould_sale_plan: postData.mould_sale_plan,
      mould_attainable_quota: postData.mould_attainable_quota,
      mould_advantages: postData.mould_advantages,
    };
    pubModal('确定提交吗?')
      .then(async () => {
        const res: any = await mouldApply(curData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('提交成功', 'success');
          setTimeout(() => {
            history.goBack();
          }, 200);
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };

  const getDetailData = () => {
    // 存在id调详情接口
    if (id) {
      getDetailAction();
    } else {
      const temp = [
        {
          tempId: Date.now(),
          sku_name: '',
          uom: '',
          sys_files: [],
          currency: '',
          project_price: '',
          index: 0,
        },
      ];
      formRef?.current?.setFieldsValue({
        projectsGoodsSkus: temp,
      });
    }
  };
  useEffect(() => {
    getDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.location?.pathname, history?.location?.search]);
  const handleUpload = (info: any, key: string) => {
    console.log(info);
    formRef?.current?.setFieldsValue({
      [key]: info,
    });
    formRef?.current?.validateFields([key]);
  };
  return (
    <PageContainer
      breadcrumb={{}}
      title={false}
      className="supplier-detail"
    >
      <Spin spinning={loading}>
        <ProForm
          labelAlign="right"
          labelCol={{ style: { minHeight: '32px' } }}
          layout="horizontal"
          onFinish={async (values: any) => {
            updateForm(values);
          }}
          onFinishFailed={() => {
            Modal.warning({
              title: '提示',
              content: '请检查表单信息正确性',
            });
          }}
          formRef={formRef}
          submitter={{
            render: (data: any) => (
              <FooterToolbar style={{ padding: '6px' }}>
                {
                  <Space>
                    <Button
                      type="primary"
                      key="save"
                      onClick={async () => {
                        data.form?.submit?.();
                      }}
                    >
                      保存
                    </Button>
                    <Button
                      key="cancel"
                      onClick={() => {
                        setTimeout(() => {
                          history.goBack();
                        }, 200);
                      }}
                    >
                      取消
                    </Button>
                  </Space>
                }
              </FooterToolbar>
            ),
          }}
        >
          <Card
            title="产品基本信息"
            bordered={false}
            className="disabled establish  show-detail"
            extra={
              <span style={{ display: detailData?.project_code ? 'block' : 'none' }}>
                立项编号：{detailData?.project_code}
              </span>
            }
          >
            <Row gutter={24}>
              <Col span={8}>
                <ProFormSelect
                  name="type"
                  label="立项类型"
                  readonly={disabled}
                  valueEnum={dicList.PROJECTS_TYPE}
                  placeholder={disabled ? '--' : '请选择立项类型'}
                />
              </Col>
              <Col span={8} className="proLine-group">
                <ProFormGroup>
                  <div className="item">
                    <span className="label">产品线 : </span>
                    <span className={detailData?.business_scope ? 'value' : 'value none'}>
                      {detailData?.business_scope
                        ? detailData?.business_scope == 'CN'
                          ? '国内 - '
                          : '跨境 - '
                        : '--'}
                    </span>
                  </div>
                  <ProFormDependency name={['vendor_group_id', 'business_scope']}>
                    {({ vendor_group_id, business_scope }) => {
                      console.log(vendor_group_id, 'vendor_group_id');
                      return (
                        <ProFormSelect
                          name="vendor_group_id"
                          label=""
                          disabled={disabled || !business_scope}
                          options={proLine || []}
                          rules={[{ required: true, message: '请选择产品线' }]}
                          placeholder={disabled ? '--' : '请选择产品线'}
                          showSearch
                          allowClear
                        />
                      );
                    }}
                  </ProFormDependency>
                </ProFormGroup>
              </Col>
              <Col span={8}>
                <Form.Item label="产品名称"> {detailData?.name || '-'}</Form.Item>
              </Col>
              <Col span={8}>
                <ProFormDatePicker
                  fieldProps={{
                    disabledDate: disabledDate,
                  }}
                  name="estimated_launch_time"
                  label="预计上架时间"
                  readonly={disabled}
                  placeholder={disabled || !isEstablish ? '--' : '请选择预计上架时间'}
                />
              </Col>

              <Col span={8}>
                <ProFormSelect
                  name="currency"
                  label="定价币种"
                  placeholder={disabled ? '--' : '请选择定价币种'}
                  readonly={disabled}
                  valueEnum={dicList.SC_CURRENCY}
                />
              </Col>
              <Col span={8}>
                <Form.Item label="产品开发"> {detailData?.developer_name || '-'}</Form.Item>
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="test_period"
                  label="是否过测试期"
                  placeholder="请选择是否过测试期"
                  readonly
                  valueEnum={dicList.SC_YES_NO}
                />
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  label="立项文档"
                  name="requirementsList"
                  valuePropName="requirementsList"
                  extra="支持word,excel,pdf格式，不得超过20M"
                >
                  <UploadFileList
                    fileBack={(val: any, init: boolean) => {
                      if (!init) {
                        handleUpload(val, 'requirementsList');
                      }
                    }}
                    disabled
                    businessType="PRODUCT_REQUIREMENTS_DOCUMENT"
                    checkMain={false}
                    defaultFileList={detailData?.requirementsList}
                    accept={['.docx,.doc,.xls,.xlsx,.pdf']}
                    acceptType={['docx', 'doc', 'xls', 'xlsx', 'pdf']}
                    maxSize="20"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="定稿文档"
                  name="finalizedList"
                  valuePropName="finalizedList"
                  extra="上传打样相关的协议或合同等，例如保密协议，支持常用文档和图片以及压缩包格式文件，可上传多个文件，单个文件不超过5M"
                >
                  <UploadFileList
                    fileBack={(val: any, init: boolean) => {
                      if (!init) {
                        handleUpload(val, 'finalizedList');
                      }
                    }}
                    disabled
                    businessType="PRODUCT_FINALIZED_CONTENT"
                    checkMain={false}
                    defaultFileList={detailData?.finalizedList}
                    accept={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                    acceptType={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                    maxSize="50"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item {...formItemLayout1} label="产品款式" name="projectsGoodsSkus">
                  <EditableProTable<DataSourceType>
                    columns={[
                      {
                        title: '图片',
                        align: 'center',
                        dataIndex: 'sys_files',
                        width: 120,
                        render: (text: any) => {
                          return (
                            <UploadFileList
                              key="pic"
                              fileBack={() => {}}
                              required
                              businessType="PROJECT_GOODS_SKU"
                              listType="picture-card"
                              checkMain={false}
                              disabled
                              defaultFileList={text ? (text == '-' ? undefined : text) : undefined}
                              accept={['.jpg,.jpeg,.png']}
                              acceptType={['jpg', 'jpeg', 'png']}
                              maxCount="1"
                              size="small"
                            />
                          );
                        },
                      },
                      {
                        title: '款式名称',
                        dataIndex: 'sku_name',
                        align: 'center',
                        formItemProps: {
                          rules: [{ required: true, message: '请输入款式名称' }],
                        },
                      },
                      {
                        title: '款式编码',
                        dataIndex: 'sku_code',
                        align: 'center',
                      },

                      {
                        title: '定价',
                        dataIndex: 'project_price',
                        valueType: 'digit',
                        align: 'center',
                        render: (_: any, record: any) => {
                          return (
                            <Statistic
                              value={record?.project_price || 0}
                              valueStyle={{ fontWeight: 400, fontSize: '14px' }}
                            />
                          );
                        },
                      },
                      {
                        title: '单位',
                        key: 'uom',
                        dataIndex: 'uom',
                        editable: false,
                        align: 'center',
                        render: () => {
                          const item = dicList.GOODS_UOM;
                          const key = detailData.uom;
                          return [<span key="uom">{item?.[key]?.text || '-'}</span>];
                        },
                      },
                    ]}
                    tableStyle={{ margin: '10px 0 0 -24px', padding: 0 }}
                    rowKey="tempId"
                    value={detailData?.projectsGoodsSkus}
                    bordered
                    recordCreatorProps={
                      disabled
                        ? false
                        : {
                            newRecordType: 'dataSource',
                            record: false,
                            style: {
                              marginLeft: '-24px',
                              width: '100%',
                              marginTop: '10px',
                            },
                          }
                    }
                    editable={{
                      type: 'multiple',
                      editableKeys: [],
                      actionRender: null,
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card title="开模申请信息" bordered={false} style={{ marginTop: '10px' }}>
            <Row gutter={24}>
              <Col span={16}>
                <ProFormTextArea
                  fieldProps={{
                    autoSize: true,
                  }}
                  placeholder="请输入申请原因"
                  rules={[
                    { required: true, message: '请输入申请原因' },
                    { max: 400, message: '最多输入400字' },
                  ]}
                  label="申请原因： "
                  name="mould_reason"
                />
              </Col>
              <Col span={16}>
                <ProFormTextArea
                  fieldProps={{
                    autoSize: true,
                  }}
                  placeholder="1：预计布局几个变体 2：上架后的预期排名 3：预估产品生命周期"
                  rules={[
                    { required: true, message: '请输入上架后预期规划' },
                    { max: 400, message: '最多输入400字' },
                  ]}
                  label="上架后预期规划： "
                  name="mould_sale_plan"
                />
              </Col>
              <Col span={16}>
                <ProFormTextArea
                  fieldProps={{
                    autoSize: true,
                  }}
                  placeholder="1：模具寿命（参考30万次计算）2：产品的稳定期售价 3：预估总销售额=模具寿命*产品稳定期售价"
                  rules={[
                    { required: true, message: '请输入模具可达成的销售额' },
                    { max: 400, message: '最多输入400字' },
                  ]}
                  label="模具可达成的销售额： "
                  name="mould_attainable_quota"
                />
              </Col>
              <Col span={16}>
                <ProFormTextArea
                  fieldProps={{
                    autoSize: true,
                  }}
                  rules={[
                    { required: true, message: '请输入开模产品比现货产品的优势点' },
                    { max: 400, message: '最多输入400字' },
                  ]}
                  label="开模产品比现货产品的优势点"
                  placeholder="'1：现货产品现状分析 2：开模产品的创新点，优势点'"
                  name="mould_advantages"
                />
              </Col>
            </Row>
          </Card>
        </ProForm>
      </Spin>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Mould);

export default ConnectPage;
