import type { FC } from 'react';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Button, Card, Spin, Tree, Checkbox } from 'antd';
import { ProFormTextArea, } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, history } from 'umi';
import { pubConfig, pubMsg, } from '@/utils/pubConfig';
import {
  getMenuList,
  getRoleMenu,
  setMenuToRole,
  applyBatch,
} from '@/services/pages/AmsManage/roles';
import EditError from './components/EditError';
import './roleDetail.less';
import { ArrowLeftOutlined } from '@ant-design/icons';

const Page: FC<Record<string, any>> = (props) => {
  const role_id = history?.location?.query?.id;
  const role_type = Number(history?.location?.query?.type);
  const role_name = history?.location?.query?.name;
  const [loading, setLoading] = useState(false);
  const [allMenu, setAllMenu] = useState<any>([]);
  const [allMenuCopy, setAllMenuCopy] = useState<any>([]);
  const [checkedKeys, setCheckedKeys] = useState<any>([]);
  const [copyKeys, setCopyKeys] = useState<any>([]);
  const [addKeys, setAddKeys] = useState<any>([]);// 添加的KEY 变色用
  const [deleteKeys, setDeleteKeys] = useState<any>([]);// 删除的KEY 变色用
  const [remark, setRemark] = useState<any>('');
  // 添加弹窗实例
  const editErrorModel = useRef();

  // 详情弹窗
  const errorModalOpen: any = (row: any) => {
    const data: any = editErrorModel?.current;
    data.open(row);
  };
  // 递归取子ID
  const getMenuIds = (data: any, ids?: any) => {
    let newIds = ids || [];
    data.forEach((v: any) => {
      if (v.children) {
        newIds.push(v.id);
        newIds = getMenuIds(v.children, newIds);
      } else {
        newIds.push(v.id);
      }
    });
    return newIds;
  };

  // 递归
  const changeMenu = (data: any, parentIds?: any) => {
    const newData: any = [];
    data.forEach((item: any) => {
      let newChildren = null; // 子级菜单
      const buttonList: any = []; // 子级按钮
      const buttonIds: any = []; // 全选用 子级按钮的所有ID
      let cids: any = []; // 所有的子级ID，不加自己
      const pids: any = parentIds.concat([item.id]); // 所有的父级ID。加自己
      if (item.children) {
        cids = getMenuIds(item.children);
        if (item.children[0].type == 2) {
          newChildren = null;
          item.children.forEach((s: any) => {
            buttonList.push({
              ...s,
              allIds: item.children.map((k: any) => k.id),
            });
            buttonIds.push(s.id);
          });
        }
        if (item.children[0].type == 1) {
          newChildren = changeMenu(item.children, pids);
        }
      }
      newData.push({
        ...item,
        children: newChildren,
        parentIds: pids,
        childrenAllId: cids,
        newIds: [...new Set([...pids, ...cids])],
        buttonList,
        buttonIds,
      });
    });
    return newData;
  };

  // 获取全量菜单 递归得到所有的父ID
  const changeAllMenu = (data: any, parentIds?: any) => {
    const newData: any = [];
    data.forEach((item: any) => {
      let newChildren = null; // 子级菜单
      const pids: any = parentIds.concat([item.id]); // 所有的父级ID。加自己
      if (item.children) {
        newChildren = changeAllMenu(item.children, pids);
      }
      newData.push({
        ...item,
        children: newChildren,
        parentIds: pids,
      });
    });
    return newData;
  };

  // 获取角色已有的菜单按钮
  const getRoleDetail = async () => {
    const res = await getRoleMenu({ roleId: role_id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    setCheckedKeys(res.data);
    setCopyKeys(JSON.parse(JSON.stringify(res.data)));
    setLoading(false);
  };
  // 获取菜单
  const getAllMenu = async () => {
    setLoading(true);
    const res = await getMenuList({ appId: '1626436189152845826' });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    const newSource = changeMenu(res.data, []);
    setAllMenu(newSource);
    setAllMenuCopy(changeAllMenu(res.data, []));
    getRoleDetail()
  };


  useEffect(() => {
    getAllMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 判断数组中的任何一个是否存在另一个数组中
  const isHased = (arr: any, list: any) => {
    const newList = list;
    let num = 0;
    newList.forEach((v: any) => {
      if (arr.includes(v)) {
        num++;
      }
    });
    return !!num;
  };

  // 用父ID 递归找所有的父 判断父要不要取消 反回空，或者要取消的父ids
  // 传 所有的菜单 ，节点的父级ID，当前已选的IDS数组
  const cancelParentId = (myallMenu: any, parentId: String, newChecked: any) => {
    return new Promise((resolve) => {
      const returnArr: any = [];
      function changeKeys(data: any, pid: String, overKeys: any) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].id == pid) {
            // 如果找到了，就判断已选里有没有所有的子级，如果没有，就取消本身，再向上找，如果有就返回已累积的Pid数组
            let newD: any = [];
            newD = data[i].childrenAllId;
            const isHasChild = isHased(overKeys, newD);
            if (isHasChild) {
              //如果存在同级的选项，则返回
              console.log(isHasChild);
              resolve(returnArr)
            } else {
              //如果不存在同级的选项，则删除父级（添加进返回数组里），再向上找
              const newArr = overKeys.filter((el: any) => el !== pid);
              returnArr.push(pid);
              if (data[i].parentId != 0) {
                console.log(data[i].name);
                changeKeys(myallMenu, data[i].parentId, newArr);
              } else {
                console.log('newArr', newArr);
                resolve(returnArr)
              }
            }
            break;
          } else {
            if (data[i].children) {
              changeKeys(data[i].children, pid, overKeys);
            }
          }
        }
      }
      return changeKeys(myallMenu, parentId, newChecked);
    })
  };


  const onCheck: any['onCheck'] = (checkeds: any, info: any) => {
    // console.log('onCheck', checkeds);
    // console.log('onCheck', info);
    // 选中
    if (info.checked) {
      const oldChecked = JSON.parse(JSON.stringify(checkedKeys))
      // console.log('oldChecked', oldChecked);
      const newChecked = [
        ...new Set(oldChecked.concat(info.node.parentIds).concat(info.node.childrenAllId)),
      ];
      // console.log('newChecked', newChecked);
      setCheckedKeys(newChecked)
    } else {
      const oldChecked = JSON.parse(JSON.stringify(checkedKeys))
      // console.log('oldChecked', oldChecked);
      // 从已选里减去点的子级 和 自身
      const newChecked = oldChecked.filter(
        (el: any) => ![...info.node.childrenAllId].includes(el) && el != info.node.id,
      );
      // console.log('newChecked', newChecked);
      setCheckedKeys(newChecked)
      // 判断选择节点的父级下，是否有任何一个子级被已选中，如果没有 递归向上取消父级
      // 传 所有的菜单 ，节点的父级ID，当前已选的IDS数组(去掉了所有子级后的)
      setTimeout(async () => {
        const deletePids: any = await cancelParentId(allMenu, info.node.parentId, newChecked);
        console.log('要删除的父IDs', deletePids)
        const overAdds = newChecked.filter((k: any) => !deletePids.includes(k))
        setCheckedKeys(overAdds)
      }, 100);
    }
  };

  // 单个按钮选中
  const checkButton = (button: any, record: any) => {
    console.log(button);
    console.log(record);
    const bIndex = checkedKeys.indexOf(button.id);
    console.log(bIndex);
    if (bIndex > -1) {
      const oldChecked = JSON.parse(JSON.stringify(checkedKeys))
      oldChecked.splice(bIndex, 1);
      setCheckedKeys(oldChecked)
      setTimeout(async () => {
        const isHasChild = isHased(oldChecked, button.allIds);
        console.log('isHasChild', isHasChild)
        if (!isHasChild) {
          // 如果按钮子级都不存在
          const deletePids: any = await cancelParentId(allMenu, button.parentId, oldChecked);
          console.log('要删除的父IDs', deletePids)
          const overAdds = oldChecked.filter((k: any) => !deletePids.includes(k))
          setCheckedKeys(overAdds)
        }
      }, 100);

    } else {
      const oldChecked = [
        ...new Set(checkedKeys.concat([button.id, ...record.parentIds])),
      ];
      setCheckedKeys(oldChecked)
    }
  };

  // 提交时 递归找父
  const findParentId = (id: any, data: any) => {
    try {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id == id) {
          console.log(45454);
          console.log(data[i]);
          return data[i].parentIds;
        } else {
          if (data[i].children && data[i].children.length) {
            console.log(id);
            const res: any = findParentId(id, data[i].children);
            if(res){
              return res;
            }
          }
        }
      }
    } catch (error) {
      console.log(555);
    }
  };
  // 多维数组转一维数组 并去重
  const flatten = (arr: any) => {
    return [...new Set([].concat(...arr.map((x: any) => (Array.isArray(x) ? flatten(x) : x))))];
  };

  // 提交
  const saveRole = async () => {
    setLoading(true)
    const res = await setMenuToRole({
      roleId: role_id,
      menuIds: checkedKeys.join(','),
    });

    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    pubMsg('操作成功!', 'success');
    setLoading(false);
  };


  useMemo(() => {
    setAddKeys(checkedKeys)
    setAddKeys(copyKeys)
    // 新增的KEY 变色用
    const newAddKeys: any = checkedKeys.filter((k: any) => !copyKeys.includes(k));
    // 删除的KEY 变色用
    const newDeleteKeys = copyKeys.filter((k: any) => !checkedKeys.includes(k));
    setAddKeys(newAddKeys)
    setDeleteKeys(newDeleteKeys)
  }, [checkedKeys,copyKeys])

  const onSubmit = async () => {
    if (!remark) return pubMsg('请输入申请原因！');
    setLoading(true)

    const newData = {
      roleIds: role_id,
      remark:remark,
      status: 'applying',
      addMenus: flatten(
        addKeys.map((element: any) => findParentId(element, allMenuCopy))
      ),
      deleteMenus: flatten(
        deleteKeys.map((element: any) => findParentId(element, allMenuCopy))
      ),
    };
    const res = await applyBatch(newData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message)
      setLoading(false);
      return;
    }
    if(res?.data&& res.data.length){
      setLoading(false);
      errorModalOpen(res.data);
    }else{
      pubMsg('申请成功!', 'success');
      setLoading(false);
    }
  };

  // 提交
  const submit = () => {
    if (role_type == 1) {
      saveRole();
    } else if (role_type == 2) {
      onSubmit();
    }
  };
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      footer={[
        <Button
          icon={<ArrowLeftOutlined />}
          key={'backBtn'}
          onClick={() => history.push('/ams/roles')}
        >
          返回
        </Button>,
        <Button
          key={'saveBtn'}
          type="primary"
          onClick={() => {
            submit()
          }}
        >
          {role_type == 1 ? '保存角色权限' : '提交审核'}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Card bordered={false} title={`角色分配操作权限 --【${history?.location?.query?.name}】`}>

          {role_type == 2 ? (
            <div className='roleDetail-remark'>
              <div className='roleDetail-remark-body'>
                <p>角色名称：{role_name}</p>
                <ProFormTextArea
                  label={'申请原因'}
                  name={'remark'}
                  fieldProps={{
                    onChange: (e: any) => {
                      setRemark(e.target.value);
                    }
                  }}
                  rules={[{ required: true, message: '请输入申请原因' }]}
                />
              </div>
            </div>
          ) : ''}


          {
            allMenu && allMenu.length ? (
              <Tree
                checkable
                onCheck={onCheck}
                treeData={allMenu}
                checkedKeys={checkedKeys}
                fieldNames={{
                  title: 'name',
                  key: 'id',
                  children: 'children',
                }}
                defaultExpandAll={true}
                checkStrictly={true}
                blockNode={true}
                titleRender={(item: any) => (
                  <>
                    <span className={`${copyKeys.includes(item.id)?'m-h':''} ${addKeys.includes(item.id)?'m-g':''} ${deleteKeys.includes(item.id)?'m-d':''}`}>{item.name}</span>
                    {
                      item?.buttonList?.length ? (
                        <div className="buttonList">
                          <div className="menus-button">
                            {
                              item?.buttonList.map((bItem: any) => (
                                <p key={bItem.id} onClick={() => checkButton(bItem, item)} >
                                  <Checkbox checked={checkedKeys.includes(bItem.id)}>
                                    <span
                                     className={`${copyKeys.includes(bItem.id)?'m-h':''} ${addKeys.includes(bItem.id)?'m-g':''} ${deleteKeys.includes(bItem.id)?'m-d':''}`}
                                    >{bItem.name}</span>
                                  </Checkbox>
                                </p>
                              ))
                            }
                          </div>
                        </div>
                      ) : ''
                    }
                  </>
                )}
              />
            ) : ''
          }
        </Card>
        <EditError editErrorModel={editErrorModel} />
      </Spin>
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
