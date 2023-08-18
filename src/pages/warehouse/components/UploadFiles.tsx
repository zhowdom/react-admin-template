import type {ProFormInstance} from '@ant-design/pro-form';
import {
  ProForm,
  ModalForm,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {useRef, useState} from 'react';
import {acceptTypes, pubConfig, pubMsg} from '@/utils/pubConfig';
import {request} from 'umi'
import UploadFileList from "@/components/PubUpload/UploadFileList";
// 上传文件和备注
const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  initialValues?: any;
  requestUrl: string;
  requestDetailUrl: string;
  requestParams?: Record<string, any>;
  businessType?: string;
}> = ({
        title,
        trigger,
        reload,
        initialValues = {},
        requestUrl,
        requestParams = {},
        businessType = 'OWN_STOCK_MANAGEMENT_APPROVE',
        requestDetailUrl = '',
      }) => {
  const [detail, detailSet] = useState<any>({})
  const formRef = useRef<ProFormInstance>();
  // 上传结束后
  const handleUpload = async (data: any, name: string) => {
    console.log(data);
    formRef.current?.setFieldsValue({ [`${name}`]: data });
  };

  return (
    <ModalForm
      title={title || '上传审核凭证'}
      trigger={trigger || <a>上传审核凭证</a>}
      labelAlign="right"
      labelCol={{flex: '0 0 110px'}}
      layout="horizontal"
      width={688}
      modalProps={{
        destroyOnClose: true,
      }}
      submitter={{
        searchConfig: {submitText: '提交并保存'}
      }}
      formRef={formRef}
      params={{id: initialValues.id}}
      request={async (params) => {
        const res = await request(requestDetailUrl, {
          method: 'GET',
          params
        })
        if (res?.code == pubConfig.sCode) {
          detailSet(res.data)
          return res.data || {};
        } else {
          pubMsg(res?.message || '服务异常, 获取详情数据失败~')
          detailSet({})
          return {}
        }
      }}
      onFinish={async (values: any) => {
        const res = await request(requestUrl, {
          method: 'POST',
          data: {
            ...requestParams,
            ...values,
          },
        })
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg('操作成功!', 'success');
        reload();
        return true;
      }}
      onFinishFailed={() => {
        pubMsg('未正确或未完整填写, 无法提交, 请检查~')
      }}
    >
      <ProFormTextArea
        label={'备注'}
        name={'remarks'}
      />
      <ProForm.Item
        required
        rules={[
          () => ({
            validator(_, value) {
              const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
              if (!unDeleteFiles?.length) {
                return Promise.reject(new Error('请上传至少一个文件'));
              }
              return Promise.resolve();
            },
          }),
        ]}
        label="上传签收证明:"
        name="sys_files"
        valuePropName="sys_files"
        tooltip="支持PDF, 图片, 常用文档等格式, 可上传多个文件(单个文件大小 < 50M)"
      >
        <UploadFileList
          fileBack={(dataC: any) => {
            handleUpload(dataC, 'sys_files');
          }}
          businessType={businessType}
          checkMain={false}
          defaultFileList={detail?.sys_files}
          accept={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
          acceptType={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
          maxSize="50"
          maxCount={20}
          multiple
        />
      </ProForm.Item>
    </ModalForm>
  );
};
export default Component;
