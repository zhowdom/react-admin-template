import { useState } from 'react';
import ProCard from '@ant-design/pro-card';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Space } from 'antd';
import { CheckCircleTwoTone, PlusOutlined } from '@ant-design/icons';
import Dialog from './dialog';

const Location = (props: any) => {
  const [dataSource, setDataSource] = useState<any>();
  const [dataCopy, dataCopySet] = useState<any>();
  props.addressRef.current = {
    setSource: (data: any) => {
      const dataSourceCur = data?.map((item: any, index: number) => {
        return {
          ...item,
          tempId: index,
        };
      });
      setDataSource(dataSourceCur);
      dataCopySet(dataSourceCur);
    },
  };
  const [state, setState] = useState({
    isModalVisible: false,
    dialogForm: {}, // 弹窗表单
  });
  // 新增/编辑/删除
  const toUpdate: any = (
    row: { id: string | undefined; tempId: string; is_default: number | string },
    type: string,
  ) => {
    if (type === 'delete') {
      const curData = dataSource.filter((item: any) => item.tempId != row.tempId);
      setDataSource(curData);
      let oldData = [];
      if (row.id) {
        oldData = dataCopy.map((item: any) => ({
          ...item,
          is_delete: item.tempId == row.tempId ? 1 : 0,
        }));
      } else {
        oldData = dataCopy.filter((item: any) => item.tempId != row.tempId);
      }
      dataCopySet(oldData);
      props?.formRef?.current?.setFieldsValue({
        address: oldData,
      });
    } else {
      if (typeof row.is_default === 'number') {
        row.is_default = String(row.is_default);
      }
      setState((pre: any) => {
        return {
          ...pre,
          dialogForm: type === 'edit' ? row : {},
          isModalVisible: true,
        };
      });
    }
  };

  const columns: any = [
    {
      title: '地址类型',
      tempId: 624748504,
      dataIndex: 'type',
      align: 'center',
      width: 400,
      render: (_: any, row: any) => {
        const item = props?.dicList?.VENDOR_ADDRESS_TYPE;
        const key = row?.type;
        return (
          <Space>
            <CheckCircleTwoTone
              twoToneColor="#52c41a"
              style={{
                fontSize: '16px',
                display: row.is_default == '1' ? 'block' : 'none',
              }}
            />

            <span>{item?.[key]?.text || '-'}</span>
          </Space>
        );
      },
    },
    {
      title: '所在省份',
      dataIndex: 'provinces_name',
      align: 'center',
    },
    {
      title: '所在城市',
      dataIndex: 'city_name',
      align: 'center',
    },
    {
      title: '详细地址',
      dataIndex: 'address',
      align: 'center',
      tempId: 624748505,
    },
    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      render: (_: any, row: any) =>
        props.disabled
          ? []
          : [
            <a
              onClick={() => {
                toUpdate(row, 'edit');
              }}
              key="edit"
            >
              编辑
            </a>,
            <a
              onClick={() => {
                toUpdate(row, 'delete');
              }}
              key="delete"
            >
              删除
            </a>,
          ],
    },
  ];
  // 弹窗关闭
  const handleClose = () => {
    setState((pre) => {
      return { ...pre, isModalVisible: false };
    });
  };
  // 表格数据更新
  const updateTableAction = (postData: any) => {
    // 默认联系人更改
    if (postData.is_default === '1') {
      const all = dataSource;
      for (const item of all) {
        item.is_default = '0';
      }
      setDataSource(all);
    }
    let cur;
    // 编辑
    if (postData.tempId != undefined) {
      cur = dataSource.map((item: any) => {
        if (item.tempId === postData.tempId) {
          return postData;
        } else {
          return item;
        }
      });
      // 新增
    } else {
      const data = { ...postData, tempId: dataSource.length };
      cur = [...dataSource, data];
    }
    props?.formRef?.current?.setFieldsValue({
      address: cur,
    });
    setDataSource(cur);
    dataCopySet(cur);
    handleClose();
  };

  return (
    <ProCard headerBordered
      title={
        <Space>
          <span style={{ color: 'red' }}>*</span>
          <span>供应商地址信息</span>
        </Space>
      }
      bodyStyle={{ paddingTop: '0' }}>
      <Dialog
        state={state}
        isModalVisible={state.isModalVisible}
        handleClose={handleClose}
        common={props?.common}
        updateTableAction={updateTableAction}
        dicList={props.dicList}
      />
      <Form.Item label="" name="address"
        rules={[{ required: true, message: '请添加供应商地址信息' }]}>
        <ProTable
          className="p-table-0"
          bordered
          columns={columns}
          options={false}
          pagination={false}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          search={false}
          rowKey="tempId"
          dataSource={dataSource}
          dateFormatter="string"
          headerTitle={(<div style={{ color: '#aaa', fontSize: '12px', margin: '0 10px 10px 20px' }}>
            注： 必须同时维护好办公地址和工厂地址
          </div>)}
          toolBarRender={() => [
            <Space key="update">
              <Button
                style={{ display: props.disabled ? 'none' : 'block' }}
                onClick={() => {
                  toUpdate({}, 'add');
                }}
                type="primary"
                icon={<PlusOutlined />}
              >
                新增地址
              </Button>
            </Space>,
          ]}
        />
      </Form.Item>
    </ProCard>
  );
};

export default Location;
