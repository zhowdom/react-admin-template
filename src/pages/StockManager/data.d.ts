export type TableListItem = {
  id: number;
  name: string;
  vendor_name: string;
  status?: string | number;
  create_time: string;
  skus: any[];
  image_id?: string;
  approval_status?: string | number;
  vendor_group_id?: string | number;
  create_user_name?: string | number;
  plat_store?: any;
  order_no: string;
  cycle_time?: any[];
};

export type TableListPagination = {
  total: number;
  pageSize: number;
  current: number;
  plat_store?: any;
  cycle_time?: any[];
};

export type TableListData = {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
  plat_store?: any;
  cycle_time?: any[];
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
  plat_store?: any;
  cycle_time?: any[];
};
