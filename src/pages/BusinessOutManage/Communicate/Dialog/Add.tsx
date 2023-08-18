import { useState, useRef } from 'react';
import { Modal, Form, Button, Divider, Spin } from 'antd';
import { connect } from 'umi';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProFormDatePicker,
  ProFormDependency,
} from '@ant-design/pro-form';
import { insert, update, getDetailById } from '@/services/pages/communicate';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { pubGetUserList, pubGetVendorList } from '@/utils/pubConfirm';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import BusinessOutDetail from '@/components/BusinessOut/BusinessOutDetail';
import CommunicateDetailTop from '@/components/BusinessOut/CommunicateDetail-Top'; // 沟通详情的上半部分

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('add');

  const baseDialogForm = {
    // 弹窗表单
    id: '', //ID
    communicate_id: '', //员工ID
    communicate_name: '', //员工姓名
    vendor_id: '', //供应商ID
    communicate_time: null, //沟通时间
    communicate_content: '', //沟通内容
    status: '', // 暂存：I， 提交：C
    sys_files: [], //附件
  };
  const [state, setState] = useState({
    isModalVisible: false, // 弹窗显示
    dialogForm: baseDialogForm,
  });
  const [detailData, setDetailData] = useState<any>({
    source: '', // 来源  从出差来的要显示出差详情
    sys_files: [], //附件
    vendorTravelRecords: {
      // 出差信息对象
      travelRecordsTrip: {
        dpp_region: {}, //出发省份对象
        dpc_region: {}, //出发城市对象
        dtp_region: {}, //目的省份对象
        dtc_region: {}, //目的城市对象
        travelPeopleList: [],
      },
    },
  });
  const formRef = useRef<ProFormInstance>();
  // 获取沟通详情
  const getBusinessOutDetail = async (id: string): Promise<any> => {
    const res = await getDetailById({
      id: id,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const newData = res.data;
      setDetailData(newData);
      setState((pre: any) => {
        return {
          ...pre,
          dialogForm: newData,
        };
      });
      formRef?.current?.setFieldsValue({
        communicate_time: newData.communicate_time ? newData.communicate_time : null,
        communicate_content: newData.communicate_content ? newData.communicate_content : '',
        id: newData.id,
      });
    }
  };
  props.addModel.current = {
    open: (id: string) => {
      setState((pre: any) => {
        const newData = baseDialogForm;
        newData.id = id;
        return {
          ...pre,
          dialogForm: newData,
          isModalVisible: true,
        };
      });
      setDetailData((pre: any) => {
        return {
          ...pre,
          sys_files: [],
        };
      });
      if (id) {
        setType('edit');
        getBusinessOutDetail(id);
      } else {
        setType('add');
      }
    },
  };
  const modalOk = (val: string) => {
    formRef.current?.setFieldsValue({ status: val });
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setState((pre: any) => {
      return {
        ...pre,
        isModalVisible: false,
      };
    });
    if (!val) props.handleClose(true);
  };
  // 改变 出差申请人
  const changeApplicant = (id: any, data: any) => {
    formRef.current?.setFieldsValue({ communicate_name: data.name });
  };
  // 上传结束后
  const handleUpload = async (data: any) => {
    console.log(data);
    formRef.current?.setFieldsValue({ sys_files: data });
  };
  // 添加
  const saveAdd = async (val: any) => {
    setLoading(true);
    const res = await insert(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('提交成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 修改编辑
  const saveUpdate = async (val: any) => {
    setLoading(true);
    const res = await update(val);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      pubMsg('编辑成功！', 'success');
      modalClose(false);
    }
    setLoading(false);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    return type === 'add' ? saveAdd(val) : saveUpdate(val);
  };

  // 自定义弹窗按钮
  const footerList = [
    <Button key="back" onClick={modalClose}>
      取消
    </Button>,
    <Button key="submit" type="primary" loading={loading} onClick={() => modalOk('C')}>
      确定
    </Button>,
  ];
  if (type === 'add') {
    footerList.splice(
      1,
      0,
      <Button key="temporary" type="primary" loading={loading} ghost onClick={() => modalOk('I')}>
        暂存
      </Button>,
    );
  }
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  };
  return (
    <Modal
      width={800}
      title={state.dialogForm?.id ? '编辑沟通信息' : '新增沟通信息'}
      visible={state.isModalVisible}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      footer={footerList}
    >
      <Spin spinning={loading}>
        {type === 'add' ? (
          ''
        ) : (
          <>
            <ProForm
              submitter={false}
              layout="horizontal"
              className="pub-detail-form"
              {...formItemLayout}
            >
              {detailData.source === 'VENDOR_TRAVEL_RECORDS' ? (
                <BusinessOutDetail id={detailData.travel_records_id} />
              ) : (
                <CommunicateDetailTop data={detailData} />
              )}
            </ProForm>
            <Divider orientation="left" orientationMargin="0">
              补充信息
            </Divider>
          </>
        )}
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          submitter={false}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10 }}
          initialValues={state.dialogForm}
          layout="horizontal"
        >
          <ProFormText name="id" label="id" hidden />
          <ProFormDependency name={['id']}>
            {({ id }) => {
              return id ? (
                ''
              ) : (
                <>
                  <ProFormSelect
                    name="communicate_id"
                    label="员工姓名"
                    rules={[{ required: true, message: '请选择员工' }]}
                    showSearch
                    debounceTime={300}
                    fieldProps={{
                      filterOption: (input: any, option: any) => {
                        const trimInput = input.replace(/^\s+|\s+$/g, '');
                        if (trimInput) {
                          console.log(66);
                          return option.label.indexOf(trimInput) >= 0;
                        } else {
                          return true;
                        }
                      },
                      onChange: (vid, data) => {
                        changeApplicant(vid, data);
                      },
                    }}
                    request={async (v) => {
                      const res: any = await pubGetUserList(v);
                      return res;
                    }}
                  />
                  <ProFormText name="communicate_name" label="员工姓名" hidden />
                  <ProFormSelect
                    name="vendor_id"
                    label="供应商"
                    rules={[{ required: true, message: '请选择供应商' }]}
                    showSearch
                    debounceTime={300}
                    fieldProps={{
                      filterOption: (input: any, option: any) => {
                        const trimInput = input.replace(/^\s+|\s+$/g, '');
                        if (trimInput) {
                          return option.label.indexOf(trimInput) >= 0;
                        } else {
                          return true;
                        }
                      },
                    }}
                    request={async (v) => {
                      const res: any = await pubGetVendorList(v);
                      return res;
                    }}
                  />
                </>
              );
            }}
          </ProFormDependency>
          <ProFormDatePicker
            name="communicate_time"
            label="沟通时间"
            rules={[{ required: true, message: '请选择沟通时间' }]}
          />
          <ProFormTextArea
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 18 }}
            name="communicate_content"
            label="沟通内容"
            placeholder="请输入沟通内容"
            rules={[{ required: true, message: '请输入沟通内容' }]}
          />
          <Form.Item
            label="其他信息"
            name="sys_files"
            extra="支持.jpg,.jpeg,.MP4,.MP3格式,最多可上传20张照片，10个音频，5个视频，图片最大2M，音频最大5M，视频最大10M"
          >
            <UploadFileList
              fileBack={handleUpload}
              businessType="VENDOR_COMMUNICATION_RECORD"
              listType="picture"
              defaultFileList={detailData.sys_files}
              accept={['.jpg,.jpeg,.mp4,.mp3']}
              acceptType={['jpg', 'jpeg', 'mp4', 'mp3']}
              maxSize="10"
              maxCount="35"
            />
          </Form.Item>
          <ProFormText name="status" label="操作状态" hidden />
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
