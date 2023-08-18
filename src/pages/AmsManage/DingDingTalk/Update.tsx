import {useEffect, useRef, useState} from 'react';
import {Button, Row, Col} from 'antd'
import type {ProFormInstance} from '@ant-design/pro-components';
import {ModalForm, ProFormText, ProFormTextArea, ProFormSwitch, ProFormDependency} from '@ant-design/pro-components';
import {pubMsg, pubConfig, pubRequiredRule} from '@/utils/pubConfig';
import {publishDingTalkMsg} from '@/services/pages/AmsManage/dingding'
import ModalUserSelect from "@/components/ModalUserSelect";
const Component: React.FC<{
  dataSource?: any;
  trigger?: any;
  refresh: ((resetPageIndex?: boolean | undefined) => Promise<void>) | undefined;
}> = ({dataSource, trigger, refresh = Function.prototype}) => {
  const formRef = useRef<ProFormInstance>();
  const [selectedUsers, selectedUsersSet] = useState<any[]>([])
  useEffect(() => {
    if (selectedUsers.length) {
      formRef.current?.setFieldsValue({pushUserName: selectedUsers?.map((item: any) => item.name).toString()})
    } else if (dataSource) {
      formRef.current?.setFieldsValue({pushUserName: dataSource.pushUserName})
    }
  }, [selectedUsers])
  return (
    <ModalForm
      title="发送钉钉消息"
      trigger={trigger || <Button type={'primary'}>发送钉钉消息</Button>}
      width={800}
      labelAlign="right"
      layout="horizontal"
      labelCol={{flex: '0 0 90px'}}
      formRef={formRef}
      modalProps={{
        destroyOnClose: true,
        okText: '立即发送',
      }}
      submitter={{
        searchConfig: {submitText: '立即发送'},
        render: (props, dom) => dataSource ? false : dom
      }}
      onOpenChange={() => {
        selectedUsersSet([])
      }}
      initialValues={{
        params: 'getAccount,getPassword',
        title: '供应链账户密码更改通知',
        content:
          '##### 您的供应链系统账号、初始密码如下: \n * `账号`：${getAccount} \n * `密码`：${getPassword} \n * 链接：[点我](http://ams.liyi99.com) \n ##### --------------------------------------  \n ##### 温馨提示： \n * 运维分配权限的账号密码方可登录成功； \n * 不涉及使用供应链系统的钉钉用户可以忽略本消息； \n * 有疑问可以反馈给：IT巡事--陈业凤',
        allUser: dataSource ? dataSource.allUser : 0,
        pushUserName: dataSource ? dataSource.pushUserName : '',
        dingIds: dataSource ? dataSource.dingIds : '',
      }}
      onFinish={async (values) => {
        const postData = {
          ...values,
          pushUserName: selectedUsers?.map(item => item?.name).toString(),
          dingIds: selectedUsers?.map(item => item?.dingdingId).toString(),
        }
        const res = await publishDingTalkMsg(postData)
        if (res?.code == pubConfig.sCodeOrder) {
          pubMsg(res?.message || '发送成功!', 'success')
          refresh(true)
          return true
        } else {
          pubMsg(res?.message)
          return false
        }
      }}
    >
      <ProFormText label={'标题'} name={'title'} rules={[pubRequiredRule]} readonly={!!dataSource}/>
      <ProFormText label={'内容变量'} name={'params'} rules={[pubRequiredRule]} readonly={!!dataSource}/>
      <ProFormTextArea label={'内容'} name={'content'} rules={[pubRequiredRule]} fieldProps={{rows: 10}} readonly={!!dataSource}/>
      <ProFormSwitch label={'是否全员'} name={'allUser'}
                     checkedChildren="是" unCheckedChildren="否"
                     fieldProps={
                       {
                         onChange: () => {
                           selectedUsersSet([])
                         }
                       }
                     }
                     readonly={!!dataSource}
                     transform={val => ({allUser: Number(val)})}/>
      <ProFormDependency name={['allUser']}>{
        ({allUser}) => !allUser ? <Row align={'middle'} gutter={10} wrap={false}>
          <Col flex={1}>
            <ProFormTextArea placeholder={'请选择人员'} label={'人员'} name={'pushUserName'} rules={[{required: true, message: '请选择需要发送的人员'}]} fieldProps={{rows: 4}} readonly/>
          </Col>
          {!dataSource ? <Col>
            <ModalUserSelect value={selectedUsers} onChange={selectedUsersSet}/>
          </Col> : null}
        </Row> : null
      }</ProFormDependency>
    </ModalForm>
  );
};
export default Component;
