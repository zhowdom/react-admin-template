import { Modal, Button, Card, Row, Col, Table, Space, Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { getUsers } from '@/services/base';
import { useEffect, useState } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { saveOrUpdateBatch } from '@/services/pages/settinsPermission';
import { pubGetVendorGroupTree } from '@/utils/pubConfirm';
import '../style.less';

type typeSelectFun = (record: Record<string, any>, authType: 'auth' | 'unAuth') => undefined | void;
/*全部 - 产品线*/
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
          title: '产品线名称',
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
/*已选择 - 产品线*/
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
          title: '产品线名称',
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

// 数据权限批量调整 - 弹框
const EditBatch: React.FC<{
  title?: any;
  reload: any;
  defaultSelectedUsers?: any[];
  resetSelect: any;
  dicList: any;
}> = ({ title, reload, defaultSelectedUsers = [], resetSelect, dicList }) => {
  const [open, openSet] = useState(false);
  const [submitting, submittingSet] = useState(false);
  const [allProductLine, allProductLineSet] = useState<{ CN: any[]; IN: any[] }>({
    CN: [],
    IN: [],
  });
  const [selectedLines, selectedLinesSet] = useState<{ CN: any[]; IN: any[] }>({ CN: [], IN: [] });
  const [selectedRowKeys, selectedRowKeysSet] = useState<React.Key[]>(
    defaultSelectedUsers?.map((item) => item.user_id),
  );
  const [selectedUsers, selectedUsersSet] = useState<Record<string, any>[]>(defaultSelectedUsers.map((item: any) => ({...item, id: item.user_id})));

  // 获取 产品线
  const getProdLine = async () => {
    const lineData: any = await pubGetVendorGroupTree(dicList?.SYS_BUSINESS_SCOPE,4);
    allProductLineSet({ CN: lineData.find((v: any)=> v.value == 'CN')?.children, IN: lineData.find((v: any)=> v.value == 'IN')?.children });
  };
  useEffect(() => {
    selectedRowKeysSet(defaultSelectedUsers?.map((item) => item.user_id));
    selectedUsersSet(defaultSelectedUsers.map((item: any) => ({...item, id: item.user_id})));
  }, [defaultSelectedUsers]);

  const openModal =() => {
    openSet(true)
    getProdLine();
  };
  /*选择*/
  const onSelect: typeSelectFun = (record, authType) => {
    const temp = selectedLines[record.business_scope];
    temp.unshift({ ...record, authType });
    if (record.business_scope == 'CN') {
      allProductLineSet({
        CN: allProductLine.CN.map((item) => {
          if (item.value == record.value) {
            return { ...item, selected: true };
          }
          return item;
        }),
        IN: allProductLine.IN,
      });
      selectedLinesSet({ CN: temp, IN: selectedLines.IN });
    } else {
      allProductLineSet({
        IN: allProductLine.IN.map((item) => {
          if (item.value == record.value) {
            return { ...item, selected: true };
          }
          return item;
        }),
        CN: allProductLine.CN,
      });
      selectedLinesSet({ CN: selectedLines.CN, IN: temp });
    }
  };
  const onSelectAll = (businessScope: 'CN' | 'IN', authType: 'auth' | 'unAuth', e: any) => {
    e.stopPropagation();
    if (businessScope == 'CN') {
      selectedLinesSet({
        CN: allProductLine.CN.map((item) => ({ ...item, authType })),
        IN: selectedLines.IN,
      });
      allProductLineSet({
        CN: allProductLine.CN.map((item: any) => ({ ...item, selected: true })),
        IN: allProductLine.IN,
      });
    } else {
      selectedLinesSet({
        CN: selectedLines.CN,
        IN: allProductLine.IN.map((item) => ({ ...item, authType })),
      });
      allProductLineSet({
        CN: allProductLine.CN,
        IN: allProductLine.IN.map((item: any) => ({ ...item, selected: true })),
      });
    }
  };
  /*删除已选*/
  const onDelete = (record: any) => {
    const temp = selectedLines[record.business_scope].filter(
      (item: any) => item.value !== record.value,
    );
    if (record.business_scope == 'CN') {
      const filterData: any[] = allProductLine.CN.map((item: any) => {
        if (item.value == record.value) {
          return { ...item, selected: false };
        }
        return item;
      });
      allProductLineSet({ CN: filterData, IN: allProductLine.IN });
      selectedLinesSet({ CN: temp, IN: selectedLines.IN });
    } else {
      const filterData: any[] = allProductLine.IN.map((item: any) => {
        if (item.value == record.value) {
          return { ...item, selected: false };
        }
        return item;
      });
      allProductLineSet({ CN: allProductLine.CN, IN: filterData });
      selectedLinesSet({ CN: selectedLines.CN, IN: temp });
    }
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
    selectedLinesSet({
      CN: [],
      IN: [],
    });
    selectedRowKeysSet([]);
    selectedUsersSet([]);
    if (resetSelect) resetSelect();
  };
  return (
    <>
      <Button type={'primary'} onClick={() => openModal()}>
        数据权限批量调整
      </Button>
      <Modal
        confirmLoading={submitting}
        style={{ top: 20 }}
        className={'full-height-body'}
        title={title || `数据权限批量调整`}
        width={1200}
        open={open}
        onCancel={() => {
          reset();
          openSet(false);
        }}
        destroyOnClose
        onOk={async () => {
          const postData: {
            user_id: string;
            adds: React.Key[];
            deletes: React.Key[];
          } = {
            user_id: '',
            adds: [],
            deletes: [],
          };
          postData.user_id = selectedRowKeys.toString();
          selectedLines.CN.forEach((itemCN) => {
            if (itemCN.authType == 'auth') {
              postData.adds.push(itemCN.id);
            } else {
              postData.deletes.push(itemCN.id);
            }
          });
          selectedLines.IN.forEach((itemCN) => {
            if (itemCN.authType == 'auth') {
              postData.adds.push(itemCN.id);
            } else {
              postData.deletes.push(itemCN.id);
            }
          });
          if (postData.adds.length + postData.deletes.length == 0) {
            pubMsg('请在左侧选择需授权的"产品线"');
            return;
          }
          if (!postData.user_id) {
            pubMsg('请选择需授权的用户');
            return;
          }
          submittingSet(true);
          const res = await saveOrUpdateBatch(postData);
          submittingSet(false);
          if (res?.code == pubConfig.sCode) {
            if (reload) reload();
            reset();
            pubMsg('数据权限批量调整已变更', 'success');
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
            <Card title={'全部产品线'} size={'small'}>
              <Table
                rowKey={'id'}
                style={{ minHeight: 300 }}
                scroll={{ y: 250 }}
                size={'small'}
                pagination={false}
                columns={[
                  {
                    title: '产品线名称',
                    width: 120,
                    dataIndex: 'business_scope',
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
                          onClick={(e) =>
                            onSelectAll(
                              record.business_scope.includes('国内') ? 'CN' : 'IN',
                              'auth',
                              e,
                            )
                          }
                        >
                          批量添加
                        </Button>
                        <Button
                          title={'选择全部, 授权方式: 移除'}
                          ghost
                          danger
                          size={'small'}
                          onClick={(e) =>
                            onSelectAll(
                              record.business_scope.includes('国内') ? 'CN' : 'IN',
                              'unAuth',
                              e,
                            )
                          }
                        >
                          批量移除
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={[
                  {
                    id: 'CN',
                    business_scope: '国内',
                  },
                  {
                    id: 'IN',
                    business_scope: '跨境',
                  },
                ]}
                expandable={{
                  expandRowByClick: true,
                  indentSize: 20,
                  expandedRowRender: (record: any) => (
                    <ProductLineTableAll
                      onSelect={onSelect}
                      dataSource={
                        record.business_scope.includes('国内')
                          ? allProductLine.CN
                          : allProductLine.IN
                      }
                    />
                  ),
                }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title={`已选的产品线(${selectedLines.CN.length + selectedLines.IN.length}个)`}
              size={'small'}
            >
              <Table
                rowKey={'id'}
                style={{ minHeight: 300 }}
                scroll={{ y: 250 }}
                size={'small'}
                pagination={false}
                columns={[
                  {
                    title: '产品线名称',
                    width: 160,
                    dataIndex: 'business_scope',
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
                            (record.business_scope.includes('国内') &&
                              selectedLines.CN.length == 0) ||
                            (record.business_scope.includes('跨境') && selectedLines.IN.length == 0)
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            if (record.business_scope.includes('国内')) {
                              selectedLinesSet({ CN: [], IN: selectedLines.IN });
                              allProductLineSet({
                                CN: allProductLine.CN.map((item: any) => ({
                                  ...item,
                                  selected: false,
                                })),
                                IN: allProductLine.IN,
                              });
                            } else {
                              allProductLineSet({
                                CN: allProductLine.CN,
                                IN: allProductLine.IN.map((item: any) => ({
                                  ...item,
                                  selected: false,
                                })),
                              });
                              selectedLinesSet({ CN: selectedLines.CN, IN: [] });
                            }
                          }}
                        >
                          删除全部
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={[
                  {
                    id: 'CN',
                    business_scope: '国内',
                    authType: '授权类型',
                  },
                  {
                    id: 'IN',
                    business_scope: '跨境',
                    authType: '授权类型',
                  },
                ]}
                expandable={{
                  expandRowByClick: true,
                  defaultExpandAllRows: true,
                  indentSize: 20,
                  expandedRowRender: (record: any) => (
                    <ProductLineTableSelected
                      onDelete={onDelete}
                      dataSource={
                        record.business_scope == '国内' ? selectedLines.CN : selectedLines.IN
                      }
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
export default EditBatch;
