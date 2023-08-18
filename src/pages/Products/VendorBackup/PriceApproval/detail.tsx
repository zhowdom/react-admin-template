import { FC, useEffect } from 'react';
import React, { useRef, useState } from 'react';
import { ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Popconfirm, Row, Tooltip } from 'antd';
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
import * as api from '@/services/pages/vendorBackup';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import BaseInfo from '../BaseInfo';
import { onFinishFailed, pubFilter } from '@/utils/pubConfig';
import { priceValue } from '@/utils/filter';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import PubDingDept from '@/components/PubForm/PubDingDept';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { IsGrey } from '@/utils/pubConfirm';
// 供应商备份 - 价格审批
const Page: FC<Record<string, any>> = (props) => {
  const readonly = history?.location?.query?.readonly;
  const copy = history?.location?.query?.copy;
  const edit = history?.location?.query?.edit;
  const vendor_id = history?.location?.query?.vendor_id;
  const access = useAccess();
  // model下发数据
  const { common } = props;
  console.log(common?.dicList?.PROJECTS_PRICE_FREE_SHIPPING);
  const formRef = useRef<ProFormInstance>();
  const [editableKeys, setEditableKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<any>({});
  const [formSkus] = Form.useForm();
  const [submitting, submittingSet] = useState(false);
  const id = history.location?.query?.id || '';
  const goods_sku_id = history.location?.query?.goods_sku_id || '';
  const [length, setLength] = useState(0);
  // 提交
  const submitAction = async (values: any, resolve: any, isNeed: boolean) => {
    submittingSet(true);
    // 需要审批
    if (isNeed) {
      PubDingDept(
        async (dId: any) => {
          const res = await api.approval({ ...values, sendDingding: isNeed }, dId);
          resolve(true);
          submittingSet(false);
          if (res && res.code == pubConfig.sCode) {
            pubMsg('提交成功!', 'success');
            history.replace('/products/vendor-backup');
          } else {
            pubMsg(res?.message || '服务异常, 提交失败');
          }
        },
        (err: any) => {
          submittingSet(false);
          console.log(err);
        },
      );
    } else {
      // 不需要审批
      const res = await api.approval({ ...values, sendDingding: isNeed }, undefined);
      resolve(true);
      submittingSet(false);
      if (res && res.code == pubConfig.sCode) {
        pubMsg('提交成功!', 'success');
        history.replace('/products/vendor-backup');
      } else {
        pubMsg(res?.message || '服务异常, 提交失败');
      }
    }
  };
  // 判断是否需要触发审批
  const isSendDingdingAction = async (values: any, resolve: any) => {
    const res = await api.isSendDingding({ ...values });
    if (res && res.code == pubConfig.sCode) {
      console.log(res);
      submitAction(values, resolve, res?.data);
    } else {
      pubMsg(res?.message);
    }
  };

  const onFinish = (values: Record<string, any>): Promise<boolean | void> => {
    return new Promise((resolve, reject) => {
      Promise.all([formSkus?.validateFields()])
        .then(async () => {
          if (!id && !goods_sku_id) {
            pubMsg('未找到待审产品, 无法提交');
            return;
          }
          if (id) values.id = id;
          isSendDingdingAction(values, resolve);
          return;
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
    console.log(record, newData);
    const data = newData?.filter((item: any) => item.sku_id !== record.sku_id);
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
      title: 'ERP编码',
      dataIndex: 'erp_sku',
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
      title: (
        <>
          最低采购价/币种
          <Tooltip placement="top" title="商品已有供应商报价中的最低报价">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'lately_price',
      align: 'center',
      editable: false,
      render: (_, row: any) => {
        return `${priceValue(row.lately_price)}/${
          pubFilter(common.dicList.SC_CURRENCY, row.lately_currency) || '-'
        }`;
      },
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
    if (id || goods_sku_id) {
      let res: any;
      if (readonly || edit) {
        res = await api.findById({ id });
      } else {
        res = await api.findByGoodsSkuVendorId({ goods_sku_id, vendor_id });
      }
      if (res && res.code == pubConfig.sCode) {
        // sku列表开启编辑和默认展开第一个
        if (res.data?.quotationDetails?.length) {
          if (!readonly) {
            setEditableKeys(res.data?.quotationDetails.map((item: any) => item.sku_id));
          }
          // 填写默认规格
          res.data?.goodsSkus.forEach((item: any) => {
            if (!item.skuSpecifications || !item.skuSpecifications.length) {
              item.skuSpecifications = [
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
        }
        res.data.vendor_id = vendor_id;
        res.data.free_shipping = res.data.free_shipping ? res.data.free_shipping + '' : ''; // 包邮
        setDataSource(res.data);
        setLength(res?.data?.quotationDetails?.length || 0);
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
    <PageContainer title={'供应商备份 - 价格审批详情'} breadcrumbRender={false}>
      <ProForm
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
                  accessible={access.canSee('vendor_backup_approval,cooperate_vendor_backup')}
                >
                  <Button loading={submitting} type={'primary'} onClick={formRef?.current?.submit}>
                    提交审批
                  </Button>
                </Access>
              </FooterToolbar>
            ) : (
              <FooterToolbar>
                <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                  返回
                </Button>
                {[9, 10].includes(Number(dataSource.approval_status)) &&
                access.canSee('vendor_backup_signature') ? (
                  <Button
                    type={'primary'}
                    onClick={() =>
                      history.push(`/products/vendor-backup/signature?id=${dataSource.id}&copy=1`)
                    }
                  >
                    签样确认
                  </Button>
                ) : null}
              </FooterToolbar>
            );
          },
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Card title={'报价详情'} bordered={false}>
          <Row gutter={24}>
            <Col span={10}>
              <ProFormText name={'goods_id'} noStyle hidden />
              <ProFormText name={'vendor_id'} noStyle hidden />
              <Form.Item label={'供应商'}>{dataSource?.vendor_name}</Form.Item>
            </Col>
            <Col>
              <ProFormDigit
                label={'交期'}
                name={'delivery_day'}
                readonly={!!readonly}
                fieldProps={{ precision: 0, addonAfter: '天' }}
                min={1}
                rules={[{ required: true, message: '必填项' }]}
              />
            </Col>
            <Col>
              <ProFormGroup>
                {!!readonly ? (
                  <Form.Item label={'包邮区域'}>
                    <div style={{ width: '60px' }}>
                      {dataSource.free_shipping != 2
                        ? pubFilter(
                            common.dicList.PROJECTS_PRICE_FREE_SHIPPING,
                            dataSource.free_shipping,
                          ) || '-'
                        : dataSource?.free_shipping_region || '-'}
                    </div>
                  </Form.Item>
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

          <Form.Item
            label="报价明细:"
            name="quotationDetails"
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
              bordered
              recordCreatorProps={false}
              columns={columnsSku}
              rowKey="sku_id"
            />
          </Form.Item>
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

          <Form.Item
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
                businessType="VENDOR_BACKUP_CHANGE_PRICE_QUOTATION_SHEET"
                maxSize="50"
              />
            )}
          </Form.Item>
        </Card>
        <BaseInfo
          name={'goodsSkus'}
          dataSource={dataSource}
          readonly={copy || readonly || dataSource?.source_type == 1}
          dicList={common?.dicList}
        />
      </ProForm>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
