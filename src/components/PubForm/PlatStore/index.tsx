import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { pubGetPlatformList, pubGetStoreList } from '@/utils/pubConfirm';

const Comp = (props: any) => {
  const { placeholder,isDy } = props;
  const [treeData, setTreeData] = useState<any[]>([]);
  const [checkStore, setCheckStore] = useState<string | null>(null);
  const [platId, sePlatId] = useState('');
  const [list, setList] = useState<any[]>([]);
  const tmPopObj = {
    '1531560417090879489': '天猫',
    '1532170842660691969': '京东POP',
  };
  const getPlats = async () => {
    const res: any = await pubGetPlatformList({ business_scope: props.business_scope,isDy: isDy});
    setList(
      res.filter((v: any) => !['1552846034395881473', '1580120899712675841'].includes(v.value)) ||
        [],
    );
  };
  // 返回到页面
  const allBack = (busScopeId: string, line: string) => {
    if (typeof props?.back == 'function') props.back([busScopeId, line]);
    if (typeof props?.onChange == 'function') props.onChange([busScopeId, line]);
  };
  // 改变平台
  const changePlat = async (id?: any, reGet?: boolean) => {
    if (id) {
      let res: any = await pubGetStoreList({ platform_id: id });
      // 国内发货计划且平台是天猫和京东POP特殊处理
      if (props?.isDelivery && tmPopObj[id]) {
        res = [
          {
            value: null,
            label: tmPopObj[id],
          },
        ];
      }
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
  useEffect(() => {
    getPlats();
    if (props?.initialValue?.[0]) {
      changePlat(props?.initialValue?.[0], true);
    }
  }, []);

  // 改变店铺时
  const changeProductLine = async (id?: any) => {
    console.log(id)
    setCheckStore(id);
    allBack(platId, id);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Select
        style={{ width: 140, marginRight: 2 }}
        placeholder={typeof placeholder == 'object' ? placeholder[0] : '平台'}
        allowClear
        defaultValue={props?.initialValue?.[0]}
        options={list}
        onChange={(v: any) => changePlat(v)}
      />
      <Select
        style={{ minWidth: 100 }}
        placeholder={typeof placeholder == 'object' ? placeholder[1] : '店铺'}
        allowClear
        value={checkStore}
        showSearch={true}
        filterOption={(input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        }}
        options={treeData}
        onChange={(v: any) => changeProductLine(v)}
      />
    </div>
  );
};

export default Comp;
