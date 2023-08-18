import React from 'react';
import { ProFormTextArea } from '@ant-design/pro-form';

type props = {
  value?: string;
  onChange?: () => void;
};
const CustomArea: React.FC<props> = (props: props) => {
  const { onChange, value } = props;
  return <ProFormTextArea onChange={onChange} value={value} />;
};

export default CustomArea;
