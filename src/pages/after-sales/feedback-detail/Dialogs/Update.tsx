import { Button, Modal, Alert } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormTextArea, ProForm } from '@ant-design/pro-components';
import { useRef, useMemo } from 'react';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { tagClassify } from '@/services/pages/after-sales';
import TagLabel from '@/components/PubForm/TagLabel';
import { uniqBy } from 'lodash';

const Component: React.FC<{
  reload: any;
  trigger?: JSX.Element;
  title?: string;
  selectedRow: any[];
  multiple?: boolean;
}> = ({ title, trigger, reload, selectedRow = [], multiple }) => {
  const formRef = useRef<ProFormInstance>();
  // 所选的产品线去重
  const categoryList: any[] = useMemo(() => uniqBy(selectedRow, 'categoryId'), [selectedRow]);
  return (
    <ModalForm
      title={title || multiple ? '批量客诉分类' : '客诉分类'}
      trigger={
        trigger || multiple ? (
          <Button
            disabled={selectedRow.length == 0}
            type="primary"
            title={'只能选择同一个产品线的数据'}
          >
            批量分类{selectedRow.length ? `(已选:${selectedRow.length}条)` : ''}
          </Button>
        ) : (
          <a>分类</a>
        )
      }
      labelAlign="right"
      labelCol={{ flex: '0 0 120px' }}
      layout="horizontal"
      width={688}
      grid
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      formRef={formRef}
      initialValues={{
        labelId: [selectedRow?.[0]?.parentLabelId, selectedRow?.[0]?.labelId],
        remark: selectedRow?.[0]?.remark,
      }}
      onFinish={async (values: any) => {
        const postData = {
          ...values,
          ids: selectedRow.map((item: any) => item.id),
          parentLabelId: values.labelId[0],
          labelId: values.labelId[1],
        };
        const res = await tagClassify(postData);
        if (res?.code != pubConfig.sCodeOrder) {
          pubMsg(res?.message);
          return false;
        }
        pubMsg(res?.message || '操作成功', 'success');
        if (reload) reload();
        return true;
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '温馨提示',
          content: '表单未正确或完整填写, 请检查',
          okText: '哦 ~',
        });
      }}
    >
      <ProForm.Item label="产品线" required className={'ant-col ant-col-24'}>
        {categoryList.map((item) => item.categoryName)}
      </ProForm.Item>
      {categoryList.length > 1 ? (
        <Alert
          message={'只能给同一个产品线进行批量分类~'}
          showIcon
          className={'ant-col ant-col-24'}
        />
      ) : (
        <>
          <ProForm.Item
            style={{ flex: '0 0 460px' }}
            name="labelId"
            label="分类标签"
            rules={[
              () => ({
                validator(_, value) {
                  if (!value || value?.some((v: any) => !v)) {
                    return Promise.reject(new Error('必填项'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TagLabel
              init={true}
              categoryId={categoryList[0]?.categoryId}
              categoryName={categoryList[0]?.categoryName}
            />
          </ProForm.Item>
          <ProFormTextArea
            colProps={{ span: 24 }}
            label={'分类说明'}
            name={'remark'}
            fieldProps={{ maxLength: 200 }}
          />
        </>
      )}
    </ModalForm>
  );
};
export default Component;
