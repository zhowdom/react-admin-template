import { Button, Divider, Modal, Form, DatePicker } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ModalForm,
  // ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { useRef } from 'react';
import { pubGetStoreList } from '@/utils/pubConfirm';
import { pubConfig, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { insert, update } from '@/services/pages/stockUpIn/capacity';
import moment from 'moment';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  dicList: any;
  initialValues?: any;
}> = ({ title, trigger, dicList, reload, initialValues = {} }) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <ModalForm
      title={title || '新增'}
      trigger={trigger || <Button type="primary">新增</Button>}
      labelAlign="right"
      labelCol={{ flex: '0 0 110px' }}
      layout="horizontal"
      width={688}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      onFinish={async (values: any) => {
        let api = insert;
        if (initialValues?.id) {
          values.id = initialValues.id;
          api = update;
        } else {
          delete values.id;
        }
        console.log(values.cycle_time);
        console.log(moment(values.cycle_time).format('YYYY-\\QQ'));
        values.cycle_time = moment(values.cycle_time).format('YYYY-\\QQ');
        const res = await api(values);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg('操作成功!', 'success');
        reload();
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
        });
      }}
      initialValues={{
        ...initialValues,
        cycle_time: initialValues.cycle_time
          ? moment().quarter(initialValues.cycle_time.split('Q')[1])
          : moment(),
      }}
    >
      <ProFormSelect
        colProps={{ span: 12 }}
        name="shop_id"
        label="店铺"
        showSearch
        debounceTime={300}
        request={async () => {
          const res: any = await pubGetStoreList({ business_scope: 'IN' });
          return res;
        }}
        rules={[
          { required: true, message: '请选择店铺' },
          ({}) => ({
            validator(_, value) {
              if (JSON.stringify(value) === '{}') {
                return Promise.reject(new Error('请选择店铺'));
              }
              return Promise.resolve();
            },
          }),
        ]}
        readonly={!!initialValues.id}
      />
      <Form.Item label="时间周期" name="cycle_time" rules={[pubRequiredRule]}>
        <DatePicker
          picker="quarter"
          format="YYYY-\QQ"
          disabledDate={(date: any) => {
            return date && date > moment().add(1, 'quarters');
          }}
          disabled={!!initialValues.id}
        />
      </Form.Item>
      {/* <ProFormDatePicker
        colProps={{ span: 12 }}
        rules={[pubRequiredRule]}
        label="时间周期"
        name={'cycle_time'}
        fieldProps={{
          picker: 'quarter',
          format: 'YYYY-\\QQ',
          disabledDate: (date: any) => {
            return date && date > moment().add(1, 'quarters');
          },
        }}
        readonly={!!initialValues.id}
      /> */}
      <Divider orientation={'left'} style={{ margin: '0 0 20px 0', color: '#2e62e2' }}>
        标准件
      </Divider>
      <ProForm.Group>
        <ProFormRadio.Group
          colProps={{ span: 12 }}
          name="standard_volume_is_limit"
          label="库容体积限制"
          rules={[pubRequiredRule]}
          options={[
            {
              label: '无限制',
              value: '0',
            },
            {
              label: '限制',
              value: '1',
            },
          ]}
        />
        <ProFormDependency name={['standard_volume_is_limit']}>
          {({ standard_volume_is_limit }) => {
            return standard_volume_is_limit == '1' ? (
              <>
                <ProFormDigit
                  rules={[pubRequiredRule]}
                  colProps={{ span: 8 }}
                  label={'限制体积'}
                  name={'standard_volume_limit'}
                  fieldProps={{ precision: 2 }}
                />
                <ProFormSelect
                  colProps={{ span: 4 }}
                  name="standard_volume_uom"
                  label={''}
                  valueEnum={dicList.IPI_UOM}
                  rules={[{ required: true, message: '请选择单位' }]}
                  placeholder="单位"
                />
              </>
            ) : null;
          }}
        </ProFormDependency>
      </ProForm.Group>
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'说明'}
        placeholder={'请输入标准件库容说明'}
        name={'standard_remarks'}
      />
      <Divider orientation={'left'} style={{ margin: '0 0 20px 0', color: '#2e62e2' }}>
        大件
      </Divider>
      <ProForm.Group>
        <ProFormRadio.Group
          colProps={{ span: 12 }}
          name="big_volume_is_limit"
          label="库容体积限制"
          rules={[pubRequiredRule]}
          options={[
            {
              label: '无限制',
              value: '0',
            },
            {
              label: '限制',
              value: '1',
            },
          ]}
        />
        <ProFormDependency name={['big_volume_is_limit']}>
          {({ big_volume_is_limit }) => {
            return big_volume_is_limit == '1' ? (
              <>
                <ProFormDigit
                  rules={[pubRequiredRule]}
                  colProps={{ span: 8 }}
                  label={'限制体积'}
                  name={'big_volume_limit'}
                  fieldProps={{ precision: 2 }}
                />
                <ProFormSelect
                  colProps={{ span: 4 }}
                  name="big_volume_uom"
                  valueEnum={dicList.IPI_UOM}
                  rules={[{ required: true, message: '请选择单位' }]}
                  placeholder="单位"
                />
              </>
            ) : null;
          }}
        </ProFormDependency>
      </ProForm.Group>
      <ProFormTextArea
        colProps={{ span: 24 }}
        label={'说明'}
        placeholder={'请输入大件库容说明'}
        name={'big_remarks'}
      />
    </ModalForm>
  );
};
export default Component;
