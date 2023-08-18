import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Row } from 'antd';
import { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormDigit, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProColumnType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { Access, connect, history, useAccess } from 'umi';
import { projectsSampleAdd, projectsSampleById } from '@/services/pages/signEstablish';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import CheckFileListTable from './CheckFileListTable';
import BaseInfo from '@/pages/PriceApproval/BaseInfo';
import { IsGrey } from '@/utils/pubConfirm';
import {
  onFinishFailed,
  pubFilter,
  pubModal,
  pubConfig,
  pubMsg,
  acceptTypes,
} from '@/utils/pubConfig';

const Page: FC<Record<string, any>> = (props) => {
  const access = useAccess();
  const readonly = history?.location?.query?.readonly;
  // model下发数据
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [dataSource, setDataSource] = useState<any>([]);
  const [editableKeys, setEditableKeys] = useState<string[]>([]);
  const [formSpecification] = Form.useForm();
  const [formSkus] = Form.useForm();
  const id = history.location?.query?.id || '';
  const _ref = useRef();

  // 提交签样数据
  const submitAction = async (values: any, resolve: any) => {
    const res = await projectsSampleAdd(values);
    resolve(true);
    if (res && res.code == pubConfig.sCode) {
      pubMsg('提交成功!', 'success');
      history.push('/sign-establish/signature');
    } else {
      pubMsg(res?.message);
    }
  };
  // 提交
  const onFinish = (values: Record<string, any>): Promise<boolean | void> => {
    return new Promise((resolve, reject) => {
      Promise.all([formSpecification?.validateFields(), formSkus?.validateFields()])
        .then(() => {
          values.projectsGoodsSkus = values.projectsGoodsSkus.map((vitem: any) => {
            return {
              ...vitem,
            };
          });
          if (id) {
            values.id = history.location?.query?.id;
          } else {
            values.goods_specifications.forEach((item: any) => {
              delete item.id;
            });
          }
          if (values.projectsGoodsSkus.some((v: any) => !v.bar_code)) {
            pubModal('未填写商品条码，是否继续提交？')
              .then(async () => {
                submitAction(values, resolve);
              })
              .catch(() => {
                reject();
              });
          } else {
            submitAction(values, resolve);
          }
        })
        .catch((e) => {
          reject('提交内容校验未通过');
          onFinishFailed(e);
        });
    });
  };
  // 审核单上传回调
  const handleUpload = async (data: any = []) => {
    const temp = data.filter((item: any) => !item.delete);
    formRef.current?.setFieldsValue({
      approvalSheetList: temp.length ? data : temp,
    });
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
      align: 'right',
      editable: false,
      width: 120,
      hideInTable: IsGrey,
      valueType: (item: any) => {
        return {
          type: 'money',
          locale: item.currency === 'USD' ? 'en-US' : 'zh-CN',
        };
      },
    },
    {
      title: '币种',
      dataIndex: 'currency',
      align: 'center',
      editable: false,
      valueEnum: common?.dicList?.SC_CURRENCY || {},
    },
  ];
  const getDetailData = async () => {
    if (id) {
      const res = await projectsSampleById({ id });
      if (res && res.code == pubConfig.sCode) {
        // sku列表编辑, 默认展开第一个
        if (res.data?.projectsGoodsSkus?.length) {
          // 签样时候可以添加箱规配置
          res.data.projectsGoodsSkus = res.data.projectsGoodsSkus.map((item: any) => {
            return {
              ...item,
              projectsGoodsSkuSpecifications:
                item.projectsGoodsSkuSpecifications.length < 3
                  ? [
                      ...item.projectsGoodsSkuSpecifications,
                      {
                        type: 3,
                        high: 0,
                        length: 0,
                        weight: 0,
                        width: 0,
                        pics: 0,
                      },
                    ]
                  : item.projectsGoodsSkuSpecifications,
            };
          });
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
          res.data.authorizeReportList = res?.data?.authorizeReportList || [];
          _ref?.current?.setData(res.data.authorizeReportList);
          // 筛选出是云仓的
          res.data.projectsCloudCangData = res.data?.projectsGoodsSkus.filter(
            (v: any) => v.send_kind == '5',
          );
          res.data.projectsQiMenCloudCangData = res.data?.projectsGoodsSkus.filter(
            (v: any) => v.send_kind == '6',
          );
          if (!readonly) {
            setEditableKeys(res.data?.projectsGoodsSkus.map((item: any) => item.id));
          }
        }
        setDataSource(res.data);
        setTimeout(() => {
          formRef.current?.setFieldsValue({ ...res.data });
        }, 600);
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
        layout={'horizontal'}
        formRef={formRef}
        labelCol={{ flex: '80px' }}
        submitter={{
          render: (_, dom) => {
            return !readonly ? (
              <FooterToolbar>
                <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                  返回
                </Button>
                <Access key="submit" accessible={access.canSee('signature_sample')}>
                  {dom[1]}
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
        params={{ id }}
        onFinishFailed={onFinishFailed}
        validateTrigger="onBlur"
      >
        <Card title={'签样信息'} bordered={false}>
          <Row gutter={24}>
            <Col span={24}>
              <ProFormText readonly label="供应商:" name="vendor_name" />
            </Col>
            <Col span={8}>
              <ProForm.Item label="报价单:" name="quotationSheetList" style={{ minWidth: '300px' }}>
                {IsGrey ? '' : (<ShowFileList data={dataSource?.quotationSheetList || []} />)}
              </ProForm.Item>
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
            </Col>
          </Row>

          <ProForm.Item
            label="报价明细:"
            name="projectsGoodsSkus"
            trigger="onValuesChange"
            style={{ flexWrap: 'wrap' }}
            rules={[{ required: true, message: '必填/必选项' }]}
          >
            <EditableProTable
              size="small"
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
          <ProForm.Item label="报价说明" name="quotation_desc">
            <pre>{dataSource?.quotation_desc || '-'}</pre>
          </ProForm.Item>
          <ProForm.Item
            name="authorizeReportList"
            label={'产品证书'}
            // required
            // rules={[
            //   {
            //     validator: (rule: any, value: any) => {
            //       if (!value || !value.filter((item: any) => item.delete != 1).length)
            //         return Promise.reject('产品证书不能为空');
            //       return Promise.resolve();
            //     },
            //   },
            // ]}
          >
            <CheckFileListTable readonly={!!readonly} form={formRef} _ref={_ref} />
          </ProForm.Item>
          {!!readonly ? (
            <ProForm.Item label={'签样说明'}>{dataSource?.sample_remarks || '-'}</ProForm.Item>
          ) : (
            <ProFormTextArea label={'签样说明'} name={'sample_remarks'} />
          )}
          <ProForm.Item
            label="签样凭证:"
            name="approvalSheetList"
            extra={readonly ? '' : '签样凭证支持常用文档和图片以及压缩包格式文件,单个不能超过50M'}
            style={{ maxWidth: 600, marginTop: '20px' }}
            rules={[{ required: true, message: '请上传签样凭证' }]}
          >
            {readonly ? (
              <ShowFileList data={dataSource?.approvalSheetList} />
            ) : (
              <UploadFileList
                fileBack={handleUpload}
                required
                defaultFileList={dataSource?.approvalSheetList}
                businessType="PRODUCT_APPROVAL_SHEET"
                accept={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                acceptType={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                acceptMessage="上传格式不对，请检查上传文件"
                maxSize="50"
                maxCount="10"
              />
            )}
          </ProForm.Item>
        </Card>
        <BaseInfo
          name={'projectsGoodsSkus'}
          dataSource={dataSource}
          readonly={readonly || dataSource?.source_type == 1}
          dicList={common?.dicList}
          form={formSpecification}
          editType={3}
          labelWidth="100px"
        />
      </ProForm>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
