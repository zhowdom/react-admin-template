import { useRef, useState, useEffect } from 'react';
import { Access, useAccess } from 'umi';
import { Spin, Space, Card, Button } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormText, ProFormRadio } from '@ant-design/pro-form';
import { vendorFeedbackNotice, saveNotice } from '@/services/pages/supplier';

import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { Editor } from '@tinymce/tinymce-react';
import { baseFileUpload } from '@/services/base';
import Preview from './Dialog/Preview';
import './style.less';

const Page = (props: any) => {
  const { dicList } = props;
  console.log(dicList);
  const [loading, setLoading] = useState(false);
  const [initialState, setInitialState] = useState<Record<string, any>>({
    content: '',
    copyContent: '',
  });

  const access = useAccess();
  const formRef = useRef<ProFormInstance>();
  const editorRef = useRef<any>({});
  // 添加弹窗实例
  const previewModel = useRef();
  // 详情
  const getDetail = async () => {
    setLoading(true);
    const res = await vendorFeedbackNotice({});
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      formRef.current?.setFieldsValue({
        title: res?.data?.title,
        status: res?.data?.status,
      });
      setInitialState({
        content: res?.data?.content,
        copyContent: res?.data?.content,
      });
    }
    setLoading(false);
  };
  // 保存
  const saveSubmit = async (values: any) => {
    values.content = editorRef?.current?.getContent();
    console.log(values);
    const res = await saveNotice(values);
    if (res.code == pubConfig.sCode) {
      pubMsg('提交成功!', 'success');
    } else {
      pubMsg(res.message);
    }
  };
  // 还原
  const returlback = () => {
    editorRef.current.setContent(initialState.copyContent);
  };

  // 预览
  const previewModelOpen: any = () => {
    const data: any = previewModel?.current;
    data.open({
      title: formRef.current?.getFieldsValue()?.title,
      content: editorRef?.current?.getContent(),
    });
  };

  useEffect(() => {
    getDetail();
  }, []);
  return (
    <Card>
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          layout="horizontal"
          submitter={false}
        >
          <ProFormText
            name="title"
            label="标题"
            placeholder="请输入标题"
            labelCol={{ flex: '60px' }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: '请输入标题' }]}
          />
          <div className="complaint-body">
            <div className="complaint-body-title">
              <span>*</span>正文
            </div>
            <div className="complaint-body-con">
              <Editor
                tinymceScriptSrc={`/tinymce/tinymce.min.js`}
                apiKey="xm3b5ym8rco07l2zxvqmbfl8iogq4j1650hfj24j1dcgk18z" // 关联免费tinymec帐户1456321566@qq.com
                onInit={(evt, editor) => {
                  editorRef.current = editor;
                }}
                initialValue={initialState.content}
                init={{
                  height: 500,
                  language: 'zh_CN',
                  plugins:
                    'print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
                  imagetools_cors_hosts: ['liyi99-pic.oss-cn-shenzhen.aliyuncs.com'],
                  images_upload_credentials: true,
                  menubar: 'file edit view insert format tools table help',
                  toolbar:
                    'undo redo | bold italic underline strikethrough | image fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | insertfile media template link anchor codesample | charmap emoticons | fullscreen  preview save print | ltr rtl',
                  toolbar_sticky: false,
                  autosave_ask_before_unload: true,
                  autosave_interval: '30s',
                  autosave_prefix: '{path}{query}-{id}-',
                  autosave_restore_when_empty: false,
                  autosave_retention: '2m',
                  image_advtab: true,
                  importcss_append: true,
                  a11y_advanced_options: true,
                  file_picker_types: 'image media',
                  file_picker_callback: function (callback) {
                    // 上传图片
                    const input: any = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.onchange = function () {
                      const file = this.files[0];
                      window.hideLoading = pubMsg('正在上传中...', 'loading', 0);
                      baseFileUpload({ file, business_type: 'VENDOR_MEDIA' })
                        .then((res: any) => {
                          if (res.code == pubConfig.sCode) {
                            callback(res.data[0].access_url);
                          } else {
                            pubMsg(`上传失败:${res?.message}`);
                          }
                        })
                        .finally(() => window.hideLoading());
                    };
                    input.click();
                  },
                  template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
                  template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
                  image_caption: false,
                  quickbars_selection_toolbar:
                    'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                  noneditable_noneditable_class: 'mceNonEditable',
                  toolbar_mode: 'sliding',
                  contextmenu: 'link image imagetools table',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  fontsize_formats:
                    '12px 13px 14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px',
                  video_template_callback: function (data: any) {
                    return `<video width="100%" height="${data.height}" autoplay="autoplay" loop="loop" preload="" muted="muted" src="${data.source}" class="video"></video>`;
                  },
                }}
              />
            </div>
          </div>
          <ProFormRadio.Group
            name="status"
            label="状态"
            placeholder="请选择状态"
            labelCol={{ flex: '60px' }}
            wrapperCol={{ span: 14 }}
            valueEnum={{
              enable: '发布',
              disable: '停用',
            }}
            rules={[{ required: true, message: '请选择状态' }]}
            help={
              <>
                <p style={{ margin: 0 }}>发布：每日推送公告至供应商，供应商登录即展示</p>
                <p style={{ margin: 0 }}>停用：暂停推送公告给供应商</p>
              </>
            }
          />

          <ProForm.Item label="操作" labelCol={{ flex: '60px' }}>
            <Space>
              <Access key="returlback" accessible={access.canSee('scm_complaint_returnBack')}>
                <Button onClick={() => returlback()}>还原</Button>
              </Access>

              <Access key="returlsaveback" accessible={access.canSee('scm_complaint_save')}>
                <Button type="primary" onClick={() => formRef?.current?.submit()}>
                  保存
                </Button>
              </Access>
              <Access key="yu" accessible={access.canSee('scm_complaint_preview')}>
                <Button ghost type="primary" onClick={() => previewModelOpen()}>
                  预览
                </Button>
              </Access>
            </Space>
          </ProForm.Item>
        </ProForm>
      </Spin>
      <Preview previewModel={previewModel} />
    </Card>
  );
};

export default Page;
