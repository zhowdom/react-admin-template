/**
 * 文件导入
 */
import { Upload } from 'antd';
import { baseFileUpload1, createWebUploadSignature } from '@/services/base';
import { pubConfig, pubMessage } from '@/utils/pubConfig';
import { pubBeforeUpload, pubGetUploadFileSuffix } from '@/utils/pubConfirm';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import './UploadFileList.less';

const ImportUpload = (props: any) => {
  const {
    fileBack,
    businessType,
    acceptType,
    accept,
    maxSize = '10',
    acceptMessage,
    loading,
  } = props;

  // 上传
  const handleUpload = async (data: any) => {
    // loading开始
    loading(true);
    const uuid = uuidv4().replaceAll('-', '');
    let signData: any = {};
    const oldCookSign = Cookies.get(`${window.location.port}UploadSignature`)
      ? JSON.parse(Cookies.get(`${window.location.port}UploadSignature`) || '')
      : null;
    if (oldCookSign && oldCookSign.time && Date.now() - oldCookSign.time < 300000) {
      // 五分钟内不用重新请求签名
      signData = JSON.parse(JSON.stringify(oldCookSign));
    } else {
      const aaSign = await createWebUploadSignature({ businessType: businessType });
      if (aaSign?.code != pubConfig.sCode) {
        pubMessage(aaSign?.message);
        loading(false);
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
      'x:business_type': businessType,
      'x:create_user_id': signData?.create_user_id,
      'x:create_user_name': signData?.create_user_name,
    });
    if (res?.code != pubConfig.sCode) {
      pubMessage(res?.message);
      loading(false);
      return;
    }
    const resData = res?.data;
    console.log(resData);
    loading(false);
    fileBack(resData);
  };
  return (
    <Upload
      beforeUpload={(file: any) =>
        pubBeforeUpload({
          file,
          acceptType: acceptType, // 上传限制 非必填
          maxSize: maxSize, // 非必填
          maxCount: 1, // 非必填
          acceptMessage: acceptMessage || '', // 非必填
        })
      }
      accept={accept} // 打开时，默认显示的文件类型 非必填
      key="upLoad"
      showUploadList={false}
      customRequest={handleUpload}
    >
      {props?.children}
    </Upload>
  );
};
export default ImportUpload;

/**
 * fileBack 上传结束后 回调 为单个文件对象，不是数组
 * businessType 必填  上传接口的key
 * accept 非必填 打开上传文件弹窗时，显示的文件类型，默认只显示指定的文件类型  可以和acceptType配套使用，也可以不用
 * acceptType 非必填 默认不限制上传文件类型  后辍名的数组
 * acceptMessage 非必填 当上传类型错误时，指定自定义的提示信息，默认提示的信息 提示"上传格式不正确！
 * maxSize 非必填 上传大小限制 单位 M
 * loading 主页面控制上传按钮loading的   const [upLoading, setUpLoading] = useState(false);
 *
  <ImportUpload
    acceptType={['xls', 'xlsx']} // 上传限制 非必填
    accept=".xls,.xlsx" // 打开时，默认显示的文件类型 非必填
    acceptMessage="上传格式不对，请检查上传文件"// 非必填
    businessType='BATCH_IMPORT_PURCHASE_PLAN'
    fileBack={handleUpload}
    loading={setUpLoading}
  >
    <Button
      icon={<UploadOutlined />}
      type="primary"
      disabled={upLoading}
      loading={upLoading}
      ghost
    >
      导入采购计划
    </Button>
  </ImportUpload>

 *
 */
