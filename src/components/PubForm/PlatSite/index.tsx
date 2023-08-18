import { useState } from 'react';
import { connect } from 'umi';
import { ProFormSelect } from '@ant-design/pro-form';
import './style.less';
import { getSysPlatformPage } from '@/services/pages/storageManage';

const ProductLine = (props: any) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [lineIds, setLineIds] = useState([]);
  const [busId, setBusId] = useState('');

  // 返回到页面
  const allBack = (busScopeId: string, line: string) => {
    if (typeof props.back === 'function') props.back([busScopeId, line]);
  };

  // 改变平台
  const changePlat = async (id?: any) => {
    if (id) {
      setTreeData(props?.dicList?.FIRST_TRANSPORT_QUOTE_SHOP_SITE);
    } else {
      setTreeData([]);
    }
    setBusId(id);
    setLineIds([]);
    allBack(id, '');
    if (props?.onChange) props?.onChange([id, '']);
  };
  // 改变站点时
  const changeSite = async (id?: any) => {
    setLineIds(id);
    allBack(busId, id.toString());
    console.log([busId, id.toString()]);
    if (props?.onChange) props?.onChange([busId, id.toString()]);
  };

  return (
    <div className="pub-my-product-line">
      <div style={{ width: '120px', paddingRight: '5px' }}>
        <ProFormSelect
          style={{ width: '100%' }}
          placeholder="选择平台"
          allowClear
          request={async (v: any) => {
            const res: any = await getSysPlatformPage({
              ...v,
              business_scope: 'IN',
              name: 'AmazonSC',
              current_page: 1,
              page_size: 10,
            });
            return res?.data?.records?.map((i: any) => {
              return {
                value: i.id,
                label: i.name,
              };
            });
          }}
          fieldProps={{
            onChange: (v: any) => changePlat(v),
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <ProFormSelect
          style={{ width: '100%' }}
          placeholder="选择站点"
          allowClear
          showSearch
          debounceTime={300}
          valueEnum={treeData}
          fieldProps={{
            autoClearSearchValue: true,
            value: lineIds,
            mode: 'multiple',
            filterOption: (input: any, option: any) => {
              const trimInput = input.replace(/^\s+|\s+$/g, '');
              if (trimInput) {
                return option.label.indexOf(trimInput) >= 0;
              } else {
                return true;
              }
            },
            onChange: (vid) => {
              changeSite(vid);
            },
          }}
        />
      </div>
    </div>
  );
};
const Page: React.FC<any> = connect(({ common }: any) => ({ common }))(ProductLine);
export default Page;
