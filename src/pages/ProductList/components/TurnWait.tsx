import { Col, Form, Modal, Row, Table } from 'antd';
import { ModalForm, ProFormTextArea, ProForm } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { initiateReview } from '@/services/pages/productList';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';

const TurnWait: React.FC<{
  title?: string;
  reload: any;
  data: Record<string, any>;
  dicList: any;
}> = ({ title, data, reload, dicList }) => {
  const formRef: any = useRef<ProFormInstance>();
  const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>([]);
  const [editForm] = Form.useForm();
  return (
    <ModalForm
      title={title || '发起评审'}
      trigger={<a>发起评审</a>}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      formRef={formRef}
      width={800}
      onFinish={async (values) => {
        const res = await initiateReview({
          ...values,
          goods_sku_id: selectedRowKeys.toString(),
          id: data.id,
        });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('发起评审成功!', 'success');
          selectedRowKeysSet([]);
          if (reload) reload();
          return true;
        }
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
    >
      <Row>
        <Col span={12}>
          <ProForm.Item label={'产品名称'}>{data?.name_cn || '-'}</ProForm.Item>
        </Col>
        <Col span={12}>
          <ProForm.Item label={'产品编码'}>{data?.goods_code || '-'}</ProForm.Item>
        </Col>
      </Row>
      <ProForm.Item label={'选择评审款式'} name={'skuList'}>
        {/*只评审测试期和稳定期的款式*/}
        <Table
          rowKey={'id'}
          dataSource={
            data?.goodsSkus.filter((item: any) => item.life_cycle == 1 || item.life_cycle == 2) ||
            []
          }
          size={'small'}
          pagination={false}
          columns={[
            {
              title: '款式名称',
              dataIndex: 'sku_name',
            },
            {
              title: '款式编码',
              dataIndex: 'sku_code',
            },
            {
              title: '当前生命周期',
              dataIndex: 'life_cycle',
              render: (_: any, record: any) =>
                pubFilter(dicList?.GOODS_LIFE_CYCLE, record?.life_cycle) || '-',
            },
            Table.SELECTION_COLUMN,
          ]}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => {
              selectedRowKeysSet(keys);
            },
          }}
        />
      </ProForm.Item>
      <ProFormTextArea
        name="reason"
        label="评审原因"
        placeholder="请输入评审原因"
        rules={[{ required: true, message: '请输入评审原因' }]}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 20 }}
      />
    </ModalForm>
  );
};
export default TurnWait;
