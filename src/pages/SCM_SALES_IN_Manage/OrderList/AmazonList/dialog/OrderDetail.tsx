import { ModalForm, ProDescriptions } from '@ant-design/pro-components';
import styles from './style.less';
/** 亚马逊订单编号 **/
/*@Parsed(field = "amazon-order-id")
private String amazonOrderId;
/!** 店铺id **!/
private String shopId;
/!** 卖家订单编号 **!/
@Parsed(field = "merchant-order-id")
private String merchantOrderId;
/!** 购买日期 **!/
@Parsed(field = "purchase-date")
@Format(formats = "yyyy-MM-dd'T'HH:mm:ss")
private Date purchaseDate;
/!** 最后更新时间 **!/
@Parsed(field = "last-updated-date")
@Format(formats = "yyyy-MM-dd'T'HH:mm:ss")
private Date lastUpdatedDate;
/!** 订单状态 **!/
@Parsed(field = "order-status")
private String orderStatus;
/!** 默认配送渠道 **!/
@Parsed(field = "fulfillment-channel")
private String fulfillmentChannel;
/!** 销售渠道 **!/
@Parsed(field = "sales-channel")
private String salesChannel;
/!** CBA/WBA 订单下单的子渠道 **!/
@Parsed(field = "order-channel")
private String orderChannel;
/!** 配送服务级别 **!/
@Parsed(field = "ship-service-level")
private String shipServiceLevel;
/!** 商品名称 **!/
@Parsed(field = "product-name")
private String productName;
/!** 卖家为商品定义的唯一标识 **!/
@Parsed(field = "sku")
private String sku;
/!** 亚马逊库存编号 **!/
@Parsed(field = "asin")
private String asin;
/!** 商品状态 **!/
@Parsed(field = "item-status")
private String itemStatus;
/!** 数量 **!/
@Parsed(field = "quantity")
private BigDecimal quantity;
/!** 货币 **!/
@Parsed(field = "currency")
private String currency;
/!** 订单行总金额 **!/
@Parsed(field = "item-price")
private BigDecimal itemPrice;
/!** 商品税 **!/
@Parsed(field = "item-tax")
private BigDecimal itemTax;
/!** 配送价格 **!/
@Parsed(field = "shipping-price")
private BigDecimal shippingPrice;
/!** 运费税 **!/
@Parsed(field = "shipping-tax")
private BigDecimal shippingTax;
/!** 礼品包装价格 **!/
@Parsed(field = "gift-wrap-price")
private BigDecimal giftWrapPrice;
/!** 礼品包装税 **!/
@Parsed(field = "gift-wrap-tax")
private BigDecimal giftWrapTax;
/!** 应用于订单商品的所有促销折扣的总和 **!/
@Parsed(field = "item-promotion-discount")
private BigDecimal itemPromotionDiscount;
/!** 应用于配送的促销折扣 **!/
@Parsed(field = "ship-promotion-discount")
private BigDecimal shipPromotionDiscount;
/!** 配送城市 **!/
@Parsed(field = "ship-city")
private String shipCity;
/!** 标准地址中的州/省/直辖市/自治区或地区 **!/
@Parsed(field = "ship-state")
private String shipState;
/!** 标准地址中的邮政编码 **!/
@Parsed(field = "ship-postal-code")
private String shipPostalCode;
/!** ISO 3166 标准的双字母国家/地区代码 **!/
@Parsed(field = "ship-country")
private String shipCountry;
/!** 应用于此订单商品的所有商品促销的列表 **!/
@Parsed(field = "promotion-ids")
private String promotionIds;
/!** 是否为企业订单：表示订单是否为亚马逊企业购买家所下 **!/
@Parsed(field = "is-business-order")
private String isBusinessOrder;
/!** 订货单编号 **!/
@Parsed(field = "purchase-order-number")
private String purchaseOrderNumber;
/!** 价格标示：表示买家所使用的企业商品价格类型 **!/
@Parsed(field = "price-designation")
private String priceDesignation;
/!** 购买开始日期 **!/
@TableField(exist = false)
private Date purchasestartDate;
/!** 购买结束日期 **!/
@TableField(exist = false)
private Date purchaseEndDate;*/

const OrderDetail: React.FC<{
  dataSource: any;
  title?: any;
  trigger?: any;
}> = ({ trigger, title, dataSource }) => {
  return (
    <ModalForm
      title={title || `订单详情(${dataSource?.merchantOrderId})`}
      trigger={trigger || <a>{dataSource?.merchantOrderId}</a>}
      modalProps={{ destroyOnClose: true }}
      width={1200}
      submitter={false}
    >
      <ProDescriptions
        className={styles.bgGrayItem}
        column={2}
        request={() =>
          Promise.resolve({
            success: true,
            data: dataSource,
          })
        }
      >
        <ProDescriptions.Item label="亚马逊订单号(amazon-order-id)" dataIndex={'amazonOrderId'} />
        <ProDescriptions.Item label="卖家订单号(merchant-order-id)" dataIndex={'merchantOrderId'} />
        <ProDescriptions.Item label="下单时间(当地)(purchase-date)" dataIndex={'purchaseDate'} />
        <ProDescriptions.Item
          label="最近更新日期(last-updated-date)"
          dataIndex={'lastUpdatedDate'}
        />
        <ProDescriptions.Item label="下单时间(0时区)(utc-purchase-date)" dataIndex={'utcPurchaseDate'} />
        <ProDescriptions.Item label="结算日期（当地）(posted-date)" dataIndex={'postedDate'} />
        <ProDescriptions.Item
          label="汇率(exchange-rate)"
          dataIndex={'exchangeRate'}
          valueType={'digit'}
          fieldProps={{ precision: 6 }}
        />
        <ProDescriptions.Item label="订单状态(order-status)" dataIndex={'orderStatus'} />
        <ProDescriptions.Item label="商品状态(item-status)" dataIndex={'itemStatus'} />
        <ProDescriptions.Item
          label="默认配送渠道(fulfillment-channel)"
          dataIndex={'fulfillmentChannel'}
        />
        <ProDescriptions.Item label="下单子渠道(order-channel)" dataIndex={'orderChannel'} />
        <ProDescriptions.Item label="销售渠道(sales-channel)" dataIndex={'salesChannel'} />
        <ProDescriptions.Item
         span={2}
          label="配送服务级别(ship-service-level)"
          dataIndex={'shipServiceLevel'}
        />
        <ProDescriptions.Item span={2} label="商品标题(product-name)" dataIndex={'productName'} />
        <ProDescriptions.Item label="sku" dataIndex={'sku'} />
        <ProDescriptions.Item label="asin" dataIndex={'asin'} />
        <ProDescriptions.Item label="数量(quantity)" dataIndex={'quantity'} />
        <ProDescriptions.Item label="币种(currency)" dataIndex={'currency'} />
        <ProDescriptions.Item label="订单金额(item-price)" dataIndex={'itemPrice'} />
        <ProDescriptions.Item label="商品税(item-tax)" dataIndex={'itemTax'} />
        <ProDescriptions.Item label="配送价格(shipping-price)" dataIndex={'shippingPrice'} />
        <ProDescriptions.Item label="运费税(shipping-tax)" dataIndex={'shippingTax'} />
        <ProDescriptions.Item label="礼品包装价格(gift-wrap-price)" dataIndex={'giftWrapPrice'} />
        <ProDescriptions.Item label="礼品包装税(gift-wrap-tax)" dataIndex={'giftWrapTax'} />
        <ProDescriptions.Item
          label="促销折扣的总和(item-promotion-discount)"
          dataIndex={'itemPromotionDiscount'}
        />
        <ProDescriptions.Item
          label="配送促销折扣(ship-promotion-discount)"
          dataIndex={'shipPromotionDiscount'}
        />
        <ProDescriptions.Item label="配送地址(ship-address)" dataIndex={'shipAddress'} />
        <ProDescriptions.Item label="邮政编码(ship-postal-code)" dataIndex={'shipPostalCode'} />
        <ProDescriptions.Item label="促销列表(promotion-ids)" dataIndex={'promotionIds'} />
        <ProDescriptions.Item
          label="是否企业订单(is-business-order)"
          dataIndex={'isBusinessOrder'}
        />
        <ProDescriptions.Item
          label="订货单编号(purchase-order-number)"
          dataIndex={'purchaseOrderNumber'}
        />
        <ProDescriptions.Item label="价格标示(price-designation)" dataIndex={'priceDesignation'} />
      </ProDescriptions>
    </ModalForm>
  );
};

export default OrderDetail;
