import { Button, Modal, Radio, Space, Row, Col } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormSelect, ProFormDigit, ProFormDatePicker, ProFormRadio } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { insert, update, saveOrUpdate } from '@/services/pages/stockUpIn/rate';
import { pubGetPlatformList } from '@/utils/pubConfirm';
import './index.less'
// 新增/修改汇率

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  dicList: any;
  initialValues?: any;
  formatCurrency: any;
}> = ({ title, trigger, reload, initialValues, dicList, formatCurrency }) => {
  const formRef = useRef<ProFormInstance>();
  const [platformMap, setPlatformMap] = useState<any>([])
  return (
    <ModalForm
      title={title || '新增'}
      trigger={trigger || <Button type="primary">新增</Button>} 
      labelAlign="right"
      labelCol={{ flex: '0 0 160px' }}
      layout="horizontal"
      width={850}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        values.id = initialValues?.id || null
        const res = await saveOrUpdate(Object.assign({'platform_code': platformMap.find((v:any) => v.id == values['platform_id'])?.platform_code}, values));
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功', 'success');
        reload();
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
      initialValues={initialValues}
    >



        <ProFormSelect
        colProps={{ span: 12 }}
        label="平台"
        name={'platform_id'}
        showSearch
        request={async () => {
          let _res = pubGetPlatformList({ business_scope: 'IN'})
          _res.then((r:any) => {
            console.log(r, 'r')
            setPlatformMap(r)
          })
          return _res;
        }}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
      />

      <ProFormSelect
        colProps={{ span: 12 }}
        name="site"
        label="站点"
        showSearch
        valueEnum={dicList?.SYS_PLATFORM_SHOP_SITE || []}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
        fieldProps={{
          onChange: () => {
            // formRef.current?.setFieldsValue({ target_currency: '' });
          },
        }}
      />
      {/* 单个月份选择
      <ProFormDatePicker
        colProps={{ span: 12 }}
        name="month"
        label="月份"
        fieldProps={{
          picker: 'month',
          format: 'YYYY-MM',
        }}
        readonly={!!initialValues?.id}
        rules={[pubRequiredRule]}
      /> 
      */}
      <ProFormSelect
        colProps={{ span: 12 }}
        name="delivery_route"
        label="目的仓"
        showSearch
        valueEnum={dicList?.LOGISTICS_TIME_MANAGE_IN_DELIVERY_ROUTE || []}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
        fieldProps={{
          onChange: () => {
            // formRef.current?.setFieldsValue({ target_currency: '' });
          },
        }}
      />
    
      <ProFormSelect
        colProps={{ span: 12 }}
        name="shipping_method"
        label="运输方式"
        showSearch
        valueEnum={dicList?.LOGISTICS_TIME_MANAGE_IN_SHIPPING_METHOD || []}
        rules={[pubRequiredRule]}
        readonly={!!initialValues?.id}
        fieldProps={{
          onChange: () => {
            // formRef.current?.setFieldsValue({ target_currency: '' });
          },
        }}
      />

      <Space.Compact block>
        <ProFormRadio.Group
          name="status"
          label="状态"
          options={[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]}
          rules={[pubRequiredRule]}
        />
      </Space.Compact>


      <ProFormDigit
        colProps={{ span: 12 }}
        name="domestic_transport_cycle"
        label="国内运输周期（天）"
        fieldProps={{
          precision: 0,
        }}
        rules={[pubRequiredRule]}
      />

      <ProFormDigit
        colProps={{ span: 12 }}
        name="shelves_cycle"
        label="上架周期（天）"
        fieldProps={{
          precision: 0,
        }}
        rules={[pubRequiredRule]}
      />

    
    <div className='imitateTableWrap'>
      <div className='imitateTable'>
        <div className='imitateHeader'>
          <Row>
            <Col span={12} className='bdr1'>整柜</Col>
            <Col span={12}>散货</Col>
          </Row>
          <Row>
            <Col span={6} className='bdr1'><span style={{'color': 'red'}}>*</span> 标准件</Col>
            <Col span={6} className='bdr1'><span style={{'color': 'red'}}>*</span> 大件</Col>
            <Col span={6} className='bdr1'><span style={{'color': 'red'}}>*</span> 标准件</Col>
            <Col span={6}><span style={{'color': 'red'}}>*</span> 大件</Col>
          </Row>
        </div>
        

        <div className='imitateMain'>
          <Row>
            <Col span={6}>
              <ProFormDigit
                name="whole_box_standard"
                label=""
                placeholder={'请填写运输周期'}
                fieldProps={{
                  precision: 0,
                }}
                rules={[pubRequiredRule]}
              />
            </Col>
            <Col span={6}>
            <ProFormDigit
              name="whole_box_big"
              label=""
              placeholder={'请填写运输周期'}
              fieldProps={{
                precision: 0,
              }}
              rules={[pubRequiredRule]}
            />
            </Col>
            <Col span={6}>
            <ProFormDigit
                name="part_box_standard"
                label=""
                placeholder={'请填写运输周期'}
                fieldProps={{
                  precision: 0,
                }}
                rules={[pubRequiredRule]}
              />
            </Col>
            <Col span={6}>
            <ProFormDigit
                name="part_box_big"
                label=""
                placeholder={'请填写运输周期'}
                fieldProps={{
                  precision: 0,
                }}
                rules={[pubRequiredRule]}
              />
            </Col>
          </Row>
  
        </div>
      
      </div>
    </div>


    </ModalForm>
  );
};
export default Component;
