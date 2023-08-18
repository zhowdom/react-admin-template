import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { pubGetPlatformList, pubGetStoreList } from '@/utils/pubConfirm';

const Comp = (props: any) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [checkStore, setCheckStore] = useState(null);
  const [platId, sePlatId] = useState('');
  const [list, setList] = useState<any[]>([]);
  const getPlats = async () => {
    const res: any = await pubGetPlatformList({ business_scope: props.business_scope });
    setList(res || []);
  };
  useEffect(() => {
    getPlats();
  }, []);
  // 返回到页面
  const allBack = (busScopeId: string, line: string) => {
    if (props.back) props.back([busScopeId, line]);
    if (props?.onChange) props?.onChange([busScopeId, line]);
  };
  // 改变平台
  const changePlat = async (id?: any) => {
    // console.log(id);
    if (id) {
      const res: any = await pubGetStoreList({ platform_id: id });
      setTreeData(res);
    } else {
      setTreeData([]);
    }
    sePlatId(id);
    setCheckStore('');
    allBack(id, '');
  };
  // 改变店铺时
  const changeProductLine = async (id?: any) => {
    setCheckStore(id);
    allBack(platId, id);
  };

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <div style={{ width: '115px', paddingRight: '2px' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择平台"
          allowClear
          options={list}
          onChange={(v: any) => changePlat(v)}
        />
      </div>
      <div style={{ width: 'calc(100% - 115px)' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择店铺"
          allowClear
          value={checkStore}
          options={treeData}
          onChange={(v: any) => changeProductLine(v)}
        />
      </div>
    </div>
  );
};

export default Comp;
