import { useEffect, useState } from 'react';
import { connect } from 'umi';
import { Select } from 'antd';
import { pubProLineList } from '@/utils/pubConfirm';
import { ProFormSelect } from '@ant-design/pro-form';
import './style.less';

const ProductLine = (props: any) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [lineIds, setLineIds] = useState([]);
  const [busId, setBusId] = useState('');
  const businessScope = props?.common.dicList.SYS_BUSINESS_SCOPE;
  const list = [];

  // 返回到页面
  const allBack = (busScopeId: string, line: string, lineName: string) => {
    if (typeof props?.back === 'function') props.back([busScopeId, line, lineName]);
    if (typeof props?.onChange === 'function') props.onChange([busScopeId, line, lineName]);
  };
  for (const i in businessScope) {
    list.push({
      label: businessScope[i].detail_name,
      value: i,
    });
  }

  // 改变业务范畴时
  const changeBusinessScope = async (id?: any) => {
    if (id) {
      const res: any = await pubProLineList({ business_scope: id });
      setTreeData(res);
    } else {
      setTreeData([]);
    }
    setBusId(id);
    setLineIds([]);
    allBack(id, '', '');
  };
  useEffect(() => {
    if (props?.defaultValue) {
      changeBusinessScope(props?.defaultValue);
    }
    if (props?.value && props?.value?.length) {
      changeBusinessScope(props?.value[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 改变产品线时
  const changeProductLine = async (id?: any, item?: any) => {
    console.log(item)
    setLineIds(id);
    allBack(busId, id?.toString() || '', item?.label);
  };

  return (
    <div className="pub-my-product-line">
      {!props?.defaultValue && (
        <div style={{ width: '80px', paddingRight: '5px' }}>
          <Select
            disabled={props?.defaultValue}
            style={{ width: '100%' }}
            placeholder="类型"
            allowClear={props?.allowClear && props?.allowClear?.length ? props?.allowClear[0]:true}
            options={list}
            defaultValue={props?.value && props?.value?.length ? props?.value[0]:''}
            onChange={(v: any) => changeBusinessScope(v)}
          />
        </div>
      )}

      <div style={{ flex: 1 }}>
        <ProFormSelect
          style={{ width: '100%' }}
          placeholder="选择产品线"
          allowClear={props?.allowClear && props?.allowClear?.length ? props?.allowClear[1]:true}
          showSearch
          debounceTime={300}
          fieldProps={{
            autoClearSearchValue: true,
            value: lineIds,
            mode: props.single ? undefined : 'multiple',
            options: treeData,
            filterOption: (input: any, option: any) => {
              const trimInput = input.replace(/^\s+|\s+$/g, '');
              if (trimInput) {
                return option.label.indexOf(trimInput) >= 0;
              } else {
                return true;
              }
            },
            onChange: (vid,data) => {
              changeProductLine(vid,data);
            },
          }}
        />
      </div>
    </div>
  );
};
const Page: React.FC<any> = connect(({ common }: any) => ({ common }))(ProductLine);
export default Page;
