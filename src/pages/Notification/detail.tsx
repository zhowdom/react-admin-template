import React, { useRef, useState } from 'react';
import { Button, Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { ProFormDependency, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { Editor } from '@tinymce/tinymce-react';
import { history } from 'umi';
import { useUnmount } from '@umijs/hooks';
import { pubGetUserList, pubGetVendorUserList } from '@/utils/pubConfirm';
import { addListItem, getDetail } from '@/services/pages/notification';
import { baseFileDelete, baseFileUpload } from '@/services/base';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const queryId = history.location.query?.id || '';
const Page: React.FC = () => {
  const editorRef = useRef<any>({});
  const uploadedImg = useRef([]);
  const formRef = useRef<ProFormInstance>();
  const [initialState, setInitialState] = useState<Record<string, any>>({
    content: '',
    receiver_type: 0,
    title: '',
    type: 0,
    receiver_user_list: [],
  });

  const submit = async (values: any) => {
    if (queryId) values.id = queryId;
    values.content = editorRef?.current?.getContent();
    if (values.receiver_type == 0 || values.receiver_scope == 0 || values.type == 2) {
      values.receiver_user_list = [];
    } else {
      values.receiver_user_list = values.receiver_user_list.map((item: any) => ({
        user_type: values.receiver_type,
        user_id: item.value,
        user_name: item.label,
      }));
    }
    const res = await addListItem(values);
    if (res.code == pubConfig.sCode) {
      uploadedImg.current = [];
      pubMsg('提交成功!', 'success');
      history.goBack();
    } else {
      pubMsg(res.message);
    }
  };

  const fetchInitialState = async () => {
    if (queryId) {
      const res = await getDetail({ id: queryId });
      if (res.code == pubConfig.sCode) {
        setInitialState(res.data);
        return res.data;
      } else {
        pubMsg(res.message);
      }
    }
    return initialState;
  };

  // 删除垃圾图片文件
  // deleteFile({filePath: 'https://liyi99-pic.oss-cn-shenzhen.aliyuncs.com/hr/resume/2021/9/23/670499.jpg?Expires=1947746231&OSSAccessKeyId=LTAI4GCVJHHFcSbHZa4JLsci&Signature=prT733Zk3%2Bb8hSlcU6My0i0rXQc%3D'})
  const deleteImg = async () => {
    if (uploadedImg.current.length) {
      uploadedImg.current.forEach((imgId: any) => {
        baseFileDelete({ id: imgId });
      });
    }
    uploadedImg.current = [];
  };
  useUnmount(() => {
    deleteImg();
    if (typeof window.hideLoading === 'function') {
      window.hideLoading();
    }
  });

  return (
    <>
      <PageContainer title={false}>
        <Card>
          <ProForm
            layout="horizontal"
            formRef={formRef}
            submitter={{
              searchConfig: {
                submitText: '立即发布',
              },
              render: (_, dom) => (
                <FooterToolbar>
                  <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                    返回
                  </Button>
                  {queryId ? null : dom}
                </FooterToolbar>
              ),
            }}
            onReset={() => {
              editorRef.current?.setContent(initialState.content);
            }}
            onFinish={submit}
            request={fetchInitialState}
          >
            {queryId ? (
              <ProForm.Group>
                <ProFormText name="create_time" label="创建时间" readonly />
                <ProFormText name="create_user_name" label="创建人" readonly />
              </ProForm.Group>
            ) : null}
            <ProFormText
              width="lg"
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入标题' }]}
              readonly={!!queryId}
            />
            <ProForm.Group>
              <ProFormSelect
                name="type"
                label="分类"
                allowClear={false}
                options={[
                  { label: '消息', value: 0 },
                  { label: '通知', value: 1 },
                  { label: '公告', value: 2 },
                ]}
                rules={[{ required: true, message: '必填/必选项' }]}
                readonly={!!queryId}
              />
              <ProFormSelect
                name="receiver_type"
                label="接收人员类型"
                placeholder="请选择接收群体"
                allowClear={false}
                options={[
                  { label: '全部', value: 0 },
                  { label: '供应商', value: 1 },
                  { label: '内部员工', value: 2 },
                ]}
                rules={[{ required: true, message: '必填/必选项' }]}
                readonly={!!queryId}
                fieldProps={{
                  onChange: () => formRef?.current?.setFieldsValue({ receiver_user_list: [] }),
                }}
              />
              <ProFormDependency name={['receiver_type', 'type']}>
                {({ receiver_type, type }) =>
                  receiver_type == 0 || type == 2 ? null : (
                    <ProFormSelect
                      name="receiver_scope"
                      label="接收人员范围"
                      allowClear={false}
                      initialValue={1}
                      dependencies={['receiver_type']}
                      request={async (params: any) => {
                        const scopeName = params.receiver_type == 1 ? '供应商' : '内部员工';
                        return [
                          { label: `全部${scopeName}`, value: 0 },
                          { label: `部分${scopeName}`, value: 1 },
                        ];
                      }}
                      readonly={!!queryId}
                    />
                  )
                }
              </ProFormDependency>
            </ProForm.Group>
            <ProFormDependency name={['type']}>
              {({ type }) => {
                if (type == 2) {
                  return null;
                } else {
                  return (
                    <ProFormDependency name={['receiver_type', 'receiver_scope']}>
                      {({ receiver_type, receiver_scope }) => {
                        if (receiver_type == 1 && receiver_scope == 1) {
                          return (
                            <ProFormSelect
                              key="selectProvider"
                              name="receiver_user_list"
                              label="供应商选择"
                              placeholder="请选择具体接受的供应商（可多选）"
                              rules={[{ required: true, message: '请选择供应商' }]}
                              showSearch
                              debounceTime={300}
                              readonly={!!queryId}
                              fieldProps={{
                                filterOption: (input: any, option: any) => {
                                  const trimInput = input.replace(/^\s+|\s+$/g, '');
                                  if (trimInput) {
                                    return option.label.indexOf(trimInput) >= 0;
                                  } else {
                                    return true;
                                  }
                                },
                                mode: 'multiple',
                                labelInValue: true,
                              }}
                              request={async (v) => {
                                const res: any = await pubGetVendorUserList(v);
                                return res;
                              }}
                            />
                          );
                        } else if (receiver_type == 2 && receiver_scope == 1) {
                          return (
                            <ProFormSelect
                              key="selectStaff"
                              name="receiver_user_list"
                              label="内部员工选择"
                              placeholder="请选择具体接收的人员（可多选）"
                              rules={[{ required: true, message: '必选/必填项' }]}
                              showSearch
                              debounceTime={300}
                              readonly={!!queryId}
                              fieldProps={{
                                filterOption: (input: any, option: any) => {
                                  const trimInput = input.replace(/^\s+|\s+$/g, '');
                                  if (trimInput) {
                                    return option.label.indexOf(trimInput) >= 0;
                                  } else {
                                    return true;
                                  }
                                },
                                mode: 'multiple',
                                labelInValue: true,
                              }}
                              request={async (v) => {
                                const res: any = await pubGetUserList(v);
                                return res;
                              }}
                            />
                          );
                        }
                        return null;
                      }}
                    </ProFormDependency>
                  );
                }
              }}
            </ProFormDependency>
            <div style={{ paddingBottom: '4px' }}>消息内容:</div>
            <Editor
              tinymceScriptSrc={`/tinymce/tinymce.min.js`}
              onInit={(evt, editor) => {
                editorRef.current = editor;
                if (queryId) {
                  setTimeout(() => {
                    editor.mode.set('readonly');
                  }, 0);
                }
              }}
              initialValue={initialState.content}
              apiKey="xm3b5ym8rco07l2zxvqmbfl8iogq4j1650hfj24j1dcgk18z" // 关联免费tinymec帐户1456321566@qq.com
              init={{
                height: 800,
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
                link_list: [
                  { title: '礼意久久官网', value: 'https://www.liyi99.com' },
                  { title: '礼意久久HR邮箱', value: 'support@liyi99.com' },
                ],
                image_list: [
                  {
                    title: '宣传图片1',
                    value:
                      'https://liyi99-pic.oss-cn-shenzhen.aliyuncs.com/hr/resume/2021/9/22/221886.jpg?Expires=1947643993&OSSAccessKeyId=LTAI4GCVJHHFcSbHZa4JLsci&Signature=%2BvKBcZ0nZ62gz02OqCIv25GUiN0%3D',
                  },
                  {
                    title: '宣传图片2',
                    value:
                      'https://liyi99-pic.oss-cn-shenzhen.aliyuncs.com/hr/resume/2021/9/23/670499.jpg?Expires=1947746231&OSSAccessKeyId=LTAI4GCVJHHFcSbHZa4JLsci&Signature=prT733Zk3%2Bb8hSlcU6My0i0rXQc%3D',
                  },
                ],
                image_class_list: [
                  { title: '图片原始大小', value: '' },
                  { title: '自适应宽', value: 'img-auto' },
                  { title: '100%宽', value: 'img-full-with' },
                ],
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
                          uploadedImg.current.push(res.data[0].id as never);
                          callback(res.data[0].access_url);
                        } else {
                          pubMsg(`上传失败:${res?.message}`);
                        }
                      })
                      .finally(() => window.hideLoading());
                  };
                  input.click();
                },
                templates: [
                  {
                    title: '表格模板',
                    description: 'creates a new table',
                    content:
                      '<div class="mceTmpl"><table width="98%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>',
                  },
                  {
                    title: 'Starting my story',
                    description: 'A cure for writers block',
                    content: 'Once upon a time...',
                  },
                  {
                    title: 'New list with dates',
                    description: 'New List with dates',
                    content:
                      '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>',
                  },
                ],
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
                content_css: '/hr/tinymce/tinymceCustom.css',
                video_template_callback: function (data: any) {
                  return `<video width="100%" height="${data.height}" autoplay="autoplay" loop="loop" preload="" muted="muted" src="${data.source}" class="video"></video>`;
                },
              }}
            />
          </ProForm>
        </Card>
      </PageContainer>
    </>
  );
};
export default Page;
