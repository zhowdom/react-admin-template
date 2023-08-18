import { Form, Modal } from 'antd';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import {
  EditableProTable,
  ModalForm,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { stockUpCnSafeDaysUpdateById } from '@/services/pages/stockUpCn/stockConfig';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  dicList: any;
  initialValues?: any;
}> = ({ trigger, reload, initialValues, dicList }) => {
  const [formData, formDataSet] = useState<any>({});
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const formRef = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const columns: ProColumns<any>[] = [
    {
      title: '平台',
      dataIndex: 'platform_name',
      editable: false,
    },
    {
      title: '安全库存天数',
      dataIndex: 'safe_days',
      align: 'center',
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        controls: false,
      },
      formItemProps: {
        rules: [
          {
            validator: (_, val: any) => {
              if (!val) {
                return Promise.reject('安全库存天数必须大于0');
              }
              return Promise.resolve();
            },
          },
        ],
      },
    },
    {
      title: '修改原因',
      dataIndex: 'remarks',
      valueType: 'textarea',
      align: 'center',
      onCell: ({ rowSpan }: any, index: any) => {
        if (index) {
          return { rowSpan: 0 };
        } else {
          return { rowSpan };
        }
      },
      formItemProps: {
        rules: [
          pubRequiredRule,
        ],
      },
    },
  ];
  return (
    <ModalForm
      title={'修改安全库存'}
      trigger={trigger}
      width={600}
      layout={'horizontal'}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          const newD = initialValues.allRow?.map((v: any) => ({
            ...v,
            rowSpan: initialValues.allRow?.length,
          }))
          formDataSet({
            life_cycle: initialValues.life_cycle,
            dataSource: newD
          })
          setEditableRowKeys(newD.map((v: any) => v.id))
        }
      }}
      onFinish={async (values: any) => {
        return Promise.all([editForm.validateFields()]).then(async () => {
          console.log(values, 'values');
          const newD = values?.dataSource.map((v: any) => ({
            id: v?.id, //CN备货配置id
            safe_days: v?.safe_days //安全库存天数
          }))
          console.log(newD, 'newD');
          const res: any = await stockUpCnSafeDaysUpdateById({
            life_cycle: values?.life_cycle,
            remarks: values?.dataSource[0].remarks,
            stockUpCnSafeDaysList: newD
          });
          if (res?.code != pubConfig.sCode) {
            pubMsg(res.message);
            return false;
          }
          pubMsg('操作成功！', 'success');
          reload();
          return true;
        });
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
      initialValues={formData}
    >
      <ProFormSelect
        colProps={{ span: 6 }}
        name="life_cycle"
        label="款式生命周期"
        valueEnum={dicList?.GOODS_LIFE_CYCLE || {}}
        readonly
      />
      <ProForm.Item label="" name="dataSource">
        <EditableProTable
          bordered
          size={'small'}
          rowKey="id"
          className="p-table-0"
          recordCreatorProps={false}
          columns={columns}
          editable={{
            type: 'multiple',
            editableKeys,
            form: editForm,
            onValuesChange: (record, recordList) => {
              console.log(recordList, 'recordList');
              formRef?.current?.setFieldsValue({
                dataSource: recordList,
              });
            },
          }}
        />
      </ProForm.Item>
    </ModalForm>
  );
};
export default Component;
