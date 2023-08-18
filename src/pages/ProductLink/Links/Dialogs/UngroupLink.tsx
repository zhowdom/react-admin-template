import { Col, Modal, Row, Table, Button } from 'antd';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { linkSplit } from '@/services/pages/link';
import './index.less';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';

const UngroupLink: React.FC<{
  title?: string;
  reload: any;
  data: Record<string, any>;
}> = ({ title, data, reload }) => {
  const formRef: any = useRef<ProFormInstance>();
  const [linkManagementSkuList, linkManagementSkuListSet] = useState<any[]>(
    data.linkManagementSkuList,
  );
  const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>([]);
  const [skuList, skuListSet] = useState<any>([]);
  const [links, linksSet] = useState<any>([]);
  return (
    <ModalForm
      title={title || '链接拆分'}
      trigger={<a>链接拆分</a>}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      formRef={formRef}
      width={800}
      onFinish={async (values) => {
        if (links.length == 0) {
          pubMsg('请选择需要拆分的sku');
          return;
        }
        const postData: any[] = [{ id: data.id }];
        links.forEach((item: any, i: any) => {
          postData.push({ ...item, ...values[i] });
        });
        const res = await linkSplit(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('拆分成功!', 'success');
          selectedRowKeysSet([]);
          skuListSet([]);
          if (reload) reload();
          return true;
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
      initialValues={links}
    >
      <Row>
        <Col span={12}>
          <ProForm.Item label={'链接名称'}>{data.link_name}</ProForm.Item>
        </Col>
        <Col span={12}>
          <ProForm.Item label={'链接ID'}>{data.link_id}</ProForm.Item>
        </Col>
        <Col span={24}>
          <ProForm.Item label={'SKU'} name={'skuList'}>
            <Table
              rowKey={'id'}
              dataSource={linkManagementSkuList}
              size={'small'}
              pagination={false}
              columns={[
                {
                  title: 'SKU',
                  dataIndex: 'shop_sku_code',
                },
                {
                  title: '款式名称',
                  dataIndex: 'sku_name',
                },
                {
                  title: '款式编码',
                  dataIndex: 'sku_code',
                },
                Table.SELECTION_COLUMN,
              ]}
              rowSelection={{
                columnWidth: 70,
                columnTitle: '选择',
                selectedRowKeys,
                onChange: (val, options) => {
                  skuListSet(options);
                  selectedRowKeysSet(val);
                },
              }}
            />
          </ProForm.Item>
        </Col>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Button
            disabled={selectedRowKeys.length == 0}
            type={'primary'}
            style={{ marginBottom: 10 }}
            onClick={() => {
              skuListSet([]);
              selectedRowKeysSet([]);
              linkManagementSkuListSet(
                linkManagementSkuList.filter((item: any) => !selectedRowKeys.includes(item.id)),
              );
              linksSet([...links, { id: Date.now(), link_id: '', skuList }]);
            }}
          >
            确认选择
          </Button>
        </Col>
      </Row>
      {links
        ? links.map((item: any, i: number) => {
            return (
              <Row key={item.id} gutter={20}>
                <Col span={12}>
                  <ProFormText
                    label={'链接ID'}
                    name={[i, 'link_id']}
                    rules={[pubRequiredRule]}
                    placeholder={'请输入父asin'}
                  />
                </Col>
                <Col span={24}>
                  <ProForm.Item label={'SKU'} name={[i, 'skuList']}>
                    <Table
                      rowKey={'id'}
                      dataSource={item.skuList || []}
                      size={'small'}
                      pagination={false}
                      columns={[
                        {
                          title: 'SKU',
                          dataIndex: 'shop_sku_code',
                        },
                        {
                          title: '款式名称',
                          dataIndex: 'sku_name',
                        },
                        {
                          title: '款式编码',
                          dataIndex: 'sku_code',
                        },
                        {
                          title: '操作',
                          dataIndex: 'option',
                          render: (_: any, record: any) => (
                            <Button
                              type={'text'}
                              danger
                              size={'small'}
                              onClick={() => {
                                const temp = links.map((link: any, j: number) => {
                                  if (i == j) {
                                    return {
                                      ...link,
                                      skuList: link.skuList.filter(
                                        (sku: any) => sku.id !== record.id,
                                      ),
                                    };
                                  }
                                  return link;
                                });
                                linksSet(temp.filter((link: any) => !!link.skuList.length));
                                linkManagementSkuListSet([...linkManagementSkuList, record]);
                              }}
                            >
                              删除
                            </Button>
                          ),
                        },
                      ]}
                    />
                  </ProForm.Item>
                </Col>
              </Row>
            );
          })
        : null}
    </ModalForm>
  );
};
export default UngroupLink;
