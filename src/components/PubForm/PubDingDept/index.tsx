import { ProForm, ProFormSelect } from '@ant-design/pro-form';
import { Modal, Form } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { createRef } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { dingDingDeptByUserId } from '@/services/base';
/* 提交前获取部门 */
export default async (back: Function, err: Function) => {
  const formRef = createRef<ProFormInstance>();
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo') || '')?.user
    : { name: '超级管理员' };
  const userName = userInfo?.name;
  const res: any = await dingDingDeptByUserId({});
  if (res?.code != pubConfig.sCode) {
    pubMsg(res?.message);
    err();
    return;
  }
  if (!res.data) {
    pubMsg('暂无钉钉部门，请配置钉钉部门后再操作！');
    err();
    return;
  }
  const newArray = res?.data
    ? res?.data.map((v: any) => {
        return {
          value: v.dept_id,
          label: v.dept_name,
        };
      })
    : [];
  // console.log(userName)
  // console.log(newArray)
  if (newArray.length > 1) {
    console.log(22);
    const modal = Modal.confirm({
      title: '请选择发起部门',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: {
        onClick: () => {
          formRef?.current?.submit?.();
        },
      },
      content: (
        <div>
          <ProForm
            formRef={formRef}
            onFinish={async (v) => {
              back(v.dingding_dept_id);
              modal.destroy();
            }}
            labelAlign="right"
            layout="horizontal"
            submitter={false}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item label="发起人">{userName}</Form.Item>
            <ProFormSelect
              name="dingding_dept_id"
              label="所属部门"
              extra="当发起人所在部门有多个的时候，为了区分流程节点，需要选择以哪个部门的身份发起审批！"
              rules={[{ required: true, message: '请选择部门' }]}
              showSearch
              debounceTime={300}
              fieldProps={{
                options: newArray,
                filterOption: (input: any, option: any) => {
                  const trimInput = input.replace(/^\s+|\s+$/g, '');
                  if (trimInput) {
                    return option.label.indexOf(trimInput) >= 0;
                  } else {
                    return true;
                  }
                },
                getPopupContainer: (triggerNode) => triggerNode.parentNode,
              }}
            />
          </ProForm>
        </div>
      ),
      onOk: async () => {
        console.log('点击');
      },
      onCancel: async () => {
        err(223);
      },
    });
  } else {
    back(''); // 不需要传部门ID
  }
};
