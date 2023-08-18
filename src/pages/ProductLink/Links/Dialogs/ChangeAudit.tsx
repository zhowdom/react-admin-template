import { Col, Form, Modal, Row, Space } from 'antd';
import { ModalForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import { useMemo, useRef, useState } from 'react';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import './index.less';
import { updateReviewResult } from '@/services/pages/link';
import { pubConfig, pubFilter, pubMsg, pubRequiredRule } from '@/utils/pubConfig';
import { sortBy } from 'lodash';

const ChangeAudit: React.FC<{
  title?: any;
  dicList: any;
  reload: any;
  record: any;
}> = (props: any) => {
  const { dicList, record } = props;
  const [salesStatusAll, salesStatusAllSet] = useState(null);
  const [reviewLifeCycleEnum, reviewLifeCycleEnumSet] = useState<any>(
    dicList?.LINK_MANAGEMENT_LIFE_CYCLE || {},
  );
  const optionsLinkLifeCycle = useMemo(() => {
    const temp = props?.dicList?.LINK_MANAGEMENT_LIFE_CYCLE || {};
    const options: any[] = [];
    Object.keys(temp).forEach((key) => {
      options.push({
        ...temp[key],
        disabled: Number(key) < Number(record.life_cycle || -1) || Number(key) == 400,
        label: temp[key].detail_name,
        value: key,
      });
    });
    return sortBy(options, 'detail_sort');
  }, [dicList]);
  const formRef: any = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const formItemLayout1 = {
    labelCol: { span: 3 },
    wrapperCol: { span: 20 },
  };
  // 上传结束后
  const handleUpload = async (data: any) => {
    formRef.current?.setFieldsValue({ sys_files: data });
  };
  return (
    <ModalForm
      title={'确认评审结果'}
      trigger={<a>确认评审结果</a>}
      labelAlign="right"
      labelCol={{ span: 3 }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onOpenChange={(visible: boolean) => {
        if (visible) {
          const review_life_cycle = record?.review_life_cycle
            ? String(record?.review_life_cycle)
            : null;
          Object.keys(reviewLifeCycleEnum).forEach((key) => {
            reviewLifeCycleEnum[key] = {
              ...reviewLifeCycleEnum[key],
              disabled: Number(key) < Number(review_life_cycle || -1) || Number(key) == 400,
            };
          });
          reviewLifeCycleEnumSet(reviewLifeCycleEnum);
        }
      }}
      formRef={formRef}
      width={800}
      onFinish={async (values) => {
        return Promise.all([editForm.validateFields()])
          .then(async () => {
            const res = await updateReviewResult({
              ...values,
              id: record?.id,
            });
            if (res?.code != pubConfig.sCode) {
              pubMsg(res?.message);
              return false;
            } else {
              pubMsg('提交成功!', 'success');
              if (props?.reload) props.reload();
              return true;
            }
          })
          .catch(() => {
            Modal.warning({
              title: '提示',
              content: '请检查表单信息正确性',
            });
          });
      }}
      onFinishFailed={() => {
        editForm.validateFields();
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
      initialValues={{
        life_cycle: record?.life_cycle,
        review_life_cycle: record?.review_life_cycle ? String(record?.review_life_cycle) : null,
        sys_files: record?.sys_files,
        skuList:
          record?.linkManagementSkuList.map((v: any) => {
            return {
              ...v,
              sales_status: v.sales_status ? String(v.sales_status) : null,
            };
          }) || [],
      }}
    >
      <Row>
        <Col span={12} className="item10">
          <Form.Item label="链接名：">{record?.link_name || '-'}</Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="当前生命周期："    labelCol={{ span: 7 }}>
            {pubFilter(props?.dicList.LINK_MANAGEMENT_LIFE_CYCLE, record?.life_cycle) || '-'}
          </Form.Item>
        </Col>
        <Col span={12}>
          <ProFormSelect
            labelCol={{ span: 7 }}
            name="review_life_cycle"
            label="评审后生命周期"
            showSearch
            options={optionsLinkLifeCycle}
            rules={[pubRequiredRule]}
          />
        </Col>
        <Col span={24} className="edit-table">
          <Form.Item label="SKU销售状态" {...formItemLayout1} labelAlign="right">
            <EditableProTable
              name={'skuList'}
              bordered
              rowKey="id"
              size="small"
              recordCreatorProps={false}
              className="center-th"
              editable={{
                type: 'multiple',
                editableKeys: record?.linkManagementSkuList?.map((v: any) => v.id),
                form: editForm,
                actionRender: (row, config, defaultDoms) => {
                  return [defaultDoms.delete];
                },
              }}
              columns={[
                {
                  title: 'SKU',
                  dataIndex: 'shop_sku_code',
                  align: 'center',
                  width: 150,
                  editable: false,
                },
                {
                  title: '款式名称',
                  dataIndex: 'sku_name',
                  align: 'left',
                  editable: false,
                },
                {
                  title: '销售状态',
                  dataIndex: 'sales_status',
                  valueType: 'select',
                  align: 'center',
                  width: 200,
                  valueEnum: {
                    ...dicList?.LINK_MANAGEMENT_SALES_STATUS,
                    4: {
                      ...dicList?.LINK_MANAGEMENT_SALES_STATUS[4],
                      disabled: true,
                    },
                  },
                  editable: false,
                },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
      <ProFormTextArea
        name="remarks"
        label="评审备注"
        placeholder="请输入评审备注"
        rules={[{ required: true, message: '请输入评审备注' }]}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 20 }}
      />
      <Form.Item label="附件" name="sys_files">
        <UploadFileList
          fileBack={handleUpload}
          businessType="VENDOR_COMMUNICATION_RECORD"
          listType="picture"
        />
      </Form.Item>
    </ModalForm>
  );
};
export default ChangeAudit;
