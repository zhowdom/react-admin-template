import { LinkOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Popover, Upload } from 'antd';
import { useState } from 'react';
import { pubBeforeUpload, pubBlobDownLoad, pubDownloadSysImportTemplate } from '@/utils/pubConfirm';
import { request } from '@@/plugin-request/request';
// 通用导入按钮 - 直接上传二进制流而不通过阿里云 - 下载完成可能有结果文件下载, 所以导入接口需要设置responseType: 'blob',
const ImportBtnDirectory: React.FC<{
  url: string;
  importForm?: Record<string, any>;
  btnText?: string;
  reload: any;
  templateCode: string; // 模板下载code
}> = ({ url, importForm = {}, btnText, reload, templateCode = '' }) => {
  const [downLoading, setDownLoading] = useState(false);
  const [upLoading, setUpLoading] = useState(false);
  // 下载导入模板
  const downLoadTemp = async () => {
    setDownLoading(true);
    await pubDownloadSysImportTemplate(templateCode);
    setDownLoading(false);
  };
  const handleUpload = async (data: any) => {
    setUpLoading(true);
    const formData = new FormData();
    formData.append('file', data.file);
    Object.keys(importForm).forEach((key: string) => {
      formData.append(key, importForm[key]);
    });
    const resData = await request(url, {
      method: 'POST',
      data: formData,
      getResponse: true,
      responseType: 'blob',
    });
    setUpLoading(false);
    pubBlobDownLoad(resData, '', () => {
      if (reload) reload();
    });
  };
  return (
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
  );
};
export default ImportBtnDirectory;
