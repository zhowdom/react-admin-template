export type PlatFormTableListItem = {
  id: string;
  create_user_name: string;
  type: number;
};
export type PlatformShopTableListItem = {
  id: string;
  create_user_name: string;
  status: number;
  platform_id: number;
  name: string;
};

export type TableHistoryListItem = {
  id: string;
  create_time: string;
  business_status: number;
};

export type PlatformDingdingItem = {
  id: string;
  create_time: string;
  business_status: number;
  approval_status?: string;
  business_type?: string;
};
