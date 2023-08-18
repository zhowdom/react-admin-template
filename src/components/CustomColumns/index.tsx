import { Button, Drawer } from 'antd';
import { MenuOutlined, SaveOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { arrayMoveImmutable, ProTable, useRefFunction } from '@ant-design/pro-components';
import { useMemo, useState, useEffect } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import './index.less';
import { customColumnDelete, customColumnSet } from '@/services/base';
import { pubMsg } from '@/utils/pubConfig';
import { pubRefreshColumnList } from '@/utils/pubConfirm';
import { useModel } from 'umi';
import { sortBy } from 'lodash';
import { computedColumnTitle } from '@/utils/filter';
/*
 * 独立自定义列展示和排序组件, 如果使用ProTable建议用 @hooks/useCustomColumnSet.tsx实现自定义列配置
 * */

const DragHandle: any = SortableHandle(() => (
  <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
));

const columns: ProColumns[] = [
  {
    title: '排序',
    dataIndex: 'sort',
    width: 60,
    className: 'drag-visible',
    render: () => <DragHandle />,
    align: 'center',
  },
  {
    title: '指标',
    dataIndex: 'title',
    className: 'drag-visible',
  },
];

const Component: React.FC<{
  menuKey?: any;
  columnsData: any;
  onChange: any;
}> = ({ columnsData, menuKey, onChange }) => {
  const [open, openSet] = useState(false);
  const persistenceKey =
    window.location.pathname.replace(/\/$/, '') + '_customColumnsConfigIndependent_' + menuKey;
  const { initialState, setInitialState } = useModel('@@initialState');
  const [submitting, submittingSet] = useState(false);
  const customConfig = useMemo(
    () =>
      initialState?.currentUser?.customColumnSetting?.find(
        (item: any) => item.code == persistenceKey,
      ),
    [persistenceKey, initialState],
  );
  const columnsDataFormat = useMemo(() => {
    const temp = columnsData
      ?.filter(
        (item: any) =>
          !item.hideInSearch &&
          !!item.dataIndex &&
          !item.hideInSetting &&
          item.search != false &&
          item.valueType != 'option',
      )
      ?.map((item: any, index: any) => ({
        title: computedColumnTitle(item?.title, ''),
        dataIndex: item?.dataIndex,
        customSearchType: item?.customSearchType || {},
        index,
        show: true,
      }));
    if (customConfig?.json) {
      const resConfig = JSON.parse(customConfig?.json);
      temp.forEach((column: any) => {
        const matchedItem = resConfig.find((item: any) => item.dataIndex == column.dataIndex);
        if (!matchedItem) {
          resConfig.push({ ...column, index: resConfig.length, show: true });
        }
      });
      return resConfig;
    }
    return temp;
  }, [columnsData, customConfig]);
  const [dataSource, setDataSource] = useState(columnsDataFormat);
  useEffect(() => {
    setDataSource(columnsDataFormat);
  }, [columnsDataFormat]);
  useEffect(() => {
    if (onChange && dataSource) onChange(dataSource);
  }, [dataSource]);
  const [selectedRowKeys, selectedRowKeysSet] = useState(
    dataSource.filter((item: any) => !!item.show).map((item: any) => item.index),
  );
  const SortableItem: any = SortableElement((props: any) => <tr {...props} />);
  const SortContainer: any = SortableContainer((props: any) => <tbody {...props} />);
  const onSortEnd = useRefFunction(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      if (oldIndex !== newIndex) {
        const newData = arrayMoveImmutable({
          array: [...dataSource],
          fromIndex: oldIndex,
          toIndex: newIndex,
        }).filter((el) => !!el);
        setDataSource(newData);
      }
    },
  );
  const DraggableContainer = (props: any) => (
    <SortContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );
  const DraggableBodyRow = (props: any) => {
    const { className, style, ...restProps } = props;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex((x: any) => x.index === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };
  return (
    <>
      <Button size={'small'} type={'text'} onClick={() => openSet(true)}>
        设置默认展示指标
      </Button>
      <Drawer
        width={340}
        title={'设置默认展示指标'}
        onClose={() => openSet(false)}
        open={open}
        bodyStyle={{ padding: '0 10px 10px' }}
        className={'custom-search-drawer'}
      >
        <ProTable
          headerTitle={<span style={{ fontSize: 14 }}>勾选显示, 拖拽排序</span>}
          size={'small'}
          columns={columns}
          rowKey="index"
          search={false}
          options={false}
          pagination={false}
          tableAlertRender={false}
          cardProps={{
            bodyStyle: { padding: 0 },
          }}
          sticky={{ offsetHeader: 56 }}
          dataSource={dataSource}
          components={{
            body: {
              wrapper: DraggableContainer,
              row: DraggableBodyRow,
            },
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => {
              selectedRowKeysSet(keys);
              const newData = dataSource.map((item: any) => ({
                ...item,
                show: keys.includes(item.index),
              }));
              setDataSource(newData);
            },
          }}
          showSorterTooltip={false}
          toolBarRender={() => [
            customConfig?.id ? (
              <a
                key={'reset'}
                title={'重置并删除自定义配置'}
                onClick={() => {
                  if (customConfig?.id && !submitting) {
                    submittingSet(true);
                    customColumnDelete({ customColumnId: customConfig?.id })
                      .then((res) => {
                        if (res?.code == '0') {
                          pubRefreshColumnList(initialState, setInitialState);
                          pubMsg('重置成功!', 'success');
                          selectedRowKeysSet(dataSource.map((item: any) => item.index));
                        }
                      })
                      .finally(() => {
                        submittingSet(false);
                      });
                  }
                }}
              >
                重置
              </a>
            ) : null,
            <Button
              key={'save'}
              size={'small'}
              type={'primary'}
              icon={<SaveOutlined />}
              loading={submitting}
              onClick={() => {
                submittingSet(true);
                customColumnSet({
                  id: customConfig?.id || '',
                  code: persistenceKey,
                  json: JSON.stringify(dataSource),
                  isNotice: 'n',
                })
                  .then((res) => {
                    if (res?.code == '0') {
                      pubMsg('保存成功!', 'success');
                      pubRefreshColumnList(initialState, setInitialState);
                    } else {
                      pubMsg(res?.message);
                    }
                  })
                  .finally(() => {
                    submittingSet(false);
                  });
              }}
            >
              保存
            </Button>,
          ]}
          onChange={(pagination, filters, sorter: any) => {
            if (sorter.order) {
              const temp = sortBy(dataSource, [(o) => o[sorter.field]?.tag]);
              let tempSort = temp;
              if (sorter.order == 'descend') {
                tempSort = temp.reverse();
              }
              setDataSource(tempSort);
            } else {
              setDataSource(columnsDataFormat);
            }
          }}
        />
      </Drawer>
    </>
  );
};
export default Component;
