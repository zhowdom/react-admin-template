import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { vendorContractFindByVendorId } from '@/services/pages/supplier';
import { pubDownLoad } from '@/utils/pubConfirm';
import { useAccess } from 'umi';

const Contract = (props: any) => {
  const access = useAccess();
  // 下载
  const downLoad: any = (row: any) => {
    if (!row.download_url) return pubMsg('当前合同无合同文件！');
    pubDownLoad(row?.download_url, row.name);
  };
  // 获取表格数据
  const getListAction = async (): Promise<any> => {
    const postData = {
      vendor_id: props.id,
    };
    const res = await vendorContractFindByVendorId(postData);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data || [],
      success: true,
      total: 0,
    };
  };
  const columns: any[] = [
    {
      title: '合同编号',
      dataIndex: 'code',
      align: 'center',
    },
    {
      title: '合同名称',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: '合同起始日期',
      dataIndex: 'begin_time',
      align: 'center',
    },
    {
      title: '合同截止日期',
      dataIndex: 'end_time',
      align: 'center',
    },

    {
      title: '操作',
      key: 'option',
      width: 120,
      align: 'center',
      valueType: 'option',
      hideInTable: !access.canSee('supplier_contract_detail'),
      render: (_: any, row: any) => {
        return row.download_url
          ? [
              <a
                onClick={() => {
                  downLoad(row);
                }}
                key="edit"
              >
                合同查看
              </a>,
            ]
          : '';
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
          options={false}
          pagination={false}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={getListAction}
          search={false}
          rowKey="id"
          dateFormatter="string"
          headerTitle={false}
          bordered
          toolBarRender={false}
        />
      </PageContainer>
    </>
  );
};

export default Contract;
