import React, { useRef, useState } from 'react';
import { Button, Card, Descriptions, Space, DatePicker } from 'antd';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined } from '@ant-design/icons';
import type { TableListItem } from '@/types/account';
import type { ProFormInstance } from '@ant-design/pro-form';
import * as api from '@/services/pages/payment';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { priceValue } from '@/utils/filter';
import { useActivate } from 'react-activation';
import { IsGrey,pubGetSigningListContract } from '@/utils/pubConfirm';
import moment from 'moment';
import { useAccess, Access } from 'umi';

const Supplier: React.FC<{ dicList: any; toOrder: any }> = (props) => {
  const [tempKey, setTempKey] = useState(new Date().getTime());
  const [downloading, downloadingSet] = useState(false);
  const [amountData, amountDataSet] = useState<any[]>([]);
  const ref = useRef<ActionType>();
  const access = useAccess();
  const formRef = useRef<ProFormInstance>();
  // 搜索清除前后空格
  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
    };

    const res = await api.vendorPage(postData);
    // 获取统计信息
    const resAmount: any = await api.getAmountStatistics(postData);
    if (resAmount?.code != pubConfig.sCode) {
      pubMsg(resAmount?.message);
    } else {
      amountDataSet(resAmount.data);
    }
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  // keepAlive页面激活钩子函数
  useActivate(() => {
    setTempKey(new Date().getTime());
    ref?.current?.reload();
  });
  // 导出excel
  const downLoad = async () => {
    downloadingSet(true);
    const res: any = await api.exportData(formRef.current?.getFieldsFormatValue());
    downloadingSet(false);
    const type = res?.response?.headers.get('content-type');
    if (type === 'application/json') {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res?.response?.headers.get('content-disposition');
      let fileName = `付款统计明细表.xls`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      btn.download = fileName;
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
  };

  // 表格配置
  const columns: any = [
    {
      title: '供应商',
      dataIndex: 'vendor_name',
      debounceTime: 300,
      fieldProps: selectProps,
      align: 'center',
      valueType: 'select',
      request: pubGetSigningListContract,
      params: { tempKey },
      search: {
        transform: (v: any) => ({ vendor_id: v }),
      },
    },
    {
      title: '付款金额',
      dataIndex: 'amount',
      hideInSearch: true,
      align: 'right',
      render: (_: any, record: any) => {
        return IsGrey ? '' : priceValue(record.amount);
      },
    },
    {
      title: '币种',
      dataIndex: 'currency',
      hideInSearch: true,
      align: 'center',
      valueEnum: props.dicList.SC_CURRENCY,
    },
    {
      title: '付款月份',
      dataIndex: 'payment_time',
      align: 'center',
      valueType: 'dateMonth',
      initialValue: [moment().add(-1, 'month'), moment().add(-1, 'month')],
      renderFormItem: () => (
        <DatePicker.RangePicker picker="month" placeholder={['开始月份', '结束月份']} />
      ),
      search: {
        transform(date: any) {
          return {
            start_payment_time: date[0],
            end_payment_time: date[1],
          };
        },
      },
      sorter: (a: any, b: any) =>
        new Date(a.payment_time).getTime() - new Date(b.payment_time).getTime(),
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      align: 'center',
      fixed: 'right',
      valueType: 'option',
      render: (_: any, record: any) => {
        return [
          <a key="detail" onClick={() => props.toOrder(record)}>
            查看
          </a>,
        ];
      },
    },
  ];

  return (
    <>
      <ProTable<TableListItem>
        columns={columns}
        options={{ fullScreen: true, setting: false }}
        pagination={{
          showSizeChanger: true,
        }}
        actionRef={ref}
        formRef={formRef}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        request={getListAction}
        rowKey="vendor_id"
        search={{ defaultCollapsed: false, className: 'light-search-form' }}
        dateFormatter="string"
        headerTitle={false}
        tableExtraRender={() => (
          <Card>
            <Descriptions size="small" column={4} title="数据统计">
              {amountData.map((item: any) => (
                <Descriptions.Item
                  label={props?.dicList?.SC_CURRENCY[item.currency].detail_name}
                  key={item.currency}
                >
                  {IsGrey ? '' : priceValue(item.amount)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}
        toolBarRender={() => [
          <Space key="space">
            <Access key="exportButton" accessible={access.canSee('paymentStatistics_export')}>
              <Button
                type="primary"
                ghost
                loading={downloading}
                icon={<DownloadOutlined />}
                onClick={() => {
                  downLoad();
                }}
              >
                {downloading ? '导出中' : '导出明细'}
              </Button>
            </Access>
          </Space>,
        ]}
      />
    </>
  );
};

export default Supplier;
