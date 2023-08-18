import TreeSelect, { TreeNode } from 'antd/lib/tree-select';
import { getList as getProLineList } from '@/services/pages/productLine';
import { useEffect, useState } from 'react';

const ProSelect = (props: any) => {
  const [treeNodeOption, setTreeNodeOption] = useState();

  // 渲染树
  const renderTreeNode = (data: any[]) => {
    return data.map((item: any) => {
      if (item.children) {
        return (
          <TreeNode value={item.id} title={item.name} key={item.id}>
            {renderTreeNode(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode value={item.id} title={item.name} key={item.id} />;
    });
  };

  // 获取产品线
  const getProLineListAction = async () => {
    const res: any = await getProLineList({});
    const proList = res?.data || [];
    const nodes: any = renderTreeNode(proList);
    setTreeNodeOption(nodes);
  };
  useEffect(() => {
    getProLineListAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <TreeSelect
      treeDefaultExpandedKeys={props?.expandIds}
      disabled={props?.disabled}
      showSearch
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      placeholder={props?.placeholder || '请选择产品线'}
      allowClear
      onChange={props.onChange}
    >
      {treeNodeOption}
    </TreeSelect>
  );
};
export default ProSelect;
