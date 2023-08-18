import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { Button, Card, Spin, Tree, Checkbox } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, history, } from 'umi';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  getMenuList,
  getRoleMenu,
} from '@/services/pages/AmsManage/roles';
import './roleDetail.less';
import { ArrowLeftOutlined } from '@ant-design/icons';

const Page: FC<Record<string, any>> = () => {
  const role_id = history?.location?.query?.id;
  const [loading, setLoading] = useState(false);
  const [allMenu, setAllMenu] = useState<any>([]);
  const [checkedKeys, setCheckedKeys] = useState<any>([]);
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
  // 获取角色已有的菜单按钮
  const getRoleDetail = async () => {
    const res = await getRoleMenu({ roleId: role_id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    setCheckedKeys(res.data);
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
    getRoleDetail()
  };


  useEffect(() => {
    getAllMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          onClick={() => history.goBack()}
        >
          返回上一页
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        <Card bordered={false} title={`查看操作权限 --【${history?.location?.query?.name}】`}>
          {
            allMenu && allMenu.length ? (
              <Tree
                treeData={allMenu}
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
                    <div className='tree-title'>
                      <Checkbox checked={checkedKeys.includes(item.id)}>
                        <span className={checkedKeys.includes(item.id) ? 'm-h' : ''}>{item.name}</span>
                      </Checkbox>
                    </div>
                    {
                      item?.buttonList?.length ? (
                        <div className="buttonList">
                          <div className="menus-button">
                            {
                              item?.buttonList.map((bItem: any) => (
                                <p key={bItem.id} >
                                  <Checkbox checked={checkedKeys.includes(bItem.id)}>
                                    <span className={checkedKeys.includes(bItem.id) ? 'm-h' : ''}>{bItem.name}</span>
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
      </Spin>
    </PageContainer >
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
