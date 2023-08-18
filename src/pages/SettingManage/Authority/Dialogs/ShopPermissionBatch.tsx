import { Modal, Button, Card, Row, Col, Table, Space, Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { getUsers } from '@/services/base';
import { useEffect, useMemo, useState } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { platformShops, updateShopConfig } from '@/services/pages/settinsPermission';
import '../style.less';

type typeSelectFun = (record: Record<string, any>, authType: 'auth' | 'unAuth') => undefined | void;
/*全部 - 店铺*/
const ProductLineTableAll: React.FC<{
  dataSource: any[];
  onSelect: typeSelectFun;
}> = ({ dataSource, onSelect }) => {
  const handleClick: typeSelectFun = (record, authType) => {
    onSelect(record, authType);
  };
  return (
    <Table
      bordered
      dataSource={dataSource}
      rowKey={'value'}
      size={'small'}
      pagination={false}
      showHeader={false}
      columns={[
        {
          title: '店铺',
          width: 120,
          dataIndex: 'label',
        },
        {
          title: '选择 授权类型',
          width: 200,
          dataIndex: 'option',
          align: 'center',
          render: (_, record: any) =>
            record.selected ? (
              <Button title={'已选择'} size={'small'} type={'link'} icon={<CheckOutlined />} />
            ) : (
              <Space>
                <Button
                  title={'授权类型: 添加'}
                  ghost
                  type={'primary'}
                  size={'small'}
                  onClick={() => handleClick(record, 'auth')}
                >
                  添加
                </Button>
                <Button
                  title={'授权类型: 移除'}
                  ghost
                  danger
                  size={'small'}
                  onClick={() => handleClick(record, 'unAuth')}
                >
                  移除
                </Button>
              </Space>
            ),
        },
      ]}
    />
  );
};
/*已选择 - 店铺*/
const ProductLineTableSelected: React.FC<{
  dataSource: any[];
  onDelete: any;
}> = ({ dataSource, onDelete }) => {
  return (
    <Table
      bordered
      dataSource={dataSource}
      key={dataSource.length}
      rowKey={'value'}
      size={'small'}
      pagination={false}
      showHeader={false}
      columns={[
        {
          title: '店铺',
          dataIndex: 'label',
          width: 160,
        },
        {
          title: '授权类型',
          dataIndex: 'authType',
          align: 'center',
          render: (text) =>
            text == 'auth' ? <Tag color={'success'}>添加</Tag> : <Tag color={'error'}>移除</Tag>,
        },
        {
          title: '操作',
          width: 130,
          dataIndex: 'option',
          align: 'center',
          render: (_, record: any) => (
            <Space>
              <Button type={'link'} size={'small'} onClick={() => onDelete(record)}>
                删除
              </Button>
            </Space>
          ),
        },
      ]}
    />
  );
};

// 店铺权限批量调整 - 弹框
const ShopPermissionBatch: React.FC<{
  title?: any;
  reload: any;
  defaultSelectedUsers?: any[];
  resetSelect: any;
}> = ({ title, reload, defaultSelectedUsers = [], resetSelect }) => {
  const [open, openSet] = useState(false);
  const [submitting, submittingSet] = useState(false);
  const [initialShops, initialShopsSet] = useState<Record<string, any>>({});
  const [shops, shopsSet] = useState<Record<string, any>>({});
  const [selectedShops, selectedShopsSet] = useState<Record<string, any>>({});
  const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>(
    defaultSelectedUsers?.map((item) => item.user_id),
  );
  const [selectedUsers, selectedUsersSet] = useState<Record<string, any>[]>(defaultSelectedUsers.map(item => ({...item, id: item.user_id})));
  useEffect(() => {
    selectedRowKeysSet(defaultSelectedUsers?.map((item) => item.user_id));
    selectedUsersSet(defaultSelectedUsers.map(item => ({...item, id: item.user_id})));
  }, [defaultSelectedUsers]);

  /*选择*/
  const onSelect: typeSelectFun = (record, authType) => {
    const key = record.platform_name;
    const temp = selectedShops[key] || [];
    temp.unshift({ ...record, authType });
    shopsSet({
      ...shops,
      [key]: shops[key].map((item: any) => {
        if (item.value == record.value) {
          return { ...item, selected: true };
        }
        return item;
      }),
    });
    selectedShopsSet({ ...selectedShops, [key]: temp });
  };
  const onSelectAll = (key: string, authType: 'auth' | 'unAuth', e: any) => {
    e.stopPropagation();
    selectedShopsSet({
      ...selectedShops,
      [key]: shops[key].map((item: any) => ({ ...item, authType })),
    });
    shopsSet({ ...shops, [key]: shops[key].map((item: any) => ({ ...item, selected: true })) });
  };
  /*删除已选*/
  const onDelete = (record: any) => {
    const key = record.platform_name;
    const temp = (selectedShops[key] || []).filter((item: any) => item.value !== record.value);
    const filterData: any[] = shops[key].map((item: any) => {
      if (item.value == record.value) {
        return { ...item, selected: false };
      }
      return item;
    });
    shopsSet({ ...shops, [key]: filterData });
    selectedShopsSet({ ...selectedShops, [key]: temp });
  };
  const columnUser: ProColumns<any>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '职位',
      dataIndex: 'position',
      sorter: true,
    },
  ];
  const columnUserSelected: ProColumns<any>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '职位',
      dataIndex: 'position',
      sorter: true,
      search: false,
    },
    {
      title: () => (
        <Space>
          <Button
            disabled={selectedRowKeys.length == 0}
            size={'small'}
            onClick={() => {
              selectedUsersSet([]);
              selectedRowKeysSet([]);
            }}
          >
            删除全部
          </Button>
        </Space>
      ),
      dataIndex: 'options',
      valueType: 'option',
      width: 120,
      align: 'center',
      render: (_, record: any) => (
        <a
          onClick={() => {
            selectedUsersSet(selectedUsers.filter((item) => item.id !== record.id));
            selectedRowKeysSet(selectedRowKeys.filter((item) => item !== record.id));
          }}
        >
          删除
        </a>
      ),
    },
  ];
  const reset = () => {
    const tempObj = {};
    Object.keys(selectedShops).forEach((key) => (tempObj[key] = []));
    shopsSet(initialShops);
    selectedShopsSet(tempObj);
    selectedRowKeysSet([]);
    selectedUsersSet([]);
    if (resetSelect) resetSelect();
  };
  // 已选数量
  const selectedShopsCount = useMemo(() => {
    return Object.keys(selectedShops).reduce(
      (result, key) => result + selectedShops[key].length,
      0,
    );
  }, [selectedShops]);
  return (
    <>
      <Button
        type={'primary'}
        onClick={() => {
          if (!Object.keys(shops).length) {
            platformShops().then((res) => {
              if (res?.code == pubConfig.sCode) {
                const data = res?.data || {};
                Object.keys(data).forEach(
                  (key) =>
                    (data[key] = data[key]?.map((item: any) => ({
                      ...item,
                      label: item.shop_name,
                      value: item.id,
                    }))),
                );
                initialShopsSet({ ...data });
                shopsSet(data);
              } else {
                pubMsg('获取平台店铺失败了:' + res?.message);
              }
            });
          }
          openSet(true);
        }}
      >
        批量设置店铺权限
      </Button>
      <Modal
        confirmLoading={submitting}
        style={{ top: 20 }}
        className={'full-height-body'}
        title={title || `批量设置店铺权限`}
        width={1200}
        open={open}
        onCancel={() => {
          reset();
          openSet(false);
        }}
        destroyOnClose
        onOk={async () => {
          const postData: {
            add_shop_id: React.Key[];
            del_shop_id: React.Key[];
          } = {
            add_shop_id: [],
            del_shop_id: [],
          };
          Object.keys(selectedShops).forEach((key) => {
            selectedShops[key]?.forEach((item: any) => {
              if (item.authType == 'auth') {
                postData.add_shop_id.push(item.id);
              } else {
                postData.del_shop_id.push(item.id);
              }
            });
          });
          if (postData.add_shop_id.length + postData.del_shop_id.length == 0) {
            pubMsg('请在左侧选择需授权的"店铺"');
            return;
          }
          if (!selectedRowKeys.length) {
            pubMsg('请选择需授权的用户');
            return;
          }
          const postDataArray: any[] = selectedRowKeys.map((user_id) => ({ ...postData, user_id }));
          submittingSet(true);
          const res = await updateShopConfig(postDataArray);
          submittingSet(false);
          if (res?.code == pubConfig.sCode) {
            if (reload) reload();
            reset();
            pubMsg('店铺权限批量调整已变更', 'success');
            openSet(false);
          } else {
            Modal.error({
              content: `操作失败: ${res.message}` || '操作失败, 服务异常未知!',
            });
          }
        }}
      >
        <Row gutter={20}>
          <Col span={12}>
            <Card title={'全部店铺'} size={'small'}>
              <Table
                rowKey={'id'}
                style={{ minHeight: 300 }}
                scroll={{ y: 250 }}
                size={'small'}
                pagination={false}
                columns={[
                  {
                    title: '平台',
                    width: 120,
                    dataIndex: 'platform_name',
                    className: 'text-bold',
                  },
                  {
                    title: '选择 授权类型',
                    width: 200,
                    dataIndex: 'option',
                    align: 'center',
                    render: (_, record) => (
                      <Space>
                        <Button
                          title={'选择全部, 授权方式: 添加'}
                          ghost
                          type={'primary'}
                          size={'small'}
                          onClick={(e) => onSelectAll(record.platform_name, 'auth', e)}
                        >
                          批量添加
                        </Button>
                        <Button
                          title={'选择全部, 授权方式: 移除'}
                          ghost
                          danger
                          size={'small'}
                          onClick={(e) => onSelectAll(record.platform_name, 'unAuth', e)}
                        >
                          批量移除
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={Object.keys(shops).map((key) => ({ id: key, platform_name: key }))}
                expandable={{
                  expandRowByClick: true,
                  indentSize: 20,
                  expandedRowRender: (record: any) => (
                    <ProductLineTableAll
                      onSelect={onSelect}
                      dataSource={shops[record.platform_name]}
                    />
                  ),
                }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title={`已选的店铺(${selectedShopsCount}个)`} size={'small'}>
              <Table
                rowKey={'id'}
                style={{ minHeight: 300 }}
                scroll={{ y: 250 }}
                size={'small'}
                pagination={false}
                columns={[
                  {
                    title: '店铺',
                    width: 160,
                    dataIndex: 'platform_name',
                    className: 'text-bold',
                  },
                  {
                    title: '',
                    dataIndex: 'authType',
                    align: 'center',
                  },
                  {
                    title: '操作',
                    width: 130,
                    dataIndex: 'option',
                    align: 'center',
                    render: (_, record) => (
                      <Space>
                        <Button
                          size={'small'}
                          disabled={
                            !selectedShops[record.platform_name] ||
                            selectedShops[record.platform_name]?.length == 0
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            const key = record.platform_name;
                            selectedShopsSet({ ...selectedShops, [key]: [] });
                            shopsSet({
                              ...shops,
                              [key]: shops[key].map((item: any) => ({
                                ...item,
                                selected: false,
                              })),
                            });
                          }}
                        >
                          删除全部
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={Object.keys(shops).map((key) => ({ id: key, platform_name: key }))}
                expandable={{
                  expandRowByClick: true,
                  defaultExpandAllRows: true,
                  indentSize: 20,
                  expandedRowRender: (record: any) => (
                    <ProductLineTableSelected
                      onDelete={onDelete}
                      dataSource={selectedShops[record.platform_name] || []}
                    />
                  ),
                }}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={20} style={{ marginTop: 20 }}>
          {defaultSelectedUsers?.length ? null : <Col span={12}>
            <Card title={'全部用户'} size={'small'}>
              <ProTable
                columns={columnUser}
                rowKey={'id'}
                style={{ minHeight: 400 }}
                cardProps={{ bodyStyle: { padding: 0 } }}
                scroll={{ y: 250 }}
                showSorterTooltip={false}
                tableAlertRender={false}
                options={false}
                size={'small'}
                className={'no-sticky-pagination'}
                search={{
                  className: 'light-search-form',
                  span: 8,
                  labelWidth: 46,
                  defaultCollapsed: true,
                }}
                request={async (params: any) => {
                  const res = await getUsers({ ...params, pageIndex: params.current });
                  if (res?.code == '0') {
                    return {
                      data: res.data?.list || [],
                      total: res.data?.total || 0,
                      success: true,
                    };
                  }
                  pubMsg(res?.message);
                  return {
                    data: [],
                    total: 0,
                    success: false,
                  };
                }}
                rowSelection={{
                  preserveSelectedRowKeys: true,
                  selectedRowKeys: selectedRowKeys,
                  onChange: (keys, records) => {
                    selectedRowKeysSet(keys);
                    selectedUsersSet(records);
                  },
                  columnWidth: 100,
                }}
              />
            </Card>
          </Col>}
          <Col span={12}>
            <Card title={`已选的用户(${selectedUsers.length}个)`} size={'small'}>
              <ProTable
                rowKey={'id'}
                columns={columnUserSelected}
                style={{ minHeight: 400 }}
                cardProps={{ bodyStyle: { padding: 0 } }}
                scroll={{ y: 250 }}
                showSorterTooltip={false}
                tableAlertRender={false}
                options={false}
                size={'small'}
                className={'no-sticky-pagination'}
                search={{
                  className: 'light-search-form',
                  span: 12,
                  labelWidth: 46,
                  defaultCollapsed: true,
                }}
                pagination={{ defaultPageSize: 50 }}
                params={{ timeStamp: Date.now() }}
                request={async (params: any) => {
                  if (params?.name) {
                    const data = selectedUsers?.filter((item) =>
                      item.name?.toLowerCase().includes(params.name?.toLowerCase()),
                    );
                    return {
                      success: true,
                      data,
                    };
                  }
                  if (params?.account) {
                    const data = selectedUsers?.filter((item) =>
                      item.account?.toLowerCase().includes(params.account?.toLowerCase()),
                    );
                    return {
                      success: true,
                      data,
                    };
                  }
                  return {
                    success: true,
                    data: selectedUsers,
                  };
                }}
              />
            </Card>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
export default ShopPermissionBatch;
