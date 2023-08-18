import { useEffect, useState } from 'react';
import { ProFormText } from '@ant-design/pro-form';

const ProductLine = (props: any) => {
  const [inValue, setValue] = useState('');

  useEffect(() => {
    setValue(props?.skuName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 改变产品线时
  const changeProductLine = async (value?: any) => {
    console.log(value, 969696);
    setValue(value);
    props?.onChange(value || '');
  };

  return (
    <div className="pub-my-product-parts">
      <div style={{ width: '80px', paddingRight: '5px' }}>{props?.proName} -</div>
      <div style={{ flex: 1 }}>
        <ProFormText
          style={{ width: '100%' }}
          placeholder="产品名称"
          fieldProps={{
            value: inValue,
            onChange: (v) => {
              changeProductLine(v?.target?.value);
            },
          }}
          rules={[{ required: true, message: '请输入产品名称' }]}
        />
      </div>
    </div>
  );
};
export default ProductLine;
