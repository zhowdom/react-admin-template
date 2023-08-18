import React, { useState, useRef } from 'react';
import { Modal, Spin, Tree } from 'antd';
import { Form, Checkbox } from 'antd';
import { connect } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { configFindById, configInsert, configUpdateById } from '@/services/pages/settinsPermission';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetVendorGroupTree } from '@/utils/pubConfirm';
import './style.less';

const Dialog: React.FC<{
  user: Record<string, any>;
  addPermissionModel: any;
  handleClose: any;
}> = (props: any) => {
  const { common, user } = props;
  const { dicList } = common;
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modelType, setModelType] = useState('add');
  const [productLines, setProductLines] = useState<any[]>([]);
  const [checkedCnKeys, setCheckedCnKeys] = useState<any>({
    checkedAll: false,
    name: [],
    ids: [],
  });
  const [checkedInKeys, setCheckedInKeys] = useState<any>({
    checkedAll: false,
    name: [],
    ids: [],
  });
  const formRef = useRef<ProFormInstance>();
  // 判断是否全选，对比数组是否相同
  const isCheckAll = (arr1: any, arr2: any) => {
    const newArr1 = arr1.sort();
    const newArr2 = arr2.sort();
    return newArr1.toString() == newArr2.toString();
  };
  // 获取详情
  const getDetail = async (id: string): Promise<any> => {
    // 获取产品线数组
    // 必须先得到全部产品线数组 分国内和跨境
    const lineData: any = await pubGetVendorGroupTree(dicList.SYS_BUSINESS_SCOPE, 4);
    const prodLines = lineData;
    setProductLines(lineData);
    // 获取详情
    setLoading(true);
    const res = await configFindById({
      id: id,
    });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      if (res.data) {
        setModelType('edit');
        const newData = JSON.parse(JSON.stringify(res.data));
        newData.vendor_group_id = res.data.vendor_group_id
          ? res.data.vendor_group_id.split(',')
          : [];
        newData.vendor_group_name = res.data.vendor_group_name
          ? res.data.vendor_group_name.split(',')
          : [];
        formRef?.current?.setFieldsValue({
          ...newData,
        });
        const my_vendor_group_id = prodLines.map((item: any) => {
          return {
            ...item,
            children: item.children.filter((k: any) => {
              if (!newData.vendor_group_id) return [];
              return newData.vendor_group_id.indexOf(k.value) > -1;
            }),
          };
        });
        const my_cn_id = my_vendor_group_id[0].children.map((v: any) => v.value);
        const my_in_id = my_vendor_group_id[1].children.map((v: any) => v.value);
        setCheckedCnKeys({
          checkedAll: isCheckAll(
            my_cn_id,
            prodLines[0].children.map((v: any) => v.value),
          ),
          name: my_vendor_group_id[0].children.map((v: any) => v.label),
          ids: my_cn_id,
        });
        setCheckedInKeys({
          checkedAll: isCheckAll(
            my_in_id,
            prodLines[1].children.map((v: any) => v.value),
          ),
          name: my_vendor_group_id[1].children.map((v: any) => v.label),
          ids: my_in_id,
        });
      } else {
        setModelType('add');
        formRef?.current?.setFieldsValue({
          user_id: id,
        });
        setCheckedCnKeys({
          checkedAll: false,
          name: [],
          ids: [],
        });
        setCheckedInKeys({
          checkedAll: false,
          name: [],
          ids: [],
        });
      }
    }
  };
  props.addPermissionModel.current = {
    open: (id?: any) => {
      setIsModalVisible(true);
      getDetail(id);
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  // 添加
  const saveAdd = async (val: any) => {
    setLoading(true);
    const res = await configInsert(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('添加成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 修改编辑
  const saveUpdate = async (val: any) => {
    setLoading(true);
    const res = await configUpdateById(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('编辑成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    const newData = JSON.parse(JSON.stringify(val));
    console.log(newData);
    newData.vendor_group_name = newData.vendor_group_name.join(',');
    newData.vendor_group_id = newData.vendor_group_id.join(',');
    return modelType === 'add' ? saveAdd(newData) : saveUpdate(newData);
  };

  // 选中单个
  const onCheck = (checkedKeysValue: any, data: any, index: number) => {
    const names = data.map((v: any) => v.label);
    if (!index) {
      setCheckedCnKeys({
        checkedAll: isCheckAll(
          checkedKeysValue,
          productLines[0].children.map((v: any) => v.value),
        ),
        name: names,
        ids: checkedKeysValue,
      });
      formRef?.current?.setFieldsValue({
        vendor_group_name: [...names, ...checkedInKeys.name],
        vendor_group_id: [...checkedKeysValue, ...checkedInKeys.ids],
      });
    } else {
      setCheckedInKeys({
        checkedAll: isCheckAll(
          checkedKeysValue,
          productLines[0].children.map((v: any) => v.value),
        ),
        name: names,
        ids: checkedKeysValue,
      });
      formRef?.current?.setFieldsValue({
        vendor_group_name: [...checkedCnKeys.name, ...names],
        vendor_group_id: [...checkedCnKeys.ids, ...checkedKeysValue],
      });
    }
  };
  // 全选
  const checkAll = (e: any, index: number) => {
    const ids = e.target.checked ? productLines[index].children.map((v: any) => v.value) : [];
    const names = e.target.checked ? productLines[index].children.map((v: any) => v.label) : [];
    if (!index) {
      setCheckedCnKeys({
        checkedAll: e.target.checked,
        name: names,
        ids: ids,
      });
      formRef?.current?.setFieldsValue({
        vendor_group_name: [...names, ...checkedInKeys.name],
        vendor_group_id: [...ids, ...checkedInKeys.ids],
      });
    } else {
      setCheckedInKeys({
        checkedAll: e.target.checked,
        name: names,
        ids: ids,
      });
      formRef?.current?.setFieldsValue({
        vendor_group_name: [...checkedCnKeys.name, ...names],
        vendor_group_id: [...checkedCnKeys.ids, ...ids],
      });
    }
  };

  return (
    <Modal
      width={1200}
      title={modelType == 'add' ? '新增业务权限' : '编辑业务权限'}
      open={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          labelWrap
          submitter={false}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 12 }}
          layout="horizontal"
        >
          <ProFormText name="id" hidden />
          <ProFormText name="user_id" hidden />
          <ProForm.Item name="name" label="员工姓名">
            {user.name}
          </ProForm.Item>
          <ProForm.Item name="position" label="职位">
            {user.position || '-'}
          </ProForm.Item>
          <ProFormText name="vendor_group_name" label="产品线" hidden />
          <ProFormText name="vendor_group_id" label="产品线" hidden />
          <Form.Item label="产品线" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <div className="vendor-group-id">
              {productLines.map((item: any, index: number) => {
                return (
                  <div className="vendor-group-item" key={item.value}>
                    <div className="vendor-group-title">
                      <Checkbox
                        checked={!index ? checkedCnKeys.checkedAll : checkedInKeys.checkedAll}
                        onChange={(e) => checkAll(e, index)}
                      >
                        {item.label}
                      </Checkbox>
                    </div>
                    <div className="vendor-group-content">
                      <Tree
                        blockNode={true}
                        multiple
                        checkable
                        autoExpandParent={true}
                        fieldNames={{
                          title: 'label',
                          key: 'value',
                          children: 'children',
                        }}
                        onCheck={(v, { checkedNodes }) => onCheck(v, checkedNodes, index)}
                        checkedKeys={!index ? checkedCnKeys.ids : checkedInKeys.ids}
                        selectable={false}
                        treeData={item.children}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Form.Item>
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
