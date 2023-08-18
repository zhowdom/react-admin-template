import React from 'react';
import { ProFormText } from '@ant-design/pro-form';

type props = {
  value?: string;
  onChange?: () => void;
};
const CustomText: React.FC<props> = (props: props) => {
  const { onChange, value } = props;
  return (
    <div className="item2">
      <ProFormText onChange={onChange} value={value} />
    </div>
  );
};

export default CustomText;
