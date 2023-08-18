import { Input } from 'antd';
import { useState } from 'react';

const Component: React.FC<{
  value?: any;
  onChange?: any;
  options?: any;
  productName?: string;
  tableKey?: any
}> = ({ value,onChange, productName }) => {
  const [form, formSet] = useState(value?.sku_form);
  const [spec, specSet] = useState<any>(value?.sku_spec);
  return (
    <div style={{ display: 'flex' }}  key="tableKey">
      <Input
        style={{ width: '1000px' }}
        name="form"
        placeholder="款式形态"
        addonBefore={`${productName || '-'}-`}
        value={form}
        onChange={(e: any) => {
          formSet(e?.target?.value);
            onChange({ sku_form: e?.target?.value, sku_spec: spec });
         
        }}
      />
      &nbsp;-&nbsp;
      <Input
        name="spec"
        value={spec}
        placeholder="规格型号"
        onChange={(e: any) => {
          specSet(e?.target?.value);
          onChange({ sku_form: form, sku_spec: e?.target?.value });
        }}
      />
    </div>
  );
};
export default Component;
