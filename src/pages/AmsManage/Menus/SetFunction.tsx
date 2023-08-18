import { ModalForm } from '@ant-design/pro-form';
import { useState } from 'react';
import ProTable from '@ant-design/pro-table';
import { pubMsg, pubConfig} from '@/utils/pubConfig';
import { CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { getRoleMenuByMenuIdAndRoleId, getMenuMethodsByMethodIdAndMenuId, bindMenuAndMethods, getMethodsList } from '@/services/pages/AmsManage/menus';
import './style.less';
// 重置密码弹框
const EditDrawer: React.FC<{
  data?: any;
  reload: any;
  trigger: any;
}> = ({ data, trigger }) => {
  const [myMenu, setMyMenu] = useState('')
  const [hasdFunc, setHasdFunc] = useState([])
  // 递归找名字
  const getName = (mydata: any, newArr?: any) => {
    const newText = newArr || [];
    newText.push(mydata[0].name);
    if (mydata[0].children) {
      getName(mydata[0].children, newText);
    }
    return newText;
  };
  // 通过菜单id 获取角色
  const getDetail = async (id: string) => {
    const res = await getRoleMenuByMenuIdAndRoleId({ menuId: id });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    } else {
      const name = getName(res.data?.menus || []).map((v: any) => `[${v}]`);
      setMyMenu(`绑定后台接口方法 - ${name.join(' - ')}`);
    }
  };

  // 用按钮ID，获取已有的方法
  const getFuntion = async (buttonId: any) => {
    const res = await getMenuMethodsByMethodIdAndMenuId({ menuId: buttonId });
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    } else {
      setHasdFunc(res?.data?.methods || []);
    }
  };
  // 查询所有方法
  const getListAction = async (params: any) => {
    const postData = {
      ...params,
      pageIndex: params?.current,
      pageSize: params?.pageSize,
    };
    const res = await getMethodsList(postData);
    if (res?.code != pubConfig.sCodeOrder) {
      pubMsg(res?.message);
    }
    return {
      data: res?.data?.list || [],
      success: true,
      total: res?.data?.total || 0,
    };
  };
  // 选择接口
  const chosedFunc = (cdata: any) => {
    const aa: any = JSON.parse(JSON.stringify(hasdFunc));
    aa.push(cdata)
    console.log(aa)
    setHasdFunc(aa)
  };
  // 删除接口
  const deleteFunction = (index: any) => {
    const aa: any = JSON.parse(JSON.stringify(hasdFunc));
    aa.splice(index, 1);
    setHasdFunc(aa)
  };

  // 表格配置
  const columns: any[] = [
    {
      title: '应用名称',
      dataIndex: 'appName',
    },
    {
      title: '应用名称',
      dataIndex: 'appId',
    },
    {
      title: 'controller名称',
      dataIndex: 'controllerName',
    },
    {
      title: '方法名',
      dataIndex: 'methodName',
    },
    {
      title: '方法包路径',
      dataIndex: 'controllerPath',
    },
    {
      title: '方法调用路径',
      dataIndex: 'methodUrl',
    },
    {
      title: '操作',
      key: 'option',
      width: 60,
      align: 'center',
      valueType: 'option',
      render: (_: any, record: any) => {
        const aa = hasdFunc.find((k: any) => k.id == record.id)
        if (aa) {
          return (<a className="green"><CheckCircleOutlined /></a>)
        } else {
          return (<a onClick={() => chosedFunc(record)}>选择</a>)
        }
      }
    },
  ];
  return (
    <ModalForm
      title={myMenu}
      trigger={trigger}
      width={900}
      labelCol={{ flex: '0 0 105px' }}
      wrapperCol={{ span: 16 }}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        okText: '保存按钮和后台接口的关联'
      }}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          if (data) {
            setTimeout(() => {
              getDetail(data?.id)
              getFuntion(data?.id)
            }, 200);
          }
        }
      }}
      onFinish={async () => {
        const res = await bindMenuAndMethods({
          methodIds: hasdFunc.map((v: any) => v.id).join(','),
          menuId: data.id,
        });
        if (res?.code != pubConfig.sCodeOrder) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('操作成功', 'success');
          return true;
        }
      }}
      validateTrigger="onBlur"
    >
      <div className='set-function'>
        {
          hasdFunc.map((v: any, tindex: number) => {
            return (
              <p key={v.id}>
              <span>{`${ v?.methodName }---${ v?.methodUrl }`}</span>
              <em onClick={()=> deleteFunction(tindex)}><CloseOutlined /></em>
              </p>
            )
          })
        }
      </div>
      <ProTable
        columns={columns}
        options={false}
        bordered
        pagination={{
          showSizeChanger: true,
          className: 'modal-pagi',
        }}
        search={{className: 'light-search-form', defaultCollapsed: false}}
        rowKey="id"
        size='small'
        dateFormatter="string"
        className="p-table-0"
        request={getListAction}
      />

    </ModalForm>
  );
};
export default EditDrawer;
