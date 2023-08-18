import { Col, Form, Modal, Row, Table, Button, Alert } from 'antd';
import { ModalForm, ProFormText, ProFormSelect, ProForm } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useMemo, useRef } from 'react';
import './index.less';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { pubProLineList } from '@/utils/pubConfirm';
import { flatData } from '@/utils/filter';
import { linkMerge } from '@/services/pages/link';
import { uniqBy } from 'lodash';

const GroupLink: React.FC<{
  title?: string;
  reload: any;
  data: Record<string, any>[];
}> = ({ title, data, reload }) => {
  const formRef: any = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const errorTip = useMemo(() => {
    console.log(data, 'data');
    if (uniqBy(data, 'shop_id').length > 1) {
      return '所选链接不属于同一个店铺, 无法合并';
    }
    if (uniqBy(data, 'spread_user_id').length > 1) {
      return '所选链接不属于同一个推广, 无法合并';
    }
    return '';
  }, [data]);
  return (
    <ModalForm
      title={title || '链接合并'}
      trigger={
        <Button
          title={'需选择两条以上的数据, 确保所选链接属于同一个推广和同一个店铺'}
          ghost
          type={'primary'}
          disabled={data.length < 2}
        >
          链接合并
        </Button>
      }
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      formRef={formRef}
      width={800}
      onFinish={async (values) => {
        const res = await linkMerge({ ...values, merge_id_list: data.map((item) => item.id) });
        if (res?.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          if (typeof reload === 'function') reload();
          return true;
        } else {
          pubMsg(res?.message);
          return false;
        }
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
      {...(errorTip ? { submitter: false } : {})}
    >
      <Row gutter={20}>
        {errorTip ? (
          <Col span={24}>
            <Alert style={{ marginBottom: 20 }} banner type={'error'} message={errorTip} />
          </Col>
        ) : null}
        <Col span={12}>
          <ProFormText
            label={'合并后的链接ID'}
            name={'link_id'}
            placeholder={
              data[1]?.platform_code == 'WALMART' ? '请输入Group ID或WPID' : '请输入链接的ASIN'
            }
            rules={[pubRequiredRule]}
          />
        </Col>
        <Col span={12}>
          <ProFormSelect
            label={'产品线'}
            name={'category_id'}
            rules={[pubRequiredRule]}
            request={() => pubProLineList({ business_scope: 'IN' })}
          />
        </Col>
      </Row>
      <ProForm.Item label={'SKU'} name={'merge_id_list'}>
        <Table
          bordered
          rowKey={(record) => record.id + record.sku_code}
          size={'small'}
          pagination={false}
          columns={[
            {
              title: '合并前链接(名称/id)',
              dataIndex: 'link_name',
              render: (_, record) => (
                <>
                  {record.link_name || ''}
                  <br />
                  {record.link_id || ''}
                </>
              ),
              onCell: (record: any) => ({ rowSpan: record.rowSpan1 }),
            },
            {
              title: 'SKU(店铺SKU)',
              dataIndex: 'shop_sku_code',
            },
            {
              title: '款式编码',
              dataIndex: 'sku_code',
            },
            {
              title: '款式名称',
              dataIndex: 'sku_name',
            },
          ]}
          dataSource={flatData(
            data?.map((v: any) => ({
              ...v,
              linkManagementSkuList: v?.linkManagementSkuList?.map((c: any) => ({
                ...c,
                link_name: c.link_name || v.link_name,
                link_id: c.link_id || v.link_id,
              })),
            })),
            'linkManagementSkuList',
          )}
        />
      </ProForm.Item>
    </ModalForm>
  );
};
export default GroupLink;
