export type TableDepotListItem = {
  id: string;
  create_user_name: string;
  type: number;
  status: number;
};
export type TableListItem = {
  id: string;
  create_user_name: string;
  type: number;
  status: number;
  audit_status: number;
  path?: string;
  template_type?: any;
  begin_time?: any;
  end_time?: any;
  remark?: any;
  name?: any;
  renew_sys_files_url?: any;
  finish_sys_files?: any;
  name_id?: any;
};

export type TableHistoryListItem = {
  id: string;
  create_time: string;
  approval_status: number;
  remark?: string;
};
