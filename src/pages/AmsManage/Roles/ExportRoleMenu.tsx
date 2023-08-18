import { ModalForm, ProFormText } from '@ant-design/pro-form';
import { useState } from 'react';
import { pubMsg } from '@/utils/pubConfig';
import {
  getRoleList,
  exportRoleAndMenu,
} from '@/services/pages/AmsManage/roles';
import { CloseOutlined } from '@ant-design/icons';
import './ExportRoleMenu.less'
import { Input, Button } from 'antd';
// 重置密码弹框
const EditDrawer: React.FC<{
  trigger: any;
}> = ({ trigger }) => {
  const [chosedRoles, setChosedRoles] = useState<any>([]);
  const [allRoles, setAllRoles] = useState<any>([]);
  const params = {
    code: "",
    name: "",
    pageIndex: 1,
    pageSize: 999,
  }
  // 获取详情
  const getAllRoles = async () => {
    const res = await getRoleList(params);
    if (res.code == '0') {
      setAllRoles(res.data?.list);
    }
  };
  // 搜索
  const setSearch = (value: string, type: string) => {
    console.log(params);
    params[type] = value;
  };

  // 选择角色
  const chosedRol = (data: any) => {
    const newD = JSON.parse(JSON.stringify(chosedRoles));
    newD.push(data);
    setChosedRoles(newD);
  };
  // 删除角色
  const deleteRoles = (data: any) => {
    const newD = chosedRoles.filter((v: any) => v.id != data.id);
    setChosedRoles(newD);
  };
  return (
    <ModalForm
      title={`菜单角色导出`}
      trigger={trigger}
      width={800}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          getAllRoles();
          setChosedRoles([])
        }
      }}
      onFinish={async (values: any) => {
        const res: any = await exportRoleAndMenu({
          appId: values.appId,
          roleCodes: chosedRoles.map((k: any) => k.code).join(',')
        });
        const type = res.response.headers.get('content-type');
        if (type.indexOf('application/json') > -1) {
          pubMsg(res?.message);
        } else {
          const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
          const objectURL = URL.createObjectURL(blob);
          const btn = document.createElement('a');
          const fileData = res.response.headers.get('content-disposition');
          let fileName = `菜单角色导出.xls`;
          if (fileData) {
            fileName = decodeURIComponent(decodeURIComponent(fileData.split(';')[1].split('=')[1]));
          }
          btn.download = fileName;
          btn.href = objectURL;
          btn.click();
          URL.revokeObjectURL(objectURL);
        }
      }}
    >
      <ProFormText label={'appId'} name="appId" initialValue={'1626436189152845826'} hidden />
      <div className="exportRoleMenu">
        <div className="exportRoleMenu-title">已选的角色</div>
        <div className="chosedRoles">
          {
            chosedRoles.map((item: any) => (
              <p key={item.code}>
                <span>{item.name}({item.code})</span>
                <em onClick={() => deleteRoles(item)}><CloseOutlined /></em>
              </p>
            ))
          }
        </div>
        <div className="chosedRoles-body">
          <div className="chosedRoles-search">
            <p>
              <Input placeholder="角色名称"
                onChange={(e: any) => {
                  setSearch(e.target.value, 'name');
                }} />
            </p>
            <p>
              <Input placeholder="角色编码"
                onChange={(e: any) => {
                  setSearch(e.target.value, 'code');
                }} />
            </p>
            <p>
              <Button type="primary" onClick={() => getAllRoles()}> 查询 </Button>
            </p>
          </div>
          <div className="allRoles">
            {
              allRoles.map((item: any) => (
                <span key={item.id} className={chosedRoles.find((k: any) => k.code == item.code) ? 'active' : ''} onClick={() => chosedRol(item)}>{item.name} ({item.code})</span>
              ))
            }
          </div>
        </div>
      </div>
    </ModalForm>
  );
};
export default EditDrawer;
