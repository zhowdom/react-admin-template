import { useState, useMemo, useEffect } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { scrollByColumn, computedColumnConfig } from '@/utils/filter';
import { customColumnDelete, customColumnSet } from '@/services/base';
import { pubGetColumnsState, pubRefreshColumnList } from '@/utils/pubConfirm';
import { SaveOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { pubMsg } from '@/utils/pubConfig';
/*
columns: table列配置
defaultScrollX: 默认滚动宽度
scrollCompensate: 滚动兼容: 正常一个column * 100px, 参数: scrollCompensate (正数number) 是滚动补偿, 适用于单元格合并或者标题比较长情况
tabKey: 页面按tabs存储自定义列配置
* */
const useCustomColumnSet = (
  columns: any[],
  defaultScrollX: number,
  tabKey: string = '',
  scrollCompensate?: number,
  defaultHideColumn?: string[],
  customKey?: string,
) => {
  const persistenceKey =
    customKey || window.location.pathname.replace(/\/$/, '') + '_customColumnsConfig_' + tabKey;
  const { initialState, setInitialState } = useModel('@@initialState');
  const [loadingCustomColumn, loadingCustomColumnSet] = useState<any>(false);
  const customColumnSetting = useMemo(
    () =>
      initialState?.currentUser?.customColumnSetting?.find(
        (item: any) => item.code == persistenceKey,
      ),
    [persistenceKey, initialState],
  );
  const [columnsState, columnsStateSet] = useState<any>(
    pubGetColumnsState(columns, customColumnSetting, defaultHideColumn),
  );
  useEffect(() => {
    columnsStateSet(pubGetColumnsState(columns, customColumnSetting,defaultHideColumn));
  }, [tabKey]);
  const scrollX = useMemo(
    () => scrollByColumn(columnsState, scrollCompensate) || defaultScrollX,
    [columnsState, defaultScrollX, scrollCompensate],
  );
  return {
    scroll: { x: scrollX },
    customColumnSetting,
    columnsState: {
      value: columnsState,
      onChange: (stateMap: any) => {
        columnsStateSet(stateMap);
      },
    },
    options: {
      setting: {
        checkedReset: false,
        extra: (
          <>
            {customColumnSetting?.id ? (
              <a
                style={{ marginLeft: '4px' }}
                onClick={() => {
                  customColumnDelete({
                    customColumnId: customColumnSetting?.id,
                  }).then(() => {
                    pubRefreshColumnList(initialState, setInitialState);
                  });
                  columnsStateSet(pubGetColumnsState(columns));
                }}
              >
                重置
              </a>
            ) : null}
            <Button
              size={'small'}
              type={'primary'}
              icon={<SaveOutlined />}
              loading={loadingCustomColumn}
              onClick={() => {
                loadingCustomColumnSet(true);
                customColumnSet({
                  id: customColumnSetting?.id || '',
                  code: persistenceKey,
                  json: JSON.stringify(columnsState),
                  isNotice: 'n',
                })
                  .then((res) => {
                    if (res?.code == '0') pubMsg('保存成功!', 'success');
                    pubRefreshColumnList(initialState, setInitialState);
                  })
                  .finally(() => {
                    loadingCustomColumnSet(false);
                  });
              }}
            >
              保存
            </Button>
          </>
        ),
      },
    },
    customExportConfig: computedColumnConfig(columns, columnsState),
  };
};
export default useCustomColumnSet;
