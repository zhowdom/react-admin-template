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

export type TableListParams = {
  current_page?: number;
  page_size?: number;
  current?: number;
  pageSize?: number;
  filter?: Record<string, any[]>;
  sorter?: Record<string, any>;
  name_cn?: string;
  intention_purchase?: number;
  tax_included_purchase_situation?: number;
  begin_create_time?: string;
  end_create_time?: string;
};
