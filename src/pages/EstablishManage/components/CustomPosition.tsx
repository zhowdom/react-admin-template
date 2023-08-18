import { ProFormSelect } from '@ant-design/pro-form';
import { Button, Tag } from 'antd';
import { ArrowDownOutlined } from '@ant-design/icons';

const Component: React.FC<{
  value?: any;
  onChange?: any;
  dicList?: any;
  tableKey?: any;
  fillNextAction?: any;
}> = ({ value, onChange, dicList, fillNextAction }) => {
  return (
    <div key="tableKey" className="customPosition">
      <ProFormSelect
        showSearch
        fieldProps={{
          value,
        }}
        debounceTime={300}
        valueEnum={dicList?.PROJECTS_GOODS_SKU_POSITION}
        onChange={(value: any) => {
          onChange(value);
        }}
      />
      <div
        style={{ position: 'absolute', top: '27px', left: 0,cursor: 'pointer' }}
        onClick={() => {
          fillNextAction(value);
        }}
      >
        <Tag color="blue">向下填充</Tag>
      </div>
    </div>
  );
};
export default Component;
