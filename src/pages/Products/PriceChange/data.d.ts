export type TableListItem = {
  id: string;
  vendor_id?: string;
  vendor_name?: string;
  main_file_id?: string;
  main_file_batch_no?: string;
  goods_name?: string;
  create_user_id?: string;
  create_user_name?: string;
  create_time?: string;
  category_name?: number;
  category_id?: string;
  approval_status?: number;
  approval_history_id?: string;
};

export type TableListPagination = {
  total: number;
  pageSize: number;
  current: number;
};
