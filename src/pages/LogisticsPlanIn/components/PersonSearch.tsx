import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { pubGetUserList } from '@/utils/pubConfirm';
import { principalList } from '@/services/pages/logisticsManageIn/lsp';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { principalList as principalList1 } from '@/services/pages/logisticsPlanIn';

const Comp = (props: any) => {
  const [selectValue, setSelectValue] = useState<any>('');
  const [selectId, setSelectId] = useState('wl');
  const [options, setOptions] = useState([]);
  // 返回到页面
  const allBack = (label: string, value: any) => {
    props.onChange([label, value]);
  };
  // 改变类型时
  const changeSelect = async (id?: any) => {
    setSelectId(id);
    setSelectValue(null)
    allBack(id, null);
  };
  // 改变值时
  const changeValue = async (value?: any) => {
    setSelectValue(value);
    allBack(selectId, value);
  };
  // 获取采购负责人
  const pubGetUserListAction = async (): Promise<any> => {
    const res: any = await pubGetUserList();
    setOptions(res || []);
  };
  // 获取物流负责人
  const pubWlListAction = async (): Promise<any> => {
    const res = await principalList({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setOptions([]);
      return;
    }
    const newArray = res?.data.map((v: any) => {
      return {
        ...v,
        value: v.user_id,
        label: `${v.name}(${v.account})`,
        name: v.name,
      };
    });
    setOptions(newArray);
  };
  // 获取PMC负责人
  const pubPmcListAction = async (): Promise<any> => {
    const res: any = await principalList1({});
    if (res.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setOptions([]);
      return;
    }

    const data = res?.data
      ?.filter((a: any) => a)
      ?.map((c: any) => ({ value: c.user_id, label: `${c.name}(${c.account})` }));
    setOptions(data);
  };
  useEffect(() => {
    // 采购负责人
    if (selectId == 'cg') {
      pubGetUserListAction();
      // PMC负责人
    } else if (selectId == 'pmc') {
      pubPmcListAction();
    }
    // 物流负责人
    else if (selectId == 'wl') {
      pubWlListAction();
    }
  }, [selectId]);
  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <div style={{ width: '120px', paddingRight: '5px' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择类型"
          defaultValue="wl"
          options={[
            {
              label: 'PMC负责人',
              value: 'pmc',
            },
            {
              label: '采购负责人',
              value: 'cg',
            },
            {
              label: '物流负责人',
              value: 'wl',
            },
          ]}
          onChange={(v: any) => changeSelect(v)}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Select
          placeholder="请选择"
          allowClear
          showSearch={true}
          value={selectValue}
          filterOption={(input: any, option: any) => {
            const trimInput = input.replace(/^\s+|\s+$/g, '');
            if (trimInput) {
              return option.label.indexOf(trimInput) >= 0;
            } else {
              return true;
            }
          }}
          options={options}
          onChange={(v: any) => changeValue(v)}
        />
      </div>
    </div>
  );
};
export default Comp;
