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
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import useTip from '../../useTip';
/*重要提示: 配置columns的width最小90, 不然可能会错位*/
const getScrollY = () => {
  const documentClientHeight = document.body?.clientHeight - 367;
  return documentClientHeight && documentClientHeight > 300 ? documentClientHeight : 610; // 表格默认高度
};
const rowHeight = 40;
const Index: React.FC<
  TableProps<any> & {
    scrollYSet: any;
    overscanCount?: number;
    scrollY?: number;
  }
> = (props) => {
  const { columns, scroll, scrollYSet, overscanCount = 1 } = props;
  const [tableWidth, setTableWidth] = useState(0);
  const [scrollLeftC, setScrollLeft] = useState(0);
  const [preCount, preCountSet] = useState(11);
  const [hasDColumns, hasDColumnsSet] = useState(true);
  const widthColumnCount = columns!.filter(
    ({ width, hideInTable }: any) => !width || !hideInTable,
  ).length;
  const { tipObj } = useTip();
  const types = () => [
    {
      name: '周销量',
      key: 'week_safe_num',
    },
    {
      name: '在途数量（PMC）',
      key: 'way_planed_send_num',
    },
    {
      name: '预留数量',
      key: 'total_reserved_num',
    },
    {
      name: '库存数量',
      key: 'inventory_num',
      editable: true,
    },
    {
      name: '周转天数',
      key: 'turnover_days',
      editable: true,
    },
  ];
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
  useEffect(() => {
    hasDColumnsSet(!!mergedColumnsTable?.filter((v: any) => v.dataIndex == 'type')?.length);
    mergedColumnsTable.forEach((v: any, i: number) => {
      if (v.dataIndex == 'type') {
        preCountSet(i);
      }
    });
  }, [mergedColumnsTable]);
  const gridRef = useRef<any>();
  const gridRef1 = useRef<any>();
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
      columnIndex: 10,
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
      <div
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
              style={{ overflowY: 'hidden', zIndex: 111 }}
              className={scrollLeftC ? 'virtual-grid1 shadow' : 'virtual-grid1'}
              columnWidth={(index: number) => {
                const { width } = mergedColumns[index];
                return totalHeight > scroll!.y! && index === mergedColumns.length - 1
                  ? (width as number) - scrollbarSize - 1
                  : (width as number);
              }}
              columnCount={hasDColumns && scrollLeftC >= 800 - (10 - preCount) * 100 ? 3 : 2}
              height={scroll!.y - 12}
              rowCount={rawData.length}
              rowHeight={() => rowHeight}
              width={hasDColumns && scrollLeftC >= 800 - (10 - preCount) * 100 ? 340 : 240}
              overscanCount={overscanCount}
            >
              {({ columnIndex, rowIndex, style }: any) => {
                const column: any = mergedColumns[columnIndex];
                const record: any = rawData[rowIndex];
                let text = record?.[column?.dataIndex];
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
                if (columnIndex == 2) {
                  text = (
                    <div className="fixed-details">
                      {types()?.map((v: any) => {
                        return (
                          <span key={v.key} className="fixed-item">
                            {v.name == '在途数量（PMC）' ? (
                              <>
                                在途数量
                                <br />
                                （PMC）
                              </>
                            ) : (
                              v.name
                            )}
                            <Tooltip placement="top" title={tipObj[v.name]}>
                              <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                          </span>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <div
                    className={classNames('virtual-table-cell', {
                      'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
                      hide: cellSpan?.rowSpan === 0,
                      'bg-red':
                        (record.type == '周转天数' || column?.dataIndex == 'safe_days') &&
                        typeof record?.[column?.dataIndex] == 'number' &&
                        record?.[column?.dataIndex] < 21,
                      'bg-yellow':
                        (record.type == '周转天数' || column?.dataIndex == 'safe_days') &&
                        typeof record?.[column?.dataIndex] == 'number' &&
                        record?.[column?.dataIndex] > 60,
                      bordrB2:
                        ((record?.rowSpan1 && column.onCell) || record.type == '周转天数') &&
                        !record?.lastRow,
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
                      overflowY: cellSpan?.rowSpan
                        ? columnIndex == 2
                          ? 'hidden'
                          : 'auto'
                        : 'hidden',
                      padding: columnIndex == 2 ? 0 : style.padding,
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
                marginLeft:
                  hasDColumns && scrollLeftC >= 800 - (10 - preCount) * 100 ? '-340px' : '-240px',
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
                onScroll({ scrollLeft });
                setScrollLeft(scrollLeft);
              }}
            >
              {({ columnIndex, rowIndex, style }: any) => {
                const column: any = mergedColumns[columnIndex];
                const record: any = rawData[rowIndex];
                let text = record?.[column?.dataIndex];
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
                      'bg-red':
                        ((record.type == '周转天数' && column?.dataIndex?.indexOf('周') > -1) ||
                          column.dataIndex == 'safe_days') &&
                        typeof record?.[column?.dataIndex] == 'string' &&
                        record?.[column?.dataIndex]?.indexOf('/') == -1 &&
                        record?.[column?.dataIndex] < 21,
                      'bg-yellow':
                        ((record.type == '周转天数' && column.dataIndex?.indexOf('周') > -1) ||
                          column?.dataIndex == 'safe_days') &&
                        typeof record?.[column?.dataIndex] == 'string' &&
                        record?.[column?.dataIndex]?.indexOf('/') == -1 &&
                        record?.[column?.dataIndex] > 60,
                      bordrB2:
                        ((record?.rowSpan1 && column.onCell) || record.type == '周转天数') &&
                        !record?.lastRow,
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
      <div
        className="detailTitle"
        style={{ display: hasDColumns && scrollLeftC >= 800 - (10 - preCount) * 100 ? '' : 'none' }}
      >
        明细
      </div>
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
        <>
          <Table
            {...props}
            style={{ width: widthColumnTotal }}
            showSorterTooltip={false}
            className={'virtual-table'}
            columns={mergedColumnsTable}
            pagination={false}
            components={{
              body:
                props?.dataSource?.length && mergedColumnsTable.length
                  ? renderVirtualList
                  : undefined,
            }}
          />
        </>
      </ResizeObserver>
    </>
  );
};

export default Index;
