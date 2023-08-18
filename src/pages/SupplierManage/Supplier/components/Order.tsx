import { PageContainer } from '@ant-design/pro-layout';
import { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Link, history } from 'umi';
import { exportPdf, getList } from '@/services/pages/purchaseOrder';
import { Button } from 'antd';

const Order = () => {
  const [downLoading, setDownLoading] = useState({});
  const [viewLoading, setViewLoading] = useState({});
  // 获取表格数据
  const getListAction = async (params: any): Promise<any> => {
    const postData = {
      ...params,
      current_page: params?.current,
      page_size: params?.pageSize,
      vendor_id: history?.location?.query?.id || null,
    };
    const res = await getList(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    res?.data?.records.forEach((v: any, i: number) => {
      setDownLoading((pre: any) => {
        return {
          ...pre,
          [`${i}`]: false,
        };
      });
      setViewLoading((pre: any) => {
        return {
          ...pre,
          [`${i}`]: false,
        };
      });
      v.index = i + '';
    });
    return {
      data: res?.data?.records || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };

  // 预览/ 导出采购单pdf
  const downLoadPdf = async (id: any[], t: string, index: string) => {
    if (t == 'view') {
      setViewLoading((pre: any) => {
        return {
          ...pre,
          [`${index}`]: true,
        };
      });
    } else {
      setDownLoading((pre: any) => {
        return {
          ...pre,
          [`${index}`]: true,
        };
      });
    }
    const params = {
      id: id.join(','),
    };
    const res: any = await exportPdf(params);
    const type = res.response.headers.get('content-type');
    if (type.indexOf('application/json') > -1) {
      pubMsg(res?.message);
    } else {
      const blob = new Blob([res.data], {
        type: 'application/pdf;chartset=UTF-8',
      });
      const objectURL = URL.createObjectURL(blob);
      const btn = document.createElement('a');
      const fileData = res.response.headers.get('content-disposition');
      let fileName = `采购单.pdf`;
      if (fileData) {
        fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
      }
      if (t === 'down') {
        btn.download = fileName;
      }
      btn.target = '_blank';
      btn.href = objectURL;
      btn.click();
      URL.revokeObjectURL(objectURL);
    }
    if (t == 'view') {
      setViewLoading((pre: any) => {
        return {
          ...pre,
          [`${index}`]: false,
        };
      });
    } else {
      setDownLoading((pre: any) => {
        return {
          ...pre,
          [`${index}`]: false,
        };
      });
    }
  };
  const formRef = useRef<ProFormInstance>();
  const ref = useRef<ActionType>();
  const columns: any[] = [
    {
      title: '采购单号',
      dataIndex: 'order_no',
      align: 'center',
      width: 180,
      render: (_: any, record: any) => {
        return (
          <div className="order-wrapper">
            <Link to={`/purchase-manage/order-detail?id=${record.id}`}>
              <span
                className="c-order"
                style={{
                  margin: record.approval_status === '8' ? '8px 0' : 0,
                }}
              >
                {record.order_no}
              </span>
            </Link>
          </div>
        );
      },
    },
    {
      title: '签约主体（我司）',
      dataIndex: 'main_name',
      align: 'center',
    },
    {
      title: '签约时间',
      dataIndex: 'signing_time',
      align: 'center',
    },
    {
      title: '签约采购单（PDF）',
      key: 'option',
      width: 220,
      align: 'center',
      valueType: 'option',
      fixed: 'right',
      render: (_: any, record: any) => {
        return [
          <Button
            type="link"
            onClick={() => downLoadPdf([record.id], 'down', record.index)}
            key="down"
            loading={downLoading[record.index]}
          >
            下载采购单
          </Button>,
          <Button
            onClick={() => downLoadPdf([record.id], 'view', record.index)}
            key="view"
            type="link"
            loading={viewLoading[record.index]}
          >
            预览采购单
          </Button>,
        ];
      },
    },
  ];

  return (
    <>
      <PageContainer
        header={{
          title: false,
          breadcrumb: {},
        }}
      >
        <ProTable
          columns={columns}
          actionRef={ref}
          options={false}
          pagination={{
            showSizeChanger: true,
          }}
          formRef={formRef}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={false}
          rowKey="id"
          dateFormatter="string"
          headerTitle={false}
          bordered
          // toolBarRender={() => [
          //   <Button key="downLoad" onClick={downLoad} type="primary" ghost>
          //     导出日志
          //   </Button>,
          // ]}
        />
      </PageContainer>
    </>
  );
};

export default Order;
