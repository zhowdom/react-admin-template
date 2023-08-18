export type TableListItem = {
  id: string;
  name: string;
  time: string;
  type: string;
  porc: string;
  children?: any;
};
export type FormType = {
  id?: string;
  name: string;
  parent_id: string;
  business_scope: string;
  parent?: [] | null | undefined;
};
export type LineType = {
  business_scope?: string;
  create_time: string;
  id: number;
  value: number;
  label: string;
  name: string;
  parentId?: number;
  children?: [];
};
