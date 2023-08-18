import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { Access, connect, history, useAccess } from 'umi';
import { Button, Card, Col, Form, Modal, Row, Space, Spin, Tabs } from 'antd';
import { ProFormInstance } from '@ant-design/pro-form';
import {
  ProFormDependency,
  ProFormSelect,
  ProFormGroup,
  ProFormDatePicker,
  ProFormTextArea,
  ProFormCheckbox,
} from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { useEffect, useRef, useState } from 'react';
import { pubConfig, pubMsg, pubModal, acceptTypes, pubFilter } from '@/utils/pubConfig';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { addFinal, getDetail, saveFinalizedDraft } from '@/services/pages/establish';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import EditZTTable from './components/editTable';
import CloudCangTable from './components/cloudCangTable';
import { pubGetUserList, pubProLineList } from '@/utils/pubConfirm';
import ChangeLog from './components/ChangeLog';
import PubDingDept from '@/components/PubForm/PubDingDept';
import CreateNameCode from './components/CreateNameCode';
import QiMenCangTable from './components/QiMenCangTable';
import LogisticsClearance from './components/LogisticsClearance';
import { calculateProductValuationTypeAndFba } from '@/services/pages/establish';

const Detail = (props: any) => {
  const { common } = props;
  const { dicList } = common;
  // type: 1新增/重新提交,2 查看
  const type = history?.location?.query?.type;
  const id = history?.location?.query?.id;
  const disabled = type === '2';
  const formRef = useRef<ProFormInstance>();
  const formRef1 = useRef<ProFormInstance>();
  const [editForm] = Form.useForm();
  const [editFormCloud] = Form.useForm();
  const [editFormQi] = Form.useForm();
  const [editFormCl] = Form.useForm();
  const [proLine, setProLine] = useState();
  const [detailData, setDetailData] = useState<any>({});
  const [editIds, setEditIds] = useState<any>();
  const [alReady, setAlReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('');
  const [changeLog, setChangeLog] = useState([]);
  const [productName, setProductName] = useState('');
  const [requireData, setRequireData] = useState({});
  const [versionNum, setVersionNum] = useState('1'); // 迭代次数
  const [cloudCangData, setCloudCangData] = useState<any[]>([]);
  const [qiMenData, setQiMenData] = useState<any[]>([]);
  const [tabKey, setTabKey] = useState<string>('1');
  const [clearance, setClearance] = useState<any[]>([]);
  const access = useAccess();
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
  const innFormValidate = (callback: (res: boolean) => void) => {
    _ref?.current?.innFormValidate(callback);
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
    const res: any = await pubProLineList({ business_scope });
    if (vendor_group_id) {
      const data = res.filter((v: any) => v.value == vendor_group_id)[0].label;
      setProductName(data);
    }
    setProLine(res);
    if (clear) {
      formRef?.current?.setFieldsValue({
        vendor_group_id: [],
        listing_site: [],
      });
    }
  };
  // 获取历史审批
  const getChangeLog = async () => {
    // setLoading(true);
    // const res = await approvalHistory({ id });
    // if (res?.code != pubConfig.sCode) {
    //   pubMsg(res?.message);
    //   setLoading(false);
    //   return;
    // }
    // if (res?.data?.length) {
    //   setTab('info');
    // }
    setChangeLog([]);
    setLoading(false);
  };



  // 根据长宽高 获取 SKU的产品尺寸类型
  const getSKUSpecsSize = async (info: any, row: any, allDetail: any, back: any) => {
    const newD = info.find((v: any) => v.type == 2)
    const { length, width, high, weight } = newD;
    if (length && width && high && weight) {
      const calculateParam = {
        goods_sku_id: row?.projects_goods_sku_id,
        platform_id: allDetail?.platform_id,
        shop_site: allDetail?.listing_site_country,
        package_length: length, // 包装尺寸-长(单位cm)
        package_width: width,    //包装尺寸-宽(单位cm)
        package_high: high,    //包装尺寸-高(单位cm)
        package_weight: weight    //包装尺寸-重量(单位g)
      }
      const res: any = await calculateProductValuationTypeAndFba(calculateParam);
      if (res?.code != pubConfig.sCode) {
        back({
          title: '包装尺寸异常',
          success: false,
        });
      } else {
        const lowSeasonFba = res?.data?.lowSeasonFba?.fee;
        const peakSeasonFba = res?.data?.peakSeasonFba?.fee;
        back({
          title: pubFilter(dicList?.STORAGE_FEE_BELONG_CLASSIFY, res?.data?.belong_classify),
          success: true,
          belong_classify: res?.data?.belong_classify,
          lowSeasonFba: `${lowSeasonFba?.dynamic_fee} ${pubFilter(dicList?.SC_CURRENCY, lowSeasonFba?.dynamic_currency)}`,
          peakSeasonFba: `${peakSeasonFba?.dynamic_fee} ${pubFilter(dicList?.SC_CURRENCY, peakSeasonFba?.dynamic_currency)}`,
        });
      }
    }
  };

  // 加载后 再检查长宽高的 尺寸类型
  const checkSKUSpecsSize = async (list: any, allDetail: any) => {
    setTimeout(async () => {
      const newList = JSON.parse(JSON.stringify(list));
      let num = 0;
      newList.forEach((element: any, elindex: number) => {
        element.projects_goods_sku_id = element.id;
        getSKUSpecsSize(element.projectsGoodsSkuSpecifications, element, allDetail, (backData: any) => {
          console.log(backData)
          newList[elindex].message = backData;
          num += 1;
          if (num == newList.length) {
            console.log(num)
            formRef?.current?.setFieldsValue({
              'projectsGoodsSkus': newList
            })
          }
        });
      });
    }, 100);
  };


  // 详情接口
  const getDetailAction = async (defaultData?: any) => {
    setLoading(true);
    setAlReady(false);
    let res: any = {};
    if (!defaultData) {
      res = await getDetail({ id });
      getChangeLog();
      if (res?.code != pubConfig.sCode) {
        pubMsg(res?.message);
      }
    } else {
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
    getProLineListAction(initForm.projects.business_scope, false, initForm?.vendor_group_id);
    initForm = {
      ...initForm,
      ...initForm.projects,
    };
    if (initForm?.business_scope === 'CN') {
      initForm.listing_site = initForm?.projects?.listing_site?.split(',') || [];
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
    if (initForm?.projectsGoodsSkus?.length) {
      initForm.projectsGoodsSkus = initForm?.projectsGoodsSkus?.map((item: any, index: number) => {
        const arr = item.projectsGoodsSkuSpecifications.map((v: any) => {
          return {
            ...v,
            tempId: v.id,
          };
        });
        return {
          ...item,
          tempId: item.id,
          sku_form_spec: {
            sku_form: item.sku_form,
            sku_spec: item.sku_spec,
          },
          send_kind: item.send_kind ? item.send_kind + '' : '',
          index,
          position: item.position ? item.position + '' : '100',
          projectsGoodsSkuSpecifications: item.projectsGoodsSkuSpecifications?.length
            ? item.projectsGoodsSkuSpecifications?.length === 3
              ? arr
              : [
                ...arr,
                { tempId: '3', high: '', length: '', type: 3, weight: '', width: '', pics: '' },
              ]
            : [
              { tempId: '1', high: '', length: '', type: 1, weight: '', width: '' },
              { tempId: '2', high: '', length: '', type: 2, weight: '', width: '' },
              { tempId: '3', high: '', length: '', type: 3, weight: '', width: '', pics: '' },
            ],
        };
      });
    }
    // 筛选出是云仓的
    initForm.projectsCloudCangData = initForm?.projectsGoodsSkus.filter(
      (v: any) => v.send_kind == '5',
    );
    initForm.projectsQiMenCloudCangData = initForm?.projectsGoodsSkus?.filter(
      (v: any) => v.send_kind == '6',
    );
    setCloudCangData(initForm?.projectsCloudCangData?.map((v: any) => v.tempId));
    setQiMenData(initForm?.projectsQiMenCloudCangData?.map((v: any) => v.tempId));
    // 初始化清关信息
    initForm.projectsGoodsSkuCustomsClearance = initForm?.projectsGoodsSkus.map((v: any) => {
      return {
        ...(v?.projectsGoodsSkuCustomsClearance || {}),
        tempId: v.tempId,
        sku_name: v?.sku_name,
        project_goods_sku_id: v.id,
        sku_form_spec: v.sku_form_spec,
      };
    });
    setClearance(initForm.projectsGoodsSkuCustomsClearance);
    setDetailData(initForm);
    if (initForm.projectsQiMenCloudCangData?.length && !initForm.projectsCloudCangData?.length) {
      setTabKey('2');
    }
    const ids = initForm?.projectsGoodsSkus?.map((val: any) => val.id) || [];
    setEditIds(ids);

    formRef1?.current?.setFieldsValue({
      ...initForm,
    });
    formRef?.current?.setFieldsValue({
      ...initForm,
    });
    setAlReady(true);
    setLoading(false);

    // 加载后 再检查长宽高的 尺寸类型
    checkSKUSpecsSize(initForm.projectsGoodsSkus, initForm);
  };

  // 最后提交
  const saveOver = (postData: any) => {
    PubDingDept(
      async (dId: any) => {
        const res: any = await addFinal(postData, dId);
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
  // 提交定稿
  const updateFormFin = (postData: any) => {
    pubModal('确定提交吗?')
      .then(async () => {
        saveOver(postData);
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
          projectsGoodsSkuSpecifications: [
            { tempId: '1', high: '', length: '', type: 1, weight: '', width: '' },
            { tempId: '2', high: '', length: '', type: 2, weight: '', width: '' },
            { tempId: '3', high: '', length: '', type: 3, weight: '', width: '', pics: '' },
          ],
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
    getDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.location?.pathname, history?.location?.search]);
  const handleUpload = (info: any, key: string) => {
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
  const tableDataChange = (data: any, record: any, isDelete: boolean) => {
    // 不相等再赋值
    const ids = data.map((v: any) => v.tempId);
    if (JSON.stringify(editIds) !== JSON.stringify(ids)) {
      setEditIds(ids);
    }
    const pre = formRef?.current
      ?.getFieldValue('projectsGoodsSkus')
      ?.filter((v: any) => v.tempId == record?.tempId)?.[0];
    // 国内云仓处理
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
        if (record.send_kind == '5') {
          formRef?.current?.setFieldsValue({
            projectsCloudCangData: wLData,
          });
          setCloudCangData(wLData);
        }
        if (record.send_kind == '6') {
          formRef?.current?.setFieldsValue({
            projectsQiMenCloudCangData: qMData,
          });
          setQiMenData(qMData);
        }
      }
    }
    // 跨境清关信息处理
    if (formRef.current?.getFieldValue('business_scope') === 'IN') {
      const projectsGoodsSkuCustomsClearance = formRef?.current?.getFieldValue(
        'projectsGoodsSkuCustomsClearance',
      );
      if (!record) {
        if (projectsGoodsSkuCustomsClearance.length < data.length) {
          projectsGoodsSkuCustomsClearance.push(
            data?.[data.length - 1].projectsGoodsSkuCustomsClearance,
          );
        }
        if (projectsGoodsSkuCustomsClearance.length > data.length) {
          const tempIds = data.map((v: any) => v.tempId);
          projectsGoodsSkuCustomsClearance.forEach((v: any, i: number) => {
            if (!tempIds.includes(v.tempId)) {
              projectsGoodsSkuCustomsClearance.splice(i, 1);
            }
          });
        }
      } else {
        data.forEach((item: any) => {
          projectsGoodsSkuCustomsClearance.forEach((v: any) => {
            if (item.tempId == v.tempId) {
              v.sku_form_spec = item.sku_form_spec;
            }
          });
        });
      }
      setClearance(projectsGoodsSkuCustomsClearance);
      formRef?.current?.setFieldsValue({
        projectsGoodsSkus: data,
        projectsGoodsSkuCustomsClearance,
      });
      return;
    }

    formRef?.current?.setFieldsValue({
      projectsGoodsSkus: data,
    });
  };
  // 批量设置处理
  const batchChange = (data: any) => {
    // 不相等再赋值
    const ids = data.map((v: any) => v.tempId);
    if (JSON.stringify(editIds) !== JSON.stringify(ids)) {
      setEditIds(ids);
    }
    // 批量设置后 再检查长宽高的 尺寸类型
    // 下面是原来的
    // formRef?.current?.setFieldsValue({
    //   projectsGoodsSkus: data,
    // });
    checkSKUSpecsSize(data, detailData)

    if (formRef.current?.getFieldValue('business_scope') === 'CN') {
      // 筛选出是云仓的
      const projectsCloudCangData = data.filter((v: any) => v.send_kind == '5');
      const projectsQiMenCloudCangData = data?.filter((v: any) => v.send_kind == '6');
      const preW = formRef?.current?.getFieldValue('projectsCloudCangData');
      const preQ = formRef?.current?.getFieldValue('projectsQiMenCloudCangData');
      projectsCloudCangData.forEach((v: any) => {
        if (!preW.some((p: any) => v.tempId == p.tempId)) {
          v.cloud_warehouse_id = null;
          v.return_cloud_warehouse_id = null;
        }
      });
      projectsQiMenCloudCangData.forEach((v: any) => {
        if (!preQ.some((p: any) => v.tempId == p.tempId)) {
          v.cloud_warehouse_id = null;
          v.return_cloud_warehouse_id = null;
        }
      });
      formRef?.current?.setFieldsValue({
        projectsQiMenCloudCangData,
        projectsCloudCangData,
      });
      setCloudCangData(projectsCloudCangData?.map((v: any) => v.tempId));
      setQiMenData(projectsQiMenCloudCangData?.map((v: any) => v.tempId));
      if (projectsQiMenCloudCangData?.length && !projectsCloudCangData?.length) {
        setTabKey('2');
      } else {
        setTabKey('1');
      }
    }
    // 跨境清关信息处理
    if (formRef.current?.getFieldValue('business_scope') === 'IN') {
      const projectsGoodsSkuCustomsClearance = formRef?.current?.getFieldValue(
        'projectsGoodsSkuCustomsClearance',
      );
      if (projectsGoodsSkuCustomsClearance.length < data.length) {
        projectsGoodsSkuCustomsClearance.push(
          data?.[data.length - 1].projectsGoodsSkuCustomsClearance,
        );
      }
      if (projectsGoodsSkuCustomsClearance.length > data.length) {
        projectsGoodsSkuCustomsClearance.forEach((v: any, i: number) => {
          if (!ids.includes(v.tempId)) {
            projectsGoodsSkuCustomsClearance.splice(i, 1);
          }
        });
      }
      console.log(data, projectsGoodsSkuCustomsClearance, 666);
      data.forEach((item: any) => {
        projectsGoodsSkuCustomsClearance.forEach((v: any) => {
          if (item.tempId == v.tempId) {
            v.sku_form_spec = item.sku_form_spec;
          }
        });
      });
      setClearance(projectsGoodsSkuCustomsClearance);
      formRef?.current?.setFieldsValue({
        projectsGoodsSkuCustomsClearance,
      });
    }
  };
  const onChange = (key: string) => {
    setTabKey(key);
  };
  const postDataHandle = (values: any) => {
    const postData = JSON.parse(
      JSON.stringify(
        ['3', '4'].includes(detailData?.projects?.type)
          ? {
            ...detailData,
            ...values,
          }
          : {
            ...detailData,
            ...values,
            ...requireData,
          },
      ),
    );
    postData.id = history?.location?.query?.id || null;
    postData.developer_name = postData.developer?.label || null;
    postData.developer_id = postData.developer?.value || null;
    // 数据封装
    postData.projects = {
      type: postData.type,
      business_scope: postData.business_scope,
      listing_site:
        postData?.business_scope === 'CN' ? postData.listing_site.join(',') : postData.listing_site,
      estimated_launch_time: postData.estimated_launch_time,
      requirementsList: postData.requirementsList,
      reason: postData.reason,
      finalized_content: postData.finalized_content,
      finalizedList: postData.finalizedList,
      finalized_type: postData?.finalized_type?.join(','),
    };
    postData.projectsGoodsSkus = postData?.projectsGoodsSkus?.map((k: any, i: number) => {
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
        projectsGoodsSkuCustomsClearance: values?.projectsGoodsSkuCustomsClearance?.[i],
      };
    });
    return postData;
  };

  // 存在大尺寸异常是否继续提交
  const ifContinueAction = (postData: any) => {
    pubModal('当前立项款式中存在大尺寸件或者异常尺寸，是否继续提交?', '提示', {
      okText: '是',
      cancelText: '否',
    })
      .then(async () => {
        saveOver(postData);
      })
      .catch(() => { });
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
      title={false}
      className="supplier-detail pubPageTabs"
    >
      <Spin spinning={loading}>
        <ProForm
          className={
            disabled
              ? 'disabled establish show-detail  pub-detail-form'
              : 'disabled establish show-detail'
          }
          labelAlign="right"
          labelCol={{ style: { minHeight: '32px' } }}
          layout="horizontal"
          onFinish={async (values: any) => {
            return Promise.all([
              editForm.validateFields(),
              formRef1?.current?.validateFields(),
              editFormCloud.validateFields(),
              editFormQi.validateFields(),
              editFormCl.validateFields(),
            ])
              .then(() => {
                innFormValidate((res: any) => {
                  if (res) {
                    const postData = postDataHandle(values);
                    console.log(postData, 'postData');
                    // ，如果检测到了有包装尺寸异常或者大尺寸的存在
                    const isErr = postData?.projectsGoodsSkus.some((v: any) => !v?.message.success || v?.message.belong_classify == '2')
                    if (isErr) {
                      ifContinueAction(postData);
                    } else {
                      updateFormFin(postData);
                    }
                  } else {
                    formRef1?.current?.validateFields();
                    Modal.warning({
                      title: '提示',
                      content: '请检查表单信息正确性',
                    });
                  }
                });
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
                innFormValidate(() => { });
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
            if (clearance?.length) {
              editFormCl.validateFields();
            }
            innFormValidate(() => { });
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
                    {detailData?.approval_status != '6' && (
                      <Access key="rewrite" accessible={access.canSee('scm_finalized_rewrite')}>
                        <Button
                          type="primary"
                          ghost
                          onClick={async () => {
                            const postData = postDataHandle(
                              formRef?.current?.getFieldsFormatValue(),
                            );
                            const res = await saveFinalizedDraft(postData);
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
                                });
                            }
                          }}
                        >
                          保存至草稿
                        </Button>
                      </Access>
                    )}
                    <Access key="save" accessible={access.canSee('establish_finalized')}>
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
            <Row gutter={24}>
              <Col span={8}>
                <ProFormSelect
                  name="type"
                  label="立项类型"
                  readonly
                  valueEnum={dicList.PROJECTS_TYPE}
                  placeholder="-"
                />
              </Col>
              <Col span={8} className="proLine-group">
                <ProFormGroup>
                  <div className="item">
                    <span className="label">产品线 :</span>
                    <span className={detailData?.business_scope ? 'value' : 'value none'}>
                      {detailData?.business_scope
                        ? detailData?.business_scope == 'CN'
                          ? '国内 - '
                          : '跨境 - '
                        : '--'}
                    </span>
                  </div>
                  <ProFormDependency name={['vendor_group_id', 'business_scope']}>
                    {() => {
                      return (
                        <ProFormSelect
                          name="vendor_group_id"
                          label=""
                          disabled
                          options={proLine || []}
                          rules={[{ required: true, message: '请选择产品线' }]}
                          placeholder="-"
                          showSearch
                          allowClear
                        />
                      );
                    }}
                  </ProFormDependency>
                </ProFormGroup>
              </Col>
              <ProFormDependency name={['business_scope']}>
                {({ business_scope }) => {
                  return (
                    <>
                      <Col span={8}>
                        {business_scope === 'CN' ? (
                          <ProFormSelect
                            disabled
                            placeholder={disabled ? '-' : '请选择上架站点'}
                            valueEnum={dicList.PROJECTS_LISTING_SITE_1}
                            mode="multiple"
                            name="listing_site"
                            label="上架站点"
                          />
                        ) : (
                          <Form.Item label="上架站点">
                            {pubFilter(dicList?.PROJECTS_LISTING_SITE_2, detailData?.listing_site)}-
                            {pubFilter(
                              dicList?.SYS_PLATFORM_SHOP_SITE,
                              detailData?.listing_site_country,
                            )}
                          </Form.Item>
                        )}
                      </Col>
                    </>
                  );
                }}
              </ProFormDependency>
              <Col span={8}>
                <ProFormDatePicker
                  fieldProps={{
                    disabledDate: disabledDate,
                  }}
                  name="estimated_launch_time"
                  label="预计上架时间"
                  readonly
                  placeholder="-"
                />
              </Col>
              <Col span={24}>
                <Form.Item
                  label="文档上传"
                  name="requirementsList"
                  valuePropName="requirementsList"
                >
                  <UploadFileList
                    fileBack={(val: any, init: boolean) => {
                      if (!init) {
                        handleUpload(val, 'requirementsList');
                      }
                    }}
                    required={false}
                    disabled
                    businessType="PRODUCT_REQUIREMENTS_DOCUMENT"
                    checkMain={false}
                    defaultFileList={detailData?.requirementsList}
                    accept={['.docx,.doc,.xls,.xlsx,.pdf']}
                    acceptType={['docx', 'doc', 'xls', 'xlsx', 'pdf']}
                    maxSize="20"
                  />
                </Form.Item>
              </Col>
              <Col span={16}>
                <ProFormDependency name={['reason']}>
                  {({ reason }) => {
                    return (
                      <Form.Item name="reason" label="立项原因">
                        <pre>{reason || '-'}</pre>
                      </Form.Item>
                    );
                  }}
                </ProFormDependency>
              </Col>
            </Row>
          </Card>
          <Card title={'产品信息'} bordered={false} style={{ margin: '10px 0' }}>
            {['1', '2'].includes(detailData?.projects?.type) && (
              <CreateNameCode
                setRequireData={setRequireData}
                setDetailData={setDetailData}
                detailData={detailData}
                dicList={dicList}
                formRef1={formRef1}
                disabled={disabled}
                productName={productName}
                versionNum={versionNum}
                edit={true}
                formRef={formRef}
                id={id}
              />
            )}

            <Row gutter={24}>
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
                  readonly={['3', '4'].includes(detailData?.projects?.type) || disabled}
                  placeholder={disabled ? '--' : '请选择单位'}
                  rules={[{ required: !disabled, message: '请选择单位' }]}
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
                        readonly={
                          disabled ||
                          ['3', '4'].includes(detailData?.projects?.type) ||
                          business_scope == 'CN'
                        }
                        rules={[{ required: !disabled, message: '请选择定价币种' }]}
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
                  disabled={disabled}
                  readonly={['3', '4'].includes(detailData?.projects?.type)}
                  request={async (v: any) => {
                    const res: any = await pubGetUserListAction(v);
                    return res;
                  }}
                  placeholder={disabled ? '--' : '请选择产品开发'}
                  rules={[
                    { required: !disabled, message: '请选择产品开发' },
                    ({ }) => ({
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
          </Card>
          <Card title={'款式信息'} bordered={false}>
            <Row gutter={24}>
              <Col span={24}>
                {(editIds || !id) && alReady && (
                  <EditZTTable
                    ref1={_ref}
                    isFinal={true}
                    tableDataChange={tableDataChange}
                    getSKUSpecsSize={getSKUSpecsSize}
                    disabled={disabled}
                    formRef={formRef}
                    form={editForm}
                    dicList={dicList}
                    editIds={disabled ? [] : editIds}
                    defaultData={detailData?.projectsGoodsSkus}
                    allDetail={detailData} // 全部详情 2023-05-10添加 修改长宽高时，显示尺寸类型用
                    approval_status={detailData?.approval_status}
                    productName={detailData?.name || productName}
                    batchChange={batchChange}
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
                      approval_status={detailData?.approval_status}
                      productName={detailData?.name || productName}
                    />
                    <QiMenCangTable
                      formRef={formRef}
                      disabled={disabled}
                      form={editFormQi}
                      dicList={dicList}
                      platform_code="QIMEN_YUNCANG"
                      hidden={!(!!qiMenData?.length && tabKey == '2')}
                      approval_status={detailData?.approval_status}
                      productName={detailData?.name || productName}
                    />
                  </>
                )}
              </Col>
            </Card>
          )}
          <Card title={'定稿信息'} bordered={false} style={{ marginTop: '10px' }}>
            <Row gutter={24}>
              <Col span={16}>
                <ProFormCheckbox.Group
                  key={dicList?.PROJECTS_FINALIZED_TYPE}
                  name="finalized_type"
                  label="定稿类型"
                  options={
                    Object.values(dicList?.PROJECTS_FINALIZED_TYPE || {})?.map((v: any) => {
                      return {
                        value: v.detail_code,
                        label: v.detail_name,
                      };
                    }) || []
                  }
                  disabled={disabled}
                  rules={[{ required: !disabled, message: '请选择定稿类型' }]}
                />
              </Col>
              <Col span={16}>
                <ProFormDependency name={['finalized_content']}>
                  {({ finalized_content }) => {
                    return disabled ? (
                      <Form.Item name="finalized_content" label="补充内容">
                        <pre>{finalized_content || '-'}</pre>
                      </Form.Item>
                    ) : (
                      <ProFormTextArea
                        fieldProps={{
                          autoSize: true,
                        }}
                        readonly={disabled}
                        placeholder="如有补充内容请填写"
                        rules={[{ max: 400, message: '最多输入400字' }]}
                        label="补充内容"
                        name="finalized_content"
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
                          return Promise.reject(new Error('请上传产品定稿文档'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  label="定稿文档上传: "
                  name="finalizedList"
                  valuePropName="finalizedList"
                  tooltip="上传打样相关的协议或合同等，例如保密协议，支持常用文档和图片以及压缩包格式文件，可上传多个文件(单个文件超过50M)"
                >
                  <UploadFileList
                    fileBack={(val: any, init: boolean) => {
                      if (!init) {
                        handleUpload(val, 'finalizedList');
                      }
                    }}
                    required={!disabled}
                    disabled={disabled}
                    businessType="PRODUCT_FINALIZED_CONTENT"
                    checkMain={false}
                    defaultFileList={detailData?.finalizedList}
                    accept={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                    acceptType={`${acceptTypes.zip},${acceptTypes.pdf},${acceptTypes.doc},${acceptTypes.img},${acceptTypes.excel}`}
                    maxSize="50"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                {detailData?.business_scope == 'IN' &&
                  detailData?.projectsGoodsSkuCustomsClearance && (
                    <LogisticsClearance
                      dicList={dicList}
                      formRef={formRef}
                      productName={detailData?.name || productName}
                      clearance={clearance}
                      form={editFormCl}
                      disabled={disabled}
                    />
                  )}
              </Col>
            </Row>
          </Card>
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
