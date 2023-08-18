import { useState, useRef, useEffect } from 'react';
import { Upload, Button } from 'antd';
import {
  UploadOutlined,
  LoadingOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  FileOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileWordOutlined,
  FileZipOutlined,
  NotificationOutlined,
  PaperClipOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { baseFileUpload } from '@/services/base';
import type { UploadProps } from 'antd';
import { pubConfig, pubModal, pubMessage } from '@/utils/pubConfig';
import { pubBeforeUpload, pubGetUploadFileSuffix } from '@/utils/pubConfirm';
import PubShowBigImg from '@/components/PubShowBigImg/Images';
import PubShowBigFiles from '@/components/PubShowBigImg/Files';
import PubShowBigVideo from '@/components/PubShowBigImg/Video';
import './UploadFileList.less';

const Detail = (props: any) => {
  const {
    fileBack,
    businessType,
    listType = 'text',
    accept,
    acceptType,
    required = false, // 是否必填，这个参数的作用是，当是非必填时，删除光原数据，要返回删除后的数据， 当是必填时，删除光要返回空数组，当再上传时，要把原数据补进去
    maxSize = '10',
    maxCount,
    acceptMessage,
    defaultFileList,
    checkMain = false,
    size = 'normal',
  } = props;
  const [overFileList, setOverFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const showBigImgModel = useRef(); // 图片查看modal
  const showBigFilesModel = useRef(); // 文件查看modal
  const showBigVideoModel = useRef(); // 视频查看modal

  useEffect(() => {
    let backList = [];
    // console.log(defaultFileList);
    if (!defaultFileList) {
      backList = [];
    } else {
      // 显示默认已有的图片列表
      backList = defaultFileList?.map((val: any) => {
        return {
          uid: val.id,
          url: val.path,
          name: val.name,
          id: val.id,
          access_url: val.access_url,
          isMain: val.isMain,
          delete: val.delete,
        };
      });
    }
    console.log(backList);
    if (backList.length && checkMain) {
      backList[0].isMain = 1;
    }
    // fileBack 第二个参数 为true时 是第一次返回 其他情况为空
    if (typeof fileBack === 'function') {
      setOverFileList(backList);
      fileBack(backList, true);
    }
  }, [defaultFileList]);
  // 已上传的数据(包括删掉的) 中有多少个已设置主图
  const getMainNum = (data: any) => {
    // const num = data.filter((val: any) => val.isMain).length;
    return data.filter((val: any) => val.isMain && !val.delete).length;
  };
  // 已上传的数据 中有多少是没有删除的
  const getNoDetelNum = (data: any) => {
    return data.filter((val: any) => !val.delete).length;
  };
  // 排序
  const compare = (property: any, type: string) => {
    // type  desc降序   asc 升序
    return function (a: any, b: any) {
      const value1 = a[property];
      const value2 = b[property];
      return type == 'desc' ? value2 - value1 : value1 - value2;
    };
  };
  // 返回
  const allBack = (data: any) => {
    // 上传后的数据重新排序 把删除的放后面
    const backList = data.sort(compare('isMain', 'desc')).sort(compare('delete', 'asc'));
    const showNum = getNoDetelNum(backList); // 还剩下的没有删除的个数
    console.log(showNum);
    console.log(required);
    // 保存上传后的数据数组 到组件
    setOverFileList(backList);
    // 返回上传后的数据数组 到 父页面
    if (required) {
      if (showNum) {
        fileBack(backList);
      } else {
        fileBack([]);
      }
    } else {
      fileBack(backList);
    }
    // loading停止
    setLoading(false);
  };
  // 上传
  const handleUpload = async (data: any) => {
    console.log(data);
    // loading开始
    setLoading(true);
    const res = await baseFileUpload({ file: data.file, business_type: businessType });
    if (res?.code != pubConfig.sCode) {
      pubMessage(res?.message);
      setLoading(false);
      return;
    }
    pubMessage('文件上传成功！', 'success');
    const resData = res?.data[0];
    console.log(checkMain);
    const mainNum = getMainNum(overFileList);
    console.log(mainNum);
    const img = [
      {
        uid: resData.id,
        url: resData.path,
        name: resData.name,
        id: resData.id,
        access_url: resData.access_url,
        isMain: checkMain && !mainNum ? 1 : 0,
        delete: 0,
      },
    ];
    console.log(img);
    let resList = [];
    // 如果限制只上传一张，则直接替换文件
    if (maxCount == 1) {
      console.log(2);
      const newAllList = overFileList.map((val: any) => {
        return {
          ...val,
          delete: 1,
          isMain: 0,
        };
      });
      img[0].isMain = 1;
      console.log(newAllList);
      resList = newAllList.concat(img);
    } else {
      resList = overFileList.concat(img);
    }
    allBack(resList);
  };
  // 删除文件时
  const handleDel = (data: any) => {
    return new Promise<boolean>((resolve: any) => {
      return pubModal('是否删除 ' + data.name + ' ?')
        .then(() => {
          const delIndex = overFileList.findIndex((v) => v.uid === data.uid);
          overFileList[delIndex].delete = 1;
          overFileList[delIndex].isMain = 0;
          // 当需要主图时，删除到最后一张，默认设置成主图
          const showNum = getNoDetelNum(overFileList);
          console.log(showNum);
          if (showNum) {
            if (checkMain) {
              const firstShowIndex = overFileList.findIndex((val: any) => !val.delete);
              overFileList[firstShowIndex].isMain = 1;
            }
            allBack(overFileList);
          } else {
            allBack(overFileList);
          }
          return resolve(true);
        })
        .catch(() => {
          console.log('点击了取消');
          return false;
        });
    });
  };
  // 点击查看大图
  const openShowBigImg = (file: any) => {
    const data: any = showBigImgModel?.current;
    data.open(file);
  };
  // 点击查文件
  const openShowBigFiles = (file: any) => {
    const data: any = showBigFilesModel?.current;
    data.open(file);
  };
  // 点击查视频
  const openShowBigVideo = (file: any) => {
    const data: any = showBigVideoModel?.current;
    data.open(file);
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
  // 设置主图
  const choseMainImg = (file: any) => {
    // 已有的图片列表
    const newAllList = overFileList.map((val: any) => {
      if (file.uid == val.uid) {
        return {
          ...val,
          isMain: 1,
        };
      } else {
        return {
          ...val,
          isMain: 0,
        };
      }
    });
    allBack(newAllList);
  };
  // 节点自定义
  const myFileNode = (originNode: any, file: any, fileList: any, actions: any) => {
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
    const nodeModal = fileModal(suffixName); // 节点
    return (
      <div
        className={`myFileBack ${file.delete ? 'myFileHidden' : ''} ${
          listType == 'text' ? 'myFileBack-text' : ''
        } ${listType == 'picture-card' ? 'myFileBack-picture-card' : ''}`}
      >
        <div className={`myFileBack-isMain ${file.isMain && checkMain ? 'isMainShow' : ''}`}>
          <span>主图</span>
        </div>
        <div className="myFileBack-nav" onClick={() => checkBig(file)}>
          <div className="myFileBack-icon">
            <PaperClipOutlined />
          </div>
          <div className="myFileBack-img">{nodeModal}</div>
          <div className="myFileBack-name">{file.name}</div>
        </div>
        {listType == 'picture-card' ? (
          <div
            className={
              props.disabled ? 'disabled myFileBack-option-card' : 'myFileBack-option-card'
            }
          >
            {!props.disabled && checkMain ? (
              <div className="option-card-isMain" onClick={() => choseMainImg(file)}>
                设置主图
              </div>
            ) : (
              ''
            )}
            {props.disabled ? (
              ''
            ) : (
              <div
                className="option-card-del"
                title="删除文件"
                onClick={() => actions.remove(file)}
              />
            )}
          </div>
        ) : (
          <div className="myFileBack-option">
            {!props.disabled && checkMain ? (
              <Button title="设置主图" type="text" onClick={() => choseMainImg(file)}>
                设置主图
              </Button>
            ) : (
              ''
            )}
            {props.disabled ? (
              ''
            ) : (
              <Button
                title="删除文件"
                type="text"
                onClick={() => actions.remove(file)}
                icon={<DeleteOutlined />}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // 文件上传配置
  const uploadProps: UploadProps = {
    accept: accept,
    beforeUpload: (file: any) => {
      return pubBeforeUpload({
        file,
        acceptType,
        maxSize,
        maxCount,
        overFileList,
        acceptMessage,
        fileData: props.fileData,
      });
    },
    onRemove(file) {
      // console.log('删除的:', file);
      return handleDel(file);
    },
    itemRender: (
      originNode: any,
      file: any,
      fileList: any,
      actions: any,
      // actions: { download; preview; remove },
    ) => {
      return file.delete ? false : myFileNode(originNode, file, fileList, actions);
    },
  };

  return (
    <>
      <Upload
        disabled={props.disabled}
        customRequest={handleUpload}
        listType={listType}
        {...uploadProps}
        fileList={overFileList}
        className={`customUpload ${size == 'small' ? 'customUpload-small' : ''} ${
          size == 'mini' ? 'customUpload-mini' : ''
        } ${maxCount == 1 ? 'customUpload-one' : ''}`}
      >
        {props.disabled ? (
          ''
        ) : (
          <>
            {listType == 'picture-card' ? (
              <div>
                <PlusOutlined />
                {size == 'normal' ? <div style={{ marginTop: 8 }}>上传</div> : ''}
              </div>
            ) : (
              <Button
                className="customUpload-button"
                icon={loading ? <LoadingOutlined /> : <UploadOutlined />}
                disabled={loading}
              >
                上传文件
              </Button>
            )}
            {loading ? (
              <div className="customUpload-button-loading">
                <SyncOutlined spin style={{ marginRight: 8 }} /> 文件上传中...
              </div>
            ) : (
              ''
            )}
          </>
        )}
      </Upload>
      <PubShowBigImg showBigImgModel={showBigImgModel} />
      <PubShowBigFiles showBigFilesModel={showBigFilesModel} />
      <PubShowBigVideo showBigVideoModel={showBigVideoModel} />
    </>
  );
};
export default Detail;

/**
 * fileBack 上传结束后 或 触发删除上传动作后的 回调
 * businessType 必填  上传接口的key
 * listType 非必填 (picture,picture-card, text )  默认为text
 * accept 非必填 打开上传文件弹窗时，显示的文件类型，默认只显示指定的文件类型  可以和acceptType配套使用，也可以不用
 * acceptType 非必填 默认不限制上传文件类型  后辍名的数组

 * acceptMessage 非必填 当上传类型错误时，指定自定义的提示信息，默认提示的信息 提示"上传格式不正确！
 * maxSize 非必填 上传大小限制 单位 M
 * maxCount 非必填 上传数量限制  注意：当为1时，不提示数量超出而是直接替换原文件
 * defaultFileList 非必填 原数据回显 [] 直接用现在接口返回的数据
 * checkMain={true}  非必填 是否有设置主图的按钮操作 默认false
 * disabled
 * size='small'  大小 small | mini 默认无或者 normal
 * normal  大小 104px
 * small   大小 70px
 * mini    大小 45px
 *

 * 使用方法
import UploadFileList from '@/components/PubUpload/UploadFileList';

// 上传结束后
const handleUpload = async (data: any) => {
  console.log(data);
  formRef.current?.setFieldsValue({ sys_files: data });
};

<Form.Item
  label="其他信息"
  name="sys_files"
  extra="支持.jpg,.jpeg,.MP4,.MP3格式,最多可上传20张照片，10个音频，5个视频，图片最大2M，音频最大5M，视频最大10M"
>
  <UploadFileList
    fileBack={handleUpload}
    businessType="VENDOR_LICENSE"
    listType="picture"
    checkMain={true}
    required
    defaultFileList={detailData.sys_files}
    accept={['.jpg,.jpeg,.mp4,.mp3']}
    acceptType={['jpg','jpeg','mp4','mp3']}
    acceptMessage="上传格式不对，请检查上传文件"
    maxSize="5"
    maxCount="5"
    fileData={{
      pic: {
        size: 2,
        count: 20,
      },
      video: {
        size: 10,
        count: 5,
      },
    }}
  />
</Form.Item>
 *
 */
