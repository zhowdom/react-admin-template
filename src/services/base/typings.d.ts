// @ts-ignore
/* eslint-disable */

declare namespace API {
  type PermissionParams = {
    appId: string;
    id: string;
  };
  type PermissionData = {
    id: number;
    url?: string;
    pathname?: string;
    permission: Array<string>;
  };
  type Permission = {
    code: number;
    message: string | null;
    data: PermissionData[];
  };
  type CurrentUser = {
    name?: string;
    menus?: { data?: array };
    avatar?: string;
    appList?: array;
    [k: string]: any;
  };
}
