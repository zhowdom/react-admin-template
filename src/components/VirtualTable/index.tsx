import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Tooltip } from 'antd';
import type { TableProps } from 'antd';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
//@ts-ignore
import { VariableSizeGrid as Grid } from 'react-window';
// @ts-ignore
import accounting from 'accounting';
import './index.less';
import { pubFilter, pubMyFilter } from '@/utils/pubConfig';
import { InfoCircleOutlined } from '@ant-design/icons';

const rowHeight = 40;
const Index: React.FC<
  TableProps<any> & {
    scrollYSet: any;
    overscanCount?: number;
    from?: any;
  }
> = (props) => {
  const { columns, scroll, scrollYSet, overscanCount = 1, from } = props;

  const [tableWidth, setTableWidth] = useState(0);
/*重要提示: 配置columns的width最小90, 不然可能会错位*/
const getScrollY = () => {
  const documentClientHeight = from == 'vv' ? document.body?.clientHeight - 330 : document.body?.clientHeight - 367;
  return documentClientHeight && documentClientHeight > 300 ? documentClientHeight : 610; // 表格默认高度
};
  const widthColumnCount = columns!.filter(
    ({ width, hideInTable }: any) => !width || !hideInTable,
  ).length;
  // 格式化columns
  const columnFlat: any = columns
    ?.map((item: any) => (item?.children?.length > 0 ? item?.children : item))
    ?.flat();
  const formatColumns = (data: any[]) => {
    return data!
      .filter(({ hideInTable }: any) => !hideInTable)!
      .map((column: any) => {
        let tempColumn = column;
        if (tempColumn?.tooltip) {
          tempColumn = {
            ...tempColumn,
            title: (
              <>
                {tempColumn.title}
                <Tooltip title={tempColumn.tooltip} className={'ml-1'}>
                  <InfoCircleOutlined />
                </Tooltip>
              </>
            ),
          };
        }
        if (tempColumn.width) {
          return tempColumn;
        }
        return {
          ...tempColumn,
          width: Math.floor(tableWidth / widthColumnCount),
        };
      });
  };
  const mergedColumns: any = formatColumns(columnFlat);
  // 包含children的columns
  const mergedColumnsTable: any = formatColumns(columns as any[]);
  const gridRef = useRef<any>();

  const [connectObject] = useState<any>(() => {
    const obj = {};
    Object.defineProperty(obj, 'scrollLeft', {
      get: () => {
        if (gridRef.current) {
          return gridRef.current?.state?.scrollLeft;
        }
        return null;
      },
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({ scrollLeft });
        }
      },
    });
    return obj;
  });

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      shouldForceUpdate: true,
    });
  };
  const widthColumnTotal = useMemo(() => {
    return mergedColumns.reduce((result: number, current: any) => result + current.width, 0);
  }, [mergedColumns]);
  useEffect(() => resetVirtualGrid, [tableWidth, mergedColumns]);

  const renderVirtualList: React.FC<any> = (
    rawData: object[],
    { scrollbarSize, ref, onScroll }: any,
  ) => {
    ref.current = connectObject;
    const totalHeight = rawData.length * rowHeight;

    return (
      <Grid
        ref={gridRef}
        className="virtual-grid"
        columnCount={mergedColumns.length}
        columnWidth={(index: number) => {
          const { width } = mergedColumns[index];
          return totalHeight > scroll!.y! && index === mergedColumns.length - 1
            ? (width as number) - scrollbarSize - 1
            : (width as number);
        }}
        height={scroll!.y}
        rowCount={rawData.length}
        rowHeight={() => rowHeight}
        width={tableWidth}
        overscanCount={overscanCount}
        onScroll={({ scrollLeft }: { scrollLeft: number }) => {
          onScroll({ scrollLeft });
        }}
      >
        {({ columnIndex, rowIndex, style }: any) => {
          const column: any = mergedColumns[columnIndex];
          const record: any = rawData[rowIndex];
          let text = record[column.dataIndex];
          // 单元格合并
          let cellSpan: any = null;
          if (column.onCell) {
            cellSpan = column.onCell(record);
          }
          // valueType
          if (column.valueType == 'digit') {
            text = accounting.formatNumber(text);
          } else if (column.valueType == 'money') {
            text = accounting.formatNumber(text, 2);
          }
          // valueEnum or options
          if (column.valueEnum) {
            text = pubFilter(column.valueEnum, text);
          } else if (column.options || column?.fieldProps?.options) {
            text = pubMyFilter(column.options || column.fieldProps.options, text);
          }
          // render or renderText
          if (column.render) {
            text = column?.render(text, record);
          } else if (column.renderText) {
            text = column?.renderText(text, record);
          }
          // console.log(record?.region_name,99999)
          return (
            <div
              className={classNames('virtual-table-cell', {
                'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
                hide: cellSpan?.rowSpan === 0,
                'bg-blue':
                  from == 'vv'
                    ? record.region_name == '合计'
                    : rowIndex % 2 == 1 && !cellSpan?.rowSpan,
                'bg-red':
                  from == 'vv' &&
                  [
                    'total_available_day',
                    'two_week_total_available_day',
                    'planned_available_day',
                    'two_week_planned_available_day',
                  ].includes(column.dataIndex) &&
                  typeof record?.[column.dataIndex] == 'string' &&
                  record?.[column.dataIndex] <= 10 &&
                  [1,2].includes(record?.life_cycle), // 仅测试期和稳定期，可用天数小于等于10天显示底色红色 2023-05-10,
                'bg-yellow':
                  from == 'vv' &&
                  [
                    'total_available_day',
                    'two_week_total_available_day',
                    'planned_available_day',
                    'two_week_planned_available_day',
                  ].includes(column.dataIndex) &&
                  typeof record?.[column.dataIndex] == 'string' &&
                  record?.[column.dataIndex] >= 45,
              })}
              style={{
                ...style,
                justifyContent:
                  column.align == 'right'
                    ? 'flex-end'
                    : column.align == 'center'
                    ? 'center'
                    : 'flex-start',
                height: cellSpan?.rowSpan ? style.height * cellSpan?.rowSpan : style.height,
                overflowY: cellSpan?.rowSpan ? 'auto' : 'hidden',
              }}
            >
              {text || text == 0 ? text : '-'}
            </div>
          );
        }}
      </Grid>
    );
  };

  return (
    <ResizeObserver
      onResize={({ width }) => {
        const searchHeight: number | undefined = document
          .querySelector('.ant-pro-form-query-filter')
          ?.getBoundingClientRect()?.height;
        if (Number(searchHeight) > 55) {
          scrollYSet(getScrollY());
        } else {
          scrollYSet(getScrollY() + 50);
        }
        setTableWidth(width);
      }}
    >
      <Table
        {...props}
        style={{ width: widthColumnTotal }}
        showSorterTooltip={false}
        className={'virtual-table'}
        columns={mergedColumnsTable}
        pagination={false}
        components={{
          body: props?.dataSource?.length ? renderVirtualList : undefined,
        }}
      />
    </ResizeObserver>
  );
};

export default Index;
