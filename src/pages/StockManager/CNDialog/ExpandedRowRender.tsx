import ProDescriptions from '@ant-design/pro-descriptions';
import { Button } from 'antd';
import { Access, useAccess } from 'umi';
import { divide, IsGrey } from '@/utils/pubConfirm';
// 表格展开
const ExpandedRowRender: React.FC<{
  title?: string;
  column?: number;
  dataSource: any;
  exportPdf: any;
}> = ({ title, column, dataSource, exportPdf }) => {
  const access = useAccess();
  return (
    <ProDescriptions title={title} column={column || 4}>
      {(access.canSee('stockManager_exportBoxLabel_cn') ||
        access.canSee('stockManager_exportPDFShippingList_cn')) && (
        <ProDescriptions.Item label="箱唛和出货清单下载">
          <Access key="box" accessible={access.canSee('stockManager_exportBoxLabel_cn')}>
            <Button
              size={'small'}
              type={'link'}
              onClick={() => exportPdf(dataSource, 'exportBoxLabel')}
            >
              下载箱唛
            </Button>
          </Access>
          <Access key="ship" accessible={access.canSee('stockManager_exportPDFShippingList_cn')}>
            <Button
              size={'small'}
              type={'link'}
              onClick={() => exportPdf(dataSource, 'exportPDFShippingList')}
            >
              下载出货清单
            </Button>
          </Access>
        </ProDescriptions.Item>
      )}

      <ProDescriptions.Item label="总体积(m³)">
        {divide(dataSource.total_volume, 1000000)}
      </ProDescriptions.Item>
      <ProDescriptions.Item label="物流服务商">{dataSource.logistics_company}</ProDescriptions.Item>
      <ProDescriptions.Item label="收货仓库地址">
        {dataSource.warehouse_address}
      </ProDescriptions.Item>
      <ProDescriptions.Item label="入库单关联采购单号">
        <div
          style={{
            maxWidth: '200px',
            maxHeight: '100px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 6px',
          }}
        >
          {dataSource.purchase_order_nos
            ? dataSource.purchase_order_nos
                .split(',')
                .map((item: any) => <span key={item}>{item}</span>)
            : '未知'}
        </div>
      </ProDescriptions.Item>
      <ProDescriptions.Item label="总重(kg)">
        {divide(dataSource.total_weight, 1000).toFixed(3)}
      </ProDescriptions.Item>
      <ProDescriptions.Item label="运单号">{dataSource.logistics_order_no}</ProDescriptions.Item>
      <ProDescriptions.Item label="入库单关联发货计划单号">
        {dataSource.delivery_plan_nos || dataSource.delivery_plan_no}
      </ProDescriptions.Item>
      {IsGrey ? (
        ''
      ) : (
        <ProDescriptions.Item label="运费">{dataSource.logistics_freight}</ProDescriptions.Item>
      )}

      <ProDescriptions.Item label="创建时间">{dataSource.create_time}</ProDescriptions.Item>
    </ProDescriptions>
  );
};
export default ExpandedRowRender;
