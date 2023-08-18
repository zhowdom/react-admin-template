import React from 'react';
import { ConsoleSqlOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import Dialog from './Dialog';

const CheckToken: React.FC = ({}) => {
  const dialogModel = useRef();
  // 弹窗
  const dialogModelOpen: any = () => {
    const data: any = dialogModel?.current;
    data.open();
  };
  return (
    <>
      <a
        onClick={() => {
          dialogModelOpen();
        }}
        key="edit"
      >
        <ConsoleSqlOutlined />
        <span style={{marginLeft: 2}}>调试</span>
      </a>
      <Dialog dialogModel={dialogModel} />
    </>
  );
};
export default CheckToken;
