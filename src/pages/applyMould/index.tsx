import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, history } from 'umi';
import { Button, Card, Col, Form, Modal, Row, Space, Spin, Statistic } from 'antd';
import { ProFormDigit, ProFormInstance, ProFormText } from '@ant-design/pro-form';
import {
  ProFormDependency,
  ProFormSelect,
  ProFormGroup,
  ProFormTextArea,
} from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { pubConfig, pubMsg, pubModal, pubFilter, pubRequiredMaxRule } from '@/utils/pubConfig';
import { getDetail, mouldApply } from '@/services/pages/establish';
import { pubGetUserList, pubProLineList } from '@/utils/pubConfirm';
import EditZTTable from './chooseSku/editTable';
import PubDingDept from '@/components/PubForm/PubDingDept';
import {
  getGoods,
  getSkusM,
  getDetail as getDetailOrder,
  updateSubmit,
} from '@/services/pages/sample';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import './index.less';

const Mould = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const typeEdit = history?.location?.query?.typeEdit; // 2仅查看
  const id: any = history?.location?.query?.id; // id存在,新品立项新增
  const orderId = history?.location?.query?.orderId; // 编辑或查看
  const disabled = !!history?.location?.query?.orderId && typeEdit === '2';
  const mould_type = history?.location?.query?.mould_type; // 开模类型

  const formRef = useRef<ProFormInstance>();
  const [proLine, setProLine] = useState();
  const [detailData, setDetailData] = useState<any>();
  const [loading] = useState(false);
  const [editIds, setEditIds] = useState<any>([]);
  const [editForm] = Form.useForm();
  const [alReady, setAlReady] = useState(false);
  const [goodsList, setGoodsList] = useState([]);
  const [itemKey, setItemKey] = useState('projects_goods_sku_id');
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
  const handleUpload = (info: any, key: string) => {
    console.log(info, key);
    formRef?.current?.setFieldsValue({
      [key]: info,
    });
    formRef?.current?.validateFields([key]);
  };
  // 获取开发
  const pubGetUserListAction = async (v: any): Promise<any> => {
    const res: any = await pubGetUserList(v);
    return res || [];
  };
  // 获取产品下拉
  const getGoodsAction = async (
    vendor_group_id?: string,
    business_scope?: string,
    clear?: boolean,
  ): Promise<any> => {
    if (clear) {
      formRef?.current?.setFieldsValue({
        goods_id: null,
      });
    }
    const res = await getGoods({
      current_page: 1,
      page_size: 1000,
      category_id: vendor_group_id,
      business_scope,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setGoodsList([]);
    } else {
      const newObj = res?.data?.records.map((item: any) => {
        return {
          value: item.id,
          label: item.name_cn,
        };
      });
      setGoodsList(newObj);
    }
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
  // 获取款式
  const getSkusAction = async (goods_id: string) => {
    const res = await getSkusM({
      goods_id,
      current_page: 1,
      page_size: 1000,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setEditIds([]);
      formRef.current?.setFieldsValue({
        projectsGoodsSkus: [],
      });
    } else {
      const data = res?.data?.records.map((v: any) => {
        return {
          ...v,
          goods_sku_id: v.id,
        };
      });
      formRef.current?.setFieldsValue({
        projectsGoodsSkus: data || [],
      });
      setDetailData((pre: any) => {
        return {
          ...pre,
          projectsGoodsSkus: data || [],
          mould_type: '2',
        };
      });
      setEditIds(data.map((v: any) => v.goods_sku_id));
      setAlReady(true);
    }
  };
  // 样品单详情接口
  const getDetailOrderAction = async () => {
    const res = await getDetailOrder({ id: orderId });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    const initForm = res?.data || {};
    initForm.developer = {
      value: initForm.developer_id,
      label: initForm.developer_name,
    };
    initForm.projectsGoodsSkus = initForm.purchaseSampleOrderSkuList || [];
    getProLineListAction(initForm.business_scope);
    getGoodsAction(initForm.category_id, initForm.business_scope);
    setDetailData({
      ...initForm,
      projectsGoodsSkus: initForm.mould_type == '1' && !orderId ? initForm.projectsGoodsSkus : null,
    });
    if (initForm.mould_type == '2') {
      setItemKey('goods_sku_id');
    } else {
      setItemKey('projects_goods_sku_id');
    }
    if (!disabled) {
      const ids = initForm?.purchaseSampleOrderSkuList?.map((val: any) => val.goods_sku_id) || [];
      setEditIds(ids);
    }
    formRef?.current?.setFieldsValue({
      ...initForm,
    });
    setAlReady(true);
  };
  // 立项详情接口
  const getDetailAction = async () => {
    const res = await getDetail({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setEditIds([]);
      formRef.current?.setFieldsValue({
        projectsGoodsSkus: [],
      });
    } else {
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
      initForm.mould_type = initForm?.mould_type || '1';
      if (initForm?.sys_files?.length) {
        initForm.sys_files[0].isMain = 1;
      }
      if (initForm?.projectsGoodsSkus?.length) {
        initForm.projectsGoodsSkus = initForm?.projectsGoodsSkus.map((item: any) => {
          return {
            ...item,
            [`${itemKey}`]: item.id,
          };
        });
      }
      setEditIds(initForm?.projectsGoodsSkus?.map((v: any) => v?.[`${itemKey}`]) || []);
      setDetailData(initForm);
      formRef?.current?.setFieldsValue({
        ...initForm,
        mould_reason: null,
        mould_sale_plan: null,
        mould_attainable_quota: null,
        mould_advantages: null,
      });
      setAlReady(true);
    }
  };
  const updateForm = async (postData: any) => {
    postData.id = orderId;
    postData.developer_name = postData.developer?.label || null;
    postData.developer_id = postData.developer?.value || null;
    postData.purchaseSampleOrderSkuList = postData.projectsGoodsSkus;
    postData.type = 2;
    PubDingDept(
      async (dId: any) => {
        const res: any = await updateSubmit(postData, dId);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('提交成功', 'success');
          setTimeout(() => {
            history.goBack();
          }, 200);
        }
      },
      (err: any) => {
        console.log(err);
      },
    );
  };
  // 申请开模
  const updateFormM = (postData: any) => {
    const curData = {
      predict_currency: postData.predict_currency,
      predict_amount: postData.predict_amount,
      mould_type: id ? '1' : '2',
      project_goods_id: id,
      goods_id: postData?.goods_id,
      mould_reason: postData.mould_reason,
      mould_sale_plan: postData.mould_sale_plan,
      mould_attainable_quota: postData.mould_attainable_quota,
      mould_advantages: postData.mould_advantages,
      purchaseSampleOrderSkuList: postData.projectsGoodsSkus.map((v: any) => {
        return {
          ...v,
          price: v.project_price || v.price,
        };
      }),
      developer_name: postData.developer?.label || null,
      developer_id: postData.developer?.value || null,
      vendor_group_id: postData.vendor_group_id || null,
      business_scope: postData.business_scope || null,
      type: 2,
    };
    pubModal('确定提交吗?')
      .then(async () => {
        PubDingDept(
          async (dId: any) => {
            const res: any = await mouldApply(curData, dId);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
            } else {
              pubMsg('提交成功', 'success');
              setTimeout(() => {
                history.goBack();
              }, 200);
            }
          },
          (err: any) => {
            console.log(err);
          },
        );
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };

  const getDetailData = () => {
    // 存在id调详情接口
    if (id) {
      getDetailAction();
    } else if (orderId) {
      getDetailOrderAction();
    } else {
      setItemKey('goods_sku_id');
      formRef?.current?.setFieldsValue({
        projectsGoodsSkus: [],
        mould_type: '2',
      });
    }
  };
  useEffect(() => {
    getDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.location?.pathname, history?.location?.search]);
  // 表格数据改变
  const tableDataChange = (data: any) => {
    formRef?.current?.setFieldsValue({
      projectsGoodsSkus: data,
    });
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
            if (orderId) {
              updateForm(values);
            } else {
              updateFormM(values);
            }
          }}
          onFinishFailed={() => {
            Modal.warning({
              title: '提示',
              content: '请检查表单信息正确性',
            });
          }}
          formRef={formRef}
          submitter={{
            render: (data: any) =>
              !disabled ? (
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
                        提交审核
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
              ) : null,
          }}
        >
          {detailData?.requested_amount ? (
            <Card
              title="请款信息"
              bordered={false}
              style={{ marginTop: '10px' }}
              extra={
                <span style={{ display: detailData?.project_code ? 'block' : 'none' }}>
                  立项编号：{detailData?.project_code}
                </span>
              }
            >
              <Row gutter={24} className="mb7">
                <Col span={8}>
                  <ProFormText name="project_goods_id" label="project_goods_id" hidden />
                  <Form.Item label="供应商">{detailData?.vendor_name || '-'}</Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="采购主体">
                    {detailData?.procurement_subject_name || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <ProForm.Item label="开模合同：" name="mould_files">
                    <UploadFileList
                      fileBack={(val: any, init: boolean) => {
                        if (!init) {
                          handleUpload(val, 'mould_files');
                        }
                      }}
                      disabled
                      businessType={'PURCHASE_SAMPLE_ORDER_MOULD_CONTRACT'}
                      checkMain={false}
                      defaultFileList={detailData?.mould_files}
                      accept={['.docx,.doc,.xls,.xlsx,.pdf,.jpg,.jpeg']}
                      acceptType={['docx', 'doc', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg']}
                      maxSize="20"
                    />
                  </ProForm.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="模具归属权">
                    {pubFilter(
                      common.dicList.PURCHASE_SAMPLE_ORDER_ASCRIPTION,
                      detailData?.mould_ascription,
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="总开模金额">{detailData?.order_amount || '-'}</Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="结算币种">
                    {pubFilter(common.dicList.SC_CURRENCY, detailData?.currency)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="已请款金额">{detailData?.requested_amount || '-'}</Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="已付款金额">{detailData?.payment_amount || '-'}</Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="付款状态">
                    {detailData?.procurement_subject_name || '-'}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ) : (
            <></>
          )}

          <Card
            title="开模申请信息"
            bordered={false}
            style={{ marginTop: '10px' }}
            extra={
              <span style={{ display: detailData?.project_code ? 'block' : 'none' }}>
                立项编号：{detailData?.project_code}
              </span>
            }
          >
            <Row gutter={24} className="disabled establish  show-detail">
              <Col span={8}>
                <ProFormSelect
                  name="mould_type"
                  label="开模类型"
                  readonly
                  valueEnum={dicList.PURCHASE_SAMPLE_ORDER_MOULD_TYPE}
                  placeholder={disabled ? '--' : '请选择开模类型'}
                />
              </Col>
            </Row>
            <Row gutter={24} className="disabled establish  show-detail">
              <Col span={8} className="proLine-group">
                <ProFormGroup>
                  {id || mould_type == '1' || disabled ? (
                    <div className="item">
                      <span className="label">产品线 : </span>
                      <span className={detailData?.business_scope ? 'value' : 'value none'}>
                        {detailData?.business_scope
                          ? detailData?.business_scope == 'CN'
                            ? '国内 - '
                            : '跨境 - '
                          : '-'}
                      </span>
                    </div>
                  ) : (
                    <ProFormSelect
                      name="business_scope"
                      label="产品线："
                      placeholder={disabled ? '-' : '请选择业务范畴'}
                      rules={[{ required: !disabled, message: '请选择业务范畴' }]}
                      valueEnum={{
                        IN: '跨境',
                        CN: '国内',
                      }}
                      onChange={(val: any) => {
                        getProLineListAction(val, true);
                      }}
                    />
                  )}
                  <ProFormDependency name={['vendor_group_id', 'business_scope']}>
                    {({ business_scope }) => {
                      return (
                        <ProFormSelect
                          name="vendor_group_id"
                          label=""
                          disabled={id || mould_type == '1' || disabled}
                          options={proLine || []}
                          placeholder="请选择产品线"
                          showSearch
                          allowClear
                          onChange={(val: any) => {
                            // getVendor(val, true);
                            getGoodsAction(val, business_scope, true);
                          }}
                        />
                      );
                    }}
                  </ProFormDependency>
                </ProFormGroup>
              </Col>
              <Col span={8}>
                {id || (orderId && detailData?.mould_type === '1') ? (
                  <Form.Item label="产品名称">
                    {id ? detailData?.name || '-' : detailData?.goods_name || '-'}
                  </Form.Item>
                ) : (
                  <ProFormSelect
                    readonly={disabled || mould_type == '1'}
                    name="goods_id"
                    label="产品名称"
                    fieldProps={{
                      ...selectProps,
                      options: goodsList,
                    }}
                    placeholder={disabled ? '-' : '请选择产品名称'}
                    rules={[{ required: !disabled, message: '请选择产品名称' }]}
                    onChange={(val: any) => {
                      console.log(val);
                      if (!val) {
                        formRef.current?.setFieldsValue({
                          purchaseSampleOrderSkuList: [],
                        });
                        return;
                      }
                      getSkusAction(val);
                    }}
                  />
                )}
              </Col>
              <Col span={8}>
                {disabled || id || mould_type == '1' ? (
                  <Form.Item label="产品开发"> {detailData?.developer_name || '-'}</Form.Item>
                ) : (
                  <ProFormSelect
                    name="developer"
                    label="产品开发"
                    fieldProps={{
                      ...selectProps,
                      labelInValue: true,
                    }}
                    disabled={disabled}
                    request={async (v: any) => {
                      const res: any = await pubGetUserListAction(v);
                      return res;
                    }}
                    placeholder="请选择产品开发"
                    rules={[
                      { required: !disabled, message: '请选择产品开发' },
                      ({}) => ({
                        validator(_, value) {
                          if (JSON.stringify(value) === '{}') {
                            return Promise.reject(new Error('请选择产品开发'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  />
                )}
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24} style={{ marginBottom: '20px' }}>
                {alReady && itemKey && (
                  <EditZTTable
                    itemKey={itemKey}
                    disabled={disabled}
                    skus={detailData?.projectsGoodsSkus}
                    name="projectsGoodsSkus"
                    formRef={formRef}
                    form={editForm}
                    tableDataChange={tableDataChange}
                    editIds={editIds}
                    dicList={dicList}
                  />
                )}
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12} className="proLine-group">
                <ProFormGroup>
                  <ProFormSelect
                    name="predict_currency"
                    label="预计开模费用"
                    readonly={disabled}
                    valueEnum={dicList?.SC_CURRENCY}
                    placeholder={disabled ? '-' : '请选择币种'}
                    rules={[{ required: !disabled, message: '请选择币种' }]}
                  />
                  {disabled ? (
                    <Form.Item label="">
                      <Statistic
                        value={detailData?.predict_amount ?? '-'}
                        valueStyle={{
                          fontWeight: 400,
                          fontSize: '14px',
                          marginLeft: '5px',
                        }}
                        precision={2}
                      />
                    </Form.Item>
                  ) : (
                    <ProFormDigit
                      fieldProps={{
                        precision: 2,
                      }}
                      rules={[
                        {
                          validator: (_, value) => pubRequiredMaxRule(value, 9999999, !disabled),
                        },
                      ]}
                      disabled={disabled}
                      placeholder={disabled ? '--' : '请输入预计开模费用'}
                      label=""
                      name="predict_amount"
                    />
                  )}
                </ProFormGroup>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={16}>
                <ProFormTextArea
                  fieldProps={{
                    autoSize: true,
                  }}
                  readonly={disabled}
                  placeholder="请输入申请原因"
                  rules={[
                    { required: !disabled, message: '请输入申请原因' },
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
                  readonly={disabled}
                  placeholder="1：预计布局几个变体 2：上架后的预期排名 3：预估产品生命周期"
                  rules={[
                    { required: !disabled, message: '请输入上架后预期规划' },
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
                  readonly={disabled}
                  placeholder="1：模具寿命（参考30万次计算）2：产品的稳定期售价 3：预估总销售额=模具寿命*产品稳定期售价"
                  rules={[
                    { required: !disabled, message: '请输入模具可达成的销售额' },
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
                  readonly={disabled}
                  rules={[
                    { required: !disabled, message: '请输入开模产品比现货产品的优势点' },
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
