import { useState } from 'react';
import { Modal, Tabs, Tree, Space, Tag } from 'antd';
import { FileOutlined } from '@ant-design/icons'

const Dialog = (props: any) => {
  const [state, setState] = useState({
    isModalVisible: false, // 弹窗显示
    data: [], //
  });




  const changeMenu = (data: any) => {
    const newData: any = [];
    data.forEach((item: any) => {
      let newChildren = null; // 子级菜单
      const buttonList: any = []; // 子级按钮
      if (item.children) {
        if (item.children[0]?.type == 2) {
          newChildren = null;
          item.children.forEach((s: any) => {
            buttonList.push({
              ...s,
              allIds: item.children.map((k: any) => k.id),
            });
          });
        }
        if (item.children[0]?.type == 1) {
          newChildren = changeMenu(item.children);
        }
      }
      newData.push({
        ...item,
        children: newChildren,
        buttonList,
      });
    });
    return newData;
  };

  props.editErrorDetailModel.current = {
    open: (data: any) => {
      setState((pre: any) => {
        return {
          ...pre,
          data: data.map((v: any) => ({
            ...v,
            apps: changeMenu(v.apps)
          })),
          isModalVisible: true,
        };
      });
    },
  };
  // 关闭
  const modalClose = () => {
    setState((pre: any) => {
      return {
        ...pre,
        isModalVisible: false,
      };
    });
  };
  return (
    <Modal
      width={800}
      title="重复的申请信息如下"
      open={state.isModalVisible}
      onCancel={modalClose}
      footer={false}
      destroyOnClose
      maskClosable={false}
    >
      {state.data.length ? <>
        <Tabs
          items={state.data.map((tData: any) => ({
            label: tData.name,
            key: `${tData.id}-tab`,
            children: (
              <Tree defaultExpandAll defaultExpandParent autoExpandParent selectable={false} treeData={tData.apps[0].children}
                fieldNames={{ title: 'name', key: 'routeUrl', children: 'children' }}
                titleRender={(node: any) => {
                  return <>
                    <div key={`${node.id}-name`}><FileOutlined /> {node?.name}</div>
                    {node?.buttonList?.length ?
                      <Space wrap>
                        {node.buttonList.map((item: any) => <div key={`${item.id}-button`}>
                          <Tag style={{ marginRight: '-2px' }}>{item.name}</Tag>
                          <Tag color={item.changeType == '2' ? 'green' : 'red'}>{item.changeType == '2' ? '添加' : '删除'}</Tag>
                        </div>)}
                      </Space> :
                      null}
                  </>
                }}
              />
            )
          }))
          }
        />
      </> : null}
    </Modal>
  );
};
export default Dialog;
