import React from 'react';
import { ProFormSelect } from '@ant-design/pro-form';

type props = {
  value?: string;
  onChange?: () => void;
  options?: any;
};
const CustomSelect: React.FC<props> = (props: props) => {
  const { onChange, value, options } = props;
  return <ProFormSelect onChange={onChange} value={value} options={options} allowClear={false} />;
};

export default CustomSelect;
