import { useState, useRef } from 'react';
import { Modal, Row, Col, Spin, Form } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormSelect, ProFormDependency } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import { addParts } from '@/services/pages/partsProduct';
import {
  handleCutZero,
  pubConfig,
  pubMsg,
  pubRequiredLengthRule,
  pubRequiredMaxRule,
} from '@/utils/pubConfig';
import './style.less';
import { pubProLineList } from '@/utils/pubConfirm';
import { getList } from '@/services/pages/productList';
import UploadFileList from '@/components/PubUpload/UploadFileList';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [productLines, setProductLines] = useState<any>([]);
  const [productList, setProductList] = useState<any>([]);
  const [goodData, setGoodData] = useState<any>('');
  const [editForm] = Form.useForm();
  const formRef = useRef<ProFormInstance>();

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

  // 获取产品线下拉
  const getProductLine = async (): Promise<any> => {
    const res: any = await pubProLineList({
      business_scope: 'CN',
    });
    setProductLines(res || []);
  };
  // 获取产品下拉
  const getProductList = async (category_id?: string): Promise<any> => {
    const res: any = await getList({
      category_id: category_id,
      current_page: 1,
      page_size: 999,
    });
    setProductList(
      res?.data?.records
        ? res.data.records.map((v: any) => ({
            value: v.id,
            label: v.name_cn + '(' + v.goods_code + ')',
            name: v.name_cn,
            code: v.goods_code,
            data: v,
          }))
        : [],
    );
  };
  // 上传返回
  const handleUpload = (info: any, key: string) => {
    console.log(info, key);
    formRef?.current?.setFieldsValue({
      [key]: info,
    });
    formRef?.current?.validateFields([key]);
  };

  if (props?.addPartsProModel) {
    props.addPartsProModel.current = {
      open: (type: any, data?: any) => {
        setIsModalVisible(true);
        setModalType(type);
        if (data) {
          setGoodData({
            name: data.name_cn,
            id: data.id,
          });
          setTimeout(() => {
            formRef?.current?.setFieldsValue({
              goods_id: data.id,
            });
          }, 200);
        } else {
          getProductLine();
        }
      },
    };
  }
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  // 添加提交
  const addSubmit = async (val: any) => {
    setLoading(true);
    const res = await addParts(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功!', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    return Promise.all([editForm.validateFields()])
      .then(async () => {
        console.log(val);
        const newData = JSON.parse(JSON.stringify(val));
        addSubmit(newData);
      })
      .catch(() => {
        editForm.validateFields();
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      });
  };
  return (
    <Modal
      width={800}
      title={modalType == 'add' ? '添加产品配件' : '添加配件'}
      open={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          onFinishFailed={() => {
            editForm.validateFields();
          }}
          className={modalType === 'detail' ? 'item12' : undefined}
          requiredMark={modalType === 'detail' ? false : undefined}
          labelAlign="right"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          submitter={false}
          layout="horizontal"
        >
          {modalType == 'add' ? (
            <Row gutter={15}>
              <Col span={12}>
                <ProFormSelect
                  name="business_scope"
                  label="选择主产品"
                  readonly={props.disabled}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  allowClear
                  debounceTime={300}
                  fieldProps={{
                    ...selectProps,
                    options: productLines,
                    onChange: (vid) => {
                      getProductList(vid);
                    },
                  }}
                  placeholder="选择产品线"
                  rules={[{ required: true, message: '请选择产品线' }]}
                />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  name="goods_id"
                  wrapperCol={{ span: 20 }}
                  allowClear
                  showSearch
                  debounceTime={300}
                  fieldProps={{
                    ...selectProps,
                    options: productList,
                    onChange: (vid, data) => {
                      console.log(vid);
                      console.log(data);
                      setGoodData(data);
                    },
                  }}
                  placeholder="选择产品"
                  rules={[{ required: true, message: '请选择产品' }]}
                />
              </Col>
            </Row>
          ) : (
            <>
              <Form.Item label="主产品" required style={{ marginBottom: '10px' }}>
                {goodData.name}
              </Form.Item>
              <ProFormText name="goods_id" hidden />
            </>
          )}

          <ProFormDependency name={['goods_id']}>
            {({ goods_id }: any) => {
              return goods_id ? (
                <Form.Item label="配件名称" required style={{ marginBottom: 0 }}>
                  <Row gutter={0}>
                    <Col span={12}>
                      <ProFormText
                        disabled={modalType === 'detail'}
                        name="sku_name"
                        placeholder="配件名称"
                        wrapperCol={{ span: 20 }}
                        rules={[
                          { required: true, message: '请输入配件名称' },
                          {
                            validator: (_, value) => pubRequiredLengthRule(value, 100),
                          },
                        ]}
                      />
                    </Col>
                  </Row>
                </Form.Item>
              ) : (
                <Form.Item label="配件名称" required>
                  <span style={{ color: '#ff0000' }}>请选择主产品</span>
                </Form.Item>
              );
            }}
          </ProFormDependency>

          <Row gutter={15}>
            <Col span={12}>
              <ProFormText
                name="bar_code"
                label="商品条码"
                placeholder="请输入商品条码"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                rules={[
                  { required: true, message: '请输入商品条码' },
                  {
                    validator: (_, value) => pubRequiredLengthRule(value, 50),
                  },
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="uom"
                label="单位: "
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValue={'个'}
                placeholder="请选择单位"
                valueEnum={props?.dicList?.GOODS_UOM}
                rules={[{ required: true, message: '请选择单位' }]}
              />
            </Col>
          </Row>

          <ProForm.Item
            label="图片："
            name="sys_files"
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <UploadFileList
              fileBack={(val: any, init: boolean) => {
                if (!init) {
                  handleUpload(val, 'sys_files');
                }
              }}
              listType="picture-card"
              businessType={'PROJECT_GOODS_SKU'}
              checkMain={false}
              size="small"
              accept={['.png,.jpg,.jpeg']}
              acceptType={['jpg', 'jpeg', 'png']}
              maxSize="20"
              maxCount="1"
            />
          </ProForm.Item>
          <ProForm.Item
            label={'规格'}
            name="skuSpecifications"
            rules={[{ required: true, message: '请输入商品规格' }]}
          >
            <EditableProTable
              request={async () => ({
                data: [
                  {
                    tid: 1,
                    type: 1,
                    length: '',
                    width: '',
                    high: '',
                    weight: '',
                    pics: '',
                  },
                  {
                    tid: 2,
                    type: 2,
                    length: '',
                    width: '',
                    high: '',
                    weight: '',
                    pics: '',
                  },
                  {
                    tid: 3,
                    type: 3,
                    length: '',
                    width: '',
                    high: '',
                    weight: '',
                    pics: '',
                  },
                ],
                success: true,
              })}
              columns={[
                {
                  title: '规格类型',
                  dataIndex: 'type',
                  align: 'center',
                  editable: false,
                  width: 90,
                  valueEnum: {
                    1: { text: '单品尺寸' },
                    2: { text: '包装尺寸' },
                    3: { text: '箱规' },
                  },
                },

                {
                  title: '长(cm)',
                  dataIndex: 'length',
                  align: 'center',
                  width: 100,
                  valueType: 'digit',
                  fieldProps: {
                    min: 1,
                    precision: 2,
                    formatter: (v: any) => {
                      return handleCutZero(String(v));
                    },
                  },
                  formItemProps: {
                    rules: [
                      {
                        validator: (_, value) => pubRequiredMaxRule(value, 9999999, true),
                      },
                    ],
                  },
                },
                {
                  title: '宽(cm)',
                  dataIndex: 'width',
                  align: 'center',
                  width: 100,
                  valueType: 'digit',
                  fieldProps: {
                    min: 1,
                    precision: 2,
                    formatter: (v: any) => {
                      return handleCutZero(String(v));
                    },
                  },
                  formItemProps: {
                    rules: [
                      {
                        validator: (_, value) => pubRequiredMaxRule(value, 9999999, true),
                      },
                    ],
                  },
                },
                {
                  title: '高(cm)',
                  dataIndex: 'high',
                  align: 'center',
                  width: 100,
                  valueType: 'digit',
                  fieldProps: {
                    min: 1,
                    precision: 2,
                    formatter: (v: any) => {
                      return handleCutZero(String(v));
                    },
                  },
                  formItemProps: {
                    rules: [
                      {
                        validator: (_, value) => pubRequiredMaxRule(value, 9999999, true),
                      },
                    ],
                  },
                },
                {
                  title: '重量(g)',
                  dataIndex: 'weight',
                  align: 'center',
                  width: 100,
                  valueType: 'digit',
                  fieldProps: {
                    min: 1,
                    precision: 2,
                    formatter: (v: any) => {
                      return handleCutZero(String(v));
                    },
                  },
                  formItemProps: {
                    rules: [
                      {
                        validator: (_, value) => pubRequiredMaxRule(value, 9999999, true),
                      },
                    ],
                  },
                },
                {
                  title: '每箱数量',
                  dataIndex: 'pics',
                  align: 'center',
                  width: 100,
                  valueType: 'digit',
                  fieldProps: {
                    min: 1,
                    precision: 0,
                  },
                  editable: (text: any, record: any) => {
                    return record.type == 3;
                  },
                  render: (_: any, record: any) => (record.type == 3 ? _ : ''),
                  formItemProps: {
                    rules: [
                      {
                        validator: (_, value) => pubRequiredMaxRule(value, 9999999, true),
                      },
                    ],
                  },
                },
              ]}
              cardProps={{ bodyStyle: { padding: 0 } }}
              rowKey="tid"
              bordered
              recordCreatorProps={false}
              editable={{
                type: 'multiple',
                editableKeys: [1, 2, 3],
                form: editForm,
                onValuesChange: (record, recordList) => {
                  console.log(recordList, 'recordList');
                  formRef?.current?.setFieldsValue({
                    skuSpecifications: recordList,
                  });
                },
              }}
            />
          </ProForm.Item>
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;
