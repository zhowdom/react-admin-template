import { ModalForm } from '@ant-design/pro-form';
import StockOrderDetail_table from '@/components/Reconciliation/StockOrderDetail_table';

export default (props: any) => {
  const { id, trigger } = props;
  return (
    <ModalForm
      title="采购单信息"
      trigger={<a> {trigger}</a>}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        onCancel: () => console.log('run'),
        destroyOnClose: true,
        maskClosable: false,
      }}
      submitter={{
        searchConfig: {
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      width={1200}
    >
      <StockOrderDetail_table id={id} business_scope="CN" is_all_or_logistics_loss={1} />
    </ModalForm>
  );
};
