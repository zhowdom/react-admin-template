import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { pubBlobDownLoad } from '@/utils/pubConfirm';
import { request } from '@@/plugin-request/request';
// 通用导出按钮
const ExportBtn: React.FC<{
  exportHandle: ((arg: any) => any) | string;
  exportForm: Record<string, any>;
  btnText?: string;
  disabled?: boolean;
  btnType?: 'link' | 'text' | 'default' | 'ghost' | 'dashed' | 'primary' | undefined;
}> = ({ exportHandle, exportForm, btnText, disabled = false, btnType = 'primary' }) => {
  const [downLoading, setDownLoading] = useState(false);
  const downLoad = async () => {
    setDownLoading(true);
    let res: any;
    if (typeof exportHandle === 'string') {
      res = await request(exportHandle, {
        method: 'POST',
        responseType: 'blob',
        getResponse: true,
        data: exportForm,
      });
    } else {
      res = await exportHandle(exportForm);
    }
    setDownLoading(false);
    pubBlobDownLoad(res);
  };
  return (
    <Button
      icon={<DownloadOutlined />}
      ghost
      type={btnType}
      disabled={downLoading || disabled}
      loading={downLoading}
      onClick={() => {
        downLoad();
      }}
    >
      {btnText || '导出'}
    </Button>
  );
};
export default ExportBtn;
