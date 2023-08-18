import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, history } from 'umi';
import { Button, Card, Col, Form, Modal, Row, Space, Spin } from 'antd';
import {
  ProFormDependency,
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormSelect } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { pubConfig, pubMsg, pubRequiredLengthRule, pubRequiredMaxRule } from '@/utils/pubConfig';
import { ArrowLeftOutlined } from '@ant-design/icons';
import GoodsInfo from './components/GoodsInfo';
import {
  addRemark,
  getLogisticsOrderDetail,
  updateLogisticsOrder,
} from '@/services/pages/logisticsManageIn/logisticsOrder';
import { getLspList } from '@/services/pages/logisticsManageIn/lsp';
import { getDesWareList } from '@/services/pages/logisticsManageIn/desPortWare';
import { getLogisticsPort } from '@/services/pages/logisticsManageIn/ports';
import { getCompanyList } from '@/services/pages/logisticsManageIn/company';
import moment from 'moment';
import { flatData } from '@/utils/filter';
import './index.less';
import LogisticsTime from './components/LogisticsTime';
import LogisticsTimeEdit from './components/LogisticsTimeEdit';
import { getUuid } from '@/utils/pubConfirm';

const Page = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const [editForm] = Form.useForm();
  const id = history?.location?.query?.id;
  const timeStamp = history?.location?.query?.timeStamp;
  const from = history?.location?.query?.from; // 来自timeliness页面隐藏备注功能
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const pathObj = {
    '/logistics-manage-in/logistics-order-edit': '编辑',
    '/logistics-manage-in/logistics-order-detail': '详情',
  };
  const [remarkLoading, setRemarkLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [detailData, setDetailData] = useState<any>();
  const [originRemarks, setOriginRemarks] = useState([]);
  const pathname = props.route.path;
  const customReverse: any = (arr: any[]) => {
    return arr.sort((a, b) => b.create_time.localeCompare(a.create_time));
  };
  const setFormItem = (initForm: any, dataFlat: any) => {
    formRef?.current?.setFieldsValue({
      ...initForm,
      logisticsOrderDetails: dataFlat.map((v: any) => {
        const cur = Array.isArray(v.warehousingOrderSpecifications)
          ? v.warehousingOrderSpecifications?.[0]
          : v.warehousingOrderSpecifications;
        return {
          ...v,
          tempId: getUuid(),
          length: cur?.length,
          width: cur?.width,
          high: cur?.high,
          unit_weight: cur?.unit_weight,
        };
      }),
    });
    setDetailData(initForm);
    setLoading(false);
  };
  // 详情接口
  const getDetailAction = async () => {
    setLoading(true);
    setShowMore(false);
    const res = await getLogisticsOrderDetail({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
    } else {
      res.data.sysBusinessRemarks = res?.data?.sysBusinessRemarks
        ? customReverse(res?.data?.sysBusinessRemarks)
        : [];
      setOriginRemarks(JSON.parse(JSON.stringify(res.data?.sysBusinessRemarks)));
      if (res?.data?.sysBusinessRemarks?.length > 3) {
        setShowMore(true);
        res.data.sysBusinessRemarks = res.data?.sysBusinessRemarks.slice(0, 3);
      }
      const initForm: any = res?.data || {};
      initForm.logisticsOrderDetails = initForm?.logisticsOrderDetails?.map((v: any) => ({
        ...v,
        warehousingOrderSpecifications1: v.warehousingOrderSpecifications,
        warehousingOrderSpecifications: v.warehousingOrderSpecifications?.filter((c: any) => c.num),
      }));
      // 设置数据
      const dataFlat = flatData(
        initForm.logisticsOrderDetails,
        'warehousingOrderSpecifications',
        'null',
        false,
      );
      console.log(dataFlat, 99988);
      setFormItem(initForm, dataFlat);
    }
  };

  useEffect(() => {
    if (id) {
      getDetailAction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.location?.pathname, history?.location?.search]);

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
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <Spin spinning={loading}>
        <ProForm
          labelAlign="right"
          layout="horizontal"
          formRef={formRef}
          className={
            pathObj[pathname] == '详情'
              ? 'supplier-detail logistics-detail-form'
              : 'supplier-detail'
          }
          labelCol={{ flex: '130px' }}
          wrapperCol={{ span: 14 }}
          submitter={{
            render: (data: any) => (
              <FooterToolbar style={{ padding: '6px' }}>
                {pathObj[pathname] == '详情' ? (
                  <Button
                    icon={<ArrowLeftOutlined />}
                    key="back"
                    onClick={() => {
                      setTimeout(() => {
                        if (history?.location?.query?.from == 'stock') {
                          history.push('/stock-manage/in');
                        } else if (from == 'timeliness') {
                          history.push('/logistics-manage-in/logistics-timeliness');
                        } else {
                          history.push('/logistics-manage-in/logistics-order');
                        }
                      }, 200);
                    }}
                  >
                    返回
                  </Button>
                ) : (
                  <Space>
                    <Button
                      key="cancel"
                      onClick={() => {
                        setTimeout(() => {
                          history.push('/logistics-manage-in/logistics-order');
                        }, 200);
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      onClick={async () => {
                        data.form?.submit?.();
                      }}
                    >
                      确定
                    </Button>
                  </Space>
                )}
              </FooterToolbar>
            ),
          }}
          onFinish={async (values: any) => {
            return Promise.all([editForm.validateFields()])
              .then(async () => {
                // 数据时间处理
                const postData = JSON.parse(
                  JSON.stringify({
                    ...values,
                    delivery_date: moment(values.delivery_date).format('YYYY-MM-DD 00:00:00'),
                    platform_appointment_time: moment(values.platform_appointment_time).format(
                      'YYYY-MM-DD 00:00:00',
                    ),
                    etd_date: moment(values.etd_date).format('YYYY-MM-DD 00:00:00'),
                  }),
                );
                postData.id = id;
                // 原数据删除后再添加,需要有id值保持修改,该新数据需替换为原数据
                postData?.logisticsOrderDetails.forEach((item: any, index: number) => {
                  for (const v of detailData?.logisticsOrderDetails) {
                    if (item.warehousing_order_id === v.warehousing_order_id) {
                      postData.logisticsOrderDetails[index] = JSON.parse(JSON.stringify(v));
                    }
                  }
                });
                // 标记原有数据删除
                const cur = JSON.parse(JSON.stringify(postData?.logisticsOrderDetails));
                if (detailData?.logisticsOrderDetails?.length) {
                  for (const item of detailData?.logisticsOrderDetails) {
                    if (!cur?.map((v: any) => v.id).includes(item.id)) {
                      postData.logisticsOrderDetails.push({ ...item, delete: 1 });
                    }
                  }
                }
                // 之前合并单元格数据需去重合并
                const tempArr = JSON.parse(JSON.stringify(postData?.logisticsOrderDetails));
                console.log(tempArr, 'tempArr');
                const data: any = [];
                tempArr.forEach((item: any, index: number) => {
                  console.log(666);
                  try {
                    if (
                      item.warehousing_order_no != tempArr?.[index + 1]?.warehousing_order_no ||
                      !tempArr?.[index + 1]
                    ) {
                      item.warehousingOrderSpecifications = Array.isArray(
                        item.warehousingOrderSpecifications,
                      )
                        ? item.warehousingOrderSpecifications
                        : [item.warehousingOrderSpecifications];
                      data.push(item);
                    } else {
                      if (
                        !Array.isArray(item.warehousingOrderSpecifications) &&
                        !Array.isArray(tempArr?.[index + 1].warehousingOrderSpecifications)
                      ) {
                        item.warehousingOrderSpecifications = JSON.parse(
                          JSON.stringify([
                            item.warehousingOrderSpecifications,
                            tempArr?.[index + 1].warehousingOrderSpecifications,
                          ]),
                        );
                      } else {
                        item.warehousingOrderSpecifications = JSON.parse(
                          JSON.stringify([...item.warehousingOrderSpecifications]),
                        );
                      }
                      data.push(item);
                      tempArr?.splice(index + 1, 1);
                    }
                  } catch (e) {
                    console.log(e);
                  }
                });
                postData.logisticsOrderDetails = data;
                // 提交数据
                const res = await updateLogisticsOrder(postData);
                if (res?.code != pubConfig.sCode) {
                  pubMsg(res?.message);
                } else {
                  pubMsg('操作成功!', 'success');
                  setTimeout(() => {
                    history.push('/logistics-manage-in/logistics-order');
                  }, 200);
                }
                console.log(postData);
              })
              .catch((e) => {
                console.log(e, 'e');
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
          <Card title="物流单信息" bordered={false} style={{ marginBottom: '15px' }}>
            <Row gutter={24}>
              <Col span={8}>
                <ProFormText name="order_no" label="跨境物流单号" readonly />
              </Col>
              <Col span={8}>
                <ProFormText name="principal_name" label="物流负责人" readonly />
              </Col>
              <Col span={8}>
                <ProFormText name="create_time" label="创建时间" readonly />
              </Col>
              <Col span={8}>
                <ProFormText name="booking_number" label="订舱号" readonly />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="logistics_vendor_id"
                  label="物流商(代码)"
                  rules={[{ required: pathObj[pathname] != '详情', message: '请选择物流商(代码)' }]}
                  fieldProps={selectProps}
                  showSearch
                  debounceTime={300}
                  readonly={pathObj[pathname] === '详情'}
                  params={{ timeStamp }}
                  request={async () => {
                    const res: any = await getLspList({
                      current_page: 1,
                      page_size: 99999,
                    });
                    const data: any = res?.data?.records?.map((v: any) => ({
                      value: v.id,
                      label: v.name,
                      disabled: v.status != '5',
                      data: v,
                    }));

                    return data;
                  }}
                />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="booking_account"
                  label="订舱账号"
                  readonly={pathObj[pathname] === '详情'}
                  placeholder="请选择订舱账号"
                  valueEnum={dicList.LOGISTICS_ORDER_BOOKING_ACCOUNT}
                />
              </Col>
            </Row>
            {pathObj[pathname] === '详情' && (
              <Row gutter={20} style={{ marginTop: '10px' }}>
                {from != 'timeliness' && (
                  <Col span={12} className="red">
                    <ProFormTextArea
                      name="orderRemark"
                      label="备注"
                      placeholder="请输入备注"
                      formItemProps={{
                        style: { margin: '10px 0 4px' },
                      }}
                    />
                    <div style={{ marginLeft: '130px' }}>
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
                          const res = await addRemark({
                            business_id: id,
                            remarks: saveRemarks,
                          });
                          if (res?.code != pubConfig.sCode) {
                            pubMsg(res?.message);
                          } else {
                            pubMsg('保存成功', 'success');
                            const momentArray = moment().toArray();
                            detailData?.sysBusinessRemarks.unshift({
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
                )}

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
                                    <pre
                                      style={{
                                        wordBreak: 'break-all',
                                        whiteSpace: 'pre-wrap',
                                        marginBottom: '6px',
                                      }}
                                    >
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
            )}
          </Card>
          <Card title="装柜信息" bordered={false} style={{ marginBottom: '15px' }}>
            <Row gutter={24}>
              <Col span={8}>
                <ProFormSelect
                  readonly
                  name="shipping_method"
                  label="出货渠道(运输方式)"
                  valueEnum={dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD}
                  placeholder="请选择运输方式"
                  fieldProps={{
                    getPopupContainer: (triggerNode: any) => triggerNode.parentNode,
                    ...selectProps,
                  }}
                />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="shipping_space_type"
                  label="舱位类型"
                  rules={[{ required: pathObj[pathname] != '详情', message: '请选择舱位类型' }]}
                  valueEnum={dicList?.LOGISTICS_ORDER_SHIPPING_SPACE_TYPE}
                  placeholder="请选择舱位类型"
                  fieldProps={{
                    getPopupContainer: (triggerNode: any) => triggerNode.parentNode,
                  }}
                  readonly={pathObj[pathname] === '详情'}
                />
              </Col>
              <ProFormDependency name={['shipping_space_type']}>
                {({ shipping_space_type }: any) => {
                  return (
                    shipping_space_type === '1' && (
                      <>
                        <Col span={8}>
                          <ProFormText
                            name="so_no"
                            label="SO号/运单号"
                            readonly={pathObj[pathname] === '详情'}
                            rules={[
                              {
                                required: pathObj[pathname] != '详情',
                                message: '请输入SO号/运单号',
                              },
                              {
                                validator: (_: any, value: any) => pubRequiredLengthRule(value, 50),
                              },
                            ]}
                          />
                        </Col>
                        <Col span={8}>
                          <ProFormText
                            name="cabinet_no"
                            label="柜号"
                            readonly={pathObj[pathname] === '详情'}
                            rules={[
                              { required: pathObj[pathname] != '详情', message: '请输入柜号' },
                              {
                                validator: (_: any, value: any) => pubRequiredLengthRule(value, 50),
                              },
                            ]}
                          />
                        </Col>
                        <Col span={8}>
                          <ProFormText
                            name="seal_no"
                            label="封条号"
                            readonly={pathObj[pathname] === '详情'}
                            rules={[
                              { required: pathObj[pathname] != '详情', message: '请输入封条号' },
                              {
                                validator: (_: any, value: any) => pubRequiredLengthRule(value, 50),
                              },
                            ]}
                          />
                        </Col>
                        <Col span={8}>
                          <ProFormDigit
                            label="柜重(kg)"
                            name="cabinet_weight"
                            readonly={pathObj[pathname] === '详情'}
                            fieldProps={{
                              precision: 3,
                            }}
                            rules={[
                              { required: pathObj[pathname] != '详情', message: '请输入柜重' },
                              {
                                validator: (_, value) =>
                                  pubRequiredMaxRule(
                                    value,
                                    10000000,
                                    false,
                                    '不超过10000000 kg （10吨）',
                                  ),
                              },
                            ]}
                            placeholder="请输入柜重"
                          />
                        </Col>
                      </>
                    )
                  );
                }}
              </ProFormDependency>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <ProFormText name="start_port_name" label="起运港" hidden />
                <ProFormSelect
                  name="start_port_id"
                  label="起运港"
                  rules={[{ required: pathObj[pathname] != '详情', message: '请选择起运港' }]}
                  fieldProps={{
                    ...selectProps,
                    onChange: (val: any, data: any) => {
                      formRef?.current?.setFieldsValue({
                        start_port_name: data.label,
                      });
                    },
                  }}
                  readonly={pathObj[pathname] === '详情'}
                  showSearch
                  debounceTime={300}
                  params={{ timeStamp }}
                  request={async () => {
                    const res: any = await getLogisticsPort({
                      current_page: 1,
                      page_size: 99999,
                      type: 1,
                    });
                    return res?.data?.records?.map((v: any) => ({
                      value: v.id,
                      label: v.name,
                      disabled: v.status != '1',
                      data: v,
                    }));
                  }}
                />
              </Col>
              <Col span={8}>
                <ProFormText name="end_port_name" label="目的港" hidden />
                <ProFormSelect
                  name="end_port_id"
                  label="目的港"
                  params={{ timeStamp }}
                  readonly={pathObj[pathname] === '详情'}
                  rules={[{ required: pathObj[pathname] != '详情', message: '请选择目的港' }]}
                  fieldProps={{
                    ...selectProps,
                    onChange: (val: any, data: any) => {
                      formRef?.current?.setFieldsValue({
                        end_port_name: data.label,
                      });
                    },
                  }}
                  showSearch
                  debounceTime={300}
                  request={async () => {
                    const res: any = await getLogisticsPort({
                      current_page: 1,
                      page_size: 99999,
                      type: 2,
                    });
                    return res?.data?.records?.map((v: any) => ({
                      value: v.id,
                      label: v.name,
                      data: v,
                      disabled: v.status != '1',
                    }));
                  }}
                />
              </Col>
              <Col span={8}>
                <ProFormText name="end_port_warehouse_name" label="目的港仓库" hidden />
                <ProFormSelect
                  name="end_port_warehouse_id"
                  label="目的港仓库"
                  rules={[{ required: pathObj[pathname] != '详情', message: '请选择目的港仓库' }]}
                  readonly={pathObj[pathname] === '详情'}
                  fieldProps={{
                    ...selectProps,
                    onChange: (val: any, data: any) => {
                      formRef?.current?.setFieldsValue({
                        end_port_warehouse_name: data.label,
                      });
                    },
                  }}
                  showSearch
                  debounceTime={300}
                  params={{ timeStamp }}
                  request={async () => {
                    const res: any = await getDesWareList({
                      current_page: 1,
                      page_size: 99999,
                      type: 2,
                    });
                    return res?.data?.records?.map((v: any) => ({
                      value: v.id,
                      label: v.name,
                      data: v,
                      disabled: v.status != '1',
                    }));
                  }}
                />
              </Col>
              <Col span={8}>
                <ProFormText name="express_name" label="船公司/快递公司" hidden />
                <ProFormSelect
                  disabled={props.dialogForm?.id}
                  name="express_id"
                  label="船公司/快递公司"
                  params={{ timeStamp }}
                  readonly={pathObj[pathname] === '详情'}
                  fieldProps={{
                    ...selectProps,
                    onChange: (val: any, data: any) => {
                      formRef?.current?.setFieldsValue({
                        express_name: data.label,
                      });
                    },
                  }}
                  rules={[
                    { required: pathObj[pathname] != '详情', message: '请选择船公司/快递公司' },
                  ]}
                  showSearch
                  debounceTime={300}
                  request={async () => {
                    const res: any = await getCompanyList({
                      current_page: 1,
                      page_size: 99999,
                      business_scope: 'IN',
                    });
                    return res?.data?.records?.map((v: any) => ({
                      value: v.id,
                      label: v.name,
                      data: v,
                      disabled: v.status != '1',
                    }));
                  }}
                />
              </Col>
            </Row>
          </Card>
          {pathObj[pathname] === '详情' && <LogisticsTime data={detailData} />}
          {pathObj[pathname] === '编辑' && <LogisticsTimeEdit />}

          <GoodsInfo
            dicList={dicList}
            pageName={pathObj[pathname]}
            editForm={editForm}
            readonly={pathObj[pathname] === '详情'}
            formRef={formRef}
            id={id}
            shipping_method={detailData?.shipping_method}
          />
        </ProForm>
      </Spin>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Page);

export default ConnectPage;
