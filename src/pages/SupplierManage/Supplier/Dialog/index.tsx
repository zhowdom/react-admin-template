import { Button, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import DeveloperChange from './DeveloperLog';
import BatchChange from './BatchChange';
import ProForm, { ProFormGroup, ProFormText } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { createSpreadLink } from '@/services/pages/supplier';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const Dialog = (props: any) => {
  const _ref = useRef();
  const formRef = useRef<ProFormInstance>();
  const [modalShow, setModalShow] = useState(false);
  props.mRef.current = {
    modalChange: () => {
      setModalShow((pre: boolean) => !pre);
    },
  };
  const handleCopy = () => {
    const oInput: any = document.createElement('input');
    oInput.style.border = '0 none';
    oInput.style.color = 'transparent';
    oInput.value = formRef.current?.getFieldValue('link');
    document.body.appendChild(oInput);
    oInput.select(); // 选择对象
    document.execCommand('Copy'); // 执行浏览器复制命令
    pubMsg('复制成功', 'success');
    oInput.parentNode.removeChild(oInput);
  };
  const getLink = async () => {
    const res = await createSpreadLink({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      formRef.current?.setFieldsValue({
        link: res?.data,
      });
    }
  };
  const CopyLink = () => {
    useEffect(() => {
      getLink();
    }, []);
    return (
      <ProForm formRef={formRef} submitter={false} layout="horizontal">
        <ProFormGroup>
          <ProFormText
            name="link"
            label="邀请链接:"
            allowClear={false}
            width={380}
            placeholder=""
          />
          <Button
            type="primary"
            onClick={() => {
              handleCopy();
            }}
          >
            复制
          </Button>
        </ProFormGroup>
      </ProForm>
    );
  };
  return (
    <>
      <Modal
        width={props.width || 1000}
        title={props.title}
        visible={modalShow}
        onCancel={() => setModalShow(false)}
        destroyOnClose
        maskClosable={false}
        onOk={() => _ref?.current?.submit()}
        okButtonProps={{
          style: {
            display: props.footer ? 'inline-block' : 'none',
          },
          disabled: false,
        }}
        cancelButtonProps={{
          style: {
            display: props.footer ? 'inline-block' : 'none',
          },
          disabled: false,
        }}
      >
        {props.title === '开发变更日志' && <DeveloperChange id={props.id} />}
        {props.title === '批量变更开发' && (
          <BatchChange
            id={props.id}
            selectItems={props.selectItems}
            dicList={props.dicList}
            bRef={_ref}
            handleClose={props.dialogClose}
          />
        )}
        {props.title === '供应商邀请链接' && <CopyLink />}
      </Modal>
    </>
  );
};
export default Dialog;
