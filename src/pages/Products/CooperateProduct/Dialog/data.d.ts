export type TableListItem = {
  id: number;
  name_cn: string;
  sku: string;
  vendor_id: string;
  vendorName: string;
  intention_purchase: number;
  tax_included_purchase_situation: number;
  name_en?: string;
  uom?: string;
  tax_included_price?: number;
  tax_included_ratio?: number;
  detailed_remarks?: string;
  currency?: string;
};

export type TableListPagination = {
  total: number;
  pageSize: number;
  current: number;
};

export type TableListData = {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
};

export type goodSpecType = {
  id: React.Key;
  goods_id?: number | string;
  type?: number | string;
  high?: number;
  length?: number;
  width?: number;
  weight?: number;
};
