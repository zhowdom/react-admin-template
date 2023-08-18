import { Button, Form } from 'antd';
import { ModalForm } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { EditOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import TextArea from 'antd/lib/input/TextArea';
import { pubMsg } from '@/utils/pubConfig';
import './batchEdit.less';

export default (props: any) => {
  const formRef = useRef<ProFormInstance>();
  const { batchSave } = props;
  const [changeText, setChangeText] = useState(false);
  // 四舍五入
  const checkNum = () => {
    const data = formRef?.current?.getFieldsValue();
    // console.log(data)
    const newD = data?.batchValue
      .split(/[\s\n\t]/)
      ?.filter((v: any) => v)
      ?.map((v: any) => v.replace(/^\s+|\s+$/g, ''))
      .map((v: any) => (v > 0 ? (v * 1).toFixed() : v));
    // console.log(newD)
    const dd = newD.join('\t');
    // console.log(dd)
    formRef?.current?.setFieldsValue({
      batchValue: dd,
    });
  };
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={'批量修改PMC预测销量'}
      formRef={formRef}
      trigger={
        <Button icon={<EditOutlined />} ghost type="primary">
          批量修改PMC预测销量
        </Button>
      }
      className="item10"
      labelAlign="left"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      width={800}
      onFinish={async (values: any) => {
        if (values?.batchValue) {
          const arr = values?.batchValue
            .split(/[\s\n\t]/)
            ?.filter((v: any) => v)
            ?.map((v: any) => v.replace(/^\s+|\s+$/g, ''))
            .map((v: any) => v || 0);
          batchSave(arr);
          pubMsg('添加成功', 'success');
          return true;
        }
        return false;
      }}
    >
      <div style={{ position: 'relative' }}>
        <Form.Item
          label="批量修改销量预测(正常)"
          name="batchValue"
          rules={[
            {
              validator(_, value) {
                if (!value) {
                  return Promise.reject(new Error('请填写最新的销量预测'));
                }
                const reg = /^\d+$/;
                const arr = value
                  .split(/[\s\n\t]/)
                  ?.filter((v: any) => v)
                  ?.map((v: any) => v.replace(/^\s+|\s+$/g, ''))
                  .map((v: any) => v || 0);
                console.log(arr);
                for (let i = 0; i < arr.length; i++) {
                  if (!reg.test(arr[i])) {
                    setChangeText(true);
                    return Promise.reject(new Error('请输入大于等于0的整数'));
                  } else {
                    setChangeText(false);
                  }
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <TextArea
            autoSize={{
              minRows: 4,
            }}
            placeholder="每行表示一周销量，从计算的第一周往后填写，填写多少周算多少周"
          />
        </Form.Item>
      </div>

      {changeText ? (
        <div style={{ paddingLeft: '189px' }}>
          <Button type="primary" key="save" size="small" ghost onClick={() => checkNum()}>
            数字四舍五入
          </Button>
        </div>
      ) : (
        ''
      )}
    </ModalForm>
  );
};
