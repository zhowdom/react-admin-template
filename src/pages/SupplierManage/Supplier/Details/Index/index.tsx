import { Card, Tabs } from 'antd';
import { connect, history, useAccess } from 'umi';
import Basic from '../Basic';
import Account from '../Account';
import Contract from '../Contract';
import OperationLog from '@/components/OperationLog';
import Goods from '../Goods';
import Approval from '../Approval';
import Transfer from '../Transfer';
import Communicate from '../Communicate';
import { PageContainer } from '@ant-design/pro-layout';
import { useRef, useState } from 'react';
import Order from '../../components/Order';

const TabHome = (props: any) => {
  const access = useAccess();
  const pathname = history.location.pathname;
  const showOther =
    pathname.indexOf('/edit-basic') != -1 || pathname.indexOf('/detail-basic') != -1;
  const id = history?.location?.query?.id || null;
  const [tab, setTab] = useState<any>(
    history?.location?.query?.tab || window.sessionStorage.getItem('SDTB') || 'supplier',
  );
  const callback = (key: string) => {
    setTab(key);
    window.sessionStorage.setItem('SDTB', key);
  };
  const [name, setName] = useState('');
  // 重新设置负责人
  const refBasic: any = useRef();
  const onUpdate = (value: any) => {
    refBasic?.current?.updateLiabilityName(value);
  };

  // 设置转让弹窗内的责任人
  const setLab = (value: string) => {
    setName(value);
  };
  return (
    <PageContainer
      header={{
        title: false,
        breadcrumb: {},
      }}
    >
      <Card className="supplier-detail">
        {showOther && access.canSee('supplier_transfer') && (
          <div style={{ textAlign: 'right', marginBottom: '-32px' }}>
            <Transfer id={id} onUpdate={onUpdate} name={name} setLab={setLab} />
          </div>
        )}
        <Tabs onChange={callback} type="card" activeKey={tab}>
          <Tabs.TabPane tab="供应商信息" key="supplier">
            <Basic showOther={showOther} refBasic={refBasic} setLab={setLab} />
          </Tabs.TabPane>

          {showOther && (
            <>
              {access.canSee('supplier_bank_account') && (
                <Tabs.TabPane tab="账户信息" key="account">
                  <Account dicList={props.common.dicList} />
                </Tabs.TabPane>
              )}
              {access.canSee('supplier_contract') && (
                <Tabs.TabPane tab="合作信息" key="contact">
                  <Contract id={id} />
                </Tabs.TabPane>
              )}
              {access.canSee('supplier_log') && (
                <Tabs.TabPane tab="变更日志" key="log">
                  <OperationLog id={id} dicList={props.common.dicList} />
                </Tabs.TabPane>
              )}
              {access.canSee('supplier_product') && (
                <Tabs.TabPane tab="合作商品" key="goods">
                  <Goods id={id} dicList={props.common.dicList} />
                </Tabs.TabPane>
              )}

              {access.canSee('supplier_communicate') && (
                <Tabs.TabPane tab="沟通记录" key="communicate">
                  <Communicate id={id} />
                </Tabs.TabPane>
              )}

              {access.canSee('supplier_approval_history') && (
                <Tabs.TabPane tab="审批信息" key="approval">
                  <p style={{ paddingBottom: '12px' }}>审批历史</p>
                  <Approval id={id} dicList={props.common.dicList} />
                </Tabs.TabPane>
              )}
              {access.canSee('supplier_order') && (
                <Tabs.TabPane tab="采购单" key="pOrder">
                  <Order id={id} dicList={props.common.dicList} />
                </Tabs.TabPane>
              )}
            </>
          )}
        </Tabs>
      </Card>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(
  ({ basic, common }: { basic: Record<string, unknown>; common: Record<string, unknown> }) => ({
    basic,
    common,
  }),
)(TabHome);
export default ConnectPage;
