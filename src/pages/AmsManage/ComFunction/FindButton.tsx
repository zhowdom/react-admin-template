import { ModalForm } from '@ant-design/pro-form';
import { pubMsg } from '@/utils/pubConfig';
import { getMenuMethodsByMethodIdAndMenuId } from '@/services/pages/AmsManage/comFunction';
import { useState } from 'react';
import { Spin } from 'antd';
const Comp: React.FC<{
  id: any;
  trigger: any;
}> = ({ id, trigger }) => {
  const [tabsList, tabsListSet] = useState([]);
  const [loading, loadingSet] = useState<boolean>(false);
  // 获取详情
  const getDetail = async (idT: string) => {
    loadingSet(true);
    const res = await getMenuMethodsByMethodIdAndMenuId({ methodId: idT });
    if (res.code == '0') {
      tabsListSet(res?.data?.menus || []);
    } else {
      pubMsg(res?.message);
    }
    loadingSet(false);
  };
  return (
    <ModalForm
      title={'查询按钮'}
      trigger={trigger}
      width={1100}
      labelAlign="right"
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      submitter={false}
      onOpenChange={async (visible: boolean) => {
        if (visible) {
          if (id) {
            getDetail(id);
          }
        } else {
          tabsListSet([]);
        }
      }}
    >
      <Spin spinning={loading}>
        <div className="find-chosed">
          {tabsList?.map((v: any, i: number) => (
            <p key={i}>
              <span>{`${v.appName}->${v.parentNames}(${v.path})`}</span>
            </p>
          ))}
        </div>
      </Spin>
    </ModalForm>
  );
};
export default Comp;
