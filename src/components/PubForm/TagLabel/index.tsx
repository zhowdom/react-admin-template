import { Select, Modal } from 'antd';
import { useState, useEffect } from 'react';
import * as api from '@/services/pages/SettingManage';
import { pubConfig } from '@/utils/pubConfig';
import { history } from 'umi';

// 分类和标签父子联动
const Component: React.FC<{
  value?: string[];
  onChange?: any;
  categoryId?: any;
  categoryName?: any;
  init?: any;
}> = ({ onChange, value, categoryId = '', categoryName = '', init = false }) => {
  const [parentTags, parentTagsSet] = useState([]);
  const [childTags, childTagsSet] = useState([]);
  const [parentTag, parentTagSet] = useState(value ? value[0] || '' : null);
  const [childTag, childTagSet] = useState(value ? value[1] || '' : null);

  const getTags = async (parentId: string) => {
    const res = await api.tagPage({
      pageSize: 9999,
      pageIndex: 1,
      parentId,
      categoryId,
    });
    if (res?.code == pubConfig.sCode && res?.data?.list) {
      if (res.data.list.length == 0 && categoryId) {
        Modal.confirm({
          title: '温馨提示',
          content: `产品线:${categoryName} 暂无可选的分类标签`,
          okText: '自定义分类标签管理',
          onOk: () => {
            history.push('/setting-manage-report/custom-tag');
          },
        });
      }
      const list = res.data.list.map((item: any) => ({
        ...item,
        label: `${item.labelName}(${item.categoryName})`,
        value: item.id,
      }));
      if (parentId == '0') {
        parentTagsSet(list);
      } else {
        childTagsSet(list);
      }
    }
    return [];
  };

  useEffect(() => {
    getTags('0');
    if (value && value[0] !== '0') {
      getTags(value[0]);
    }
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Select
        placeholder={'父标签'}
        style={{ width: '120px' }}
        onChange={(val: any) => {
          parentTagSet(val);
          childTagsSet([]);
          childTagSet('');
          getTags(val);
          onChange([val, '']);
        }}
        defaultValue={init ? parentTag : null}
        options={parentTags}
        allowClear
      />
      <Select
        placeholder={'子标签'}
        allowClear
        value={childTag}
        defaultValue={init ? childTag : null}
        style={{ minWidth: '80px', flex: 1, marginLeft: '2px' }}
        onChange={(val: any) => {
          childTagSet(val);
          onChange([parentTag, val]);
        }}
        options={childTags}
      />
    </div>
  );
};
export default Component;
