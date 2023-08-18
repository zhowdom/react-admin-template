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
  sample_user_name?: string | number;
  sample_time?: string | number;
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
  business_scope?: string;
  vendor_group_id?: string;
  category_data?: Record<string, any>;
};
