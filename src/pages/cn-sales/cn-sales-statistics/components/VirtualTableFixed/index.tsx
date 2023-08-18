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
/*重要提示: 配置columns的width最小90, 不然可能会错位*/
const getScrollY = () => {
  const documentClientHeight = document.body?.clientHeight - 408;
  return documentClientHeight && documentClientHeight > 300 ? documentClientHeight : 610; // 表格默认高度
};
const rowHeight = 40;
const Index: React.FC<
  TableProps<any> & {
    scrollYSet: any;
    _ref: any;
    overscanCount?: number;
    scrollY?: number;
    columnsWidth?: any
    customTitle?: any
    columnsWidthSet?: any
  }
> = (props) => {
  const { columns, scroll, scrollYSet, overscanCount = 1, _ref ,columnsWidth,columnsWidthSet} = props;
  console.log(columns,'columns')
  const [tableWidth, setTableWidth] = useState(0);
  const [scrollLeftC, setScrollLeft] = useState(0);
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
        console.log(tableWidth,widthColumnCount,999)
        // console.log({
        //   ...tempColumn,
        //   width: Math.floor(tableWidth / widthColumnCount),
        // })
        // setColumnWidth(1822 / widthColumnCount)
        // return {
        //   ...tempColumn,
        //   width: columnsWidth,
        // }

        // if (tempColumn.width) {
        //   return tempColumn;
        // }

        return {
          ...tempColumn,
          width: columnsWidth,
        };
      });
  };
  const mergedColumns: any = formatColumns(columnFlat);
  // 包含children的columns
  const mergedColumnsTable: any = formatColumns(columns as any[]);
  console.log(mergedColumnsTable,'mergedColumnsTable')
  const gridRef = useRef<any>();
  const gridRef1 = useRef<any>();
  const wrapperRef = useRef<any>();
  _ref.current = {
    resetScroll: () => {
      console.log(wrapperRef?.current?.scrollTo,55)
      wrapperRef?.current?.scrollTo(0,0)
    },
  };
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
  const reGetWidth = () => {
    const demo1: any = document.querySelector('.warning>.ant-card-body');
    const demo1_w: any =
      Number(window.getComputedStyle(demo1).getPropertyValue('width').replaceAll('px', '')) - 24;
      columnsWidthSet(widthColumnCount * 100 > demo1_w ? 100 : Math.floor(demo1_w/widthColumnCount))
  }
  useEffect(() => resetVirtualGrid, [tableWidth, mergedColumns]);
  const renderVirtualList: React.FC<any> = (
    rawData: object[],
    { scrollbarSize, ref, onScroll }: any,
  ) => {
    ref.current = connectObject;
    const totalHeight = rawData.length * rowHeight;
    return (
      <div
      key={columnsWidth}
        ref={wrapperRef}
        style={{ height: scroll!.y, overflowY: 'auto', width: tableWidth + 12 }}
        onScroll={(e) => {
          gridRef1?.current?.scrollTo({ scrollTop: e.target.scrollTop });
          gridRef?.current?.scrollTo({ scrollTop: e.target.scrollTop });
          return false;
        }}
      >
        <div style={{ height: totalHeight + 12 }}>
          <div style={{ position: 'sticky', top: '0', display: 'flex' }}>
            <Grid
              ref={gridRef1}
              style={{
                overflowY: 'hidden',
                zIndex: 111,
                display: mergedColumnsTable?.filter((v: any) => v.fixed == 'left')?.length
                  ? 'block'
                  : 'none',
              }}
              className={scrollLeftC ? 'virtual-grid1 shadow' : 'virtual-grid1'}
              columnWidth={(index: number) => {
                const { width } = mergedColumns[index];
                return totalHeight > scroll!.y! && index === mergedColumns.length - 1
                  ? (width as number) - scrollbarSize - 1
                  : (width as number);
              }}
              columnCount={mergedColumnsTable?.filter((v: any) => v.fixed == 'left')?.length}
              height={scroll!.y - 12}
              rowCount={rawData.length}
              rowHeight={() => rowHeight}
              width={mergedColumnsTable?.filter((v: any) => v.fixed == 'left')?.length * columnsWidth || 0}
              overscanCount={overscanCount}
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
                return (
                  <div
                    className={classNames('virtual-table-cell', {
                      'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
                      hide: cellSpan?.rowSpan === 0,
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
                      // minHeight: cellSpan?.rowSpan ? '100px': style.height,
                      overflowY: cellSpan?.rowSpan ? 'auto' : 'hidden',
                      width: columnsWidth,
                      // left: style.left + (style.left - columnsWidth)
                    }}
                  >
                    {text ?? '-'}
                  </div>
                );
              }}
            </Grid>
            <Grid
              ref={gridRef}
              style={{
                overflowY: 'hidden',
                marginLeft: `-${
                  mergedColumnsTable?.filter((v: any) => v.fixed == 'left')?.length * columnsWidth || 0
                }px`,
              }}
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
              onScroll={({ scrollLeft }: { scrollLeft: number; scrollTop: number }) => {
                console.log(scrollLeft,'scrollLeft')
                console.log(columnsWidth,'columnsWidth')
                onScroll({ scrollLeft });
                setScrollLeft(scrollLeft);
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
                  text = text ? accounting.formatNumber(text) : text;
                } else if (column.valueType == 'money') {
                  text = text ? accounting.formatNumber(text, 2) : text;
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
                return (
                  <div
                    className={classNames('virtual-table-cell', {
                      'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
                      hide: cellSpan?.rowSpan === 0,
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
                      // left: style.left + (columnsWidth-style.left)
                    }}
                  >
                    {text ?? '-'}
                  </div>
                );
              }}
            </Grid>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
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
          console.log(width,888)
          setTableWidth(width);
        }}
      >
        <>
        <Table
            {...props}
            style={{ width: widthColumnTotal }}
            showSorterTooltip={false}
            className={'virtual-table'}
            columns={mergedColumnsTable}
            key={columnsWidth}
            pagination={false}
            sticky={{ offsetHeader: 48 }}
            components={{
              body: props?.dataSource?.length ? renderVirtualList : undefined,
            }}
          />
        </>
      </ResizeObserver>
    </>
  );
};

export default Index;
