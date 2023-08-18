import { ModalForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, Space, Popover, Popconfirm } from 'antd';
import { pubConfig, pubMsg, pubNormalize, pubRequiredRule } from '@/utils/pubConfig';
import React, { useRef, useImperativeHandle } from 'react';
import { saveSearch, mySearch, removeSearch } from '@/services/pages/amazonAd';

const PopoverContent: React.FC<{ tableRef: any; handleSearch: any; ads_sub_type: any }> = ({
  tableRef,
  handleSearch,
  ads_sub_type,
}) => {
  const actionRef = useRef<any>(null);
  useImperativeHandle(tableRef, () => ({
    reload: actionRef?.current?.reload,
  }));
  return (
    <ProTable
      actionRef={actionRef}
      size={'small'}
      style={{ width: 360 }}
      rowKey={'id'}
      options={false}
      cardProps={{ bodyStyle: { padding: 0 } }}
      search={{
        className: 'light-search-form',
        span: 12,
        labelWidth: 60,
        searchGutter: 2,
        collapseRender: () => null,
        searchText: '筛选',
      }}
      params={ads_sub_type}
      request={async (params) => {
        const res = await mySearch();
        if (res?.code == pubConfig.sCode) {
          let data = res?.data.filter((item: any) => {
            const configObj = JSON.parse(item?.config);
            return configObj.ads_sub_type == ads_sub_type || !configObj.ads_sub_type;
          });
          if (params.name) {
            data = data.filter((item: any) => item.name.includes(params.name));
          }
          return {
            data,
            success: true,
          };
        } else {
          pubMsg(res?.message);
        }
        return {
          data: [],
          success: true,
        };
      }}
      columns={[
        {
          title: '名称',
          dataIndex: 'name',
          fieldProps: {
            placeholder: '筛选名称',
          },
        },
        {
          title: '操作',
          valueType: 'option',
          width: 100,
          render: (_, record) => (
            <Space>
              <Button
                onClick={() => {
                  handleSearch(JSON.parse(record.config));
                }}
                size={'small'}
                type={'primary'}
              >
                查询
              </Button>
              <Popconfirm
                title="确认删除"
                onConfirm={async () => {
                  const res = await removeSearch({ id: record.id });
                  if (res?.code == pubConfig.sCode) {
                    pubMsg(res?.message, 'success');
                    tableRef.current?.reload();
                  } else {
                    pubMsg(res?.message);
                  }
                }}
              >
                <Button danger size={'small'} type={'text'}>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          ),
          align: 'center',
        },
      ]}
    />
  );
};
// 快捷查询, 预制查询
const CustomSearch: React.FC<{
  config: Record<string, any>; // 查询条件
  country_code: string; // 查询适用站点
  ads_sub_type: string; // 分类tab
  handleSearch: any;
}> = ({ config, handleSearch, ads_sub_type }) => {
  const tableRef = useRef<any>(null);
  return (
    <Space style={{ alignItems: 'center' }}>
      <Popover
        placement="bottom"
        title={'我的快捷查询'}
        content={
          <PopoverContent
            handleSearch={handleSearch}
            ads_sub_type={ads_sub_type}
            tableRef={tableRef}
          />
        }
      >
        <a>我的快捷搜索</a>
      </Popover>
      <ModalForm
        width={400}
        title={'新增我的快捷查询'}
        trigger={<Button>保存当前查询</Button>}
        layout={'horizontal'}
        onFinish={async (val: any) => {
          const res = await saveSearch({
            ...val,
            country_code: 'ALL',
            config: JSON.stringify({ ...config, ads_sub_type }),
          });
          if (res?.code == pubConfig.sCode) {
            pubMsg(res?.message, 'success');
            tableRef?.current?.reload();
            return true;
          } else {
            pubMsg(res?.message);
          }
          return false;
        }}
      >
        <ProFormText
          label={'快捷查询名称'}
          name={'name'}
          rules={[pubRequiredRule]}
          normalize={pubNormalize}
          fieldProps={{
            maxLength: 20,
          }}
        />
      </ModalForm>
    </Space>
  );
};
export default CustomSearch;
