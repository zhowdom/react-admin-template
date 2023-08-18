
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import ProForm from '@ant-design/pro-form';
import './index.less'

const LogisticsClearance = (props: any) => {
  const formItemLayout1: any = {
    labelCol: props?.labelCol,
    wrapperCol: props?.wrapperCol || { span: 24 },
  };
  const { dicList } = props;
  const fileColumns: ProColumns<any>[] = [
    {
      title: '款式名称',
      dataIndex: 'sku_name',
      align: 'left',
    },
    {
      title: '材质(英文)',
      dataIndex: 'texture_en',
      align: 'left',

      width: 180,
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      align: 'left',
      width: 200,
    },
    {
      title: '是否带磁',
      dataIndex: 'magnetism',
      valueType: 'select',
      align: 'center',
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '是否有磁性包装',
      dataIndex: 'magnetism_packing',
      valueType: 'select',
      align: 'center',
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '是否带电',
      dataIndex: 'electric',
      valueType: 'select',
      align: 'center',
      valueEnum: dicList.SC_YES_NO,
    },
    {
      title: '额定功率',
      dataIndex: 'w',
      valueType: 'digit',
      align: 'center',
    },
    {
      title: '额定电压',
      dataIndex: 'v',
      align: 'center',
      valueType: 'digit',
    },
    {
      title: '额定电流',
      dataIndex: 'a',
      align: 'center',
    },
  ];

  return props?.projectsGoodsSkuCustomsClearance?.length ? (
    <>
      <ProForm.Item {...formItemLayout1} label="物流清关信息" className='clearTable'>
        <EditableProTable
          columns={fileColumns}
          className="p-table-0"
          value={props?.projectsGoodsSkuCustomsClearance || []}
          rowKey="tempId"
          bordered
          scroll={{ x: 1200 }}
          recordCreatorProps={false}
          editable={{
            type: 'multiple',
            editableKeys: [],
            form: props?.form,
          }}
          style={{ width: '100%' }}
        />
      </ProForm.Item>
    </>
  ) : <></>;
};
export default LogisticsClearance;
