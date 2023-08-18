import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { connect, history, useAccess, Access } from 'umi';
import { Button, Card, Col, Form, Modal, Row, Space, Spin, Tabs } from 'antd';
import { ProFormInstance } from '@ant-design/pro-form';
import {
  ProFormDependency,
  ProFormSelect,
  ProFormGroup,
  ProFormDatePicker,
  ProFormTextArea,
} from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { pubConfig, pubMsg, pubModal, acceptTypes, pubFilter } from '@/utils/pubConfig';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { addEstablish, getDetail, updateEstablish } from '@/services/pages/establish';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import EditZTTable from './components/editTableEs';
import { pubGetUserList, pubProLineList } from '@/utils/pubConfirm';
import ChangeLog from './components/ChangeLog';
import CloudCangTable from './components/cloudCangTable';
import PubDingDept from '@/components/PubForm/PubDingDept';
import CreateNameCode from './components/CreateNameCode';
import { getSkuDetail, getIterateDetail, saveProjectDraft } from '@/services/pages/establish';
import QiMenCangTable from './components/QiMenCangTable';

const Detail = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  const access = useAccess();
  // type: 1新增/重新提交,2 查看
  const type = history?.location?.query?.type;
  const pathname = history?.location?.pathname;
  const id = history?.location?.query?.id;
  const is_continue = history?.location?.query?.is_continue;
  const disabled = type === '2';
  const formRef = useRef<ProFormInstance>();
  const formRefDialog = useRef<ProFormInstance>();
  const formRef1 = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [editFormCloud] = Form.useForm();
  const [editFormQi] = Form.useForm();
  const [proLine, setProLine] = useState();
  const [detailData, setDetailData] = useState<any>({});
  const [editIds, setEditIds] = useState<any>();
  const [alReady, setAlReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('');
  const [changeLog, setChangeLog] = useState([]);
  const [productName, setProductName] = useState('');
  const [versionNum, setVersionNum] = useState('1'); // 迭代次数
  const [originSkus, setOriginSkus] = useState([]); // 新增款式立项时旧的sku
  const [originSkuShow, setOriginSkuShow] = useState(false);
  const [requireData, setRequireData] = useState({});
  const [hasRewrite, setHasRewrite] = useState(false);
  const [rewriteId, setRewriteId] = useState();
  const [skuOrVersion, setIsSkuVersion] = useState(
    // 是款式或迭代立项
    pathname.indexOf('detail-sku') > -1 || pathname.indexOf('detail-version') > -1,
  );
  const [cloudCangData, setCloudCangData] = useState<any[]>([]);
  const [qiMenData, setQiMenData] = useState<any[]>([]);
  const [tabKey, setTabKey] = useState<string>('1');
  const isEdit = pathname.indexOf('edit') > -1;
  const _ref = useRef();
  const selectProps = {
    showSearch: true,
    labelInValue: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option?.label?.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  const disabledDate = (current: any) => {
    return current && new Date(current).getTime() + 24 * 60 * 60 < new Date().getTime();
  };
  // 获取开发
  const pubGetUserListAction = async (v: any): Promise<any> => {
    const res: any = await pubGetUserList(v);
    return res || [];
  };

  // 获取产品线
  const getProLineListAction = async (
    business_scope: string,
    clear?: boolean,
    vendor_group_id?: string,
  ) => {
    if (clear) {
      formRef?.current?.setFieldsValue({
        vendor_group_id: '',
        listing_site: business_scope == 'CN' ? [] : null,
      });
      setProductName('');
    }
    const res: any = await pubProLineList({ business_scope });
    if (vendor_group_id) {
      const data = res.filter((v: any) => v.value == vendor_group_id)[0].label;
      setProductName(data);
    }
    setProLine(res);
  };
  // 获取历史审批
  const getChangeLog = async () => {
    setChangeLog([]);
    setLoading(false);
  };
  // 处理sku数据
  const handleSkus = (projectsGoodsSkus: any, isDialog?: any) => {
    return projectsGoodsSkus?.map((item: any, index: number) => {
      return {
        ...item,
        tempId: item.id,
        send_kind: item.send_kind ? item.send_kind + '' : '',
        index,
        position: item.position ? item.position + '' : isDialog ? null : '100',
        projectsGoodsSkuSpecifications: item.projectsGoodsSkuSpecifications?.length
          ? item.projectsGoodsSkuSpecifications.map((v: any) => {
              return {
                ...v,
                tempId: v.id,
              };
            })
          : [
              { tempId: '1', high: '', length: '', type: 1, weighht: '', width: '' },
              { tempId: '2', high: '', length: '', type: 2, weight: '', width: '' },
            ],
      };
    });
  };
  // 详情接口
  const getDetailAction = async (defaultData?: any) => {
    setLoading(true);
    setAlReady(false);
    let res: any = {};
    if (!defaultData) {
      if (pathname.indexOf('detail-sku') > -1) {
        res = await getSkuDetail({ id });
      } else if (pathname.indexOf('detail-version') > -1) {
        res = await getIterateDetail({ id });
      } else {
        res = await getDetail({ id });
      }

      getChangeLog();
      if (res?.code != pubConfig.sCode) {
        setLoading(false);
        pubMsg(res?.message);
        return;
      }
    } else {
      setHasRewrite(true);
      res.data = defaultData;
    }

    let initForm: any = res?.data || {};
    const requires = {
      requirement_name: res?.data.requirement_name,
      requirement_en_name: res?.data.requirement_en_name,
      consumption_level: res?.data.consumption_level,
      en_name: res?.data.en_name,
      en_short_name: res?.data.en_short_name,
    };
    setRequireData(requires);
    setVersionNum(res?.data?.goods_version || '1');
    if (['3', '4'].includes(res?.data?.projects?.type)) {
      setIsSkuVersion(true);
    }

    initForm = {
      ...initForm,
      ...initForm.projects,
      id: initForm.id,
      business_scope: initForm?.projects?.business_scope ?? initForm?.business_scope,
    };
    getProLineListAction(initForm?.business_scope, false, initForm?.vendor_group_id);
    if (initForm?.business_scope === 'CN') {
      initForm.listing_site =
        (initForm?.projects?.listing_site && initForm?.projects?.listing_site?.split(',')) || [];
    }
    initForm.finalized_type = initForm?.projects?.finalized_type?.split(',') || null;
    initForm.developer = initForm.developer_id
      ? {
          value: initForm.developer_id,
          label: initForm.developer_name,
        }
      : null;
    if (initForm?.sys_files?.length) {
      initForm.sys_files[0].isMain = 1;
    }
    initForm.projectsGoodsSkus = initForm.projectsGoodsSkus.map((v: any) => ({
      ...v,
      sku_form_spec: {
        sku_form: v.sku_form,
        sku_spec: v.sku_spec,
      },
    }));
    // 弹窗表格已有数据
    setOriginSkus(handleSkus(initForm.projectsGoodsSkus, true));
    formRefDialog?.current?.setFieldsValue({
      projectsGoodsSkus: handleSkus(initForm.projectsGoodsSkus),
    });

    // 页面表格数据
    if (
      initForm?.projectsGoodsSkus?.length &&
      (pathname.indexOf('detail-sku') == -1 || defaultData)
    ) {
      // 如果不是新款立项
      initForm.projectsGoodsSkus = handleSkus(initForm.projectsGoodsSkus);
      const ids = initForm?.projectsGoodsSkus?.map((val: any) => val.id) || [];
      setEditIds(ids);
    } else {
      // 添加新款立项置空，弹窗展示旧数据
      initForm.projectsGoodsSkus = [
        {
          tempId: Date.now(),
          uom: '',
          sys_files: [],
          currency: '',
          project_price: '',
          position: '100',
          index: 0,
        },
      ];
      setEditIds([initForm.projectsGoodsSkus[0].tempId]);
    }

    // 筛选出是云仓的
    initForm.projectsCloudCangData = initForm?.projectsGoodsSkus?.filter(
      (v: any) => v.send_kind == '5',
    );
    initForm.projectsQiMenCloudCangData = initForm?.projectsGoodsSkus?.filter(
      (v: any) => v.send_kind == '6',
    );
    setCloudCangData(initForm?.projectsCloudCangData?.map((v: any) => v.tempId));
    setQiMenData(initForm?.projectsQiMenCloudCangData?.map((v: any) => v.tempId));
    formRef1?.current?.setFieldsValue({
      ...initForm,
    });
    setDetailData(initForm);
    if (initForm.projectsQiMenCloudCangData?.length && !initForm.projectsCloudCangData?.length) {
      setTabKey('2');
    }
    formRef?.current?.setFieldsValue({
      ...initForm,
    });
    setAlReady(true);
    setLoading(false);
  };
  // 新增提交
  const handleAdd = (postData: any) => {
    postData.id = null;
    PubDingDept(
      async (dId: any) => {
        // console.log(rewriteId)
        const res: any = rewriteId
          ? await updateEstablish(
              is_continue
                ? { ...postData, is_continue: 1, id: rewriteId }
                : { ...postData, id: rewriteId },
              dId,
            )
          : await addEstablish(is_continue ? { ...postData, is_continue: 1 } : postData, dId);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('已提交，请等待审核', 'success');
          setTimeout(() => {
            history.push('/sign-establish/establish');
          }, 200);
        }
      },
      (err: any) => {
        console.log(err);
      },
    );
  };
  // 编辑提交
  const handleEdit = (postData: any) => {
    PubDingDept(
      async (dId: any) => {
        const res: any = await updateEstablish(postData, dId);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('已提交，请等待审核', 'success');
          setTimeout(() => {
            history.push('/sign-establish/establish');
          }, 200);
        }
      },
      (err: any) => {
        console.log(err);
      },
    );
  };

  // 更新表单立项
  const updateFormEs = (postData: any) => {
    pubModal('确定提交吗?')
      .then(() => {
        if (!isEdit) {
          handleAdd(postData);
        } else {
          handleEdit(postData);
        }
      })
      .catch(() => {
        console.log('点击了取消');
      });
  };

  const getDetailData = () => {
    // 存在id调详情接口
    if (id) {
      getDetailAction();
    } else {
      setAlReady(false);
      const temp = [
        {
          tempId: Date.now(),
          uom: '',
          sys_files: [],
          currency: '',
          project_price: '',
          index: 0,
          position: '100',
        },
      ];
      setEditIds([temp[0].tempId]);
      formRef?.current?.setFieldsValue({
        projectsGoodsSkus: temp,
      });
      setAlReady(true);
    }
  };
  useEffect(() => {
    setHasRewrite(false);
    setRewriteId(undefined);
    getDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.location?.pathname, history?.location?.search]);
  const handleUpload = (info: any, key: string) => {
    console.log(info);
    formRef?.current?.setFieldsValue({
      [key]: info,
    });
    formRef?.current?.validateFields([key]);
  };
  // 删除时云仓操作
  const handleDeleteCang = (data: any) => {
    const newData = JSON.parse(JSON.stringify(data));
    // 区分奇门云仓，万里牛云仓
    const newCloud = newData.filter((v: any) => ['5', '6'].includes(v.send_kind));
    const wLData: any = newCloud.filter((v: any) => v.send_kind == '5');
    const qMData: any = newCloud.filter((v: any) => v.send_kind == '6');
    formRef?.current?.setFieldsValue({
      projectsCloudCangData: wLData,
    });
    setCloudCangData(wLData);
    formRef?.current?.setFieldsValue({
      projectsQiMenCloudCangData: qMData,
    });
    setQiMenData(qMData);
    if (qMData?.length && !wLData?.length) {
      setTabKey('2');
    } else {
      setTabKey('1');
    }
  };
  const tableDataChange = (data: any, record?: any,isDelete?: boolean) => {
    // 不相等再赋值
    const ids = data.map((v: any) => v.tempId);
    if (JSON.stringify(editIds) !== JSON.stringify(ids)) {
      setEditIds(ids);
    }
    const pre = formRef?.current
      ?.getFieldValue('projectsGoodsSkus')
      ?.filter((v: any) => v.tempId == record?.tempId)?.[0];
    // 国内云仓处理,
    if (formRef.current?.getFieldValue('business_scope') === 'CN' && isDelete) {
      // 删除
      handleDeleteCang(data);
    }
    if (formRef.current?.getFieldValue('business_scope') === 'CN' && record) {
      const newData = JSON.parse(JSON.stringify(data));
      // 区分奇门云仓，万里牛云仓
      const newCloud = newData.filter((v: any) => ['5', '6'].includes(v.send_kind));
      let wLData = newCloud.filter((v: any) => v.send_kind == '5');
      let qMData = newCloud.filter((v: any) => v.send_kind == '6');
      // 修改了配送类型
      if (pre.send_kind != record.send_kind) {
        // 判断当配送类型为云仓时 send_kind == 5
        wLData = wLData?.map((v: any) => {
          return {
            ...v,
            cloud_warehouse_id: v.tempId == record?.tempId ? null : v.cloud_warehouse_id,
            return_cloud_warehouse_id:
              v.tempId == record?.tempId ? null : v.return_cloud_warehouse_id,
          };
        });
        qMData = qMData?.map((v: any) => {
          return {
            ...v,
            cloud_warehouse_id: v.tempId == record?.tempId ? null : v.cloud_warehouse_id,
            return_cloud_warehouse_id:
              v.tempId == record?.tempId ? null : v.return_cloud_warehouse_id,
          };
        });
        if (!record.send_kind) {
          if (!wLData?.length) {
            setTabKey('2');
          }
          if (!qMData?.length) {
            setTabKey('1');
          }
        }
        if (record.send_kind == '6') {
          setTabKey('2');
        } else if (record.send_kind == '5') {
          setTabKey('1');
        }
        // 判断当配送类型为万里牛云仓时 send_kind == 5,奇门云仓时 send_kind == 6
        if (['5', '6'].includes(record.send_kind)) {
          formRef?.current?.setFieldsValue({
            projectsCloudCangData: wLData,
            projectsQiMenCloudCangData: qMData,
          });
          setCloudCangData(wLData);
          setQiMenData(qMData);
        } else {
          if (wLData.filter((v: any) => v.id == record.id)) {
            formRef?.current?.setFieldsValue({
              projectsCloudCangData: wLData,
            });
            setCloudCangData(wLData);
          }
          if (qMData.filter((v: any) => v.id == record.id)) {
            formRef?.current?.setFieldsValue({
              projectsQiMenCloudCangData: qMData,
            });
            setQiMenData(qMData);
          }
        }
      }
      // 只修改了属性
      if (
        JSON.stringify(pre.sku_form_spec) != JSON.stringify(record.sku_form_spec) &&
        pre.send_kind == record.send_kind
      ) {
        if (['5', '6'].includes(record.send_kind)) {
          formRef?.current?.setFieldsValue({
            projectsCloudCangData: wLData,
            projectsQiMenCloudCangData: qMData,
          });
          setCloudCangData(wLData);
          setQiMenData(qMData);
        }
      }
    }
    formRef?.current?.setFieldsValue({
      projectsGoodsSkus: data,
    });
  };
  const onChange = (key: string) => {
    setTabKey(key);
  };
  const postDataHandle = (values: any) => {
    // 提交数据
    const postData = JSON.parse(
      JSON.stringify(
        !skuOrVersion
          ? {
              ...detailData,
              ...values,
              ...requireData,
            }
          : {
              ...detailData,
              ...values,
            },
      ),
    );
    postData.developer_name = postData.developer?.label || null;
    postData.developer_id = postData.developer?.value || null;
    // 数据封装
    postData.projects = {
      type: postData.type,
      business_scope: postData.business_scope,
      listing_site_country: postData.listing_site_country,
      listing_site:
        postData?.business_scope === 'CN'
          ? postData?.listing_site?.join(',')
          : postData.listing_site,
      estimated_launch_time: postData.estimated_launch_time,
      requirementsList: postData.requirementsList,
      reason: postData.reason,
      finalized_content: postData.finalized_content,
      finalizedList: postData.finalizedList,
      finalized_type: postData?.finalized_type?.join(','),
    };
    postData.projectsGoodsSkus = postData.projectsGoodsSkus.map((k: any) => {
      const newA = postData?.projectsCloudCangData?.find((h: any) => h.tempId == k.tempId);
      const newB = postData?.projectsQiMenCloudCangData?.find((h: any) => h.tempId == k.tempId);
      return {
        ...k,
        sku_form: k?.sku_form_spec?.sku_form,
        sku_spec: k?.sku_form_spec?.sku_spec,
        cloud_warehouse_id:
          k.send_kind == '5' ? newA?.cloud_warehouse_id : newB?.cloud_warehouse_id,
        return_cloud_warehouse_id:
          k.send_kind == '5' ? newA?.return_cloud_warehouse_id : newB?.return_cloud_warehouse_id,
      };
    });
    return JSON.parse(JSON.stringify(postData));
  };
  return (
    <PageContainer
      breadcrumb={{}}
      tabList={
        changeLog?.length
          ? [
              {
                tab: '基本信息',
                key: 'info',
              },
              {
                tab: '变更日志',
                key: 'changeLog',
              },
            ]
          : false
      }
      tabActiveKey={tab}
      onTabChange={async (val) => {
        setTab(val);
      }}
      className="supplier-detail pubPageTabs"
      title={false}
    >
      <Spin spinning={loading}>
        <ProForm
          className={disabled ? 'disabled establish show-detail pub-detail-form' : 'establish'}
          labelAlign="right"
          labelCol={{ style: { minHeight: '32px' } }}
          layout="horizontal"
          onFinish={async (values: any) => {
            return Promise.all([
              editForm.validateFields(),
              formRef1?.current?.validateFields(),
              editFormCloud.validateFields(),
              editFormQi.validateFields(),
            ])
              .then(async () => {
                if (!detailData?.name || !detailData?.goods_code) {
                  return Modal.warning({
                    title: '提示',
                    content: '请生成产品名称，产品编码后提交',
                  });
                }
                const postData = postDataHandle(values);
                updateFormEs(postData);
              })
              .catch(() => {
                const qiMenNoCross = values?.projectsQiMenCloudCangData?.some(
                  (v: any) => !v.cloud_warehouse_id,
                );
                const clNoCross = values?.projectsCloudCangData?.some(
                  (v: any) => !v.cloud_warehouse_id || !v.return_cloud_warehouse_id,
                );
                if (
                  tabKey == '2' &&
                  values?.projectsQiMenCloudCangData?.length &&
                  !qiMenNoCross &&
                  values?.projectsCloudCangData?.length &&
                  clNoCross
                ) {
                  setTabKey('1');
                } else if (
                  tabKey == '1' &&
                  values?.projectsCloudCangData?.length &&
                  !clNoCross &&
                  values?.projectsQiMenCloudCangData?.length &&
                  qiMenNoCross
                ) {
                  setTabKey('2');
                }
                formRef1?.current?.validateFields();
                editFormCloud.validateFields();
                editFormQi.validateFields();
                Modal.warning({
                  title: '提示',
                  content: '请检查表单信息正确性',
                });
              });
          }}
          onFinishFailed={() => {
            editForm.validateFields();
            formRef1?.current?.validateFields();
            if (cloudCangData?.length) {
              editFormCloud.validateFields();
            }
            if (qiMenData?.length) {
              editFormQi.validateFields();
            }
            Modal.warning({
              title: '提示',
              content: '请检查表单信息正确性',
            });
          }}
          formRef={formRef}
          submitter={{
            render: (data: any) => (
              <FooterToolbar style={{ padding: '6px' }}>
                {disabled ? (
                  <Button
                    icon={<ArrowLeftOutlined />}
                    key="back"
                    onClick={() => {
                      setTimeout(() => {
                        history.goBack();
                      }, 200);
                    }}
                  >
                    返回
                  </Button>
                ) : (
                  <Space>
                    <Access key="rewrite" accessible={access.canSee('scm_establish_rewrite')}>
                      <Button
                        type="primary"
                        ghost
                        onClick={async () => {
                          formRef?.current
                            ?.validateFields(['type', 'vendor_group_id', 'business_scope'])
                            .then(async () => {
                              const postData = postDataHandle(
                                formRef?.current?.getFieldsFormatValue(),
                              );
                              // 版本迭代保存草稿特殊处理
                              if (pathname.indexOf('detail-version') > -1 && !hasRewrite) {
                                postData.projectsGoodsSkus = postData.projectsGoodsSkus.map(
                                  (v: any) => {
                                    return {
                                      ...v,
                                      id: null,
                                    };
                                  },
                                );
                              }
                              const res = await saveProjectDraft(postData);
                              if (res?.code != pubConfig.sCode) {
                                pubMsg(res?.message);
                              } else {
                                pubModal('草稿保存成功,是否关闭当前页面?', '提示', {
                                  okText: '是',
                                  cancelText: '否',
                                })
                                  .then(async () => {
                                    setTimeout(() => {
                                      history.push('/sign-establish/establish');
                                    }, 200);
                                  })
                                  .catch(() => {
                                    getDetailAction(res?.data);
                                    setRewriteId(res?.data?.id);
                                  });
                              }
                            });
                        }}
                      >
                        保存至草稿
                      </Button>
                    </Access>

                    <Access
                      key="editEs"
                      accessible={
                        access.canSee('productlist_version') ||
                        access.canSee('productlist_sku_add') ||
                        access.canSee('productlist_establish_add') ||
                        access.canSee('establish_edit')
                      }
                    >
                      <Button
                        type="primary"
                        key="save"
                        onClick={async () => {
                          data.form?.submit?.();
                        }}
                      >
                        提交审核
                      </Button>
                    </Access>

                    <Button
                      key="cancel"
                      onClick={() => {
                        setTimeout(() => {
                          history.goBack();
                        }, 200);
                      }}
                    >
                      取消
                    </Button>
                  </Space>
                )}
              </FooterToolbar>
            ),
          }}
        >
          <Card
            title={'基本信息'}
            bordered={false}
            extra={
              <span style={{ display: detailData?.project_code ? 'block' : 'none' }}>
                立项编号：{detailData?.project_code}
              </span>
            }
          >
            <Row gutter={24} className={skuOrVersion ? 'disabled show-detail ' : ''}>
              <Col span={type == '2' ? 6 : 8} className={skuOrVersion ? 'show-detail' : ''}>
                <ProFormSelect
                  name="type"
                  label="立项类型"
                  readonly={disabled || skuOrVersion}
                  valueEnum={() => {
                    let list = [];
                    if (dicList?.PROJECTS_TYPE) {
                      list = JSON.parse(JSON.stringify(dicList?.PROJECTS_TYPE));
                    }
                    if (!skuOrVersion) {
                      delete list?.['3'];
                      delete list?.['4'];
                    }
                    return list;
                  }}
                  placeholder={disabled ? '--' : '请选择立项类型'}
                  rules={[{ required: !disabled, message: '请选择立项类型' }]}
                />
              </Col>
              <Col span={type == '2' ? 6 : 8} className="proLine-group">
                <ProFormGroup>
                  {disabled || skuOrVersion ? (
                    <div className="item">
                      <span className="label">产品线 : </span>
                      <span className={detailData?.business_scope ? 'value' : 'value none'}>
                        {detailData?.business_scope
                          ? detailData?.business_scope == 'CN'
                            ? '国内 - '
                            : '跨境 - '
                          : '-'}
                      </span>
                    </div>
                  ) : (
                    <ProFormSelect
                      name="business_scope"
                      label="产品线："
                      placeholder={disabled ? '-' : '请选择业务范畴'}
                      rules={[{ required: true, message: '请选择业务范畴' }]}
                      valueEnum={{
                        IN: '跨境',
                        CN: '国内',
                      }}
                      onChange={(val: any) => {
                        getProLineListAction(val, true);
                        if (val == 'CN') {
                          formRef?.current?.setFieldsValue({
                            currency: 'CNY',
                          });
                        } else {
                          formRef?.current?.setFieldsValue({
                            projectsCloudCangData: [],
                          });
                          setDetailData((pre: any) => {
                            pre.projectsCloudCangData = [];
                            return pre;
                          });
                          setCloudCangData([]);
                        }
                      }}
                    />
                  )}

                  <ProFormDependency name={['vendor_group_id', 'business_scope']}>
                    {({ business_scope }) => {
                      return (
                        <ProFormSelect
                          name="vendor_group_id"
                          label=""
                          disabled={disabled || !business_scope || skuOrVersion}
                          options={proLine || []}
                          rules={[{ required: true, message: '请选择产品线' }]}
                          placeholder={disabled ? '-' : '请选择产品线'}
                          showSearch
                          allowClear
                          onChange={(val, data) => {
                            setProductName(data?.label);
                          }}
                        />
                      );
                    }}
                  </ProFormDependency>
                </ProFormGroup>
              </Col>
              <ProFormDependency name={['business_scope']}>
                {({ business_scope }) => {
                  return business_scope ? (
                    <>
                      <Col span={type == '2' ? 6 : 8} className={skuOrVersion ? 'show-detail' : ''}>
                        {business_scope === 'CN' ? (
                          <ProFormSelect
                            disabled={disabled}
                            placeholder={disabled ? '-' : '请选择上架站点'}
                            rules={[
                              {
                                required: !disabled,
                                message: '请选择上架站点',
                              },
                            ]}
                            valueEnum={dicList.PROJECTS_LISTING_SITE_1}
                            mode="multiple"
                            name="listing_site"
                            label="上架站点"
                          />
                        ) : (
                          <>
                            {disabled ? (
                              <Form.Item label="上架站点">
                                {pubFilter(
                                  dicList?.PROJECTS_LISTING_SITE_2,
                                  detailData?.listing_site,
                                )}
                                -
                                {pubFilter(
                                  dicList?.SYS_PLATFORM_SHOP_SITE,
                                  detailData?.listing_site_country,
                                )}
                              </Form.Item>
                            ) : (
                              <ProFormGroup>
                                <ProFormSelect
                                  disabled={disabled}
                                  placeholder={disabled ? '-' : '请选择平台类型'}
                                  rules={[
                                    {
                                      required: !disabled,
                                      message: '请选择平台类型',
                                    },
                                  ]}
                                  valueEnum={dicList.PROJECTS_LISTING_SITE_2}
                                  name="listing_site"
                                  label="上架站点"
                                />

                                <ProFormDependency name={['listing_site']}>
                                  {() => {
                                    return (
                                      <ProFormSelect
                                        name="listing_site_country"
                                        label=""
                                        disabled={disabled || !business_scope}
                                        valueEnum={dicList.SYS_PLATFORM_SHOP_SITE}
                                        rules={[{ required: true, message: '请选择站点' }]}
                                        placeholder={disabled ? '-' : '请选择站点'}
                                        showSearch
                                        allowClear
                                      />
                                    );
                                  }}
                                </ProFormDependency>
                              </ProFormGroup>
                            )}
                          </>
                        )}
                      </Col>
                    </>
                  ) : (
                    ''
                  );
                }}
              </ProFormDependency>
              <Col span={type == '2' ? 6 : 8} className={skuOrVersion ? 'show-detail' : ''}>
                <ProFormDatePicker
                  fieldProps={{
                    disabledDate: disabledDate,
                  }}
                  name="estimated_launch_time"
                  label="预计上架时间"
                  readonly={disabled}
                  placeholder={disabled ? '--' : '请选择预计上架时间'}
                  rules={[{ required: !disabled, message: '请选择预计上架时间' }]}
                />
              </Col>
      
            </Row>
            <Row gutter={24}>
              <Col span={16}>
                <ProFormDependency name={['reason']}>
                  {({ reason }) => {
                    return disabled ? (
                      <Form.Item name="reason" label="立项原因">
                        <pre>{reason || '-'}</pre>
                      </Form.Item>
                    ) : (
                      <ProFormTextArea
                        fieldProps={{
                          autoSize: true,
                        }}
                        readonly={disabled}
                        placeholder={disabled ? '--' : '请输入立项原因'}
                        rules={[
                          { required: !disabled, message: '请输入立项原因' },
                          { max: 400, message: '最多输入400字' },
                        ]}
                        label="立项原因"
                        name="reason"
                      />
                    );
                  }}
                </ProFormDependency>
              </Col>
              <Col span={24}>
                <Form.Item
                  required={!disabled}
                  rules={[
                    () => ({
                      validator(_, value) {
                        const unDeleteFiles = value?.filter((file: any) => file.delete != 1);
                        if (!unDeleteFiles?.length) {
                          return Promise.reject(new Error('请上传文档'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  label="文档上传"
                  name="requirementsList"
                  valuePropName="requirementsList"
                  extra="支持常用文档和图片以及压缩包格式文件，单个不能超过50M"
                >
                  <UploadFileList
                    fileBack={(val: any, init: boolean) => {
                      if (!init) {
                        handleUpload(val, 'requirementsList');
                      }
                    }}
                    required={!disabled}
                    disabled={disabled}
                    businessType="PRODUCT_REQUIREMENTS_DOCUMENT"
                    checkMain={false}
                    defaultFileList={detailData?.requirementsList}
                    accept={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                    acceptType={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                    maxSize="50"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card
            title={'产品信息'}
            bordered={false}
            style={{ margin: '10px 0' }}
            className="show-detail"
          >
            {!skuOrVersion && (['1', '2'].includes(detailData?.type) || !detailData?.type) && (
              <CreateNameCode
                setDetailData={setDetailData}
                setRequireData={setRequireData}
                detailData={detailData}
                dicList={dicList}
                formRef1={formRef1}
                disabled={disabled}
                productName={productName}
                versionNum={versionNum}
                formRef={formRef}
                id={id}
              />
            )}
            {detailData?.name && (
              <Row gutter={24} className={skuOrVersion ? 'disabled show-detail' : ''}>
                <Col span={8}>
                  <Form.Item label="产品名称"> {detailData?.name || '-'}</Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="产品编码"> {detailData?.goods_code || '-'}</Form.Item>
                </Col>

                <Col span={8}>
                  <ProFormSelect
                    name="uom"
                    label="单位: "
                    placeholder={disabled ? '--' : '请选择单位'}
                    readonly={disabled || skuOrVersion}
                    rules={[{ required: !(disabled || skuOrVersion), message: '请选择单位' }]}
                    valueEnum={dicList.GOODS_UOM}
                  />
                </Col>
                <Col span={8} className="disabled">
                  <ProFormDependency name={['business_scope']}>
                    {({ business_scope }) => {
                      return (
                        <ProFormSelect
                          name="currency"
                          label="定价币种: "
                          placeholder={disabled ? '--' : '请选择定价币种'}
                          readonly={disabled || skuOrVersion || business_scope == 'CN'}
                          rules={[
                            {
                              required: !(disabled || skuOrVersion || business_scope == 'CN'),
                              message: '请选择定价币种',
                            },
                          ]}
                          valueEnum={dicList.SC_CURRENCY}
                        />
                      );
                    }}
                  </ProFormDependency>
                </Col>
                <Col span={8}>
                  <ProFormSelect
                    name="developer"
                    label="产品开发"
                    fieldProps={selectProps}
                    readonly={disabled || (skuOrVersion && detailData.developer)}
                    request={async (v: any) => {
                      const res: any = await pubGetUserListAction(v);
                      return res;
                    }}
                    placeholder={
                      disabled || (skuOrVersion && detailData.developer) ? '--' : '请选择产品开发'
                    }
                    rules={[
                      {
                        required: !(disabled || (skuOrVersion && detailData.developer)),
                        message: '请选择产品开发',
                      },
                      ({}) => ({
                        validator(_, value) {
                          if (JSON.stringify(value) === '{}') {
                            return Promise.reject(new Error('请选择产品开发'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  />
                </Col>
              </Row>
            )}
          </Card>
          <Card title={'款式信息'} bordered={false}>
            <Modal
              title="已有款式"
              visible={originSkuShow}
              footer={null}
              width="1260px"
              onCancel={() => setOriginSkuShow(false)}
              bodyStyle={{ paddingBottom: 0 }}
            >
              <ProForm initialValues={{ projectsGoodsSkus: originSkus }} submitter={false}>
                <EditZTTable
                  ref1={_ref}
                  disabled={true}
                  editIds={[]}
                  isDialog={true}
                  defaultData={originSkus}
                  form={editForm}
                  dicList={dicList}
                  formRef={formRef}
                  approval_status={detailData?.approval_status}
                />
              </ProForm>
            </Modal>
            <Row gutter={24}>
              {pathname.indexOf('detail-sku') > -1 && originSkus.length ? (
                <Access accessible={access.canSee('productlist_pre_sku')}>
                  <Col span={24}>
                    <Space>
                      <p style={{ marginLeft: '65px' }}>
                        款式详情：当前产品已有款式<span>{originSkus.length}</span>款
                      </p>
                      <p>
                        <a
                          onClick={() => {
                            setOriginSkuShow(true);
                          }}
                        >
                          查看
                        </a>
                      </p>
                    </Space>
                  </Col>
                </Access>
              ) : (
                <></>
              )}

              <Col span={24}>
                {(editIds || !id) && alReady && (
                  <EditZTTable
                    ref1={_ref}
                    tableDataChange={tableDataChange}
                    disabled={disabled}
                    formRef={formRef}
                    editIds={disabled ? [] : editIds}
                    defaultData={detailData?.projectsGoodsSkus}
                    form={editForm}
                    dicList={dicList}
                    productName={detailData?.name || productName}
                  />
                )}
              </Col>
            </Row>
          </Card>
          {/* 云仓 */}
          {(!!cloudCangData?.length || !!qiMenData.length) && (
            <Card>
              <Col span={24}>
                <Tabs
                  activeKey={tabKey}
                  onChange={onChange}
                  items={
                    cloudCangData?.length && qiMenData.length
                      ? ([
                          {
                            label: `万里牛云仓信息`,
                            key: '1',
                          },
                          {
                            label: `奇门云仓信息`,
                            key: '2',
                          },
                        ] as any)
                      : cloudCangData?.length
                      ? [
                          {
                            label: `万里牛云仓信息`,
                            key: '1',
                          },
                        ]
                      : qiMenData.length
                      ? [
                          {
                            label: `奇门云仓信息`,
                            key: '2',
                          },
                        ]
                      : []
                  }
                />
                {(editIds || !id) && alReady && (
                  <>
                    <CloudCangTable
                      hidden={!(!!cloudCangData?.length && tabKey == '1')}
                      formRef={formRef}
                      disabled={disabled}
                      form={editFormCloud}
                      dicList={dicList}
                      platform_code="YUNCANG"
                      productName={detailData?.name || productName}
                      approval_status={detailData?.approval_status}
                    />
                    <QiMenCangTable
                      formRef={formRef}
                      disabled={disabled}
                      form={editFormQi}
                      productName={detailData?.name || productName}
                      dicList={dicList}
                      platform_code="QIMEN_YUNCANG"
                      hidden={!(!!qiMenData?.length && tabKey == '2')}
                      approval_status={detailData?.approval_status}
                    />
                  </>
                )}
              </Col>
            </Card>
          )}
        </ProForm>
      </Spin>
      <ProCard style={{ display: tab == 'changeLog' ? 'block' : 'none' }}>
        {dicList && <ChangeLog dataSource={changeLog} />}
      </ProCard>
    </PageContainer>
  );
};

const ConnectPage: React.FC = connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Detail);

export default ConnectPage;
