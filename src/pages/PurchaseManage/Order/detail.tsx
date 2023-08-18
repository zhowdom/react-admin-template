import { useEffect, useRef, useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Row, Col, Form, Spin, Statistic, Modal, Space, Divider } from 'antd';
import { ProFormDatePicker } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { history, connect, useAccess, Access } from 'umi';
import EditZTTable from './components/editTable';
import { pubConfig, pubFilter, pubMsg, pubModal, pubRequiredLengthRule } from '@/utils/pubConfig';
import {
  getDetail,
  insertRemarks,
  edit,
  updateAndSubmit,
  update,
  turnList,
  agree,
} from '@/services/pages/purchaseOrder';
import moment from 'moment';
import '../Plan/style.less';
import {
  findBySku,
  findGoodsSkuIdToSameVender,
  findValidVendorToSubject,
} from '@/services/pages/purchasePlan';
import { IsGrey, mul } from '@/utils/pubConfirm';
import ProTable from '@ant-design/pro-table';
import { getList } from '@/services/pages/sign';
import AuditOptions from './components/AuditOptions';
import { sortBy } from 'lodash';

const Detail = (props: any) => {
  const { common } = props;
  const access = useAccess();
  const dicList = common?.dicList;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [detailData, setDetailData] = useState<any>();
  const [alReady, setAlReady] = useState(false);
  const [editIds, setEditIds] = useState<any>();
  const [showMore, setShowMore] = useState(false);
  const [originRemarks, setOriginRemarks] = useState([]);
  const pageType = history?.location?.query?.type || 'detail'; // detail-查看 edit-编辑 update-修改
  const id = history?.location?.query?.id;
  const [remarkLoading, setRemarkLoading] = useState(false);
  const [venderList, setVenderList] = useState([]);
  const [mainList, setMainList] = useState([]);
  const [venderInfo, setVenderInfo] = useState<any>({});
  const [tableCurrency, setTableCurrency] = useState('');
  const [saveType, setSaveType] = useState('');
  const [deleteArr, setDeleteArr] = useState<any[]>([]);
  const [deDetailShow, setDeDetailShow] = useState(false);
  const [turnShow, setTurnShow] = useState(false);
  const [deDetailData, setDeDetailData] = useState<any>({});
  const [turnData, setTurnData] = useState<any>({});
  const [confirmLoading, setConfirmLoading] = useState(false);
  // 表格数据改变
  const tableDataChange = (data: any) => {
    formRef?.current?.setFieldsValue({
      purchaseOrderSku: data,
    });
  };
  // 删除的表格数据
  const deleteChange = (data: any) => {
    const dataC = { ...data, delete: 1 };
    setDeleteArr((pre) => [...pre, dataC]);
  };
  // 查询扣款记录
  const getTurnList = async () => {
    const res = await turnList({ id });
    setTurnData(res.data || []);
  };
  // 跨境主体
  const getNewVendersAction = async () => {
    setLoading(true);
    const res = await getList({
      current_page: 1,
      page_size: 999,
      abroad: 2,
    });
    setMainList(
      res?.data?.records?.map((v: any) => {
        return {
          value: v.id,
          label: v.client_corp_name,
        };
      }) || [],
    );
    setLoading(false);
  };
  // (单个供应商)查询某个供应商下面所有在有效期内的签约主体
  const getValidVendor = async (vendorId?: any) => {
    if (formRef.current?.getFieldValue('signing_type') == '2') {
      getNewVendersAction();
    } else {
      setLoading(true);
      const res = await findValidVendorToSubject({
        vendorId,
        abroad: formRef.current?.getFieldValue('signing_type'),
      });
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
      setLoading(false);
    }
  };

  // 根据SKUids和供应商ID 得到SKU的价格
  const getSkuPrice = async (vendor_id?: any, ids?: any) => {
    const res = await findBySku({ vendor_id: vendor_id, sku_id: ids });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const purchaseOrderSku = formRef?.current?.getFieldsValue().purchaseOrderSku;
      const newData = purchaseOrderSku.map((h: any) => {
        res.data.forEach((k: any) => {
          if (h.goods_sku_id == k.goods_sku_id) {
            h.price = h.goods_sku_type == 1 ? h.price : 0;
            h.copy_price = k.price;
            h.total_price = mul(h.num, h.price);
            h.quantity_per_box = k.quantity_per_box ?? h.quantity_per_box;
            h.number_boxes = h.quantity_per_box
              ? Math.ceil(h.num / h.quantity_per_box)
              : h.quantity_per_box;
          }
        });
        return h;
      });
      formRef?.current?.setFieldsValue({
        purchaseOrderSku: newData,
      });
    }
  };

  // 根据SKUids 得到可以选择的供应商下拉列表
  const getVenderList = async (ids?: any, initForm?: any) => {
    const res = await findGoodsSkuIdToSameVender({ goodsSkuId: ids.join(',') });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const vendor = res.data.filter((item: any) => item.id === initForm.vendor_id);
      getValidVendor(initForm.vendor_id);
      setVenderInfo(vendor[0]);
      if (pageType == 'edit') {
        setTableCurrency(`(${pubFilter(common?.dicList?.SC_CURRENCY, vendor?.[0]?.currency)})`);
      }
      const newVenders = res.data.map((v: any) => {
        return {
          value: v.id,
          label: v.name,
          data: v,
        };
      });
      setVenderList(newVenders);
    }
  };
  // 获取详情接口
  const getDetailAction = async () => {
    setLoading(true);
    const res = await getDetail({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    res.data.sysBusinessRemarks = res?.data?.sysBusinessRemarks || [];
    setOriginRemarks(JSON.parse(JSON.stringify(res.data?.sysBusinessRemarks)));
    res.data.purchaseOrderSku =
      res?.data?.purchaseOrderSku?.map((item: any) => {
        // 判断item的 goods_sku_id 是否有备品
        const hasSpare = res?.data?.purchaseOrderSku.find(
          (k: any) => k.goods_sku_id == item.goods_sku_id && k.goods_sku_type == 2,
        );
        // console.log(hasSpare, 'hasSpare');
        return {
          ...item,
          rowSpan: item.goods_sku_type == 1 ? (hasSpare ? 2 : 1) : 0,
          copy_price: item.price,
          origin_u: item.undelivered_qty + item.num,
          approval_status: res.data.approval_status,
          number_boxes: item.quantity_per_box
            ? Math.ceil(item.num / item.quantity_per_box)
            : item?.quantity_per_box,
        };
      }) || [];
    // 数据顺序不一致, 合并单元格错位v1.2.3
    res.data.purchaseOrderSku = sortBy(res.data.purchaseOrderSku, [
      'sku_code',
      'goods_sku_type',
      'shipment_time',
    ]);
    const initForm = res?.data || {};
    console.log(initForm, 'initForm-purchaseOrderSku');
    initForm.signing_type = initForm.signing_type ? String(initForm.signing_type) : '1';
    setDeDetailData(initForm.purchaseOrderDeductions || []);
    setDetailData(initForm);
    if (pageType != 'edit') {
      setTableCurrency(`(${pubFilter(common?.dicList?.SC_CURRENCY, initForm?.currency)})`);
    }

    const ids = initForm?.purchaseOrderSku?.map((val: any) => val.id) || [];
    setEditIds(ids);
    if (pageType == 'edit' || pageType == 'update') {
      const skuIds = initForm?.purchaseOrderSku?.map((val: any) => val.goods_sku_id) || [];
      getVenderList(skuIds, initForm);
      getSkuPrice(initForm.vendor_id, skuIds);
    }
    getTurnList();
    if (res?.data?.sysBusinessRemarks?.length > 3) {
      setShowMore(true);
      res.data.sysBusinessRemarks = res.data?.sysBusinessRemarks.slice(0, 3);
    }

    formRef?.current?.setFieldsValue({
      ...initForm,
    });
    setLoading(false);
    setAlReady(true);
  };
  // 改变供应商时获取供应商信息
  const changeVendor = async (vId: string, data: any) => {
    setTableCurrency(`(${pubFilter(common?.dicList?.SC_CURRENCY, data?.data?.currency)})`);
    setVenderInfo(data?.data);
    getValidVendor(vId);
    const skuIds = detailData?.purchaseOrderSku?.map((val: any) => val.goods_sku_id) || [];
    getSkuPrice(vId, skuIds);
  };
  useEffect(() => {
    getDetailAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 编辑
  const editAction = async (postData: any) => {
    // 修改
    if (pageType == 'update') {
      const res = await update(postData);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('修改成功', 'success');
        setTimeout(() => history.goBack(), 200);
      }
      // 编辑
    } else if (pageType == 'edit') {
      postData.vendor_contacts_id = venderInfo?.contacts?.id;
      const res = await edit(postData);
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      } else {
        pubMsg('编辑成功', 'success');
        setTimeout(() => history.goBack(), 200);
      }
    }
  };
  // 编辑并提交审核
  const editAndApproval = async (postData: any) => {
    const res = await updateAndSubmit(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('已提交，请等待审核', 'success');
      setTimeout(() => {
        history.goBack();
      }, 200);
    }
  };
  // 提交
  const updateForm = (postData: any) => {
    pubModal('确定提交吗?')
      .then(async () => {
        switch (saveType) {
          case '1':
            editAction(postData);
            break;
          case '2':
            editAndApproval(postData);
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  const formItemLayout = {
    labelCol: { flex: '140px' },
  };
  const formItemLayout1 = {
    labelCol: { flex: '460px' },
  };
  const formItemLayout2 = {
    labelCol: { flex: '140px' },
  };
  const disabledDate = (current: any) => {
    return current && new Date(current).getTime() + 24 * 60 * 60 < new Date().getTime();
  };

  // 审批通过
  const agreeAction = async (orderId: any[]) => {
    pubModal('确定审批通过?')
      .then(async () => {
        setConfirmLoading(true);
        const ids = orderId.join(',');
        const res: any = await agree({ id: ids });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功', 'success');
          getDetailAction();
        }
        setConfirmLoading(false);
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };

  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <Modal
        width={600}
        title="扣款明细"
        visible={deDetailShow}
        onOk={() => {
          setDeDetailShow(false);
        }}
        onCancel={() => {
          setDeDetailShow(false);
        }}
        footer={false}
      >
        <ProTable
          bordered
          dataSource={deDetailData}
          rowKey="id"
          search={false}
          pagination={false}
          options={false}
          size="small"
          style={{ minWidth: '400px' }}
          columns={[
            {
              title: `扣款金额${tableCurrency}`,
              dataIndex: 'amount',
              hideInSearch: true,
              align: 'center',
              render: (_, row: any) => IsGrey ? '' : (
                <Statistic
                  value={row.amount}
                  valueStyle={{ fontWeight: 400, fontSize: '14px' }}
                  precision={2}
                />
              ),
            },
            {
              title: '扣款原因',
              dataIndex: 'reason',
              align: 'center',
            },
            {
              title: '添加扣款时间',
              dataIndex: 'create_time',
              align: 'center',
            },
            {
              title: '添加扣款人',
              dataIndex: 'create_user_name',
              align: 'center',
            },
          ]}
        />
      </Modal>
      <Modal
        width={600}
        title="历史采购员"
        visible={turnShow}
        onOk={() => {
          setTurnShow(false);
        }}
        onCancel={() => {
          setTurnShow(false);
        }}
        footer={false}
      >
        <ProTable
          dataSource={turnData}
          rowKey="id"
          search={false}
          pagination={false}
          options={false}
          size="small"
          style={{ minWidth: '400px' }}
          columns={[
            {
              title: '采购员',
              dataIndex: 'from_user_name',
              align: 'center',
            },
            {
              title: '转出时间',
              dataIndex: 'create_time',
              align: 'center',
            },
          ]}
        />
      </Modal>
      <ProForm
        layout={'horizontal'}
        formRef={formRef}
        initialValues={{
          projectsGoodsSkus: [{}, {}],
        }}
        submitter={{
          render: (data: any) => (
            <FooterToolbar style={{ padding: '6px' }}>
              {pageType == 'detail' ? (
                <Space>
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

                  <Access
                    key="access"
                    accessible={
                      access.canSee('purchase_order_approval') && detailData?.approval_status == 2
                    }
                  >
                    <Button
                      type="primary"
                      loading={confirmLoading}
                      onClick={() => {
                        agreeAction([detailData.id]);
                      }}
                    >
                      审核通过
                    </Button>
                  </Access>
                  <Access
                    key="reject"
                    accessible={
                      access.canSee('purchase_order_approval') && detailData?.approval_status == 2
                    }
                  >
                    <AuditOptions
                      type="refuse"
                      reload={() => getDetailAction()}
                      ids={[detailData?.id]}
                      title="审核不通过"
                    />
                  </Access>
                </Space>
              ) : (
                <Space>
                  <Access
                    key="save"
                    accessible={
                      (access.canSee('purchase_order_edit') ||
                        access.canSee('purchase_order_updateEdit')) &&
                      (pageType == 'update' || pageType == 'edit')
                    }
                  >
                    <Button
                      type="primary"
                      onClick={async () => {
                        setSaveType('1');
                        data.form?.submit?.();
                      }}
                    >
                      保存采购单
                    </Button>
                  </Access>
                  <Access
                    key="saveS"
                    accessible={
                      (access.canSee('purchase_order_edit') ||
                        access.canSee('purchase_order_updateEdit')) &&
                      pageType == 'edit'
                    }
                  >
                    <Button
                      type="primary"
                      key="saveS"
                      onClick={async () => {
                        setSaveType('2');
                        data.form?.submit?.();
                      }}
                    >
                      保存并提交审核
                    </Button>
                  </Access>

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
              )}
            </FooterToolbar>
          ),
        }}
        labelAlign="right"
        onFinish={async (values) => {
          return Promise.all([editForm.validateFields()])
            .then(() => {
              const postData = JSON.parse(JSON.stringify(values));
              postData.id = id;
              postData.payment_method = venderInfo?.payment_method; // 编辑时要传
              postData.purchaseOrderSku = [...postData.purchaseOrderSku, ...deleteArr];
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
      >
        <Spin spinning={loading}>
          {pageType == 'edit' ? (
            <Card title={'供应商信息'} bordered={false}>
              <Row gutter={20} className="light-form-item-row">
                <Col span={8}>
                  <ProFormSelect
                    name="vendor_id"
                    label="供应商"
                    showSearch
                    debounceTime={300}
                    readonly={detailData?.order_type == 2}
                    placeholder="请选择供应商"
                    rules={[{ required: true, message: '请选择供应商' }]}
                    {...formItemLayout}
                    fieldProps={{
                      options: venderList,
                      filterOption: (input: any, option: any) => {
                        const trimInput = input.replace(/^\s+|\s+$/g, '');
                        if (trimInput) {
                          return option.label.indexOf(trimInput) >= 0;
                        } else {
                          return true;
                        }
                      },
                      onChange: (sId, data) => {
                        formRef.current?.setFieldsValue({
                          main_id: null,
                        });
                        changeVendor(sId, data);
                      },
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商联系人" {...formItemLayout}>
                    {venderInfo?.contacts?.name || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商联系人电话" {...formItemLayout}>
                    {venderInfo?.contacts?.telephone || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商账户名称" {...formItemLayout}>
                    {venderInfo?.bankAccount?.bank_account_name || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商开户行" {...formItemLayout}>
                    {venderInfo?.bankAccount?.bank_name || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商银行账号" {...formItemLayout}>
                    {venderInfo?.bankAccount?.bank_account || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="结算方式" {...formItemLayout}>
                    {pubFilter(dicList?.VENDOR_PAYMENT_METHOD, venderInfo?.payment_method) || '-'}
                  </Form.Item>
                </Col>
                {['8', '9', '10', '11', '12', '13'].includes(venderInfo?.payment_method + '') && (
                  <Col span={8}>
                    <Form.Item label="预付比例" {...formItemLayout}>
                      {venderInfo?.prepayment_percentage
                        ? venderInfo?.prepayment_percentage + '%'
                        : '-'}
                    </Form.Item>
                  </Col>
                )}
                {venderInfo?.currency != 'USD' && (
                  <Col span={8}>
                    <Form.Item label="税率" {...formItemLayout}>
                      {pubFilter(dicList?.VENDOR_TAX_RATE, venderInfo?.tax_rate) || '-'}
                    </Form.Item>
                  </Col>
                )}

                <Col span={8}>
                  <Form.Item label="结算币种" {...formItemLayout}>
                    {pubFilter(dicList?.SC_CURRENCY, venderInfo?.currency) || '-'}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={20}
                className="light-form-item-row"
                style={{ display: venderInfo?.currency === 'USD' ? 'flex' : 'none' }}
              >
                <Col span={24}>
                  <Divider />
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Bank Routing#（ABA转账编码，收款账号为美国银行的需提供）"
                    {...formItemLayout1}
                  >
                    {venderInfo?.bankAccount?.bank_routing || '-'}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="SWIFT（国际转账编码）" {...formItemLayout1}>
                    {venderInfo?.bankAccount?.swift || '-'}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Bank Address（银行地址）" {...formItemLayout1}>
                    {venderInfo?.bankAccount?.bank_address || '-'}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Company Address（收款人地址）" {...formItemLayout1}>
                    {venderInfo?.bankAccount?.company_address || '-'}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Phone Number（收款人联系电话）" {...formItemLayout1}>
                    {venderInfo?.bankAccount?.phone_number || '-'}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ) : (
            <Card title={'供应商信息'} bordered={false}>
              <Row gutter={20} className="light-form-item-row">
                <Col span={8}>
                  <Form.Item label="供应商" {...formItemLayout}>
                    {detailData?.vendor_name || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商联系人" {...formItemLayout}>
                    {detailData?.vendor_contacts || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商联系人电话" {...formItemLayout}>
                    {detailData?.vendor_contacts_phone || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商账户名称" {...formItemLayout}>
                    {detailData?.bank_account_name || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商开户行" {...formItemLayout}>
                    {detailData?.bank_name || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="供应商银行账号" {...formItemLayout}>
                    {detailData?.bank_account || '-'}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="结算方式" {...formItemLayout}>
                    {pubFilter(dicList?.VENDOR_PAYMENT_METHOD, detailData?.payment_method) || '-'}
                  </Form.Item>
                </Col>
                {['8', '9', '10', '11', '12', '13'].includes(detailData?.payment_method) && (
                  <Col span={8}>
                    <Form.Item label="预付比例" {...formItemLayout}>
                      {detailData?.prepayment_percentage
                        ? detailData?.prepayment_percentage + '%'
                        : '-'}
                    </Form.Item>
                  </Col>
                )}
                <Col span={8}>
                  <Form.Item label="税率" {...formItemLayout}>
                    {pubFilter(dicList?.VENDOR_TAX_RATE, detailData?.tax_rate) || '-'}
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="结算币种" {...formItemLayout}>
                    {pubFilter(dicList?.SC_CURRENCY, detailData?.currency) || '-'}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={20}
                className="light-form-item-row"
                style={{ display: detailData?.currency === 'USD' ? 'flex' : 'none' }}
              >
                <Col span={24}>
                  <Divider />
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Bank Routing#（ABA转账编码，收款账号为美国银行的需提供）"
                    {...formItemLayout1}
                  >
                    {detailData?.bank_routing || '-'}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="SWIFT（国际转账编码）" {...formItemLayout1}>
                    {detailData?.swift || '-'}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Bank Address（银行地址）" {...formItemLayout1}>
                    {detailData?.bank_address || '-'}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Company Address（收款人地址）" {...formItemLayout1}>
                    {detailData?.company_address || '-'}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Phone Number（收款人联系电话）" {...formItemLayout1}>
                    {detailData?.phone_number || '-'}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          <Card title={'采购主体信息'} bordered={false} style={{ marginTop: '10px' }}>
            <Row gutter={10} className="light-form-item-row pro-v">
              <Col>
                <ProFormSelect
                  name="signing_type"
                  label=""
                  valueEnum={{
                    1: { text: pageType != 'edit' ? '境内采购主体 : ' : '境内采购主体' },
                    2: { text: pageType != 'edit' ? '境外采购主体 : ' : '境外采购主体' },
                  }}
                  allowClear={false}
                  readonly={pageType != 'edit'}
                  disabled={detailData?.order_type == 2}
                  labelCol={{ flex: '0px' }}
                  fieldProps={{
                    onChange: (val: any) => {
                      formRef.current?.setFieldsValue({
                        main_id: null,
                      });
                      if (!formRef.current?.getFieldValue('vendor_id') && val == 1) {
                        setMainList([]);
                        return;
                      }
                      getValidVendor(formRef.current?.getFieldValue('vendor_id'));
                    },
                  }}
                />
              </Col>
              <Col span={12}>
                {pageType == 'edit' ? (
                  <ProFormSelect
                    name="main_id"
                    label=""
                    showSearch
                    labelCol={{ flex: '0px' }}
                    placeholder="请选择采购主体"
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
                    }}
                    rules={[{ required: true, message: '请选择采购主体' }]}
                  />
                ) : (
                  <Form.Item labelCol={{ flex: '0px' }}>{detailData?.main_name || '-'}</Form.Item>
                )}
              </Col>
            </Row>
          </Card>
          <Card title={'采购单信息'} bordered={false} style={{ marginTop: '10px' }}>
            <Row gutter={20} className="light-form-item-row">
              <Col span={8}>
                <Form.Item label="采购单号" {...formItemLayout2}>
                  {detailData?.order_no || '-'}
                </Form.Item>
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="approval_status"
                  label="采购单状态"
                  valueEnum={dicList?.PURCHASE_APPROVAL_STATUS}
                  placeholder="--"
                  readonly
                  {...formItemLayout2}
                />
              </Col>
              <Col span={8}>
                <ProFormText
                  readonly
                  label="创建时间"
                  name="create_time"
                  placeholder="--"
                  {...formItemLayout2}
                />
              </Col>
              <Col span={8}>
                <Form.Item label="采购单金额" {...formItemLayout2}>
                  {!IsGrey && (
                    <Statistic
                      value={detailData?.amount}
                      valueStyle={{
                        fontWeight: 400,
                        fontSize: '14px',
                      }}
                      precision={2}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="采购运费" {...formItemLayout2}>
                  {!IsGrey && (
                    <Statistic
                      value={detailData?.freight_amount}
                      valueStyle={{
                        fontWeight: 400,
                        fontSize: '14px',
                      }}
                      precision={2}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="已付金额" {...formItemLayout2}>
                  {!IsGrey && (
                    <Statistic
                      value={detailData?.payment_amount}
                      valueStyle={{
                        fontWeight: 400,
                        fontSize: '14px',
                      }}
                      precision={2}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="未付金额" {...formItemLayout2}>
                  {!IsGrey && (
                    <Statistic
                      value={detailData?.payable_amount}
                      valueStyle={{
                        fontWeight: 400,
                        fontSize: '14px',
                      }}
                      precision={2}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <ProFormSelect
                  name="pay_status"
                  label="付款状态"
                  valueEnum={dicList?.PURCHASE_PAY_STATUS}
                  placeholder="--"
                  readonly
                  {...formItemLayout2}
                />
              </Col>
              <Col span={8}>
                <Form.Item label="采购单扣款" {...formItemLayout2}>
                  <Space size={10}>
                    {!IsGrey && (
                      <Statistic
                        value={detailData?.deduction_amount}
                        valueStyle={{
                          fontWeight: 400,
                          fontSize: '14px',
                        }}
                        precision={2}
                      />
                    )}

                    {detailData?.deduction_amount != 0 && (
                      <a
                        onClick={() => {
                          setDeDetailShow(true);
                        }}
                      >
                        采购单扣款详情
                      </a>
                    )}
                  </Space>
                </Form.Item>
              </Col>
              {detailData?.business_scope === 'IN' && (
                <>
                  <Col span={8}>
                    <Form.Item label="平台" {...formItemLayout2}>
                      {detailData?.platform_name || '-'}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="店铺" {...formItemLayout2}>
                      {detailData?.shop_name || '-'}
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>

            <Row gutter={20} className="light-form-item-row">
              <Col span={8}>
                <Form.Item label="采购员" {...formItemLayout2}>
                  <Space size={10}>
                    <span> {detailData?.purchaser_name || '-'}</span>
                    {turnData?.length ? (
                      <a
                        onClick={() => {
                          setTurnShow(true);
                        }}
                      >
                        历史采购员
                      </a>
                    ) : (
                      ''
                    )}
                  </Space>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="审批人" {...formItemLayout2}>
                  {detailData?.approval_user_name || '-'}
                </Form.Item>
              </Col>
              <Col span={8}>
                <ProFormDatePicker
                  fieldProps={{
                    disabledDate: disabledDate,
                  }}
                  style={{ width: '150px' }}
                  name="expected_receipt_time"
                  label="预计入库时间"
                  readonly={pageType == 'detail'}
                  placeholder="请选择预计入库时间"
                  rules={[
                    {
                      required: pageType == 'detail' ? false : true,
                      message: '请选择预计入库时间',
                    },
                  ]}
                  {...formItemLayout2}
                />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="festival"
                  readonly={pageType == 'detail'}
                  placeholder="请选择预计入库时间"
                  label="是否节日订单"
                  style={{ width: '150px' }}
                  valueEnum={dicList?.PURCHASE_FESTIVAL}
                  rules={[
                    {
                      required: pageType == 'detail' ? false : true,
                      message: '请选择是否节日订单',
                    },
                  ]}
                  {...formItemLayout2}
                />
              </Col>
              {detailData?.approval_agree_time && (
                <Col span={8}>
                  <Form.Item label="审核时间" {...formItemLayout}>
                    {detailData?.approval_agree_time}
                  </Form.Item>
                </Col>
              )}
              {detailData?.signing_time && (
                <Col span={8}>
                  <Form.Item label="签约时间" {...formItemLayout}>
                    {detailData?.signing_time}
                  </Form.Item>
                </Col>
              )}
            </Row>
            <Row gutter={20} style={{ marginTop: '10px' }}>
              <Col span={24} className="red">
                <ProFormTextArea
                  name="signing_contract_remarks"
                  label="采购单签约合同备注"
                  placeholder="请输入采购单签约合同备注"
                  {...formItemLayout2}
                  formItemProps={{
                    style: { margin: '10px 0 4px' },
                  }}
                  readonly={pageType == 'detail'}
                  rules={[
                    {
                      validator: (_, value) => pubRequiredLengthRule(value, 100, '超过字符限制'),
                    },
                  ]}
                />
                {pageType != 'detail' ? (
                  <div style={{ marginLeft: '140px', color: 'red' }}>
                    *此备注非必填，备注会显示到签约采购单合同上面，请用户慎填。
                  </div>
                ) : null}
              </Col>
              <Col span={12} className="red">
                <ProFormTextArea
                  name="orderRemark"
                  label="采购单备注"
                  placeholder="请输入采购单备注"
                  {...formItemLayout2}
                  formItemProps={{
                    style: { margin: '10px 0 4px' },
                  }}
                />
                <div style={{ marginLeft: '140px' }}>
                  <p style={{ color: 'red' }}>
                    *采购单备注，是方便采购单管理的备注，供应商无法查看。
                  </p>
                  <Button
                    type={'primary'}
                    ghost
                    size="small"
                    disabled={remarkLoading}
                    loading={remarkLoading}
                    onClick={async () => {
                      const saveRemarks = formRef?.current?.getFieldValue('orderRemark');
                      if (!saveRemarks) return pubMsg('请输入备注内容');
                      setRemarkLoading(true);
                      const res = await insertRemarks({
                        id,
                        remarks: saveRemarks,
                      });
                      if (res?.code != pubConfig.sCode) {
                        pubMsg(res?.message);
                      } else {
                        pubMsg('保存成功', 'success');
                        const momentArray = moment().toArray();
                        detailData?.sysBusinessRemarks.push({
                          remarks: saveRemarks,
                          create_time: moment(
                            `${momentArray[0]}-${momentArray[1] + 1}-${momentArray[2]} ${
                              momentArray[3]
                            }:${momentArray[4]}:${momentArray[5]}`,
                          ).format('YYYY-MM-DD HH:mm:ss'),
                        });
                        formRef?.current?.setFieldsValue({ orderRemark: '' });
                      }
                      setRemarkLoading(false);
                    }}
                  >
                    {remarkLoading ? '保存中' : '保存备注信息'}
                  </Button>
                </div>
              </Col>

              <Col span={12}>
                <div className="item" style={{ paddingTop: '4px' }}>
                  <span className="label">备注内容 : </span>
                  <span className="value">
                    {detailData?.sysBusinessRemarks &&
                      detailData?.sysBusinessRemarks.map(
                        (
                          item: { remarks: string; create_time: string; id: string },
                          index: number,
                        ) => {
                          return (
                            <div
                              key={item.id}
                              style={{
                                fontSize: '12px',
                                display: showMore && index > 2 ? 'none' : 'block',
                              }}
                            >
                              <Row gutter={4}>
                                <Col span={2}>{index + 1}.</Col>
                                <Col span={10}>
                                  <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                    {item.remarks}
                                  </pre>
                                </Col>
                                <Col span={12}>
                                  <span style={{ color: '#aaa', fontSize: '12px' }}>
                                    —{item.create_time}
                                  </span>
                                </Col>
                              </Row>
                            </div>
                          );
                        },
                      )}
                    <a
                      style={{
                        display: showMore ? 'block' : 'none',
                      }}
                      onClick={() => {
                        setDetailData((pre: any) => {
                          return {
                            ...pre,
                            sysBusinessRemarks: originRemarks,
                          };
                        });
                        setShowMore(false);
                      }}
                    >
                      更多
                    </a>
                  </span>
                </div>
              </Col>
            </Row>
          </Card>
          <Card title={'采购商品列表'} bordered={false} style={{ marginTop: '10px' }}>
            <Row>
              <Col span={24}>
                {alReady && (
                  <EditZTTable
                    business_scope={detailData?.business_scope}
                    order_type={detailData?.order_type}
                    tableCurrency={tableCurrency}
                    pageType={pageType}
                    formRef1={formRef}
                    form={editForm}
                    tableDataChange={tableDataChange}
                    editIds={pageType == 'detail' ? [] : editIds}
                    dicList={dicList}
                    deleteChange={deleteChange}
                    approval_status={detailData?.approval_status}
                  />
                )}
              </Col>
            </Row>
          </Card>
        </Spin>
      </ProForm>
    </PageContainer>
  );
};

const ConnectPage = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);
export default ConnectPage;
