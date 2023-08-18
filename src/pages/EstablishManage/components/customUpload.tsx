import React from 'react';
import UploadFileList from '@/components/PubUpload/UploadFileList';

type comuploadProps = {
  value?: {
    key: string;
    label: string;
  }[];
  sys_files?: any[];
  disabled: boolean;
  onChange?: () => void;
  isFinal?: any;
};
const ComUpload: React.FC<comuploadProps> = (props: comuploadProps) => {
  const sys_files = props.sys_files || [];
  const { onChange, isFinal } = props;
  const handleUpload = (info: any, init: boolean) => {
    if (!init) {
      onChange(info);
    }
  };
  return (
    <UploadFileList
      disabled={props.disabled}
      fileBack={handleUpload}
      required={isFinal ? true : false}
      businessType="PROJECT_GOODS_SKU"
      listType="picture-card"
      checkMain={false}
      defaultFileList={sys_files?.length ? sys_files : undefined}
      accept={['.jpg,.jpeg,.png']}
      acceptType={['jpg', 'jpeg', 'png']}
      maxCount="1"
      size="small"
    />
  );
};

export default ComUpload;
