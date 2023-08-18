//新增明细导出任务
import { calculationTaskAdd } from '@/services/pages/SCM_SALES_IN_Manage/orderStatistics';
import { pubGetStoreList, pubProLineList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { ModalForm, ProFormSelect, ProFormDateRangePicker } from '@ant-design/pro-components';
import { Button, Alert, Form } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { freeListLinkManagementSku } from '@/services/base';
import { useEffect, useState } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import NewDatePicker from '@/components/PubForm/NewDatePicker';

const DownloadDetail: React.FC<{
  title?: any;
  trigger?: any;
}> = ({ title, trigger }) => {
  const { initialState } = useModel('@@initialState');
  const [optionsSku, optionsSkuSet] = useState([]);
  useEffect(() => {
    freeListLinkManagementSku({
      sku_type: '1',
    }).then((res) => {
      if (res.code == pubConfig.sCode) {
        const data =
          res?.data.flatMap((val: any) =>
            val?.shop_sku_code
              ? [
                {
                  ...val,
                  label: `${val?.shop_sku_code}(SPU:${val?.link_name || '未知'})`,
                  value: `${val?.id}&&${val?.shop_sku_code}`,
                },
              ]
              : [],
          ) || [];
        optionsSkuSet(data);
      }
    });
  }, []);
  return (
    <ModalForm
      title={title || `新增明细导出任务`}
      trigger={
        trigger || (
          <Button icon={<DownloadOutlined />} ghost type="primary">
            新增明细导出任务
          </Button>
        )
      }
      modalProps={{ destroyOnClose: true }}
      width={600}
      submitter={{
        searchConfig: {
          submitText: '导出',
        },
      }}
      layout={'horizontal'}
      labelCol={{ flex: '0 0 60px' }}
      onFinish={async (values: any) => {
        const res: any = await calculationTaskAdd({
          ...values,
          taskStartTime: values.orderDate[0],
          taskEndTime: values.orderDate[1],
          createUserId: initialState?.currentUser?.id,
        });
        if (res?.code == pubConfig.sCodeOrder) {
          pubMsg('导出任务添加成功, 您可在"下载明细"中查看导出结果', 'success');
          return true;
        } else {
          pubMsg('导出任务添加失败');
        }
        return false;
      }}
    >
      <Alert
        type={'info'}
        banner
        style={{ marginBottom: 20 }}
        showIcon={false}
        message={
          <>
            提示: <br />
            1、由于明细数据较多，仅支持按店铺、按月导出明细进行核算； <br />
            2、暂时只支持定时导出，当前为创建导出任务，系统将会在下班时段进行计算导出，建立任务后可到【下载明细】中查看并下载；{' '}
            <br />
          </>
        }
      />
      <ProFormSelect
        label={'店铺'}
        name={'shopId'}
        request={() => pubGetStoreList({ business_scope: 'IN' })}
        showSearch
        wrapperCol={{ flex: '0 0 222px' }}
        rules={[pubRequiredRule]}
        fieldProps={{
          labelInValue: true,
        }}
        transform={(values) => ({ shopId: values.value, shopName: values.label })}
      />
      <ProFormSelect
        label={'产品线'}
        name={'categoryIds'}
        placeholder={'请选择(可多选)'}
        fieldProps={{
          autoClearSearchValue: true,
          labelInValue: true,
        }}
        mode={'multiple'}
        request={() => pubProLineList({ business_scope: 'IN' })}
        showSearch
        transform={(values) => ({
          categoryIds: values.map((v: any) => v.value).toString(),
          categoryNames: values.map((v: any) => v.label).toString(),
        })}
      />
      <ProFormSelect
        label={'SKU'}
        name={'skus'}
        mode={'multiple'}
        placeholder={'输入sku或spu搜索(可多选)'}
        fieldProps={{
          autoClearSearchValue: true,
        }}
        showSearch
        options={optionsSku}
        transform={(values) => ({ skus: values.map((v: any) => v.split('&&')[1]).toString() })}
      />
      <Form.Item label="日期" name="orderDate"
        tooltip={'可选最长35天范围, 默认最近7天'}
        rules={[{ required: true, message: '请选择日期' },
        {
          validator: (_: any, value: string) => {
            if (value && !value[0]) {
              return Promise.reject('请选择开始日期!');
            }
            if (value && !value[1]) {
              return Promise.reject('请选择结束日期!');
            }
            if (value && value[0] && value[0]&& moment(value[1]).diff(moment(value[0]), 'days') > 34) {
              return Promise.reject('范围不可超过35天');
            }
            return Promise.resolve();
          },
        },]}>
        <NewDatePicker value={[moment().add(-7, 'days'), moment()]} />
      </Form.Item>
    </ModalForm>
  );
};
export default DownloadDetail;
