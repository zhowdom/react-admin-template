import { useState } from 'react';
import { connect } from 'umi';
import { Select, TreeSelect } from 'antd';
import { pubProLineList } from '@/utils/pubConfirm';

const ProductLine = (props: any) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [checkLine, setCheckLine] = useState([]);
  const [busId, setBusId] = useState('');
  // console.log(props);
  const businessScope = props.common.dicList.SYS_BUSINESS_SCOPE;
  // console.log(businessScope);
  const list = [];

  // 返回到页面
  const allBack = (busScopeId: string, line: string) => {
    props.back([busScopeId, line]);
  };
  for (const i in businessScope) {
    list.push({
      label: businessScope[i].detail_name,
      value: i,
    });
  }
  // console.log(list);
  // setSelectList(lists);
  // props.common.dicList.SC_YES_NO.map((item: any)=>{
  //   console.log(item)
  // })
  // 改变业务范畴时
  const changeBusinessScope = async (id?: any) => {
    // console.log(id);
    if (id) {
      const res: any = await pubProLineList({ business_scope: id });
      // console.log(res);
      setTreeData(res);
    } else {
      setTreeData([]);
    }
    setBusId(id);
    setCheckLine([]);
    allBack(id, '');
  };
  // 改变产品线时
  const changeProductLine = async (id?: any) => {
    // console.log(busId);
    setCheckLine(id);
    allBack(busId, id.join(','));
  };

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <div style={{ width: '115px', paddingRight: '5px' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="类型"
          allowClear
          options={list}
          onChange={(v: any) => changeBusinessScope(v)}
        />
      </div>
      <div style={{ flex: 1 }}>
        <TreeSelect
          treeData={treeData}
          value={checkLine}
          allowClear
          onChange={(v: any) => changeProductLine(v)}
          treeCheckable={true}
          showCheckedStrategy="SHOW_PARENT"
          placeholder="产品线"
          style={{ width: '100%' }}
          dropdownClassName="productLine-drop"
        />
      </div>
    </div>
  );
};
const Page: React.FC = connect(({ common }: any) => ({ common }))(ProductLine);
export default Page;
