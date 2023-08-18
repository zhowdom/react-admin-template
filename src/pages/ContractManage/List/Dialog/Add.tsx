import { useState, useRef } from 'react';
import { Modal, Form, Row, Col, Spin, Statistic } from 'antd';
import { ProFormDateRangePicker, ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormDependency,
  ProFormRadio,
  ProFormDigit,
  ProFormTextArea,
  ProFormCheckbox,
} from '@ant-design/pro-form';
import {
  vendorContractInsert,
  vendorContractFindById,
  vendorContractUpdateById,
  contractDetectKeyWords,
} from '@/services/pages/contract';
import { pubAlert, pubConfig, pubMsg } from '@/utils/pubConfig';
import {
  pubGetSigningListAuth,
  pubGetSigningListContract,
  pubGetDepotList,
  getUuid,
} from '@/utils/pubConfirm';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import PubDingDept from '@/components/PubForm/PubDingDept';
import './style.less';
import PayMethod from './components/PayMethod';
import moment from 'moment';

const Dialog = (props: any) => {
  console.log(props?.vendorData, 'props?.vendorData');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [contractType, setContractType] = useState<any>([]);
  const [noSignature, setNoSignature] = useState<any>({
    a: true,
    b: true,
  });
  console.log(props?.dicList?.CONTRACT_NAME, 99);
  const [detail, setDetail] = useState<any>({
    name: '', //合同名称
    vendor_id: '', //供应商id
    type: '', //合同类型(0:固定合同模板,1:自定义合同)
    subject_id: '', //签约主体
    begin_time: null, //合同开始日期
    end_time: null, //合同结束日期
    template_id: '', //模板id，如果合同类型是0，是必填
    sys_files: [], //附件
  });
  const formRef = useRef<ProFormInstance>();
  const [dataSource, setDataSource] = useState<any>([]);
  const selectProps = {
    showSearch: true,
    filterOption: (input: any, option: any) => {
      const trimInput = input.replace(/^\s+|\s+$/g, '');
      if (trimInput) {
        return option.label.indexOf(trimInput) >= 0;
      } else {
        return true;
      }
    },
  };
  // 获取详情数据
  const getDetail = async (id: any): Promise<any> => {
    const res = await vendorContractFindById({ id: id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const newData = JSON.parse(JSON.stringify(res.data));
    newData.time = [newData.begin_time, newData.end_time];
    newData.associate_purchase_framework = newData.associate_purchase_framework + '';
    newData.supplement = newData.supplement + '';
    newData.vendorContractPayMethods =
      newData?.vendorContractPayMethods?.map((v: any) => ({ ...v, tempId: getUuid() })) || [];
    formRef.current?.setFieldsValue(newData);
    setDetail(newData);
    setDataSource(newData?.vendorContractPayMethods);
    if (newData.name_id == '1') {
      const newContract = JSON.parse(JSON.stringify(props?.dicList?.VENDOR_CONTRACT_TYPE));
      delete newContract['1'];
      delete newContract['3'];
      setContractType(newContract);
    } else {
      const newContract = JSON.parse(JSON.stringify(props?.dicList?.VENDOR_CONTRACT_TYPE));
      delete newContract['0'];
      delete newContract['2'];
      setContractType(newContract);
    }
    // 判断关键字 是否需要签约 disabled

    setNoSignature({
      ...noSignature,
      a: newData.partya_no_signature == 1 ? false : true,
      b: newData.partyb_no_signature == 1 ? false : true,
    });

    if (newData.partya_no_signature == 1) {
      formRef.current?.setFieldsValue({
        partya_stamp_key: '',
        partya_no_signature: [1],
      });
    } else {
      formRef.current?.setFieldsValue({
        partya_no_signature: [],
      });
    }
    if (newData.partyb_no_signature == 1) {
      formRef.current?.setFieldsValue({
        partyb_stamp_key: '',
        partyb_no_signature: [1],
      });
    } else {
      formRef.current?.setFieldsValue({
        partyb_no_signature: [],
      });
    }
  };

  // 供应商变更结算方式变更协议处理
  const fromVendorHandle = () => {
    const newContract = JSON.parse(JSON.stringify(props?.dicList?.VENDOR_CONTRACT_TYPE));
    delete newContract['0'];
    delete newContract['2'];
    setContractType(newContract);
    const init = {
      type: '1',
      name_id: '11',
      name: '结算方式变更协议',
      vendor_id: props?.vendorData?.vendor_id || props?.vendorData?.id,
      vendor_bussiness_scope: props?.vendorData?.business_scope,
    };
    setTimeout(() => {
      formRef.current?.setFieldsValue(init);
    }, 200);
    setDetail(init);
  };

  props.addModel.current = {
    open: (data?: any) => {
      setDataSource([]);
      formRef?.current?.setFieldsValue({
        vendorContractPayMethods: [],
      });
      setIsModalVisible(true);
      setModalType(data ? (data.readonly ? 'detail' : 'edit') : 'add');
      setNoSignature({
        a: true,
        b: true,
      });
      if (data) {
        getDetail(data.id);
      } else {
        // 来自供应商列表调用
        if (props.vendorData) {
          fromVendorHandle();
          // 合同调用
        } else {
          setDetail({});
        }
      }
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setIsModalVisible(false);
    if (!val) props.handleClose(true);
  };
  // 添加提交
  const addSubmit = async (val: any) => {
    PubDingDept(
      async (dId: any) => {
        setLoading(true);
        const res = await vendorContractInsert(val, dId);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('提交成功!', 'success');
          modalClose(false);
        }
        setLoading(false);
      },
      (err: any) => {
        console.log(err);
      },
    );
  };
  // 编辑
  const editSubmit = async (val: any) => {
    PubDingDept(
      async (dId: any) => {
        setLoading(true);
        const res = await vendorContractUpdateById(val, dId);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          pubMsg('编辑成功!', 'success');
          modalClose(false);
        }
        setLoading(false);
      },
      (err: any) => {
        console.log(err);
      },
    );
  };
  // 提交前校验关键词
  const checkKey = async (data: any): Promise<any> => {
    setLoading(true);
    const res = await contractDetectKeyWords({
      id: data.sys_files[0].id,
      partyA: data.partya_stamp_key,
      partyB: data.partyb_stamp_key,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      setLoading(false);
      return;
    }
    if (modalType == 'add') {
      delete data.id;
      addSubmit(data);
    } else {
      editSubmit(data);
    }
    setLoading(false);
  };
  // 提交
  const saveSubmit = async (val: any) => {
    // 兼容旧数据不存在生效时间
    if (
      val?.payment_method_key == 2 &&
      val?.vendorContractPayMethods?.some((v: any) => !v.assert_time)
    ) {
      pubAlert('生效时间不能为空', '', 'warning');
      return;
    }
    const newData = JSON.parse(JSON.stringify(val));
    if (newData.type == '2' || newData.type == '3') {
      newData.partya_no_signature = 1;
      newData.partyb_no_signature = 1;
    } else if (newData.type == '0') {
      newData.partya_no_signature = 0;
      newData.partyb_no_signature = 0;
    } else {
      newData.partya_no_signature = newData.partya_no_signature?.length ? 1 : 0;
      newData.partyb_no_signature = newData.partyb_no_signature?.length ? 1 : 0;
    }
    if (newData.type != 0) {
      newData.begin_time = newData.time?.[0];
      newData.end_time = newData.time?.[1];
      delete newData.time;
    }
    console.log(newData);
    if (newData.type == 1) {
      checkKey(newData);
    } else {
      if (modalType == 'add') {
        delete newData.id;
        addSubmit(newData);
      } else {
        editSubmit(newData);
      }
    }
  };
  // 上传结束后
  const handleUpload = async (data: any, name: string) => {
    console.log(data);
    formRef.current?.setFieldsValue({ [`${name}`]: data });
  };
  return (
    <Modal
      width={modalType == 'detail' ? 640 : 800}
      title={
        modalType == 'add'
          ? props?.vendorData
            ? '创建结算方式变更协议'
            : '创建合同'
          : modalType == 'detail'
          ? '合同查看'
          : '重新提交合同审批'
      }
      visible={isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
      className="extra-inline"
      okButtonProps={{
        style: {
          display: modalType === 'detail' ? 'none' : 'inline-block',
        },
      }}
      cancelText={modalType === 'detail' ? '关闭' : '取消'}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          className={modalType === 'detail' ? 'item12' : undefined}
          requiredMark={modalType === 'detail' ? false : undefined}
          labelAlign="right"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          submitter={false}
          layout="horizontal"
        >
          <ProFormText name="id" hidden />
          <ProFormText name="name" hidden />
          <ProFormSelect
            name="name_id"
            label="合同名称"
            placeholder="请选择合同名称"
            readonly={['edit', 'detail'].includes(modalType) || props.vendorData ? true : false}
            valueEnum={props?.dicList?.CONTRACT_NAME}
            fieldProps={{
              onChange: (value: any, data: any) => {
                formRef.current?.setFieldsValue({ name: data.label });
                console.log(props?.dicList?.VENDOR_CONTRACT_TYPE);
                console.log(value);
                if (value == '1') {
                  const newContract = JSON.parse(
                    JSON.stringify(props?.dicList?.VENDOR_CONTRACT_TYPE),
                  );
                  delete newContract['1'];
                  delete newContract['3'];
                  console.log(newContract, 1);
                  formRef.current?.setFieldsValue({ type: '0' });
                  setContractType(newContract);
                } else {
                  const newContract = JSON.parse(
                    JSON.stringify(props?.dicList?.VENDOR_CONTRACT_TYPE),
                  );
                  delete newContract['0'];
                  delete newContract['2'];
                  console.log(newContract, 2);
                  formRef.current?.setFieldsValue({ type: '1' });
                  setContractType(newContract);
                }
              },
            }}
            rules={[{ required: true, message: '请选择合同名称' }]}
          />
          <ProFormDependency name={['name_id']}>
            {(data: any) => {
              return data.name_id ? (
                <ProFormRadio.Group
                  name="type"
                  label="创建方式"
                  rules={[{ required: true, message: '请选择创建方式' }]}
                  extra={
                    modalType === 'detail'
                      ? undefined
                      : '提示：自定义合同线上签约时，合同附件请不要带时间日期信息'
                  }
                  readonly={['edit', 'detail'].includes(modalType) ? true : false}
                  valueEnum={contractType}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 19 }}
                />
              ) : (
                ''
              );
            }}
          </ProFormDependency>

          <ProFormSelect
            name="vendor_id"
            label="供应商(乙方)"
            rules={[{ required: true, message: '请选择供应商' }]}
            readonly={['edit', 'detail'].includes(modalType) || props?.vendorData ? true : false}
            showSearch
            debounceTime={300}
            request={async (v) => {
              console.log(8888);
              const res: any = await pubGetSigningListContract(props?.vendorData ? v : { ...v });

              return res;
            }}
            fieldProps={{
              ...selectProps,
              onChange: (value: any, data: any) => {
                console.log(value);
                console.log(data);
                formRef.current?.setFieldsValue({
                  vendor_bussiness_scope: data.data.business_scope,
                });
              },
            }}
          />
          <ProFormText name="vendor_bussiness_scope" label="供应商业务范畴" hidden />
          <ProFormDependency name={['type']}>
            {(data: any) => {
              if (data.type == 2 || data.type == 3) {
                // 模板线上
                console.log(3333);
                return (
                  <>
                    <ProFormSelect
                      name="subject_id"
                      label="签约主体(甲方)"
                      rules={[{ required: true, message: '请选择签约主体' }]}
                      showSearch
                      debounceTime={300}
                      readonly={modalType === 'detail'}
                      fieldProps={selectProps}
                      params={{ aa: data.type }}
                      request={async (v) => {
                        const res: any = await pubGetSigningListAuth({ ...v });
                        console.log(res);
                        return res;
                      }}
                    />
                  </>
                );
              } else {
                return (
                  <>
                    <ProFormSelect
                      name="subject_id"
                      label="签约主体(甲方)"
                      rules={[{ required: true, message: '请选择签约主体' }]}
                      showSearch
                      debounceTime={300}
                      readonly={modalType === 'detail'}
                      fieldProps={selectProps}
                      params={{ aa: data.type }}
                      request={async (v) => {
                        const res: any = await pubGetSigningListAuth({
                          ...v,
                          extsign_auto_status: 1,
                        });
                        console.log(res);
                        return res;
                      }}
                    />
                  </>
                );
              }
            }}
          </ProFormDependency>
          <PayMethod
            modalType={modalType}
            selectProps={selectProps}
            setDataSource={setDataSource}
            dataSource={dataSource}
            dicList={props?.dicList}
            formRef={formRef}
          />
          <ProFormDependency name={['type', 'name_id', 'supplement']}>
            {(data: any) => {
              if (data.type == 0) {
                // 模板线上
                return (
                  <>
                    {data.name_id == '1' && (
                      <>
                        <ProFormRadio.Group
                          name="supplement"
                          label="是否附带补充协议"
                          radioType="button"
                          placeholder="请选择是否是否附带补充协议"
                          rules={[{ required: true, message: '请选择是否是否附带补充协议' }]}
                          valueEnum={props?.dicList?.SC_YES_NO}
                          readonly={modalType === 'detail'}
                        />
                        <ProFormSelect
                          name="template_id"
                          label="合同模板"
                          rules={[{ required: true, message: '请选择合同模板' }]}
                          showSearch
                          debounceTime={300}
                          fieldProps={selectProps}
                          readonly={modalType === 'detail'}
                          request={async (v) => {
                            const res: any = await pubGetDepotList(v);
                            console.log(res);
                            return res;
                          }}
                        />
                      </>
                    )}

                    {data?.supplement == '1' && data?.name_id == '1' && (
                      <Form.Item
                        label="补充协议上传"
                        name="supplement_sys_files"
                        rules={[{ required: true, message: '请上传补充协议上传' }]}
                        extra={modalType === 'detail' ? undefined : '只支持.docx格式文件'}
                      >
                        <UploadFileList
                          disabled={modalType === 'detail'}
                          fileBack={(dataC: any) => {
                            handleUpload(dataC, 'supplement_sys_files');
                          }}
                          businessType="VENDOR_CONTRACT"
                          required
                          listType="picture"
                          accept={['.docx']}
                          acceptType={['docx']}
                          defaultFileList={detail.supplement_sys_files}
                        />
                      </Form.Item>
                    )}
                  </>
                );
              } else {
                // 模板线下 自定义线上 自定义线下 都有
                return (
                  <>
                    {data.name_id == '1' && (
                      <ProFormRadio.Group
                        name="supplement"
                        label="是否附带补充协议"
                        radioType="button"
                        placeholder="请选择是否是否附带补充协议"
                        rules={[{ required: true, message: '请选择是否是否附带补充协议' }]}
                        valueEnum={props?.dicList?.SC_YES_NO}
                        readonly={modalType === 'detail'}
                      />
                    )}
                    {data.name_id && (
                      <Form.Item
                        label="上传合同"
                        name="sys_files"
                        rules={[{ required: true, message: '请上传上传合同' }]}
                        extra={modalType === 'detail' ? undefined : '只支持.docx,.doc,.pdf格式'}
                      >
                        <UploadFileList
                          disabled={modalType === 'detail'}
                          fileBack={(dataC: any) => {
                            handleUpload(dataC, 'sys_files');
                          }}
                          businessType="VENDOR_CONTRACT"
                          required
                          listType="picture"
                          accept={['.docx,.doc,.pdf']}
                          acceptType={['docx', 'doc', 'pdf']}
                          maxSize="5"
                          maxCount="1"
                          defaultFileList={detail.sys_files}
                        />
                      </Form.Item>
                    )}
                    {/* 框架线下有合同日期选择 */}
                    {data.name_id == '1' && data.type == '2' && modalType === 'detail' ? (
                      <div style={{ marginBottom: '20px' }}>
                        <Form.Item label="合同起止日期" name="time">
                          {`${moment(detail.begin_time).format('YYYY.MM.DD')}- ${moment(
                            detail.end_time,
                          ).format('YYYY.MM.DD')}`}
                        </Form.Item>
                      </div>
                    ) : data.name_id == '1' && data.type == '2' ? (
                      <ProFormDateRangePicker
                        name="time"
                        fieldProps={{ format: 'YYYY-MM-DD' }}
                        label="合同起止日期"
                        initialValue={[moment(), moment().add(1, 'year')]}
                        rules={[{ required: true, message: '请选择合同起止日期' }]}
                      />
                    ) : (
                      <></>
                    )}
                    {data?.supplement == '1' && data?.name_id == '1' && (
                      <Form.Item
                        label="补充协议上传"
                        name="supplement_sys_files"
                        rules={[{ required: true, message: '请上传补充协议上传' }]}
                        extra={modalType === 'detail' ? undefined : '只支持.docx,.doc,.pdf格式'}
                      >
                        <UploadFileList
                          disabled={modalType === 'detail'}
                          fileBack={(dataC: any) => {
                            handleUpload(dataC, 'supplement_sys_files');
                          }}
                          businessType="VENDOR_CONTRACT"
                          required
                          listType="picture"
                          accept={['.docx,.doc,.pdf']}
                          acceptType={['docx', 'doc', 'pdf']}
                          defaultFileList={detail.supplement_sys_files}
                        />
                      </Form.Item>
                    )}
                  </>
                );
              }
            }}
          </ProFormDependency>
          <ProFormDependency name={['type', 'name_id']}>
            {(data: any) => {
              console.log(data.type);
              // 自定义线上
              return (
                <>
                  {data.type == 1 && (
                    <>
                      <Row>
                        {modalType === 'detail' ? (
                          <Col span={16}>
                            <ProForm.Item
                              label="甲方签约关键字"
                              name="partya_stamp_key"
                              labelCol={{ span: 9 }}
                              wrapperCol={{ span: 14 }}
                            >
                              {detail.partya_no_signature == '1' ? (
                                <span>无需签约</span>
                              ) : (
                                <span>{detail.partya_stamp_key || '-'}</span>
                              )}
                            </ProForm.Item>
                          </Col>
                        ) : (
                          <>
                            <Col span={16}>
                              <ProFormText
                                name="partya_stamp_key"
                                labelCol={{ span: 9 }}
                                wrapperCol={{ span: 14 }}
                                label="甲方签约关键字"
                                initialValue={'甲方(盖章)'}
                                placeholder="请输入甲方签约关键字"
                                disabled={!noSignature.a}
                                rules={[
                                  { required: noSignature.a, message: '请输入甲方签约关键字' },
                                ]}
                                extra={
                                  modalType === 'detail'
                                    ? undefined
                                    : '选择甲方无需签约，甲方不需要在合同签章，直接发给乙方签约，合同生效'
                                }
                              />
                            </Col>
                            <Col span={8}>
                              <ProFormCheckbox.Group
                                name="partya_no_signature"
                                layout="vertical"
                                options={[
                                  {
                                    label: '无需签约',
                                    value: '1',
                                  },
                                ]}
                                fieldProps={{
                                  onChange: (value: any) => {
                                    const partyB =
                                      formRef.current?.getFieldValue('partyb_no_signature');
                                    if (value && value.length) {
                                      console.log(value);
                                      console.log(partyB);
                                      if (partyB && partyB.length) {
                                        pubAlert('甲方和乙方至少需要一个签约关键字');
                                        formRef.current?.setFieldsValue({
                                          partya_no_signature: null,
                                        });
                                      } else {
                                        formRef.current?.setFieldsValue({
                                          partya_stamp_key: '',
                                        });
                                        setNoSignature({
                                          ...noSignature,
                                          a: false,
                                        });
                                      }
                                    } else {
                                      setNoSignature({
                                        ...noSignature,
                                        a: true,
                                      });
                                    }
                                  },
                                }}
                              />
                            </Col>
                          </>
                        )}
                      </Row>

                      <Row>
                        {modalType === 'detail' ? (
                          <Col span={16}>
                            <ProForm.Item
                              label="乙方签约关键字"
                              name="partyb_stamp_key"
                              labelCol={{ span: 9 }}
                              wrapperCol={{ span: 14 }}
                            >
                              {detail.partyb_no_signature == '1' ? (
                                <span>无需签约</span>
                              ) : (
                                <span>{detail.partyb_stamp_key || '-'}</span>
                              )}
                            </ProForm.Item>
                          </Col>
                        ) : (
                          <>
                            <Col span={16}>
                              <ProFormText
                                name="partyb_stamp_key"
                                label="乙方签约关键字"
                                placeholder="请输入乙方签约关键字"
                                labelCol={{ span: 9 }}
                                wrapperCol={{ span: 14 }}
                                initialValue={'乙方(盖章)'}
                                disabled={!noSignature.b}
                                rules={[
                                  { required: noSignature.b, message: '请输入乙方签约关键字' },
                                ]}
                                extra={
                                  modalType === 'detail'
                                    ? undefined
                                    : '选择乙方无需签约，甲方签约成功即合同生效'
                                }
                              />
                            </Col>
                            <Col span={8}>
                              <ProFormCheckbox.Group
                                name="partyb_no_signature"
                                layout="vertical"
                                options={[
                                  {
                                    label: '无需签约',
                                    value: '1',
                                  },
                                ]}
                                fieldProps={{
                                  onChange: (value: any) => {
                                    const partyA =
                                      formRef.current?.getFieldValue('partya_no_signature');
                                    if (value && value.length) {
                                      if (partyA && partyA.length) {
                                        pubAlert('甲方和乙方至少需要一个签约关键字');
                                        formRef.current?.setFieldsValue({
                                          partyb_no_signature: null,
                                        });
                                      } else {
                                        formRef.current?.setFieldsValue({
                                          partyb_stamp_key: '',
                                        });
                                        setNoSignature({
                                          ...noSignature,
                                          b: false,
                                        });
                                      }
                                    } else {
                                      setNoSignature({
                                        ...noSignature,
                                        b: true,
                                      });
                                    }
                                  },
                                }}
                              />
                            </Col>
                          </>
                        )}
                      </Row>
                    </>
                  )}
                  {data.name_id && !['1', '11'].includes(data.name_id) ? (
                    modalType === 'detail' ? (
                      <ProForm.Item
                        label="合同金额"
                        name="amount"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 8 }}
                      >
                        <Statistic
                          value={detail.amount ?? '-'}
                          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
                          precision={2}
                        />
                      </ProForm.Item>
                    ) : (
                      <ProFormDigit
                        name="amount"
                        label="合同金额"
                        placeholder="请输入合同金额"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 8 }}
                        fieldProps={{ precision: 2 }}
                        min={0}
                        rules={[{ required: true, message: '请输入合同金额' }]}
                        extra="开模或打样等合同，涉及到金额请按实际金额填写，其他不涉及金额的请填0"
                      />
                    )
                  ) : (
                    <></>
                  )}
                </>
              );
            }}
          </ProFormDependency>

          <ProFormDependency name={['type']}>
            {(data: any) => {
              if (data.type == 1 || data.type == 3) {
                // 自定义线上 自定义线下
                return (
                  <>
                    {modalType === 'detail' ? (
                      <ProForm.Item
                        label="违约责任金额"
                        name="breach_liability_amount"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 8 }}
                      >
                        <Statistic
                          value={detail.breach_liability_amount ?? '-'}
                          valueStyle={{ fontWeight: 400, fontSize: '14px' }}
                          precision={2}
                        />
                      </ProForm.Item>
                    ) : (
                      <ProFormDigit
                        name="breach_liability_amount"
                        label="违约责任金额"
                        placeholder="请输入违约责任金额"
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 8 }}
                        fieldProps={{ precision: 2 }}
                        min={0}
                        rules={[{ required: true, message: '请输入违约责任金额' }]}
                      />
                    )}

                    <ProFormRadio.Group
                      name="associate_purchase_framework"
                      label="是否关联框架合同"
                      radioType="button"
                      placeholder="请选择是否关联框架合同"
                      rules={[{ required: true, message: '请选择是否关联框架合同' }]}
                      valueEnum={props?.dicList?.SC_YES_NO}
                      readonly={modalType === 'detail'}
                      extra={
                        modalType === 'detail'
                          ? undefined
                          : '选择关联框架合同，则框架合同续签或终止时会自动终止该合同'
                      }
                    />
                    <ProFormTextArea
                      readonly={modalType === 'detail'}
                      name="signature_description"
                      label="签约说明"
                      placeholder="请输入签约说明"
                      rules={[{ required: true, message: '请输入签约说明' }]}
                      formItemProps={{
                        style: { margin: '10px 0 4px' },
                      }}
                    />
                  </>
                );
              } else {
                return '';
              }
            }}
          </ProFormDependency>
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default Dialog;
