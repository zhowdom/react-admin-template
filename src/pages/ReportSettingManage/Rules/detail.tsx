import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, request } from 'umi';
import React, { useState } from 'react';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  DrawerForm,
  ProFormField,
} from '@ant-design/pro-form';
import { Button, Space, message } from 'antd';
import { getType, ruleDetail, ruleSave, baseUrl } from '@/services/pages/rules';
import Editor from './AceEditor';

const requiredRules = { required: true, message: '必填项' };
/*测试drawer*/
const TestDrawer: React.FC<any> = ({ dataSource }: any) => {
  const [responseData, responseDataSet] = useState({});
  return (
    <DrawerForm
      title={`测试规则: ${dataSource.name}`}
      trigger={
        <Button disabled={!dataSource.id} danger title={'保存后才能测试'}>
          测试
        </Button>
      }
      layout="horizontal"
      drawerProps={{
        destroyOnClose: true,
        width: '80%',
        contentWrapperStyle: { maxWidth: '1000px' },
      }}
      submitter={{
        searchConfig: {
          submitText: '发起请求',
        },
      }}
      onFinish={async (values: any) => {
        responseDataSet({});
        let data;
        try {
          data = JSON.parse(values.data);
          if (!(typeof data == 'object' && data)) {
            message.error('请检查json格式是否正确');
            return;
          }
        } catch (e) {
          message.error('请检查json格式是否正确');
          return;
        }
        const config: any = {
          method: values.method,
        };
        if (values.method === 'GET') {
          config.params = data;
        } else {
          config.data = data;
        }
        request(baseUrl + values.url, config).then((res) => {
          if (res) {
            responseDataSet(res);
          }
        });
        return false;
      }}
    >
      <ProForm.Group>
        <ProFormSelect
          allowClear={false}
          initialValue={'POST'}
          name={'method'}
          label={'方法'}
          options={[
            { label: 'POST', value: 'POST' },
            { label: 'GET', value: 'GET' },
          ]}
        />
        <ProFormText
          width={'lg'}
          initialValue={dataSource.url}
          name={'url'}
          label={'url'}
          rules={[requiredRules]}
        />
      </ProForm.Group>
      <ProForm.Item initialValue={'{\n    "abc": 123\n}'} name={'data'} label={'参数'}>
        <Editor theme={'clouds'} width={'610px'} height={'360px'} />
      </ProForm.Item>
      <ProFormField
        label={'返回'}
        fieldProps={{ style: { width: '100%' } }}
        mode="read"
        plain
        valueType="jsonCode"
        text={JSON.stringify(responseData)}
      />
    </DrawerForm>
  );
};

const Page: React.FC = (props: any) => {
  const { history, location } = props;
  const [data, dataSet] = useState<any>({});
  const queryId = location?.query?.id;
  // 规则配置详情页
  const getDetail = async (id?: string) => {
    if (id) {
      const res = await ruleDetail(id);
      if (res?.code == '0') {
        dataSet(res.data);
        return res.data;
      }
      return {
        success: false,
      };
    } else {
      return {};
    }
  };
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
      style={{ background: '#fff' }}
    >
      <ProForm
        layout="horizontal"
        request={() => getDetail(queryId)}
        submitter={{
          searchConfig: {
            submitText: '保存',
          },
          render: (config: any, doms) => {
            return (
              <FooterToolbar>
                <Space>
                  <Button
                    onClick={() => {
                      history.go(-1);
                    }}
                  >
                    返回
                  </Button>
                  {doms}
                  <TestDrawer dataSource={data} />
                </Space>
              </FooterToolbar>
            );
          },
        }}
        onFinish={async (values) => {
          const res = await ruleSave(values);
          if (res && res.code == '0') {
            message.success('保存成功!');
            if (!queryId) {
              history.replace(`/setting-manage-report/rules/detail?id=${res.data.data}`);
            }
          } else {
            message.error('保存失败:' + res.message);
          }
        }}
      >
        <ProForm.Group>
          {queryId ? <ProFormText width={'sm'} readonly name={'id'} label={'ID'} /> : null}
          <ProFormSelect
            width={'sm'}
            name={'type'}
            label={'类型'}
            rules={[requiredRules]}
            request={async () => {
              const res = await getType();
              if (res && res.code == '0' && res?.data?.list) {
                return res?.data?.list.map((item: any) => ({
                  label: item.dictLabel,
                  value: item.dictValue,
                }));
              }
              return [];
            }}
          />
          <ProFormText
            placeholder={'只能包含字母,下划线,数字字符'}
            width={'lg'}
            name={'name'}
            label={'名称'}
            rules={[requiredRules]}
          />
          <ProFormTextArea
            width={'lg'}
            fieldProps={{ rows: 1 }}
            name={'description'}
            label={'备注'}
          />
        </ProForm.Group>
        <ProForm.Item name={'ruleText'} label={'代码'} rules={[requiredRules]}>
          <Editor mode="drools" width="100%" height="100vh" />
        </ProForm.Item>
      </ProForm>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
