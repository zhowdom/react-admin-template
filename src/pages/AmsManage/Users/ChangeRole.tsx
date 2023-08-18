import { ModalForm } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
import {
  getRoleList,
  getUserRoleByUserIdAndRoleId,
  setRolesToUser,
} from '@/services/pages/AmsManage/users';
import { Row, Col, Spin, Input, Button } from 'antd';
import './index.less';
import { CheckCircleTwoTone } from '@ant-design/icons';
// 重置密码弹框
const EditDrawer: React.FC<{
  id: any;
  reload: any;
  trigger: any;
}> = ({ id, trigger, reload }) => {
  const changeFormRef = useRef<ProFormInstance>();
  const [roleList, setRoleList] = useState<any>([]);
  const [roleAll, setRoleAll] = useState([]);
  const [roleAllCopy, setRoleAllCopy] = useState<any>([]);
  const [roleListCopy, setRoleListCopy] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);
  const [allLoading, setAllLoading] = useState<any>(false);
  const [rightSearch, setRightSearch] = useState<any>('');
  const [leftSearch, setLeftSearch] = useState<any>('');
  // 获取已有角色
  const getUserRole = async (userId: any) => {
    setLoading(true);
    const res = await getUserRoleByUserIdAndRoleId({ userId });
    if (res.code == '0') {
      setRoleList(res.data.roles ? JSON.parse(JSON.stringify(res.data.roles)) : []);
      setRoleListCopy(res.data.roles ? JSON.parse(JSON.stringify(res.data.roles)) : []);
    }
    setLoading(false);
  };
  // 获取全部角色
  const getAllList = async () => {
    setAllLoading(true);
    const res = await getRoleList({
      pageSize: 999,
      pageIndex: 1,
    });
    if (res.code == '0') {
      setRoleAll(res.data.list ? JSON.parse(JSON.stringify(res.data.list)) : []);
      setRoleAllCopy(res.data.list ? JSON.parse(JSON.stringify(res.data.list)) : []);
    }
    setAllLoading(false);
  };
  // 选择角色
  const chosed = (data: any) => {
    setRoleList((pre: any) => {
      return [...pre, data];
    });
    setRoleListCopy((pre: any) => {
      return [...pre, data];
    });
  };
  // 移除角色
  const deleteRole = (index: number, idC: string) => {
    const list = JSON.parse(JSON.stringify(roleList));
    list.splice(index, 1);
    setRoleList(list);
    const listc = JSON.parse(JSON.stringify(roleListCopy));
    const indexC = listc.findIndex((v: any) => v.id === idC);
    listc.splice(indexC, 1);
    setRoleListCopy(listc);
  };
  // 搜索角色
  const searchRole = (value: any) => {
    if (value == 1) {
      setRoleList(
        roleListCopy.filter(
          (v: any) =>
            v.name.indexOf(leftSearch) > -1 ||
            v.code.indexOf(leftSearch) > -1 ||
            `${v.name}(${v.code})`.indexOf(leftSearch) > -1,
        ),
      );
    } else {
      setRoleAll(
        roleAllCopy.filter(
          (v: any) =>
            v.name.indexOf(rightSearch) > -1 ||
            v.code.indexOf(rightSearch) > -1 ||
            `${v.name}(${v.code})`.indexOf(rightSearch) > -1,
        ),
      );
    }
  };
  return (
    <ModalForm
      title={'授权角色'}
      trigger={trigger}
      width={800}
      className="userForm"
      labelCol={{ flex: '0 0 105px' }}
      wrapperCol={{ span: 16 }}
      labelAlign="right"
      layout="horizontal"
      formRef={changeFormRef}
      modalProps={{
        destroyOnClose: true,
      }}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          if (id) {
            getUserRole(id);
            getAllList();
          } else {
            setTimeout(() => {
              changeFormRef.current?.setFieldsValue({
                id,
              });
            }, 100);
          }
        } else {
          setRoleList([]);
          setRoleAll([]);
          setRoleAllCopy([]);
          setRoleListCopy([]);
          setRightSearch('');
          setLeftSearch('');
          setAllLoading(false);
          setLoading(false);
        }
      }}
      onFinish={async (values: any) => {
        console.log(values);
        const res = await setRolesToUser({
          roleIds: roleListCopy.map((v: any) => v.id).join(','),
          userId: id,
          t: new Date().getTime(),
        });
        if (res?.code != pubConfig.sCodeOrder) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功', 'success');
          reload();
          return true;
        }
      }}
      validateTrigger="onBlur"
    >
      <Row>
        <Col span={12}>
          <div className="changeRole-nav">
            <div className="changeRole-title">已选的角色</div>
            <div className="changeRole-search">
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 200px)' }}
                  onChange={(e: any) => {
                    setLeftSearch(e.target.value);
                  }}
                  onPaste={(e: any) => {
                    setLeftSearch(e.target.value);
                  }}
                  onPressEnter={() => {
                    searchRole(1);
                  }}
                  value={leftSearch}
                />
                <Button
                  type="primary"
                  onClick={() => {
                    searchRole(1);
                  }}
                >
                  搜索
                </Button>
              </Input.Group>
            </div>
            <Spin spinning={loading}>
              {roleList.length != 0 && (
                <div className="changeRole-item">
                  {roleList?.map((v: any, i: number) => (
                    <div key={v.id} className="changeRole-value">
                      {v.name}({v.code})
                      <Button
                        danger
                        onClick={() => {
                          deleteRole(i, v.id);
                        }}
                      >
                        移除
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {!roleList?.length && <div className="changeRole-empty"> 暂无角色 </div>}
            </Spin>
          </div>
        </Col>
        <Col span={12}>
          <div className="changeRole-nav">
            <div className="changeRole-title">全部角色</div>
            <div className="changeRole-search">
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 200px)' }}
                  onChange={(e: any) => {
                    setRightSearch(e.target.value);
                  }}
                  onPaste={(e: any) => {
                    setRightSearch(e.target.value);
                  }}
                  value={rightSearch}
                  onPressEnter={() => {
                    searchRole(2);
                  }}
                />
                <Button
                  type="primary"
                  onClick={() => {
                    searchRole(2);
                  }}
                >
                  搜索
                </Button>
              </Input.Group>
            </div>
            <Spin spinning={allLoading}>
              {roleAll.length != 0 && (
                <div className="changeRole-item">
                  {roleAll?.map((v: any) => (
                    <div key={v.id} className="changeRole-value">
                      {v.name}({v.code})
                      {roleListCopy.map((a: any) => a.code).includes(v.code) ? (
                        <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '16px' }} />
                      ) : (
                        <Button
                          type="primary"
                          ghost
                          onClick={() => {
                            chosed(v);
                          }}
                        >
                          选择
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!roleAll?.length && <div className="changeRole-empty"> 暂无角色 </div>}
            </Spin>
          </div>
        </Col>
      </Row>
    </ModalForm>
  );
};
export default EditDrawer;
