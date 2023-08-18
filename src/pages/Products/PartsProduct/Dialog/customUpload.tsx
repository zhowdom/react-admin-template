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
  // console.log(props.sys_files, 'sys_files');
  const sys_files = props.sys_files || [];
  const { onChange } = props;
  const handleUpload = (info: any, init: boolean) => {
    // console.log(info, 'info');
    if (!init) {
      onChange(info);
    }
  };
  return (
    <UploadFileList
      fileBack={handleUpload}
      required
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
