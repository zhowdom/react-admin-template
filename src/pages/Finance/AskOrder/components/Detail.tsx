import { useState } from 'react';
import { Spin, Space, Button, Timeline, Image, Tag } from 'antd';
import { DrawerForm } from '@ant-design/pro-form';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { useAccess } from 'umi';
import { updateInboundLogistics } from '@/services/pages/stockManager';
import './index.less';
import useFormItem from './useFormItem';
import RemarkModal from './RemarkModal';
import {
  CheckCircleOutlined,
  ReconciliationOutlined,
  SoundOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import {
  agree,
  confirmDocument,
  confirmPayment,
  getProcessInstances,
  refuse,
} from '@/services/pages/askOrder';

const Dialog = (props: any) => {
  const { reload, record, _ref, btnText } = props;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [refreshKey, refreshKeySet] = useState<any>(0);
  const [isDetail, isDetailSet] = useState(false); // 审批人是否为当前登录人
  const access = useAccess();
  const [visible, visibleSet] = useState(false);
  // const status = {
  //   NEW: '新创建',
  //   RUNNING: '审批中',
  //   TERMINATED: '被终止',
  //   COMPLETED: '完成',
  //   CANCELED: '取消',
  // };
  if (_ref) {
    _ref.current = {
      visibleChange(v: boolean) {
        visibleSet(v);
      },
    };
  }

  const S = {
    AGREE: '已同意',
    REFUSE: '已拒绝',
    NONE: '审批中',
  };
    // 渲染表单项值
    const renderFormItem = useFormItem(record?.process_instance_id,record?.requester_id);
  // 详情
  const getOrderDetail = async (id: string): Promise<any> => {
    setLoading(true);
    const res = await getProcessInstances({ process_instance_ids: id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      const detailC = res?.data?.[0];
      const last = detailC.bodyResult?.tasks.filter((v: any) => v.status == 'RUNNING')?.[0];
      detailC.bodyResult.operationRecords = last
        ? [...detailC?.bodyResult?.operationRecords, last]
        : [...detailC?.bodyResult?.operationRecords];
      detailC.bodyResult.operationRecords.forEach((v: any) => {
        v.date = v?.date?.replaceAll('T', ' ')?.replaceAll('Z', '');
        const pattern = /(https?:\/\/[^\s]+)/g;
        const replacement = '<a href="$1" target="_blank">$1</a>';
        if (v.remark) {
          v.remark = v?.remark?.replace(pattern, replacement);
          v.remark = v?.remark?.replaceAll('\n', '<br/>');
        }
      });
      isDetailSet(
        JSON.parse(localStorage.getItem('userInfo') as string)?.user?.dingdingId != last?.userId,
      );
      console.log(detailC, 'detailC');
      setDetail(detailC);
    }
    setLoading(false);
  };

  return (
    <DrawerForm
      title={'详情'}
      trigger={
        props?.from == 'deposit' ? (
          <a
            onClick={() => {
              visibleSet(true);
            }}
          >
            {record?.process_instance_id}
          </a>
        ) : (
          <a
            onClick={() => {
              visibleSet(true);
            }}
          >
            {btnText || '详情'}
          </a>
        )
      }
      width="620px"
      drawerProps={{
        destroyOnClose: true,
        className: 'askOrder',
        onClose: () => {
          visibleSet(false);
        },
      }}
      visible={visible}
      params={{ refreshKey }}
      request={async () => {
        getOrderDetail(props.id);
        return Promise.resolve({ success: true });
      }}
      labelCol={{ flex: '130px' }}
      labelWrap={true}
      initialValues={detail}
      onFinish={async (values: any) => {
        values.id = detail.id;
        const res = await updateInboundLogistics(values);
        if (res.code == pubConfig.sCode) {
          pubMsg(res?.message, 'success');
          if (typeof reload === 'function') reload();
          refreshKeySet(new Date().getTime());
          return true;
        } else {
          pubMsg(`提交失败: ${res.message}`);
          return false;
        }
      }}
      submitter={{
        searchConfig: {
          resetText: '关闭',
          submitText: '确定',
        },
        render: (data: any, doms: any) =>
          props?.from == 'deposit' ? (
            doms[0]
          ) : isDetail || detail?.bodyResult?.status == 'COMPLETED' ? (
            access.canSee('scm_askOrder_print') && (
              <Button
                type="primary"
                ghost
                loading={loading}
                icon={<ReconciliationOutlined />}
                onClick={props.batchPrint}
              >
                打印
              </Button>
            )
          ) : (
            <Space>
              {access.canSee('scm_askOrder_approval') && (
                <RemarkModal
                  reload={() => {
                    visibleSet(false);
                    props.reload();
                  }}
                  api={agree}
                  selectedRowData={[record]}
                  btnText="审批通过"
                  loading={loading}
                />
              )}
              {access.canSee('scm_askOrder_reject') && (
                <RemarkModal
                  type="reject"
                  api={refuse}
                  reload={() => {
                    visibleSet(false);
                    props.reload();
                  }}
                  selectedRowData={[record]}
                  btnText="拒绝"
                  loading={loading}
                />
              )}
              {access.canSee('scm_askOrder_print') && (
                <Button
                  type="primary"
                  ghost
                  loading={loading}
                  icon={<ReconciliationOutlined />}
                  onClick={props.batchPrint}
                >
                  打印
                </Button>
              )}
              {access.canSee('scm_askOrder_confirmOrder') && (
                <RemarkModal
                  api={confirmDocument}
                  reload={() => {
                    visibleSet(false);
                    props.reload();
                  }}
                  selectedRowData={[record]}
                  btnText="确认制单"
                  loading={loading}
                />
              )}
              {access.canSee('scm_askOrder_confirmPaid') && (
                <RemarkModal
                  api={confirmPayment}
                  reload={() => {
                    visibleSet(false);
                    props.reload();
                  }}
                  selectedRowData={[record]}
                  btnText="确认付款"
                  loading={loading}
                />
              )}
            </Space>
          ),
      }}
      onFinishFailed={(error) => {
        console.error(error);
      }}
    >
      <Spin spinning={loading}>
        <div className="askOrder-section">
          <span className="number">审批编号: {detail?.process_instance_id}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '15px' }}>{detail?.bodyResult?.title}</strong>
            {detail?.bodyResult?.status == 'COMPLETED' ? (
              detail?.bodyResult?.result == 'agree' ? (
                <Tag color="green">已通过</Tag>
              ) : detail?.bodyResult?.result == 'refuse' ? (
                <Tag color="red">已拒绝</Tag>
              ) : (
                <></>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="askOrder-section">
          <div className="form-item">
            <div style={{ color: '#999' }}>所在部门</div>
            {detail?.bodyResult?.originatorDeptName}
          </div>

          {detail?.bodyResult?.formComponentValues?.map((v: any) =>
            v.componentType == 'TextNote' ? (
              <div style={{ paddingBottom: '20px' }}>{v.value}</div>
            ) : (
              <div className="form-item" key={v.id}>
                <div style={{ color: '#999' }}>{v.name}</div>
                {renderFormItem(v)}
              </div>
            ),
          )}
        </div>
        <div className="askOrder-section last">
          <span className="number">流程</span>

          <Timeline mode="left">
            {detail?.bodyResult?.operationRecords?.map((v: any) =>
              v.type == 'PROCESS_CC' ? (
                <Timeline.Item dot={<SoundOutlined style={{ fontSize: '16px' }} />}>
                  <>
                    <div style={{ fontSize: '14px' }}>抄送{v?.ccUserIds?.length}人</div>
                    <div style={{ color: '#999' }}>
                      <Space>
                        {v?.ccUserIds.map((a: any) => (
                          <span key={a}>{detail?.userMap?.[a]}</span>
                        ))}
                      </Space>
                    </div>
                  </>
                </Timeline.Item>
              ) : (
                <Timeline.Item
                  key={v.activityId}
                  dot={
                    v.result == 'AGREE' ? (
                      <CheckCircleOutlined style={{ fontSize: '16px' }} />
                    ) : v.result == 'REFUSE' ? (
                      <CloseCircleOutlined style={{ fontSize: '16px' }} />
                    ) : v.type == 'NONE' || v.status == 'RUNNING' ? (
                      <ClockCircleOutlined style={{ fontSize: '16px' }} />
                    ) : v.type == 'ADD_REMARK' ? (
                      <EditOutlined style={{ fontSize: '16px' }} />
                    ) : undefined
                  }
                  color={
                    v.result == 'AGREE'
                      ? 'green'
                      : v.result == 'REFUSE'
                      ? 'red'
                      : v.type == 'NONE' || v.status == 'RUNNING'
                      ? 'orange'
                      : undefined
                  }
                >
                  <>
                    <div style={{ fontSize: '14px' }}>
                      {v.type == 'ADD_REMARK'
                        ? `${detail?.userMap?.[v.userId]} 添加了评论`
                        : v.type == 'START_PROCESS_INSTANCE'
                        ? '发起申请'
                        : '审批人'}
                    </div>
                    {v.type != 'ADD_REMARK' && (
                      <div style={{ color: '#999' }}>
                        {v.type == 'START_PROCESS_INSTANCE'
                          ? detail?.userMap?.[v.userId]
                          : `${detail?.userMap?.[v.userId]}(${S[v.result]})`}
                      </div>
                    )}
                    {!(v.type == 'NONE' || v.status == 'RUNNING') && (
                      <span className="time">{v.date}</span>
                    )}

                    {v.remark && (
                      <div className="others">
                        <div
                          dangerouslySetInnerHTML={{ __html: v.remark }}
                          style={{ color: '#999' }}
                        ></div>
                        {false && (
                          <div>
                            <Space>
                              {[1]?.map((a: any) => (
                                <Image width={80} height={80} src={a} key={a} />
                              ))}
                            </Space>
                          </div>
                        )}

                        {false && (
                          <div>
                            {[1].map((a: any) => (
                              <UploadFileList
                                disabled
                                key={a}
                                listType="picture"
                                checkMain={false}
                                defaultFileList={[]}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                </Timeline.Item>
              ),
            )}
          </Timeline>
        </div>
      </Spin>
    </DrawerForm>
  );
};

export default Dialog;
