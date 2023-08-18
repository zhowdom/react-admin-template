import { useRef, useState } from 'react';
import { Button, Form, Modal } from 'antd';
import { connect } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import { goodsSkuChangePrice, goodsSkuVendorPage } from '@/services/pages/cooperateProduct';
import {
  goodsChangePriceFindById,
  goodsSkuChangePriceUpdate,
} from '@/services/pages/productPriceChange';
import { onFinishFailed, pubAlert, pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { pubGetVendorList } from '@/utils/pubConfirm';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import './ChangePrice.less';
import PubDingDept from '@/components/PubForm/PubDingDept';

const Dialog = (props: any) => {
  const { common } = props;
  const formRef = useRef<ProFormInstance>();
  const [saveForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [modelType, setModelType] = useState(''); // 类型
  const [loading, setLoading] = useState(false);
  const [goodsSkuDate, setGoodsSkuDate] = useState<any>([]);
  const [detail, setDetail] = useState<any>({});

  // 改变供应商时 - 获取供应商下的商品列表
  const changeVendow = async (id: string, data: any) => {
    setLoading(true);
    const res = await goodsSkuVendorPage({
      current_page: 1,
      page_size: 999,
      vendor_id: id,
      sku_type: 1,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    let newData = res?.data?.records ? res?.data?.records : [];
    newData = newData.map((v: any) => {
      return {
        sku_name: v.sku_name,
        erp_sku: v.erp_sku,
        sku_code: v.sku_code,
        goods_sku_vendor_id: v.id,
        after_price: '', //变更后价格
        before_price: v.price,
        before_currency: v.currency,
        after_currency: data.currency,
      };
    });
    setGoodsSkuDate(newData);
    formRef.current?.setFieldsValue({ priceDetailList: newData, vendor_name: data.name });
    setLoading(false);
  };

  // 编辑 查看时，获取价格变更详情
  const getChangeDetail = async (id: any) => {
    setLoading(true);
    const res: any = await goodsChangePriceFindById({ id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newData = res.data ? res.data : {};
      setGoodsSkuDate(newData.priceDetailList);
      setDetail(newData);
      formRef.current?.setFieldsValue({ ...newData });
    }
    setLoading(false);
  };
  props.changePriceListModel.current = {
    open: (type: string, data?: any) => {
      setIsModalVisible(true);
      setModelType(type);
      if (type == 'detail' || type == 'edit') {
        console.log(data);
        getChangeDetail(data.id);
      }
    },
  };

  // 关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };

  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 添加提交
  const saveSubmit = async (val: any) => {
    return Promise.all([saveForm?.validateFields()])
      .then(async () => {
        const newData = JSON.parse(JSON.stringify(val));
        console.log(newData);
        newData.change_type = 1; //变更类型 1价格变更 2币别变更
        PubDingDept(
          async (dId: any) => {
            setLoading(true);
            const res = await goodsSkuChangePrice(newData, dId);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              setLoading(false);
              return;
            }
            pubAlert('提交成功，请等待审核！');
            setLoading(false);
            modalClose(false);
          },
          (err: any) => {
            console.log(err);
          },
        );
      })
      .catch((e) => {
        onFinishFailed(e);
      });
  };
  // 编辑提交
  const editSubmit = async (val: any) => {
    return Promise.all([saveForm?.validateFields()])
      .then(async () => {
        const newData = JSON.parse(JSON.stringify(val));
        console.log(newData);
        newData.change_type = 1; //变更类型 1价格变更 2币别变更

        PubDingDept(
          async (dId: any) => {
            setLoading(true);
            const res = await goodsSkuChangePriceUpdate(newData, dId);
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              setLoading(false);
              return;
            }
            pubAlert('提交成功，请等待审核！');
            setLoading(false);
            modalClose(false);
          },
          (err: any) => {
            console.log(err);
          },
        );
      })
      .catch((e) => {
        onFinishFailed(e);
      });
  };

  // 上传结束后
  const handleUpload = async (data: any) => {
    console.log(data);
    formRef.current?.setFieldsValue({ sys_files: data });
  };

  const columnsSkus: ProColumns<any>[] = [
    {
      title: '款式编码',
      dataIndex: 'sku_code',
      align: 'center',
      editable: false,
    },
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
      title: '变更前价格',
      dataIndex: 'before_price',
      align: 'center',
      width: 100,
      editable: false,
    },
    {
      title: '变更前币种',
      dataIndex: 'before_currency',
      align: 'center',
      width: 100,
      editable: false,
      render: (_: any, record: any) => {
        return pubFilter(common?.dicList.SC_CURRENCY, record.before_currency);
      },
    },
    {
      title: '变更后价格',
      dataIndex: 'after_price',
      align: 'center',
      width: 100,
      valueType: 'digit',
      editable: () => modelType != 'detail',
      fieldProps: {
        min: 0,
        precision: 2,
      },
      formItemProps: {
        rules: [{ required: true, message: '请输入单价' }],
      },
    },
    {
      title: '变更后币种',
      dataIndex: 'after_currency',
      align: 'center',
      width: 100,
      editable: false,
      render: (_: any, record: any) => {
        return pubFilter(common?.dicList.SC_CURRENCY, record.after_currency);
      },
    },
  ];
  return (
    <Modal
      width={1000}
      title={modelType == 'edit' ? '编辑价格变更' : '批量价格变更'}
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      okText="提交审核"
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      footer={
        modelType == 'detail'
          ? null
          : [
              <Button key="back" onClick={modalClose}>
                取消
              </Button>,
              <Button key="submit" type="primary" loading={loading} onClick={modalOk}>
                提交审核
              </Button>,
            ]
      }
    >
      <ProForm
        submitter={false}
        formRef={formRef}
        labelAlign="right"
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 15 }}
        layout="horizontal"
        onFinish={async (values) => {
          if (modelType == 'add') {
            saveSubmit(values);
          } else if (modelType == 'edit') {
            editSubmit(values);
          }
        }}
        onFinishFailed={(e) => {
          saveForm.validateFields();
          onFinishFailed(e);
        }}
      >
        <ProFormText name="id" hidden />
        <ProFormSelect
          name="vendor_id"
          label="供应商"
          rules={[{ required: true, message: '请选择供应商' }]}
          showSearch
          readonly={modelType == 'add' ? false : true}
          debounceTime={300}
          params={{ vendor_status_array: [1, 4] }}
          fieldProps={{
            onChange: (id: any, row: any) => {
              changeVendow(id, row.data);
            },
          }}
          request={async (v) => {
            const res: any = await pubGetVendorList(v);
            return res;
          }}
        />
        <ProFormText name="vendor_name" label="供应商" hidden />
        <Form.Item
          label="报价明细"
          name="priceDetailList"
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 22 }}
        >
          <EditableProTable
            className="p-table-0 add-order-one-table"
            controlled={true}
            bordered
            size="small"
            editable={{
              form: saveForm,
              type: 'multiple',
              editableKeys: goodsSkuDate.map((record: any) => record.goods_sku_vendor_id),
            }}
            recordCreatorProps={false}
            columns={columnsSkus}
            rowKey={(record: any) => record.goods_sku_vendor_id}
          />
        </Form.Item>
        <Form.Item
          label="报价单"
          name="sys_files"
          rules={[{ required: true, message: '请上传上传报价单' }]}
          extra="支持常用文档和图片以及压缩包格式文件，单个不能超过50M"
        >
          <UploadFileList
            disabled={modelType == 'detail' ? true : false}
            fileBack={handleUpload}
            required
            businessType="GOODS_SKU_CHANGE_PRICE_QUOTATION_SHEET"
            listType="text"
            defaultFileList={detail?.sys_files}
            maxSize="50"
          />
        </Form.Item>
        <ProFormTextArea
          name="remarks"
          readonly={modelType == 'detail' ? true : false}
          label="变更原因"
          placeholder="变更原因"
          rules={[{ max: 400, message: '最多输入400字' }]}
        />
      </ProForm>
    </Modal>
  );
};
export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
