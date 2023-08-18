import { LinkOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Popover, Upload } from 'antd';
import { useState } from 'react';
import { pubBeforeUpload, pubBlobDownLoad, pubDownloadSysImportTemplate } from '@/utils/pubConfirm';
import { request } from 'umi';
import { baseFileUpload1, createWebUploadSignature } from '@/services/base';
import { pubAlert, pubConfig, pubMessage } from '@/utils/pubConfig';
import { pubGetUploadFileSuffix } from '@/utils/pubConfirm';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
// 通用导入按钮 - 下载完成可能有结果文件下载, 所以导入接口需要设置responseType: 'blob',
const ImportBtn: React.FC<{
  importHandle: ((arg: any) => any) | string;
  importForm?: Record<string, any>;
  btnText?: string;
  reload: any;
  templateCode?: string; // 模板下载code
  templateForm?: any; // 模板下载其他参数  title  platform_code
  business_type?: string; // 文件上传业务类型
  isHidTem?: boolean; // 是否隐藏模板下载
  noTransform?: boolean; // 不需要通过阿里云, 直接上传
}> = ({
        importHandle,
        importForm = {},
        btnText,
        reload,
        templateCode = '',
        templateForm = [null,null],
        isHidTem = false,
        business_type,
        noTransform = false,
      }) => {
  const [downLoading, setDownLoading] = useState(false);
  const [upLoading, setUpLoading] = useState(false);
  // 下载导入模板
  const downLoadTemp = async () => {
    const newTem = templateForm;
    newTem.unshift(templateCode)
    setDownLoading(true);
    await pubDownloadSysImportTemplate(newTem[0],newTem[1],newTem[2]);
    setDownLoading(false);
  };
  const handleUpload = async (data: any) => {
    setUpLoading(true);
    let resData: any;
    if (noTransform && typeof importHandle == 'string') {
      const formData = new FormData();
      formData.set('file', data.file);
      resData = await request(importHandle, {
        method: 'POST',
        data: formData,
        getResponse: true,
        responseType: 'blob',
      });
    } else {
      const uuid = uuidv4().replaceAll('-', '');
      let signData: any = {};
      const oldCookSign = Cookies.get(`${window.location.port}UploadSignature`)
        ? JSON.parse(Cookies.get(`${window.location.port}UploadSignature`) || '')
        : null;
      if (oldCookSign && oldCookSign.time && Date.now() - oldCookSign.time < 300000) {
        // 五分钟内不用重新请求签名
        signData = JSON.parse(JSON.stringify(oldCookSign));
      } else {
        const aaSign = await createWebUploadSignature({ businessType: business_type });
        if (aaSign?.code != pubConfig.sCode) {
          pubMessage(aaSign?.message);
          return;
        }
        signData = aaSign?.data;
        signData.time = Date.now();
        Cookies.set(`${window.location.port}UploadSignature`, JSON.stringify(signData));
      }
      const isDev = process.env.NODE_ENV === 'development';

      const res = await baseFileUpload1(isDev ? '/aliossapi' : signData?.host, {
        key: `${signData?.dir}/${uuid}.${pubGetUploadFileSuffix(data?.file?.name)}`,
        policy: signData?.policy,
        OSSAccessKeyId: signData?.accessid,
        success_action_status: 200,
        callback: signData?.callback,
        signature: signData?.signature,
        file: data.file,
        'x:new_name': `${uuid}.${pubGetUploadFileSuffix(data?.file?.name)}`,
        'x:name': data?.file?.name,
        'x:business_type': business_type,
        'x:create_user_id': signData?.create_user_id,
        'x:create_user_name': signData?.create_user_name,
      });
      if (res?.code != pubConfig.sCode) {
        pubAlert(res?.message || '文件上传失败, 服务器错误');
        setUpLoading(false);
        return;
      }
      const postForm = {
        ...importForm,
        ...res?.data,
      };
      if (typeof importHandle === 'string') {
        resData = await request(importHandle, {
          method: 'POST',
          data: postForm,
          getResponse: true,
          responseType: 'blob',
        });
      } else {
        resData = await importHandle(postForm);
      }
    }
    setUpLoading(false);
    pubBlobDownLoad(resData, '导入结果', () => {
      if (reload) reload();
    });
  };
  return !isHidTem ? (
    <Popover
      title={'需要下载导入模板?'}
      content={
        <Button
          key="down"
          icon={<LinkOutlined />}
          onClick={() => {
            downLoadTemp();
          }}
          type="link"
          disabled={downLoading}
          loading={downLoading}
        >
          下载导入模板
        </Button>
      }
    >
      <Upload
        beforeUpload={(file: any) =>
          pubBeforeUpload({
            file,
            acceptType: ['xls', 'xlsx'], // 上传限制 非必填
          })
        }
        accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
        showUploadList={false}
        customRequest={handleUpload}
      >
        <Button
          icon={<UploadOutlined />}
          type="primary"
          disabled={upLoading}
          loading={upLoading}
          ghost
        >
          {btnText || '导入'}
        </Button>
      </Upload>
    </Popover>
  ) : (
    <Upload
      beforeUpload={(file: any) =>
        pubBeforeUpload({
          file,
          acceptType: ['xls', 'xlsx'], // 上传限制 非必填
        })
      }
      accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
      showUploadList={false}
      customRequest={handleUpload}
    >
      <Button
        icon={<UploadOutlined />}
        type="primary"
        disabled={upLoading}
        loading={upLoading}
        ghost
      >
        {btnText || '导入'}
      </Button>
    </Upload>
  );
};
export default ImportBtn;
