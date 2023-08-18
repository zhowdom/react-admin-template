import type { FC } from 'react';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Row, Tooltip } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import type { ProColumnType } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import { Access, connect, history, useAccess } from 'umi';
import { findById, sample } from '@/services/pages/vendorBackup';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import BaseInfo from '../BaseInfo';
import { onFinishFailed, pubFilter, acceptTypes } from '@/utils/pubConfig';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { IsGrey } from '@/utils/pubConfirm';
// 供应商备份 - 签样确认
const Page: FC<Record<string, any>> = (props) => {
  const access = useAccess();
  const readonly = history?.location?.query?.readonly;
  const copy = history?.location?.query?.copy; // 是否是备份
  // model下发数据
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [dataSource, setDataSource] = useState<any>([]);
  const [editableKeys, setEditableKeys] = useState<string[]>([]);
  const [formSkus] = Form.useForm();
  const id = history.location?.query?.id || '';
  // 提交
  const onFinish = async (values: Record<string, any>) => {
    if (id) values.id = id;
    const res = await sample({
      id,
      approvalSheetList: values.approvalSheetList,
      sample_remarks: values.sample_remarks,
    });
    if (res && res.code == pubConfig.sCode) {
      pubMsg('提交成功!', 'success');
      history.push('/products/vendor-backup');
    } else {
      pubMsg(res?.message);
    }
  };
  // 审核单上传回调
  const handleUpload = async (data: any = []) => {
    const temp = data.filter((item: any) => !item.delete);
    formRef.current?.setFieldsValue({
      approvalSheetList: temp.length ? data : temp,
    });
  };
  const getDetailData = async () => {
    if (id) {
      const res = await findById({ id });
      if (res && res.code == pubConfig.sCode) {
        // sku列表编辑, 默认展开第一个
        if (res.data?.quotationDetails?.length) {
          if (!readonly) {
            setEditableKeys(res.data?.quotationDetails.map((item: any) => item.sku_id));
          }
          // 签样时候可以添加箱规配置
          res.data.goodsSkus = res.data.goodsSkus.map((item: any) => {
            return {
              ...item,
              skuSpecifications:
                item.skuSpecifications.length < 3
                  ? [
                    ...item.skuSpecifications,
                    {
                      type: 3,
                      high: 0,
                      length: 0,
                      weight: 0,
                      width: 0,
                      pics: 0,
                    },
                  ]
                  : item.skuSpecifications,
            };
          });
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
      editable: false,
      width: 120,
      align: 'center',
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
    {
      title: (
        <>
          最低采购价
          <Tooltip placement="top" title="商品已有供应商报价中的最低报价">
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </Tooltip>
        </>
      ),
      dataIndex: 'lately_price',
      align: 'center',
      editable: false,
    },
  ];
  return (
    <PageContainer title={'供应商备份 - 签样详情'} breadcrumbRender={false}>
      <ProForm
        layout={'horizontal'}
        className={readonly ? styles.readonlyForm : ''}
        formRef={formRef}
        labelCol={{ flex: '80px' }}
        submitter={{
          render: (_, dom) => {
            return !readonly ? (
              <FooterToolbar>
                <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                  返回
                </Button>
                <Access key="submit" accessible={access.canSee('vendor_backup_signature')}>
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
        onFinishFailed={onFinishFailed}
        validateTrigger="onBlur"
      >
        <Card title={'签样信息'} bordered={false}>
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
        <Card title={'报价信息'} bordered={false} style={{ marginTop: '10px' }}>
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item label="供应商">{dataSource.vendor_name}</Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="报价单">
                {IsGrey ? '' : (<ShowFileList data={dataSource?.quotationSheetList || []} />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="交期">{dataSource.delivery_day}天</Form.Item>
            </Col>
            <Col span={6}>
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
            name="quotationDetails"
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
