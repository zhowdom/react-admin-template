import { useState } from 'react';
import { Image } from 'antd';

const Dialog = (props: any) => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗显示
  const [fileUrl, setFileUrl] = useState(); // 图片URL
  if (props.showBigImgModel) {
    props.showBigImgModel.current = {
      open: (file: any) => {
        setIsModalVisible(true);
        setFileUrl(file.access_url);
      },
    };
  }
  return (
    <div style={{ display: 'none', height: 0 }}>
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: isModalVisible,
          src: fileUrl,
          onVisibleChange: (value) => {
            setIsModalVisible(value);
          },
        }}
      />
    </div>
  );
};
export default Dialog;
