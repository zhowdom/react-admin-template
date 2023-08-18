import { useState, useRef } from 'react';
import { Modal, Form, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import { findPartsByGoodId, updateParts } from '@/services/pages/partsProduct';
import {
  pubConfig,
  pubMsg,
  pubRequiredRule,
  pubRequiredLengthRule,
  handleCutZero,
} from '@/utils/pubConfig';
import ComUpload from './customUpload';
import UploadFileList from '@/components/PubUpload/UploadFileList';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productList, setProductList] = useState<any>([]);
  const [detail, setDetail] = useState<any>();
  const [modalType, setModalType] = useState('');
  const [editForm] = Form.useForm();
  const formRef = useRef<ProFormInstance>();

  // 获取详情数据
  const getDetail = async (id: any): Promise<any> => {
    setLoading(true);
    const res = await findPartsByGoodId({ goodsId: id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    setDetail(JSON.parse(JSON.stringify(res.data.goodsSkus)));
    const newData: any = [];
    res.data.goodsSkus.forEach((v: any) => {
      const newRow = v.skuSpecifications ? v.skuSpecifications.length : 0;
      v.skuSpecifications.forEach((k: any, index: number) => {
        newData.push({
          name_cn: res.data.name_cn,
          tId: `${v.id}-${index}`,
          gId: v.id,
          ...v,
          ...k,
          rowSpan: !index ? newRow : 0,
        });
      });
    });
    setProductList(newData);
    formRef.current?.setFieldsValue({ goodsSkus: newData });
    setLoading(false);
  };

  if (props?.editPartsProModel) {
    props.editPartsProModel.current = {
      open: (type: string, data?: any) => {
        setModalType(type);
        setIsModalVisible(true);
        getDetail(data.id);
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
  // 编辑
  const editSubmit = async (val: any) => {
    setLoading(true);
    const res = await updateParts(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('编辑成功!', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    return Promise.all([editForm.validateFields()])
      .then(async () => {
        const newDetail = JSON.parse(JSON.stringify(detail)).map((v: any) => {
          const parent = val.goodsSkus.find((k: any) => k.gId == v.id) || {};
          const newSpec =
            val.goodsSkus
              .filter((k: any) => k.gId == v.id)
              .map((h: any) => ({
                high: h.high,
                id: h.id,
                length: h.length,
                pics: h.pics,
                weight: h.weight,
                width: h.width,
              })) || [];
          return {
            id: v.id,
            bar_code: parent?.bar_code,
            uom: parent?.uom,
            sys_files: parent?.sys_files,
            sku_attribute: parent?.sku_attribute,
            sku_name: parent?.sku_name,
            skuSpecifications: newSpec,
          };
        });
        editSubmit({
          goodsSkus: newDetail,
        });
      })
      .catch(() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      });
  };
  const columns: any = [
    // {
    //   title: 'tId',
    //   dataIndex: 'tId',
    //   align: 'left',
    // },
    // {
    //   title: 'rowSpan4',
    //   dataIndex: 'rowSpan',
    //   align: 'left',
    // },
    {
      title: '图片',
      align: 'center',
      dataIndex: 'sys_files',
      width: 90,
      hideInTable: props?.isDialog,
      formItemProps: {
        rules: [
          {
            validator: async (rule: any, value: any) => {
              const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
              if (!unDeleteFiles?.length) {
                return Promise.reject(new Error('请上传图片'));
              }
              return Promise.resolve();
            },
          },
        ],
      },
      renderFormItem: (_: any, { record }: any) => {
        return <ComUpload sys_files={record?.sys_files || []} key="upload" />;
      },
      render: (text: any) => {
        return (
          <UploadFileList
            key="pic"
            fileBack={() => {}}
            listType="picture-card"
            checkMain={false}
            required
            disabled
            defaultFileList={text ? (text == '-' ? undefined : text) : undefined}
            accept={['.jpg,.jpeg,.png']}
            acceptType={['jpg', 'jpeg', 'png']}
            maxCount="1"
            size="small"
          />
        );
      },
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '配件名称',
      dataIndex: 'sku_name',
      align: 'left',
      width: 120,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      formItemProps: {
        rules: [pubRequiredRule],
      },
      render: (_: any, record: any) => record?.sku_name || '-',
    },
    {
      title: '配件编码',
      dataIndex: 'sku_code',
      align: 'center',
      width: 120,
      editable: false,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
    },
    {
      title: '商品条码',
      dataIndex: 'bar_code',
      align: 'center',
      width: 120,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      formItemProps: {
        rules: [
          pubRequiredRule,
          {
            validator: (_: any, value: any) => pubRequiredLengthRule(value, 50),
          },
        ],
      },
    },
    {
      title: '单位',
      dataIndex: 'uom',
      align: 'center',
      width: 120,
      valueType: 'select',
      valueEnum: props?.dicList.GOODS_UOM,
      onCell: (record: any) => ({ rowSpan: record.rowSpan }),
      formItemProps: {
        rules: [pubRequiredRule],
      },
    },
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
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      formItemProps: () => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                console.log(value);
                if (typeof value != 'number') {
                  return Promise.reject(new Error('请输入长度'));
                }
                if (typeof value == 'number' && value <= 0) {
                  return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '宽(cm)',
      dataIndex: 'width',
      align: 'center',
      width: 100,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      formItemProps: () => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (typeof value != 'number') {
                  return Promise.reject(new Error('请输入宽度'));
                }
                if (typeof value == 'number' && value <= 0) {
                  return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '高(cm)',
      dataIndex: 'high',
      align: 'center',
      width: 100,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      formItemProps: () => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (typeof value != 'number') {
                  return Promise.reject(new Error('请输入高'));
                }
                if (typeof value == 'number' && value <= 0) {
                  return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '重量(g)',
      dataIndex: 'weight',
      align: 'center',
      width: 100,
      valueType: 'digit',
      fieldProps: {
        precision: 2,
        formatter: (v: any) => {
          return handleCutZero(String(v));
        },
      },
      formItemProps: () => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (typeof value != 'number') {
                  return Promise.reject(new Error('请输入重量'));
                }
                if (typeof value == 'number' && value <= 0) {
                  return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
    {
      title: '每箱数量',
      dataIndex: 'pics',
      align: 'center',
      width: 100,
      valueType: 'digit',
      fieldProps: {
        precision: 0,
      },
      editable: (text: any, record: any) => {
        return record.type == 3;
      },
      render: (_: any, record: any) => (record.type == 3 ? _ : ''),
      formItemProps: () => {
        return {
          rules: [
            {
              validator(a: any, value: any) {
                if (typeof value != 'number') {
                  return Promise.reject(new Error('请输入数量'));
                }
                if (typeof value == 'number' && value <= 0) {
                  return Promise.reject(new Error('商品规格错误, 请输入大于0的数值'));
                }
                if (value > 9999999) {
                  return Promise.reject(new Error(`输入内容不能超过9999999`));
                }
                return Promise.resolve();
              },
            },
          ],
        };
      },
    },
  ];
  return (
    <Modal
      width={1200}
      title={modalType == 'edit' ? '配件编辑' : '查看配件'}
      open={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      okText={modalType == 'edit' ? '保存' : '确定'}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            if (modalType == 'detail') {
              modalClose(true);
            } else {
              saveSubmit(values);
            }
          }}
          submitter={false}
          layout="horizontal"
        >
          <ProForm.Item name="goodsSkus">
            <EditableProTable
              columns={columns}
              cardProps={{ bodyStyle: { padding: 0 } }}
              rowKey="tId"
              bordered
              recordCreatorProps={false}
              editable={{
                type: 'multiple',
                editableKeys: modalType == 'edit' ? productList.map((v: any) => v.tId) : [],
                form: editForm,
                onValuesChange: (record, recordList) => {
                  console.log(recordList, 'recordList');
                  formRef?.current?.setFieldsValue({
                    goodsSkus: recordList,
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
