import { useState } from 'react';
import { Select } from 'antd';
import { pubGetStoreList } from '@/utils/pubConfirm';

const Comp = (props: any) => {
  const { placeholder } = props;
  const [treeData, setTreeData] = useState<any[]>([]);
  const [checkStore, setCheckStore] = useState<string | null>(null);
  const [platId, sePlatId] = useState('');
  const [list] = useState<any[]>([
    {
      value: 1,
      label: '京东',
    },
    {
      value: 2,
      label: '天猫&抖音',
    },
  ]);
  // 返回到页面
  const allBack = (busScopeId: string, line: string) => {
    if (typeof props?.back == 'function') props.back([busScopeId, line]);
    if (typeof props?.onChange == 'function') props.onChange([busScopeId, line]);
  };
  // 改变平台
  const changePlat = async (id?: any, reGet?: boolean) => {
    if (id) {
      const res: any = await pubGetStoreList({ platform_id: id });
      setTreeData(res);
    } else {
      setTreeData([]);
    }
    if (!reGet) {
      sePlatId(id);
      setCheckStore('');
      allBack(id, '');
    } else {
      setCheckStore(props?.initialValue?.[1]);
    }
  };

  // 改变店铺时
  const changeProductLine = async (id?: any) => {
    setCheckStore(id);
    allBack(platId, id);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Select
        style={{ width: 110, marginRight: 2 }}
        placeholder={typeof placeholder == 'object' ? placeholder[0] : '平台'}
        allowClear
        defaultValue={props?.initialValue?.[0]}
        options={list}
        onChange={(v: any) => changePlat(v)}
      />
      <Select
        style={{ minWidth: 100 }}
        placeholder={typeof placeholder == 'object' ? placeholder[1] : '区域'}
        allowClear
        value={checkStore}
        options={treeData}
        onChange={(v: any) => changeProductLine(v)}
      />
    </div>
  );
};

export default Comp;
