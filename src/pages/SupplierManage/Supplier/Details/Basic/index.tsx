import { FooterToolbar } from '@ant-design/pro-layout';
import { connect, history, useAccess, Access } from 'umi';
import { Button, message, Modal, Space, Spin } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import BaseInfo from './basic-info';
import Personas from './personas';
import Contact from './contact';
import Location from './location';
import { useEffect, useRef, useState } from 'react';
import { getBankCountList, getSupplierDetail, supplementary } from '@/services/pages/supplier';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { ArrowLeftOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { pubProLineList } from '@/utils/pubConfirm';
import PubDingDept from '@/components/PubForm/PubDingDept';
import { pubModal } from '@/utils/pubConfig';
import Coop from '../../components/Coop';

const Basic = (props: any) => {
  const [loading, setLoading] = useState(false);
  const reg = history.location.pathname.indexOf('/detail-basic') != -1;
  const [proList, setProList] = useState([]);
  const [disabled, setDisabled] = useState(reg);
  const access = useAccess();
  const pathname = history.location.pathname;
  const showOther =
    pathname.indexOf('/edit-basic') != -1 || pathname.indexOf('/detail-basic') != -1;
  const { basic, common } = props;
  const { dicList } = common;
  const formRef = useRef<ProFormInstance>();
  const contactRef: any = useRef();
  const addressRef: any = useRef();
  const coopRef: any = useRef();
  const [formData, setFormData] = useState<any>();
  const [businessEdit, setBusinessEdit] = useState(true); // 业务范畴只可编辑一次
  const [extraShow, setExtraShow] = useState(false);
  const [coopLoading, setCoopLoading] = useState({
    coopT: false,
    coop: false,
  });
  // 基础字段，合作中，临时合作时变更触发钉钉
  const baseCodes = [
    'name',
    'organization_code',
    'legal_person',
    'management_scope',
    'belonging_area',
    'tax_rate',
    'vendor_kind',
    'business_scope',
    'vendor_group_id',
  ];
  // 转让后重新设置责任人
  props.refBasic.current = {
    updateLiabilityName: (value: any) => {
      formRef?.current?.setFieldsValue({
        liabilityName: value,
      });
    },
  };
  // 显示隐藏画像的一些字段,合作中显示
  const refB = useRef();
  const changeExtraShow = (val: any) => {
    const cur: any = refB?.current;
    cur?.changeExtraShow(val);
  };

  let initForm: any = {
    contacts: [],
    address: [],
  };
  // 获取产品线
  const getProLineListAction = async (business_scope: string, clear?: boolean) => {
    const res: any = await pubProLineList({ business_scope });
    setProList(res || []);
    // 清除选中值
    if (clear) {
      formRef?.current?.setFieldsValue({
        vendor_group_id: [],
      });
    }
  };
  // 获取详情数据
  const getDetailAction = async () => {
    setLoading(true);
    const res: any = await getSupplierDetail({ id: history?.location?.query?.id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    }
    getProLineListAction(res?.data?.business_scope);
    if (res?.data?.address?.length) {
      res.data.address = res?.data?.address?.map((item: any, index: number) => {
        return {
          ...item,
          tempId: index,
        };
      });
    }
    initForm = res?.data || {};
    setBusinessEdit(initForm.business_scope ? false : true);
    initForm.tax_rate = initForm.tax_rate ? initForm.tax_rate + '' : null;
    if (!initForm.vendor_status) {
      initForm.vendor_status = '0';
    }
    if (typeof initForm.added_tax === 'number') {
      initForm.added_tax = String(initForm.added_tax);
    }
    changeExtraShow(initForm.vendor_status);
    if (!props.showOther && initForm) {
      initForm.vendor_status = '0';
    }
    setExtraShow(initForm.vendor_status);
    contactRef?.current?.setSource(initForm.contacts);
    addressRef?.current?.setSource(initForm.address);
    initForm.vendor_group_id = initForm.vendor_group_id || [];
    // 责任人数据处理
    if (initForm.liability_name && initForm.liability_id) {
      initForm.liabilityName = {
        label: initForm.liability_name,
        name: initForm.liability_name,
        id: initForm.liability_id,
        value: initForm.liability_id,
      };
    }
    props.setLab(initForm.liability_name); // 设置转让弹窗内数据值
    formRef?.current?.setFieldsValue({
      ...initForm,
    });
    setFormData(initForm);
    setLoading(false);
  };
  useEffect(() => {
    getDetailAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 正式合作: 未合作、临时合作、暂停合作、禁止合作且审批状态为非审批中批时
  const coopHandle = (approval_status: string, vendor_status: string) =>
    ['0', '4', '2', '3'].includes(vendor_status) && approval_status != '1';
  // 临时合作: 未合作、暂停合作、禁止合作且审批状态非审批中时显示
  const tempHandle = (approval_status: string, vendor_status: string) =>
    ['0', '2', '3'].includes(vendor_status) && approval_status != '1';

  // 判断基础字段是否变更
  const hasBaseChange = (postData: any) => {
    for (const key in postData) {
      if (baseCodes.includes(key)) {
        if (typeof formData[key] == 'string' && String(formData[key]) != String(postData[key])) {
          return true;
        } else if (
          key == 'vendor_group_id' &&
          String(formData[key].sort()) != String(postData[key].sort())
        ) {
          return true;
        }
      }
    }
    return false;
  };
  // 更新表单
  const updateForm = (postData: any) => {
    if(!postData?.contacts?.length) return pubMsg('请添加供应商联系人信息！');
    const noFind = postData?.contacts.find((v: any) => !dicList?.VENDOR_CONTACT_TYPE[v?.position]);
    if (noFind) return pubMsg(`联系人【${noFind.name}】的【职位】为空，请编辑后提交！`);
    const contactBoss1 = postData.contacts.filter((v: any) => v.position == 1 && !v.is_delete);
    const contactBoss2 = postData.contacts.filter((v: any) => v.position == 2 && !v.is_delete);
    if (!contactBoss1.length || !contactBoss2.length)
      return pubMsg('必须填写至少2个联系人信息(老板 和 业务)');
    if(!postData?.address?.length) return pubMsg('请添加供应商地址信息！');
    const address1 = postData.address.filter((v: any) => v.type == 1 && !v.is_delete);
    const address2 = postData.address.filter((v: any) => v.type == 2 && !v.is_delete);
    if (!address1.length || !address2.length)
      return pubMsg('必须同时维护(办公地址 和 工厂地址)');
    postData.id = history?.location?.query?.id || null;
    pubModal('确定提交吗?')
      .then(async () => {
        // 保存操作： 临时合作合作中并且基础字段变更触发钉钉
        if (['1', '4'].includes(postData?.vendor_status) && hasBaseChange(postData)) {
          PubDingDept(
            async (dId: any) => {
              const res: any = await supplementary(postData, dId);
              if (res?.code != pubConfig.sCode) {
                pubMsg(res?.message);
              } else {
                if (reg) {
                  setDisabled(true);
                }
                pubMsg('提交成功', 'success');
                setTimeout(() => {
                  history.push('/supplier-manage/supplier');
                }, 200);
              }
            },
            (err: any) => {
              console.log(err);
            },
          );
        } else {
          const res: any = await supplementary(postData);
          if (res?.code != pubConfig.sCode) {
            pubMsg(res?.message);
          } else {
            if (reg) {
              setDisabled(true);
            }
            pubMsg('提交成功', 'success');
            setTimeout(() => {
              history.push('/supplier-manage/supplier');
            }, 200);
          }
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };
  // 设置字段值
  const setAbout = (updateData: any) => {
    formRef?.current?.setFieldsValue({
      ...updateData,
    });
  };

  // 有无结算账户操作
  const handleCoop = (length: number, type: number) => {
    // 有结算账户
    if (length) {
      const postData = JSON.parse(JSON.stringify(formRef?.current?.getFieldsValue()));
      postData.liability_name = postData.liabilityName?.name || null;
      postData.liability_id = postData.liabilityName?.value || null;
      delete postData.contacts;
      delete postData.address;
      coopRef?.current?.show(postData, type);
      // 无结算账户提示
    } else {
      Modal.confirm({
        title: '提示',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div style={{ textAlign: 'center', marginLeft: '-45px', lineHeight: '32px' }}>
            {type === 1
              ? '供应商结算账户为空,无法发起临时合作申请 !'
              : '供应商结算账户为空,无法发起正式合作申请 !'}
            <br />
            请先添加结算账户!
          </div>
        ),
        okText: '关闭',
        cancelText: '取消',
        cancelButtonProps: {
          style: {
            display: 'none',
          },
        },
      });
    }
  };
  // 合作: type: 1临时合作，2正式合作
  const coopAction = (type: number) => {
    const key = type === 1 ? 'coopT' : 'coop';
    formRef?.current
      ?.validateFields()
      .then(async () => {
        setCoopLoading((pre: any) => {
          return {
            ...pre,
            [`${key}`]: true,
          };
        });
        const res = await getBankCountList({ vendor_id: history?.location?.query?.id || null });
        if (res?.code != pubConfig.sCode) {
          setCoopLoading((pre: any) => {
            return {
              ...pre,
              [`${key}`]: false,
            };
          });
          pubMsg(res?.message);
        } else {
          setCoopLoading((pre: any) => {
            return {
              ...pre,
              [`${key}`]: false,
            };
          });
          handleCoop(res?.data?.length, type);
        }
      })
      .catch(() => {
        message.warning('请检查表单正确性');
      });
  };
  return (
    <Spin spinning={loading}>
      <ProForm
        className={disabled ? 'supplier-detail disabled show-detail' : 'supplier-detail'}
        labelCol={{ style: { minHeight: '32px' }, flex: '140px' }}
        layout="horizontal"
        onFinish={async (values) => {
          const postData = JSON.parse(JSON.stringify(values));
          postData.liability_name = postData.liabilityName?.name || null;
          postData.liability_id = postData.liabilityName?.value || null;
          updateForm(postData);
        }}
        onFinishFailed={() => {
          Modal.warning({
            title: '提示',
            content: '请检查表单信息正确性',
          });
        }}
        formRef={formRef}
        labelAlign="right"
        submitter={{
          render: (data: any) => (
            <FooterToolbar style={{ padding: '6px' }}>
              {!disabled ? (
                <Space>
                  <Access
                    key="temp"
                    accessible={
                      access.canSee('supplier_temp_coop') &&
                      tempHandle(formData?.approval_status, formData?.vendor_status)
                    }
                  >
                    <Button
                      type="primary"
                      onClick={() => coopAction(1)}
                      loading={coopLoading?.coopT}
                    >
                      临时合作
                    </Button>
                  </Access>
                  <Access
                    key="coop"
                    accessible={
                      access.canSee('supplier_formal_coop') &&
                      coopHandle(formData?.approval_status, formData?.vendor_status)
                    }
                  >
                    <Button
                      type="primary"
                      onClick={() => coopAction(2)}
                      loading={coopLoading?.coop}
                    >
                      正式合作
                    </Button>
                  </Access>
                  <Access key="save" accessible={access.canSee('supplier_edit')}>
                    <Button
                      type="primary"
                      onClick={async () => {
                        data.form?.submit?.();
                      }}
                    >
                      保存
                    </Button>
                  </Access>
                  <Button
                    key="cancel"
                    onClick={() => {
                      if (reg) {
                        setDisabled(true);
                      }
                      setTimeout(() => {
                        history.push('/supplier-manage/supplier');
                      }, 200);
                    }}
                  >
                    取消
                  </Button>
                </Space>
              ) : (
                <Button icon={<ArrowLeftOutlined />} onClick={history.goBack}>
                  返回
                </Button>
              )}
            </FooterToolbar>
          ),
        }}
      >
        <Access key="edit" accessible={access.canSee('supplier_edit')}>
          <div
            style={{
              textAlign: 'right',
              marginBottom: '10px',
              marginTop: '8px',
              display: reg ? 'block' : 'none',
            }}
          >
            <Button
              type={disabled ? 'primary' : 'default'}
              ghost={disabled ? true : false}
              icon={disabled ? <EditOutlined /> : ''}
              onClick={() => {
                if (!disabled) {
                  getDetailAction();
                }
                setDisabled((pre) => !pre);
              }}
            >
              {disabled ? '编辑' : '取消编辑'}
            </Button>
          </div>
        </Access>
        <BaseInfo
          businessEdit={businessEdit}
          formData={formData}
          disabled={disabled}
          dicList={dicList}
          setAbout={setAbout}
          proList={proList}
          formRef={formRef}
          refB={refB}
          extraShow={extraShow}
          getProLineListAction={getProLineListAction}
        />
        <Personas dicList={dicList} formRef={formRef} disabled={disabled} formData={formData} />

            <Contact
              basic={basic}
              formRef={formRef}
              dicList={dicList}
              contactRef={contactRef}
              disabled={disabled}
            />
            <Location
              addressRef={addressRef}
              basic={basic}
              formRef={formRef}
              dicList={dicList}
              common={common}
              disabled={disabled}
            />
      </ProForm>
      <Coop dicList={dicList} coopRef={coopRef} />
    </Spin>
  );
};

export default connect(
  ({ basic, common }: { basic: Record<string, unknown>; common: Record<string, unknown> }) => ({
    basic,
    common,
  }),
)(Basic);
