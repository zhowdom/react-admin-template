import React, { useRef } from 'react';
import { LogoutOutlined, SettingOutlined, UserOutlined, UserSwitchOutlined, AuditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Avatar, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { useModel } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import Cookie from 'js-cookie';
import { logout } from '@/services/base';
import ChangeNick from './ChangeNick';
import ChangePassWord from './ChangePassWord';
import AccountInfo from './AccountInfo';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
export const clearAndLogin = () => {
  const isDev = process.env.NODE_ENV === 'development';
  Cookie.remove(isDev ? `${window.location.port}token` : 'ACCESS_TOKEN');
  window.localStorage.clear();
  window.location.href = `${window.location.origin}/appPage_Scm/login`; // 统一登录链接
  // if (!(process.env.NODE_ENV === 'development')) {
  //   // window.location.reload(); // 不能跳链接，要刷新
  //   window.location.href = `${window.location.origin}/appPage_Scm/login`; // 统一登录链接
  // }
};
const loginOut = async () => {
  logout().then(() => {
    clearAndLogin();
  });
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const changeNickModel = useRef();
  const changePassWordModel = useRef();
  // 弹窗
  const changeNickModelOpen: any = () => {
    const data: any = changeNickModel?.current;
    data.open();
  };
  // 弹窗
  const changePassWordModelOpen: any = () => {
    const data: any = changePassWordModel?.current;
    data.open();
  };

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }
  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      loginOut();
      return;
    } else if (key == 'editNick') {
      changeNickModelOpen();
    } else if (key == 'changePassWord') {
      changePassWordModelOpen();
    } else if (key == 'psi') {
      window.open(`${window.location.origin}/psi`);
    }
  };
  const items: MenuProps['items'] = [
    {
      key: 'changePassWord',
      label: '修改密码',
      icon: <UserSwitchOutlined />,
    },
    {
      key: 'editNick',
      label: '修改昵称',
      icon: <SettingOutlined />,
    },
    {
      key: 'accountInfo',
      label: (<AccountInfo currentUser={ currentUser } />),
      icon: <InfoCircleOutlined />,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
    },
  ];
   if(currentUser.isPSI){
    items.unshift({
      key: 'psi',
      label: '进销存系统',
      icon: <AuditOutlined />,
    })
   }
  return (
    <>
      <HeaderDropdown menu={{items,onClick}}>
        <span className={styles.myUserInfo}>
          <Avatar
            size="small"
            className={styles.avatar}
            src={currentUser.avatar}
            icon={<UserOutlined />}
            alt="avatar"
          />
          <span style={{ marginLeft: 4 }} className={`${styles.name} anticon`}>{currentUser.name}</span>
        </span>
      </HeaderDropdown>
      <ChangeNick changeNickModel={changeNickModel} />
      <ChangePassWord changePassWordModel={changePassWordModel} />
    </>
  );
};

export default AvatarDropdown;
