import React, { useState, useMemo } from 'react';
import { history, useModel } from 'umi';
import { Layout, Menu, Popover, TreeSelect, Empty } from 'antd';
import './index.less';
import { IconMap } from '@/components/PubIcon';
import Icon from '@ant-design/icons';
import { cloneDeep, divide } from 'lodash'
import { useClickAway, useKeyPress } from 'ahooks';
import { Scrollbars } from 'react-custom-scrollbars';
import CheckToken from '@/components/CheckToken'

const isDev = process.env.NODE_ENV === 'development';
const is82 = window.location.host == '172.16.99.82'; // 是不是82环境
const { Sider } = Layout;
const { SubMenu } = Menu;
// 跳转
const goUrl = (data: any) => {
  if (/http(s)?:/.test(data.routeUrl)) {
    const http = data.routeUrl.split('http')
    console.log(http)
    window.open(`http${http[1]}`);
  } else {
    const to = data.routeUrl.indexOf('appPage_Scm') > -1 ? data.routeUrl.split('appPage_Scm')[1] : data.routeUrl
    history.push(to);
  }
};
const filterChildren = (arr: any[]) => {
  arr.forEach(item => {
    if (item.children?.length) {
      item.children = item.children.filter((a: any) => a.type == '1')
      if (item.children?.length) {
        item.selectable = false
        item.disabled = true
      }
      filterChildren(item.children)
    }
  })
}
let matchedMenu = null
const findMenu: any = (arr: any[], id: string) => {
  arr.forEach((item: any) => {
    if (item.id == id) {
      matchedMenu = item
    } else if (item.children?.length) {
      return findMenu(item.children, id)
    }
  })
}
const MenuSearch: React.FC<{ allMenu: any[], openSearchSet: any }> = ({ allMenu = [], openSearchSet = Function.prototype }) => {
  const menus = cloneDeep(allMenu)
  filterChildren(menus)
  return <TreeSelect
    showSearch
    treeNodeFilterProp={'name'}
    style={{ width: '240px' }}
    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
    placeholder="菜单关键词搜索"
    allowClear
    autoFocus
    treeDefaultExpandAll={false}
    onChange={(val: any) => {
      matchedMenu = null
      findMenu(menus, val?.value)
      if (matchedMenu) {
        openSearchSet(false)
        goUrl(matchedMenu)
      }
    }}
    treeData={menus}
    virtual
    labelInValue
    fieldNames={{ label: 'name', value: 'id', children: 'children' }}
    notFoundContent={<Empty description={'未找到菜单'} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    getPopupContainer={(v) => v.parentNode}
  />
}

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const allMenu: any = initialState?.currentUser?.menus || [];
  useMemo(() => {
    // console.log(history.location.pathname)
    // console.log(allMenu)
  }, [location?.pathname]);
  const [openSearch, openSearchSet] = useState(false)
  useClickAway(
    () => {
      openSearchSet(false)
    }, () => document.querySelector('.ant-popover, .ant-select-dropdown'),
  );
  useKeyPress(['ctrl.k'], (e) => {
    e?.preventDefault()
    openSearchSet(true);
  });
  useKeyPress(['esc'], () => {
    openSearchSet(false);
  });

  const mapMenuList1: any = (item: any, index: number) => {
    const aa = []
    aa.push({
      label: (<>
        {
          item?.children?.map((second: any, sindex: number) => (
            <div className='home-menuitem-nav' key={`${second.routeUrl}-${String(sindex)}`}>
              <div className='home-menuitem-title'>{second.name}</div>
              <div className='home-menuitem-body'>
                {
                  second?.children?.map((k: any, kindex: number) => (
                    <span className={`home-menuitem-a ${history.location.pathname != '/' && k.routeUrl.indexOf(history.location.pathname) > -1 ? 'home-menuitem-active' : ''}`} key={`${k.routeUrl}-${String(kindex)}`} onClick={() => goUrl(k)}>
                      {k.name}
                    </span>
                  ))
                }
              </div>
            </div>
          ))
        }
      </>),
      className: 'home-sub-children',
      key: `${item.name}-children-${String(index)}`,
    })
    return aa
  }

  const mapMenuList: any = () => {
    const dd = allMenu?.map((item: any, index: number) => (
      {
        label: (
          <div className={`home-menu-title ${item?.allThreeUrl && item?.allThreeUrl?.includes(history.location.pathname) ? 'home-menu-active' : ''}`} >
            <div className='home-menu-icon'><Icon component={(item?.icon && IconMap?.[item.icon]) ? IconMap[item.icon] : IconMap?.menuOther} style={{ fontSize: 14 }} /></div>
            <div className='home-menu-name'>{item.name}</div>
          </div>
        ),
        key: `${item.name}-${String(index)}`,
        children: mapMenuList1(item, index)
      }
    ));

    return allMenu.length ? dd : []
  }
  return (
    <Sider theme='light' width={60} className='home-sider'>
      <div className={'home-sider-container'}>
        <Scrollbars className={'home-scrollbars'}>
          <Popover open={openSearch} title={<>搜索菜单<span style={{ color: '#ccc' }}>(快捷键:ctrl+k)</span></>} mouseLeaveDelay={1} destroyTooltipOnHide content={<MenuSearch openSearchSet={openSearchSet} allMenu={allMenu} />} placement={'right'} trigger={'click'}>
            <div className='home-menu-search' onClick={() => { setTimeout(() => openSearchSet(!openSearch), 0) }}><Icon style={{ marginRight: 2 }} component={IconMap.menuSearch || ' '} />搜索</div>
          </Popover>
          <Menu theme="light" mode="vertical" triggerSubMenuAction='hover' className='home-menu' items={mapMenuList()} />
          {
            (isDev || is82) ?
              <div style={{ position: 'fixed', left: 8, bottom: 8 }}>
                <CheckToken />
              </div> : null
          }
        </ Scrollbars >
      </div>
    </Sider>
  );
};
export default GlobalHeaderRight;
