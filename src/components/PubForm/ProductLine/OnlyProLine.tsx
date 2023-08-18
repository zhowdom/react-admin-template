import { useEffect, useState } from 'react';
import { connect } from 'umi';
import { pubProLineList } from '@/utils/pubConfirm';
import { ProFormSelect } from '@ant-design/pro-form';
import './style.less';

const ProductLine = (props: any) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [lineIds, setLineIds] = useState([]);

  // 返回到页面
  const allBack = (line: string) => {
    if (typeof props.back === 'function') props.back(line);
  };

  // 改变业务范畴时
  const getProLineList = async () => {
    const res: any = await pubProLineList({ business_scope: props.business_scope });
    setTreeData(res || []);
  };
  useEffect(() => {
    getProLineList();
  }, []);
  // 改变产品线时
  const changeProductLine = async (id?: any) => {
    setLineIds(id);
    allBack(id.toString());
  };

  return (
    <div className="pub-my-product-line">
      <div style={{ flex: 1 }}>
        <ProFormSelect
          style={{ width: '100%' }}
          placeholder="选择产品线"
          allowClear
          showSearch
          debounceTime={300}
          fieldProps={{
            autoClearSearchValue: true,
            value: lineIds,
            mode: 'multiple',
            options: treeData,
            filterOption: (input: any, option: any) => {
              const trimInput = input.replace(/^\s+|\s+$/g, '');
              if (trimInput) {
                return option.label.indexOf(trimInput) >= 0;
              } else {
                return true;
              }
            },
            onChange: (vid) => {
              changeProductLine(vid);
            },
          }}
        />
      </div>
    </div>
  );
};
const Page: React.FC<any> = connect(({ common }: any) => ({ common }))(ProductLine);
export default Page;
