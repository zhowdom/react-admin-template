import ProTable from '@ant-design/pro-table';
import { ModalForm } from '@ant-design/pro-form';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { Button } from 'antd';
import './index.less';
import { DownloadOutlined } from '@ant-design/icons';
import { getUuid, pubBlobDownLoad } from '@/utils/pubConfirm';
import { useState } from 'react';
import { Access, useAccess } from 'umi';
import { flatData } from '@/utils/filter';

export default (props: any) => {
  const { columns, api, id, trigger, width, hideSearch, downApi, title, powerKey, type } = props;
  const [downloading, downloadingSet] = useState(false);
  const [exportForm, exportFormSet] = useState(false);
  const access = useAccess();
  // 导出excel
  const downLoad = async () => {
    downloadingSet(true);
    const res: any = await downApi(exportForm);
    downloadingSet(false);
    pubBlobDownLoad(res, title);
  };
  return (
    <ModalForm
      title="明细"
      trigger={<a> {trigger}</a>}
      labelAlign="right"
      labelCol={{ span: 6 }}
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={{
        searchConfig: {
          submitText: '确认',
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      width={width || 1200}
    >
      <ProTable
        pagination={false}
        className={!hideSearch ? 'detail-t' : ''}
        request={async (params: any): Promise<any> => {
          const postData: any = { id, ...params };
          const res = await api(postData);
          if (res?.code != pubConfig.sCodeOrder) {
            pubMsg(res?.message);
          }
          exportFormSet(postData);
          const statusObj = {
            approvalStatus: props?.dicList?.PURCHASE_APPROVAL_STATUS,
            deliveryStatus: props?.dicList?.PURCHASE_DELIVERY_STATUS,
            status: props?.dicList?.PURCHASE_PLAN_STATUS,
          };
          let data = res?.data || [];
          if (type !== 'inventoryNum') {
            const keys = Object.keys(statusObj);
            for (const item of data) {
              item.key = getUuid();
              for (const key in item) {
                if (keys.includes(key)) {
                  item[key] = pubFilter(statusObj[key], item[key]) || '-';
                }
              }
            }
          } else {
            data = flatData(data, 'innerList');
          }
          return {
            data: data || [],
            success: true,
            total: res?.data?.total || 0,
          };
        }}
        headerTitle={
          !hideSearch && (
            <Access key="export" accessible={access.canSee(powerKey)}>
              <Button
                onClick={downLoad}
                ghost
                type="primary"
                loading={downloading}
                icon={<DownloadOutlined />}
              >
                导出
              </Button>
            </Access>
          )
        }
        options={false}
        bordered
        size="small"
        rowKey={(record: any) => record.key + record.id}
        search={hideSearch ? false : { labelWidth: 'auto', defaultCollapsed: false, span: 6 }}
        columns={columns}
      />
    </ModalForm>
  );
};
