import { SettingOutlined } from '@ant-design/icons';
import { Button, Popover, Checkbox, Tree } from 'antd';
import useCustomColumnSet from '@/hooks/useCustomColumnSet';
import React, { useEffect, useMemo, useState } from 'react';
import { pubGetColumnsState } from '@/utils/pubConfirm';
import './index.less';
// 自定义列设置
const CustomColumnSet: React.FC<{
  refreshColumns?: number;
  columns: any;
  customColumnsSet: any;
  customExportConfigSet?: any;
  customClassName?: string;
  defaultHideColumn?: any;
  customTitle?: any;
}> = ({
  columns,
  customColumnsSet,
  customExportConfigSet = Function.prototype,
  refreshColumns,
  customClassName,
  defaultHideColumn,
  customTitle,
}) => {
  // 自定义列 配置
  const { options, columnsState, customColumnSetting, customExportConfig } = useCustomColumnSet(
    columns,
    99,
    '',
    undefined,
    defaultHideColumn,
  );
  const treeData: any[] = useMemo(() => {
    return columns
      ?.filter((item: any) => !item.hideInTable)
      ?.map((item: any) => ({
        title: item.title,
        key: item.dataIndex,
        hideInSetting: item.hideInSetting,
      }));
  }, [columns]);
  const onChange = (keys: any[]) => {
    customColumnsSet(keys);
    const postData = {};
    treeData.forEach((item) => (postData[item.key] = { show: keys.includes(item.key) }));
    columnsState.onChange(postData);
  };
  const checkedKeys = useMemo(() => {
    // 接口返回自定义配置后
    if (columnsState?.value && Object.keys(columnsState?.value)?.length > 0) {
      let keys = Object.keys(columnsState?.value).filter((key) =>
        treeData.find((item) => item.key == key),
      );
      keys = keys.filter((key) => columnsState?.value[key]?.show);
      return keys;
    }
    return columns?.filter((item: any) => !item.hideInTable).map((item: any) => item.dataIndex);
  }, [columns, columnsState?.value, treeData]);
  const [checkedAll, checkedAllSet] = useState<boolean>(treeData.length == checkedKeys.length);
  useEffect(() => {
    customColumnsSet(checkedKeys);
    customExportConfigSet(customExportConfig);
  }, [checkedKeys]);

  useEffect(() => {
    console.log(11);
    columnsState.onChange(pubGetColumnsState(columns, customColumnSetting, defaultHideColumn));
  }, [refreshColumns]);

  return (
    <Popover
      trigger={'click'}
      placement="bottom"
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
          }}
        >
          <Checkbox
            onChange={(e) => {
              checkedAllSet(e?.target.checked);
              if (e?.target.checked) {
                const keys = treeData.map((item) => item.key);
                onChange(keys);
              } else {
                onChange([]);
              }
            }}
            checked={checkedAll}
          >
            列展示
          </Checkbox>
          {options?.setting?.extra}
        </div>
      }
      content={
        <Tree
          className={customClassName}
          style={{ width: 200 }}
          treeData={treeData
            .filter((v: any) => !v.hideInSetting)
            ?.map((c: any) => ({ ...c, title: customTitle?.[c?.key] ?? c.title }))}
          checkedKeys={checkedKeys}
          selectable={false}
          checkable
          blockNode
          onCheck={(keys: any) => {
            checkedAllSet(treeData.length == keys.length);
            onChange(keys);
          }}
        />
      }
    >
      <Button type={'text'} icon={<SettingOutlined />} />
    </Popover>
  );
};
export default CustomColumnSet;
