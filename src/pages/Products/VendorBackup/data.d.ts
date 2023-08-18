export type TableListItem = {
  id: string;
  bar_code: string;
  category_name: string;
  create_time: string;
  create_user_name: string;
  currency: number;
  goods_sku_id: number;
  image_id?: string;
  image_url?: string;
  name_cn?: number;
  price?: number;
  sku_code?: string;
  sku_name?: string;
  tax_included?: string;
  uom?: string;
  vendor_name?: string;
};

export type TableListPagination = {
  total: number;
  pageSize: number;
  current: number;
};
