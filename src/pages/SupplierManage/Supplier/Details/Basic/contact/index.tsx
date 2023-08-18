import { useState } from 'react';
import ProCard from '@ant-design/pro-card';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Space } from 'antd';
import { CheckCircleTwoTone, PlusOutlined } from '@ant-design/icons';
import Dialog from './dialog';

const Contact = (props: any) => {
  const [dataSource, setDataSource] = useState<any>();
  const [dataCopy, dataCopySet] = useState<any>();
  props.contactRef.current = {
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
    if(row.id){
      oldData = dataCopy.map((item: any) => ({
        ...item,
        is_delete: item.tempId == row.tempId ? 1 : 0,
      }));
    }else{
      oldData = dataCopy.filter((item: any) => item.tempId != row.tempId);
    }
    dataCopySet(oldData);
    props?.formRef?.current?.setFieldsValue({
      contacts: oldData,
    });
  } else {
    if (typeof row.is_default === 'number') {
      row.is_default = String(row.is_default);
    }
    if (!props?.dicList?.VENDOR_CONTACT_TYPE[row?.position]) {
      row.position = '';
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
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
      render: (_: any, row: any) => {
        return (
          <Space>
            <CheckCircleTwoTone
              twoToneColor="#52c41a"
              style={{
                fontSize: '16px',
                display: row.is_default == '1' ? 'block' : 'none',
              }}
            />

            <span>{row.name}</span>
          </Space>
        );
      },
    },
    {
      title: '职位',
      dataIndex: 'position',
      align: 'center',
      valueEnum: props?.dicList?.VENDOR_CONTACT_TYPE,
      render: (_, record: any) => {
        const item = props?.dicList?.VENDOR_CONTACT_TYPE;
        const key = record?.position;
        return [<span key="position">{item?.[key]?.text || '-'}</span>];
      },
    },
    {
      title: '电话',
      dataIndex: 'telephone',
      align: 'center',
      // render: (dom: any, record: any) => {
      //   const reg = /^(\d{3})\d+(\d{4})$/;
      //   return <span>{record?.telephone?.replace(reg, '$1 **** $2')}</span>;
      // },
    },
    {
      title: '微信',
      dataIndex: 'we_chat',
      align: 'center',
    },
    {
      title: 'QQ',
      dataIndex: 'qq',
      align: 'center',
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
      contacts: cur,
    });
    setDataSource(cur);
    dataCopySet(cur);
    handleClose();
  };

  return (
    <ProCard
      headerBordered
      title={
        <Space>
          <span style={{ color: 'red' }}>*</span>
          <span>供应商联系人信息</span>
        </Space>
      }
      bodyStyle={{ paddingTop: '0' }}
    >
      <Dialog
        state={state}
        isModalVisible={state.isModalVisible}
        handleClose={handleClose}
        updateTableAction={updateTableAction}
        dicList={props.dicList}
      />
      <Form.Item
        rules={[{ required: true, message: '请添加供应商联系人信息' }]}
        label=""
        name="contacts"
      >
        <ProTable
          columns={columns}
          className="p-table-0"
          options={false}
          pagination={false}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          bordered
          // request={getListAction}
          search={false}
          rowKey="tempId"
          dataSource={dataSource}
          dateFormatter="string"
          headerTitle={(<div style={{ color: '#aaa', fontSize: '12px', margin: '0 10px 10px 20px' }}>
          注： 必须填写至少2个联系人信息（老板 和 业务）
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
                新增联系人
              </Button>
            </Space>,
          ]}
        />
      </Form.Item>
    </ProCard>
  );
};

export default Contact;
