import { useRef } from 'react';
import {
  VideoCameraOutlined,
  FileOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileWordOutlined,
  FileZipOutlined,
  NotificationOutlined,
  PaperClipOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { pubDownLoad, pubGetUploadFileSuffix } from '@/utils/pubConfirm';
import PubShowBigImg from '@/components/PubShowBigImg/Images';
import PubShowBigFiles from '@/components/PubShowBigImg/Files';
import PubShowBigVideo from '@/components/PubShowBigImg/Video';
import './ShowFileList.less';

const Detail = (props: any) => {
  const { data } = props;
  const { listType: listType = 'text', isShowDownLoad, isMain, size: size = 'normal' } = props;
  const list = data
    ? data.map((v: any, index: number) => {
        return {
          ...v,
          isMain: index ? 0 : 1,
          access_url: v.access_url,
        };
      })
    : [];
  const showBigImgModel = useRef(); // 图片查看modal
  const showBigFilesModel = useRef(); // 文件查看modal
  const showBigVideoModel = useRef(); // 视频查看modal
  // 点击查看大图
  const openShowBigImg = (file: any) => {
    const modal: any = showBigImgModel?.current;
    modal.open(file);
  };
  // 点击查文件
  const openShowBigFiles = (file: any) => {
    const modal: any = showBigFilesModel?.current;
    modal.open(file);
  };
  // 点击查视频
  const openShowBigVideo = (file: any) => {
    const modal: any = showBigVideoModel?.current;
    modal.open(file);
  };
  // 点击动作
  const checkBig = (file: any) => {
    const suffixName = pubGetUploadFileSuffix(file.name); // 单个文件对象的后辍名，从name里取
    const suffixFiles = ['doc', 'docx', 'pdf', 'xlsx', 'xls', 'ppt', 'zip', 'rar']; // 文件类型的枚举
    const suffixImages = ['jpg', 'jpeg', 'gif', 'png']; // 图片类型的枚举
    const suffixVideo = ['mp4', 'mp3']; // 视频类型的枚举
    if (suffixFiles.includes(suffixName)) {
      openShowBigFiles(file);
    }
    if (suffixImages.includes(suffixName)) {
      openShowBigImg(file);
    }
    if (suffixVideo.includes(suffixName)) {
      openShowBigVideo(file);
    }
  };

  const nodeModal = (file: any) => {
    const suffixName = pubGetUploadFileSuffix(file.name); // 单个文件对象的后辍名，从name里取
    const fileModal = (s_name: string) => {
      if (s_name === 'doc' || s_name === 'docx') {
        return <FileWordOutlined />;
      } else if (s_name === 'pdf') {
        return <FilePdfOutlined />;
      } else if (s_name === 'xlsx' || s_name === 'xls') {
        return <FileExcelOutlined />;
      } else if (s_name === 'zip' || s_name === 'rar') {
        return <FileZipOutlined />;
      } else if (s_name === 'ppt') {
        return <FilePptOutlined />;
      } else if (s_name === 'mp4') {
        return <VideoCameraOutlined />;
      } else if (s_name === 'mp3') {
        return <NotificationOutlined />;
      } else if (s_name === 'jpg' || s_name === 'jpeg' || s_name === 'gif' || s_name === 'png') {
        return <img src={file.access_url} />;
      } else {
        return <FileOutlined />;
      }
    };
    return fileModal(suffixName);
  };
  return (
    <div
      className={`myShowFiles-base ${size == 'small' ? 'myShowFiles-small' : ''} ${
        size == 'mini' ? 'myShowFiles-mini' : ''
      } ${list.length == 1 ? 'myShowFiles-one' : ''}`}
    >
      {list.map((item: any) => {
        return (
          <div
            className={`myShowFiles ${listType == 'text' ? 'myShowFiles-text' : ''} ${
              listType == 'picture-card' ? 'myShowFiles-picture-card' : ''
            }  ${listType == 'text-line' ? 'myShowFiles-text-line' : ''}`}
            key={item.id}
          >
            <div className={`myShowFiles-isMain ${isMain && item.isMain ? 'isMainShow' : ''}`}>
              <span>主图</span>
            </div>
            <div className="myShowFiles-nav" onClick={() => checkBig(item)}>
              <div className="myShowFiles-icon">
                <PaperClipOutlined />
              </div>
              <div className="myShowFiles-img">{nodeModal(item)}</div>
              <div className="myShowFiles-name">{item.name}</div>
            </div>
            {isShowDownLoad ? (
              <div className="myShowFiles-option">
                <Button
                  title="下载文件"
                  type="text"
                  onClick={() => pubDownLoad(item?.access_url, item?.name)}
                  icon={<CloudDownloadOutlined />}
                />
              </div>
            ) : (
              ''
            )}
            <PubShowBigImg showBigImgModel={showBigImgModel} />
            <PubShowBigFiles showBigFilesModel={showBigFilesModel} />
            <PubShowBigVideo showBigVideoModel={showBigVideoModel} />
          </div>
        );
      })}
    </div>
  );
};
export default Detail;

/**
 * data 原数据回显 [] 直接用现在接口返回的数据
 * listType 非必填 (picture,picture-card, text, text-line )  默认为text
 * isShowDownLoad 非必填 是否要下载按钮
 * isShowDownLoad={true}
 * isMain={true} 是否显示有没有主图
 * size='small'  大小 small | mini 默认无或者 normal
 * normal  大小 104px
 * small   大小 70px
 * mini    大小 45px
 *

 * 使用方法
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示

<ShowFileList
  data={detailData.sys_files}
  listType="text-line"
/>
 *
 */
