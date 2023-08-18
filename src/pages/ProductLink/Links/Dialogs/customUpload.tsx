import React from 'react';
import UploadFileList from '@/components/PubUpload/UploadFileList';

type comuploadProps = {
  value?: {
    key: string;
    label: string;
  }[];
  sys_files?: any[];
  onChange?: () => void;
};
const ComUpload: React.FC<comuploadProps> = (props: comuploadProps) => {
  const sys_files = props.sys_files || [];
  const { onChange } = props;
  const handleUpload = (info: any, init: boolean) => {
    console.log(info, 'info');
    if (!init) {
      onChange(info);
    }
  };
  return (
    <UploadFileList
      fileBack={handleUpload}
      required
      businessType="LINK_MANAGEMENT_FILE"
      checkMain={false}
      defaultFileList={sys_files?.length ? sys_files : undefined}
      size="small"
      maxCount={1}
    />
  );
};

export default ComUpload;
