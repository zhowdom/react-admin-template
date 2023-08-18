import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, history, useAccess, Access } from 'umi';
import { Button, Col, Form, Modal, Row, Space, Spin, Statistic } from 'antd';
import {
  ProFormTextArea,
  ProFormDependency,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
  ProFormGroup,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormText } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { pubConfig, pubMsg, pubModal } from '@/utils/pubConfig';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import {
  insert,
  getDetail,
  update,
  approvalHistory,
  insertSubmit,
  updateSubmit,
  getGoods,
  getSkus,
} from '@/services/pages/sample';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import EditZTTable from './editTable';
import { pubGetSigningList, pubProLineList } from '@/utils/pubConfirm';
import ApprovalInfo from '../PriceApproval/ApprovalInfo';
import { freePage } from '@/services/base';
import PubDingDept from '@/components/PubForm/PubDingDept';

const Detail = (props: any) => {
  const access = useAccess();
  const { common } = props;
  const { dicList } = common;
  const [tab, setTab] = useState('');
  const [approvalInfo, setApprovalInfo] = useState([]);
  const [editForm] = Form.useForm();
  const [proLine, setProLine] = useState();
  // typeEdit: 1新增/编辑,2 查看
  const orderId = history?.location?.query?.orderId;
  const typeEdit = history?.location?.query?.typeEdit;
  const typeC = history?.location?.query?.type; // 0：现货，2： 开模
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [alReady, setAlReady] = useState(false);
  const [detailData, setDetailData] = useState<any>({});
  const [btnType, setBtnType] = useState<any>(); // 按钮类型，1保存，2审核
  const disabled = typeEdit === '2';
  const [vendorList, setVendorList] = useState([]);
  const [goodsList, setGoodsList] = useState([]);
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
  // 表格数据改变
  const tableDataChange = (data: any) => {
    formRef?.current?.setFieldsValue({
      projectsGoodsSkus: data,
    });
  };
  // 更新表单
  const updateForm = (postData: any) => {
    pubModal(btnType == 1 ? '确定提交保存吗' : '确定提交审核吗')
      .then(async () => {
        // 保存
        if (btnType == 1) {
          // 编辑
          if (orderId && typeEdit == '1') {
            // postData.project_goods_id = id;
            postData.id = orderId;
            const res: any = await update(postData);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
            } else {
              pubMsg('保存成功', 'success');
              setTimeout(() => {
                history.goBack();
              }, 200);
            }
          } else {
            // 新增
            const res: any = await insert(postData);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
            } else {
              pubMsg('保存成功', 'success');
              setTimeout(() => {
                history.goBack();
              }, 200);
            }
          }
          // 保存并审核
        } else {
          // 编辑
          if (orderId && typeEdit == '1') {
            // postData.project_goods_id = id;
            postData.id = orderId;
            PubDingDept(
              async (dId: any) => {
                const res: any = await updateSubmit(postData, dId);
                if (res?.code != pubConfig.sCode) {
                  pubMsg(res?.message);
                } else {
                  pubMsg('已提交，请等待审核', 'success');
                  setTimeout(() => {
                    history.goBack();
                  }, 200);
                }
              },
              (err: any) => {
                console.log(err);
              },
            );
            // 新增
          } else {
            PubDingDept(
              async (dId: any) => {
                const res: any = await insertSubmit(postData, dId);
                if (res?.code != pubConfig.sCode) {
                  pubMsg(res?.message);
                } else {
                  pubMsg('已提交，请等待审核', 'success');
                  setTimeout(() => {
                    history.goBack();
                  }, 200);
                }
              },
              (err: any) => {
                console.log(err);
              },
            );
          }
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  const handleUpload = (info: any, key: string) => {
    console.log(info, key);
    formRef?.current?.setFieldsValue({
      [key]: info,
    });
    formRef?.current?.validateFields([key]);
  };
  // 获取供应商列表下拉
  const getVendor = async (vendor_group_id?: string, clear?: boolean): Promise<any> => {
    if (clear) {
      formRef?.current?.setFieldsValue({
        vendor_id: null,
        goods_id: '',
        purchaseSampleOrderSkuList: [],
      });
      setGoodsList([]);
    }
    const res = await freePage({
      current_page: 1,
      page_size: 1000,
      vendor_group_id: vendor_group_id ? [vendor_group_id] : null,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setVendorList([]);
    } else {
      const newObj = res?.data?.records.map((item: any) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setVendorList(newObj);
    }
  };
  const [editIds, setEditIds] = useState<any>([]);
  // 获取产品下拉
  const getGoodsAction = async (
    vendor_group_id?: string,
    business_scope?: string,
    clear?: boolean,
  ): Promise<any> => {
    if (clear) {
      formRef?.current?.setFieldsValue({
        name: null,
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

  const disabledDate = (current: any) => {
    return current && new Date(current).getTime() + 24 * 60 * 60 < new Date().getTime();
  };
  // 获取款式
  const getSkusAction = async (goods_id: string, vendor_id: string) => {
    const res = await getSkus({
      goods_id,
      vendor_id,
      current_page: 1,
      page_size: 1000,
      sku_type: 1,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setEditIds([]);
      formRef.current?.setFieldsValue({
        purchaseSampleOrderSkuList: [],
      });
    } else {
      formRef.current?.setFieldsValue({
        purchaseSampleOrderSkuList: res?.data?.records || [],
      });
      setEditIds(res?.data?.records.map((v: any) => v.goods_sku_id));
      setAlReady(true);
    }
  };
  // 获取历史审批
  const getApprovalHistory = async () => {
    setLoading(true);
    const res = await approvalHistory({ id: orderId });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    setTab('info');
    setApprovalInfo(res?.data || []);
    setLoading(false);
  };

  // 获取产品线
  const getProLineListAction = async (business_scope?: string, clear?: boolean) => {
    const res: any = await pubProLineList({ business_scope });
    setProLine(res);
    if (clear) {
      formRef?.current?.setFieldsValue({
        vendor_group_id: '',
        vendor_id: '',
      });
    }
  };
  // 获取详情接口
  const getDetailAction = async () => {
    const res = await getDetail({ id: orderId });
    getApprovalHistory();
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }

    const initForm = res?.data || {};
    getProLineListAction(initForm.business_scope);
    getVendor(initForm.vendor_group_id);
    getGoodsAction(initForm.vendor_group_id, initForm.business_scope);
    setDetailData(initForm);
    if (!disabled) {
      const ids = initForm?.purchaseSampleOrderSkuList?.map((val: any) => val.goods_sku_id) || [];
      setEditIds(ids);
    }
    initForm.type = initForm.type || '0';
    formRef?.current?.setFieldsValue({
      ...initForm,
    });
    setAlReady(true);
  };

  useEffect(() => {
    // 存在id调详情接口
    if (orderId) {
      getDetailAction();
    } else {
      const initForm: any = { type: typeC };
      setTab('info');
      formRef?.current?.setFieldsValue(initForm);
      setDetailData(initForm);
      setAlReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.location?.pathname, history?.location?.search]);
  return (
    <PageContainer
      breadcrumb={{}}
      tabList={
        approvalInfo?.length
          ? [
              {
                tab: '基本信息',
                key: 'info',
              },
              {
                tab: '审批状态',
                key: 'approval',
              },
            ]
          : false
      }
      className="pubPageTabs"
      tabActiveKey={tab}
      onTabChange={async (val) => {
        setTab(val);
      }}
      title={false}
    >
      <>
        <Spin spinning={loading}>
          <ProCard
            bodyStyle={{ padding: disabled ? '24px 35px' : '24px' }}
            headerBordered
            title="采购信息"
            style={{ display: tab == 'info' && !loading ? 'block' : 'none' }}
          >
            <div className="supplier-detail">
              <ProForm
                className={disabled ? 'disabled show-detail' : 'show-detail'}
                labelAlign="right"
                labelCol={{ style: { minHeight: '32px' } }}
                layout="horizontal"
                onFinish={async (values) => {
                  return Promise.all([editForm.validateFields()])
                    .then(() => {
                      const postData = JSON.parse(JSON.stringify(values));
                      postData.type = values.type ? values.type : detailData.type;
                      updateForm(postData);
                    })
                    .catch(() => {
                      Modal.warning({
                        title: '提示',
                        content: '请检查表单信息正确性',
                      });
                    });
                }}
                onFinishFailed={() => {
                  editForm.validateFields();
                  Modal.warning({
                    title: '提示',
                    content: '请检查表单信息正确性',
                  });
                }}
                formRef={formRef}
                submitter={{
                  render: (data: any) => (
                    <FooterToolbar style={{ padding: '6px' }}>
                      {!disabled ? (
                        <Space>
                          <Access key="approval" accessible={access.canSee('sample_edit')}>
                            <Button
                              type="primary"
                              onClick={async () => {
                                setBtnType(2);
                                data.form?.submit?.();
                              }}
                            >
                              提交审核
                            </Button>
                          </Access>

                          {/* <Button
                            type="primary"
                            key="save"
                            onClick={async () => {
                              setBtnType(1);
                              data.form?.submit?.();
                            }}
                          >
                            保存
                          </Button> */}
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
                      ) : (
                        <Button
                          key="back"
                          icon={<ArrowLeftOutlined />}
                          onClick={() => {
                            setTimeout(() => {
                              history.goBack();
                            }, 200);
                          }}
                        >
                          返回
                        </Button>
                      )}
                    </FooterToolbar>
                  ),
                }}
              >
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item label="订单类型: ">
                      {dicList?.PURCHASE_SAMPLE_ORDER_TYPE?.[detailData?.type]?.text}
                    </Form.Item>
                  </Col>
                  <Col span={8} className="disabled proLine-group">
                    <ProFormGroup>
                      {disabled ? (
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
                          rules={[{ required: true, message: '请选择业务范畴' }]}
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
                        {() => {
                          return (
                            <ProFormSelect
                              name="vendor_group_id"
                              label=""
                              disabled={disabled}
                              options={proLine || []}
                              placeholder="请选择产品线"
                              showSearch
                              allowClear
                              onChange={(val: any) => {
                                getVendor(val, true);
                              }}
                            />
                          );
                        }}
                      </ProFormDependency>
                    </ProFormGroup>
                  </Col>
                  <Col span={8}>
                    {disabled ? (
                      <ProFormText readonly name="vendor_name" label="供应商" />
                    ) : (
                      <ProFormSelect
                        name="vendor_id"
                        label="供应商"
                        fieldProps={{
                          ...selectProps,
                          options: vendorList,
                        }}
                        placeholder={disabled ? '-' : '请选择供应商'}
                        onChange={() => {
                          formRef.current?.setFieldsValue({
                            goods_id: '',
                            purchaseSampleOrderSkuList: [],
                          });
                          const business_scope = formRef.current?.getFieldValue('business_scope');
                          const vendor_group_id = formRef.current?.getFieldValue('vendor_group_id');
                          getGoodsAction(vendor_group_id, business_scope, true);
                        }}
                        rules={[{ required: !disabled, message: '请选择供应商' }]}
                      />
                    )}
                  </Col>
                  <Col span={8}>
                    <ProFormSelect
                      name="procurement_subject_id"
                      label="采购主体"
                      fieldProps={selectProps}
                      readonly={disabled}
                      request={async (v) => {
                        const res: any = await pubGetSigningList({ key_word: v?.keyWords });
                        return res;
                      }}
                      placeholder={disabled ? '-' : '请选择采购主体'}
                      rules={[{ required: !disabled, message: '请选择采购主体' }]}
                    />
                  </Col>
                  <Col span={8} className="disabled">
                    <ProFormSelect
                      name="goods_id"
                      label="产品名称"
                      readonly={disabled}
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
                        const vendor_id = formRef.current?.getFieldValue('vendor_id');
                        getSkusAction(val, vendor_id);
                      }}
                    />
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} style={{ marginBottom: '20px' }}>
                    {alReady && (
                      <EditZTTable
                        name="purchaseSampleOrderSkuList"
                        disabled={disabled}
                        formRef={formRef}
                        form={editForm}
                        tableDataChange={tableDataChange}
                        editIds={editIds}
                        dicList={dicList}
                      />
                    )}
                  </Col>
                </Row>
                <ProFormDependency name={['type']}>
                  {({ type }) => {
                    // 选择采购类型的交互
                    if (type === '0') {
                      return (
                        <>
                          <Row gutter={24}>
                            <Col span={8} className="proLine-group">
                              <ProFormGroup>
                                <ProFormSelect
                                  name="currency"
                                  label="样品金额"
                                  readonly={disabled}
                                  valueEnum={dicList?.SC_CURRENCY}
                                  placeholder={disabled ? '-' : '请选择币种'}
                                  rules={[{ required: !disabled, message: '请选择币种' }]}
                                />
                                {disabled ? (
                                  <Form.Item label="">
                                    <Statistic
                                      value={detailData?.order_amount ?? '-'}
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
                                      maxLength: 125,
                                    }}
                                    disabled={disabled}
                                    placeholder={disabled ? '--' : '请输入样品金额'}
                                    label=""
                                    name="order_amount"
                                    rules={[{ required: !disabled, message: '请输入样品金额' }]}
                                  />
                                )}
                              </ProFormGroup>
                            </Col>
                          </Row>
                          <Row gutter={24}>
                            <Col span={8}>
                              <ProFormDatePicker
                                fieldProps={{
                                  disabledDate: disabledDate,
                                }}
                                name="delivery_time"
                                label="预计交货时间"
                                readonly={disabled}
                                placeholder={disabled ? '--' : '请选择预计交货时间'}
                                rules={[{ required: !disabled, message: '请选择预计交货时间' }]}
                              />
                            </Col>
                          </Row>
                        </>
                      );
                    } else if (type === '1') {
                      return (
                        <Row gutter={24}>
                          <Col span={8} className="proLine-group">
                            <ProFormGroup>
                              <ProFormSelect
                                name="currency"
                                label="手板单金额"
                                readonly={disabled}
                                valueEnum={dicList?.SC_CURRENCY}
                                placeholder={disabled ? '--' : '请选择币种'}
                                rules={[{ required: !disabled, message: '请选择币种' }]}
                              />

                              {disabled ? (
                                <Form.Item label="">
                                  <Statistic
                                    value={detailData?.order_amount ?? '-'}
                                    valueStyle={{
                                      fontWeight: 400,
                                      fontSize: '14px',
                                      marginLeft: '7px',
                                    }}
                                    precision={2}
                                  />
                                </Form.Item>
                              ) : (
                                <ProFormDigit
                                  fieldProps={{
                                    maxLength: 125,
                                  }}
                                  disabled={disabled}
                                  label=""
                                  name="order_amount"
                                  placeholder={disabled ? '--' : '请输入手板单金额'}
                                  rules={[{ required: !disabled, message: '请输入手板单金额' }]}
                                />
                              )}
                            </ProFormGroup>
                          </Col>
                          <Col span={8}>
                            <ProFormDatePicker
                              fieldProps={{
                                disabledDate: disabledDate,
                              }}
                              name="delivery_time"
                              label="交货时间"
                              readonly={disabled}
                              placeholder={disabled ? '--' : '请选择交货时间'}
                              rules={[{ required: !disabled, message: '请选择交货时间' }]}
                            />
                          </Col>
                          <Col span={24}>
                            <Form.Item
                              required={!disabled}
                              rules={[
                                () => ({
                                  validator(_, value) {
                                    const unDeleteFiles = value?.filter(
                                      (file: any) => file.delete != 1,
                                    );
                                    if (!unDeleteFiles?.length) {
                                      return Promise.reject(new Error('请上传合同'));
                                    }
                                    return Promise.resolve();
                                  },
                                }),
                              ]}
                              label="打样凭证："
                              name="hand_files"
                              extra="上传打样相关的协议或合同等，例如保密协议，支持word、excel、pdf以及图片格式，可上传多个文件，单个文件不超过100M"
                            >
                              <UploadFileList
                                fileBack={(val: any, init: boolean) => {
                                  if (!init) {
                                    handleUpload(val, 'hand_files');
                                  }
                                }}
                                required={!disabled}
                                disabled={disabled}
                                businessType={'PURCHASE_SAMPLE_ORDER_HAND_CONTRACT'}
                                checkMain={false}
                                defaultFileList={detailData?.hand_files}
                                accept={['.docx,.doc,.xls,.xlsx,.pdf,.jpg,.jpeg']}
                                acceptType={['docx', 'doc', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg']}
                                maxSize="100"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      );
                    } else if (type == '2') {
                      return (
                        <Row gutter={24}>
                          <Col span={8} className="proLine-group">
                            <ProFormGroup>
                              <ProFormSelect
                                name="currency"
                                label="开模费用"
                                readonly={disabled}
                                valueEnum={dicList?.SC_CURRENCY}
                                placeholder={disabled ? '--' : '请选择币种'}
                                rules={[{ required: !disabled, message: '请选择币种' }]}
                              />

                              {disabled ? (
                                <Form.Item label="">
                                  <Statistic
                                    value={detailData?.order_amount ?? '-'}
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
                                    maxLength: 125,
                                  }}
                                  disabled={disabled}
                                  label=""
                                  name="order_amount"
                                  placeholder={disabled ? '--' : '请输入开模费用'}
                                  rules={[{ required: !disabled, message: '请输入开模费用' }]}
                                />
                              )}
                            </ProFormGroup>
                          </Col>
                          <Col span={8}>
                            {disabled ? (
                              <Form.Item label="预估成本采购单价" labelCol={{ flex: '126px' }}>
                                <Statistic
                                  value={detailData?.mould_unit_price || '-'}
                                  valueStyle={{
                                    fontWeight: 400,
                                    fontSize: '14px',
                                  }}
                                  precision={2}
                                />
                              </Form.Item>
                            ) : (
                              <ProFormDigit
                                fieldProps={{
                                  maxLength: 125,
                                }}
                                label="预估成本采购单价"
                                name="mould_unit_price"
                                rules={[{ required: !disabled, message: '请填写预估成本采购单价' }]}
                                disabled={disabled}
                                placeholder={disabled ? '--' : '请填写预估成本采购单价'}
                              />
                            )}
                          </Col>
                          <Col span={8}>
                            <ProFormSelect
                              name="mould_ascription"
                              label="模具归属权"
                              readonly={disabled}
                              valueEnum={dicList?.PURCHASE_SAMPLE_ORDER_ASCRIPTION}
                              placeholder={disabled ? '--' : '请选择模具归属权'}
                              rules={[{ required: !disabled, message: '请选择模具归属权' }]}
                            />
                          </Col>

                          <Col span={8}>
                            <ProFormText
                              fieldProps={{
                                maxLength: 125,
                              }}
                              label="开模周期"
                              name="mould_cycle"
                              readonly={disabled}
                              placeholder={disabled ? '--' : '请填写开模周期'}
                              rules={[{ required: !disabled, message: '请填写开模周期' }]}
                            />
                          </Col>
                          <Col span={24}>
                            <Form.Item
                              required={!disabled}
                              rules={[
                                () => ({
                                  validator(_, value) {
                                    const unDeleteFiles = value?.filter(
                                      (file: any) => file.delete != 1,
                                    );
                                    if (!unDeleteFiles?.length) {
                                      return Promise.reject(new Error('请上传合同'));
                                    }
                                    return Promise.resolve();
                                  },
                                }),
                              ]}
                              label="开模合同："
                              name="mould_files"
                              extra="word、excel、pdf和jpg格式文件，不得超过20M，可上传多个文件"
                            >
                              <UploadFileList
                                fileBack={(val: any, init: boolean) => {
                                  if (!init) {
                                    handleUpload(val, 'mould_files');
                                  }
                                }}
                                required={!disabled}
                                disabled={disabled}
                                businessType={'PURCHASE_SAMPLE_ORDER_MOULD_CONTRACT'}
                                checkMain={false}
                                defaultFileList={detailData?.mould_files}
                                accept={['.docx,.doc,.xls,.xlsx,.pdf,.jpg,.jpeg']}
                                acceptType={['docx', 'doc', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg']}
                                maxSize="20"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item label="申请原因">
                              {detailData?.mould_reason || '-'}
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item label="上架后预期规划">
                              {detailData?.mould_sale_plan || '-'}
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item label="模具可达成的销售额">
                              {detailData?.mould_attainable_quota || '-'}
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item label="开模产品比现货产品的优势点">
                              {detailData?.mould_advantages || '-'}
                            </Form.Item>
                          </Col>
                        </Row>
                      );
                    }
                    return <></>;
                  }}
                </ProFormDependency>

                <Row gutter={24}>
                  <Col span={16}>
                    <ProFormDependency name={['remarks']}>
                      {({ remarks }) => {
                        return disabled ? (
                          <Form.Item name="remarks" label="采购备注">
                            <pre>{remarks || '-'}</pre>
                          </Form.Item>
                        ) : (
                          <ProFormTextArea
                            fieldProps={{
                              autoSize: true,
                            }}
                            readonly={disabled}
                            rules={[{ max: 500, message: '最多输入250字' }]}
                            label="采购备注"
                            placeholder="请输入采购备注"
                            name="remarks"
                          />
                        );
                      }}
                    </ProFormDependency>
                  </Col>
                </Row>
              </ProForm>
            </div>
          </ProCard>
        </Spin>
        <ProCard style={{ display: tab == 'approval' ? 'block' : 'none' }}>
          {dicList && <ApprovalInfo dataSource={approvalInfo} />}
        </ProCard>
      </>
    </PageContainer>
  );
};
const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);

export default ConnectPage;
