import { Button, Modal, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProForm, ProFormTextArea } from '@ant-design/pro-components';
import ExceptionSubmit from '../ExceptionSubmit';
import TagSubmit from '../TagSubmit';
import { updateRemarkOrder } from '@/services/pages/order';
import { pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { Access, useAccess } from 'umi';

const Component: React.FC<{
  dicList?: Record<string, any>;
  tags: any[];
  exceptions: any[];
  optionsModel?: any;
  common?: any;
  handleClose?: any;
}> = ({ exceptions, tags, optionsModel, handleClose }) => {
  const formRef = useRef<ProFormInstance>();
  const access = useAccess();
  const [open, openSet] = useState(false);
  const [mondelData, setMondelData] = useState<any>({
    record: {},
    ids: [],
  });

  optionsModel.current = {
    open: (data?: any) => {
      console.log(data);
      openSet(true);
      setMondelData({
        record: data,
        ids: [data.id],
      });
    },
  };
  return (
    <Modal
      width={540}
      title={
        <div>
          <div>{`${mondelData?.record?.shopName || '-'}`}</div>
          <Space style={{ fontSize: 14 }}>
            <span>{`ERP订单号: ${mondelData?.record?.erpNo || '-'}`}</span>{' '}
            <span>{`平台单号: ${mondelData?.record?.platformNo || '-'}`}</span>
          </Space>
        </div>
      }
      onCancel={() => openSet(false)}
      open={open}
      footer={null}
      destroyOnClose
    >
      <Space direction={'vertical'} style={{ width: '100%' }}>
        {/*<Alert message={'Tips: 在订单行中点击鼠标右键也可以弹起此操作框'} />*/}
        {/* <Button block style={{ textAlign: 'left' }} type={'text'} icon={<SettingOutlined />}>
            修改地址
          </Button>*/}
        <Access accessible={access.canSee('order_orderIndexTagSubmit')}>
          <TagSubmit
            tags={tags}
            title={`订单标记(平台单号: ${mondelData?.record?.platformNo || '-'})`}
            trigger={
              <Button block style={{ textAlign: 'left' }} type={'text'} icon={<SettingOutlined />}>
                标记
              </Button>
            }
            reload={() => handleClose(true)}
            ids={[mondelData?.record.id]}
          />
        </Access>
        <Access accessible={access.canSee('order_orderIndexExceptionHandle')}>
          <ExceptionSubmit
            title={`提交异常(ERP订单号: ${mondelData?.record.platformNo || '-'})`}
            trigger={
              <Button block style={{ textAlign: 'left' }} type={'text'} icon={<SettingOutlined />}>
                提交异常
              </Button>
            }
            exceptions={exceptions}
            reload={() => handleClose(true)}
            ids={[mondelData?.record.id]}
          />
        </Access>
        <Access accessible={access.canSee('order_orderIndexMarkInner')}>
          <ProForm
            formRef={formRef}
            submitter={false}
            onFinish={async (values: any) => {
              const dataForSubmit: any[] = [];
              mondelData?.ids.forEach((id: any) => {
                dataForSubmit.push({
                  id,
                  sysRemark: values.sysRemark,
                });
              });
              const res = await updateRemarkOrder(dataForSubmit);
              if (res?.code != '0') {
                pubMsg(res?.message);
                return false;
              }
              pubMsg(res?.message || '保存成功!', 'success');
              formRef.current?.resetFields();
              return true;
            }}
          >
            <ProFormTextArea
              name={'sysRemark'}
              rules={[pubRequiredRule]}
              placeholder={'快捷内部备注输入'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  formRef.current?.submit();
                }}
              >
                保存内部备注
              </Button>
            </div>
          </ProForm>
        </Access>
      </Space>
    </Modal>
  );
};
export default Component;
