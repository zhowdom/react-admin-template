import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import React from 'react';
import { ProFormText, LoginForm } from '@ant-design/pro-form';
import { history, FormattedMessage} from 'umi';
import { getAuthorization, login } from '@/services/base';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { pubMsg } from '@/utils/pubConfig';

import './index.less';


const Login: React.FC = () => {
  const handleSubmit = async (values: API.LoginParams) => {

    const newData = JSON.parse(JSON.stringify(values));
    newData.password = CryptoJS.AES.encrypt(
      newData.password,
      CryptoJS.enc.Utf8.parse('liyi99.23579abcd'),
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 },
    ).toString();
    console.log(newData)
      // 登录前要先请求一个单独的请求头
      const loginToken = await getAuthorization();
      const res = await login(newData, loginToken.data);
      if (res?.code == '0' && res?.data.access_token) {
        pubMsg('登录成功','success');
        const isDev = process.env.NODE_ENV === 'development';
        Cookies.set(isDev ? `${window.location.port}token` : 'ACCESS_TOKEN', res?.data.access_token);
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        window.location.href = redirect || '/home';
      } else {
        pubMsg(res?.message);
      }

  };

  return (
    <div className='container'>
      <div className='content'>
        <div className='login-logo'>
          <img alt="logo" src="/logo.svg" />
          <span>礼意久久系统登录</span>
        </div>
        <LoginForm
          initialValues={{
            autoLogin: true,
          }}
          // actions={[
          //   <FormattedMessage
          //     key="loginWith"
          //     id="pages.login.loginWith"
          //     defaultMessage="其他登录方式"
          //   />,
          //   <AlipayCircleOutlined key="AlipayCircleOutlined" className='icon' />,
          //   <TaobaoCircleOutlined key="TaobaoCircleOutlined" className='icon' />,
          //   <WeiboCircleOutlined key="WeiboCircleOutlined" className='icon' />,
          // ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <ProFormText name="grant_type" initialValue={'password'} hidden />
          <ProFormText name="scopes" initialValue={'service'} hidden/>
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className='prefixIcon' />,
            }}
            placeholder={'用户名'}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="请输入用户名!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className='prefixIcon' />,
            }}
            placeholder={'密码'}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />
          <div className='footer'>Copyright © 2022 Liyi99</div>

        </LoginForm>
      </div>
    </div>
  );
};

export default Login;
