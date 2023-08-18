import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { pubConfig, pubModal, pubMsg } from '@/utils/pubConfig';
import { useRef, useState } from 'react';
import './index.less';
import { Button, Form, Space } from 'antd';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import './index.less';

export default (props: any) => {
  const { btnText, type, api, selectedRowData, loading } = props;
  const formRef = useRef<ProFormInstance>();
  const [submitting, submittingSet] = useState<any>(false);
  const [picList, picListSet] = useState<any>(undefined);
  const [fileList, fileListSet] = useState<any>(undefined);
  const _ref1: any = useRef();
  const _ref2: any = useRef();
  const [visible, setVisible] = useState(false);
  const handleUploadP = (info: any) => {
    picListSet(info);
  };

  const handleUploadF = (info: any) => {
    fileListSet(info);
  };
  const handleUploadP1 = (info: any) => {
    _ref1?.current?.resetValue(info);
  };
  const handleUploadF1 = (info: any) => {
    _ref2?.current?.resetValue(info);
    formRef?.current?.setFieldsValue({
      file: info,
    });
  };

  return (
    <ModalForm
      title="审批备注"
      formRef={formRef}
      visible={visible}
      className="ask-remark"
      trigger={
        ['批量确认制单', '确认制单'].includes(btnText) &&
        selectedRowData?.length &&
        selectedRowData?.some((v: any) => !v.print_times) ? (
          <Button
            type="primary"
            ghost
            disabled={!selectedRowData?.length}
            size="small"
            loading={loading}
            onClick={() => {
              const orders = selectedRowData?.filter((v: any) => !v.print_times);
              const content = orders.map((v: any, i: number) => (
                <>
                  <div key={v.process_instance_id}>
                    {i == orders.length - 1
                      ? `${v.process_instance_id}`
                      : `${v.process_instance_id}、`}
                  </div>
                  <div style={{ display: i == orders.length - 1 ? 'block' : 'none' }}>
                    单据没有打印记录，是否确认已制单?
                  </div>
                </>
              ));
              pubModal(content, '提示', {
                okText: '是',
                cancelText: '否',
                width: 400,
              })
                .then(async () => {
                  setVisible(true);
                })
                .catch(() => {});
            }}
          >
            {btnText}
          </Button>
        ) : (
          <Button
            type="primary"
            danger={btnText == '拒绝' ? true : undefined}
            ghost={btnText == '审批通过' ? undefined : true}
            disabled={!selectedRowData?.length}
            size="small"
            onClick={() => {
              setVisible(true);
            }}
            loading={loading}
          >
            {btnText}
          </Button>
        )
      }
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        confirmLoading: submitting,
        onCancel: () => {
          if (selectedRowData) {
            setVisible(false);
          }
        },
      }}
      width={550}
      onFinish={async (values: any) => {
        let pic = '';
        picList?.forEach((v: any) => {
          pic += `${v.name}:\n ${v.access_url}\n`;
        });
        let file = '';
        fileList?.forEach((v: any) => {
          file += `${v.name}:\n ${v.access_url}\n`;
        });
        let remarkC: any = values?.remark ?? '';
        if (pic && file) {
          remarkC = remarkC ? remarkC + '\n' + '\n' + pic + '\n' + file : pic + '\n' + file;
        } else if (pic) {
          remarkC = remarkC ? remarkC + '\n' + '\n' + pic : pic;
        } else if (file) {
          remarkC = remarkC ? remarkC + '\n' + '\n' + file : file;
        }
        const postData = selectedRowData?.map((v: any) => ({
          process_instance_id: v.process_instance_id,
          remark: remarkC,
        }));
        submittingSet(true);
        const res: any = await api(postData);
        console.log(res);
        submittingSet(false);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('操作成功!', 'success');
          props?.reload();
          setVisible(false);
        }
      }}
    >
      <ProFormText name="id" label="id" hidden />
      <ProFormTextArea
        label=""
        name="remark"
        // noStyle
        labelCol={{ flex: 0 }}
        fieldProps={{ rows: 8 }}
        rules={[{ required: type == 'reject', message: '请输入备注' }]}
      />
      <Space>
        <Form.Item label="图片" name="pic" noStyle>
          <UploadFileList
            fileBack={handleUploadP}
            listType="picture"
            businessType={'PROJECT_GOODS_SKU'}
            checkMain={false}
            size="small"
            accept={['.png,.jpg,.jpeg']}
            acceptType={['jpg', 'jpeg', 'png']}
            defaultFileList={undefined}
            btnText="上传图片"
            hideFileList
            _ref={_ref1}
          />
        </Form.Item>
        <Form.Item label="附件" name="file" noStyle>
          <UploadFileList
            fileBack={handleUploadF}
            businessType="VENDOR_QUESTIONNAIRE"
            listType={undefined}
            checkMain={false}
            defaultFileList={undefined}
            accept={['.docx,.doc,.pdf,.xls,.xlsx']}
            acceptType={['docx', 'doc', 'pdf', 'xls', 'xlsx']}
            hideFileList
            _ref={_ref2}
          />
        </Form.Item>
      </Space>

      <div className="show-list">
        <UploadFileList
          fileBack={handleUploadP1}
          listType="picture-card"
          businessType={'PROJECT_GOODS_SKU'}
          checkMain={false}
          size="small"
          accept={['.png,.jpg,.jpeg']}
          acceptType={['jpg', 'jpeg', 'png']}
          defaultFileList={picList}
        />
        <UploadFileList
          businessType="VENDOR_QUESTIONNAIRE"
          listType={undefined}
          checkMain={false}
          fileBack={handleUploadF1}
          defaultFileList={fileList}
          accept={['.docx,.doc,.pdf,.xls,.xlsx']}
          acceptType={['docx', 'doc', 'pdf', 'xls', 'xlsx']}
        />
      </div>
    </ModalForm>
  );
};
