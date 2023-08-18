import type { FC } from 'react';
import React, { useEffect, useState, useRef } from 'react';
import { Button, Card, Spin, Tree, } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, history } from 'umi';
import { pubConfig, pubMsg, } from '@/utils/pubConfig';
import {
  getMenuList,
  getRoleList,
  getRoleCodesMenus,
  applyBatch,
  applyFindById,
} from '@/services/pages/AmsManage/roles';
import EditError from './components/EditError';
import './editRolesPromiss.less';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';

const Page: FC<Record<string, any>> = () => {
  const role_data = history?.location?.query?.data;
  const role_editId = history?.location?.query?.editId;
  const [loading, setLoading] = useState(false);
  const [allMenu, setAllMenu] = useState<any>([]); // 全部菜单按钮
  const [allRole, setAllRole] = useState<any>([]) // 全部角色
  const [hasdRole, setHasdRole] = useState<any>([])
  const [addKeys, setAddKeys] = useState<any>([]); // 添加的KEY
  const [deleteKeys, setDeleteKeys] = useState<any>([]); // 删除的KEY
  const [remark, setRemark] = useState<any>('');
  const [detail, setDetail] = useState<any>([]);
  // 添加弹窗实例
  const editErrorModel = useRef();

  const changeRef = useRef<ProFormInstance>();

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
      const pids: any = parentIds.concat(item.type ? [item.id] : []); // 所有的父级ID。加自己
      if (item.children) {
        cids = getMenuIds(item.children);
        if (item.children[0].type == 2) {
          newChildren = null;
          item.children.forEach((s: any) => {
            buttonList.push({
              ...s,
              allPids: pids,
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

  // 获取角色已有的菜单的所有的buttonids+菜单IDs
  const getButtonIds = (data: any, oldArr?: any) => {
    const newIds = oldArr || [];
    data.forEach((k: any) => {
      if (k.type == 1) {
        newIds.push(k.id);
      }
      if (k.children && k.children.length) {
        getButtonIds(k.children, newIds);
      } else {
        if (k.type == 2) {
          newIds.push(k.id);
        }
      }
    });
    return newIds;
  };

  // 获取角色已有的菜单按钮
  const getRoleMenus = async () => {
    const res = await getRoleCodesMenus({ roleCodes: role_data });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return;
    }
    const overIds = [...new Set(getButtonIds(res.data))];
    console.log(overIds)
    setAddKeys(overIds);
  };
  // 获取全部菜单
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
    setLoading(false);
  };


  // 获取角色
  const getAllRole = async (): Promise<any> => {
    setLoading(true);
    const postData = {
      pageIndex: 1,
      pageSize: 999,
    };
    const res = await getRoleList(postData);
    setLoading(false);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      return;
    }
    setAllRole(res?.data?.list);
  };

  // 递归取草稿详情里的所有ID
  const getDetailKey = (data: any, addkeys?: any, delKeys?: any) => {
    const addData = addkeys || [];
    const delData = delKeys || [];
    data.forEach((element: any) => {
      if (element.changeType == 2) {
        addData.push(element.id);
      } else if (element.changeType == 1) {
        delData.push(element.id);
      }
      if (element.children) {
        getDetailKey(element.children, addData, delData);
        return;
      }
    });
    return {
      addData: [...new Set(addData)],
      delData: [...new Set(delData)],
    };
  };
  // 获取草稿详情
  const getDetail = async () => {
    setLoading(true);
    const res = await applyFindById({ id: role_editId });
    if (res.code == '0') {
      let newD: any = [];
      const newR: any = [];
      setDetail(res.data)
      if (res.data.roles.length) {
        res.data.roles.forEach((v: any) => {
          newR.push(v);
          console.log(v?.apps);
          newD = [...newD, ...v.apps];
        });
      }
      const overKey: any = getDetailKey(newD);
      console.log(overKey);
      setAddKeys(overKey?.addData)
      setDeleteKeys(overKey?.delData)
      console.log(newR)
      setHasdRole(newR)
      // state.roleList = newR;
      // state.roleListCopy = JSON.parse(JSON.stringify(newR));
      setTimeout(() => {
        setRemark(res.data.remark);
        changeRef.current?.setFieldsValue({
          remark: res.data.remark,
        });
      }, 100);

    } else {
      pubMsg(res?.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAllMenu();
    getAllRole();
    if (role_data) {
      getRoleMenus();
    }
    if (role_editId) {
      getDetail();
    }
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


  // 用父ID 递归找所有的父 判断父要不要取消 返回要取消的父ID数组  取消添加时用
  const cancelAddParentId = (myallMenu: any, parentId: String, newAddKey: any) => {
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
              const newArr = overKeys.filter((el: any) => ![data[i].id].includes(el));
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
      return changeKeys(myallMenu, parentId, newAddKey);
    })
  };

  // 用父ID 递归找所有的父 判断父要不要取消 返回要取消的父ID数组  取消移除时用
  const cancelDeleteParentId = (myallMenu: any, parentId: String, newDelKey: any) => {
    return new Promise((resolve) => {
      const returnArr: any = [];
      function changeDelKeys(data: any, pid: String, overKeys: any) {
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
              const newArr = overKeys.filter((el: any) => ![data[i].id].includes(el));
              returnArr.push(pid);
              if (data[i].parentId != 0) {
                console.log(data[i].name);
                changeDelKeys(myallMenu, data[i].parentId, newArr);
              } else {
                console.log('newArr', newArr);
                resolve(returnArr)
              }
            }
            break;
          } else {
            if (data[i].children) {
              changeDelKeys(data[i].children, pid, overKeys);
            }
          }
        }
      }
      return changeDelKeys(myallMenu, parentId, newDelKey);
    })
  };


  // 单个添加
  const addOne = (data: any) => {
    let newAddKey = JSON.parse(JSON.stringify(addKeys));
    newAddKey.push(data.id);
    newAddKey = newAddKey.concat(data.allPids);
    newAddKey = [...new Set(newAddKey)];
    setAddKeys(newAddKey)
  };
  // 单个移除
  const deleteOne = (data: any) => {
    let newDelKey = JSON.parse(JSON.stringify(deleteKeys));
    newDelKey.push(data.id);
    newDelKey = newDelKey.concat(data.allPids);
    newDelKey = [...new Set(newDelKey)];
    console.log('移除的个数', newDelKey.length);
    setDeleteKeys(newDelKey)
  };

  // 单个取消添加
  const cancelAdd = (data: any) => {
    // console.log(data);
    // console.log(row);
    const newAddKey = JSON.parse(JSON.stringify(addKeys));
    const aIndex = newAddKey.indexOf(data.id);
    newAddKey.splice(aIndex, 1);
    setAddKeys(newAddKey)
    console.log('newAddKey', newAddKey.length)
    setTimeout(async () => {
      const isHasChild = isHased(newAddKey, data.allIds);
      console.log('isHasChild', isHasChild)
      if (!isHasChild) {
        // 如果按钮子级都不存在
        const deletePids: any = await cancelAddParentId(allMenu, data.parentId, newAddKey);
        console.log('要删除的父IDs', deletePids)
        const overAdds = newAddKey.filter((k: any) => !deletePids.includes(k))
        setAddKeys(overAdds)
      }
    }, 100);
  };
  // 单个取消移除
  const cancelDelete = (data: any) => {
    console.log(data);
    const newDelKey = JSON.parse(JSON.stringify(deleteKeys));
    const aIndex = newDelKey.indexOf(data.id);
    newDelKey.splice(aIndex, 1);
    setDeleteKeys(newDelKey)
    console.log('移除的个数', newDelKey.length)

    setTimeout(async () => {
      const isHasChild = isHased(newDelKey, data.allIds);
      console.log('isHasChild', isHasChild)
      if (!isHasChild) {
        // 如果按钮子级都不存在
        const deletePids: any = await cancelDeleteParentId(allMenu, data.parentId, newDelKey);
        console.log('要删除的父IDs', deletePids)
        const overDels = newDelKey.filter((k: any) => !deletePids.includes(k))
        console.log('移除的个数', overDels.length);
        setDeleteKeys(overDels)
      }
    }, 100);
  };
  // 批量添加
  const addAll = (data: any) => {
    console.log(data);
    const adds = data.buttonIds.filter(
      (v: any) => !deleteKeys.includes(v) && !addKeys.includes(v),
    );
    console.log(adds);
    if (!adds.length) return;
    const overDels = [...new Set(addKeys.concat(adds).concat(data.parentIds))];
    setAddKeys(overDels)
  };
  // 批量移除
  const deleteAll = (data: any) => {
    console.log(data);
    const adds = data.buttonIds.filter(
      (v: any) => !deleteKeys.includes(v) && !addKeys.includes(v),
    );
    console.log(adds);
    if (!adds.length) return;
    const overDels = [...new Set(deleteKeys.concat(adds).concat(data.parentIds))];
    setDeleteKeys(overDels)
  };


  // 选择角色
  const chosedRole = (data: any) => {
    const newD = JSON.parse(JSON.stringify(hasdRole));
    newD.push(data);
    setHasdRole(newD);

  };
  // 删除角色
  const deleteRole = (data: any) => {
    const newD = hasdRole.filter((v: any) => v.id != data.id);
    setHasdRole(newD);
  };


  // 详情弹窗
  const errorModalOpen: any = (row: any) => {
    const data: any = editErrorModel?.current;
    data.open(row);
  };

  // 提交
  const submitSave = async (type: string) => {
    if (!addKeys.length && !deleteKeys.length) return pubMsg('请选择要改变的按钮权限！');
    if (!hasdRole.length) return pubMsg('请选择待复制的角色！');
    if (!remark) return pubMsg('请输入申请原因！');

    setLoading(true);
    const newData: any = {
      roleIds: hasdRole.map((v: any) => v.id).join(','),
      addMenus: addKeys,
      deleteMenus: deleteKeys,
      remark: remark,
      status: type,
    };
    if (role_editId && detail.status == 'prepare') {
      newData.id = role_editId;
    }
    const res = await applyBatch(newData);

    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }else{
      if (res.data && res.data.length) {
        errorModalOpen(res.data);
      } else {
        pubMsg('操作成功!', 'success');
      }
      setLoading(false);
    }
  };

  // 表格配置
  const columns1: any[] = [
    {
      title: '角色',
      dataIndex: 'name',
      align: 'left',
      render: (_: any, row: any) => `${row?.name}(${row?.code})`,
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 60,
      align: 'center',
      hideInSearch: true,
      render: (_: any, row: any) => (
        hasdRole.find((k: any) => k.id == row.id) ? (<a className='list-green'><CheckCircleOutlined /></a>) : (<a onClick={() => chosedRole(row)}>选择</a>)
      ),
    },
  ];
  const columns: any[] = [
    {
      title: '角色',
      dataIndex: 'name',
      align: 'left',
      render: (_: any, row: any) => `${row?.name}(${row?.code})`,
    },
    {
      title: '操作',
      dataIndex: 'options',
      width: 60,
      align: 'center',
      hideInSearch: true,
      render: (_: any, row: any) => (
        <a onClick={() => deleteRole(row)}>删除</a>
      ),
    },
  ];

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
          onClick={() => submitSave('prepare')}
        >
          保存草稿
        </Button>,
        <Button
          key={'saveBtn1'}
          type="primary"
          onClick={() => submitSave('applying')}
        >
          提交申请
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Card bordered={false} title={`批量编辑角色权限`}>
          <div className='editRolesPromiss'>
            {
              allMenu && allMenu.length ? (
                <Tree
                  defaultExpandAll={role_data?true:false}
                  checkStrictly={true}
                  blockNode={true}
                  treeData={allMenu}
                  fieldNames={{
                    title: 'name',
                    key: 'id',
                    children: 'children',
                  }}
                  titleRender={(item: any) => (
                    <>
                      <span>{item.name}</span>
                      {
                        item.buttonIds && item.buttonIds.length ? (
                          <i className="pButton" onClick={() => addAll(item)}>批量添加</i>
                        ) : ''
                      }
                      {
                        item.buttonIds && item.buttonIds.length ? (
                          <i className="pButton" onClick={() => deleteAll(item)}>批量移除</i>
                        ) : ''
                      }
                      {
                        item?.buttonList?.length ? (
                          <div className="buttonList">
                            <div className="menus-button">
                              {
                                item?.buttonList.map((bItem: any) => (
                                  <p key={bItem.id}>
                                    <span className={`${addKeys.includes(bItem.id) ? 'm-g' : ''} ${deleteKeys.includes(bItem.id) ? 'm-d' : ''}`}>{bItem.name}</span>
                                    {
                                      addKeys.includes(bItem.id) ? (
                                        <i className="ts" onClick={() => cancelAdd(bItem, item)}>取消添加</i>
                                      ) : ''
                                    }
                                    {
                                      deleteKeys.includes(bItem.id) ? (
                                        <i className="ts" onClick={() => cancelDelete(bItem)}>取消移除</i>
                                      ) : ''
                                    }
                                    {
                                      !addKeys.includes(bItem.id) &&
                                        !deleteKeys.includes(bItem.id) ? (
                                        <i className="ts" onClick={() => addOne(bItem)}>添加</i>
                                      ) : ''
                                    }
                                    {
                                      !addKeys.includes(bItem.id) &&
                                        !deleteKeys.includes(bItem.id) ? (
                                        <i className="ts" onClick={() => deleteOne(bItem)}>移除</i>
                                      ) : ''
                                    }
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
          </div>


          <div className='editRolesPromiss-roles'>
            <div className="editRolesP-all">
              <div className="editRolesP-title">全部角色</div>
              <div className="editRolesP-body">
                <ProTable
                  rowKey="id"
                  columns={columns1}
                  options={false}
                  pagination={false}
                  search={{className: 'light-search-form', span: 12}}
                  scroll={{y: 240}}
                  bordered
                  defaultSize={'small'}
                  dateFormatter="string"
                  params={{refreshKey: loading}}
                  request={async (params: any) => {
                    let data = allRole
                    if (params?.name) {
                      const keyword = params.name.trim().toLowerCase()
                      data = data.filter((v: any) => {
                        return v.name.toLowerCase().includes(keyword) || v.code.toLowerCase().includes(keyword)
                      })
                    }
                    return {
                      success: true,
                      data,
                    }
                  }}
                  className="p-table-0"
                />
              </div>

            </div>
            <div className="editRolesP-user">
              <div className="editRolesP-title">已选择的角色</div>
              <div className="editRolesP-body">
                <ProTable
                  columns={columns}
                  options={false}
                  pagination={false}
                  bordered
                  search={{className: 'light-search-form', span: 12}}
                  rowKey="id"
                  size='small'
                  params={{refreshKey: hasdRole?.length}}
                  request={async (params: any) => {
                    let data = hasdRole
                    if (params?.name) {
                      const keyword = params.name.trim().toLowerCase()
                      data = data.filter((v: any) => {
                        return v.name.toLowerCase().includes(keyword) || v.code.toLowerCase().includes(keyword)
                      })
                    }
                    return {
                      success: true,
                      data,
                    }
                  }}
                  dateFormatter="string"
                  className="p-table-0"
                />
              </div>
            </div>

          </div>
          <div className='editRolesP-remark'>

            <ProForm
              labelAlign="right"
              labelCol={{ style: { minHeight: '32px' } }}
              layout="horizontal"
              formRef={changeRef}
              submitter={false}
            >
              <ProFormTextArea
                label={'申请原因'}
                name={'remark'}
                initialValue={remark}
                fieldProps={{
                  onChange: (e: any) => {
                    setRemark(e.target.value);
                  }
                }}

                rules={[{ required: true, message: '请输入申请原因' }]}
              />
            </ProForm>
          </div>
        </Card>
        <EditError editErrorModel={editErrorModel} />
      </Spin>
    </PageContainer >
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
