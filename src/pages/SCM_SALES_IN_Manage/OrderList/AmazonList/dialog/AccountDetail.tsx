import { ModalForm, ProDescriptions } from '@ant-design/pro-components';
import { getDetail } from '@/services/pages/SCM_SALES_IN_Manage/orderList/amazonListAccount';
import { pubMsg, pubConfig } from '@/utils/pubConfig';
import styles from './style.less';

const AccountDetail: React.FC<{
  dataSource: any;
  title?: any;
  trigger?: any;
}> = ({ trigger, title, dataSource }) => {
  return (
    <ModalForm
      title={title || '结算明细'}
      trigger={trigger || <a>结算明细</a>}
      modalProps={{ destroyOnClose: true }}
      width={1000}
      submitter={false}
    >
      <ProDescriptions
        className={styles.bgGrayItem}
        column={2}
        request={async () => {
          const res = await getDetail({ id: dataSource.id });
          if (res?.code != pubConfig.sCodeOrder) {
            pubMsg(res?.message);
            return {
              success: false,
              data: {},
            };
          }
          return {
            success: true,
            data: res?.data,
          };
        }}
      >
        <ProDescriptions.Item label="亚马逊订单号(amazon-order-id)" dataIndex={'amazonOrderId'} />
        <ProDescriptions.Item label="卖家订单号(merchant-order-id)" dataIndex={'merchantOrderId'} />
        <ProDescriptions.Item label="购买日期(purchase-date)" dataIndex={'purchaseDate'} />
        <ProDescriptions.Item label="结算时间(posted-date)" dataIndex={'postedDate'} />
        <ProDescriptions.Item label="sku" dataIndex={'sku'} />
        <ProDescriptions.Item label="数量(quantity)" dataIndex={'quantity'} />
        <ProDescriptions.Item label="销售金额(product sales)" dataIndex={'productSales'} />
        <ProDescriptions.Item label="销售税(product sales tax)" dataIndex={'productSalesTax'} />
        <ProDescriptions.Item
          label="礼品包装价格(gift wrap credits)"
          dataIndex={'giftWrapCredits'}
        />
        <ProDescriptions.Item
          label="礼品包装税(gift wrap credits tax)"
          dataIndex={'giftWrapCreditsTax'}
        />
        <ProDescriptions.Item label="运费(shipping credits)" dataIndex={'shippingCredits'} />
        <ProDescriptions.Item label="运费税(shipping credits)" dataIndex={'shippingCreditsTax'} />
        <ProDescriptions.Item label="FBA费(fba fees)" dataIndex={'fbaFees'} />
        <ProDescriptions.Item label="服务费(selling fees)" dataIndex={'sellingFees'} />
        <ProDescriptions.Item label="其他费用(other)" dataIndex={'other'} />
        <ProDescriptions.Item
          label="市场预收税(marketplace withheld tax)"
          dataIndex={'marketplaceWithheldTax'}
        />
        <ProDescriptions.Item
          label="促销折扣(promotional rebates)"
          dataIndex={'promotionalRebates'}
        />
        <ProDescriptions.Item label="合计(Total)" dataIndex={'total'} />
        <ProDescriptions.Item
          label="配送折扣优惠(ship-promotion-discount)"
          dataIndex={'shipPromotionDiscount'}
          tooltip={'当前配送单中'}
        />
        <ProDescriptions.Item
          label="汇率(exchange rate)"
          dataIndex={'exchangeRate'}
          valueType={'digit'}
          fieldProps={{ precision: 6 }}
        />
        <ProDescriptions.Item label="币种(currency)" dataIndex={'currency'} />
      </ProDescriptions>
    </ModalForm>
  );
};

export default AccountDetail;
