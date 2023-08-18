import { FC, useEffect } from 'react';
import React, { useRef, useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Popconfirm, Row } from 'antd';
import { ProFormGroup, ProFormInstance, ProFormTextArea } from '@ant-design/pro-form';
import ProForm, {
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import type { ProColumnType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import { Access, connect, history, useAccess } from 'umi';
import { priceApproval, priceApprovalById } from '@/services/pages/signEstablish';
import { pubGetVendorList } from '@/utils/pubConfirm';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import BaseInfo from './BaseInfo';
import { onFinishFailed, pubFilter } from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import PubDingDept from '@/components/PubForm/PubDingDept';
import { pubConfig, pubMsg, pubModal } from '@/utils/pubConfig';
import { IsGrey } from '@/utils/pubConfirm';

const Page: FC<Record<string, any>> = (props) => {
  const readonly = history?.location?.query?.readonly;
  const vendor = history?.location?.query?.vendor;
  const access = useAccess();
  // model下发数据
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [editableKeys, setEditableKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<any>({});
  const [formSkus] = Form.useForm();
  const [submitting, submittingSet] = useState(false);
  const id = history.location?.query?.id || '';
  const [length, setLength] = useState(0);
  const onFinish = (values: Record<string, any>): Promise<boolean | void> => {
    return new Promise((resolve, reject) => {
      Promise.all([formSkus?.validateFields()])
        .then(async () => {
          values.id = id;
          if (!values.id) {
            pubMsg('未找到待审产品, 无法提交');
            return;
          }
          submittingSet(true);

          pubModal('确定提交吗?')
            .then(async () => {
              PubDingDept(
                async (dId: any) => {
                  const res = await await priceApproval(values, dId);
                  resolve(true);
                  submittingSet(false);
                  if (res && res.code == pubConfig.sCode) {
                    pubMsg('提交成功', 'success');
                    setTimeout(() => {
                      history.replace('/sign-establish/price-approval');
                    }, 2000);
                  } else {
                    pubMsg(res?.message || '服务异常, 提交失败');
                  }
                },
                (err: any) => {
                  submittingSet(false);
                  reject();
                  console.log(err);
                },
              );
            })
            .catch(() => {
              submittingSet(false);
              reject();
            });
        })
        .catch((e) => {
          reject('提交内容校验未通过');
          submittingSet(false);
          onFinishFailed(e);
        });
    });
  };
  // 商品报价表
  const handleUpload = async (data: any) => {
    formRef.current?.setFieldsValue({ quotationSheetList: data });
  };
  // 删除SKU
  const delSku = async (record: any) => {
    const newData = formRef?.current?.getFieldValue('quotationDetails');
    const data = newData?.filter((item: any) => item.id !== record.id);
    formRef?.current?.setFieldsValue({
      quotationDetails: data || [],
    });
    setLength(data?.length || 0);
  };
  // 可编辑表格配置
  const columnsSku: ProColumnType<any>[] = [
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'center',
      editable: false,
    },
    {
      title: '采购价',
      dataIndex: 'price',
      align: 'center',
      valueType: 'digit',
      fieldProps: {
        precision: 2,
      },
      formItemProps: () => {
        return {
          rules: [
            {
              required: true,
              message: '价格格式错误, 请输入大于0的数值',
              type: 'number',
              min: 0.01,
            },
          ],
        };
      },
    },
    {
      title: '币种',
      dataIndex: 'currency',
      align: 'center',
      valueType: 'select',
      valueEnum: common?.dicList?.SC_CURRENCY || {},
      editable: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      editable: false,
      align: 'center',
      hideInTable: length < 2 || !!readonly,
      render: (text: any, record: any) => [
        <Popconfirm
          key="delete"
          title="确认删除"
          onConfirm={() => {
            delSku(record);
          }}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];
  const getDetailData = async () => {
    if (id) {
      const res = await priceApprovalById({ id });
      if (res && res.code == pubConfig.sCode) {
        // sku列表开启编辑和默认展开第一个
        if (res.data?.projectsGoodsSkus?.length) {
          if (!readonly) {
            setEditableKeys(res.data?.projectsGoodsSkus.map((item: any) => item.id));
          }
          // 填写默认规格
          res.data?.projectsGoodsSkus.forEach((item: any) => {
            if (
              !item.projectsGoodsSkuSpecifications ||
              !item.projectsGoodsSkuSpecifications.length
            ) {
              item.projectsGoodsSkuSpecifications = [
                {
                  type: 1,
                  width: 0,
                  weight: 0,
                  length: 0,
                  high: 0,
                },
                {
                  type: 2,
                  width: 0,
                  weight: 0,
                  length: 0,
                  high: 0,
                },
                {
                  type: 3,
                  width: 0,
                  weight: 0,
                  length: 0,
                  high: 0,
                  pics: 0,
                },
              ];
            }
          });
          // 筛选出是云仓的
          res.data.projectsCloudCangData = res.data?.projectsGoodsSkus.filter(
            (v: any) => v.send_kind == '5',
          );
          res.data.projectsQiMenCloudCangData = res.data?.projectsGoodsSkus.filter(
            (v: any) => v.send_kind == '6',
          );
          if (res.data.business_scope == 'IN') {
            res.data.projectsGoodsSkuCustomsClearance = res.data?.projectsGoodsSkus.flatMap(
              (v: any) =>
                v.projectsGoodsSkuCustomsClearance
                  ? [
                      {
                        ...v.projectsGoodsSkuCustomsClearance,
                        sku_name: v.sku_name,
                      },
                    ]
                  : [],
            );
          }
        }
        res.data.free_shipping = res.data.free_shipping ? res.data.free_shipping + '' : '';
        setDataSource(res.data);
        setLength(res?.data?.projectsGoodsSkus?.length || 0);
        setTimeout(() => {
          formRef.current?.setFieldsValue({ ...res.data });
        }, 300);
      } else {
        pubMsg(res.message);
      }
    }
  };
  useEffect(() => {
    getDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.location?.pathname, history?.location?.search]);
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <ProForm
        labelCol={{ flex: '100px' }}
        layout={'horizontal'}
        className={readonly ? styles.readonlyForm : ''}
        formRef={formRef}
        submitter={{
          render: () => {
            return !readonly ? (
              <FooterToolbar>
                <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                  返回
                </Button>
                <Access
                  key="change"
                  accessible={
                    access.canSee('cooperate_vendor_backup') ||
                    access.canSee('price_approval_submit')
                  }
                >
                  <Button disabled={submitting} type={'primary'} onClick={formRef?.current?.submit}>
                    提交审批
                  </Button>
                </Access>
              </FooterToolbar>
            ) : (
              <FooterToolbar>
                <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                  返回
                </Button>
              </FooterToolbar>
            );
          },
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Card
          title={'报价详情'}
          extra={`立项编号: ${dataSource?.projects?.project_code}`}
          bordered={false}
        >
          <Row gutter={24}>
            <Col span={8}>
              <ProFormSelect
                label="供应商:"
                allowClear={false}
                name="vendor_id"
                readonly={!!readonly || !!vendor}
                params={{ key: dataSource?.id }}
                request={async (v) => {
                  const res: any = await pubGetVendorList({
                    ...v,
                    vendor_group_id: [dataSource.vendor_group_id],
                    vendor_status_array: ['1', '4'],
                  });
                  return res;
                }}
                fieldProps={{
                  showSearch: true,
                  filterOption: (input: any, option: any) => {
                    const trimInput = input.replace(/^\s+|\s+$/g, '');
                    if (trimInput) {
                      return option.label.indexOf(trimInput) >= 0;
                    } else {
                      return true;
                    }
                  },
                  onChange: (v: any, data: any) => {
                    const projectsGoodsSkus = formRef.current?.getFieldValue('projectsGoodsSkus');
                    formRef.current?.setFieldsValue({
                      projectsGoodsSkus: projectsGoodsSkus.map((item: any) => ({
                        ...item,
                        currency: data.data.currency,
                      })),
                    });
                  },
                }}
                rules={[{ required: true, message: '未选择供应商, 无法提交' }]}
              />
            </Col>
            <Col span={8}>
              {!!readonly ? (
                <ProForm.Item label={'交期'}>{dataSource.delivery_day}天</ProForm.Item>
              ) : (
                <ProFormDigit
                  label={'交期'}
                  name={'delivery_day'}
                  readonly={!!readonly}
                  fieldProps={{ precision: 0, addonAfter: '天' }}
                  min={1}
                  rules={[{ required: true, message: '必填项' }]}
                />
              )}
            </Col>

            <Col span={8}>
              <ProFormGroup>
                {!!readonly ? (
                  <ProForm.Item label={'包邮区域'}>
                    <div style={{ width: '60px' }}>
                      {dataSource.free_shipping != 2
                        ? pubFilter(
                            common.dicList.PROJECTS_PRICE_FREE_SHIPPING,
                            dataSource.free_shipping,
                          ) || '-'
                        : dataSource?.free_shipping_region || '-'}
                    </div>
                  </ProForm.Item>
                ) : (
                  <>
                    <ProFormSelect
                      label={'包邮区域'}
                      name={'free_shipping'}
                      readonly={!!readonly}
                      valueEnum={common?.dicList?.PROJECTS_PRICE_FREE_SHIPPING}
                      rules={[{ required: true, message: '必填项' }]}
                    />
                    <ProFormDependency name={['free_shipping']}>
                      {({ free_shipping }) =>
                        free_shipping == '2' ? (
                          <ProFormText
                            name={'free_shipping_region'}
                            readonly={!!readonly}
                            placeholder={'请输入'}
                            rules={[{ required: true, message: '必填项' }]}
                          />
                        ) : null
                      }
                    </ProFormDependency>
                  </>
                )}
              </ProFormGroup>
            </Col>
          </Row>

          <ProForm.Item
            label="报价明细:"
            name="projectsGoodsSkus"
            trigger="onValuesChange"
            style={{ flexWrap: 'wrap' }}
          >
            <EditableProTable
              className={'p-table-0'}
              cardProps={{ style: { padding: 0 } }}
              editable={{
                type: 'multiple',
                editableKeys,
                form: formSkus,
              }}
              recordCreatorProps={false}
              columns={columnsSku}
              rowKey="id"
            />
          </ProForm.Item>
          {readonly ? (
            <Form.Item label="报价说明:" name="quotation_desc">
              <pre>{dataSource?.quotation_desc || '-'}</pre>
            </Form.Item>
          ) : (
            <ProFormTextArea
              name="quotation_desc"
              label="报价说明"
              placeholder="请输入报价说明"
              wrapperCol={{ span: 12 }}
              rules={[{ required: true, message: '必填/必选项' }]}
            />
          )}
          <ProForm.Item
            style={{ maxWidth: '800px', marginTop: '20px' }}
            label="报价单:"
            name="quotationSheetList"
            extra={readonly ? '' : '支持常用文档和图片以及压缩包格式文件，单个不能超过50M'}
            rules={[{ required: true, message: '必填/必选项' }]}
          >
            {readonly ? (
              IsGrey ? '' : (<ShowFileList data={dataSource?.quotationSheetList || []} />)
            ) : (
              <UploadFileList
                fileBack={handleUpload}
                required
                defaultFileList={dataSource.quotationSheetList}
                businessType="PRICE_APPROVAL_QUOTATION_SHEET"
                maxSize="50"
              />
            )}
          </ProForm.Item>
        </Card>
        <BaseInfo
          name={'projectsGoodsSkus'}
          dataSource={dataSource}
          readonly={readonly || dataSource?.source_type == 1}
          dicList={common?.dicList}
          labelWidth="100px"
          isApproval={true}
        />
      </ProForm>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
